/**
 * Local scan log + optional Supabase cloud save (requires Auth + user_profiles row).
 */
import { supabase, saveScanResults, getUserProfile, isSupabaseConfigured } from './supabaseClient';
import type { ScanReport } from './PostureAnalysisEngineV2';

const LOCAL_LOG_KEY = 'posturefix_local_scan_log';

export interface LocalScanEntry {
  savedAt: number;
  postureLevel: string;
  severityBand: string;
  problemIds: string[];
  riskSummary: { high: number; medium: number; low: number };
  modelVersion: string;
}

export function appendLocalScanLog(entry: LocalScanEntry): void {
  try {
    const prev = JSON.parse(localStorage.getItem(LOCAL_LOG_KEY) || '[]') as LocalScanEntry[];
    prev.unshift(entry);
    localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(prev.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

/**
 * If the user is signed in with Supabase and has a profile row, persist scan + problems.
 * Photo paths are omitted unless you upload blobs separately via uploadScanPhoto.
 */
export async function tryCloudPersistScan(scan: ScanReport): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const profile = await getUserProfile(user.id);
  if (!profile) return;

  const problems = scan.problems.map((p) => ({
    problem_id: p.id,
    problem_name: p.name,
    body_region: p.bodyRegion,
    dominant_view: p.dominantView,
    risk_category: p.riskCategory,
    score: p.score,
    detected_in_views: p.detectedInViews,
    description: p.description,
  }));

  await saveScanResults({
    userId: profile.id,
    photos: {},
    keypoints: {
      front: scan.allKeypoints.front,
      side: scan.allKeypoints.side,
      back: scan.allKeypoints.back,
    },
    postureLevel: scan.postureLevel,
    severityBand: scan.severityBand,
    problems,
  });
}

export function buildLocalScanEntry(scan: ScanReport): LocalScanEntry {
  return {
    savedAt: Date.now(),
    postureLevel: scan.postureLevel,
    severityBand: scan.severityBand,
    problemIds: scan.problems.map((p) => p.id),
    riskSummary: {
      high: scan.problems.filter((p) => p.riskCategory === 'high').length,
      medium: scan.problems.filter((p) => p.riskCategory === 'medium').length,
      low: scan.problems.filter((p) => p.riskCategory === 'low').length,
    },
    modelVersion: 'movenet-thunder-v4',
  };
}
