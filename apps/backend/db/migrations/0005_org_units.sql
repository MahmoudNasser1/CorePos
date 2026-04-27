-- Align SQL migrations with Drizzle schema: org_units + profiles.org_unit_id
-- Safe to re-run (IF NOT EXISTS / guarded constraints).

create extension if not exists pgcrypto;

create table if not exists org_units (
  id uuid primary key default gen_random_uuid() not null,
  company_id uuid not null,
  name text not null,
  parent_id uuid,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'org_units_company_id_companies_id_fk'
  ) then
    alter table org_units
      add constraint org_units_company_id_companies_id_fk
      foreign key (company_id)
      references public.companies(id)
      on delete cascade
      on update no action;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'org_units_parent_id_org_units_id_fk'
  ) then
    alter table org_units
      add constraint org_units_parent_id_org_units_id_fk
      foreign key (parent_id)
      references public.org_units(id)
      on delete set null
      on update no action;
  end if;
end $$;

create unique index if not exists org_units_company_name_unique
  on org_units using btree (company_id, name);

alter table profiles
  add column if not exists org_unit_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_org_unit_id_org_units_id_fk'
  ) then
    alter table profiles
      add constraint profiles_org_unit_id_org_units_id_fk
      foreign key (org_unit_id)
      references public.org_units(id)
      on delete set null
      on update no action;
  end if;
end $$;

