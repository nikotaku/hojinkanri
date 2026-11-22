-- 助成金の申請で使う労働保険・雇用保険の番号。
alter table public.companies
  add column if not exists employment_insurance_number text,
  add column if not exists labour_insurance_number text;

comment on column public.companies.employment_insurance_number is '雇用保険適用事業所番号（例 0401-633227-6）';
comment on column public.companies.labour_insurance_number is '労働保険番号（例 043-01-633227）';
