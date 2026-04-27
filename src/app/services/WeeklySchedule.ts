/**
 * Shared storage + helpers for the weekly schedule (Schedule page + Home calendar).
 *
 * The user picks a program and reminder time per weekday. We store both:
 *  - the weekly *template* (one entry per Mon..Sun)
 *  - per-date materializations into `posturefix_day_config`, which the Home
 *    weekly calendar and the streak service already read.
 */

export interface DayConfig {
  off?: boolean;
  reminders?: string[];   // legacy field used by older Progress page calendar
  programId?: string;
  /** Primary reminder time (kept in sync with `times[0]` for back-compat). */
  time?: string;
  /** All reminder times for this day, in chronological order. */
  times?: string[];
}

/**
 * Canonical list of reminder times for a day.
 * Prefers `times`; falls back to a single-element array from `time`; otherwise [].
 */
export function getDayTimes(cfg: DayConfig): string[] {
  if (cfg.times && cfg.times.length > 0) return cfg.times;
  if (cfg.time) return [cfg.time];
  return [];
}

/** Sort + dedupe a list of "HH:MM" strings. */
export function normalizeTimes(times: string[]): string[] {
  const filtered = times.filter(Boolean);
  const unique = Array.from(new Set(filtered));
  return unique.sort((a, b) => a.localeCompare(b));
}

export const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type WeekdayKey = typeof WEEKDAY_KEYS[number];
export type WeeklyTemplate = Record<WeekdayKey, DayConfig>;

export const WEEKDAY_FULL: Record<WeekdayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

const DAY_CONFIG_KEY = 'posturefix_day_config';
const WEEKLY_TEMPLATE_KEY = 'posturefix_weekly_template';

export function emptyTemplate(): WeeklyTemplate {
  return WEEKDAY_KEYS.reduce((acc, k) => { acc[k] = {}; return acc; }, {} as WeeklyTemplate);
}

export function isConfigEmpty(c: DayConfig): boolean {
  return !c.off && !c.programId && !c.time && (!c.reminders || c.reminders.length === 0);
}

export function loadWeeklyTemplate(): WeeklyTemplate | null {
  try {
    const raw = localStorage.getItem(WEEKLY_TEMPLATE_KEY);
    return raw ? (JSON.parse(raw) as WeeklyTemplate) : null;
  } catch { return null; }
}

export function saveWeeklyTemplate(t: WeeklyTemplate): void {
  try { localStorage.setItem(WEEKLY_TEMPLATE_KEY, JSON.stringify(t)); } catch {}
}

export function loadDayConfigMap(): Record<string, DayConfig> {
  try {
    const raw = localStorage.getItem(DAY_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DayConfig>) : {};
  } catch { return {}; }
}

export function saveDayConfigMap(cfg: Record<string, DayConfig>): void {
  try { localStorage.setItem(DAY_CONFIG_KEY, JSON.stringify(cfg)); } catch {}
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const dow = r.getDay(); // 0 = Sun .. 6 = Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  r.setDate(r.getDate() + diff);
  return r;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/**
 * Materialize a weekly template into per-date configs starting at this week's
 * Monday and extending `weeksAhead` weeks.
 *
 * The Schedule page is the single source of truth for editing, so today and
 * every future date is overwritten with whatever the template says — including
 * clearing the entry when the template slot is empty. Past dates are kept
 * untouched so we don't rewrite history.
 */
export function applyTemplateToDates(
  template: WeeklyTemplate,
  existing: Record<string, DayConfig>,
  weeksAhead: number,
): Record<string, DayConfig> {
  const next: Record<string, DayConfig> = { ...existing };
  const monday = startOfWeekMonday(new Date());
  const todayIso = toIsoDate(new Date());
  for (let w = 0; w < weeksAhead; w++) {
    for (let i = 0; i < 7; i++) {
      const d = addDays(monday, w * 7 + i);
      const iso = toIsoDate(d);
      if (iso < todayIso) continue;          // never rewrite history
      const slot = template[WEEKDAY_KEYS[i]];
      if (!slot || isConfigEmpty(slot)) {
        // Template says "nothing scheduled this weekday" — clear the future
        // date so it doesn't keep showing stale data from a prior schedule.
        delete next[iso];
      } else {
        next[iso] = { ...slot };
      }
    }
  }
  return next;
}

export interface ProgramOption {
  id: string;
  name: string;
}

/** Read the user's program library, falling back to the default Daily Program. */
export function loadProgramOptions(): ProgramOption[] {
  try {
    const raw = localStorage.getItem('posturefix_program_library');
    if (raw) {
      const lib = JSON.parse(raw) as { entries?: Array<{ id: string; name: string }> };
      if (lib.entries && lib.entries.length) {
        return lib.entries.map(e => ({ id: e.id, name: e.name }));
      }
    }
  } catch { /* fall through */ }
  return [{ id: 'daily', name: 'Daily Program' }];
}
