-- 案件詳細の小タスクとバックログ
-- 既に 0001_init.sql を適用済みの環境では、このファイルを追加で適用してください。

create table if not exists case_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_tasks_set_updated_at
  before update on case_tasks
  for each row execute function set_updated_at();

create index if not exists case_tasks_case_id_idx on case_tasks (case_id);
create index if not exists case_tasks_open_idx on case_tasks (case_id, is_completed);

create table if not exists case_backlogs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);

create index if not exists case_backlogs_case_id_idx on case_backlogs (case_id);

-- 0001_init.sql と同様に、現段階では anon キーでの操作を許可する。
alter table case_tasks enable row level security;
alter table case_backlogs enable row level security;

create policy "case tasks are accessible" on case_tasks
  for all using (true) with check (true);

create policy "case backlogs are accessible" on case_backlogs
  for all using (true) with check (true);
