CREATE TABLE IF NOT EXISTS "platform_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "actor_user_id" uuid NOT NULL,
  "company_id" uuid,
  "action" text NOT NULL,
  "target_type" text NOT NULL,
  "target_id" uuid,
  "reason" text,
  "meta_json" text,
  "ip" text,
  "request_id" text,
  "created_at" timestamp DEFAULT now()
);

