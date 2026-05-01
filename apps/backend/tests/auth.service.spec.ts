import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Client } from 'pg'
import * as bcrypt from 'bcryptjs'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'

describe('AuthService (db-backed)', () => {
  let client: Client
  let AuthService: typeof import('../src/modules/auth/auth.service').AuthService
  let PolicyEvaluatorService: typeof import('../src/common/rbac/policy-evaluator.service').PolicyEvaluatorService
  let policyEvaluator: any

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    process.env.JWT_SECRET = 'test-secret'

    // Import AFTER TEST_DATABASE_URL is set so drizzle pool connects.
    ;({ AuthService } = await import('../src/modules/auth/auth.service'))
    ;({ PolicyEvaluatorService } = await import('../src/common/rbac/policy-evaluator.service'))
    policyEvaluator = new PolicyEvaluatorService()
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('register hashes password and returns tokens', async () => {
    const service = new AuthService(policyEvaluator)
    const result = await service.register('a@example.com', 'password123', 'Test User', 'شركة')

    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.user.email).toBe('a@example.com')

    const row = await client.query(`select email, password_hash from users where email = $1`, ['a@example.com'])
    expect(row.rows).toHaveLength(1)
    expect(row.rows[0].password_hash).not.toBe('password123')
    expect(await bcrypt.compare('password123', row.rows[0].password_hash)).toBe(true)
  })

  it('login rejects wrong password', async () => {
    const service = new AuthService(policyEvaluator)
    await service.register('b@example.com', 'password123', 'User B')

    await expect(service.login('b@example.com', 'wrong')).rejects.toMatchObject({ name: 'UnauthorizedException' })
  })

  it('access token expires within 30 minutes', async () => {
    const service = new AuthService(policyEvaluator)
    const result = await service.register('c@example.com', 'password123', 'User C')

    // JWT exp is in seconds. Expect <= 30 minutes (+ small leeway).
    const payload = JSON.parse(Buffer.from(result.accessToken.split('.')[1]!, 'base64').toString('utf8')) as {
      iat: number
      exp: number
    }

    expect(payload.exp - payload.iat).toBeLessThanOrEqual(30 * 60 + 5)
  })

  it('refresh issues new tokens for valid refresh token', async () => {
    const service = new AuthService(policyEvaluator)
    const reg = await service.register('d@example.com', 'password123', 'User D')

    const refreshed = await service.refresh(reg.refreshToken)
    expect(refreshed.accessToken).toBeTruthy()
    expect(refreshed.refreshToken).toBeTruthy()
    expect(refreshed.user.email).toBe('d@example.com')
  })

  it('getSession returns profile/company/subscription payload shape', async () => {
    const service = new AuthService(policyEvaluator)
    const reg = await service.register('e@example.com', 'password123', 'User E', 'شركة')

    const session = await service.getSession(reg.accessToken)
    expect(session.user.email).toBe('e@example.com')
    expect(session.profile.role).toBeTruthy()
    expect(session.company?.name).toBe('شركة')
    expect(session.company?.currency).toBe('EGP')
    expect(session.company?.timezone).toBeTruthy()
    expect(session.company?.countryCode).toBe('EG')
    expect(session.subscription.plan).toBeTruthy()
  })

  it('throws when JWT_SECRET is not set in production', async () => {
    const prevNodeEnv = process.env.NODE_ENV
    const prevSecret = process.env.JWT_SECRET

    process.env.NODE_ENV = 'production'
    delete process.env.JWT_SECRET

    const mod = await import('../src/modules/auth/auth.service')
    const service = new mod.AuthService(policyEvaluator)

    await expect(service.login('x@example.com', 'x')).rejects.toMatchObject({ name: 'BadRequestException' })

    process.env.NODE_ENV = prevNodeEnv
    if (prevSecret) process.env.JWT_SECRET = prevSecret
  })

  it('register initializes default branch, warehouse, treasury and payment methods', async () => {
    const service = new AuthService(policyEvaluator)
    const result = await service.register('f@example.com', 'password123', 'User F', 'شركة جديدة')
    const companyId = result.user.companyId

    // Check branch
    const bRes = await client.query('select * from branches where company_id = $1', [companyId])
    expect(bRes.rows).toHaveLength(1)
    expect(bRes.rows[0].name).toBe('الفرع الرئيسي')

    // Check warehouse
    const wRes = await client.query('select * from warehouses where branch_id = $1', [bRes.rows[0].id])
    expect(wRes.rows).toHaveLength(1)
    expect(wRes.rows[0].name).toBe('المستودع الرئيسي')

    // Check treasury
    const tRes = await client.query('select * from treasuries where company_id = $1', [companyId])
    expect(tRes.rows).toHaveLength(1)
    expect(tRes.rows[0].name).toBe('الخزينة الرئيسية')

    // Check payment methods
    const pRes = await client.query('select code from payment_methods where company_id = $1 order by sort_order', [companyId])
    expect(pRes.rows.map(r => r.code)).toContain('cash')
    expect(pRes.rows.map(r => r.code)).toContain('card')
    expect(pRes.rows.map(r => r.code)).toContain('bank')
  })
})

