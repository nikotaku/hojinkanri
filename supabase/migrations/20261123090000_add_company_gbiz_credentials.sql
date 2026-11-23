-- 補助金申請で使う GビズID のアカウント情報。
alter table public.companies
  add column if not exists gbiz_id text,
  add column if not exists gbiz_password text,
  add column if not exists gbiz_phone text;

comment on column public.companies.gbiz_id is 'GビズID（アカウントID。通常はメールアドレス）';
comment on column public.companies.gbiz_password is 'GビズID のパスワード';
comment on column public.companies.gbiz_phone is 'GビズID の登録電話番号';
