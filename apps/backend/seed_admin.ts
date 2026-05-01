import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { users, profiles } from './src/common/db/schema';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DATABASE_URL = "postgres://pos:pos@localhost:5433/pos";

async function seedPlatformAdmin() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  const email = 'superadmin@pos.com';
  const password = await bcrypt.hash('Admin123!', 10);
  const userId = uuidv4();

  console.log('Seeding Platform Admin...');

  try {
    await db.insert(users).values({
      id: userId,
      email,
      passwordHash: password,
    });

    await db.insert(profiles).values({
      id: userId, // Profile ID is the same as User ID in this schema
      fullName: 'Super Admin',
      role: 'platform_admin',
      isActive: true,
    });

    console.log('✅ Platform Admin seeded successfully: superadmin@pos.com / Admin123!');
  } catch (err) {
    console.error('❌ Seeding failed (user might already exist):', err.message);
  } finally {
    await client.end();
  }
}

seedPlatformAdmin();
