-- PaidのAutoBox利用時に、会員カードの発送・発注情報を記録する。
alter table public.billing_usage_details
  add column if not exists card_delivery_address text,
  add column if not exists card_ordered_by text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_usage_details_card_delivery_address_length_check'
      and conrelid = 'public.billing_usage_details'::regclass
  ) then
    alter table public.billing_usage_details
      add constraint billing_usage_details_card_delivery_address_length_check
      check (
        card_delivery_address is null
        or char_length(card_delivery_address) <= 500
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_usage_details_card_ordered_by_length_check'
      and conrelid = 'public.billing_usage_details'::regclass
  ) then
    alter table public.billing_usage_details
      add constraint billing_usage_details_card_ordered_by_length_check
      check (
        card_ordered_by is null
        or char_length(card_ordered_by) <= 200
      );
  end if;
end;
$$;
