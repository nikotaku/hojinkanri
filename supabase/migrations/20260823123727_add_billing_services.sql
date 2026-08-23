alter table public.companies
  add column if not exists billing jsonb not null default '{}'::jsonb,
  add column if not exists billing_phone jsonb not null default '{}'::jsonb,
  add column if not exists billing_email jsonb not null default '{}'::jsonb,
  add column if not exists billing_name jsonb not null default '{}'::jsonb,
  add column if not exists billing_admin_url jsonb not null default '{}'::jsonb,
  add column if not exists billing_login_id jsonb not null default '{}'::jsonb,
  add column if not exists billing_login_pw jsonb not null default '{}'::jsonb;
