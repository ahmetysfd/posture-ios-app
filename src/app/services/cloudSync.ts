import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getDailyStats, loadProgressLog } from './DailyProgram';
import { loadUserProfile } from './UserProfile';

let lastFingerprint = '';

function createFingerprint(): string {
  const profile = loadUserProfile();
  const progress = loadProgressLog();
  const stats = getDailyStats();
  const latestDate = progress.length > 0 ? progress[progress.length - 1].date : '';
  const completedDays = progress.filter((p) => p.fullyCompleted).length;
  return [
    latestDate,
    progress.length,
    completedDays,
    stats.streak,
    stats.totalMinutes,
    profile?.postureLevel ?? 'unknown',
  ].join('|');
}

function compactPayload() {
  const profile = loadUserProfile();
  const progress = loadProgressLog();
  const stats = getDailyStats();
  const completedDays = progress.filter((p) => p.fullyCompleted).length;
  const last = progress.length > 0 ? progress[progress.length - 1] : null;

  return {
    posture_level: profile?.postureLevel ?? 'beginner',
    exercise_difficulty: profile?.exerciseDifficulty ?? 'beginner',
    streak_days: stats.streak,
    total_minutes: Math.round(stats.totalMinutes),
    completed_days: completedDays,
    latest_entry_date: last?.date ?? null,
    latest_entry_minutes: last?.minutesCompleted ?? 0,
    latest_entry_exercises: last?.exerciseCount ?? 0,
    updated_at: new Date().toISOString(),
  };
}

async function ensureAnonymousUser(): Promise<string | null> {
  if (!supabase) return null;

  const { data: current } = await supabase.auth.getUser();
  if (current.user?.id) return current.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('[cloud-sync] anonymous sign-in failed:', error.message);
    return null;
  }
  return data.user?.id ?? null;
}

export async function syncCloudProgress(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const nextFingerprint = createFingerprint();
  if (nextFingerprint === lastFingerprint) return;

  const userId = await ensureAnonymousUser();
  if (!userId) return;

  const payload = compactPayload();
  const { error } = await supabase
    .from('user_progress_snapshots')
    .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id' });

  if (error) {
    console.warn('[cloud-sync] upsert failed:', error.message);
    return;
  }
  lastFingerprint = nextFingerprint;
}

