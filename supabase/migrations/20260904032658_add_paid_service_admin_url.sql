alter table public.billing_usage_details
  add column if not exists admin_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_usage_details_admin_url_check'
      and conrelid = 'public.billing_usage_details'::regclass
  ) then
    alter table public.billing_usage_details
      add constraint billing_usage_details_admin_url_check
      check (
        admin_url is null
        or (
          char_length(admin_url) <= 2000
          and admin_url ~* '^https?://'
        )
      );
  end if;
end;
$$;
