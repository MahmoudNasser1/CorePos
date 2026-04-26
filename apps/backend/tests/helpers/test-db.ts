import { Client } from 'pg'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const DEFAULT_TEST_DATABASE_BASE_URL = 'postgres://pos:pos@localhost:5433/postgres'

async function runSqlFile(client: Client, filePath: string) {
  const sql = await readFile(filePath, 'utf8')
  // Drizzle migrations use the "--> statement-breakpoint" marker.
  const statements = sql
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean)

  for (const stmt of statements) {
    await client.query(stmt)
  }
}

async function runSupplementalSchema(client: Client) {
  await client.query(`create extension if not exists pgcrypto;`)

  // Idempotency keys (matches src/common/db/schema.ts)
  await client.query(`
    create table if not exists idempotency_keys (
      id uuid primary key default gen_random_uuid(),
      company_id uuid not null,
      key text not null,
      request_hash text,
      response_json text,
      created_at timestamptz not null default now(),
      unique (company_id, key)
    );
  `)

  // Minimal SaaS tables (matches src/common/db/schema.ts)
  await client.query(`
    create table if not exists plans (
      id text primary key,
      name text not null,
      sort_order int not null default 0,
      created_at timestamptz not null default now()
    );
  `)

  await client.query(`
    create table if not exists subscriptions (
      id uuid primary key default gen_random_uuid(),
      company_id uuid not null references companies(id) on delete cascade,
      plan_id text not null references plans(id),
      status text not null default 'trialing',
      current_period_end timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (company_id)
    );
  `)

  await client.query(`
    insert into plans (id, name, sort_order)
    values
      ('free', 'مجانية', 1),
      ('starter', 'ستارتر', 2),
      ('pro', 'برو', 3)
    on conflict (id) do update set
      name = excluded.name,
      sort_order = excluded.sort_order;
  `)
}

let cachedTestDatabaseUrl: string | null = null
let cachedDbName: string | null = null

export function getTestDatabaseUrl() {
  if (!cachedTestDatabaseUrl) {
    throw new Error('Test database URL is not initialized. Call ensureTestDatabase() first.')
  }
  return cachedTestDatabaseUrl
}

export async function ensureTestDatabase() {
  if (cachedTestDatabaseUrl) return

  const baseUrl = process.env.TEST_DATABASE_BASE_URL ?? DEFAULT_TEST_DATABASE_BASE_URL
  const admin = new Client({ connectionString: baseUrl })
  await admin.connect()

  const dbName = `pos_test_${randomUUID().replace(/-/g, '')}`
  await admin.query(`create database ${dbName}`)

  cachedDbName = dbName
  cachedTestDatabaseUrl = baseUrl.replace(/\/[^/]+$/, `/${dbName}`)

  await admin.end()

  const client = new Client({ connectionString: cachedTestDatabaseUrl })
  await client.connect()

  const drizzleMigrationsDir = join(__dirname, '..', '..', 'drizzle')
  await runSqlFile(client, join(drizzleMigrationsDir, '0000_furry_marrow.sql'))
  await runSqlFile(client, join(drizzleMigrationsDir, '0001_company_country_timezone.sql'))
  await runSqlFile(client, join(drizzleMigrationsDir, '0002_company_default_branch.sql'))
  await runSqlFile(client, join(drizzleMigrationsDir, '0003_profile_quick_start_dismissed.sql'))
  await runSupplementalSchema(client)

  await client.end()

  // Make it available for drizzle.ts (which reads env at import time in some places).
  process.env.TEST_DATABASE_URL = cachedTestDatabaseUrl
}

export async function dropTestDatabase() {
  if (!cachedDbName) return

  const baseUrl = process.env.TEST_DATABASE_BASE_URL ?? DEFAULT_TEST_DATABASE_BASE_URL
  const admin = new Client({ connectionString: baseUrl })
  await admin.connect()

  await admin.query(
    `
    select pg_terminate_backend(pid)
    from pg_stat_activity
    where datname = $1 and pid <> pg_backend_pid()
  `,
    [cachedDbName],
  )
  await admin.query(`drop database if exists ${cachedDbName}`)

  await admin.end()

  cachedTestDatabaseUrl = null
  cachedDbName = null
}

