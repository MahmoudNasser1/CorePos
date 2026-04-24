-- Idempotency storage for write endpoints (POS sale, invoices, payments).
-- Stores the response payload for a given (company_id, key) pair.

create extension if not exists pgcrypto;

create table if not exists idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  key text not null,
  request_hash text,
  response_json text,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

