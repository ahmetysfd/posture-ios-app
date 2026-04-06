/**
 * 90-day posture habit plan: three 30-day phases (Beginner → Medium → Advanced).
 * Persisted in localStorage independently of scans.
 */

export type PlanPhase = 'beginner' | 'medium' | 'advanced';

const STORAGE_KEY = 'posturefix_90day_habits';

export interface Habit90State {
  beginner: boolean[];
  medium: boolean[];
  advanced: boolean[];
}

function empty30(): boolean[] {
  return Array.from({ length: 30 }, () => false);
}

export function defaultHabit90(): Habit90State {
  return {
    beginner: empty30(),
    medium: empty30(),
    advanced: empty30(),
  };
}

function normalize(raw: unknown): Habit90State {
  const d = defaultHabit90();
  if (!raw || typeof raw !== 'object') return d;
  const o = raw as Record<string, unknown>;
  (['beginner', 'medium', 'advanced'] as const).forEach(key => {
    const arr = o[key];
    if (Array.isArray(arr) && arr.length === 30) {
      d[key] = arr.map(v => Boolean(v));
    }
  });
  return d;
}

export function loadHabit90(): Habit90State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultHabit90();
    return normalize(JSON.parse(raw));
  } catch {
    return defaultHabit90();
  }
}

export function saveHabit90(state: Habit90State): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleHabitDay(phase: PlanPhase, dayIndex: number): Habit90State {
  const s = loadHabit90();
  if (dayIndex < 0 || dayIndex > 29) return s;
  const next = { ...s, [phase]: [...s[phase]] };
  next[phase][dayIndex] = !next[phase][dayIndex];
  saveHabit90(next);
  return next;
}

export function countCompleted(state: Habit90State): number {
  return (
    state.beginner.filter(Boolean).length +
    state.medium.filter(Boolean).length +
    state.advanced.filter(Boolean).length
  );
}

export function isPhaseComplete(days: boolean[]): boolean {
  return days.length === 30 && days.every(Boolean);
}

/** Active chapter: next phase unlocks only after the previous 30-day grid is fully complete. */
export function getActivePlanPhase(habits: Habit90State): PlanPhase {
  if (!isPhaseComplete(habits.beginner)) return 'beginner';
  if (!isPhaseComplete(habits.medium)) return 'medium';
  return 'advanced';
}

export const PHASE_META: Record<PlanPhase, {
  title: string;
  dayRange: string;
  accent: string;
  subtitle: string;
}> = {
  beginner: {
    title: 'Beginner',
    dayRange: 'Days 1–30',
    accent: '#E68C33',
    subtitle: 'Build the daily habit with gentle, short sessions.',
  },
  medium: {
    title: 'Medium',
    dayRange: 'Days 31–60',
    accent: '#D9B84C',
    subtitle: 'Increase consistency and add a bit more challenge.',
  },
  advanced: {
    title: 'Advanced',
    dayRange: 'Days 61–90',
    accent: '#3DA878',
    subtitle: 'Solidify gains and keep posture resilient long term.',
  },
};
