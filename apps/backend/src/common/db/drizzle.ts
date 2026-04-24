import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL

const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null

export const db = pool ? drizzle(pool, { schema }) : null
