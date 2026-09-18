-- Notion法人一覧にあるワイモバイル回線の管理を追加する。
alter table public.mobile_contract_details
  drop constraint if exists mobile_contract_details_service_check;

alter table public.mobile_contract_details
  add constraint mobile_contract_details_service_check
  check (service in ('ドコモ', 'UQ', 'ワイモバイル'));
