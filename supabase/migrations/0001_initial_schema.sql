-- ============================================================
-- The Reformer Studio — Initial Schema
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text,
  last_name     text,
  email         text,
  avatar_url    text,
  language      text not null default 'fr' check (language in ('fr','en')),
  date_of_birth date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. USER PREFERENCES
create table if not exists public.user_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  goals                text[]  not null default '{}',
  experience_level     text    check (experience_level in ('beginner','intermediate','advanced')),
  weekly_frequency     int     not null default 3 check (weekly_frequency between 1 and 7),
  focus_areas          text[]  not null default '{}',
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- 3. MEASUREMENTS
create table if not exists public.measurements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg   numeric(5,2),
  waist_cm    numeric(5,2),
  hips_cm     numeric(5,2),
  chest_cm    numeric(5,2),
  thigh_cm    numeric(5,2),
  arm_cm      numeric(5,2),
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, measured_at)
);
create index if not exists measurements_user_date
  on public.measurements(user_id, measured_at desc);

-- 4. WORKOUTS
create table if not exists public.workouts (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name_fr            text not null,
  name_en            text not null,
  description_fr     text,
  description_en     text,
  duration_minutes   int  not null check (duration_minutes > 0),
  difficulty         text not null check (difficulty in ('beginner','intermediate','advanced')),
  category           text,
  estimated_calories int,
  thumbnail_url      text,
  video_url          text,
  is_premium         boolean not null default false,
  is_published       boolean not null default true,
  created_at         timestamptz not null default now()
);

-- 5. SESSIONS
create table if not exists public.sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  workout_id       uuid references public.workouts(id) on delete set null,
  completed_at     timestamptz not null default now(),
  duration_minutes int,
  calories_burned  int,
  notes            text,
  rating           int check (rating between 1 and 5),
  created_at       timestamptz not null default now()
);
create index if not exists sessions_user_date
  on public.sessions(user_id, completed_at desc);

-- 6. FAVORITES
create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, workout_id)
);

-- TRIGGERS: updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as
$func$ begin new.updated_at = now(); return new; end; $func$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.user_preferences;
create trigger set_updated_at before update on public.user_preferences
  for each row execute function public.tg_set_updated_at();

-- TRIGGER: auto-create profile + prefs on signup
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as
$func$
begin
  insert into public.profiles (id, email, first_name, last_name, language)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    coalesce(new.raw_user_meta_data->>'language', 'fr')
  );
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- ROW LEVEL SECURITY
alter table public.profiles         enable row level security;
alter table public.user_preferences enable row level security;
alter table public.measurements     enable row level security;
alter table public.sessions         enable row level security;
alter table public.favorites        enable row level security;
alter table public.workouts         enable row level security;

create policy "profiles: own"
  on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "prefs: own"
  on public.user_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "measurements: own"
  on public.measurements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sessions: own"
  on public.sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "favorites: own"
  on public.favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workouts: read published"
  on public.workouts for select to authenticated
  using (is_published = true);

-- SEED: 8 starter Pilates workouts
insert into public.workouts
  (slug, name_fr, name_en, duration_minutes, difficulty, category, estimated_calories)
values
  ('core-essentials-15', 'Core Essentials',     'Core Essentials',     15, 'beginner',     'core',      90),
  ('morning-flow-20',    'Morning Flow',         'Morning Flow',        20, 'beginner',     'full_body', 110),
  ('full-body-burn-30',  'Full Body Burn',       'Full Body Burn',      30, 'intermediate', 'full_body', 220),
  ('stretch-release-20', 'Stretch and Release',  'Stretch and Release', 20, 'beginner',     'stretching', 70),
  ('power-core-25',      'Power Core',           'Power Core',          25, 'advanced',     'core',      200),
  ('legs-glutes-30',     'Legs and Glutes',      'Legs and Glutes',     30, 'intermediate', 'strength',  240),
  ('posture-reset-15',   'Posture Reset',        'Posture Reset',       15, 'beginner',     'stretching', 60),
  ('evening-unwind-20',  'Evening Unwind',       'Evening Unwind',      20, 'beginner',     'stretching', 75)
on conflict (slug) do nothing;
