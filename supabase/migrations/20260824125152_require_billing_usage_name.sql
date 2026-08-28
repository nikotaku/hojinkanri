alter table public.billing_usage_details
  alter column usage_name set not null;

alter table public.billing_usage_details
  add constraint billing_usage_details_usage_name_check
  check (
    char_length(btrim(usage_name)) >= 1
    and char_length(btrim(usage_name)) <= 200
  );
