-- ============================================================
-- The Reformer Studio — Google Sheets Sync
-- ============================================================
-- SETUP : avant d'exécuter, remplace les 2 valeurs ci-dessous :
--
--   1. APPS_SCRIPT_URL : l'URL de déploiement de ton Apps Script
--      (format : https://script.google.com/macros/s/AKfy.../exec)
--
--   2. SECRET_TOKEN : le même mot de passe que dans le script Google
--      (ex: 'pilates2024!')
-- ============================================================

-- Active l'extension HTTP (intégrée à Supabase, gratuite)
create extension if not exists "pg_net";

-- ── 1. Sync email + nom à l'inscription ──────────────────────
create or replace function public.sync_new_user_to_sheets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  apps_script_url text := 'APPS_SCRIPT_URL';  -- ← REMPLACE
  secret_token    text := 'SECRET_TOKEN';      -- ← REMPLACE
begin
  perform net.http_post(
    url     := apps_script_url,
    body    := jsonb_build_object(
      'secret',    secret_token,
      'event',     'signup',
      'email',     new.email,
      'firstName', coalesce(new.first_name, ''),
      'lastName',  coalesce(new.last_name, ''),
      'language',  coalesce(new.language, 'fr')
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$;

drop trigger if exists sync_user_signup_to_sheets on public.profiles;
create trigger sync_user_signup_to_sheets
  after insert on public.profiles
  for each row
  execute function public.sync_new_user_to_sheets();

-- ── 2. Sync objectifs quand onboarding terminé ────────────────
create or replace function public.sync_onboarding_to_sheets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  apps_script_url text := 'APPS_SCRIPT_URL';  -- ← REMPLACE
  secret_token    text := 'SECRET_TOKEN';      -- ← REMPLACE
  user_email      text;
  user_first      text;
  user_last       text;
begin
  -- On n'agit que quand onboarding passe à true
  if new.onboarding_completed = true and (old.onboarding_completed = false or old.onboarding_completed is null) then
    -- Récupère l'email depuis profiles
    select email, first_name, last_name
    into user_email, user_first, user_last
    from public.profiles
    where id = new.user_id;

    perform net.http_post(
      url     := apps_script_url,
      body    := jsonb_build_object(
        'secret',    secret_token,
        'event',     'onboarding',
        'email',     user_email,
        'firstName', coalesce(user_first, ''),
        'lastName',  coalesce(user_last, ''),
        'goals',     new.goals,
        'level',     coalesce(new.experience_level, ''),
        'frequency', new.weekly_frequency
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  end if;
  return new;
end;
$$;

drop trigger if exists sync_onboarding_to_sheets on public.user_preferences;
create trigger sync_onboarding_to_sheets
  after update on public.user_preferences
  for each row
  execute function public.sync_onboarding_to_sheets();
