-- Initial backend migration baseline.
-- This is intentionally minimal and will be expanded phase-by-phase.

create table if not exists companies (
  id uuid primary key,
  name text not null,
  slug text not null unique,
  phone text not null,
  address text,
  currency text not null default 'EGP',
  vat_rate numeric(5,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key,
  company_id uuid references companies(id),
  role text not null default 'owner',
  created_at timestamptz not null default now()
);
