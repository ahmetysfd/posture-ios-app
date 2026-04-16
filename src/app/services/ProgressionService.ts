/**
 * ProgressionService — tracks per-exercise volume progression over time.
 *
 * Volume ladder per exercise:
 *   1 set → 2 sets → 3 sets (then capped at 3)
 *
 * Threshold to advance to the next set count:
 *   6 completions at current volume (base)
 *   RPE ≤ 2 → 4 completions  (too easy, accelerate)
 *   RPE ≥ 4 → 9 completions  (too hard, decelerate)
 *
 * Tier upgrade suggestion:
 *   After 21 total completions of an exercise the app suggests swapping to
 *   the next difficulty tier (beginner → medium → hard). The user can accept
 *   (immediately swaps the exercise in the program) or dismiss for now.
 *
 * RPE scale (1–5):
 *   1 = Too Easy  2 = Easy  3 = Just Right  4 = Hard  5 = Too Hard
 */

import type { StoredDailyProgram, DailyExercise } from './DailyProgram';
import { PRIORITY, EXERCISE_TYPE, EXERCISE_REPS } from './DailyProgram';
import type { ExerciseDifficulty } from './UserProfile';
import { postureProblems } from '../data/postureData';

const PROGRESSION_KEY = 'posturefix_progression_log';
/** Stores { date: "YYYY-MM-DD", names: string[] } — exercises already counted today. */
const DAILY_COUNTED_KEY = 'posturefix_daily_counted';
const BASE_THRESHOLD = 6;
const MAX_SETS = 3;
/** Total completions before a tier-upgrade is suggested. */
const UPGRADE_THRESHOLD = 21;

const NEXT_TIER: Record<ExerciseDifficulty, ExerciseDifficulty | null> = {
  beginner: 'medium',
  medium: 'hard',
  hard: null,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExerciseProgression {
  exerciseName: string;
  currentSets: number;            // 1, 2, or 3
  completionsAtVolume: number;    // resets each time sets increments
  totalCompletions: number;
  lastProgressedAt?: number;      // ms timestamp of last set increase
  recentRPE: number[];            // rolling window of last 5 session RPE values
  recentQuality?: number[];       // rolling window of last 5 per-set quality ratings (1=Hard, 2=Good, 3=Easy)
  pendingTierUpgrade?: boolean;   // true when totalCompletions >= UPGRADE_THRESHOLD
}

/** key = exercise name */
export type ProgressionLog = Record<string, ExerciseProgression>;

export interface ProgressionEvent {
  exerciseName: string;
  emoji: string;
  from: string;   // e.g. "1 set"
  to: string;     // e.g. "2 sets"
}

export interface ProgressionDisplay {
  currentSets: number;
  completionsAtVolume: number;
  threshold: number;
  percentToNext: number;        // 0–100, progress bar toward next set increase
  isMaxed: boolean;             // already at 3 sets (fully loaded)
  pendingTierUpgrade: boolean;  // user should be suggested the next tier exercise
  totalCompletions: number;     // lifetime completions, used for 0/21 tier progress bar
}

export interface UpgradeInfo {
  nextExerciseName: string;
  nextTier: ExerciseDifficulty;
}

function todayStr(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
}

// ── Daily dedup guard ─────────────────────────────────────────────────────────
// Completely independent of the progression log. Tracks which exercise names
// have already been counted today. Resets automatically on a new calendar day.

interface DailyCountedStore {
  date: string;       // YYYY-MM-DD local date
  names: string[];    // exercise names already counted today
}

function loadDailyCounted(): DailyCountedStore {
  try {
    const raw = localStorage.getItem(DAILY_COUNTED_KEY);
    if (!raw) return { date: todayStr(), names: [] };
    const store = JSON.parse(raw) as DailyCountedStore;
    // Auto-reset when the calendar day changes
    if (store.date !== todayStr()) return { date: todayStr(), names: [] };
    return store;
  } catch {
    return { date: todayStr(), names: [] };
  }
}

function saveDailyCounted(store: DailyCountedStore): void {
  localStorage.setItem(DAILY_COUNTED_KEY, JSON.stringify(store));
}

/** Returns true if this exercise has already been counted today (any program). */
function isCountedToday(name: string): boolean {
  return loadDailyCounted().names.includes(name);
}

/** Mark exercise as counted for today. */
function markCountedToday(name: string): void {
  const store = loadDailyCounted();
  if (!store.names.includes(name)) {
    store.names.push(name);
    saveDailyCounted(store);
  }
}

// ── Storage ───────────────────────────────────────────────────────────────────

export function loadProgressionLog(): ProgressionLog {
  try {
    return JSON.parse(localStorage.getItem(PROGRESSION_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveProgressionLog(log: ProgressionLog): void {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(log));
}

export function clearProgressionLog(): void {
  localStorage.removeItem(PROGRESSION_KEY);
}

/**
 * Record a per-set quality rating for an exercise.
 * Called after each set completes (from the set-rest quality picker).
 * quality: 1 = Hard, 2 = Good, 3 = Easy
 */
export function recordSetQuality(exerciseName: string, quality: 1 | 2 | 3): void {
  const log = loadProgressionLog();
  if (!log[exerciseName]) return;
  const entry = log[exerciseName];
  entry.recentQuality = [...(entry.recentQuality ?? []).slice(-4), quality];
  saveProgressionLog(log);
}

// ── Core logic ────────────────────────────────────────────────────────────────

function computeThreshold(recentRPE: number[], recentQuality?: number[]): number {
  let threshold = BASE_THRESHOLD;

  if (recentRPE.length >= 2) {
    const avg = recentRPE.reduce((s, v) => s + v, 0) / recentRPE.length;
    if (avg <= 2) threshold = 4;   // consistently easy → progress faster
    else if (avg >= 4) threshold = 9; // consistently hard → progress slower
  }

  // Per-set quality (1=Hard, 2=Good, 3=Easy) further fine-tunes threshold
  if (recentQuality && recentQuality.length >= 2) {
    const avg = recentQuality.reduce((s, v) => s + v, 0) / recentQuality.length;
    if (avg > 2.5) threshold = Math.max(3, threshold - 1); // easy sets → faster
    if (avg < 1.5) threshold = Math.min(12, threshold + 2); // hard sets → slower
  }

  return threshold;
}

/**
 * Call after every completed workout session.
 *
 * @param exercises  exercises that were completed (name + emoji for display)
 * @param rpe        overall session RPE 1–5
 * @returns          list of progression events (set increases) that just occurred
 */
export function recordSessionCompletion(
  exercises: Array<{ name: string; emoji: string }>,
  rpe: number,
): ProgressionEvent[] {
  const log = loadProgressionLog();
  const events: ProgressionEvent[] = [];

  for (const { name, emoji } of exercises) {
    if (!log[name]) {
      log[name] = {
        exerciseName: name,
        currentSets: 1,
        completionsAtVolume: 0,
        totalCompletions: 0,
        recentRPE: [],
      };
    }

    const entry = log[name];

    // Always update RPE so the adaptive threshold stays current
    entry.recentRPE = [...entry.recentRPE.slice(-4), rpe];

    // Deduplicate across programs: only count once per calendar day.
    // Uses a separate daily-counted store so no state in the progression entry
    // can accidentally reset the guard.
    if (!isCountedToday(name)) {
      markCountedToday(name);
      entry.totalCompletions += 1;
      entry.completionsAtVolume += 1;

      // Volume progression: 1 → 2 → 3 sets
      const threshold = computeThreshold(entry.recentRPE, entry.recentQuality);
      if (entry.completionsAtVolume >= threshold && entry.currentSets < MAX_SETS) {
        const from = `${entry.currentSets} set${entry.currentSets > 1 ? 's' : ''}`;
        entry.currentSets += 1;
        entry.completionsAtVolume = 0;
        entry.lastProgressedAt = Date.now();
        events.push({ exerciseName: name, emoji, from, to: `${entry.currentSets} sets` });
      }

      // Tier upgrade suggestion: flag after UPGRADE_THRESHOLD total completions
      if (entry.totalCompletions >= UPGRADE_THRESHOLD && !entry.pendingTierUpgrade) {
        entry.pendingTierUpgrade = true;
      }
    }
  }

  saveProgressionLog(log);
  return events;
}

/**
 * Apply current progression state to a stored program.
 * Updates `sets` and `displayReps` on each exercise to match the log.
 * Returns a new program object only if anything changed.
 */
export function applyProgressionsToProgram(program: StoredDailyProgram): StoredDailyProgram {
  const log = loadProgressionLog();
  let changed = false;

  const updatedExercises: DailyExercise[] = program.exercises.map(ex => {
    const prog = log[ex.name];
    if (!prog || prog.currentSets === ex.sets) return ex;

    changed = true;
    const baseReps = ex.displayReps.replace(/^\d+\s*×\s*/, '');
    const displayReps = prog.currentSets > 1 ? `${prog.currentSets} × ${baseReps}` : baseReps;
    return { ...ex, sets: prog.currentSets, displayReps };
  });

  if (!changed) return program;
  return { ...program, exercises: updatedExercises };
}

/**
 * Get display info for one exercise (for UI indicators on exercise cards).
 */
export function getProgressionDisplay(exerciseName: string): ProgressionDisplay {
  const log = loadProgressionLog();
  const entry = log[exerciseName];

  if (!entry) {
    return {
      currentSets: 1,
      completionsAtVolume: 0,
      threshold: BASE_THRESHOLD,
      percentToNext: 0,
      isMaxed: false,
      pendingTierUpgrade: false,
      totalCompletions: 0,
    };
  }

  const threshold = computeThreshold(entry.recentRPE, entry.recentQuality);
  const isMaxed = entry.currentSets >= MAX_SETS;
  const percentToNext = isMaxed
    ? 100
    : Math.min(100, Math.round((entry.completionsAtVolume / threshold) * 100));

  return {
    currentSets: entry.currentSets,
    completionsAtVolume: entry.completionsAtVolume,
    threshold,
    percentToNext,
    isMaxed,
    pendingTierUpgrade: entry.pendingTierUpgrade ?? false,
    totalCompletions: entry.totalCompletions,
  };
}

// ── Tier upgrade ──────────────────────────────────────────────────────────────

/**
 * Returns info about the next-tier exercise for a given DailyExercise,
 * or null if the exercise is already at hard tier or no next exercise exists.
 */
export function getUpgradeInfo(ex: DailyExercise): UpgradeInfo | null {
  const nextTier = NEXT_TIER[ex.difficulty];
  if (!nextTier) return null; // already at hard — no upgrade

  const problemId = ex.targetProblemIds[0];
  if (!problemId) return null;

  const nextExerciseName = PRIORITY[problemId]?.[nextTier]?.[0];
  if (!nextExerciseName) return null;

  return { nextExerciseName, nextTier };
}

/**
 * Swaps an exercise in the program with the next-tier exercise.
 * Resets that exercise's progression state (fresh start at 1 set).
 * Returns the updated program and saves the updated progression log.
 */
export function acceptTierUpgrade(
  program: StoredDailyProgram,
  exerciseName: string,
): StoredDailyProgram {
  const exIndex = program.exercises.findIndex(e => e.name === exerciseName);
  if (exIndex === -1) return program;

  const currentEx = program.exercises[exIndex];
  const info = getUpgradeInfo(currentEx);
  if (!info) return program;

  const { nextExerciseName, nextTier } = info;
  const problemId = currentEx.targetProblemIds[0];

  // Find the full exercise data from postureProblems
  const problem = postureProblems.find(p => p.id === problemId);
  const nextExData = problem?.exerciseList.find(e => e.name === nextExerciseName);
  if (!nextExData) return program;

  // Build displayReps for the new exercise using the same source-of-truth as makeEntry
  const nextReps = EXERCISE_REPS[nextExerciseName];
  const displayReps = nextReps != null ? `${nextReps} reps` : `${nextExData.duration}s`;

  const newEntry: DailyExercise = {
    ...currentEx,
    id: nextExData.id,
    name: nextExData.name,
    emoji: nextExData.emoji,
    duration: nextExData.duration,
    sets: 1,
    displayReps,
    reps: nextReps,
    difficulty: nextTier,
    type: (EXERCISE_TYPE[nextExData.name] ?? 'activation') as DailyExercise['type'],
    instructions: nextExData.instructions,
    youtubeUrl: nextExData.youtubeUrl,
    requiresEquipment: nextExData.requiresEquipment ?? false,
    completed: false,
  };

  // Reset progression for the old exercise name and clear the flag
  const log = loadProgressionLog();
  if (log[exerciseName]) {
    log[exerciseName].pendingTierUpgrade = false;
  }
  // Start a fresh entry for the new exercise
  log[nextExerciseName] = {
    exerciseName: nextExerciseName,
    currentSets: 1,
    completionsAtVolume: 0,
    totalCompletions: 0,
    recentRPE: [],
  };
  saveProgressionLog(log);

  const updatedExercises = [...program.exercises];
  updatedExercises[exIndex] = newEntry;
  return { ...program, exercises: updatedExercises };
}

/**
 * Dismiss the tier upgrade suggestion for an exercise without upgrading.
 * The flag stays cleared; it won't re-appear until the next time
 * UPGRADE_THRESHOLD is crossed (i.e. it won't re-prompt until the user has
 * done another full cycle — effectively never, since the counter keeps going).
 * To re-prompt periodically, increment UPGRADE_THRESHOLD by some delta here.
 */
export function dismissUpgrade(exerciseName: string): void {
  const log = loadProgressionLog();
  if (log[exerciseName]) {
    log[exerciseName].pendingTierUpgrade = false;
    // Bump the effective threshold so it re-suggests in another 7 sessions
    log[exerciseName].totalCompletions = UPGRADE_THRESHOLD - 7;
  }
  saveProgressionLog(log);
}
