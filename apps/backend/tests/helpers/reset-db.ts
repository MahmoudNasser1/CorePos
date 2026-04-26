import { Client } from 'pg'

// Truncate all known tables between tests.
// This is a pragmatic isolation approach given the current global drizzle pool usage.
export async function resetDb(client: Client) {
  await client.query(`
    truncate table
      treasury_transactions,
      treasuries,
      invoice_items,
      invoices,
      invoice_sequences,
      product_stock,
      products,
      units,
      categories,
      suppliers,
      customers,
      warehouses,
      branches,
      subscriptions,
      profiles,
      users,
      companies,
      idempotency_keys
    restart identity cascade;
  `)
}

