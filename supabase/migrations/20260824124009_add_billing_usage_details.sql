create table if not exists public.billing_usage_details (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  service text not null check (service in ('NPかけ払い', 'Paid')),
  usage_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_usage_details_company_service_idx
  on public.billing_usage_details (company_id, service, created_at);

create trigger billing_usage_details_set_updated_at
  before update on public.billing_usage_details
  for each row execute function set_updated_at();

alter table public.billing_usage_details enable row level security;

create policy "billing usage details are accessible"
  on public.billing_usage_details
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update, delete
  on table public.billing_usage_details
  to anon, authenticated;

grant all
  on table public.billing_usage_details
  to service_role;
