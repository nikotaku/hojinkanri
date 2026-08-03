alter table if exists public.companies
  add column if not exists representative_name text,
  add column if not exists established_on date,
  add column if not exists capital numeric(16, 0)
    check (capital is null or capital >= 0);
