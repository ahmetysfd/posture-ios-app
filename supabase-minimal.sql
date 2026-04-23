-- PostureFix minimal cloud storage schema
-- Stores ONLY compact progress summaries (no photos, no raw scan keypoints).

create table if not exists public.user_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  posture_level text not null check (posture_level in ('beginner', 'intermediate', 'advanced')),
  exercise_difficulty text not null check (exercise_difficulty in ('beginner', 'medium', 'hard')),
  streak_days integer not null default 0 check (streak_days >= 0),
  total_minutes integer not null default 0 check (total_minutes >= 0),
  completed_days integer not null default 0 check (completed_days >= 0),
  latest_entry_date date,
  latest_entry_minutes integer not null default 0 check (latest_entry_minutes >= 0),
  latest_entry_exercises integer not null default 0 check (latest_entry_exercises >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_progress_snapshots enable row level security;

drop policy if exists "read own snapshot" on public.user_progress_snapshots;
create policy "read own snapshot"
  on public.user_progress_snapshots
  for select
  using (auth.uid() = user_id);

drop policy if exists "upsert own snapshot" on public.user_progress_snapshots;
create policy "upsert own snapshot"
  on public.user_progress_snapshots
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own snapshot" on public.user_progress_snapshots;
create policy "update own snapshot"
  on public.user_progress_snapshots
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own snapshot" on public.user_progress_snapshots;
create policy "delete own snapshot"
  on public.user_progress_snapshots
  for delete
  using (auth.uid() = user_id);

-- Needed for anonymous-auth users to access their own row.
grant select, insert, update, delete on public.user_progress_snapshots to authenticated;

