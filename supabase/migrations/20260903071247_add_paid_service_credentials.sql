alter table public.billing_usage_details
  add column if not exists login_id text,
  add column if not exists login_pw text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_usage_details_login_id_length_check'
      and conrelid = 'public.billing_usage_details'::regclass
  ) then
    alter table public.billing_usage_details
      add constraint billing_usage_details_login_id_length_check
      check (login_id is null or char_length(login_id) <= 500);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_usage_details_login_pw_length_check'
      and conrelid = 'public.billing_usage_details'::regclass
  ) then
    alter table public.billing_usage_details
      add constraint billing_usage_details_login_pw_length_check
      check (login_pw is null or char_length(login_pw) <= 500);
  end if;
end;
$$;
