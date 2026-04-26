import { Client } from 'pg'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

import { ensureTestDatabase, getTestDatabaseUrl } from '../helpers/test-db'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForHealthy(baseUrl: string, timeoutMs = 20_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/v1/health`)
      if (res.ok) return
    } catch {
      // ignore
    }
    await sleep(250)
  }
  throw new Error('Backend did not become healthy in time')
}

async function main() {
  await ensureTestDatabase()
  const dbUrl = getTestDatabaseUrl()

  const port = Number(process.env.IDEMPOTENCY_PORT ?? 4108)
  const baseUrl = `http://localhost:${port}`

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    BACKEND_PORT: String(port),
    DATABASE_URL: dbUrl,
    TEST_DATABASE_URL: dbUrl,
    HTTP_ACCESS_LOG: '0',
  }

  const child = spawn('node', ['dist/main.js'], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  })

  try {
    await waitForHealthy(baseUrl)

    const companyId = randomUUID()
    const branchId = randomUUID()
    const warehouseId = randomUUID()
    const treasuryId = randomUUID()
    const productId = randomUUID()

    const pg = new Client({ connectionString: dbUrl })
    await pg.connect()
    await pg.query(`insert into companies (id, name, phone, currency, vat_rate) values ($1,'IdemCo','000','EGP',0)`, [
      companyId,
    ])
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
      `insert into product_stock (id, product_id, warehouse_id, qty, avg_cost) values (gen_random_uuid(),$1,$2,'5000','10')`,
      [productId, warehouseId],
    )
    await pg.end()

    const idempotencyKey = `idem-${Date.now()}`
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-company-id': companyId,
      'x-user-id': 'idem-user',
      'idempotency-key': idempotencyKey,
    }

    const body1 = {
      companyId,
      branchId,
      warehouseId,
      treasuryId,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 20,
      paymentMethod: 'cash',
      lines: [{ productId, quantity: 1, unitPrice: 20 }],
    }

    const body2 = {
      ...body1,
      // Conflict: same idempotency-key but different payload (but still valid invariants)
      totalAmount: 40,
      lines: [{ productId, quantity: 2, unitPrice: 20 }],
    }

    const r1 = await fetch(`${baseUrl}/v1/finance/pos-sale`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body1),
    })
    if (r1.status !== 201) {
      throw new Error(`Expected first request to be 201, got ${r1.status}: ${await r1.text()}`)
    }

    const r2 = await fetch(`${baseUrl}/v1/finance/pos-sale`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body2),
    })
    const t2 = await r2.text()

    if (r2.status !== 409) {
      throw new Error(`Expected conflict 409 on idempotency mismatch, got ${r2.status}: ${t2}`)
    }

    // eslint-disable-next-line no-console
    console.log('[idempotency-conflict] OK', { status: r2.status })
  } finally {
    child.kill('SIGTERM')
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[idempotency-conflict] FAILED', e)
  process.exit(1)
})

