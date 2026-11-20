-- 050番号台帳とアイブリー申込の関連テーブル。
-- 本番DBには create_050_number_management として適用済み。
-- 個人情報保護のため RLS を有効化し、認証済み利用者だけに操作を許可。
create table if not exists public.phone_050_numbers (
 id uuid primary key default gen_random_uuid(),
 phone_number text not null unique check (phone_number ~ '^050[0-9]{8}$'),
 provider text, purchased_on date,
 monthly_cost numeric(12,2) check (monthly_cost is null or monthly_cost>=0),
 contract_company_id uuid references public.companies(id) on delete set null,
 status text not null default 'available' check (status in ('available','applying','active','suspended','cancelled')),
 notes text, created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.phone_050_ivry_applications (
 id uuid primary key default gen_random_uuid(),
 phone_id uuid not null references public.phone_050_numbers(id) on delete cascade,
 company_id uuid references public.companies(id) on delete set null,
 application_date date not null default current_date,
 status text not null default 'submitted' check (status in ('draft','submitted','reviewing','approved','rejected','activated','cancelled')),
 ivry_account text,ivry_management_url text,application_reference text,activated_on date,
 notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists phone_050_applications_phone_idx on public.phone_050_ivry_applications(phone_id,created_at desc);
create index if not exists phone_050_applications_company_idx on public.phone_050_ivry_applications(company_id);
create unique index if not exists phone_050_one_open_ivry_application on public.phone_050_ivry_applications(phone_id) where status in ('draft','submitted','reviewing','approved','activated');
alter table public.phone_050_numbers enable row level security;
alter table public.phone_050_ivry_applications enable row level security;
grant select,insert,update,delete on public.phone_050_numbers,public.phone_050_ivry_applications to authenticated;
drop policy if exists "authenticated users manage phone numbers" on public.phone_050_numbers;
drop policy if exists "authenticated users manage ivry applications" on public.phone_050_ivry_applications;
create policy "authenticated users manage phone numbers" on public.phone_050_numbers for all to authenticated using (true) with check (true);
create policy "authenticated users manage ivry applications" on public.phone_050_ivry_applications for all to authenticated using (true) with check (true);
