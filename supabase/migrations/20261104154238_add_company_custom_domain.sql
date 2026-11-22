alter table public.companies add column custom_domain text;
comment on column public.companies.custom_domain is '法人の独自ドメイン（ホスト名）。未登録はNULL。';
