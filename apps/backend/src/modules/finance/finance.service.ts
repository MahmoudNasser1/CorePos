import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { createHash, randomUUID } from 'node:crypto'
import { sql, eq, and } from 'drizzle-orm'
import { db } from '../../common/db/drizzle'
import { branches, treasuries } from '../../common/db/schema'
import { getTenantContext } from '../../common/tenant/tenant-context'

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
  treasuryId?: string | null
  idempotencyKey?: string
}

type CreatePurchaseInvoiceInput = {
  companyId: string
  branchId?: string
  warehouseId?: string
  supplierId?: string | null
  cashierId?: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  paid: number
  remaining: number
  treasuryId?: string | null
  items: Array<{
    productId: string
    qty: number
    unitPrice: number
    totalLine: number
  }>
  idempotencyKey?: string
}

type CreateQuotationInput = {
  companyId: string
  branchId: string
  warehouseId: string
  customerId?: string | null
  cashierId: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
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
  treasuryId?: string
  amount: number
  method: 'cash' | 'card' | 'bank'
  notes?: string
  invoiceId?: string
  customerId?: string
  supplierId?: string
  createdBy: string
  idempotencyKey?: string
}

type CreateExpenseInput = {
  companyId: string
  treasuryId: string
  branchId?: string
  categoryId?: string
  amount: number
  notes?: string
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

    if (input.paymentMethod !== 'deferred' && (!input.treasuryId || input.treasuryId === '00000000-0000-0000-0000-000000000000')) {
      const defaults = await this.getCompanyDefaults(input.companyId, input.branchId)
      if (defaults.treasuryId) {
        input.treasuryId = defaults.treasuryId
      }
    }
    if (input.paymentMethod !== 'deferred' && !input.treasuryId) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'لا توجد خزينة محددة لإتمام الدفع',
      })
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

    const ZERO = '00000000-0000-0000-0000-000000000000'
    let branchId = input.branchId
    let warehouseId = input.warehouseId
    let cashierId = input.cashierId
    let treasuryId = input.treasuryId

    // Resolve Defaults
    if (!branchId || branchId === ZERO) {
      const defaults = await this.getCompanyDefaults(input.companyId)
      branchId = defaults.branchId ?? ZERO
      if (branchId === ZERO) {
        const br = await db.execute<{ id: string }>(sql`select id from branches where company_id = ${input.companyId} limit 1`)
        branchId = br.rows[0]?.id ?? ZERO
      }
    }

    if (!warehouseId || warehouseId === ZERO) {
      const defaults = await this.getCompanyDefaults(input.companyId, branchId)
      warehouseId = defaults.warehouseId ?? ZERO
    }

    if (!cashierId || cashierId === ZERO) {
      const { userId } = getTenantContext()
      cashierId = userId ?? ZERO
      if (cashierId === ZERO) {
        const p = await db.execute<{ id: string }>(sql`select id from profiles where company_id = ${input.companyId} limit 1`)
        cashierId = p.rows[0]?.id ?? ZERO
      }
    }

    if (input.paid > 0 && (!treasuryId || treasuryId === ZERO)) {
      const defaults = await this.getCompanyDefaults(input.companyId, branchId)
      treasuryId = defaults.treasuryId ?? null
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
          ${newInvoiceId}, ${input.companyId}, ${branchId}, 'sale', ${warehouseId},
          ${input.customerId ?? null}, ${cashierId}, ${input.remaining > 0 ? 'partial' : 'paid'},
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

        // 🟢 CHECK: Insufficient Stock
        const stockRes = await tx.execute(sql`
          select qty from product_stock
          where product_id = ${item.productId} and warehouse_id = ${warehouseId}
          limit 1
        `)
        const currentQty = Number(stockRes.rows[0]?.qty ?? 0)
        if (currentQty < item.qty) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_STOCK',
            message: `رصيد المخزن غير كافٍ للصنف ${item.productId}. الرصيد الحالي: ${currentQty}`,
          })
        }

        // 🟢 FIX: Decrement stock
        await tx.execute(sql`
          update product_stock
          set qty = qty - ${item.qty}
          where product_id = ${item.productId} and warehouse_id = ${warehouseId}
        `)
      }

      // 🟢 FIX: Treasury Transaction for payment
      if (input.paid > 0 && treasuryId && treasuryId !== ZERO) {
        const txId = randomUUID()
        await tx.execute(sql`
          insert into treasury_transactions (id, company_id, treasury_id, amount, tx_type, notes, reference_id, reference_type, payment_method, created_by)
          values (${txId}, ${input.companyId}, ${treasuryId}, ${input.paid}, 'in', ${`دفعة فاتورة مبيعات ${invoiceNumber}`}, ${invoiceId}, 'invoice', 'cash', ${cashierId})
        `)

        await tx.execute(sql`
          update treasuries
          set balance = balance + ${input.paid}
          where company_id = ${input.companyId} and id = ${treasuryId}
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

  async createPurchaseInvoice(input: CreatePurchaseInvoiceInput) {
    if (!db) {
      return {
        success: true,
        mode: 'drizzle-disabled-no-database-url',
        id: crypto.randomUUID(),
        invoiceNumber: this.generateInvoiceNumber(),
      }
    }

    const ZERO = '00000000-0000-0000-0000-000000000000'
    let branchId = input.branchId
    let warehouseId = input.warehouseId
    let cashierId = input.cashierId

    if (!branchId || branchId === ZERO) {
      const defaults = await this.getCompanyDefaults(input.companyId)
      if (defaults.branchId) branchId = defaults.branchId
      else {
        const branchResult = await db.execute<{ id: string }>(sql`
          select id from branches where company_id = ${input.companyId} limit 1
        `)
        if (branchResult.rows[0]) branchId = branchResult.rows[0].id
      }
    }

    if (!warehouseId || warehouseId === ZERO) {
      const defaults = await this.getCompanyDefaults(input.companyId, branchId ?? undefined)
      if (!defaults.warehouseId) {
        throw new BadRequestException({
          code: 'INVARIANT_VIOLATION',
          message: 'لا يوجد مخزن متاح لإتمام فاتورة المشتريات. أضف مخزناً من الإعدادات.',
        })
      }
      warehouseId = defaults.warehouseId
    }

    if (!cashierId || cashierId === ZERO) {
      const { userId } = getTenantContext()
      if (userId) {
        cashierId = userId
      } else {
        const p = await db.execute<{ id: string }>(sql`
          select id from profiles where company_id = ${input.companyId} limit 1
        `)
        if (p.rows[0]) cashierId = p.rows[0].id
      }
    }

    if (!branchId || branchId === ZERO) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'لم يتم العثور على فرع صالح لإتمام فاتورة المشتريات',
      })
    }
    if (!warehouseId || warehouseId === ZERO) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'لا يوجد مخزن صالح لإتمام فاتورة المشتريات',
      })
    }
    if (!cashierId || cashierId === ZERO) {
      throw new BadRequestException({
        code: 'INVARIANT_VIOLATION',
        message: 'لم يتم تحديد المستخدم/الكاشير لتسجيل فاتورة المشتريات',
      })
    }

    const inv = {
      ...input,
      branchId,
      warehouseId,
      cashierId,
    }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'purchase')
      const newInvoiceId = randomUUID()

      const invoiceResult = await tx.execute<{ invoice_id: string }>(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, supplier_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newInvoiceId}, ${input.companyId}, ${inv.branchId}, 'purchase', ${inv.warehouseId},
          ${input.supplierId ?? null}, ${inv.cashierId}, ${input.remaining > 0 ? 'partial' : 'paid'},
          ${input.subtotal}, ${input.discountAmount}, ${input.taxAmount},
          ${input.total}, ${input.paid}, ${input.remaining}, ${invoiceNumber}
        )
        returning id as invoice_id
      `)
      const invoiceId = invoiceResult.rows[0]?.invoice_id
      if (!invoiceId) throw new Error('Failed to create purchase invoice')

      for (const item of input.items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${invoiceId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.totalLine})
        `)

        // Increase stock in warehouse and update avg_cost (simple set to latest unit price)
        await tx.execute(sql`
          insert into product_stock (id, product_id, warehouse_id, qty, avg_cost)
          values (${randomUUID()}, ${item.productId}, ${inv.warehouseId}, ${item.qty}, ${item.unitPrice})
          on conflict (product_id, warehouse_id)
          do update set
            qty = product_stock.qty + excluded.qty,
            avg_cost = excluded.avg_cost
        `)

        await tx.execute(sql`
          update products
          set avg_cost = ${item.unitPrice}
          where id = ${item.productId}
        `)
      }

      // Supplier balance increases by remaining
      if (input.supplierId && input.remaining > 0) {
        await tx.execute(sql`
          update suppliers
          set balance = balance + ${input.remaining}
          where company_id = ${input.companyId}
            and id = ${input.supplierId}
        `)
      }

      // If paid from treasury -> out transaction
      if (input.paid > 0 && input.treasuryId && input.treasuryId !== ZERO) {
        // 🟢 CHECK: Treasury balance
        const treasuryRes = await tx.execute(sql`
          select balance from treasuries where id = ${input.treasuryId} and company_id = ${input.companyId} limit 1
        `)
        const currentBalance = Number(treasuryRes.rows[0]?.balance ?? 0)
        if (currentBalance < input.paid) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_FUNDS',
            message: `رصيد الخزينة غير كافٍ. الرصيد الحالي: ${currentBalance}`,
          })
        }

        await tx.execute(sql`
          insert into treasury_transactions (
            id, company_id, treasury_id, amount, tx_type, notes, reference_id, reference_type, payment_method, created_by
          ) values (
            ${randomUUID()}, ${input.companyId}, ${input.treasuryId}, ${input.paid}, 'out',
            ${`سداد فاتورة مشتريات ${invoiceNumber}`}, ${invoiceId}, 'invoice', 'cash', ${inv.cashierId}
          )
        `)
        await tx.execute(sql`
          update treasuries
          set balance = balance - ${input.paid}
          where company_id = ${input.companyId} and id = ${input.treasuryId}
        `)
      }

      const result = { success: true, mode: 'drizzle-transaction', id: invoiceId, invoiceNumber }
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }
      return result
    })
  }

  async listPurchaseInvoices(companyId: string, query: ListQuery = {}): Promise<Paginated<any>> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100)
    if (!db) return { items: [], nextCursor: null }

    const rows = await db.execute(sql`
      select
        i.id,
        i.invoice_number,
        i.total,
        i.paid,
        i.remaining,
        i.status,
        i.created_at,
        i.date,
        s.name as supplier_name
      from invoices i
      left join suppliers s on s.id = i.supplier_id and s.company_id = i.company_id
      where i.company_id = ${companyId} and i.type = 'purchase'
      order by i.created_at desc
      limit ${limit}
    `)

    const items = (rows.rows as any[]).map((r) => {
      const dateVal = r.date ?? r.created_at
      const dateStr =
        dateVal instanceof Date
          ? dateVal.toISOString().slice(0, 10)
          : typeof dateVal === "string"
            ? dateVal.slice(0, 10)
            : ""
      return {
        id: r.id,
        invoice_number: r.invoice_number,
        invoiceNumber: r.invoice_number,
        date: dateStr,
        total: Number(r.total ?? 0),
        paid: Number(r.paid ?? 0),
        remaining: Number(r.remaining ?? 0),
        status: r.status,
        createdAt: r.created_at,
        suppliers: {
          name: r.supplier_name ?? "مورد عام"
        }
      }
    })

    const q = (query.q ?? '').trim().toLowerCase()
    const filtered = q.length === 0 ? items : items.filter((x) => String(x.invoiceNumber ?? '').toLowerCase().includes(q))
    return { items: filtered.slice(0, limit), nextCursor: null }
  }

  async getPurchaseInvoice(companyId: string, id: string) {
    if (!db) return null
    // 🟢 FIX: Detailed join for print/view
    const res = await db.execute(sql`
      select i.*, 
             s.name as supplier_name, s.phone as supplier_phone, s.address as supplier_address, 
             p.full_name as cashier_name,
             b.name as branch_name,
             w.name as warehouse_name
      from invoices i
      left join suppliers s on i.supplier_id = s.id
      left join profiles p on i.cashier_id = p.id
      left join branches b on i.branch_id = b.id
      left join warehouses w on i.warehouse_id = w.id
      where i.company_id = ${companyId} and i.id = ${id} and i.type = 'purchase'
      limit 1
    `)
    const invoice = (res.rows[0] as any) ?? null
    if (!invoice) return null

    const itemsRes = await db.execute(sql`
      select ii.*, pr.name as product_name
      from invoice_items ii
      join products pr on ii.product_id = pr.id
      where ii.invoice_id = ${id}
    `)

    return {
      ...invoice,
      suppliers: invoice.supplier_id ? { 
        name: invoice.supplier_name, 
        phone: invoice.supplier_phone, 
        address: invoice.supplier_address 
      } : null,
      invoice_items: itemsRes.rows.map((row: any) => ({
        ...row,
        products: { name: row.product_name }
      })),
      profiles: invoice.cashier_id ? { full_name: invoice.cashier_name } : null,
      branches: invoice.branch_id ? { name: invoice.branch_name } : null,
      warehouses: invoice.warehouse_id ? { name: invoice.warehouse_name } : null
    }
  }

  async createQuotation(input: CreateQuotationInput) {
    if (!db) {
      return {
        success: true,
        mode: 'drizzle-disabled-no-database-url',
        id: crypto.randomUUID(),
        invoiceNumber: this.generateInvoiceNumber(),
      }
    }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'quotation')
      const newInvoiceId = randomUUID()

      const invoiceResult = await tx.execute<{ invoice_id: string }>(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, customer_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newInvoiceId}, ${input.companyId}, ${input.branchId}, 'quotation', ${input.warehouseId},
          ${input.customerId ?? null}, ${input.cashierId}, 'confirmed',
          ${input.subtotal}, ${input.discountAmount}, ${input.taxAmount},
          ${input.total}, 0, ${input.total}, ${invoiceNumber}
        )
        returning id as invoice_id
      `)
      const invoiceId = invoiceResult.rows[0]?.invoice_id
      if (!invoiceId) throw new Error('Failed to create quotation')

      for (const item of input.items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${invoiceId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.totalLine})
        `)
      }

      const result = { success: true, mode: 'drizzle-transaction', id: invoiceId, invoiceNumber }
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }
      return result
    })
  }

  async convertQuotationToSaleInvoice(companyId: string, quotationId: string) {
    if (!db) return { success: true, id: crypto.randomUUID(), invoiceNumber: this.generateInvoiceNumber() }
    return db.transaction(async (tx) => {
      const invRes = await tx.execute(sql`
        select * from invoices where company_id = ${companyId} and id = ${quotationId} and type = 'quotation' limit 1
      `)
      const inv = invRes.rows[0] as any
      if (!inv) throw new BadRequestException({ code: 'NOT_FOUND', message: 'عرض السعر غير موجود' })

      const itemsRes = await tx.execute(sql`
        select product_id, qty, unit_price, total_line
        from invoice_items
        where invoice_id = ${quotationId}
      `)
      const items = itemsRes.rows as any[]

      const invoiceNumber = await this.nextInvoiceNumber(tx, companyId, 'sale')
      const newInvoiceId = randomUUID()

      await tx.execute(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, customer_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newInvoiceId}, ${companyId}, ${inv.branch_id}, 'sale', ${inv.warehouse_id},
          ${inv.customer_id ?? null}, ${inv.cashier_id ?? null}, 'partial',
          ${inv.subtotal}, ${inv.discount_amount}, ${inv.tax_amount},
          ${inv.total}, 0, ${inv.total}, ${invoiceNumber}
        )
      `)

      for (const item of items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${newInvoiceId}, ${item.product_id}, ${item.qty}, ${item.unit_price}, ${item.total_line})
        `)
      }

      await tx.execute(sql`
        update invoices set status = 'converted'
        where id = ${quotationId} and company_id = ${companyId}
      `)

      return { success: true, id: newInvoiceId, invoiceNumber }
    })
  }

  async cancelInvoice(companyId: string, invoiceId: string) {
    if (!db) return { success: true }
    await db.execute(sql`
      update invoices
      set status = 'void'
      where company_id = ${companyId} and id = ${invoiceId}
    `)
    return { success: true }
  }

  async listExpenseCategories(companyId: string) {
    if (!db) return []
    const res = await db.execute(sql`
      select id, name, created_at
      from expense_categories
      where company_id = ${companyId}
      order by name asc
    `)
    return res.rows
  }

  async createExpenseCategory(companyId: string, name: string) {
    if (!db) throw new BadRequestException('Database not connected')
    const res = await db.execute(sql`
      insert into expense_categories (id, company_id, name)
      values (${randomUUID()}, ${companyId}, ${name})
      returning id, name, created_at
    `)
    return res.rows[0] ?? null
  }

  async listExpenses(companyId: string, query: { limit?: number } = {}) {
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 200)
    if (!db) return []
    const res = await db.execute(sql`
      select e.*, c.name as category_name, b.name as branch_name, t.name as treasury_name
      from expenses e
      left join expense_categories c on c.id = e.category_id
      left join branches b on b.id = e.branch_id
      left join treasuries t on t.id = e.treasury_id
      where e.company_id = ${companyId}
      order by e.created_at desc
      limit ${limit}
    `)
    return res.rows
  }

  async createExpense(input: CreateExpenseInput) {
    if (!db) return { success: true, id: crypto.randomUUID() }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      // Ensure treasury exists and has enough balance
      const treasuryRes = await tx.execute(sql`
        select balance
        from treasuries
        where id = ${input.treasuryId}
          and company_id = ${input.companyId}
          and is_active = true
        limit 1
      `)
      const treasury = treasuryRes.rows[0] as any
      if (!treasury) {
        throw new BadRequestException({ code: 'NOT_FOUND', message: 'الخزينة غير موجودة' })
      }
      const bal = Number(treasury.balance ?? 0)
      if (bal - input.amount < -0.00001) {
        throw new BadRequestException({ code: 'INSUFFICIENT_FUNDS', message: 'رصيد الخزينة غير كافٍ' })
      }

      const expenseId = randomUUID()

      await tx.execute(sql`
        insert into expenses (
          id, company_id, branch_id, category_id, treasury_id, amount, notes, created_by
        ) values (
          ${expenseId}, ${input.companyId}, ${input.branchId ?? null}, ${input.categoryId ?? null},
          ${input.treasuryId}, ${input.amount}, ${input.notes ?? null}, ${input.createdBy}
        )
      `)

      await tx.execute(sql`
        insert into treasury_transactions (
          id, treasury_id, company_id, tx_type, amount, payment_method, reference_id, reference_type, notes, created_by
        ) values (
          ${randomUUID()}, ${input.treasuryId}, ${input.companyId}, 'out',
          ${input.amount}, 'cash', ${expenseId}, 'expense', ${input.notes ?? 'Expense'}, ${input.createdBy}
        )
      `)

      await tx.execute(sql`
        update treasuries
        set balance = balance - ${input.amount}
        where id = ${input.treasuryId}
      `)

      const result = { success: true, id: expenseId }
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }
      return result
    })
  }

  async createPurchaseOrder(input: {
    companyId: string
    branchId: string
    warehouseId: string
    supplierId?: string | null
    cashierId: string
    total: number
    items: Array<{ productId: string; qty: number; unitPrice: number; totalLine: number }>
    idempotencyKey?: string
  }) {
    if (!db) return { success: true, id: crypto.randomUUID(), invoiceNumber: this.generateInvoiceNumber() }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'purchase_order')
      const newId = randomUUID()

      await tx.execute(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, supplier_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newId}, ${input.companyId}, ${input.branchId}, 'purchase_order', ${input.warehouseId},
          ${input.supplierId ?? null}, ${input.cashierId}, 'confirmed',
          ${input.total}, 0, 0, ${input.total}, 0, ${input.total}, ${invoiceNumber}
        )
      `)

      for (const item of input.items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${newId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.totalLine})
        `)
      }

      const result = { success: true, id: newId, invoiceNumber }
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }
      return result
    })
  }

  async convertPurchaseOrderToInvoice(companyId: string, poId: string, treasuryId: string | null) {
    if (!db) return { success: true, id: crypto.randomUUID(), invoiceNumber: this.generateInvoiceNumber() }

    return db.transaction(async (tx) => {
      const invRes = await tx.execute(sql`
        select * from invoices where company_id = ${companyId} and id = ${poId} and type = 'purchase_order' limit 1
      `)
      const po = invRes.rows[0] as any
      if (!po) throw new BadRequestException({ code: 'NOT_FOUND', message: 'أمر الشراء غير موجود' })

      const itemsRes = await tx.execute(sql`
        select product_id, qty, unit_price, total_line
        from invoice_items
        where invoice_id = ${poId}
      `)
      const items = itemsRes.rows as any[]

      const invoiceNumber = await this.nextInvoiceNumber(tx, companyId, 'purchase')
      const newId = randomUUID()

      await tx.execute(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, supplier_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newId}, ${companyId}, ${po.branch_id}, 'purchase', ${po.warehouse_id},
          ${po.supplier_id ?? null}, ${po.cashier_id ?? null}, 'partial',
          ${po.total}, 0, 0, ${po.total}, 0, ${po.total}, ${invoiceNumber}
        )
      `)

      for (const item of items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${newId}, ${item.product_id}, ${item.qty}, ${item.unit_price}, ${item.total_line})
        `)

        await tx.execute(sql`
          insert into product_stock (id, product_id, warehouse_id, qty, avg_cost)
          values (${randomUUID()}, ${item.product_id}, ${po.warehouse_id}, ${item.qty}, ${item.unit_price})
          on conflict (product_id, warehouse_id)
          do update set
            qty = product_stock.qty + excluded.qty,
            avg_cost = excluded.avg_cost
        `)
        await tx.execute(sql`
          update products
          set avg_cost = ${item.unit_price}
          where id = ${item.product_id}
        `)
      }

      await tx.execute(sql`
        update invoices set status = 'converted'
        where id = ${poId} and company_id = ${companyId}
      `)

      // Optional immediate payment
      if (treasuryId) {
        await tx.execute(sql`
          insert into treasury_transactions (
            id, treasury_id, company_id, tx_type, amount, payment_method, reference_id, reference_type, notes, created_by
          ) values (
            ${randomUUID()}, ${treasuryId}, ${companyId}, 'out',
            ${Number(po.total || 0)}, 'cash', ${newId}, 'invoice', 'PO converted payment', ${po.cashier_id ?? null}
          )
        `)
        await tx.execute(sql`
          update treasuries set balance = balance - ${Number(po.total || 0)}
          where id = ${treasuryId}
        `)
        await tx.execute(sql`
          update invoices set paid = ${Number(po.total || 0)}, remaining = 0, status = 'paid'
          where id = ${newId} and company_id = ${companyId}
        `)
      }

      return { success: true, id: newId, invoiceNumber }
    })
  }

  async createSaleReturn(input: {
    companyId: string
    branchId: string
    warehouseId: string
    customerId?: string | null
    cashierId: string
    treasuryId?: string | null
    total: number
    items: Array<{ productId: string; qty: number; unitPrice: number; totalLine: number }>
    idempotencyKey?: string
  }) {
    if (!db) return { success: true, id: crypto.randomUUID(), invoiceNumber: this.generateInvoiceNumber() }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'sale_return')
      const newId = randomUUID()

      await tx.execute(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, customer_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newId}, ${input.companyId}, ${input.branchId}, 'sale_return', ${input.warehouseId},
          ${input.customerId ?? null}, ${input.cashierId}, 'paid',
          ${input.total}, 0, 0, ${input.total}, ${input.total}, 0, ${invoiceNumber}
        )
      `)

      for (const item of input.items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${newId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.totalLine})
        `)

        // Return increases stock
        await tx.execute(sql`
          insert into product_stock (id, product_id, warehouse_id, qty, avg_cost)
          values (${randomUUID()}, ${item.productId}, ${input.warehouseId}, ${item.qty}, ${item.unitPrice})
          on conflict (product_id, warehouse_id)
          do update set qty = product_stock.qty + excluded.qty
        `)
      }

      // Reduce customer balance (if any)
      if (input.customerId) {
        await tx.execute(sql`
          update customers
          set balance = greatest(balance - ${input.total}, 0)
          where company_id = ${input.companyId}
            and id = ${input.customerId}
        `)
      }

      // Refund from treasury
      if (input.treasuryId) {
        // 🟢 CHECK: Treasury balance
        const treasuryRes = await tx.execute(sql`
          select balance from treasuries where id = ${input.treasuryId} and company_id = ${input.companyId} limit 1
        `)
        const currentBalance = Number(treasuryRes.rows[0]?.balance ?? 0)
        if (currentBalance < input.total) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_FUNDS',
            message: `رصيد الخزينة غير كافٍ لعملية المرتجع. الرصيد الحالي: ${currentBalance}`,
          })
        }

        await tx.execute(sql`
          insert into treasury_transactions (
            id, treasury_id, company_id, tx_type, amount, payment_method, reference_id, reference_type, notes, created_by
          ) values (
            ${randomUUID()}, ${input.treasuryId}, ${input.companyId}, 'out',
            ${input.total}, 'cash', ${newId}, 'invoice', 'Sale return refund', ${input.cashierId}
          )
        `)
        await tx.execute(sql`
          update treasuries set balance = balance - ${input.total}
          where id = ${input.treasuryId} and company_id = ${input.companyId}
        `)
      }

      const result = { success: true, id: newId, invoiceNumber }
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
      }
      return result
    })
  }

  async createPurchaseReturn(input: {
    companyId: string
    branchId: string
    warehouseId: string
    supplierId?: string | null
    cashierId: string
    treasuryId?: string | null
    total: number
    items: Array<{ productId: string; qty: number; unitPrice: number; totalLine: number }>
    idempotencyKey?: string
  }) {
    if (!db) return { success: true, id: crypto.randomUUID(), invoiceNumber: this.generateInvoiceNumber() }

    return db.transaction(async (tx) => {
      const reqHash = input.idempotencyKey ? this.hashRequest(input) : ''
      if (input.idempotencyKey) {
        const cached = await this.getIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash)
        if (cached) return cached as any
      }

      const invoiceNumber = await this.nextInvoiceNumber(tx, input.companyId, 'purchase_return')
      const newId = randomUUID()

      await tx.execute(sql`
        insert into invoices (
          id, company_id, branch_id, type, warehouse_id, supplier_id, cashier_id, status,
          subtotal, discount_amount, tax_amount, total, paid, remaining, invoice_number
        ) values (
          ${newId}, ${input.companyId}, ${input.branchId}, 'purchase_return', ${input.warehouseId},
          ${input.supplierId ?? null}, ${input.cashierId}, 'paid',
          ${input.total}, 0, 0, ${input.total}, ${input.total}, 0, ${invoiceNumber}
        )
      `)

      for (const item of input.items) {
        await tx.execute(sql`
          insert into invoice_items (id, invoice_id, product_id, qty, unit_price, total_line)
          values (${randomUUID()}, ${newId}, ${item.productId}, ${item.qty}, ${item.unitPrice}, ${item.totalLine})
        `)

        // Return to supplier decreases stock
        await tx.execute(sql`
          update product_stock
          set qty = qty - ${item.qty}
          where product_id = ${item.productId}
            and warehouse_id = ${input.warehouseId}
        `)
      }

      // Reduce supplier balance
      if (input.supplierId) {
        await tx.execute(sql`
          update suppliers
          set balance = greatest(balance - ${input.total}, 0)
          where company_id = ${input.companyId}
            and id = ${input.supplierId}
        `)
      }

      // Money comes back to treasury
      if (input.treasuryId) {
        await tx.execute(sql`
          insert into treasury_transactions (
            id, treasury_id, company_id, tx_type, amount, payment_method, reference_id, reference_type, notes, created_by
          ) values (
            ${randomUUID()}, ${input.treasuryId}, ${input.companyId}, 'in',
            ${input.total}, 'cash', ${newId}, 'invoice', 'Purchase return refund', ${input.cashierId}
          )
        `)
        await tx.execute(sql`
          update treasuries set balance = balance + ${input.total}
          where id = ${input.treasuryId}
        `)
      }

      const result = { success: true, id: newId, invoiceNumber }
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

      if (input.supplierId && input.customerId) {
        throw new BadRequestException({
          code: 'INVALID_INPUT',
          message: 'لا يمكن الجمع بين عميل ومورد في نفس السند',
        })
      }
      if (input.supplierId && input.invoiceId) {
        throw new BadRequestException({
          code: 'INVALID_INPUT',
          message: 'سند صرف المورد المستقل لا يدعم ربط فاتورة في هذه النسخة',
        })
      }

      if (input.supplierId) {
        const sup = await tx.execute(sql`
          select id
          from suppliers
          where company_id = ${input.companyId}
            and id = ${input.supplierId}
          limit 1
        `)
        if (!(sup.rows[0] as any)?.id) {
          throw new BadRequestException({
            code: 'NOT_FOUND',
            message: 'المورد غير موجود',
          })
        }

        if (!input.treasuryId || input.treasuryId === '00000000-0000-0000-0000-000000000000') {
          const defaults = await this.getCompanyDefaults(input.companyId, undefined)
          if (defaults.treasuryId) input.treasuryId = defaults.treasuryId
        }
        if (!input.treasuryId) {
          throw new BadRequestException({
            code: 'INVARIANT_VIOLATION',
            message: 'لا توجد خزينة محددة لإتمام الصرف',
          })
        }

        const balRow = await tx.execute(sql`
          select balance::numeric as balance
          from treasuries
          where id = ${input.treasuryId}
            and company_id = ${input.companyId}
          limit 1
        `)
        const treasuryBal = Number((balRow.rows[0] as any)?.balance ?? 0)
        if (treasuryBal + 0.00001 < input.amount) {
          throw new BadRequestException({
            code: 'INSUFFICIENT_TREASURY_BALANCE',
            message: 'رصيد الخزينة غير كافٍ لهذا الصرف',
            details: { balance: treasuryBal, amount: input.amount },
          })
        }

        const paymentResult = await tx.execute<{ payment_id: string }>(sql`
          insert into treasury_transactions (
            id, treasury_id, company_id, tx_type, amount, payment_method, reference_id, reference_type, notes, created_by
          ) values (
            ${randomUUID()}, ${input.treasuryId}, ${input.companyId}, 'out',
            ${input.amount}, ${input.method},
            ${input.supplierId}, 'supplier_payment',
            ${input.notes ?? null}, ${input.createdBy}
          )
          returning id as payment_id
        `)

        await tx.execute(sql`
          update treasuries
          set balance = balance - ${input.amount}
          where id = ${input.treasuryId}
        `)

        await tx.execute(sql`
          update suppliers
          set balance = greatest(balance - ${input.amount}, 0)
          where company_id = ${input.companyId}
            and id = ${input.supplierId}
        `)

        const result = {
          success: true,
          mode: 'drizzle-transaction',
          id: paymentResult.rows[0]?.payment_id ?? crypto.randomUUID(),
        }

        if (input.idempotencyKey) {
          await this.storeIdempotentResponse(tx, input.companyId, input.idempotencyKey, reqHash, result)
        }

        return result
      }

      let resolvedCustomerId: string | null = input.customerId ?? null
      let invoiceRemaining: number | null = null
      let resolvedBranchId: string | null = null
      if (input.invoiceId) {
        const inv = await tx.execute(sql`
          select customer_id, remaining, branch_id
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
        resolvedBranchId = row.branch_id ?? null

        if (input.amount - invoiceRemaining > 0.00001) {
          throw new BadRequestException({
            code: 'PAYMENT_EXCEEDS_REMAINING',
            message: 'قيمة السداد أكبر من المبلغ المتبقي على الفاتورة',
            details: { amount: input.amount, remaining: invoiceRemaining },
          })
        }
      }

      if (!input.treasuryId || input.treasuryId === '00000000-0000-0000-0000-000000000000') {
        const defaults = await this.getCompanyDefaults(input.companyId, resolvedBranchId ?? undefined)
        if (defaults.treasuryId) input.treasuryId = defaults.treasuryId
      }
      if (!input.treasuryId) {
        throw new BadRequestException({
          code: 'INVARIANT_VIOLATION',
          message: 'لا توجد خزينة محددة لإتمام الدفع',
        })
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

    // 🟢 FIX: JOIN customers to show name
    const rows = await db.execute(sql`
      select i.id, i.invoice_number, i.total, i.status, i.created_at, c.name as customer_name
      from invoices i
      left join customers c on i.customer_id = c.id
      where i.company_id = ${companyId} and i.type = 'sale'
      order by i.created_at desc
      limit ${limit}
    `)

    const items = (rows.rows as any[]).map((r) => ({
      id: r.id,
      invoice_number: r.invoice_number,
      invoiceNumber: r.invoice_number,
      total: Number(r.total ?? 0),
      status: r.status,
      createdAt: r.created_at,
      customers: r.customer_name ? { name: r.customer_name } : null,
    }))

    const q = (query.q ?? '').trim().toLowerCase()
    const filtered =
      q.length === 0 ? items : items.filter((x) => String(x.invoiceNumber ?? '').toLowerCase().includes(q))

    return { items: filtered.slice(0, limit), nextCursor: null }
  }

  async getSaleInvoice(companyId: string, id: string) {
    if (!db) return null
    // 🟢 FIX: Detailed join for print/view
    const res = await db.execute(sql`
      select i.*, 
             c.name as customer_name, c.phone as customer_phone, c.address as customer_address, 
             p.full_name as cashier_name,
             b.name as branch_name,
             w.name as warehouse_name
      from invoices i
      left join customers c on i.customer_id = c.id
      left join profiles p on i.cashier_id = p.id
      left join branches b on i.branch_id = b.id
      left join warehouses w on i.warehouse_id = w.id
      where i.company_id = ${companyId} and i.id = ${id} and (i.type = 'sale' or i.type = 'sale_return' or i.type = 'quotation')
      limit 1
    `)
    const invoice = (res.rows[0] as any) ?? null
    if (!invoice) return null

    // Fetch items with product names
    const itemsRes = await db.execute(sql`
      select ii.*, pr.name as product_name
      from invoice_items ii
      join products pr on ii.product_id = pr.id
      where ii.invoice_id = ${id}
    `)
    
    return {
      ...invoice,
      customers: invoice.customer_id ? { name: invoice.customer_name, phone: invoice.customer_phone, address: invoice.customer_address } : null,
      invoice_items: itemsRes.rows.map((row: any) => ({
        ...row,
        products: { name: row.product_name }
      })),
      profiles: invoice.cashier_id ? { full_name: invoice.cashier_name } : null,
      branches: invoice.branch_id ? { name: invoice.branch_name } : null,
      warehouses: invoice.warehouse_id ? { name: invoice.warehouse_name } : null
    }
  }

  async getTreasury(companyId: string) {
    if (!db) return []
    const res = await db.execute(sql`
      select id, name, balance, branch_id, type, is_default, is_active
      from treasuries
      where company_id = ${companyId} and is_active = true
      order by is_default desc, created_at asc
    `)
    return res.rows
  }

  async createTreasury(
    companyId: string,
    input: {
      name: string
      type?: string
      branchId?: string | null
      isDefault?: boolean
      isActive?: boolean
    },
  ) {
    if (!db) throw new BadRequestException({ message: 'قاعدة البيانات غير متصلة' })
    const name = (input.name || '').trim()
    if (!name) {
      throw new BadRequestException({ message: 'اسم الخزينة مطلوب' })
    }
    let branchId = input.branchId ?? null
    if (!branchId) {
      const first = await db.query.branches.findFirst({
        where: eq(branches.companyId, companyId),
      })
      branchId = first?.id ?? null
    }
    if (!branchId) {
      throw new BadRequestException({
        code: 'NO_BRANCH',
        message: 'أضف فرعًا من الإعدادات قبل إنشاء خزينة',
      })
    }
    const t = (input.type || 'cash').toLowerCase()
    const type = t === 'bank' || t === 'employee' ? t : 'cash'

    return db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx.update(treasuries).set({ isDefault: false }).where(eq(treasuries.companyId, companyId))
      }
      const [row] = await tx
        .insert(treasuries)
        .values({
          companyId,
          branchId,
          name,
          type,
          isDefault: Boolean(input.isDefault),
          isActive: input.isActive !== false,
        })
        .returning()
      return row
    })
  }

  async updateTreasury(
    companyId: string,
    id: string,
    patch: { name?: string; type?: string; isDefault?: boolean; isActive?: boolean },
  ) {
    if (!db) return null
    const existing = await db.query.treasuries.findFirst({
      where: and(eq(treasuries.companyId, companyId), eq(treasuries.id, id)),
    })
    if (!existing) {
      throw new NotFoundException({ message: 'الخزينة غير موجودة' })
    }

    return db.transaction(async (tx) => {
      if (patch.isDefault === true) {
        await tx.update(treasuries).set({ isDefault: false }).where(eq(treasuries.companyId, companyId))
      }
      const t = patch.type?.toLowerCase()
      const type =
        t === undefined
          ? undefined
          : t === 'bank' || t === 'employee'
            ? t
            : 'cash'

      const updates: {
        name?: string
        type?: string
        isActive?: boolean
        isDefault?: boolean
      } = {}
      if (patch.name !== undefined) {
        const nm = patch.name.trim()
        if (nm) updates.name = nm
      }
      if (type !== undefined) updates.type = type
      if (patch.isActive !== undefined) updates.isActive = patch.isActive
      if (patch.isDefault !== undefined) updates.isDefault = patch.isDefault

      if (Object.keys(updates).length === 0) {
        return existing
      }

      const [row] = await tx
        .update(treasuries)
        .set(updates)
        .where(and(eq(treasuries.companyId, companyId), eq(treasuries.id, id)))
        .returning()
      return row ?? null
    })
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
