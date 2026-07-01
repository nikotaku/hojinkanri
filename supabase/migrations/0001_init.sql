-- 法人案件管理: 初期スキーマ
-- Supabase の SQL Editor で実行するか、Supabase CLI で適用してください。

-- UUID 生成用
create extension if not exists "pgcrypto";

-- 更新日時を自動更新するトリガー関数
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 法人(顧客)
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_kana text,
  industry text,
  contact_person text,
  email text,
  phone text,
  address text,
  status text not null default 'prospect'
    check (status in ('prospect', 'active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

-- 案件
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'on_hold', 'done', 'lost')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  assignee text,
  amount numeric(14, 2),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cases_set_updated_at
  before update on cases
  for each row execute function set_updated_at();

create index if not exists cases_company_id_idx on cases (company_id);
create index if not exists cases_status_idx on cases (status);
create index if not exists cases_due_date_idx on cases (due_date);

-- Row Level Security
-- 注意: 認証は今回スコープ外のため、anon キーでの読み書きを許可しています。
-- 認証を導入する際はこのポリシーを見直してください。
alter table companies enable row level security;
alter table cases enable row level security;

create policy "companies are accessible" on companies
  for all using (true) with check (true);

create policy "cases are accessible" on cases
  for all using (true) with check (true);
