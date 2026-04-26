import { Client } from 'pg'
import { randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'

// autocannon is installed in root devDependencies
// eslint-disable-next-line @typescript-eslint/no-var-requires
const autocannon = require('autocannon')

import { ensureTestDatabase, getTestDatabaseUrl } from '../helpers/test-db'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
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
  await ensureTestDatabase()
  const dbUrl = getTestDatabaseUrl()

  const port = Number(process.env.STRESS_PORT ?? 4106)
  const baseUrl = `http://localhost:${port}`

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    BACKEND_PORT: String(port),
    DATABASE_URL: dbUrl,
    TEST_DATABASE_URL: dbUrl,
  }

  const child = spawn('node', ['dist/main.js'], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  })

  try {
    await waitForHealthy(baseUrl)

    // Seed minimal company defaults + product stock
    const companyId = randomUUID()
    const branchId = randomUUID()
    const warehouseId = randomUUID()
    const treasuryId = randomUUID()
    const productId = randomUUID()

    const pg = new Client({ connectionString: dbUrl })
    await pg.connect()
    await pg.query(`insert into companies (id, name, phone, currency, vat_rate) values ($1,'StressCo','000','EGP',0)`, [
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

    const duration = Number(process.env.STRESS_DURATION_SEC ?? 10)
    const connections = Number(process.env.STRESS_CONNECTIONS ?? 25)

    const body = JSON.stringify({
      companyId,
      branchId,
      warehouseId,
      treasuryId,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 20,
      paymentMethod: 'cash',
      lines: [{ productId, quantity: 1, unitPrice: 20 }],
    })

    const result = await new Promise<any>((resolve, reject) => {
      const instance = autocannon(
        {
          url: `${baseUrl}/v1/finance/pos-sale`,
          method: 'POST',
          connections,
          duration,
          percentiles: [50, 90, 95, 97.5, 99],
          headers: {
            'content-type': 'application/json',
            'x-company-id': companyId,
            'x-user-id': 'stress-user',
          },
          body,
        },
        (err: unknown, res: unknown) => {
          if (err) return reject(err)
          return resolve(res)
        },
      )

      autocannon.track(instance, { renderProgressBar: true })
    })

    // Basic acceptance checks
    if (result.errors > 0) {
      throw new Error(`Stress run had errors: ${result.errors}`)
    }
    if (result.non2xx > 0) {
      throw new Error(`Stress run had non-2xx responses: ${result.non2xx}`)
    }

    // Print summary
    // eslint-disable-next-line no-console
    console.log(autocannon.printResult(result))

    // Autocannon exposes a fixed set of latency percentiles (not p95 by default).
    const p90 = result?.latency?.p90
    const p97_5 = result?.latency?.p97_5
    const p99 = result?.latency?.p99
    // eslint-disable-next-line no-console
    console.log(
      `[stress:pos-sale] p90=${p90 ?? 'n/a'}ms p97.5=${p97_5 ?? 'n/a'}ms p99=${p99 ?? 'n/a'}ms non2xx=${result?.non2xx} errors=${result?.errors}`,
    )
  } finally {
    child.kill('SIGTERM')
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[stress:pos-sale] FAILED', e)
  process.exit(1)
})

