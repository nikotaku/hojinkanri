alter table public.companies
  add column if not exists billing_unavailable_reason jsonb not null default '{}'::jsonb;

-- トリガー関数が呼び出し元の検索パスに影響されないよう固定する。
alter function public.set_updated_at() set search_path = '';
