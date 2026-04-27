-- Payment methods reference table used by POS/finance
-- Safe to re-run (IF NOT EXISTS / guarded constraints + indexes).

create extension if not exists pgcrypto;

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid() not null,
  company_id uuid not null,
  code text not null,
  name text not null,
  is_active boolean default true,
  sort_order integer default 0 not null,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_methods_company_id_companies_id_fk'
  ) then
    alter table payment_methods
      add constraint payment_methods_company_id_companies_id_fk
      foreign key (company_id)
      references public.companies(id)
      on delete cascade
      on update no action;
  end if;
end $$;

create unique index if not exists payment_methods_company_code_unique
  on payment_methods using btree (company_id, code);

