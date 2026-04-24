import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Client } from 'pg'
import * as bcrypt from 'bcryptjs'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'

describe('AuthService (db-backed)', () => {
  let client: Client
  let AuthService: typeof import('../src/modules/auth/auth.service').AuthService

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    process.env.JWT_SECRET = 'test-secret'

    // Import AFTER TEST_DATABASE_URL is set so drizzle pool connects.
    ;({ AuthService } = await import('../src/modules/auth/auth.service'))
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('register hashes password and returns tokens', async () => {
    const service = new AuthService()
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
    const service = new AuthService()
    await service.register('b@example.com', 'password123', 'User B')

    await expect(service.login('b@example.com', 'wrong')).rejects.toMatchObject({ name: 'UnauthorizedException' })
  })

  it('access token expires within 30 minutes', async () => {
    const service = new AuthService()
    const result = await service.register('c@example.com', 'password123', 'User C')

    // JWT exp is in seconds. Expect <= 30 minutes (+ small leeway).
    const payload = JSON.parse(Buffer.from(result.accessToken.split('.')[1]!, 'base64').toString('utf8')) as {
      iat: number
      exp: number
    }

    expect(payload.exp - payload.iat).toBeLessThanOrEqual(30 * 60 + 5)
  })

  it('refresh issues new tokens for valid refresh token', async () => {
    const service = new AuthService()
    const reg = await service.register('d@example.com', 'password123', 'User D')

    const refreshed = await service.refresh(reg.refreshToken)
    expect(refreshed.accessToken).toBeTruthy()
    expect(refreshed.refreshToken).toBeTruthy()
    expect(refreshed.user.email).toBe('d@example.com')
  })

  it('getSession returns profile/company/subscription payload shape', async () => {
    const service = new AuthService()
    const reg = await service.register('e@example.com', 'password123', 'User E', 'شركة')

    const session = await service.getSession(reg.accessToken)
    expect(session.user.email).toBe('e@example.com')
    expect(session.profile.role).toBeTruthy()
    expect(session.company?.name).toBe('شركة')
    expect(session.subscription.plan).toBeTruthy()
  })

  it('throws when JWT_SECRET is not set in production', async () => {
    const prevNodeEnv = process.env.NODE_ENV
    const prevSecret = process.env.JWT_SECRET

    process.env.NODE_ENV = 'production'
    delete process.env.JWT_SECRET

    const mod = await import('../src/modules/auth/auth.service')
    const service = new mod.AuthService()

    await expect(service.login('x@example.com', 'x')).rejects.toMatchObject({ name: 'BadRequestException' })

    process.env.NODE_ENV = prevNodeEnv
    if (prevSecret) process.env.JWT_SECRET = prevSecret
  })
})

