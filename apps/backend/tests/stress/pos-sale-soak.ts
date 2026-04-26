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

  const port = Number(process.env.SOAK_PORT ?? process.env.STRESS_PORT ?? 4107)
  const baseUrl = `http://localhost:${port}`

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    HTTP_ACCESS_LOG: '0',
    BACKEND_PORT: String(port),
    DATABASE_URL: dbUrl,
    TEST_DATABASE_URL: dbUrl,
  }

  const child = spawn('node', ['dist/main.js'], {
    cwd: process.cwd(),
    env,
    stdio: process.env.SOAK_BACKEND_STDIO === 'inherit' ? 'inherit' : 'ignore',
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
    await pg.query(`insert into companies (id, name, phone, currency, vat_rate) values ($1,'SoakCo','000','EGP',0)`, [
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
      `insert into product_stock (id, product_id, warehouse_id, qty, avg_cost) values (gen_random_uuid(),$1,$2,'200000','10')`,
      [productId, warehouseId],
    )
    await pg.end()

    const duration = Number(process.env.SOAK_DURATION_SEC ?? 600)
    const connections = Number(process.env.SOAK_CONNECTIONS ?? 25)

    // Thresholds (commercial gating – can tune)
    const maxNon2xx = Number(process.env.SOAK_MAX_NON2XX ?? 0)
    const maxErrors = Number(process.env.SOAK_MAX_ERRORS ?? 0)
    const maxP99Ms = Number(process.env.SOAK_MAX_P99_MS ?? 1500)

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
          headers: {
            'content-type': 'application/json',
            'x-company-id': companyId,
            'x-user-id': 'soak-user',
          },
          body,
        },
        (err: unknown, res: unknown) => {
          if (err) return reject(err)
          return resolve(res)
        },
      )

      if (process.env.SOAK_TRACK === '1') {
        autocannon.track(instance, { renderProgressBar: true })
      }
    })

    // eslint-disable-next-line no-console
    console.log('[soak:pos-sale] statusCodeStats=', result?.statusCodeStats)
    // eslint-disable-next-line no-console
    console.log('[soak:pos-sale] errors=', result?.errors)

    if (result.errors > maxErrors) {
      throw new Error(`Soak run had errors: ${result.errors} (max ${maxErrors})`)
    }
    if (result.non2xx > maxNon2xx) {
      throw new Error(`Soak run had non-2xx responses: ${result.non2xx} (max ${maxNon2xx})`)
    }
    if (typeof result?.latency?.p99 === 'number' && result.latency.p99 > maxP99Ms) {
      throw new Error(`Soak run p99 too high: ${result.latency.p99}ms (max ${maxP99Ms}ms)`)
    }

    // eslint-disable-next-line no-console
    console.log(autocannon.printResult(result))
    // eslint-disable-next-line no-console
    console.log(
      `[soak:pos-sale] duration=${duration}s connections=${connections} non2xx=${result.non2xx} errors=${result.errors} p90=${result?.latency?.p90}ms p97.5=${result?.latency?.p97_5}ms p99=${result?.latency?.p99}ms`,
    )
  } finally {
    child.kill('SIGTERM')
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('[soak:pos-sale] FAILED', e)
  process.exit(1)
})

