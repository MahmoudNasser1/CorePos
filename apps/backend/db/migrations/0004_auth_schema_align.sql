-- Align SQL-based migrations with Drizzle schema used by the backend code.
-- This migration is designed to be safe to re-run (IF NOT EXISTS / guarded constraints).

create extension if not exists pgcrypto;

-- 1) companies: make inserts from AuthService possible (id defaults, slug/phone optional)
alter table companies
  alter column id set default gen_random_uuid();

-- Existing baseline required slug/phone; backend register doesn't provide slug and may omit phone.
alter table companies
  alter column slug drop not null,
  alter column phone drop not null;

-- Add missing columns used by the Drizzle schema (optional / defaults)
alter table companies add column if not exists name_en text;
alter table companies add column if not exists logo_url text;
alter table companies add column if not exists email text;
alter table companies add column if not exists tax_number text;
alter table companies add column if not exists default_branch_id uuid;
alter table companies add column if not exists country_code text default 'EG';
alter table companies add column if not exists timezone text default 'Africa/Cairo';

-- 2) users table (required for /auth/register)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- 3) profiles: add missing columns & backfill full_name
alter table profiles add column if not exists full_name text;
update profiles set full_name = coalesce(full_name, 'Owner') where full_name is null;
alter table profiles alter column full_name set not null;

alter table profiles add column if not exists branch_id uuid;
alter table profiles add column if not exists is_active boolean not null default true;
alter table profiles add column if not exists updated_at timestamptz not null default now();

-- Ensure profiles.id references users.id (Drizzle expects a 1:1 keyed by user id)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_fkey_users'
  ) then
    alter table profiles
      add constraint profiles_id_fkey_users
      foreign key (id)
      references users(id)
      on delete cascade;
  end if;
end $$;

