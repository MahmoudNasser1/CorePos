const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./apps/backend/dist/common/db/schema');
const { eq } = require('drizzle-orm');

async function main() {
  require('dotenv').config({ path: './.env.local' });
  const pool = new Pool({ connectionString: "postgres://pos:pos@localhost:5433/pos" });
  const db = drizzle(pool, { schema });
  const items = await db.query.products.findMany({
    where: eq(schema.products.id, '0d57a206-7330-4c93-a429-b7be6efa96fc'),
    with: { stock: true }
  });
  console.log(JSON.stringify(items, null, 2));
  process.exit(0);
}
main();
