-- Minimal SaaS layer for MVP:
-- - plans: predefined plan catalog
-- - subscriptions: one active subscription per company (initially trial/active managed manually)

create extension if not exists pgcrypto;

create table if not exists plans (
  id text primary key, -- free/starter/pro
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  plan_id text not null references plans(id),
  status text not null default 'trialing', -- trialing/active/expired/cancelled/past_due
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id)
);

insert into plans (id, name, sort_order)
values
  ('free', 'مجانية', 1),
  ('starter', 'ستارتر', 2),
  ('pro', 'برو', 3)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

