import { Client } from 'pg'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_TEST_DATABASE_URL = 'postgres://pos:pos@localhost:5433/pos'

async function runSqlFile(client: Client, filePath: string) {
  const sql = await readFile(filePath, 'utf8')
  // Migrations are written as plain SQL and are safe to run as-is.
  await client.query(sql)
}

export async function ensureTestDatabase() {
  const databaseUrl = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  const migrationsDir = join(__dirname, '..', '..', 'db', 'migrations')
  // Explicit ordering by filename prefix is relied upon.
  await runSqlFile(client, join(migrationsDir, '0001_init.sql'))
  await runSqlFile(client, join(migrationsDir, '0002_idempotency.sql'))
  await runSqlFile(client, join(migrationsDir, '0003_saas_min.sql'))

  await client.end()
}

export function getTestDatabaseUrl() {
  return process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL
}

