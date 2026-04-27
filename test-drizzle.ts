import { db } from './apps/backend/src/common/db/drizzle';
import { products } from './apps/backend/src/common/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  if (!db) return;
  const items = await db.query.products.findMany({
    where: eq(products.id, '0d57a206-7330-4c93-a429-b7be6efa96fc'),
    with: { stock: true }
  });
  console.log(JSON.stringify(items, null, 2));
  process.exit(0);
}
main();
