-- ============================================================================
-- QUILO BACKEND (Supabase)  —  safe to run more than once
--
-- Where to run it: Supabase -> SQL Editor -> New query -> paste ALL of this -> Run
--
-- What it creates:
--   1. site_settings  – ONE shared row with the public site settings
--   2. admin_users    – the list of people allowed to change settings
--   3. Row Level Security – everyone can READ settings, only admins can CHANGE them
--   4. "branding" Storage bucket – holds the uploaded logo (public to view,
--      admins only to upload / replace / delete)
--
-- Anything stored in site_settings.data is PUBLIC (the website needs it to draw
-- itself). 
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Shared settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id          int         primary key default 1 check (id = 1),
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid        references auth.users (id) on delete set null
);

-- Guard against oversized payloads (the logo lives in Storage, not here).
alter table public.site_settings
  drop constraint if exists site_settings_data_check;
alter table public.site_settings
  add constraint site_settings_data_check
  check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 20000);

insert into public.site_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 2. Administrators
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- Nobody can read or write this table through the website's API.
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

-- Used by the database rules (and by the admin page to decide what to show).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------------
-- 3. Keep updated_at / updated_by correct automatically
-- ---------------------------------------------------------------------------
create or replace function public.touch_site_settings()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_touch_site_settings on public.site_settings;
create trigger trg_touch_site_settings
  before update on public.site_settings
  for each row execute function public.touch_site_settings();


-- ---------------------------------------------------------------------------
-- 4. Row Level Security for site_settings
--    Visitors: read only.   Admins: change the "data" column only.
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;

revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant update (data) on public.site_settings to authenticated;

drop policy if exists "settings are public to read" on public.site_settings;
create policy "settings are public to read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admins can update settings" on public.site_settings;
create policy "admins can update settings"
  on public.site_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin() and id = 1);


-- ---------------------------------------------------------------------------
-- 5. Logo storage: public bucket "branding"
--    Anyone can VIEW files (so the logo shows for every visitor).
--    Only admins can upload, replace or delete. Max 2 MB, PNG/JPEG only.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 2097152, array['image/png', 'image/jpeg'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/png', 'image/jpeg'];

drop policy if exists "branding files are public to read" on storage.objects;
create policy "branding files are public to read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'branding');

drop policy if exists "admins can upload branding files" on storage.objects;
create policy "admins can upload branding files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "admins can replace branding files" on storage.objects;
create policy "admins can replace branding files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'branding' and public.is_admin())
  with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "admins can delete branding files" on storage.objects;
create policy "admins can delete branding files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'branding' and public.is_admin());


-- ============================================================================
-- DONE. The admin setup below is a SEPARATE step — do it after you have
-- created your admin user in Supabase (Authentication -> Users -> Add user).
-- ============================================================================
--
-- Make yourself an administrator: replace the email, remove the two dashes at
-- the start of the line, and run ONLY that line in a new query.
--
-- insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com' on conflict do nothing;
--
-- To check it worked, run:   select * from public.admin_users;
