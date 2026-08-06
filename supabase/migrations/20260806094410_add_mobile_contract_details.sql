create table if not exists public.mobile_contract_details (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  service text not null check (service in ('ドコモ', 'UQ')),
  device_model text,
  contract_person text,
  contracted_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mobile_contract_details_company_service_idx
  on public.mobile_contract_details (company_id, service, created_at);

create trigger mobile_contract_details_set_updated_at
  before update on public.mobile_contract_details
  for each row execute function set_updated_at();

alter table public.mobile_contract_details enable row level security;

create policy "mobile contract details are accessible"
  on public.mobile_contract_details
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update, delete
  on table public.mobile_contract_details
  to anon, authenticated;

grant all
  on table public.mobile_contract_details
  to service_role;
