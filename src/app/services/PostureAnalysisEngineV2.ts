/**
 * PostureAnalysisEngine v2 — MoveNet keypoints → low / medium / high risk.
 */
import { type Keypoint, KP } from './MoveNetPoseService';
import type { RiskCategory, PostureLevel, SeverityBand, IntendedView } from '../types/assessment';

export type { RiskCategory, PostureLevel, SeverityBand, IntendedView };

export interface PostureProblem {
  id: string;
  name: string;
  bodyRegion: 'neck' | 'shoulders' | 'upperBack' | 'pelvis' | 'knees';
  dominantView: IntendedView;
  riskCategory: RiskCategory;
  score: number;
  detectedInViews: IntendedView[];
  description: string;
  mapLabel: string;
}

export interface ScanReport {
  postureLevel: PostureLevel;
  severityBand: SeverityBand;
  problems: PostureProblem[];
  allKeypoints: {
    front?: Keypoint[];
    side?: Keypoint[];
    back?: Keypoint[];
  };
  timestamp: number;
}

function angle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs((rad * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

function angleFromVertical(top: Keypoint, bottom: Keypoint): number {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  return (Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI;
}

function mid(a: Keypoint, b: Keypoint): Keypoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: Math.min(a.score, b.score),
    name: 'midpoint',
  };
}

function visible(kp: Keypoint | undefined, threshold = 0.3): boolean {
  return !!kp && kp.score >= threshold;
}

function stabilize(rawScore: number): { score: number; risk: RiskCategory } {
  if (rawScore < 20) return { score: 0, risk: 'low' };
  if (rawScore < 40) return { score: 25, risk: 'low' };
  if (rawScore < 60) return { score: 45, risk: 'medium' };
  if (rawScore < 80) return { score: 65, risk: 'high' };
  return { score: 80, risk: 'high' };
}

interface RawFinding {
  id: string;
  name: string;
  bodyRegion: PostureProblem['bodyRegion'];
  bestView: IntendedView;
  mapLabel: string;
  rawScore: number;
  description: string;
}

function checkForwardHead(kps: Keypoint[], view: IntendedView): RawFinding {
  const nose = kps[KP.NOSE];
  const ls = kps[KP.LEFT_SHOULDER];
  const rs = kps[KP.RIGHT_SHOULDER];
  const sm = mid(ls, rs);

  let rawScore = 0;
  let desc = 'Head alignment looks reasonable.';

  if (view === 'side') {
    const offset = Math.abs(nose.x - sm.x);
    rawScore = Math.min(100, Math.round((offset / 0.12) * 100));
    if (rawScore >= 20) {
      const ang = Math.round(angleFromVertical(nose, sm));
      desc = `Head positioned forward of shoulders (~${ang}° offset in side view).`;
    }
  } else {
    const offset = Math.abs(nose.x - sm.x);
    rawScore = Math.min(100, Math.round((offset / 0.06) * 100));
    if (rawScore >= 20) desc = 'Head appears off-center relative to shoulders.';
  }

  return {
    id: 'forward-head',
    name: 'Forward Head Posture',
    bodyRegion: 'neck',
    bestView: 'side',
    mapLabel: 'Forward head',
    rawScore,
    description: desc,
  };
}

function checkRoundedShoulders(kps: Keypoint[], view: IntendedView): RawFinding {
  const ls = kps[KP.LEFT_SHOULDER];
  const rs = kps[KP.RIGHT_SHOULDER];
  const lh = kps[KP.LEFT_HIP];
  const rh = kps[KP.RIGHT_HIP];
  const sm = mid(ls, rs);
  const hm = mid(lh, rh);

  let rawScore = 0;
  let desc = 'Shoulder position looks reasonable.';

  if (view === 'side') {
    const forwardOffset = Math.abs(sm.x - hm.x);
    rawScore = Math.min(100, Math.round((forwardOffset / 0.1) * 100));
    if (rawScore >= 20) desc = 'Shoulders appear rolled forward of the hip line.';
  } else {
    const shoulderW = Math.abs(ls.x - rs.x);
    const hipW = Math.abs(lh.x - rh.x);
    const ratio = shoulderW / (hipW + 0.03);
    const tilt = Math.abs(ls.y - rs.y);
    const narrowScore =
      ratio < 1.05 ? Math.min(100, Math.round(((1.05 - ratio) / 1.05) * 100 * 1.3)) : 0;
    const tiltScore = Math.min(100, Math.round((tilt / 0.06) * 100));
    rawScore = Math.round(narrowScore * 0.6 + tiltScore * 0.4);
    if (rawScore >= 20) desc = 'Shoulder line appears narrow or uneven relative to hips.';
  }

  return {
    id: 'rounded-shoulders',
    name: 'Rounded Shoulders',
    bodyRegion: 'shoulders',
    bestView: 'side',
    mapLabel: 'Rounded shoulders',
    rawScore,
    description: desc,
  };
}

function checkPelvicTilt(kps: Keypoint[], view: IntendedView): RawFinding {
  let rawScore = 0;
  let desc = 'Pelvic alignment looks within normal range.';

  if (view === 'side') {
    const useLeft = kps[KP.LEFT_HIP].score > kps[KP.RIGHT_HIP].score;
    const s = kps[useLeft ? KP.LEFT_SHOULDER : KP.RIGHT_SHOULDER];
    const h = kps[useLeft ? KP.LEFT_HIP : KP.RIGHT_HIP];
    const k = kps[useLeft ? KP.LEFT_KNEE : KP.RIGHT_KNEE];

    if (visible(s) && visible(h) && visible(k)) {
      const hipAngle = angle(s, h, k);
      const deviation = Math.max(0, 175 - hipAngle);
      rawScore = Math.min(100, Math.round((deviation / 28) * 100));
      if (rawScore >= 20) desc = `Hip angle ~${Math.round(hipAngle)}° (neutral reference ~175°).`;
    }
  } else {
    const lh = kps[KP.LEFT_HIP];
    const rh = kps[KP.RIGHT_HIP];
    const heightDiff = Math.abs(lh.y - rh.y);
    rawScore = Math.min(100, Math.round((heightDiff / 0.045) * 100));
    if (rawScore >= 20) desc = 'Hips appear uneven — possible lateral pelvic tilt.';
  }

  return {
    id: 'pelvic-tilt',
    name: 'Pelvic Tilt',
    bodyRegion: 'pelvis',
    bestView: 'side',
    mapLabel: 'Pelvic tilt',
    rawScore,
    description: desc,
  };
}

function checkSlouching(kps: Keypoint[], view: IntendedView): RawFinding {
  const nose = kps[KP.NOSE];
  const ls = kps[KP.LEFT_SHOULDER];
  const rs = kps[KP.RIGHT_SHOULDER];
  const lh = kps[KP.LEFT_HIP];
  const rh = kps[KP.RIGHT_HIP];
  const sm = mid(ls, rs);
  const hm = mid(lh, rh);

  let rawScore = 0;
  let desc = 'Upper-back alignment looks okay.';

  if (view === 'side') {
    if (visible(nose) && visible(sm) && visible(hm)) {
      const slouchAngle = angle(nose, sm, hm);
      const deviation = Math.max(0, 170 - slouchAngle);
      rawScore = Math.min(100, Math.round((deviation / 32) * 100));
      if (rawScore >= 20)
        desc = `Upper-body angle ~${Math.round(slouchAngle)}° suggests rounding (reference ~170°+).`;
    }
  } else {
    if (visible(nose) && visible(sm) && visible(hm)) {
      const slouchAngle = angle(nose, sm, hm);
      const deviation = Math.max(0, 172 - slouchAngle);
      rawScore = Math.min(100, Math.round((deviation / 35) * 100));
      if (rawScore >= 20) desc = 'Front/back view suggests upper-body rounding.';
    }
  }

  return {
    id: 'slouching',
    name: 'Slouching / Kyphosis',
    bodyRegion: 'upperBack',
    bestView: 'side',
    mapLabel: 'Kyphosis',
    rawScore,
    description: desc,
  };
}

function checkShoulderAsymmetry(kps: Keypoint[]): RawFinding {
  const ls = kps[KP.LEFT_SHOULDER];
  const rs = kps[KP.RIGHT_SHOULDER];
  const heightDiff = Math.abs(ls.y - rs.y);
  const rawScore = Math.min(100, Math.round((heightDiff / 0.055) * 100));
  const higher = ls.y < rs.y ? 'left' : 'right';
  const desc =
    rawScore >= 20
      ? `${higher.charAt(0).toUpperCase() + higher.slice(1)} shoulder appears higher.`
      : 'Shoulders look fairly level.';

  return {
    id: 'shoulder-asymmetry',
    name: 'Uneven Shoulders',
    bodyRegion: 'shoulders',
    bestView: 'back',
    mapLabel: 'Uneven shoulders',
    rawScore,
    description: desc,
  };
}

function checkHipAlignment(kps: Keypoint[]): RawFinding {
  const lh = kps[KP.LEFT_HIP];
  const rh = kps[KP.RIGHT_HIP];
  const heightDiff = Math.abs(lh.y - rh.y);
  const rawScore = Math.min(100, Math.round((heightDiff / 0.04) * 100));
  const higher = lh.y < rh.y ? 'left' : 'right';
  const desc =
    rawScore >= 20
      ? `${higher.charAt(0).toUpperCase() + higher.slice(1)} hip appears higher.`
      : 'Hips look fairly level.';

  return {
    id: 'hip-alignment',
    name: 'Hip Alignment',
    bodyRegion: 'pelvis',
    bestView: 'front',
    mapLabel: 'Hip alignment',
    rawScore,
    description: desc,
  };
}

function analyzeView(kps: Keypoint[], view: IntendedView): RawFinding[] {
  const findings: RawFinding[] = [];

  if (view === 'front') {
    findings.push(checkForwardHead(kps, 'front'));
    findings.push(checkRoundedShoulders(kps, 'front'));
    findings.push(checkSlouching(kps, 'front'));
    findings.push(checkShoulderAsymmetry(kps));
    findings.push(checkHipAlignment(kps));
  } else if (view === 'side') {
    findings.push(checkForwardHead(kps, 'side'));
    findings.push(checkRoundedShoulders(kps, 'side'));
    findings.push(checkPelvicTilt(kps, 'side'));
    findings.push(checkSlouching(kps, 'side'));
  } else {
    findings.push(checkShoulderAsymmetry(kps));
    findings.push(checkSlouching(kps, 'back'));
    findings.push(checkHipAlignment(kps));
  }

  return findings;
}

const BEST_VIEW: Record<string, IntendedView> = {
  'forward-head': 'side',
  'rounded-shoulders': 'side',
  'pelvic-tilt': 'side',
  slouching: 'side',
  'shoulder-asymmetry': 'back',
  'hip-alignment': 'front',
};

export function analyzeThreePhotos(params: {
  front: Keypoint[];
  side: Keypoint[];
  back: Keypoint[];
}): ScanReport {
  const { front, side, back } = params;

  const frontFindings = analyzeView(front, 'front');
  const sideFindings = analyzeView(side, 'side');
  const backFindings = analyzeView(back, 'back');

  const allFindings = [
    ...frontFindings.map((f) => ({ ...f, view: 'front' as IntendedView })),
    ...sideFindings.map((f) => ({ ...f, view: 'side' as IntendedView })),
    ...backFindings.map((f) => ({ ...f, view: 'back' as IntendedView })),
  ];

  const byId = new Map<string, Array<RawFinding & { view: IntendedView }>>();
  for (const f of allFindings) {
    if (!byId.has(f.id)) byId.set(f.id, []);
    byId.get(f.id)!.push(f);
  }

  const problems: PostureProblem[] = [];

  for (const [, candidates] of byId) {
    const id = candidates[0].id;
    const preferredView = BEST_VIEW[id];
    const preferred = candidates.find((c) => c.view === preferredView);
    const best = candidates.reduce((a, b) => (a.rawScore > b.rawScore ? a : b));
    const anchor = preferred && preferred.rawScore >= 15 ? preferred : best;

    const avgScore = candidates.reduce((s, c) => s + c.rawScore, 0) / candidates.length;
    const blended =
      anchor.rawScore >= 20
        ? Math.round(anchor.rawScore * 0.7 + avgScore * 0.3)
        : Math.round(avgScore * 0.85);

    const { score, risk } = stabilize(blended);

    if (score === 0) continue;

    const detectedViews = candidates.filter((c) => c.rawScore >= 20).map((c) => c.view);

    problems.push({
      id,
      name: anchor.name,
      bodyRegion: anchor.bodyRegion,
      dominantView: anchor.view,
      riskCategory: risk,
      score,
      detectedInViews: [...new Set(detectedViews)],
      description: anchor.description,
      mapLabel: anchor.mapLabel,
    });
  }

  const riskOrder: Record<RiskCategory, number> = { high: 0, medium: 1, low: 2 };
  problems.sort((a, b) => riskOrder[a.riskCategory] - riskOrder[b.riskCategory]);

  const severityBand: SeverityBand = problems.some((p) => p.riskCategory === 'high')
    ? 'severe'
    : problems.some((p) => p.riskCategory === 'medium')
      ? 'moderate'
      : 'mild';

  return {
    postureLevel: 'beginner',
    severityBand,
    problems,
    allKeypoints: { front, side, back },
    timestamp: Date.now(),
  };
}

export interface UserContext {
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  hasExistingPain: boolean;
  dailyScreenHours: number;
}

export function determineLevel(report: ScanReport, user: UserContext): PostureLevel {
  const count = report.problems.length;
  const hasHigh = report.problems.some((p) => p.riskCategory === 'high');
  const medCount = report.problems.filter((p) => p.riskCategory === 'medium').length;

  let riskBoost = 0;
  if (user.activityLevel === 'sedentary' || user.activityLevel === 'light') riskBoost++;
  if (user.hasExistingPain) riskBoost++;
  if (user.dailyScreenHours >= 8) riskBoost++;

  let level: PostureLevel;

  if (hasHigh) level = 'beginner';
  else if (count >= 3) level = 'beginner';
  else if (count >= 2 && riskBoost >= 2) level = 'beginner';
  else if (count >= 2) level = 'intermediate';
  else if (medCount >= 1) level = 'intermediate';
  else if (count === 1 && riskBoost >= 2) level = 'intermediate';
  else if (count === 0) level = 'advanced';
  else if (count === 1 && riskBoost === 0) level = 'advanced';
  else level = 'intermediate';

  report.postureLevel = level;
  return level;
}

export const RISK_INFO: Record<
  RiskCategory,
  { label: string; color: string; bgColor: string }
> = {
  high: { label: 'High risk', color: '#E68C33', bgColor: 'rgba(230,140,51,0.1)' },
  medium: { label: 'Medium risk', color: '#D9B84C', bgColor: 'rgba(217,184,76,0.1)' },
  low: { label: 'Low risk', color: '#3DA878', bgColor: 'rgba(61,168,120,0.1)' },
};

export const VIEW_LABELS: Record<IntendedView, string> = {
  front: 'Front',
  side: 'Side',
  back: 'Back',
};
