-- Notion「法人一覧」の未移植情報を、法人ごとの編集可能な台帳として保存する。
alter table public.companies
  add column if not exists corporate_number text,
  add column if not exists incorporation_filing_status text,
  add column if not exists payment_target_on date;

create table if not exists public.company_registry_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  property_key text not null,
  label text not null,
  category text not null default 'その他',
  value jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, property_key)
);

create index if not exists company_registry_entries_company_id_idx
  on public.company_registry_entries(company_id);

alter table public.company_registry_entries enable row level security;

drop policy if exists "company registry entries are accessible"
  on public.company_registry_entries;

create policy "company registry entries are accessible"
  on public.company_registry_entries
  for all using (true) with check (true);

drop trigger if exists company_registry_entries_set_updated_at
  on public.company_registry_entries;

create trigger company_registry_entries_set_updated_at
  before update on public.company_registry_entries
  for each row execute function public.set_updated_at();
