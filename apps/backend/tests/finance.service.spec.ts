import { Client } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'
import {
  createBranch,
  createCompany,
  createCustomer,
  createProduct,
  createTreasury,
  createUserWithProfile,
  createWarehouse,
  setStock,
} from './helpers/factories'

function getCode(err: unknown): string | undefined {
  const anyErr = err as any
  if (anyErr?.getResponse) return anyErr.getResponse()?.code
  return anyErr?.response?.code
}

describe('FinanceService (db-backed)', () => {
  let client: Client
  let FinanceService: typeof import('../src/modules/finance/finance.service').FinanceService

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    ;({ FinanceService } = await import('../src/modules/finance/finance.service'))
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('creates cash POS sale: invoice + items + stock decrement + treasury tx + balance increment', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    const res = await svc.createPosSale({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      treasuryId: treasury.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 20,
      paymentMethod: 'cash',
      lines: [{ productId: product.id, quantity: 2, unitPrice: 10 }],
    })

    expect(res).toMatchObject({ success: true, mode: 'drizzle-transaction' })
    expect(res.invoiceId).toBeTruthy()
    expect(res.invoiceNumber).toMatch(/^\d{4}-\d{3}$/) // YYMM-NNN

    const inv = await client.query(`select paid, remaining, status, invoice_number from invoices where id = $1`, [
      res.invoiceId,
    ])
    expect(inv.rows).toHaveLength(1)
    expect(Number(inv.rows[0].paid)).toBe(20)
    expect(Number(inv.rows[0].remaining)).toBe(0)
    expect(inv.rows[0].status).toBe('paid')
    expect(inv.rows[0].invoice_number).toBe(res.invoiceNumber)

    const items = await client.query(`select qty, unit_price, total_line from invoice_items where invoice_id = $1`, [
      res.invoiceId,
    ])
    expect(items.rows).toHaveLength(1)
    expect(Number(items.rows[0].qty)).toBe(2)
    expect(Number(items.rows[0].unit_price)).toBe(10)
    expect(Number(items.rows[0].total_line)).toBe(20)

    const stock = await client.query(
      `select qty from product_stock where product_id = $1 and warehouse_id = $2`,
      [product.id, warehouse.id],
    )
    expect(Number(stock.rows[0].qty)).toBe(3)

    const txs = await client.query(
      `select amount, tx_type, payment_method from treasury_transactions where company_id = $1`,
      [company.id],
    )
    expect(txs.rows).toHaveLength(1)
    expect(Number(txs.rows[0].amount)).toBe(20)
    expect(txs.rows[0].tx_type).toBe('in')
    expect(txs.rows[0].payment_method).toBe('cash')

    const tre = await client.query(`select balance from treasuries where id = $1`, [treasury.id])
    expect(Number(tre.rows[0].balance)).toBe(20)
  })

  it('creates deferred POS sale: no treasury tx, customer balance increases, invoice status partial', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const customer = await createCustomer(client, { companyId: company.id, balance: 0, creditLimit: 1000 })
    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    const res = await svc.createPosSale({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      customerId: customer.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 10,
      paymentMethod: 'deferred',
      lines: [{ productId: product.id, quantity: 1, unitPrice: 10 }],
    })

    expect(res.success).toBe(true)

    const inv = await client.query(`select paid, remaining, status from invoices where id = $1`, [res.invoiceId])
    expect(Number(inv.rows[0].paid)).toBe(0)
    expect(Number(inv.rows[0].remaining)).toBe(10)
    expect(inv.rows[0].status).toBe('partial')

    const txs = await client.query(`select id from treasury_transactions where company_id = $1`, [company.id])
    expect(txs.rows).toHaveLength(0)

    const cust = await client.query(`select balance from customers where id = $1`, [customer.id])
    expect(Number(cust.rows[0].balance)).toBe(10)
  })

  it('applies payment receipt against invoice: remaining decreases, status updates, customer balance decreases', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const customer = await createCustomer(client, { companyId: company.id, balance: 0, creditLimit: 1000 })
    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    // Create deferred sale invoice with remaining=10; customer balance becomes 10.
    const sale = await svc.createPosSale({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      customerId: customer.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 10,
      paymentMethod: 'deferred',
      lines: [{ productId: product.id, quantity: 1, unitPrice: 10 }],
    })
    expect(sale.success).toBe(true)

    // Pay 4 against invoice -> remaining 6, status partial, customer balance 6
    const payer = await createUserWithProfile(client, {
      email: 'payer@example.com',
      passwordHash: 'x',
      fullName: 'Payer',
      companyId: company.id,
      branchId: branch.id,
      role: 'cashier',
    })
    const receipt = await svc.addPaymentReceipt({
      companyId: company.id,
      treasuryId: treasury.id,
      amount: 4,
      method: 'cash',
      invoiceId: sale.invoiceId!,
      createdBy: payer.id,
    })
    expect(receipt.success).toBe(true)

    const inv = await client.query(`select paid, remaining, status from invoices where id = $1`, [sale.invoiceId])
    expect(Number(inv.rows[0].paid)).toBe(4)
    expect(Number(inv.rows[0].remaining)).toBe(6)
    expect(inv.rows[0].status).toBe('partial')

    const cust = await client.query(`select balance from customers where id = $1`, [customer.id])
    expect(Number(cust.rows[0].balance)).toBe(6)
  })

  it('applies full payment receipt: remaining becomes 0 and status becomes paid', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })
    const payer = await createUserWithProfile(client, {
      email: `payer_${Date.now()}@example.com`,
      passwordHash: 'x',
      fullName: 'Payer',
      companyId: company.id,
      branchId: branch.id,
      role: 'cashier',
    })

    const customer = await createCustomer(client, { companyId: company.id, balance: 0, creditLimit: 1000 })
    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    const sale = await svc.createPosSale({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      customerId: customer.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 10,
      paymentMethod: 'deferred',
      lines: [{ productId: product.id, quantity: 1, unitPrice: 10 }],
    })
    expect(sale.success).toBe(true)

    const receipt = await svc.addPaymentReceipt({
      companyId: company.id,
      treasuryId: treasury.id,
      amount: 10,
      method: 'cash',
      invoiceId: sale.invoiceId!,
      createdBy: payer.id,
    })
    expect(receipt.success).toBe(true)

    const inv = await client.query(`select paid, remaining, status from invoices where id = $1`, [sale.invoiceId])
    expect(Number(inv.rows[0].paid)).toBe(10)
    expect(Number(inv.rows[0].remaining)).toBe(0)
    expect(inv.rows[0].status).toBe('paid')

    const cust = await client.query(`select balance from customers where id = $1`, [customer.id])
    expect(Number(cust.rows[0].balance)).toBe(0)
  })

  it('allows negative stock: does not throw INSUFFICIENT_STOCK and decrements below zero', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    // No stock set initialley (qty is 0 or record doesn't exist)

    const res = await svc.createPosSale({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      treasuryId: treasury.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 20,
      paymentMethod: 'cash',
      lines: [{ productId: product.id, quantity: 2, unitPrice: 10 }],
    })

    expect(res.success).toBe(true)

    const stock = await client.query(
      `select qty from product_stock where product_id = $1 and warehouse_id = $2`,
      [product.id, warehouse.id],
    )
    expect(Number(stock.rows[0].qty)).toBe(-2)
  })

  it('idempotency returns same invoice and does not duplicate rows', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    const payload = {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      treasuryId: treasury.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 10,
      paymentMethod: 'cash' as const,
      lines: [{ productId: product.id, quantity: 1, unitPrice: 10 }],
      idempotencyKey: 'k-1',
    }

    const r1 = await svc.createPosSale(payload)
    const r2 = await svc.createPosSale(payload)

    expect(r2).toMatchObject({ success: true })
    expect(r2.invoiceId).toBe(r1.invoiceId)
    expect(r2.invoiceNumber).toBe(r1.invoiceNumber)

    const invs = await client.query(`select id from invoices where company_id = $1`, [company.id])
    expect(invs.rows).toHaveLength(1)

    const keys = await client.query(`select key from idempotency_keys where company_id = $1`, [company.id])
    expect(keys.rows).toHaveLength(1)

    const txs = await client.query(`select id from treasury_transactions where company_id = $1`, [company.id])
    expect(txs.rows).toHaveLength(1)
  })

  it('idempotency key with different payload returns CONFLICT', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    const base = {
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      treasuryId: treasury.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 10,
      paymentMethod: 'cash' as const,
      lines: [{ productId: product.id, quantity: 1, unitPrice: 10 }],
      idempotencyKey: 'k-conflict',
    }

    await svc.createPosSale(base)

    await expect(
      svc.createPosSale({
        ...base,
        // same key but different total/lines should conflict
        totalAmount: 20,
        lines: [{ productId: product.id, quantity: 2, unitPrice: 10 }],
      }),
    ).rejects.toMatchObject({ name: 'ConflictException' })
  })

  it('invoice numbering is sequential per company under concurrent POS sales', async () => {
    const svc = new FinanceService()

    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })

    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 1 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 100, avgCost: 1 })

    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        svc.createPosSale({
          companyId: company.id,
          branchId: branch.id,
          warehouseId: warehouse.id,
          treasuryId: treasury.id,
          discountAmount: 0,
          taxAmount: 0,
          totalAmount: 1,
          paymentMethod: 'cash',
          lines: [{ productId: product.id, quantity: 1, unitPrice: 1 }],
          idempotencyKey: `k-seq-${i}`,
        }),
      ),
    )

    const numbers = results.map((r: any) => r.invoiceNumber)
    expect(new Set(numbers).size).toBe(numbers.length)

    const suffixes = numbers
      .map((n) => String(n).split('-')[1])
      .map((s) => Number(s))
      .sort((a, b) => a - b)

    // should be 1..10
    expect(suffixes).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})

