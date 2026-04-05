/**
 * PostureAnalysisEngine — MediaPipe landmarks → posture checks + program builder.
 * See INTEGRATION_GUIDE in repo root / posture-ai folder for threshold tuning.
 */

import {
  determinePostureLevel,
  loadUserProfile,
  saveUserProfile,
  levelToDefaultDifficulty,
  type PostureLevel,
  type UserProfile,
} from './UserProfile';

export type { PostureLevel };
export { determinePostureLevel, loadUserProfile, levelToDefaultDifficulty };

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export type IntendedView = 'front' | 'side' | 'back';
export type BodyRegion = 'neck' | 'shoulders' | 'upperBack' | 'pelvis' | 'knees';
export type FindingConfidence = 'single-view' | 'reinforced' | 'consistent';

export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  neck: 'Neck',
  shoulders: 'Shoulders',
  upperBack: 'Upper back',
  pelvis: 'Pelvis',
  knees: 'Knees',
};

export const VIEW_LABELS: Record<IntendedView, string> = {
  front: 'Front',
  side: 'Side',
  back: 'Back',
};

export interface PostureProblem {
  id: string;
  name: string;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  score: number;
  bodyRegion: BodyRegion;
  dominantView: IntendedView;
  healthScore: number;
  displayPercent: number;
  confidenceLevel: FindingConfidence;
  confidenceLabel: string;
  description: string;
  details: string;
  angle?: number;
  idealAngle?: number;
  /** Where to place pins on the 3-panel (front / side / back) reference image */
  mapPanels?: IntendedView[];
  /** Optional shorter label on the triptych map */
  mapLabel?: string;
}

export interface PostureReport {
  overallScore: number;
  problems: PostureProblem[];
  viewType: 'side' | 'front';
  recommendations: string[];
  timestamp: number;
  /** When multiple photos were merged, lists which views were used */
  viewsCombined?: IntendedView[];
}

function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function angleFromVertical(top: Landmark, bottom: Landmark): number {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  const radians = Math.atan2(Math.abs(dx), Math.abs(dy));
  return (radians * 180) / Math.PI;
}

function midpoint(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility, b.visibility),
  };
}

function getSeverity(score: number): 'none' | 'mild' | 'moderate' | 'severe' {
  if (score < 15) return 'none';
  if (score < 40) return 'mild';
  if (score < 65) return 'moderate';
  return 'severe';
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toHealthScore(score: number): number {
  return clampPercent(100 - score);
}

function getSingleViewConfidenceLabel(view: IntendedView): string {
  return `Primary signal from the ${VIEW_LABELS[view].toLowerCase()} scan.`;
}

function summarizeConfidence(views: IntendedView[], dominantView: IntendedView): {
  confidenceLevel: FindingConfidence;
  confidenceLabel: string;
} {
  const uniqueViews = [...new Set(views)];

  if (uniqueViews.length >= 3) {
    return {
      confidenceLevel: 'consistent',
      confidenceLabel: 'Consistent signal across front, side, and back scans.',
    };
  }

  if (uniqueViews.length === 2) {
    return {
      confidenceLevel: 'reinforced',
      confidenceLabel: `Reinforced by the ${uniqueViews.map(view => VIEW_LABELS[view].toLowerCase()).join(' and ')} scans.`,
    };
  }

  return {
    confidenceLevel: 'single-view',
    confidenceLabel: `Most visible in the ${VIEW_LABELS[dominantView].toLowerCase()} scan.`,
  };
}

function finalizeProblem(
  problem: Omit<PostureProblem, 'healthScore' | 'displayPercent'>,
): PostureProblem {
  const healthScore = toHealthScore(problem.score);
  return {
    ...problem,
    healthScore,
    displayPercent: healthScore,
  };
}

export function detectViewType(landmarks: Landmark[]): 'side' | 'front' {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  return shoulderWidth < 0.15 ? 'side' : 'front';
}

function checkForwardHead(landmarks: Landmark[]): PostureProblem {
  const viewType = detectViewType(landmarks);

  if (viewType === 'side') {
    const ear = landmarks[7];
    const shoulder = landmarks[11];
    const earR = landmarks[8];
    const shoulderR = landmarks[12];
    const useLeft = ear.visibility > earR.visibility;
    const earPoint = useLeft ? ear : earR;
    const shoulderPoint = useLeft ? shoulder : shoulderR;
    const forwardOffset = Math.abs(earPoint.x - shoulderPoint.x);
    const angle = angleFromVertical(earPoint, shoulderPoint);
    const score = Math.min(100, Math.round((forwardOffset / 0.18) * 100));
    return finalizeProblem({
      id: 'forward-head',
      name: 'Forward Head Posture',
      severity: getSeverity(score),
      score,
      bodyRegion: 'neck',
      dominantView: 'side',
      confidenceLevel: 'single-view',
      confidenceLabel: getSingleViewConfidenceLabel('side'),
      angle: Math.round(angle),
      idealAngle: 0,
      description: score >= 15
        ? `Your head is positioned ${Math.round(angle)}° forward of your shoulders.`
        : 'Your head alignment looks good!',
      details: score >= 15
        ? 'Extra strain on the cervical spine is common with forward head posture.'
        : 'Ear-over-shoulder alignment looks reasonable in this image.',
      mapLabel: 'Forward head',
    });
  }

  const nose = landmarks[0];
  const shoulderL = landmarks[11];
  const shoulderR = landmarks[12];
  const shoulderMid = midpoint(shoulderL, shoulderR);
  const forwardOffset = Math.abs(nose.x - shoulderMid.x);
  const angle = angleFromVertical(nose, shoulderMid);
  const score = Math.min(100, Math.round((forwardOffset / 0.08) * 100));
  return finalizeProblem({
    id: 'forward-head',
    name: 'Forward Head Posture',
    severity: getSeverity(score),
    score,
    bodyRegion: 'neck',
    dominantView: 'front',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('front'),
    angle: Math.round(angle),
    idealAngle: 0,
    description: score >= 15
      ? `Head sits forward of the shoulder line in the front view (~${Math.round(angle)}° offset).`
      : 'Head alignment looks centered over the shoulders from the front.',
    details: score >= 15
      ? 'Front-view screening: nose should stack closer over the mid-shoulders for less neck strain.'
      : 'Front head position looks fair in this photo.',
    mapLabel: 'Forward head',
  });
}

function checkRoundedShoulders(landmarks: Landmark[]): PostureProblem {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const hipMid = midpoint(leftHip, rightHip);
  const forwardOffset = Math.abs(shoulderMid.x - hipMid.x);
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  const forwardScore = Math.min(100, Math.round((forwardOffset / 0.12) * 100));
  const tiltScore = Math.min(100, Math.round((shoulderTilt / 0.08) * 100));
  const score = Math.round(forwardScore * 0.7 + tiltScore * 0.3);
  const angle = Math.round(angleFromVertical(shoulderMid, hipMid));
  return finalizeProblem({
    id: 'rounded-shoulders',
    name: 'Rounded Shoulders',
    severity: getSeverity(score),
    score,
    bodyRegion: 'shoulders',
    dominantView: 'side',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('side'),
    angle,
    idealAngle: 0,
    description: score >= 15
      ? `Shoulders appear rolled forward (~${angle}°).${shoulderTilt > 0.03 ? ' Some shoulder asymmetry noted.' : ''}`
      : 'Shoulder position looks reasonable.',
    details: score >= 15
      ? 'Often linked to tight chest muscles and prolonged desk posture.'
      : 'Shoulders sit fairly well over the hips.',
    mapLabel: 'Rounded shoulders',
  });
}

/** Front / back camera: shoulder line vs hip width and level (internal rotation / “closed chest” proxy). */
function checkRoundedShouldersFrontal(landmarks: Landmark[]): PostureProblem {
  const ls = landmarks[11];
  const rs = landmarks[12];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const shoulderW = Math.abs(ls.x - rs.x);
  const hipW = Math.abs(lh.x - rh.x);
  const ratio = shoulderW / (hipW + 0.03);
  const narrowScore = ratio < 1.05
    ? Math.min(100, Math.round(((1.05 - ratio) / 1.05) * 100 * 1.35))
    : 0;
  const shoulderTilt = Math.abs(ls.y - rs.y);
  const tiltScore = Math.min(100, Math.round((shoulderTilt / 0.06) * 100));
  const score = Math.round(narrowScore * 0.62 + tiltScore * 0.38);
  return finalizeProblem({
    id: 'rounded-shoulders',
    name: 'Rounded Shoulders',
    severity: getSeverity(score),
    score,
    bodyRegion: 'shoulders',
    dominantView: 'front',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('front'),
    description: score >= 15
      ? 'Shoulder line appears narrow or uneven relative to the hips — a common desk posture signal.'
      : 'Shoulder position looks fairly open from the front.',
    details: score >= 15
      ? 'Often pairs with tight chest tissues; pair stretches with upper-back strength.'
      : 'Shoulders look reasonably balanced in this frame.',
    mapLabel: 'Rounded shoulders',
  });
}

function checkChestRibcage(landmarks: Landmark[]): PostureProblem {
  const ls = landmarks[11];
  const rs = landmarks[12];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const shoulderW = Math.abs(ls.x - rs.x);
  const hipW = Math.abs(lh.x - rh.x);
  const ratio = shoulderW / (hipW + 0.03);
  const le = landmarks[13];
  const re = landmarks[14];
  const elbowDepth = Math.abs(midpoint(le, re).z - midpoint(ls, rs).z);
  const narrow = ratio < 0.98 ? Math.min(100, Math.round(((0.98 - ratio) / 0.98) * 110)) : 0;
  const depth = Math.min(100, Math.round(elbowDepth * 95));
  const score = Math.round(narrow * 0.55 + depth * 0.45);
  return finalizeProblem({
    id: 'chest-ribcage',
    name: 'Chest / rib cage tightness',
    severity: getSeverity(score),
    score,
    bodyRegion: 'upperBack',
    dominantView: 'front',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('front'),
    description: score >= 15
      ? 'Front view suggests a “closed” chest pattern (narrow shoulder line vs hips / inward arm line).'
      : 'Chest and rib cage look fairly open in this photo.',
    details: score >= 15
      ? 'Educational cue only: breathe wide into the ribs and balance with upper-back activation.'
      : 'No strong chest compression signal from this frame.',
    mapLabel: 'Chest / ribs',
  });
}

function checkWingingScapula(landmarks: Landmark[]): PostureProblem {
  const ls = landmarks[11];
  const rs = landmarks[12];
  const zDiff = Math.abs(ls.z - rs.z);
  const yDiff = Math.abs(ls.y - rs.y);
  const zScore = Math.min(100, Math.round(zDiff * 220));
  const yScore = Math.min(100, Math.round((yDiff / 0.045) * 100));
  const score = Math.round(zScore * 0.52 + yScore * 0.48);
  return finalizeProblem({
    id: 'winging-scapula',
    name: 'Winging scapula risk',
    severity: getSeverity(score),
    score,
    bodyRegion: 'shoulders',
    dominantView: 'back',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('back'),
    description: score >= 15
      ? 'Back view shows notable shoulder-blade asymmetry (depth or height) — a loose screen for scapular dyskinesis.'
      : 'Shoulder blades look fairly balanced from behind.',
    details: score >= 15
      ? 'Not a diagnosis; serratus and lower-trap strength often help — see a clinician if painful.'
      : 'No strong winging signal in this capture.',
    mapLabel: 'Winging scapula',
  });
}

function checkAnteriorPelvicTilt(landmarks: Landmark[]): PostureProblem {
  const shoulderR = landmarks[12];
  const hipR = landmarks[24];
  const kneeR = landmarks[26];
  const shoulder = landmarks[11];
  const hip = landmarks[23];
  const knee = landmarks[25];
  const useLeft = hip.visibility > hipR.visibility;
  const s = useLeft ? shoulder : shoulderR;
  const h = useLeft ? hip : hipR;
  const k = useLeft ? knee : kneeR;
  const hipAngle = calculateAngle(s, h, k);
  const angleDev = Math.max(0, 175 - hipAngle);
  const score = Math.min(100, Math.round((angleDev / 30) * 100));
  return finalizeProblem({
    id: 'anterior-pelvic',
    name: 'Anterior Pelvic Tilt',
    severity: getSeverity(score),
    score,
    bodyRegion: 'pelvis',
    dominantView: 'side',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('side'),
    angle: Math.round(hipAngle),
    idealAngle: 175,
    description: score >= 15
      ? `Hip angle ~${Math.round(hipAngle)}° (typical neutral reference ~175°).`
      : 'Pelvic alignment looks within a normal range.',
    details: score >= 15
      ? 'Can correlate with tight hip flexors and increased lumbar arch — screen with a pro if pain persists.'
      : 'No strong anterior tilt signal from this single photo.',
    mapLabel: 'Pelvic tilt',
  });
}

/** Side profile: ear–shoulder–hip chain. */
function checkSlouchingProfile(landmarks: Landmark[]): PostureProblem {
  const ear = landmarks[7];
  const shoulder = landmarks[11];
  const hip = landmarks[23];
  const earR = landmarks[8];
  const shoulderR = landmarks[12];
  const hipR = landmarks[24];
  const useLeft = shoulder.visibility > shoulderR.visibility;
  const e = useLeft ? ear : earR;
  const s = useLeft ? shoulder : shoulderR;
  const h = useLeft ? hip : hipR;
  const slouchAngle = calculateAngle(e, s, h);
  const deviation = Math.max(0, 170 - slouchAngle);
  const score = Math.min(100, Math.round((deviation / 35) * 100));
  return finalizeProblem({
    id: 'slouching',
    name: 'Slouching / Kyphosis Pattern',
    severity: getSeverity(score),
    score,
    bodyRegion: 'upperBack',
    dominantView: 'side',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('side'),
    angle: Math.round(slouchAngle),
    idealAngle: 170,
    description: score >= 15
      ? `Ear–shoulder–hip angle ~${Math.round(slouchAngle)}° (reference ~170°+).`
      : 'Upper-back alignment looks okay from this view.',
    details: score >= 15
      ? 'May indicate thoracic rounding; combine with movement breaks and upper-back strengthening.'
      : 'Alignment from ear to hip looks fair in this capture.',
    mapLabel: 'Kyphosis',
  });
}

/** Front camera: nose–shoulder–hip as a stacked-angle curve screen. */
function checkSlouchingFrontal(landmarks: Landmark[]): PostureProblem {
  const nose = landmarks[0];
  const ls = landmarks[11];
  const rs = landmarks[12];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const sm = midpoint(ls, rs);
  const hm = midpoint(lh, rh);
  const slouchAngle = calculateAngle(nose, sm, hm);
  const deviation = Math.max(0, 172 - slouchAngle);
  const score = Math.min(100, Math.round((deviation / 38) * 100));
  return finalizeProblem({
    id: 'slouching',
    name: 'Slouching / Kyphosis Pattern',
    severity: getSeverity(score),
    score,
    bodyRegion: 'upperBack',
    dominantView: 'front',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('front'),
    angle: Math.round(slouchAngle),
    idealAngle: 172,
    description: score >= 15
      ? `Front view shows a flexed upper-torso line (~${Math.round(slouchAngle)}° nose–shoulder–hip).`
      : 'Upper-back line looks fairly tall from the front.',
    details: score >= 15
      ? 'Often reflects thoracic flexion habits; pair chest opening with upper-back extension.'
      : 'No strong kyphotic line in this front photo.',
    mapLabel: 'Kyphosis',
  });
}

/** Back camera: ears if visible, else shallow shoulder-depth heuristic. */
function checkSlouchingFromBehind(landmarks: Landmark[]): PostureProblem {
  const ls = landmarks[11];
  const rs = landmarks[12];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const sm = midpoint(ls, rs);
  const hm = midpoint(lh, rh);
  const el = landmarks[7];
  const er = landmarks[8];
  const earVis = Math.max(el.visibility, er.visibility);
  if (earVis > 0.35) {
    const e = el.visibility > er.visibility ? el : er;
    const slouchAngle = calculateAngle(e, sm, hm);
    const deviation = Math.max(0, 168 - slouchAngle);
    const score = Math.min(100, Math.round((deviation / 40) * 100));
    return finalizeProblem({
      id: 'slouching',
      name: 'Slouching / Kyphosis Pattern',
      severity: getSeverity(score),
      score,
      bodyRegion: 'upperBack',
      dominantView: 'back',
      confidenceLevel: 'single-view',
      confidenceLabel: getSingleViewConfidenceLabel('back'),
      angle: Math.round(slouchAngle),
      idealAngle: 168,
      description: score >= 15
        ? `Behind view suggests upper-back rounding (~${Math.round(slouchAngle)}°).`
        : 'Upper-back looks fairly neutral from behind.',
      details: score >= 15
        ? 'Thoracic mobility + scapular control are common complements — not a diagnosis.'
        : 'No strong rounding signal from this rear photo.',
      mapLabel: 'Kyphosis',
    });
  }
  const zScore = Math.min(100, Math.round((Math.abs(ls.z) + Math.abs(rs.z)) * 85));
  return finalizeProblem({
    id: 'slouching',
    name: 'Slouching / Kyphosis Pattern',
    severity: getSeverity(zScore),
    score: zScore,
    bodyRegion: 'upperBack',
    dominantView: 'back',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('back'),
    description: zScore >= 15
      ? 'Behind view shows heavier shoulder depth cues — a soft screen for thoracic flexion patterns.'
      : 'Behind view looks fairly even.',
    details: zScore >= 15
      ? 'Re-scan with ears visible for a clearer rear-profile line when possible.'
      : 'Limited ear landmarks; result is lower confidence.',
    mapLabel: 'Kyphosis',
  });
}

function checkShoulderAsymmetry(landmarks: Landmark[]): PostureProblem {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const heightDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const higherSide = leftShoulder.y < rightShoulder.y ? 'left' : 'right';
  const score = Math.min(100, Math.round((heightDiff / 0.06) * 100));
  return finalizeProblem({
    id: 'shoulder-asymmetry',
    name: 'Shoulder Asymmetry',
    severity: getSeverity(score),
    score,
    bodyRegion: 'shoulders',
    dominantView: 'front',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('front'),
    description: score >= 15
      ? `${higherSide} shoulder appears higher.`
      : 'Shoulders look fairly level.',
    details: score >= 15
      ? 'Can reflect habits, strength imbalance, or other causes; consider clinical assessment if significant.'
      : 'Good bilateral symmetry in this frame.',
    mapLabel: 'Uneven shoulders',
  });
}

function checkHipAlignment(landmarks: Landmark[]): PostureProblem {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const heightDiff = Math.abs(leftHip.y - rightHip.y);
  const higherSide = leftHip.y < rightHip.y ? 'left' : 'right';
  const score = Math.min(100, Math.round((heightDiff / 0.05) * 100));
  return finalizeProblem({
    id: 'hip-alignment',
    name: 'Hip Alignment',
    severity: getSeverity(score),
    score,
    bodyRegion: 'pelvis',
    dominantView: 'front',
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel('front'),
    description: score >= 15
      ? `${higherSide} hip appears higher (lateral tilt signal).`
      : 'Hips look fairly level.',
    details: score >= 15
      ? 'Uneven hips can affect gait and loading — professional evaluation helps if persistent.'
      : 'Hip heights look balanced here.',
  });
}

/**
 * Which reference-image panels each finding should use on the stacked front | side | back graphic.
 * (Several findings intentionally appear on more than one panel.)
 */
export const BODY_MAP_PANELS_BY_ID: Record<string, IntendedView[]> = {
  'forward-head': ['front'],
  'rounded-shoulders': ['front', 'side'],
  'chest-ribcage': ['front'],
  'anterior-pelvic': ['side'],
  'slouching': ['front', 'back'],
  'shoulder-asymmetry': ['back'],
  'winging-scapula': ['back'],
  'hip-alignment': ['front'],
};

/** When merging 3 photos, blend scores toward the angle that best validates that finding. */
const BEST_SOURCE_VIEW_BY_ID: Partial<Record<string, IntendedView>> = {
  'forward-head': 'side',
  'rounded-shoulders': 'side',
  'chest-ribcage': 'front',
  'anterior-pelvic': 'side',
  'slouching': 'side',
  'shoulder-asymmetry': 'back',
  'winging-scapula': 'back',
  'hip-alignment': 'front',
};

export function analyzePosture(landmarks: Landmark[]): PostureReport {
  if (!landmarks || landmarks.length < 33) {
    throw new Error('Need 33 landmarks from MediaPipe Pose');
  }
  const vt = detectViewType(landmarks);
  return analyzePostureForView(landmarks, vt === 'side' ? 'side' : 'front');
}

/** Runs only the checks that match the camera you intended (stronger 3-photo workflow). */
export function analyzePostureForView(landmarks: Landmark[], intended: IntendedView): PostureReport {
  if (!landmarks || landmarks.length < 33) {
    throw new Error('Need 33 landmarks from MediaPipe Pose');
  }
  let raw: PostureProblem[] = [];
  if (intended === 'front') {
    raw = [
      checkForwardHead(landmarks),
      checkRoundedShouldersFrontal(landmarks),
      checkSlouchingFrontal(landmarks),
      checkShoulderAsymmetry(landmarks),
      checkHipAlignment(landmarks),
      checkChestRibcage(landmarks),
    ];
  } else if (intended === 'side') {
    raw = [
      checkForwardHead(landmarks),
      checkRoundedShoulders(landmarks),
      checkAnteriorPelvicTilt(landmarks),
      checkSlouchingProfile(landmarks),
    ];
  } else {
    raw = [
      checkShoulderAsymmetry(landmarks),
      checkWingingScapula(landmarks),
      checkSlouchingFromBehind(landmarks),
      checkHipAlignment(landmarks),
    ];
  }

  const problems = raw.map(p => finalizeProblem({
    ...p,
    dominantView: intended,
    confidenceLevel: 'single-view',
    confidenceLabel: getSingleViewConfidenceLabel(intended),
  }));

  const detected = problems.filter(p => p.score >= 15);
  const avg = problems.reduce((sum, p) => sum + p.score, 0) / problems.length;
  return {
    overallScore: Math.max(0, Math.round(100 - avg)),
    problems: problems.sort((a, b) => b.score - a.score),
    viewType: intended === 'side' ? 'side' : 'front',
    recommendations: generateRecommendations(detected),
    timestamp: Date.now(),
    viewsCombined: [intended],
  };
}

/**
 * Merge 3 view-specific reports into a stable UI model.
 * Keeps the strongest signal, softens it with cross-view support, and exposes
 * body-region, dominant-view, and health-oriented display values.
 */
export function mergePostureReports(items: { view: IntendedView; report: PostureReport }[]): PostureReport {
  const allIds = [...new Set(items.flatMap(i => i.report.problems.map(p => p.id)))];
  const merged: PostureProblem[] = [];

  for (const id of allIds) {
    const candidates = items.flatMap(({ view, report }) => {
      const match = report.problems.find(problem => problem.id === id);
      return match ? [{ view, problem: match }] : [];
    });

    if (!candidates.length) {
      continue;
    }

    const bestCandidate = candidates.reduce((best, current) =>
      current.problem.score > best.problem.score ? current : best,
    );
    const preferredView = BEST_SOURCE_VIEW_BY_ID[id];
    const preferredCandidate = preferredView
      ? candidates.find(c => c.view === preferredView)
      : undefined;
    const anchor = preferredCandidate && preferredCandidate.problem.score >= 12
      ? preferredCandidate
      : bestCandidate;

    const averageScore = Math.round(
      candidates.reduce((sum, candidate) => sum + candidate.problem.score, 0) / candidates.length,
    );
    const mergedScore = anchor.problem.score >= 15
      ? Math.round(anchor.problem.score * 0.72 + averageScore * 0.28)
      : Math.round(averageScore * 0.85);
    const supportingViews = candidates
      .filter(candidate => candidate.problem.score >= 15)
      .map(candidate => candidate.view);
    const confidence = summarizeConfidence(
      supportingViews.length ? supportingViews : [anchor.view],
      anchor.view,
    );

    const mapPanels = BODY_MAP_PANELS_BY_ID[id] ?? [anchor.view];

    merged.push(finalizeProblem({
      ...anchor.problem,
      score: mergedScore,
      severity: getSeverity(mergedScore),
      dominantView: anchor.view,
      confidenceLevel: confidence.confidenceLevel,
      confidenceLabel: confidence.confidenceLabel,
      details: `${anchor.problem.details} ${confidence.confidenceLabel}`.trim(),
      mapPanels,
    }));
  }

  const detected = merged.filter(p => p.score >= 15);
  const avg = merged.length ? merged.reduce((s, p) => s + p.score, 0) / merged.length : 0;
  return {
    overallScore: Math.max(0, Math.round(100 - avg)),
    problems: merged.sort((a, b) => b.score - a.score),
    viewType: 'front',
    recommendations: generateRecommendations(detected),
    timestamp: Date.now(),
    viewsCombined: items.map(i => i.view),
  };
}

export function getHighlightedProblems(problems: PostureProblem[], max = 4): PostureProblem[] {
  const bestById = new Map<string, PostureProblem>();

  problems
    .filter(problem => problem.score >= 15)
    .sort((a, b) => b.score - a.score)
    .forEach(problem => {
      const current = bestById.get(problem.id);
      if (!current || problem.score > current.score) {
        bestById.set(problem.id, problem);
      }
    });

  return [...bestById.values()].sort((a, b) => b.score - a.score).slice(0, max);
}

export type BodyMapPin = {
  key: string;
  problem: PostureProblem;
  panel: IntendedView;
  label: string;
};

/** Expands merged findings into one or more pins on the stacked front/side/back reference graphic. */
export function getBodyMapPins(problems: PostureProblem[], maxPins = 10): BodyMapPin[] {
  const pins: BodyMapPin[] = [];
  const sorted = problems.filter(p => p.score >= 20).sort((a, b) => b.score - a.score);

  for (const problem of sorted) {
    const panels = problem.mapPanels?.length
      ? problem.mapPanels
      : BODY_MAP_PANELS_BY_ID[problem.id] ?? [problem.dominantView];

    for (const panel of panels) {
      pins.push({
        key: `${problem.id}-${panel}`,
        problem,
        panel,
        label: problem.mapLabel ?? BODY_REGION_LABELS[problem.bodyRegion],
      });
    }
  }

  return pins.slice(0, maxPins);
}

/**
 * Heuristic daily mobility/stretch budget from your scan. Not medical advice and not a
 * prediction of recovery time — exercise dosing literature generally supports short, frequent
 * sessions (e.g. a few minutes most days) over occasional long marathons. We map severity
 * to extra minutes so the estimate scales with how many regions are flagged and how strong
 * the signal is.
 */
export interface StretchPrescription {
  /** Total suggested focused stretching / mobility per day (minutes). */
  dailyMinutesTotal: number;
  /** 1 or 2 blocks per day. */
  sessionsPerDay: 1 | 2;
  /** When sessionsPerDay is 2, approximate minutes per block (totals ≈ dailyMinutesTotal). */
  minutesPerSession: [number] | [number, number];
  /** Rough band for when users often notice habits/posture feeling easier (not a guarantee). */
  habitsTimelineWeeks: { min: number; max: number };
  /** Short explanation for the UI. */
  summary: string;
  /** Bullet-sized reasoning tied to this scan. */
  rationaleBullets: string[];
  disclaimer: string;
}

function minutesChunkForFinding(p: PostureProblem): number {
  if (p.score < 20) return 0;
  if (p.score < 40) return 2 + Math.round((p.score - 20) / 20 * 1);
  if (p.score < 65) return 4 + Math.round((p.score - 40) / 25 * 2);
  return 7 + Math.min(3, Math.round((p.score - 65) / 35 * 3));
}

function roundToFriendlyMinutes(n: number): number {
  const clamped = Math.max(8, Math.min(30, n));
  const stepped = Math.round(clamped / 5) * 5;
  return Math.max(10, Math.min(30, stepped));
}

export function deriveStretchPrescription(report: PostureReport): StretchPrescription {
  const detected = report.problems.filter(p => p.score >= 20);
  const n = detected.length;

  let raw = 6;
  if (n === 0) {
    raw = 8;
  } else {
    for (const p of detected) {
      raw += minutesChunkForFinding(p);
    }
    if (report.overallScore < 55) raw += 4;
    else if (report.overallScore < 70) raw += 2;
    if (n >= 3) raw += 2;
    if (n >= 5) raw += 2;
  }

  const dailyMinutesTotal = n === 0 ? 8 : roundToFriendlyMinutes(raw);
  const sessionsPerDay: 1 | 2 = dailyMinutesTotal >= 18 ? 2 : 1;
  let minutesPerSession: [number] | [number, number];
  if (sessionsPerDay === 1) {
    minutesPerSession = [dailyMinutesTotal];
  } else {
    const a = Math.ceil(dailyMinutesTotal / 2);
    const b = dailyMinutesTotal - a;
    minutesPerSession = [a, b];
  }

  const maxSeverity = n
    ? Math.max(...detected.map(p => p.score))
    : 0;
  const habitsTimelineWeeks = maxSeverity >= 65
    ? { min: 6, max: 12 }
    : maxSeverity >= 40
      ? { min: 5, max: 10 }
      : n >= 1
        ? { min: 3, max: 8 }
        : { min: 2, max: 6 };

  const rationaleBullets: string[] = [];
  if (n === 0) {
    rationaleBullets.push('No strong flags — a short daily mobility habit still helps desk workers.');
  } else {
    rationaleBullets.push(
      `${n} focus area${n === 1 ? '' : 's'} met the scan threshold (we add a few minutes per area by severity).`,
    );
    if (report.overallScore < 70) {
      rationaleBullets.push('Lower overall score nudges the target up slightly toward consistency.');
    }
    if (sessionsPerDay === 2) {
      rationaleBullets.push('Split into two short blocks matches how people usually stick with mobility work.');
    }
  }

  const summary = n === 0
    ? 'About 8 minutes a day of general mobility is a reasonable default when nothing major is flagged.'
    : `About ${dailyMinutesTotal} minutes a day of targeted stretching and posture drills, based on your current scan.`;

  return {
    dailyMinutesTotal,
    sessionsPerDay,
    minutesPerSession,
    habitsTimelineWeeks,
    summary,
    rationaleBullets,
    disclaimer:
      'Educational estimate only — not medical advice, not a personal treatment plan, and not a promise of outcomes. Pain, numbness, or injury needs an in-person clinician.',
  };
}

function generateRecommendations(problems: PostureProblem[]): string[] {
  const recs: string[] = [];
  const has = (id: string) => problems.some(p => p.id === id);
  if (has('forward-head')) {
    recs.push('Chin tucks: 10 reps, 5s hold, 2–3× daily.');
    recs.push('Raise screens closer to eye level.');
  }
  if (has('rounded-shoulders')) {
    recs.push('Doorway chest stretch: 30s × 2, daily.');
    recs.push('Band pull-aparts: 3×15.');
  }
  if (has('anterior-pelvic')) {
    recs.push('Hip flexor stretch + glute bridges most days.');
    recs.push('Stand and move every 30–45 minutes.');
  }
  if (has('slouching')) {
    recs.push('Short thoracic extension breaks over a chair edge or foam roller.');
    recs.push('Wall posture cue: head, upper back, hips stacked.');
  }
  if (has('shoulder-asymmetry')) {
    recs.push('Check one-sided carry habits and add balanced pulling strength work.');
  }
  if (has('hip-alignment')) {
    recs.push('Stand with weight spread evenly through both feet and monitor hip shift.');
  }
  if (has('chest-ribcage')) {
    recs.push('Expand the chest with breath + gentle doorway pec stretches (not medical advice).');
  }
  if (has('winging-scapula')) {
    recs.push('Serratus drills (wall slides, punch-outs) if you have pain get evaluated in person.');
  }
  if (recs.length === 0) {
    recs.push('Keep moving regularly; one photo is not a diagnosis.');
    recs.push('Re-scan from true side profile with full body in frame for best accuracy.');
  }
  return recs;
}

export interface PersonalizedExercise {
  name: string;
  emoji: string;
  duration: number;
  targetProblem: string;
  instructions: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface PersonalizedProgram {
  title: string;
  totalDuration: string;
  exercises: PersonalizedExercise[];
  focusAreas: string[];
  dailyGoal: string;
}

export function generatePersonalizedProgram(report: PostureReport): PersonalizedProgram {
  const exercises: PersonalizedExercise[] = [];
  const focusAreas: string[] = [];
  const exerciseDB: Record<string, PersonalizedExercise[]> = {
    'forward-head': [
      { name: 'Chin Tucks', emoji: '🧘', duration: 30, targetProblem: 'Forward Head', priority: 'high',
        instructions: ['Sit tall', 'Glide chin straight back', 'Hold 5s', 'Repeat 10×'] },
      { name: 'Upper trap stretch', emoji: '🙆', duration: 45, targetProblem: 'Forward Head', priority: 'medium',
        instructions: ['Gentle side bend', '20–30s each side', '2 rounds'] },
    ],
    'rounded-shoulders': [
      { name: 'Doorway pec stretch', emoji: '🚪', duration: 45, targetProblem: 'Rounded Shoulders', priority: 'high',
        instructions: ['Forearms on frame', 'Step through gently', '30s × 3'] },
      { name: 'Band pull-aparts', emoji: '💪', duration: 45, targetProblem: 'Rounded Shoulders', priority: 'high',
        instructions: ['Soft elbows', 'Pinch shoulder blades', '3×15'] },
    ],
    'anterior-pelvic': [
      { name: 'Hip flexor stretch', emoji: '🦵', duration: 60, targetProblem: 'Pelvic tilt', priority: 'high',
        instructions: ['Half-kneel', 'Slight tuck', '30s each'] },
      { name: 'Glute bridge', emoji: '🌉', duration: 45, targetProblem: 'Pelvic tilt', priority: 'high',
        instructions: ['Ribs down', 'Squeeze glutes', '12–15 reps'] },
    ],
    'slouching': [
      { name: 'Thoracic extension', emoji: '🤸', duration: 45, targetProblem: 'Upper back', priority: 'high',
        instructions: ['Hands behind head', 'Extend over chair', '8–10 reps'] },
      { name: 'Wall stand', emoji: '🧱', duration: 30, targetProblem: 'Upper back', priority: 'medium',
        instructions: ['Head, shoulders, hips on wall', 'Breathe easy', '30s'] },
    ],
    'shoulder-asymmetry': [
      { name: 'Side plank (weaker side)', emoji: '🏋️', duration: 30, targetProblem: 'Shoulder balance', priority: 'medium',
        instructions: ['Short holds', '20s × 3', 'Stay tall'] },
    ],
    'hip-alignment': [
      { name: 'Single-leg bridge', emoji: '🌉', duration: 45, targetProblem: 'Hip balance', priority: 'medium',
        instructions: ['Slow reps', '10 each leg', '2 sets'] },
    ],
    'chest-ribcage': [
      { name: 'Doorway chest opener', emoji: '🚪', duration: 45, targetProblem: 'Chest / ribs', priority: 'high',
        instructions: ['Forearms on frame', 'Step through softly', '30s × 3'] },
    ],
    'winging-scapula': [
      { name: 'Wall slide', emoji: '🧱', duration: 45, targetProblem: 'Scapula control', priority: 'high',
        instructions: ['Back to wall', 'Slide arms', '10 slow reps'] },
    ],
  };

  const detected = report.problems.filter(p => p.score >= 20);
  for (const problem of detected) {
    const list = exerciseDB[problem.id];
    if (list) {
      focusAreas.push(problem.name);
      exercises.push(...list.filter(e => e.priority === 'high'), ...list.filter(e => e.priority === 'medium'));
    }
  }
  const unique = exercises.filter((e, i, arr) => arr.findIndex(x => x.name === e.name) === i).slice(0, 8);
  const totalSeconds = unique.reduce((sum, e) => sum + e.duration, 0);
  const totalMinutes = Math.ceil(totalSeconds / 60);
  return {
    title: detected.length > 0 ? `Your ${totalMinutes}-minute focus plan` : 'Maintenance routine',
    totalDuration: `${totalMinutes} min`,
    exercises: unique,
    focusAreas: [...new Set(focusAreas)],
    dailyGoal: detected.length >= 3 ? 'Prefer 2 short sessions per day' : 'One focused session per day is a great start',
  };
}

/** Map scan finding IDs to in-app problem routes (best-effort). */
export const SCAN_TO_APP_PROBLEM: Record<string, string> = {
  'forward-head': 'forward-head',
  'rounded-shoulders': 'rounded-shoulders',
  'anterior-pelvic': 'anterior-pelvic',
  'slouching': 'kyphosis',
  'shoulder-asymmetry': 'uneven-shoulders',
  'hip-alignment': 'anterior-pelvic',
  'chest-ribcage': 'rounded-shoulders',
  'winging-scapula': 'winging-scapula',
};

/**
 * Stabilize a raw score by clamping small noise into dead-zones.
 * Scores below 20 → 0; otherwise snap to coarse bands (25 / 45 / 65 / 80).
 */
export function stabilizeScore(rawScore: number): {
  score: number;
  band: 'none' | 'mild' | 'moderate' | 'severe';
} {
  if (rawScore < 20) return { score: 0, band: 'none' };
  if (rawScore < 35) return { score: 25, band: 'mild' };
  if (rawScore < 55) return { score: 45, band: 'moderate' };
  if (rawScore < 75) return { score: 65, band: 'moderate' };
  return { score: 80, band: 'severe' };
}

export function classifyOverallSeverityBand(
  report: PostureReport,
): 'mild' | 'moderate' | 'severe' {
  const detected = report.problems.filter(p => p.score >= 20);
  if (detected.length === 0) return 'mild';

  const maxScore = Math.max(...detected.map(p => p.score));
  if (maxScore >= 65) return 'severe';
  if (maxScore >= 40 || detected.length >= 3) return 'moderate';
  return 'mild';
}

export function stabilizeReport(report: PostureReport): PostureReport {
  const stabilized = report.problems.map(p => {
    const { score, band } = stabilizeScore(p.score);
    return {
      ...p,
      score,
      severity: band === 'none' ? 'none' as const : band,
      healthScore: Math.max(0, 100 - score),
      displayPercent: Math.max(0, 100 - score),
    };
  });

  const detected = stabilized.filter(p => p.score >= 20);
  const avg = stabilized.length
    ? stabilized.reduce((s, p) => s + p.score, 0) / stabilized.length
    : 0;

  return {
    ...report,
    problems: stabilized.sort((a, b) => b.score - a.score),
    overallScore: Math.max(0, Math.round(100 - avg)),
    recommendations: generateRecommendations(detected),
  };
}

export function finalizeAssessment(rawReport: PostureReport): {
  report: PostureReport;
  level: PostureLevel;
  detectedProblems: string[];
  profile: UserProfile;
} {
  const report = stabilizeReport(rawReport);
  const detected = report.problems.filter(p => p.score >= 20);
  const detectedIds = detected.map(p => p.id);
  const severityBand = classifyOverallSeverityBand(report);

  const existingProfile = loadUserProfile() ?? {} as Partial<UserProfile>;
  const level = determinePostureLevel(detectedIds, severityBand, existingProfile);
  const difficulty = levelToDefaultDifficulty(level);

  const profile = saveUserProfile({
    postureLevel: level,
    detectedProblems: detectedIds,
    problemCount: detectedIds.length,
    scanTimestamp: Date.now(),
    exerciseDifficulty: difficulty,
  });

  return { report, level, detectedProblems: detectedIds, profile };
}
