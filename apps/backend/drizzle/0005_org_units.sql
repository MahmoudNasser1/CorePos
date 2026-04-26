CREATE TABLE IF NOT EXISTS "org_units" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "name" text NOT NULL,
  "parent_id" uuid,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "org_units"
  ADD CONSTRAINT "org_units_company_id_companies_id_fk"
  FOREIGN KEY ("company_id")
  REFERENCES "public"."companies"("id")
  ON DELETE cascade
  ON UPDATE no action;

ALTER TABLE "org_units"
  ADD CONSTRAINT "org_units_parent_id_org_units_id_fk"
  FOREIGN KEY ("parent_id")
  REFERENCES "public"."org_units"("id")
  ON DELETE set null
  ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "org_units_company_name_unique"
  ON "org_units" USING btree ("company_id","name");

ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "org_unit_id" uuid;

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_org_unit_id_org_units_id_fk"
  FOREIGN KEY ("org_unit_id")
  REFERENCES "public"."org_units"("id")
  ON DELETE set null
  ON UPDATE no action;
