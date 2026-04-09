/**
 * DailyProgram — generates a personalized daily exercise program from the user profile,
 * persists it to localStorage, tracks completion per exercise, and computes streak/stats.
 */

import { postureProblems, type Exercise } from '../data/postureData';
import type { UserProfile, ExerciseDifficulty } from './UserProfile';
import type { PersonalizedProgram } from './PostureAnalysisEngine';

const STORAGE_KEY = 'posturefix_daily_program';
const PROGRESS_KEY = 'posturefix_progress_log';
const SCHEMA_VERSION = 8; // bump when generation logic changes to force regeneration

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
  type: ExercisePhase;          // physiological classification: mobility | activation | strength
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

const REST_BETWEEN_SEC = 15; // seconds between exercises

function isStrength(name: string): boolean {
  return /raise|row|fly|pull|push|bridge|plank|squat|swimmer|rocket|banded|cuffed/i.test(name);
}

type ExercisePhase = 'mobility' | 'activation' | 'strength';

/** Classify exercise into session phase — static lookup first, regex as fallback. */
function getPhase(name: string): ExercisePhase {
  const staticType = EXERCISE_TYPE[name];
  if (staticType) return staticType;
  if (/foam roll|massage|opener|stretch|twist/i.test(name)) return 'mobility';
  if (isStrength(name)) return 'strength';
  return 'activation';
}

type ProblemSeverity = 'low' | 'medium' | 'high';

/** Normalize legacy 'mild'/'moderate'/'severe' values alongside new 'low'/'medium'/'high'. */
function normalizeSeverity(raw: string | undefined): ProblemSeverity | undefined {
  if (!raw) return undefined;
  if (raw === 'high' || raw === 'medium' || raw === 'low') return raw as ProblemSeverity;
  if (raw === 'severe')   return 'high';
  if (raw === 'moderate') return 'medium';
  if (raw === 'mild')     return 'low';
  return undefined;
}

function severityToDiff(severity: ProblemSeverity): ExerciseDifficulty {
  if (severity === 'high')   return 'beginner';
  if (severity === 'medium') return 'medium';
  return 'hard'; // low
}

function severityWeight(severity: ProblemSeverity): number {
  if (severity === 'high')   return 3;
  if (severity === 'medium') return 2;
  return 1; // low
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
// Exercises in EXACT priority order per problem per difficulty tier.
// high risk → beginner tier (3 exercises); medium → medium tier (2); low → hard tier (2).
// Each tier has exactly 3 exercises matching the official priority list.

const PRIORITY: Record<string, Record<ExerciseDifficulty, string[]>> = {
  'forward-head': {
    beginner: ['Chin Tuck', 'Supine Chin Tuck', 'Upper Trapezius Stretch'],
    medium:   ['Chin Tuck Floor Angels', 'Chin Tuck Rotations', 'Wall Lean Chin Tuck'],
    hard:     ['Prone Chin Tuck', 'Chin Tuck Neck Bridge', 'Banded Chin Tucks'],
  },
  'rounded-shoulders': {
    beginner: ['Doorway Chest Stretch', 'Quadruped Scapular Push', 'Floor Angel'],
    medium:   ['Air Angel', 'Bear Hold', 'Prone T-Raise'],
    hard:     ['Archer Push-Up', 'Push-Up Plus', 'Y-Pull with Band'],
  },
  'kyphosis': {
    beginner: ['Baby Cobra', 'Foam Roller Thoracic Extension', 'Quadruped Thoracic Rotation (Hand Behind Head)'],
    medium:   ['Thoracic Extension', 'Wall Assisted Shoulder Flexion', 'Wall Slide', 'Scapular Rows'],
    hard:     ['Sphinx Cat Camels', 'Prone Y-Raise', 'Banded Reverse Fly'],
  },
  'anterior-pelvic': {
    beginner: ['Standing Pelvic Tilt', 'Supine Pelvic Tilt', 'Pelvic Rocks'],
    medium:   ['TVA Frog Leg', 'Wall Lean Plank', 'Swimmers'],
    hard:     ['Split Squat Pelvic Tilts', 'Adductor Squeeze Crunch', 'Crossed Leg Forward Stretch'],
  },
  'uneven-shoulders': {
    beginner: ['Lower Trap Activation', 'Levator Scapulae Stretch', 'Wall Lean'],
    medium:   ['Side Plank', 'Bird Dog', 'Banded Lat Pull-Down'],
    hard:     ['Single-Arm Plank', 'Advanced Bird Dog', 'Half Kneel Pallof Press'],
  },
  'winging-scapula': {
    beginner: ['Quadruped Scapular Push', 'Air Angel', 'Floor Angel'],
    medium:   ['Side Lean Wall Slide', 'Wall Angel', 'Scapular Flutters'],
    hard:     ['Quadruped Scapular Circles', 'Bear Crawl Scapular Push Up', 'Elevated Scapular Push Up'],
  },
};

// ── Static cross-reference: exercise name → all problem IDs it addresses ──────
// Rebuilt from the updated PRIORITY map. Exercises appearing in multiple problems
// list all of them — these get merged labels on the exercise card.
const EXERCISE_PROBLEMS: Record<string, string[]> = {
  // ── Forward Head ────────────────────────────────────────────────────────────
  'Chin Tuck':                       ['forward-head'],
  'Supine Chin Tuck':                ['forward-head'],
  'Upper Trapezius Stretch':         ['forward-head'],
  'Chin Tuck Floor Angels':          ['forward-head'],
  'Chin Tuck Rotations':             ['forward-head'],
  'Wall Lean Chin Tuck':             ['forward-head'],
  'Prone Chin Tuck':                 ['forward-head'],
  'Chin Tuck Neck Bridge':           ['forward-head'],
  'Banded Chin Tucks':                ['forward-head'],
  // ── Rounded Shoulders (some shared with Winging Scapula) ────────────────────
  'Doorway Chest Stretch':           ['rounded-shoulders'],
  'Quadruped Scapular Push':         ['rounded-shoulders', 'winging-scapula'],
  'Floor Angel':                     ['rounded-shoulders', 'winging-scapula'],
  'Air Angel':                       ['rounded-shoulders', 'winging-scapula'],
  'Bear Hold':                       ['rounded-shoulders'],
  'Prone T-Raise':                   ['rounded-shoulders'],
  'Archer Push-Up':                  ['rounded-shoulders'],
  'Push-Up Plus':                    ['rounded-shoulders'],
  'Y-Pull with Band':                ['rounded-shoulders'],
  // ── Kyphosis ────────────────────────────────────────────────────────────────
  'Baby Cobra':                      ['kyphosis'],
  'Foam Roller Thoracic Extension':  ['kyphosis'],
  'Quadruped Thoracic Rotation (Hand Behind Head)': ['kyphosis'],
  'Thoracic Extension':              ['kyphosis'],
  'Wall Assisted Shoulder Flexion':  ['kyphosis'],
  'Wall Slide':                      ['kyphosis'],
  'Scapular Rows':                   ['kyphosis'],
  'Sphinx Cat Camels':               ['kyphosis'],
  'Prone Y-Raise':                   ['kyphosis'],
  'Banded Reverse Fly':              ['kyphosis'],
  // ── Anterior Pelvic ─────────────────────────────────────────────────────────
  'Standing Pelvic Tilt':            ['anterior-pelvic'],
  'Supine Pelvic Tilt':              ['anterior-pelvic'],
  'Pelvic Rocks':                    ['anterior-pelvic'],
  'TVA Frog Leg':                    ['anterior-pelvic'],
  'Wall Lean Plank':                 ['anterior-pelvic'],
  'Swimmers':                        ['anterior-pelvic'],
  'Split Squat Pelvic Tilts':        ['anterior-pelvic'],
  'Adductor Squeeze Crunch':         ['anterior-pelvic'],
  'Crossed Leg Forward Stretch':     ['anterior-pelvic'],
  // ── Uneven Shoulders ────────────────────────────────────────────────────────
  'Lower Trap Activation':           ['uneven-shoulders'],
  'Levator Scapulae Stretch':        ['uneven-shoulders'],
  'Wall Lean':                       ['uneven-shoulders'],
  'Side Plank':                      ['uneven-shoulders'],
  'Bird Dog':                        ['uneven-shoulders'],
  'Banded Lat Pull-Down':            ['uneven-shoulders'],
  'Single-Arm Plank':                ['uneven-shoulders'],
  'Advanced Bird Dog':               ['uneven-shoulders'],
  'Half Kneel Pallof Press':         ['uneven-shoulders'],
  // ── Winging Scapula (unique exercises — shared ones listed under RS above) ──
  'Side Lean Wall Slide':            ['winging-scapula'],
  'Wall Angel':                      ['winging-scapula'],
  'Scapular Flutters':               ['winging-scapula'],
  'Quadruped Scapular Circles':      ['winging-scapula'],
  'Bear Crawl Scapular Push Up':     ['winging-scapula'],
  'Elevated Scapular Push Up':       ['winging-scapula'],
};

// ── Static exercise type lookup ───────────────────────────────────────────────
// Physiotherapy classification for every exercise in the PRIORITY map.
// Replaces regex-based phase detection — no guessing from names.
const EXERCISE_TYPE: Record<string, ExercisePhase> = {
  // ── Mobility: release, elongate, restore range of motion ─────────────────
  'Doorway Chest Stretch':                          'mobility',
  'Foam Roller Thoracic Extension':                 'mobility',
  'Suboccipital Massage':                           'mobility',
  'Thoracic Foam Roll':                             'mobility',
  'Levator Scapulae Stretch':                       'mobility',
  'Upper Trapezius Stretch':                        'mobility',
  'Pelvic Rocks':                                   'mobility',
  'Crossed Leg Forward Stretch':                    'mobility',
  'Weight Assisted Neck Stretch':                   'mobility',
  'Pelvic Twist':                                   'mobility',
  'Baby Cobra':                                     'mobility',
  'Quadruped Thoracic Rotation (Hand Behind Head)': 'mobility',
  'Side Lying Chin Tuck':                           'mobility',
  'Sphinx Cat Camels':                              'mobility',
  // ── Activation: motor control, postural retraining, endurance ────────────
  'Chin Tuck':                                      'activation',
  'Supine Chin Tuck':                               'activation',
  'Wall Lean Chin Tuck':                            'activation',
  'Chin Tuck Rotations':                            'activation',
  'Prone Chin Tuck':                                'activation',
  'Chin Tuck Floor Angels':                         'activation',
  'Wall Angel':                                     'activation',
  'Air Angel':                                      'activation',
  'Floor Angel':                                    'activation',
  'Quadruped Scapular Push':                        'activation',
  'Bear Hold':                                      'activation',
  'Wall Slide':                                     'activation',
  'Wall Assisted Shoulder Flexion':                 'activation',
  'Thoracic Extension':                             'activation',
  'Lower Trap Activation':                          'activation',
  'Wall Lean':                                      'activation',
  'Bird Dog':                                       'activation',
  'Supine Pelvic Tilt':                             'activation',
  'Standing Pelvic Tilt':                           'activation',
  'TVA Frog Leg':                                   'activation',
  'Side Lean Wall Slide':                           'activation',
  'Scapular Flutters':                              'activation',
  'Quadruped Scapular Circles':                     'activation',
  // ── Strength: progressive load, build capacity ────────────────────────────
  'Prone T-Raise':                                  'strength',
  'Prone Y-Raise':                                  'strength',
  'Y-Pull with Band':                               'strength',
  'Banded Chin Tucks':                               'strength',
  'Banded Reverse Fly':                             'strength',
  'Banded Lat Pull-Down':                           'strength',
  'Archer Push-Up':                                 'strength',
  'Push-Up Plus':                                   'strength',
  'Side Plank':                                     'strength',
  'Single-Arm Plank':                               'strength',
  'Wall Lean Plank':                                'strength',
  'Swimmers':                                       'strength',
  'Scapular Rows':                                  'strength',
  'Advanced Bird Dog':                              'strength',
  'Split Squat Pelvic Tilts':                       'strength',
  'Chin Tuck Neck Bridge':                          'strength',
  'Half Kneel Pallof Press':                        'strength',
  'Adductor Squeeze Crunch':                        'strength',
  'Bear Crawl Scapular Push Up':                    'strength',
  'Elevated Scapular Push Up':                      'strength',
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
    type: EXERCISE_TYPE[ex.name] ?? getPhase(ex.name), // static lookup, regex fallback
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
  const hasEquipment = profile.hasEquipment !== false;

  // ── Step 1: Build per-problem entries ────────────────────────────────────────
  // Risk level → exercise difficulty: high → beginner, medium → medium, low → hard
  // Tier search order always ascends from the mapped difficulty (easy → medium → hard).

  type ProblemEntry = {
    appId: string;
    rawId: string;
    problem: typeof postureProblems[0];
    severity: ProblemSeverity;
    diff: ExerciseDifficulty;
    weight: number;
    candidates: Exercise[];
  };

  // Pre-compute all detected app IDs for multi-problem candidate sorting
  const allDetectedAppIds = new Set(
    detectedIds.map(rawId => TO_APP_PROBLEM[rawId] ?? rawId),
  );

  const focusAreas: string[] = [];
  const problemEntries: ProblemEntry[] = [];

  for (const rawId of detectedIds) {
    const appId = TO_APP_PROBLEM[rawId] ?? rawId;
    const problem = postureProblems.find(p => p.id === appId);
    if (!problem) continue;

    const rawSev = (problemSeverities as Record<string, string>)[appId]
      ?? (problemSeverities as Record<string, string>)[rawId];
    const severity: ProblemSeverity =
      normalizeSeverity(rawSev) ??
      (overallDiff === 'beginner' ? 'high' : overallDiff === 'hard' ? 'low' : 'medium');

    const diff = severityToDiff(severity);
    // Single tier only — no cascading. Risk level determines exactly which tier to use:
    //   high → 2 beginner + 1 medium, medium → medium (2), low → hard (2)
    const tierOrder: ExerciseDifficulty[] = [diff];

    let candidates = getPriorityCandidates(problem, appId, tierOrder);
    // For high-risk: append up to 1 medium exercise after the beginner candidates
    if (severity === 'high') {
      const medCandidates = getPriorityCandidates(problem, appId, ['medium']);
      for (const ex of medCandidates) {
        if (!candidates.find(c => c.name === ex.name)) {
          candidates = [...candidates, ex];
          break; // only 1 medium exercise appended
        }
      }
    }
    if (!hasEquipment) candidates = candidates.filter(ex => !ex.requiresEquipment);

    // Prioritize exercises that address multiple detected problems (stable sort)
    candidates.sort((a, b) => {
      const aHits = (EXERCISE_PROBLEMS[a.name] ?? []).filter(id => allDetectedAppIds.has(id)).length;
      const bHits = (EXERCISE_PROBLEMS[b.name] ?? []).filter(id => allDetectedAppIds.has(id)).length;
      return bHits - aHits;
    });

    focusAreas.push(problem.title);
    problemEntries.push({ appId, rawId, problem, severity, diff, weight: severityWeight(severity), candidates });
  }

  // Sort by risk weight so the most impactful problem is processed first
  problemEntries.sort((a, b) => b.weight - a.weight);

  // ── Step 2: Fixed slot allocation by risk level ───────────────────────────────
  // high → 2 beginner + 1 medium (3 total, candidates list already ordered this way)
  // medium → 2 exercises from medium tier
  // low → 2 exercises from hard tier
  // Problems are processed most-severe-first so high-risk exercises always win dedup.

  type MergedEntry = { exercise: Exercise; diff: ExerciseDifficulty };
  const labelMap = new Map<string, { appIds: string[]; titles: string[]; diff: ExerciseDifficulty }>();
  const merged: MergedEntry[] = [];
  const seenNames = new Set<string>();

  for (const entry of problemEntries) {
    // Slot count is fixed by severity — respects the exact priority-list intent
    const slots = entry.severity === 'high' ? 3 : 2;
    let taken = 0;
    for (const ex of entry.candidates) {
      const key = ex.name;
      if (seenNames.has(key)) {
        // Exercise already added by a higher-priority problem — merge its label
        const lbl = labelMap.get(key)!;
        if (!lbl.appIds.includes(entry.appId)) {
          lbl.appIds.push(entry.appId);
          lbl.titles.push(entry.problem.title);
        }
      } else {
        if (taken >= slots) break; // stop once we have exactly the right count
        seenNames.add(key);
        labelMap.set(key, { appIds: [entry.appId], titles: [entry.problem.title], diff: entry.diff });
        merged.push({ exercise: ex, diff: entry.diff });
        taken++;
      }
    }
  }

  // ── Step 2b: Maintenance exercises for undetected disorders ──────────────────
  // For every posture disorder NOT detected in this scan, add the #1 hard-tier
  // exercise as a low-priority maintenance item. These go at the END of merged
  // and are only included if the time budget allows.
  const detectedAppIdSet = new Set(problemEntries.map(e => e.appId));
  for (const uProblem of postureProblems) {
    if (!PRIORITY[uProblem.id] || detectedAppIdSet.has(uProblem.id)) continue;
    const nameIndex = new Map(uProblem.exerciseList.map(e => [e.name, e]));
    for (const name of (PRIORITY[uProblem.id].hard ?? [])) {
      const ex = nameIndex.get(name);
      if (!ex || seenNames.has(ex.name)) continue;
      if (!hasEquipment && ex.requiresEquipment) continue;
      seenNames.add(ex.name);
      labelMap.set(ex.name, { appIds: [uProblem.id], titles: [uProblem.title], diff: 'hard' });
      merged.push({ exercise: ex, diff: 'hard' });
      break; // exactly 1 per undetected disorder
    }
  }

  // ── Step 3: Duration-based selection (target 10–14 min, flexible upper bound) ─

  const TARGET_MIN_SEC = 600; // 10 min
  const TARGET_MAX_SEC = 840; // 14 min (flexible — prefer 12 min, allow up to 14)

  const selectedMap = new Map<string, DailyExercise>();
  let accSec = 0;

  for (const { exercise: ex, diff } of merged) {
    if (selectedMap.has(ex.name)) continue;
    const slot = ex.duration + REST_BETWEEN_SEC;
    // If we've hit the minimum time, skip exercises that would overshoot the max
    // but keep scanning — a shorter exercise later in the list might still fit.
    if (accSec >= TARGET_MIN_SEC && accSec + slot > TARGET_MAX_SEC) continue;
    const lbl = labelMap.get(ex.name) ?? { appIds: [], titles: [], diff };
    const entry = makeEntry(ex, lbl.appIds[0] ?? '', lbl.titles[0] ?? '', lbl.diff);
    entry.targetProblemIds = lbl.appIds;
    entry.targetProblemLabels = lbl.titles;
    entry.postureTypes = lbl.titles;
    selectedMap.set(ex.name, entry);
    accSec += slot;
  }

  // ── Step 4: Fill time gap — variety first, then set boost (max 2) as fallback ─
  // Prefer adding new exercises over inflating sets. Only boost sets if the merged
  // pool is exhausted and we're still under the 10-min minimum.

  if (accSec < TARGET_MIN_SEC) {
    // 4a: Add more exercises from the unselected merged pool (variety-first)
    for (const { exercise: ex, diff } of merged) {
      if (accSec >= TARGET_MIN_SEC) break;
      if (selectedMap.has(ex.name)) continue;
      const slot = ex.duration + REST_BETWEEN_SEC;
      if (accSec + slot > TARGET_MAX_SEC) continue;
      const lbl = labelMap.get(ex.name) ?? { appIds: [], titles: [], diff };
      const e = makeEntry(ex, lbl.appIds[0] ?? '', lbl.titles[0] ?? '', lbl.diff);
      e.targetProblemIds = lbl.appIds;
      e.targetProblemLabels = lbl.titles;
      e.postureTypes = lbl.titles;
      selectedMap.set(ex.name, e);
      accSec += slot;
    }

    // 4b: Still short? Boost sets (max 2) for high-risk exercises — last resort
    if (accSec < TARGET_MIN_SEC && selectedMap.size > 0) {
      for (const entry of problemEntries) {
        if (accSec >= TARGET_MIN_SEC) break;
        for (const dailyEx of selectedMap.values()) {
          if (!dailyEx.targetProblemIds.includes(entry.appId)) continue;
          if (dailyEx.sets >= 2) continue;
          const extra = dailyEx.duration;
          if (accSec + extra <= TARGET_MAX_SEC) {
            dailyEx.sets += 1;
            accSec += extra;
          }
          if (accSec >= TARGET_MIN_SEC) break;
        }
      }
    }
  }

  // ── Step 5: Minimum compliance + smart padding ────────────────────────────────
  // Allow a small extra window to satisfy minimums without hard time rejection.
  const FLEX_MAX_SEC = TARGET_MAX_SEC + 180; // 3 min extra flex for fallback only

  // 5a: Guarantee the target exercise count per detected problem.
  //   high risk → ensure 3 exercises in program; medium / low → ensure 2.
  //   Uses only candidates from the problem's assigned tier (single-tier rule respected).
  for (const entry of problemEntries) {
    const target = entry.severity === 'high' ? 3 : 2;
    const count = [...selectedMap.values()]
      .filter(e => e.targetProblemIds.includes(entry.appId)).length;
    if (count >= target) continue;
    let added = count;
    for (const ex of entry.candidates) {
      if (added >= target) break;
      if (selectedMap.has(ex.name)) continue;
      const slot = ex.duration + REST_BETWEEN_SEC;
      if (accSec + slot > FLEX_MAX_SEC) continue;
      const dailyEx = makeEntry(ex, entry.appId, entry.problem.title, entry.diff);
      dailyEx.targetProblemIds = [entry.appId];
      dailyEx.targetProblemLabels = [entry.problem.title];
      dailyEx.postureTypes = [entry.problem.title];
      selectedMap.set(ex.name, dailyEx);
      accSec += slot;
      added++;
    }
  }

  // ── Step 6: Type balance enforcement ─────────────────────────────────────────
  // Ensure physiologically correct session composition:
  //   Hard minimum: ≥1 mobility, ≥1 activation, ≥1 strength
  //   Soft balance: mobility ≤40%, activation ≥30%, strength ≥30%
  //
  // IMPORTANT: Only uses the severity-tiered `merged` pool — never reaches into
  // wrong tiers (e.g. beginner exercises for a low-risk problem). Additions and
  // swaps are strictly limited to exercises that respect the original tierOrder.
  {
    // Only exercises from the properly-tiered merged pool that are not yet selected
    const unselected = merged.filter(m => !selectedMap.has(m.exercise.name));

    const typeCounts = (): Record<ExercisePhase, number> => {
      const c = { mobility: 0, activation: 0, strength: 0 };
      for (const e of selectedMap.values()) c[getPhase(e.name)]++;
      return c;
    };

    // Try to add an unselected exercise of `needed` type — tier-respecting pool only
    const tryAdd = (needed: ExercisePhase): boolean => {
      const cand = unselected.find(
        m => !selectedMap.has(m.exercise.name) && getPhase(m.exercise.name) === needed,
      );
      if (!cand) return false;
      const slot = cand.exercise.duration + REST_BETWEEN_SEC;
      if (accSec + slot > FLEX_MAX_SEC) return false;
      const lbl = labelMap.get(cand.exercise.name) ?? { appIds: [], titles: [], diff: cand.diff };
      const e = makeEntry(cand.exercise, lbl.appIds[0] ?? '', lbl.titles[0] ?? '', lbl.diff);
      e.targetProblemIds = lbl.appIds; e.targetProblemLabels = lbl.titles; e.postureTypes = lbl.titles;
      selectedMap.set(cand.exercise.name, e);
      accSec += slot;
      return true;
    };

    // Replace the last exercise of `fromType` with one of `toType` — tier-respecting pool only
    const trySwap = (fromType: ExercisePhase, toType: ExercisePhase): boolean => {
      if (typeCounts()[fromType] <= 1) return false; // never strip a type to zero
      const cand = unselected.find(
        m => !selectedMap.has(m.exercise.name) && getPhase(m.exercise.name) === toType,
      );
      if (!cand) return false;
      const victims = [...selectedMap.values()].filter(e => getPhase(e.name) === fromType);
      if (victims.length === 0) return false;
      const victim = victims[victims.length - 1]; // last added = lowest priority
      const removeSlot = victim.duration * victim.sets + REST_BETWEEN_SEC;
      const addSlot = cand.exercise.duration + REST_BETWEEN_SEC;
      if (accSec - removeSlot + addSlot > FLEX_MAX_SEC) return false;
      selectedMap.delete(victim.name);
      accSec = accSec - removeSlot + addSlot;
      const lbl = labelMap.get(cand.exercise.name) ?? { appIds: [], titles: [], diff: cand.diff };
      const e = makeEntry(cand.exercise, lbl.appIds[0] ?? '', lbl.titles[0] ?? '', lbl.diff);
      e.targetProblemIds = lbl.appIds; e.targetProblemLabels = lbl.titles; e.postureTypes = lbl.titles;
      selectedMap.set(cand.exercise.name, e);
      return true;
    };

    // ── Hard minimum: ≥1 of every type ─────────────────────────────────────
    for (const needed of ['mobility', 'activation', 'strength'] as ExercisePhase[]) {
      if (typeCounts()[needed] > 0) continue;
      // Try adding from tier-respecting pool; if not found, swap from over-represented type
      if (!tryAdd(needed)) {
        const counts = typeCounts();
        const from = (['mobility', 'activation', 'strength'] as ExercisePhase[])
          .filter(t => t !== needed)
          .reduce((best, t) => counts[t] > counts[best] ? t : best, 'activation' as ExercisePhase);
        trySwap(from, needed);
      }
    }

    // ── Soft balance: mobility ≤40%, activation ≥30%, strength ≥30% ────────
    // Prefer swaps over additions to keep exercise count stable.
    const n = selectedMap.size;
    if (n > 0) {
      const counts = typeCounts();
      const mobMax = Math.floor(n * 0.4);
      const actMin = Math.ceil(n * 0.3);
      const strMin = Math.ceil(n * 0.3);
      if (counts.mobility > mobMax) {
        const swapTo: ExercisePhase = counts.activation < actMin ? 'activation' : 'strength';
        trySwap('mobility', swapTo);
      }
      const c2 = typeCounts();
      if (c2.activation < actMin) tryAdd('activation');
      if (c2.strength  < strMin)  tryAdd('strength');
    }
  }

  // ── Step 7: Phase sequencing ─────────────────────────────────────────────────
  // Every session: Mobility (release) → Activation (motor control) → Strength.

  const phaseOrder: Record<ExercisePhase, number> = { mobility: 0, activation: 1, strength: 2 };
  const selected = [...selectedMap.values()].sort(
    (a, b) => phaseOrder[getPhase(a.name)] - phaseOrder[getPhase(b.name)],
  );

  // ── Step 7b: Under-8-min boost — all exercises → 2 sets ─────────────────────
  // If the total session time is under 8 minutes after all selection, bump every
  // exercise to 2 sets so the session reaches a meaningful training stimulus.
  if (accSec < 480) {
    for (const ex of selected) {
      if (ex.sets < 2) ex.sets = 2;
    }
    accSec = selected.reduce((s, ex) => s + ex.duration * ex.sets + REST_BETWEEN_SEC, 0);
  }

  // ── Step 8: Enrich labels from static cross-reference ────────────────────────
  const userAppIds = new Set(detectedIds.map(rawId => TO_APP_PROBLEM[rawId] ?? rawId));

  for (const ex of selected) {
    const allIds = EXERCISE_PROBLEMS[ex.name];
    if (!allIds) continue;
    const relevantIds = allIds.filter(id => userAppIds.has(id));
    if (relevantIds.length === 0) continue;
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
    const program = JSON.parse(raw) as StoredDailyProgram;

    // Auto-reset on new day: if the program was generated on a previous calendar
    // day (device local time), clear all completion flags so the user starts fresh.
    const programDate = new Date(program.generatedAt).toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const today = new Date().toLocaleDateString('en-CA');
    if (programDate !== today) {
      const reset: StoredDailyProgram = {
        ...program,
        generatedAt: Date.now(),
        completedAt: undefined,
        exercises: program.exercises.map(ex => ({ ...ex, completed: false })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }

    return program;
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

/** Count distinct days in the current calendar month where the program was fully completed. */
export function getMonthlyCompletionCount(): number {
  const log = loadProgressLog();
  const now = new Date();
  // Build "YYYY-MM" prefix for the current local month
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return log.filter(e => e.fullyCompleted && e.date.startsWith(prefix)).length;
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
    type: EXERCISE_TYPE[newExercise.name] ?? getPhase(newExercise.name),
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
  const totalSec = updated.exercises.reduce((s, e) => s + e.duration * e.sets + REST_BETWEEN_SEC, 0);
  updated.totalDurationMin = Math.round(totalSec / 60);
  saveDailyProgram(updated);
  return updated;
}
