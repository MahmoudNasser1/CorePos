import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { createHash, randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../../common/db/drizzle'

type ListQuery = { q?: string; limit?: number; cursor?: string }
type Paginated<T> = { items: T[]; nextCursor: string | null; total?: number }

type PosLineInput = {
  productId: string
  quantity: number
  unitPrice: number
}

type CreatePosSaleInput = {
  companyId: string
  branchId: string // Added branchId
  warehouseId: string
  treasuryId?: string | null
  customerId?: string | null
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paymentMethod: 'cash' | 'card' | 'deferred'
  lines: PosLineInput[]
  idempotencyKey?: string
}

type CreateSaleInvoiceInput = {
  companyId: string
  branchId: string // Added branchId
  warehouseId: string
  customerId?: string | null
  cashierId: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  paid: number
  remaining: number
  items: Array<{
    productId: string
    qty: number
    unitPrice: number
    totalLine: number
  }>
  idempotencyKey?: string
}

type CreatePaymentInput = {
  companyId: string
  treasuryId: string
  amount: number
  method: 'cash' | 'card' | 'bank'
  notes?: string
  invoiceId?: string
  customerId?: string
  createdBy: string
  idempotencyKey?: string
}

@Injectable()
export class FinanceService {
  private hashRequest(value: unknown): string {
    return createHash('sha256').update(JSON.stringify(value)).digest('hex')
  }

  private async assertCustomerCreditLimit(
    tx: { execute: (query: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> },
    companyId: string,
    customerId: string,
    deltaAmount: number,
  ) {
    // credit_limit is stored as numeric; drizzle/pg returns it as string sometimes.
    const res = await tx.execute(sql`
      select balance, credit_limit
      from customers
      where company_id = ${companyId}
        and id = ${customerId}
        and is_active = true
      limit 1
    `)
    const row = res.rows[0] as any
    if (!row) {
      throw new BadRequestException({
        code: 'NOT_FOUND',
        message: 'العميل غير موجود',
      })
    }

    const balance = Number(row.balance ?? 0)
    const creditLimit = Number(row.credit_limit ?? 0)
    const projected = balance + deltaAmount

    if (projected - creditLimit > 0.00001) {
      throw new BadRequestException({
        code: 'CREDIT_LIMIT_EXCEEDED',
        message: 'لا يمكن إتمام البيع الآجل: تم تجاوز حد الائتمان للعميل',
        details: { balance, creditLimit, deltaAmount, projected },
      })
    }
  }

  private async getIdempotentResponse(
    tx: { execute: (query: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> },
    companyId: string,
    idempotencyKey: string,
    requestHash: string,
  ): Promise<unknown | null> {
    const existing = await tx.execute(sql`
      select request_hash, response_json
      from idempotency_keys
      where company_id = ${companyId}
        and key = ${idempotencyKey}
      limit 1
    `)
    const row = existing.rows[0] as any
    if (!row?.response_json) return null

    if (row.request_hash && row.request_hash !== requestHash) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة',
      })
    }

    try {
      return JSON.parse(String(row.response_json))
    } catch {
      return null
    }
  }

  private async storeIdempotentResponse(
    tx: { execute: (query: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> },
    companyId: string,
    idempotencyKey: string,
    requestHash: string,
    response: unknown,
  ) {
    await tx.execute(sql`
      insert into idempotency_keys (company_id, key, request_hash, response_json)
      values (${companyId}, ${idempotencyKey}, ${requestHash}, ${JSON.stringify(response)})
      on conflict (company_id, key) do nothing
    `)
  }

  async createPosSale(input: CreatePosSaleInput) {
    if (!db) {
      return {
        success: true,
        mode: 'drizzle-disabled-no-database-url',
        invoiceNumber: this.generateInvoiceNumber(),
        total: input.totalAmount,
      }
    }

    if (input.totalAmount < 0 || input.discountAmount < 0 || input.taxAmount < 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'قيم الإجمالي/الخصم/الضريبة يجب أن تكون أكبر من أو تساوي صفر',
      })
    }
    if (input.paymentMethod !== 'deferred' && !input.treasuryId) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'لا توجد خزينة محددة لإتمام الدفع',
      })
    }
    const computedTotal = input.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0) - input.discountAmount + input.taxAmount
    if (Math.abs(computedTotal - input.totalAmount) > 0.01) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'الإجمالي المرسل لا يطابق إجمالي البنود',
        details: { computedTotal, totalAmount: input.totalAmount },
      })
    }
    if (!input.branchId || input.branchId === '00000000-0000-0000-0000-000000000000') {
      const defaults = await this.getCompanyDefaults(input.companyId)
      if (defaults.branchId) {
        input.branchId = defaults.branchId
      } else {
        // Fallback to first branch in company
        const branchResult = await db.execute<{ id: string }>(sql`
          select id from branches where company_id = ${input.companyId} limit 1
        `)
        if (branchResult.rows[0]) {
          input.branchId = branchResult.rows[0].id
        }
      }
    }

    if (!input.warehouseId || input.warehouseId === '00000000-0000-0000-0000-000000000000') {
       const defaults = await this.getCompanyDefaults(input.companyId, input.branchId)
       if (!defaults.warehouseId) {
         throw new Error('لا يوجد مخزن متاح لإتمام العملية. يرجى إضافة مخزن في الإعدادات.')
       }
       input.warehouseId = defaults.warehouseId
    }

    if (!input.branchId || input.branchId === '00000000-0000-0000-0000-000000000000') {
      throw new Error('لم يتم العثور على فرع صالح لإتمام العملية')
    }


    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      // Credit limit invariant for deferred sales
      if (input.paymentMethod === 'deferred' && input.customerId) {
        await this.assertCustomerCreditLimit(tx, input.companyId, input.customerId, input.totalAmount)
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'sale')
      const newInvoiceId = randomUUID()

      const invoiceResult = await tx.execute<{ invoice_id: string }>(sql`
        insert into invoices (
          id,
          company_id,
          branch_id,
          warehouse_id,
          customer_id,
          type,
          subtotal,
          discount_amount,
          tax_amount,
          total,
          paid,
          remaining,
          status,
          invoice_number
        ) values (
          ${newInvoiceId},
          ${input.companyId},
          ${input.branchId},
          ${input.warehouseId},
          ${input.customerId ?? null},
          'sale',
          ${input.totalAmount - input.taxAmount + input.discountAmount},
          ${input.discountAmount},
          ${input.taxAmount},
          ${input.totalAmount},
          ${input.paymentMethod === 'deferred' ? 0 : input.totalAmount},
          ${input.paymentMethod === 'deferred' ? input.totalAmount : 0},
          ${input.paymentMethod === 'deferred' ? 'partial' : 'paid'},
          ${invoiceNumber}
        )
        returning id as invoice_id
      `)
      const invoiceId = invoiceResult.rows[0]?.invoice_id
      if (!invoiceId) {
        throw new Error('Failed to create invoice row inside transaction')
      }

      for (const line of input.lines) {
        const stockResult = await tx.execute<{ qty: string | null }>(sql`
          select qty
          from product_stock
          where product_id = ${line.productId}
            and warehouse_id = ${input.warehouseId}
          limit 1
        `)
        const availableQty = Number(stockResult.rows[0]?.qty ?? 0)
        if (availableQty < line.quantity) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_STOCK',
            message: 'الكمية المطلوبة أكبر من المخزون المتاح',
            details: {
              productId: line.productId,
              warehouseId: input.warehouseId,
              requestedQty: line.quantity,
              availableQty,
            },
          })
        }

        const productCostResult = await tx.execute<{ current_cost: number | null }>(sql`
          select avg_cost as current_cost
          from products
          where id = ${line.productId}
          limit 1
        `)

        const lineCost = Number(productCostResult.rows[0]?.current_cost ?? 0)

        await tx.execute(sql`
          insert into invoice_items (
            id,
            invoice_id,
            product_id,
            qty,
            unit_price,
            cost_price,
            total_line,
            profit
          ) values (
            ${randomUUID()},
            ${invoiceId},
            ${line.productId},
            ${line.quantity},
            ${line.unitPrice},
            ${lineCost},
            ${line.quantity * line.unitPrice},
            ${(line.unitPrice - lineCost) * line.quantity}
          )
        `)

        await tx.execute(sql`
          update product_stock
          set qty = qty - ${line.quantity}
          where product_id = ${line.productId}
            and warehouse_id = ${input.warehouseId}
        `)
      }

      if (input.paymentMethod === 'deferred' && input.customerId) {
        await tx.execute(sql`
          update customers
          set balance = balance + ${input.totalAmount}
          where company_id = ${input.companyId}
            and id = ${input.customerId}
        `)
      }

      if (input.paymentMethod !== 'deferred' && input.treasuryId) {
        await tx.execute(sql`
          insert into treasury_transactions (
            id,
            treasury_id,
            company_id,
            tx_type,
            amount,
            payment_method,
            reference_id,
            reference_type,
            notes
          ) values (
            ${randomUUID()},
            ${input.treasuryId},
            ${input.companyId},
            'in',
            ${input.totalAmount},
            ${input.paymentMethod},
            ${invoiceId},
            'invoice',
            'POS Payment'
          )
        `)

        await tx.execute(sql`
          update treasuries
          set balance = balance + ${input.totalAmount}
          where id = ${input.treasuryId}
        `)
      }

      const result = {
        success: true,
        mode: 'drizzle-transaction',
        invoiceId,
        invoiceNumber,
      }

      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }

      return result
    })
  }

  async createSaleInvoice(input: CreateSaleInvoiceInput) {
    if (!db) {
      return {
        success: true,
        mode: 'drizzle-disabled-no-database-url',
        id: crypto.randomUUID(),
        invoiceNumber: this.generateInvoiceNumber(),
      }
    }

    if (
      input.total < 0 ||
      input.subtotal < 0 ||
      input.discountAmount < 0 ||
      input.taxAmount < 0 ||
      input.paid < 0 ||
      input.remaining < 0
    ) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'قيم الفاتورة يجب أن تكون أكبر من أو تساوي صفر',
      })
    }

    if (input.paid - input.total > 0.00001) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'المدفوع لا يمكن أن يكون أكبر من إجمالي الفاتورة',
        details: { paid: input.paid, total: input.total },
      })
    }
    if (input.remaining - input.total > 0.00001) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'المتبقي لا يمكن أن يكون أكبر من إجمالي الفاتورة',
        details: { remaining: input.remaining, total: input.total },
      })
    }
    if (Math.abs(input.paid + input.remaining - input.total) > 0.01) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'المدفوع + المتبقي يجب أن يساوي إجمالي الفاتورة',
        details: { paid: input.paid, remaining: input.remaining, total: input.total },
      })
    }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      // If invoice leaves an outstanding amount, enforce credit limit
      if (input.customerId && input.remaining > 0) {
        await this.assertCustomerCreditLimit(tx, input.companyId, input.customerId, input.remaining)
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'sale')
      const newInvoiceId = randomUUID()

      const invoiceResult = await tx.execute<{ invoice_id: string }>(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, customer_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newInvoiceId}, ${input.companyId}, ${input.branchId}, 'sale', ${input.warehouseId},
          ${input.customerId ?? null}, ${input.cashierId}, ${input.remaining > 0 ? 'partial' : 'paid'},
          ${input.subtotal}, ${input.discountAmount}, ${input.taxAmount},
          ${input.total}, ${input.paid}, ${input.remaining}, ${invoiceNumber}
        )
        returning id as invoice_id
      `)
      const invoiceId = invoiceResult.rows[0]?.invoice_id
      if (!invoiceId) throw new Error('Failed to create sale invoice')

      for (const item of input.items) {
        await tx.execute(sql`
          insert into invoice_items (
            id, invoice_id, product_id, qty, unit_price, total_line
          ) values (
            ${randomUUID()}, ${invoiceId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.totalLine}
          )
        `)
      }

      if (input.customerId && input.remaining > 0) {
        await tx.execute(sql`
          update customers
          set balance = balance + ${input.remaining}
          where company_id = ${input.companyId}
            and id = ${input.customerId}
        `)
      }

      const result = { success: true, mode: 'drizzle-transaction', id: invoiceId, invoiceNumber }
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }
      return result
    })
  }

  async addPaymentReceipt(input: CreatePaymentInput) {
    if (!db) {
      return { success: true, mode: 'drizzle-disabled-no-database-url', id: crypto.randomUUID() }
    }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      let resolvedCustomerId: string | null = input.customerId ?? null
      let invoiceRemaining: number | null = null
      if (input.invoiceId) {
        const inv = await tx.execute(sql`
          select customer_id, remaining
          from invoices
          where company_id = ${input.companyId}
            and id = ${input.invoiceId}
          limit 1
        `)
        const row = inv.rows[0] as any
        if (!row) {
          throw new BadRequestException({
            code: 'NOT_FOUND',
            message: 'الفاتورة غير موجودة',
          })
        }
        resolvedCustomerId = row.customer_id ?? null
        invoiceRemaining = Number(row.remaining ?? 0)

        if (input.amount - invoiceRemaining > 0.00001) {
          throw new BadRequestException({
            code: 'PAYMENT_EXCEEDS_REMAINING',
            message: 'قيمة السداد أكبر من المبلغ المتبقي على الفاتورة',
            details: { amount: input.amount, remaining: invoiceRemaining },
          })
        }
      }

      const paymentResult = await tx.execute<{ payment_id: string }>(sql`
        insert into treasury_transactions (
          id, treasury_id, company_id, tx_type, amount, payment_method, reference_id, reference_type, notes, created_by
        ) values (
          ${randomUUID()}, ${input.treasuryId}, ${input.companyId}, 'in',
          ${input.amount}, ${input.method},
          ${input.invoiceId ?? null}, ${input.invoiceId ? 'invoice' : null},
          ${input.notes ?? null}, ${input.createdBy}
        )
        returning id as payment_id
      `)

      await tx.execute(sql`
        update treasuries
        set balance = balance + ${input.amount}
        where id = ${input.treasuryId}
      `)

      if (input.invoiceId) {
        await tx.execute(sql`
          update invoices
          set
            paid = paid + ${input.amount},
            remaining = greatest(remaining - ${input.amount}, 0),
            status = case
              when greatest(remaining - ${input.amount}, 0) <= 0.00001 then 'paid'
              else 'partial'
            end
          where company_id = ${input.companyId}
            and id = ${input.invoiceId}
        `)
      }

      if (resolvedCustomerId) {
        await tx.execute(sql`
          update customers
          set balance = greatest(balance - ${input.amount}, 0)
          where company_id = ${input.companyId}
            and id = ${resolvedCustomerId}
        `)
      }

      const result = {
        success: true,
        mode: 'drizzle-transaction',
        id: paymentResult.rows[0]?.payment_id ?? crypto.randomUUID(),
      }

      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }

      return result
    })
  }

  async getCompanyDefaults(companyId: string, branchId?: string) {
    if (!db) return { warehouseId: null, treasuryId: null, branchId: null }

    let resolvedBranchId = branchId

    const warehouseQuery = branchId
      ? sql`select id, branch_id from warehouses where branch_id = ${branchId} and is_active = true order by is_default desc, created_at asc limit 1`
      : sql`select w.id, w.branch_id from warehouses w join branches b on w.branch_id = b.id where b.company_id = ${companyId} and w.is_active = true order by w.is_default desc, w.created_at asc limit 1`

    const warehouseResult = await db.execute<{ id: string; branch_id: string }>(warehouseQuery)
    const warehouseId = warehouseResult.rows[0]?.id ?? null
    
    if (!resolvedBranchId) {
      resolvedBranchId = warehouseResult.rows[0]?.branch_id ?? null
    }

    const treasuryResult = await db.execute<{ id: string }>(sql`
      select id from treasuries 
      where company_id = ${companyId} 
      ${resolvedBranchId ? sql`and branch_id = ${resolvedBranchId}` : sql``}
      and is_active = true 
      order by is_default desc, created_at asc
      limit 1
    `)

    return {
      warehouseId,
      treasuryId: treasuryResult.rows[0]?.id ?? null,
      branchId: resolvedBranchId
    }
  }

  async listSaleInvoices(companyId: string, query: ListQuery = {}): Promise<Paginated<any>> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100)
    if (!db) return { items: [], nextCursor: null }

    // MVP cursor: accepted but ignored.
    const rows = await db.execute(sql`
      select id, invoice_number, total, status, created_at
      from invoices
      where company_id = ${companyId} and type = 'sale'
      order by created_at desc
      limit ${limit}
    `)

    const items = (rows.rows as any[]).map((r) => ({
      id: r.id,
      invoiceNumber: r.invoice_number,
      total: Number(r.total ?? 0),
      status: r.status,
      createdAt: r.created_at,
    }))

    const q = (query.q ?? '').trim().toLowerCase()
    const filtered =
      q.length === 0 ? items : items.filter((x) => String(x.invoiceNumber ?? '').toLowerCase().includes(q))

    return { items: filtered.slice(0, limit), nextCursor: null }
  }

  async getSaleInvoice(companyId: string, id: string) {
    if (!db) return null
    const res = await db.execute(sql`
      select *
      from invoices
      where company_id = ${companyId} and id = ${id} and type = 'sale'
      limit 1
    `)
    return (res.rows[0] as any) ?? null
  }

  async getTreasury(companyId: string) {
    if (!db) return []
    const res = await db.execute(sql`
      select id, name, balance, branch_id
      from treasuries
      where company_id = ${companyId} and is_active = true
      order by is_default desc, created_at asc
    `)
    return res.rows
  }

  async getTreasuryTransactions(companyId: string, query: { limit?: number } = {}) {
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100)
    if (!db) return { items: [], nextCursor: null }
    const res = await db.execute(sql`
      select *
      from treasury_transactions
      where company_id = ${companyId}
      order by created_at desc
      limit ${limit}
    `)
    return { items: res.rows, nextCursor: null }
  }


  private generateInvoiceNumber() {
    const now = new Date()
    const year = String(now.getFullYear()).slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    return `${year}${month}-${seq}`
  }

  private async nextInvoiceNumber(
    tx: { execute: (query: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> },
    companyId: string,
    type: string,
  ): Promise<string> {
    const sequenceResult = await tx.execute(sql`
      insert into invoice_sequences (company_id, invoice_type, year_month, last_number)
      values (${companyId}, ${type}, to_char(now(), 'YYMM'), 1)
      on conflict (company_id, invoice_type, year_month)
      do update set last_number = invoice_sequences.last_number + 1
      returning year_month, last_number
    `)

    const row = sequenceResult.rows[0] as { year_month?: string; last_number?: number } | undefined
    if (!row) return this.generateInvoiceNumber()
    if (!row.year_month || typeof row.last_number !== 'number') return this.generateInvoiceNumber()

    return `${row.year_month}-${String(row.last_number).padStart(3, '0')}`
  }
}
