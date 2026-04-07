/**
 * DailyProgram — generates a personalized daily exercise program from the user profile,
 * persists it to localStorage, tracks completion per exercise, and computes streak/stats.
 */

import { postureProblems, type Exercise } from '../data/postureData';
import type { UserProfile, ExerciseDifficulty } from './UserProfile';
import type { PersonalizedProgram } from './PostureAnalysisEngine';

const STORAGE_KEY = 'posturefix_daily_program';
const PROGRESS_KEY = 'posturefix_progress_log';
const SCHEMA_VERSION = 2; // bump when generation logic changes to force regeneration

// Map profile / scan problem IDs → postureData problem IDs (some scan IDs differ)
const TO_APP_PROBLEM: Record<string, string> = {
  'forward-head': 'forward-head',
  'winging-scapula': 'winging-scapula',
  'rounded-shoulders': 'rounded-shoulders',
  'kyphosis': 'kyphosis',
  'uneven-shoulders': 'uneven-shoulders',
  'anterior-pelvic': 'anterior-pelvic',
  // scan result IDs that differ from app problem IDs
  'slouching': 'kyphosis',
  'shoulder-asymmetry': 'uneven-shoulders',
  'hip-alignment': 'anterior-pelvic',
  'chest-ribcage': 'rounded-shoulders',
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DailyExercise {
  id: string;
  name: string;
  emoji: string;
  duration: number;             // seconds per set
  sets: number;
  displayReps: string;          // e.g. "10–12 reps" or "40s"
  difficulty: ExerciseDifficulty;
  targetProblemIds: string[];   // all app problem route IDs this exercise addresses
  targetProblemLabels: string[]; // human-readable labels (merged when deduped)
  postureTypes: string[];       // merged list of posture type labels for this exercise
  instructions: string[];
  youtubeUrl?: string;
  requiresEquipment?: boolean;
  completed: boolean;
}

export interface StoredDailyProgram {
  generatedAt: number;          // ms timestamp
  profileVersion: number;       // profile.scanTimestamp — detects stale programs
  schemaVersion?: number;       // bumped when generation logic changes to force regeneration
  exercises: DailyExercise[];
  totalDurationMin: number;
  focusAreas: string[];
  completedAt?: number;         // set when all exercises are marked complete
}

export interface ProgressEntry {
  date: string;                 // YYYY-MM-DD
  minutesCompleted: number;
  exerciseCount: number;
  fullyCompleted: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// 1 set per exercise — no multi-set rest needed
const REST_BETWEEN_SEC = 15;
const TARGET_MIN_SEC   = 600; // 10 min
const TARGET_MAX_SEC   = 720; // 12 min

function isStrength(name: string): boolean {
  return /raise|row|fly|pull|push|bridge|plank|squat|swimmer|rocket|banded|cuffed/i.test(name);
}

type ExercisePhase = 'mobility' | 'activation' | 'strength';

/** Classify exercise into session phase for sequencing. */
function getPhase(name: string): ExercisePhase {
  if (/foam roll|massage|opener|stretch|twist/i.test(name)) return 'mobility';
  if (isStrength(name)) return 'strength';
  return 'activation';
}

type ProblemSeverity = 'mild' | 'moderate' | 'severe';

function severityToDiff(severity: ProblemSeverity): ExerciseDifficulty {
  if (severity === 'severe')   return 'beginner';
  if (severity === 'moderate') return 'medium';
  return 'hard';
}

function severityWeight(severity: ProblemSeverity): number {
  if (severity === 'severe')   return 3;
  if (severity === 'moderate') return 2;
  return 1;
}

function getDisplayReps(ex: Exercise, diff: ExerciseDifficulty): string {
  if (isStrength(ex.name)) {
    if (diff === 'beginner') return '8–10 reps';
    if (diff === 'medium') return '10–12 reps';
    return '12–15 reps';
  }
  // stretch — time-based using the exercise's native duration
  return `${ex.duration}s`;
}

// ── Priority map ──────────────────────────────────────────────────────────────
// Exercise names in descending priority per problem per difficulty tier.
// mild severity → use 'hard' tier first; moderate → 'medium'; severe → 'beginner'.

const PRIORITY: Record<string, Record<ExerciseDifficulty, string[]>> = {
  'forward-head': {
    beginner: ['Chin Tuck', 'Supine Chin Tuck', 'Side Lying Chin Tuck', 'Weight Assisted Neck Stretch', 'Suboccipital Massage'],
    medium:   ['Wall Lean Chin Tuck', 'Chin Tuck Floor Angels', 'Chin Tuck Rotations'],
    hard:     ['Banded Chin Tucks', 'Chin Tuck Neck Bridge', 'Prone Chin Tuck'],
  },
  'rounded-shoulders': {
    beginner: ['Air Angel', 'Thoracic Openers', 'Thoracic Foam Roll', 'Shoulder Rockets'],
    medium:   ['Wall Angel', 'Floor Angel'],
    hard:     ['Bent Over Y Raise', 'Cuffed Angels'],
  },
  'kyphosis': {
    beginner: ['Air Angel', 'Thoracic Openers', 'Thoracic Foam Roll', 'Supine Chin Tuck'],
    medium:   ['Wall Angel', 'Floor Angel'],
    hard:     ['Bent Over Y Raise', 'Swimmers', 'Chin Tuck Floor Angels', 'Cuffed Angels'],
  },
  'anterior-pelvic': {
    beginner: ['Supine Pelvic Tilt', 'Standing Pelvic Tilt', 'Pelvic Twist'],
    medium:   ['Wall Lean Plank', 'Split Squat Pelvic Tilts'],
    hard:     ['Swimmers'],
  },
  'uneven-shoulders': {
    beginner: ['Air Angel', 'Thoracic Openers', 'Shoulder Rockets', 'Thoracic Foam Roll', 'Weight Assisted Neck Stretch'],
    medium:   ['Wall Angel'],
    hard:     ['Overhead Shrug Neck Rotations'],
  },
  'winging-scapula': {
    beginner: ['Wall Angel', 'Air Angel', 'Shoulder Rockets', 'Thoracic Foam Roll'],
    medium:   ['Floor Angel'],
    hard:     ['Bent Over Y Raise', 'Cuffed Angels', 'Chin Tuck Floor Angels'],
  },
};

// ── Static cross-reference: exercise name → all problem IDs it addresses ──────
// Derived directly from the priority list. Used to enrich targetProblemLabels
// after selection so an exercise always shows every issue it targets.
const EXERCISE_PROBLEMS: Record<string, string[]> = {
  // Forward Head only
  'Chin Tuck':               ['forward-head'],
  'Side Lying Chin Tuck':    ['forward-head'],
  'Suboccipital Massage':    ['forward-head'],
  'Wall Lean Chin Tuck':     ['forward-head'],
  'Chin Tuck Rotations':     ['forward-head'],
  'Banded Chin Tucks':       ['forward-head'],
  'Chin Tuck Neck Bridge':   ['forward-head'],
  'Prone Chin Tuck':         ['forward-head'],
  // Forward Head + Kyphosis
  'Supine Chin Tuck':        ['forward-head', 'kyphosis'],
  // Forward Head + Uneven Shoulders
  'Weight Assisted Neck Stretch': ['forward-head', 'uneven-shoulders'],
  // Forward Head + Kyphosis + Winging Scapula
  'Chin Tuck Floor Angels':  ['forward-head', 'kyphosis', 'winging-scapula'],
  // Rounded Shoulders + Kyphosis + Uneven Shoulders + Winging Scapula
  'Air Angel':               ['rounded-shoulders', 'kyphosis', 'uneven-shoulders', 'winging-scapula'],
  'Thoracic Foam Roll':      ['rounded-shoulders', 'kyphosis', 'uneven-shoulders', 'winging-scapula'],
  'Wall Angel':              ['rounded-shoulders', 'kyphosis', 'uneven-shoulders', 'winging-scapula'],
  // Rounded Shoulders + Kyphosis + Uneven Shoulders
  'Thoracic Openers':        ['rounded-shoulders', 'kyphosis', 'uneven-shoulders'],
  // Rounded Shoulders + Uneven Shoulders + Winging Scapula
  'Shoulder Rockets':        ['rounded-shoulders', 'uneven-shoulders', 'winging-scapula'],
  // Rounded Shoulders + Kyphosis + Winging Scapula
  'Floor Angel':             ['rounded-shoulders', 'kyphosis', 'winging-scapula'],
  'Bent Over Y Raise':       ['rounded-shoulders', 'kyphosis', 'winging-scapula'],
  'Cuffed Angels':           ['rounded-shoulders', 'kyphosis', 'winging-scapula'],
  // Kyphosis + Anterior Pelvic Tilt
  'Swimmers':                ['kyphosis', 'anterior-pelvic'],
  // Anterior Pelvic Tilt only
  'Supine Pelvic Tilt':      ['anterior-pelvic'],
  'Standing Pelvic Tilt':    ['anterior-pelvic'],
  'Pelvic Twist':            ['anterior-pelvic'],
  'Wall Lean Plank':         ['anterior-pelvic'],
  'Split Squat Pelvic Tilts':['anterior-pelvic'],
  // Uneven Shoulders only
  'Overhead Shrug Neck Rotations': ['uneven-shoulders'],
};

// ── Generation ────────────────────────────────────────────────────────────────

/**
 * Return all exercises for `problem` in priority order, walking tiers in `tierOrder`.
 * Deduplication against other problems is handled by the caller.
 */
function getPriorityCandidates(
  problem: { exerciseList: Exercise[] },
  appId: string,
  tierOrder: ExerciseDifficulty[],
): Exercise[] {
  const nameIndex = new Map(problem.exerciseList.map(e => [e.name, e]));
  const priorityMap = PRIORITY[appId];
  const result: Exercise[] = [];
  for (const tier of tierOrder) {
    for (const name of (priorityMap?.[tier] ?? [])) {
      const ex = nameIndex.get(name);
      if (ex) result.push(ex);
    }
  }
  return result;
}

function makeEntry(
  ex: Exercise,
  appId: string,
  problemTitle: string,
  diff: ExerciseDifficulty,
): DailyExercise {
  const exDiff = (ex.difficulty as ExerciseDifficulty) ?? diff;
  return {
    id: ex.id,
    name: ex.name,
    emoji: ex.emoji,
    duration: ex.duration,
    sets: 1,
    displayReps: getDisplayReps(ex, exDiff),
    difficulty: exDiff,
    targetProblemIds: [appId],
    targetProblemLabels: [problemTitle],
    postureTypes: [problemTitle],
    instructions: ex.instructions,
    youtubeUrl: ex.youtubeUrl,
    requiresEquipment: ex.requiresEquipment ?? false,
    completed: false,
  };
}

export function generateDailyProgram(profile: UserProfile): StoredDailyProgram {
  const detectedIds: string[] = profile.detectedProblems ?? [];
  const problemSeverities = profile.detectedProblemSeverities ?? {};
  const overallDiff: ExerciseDifficulty = profile.exerciseDifficulty ?? 'medium';
  const hasEquipment = profile.hasEquipment !== false; // default: assume equipment available

  const tierOrderMap: Record<ExerciseDifficulty, ExerciseDifficulty[]> = {
    beginner: ['beginner', 'medium'],
    medium:   ['medium', 'beginner'],
    hard:     ['hard', 'medium'],
  };

  // ── Step 1: Build per-problem entries with individual severity + difficulty ──

  type ProblemEntry = {
    appId: string;
    rawId: string;
    problem: typeof postureProblems[0];
    severity: ProblemSeverity;
    diff: ExerciseDifficulty;
    weight: number;
    candidates: Exercise[];
  };

  const focusAreas: string[] = [];
  const problemEntries: ProblemEntry[] = [];

  for (const rawId of detectedIds) {
    const appId = TO_APP_PROBLEM[rawId] ?? rawId;
    const problem = postureProblems.find(p => p.id === appId);
    if (!problem) continue;

    // Per-problem severity: try app ID, then raw scan ID, then fall back to overall
    const severity: ProblemSeverity =
      problemSeverities[appId] ??
      problemSeverities[rawId] ??
      (overallDiff === 'beginner' ? 'severe' : overallDiff === 'hard' ? 'mild' : 'moderate');

    const diff = severityToDiff(severity);
    const tierOrder = tierOrderMap[diff];

    let candidates = getPriorityCandidates(problem, appId, tierOrder);
    // Equipment filter: remove exercises that require gear the user doesn't have
    if (!hasEquipment) {
      candidates = candidates.filter(ex => !ex.requiresEquipment);
    }

    focusAreas.push(problem.title);
    problemEntries.push({ appId, rawId, problem, severity, diff, weight: severityWeight(severity), candidates });
  }

  // Sort by severity so the most impactful problem is processed first
  problemEntries.sort((a, b) => b.weight - a.weight);

  // ── Step 2: Weighted slot allocation ──────────────────────────────────────
  // Severe problem gets 3 slots, moderate 2, mild 1.
  // Total pool target = 10 exercises before time cutoff trims.

  const TARGET_POOL = 10;
  const totalWeight = problemEntries.reduce((s, e) => s + e.weight, 0) || 1;

  type MergedEntry = { exercise: Exercise; diff: ExerciseDifficulty };
  const labelMap = new Map<string, { appIds: string[]; titles: string[]; diff: ExerciseDifficulty }>();
  const merged: MergedEntry[] = [];
  const seenNames = new Set<string>();

  for (const entry of problemEntries) {
    const slots = Math.max(1, Math.round((entry.weight / totalWeight) * TARGET_POOL));
    let taken = 0;
    for (const ex of entry.candidates) {
      const key = ex.name;
      if (seenNames.has(key)) {
        // Always merge labels onto existing exercises regardless of slot quota
        const lbl = labelMap.get(key)!;
        if (!lbl.appIds.includes(entry.appId)) {
          lbl.appIds.push(entry.appId);
          lbl.titles.push(entry.problem.title);
        }
      } else {
        // Slot quota only blocks adding brand-new exercises
        if (taken >= slots) continue;
        seenNames.add(key);
        labelMap.set(key, { appIds: [entry.appId], titles: [entry.problem.title], diff: entry.diff });
        merged.push({ exercise: ex, diff: entry.diff });
        taken++;
      }
    }
  }

  // ── Step 3: Duration-based selection ─────────────────────────────────────
  // Accumulate until ≥ TARGET_MIN_SEC; stop before exceeding TARGET_MAX_SEC.

  const selectedMap = new Map<string, DailyExercise>(); // keyed by name
  let accSec = 0;

  for (const { exercise: ex, diff } of merged) {
    const slot = ex.duration + REST_BETWEEN_SEC;
    if (accSec >= TARGET_MIN_SEC && accSec + slot > TARGET_MAX_SEC) break;
    const lbl = labelMap.get(ex.name) ?? { appIds: [], titles: [], diff };
    const entry = makeEntry(ex, lbl.appIds[0] ?? '', lbl.titles[0] ?? '', lbl.diff);
    entry.targetProblemIds = lbl.appIds;
    entry.targetProblemLabels = lbl.titles;
    entry.postureTypes = lbl.titles;
    selectedMap.set(ex.name, entry);
    accSec += slot;
  }

  // ── Step 4: Smarter fallback ──────────────────────────────────────────────
  // If fewer than 4 exercises, pad from the highest-severity detected problem.

  if (selectedMap.size < 4 && problemEntries.length > 0) {
    const primary = problemEntries[0]; // already sorted by weight desc
    for (const ex of primary.candidates) {
      if (selectedMap.has(ex.name)) continue;
      const slot = ex.duration + REST_BETWEEN_SEC;
      if (accSec >= TARGET_MIN_SEC && accSec + slot > TARGET_MAX_SEC) break;
      const entry = makeEntry(ex, primary.appId, primary.problem.title, primary.diff);
      selectedMap.set(ex.name, entry);
      accSec += slot;
    }
  }

  // ── Step 5: Phase sequencing ──────────────────────────────────────────────
  // Every session: Mobility (release) → Activation (motor control) → Strength.

  const phaseOrder: Record<ExercisePhase, number> = { mobility: 0, activation: 1, strength: 2 };
  const selected = [...selectedMap.values()].sort(
    (a, b) => phaseOrder[getPhase(a.name)] - phaseOrder[getPhase(b.name)],
  );

  // ── Step 6: Enrich labels from static cross-reference ────────────────────
  // Build the set of app-normalised problem IDs the user actually has so we
  // only surface issues that are relevant to this user.
  const userAppIds = new Set(
    detectedIds.map(rawId => TO_APP_PROBLEM[rawId] ?? rawId),
  );

  for (const ex of selected) {
    const allIds = EXERCISE_PROBLEMS[ex.name];
    if (!allIds) continue;
    const relevantIds = allIds.filter(id => userAppIds.has(id));
    if (relevantIds.length === 0) continue;
    // Primary reason the exercise was selected comes first; rest follow static map order
    const primaryId = ex.targetProblemIds[0];
    const ordered = [
      ...(relevantIds.includes(primaryId) ? [primaryId] : []),
      ...relevantIds.filter(id => id !== primaryId),
    ];
    ex.targetProblemIds = ordered;
    ex.targetProblemLabels = ordered.map(
      id => postureProblems.find(p => p.id === id)?.title ?? id,
    );
    ex.postureTypes = ex.targetProblemLabels;
  }

  return {
    generatedAt: Date.now(),
    profileVersion: profile.scanTimestamp,
    schemaVersion: SCHEMA_VERSION,
    exercises: selected,
    totalDurationMin: Math.round(accSec / 60),
    focusAreas: [...new Set(focusAreas)],
  };
}

// ── Persistence ───────────────────────────────────────────────────────────────

export function loadDailyProgram(): StoredDailyProgram | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDailyProgram;
  } catch {
    return null;
  }
}

export function saveDailyProgram(program: StoredDailyProgram): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
}

// ── Exercise streak tracking ──────────────────────────────────────────────────

const STREAK_KEY = 'posturefix_exercise_streak';
const UPGRADE_OFFERED_KEY = 'posturefix_upgrade_offered';

type ExerciseStreakStore = Record<string, { daysCompleted: number; lastDate: string }>;

function loadExerciseStreaks(): ExerciseStreakStore {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) ?? '{}'); }
  catch { return {}; }
}

function saveExerciseStreaks(store: ExerciseStreakStore): void {
  localStorage.setItem(STREAK_KEY, JSON.stringify(store));
}

export function getExerciseDaysCompleted(name: string): number {
  return loadExerciseStreaks()[name]?.daysCompleted ?? 0;
}

export function incrementExerciseStreak(name: string): void {
  const store = loadExerciseStreaks();
  const today = todayStr();
  const entry = store[name];
  if (entry?.lastDate === today) return; // already counted today
  store[name] = { daysCompleted: (entry?.daysCompleted ?? 0) + 1, lastDate: today };
  saveExerciseStreaks(store);
}

export function hasUpgradeBeenOffered(name: string): boolean {
  try {
    const offered = JSON.parse(localStorage.getItem(UPGRADE_OFFERED_KEY) ?? '[]') as string[];
    return offered.includes(name);
  } catch { return false; }
}

export function markUpgradeOffered(name: string): void {
  try {
    const offered = JSON.parse(localStorage.getItem(UPGRADE_OFFERED_KEY) ?? '[]') as string[];
    if (!offered.includes(name)) {
      offered.push(name);
      localStorage.setItem(UPGRADE_OFFERED_KEY, JSON.stringify(offered));
    }
  } catch { /* ignore */ }
}

/**
 * Find the best upgrade candidate for an exercise:
 * 1. Next-tier exercises the user has never done (daysCompleted === 0), in PRIORITY order
 * 2. If all have been done, pick the least-completed one
 * Returns null for Hard exercises or when no candidates exist in postureData.
 */
export function getUpgradeSuggestion(
  ex: DailyExercise,
  program: StoredDailyProgram,
): Exercise | null {
  if (ex.difficulty === 'hard') return null;
  const nextTier: ExerciseDifficulty = ex.difficulty === 'beginner' ? 'medium' : 'hard';
  const selectedNames = new Set(program.exercises.map(e => e.name));
  const streaks = loadExerciseStreaks();
  const candidates: Exercise[] = [];
  const seen = new Set<string>();

  for (const problemId of ex.targetProblemIds) {
    const priorityNames = PRIORITY[problemId]?.[nextTier] ?? [];
    const problem = postureProblems.find(p => p.id === problemId);
    if (!problem) continue;
    const nameIndex = new Map(problem.exerciseList.map(e => [e.name, e]));
    for (const name of priorityNames) {
      if (seen.has(name) || selectedNames.has(name)) continue;
      const exercise = nameIndex.get(name);
      if (!exercise) continue;
      seen.add(name);
      candidates.push(exercise);
    }
  }

  if (candidates.length === 0) return null;

  // Prefer never-done; fall back to least completed
  const neverDone = candidates.filter(c => !streaks[c.name] || streaks[c.name].daysCompleted === 0);
  if (neverDone.length > 0) return neverDone[0];
  return [...candidates].sort(
    (a, b) => (streaks[a.name]?.daysCompleted ?? 0) - (streaks[b.name]?.daysCompleted ?? 0),
  )[0];
}

// ── Completion ────────────────────────────────────────────────────────────────

export function markExerciseComplete(exerciseId: string): StoredDailyProgram | null {
  const program = loadDailyProgram();
  if (!program) return null;

  // Track per-exercise day streak before mutating
  const target = program.exercises.find(e => e.id === exerciseId);
  if (target) incrementExerciseStreak(target.name);

  const updated: StoredDailyProgram = {
    ...program,
    exercises: program.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, completed: true } : ex,
    ),
  };

  const allDone = updated.exercises.every(ex => ex.completed);
  if (allDone && !updated.completedAt) {
    updated.completedAt = Date.now();
    logProgress({
      date: todayStr(),
      minutesCompleted: updated.totalDurationMin,
      exerciseCount: updated.exercises.length,
      fullyCompleted: true,
    });
  }

  saveDailyProgram(updated);
  return updated;
}

// ── Progress log ──────────────────────────────────────────────────────────────

export function loadProgressLog(): ProgressEntry[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProgressEntry[];
  } catch {
    return [];
  }
}

function logProgress(entry: ProgressEntry): void {
  const log = loadProgressLog();
  const idx = log.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    log[idx] = entry;
  } else {
    log.push(entry);
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(log));
}

export function getDailyStats(): {
  streak: number;
  totalMinutes: number;
  completedToday: boolean;
} {
  const log = loadProgressLog();
  const today = todayStr();
  const completedDates = new Set(log.filter(e => e.fullyCompleted).map(e => e.date));
  const completedToday = completedDates.has(today);
  const totalMinutes = log.reduce((sum, e) => sum + (e.minutesCompleted ?? 0), 0);

  // Count consecutive completed days ending today (or yesterday if today not yet done)
  let streak = 0;
  const d = new Date();
  if (!completedToday) d.setDate(d.getDate() - 1); // look back one day if today not done
  while (completedDates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return { streak, totalMinutes, completedToday };
}

// ── Session bridge ────────────────────────────────────────────────────────────

/** Convert stored program to the PersonalizedProgram shape for PersonalizedProgramScreen. */
export function toProgramScreenFormat(program: StoredDailyProgram): PersonalizedProgram {
  const { exercises, totalDurationMin, focusAreas } = program;
  return {
    title: `Your ${totalDurationMin}-minute daily plan`,
    totalDuration: `${totalDurationMin} min`,
    exercises: exercises.map(ex => ({
      name: ex.name,
      emoji: ex.emoji,
      duration: ex.duration,
      targetProblem: ex.targetProblemLabels.join(', '),
      instructions: ex.instructions,
      priority: ex.difficulty === 'hard' ? 'high' : ex.difficulty === 'medium' ? 'medium' : 'low',
      sets: ex.sets,
      displayReps: ex.displayReps,
      requiresEquipment: ex.requiresEquipment,
    })),
    focusAreas,
    dailyGoal:
      focusAreas.length >= 3
        ? 'Consider 2 short sessions per day for faster results'
        : 'One focused session per day builds lasting change',
  };
}

/** Generate, save to localStorage, and write sessionStorage for PersonalizedProgramScreen. */
export function generateAndStoreDailyProgram(profile: UserProfile): StoredDailyProgram {
  const program = generateDailyProgram(profile);
  saveDailyProgram(program);
  try {
    sessionStorage.setItem('personalizedProgram', JSON.stringify(toProgramScreenFormat(program)));
  } catch { /* ignore private-mode quota errors */ }
  return program;
}

/**
 * Load the existing program if the profile hasn't changed (same scanTimestamp),
 * otherwise regenerate. Always refreshes sessionStorage.
 */
export function getOrRefreshDailyProgram(profile: UserProfile): StoredDailyProgram {
  const existing = loadDailyProgram();
  if (
    existing &&
    existing.profileVersion === profile.scanTimestamp &&
    existing.schemaVersion === SCHEMA_VERSION
  ) {
    try {
      sessionStorage.setItem('personalizedProgram', JSON.stringify(toProgramScreenFormat(existing)));
    } catch { /* ignore */ }
    return existing;
  }
  return generateAndStoreDailyProgram(profile);
}

// ── Customization ─────────────────────────────────────────────────────────────

export const DURATION_PRESETS = [15, 20, 30, 45, 60, 90, 120]; // seconds
export const REPS_PRESETS = ['8–10 reps', '10–12 reps', '12–15 reps'];

export function isStrengthExercise(name: string): boolean {
  return isStrength(name);
}

/**
 * Return exercises from the same posture problem(s) as `ex`, excluding
 * exercises already in the program and respecting equipment preference.
 */
export function getReplacementCandidates(
  ex: DailyExercise,
  program: StoredDailyProgram,
  hasEquipment: boolean,
): Exercise[] {
  const selectedNames = new Set(program.exercises.map(e => e.name));
  const seen = new Set<string>();
  const results: Exercise[] = [];

  for (const problemId of ex.targetProblemIds) {
    const problem = postureProblems.find(p => p.id === problemId);
    if (!problem) continue;
    for (const candidate of problem.exerciseList) {
      if (seen.has(candidate.name)) continue;
      if (selectedNames.has(candidate.name)) continue;
      if (!hasEquipment && candidate.requiresEquipment) continue;
      seen.add(candidate.name);
      results.push(candidate);
    }
  }
  return results;
}

/**
 * Swap an exercise in the stored program. Preserves the original's posture
 * problem context, sets, and difficulty. Resets completion state.
 */
export function replaceExercise(
  program: StoredDailyProgram,
  exerciseId: string,
  newExercise: Exercise,
): StoredDailyProgram {
  const original = program.exercises.find(e => e.id === exerciseId);
  if (!original) return program;

  const strength = isStrength(newExercise.name);

  // Derive targets from the static map for the new exercise,
  // filtered to ALL problems present in this program (= user's full detected problem set).
  const userProblemSet = new Set(program.exercises.flatMap(e => e.targetProblemIds));
  const staticIds = EXERCISE_PROBLEMS[newExercise.name];
  const newTargetIds = staticIds
    ? staticIds.filter(id => userProblemSet.has(id))
    : original.targetProblemIds;
  const resolvedIds = newTargetIds.length > 0 ? newTargetIds : original.targetProblemIds;
  const newTargetLabels = resolvedIds.map(
    id => postureProblems.find(p => p.id === id)?.title ?? id,
  );

  const newEntry: DailyExercise = {
    id: newExercise.id,
    name: newExercise.name,
    emoji: newExercise.emoji,
    duration: newExercise.duration,
    sets: original.sets,
    displayReps: strength ? original.displayReps : `${newExercise.duration}s`,
    difficulty: (newExercise.difficulty as ExerciseDifficulty) ?? original.difficulty,
    targetProblemIds: resolvedIds,
    targetProblemLabels: newTargetLabels,
    postureTypes: newTargetLabels,
    instructions: newExercise.instructions,
    youtubeUrl: newExercise.youtubeUrl,
    requiresEquipment: newExercise.requiresEquipment ?? false,
    completed: false,
  };

  const updated: StoredDailyProgram = {
    ...program,
    exercises: program.exercises.map(e => e.id === exerciseId ? newEntry : e),
  };
  saveDailyProgram(updated);
  return updated;
}

/**
 * Update sets and/or duration/reps for a single exercise.
 * Automatically updates displayReps for stretch exercises when duration changes.
 * Recalculates totalDurationMin.
 */
export function updateExerciseParams(
  program: StoredDailyProgram,
  exerciseId: string,
  params: { sets?: number; duration?: number; displayReps?: string },
): StoredDailyProgram {
  const updated: StoredDailyProgram = {
    ...program,
    exercises: program.exercises.map(e => {
      if (e.id !== exerciseId) return e;
      const next = { ...e, ...params };
      if (params.duration !== undefined && !isStrength(e.name)) {
        next.displayReps = `${params.duration}s`;
      }
      return next;
    }),
  };
  const totalSec = updated.exercises.reduce((s, e) => s + e.duration + REST_BETWEEN_SEC, 0);
  updated.totalDurationMin = Math.round(totalSec / 60);
  saveDailyProgram(updated);
  return updated;
}
