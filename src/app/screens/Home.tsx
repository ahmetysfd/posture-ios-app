import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';
import { loadActiveProgramForSession, getDailyStats, getLevelInfo, loadProgressLog } from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

const T = {
  bg: '#09090B',
  surface: '#141416',
  surface2: '#101012',
  border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  text2: 'rgba(228,228,231,0.75)',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
  gold: '#F97316',
  emerald: '#22C55E',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const CARD_ACCENTS: Record<string, { glow: string; border: string; gradient: string }> = {
  'forward-head': { glow: 'rgba(249,115,22,0.16)', border: 'rgba(249,115,22,0.22)', gradient: 'linear-gradient(180deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0) 100%)' },
  'winging-scapula': { glow: 'rgba(96,165,250,0.16)', border: 'rgba(96,165,250,0.22)', gradient: 'linear-gradient(180deg, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0) 100%)' },
  'anterior-pelvic': { glow: 'rgba(251,113,133,0.16)', border: 'rgba(251,113,133,0.22)', gradient: 'linear-gradient(180deg, rgba(251,113,133,0.12) 0%, rgba(251,113,133,0) 100%)' },
  'rounded-shoulders': { glow: 'rgba(251,191,36,0.16)', border: 'rgba(251,191,36,0.22)', gradient: 'linear-gradient(180deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0) 100%)' },
  kyphosis: { glow: 'rgba(168,85,247,0.16)', border: 'rgba(168,85,247,0.22)', gradient: 'linear-gradient(180deg, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0) 100%)' },
  'uneven-shoulders': { glow: 'rgba(52,211,153,0.16)', border: 'rgba(52,211,153,0.22)', gradient: 'linear-gradient(180deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0) 100%)' },
};

function ProgressRing({ progress, done }: { progress: number; done: boolean }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, progress));
  return (
    <div style={{ width: 60, height: 60, position: 'relative', flexShrink: 0 }}>
      <svg width={60} height={60} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle
          cx={30}
          cy={30}
          r={28}
          fill="none"
          stroke="rgba(63,63,70,1)"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
          boxShadow: '0 0 20px rgba(249,115,22,0.3)',
        }}
      >
        <svg width={56} height={56} style={{ position: 'absolute', inset: -2, transform: 'rotate(-90deg)' }}>
          <circle cx={28} cy={28} r={24} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
          <circle
            cx={28}
            cy={28}
            r={24}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={(2 * Math.PI * 24) * (1 - Math.min(1, progress))}
            style={{ opacity: done ? 0 : 1, transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {done ? (
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="#FFFFFF" />
          </svg>
        )}
      </div>
    </div>
  );
}

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(24,24,27,0.9)',
        border: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: T.text2,
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V22a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.57 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H2a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.57-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8a1.7 1.7 0 0 0 1.04-1.56V2a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.1 1.57 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V8c0 .68.4 1.3 1.04 1.56.16.07.33.1.52.1H22a2 2 0 1 1 0 4h-.09c-.68 0-1.3.4-1.57 1.04Z" />
      </svg>
    </button>
  );
}

// ── Weekly calendar helpers (home card) ──────────────────────────────────────
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Monday-start week. Returns a local-midnight Date for the Monday of the week containing d. */
function startOfWeekMonday(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const dow = r.getDay(); // 0 = Sun .. 6 = Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  r.setDate(r.getDate() + diff);
  return r;
}

interface DayCellState {
  iso: string;
  date: number;
  label: string;
  isToday: boolean;
  isDone: boolean;
  isMissed: boolean;
  isOff: boolean;
  mins: number;
  programId?: string;
  programName?: string;
  time?: string;
}

interface DayConfig {
  off?: boolean;
  reminders?: string[];      // legacy (Progress page calendar)
  programId?: string;
  time?: string;
}
const DAY_CONFIG_KEY = 'posturefix_day_config';

function loadDayConfigMap(): Record<string, DayConfig> {
  try {
    const raw = localStorage.getItem(DAY_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DayConfig>) : {};
  } catch { return {}; }
}

function isConfigEmpty(cfg: DayConfig): boolean {
  return !cfg.off
    && !cfg.programId
    && !cfg.time
    && (!cfg.reminders || cfg.reminders.length === 0);
}

interface ProgramOption { id: string; name: string }

/** Prefer user's created programs; fall back to a dummy pair if the library is empty. */
function getProgramOptions(): ProgramOption[] {
  const lib = typeof window !== 'undefined' ? (() => {
    try { return JSON.parse(localStorage.getItem('posturefix_program_library') ?? 'null'); }
    catch { return null; }
  })() : null;
  const entries = lib?.entries as Array<{ id: string; name: string }> | undefined;
  if (entries && entries.length) return entries.map(e => ({ id: e.id, name: e.name }));
  return [
    { id: 'daily', name: 'Daily Program' },
    { id: 'winging-scapula', name: 'Winging Scapula' },
  ];
}

function buildWeek(
  weekStart: Date,
  todayIso: string,
  plannedMins: number,
  configs: Record<string, DayConfig>,
  programNameById: Record<string, string>,
): DayCellState[] {
  const log = loadProgressLog();
  const completed = new Map<string, number>();
  for (const e of log) {
    if (e.fullyCompleted) completed.set(e.date, e.minutesCompleted ?? plannedMins);
  }
  const cells: DayCellState[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const iso = toIsoDate(d);
    const cfg = configs[iso];
    const isDone = completed.has(iso);
    const isOff = cfg?.off === true;
    const isToday = iso === todayIso;
    const isPast = iso < todayIso;
    const hasProgram = Boolean(cfg?.programId);
    // Only treat past days as missed if they had a scheduled program.
    const isMissed = isPast && !isDone && !isOff && hasProgram;
    cells.push({
      iso,
      date: d.getDate(),
      label: WEEK_LABELS[i],
      isToday,
      isDone,
      isMissed,
      isOff,
      mins: isDone ? (completed.get(iso) ?? plannedMins) : plannedMins,
      programId: cfg?.programId,
      programName: cfg?.programId ? programNameById[cfg.programId] : undefined,
      time: cfg?.time,
    });
  }
  return cells;
}

function getFocusTitle(labels: string[]): string {
  if (!labels.length) return 'Daily Program';
  if (labels.length === 1) return `${labels[0]} Relief`;
  const compact = `${labels[0]} & ${labels[1]}`;
  return compact.length > 26 ? `${labels[0]} Relief` : compact;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const program = loadActiveProgramForSession(profile);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(new Date()));
  const [configs, setConfigs] = useState<Record<string, DayConfig>>(() => loadDayConfigMap());
  const location = useLocation();

  // The weekly card is read-only here — the Schedule tab is the single source
  // of truth for editing. Re-read storage whenever the user navigates back to
  // Home so any Schedule changes show up immediately.
  useEffect(() => {
    setConfigs(loadDayConfigMap());
  }, [location.pathname, location.key]);

  // No weekly program yet → prompt the user to set one up.
  const hasWeeklyPlan = useMemo(() => {
    return Object.values(configs).some(c => !isConfigEmpty(c));
  }, [configs]);

  const programOptions = useMemo(() => getProgramOptions(), []);
  const programNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of programOptions) m[p.id] = p.name;
    return m;
  }, [programOptions]);

  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const plannedMins = program?.totalDurationMin ?? 6;
  const weekCells = useMemo(
    () => buildWeek(weekStart, todayIso, plannedMins, configs, programNameById),
    [weekStart, todayIso, plannedMins, configs, programNameById],
  );
  const weekRangeLabel = useMemo(() => {
    const start = weekStart;
    const end = addDays(weekStart, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    return sameMonth
      ? `${MONTH_LABELS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`
      : `${MONTH_LABELS[start.getMonth()]} ${start.getDate()} – ${MONTH_LABELS[end.getMonth()]} ${end.getDate()}`;
  }, [weekStart]);

  const totalEx = program?.exercises.length ?? 0;
  const completedEx = program?.exercises.filter(e => e.completed).length ?? 0;
  const allDone = totalEx > 0 && completedEx === totalEx;
  const progress = totalEx > 0 ? completedEx / totalEx : 0;
  const hasProgram = Boolean(program && totalEx > 0);
  const focusTitle = useMemo(() => getFocusTitle(program?.focusAreas ?? []), [program]);
  const bottomLabel = allDone
    ? 'All done for today'
    : completedEx > 0
      ? `${completedEx}/${totalEx} exercises done`
      : 'Ready for today';
  const ctaLabel = hasProgram ? (completedEx > 0 ? 'Continue program' : 'Start program') : 'Start body scan';

  return (
    <Layout>
      <div style={{ minHeight: '100dvh', background: T.bg }}>
        <div style={{ padding: '0 20px 20px', fontFamily: T.font }}>
          <div style={{ paddingTop: 52, marginBottom: 28, animation: 'fadeIn 0.45s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  <span>Posture</span>
                  <span style={{ color: T.gold }}>Fix</span>
                </h1>
              </div>
              <SettingsButton onClick={() => navigate('/settings')} />
            </div>
          </div>

          {/* ── Weekly setup prompt (only when no plan is set) ── */}
          {!hasWeeklyPlan && (
            <section style={{ marginBottom: 20, animation: 'slideUp 0.4s ease 0.02s both' }}>
              <div
                style={{
                  borderRadius: 20,
                  padding: 18,
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(249,115,22,0.04) 100%)',
                  border: '1px solid rgba(249,115,22,0.32)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  fontFamily: T.font,
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(249,115,22,0.18)',
                  border: '1px solid rgba(249,115,22,0.32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.gold,
                }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="3" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>
                    Set up your weekly program
                  </div>
                  <div style={{ fontSize: 12, color: T.text2, marginTop: 2, lineHeight: 1.35 }}>
                    Pick a program and reminder time for every day of the week.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/schedule')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'linear-gradient(90deg, #ea580c, #fb923c)',
                    border: 'none',
                    color: '#0a0a0c',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: T.font,
                    flexShrink: 0,
                  }}
                >
                  Set up
                </button>
              </div>
            </section>
          )}

          {/* ── Daily Program Card (Figma V7) ── */}
          <section style={{ marginBottom: 28, animation: 'slideUp 0.4s ease 0.04s both' }}>
            {(() => {
              const { streak: realStreak } = getDailyStats();
              const levelState = getLevelInfo().state;
              const LEVEL_LABELS: Record<string, { label: string }> = {
                beginner:     { label: 'Beginner' },
                intermediate: { label: 'Intermediate' },
                advanced:     { label: 'Advanced' },
              };
              const lvl = levelState ? LEVEL_LABELS[levelState.currentLevel] : null;
              const streak = realStreak;

              return (
                <>
                  <div
                    style={{
                      borderRadius: 24,
                      background: 'rgba(23,23,23,0.8)',
                      border: '1px solid #27272a',
                      padding: 24,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div>
                          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
                            Daily Program
                          </h1>
                          <p style={{ fontSize: 13, color: '#737373', letterSpacing: '-0.01em' }}>
                            {hasProgram ? `${program!.totalDurationMin} min` : '6 min'} · {hasProgram ? `${totalEx} exercises` : '6 exercises'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexShrink: 0, marginLeft: 12 }}>
                          {/* Play button */}
                          <button
                            type="button"
                            onClick={() => navigate(hasProgram ? '/program' : '/scan')}
                            aria-label={ctaLabel}
                            style={{
                              width: 48, height: 48, borderRadius: '50%',
                              background: '#f97316',
                              border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 10px 15px -3px rgba(249,115,22,0.2)',
                              flexShrink: 0,
                            }}
                          >
                            {allDone ? (
                              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF" style={{ marginLeft: 2 }}>
                                <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                              </svg>
                            )}
                          </button>

                          {/* Streak */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 48, height: 48, borderRadius: '50%',
                              background: 'rgba(249,115,22,0.1)',
                              border: '1px solid rgba(249,115,22,0.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                              </svg>
                            </div>
                            <div style={{ marginTop: 6, textAlign: 'center', lineHeight: 1 }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{streak}</div>
                              <div style={{ fontSize: 9, color: '#737373', letterSpacing: '0.12em', marginTop: 2, fontWeight: 600 }}>STREAK</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Level badge */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '4px 12px', borderRadius: 9999,
                        background: 'rgba(249,115,22,0.1)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        color: '#fb923c', fontSize: 14,
                        letterSpacing: '-0.01em',
                        marginBottom: 24,
                      }}>
                        {lvl?.label ?? 'Beginner'}
                      </div>

                      {/* Week navigator */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setWeekStart(prev => addDays(prev, -7)); }}
                          aria-label="Previous week"
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(39,39,42,0.6)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#a1a1aa',
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <span style={{ fontSize: 14, color: '#d4d4d8', letterSpacing: '-0.01em' }}>
                          {weekRangeLabel}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setWeekStart(prev => addDays(prev, 7)); }}
                          aria-label="Next week"
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(39,39,42,0.6)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#a1a1aa',
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </div>

                      {/* Date cards */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}
                      >
                        {weekCells.map((d) => {
                          const isToday = d.isToday;
                          const isDone = d.isDone;
                          const isMissed = d.isMissed;
                          const isOff = d.isOff;
                          const programInitial = d.programName ? d.programName.trim().charAt(0).toUpperCase() : null;

                          const cs = isToday
                            ? { bg: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)', border: '#fb923c', shadow: '0 10px 15px -3px rgba(249,115,22,0.3)', scale: 'scale(1.05)', lbl: 'rgba(255,255,255,0.9)', dt: '#FFFFFF' }
                            : isDone
                            ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.4)', shadow: 'none', scale: 'none', lbl: '#34d399', dt: '#6ee7b7' }
                            : isMissed
                            ? { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', shadow: 'none', scale: 'none', lbl: '#f87171', dt: '#fca5a5' }
                            : isOff
                            ? { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.04)', shadow: 'none', scale: 'none', lbl: '#52525b', dt: '#3f3f46' }
                            : { bg: 'rgba(39,39,42,0.4)', border: '#27272a', shadow: 'none', scale: 'none', lbl: '#737373', dt: '#d4d4d8' };

                          const bs = isToday
                            ? { bg: '#FFFFFF', color: '#ea580c', shadow: 'none' }
                            : isDone
                            ? { bg: '#10b981', color: '#FFFFFF', shadow: '0 2px 4px rgba(16,185,129,0.2)' }
                            : { bg: '#404040', color: '#e5e5e5', shadow: 'none' };

                          // Bottom row content (only one of these renders).
                          // Priority: off > missed > scheduled time > done dot > upcoming dot.
                          let bottomNode: React.ReactNode = null;
                          if (isOff) {
                            bottomNode = (
                              <span style={{ fontSize: 8, fontWeight: 700, color: '#52525b', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Off</span>
                            );
                          } else if (isMissed) {
                            bottomNode = (
                              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            );
                          } else if (d.time) {
                            // Today gets the dark highlighted chip; other days
                            // get a subtle text version so the time is still
                            // visible without dominating.
                            bottomNode = isToday ? (
                              <span style={{
                                padding: '2px 6px', borderRadius: 6,
                                background: 'rgba(0,0,0,0.25)',
                                color: '#FFFFFF', fontSize: 10,
                                letterSpacing: '-0.01em', lineHeight: 1,
                                fontVariantNumeric: 'tabular-nums',
                              }}>
                                {d.time}
                              </span>
                            ) : (
                              <span style={{
                                color: isDone ? '#34d399' : '#71717a',
                                fontSize: 10, fontWeight: 500, lineHeight: 1,
                                letterSpacing: '-0.01em',
                                fontVariantNumeric: 'tabular-nums',
                              }}>
                                {d.time}
                              </span>
                            );
                          } else if (!isDone) {
                            bottomNode = (
                              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#404040' }} />
                            );
                          }

                          return (
                            <div
                              key={d.iso}
                              style={{
                                position: 'relative',
                                aspectRatio: '1 / 2',
                                borderRadius: 16,
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 4px',
                                background: cs.bg,
                                border: `1px solid ${cs.border}`,
                                boxShadow: cs.shadow,
                                transform: cs.scale,
                                fontFamily: T.font,
                                color: 'inherit',
                              }}
                            >
                              {/* Done badge — corner placement so it never collides with the time chip */}
                              {isDone && (
                                <div style={{
                                  position: 'absolute',
                                  top: -5,
                                  right: -5,
                                  width: 16, height: 16, borderRadius: '50%',
                                  background: '#10b981',
                                  border: '2px solid #141416',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(16,185,129,0.35)',
                                }}>
                                  <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              )}

                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                letterSpacing: '0.1em',
                                color: cs.lbl,
                                lineHeight: 1,
                              }}>
                                {d.label.toUpperCase()}
                              </span>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <span style={{
                                  fontSize: 16, fontWeight: 700, lineHeight: 1,
                                  color: cs.dt, letterSpacing: '-0.01em',
                                }}>
                                  {d.date}
                                </span>
                                {programInitial && !isOff && (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 18, height: 18, borderRadius: 4,
                                    background: bs.bg, color: bs.color,
                                    fontSize: 10, fontWeight: 700, lineHeight: 1,
                                    boxShadow: bs.shadow,
                                  }}>
                                    {programInitial}
                                  </span>
                                )}
                              </div>

                              <div style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {bottomNode}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>

                </>
              );
            })()}
          </section>

          <section style={{ animation: 'slideUp 0.4s ease 0.1s both' }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 14 }}>
              Common Problems
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {postureProblems.map((problem, i) => {
                const accent = CARD_ACCENTS[problem.id] ?? CARD_ACCENTS['forward-head'];
                return (
                  <div
                    key={problem.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/problem/${problem.id}`)}
                      aria-label={problem.title}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        padding: 0,
                        borderRadius: 24,
                        background: '#0D0D0F',
                        border: `1px solid ${T.border}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'flex-end',
                        boxShadow: '0 10px 28px rgba(0,0,0,0.24)',
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, background: accent.gradient, opacity: 0.95, pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', width: 140, height: 140, borderRadius: '50%', background: accent.glow, filter: 'blur(28px)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: '#050505', zIndex: 0 }} />
                      <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img
                          src={problem.cardImage}
                          alt=""
                          draggable={false}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: problem.cardImageObjectPosition ?? 'center',
                            transform: 'scale(1.08)',
                            filter: 'saturate(1.02) contrast(1.03)',
                          }}
                        />
                      </div>
                    </button>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#F4F4F5',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        marginTop: 10,
                        fontFamily: T.font,
                      }}
                    >
                      {problem.title}
                    </span>
                  </div>
                );
              })}
            </div>

          </section>
        </div>
      </div>

    </Layout>
  );
};

export default Home;
