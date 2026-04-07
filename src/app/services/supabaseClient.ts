/**
 * Supabase client + DB helpers.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example).
 * Without them, the app runs fully offline; cloud save is skipped.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IntendedView, PostureLevel, RiskCategory, SeverityBand } from '../types/assessment';

export type { RiskCategory, PostureLevel, SeverityBand, IntendedView };

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = (): boolean =>
  Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_ANON'));

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(url, key)
  : null;

export interface DBUserProfile {
  id: string;
  auth_id: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  gender: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active';
  daily_screen_hours: number;
  has_existing_pain: boolean;
  pain_areas: string[];
  posture_level: PostureLevel;
  exercise_difficulty: 'beginner' | 'medium' | 'hard';
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBBodyScan {
  id: string;
  user_id: string;
  photo_front_path: string | null;
  photo_side_path: string | null;
  photo_back_path: string | null;
  posture_level: PostureLevel;
  severity_band: SeverityBand;
  problem_count: number;
  keypoints_front: object | null;
  keypoints_side: object | null;
  keypoints_back: object | null;
  model_version: string;
  created_at: string;
}

export interface DBScanProblem {
  id: string;
  scan_id: string;
  user_id: string;
  problem_id: string;
  problem_name: string;
  body_region: string;
  dominant_view: string;
  risk_category: RiskCategory;
  score: number;
  detected_in_views: string[];
  description: string | null;
  created_at: string;
}

export interface DBProgressSnapshot {
  id: string;
  user_id: string;
  scan_id: string;
  posture_level: PostureLevel;
  problem_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  problem_ids: string[];
  created_at: string;
}

export async function upsertUserProfile(
  authId: string,
  data: Partial<Omit<DBUserProfile, 'id' | 'auth_id' | 'created_at' | 'updated_at'>>,
): Promise<DBUserProfile | null> {
  if (!supabase) return null;
  const { data: result, error } = await supabase
    .from('user_profiles')
    .upsert({ auth_id: authId, ...data }, { onConflict: 'auth_id' })
    .select()
    .single();

  if (error) {
    console.error('upsertUserProfile:', error);
    return null;
  }
  return result;
}

export async function getUserProfile(authId: string): Promise<DBUserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error) return null;
  return data;
}

export async function saveScanResults(params: {
  userId: string;
  photos: { front?: string; side?: string; back?: string };
  keypoints: { front?: object; side?: object; back?: object };
  postureLevel: PostureLevel;
  severityBand: SeverityBand;
  problems: Array<{
    problem_id: string;
    problem_name: string;
    body_region: string;
    dominant_view: string;
    risk_category: RiskCategory;
    score: number;
    detected_in_views: string[];
    description: string;
  }>;
}): Promise<{ scanId: string } | null> {
  if (!supabase) return null;
  const { userId, photos, keypoints, postureLevel, severityBand, problems } = params;

  const { data: scan, error: scanErr } = await supabase
    .from('body_scans')
    .insert({
      user_id: userId,
      photo_front_path: photos.front ?? null,
      photo_side_path: photos.side ?? null,
      photo_back_path: photos.back ?? null,
      posture_level: postureLevel,
      severity_band: severityBand,
      problem_count: problems.length,
      keypoints_front: keypoints.front ?? null,
      keypoints_side: keypoints.side ?? null,
      keypoints_back: keypoints.back ?? null,
      model_version: 'movenet-thunder-v4',
    })
    .select('id')
    .single();

  if (scanErr || !scan) {
    console.error('saveScan:', scanErr);
    return null;
  }

  if (problems.length > 0) {
    const rows = problems.map((p) => ({
      scan_id: scan.id,
      user_id: userId,
      ...p,
    }));

    const { error: probErr } = await supabase.from('scan_problems').insert(rows);
    if (probErr) console.error('saveProblems:', probErr);
  }

  const highCount = problems.filter((p) => p.risk_category === 'high').length;
  const medCount = problems.filter((p) => p.risk_category === 'medium').length;
  const lowCount = problems.filter((p) => p.risk_category === 'low').length;

  await supabase.from('progress_snapshots').insert({
    user_id: userId,
    scan_id: scan.id,
    posture_level: postureLevel,
    problem_count: problems.length,
    high_risk_count: highCount,
    medium_risk_count: medCount,
    low_risk_count: lowCount,
    problem_ids: problems.map((p) => p.problem_id),
  });

  await supabase.from('user_profiles').update({ posture_level: postureLevel }).eq('id', userId);

  return { scanId: scan.id };
}

export async function getScanHistory(userId: string, limit = 20): Promise<DBProgressSnapshot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('progress_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getScanHistory:', error);
    return [];
  }
  return data ?? [];
}

export async function getScanProblems(scanId: string): Promise<DBScanProblem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('scan_problems')
    .select('*')
    .eq('scan_id', scanId)
    .order('score', { ascending: false });

  if (error) {
    console.error('getScanProblems:', error);
    return [];
  }
  return data ?? [];
}

/** Upload scan JPEG; path must start with auth user id for RLS (use session user id). */
export async function uploadScanPhoto(
  authUserId: string,
  scanId: string,
  view: IntendedView,
  dataUrl: string,
): Promise<string | null> {
  if (!supabase) return null;
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const path = `${authUserId}/${scanId}/${view}.jpg`;

  const { error } = await supabase.storage
    .from('scan-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) {
    console.error('uploadPhoto:', error);
    return null;
  }
  return path;
}
