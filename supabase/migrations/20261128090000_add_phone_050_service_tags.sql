-- 050番号をどのサービスに使ったかをタグで記録する。
alter table public.phone_050_numbers
  add column if not exists service_tags text[] not null default '{}'::text[];

comment on column public.phone_050_numbers.service_tags is
  'この050番号を使ったサービス名のタグ';
