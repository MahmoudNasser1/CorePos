import { Client } from 'pg'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

import { ensureTestDatabase, getTestDatabaseUrl } from '../helpers/test-db'

type ApiOk<T> = { success: true; data: T }

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function cookiesFromSetCookie(setCookie: string[] | undefined): string {
  if (!setCookie?.length) return ''
  // Keep only "name=value" parts
  return setCookie
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

async function waitForHealthy(baseUrl: string, timeoutMs = 10_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/v1/health`)
      if (res.ok) return
    } catch {
      // ignore
    }
    await sleep(200)
  }
  throw new Error('Backend did not become healthy in time')
}

async function main() {
  // 1) Test DB
  await ensureTestDatabase()
  const testDbUrl = getTestDatabaseUrl()

  // 2) Start backend runtime (dist) with compiled decorator metadata
  const port = Number(process.env.CONTRACT_PORT ?? 4105)
  const baseUrl = `http://localhost:${port}`

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    BACKEND_PORT: String(port),
    DATABASE_URL: testDbUrl,
    TEST_DATABASE_URL: testDbUrl,
  }

  const child = spawn('node', ['dist/main.js'], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  })

  try {
    await waitForHealthy(baseUrl)

    // 3) Auth register
    const email = `u_${Date.now()}@example.com`
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123', fullName: 'Tester', company: 'شركة' }),
    })
    assert(regRes.status === 201, `Expected 201 from register, got ${regRes.status}`)
    const regJson = (await regRes.json()) as ApiOk<{ user: { email: string } }>
    assert(regJson.success === true, 'register envelope missing success=true')
    assert(regJson.data.user.email === email, 'register response user.email mismatch')

    const cookieHeader = cookiesFromSetCookie(regRes.headers.getSetCookie?.() as any)
    // Node 20 has Headers.getSetCookie(); fallback for older: attempt raw header
    const cookie =
      cookieHeader ||
      cookiesFromSetCookie(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((regRes.headers as any).raw?.()['set-cookie'] as string[] | undefined) ?? undefined,
      )
    assert(cookie.includes('access_token='), 'register did not set access_token cookie')
    assert(cookie.includes('refresh_token='), 'register did not set refresh_token cookie')

    // 4) Session
    const sessionRes = await fetch(`${baseUrl}/v1/auth/session`, {
      headers: { cookie },
    })
    assert(sessionRes.status === 200, `Expected 200 from session, got ${sessionRes.status}`)
    const sessionJson = (await sessionRes.json()) as ApiOk<{
      user: { email: string }
      profile: { company_id: string; branch_id: string | null; role: string }
      company: { id: string; name: string } | null
      subscription: { status: string; plan: string; ends_at?: string | null }
    }>
    assert(sessionJson.success === true, 'session envelope missing success=true')
    assert(sessionJson.data.user.email === email, 'session user.email mismatch')
    assert(typeof sessionJson.data.profile.company_id === 'string', 'session profile.company_id missing')
    const companyId = sessionJson.data.profile.company_id

    // 5) Refresh (cookie-based)
    const refreshRes = await fetch(`${baseUrl}/v1/auth/refresh`, { method: 'POST', headers: { cookie } })
    assert(refreshRes.status === 201, `Expected 201 from refresh, got ${refreshRes.status}`)
    const refreshJson = (await refreshRes.json()) as ApiOk<{ user: { email: string } }>
    assert(refreshJson.success === true, 'refresh envelope missing success=true')

    // 6) Onboarding create company (should return envelope)
    const onboardRes = await fetch(`${baseUrl}/v1/onboarding/company`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'شركة جديدة', phone: '0100', address: 'العنوان', currency: 'EGP', vatRate: 0 }),
    })
    assert(onboardRes.status === 201, `Expected 201 from onboarding company, got ${onboardRes.status}`)
    const onboardJson = (await onboardRes.json()) as ApiOk<{ id: string; name: string; phone: string; currency: string }>
    assert(onboardJson.success === true, 'onboarding envelope missing success=true')

    // 7) Finance POS sale smoke (requires defaults seeded)
    const pg = new Client({ connectionString: testDbUrl })
    await pg.connect()
    const branchId = randomUUID()
    const warehouseId = randomUUID()
    const treasuryId = randomUUID()
    const productId = randomUUID()

    await pg.query(`insert into branches (id, company_id, name, is_active) values ($1,$2,'الفرع الرئيسي',true)`, [
      branchId,
      companyId,
    ])
    await pg.query(
      `insert into warehouses (id, branch_id, name, is_default, is_active) values ($1,$2,'المخزن الرئيسي',true,true)`,
      [warehouseId, branchId],
    )
    await pg.query(
      `insert into treasuries (id, company_id, branch_id, name, is_default, is_active, balance) values ($1,$2,$3,'الخزينة الرئيسية',true,true,0)`,
      [treasuryId, companyId, branchId],
    )
    await pg.query(
      `insert into products (id, company_id, name, avg_cost, cost_price, price1, is_active) values ($1,$2,'P','10','10','20',true)`,
      [productId, companyId],
    )
    await pg.query(
      `insert into product_stock (id, product_id, warehouse_id, qty, avg_cost) values (gen_random_uuid(),$1,$2,'5','10')`,
      [productId, warehouseId],
    )
    await pg.end()

    const posRes = await fetch(`${baseUrl}/v1/finance/pos-sale`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-company-id': companyId,
        'x-user-id': sessionJson.data.user.email, // acceptable for dev headers; real would be uuid
      },
      body: JSON.stringify({
        companyId,
        branchId,
        warehouseId,
        treasuryId,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 20,
        paymentMethod: 'cash',
        lines: [{ productId, quantity: 1, unitPrice: 20 }],
      }),
    })
    assert(posRes.status === 201, `Expected 201 from pos-sale, got ${posRes.status}`)
    const posJson = (await posRes.json()) as { success: boolean; invoiceNumber?: string }
    assert(posJson.success === true, 'pos-sale envelope missing success=true')
    assert(/^\d{4}-\d{3}$/.test(String(posJson.invoiceNumber ?? '')), 'pos-sale invoiceNumber format mismatch')

    console.log('[contract-smoke] OK')
  } finally {
    child.kill('SIGTERM')
  }
}

main().catch((e) => {
  console.error('[contract-smoke] FAILED', e)
  process.exit(1)
})

