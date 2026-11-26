-- 法人モバイル回線を「N台契約」にしたときの契約日を、回線（サービス）ごとに持たせる。
-- 端末ごとの契約日(mobile_contract_details.contracted_on)とは別に、
-- 折りたたんだ一覧からも契約日が見えるようにするためのもの。
alter table public.companies
  add column if not exists mobile_contracted_on jsonb not null default '{}'::jsonb;

comment on column public.companies.mobile_contracted_on is
  '法人モバイル回線の契約日 (サービス名 -> YYYY-MM-DD)';
