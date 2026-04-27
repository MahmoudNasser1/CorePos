-- Print templates & settings tables used by /dashboard/settings/printing
-- Safe to re-run (IF NOT EXISTS / guarded constraints + indexes).

create extension if not exists pgcrypto;

create table if not exists print_templates (
  id uuid primary key default gen_random_uuid() not null,
  company_id uuid not null,
  type text not null,
  name text not null,
  content_html text not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'print_templates_company_id_companies_id_fk'
  ) then
    alter table print_templates
      add constraint print_templates_company_id_companies_id_fk
      foreign key (company_id)
      references public.companies(id)
      on delete cascade
      on update no action;
  end if;
end $$;

create table if not exists print_settings (
  id uuid primary key default gen_random_uuid() not null,
  company_id uuid not null,
  document_type text not null,
  paper_size text not null,
  printer_name text,
  template_id uuid,
  margin_config text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'print_settings_company_id_companies_id_fk'
  ) then
    alter table print_settings
      add constraint print_settings_company_id_companies_id_fk
      foreign key (company_id)
      references public.companies(id)
      on delete cascade
      on update no action;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'print_settings_template_id_print_templates_id_fk'
  ) then
    alter table print_settings
      add constraint print_settings_template_id_print_templates_id_fk
      foreign key (template_id)
      references public.print_templates(id)
      on delete set null
      on update no action;
  end if;
end $$;

create unique index if not exists print_settings_company_doc_unique
  on print_settings using btree (company_id, document_type);

