import { Client } from 'pg'
import { afterEach, beforeEach } from 'vitest'

export type TxContext = { client: Client }

export function withRollbackTx(getClient: () => Promise<Client>) {
  let client: Client | null = null

  beforeEach(async () => {
    client = await getClient()
    await client.query('BEGIN')
  })

  afterEach(async () => {
    try {
      if (client) await client.query('ROLLBACK')
    } finally {
      if (client) await client.end()
      client = null
    }
  })

  return {
    get client() {
      if (!client) throw new Error('Tx client is not initialized')
      return client
    },
  }
}

