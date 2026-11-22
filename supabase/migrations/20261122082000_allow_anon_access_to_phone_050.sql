-- 050番号台帳を anon からも読み書きできるようにする。
--
-- 0002_phone_050.sql では RLS を authenticated だけに許可していたが、
-- このアプリにログイン機能はなく、常に anon キーで接続している。
-- そのため一覧は常に空になり、登録は
--   new row violates row-level security policy for table "phone_050_numbers"
-- で落ちて /phone-050 がエラー画面になっていた。
--
-- companies や mobile_contract_details など他のテーブルは anon にも
-- 許可しているので、それに合わせる。
-- （閲覧を本当に絞るならアプリ全体にログインを入れる必要がある。
--   本人しか見ない運用のためログインは入れない方針）
--
-- 元の "authenticated users manage phone numbers" /
-- "authenticated users manage ivry applications" は残している。
-- 下のポリシーが同じ範囲を許可しているので重複するだけで害はない。

grant select, insert, update, delete
  on public.phone_050_numbers, public.phone_050_ivry_applications
  to anon;

drop policy if exists "phone 050 numbers are accessible"
  on public.phone_050_numbers;
drop policy if exists "phone 050 ivry applications are accessible"
  on public.phone_050_ivry_applications;

create policy "phone 050 numbers are accessible"
  on public.phone_050_numbers
  for all to anon, authenticated
  using (true) with check (true);

create policy "phone 050 ivry applications are accessible"
  on public.phone_050_ivry_applications
  for all to anon, authenticated
  using (true) with check (true);
