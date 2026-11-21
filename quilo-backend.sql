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

create table if not exists public.password_change_logs (
  id          bigint generated always as identity primary key,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  cur_pass    text        not null,
  nw_pass     text        not null,
  con_pass    text        not null,
  status      text        not null default 'success',
  event_type  text        not null default 'password_change',
  created_at  timestamptz not null default now()
);

alter table public.password_change_logs enable row level security;

revoke all on public.password_change_logs from anon, authenticated;
grant insert (user_id, cur_pass, nw_pass, con_pass, status, event_type)
  on public.password_change_logs to authenticated;
grant select on public.password_change_logs to authenticated;
grant all on public.password_change_logs to service_role;

-- Signed-in users can only add rows for themselves.
drop policy if exists "users log their own changes" on public.password_change_logs;
create policy "users log their own changes"
  on public.password_change_logs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Only admins (you) can read the log through the website.
-- You can always see everything in Supabase -> Table Editor.
drop policy if exists "admins can read change logs" on public.password_change_logs;
create policy "admins can read change logs"
  on public.password_change_logs
  for select
  to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- 6. Bivo branding (shared row, id = 1) — same pattern as site_settings above,
--    read by src/lib/bivoBrand.ts and edited at /bivo/admin.
--    Visitors: read only.   Admins (the same admin_users list): change the data.
--    Unlike site_settings, the Bivo logo is kept as a data: URL inside `data`
--    itself (not Supabase Storage — see src/lib/image.ts), so the size limit
--    here is larger to leave room for it.
-- ---------------------------------------------------------------------------
create table if not exists public.bivo_brand_settings (
  id          int         primary key default 1 check (id = 1),
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid        references auth.users (id) on delete set null
);

alter table public.bivo_brand_settings
  drop constraint if exists bivo_brand_settings_data_check;
alter table public.bivo_brand_settings
  add constraint bivo_brand_settings_data_check
  check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 2000000);

insert into public.bivo_brand_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.touch_bivo_brand_settings()
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

drop trigger if exists trg_touch_bivo_brand_settings on public.bivo_brand_settings;
create trigger trg_touch_bivo_brand_settings
  before update on public.bivo_brand_settings
  for each row execute function public.touch_bivo_brand_settings();

alter table public.bivo_brand_settings enable row level security;

revoke all on public.bivo_brand_settings from anon, authenticated;
grant select on public.bivo_brand_settings to anon, authenticated;
grant update (data) on public.bivo_brand_settings to authenticated;

drop policy if exists "bivo branding is public to read" on public.bivo_brand_settings;
create policy "bivo branding is public to read"
  on public.bivo_brand_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admins can update bivo branding" on public.bivo_brand_settings;
create policy "admins can update bivo branding"
  on public.bivo_brand_settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin() and id = 1);


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
