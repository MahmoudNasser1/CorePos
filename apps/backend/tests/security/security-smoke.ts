import { Client } from 'pg'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

import { ensureTestDatabase, getTestDatabaseUrl } from '../helpers/test-db'

type Envelope<T> = { success: true; data: T } | { success: false; error: { code: string; message: string; details?: unknown } }

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function cookiesFromSetCookie(setCookie: string[] | undefined): string {
  if (!setCookie?.length) return ''
  return setCookie
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

async function waitForHealthy(baseUrl: string, timeoutMs = 15_000) {
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

async function postJson<T>(url: string, body: unknown, cookie?: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  })
  const json = (await res.json()) as Envelope<T>
  return { res, json }
}

async function getJson<T>(url: string, cookie?: string) {
  const res = await fetch(url, {
    headers: {
      ...(cookie ? { cookie } : {}),
    },
  })
  const json = (await res.json()) as Envelope<T>
  return { res, json }
}

async function main() {
  await ensureTestDatabase()
  const testDbUrl = getTestDatabaseUrl()

  const port = Number(process.env.SECURITY_PORT ?? 4115)
  const baseUrl = `http://localhost:${port}`

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
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

    // 1) Session enforcement: no cookie should be blocked
    const noCookieRes = await fetch(`${baseUrl}/v1/inventory/products`)
    assert(noCookieRes.status === 401, `Expected 401 for missing session, got ${noCookieRes.status}`)
    const noCookieJson = (await noCookieRes.json()) as Envelope<unknown>
    assert(noCookieJson.success === false, 'Expected error envelope for missing session')
    assert(noCookieJson.error.code === 'SESSION_MISSING', `Expected SESSION_MISSING, got ${noCookieJson.error.code}`)

    // 2) x-company-id bypass must be blocked in production
    const headerOnlyRes = await fetch(`${baseUrl}/v1/inventory/products`, {
      headers: {
        'x-company-id': randomUUID(),
        'x-user-id': randomUUID(),
      },
    })
    assert(headerOnlyRes.status === 401, `Expected 401 for header-only tenant in prod, got ${headerOnlyRes.status}`)
    const headerOnlyJson = (await headerOnlyRes.json()) as Envelope<unknown>
    assert(headerOnlyJson.success === false, 'Expected error envelope for header-only tenant in prod')
    assert(headerOnlyJson.error.code === 'SESSION_MISSING', `Expected SESSION_MISSING, got ${headerOnlyJson.error.code}`)

    // 3) Tenant isolation: company B must not access company A resources by id
    const emailA = `sec_a_${Date.now()}@example.com`
    const emailB = `sec_b_${Date.now()}@example.com`

    const regA = await postJson<{ user: { email: string } }>(`${baseUrl}/v1/auth/register`, {
      email: emailA,
      password: 'password123',
      fullName: 'A',
      company: 'شركة A',
    })
    assert(regA.res.status === 201, `Expected 201 register A, got ${regA.res.status}`)
    const cookieA =
      cookiesFromSetCookie(regA.res.headers.getSetCookie?.() as any) ||
      cookiesFromSetCookie(((regA.res.headers as any).raw?.()['set-cookie'] as string[] | undefined) ?? undefined)
    assert(cookieA.includes('access_token='), 'A missing access_token cookie')

    const regB = await postJson<{ user: { email: string } }>(`${baseUrl}/v1/auth/register`, {
      email: emailB,
      password: 'password123',
      fullName: 'B',
      company: 'شركة B',
    })
    assert(regB.res.status === 201, `Expected 201 register B, got ${regB.res.status}`)
    const cookieB =
      cookiesFromSetCookie(regB.res.headers.getSetCookie?.() as any) ||
      cookiesFromSetCookie(((regB.res.headers as any).raw?.()['set-cookie'] as string[] | undefined) ?? undefined)
    assert(cookieB.includes('access_token='), 'B missing access_token cookie')

    const sessionA = await getJson<{
      profile: { company_id: string; branch_id: string | null }
      user: { id: string; email: string }
    }>(`${baseUrl}/v1/auth/session`, cookieA)
    assert(sessionA.res.status === 200, `Expected 200 session A, got ${sessionA.res.status}`)
    assert(sessionA.json.success === true, 'Expected success session A')
    const companyAId = sessionA.json.data.profile.company_id

    const sessionB = await getJson<{
      profile: { company_id: string; branch_id: string | null }
      user: { id: string; email: string }
    }>(`${baseUrl}/v1/auth/session`, cookieB)
    assert(sessionB.res.status === 200, `Expected 200 session B, got ${sessionB.res.status}`)
    assert(sessionB.json.success === true, 'Expected success session B')
    const companyBId = sessionB.json.data.profile.company_id
    assert(companyAId !== companyBId, 'Expected different company ids for A and B')

    // Seed inventory + defaults for company A then create sale invoice
    const pg = new Client({ connectionString: testDbUrl })
    await pg.connect()
    const branchId = randomUUID()
    const warehouseId = randomUUID()
    const treasuryId = randomUUID()
    const productId = randomUUID()

    await pg.query(`insert into branches (id, company_id, name, is_active) values ($1,$2,'الفرع',true)`, [
      branchId,
      companyAId,
    ])
    await pg.query(
      `insert into warehouses (id, branch_id, name, is_default, is_active) values ($1,$2,'المخزن',true,true)`,
      [warehouseId, branchId],
    )
    await pg.query(
      `insert into treasuries (id, company_id, branch_id, name, is_default, is_active, balance) values ($1,$2,$3,'الخزينة',true,true,0)`,
      [treasuryId, companyAId, branchId],
    )
    await pg.query(
      `insert into products (id, company_id, name, avg_cost, cost_price, price1, is_active) values ($1,$2,'منتج A','10','10','20',true)`,
      [productId, companyAId],
    )
    await pg.query(
      `insert into product_stock (id, product_id, warehouse_id, qty, avg_cost) values (gen_random_uuid(),$1,$2,'5','10')`,
      [productId, warehouseId],
    )
    const customerId = randomUUID()
    await pg.query(`insert into customers (id, company_id, name, balance, credit_limit, is_active) values ($1,$2,'عميل A','0','0',true)`, [
      customerId,
      companyAId,
    ])
    await pg.end()

    const prodAsB = await getJson<unknown>(`${baseUrl}/v1/inventory/products/${productId}`, cookieB)
    assert(prodAsB.res.status === 200, `Expected 200 envelope for getProduct, got ${prodAsB.res.status}`)
    assert(prodAsB.json.success === true, 'Expected success envelope for getProduct')
    const prodData = (prodAsB.json as any).data
    if (prodData != null) {
      console.error('[security-smoke] unexpected product data for B', {
        prodData,
        product_company_id: prodData?.companyId ?? prodData?.company_id,
        expected_company_b: companyBId,
        expected_company_a: companyAId,
      })
    }
    assert(prodData == null, 'Expected empty product data for cross-tenant access (null/undefined)')

    const posSale = await postJson<{ success: boolean; invoiceId?: string; id?: string }>(`${baseUrl}/v1/finance/pos-sale`, {
      branchId,
      warehouseId,
      treasuryId,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 20,
      paymentMethod: 'cash',
      lines: [{ productId, quantity: 1, unitPrice: 20 }],
    }, cookieA)
    assert(posSale.res.status === 201, `Expected 201 pos-sale, got ${posSale.res.status}`)
    assert(posSale.json.success === true, 'Expected pos-sale success envelope')

    const listA = await getJson<{ items: Array<{ id: string }> }>(`${baseUrl}/v1/finance/sale-invoices?limit=1`, cookieA)
    assert(listA.res.status === 200, `Expected 200 sale-invoices list, got ${listA.res.status}`)
    assert(listA.json.success === true, 'Expected success envelope for sale-invoices list')
    const listData: any = (listA.json as any).data
    const invoiceId: string | undefined = listData?.items?.[0]?.id
    assert(invoiceId, 'sale-invoices list did not return an invoice id')

    const invAsB = await getJson<unknown>(`${baseUrl}/v1/finance/sale-invoices/${invoiceId}`, cookieB)
    assert(invAsB.res.status === 200, `Expected 200 envelope for getSaleInvoice, got ${invAsB.res.status}`)
    assert(invAsB.json.success === true, 'Expected success envelope for getSaleInvoice')
    const invData = (invAsB.json as any).data
    assert(invData == null, 'Expected empty invoice data for cross-tenant access (null/undefined)')

    // 4) Contacts: B must not access A customer by id
    const custAsB = await getJson<unknown>(`${baseUrl}/v1/contacts/customers/${customerId}`, cookieB)
    assert(custAsB.res.status === 200, `Expected 200 envelope for getCustomer, got ${custAsB.res.status}`)
    assert(custAsB.json.success === true, 'Expected success envelope for getCustomer')
    assert((custAsB.json as any).data == null, 'Expected empty customer data for cross-tenant access (null/undefined)')

    // 5) Reports: B must not see A’s activity
    const topProductsB = await getJson<unknown>(`${baseUrl}/v1/reports/top-products`, cookieB)
    assert(topProductsB.res.status === 200, `Expected 200 envelope for reports/top-products, got ${topProductsB.res.status}`)
    assert(topProductsB.json.success === true, 'Expected success envelope for reports/top-products')
    const topData = (topProductsB.json as any).data
    assert(Array.isArray(topData) && topData.length === 0, 'Expected no top-products for B')

    const stockB = await getJson<unknown>(`${baseUrl}/v1/reports/stock`, cookieB)
    assert(stockB.res.status === 200, `Expected 200 envelope for reports/stock, got ${stockB.res.status}`)
    assert(stockB.json.success === true, 'Expected success envelope for reports/stock')
    const stockData = (stockB.json as any).data
    assert(Array.isArray(stockData), 'Expected array data for stock report')
    assert(stockData.every((row: any) => row?.id !== productId), 'Expected stock report for B not to include A product')

    const treasuryB = await getJson<unknown>(`${baseUrl}/v1/reports/treasury`, cookieB)
    assert(treasuryB.res.status === 200, `Expected 200 envelope for reports/treasury, got ${treasuryB.res.status}`)
    assert(treasuryB.json.success === true, 'Expected success envelope for reports/treasury')
    const treasuryData = (treasuryB.json as any).data
    assert(Array.isArray(treasuryData) && treasuryData.length === 0, 'Expected empty treasury report for B')

    console.log('[security-smoke] OK')
  } finally {
    child.kill('SIGTERM')
  }
}

main().catch((e) => {
  console.error('[security-smoke] FAILED', e)
  process.exit(1)
})

