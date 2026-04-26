-- RBAC v1: role templates + permissions + per-user overrides (per company)

CREATE TABLE IF NOT EXISTS "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "name" text NOT NULL,
  "is_system" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "roles"
  ADD CONSTRAINT "roles_company_id_companies_id_fk"
  FOREIGN KEY ("company_id")
  REFERENCES "public"."companies"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "roles_company_name_unique"
  ON "roles" USING btree ("company_id","name");

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" uuid NOT NULL,
  "permission_key" text NOT NULL
);

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_role_id_roles_id_fk"
  FOREIGN KEY ("role_id")
  REFERENCES "public"."roles"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_role_key_unique"
  ON "role_permissions" USING btree ("role_id","permission_key");

CREATE TABLE IF NOT EXISTS "user_permission_overrides" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "company_id" uuid NOT NULL,
  "permission_key" text NOT NULL,
  "effect" text NOT NULL,
  "reason" text,
  "created_at" timestamp DEFAULT now()
);

ALTER TABLE "user_permission_overrides"
  ADD CONSTRAINT "user_permission_overrides_user_id_users_id_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id")
  ON DELETE cascade
  ON UPDATE no action;

ALTER TABLE "user_permission_overrides"
  ADD CONSTRAINT "user_permission_overrides_company_id_companies_id_fk"
  FOREIGN KEY ("company_id")
  REFERENCES "public"."companies"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "user_permission_overrides_unique"
  ON "user_permission_overrides" USING btree ("user_id","company_id","permission_key");

