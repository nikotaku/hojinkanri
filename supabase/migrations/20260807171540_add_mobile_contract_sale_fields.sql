alter table public.mobile_contract_details
  add column if not exists sale_price bigint
    check (sale_price is null or sale_price >= 0),
  add column if not exists sale_destination text;
