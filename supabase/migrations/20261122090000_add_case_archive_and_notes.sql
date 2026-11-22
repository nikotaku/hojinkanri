-- 案件のアーカイブと、詳細ページに出す「次にやるべきこと」「準備物」。
-- archived_at が入っている案件は一覧から外し、アーカイブ側に表示する。
alter table public.cases
  add column if not exists archived_at timestamptz,
  add column if not exists next_action text,
  add column if not exists materials text;

create index if not exists cases_archived_at_idx
  on public.cases (archived_at);

comment on column public.cases.archived_at is '終わった案件をアーカイブした日時。null なら進行中の一覧に出る';
comment on column public.cases.next_action is '次にやるべきこと。未入力なら未完了の小タスクの先頭を表示する';
comment on column public.cases.materials is '準備物。1行につき1つ';
