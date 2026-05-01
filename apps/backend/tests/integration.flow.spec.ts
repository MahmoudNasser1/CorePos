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
  createWarehouse,
  setStock,
} from './helpers/factories'

describe('Integration flows (db-backed)', () => {
  let client: Client
  let FinanceService: typeof import('../src/modules/finance/finance.service').FinanceService
  let ReportsService: typeof import('../src/modules/reports/reports.service').ReportsService
  let BillingService: typeof import('../src/modules/billing/billing.service').BillingService
  let billingService: any

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    ;({ FinanceService } = await import('../src/modules/finance/finance.service'))
    ;({ ReportsService } = await import('../src/modules/reports/reports.service'))
    ;({ BillingService } = await import('../src/modules/billing/billing.service'))
    billingService = new BillingService()
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('onboarding → create product+stock → POS cash sale → reports reflect updates', async () => {
    const finance = new FinanceService(billingService)
    const reports = new ReportsService()

    // Onboarding (minimal for backend): company + defaults
    const company = await createCompany(client, { name: 'شركة A' })
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id, isDefault: true })
    const treasury = await createTreasury(client, { companyId: company.id, branchId: branch.id, isDefault: true })
    const customer = await createCustomer(client, { companyId: company.id, balance: 0, creditLimit: 0 })

    // Inventory: product + stock
    const product = await createProduct(client, { companyId: company.id, name: 'منتج', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 5, avgCost: 10 })

    // Finance: POS cash sale (unitPrice 20 => profit 10)
    const sale = await finance.createPosSale({
      companyId: company.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      treasuryId: treasury.id,
      customerId: customer.id,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 20,
      paymentMethod: 'cash',
      lines: [{ productId: product.id, quantity: 1, unitPrice: 20 }],
      idempotencyKey: 'flow-1',
    })
    expect(sale.success).toBe(true)

    // Reports: daily summary sales/profits
    const daily = await reports.getDailySummary(company.id)
    expect(daily.sales).toBe(20)
    expect(daily.purchases).toBe(0)
    expect(daily.profits).toBe(10)

    // Reports: stock report reflects qty decrement
    const stock = await reports.getStockReport(company.id)
    expect(stock).toHaveLength(1)
    expect(stock[0].qty).toBe(4)

    // Reports: treasury report includes our tx
    const tre = await reports.getTreasuryReport(company.id)
    expect(tre.length).toBeGreaterThanOrEqual(1)
  })

  it('multi-tenant isolation: company A cannot see company B treasury transactions', async () => {
    const reports = new ReportsService()

    const cA = await createCompany(client, { name: 'A' })
    const cB = await createCompany(client, { name: 'B' })

    const bA = await createBranch(client, { companyId: cA.id })
    const bB = await createBranch(client, { companyId: cB.id })
    const tA = await createTreasury(client, { companyId: cA.id, branchId: bA.id })
    const tB = await createTreasury(client, { companyId: cB.id, branchId: bB.id })

    await client.query(
      `insert into treasury_transactions (id, treasury_id, company_id, tx_type, amount, payment_method)
       values (gen_random_uuid(), $1, $2, 'in', 10, 'cash')`,
      [tA.id, cA.id],
    )
    await client.query(
      `insert into treasury_transactions (id, treasury_id, company_id, tx_type, amount, payment_method)
       values (gen_random_uuid(), $1, $2, 'in', 99, 'cash')`,
      [tB.id, cB.id],
    )

    const aTxs = await reports.getTreasuryReport(cA.id)
    expect(aTxs).toHaveLength(1)

    const ids = aTxs.map((x: any) => x.id)
    const rows = await client.query(`select company_id from treasury_transactions where id = $1`, [ids[0]])
    expect(rows.rows[0].company_id).toBe(cA.id)
  })
})

