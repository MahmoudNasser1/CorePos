ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "country_code" text DEFAULT 'EG';
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'Africa/Cairo';
