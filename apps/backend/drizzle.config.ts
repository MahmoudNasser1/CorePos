import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/common/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://pos:pos@localhost:5433/pos',
  },
});
