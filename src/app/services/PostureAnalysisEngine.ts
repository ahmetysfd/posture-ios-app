/**
 * PostureAnalysisEngine — MediaPipe landmarks → posture checks + program builder.
 * See INTEGRATION_GUIDE in repo root / posture-ai folder for threshold tuning.
 */

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
  });
}

function checkSlouching(landmarks: Landmark[]): PostureProblem {
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

/** How much each finding trusts a given intended camera angle (0–1). */
const VIEW_WEIGHT: Record<string, Partial<Record<IntendedView, number>>> = {
  'forward-head': { side: 1, front: 0.4, back: 0.2 },
  'rounded-shoulders': { side: 0.95, front: 0.8, back: 0.72 },
  'anterior-pelvic': { side: 1, front: 0.45, back: 0.45 },
  'slouching': { side: 1, front: 0.4, back: 0.35 },
  'shoulder-asymmetry': { front: 1, side: 0.3, back: 0.88 },
  'hip-alignment': { front: 1, side: 0.3, back: 0.92 },
};

export function analyzePosture(landmarks: Landmark[]): PostureReport {
  if (!landmarks || landmarks.length < 33) {
    throw new Error('Need 33 landmarks from MediaPipe Pose');
  }
  const viewType = detectViewType(landmarks);
  const allProblems: PostureProblem[] = [
    checkForwardHead(landmarks),
    checkRoundedShoulders(landmarks),
    checkAnteriorPelvicTilt(landmarks),
    checkSlouching(landmarks),
    checkShoulderAsymmetry(landmarks),
    checkHipAlignment(landmarks),
  ];
  const detectedProblems = allProblems.filter(p => p.score >= 15);
  const avgProblemScore = allProblems.reduce((sum, p) => sum + p.score, 0) / allProblems.length;
  const overallScore = Math.max(0, Math.round(100 - avgProblemScore));
  return {
    overallScore,
    problems: allProblems
      .map(problem => finalizeProblem({
        ...problem,
        dominantView: viewType === 'side' ? 'side' : 'front',
        confidenceLevel: 'single-view',
        confidenceLabel: 'Single-photo screening result.',
      }))
      .sort((a, b) => b.score - a.score),
    viewType,
    recommendations: generateRecommendations(detectedProblems),
    timestamp: Date.now(),
  };
}

/** Same landmark checks, but scores are weighted by which photo angle you intended (front / side / back). */
export function analyzePostureForView(landmarks: Landmark[], intended: IntendedView): PostureReport {
  const raw = analyzePosture(landmarks);
  const weighted = raw.problems.map(p => {
    const w = VIEW_WEIGHT[p.id]?.[intended] ?? 0.55;
    const score = Math.min(100, Math.round(p.score * w));
    return finalizeProblem({
      ...p,
      score,
      severity: getSeverity(score),
      dominantView: intended,
      confidenceLevel: 'single-view',
      confidenceLabel: getSingleViewConfidenceLabel(intended),
    });
  });
  const detected = weighted.filter(p => p.score >= 15);
  const avg = weighted.reduce((sum, p) => sum + p.score, 0) / weighted.length;
  return {
    overallScore: Math.max(0, Math.round(100 - avg)),
    problems: weighted.sort((a, b) => b.score - a.score),
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
    const averageScore = Math.round(
      candidates.reduce((sum, candidate) => sum + candidate.problem.score, 0) / candidates.length,
    );
    const mergedScore = bestCandidate.problem.score >= 15
      ? Math.round(bestCandidate.problem.score * 0.75 + averageScore * 0.25)
      : averageScore;
    const supportingViews = candidates
      .filter(candidate => candidate.problem.score >= 15)
      .map(candidate => candidate.view);
    const confidence = summarizeConfidence(
      supportingViews.length ? supportingViews : [bestCandidate.view],
      bestCandidate.view,
    );

    merged.push(finalizeProblem({
      ...bestCandidate.problem,
      score: mergedScore,
      severity: getSeverity(mergedScore),
      dominantView: bestCandidate.view,
      confidenceLevel: confidence.confidenceLevel,
      confidenceLabel: confidence.confidenceLabel,
      details: `${bestCandidate.problem.details} ${confidence.confidenceLabel}`.trim(),
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
  const bestByRegion = new Map<BodyRegion, PostureProblem>();

  problems
    .filter(problem => problem.score >= 15)
    .sort((a, b) => b.score - a.score)
    .forEach(problem => {
      const current = bestByRegion.get(problem.bodyRegion);
      if (!current || problem.score > current.score) {
        bestByRegion.set(problem.bodyRegion, problem);
      }
    });

  return [...bestByRegion.values()].sort((a, b) => b.score - a.score).slice(0, max);
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
  };

  const detected = report.problems.filter(p => p.score >= 15);
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
};
