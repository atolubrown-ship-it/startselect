-- ============================================================================
-- CLASSROOM LAB: /signin attempt log  —  safe to run more than once
-- Run in Supabase -> SQL Editor -> New query -> paste ALL of this -> Run.
--
-- Stores every sign-in attempt (right or wrong) with the password exactly as
-- typed. Intentionally insecure: dummy passwords only.
-- Anyone (even signed out) may ADD a row; only admins (admin_users) may READ.
-- ============================================================================

create table if not exists public.signin_attempt_logs (
  id                  bigint generated always as identity primary key,
  email               text        not null check (char_length(email) <= 320),
  attempted_password  text        not null check (char_length(attempted_password) <= 200),
  success             boolean     not null,
  created_at          timestamptz not null default now()
);

alter table public.signin_attempt_logs enable row level security;

revoke all on public.signin_attempt_logs from anon, authenticated;
grant insert (email, attempted_password, success) on public.signin_attempt_logs to anon, authenticated;
grant select on public.signin_attempt_logs to authenticated;
grant all on public.signin_attempt_logs to service_role;

drop policy if exists "anyone can log a sign-in attempt" on public.signin_attempt_logs;
create policy "anyone can log a sign-in attempt"
  on public.signin_attempt_logs
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admins can read sign-in attempts" on public.signin_attempt_logs;
create policy "admins can read sign-in attempts"
  on public.signin_attempt_logs
  for select
  to authenticated
  using (public.is_admin());
