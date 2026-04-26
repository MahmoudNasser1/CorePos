import { Client } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'
import {
  createBranch,
  createCompany,
  createProduct,
  createTreasury,
  createWarehouse,
  setStock,
  uuid,
} from './helpers/factories'

describe('ReportsService (db-backed)', () => {
  let client: Client
  let ReportsService: typeof import('../src/modules/reports/reports.service').ReportsService

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    ;({ ReportsService } = await import('../src/modules/reports/reports.service'))
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('getDailySummary returns zeros when no invoices', async () => {
    const svc = new ReportsService()
    const company = await createCompany(client)
    const res = await svc.getDailySummary(company.id)
    expect(res).toEqual({
      sales: 0,
      purchases: 0,
      profits: 0,
      lowStockCount: 0,
      salesCount: 0,
      treasuryBalance: 0,
    })
  })

  it('getStockReport aggregates qty and total value', async () => {
    const svc = new ReportsService()
    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const w1 = await createWarehouse(client, { branchId: branch.id, name: 'w1', isDefault: true })
    const w2 = await createWarehouse(client, { branchId: branch.id, name: 'w2', isDefault: false })

    const p = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: p.id, warehouseId: w1.id, qty: 2, avgCost: 10 })
    await setStock(client, { productId: p.id, warehouseId: w2.id, qty: 3, avgCost: 10 })

    const stock = await svc.getStockReport(company.id)
    expect(stock).toHaveLength(1)
    expect(stock[0].name).toBe('P')
    expect(stock[0].qty).toBe(5)
    expect(stock[0].avgCost).toBe(10)
    expect(stock[0].totalValue).toBe(50)
  })

  it('getTreasuryReport is company-isolated', async () => {
    const svc = new ReportsService()
    const c1 = await createCompany(client, { name: 'A' })
    const c2 = await createCompany(client, { name: 'B' })

    const b1 = await createBranch(client, { companyId: c1.id })
    const b2 = await createBranch(client, { companyId: c2.id })
    const t1 = await createTreasury(client, { companyId: c1.id, branchId: b1.id })
    const t2 = await createTreasury(client, { companyId: c2.id, branchId: b2.id })

    await client.query(
      `
      insert into treasury_transactions (id, treasury_id, company_id, tx_type, amount, payment_method)
      values ($1,$2,$3,'in',10,'cash')
    `,
      [uuid(), t1.id, c1.id],
    )
    await client.query(
      `
      insert into treasury_transactions (id, treasury_id, company_id, tx_type, amount, payment_method)
      values ($1,$2,$3,'in',20,'cash')
    `,
      [uuid(), t2.id, c2.id],
    )

    const r1 = await svc.getTreasuryReport(c1.id)
    expect(r1).toHaveLength(1)
    expect((r1[0] as any).companyId ?? (r1[0] as any).company_id).toBeTruthy()
    // confirm returned tx belongs to c1 by raw query
    const ids = r1.map((x: any) => x.id)
    const rows = await client.query(`select company_id from treasury_transactions where id = $1`, [ids[0]])
    expect(rows.rows[0].company_id).toBe(c1.id)
  })
})

