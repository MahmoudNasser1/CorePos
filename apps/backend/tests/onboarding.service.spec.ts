import { Client } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'
import { createUserWithProfile } from './helpers/factories'

describe('OnboardingService (db-backed)', () => {
  let client: Client
  let OnboardingService: typeof import('../src/modules/onboarding/onboarding.service').OnboardingService

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    ;({ OnboardingService } = await import('../src/modules/onboarding/onboarding.service'))
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('creates company + default branch/warehouse/treasury + subscription in one transaction', async () => {
    const service = new OnboardingService()
    const company = await service.createInitialCompany({
      name: 'شركة ١',
      phone: '0100',
      address: 'العنوان',
      currency: 'EGP',
      vatRate: 14,
    })

    const c = await client.query(`select id, name from companies where id = $1`, [company.id])
    expect(c.rows).toHaveLength(1)

    const b = await client.query(`select * from branches where company_id = $1`, [company.id])
    expect(b.rows).toHaveLength(1)
    expect(b.rows[0].name).toBe('الفرع الرئيسي')

    const w = await client.query(`select * from warehouses where branch_id = $1`, [b.rows[0].id])
    expect(w.rows).toHaveLength(1)
    expect(w.rows[0].is_default).toBe(true)

    const t = await client.query(`select * from treasuries where company_id = $1`, [company.id])
    expect(t.rows).toHaveLength(1)
    expect(t.rows[0].is_default).toBe(true)

    const s = await client.query(`select * from subscriptions where company_id = $1`, [company.id])
    expect(s.rows).toHaveLength(1)
    expect(s.rows[0].plan_id).toBe('starter')
  })

  it('createInitialCompany sets profile.company_id and profile.branch_id when userId is provided', async () => {
    const service = new OnboardingService()
    const { id: userId } = await createUserWithProfile(client, {
      email: 'onboard@test.com',
      passwordHash: 'hash',
      fullName: 'Owner',
      companyId: null,
      branchId: null,
    })

    const company = await service.createInitialCompany(
      {
        name: 'شركة مرتبطة',
        phone: '01009998877',
        currency: 'EGP',
        vatRate: 0,
      },
      userId,
    )

    const prof = await client.query(`select company_id, branch_id from profiles where id = $1`, [userId])
    expect(prof.rows).toHaveLength(1)
    expect(prof.rows[0].company_id).toBe(company.id)
    expect(prof.rows[0].branch_id).not.toBeNull()

    const branches = await client.query(`select id from branches where company_id = $1`, [company.id])
    expect(branches.rows[0].id).toBe(prof.rows[0].branch_id)
  })

  it('setupSampleData creates units/categories/products/contacts for the company', async () => {
    // Create a company first
    const service = new OnboardingService()
    const company = await service.createInitialCompany({
      name: 'شركة ٢',
      phone: '0100',
      currency: 'EGP',
      vatRate: 0,
    })

    const summary = await service.setupSampleData(company.id)
    expect(summary).toMatchObject({ categories: 2, products: 2, customers: 1, suppliers: 1 })

    const products = await client.query(`select id from products where company_id = $1`, [company.id])
    expect(products.rows.length).toBeGreaterThanOrEqual(2)
  })
})

