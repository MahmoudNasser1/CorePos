import { Client } from 'pg'
import { getTestDatabaseUrl } from './test-db'

export async function createPgClient() {
  const client = new Client({ connectionString: getTestDatabaseUrl() })
  await client.connect()
  return client
}

