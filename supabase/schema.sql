-- PostureFix — Supabase schema (run in SQL Editor)
-- See src/app/services/supabaseClient.ts for client usage.

-- 1. USER PROFILES
create table if not exists public.user_profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_id       uuid unique references auth.users(id) on delete cascade,

  age           smallint not null default 25,
  weight_kg     numeric(5,1) not null default 70.0,
  height_cm     numeric(5,1) not null default 170.0,
  gender        text not null default 'other' check (gender in ('male', 'female', 'other')),
  activity_level text not null default 'sedentary' check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  daily_screen_hours smallint not null default 6,
  has_existing_pain boolean not null default false,
  pain_areas    text[] not null default '{}',

  posture_level text not null default 'beginner' check (posture_level in ('beginner', 'intermediate', 'advanced')),
  exercise_difficulty text not null default 'beginner' check (exercise_difficulty in ('beginner', 'medium', 'hard')),

  onboarding_complete boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profiles_updated_at on public.user_profiles;
create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

-- 2. BODY SCANS
create table if not exists public.body_scans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.user_profiles(id) on delete cascade,

  photo_front_path text,
  photo_side_path  text,
  photo_back_path  text,

  posture_level text not null check (posture_level in ('beginner', 'intermediate', 'advanced')),
  severity_band text not null check (severity_band in ('mild', 'moderate', 'severe')),
  problem_count smallint not null default 0,

  keypoints_front jsonb,
  keypoints_side  jsonb,
  keypoints_back  jsonb,

  model_version text not null default 'movenet-thunder-v4',
  created_at    timestamptz not null default now()
);

create index if not exists idx_body_scans_user on public.body_scans(user_id, created_at desc);

-- 3. SCAN PROBLEMS
create table if not exists public.scan_problems (
  id            uuid primary key default gen_random_uuid(),
  scan_id       uuid not null references public.body_scans(id) on delete cascade,
  user_id       uuid not null references public.user_profiles(id) on delete cascade,

  problem_id    text not null,
  problem_name  text not null,
  body_region   text not null,
  dominant_view text not null,

  risk_category text not null check (risk_category in ('low', 'medium', 'high')),
  score         smallint not null default 0,
  detected_in_views text[] not null default '{}',
  description   text,

  created_at    timestamptz not null default now()
);

create index if not exists idx_scan_problems_scan on public.scan_problems(scan_id);
create index if not exists idx_scan_problems_user on public.scan_problems(user_id, created_at desc);

-- 4. PROGRESS SNAPSHOTS
create table if not exists public.progress_snapshots (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.user_profiles(id) on delete cascade,
  scan_id       uuid not null references public.body_scans(id) on delete cascade,

  posture_level text not null,
  problem_count smallint not null,

  high_risk_count   smallint not null default 0,
  medium_risk_count smallint not null default 0,
  low_risk_count    smallint not null default 0,

  problem_ids   text[] not null default '{}',

  created_at    timestamptz not null default now()
);

create index if not exists idx_progress_user on public.progress_snapshots(user_id, created_at desc);

-- 5. RLS
alter table public.user_profiles enable row level security;
alter table public.body_scans enable row level security;
alter table public.scan_problems enable row level security;
alter table public.progress_snapshots enable row level security;

create policy "Users read own profile"
  on public.user_profiles for select
  using (auth_id = auth.uid());

create policy "Users update own profile"
  on public.user_profiles for update
  using (auth_id = auth.uid());

create policy "Users insert own profile"
  on public.user_profiles for insert
  with check (auth_id = auth.uid());

create policy "Users read own scans"
  on public.body_scans for select
  using (user_id in (select id from public.user_profiles where auth_id = auth.uid()));

create policy "Users insert own scans"
  on public.body_scans for insert
  with check (user_id in (select id from public.user_profiles where auth_id = auth.uid()));

create policy "Users read own problems"
  on public.scan_problems for select
  using (user_id in (select id from public.user_profiles where auth_id = auth.uid()));

create policy "Users insert own problems"
  on public.scan_problems for insert
  with check (user_id in (select id from public.user_profiles where auth_id = auth.uid()));

create policy "Users read own progress"
  on public.progress_snapshots for select
  using (user_id in (select id from public.user_profiles where auth_id = auth.uid()));

create policy "Users insert own progress"
  on public.progress_snapshots for insert
  with check (user_id in (select id from public.user_profiles where auth_id = auth.uid()));

-- 6. Storage (bucket + policies)
insert into storage.buckets (id, name, public)
values ('scan-photos', 'scan-photos', false)
on conflict (id) do nothing;

create policy "Users upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'scan-photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own photos"
  on storage.objects for select
  using (
    bucket_id = 'scan-photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
