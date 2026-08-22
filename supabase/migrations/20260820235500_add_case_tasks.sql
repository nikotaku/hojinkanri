-- 案件ごとの小タスク
create table if not exists case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists case_tasks_case_id_sort_order_idx
  on case_tasks (case_id, sort_order);

create trigger case_tasks_set_updated_at
  before update on case_tasks
  for each row execute function set_updated_at();

alter table case_tasks enable row level security;

-- 既存アプリと同じアクセス方式。認証導入時に案件テーブルと一緒に見直す。
create policy "case tasks are accessible" on case_tasks
  for all using (true) with check (true);
