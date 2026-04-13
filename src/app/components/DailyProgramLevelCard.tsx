import React, { useEffect, useMemo, useState } from 'react';
import { getLevelInfo, type UserLevel } from '../services/DailyProgram';

const T = {
  border: 'rgba(255,255,255,0.05)', border2: 'rgba(255,255,255,0.10)',
  surface: '#141416', surface2: '#1A1A1E',
  text: '#FFFFFF', text2: 'rgba(161,161,170,1)', text3: 'rgba(113,113,122,1)',
  green: '#22C55E', orange: '#FB923C', red: '#EF4444',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

// ── Day config (off / reminder times) ────────────────────────────────────────
interface DayConfig { off: boolean; reminders: string[] }
type ConfigMap = Record<string, DayConfig>;

const DAY_CONFIG_KEY = 'posturefix_day_config';

const loadDayConfigs = (): ConfigMap => {
  try {
    const raw = localStorage.getItem(DAY_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as ConfigMap) : {};
  } catch { return {}; }
};

const saveDayConfigs = (cfg: ConfigMap) => {
  try { localStorage.setItem(DAY_CONFIG_KEY, JSON.stringify(cfg)); } catch {}
};

const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const startOfWeek = (d: Date): Date => {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  const dow = n.getDay(); // 0 = Sun
  n.setDate(n.getDate() - dow);
  return n;
};

const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const WEEKDAY_LABEL = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABEL = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const LEVEL_CONFIG: Record<UserLevel, { label: string; icon: string; color: string; glow: string }> = {
  beginner:     { label: 'Beginner',     icon: '🌱', color: '#22C55E', glow: 'rgba(34,197,94,0.18)' },
  intermediate: { label: 'Intermediate', icon: '⚡', color: '#F59E0B', glow: 'rgba(245,158,11,0.18)' },
  advanced:     { label: 'Advanced',     icon: '🔥', color: '#EF4444', glow: 'rgba(239,68,68,0.18)' },
};

const LEVEL_ORDER: UserLevel[] = ['beginner', 'intermediate', 'advanced'];

/** Program level card with a weekly calendar of reminders + off days. */
const DailyProgramLevelCard: React.FC = () => {
  const info = getLevelInfo();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [configs, setConfigs] = useState<ConfigMap>(() => loadDayConfigs());
  const [editingDate, setEditingDate] = useState<string | null>(null);

  useEffect(() => { saveDayConfigs(configs); }, [configs]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const rangeLabel = sameMonth
    ? `${MONTH_LABEL[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}`
    : `${MONTH_LABEL[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_LABEL[weekEnd.getMonth()]} ${weekEnd.getDate()}`;

  const updateDay = (iso: string, patch: Partial<DayConfig>) => {
    setConfigs(prev => {
      const existing = prev[iso] ?? { off: false, reminders: [] };
      const next = { ...existing, ...patch };
      if (!next.off && next.reminders.length === 0) {
        const { [iso]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [iso]: next };
    });
  };

  const state = info.state;
  const isMaxLevel = info.isMaxLevel;
  const current = state ? LEVEL_CONFIG[state.currentLevel] : LEVEL_CONFIG.beginner;
  const allCompleted = Boolean(isMaxLevel);

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)',
      borderRadius: 24,
      padding: 20,
      border: `1px solid ${T.border}`,
      marginBottom: 0,
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        position: 'absolute', top: '-30%', left: '10%',
        width: 140, height: 140, borderRadius: '50%',
        background: current.glow, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{current.icon}</span>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, fontFamily: T.font }}>
              {state ? 'Current Level' : 'Your program'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: current.color, fontFamily: T.font, letterSpacing: '-0.02em' }}>
              {state ? current.label : 'Weekly plan'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, fontFamily: T.font }}>
            This week
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.font }}>
            {rangeLabel}
          </div>
        </div>
      </div>

      {/* ── Weekly calendar ───────────────────────── */}
      <div style={{ marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setWeekStart(prev => addDays(prev, -7))}
            aria-label="Previous week"
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: T.surface, border: `1px solid ${T.border2}`,
              color: T.text2, fontSize: 14, cursor: 'pointer', fontFamily: T.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >‹</button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            style={{
              fontSize: 11, fontWeight: 600, color: T.text2,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: T.font, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}
          >Today</button>
          <button
            type="button"
            onClick={() => setWeekStart(prev => addDays(prev, 7))}
            aria-label="Next week"
            style={{
              width: 30, height: 30, borderRadius: 10,
              background: T.surface, border: `1px solid ${T.border2}`,
              color: T.text2, fontSize: 14, cursor: 'pointer', fontFamily: T.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
          {weekDays.map((d, i) => {
            const iso = toISODate(d);
            const cfg = configs[iso];
            const isToday = d.getTime() === today.getTime();
            const isOff = cfg?.off === true;
            const reminders = cfg?.reminders ?? [];
            const hasReminders = !isOff && reminders.length > 0;
            const ringColor = isOff ? T.red : hasReminders ? current.color : T.border2;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setEditingDate(iso)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '8px 2px 8px',
                  borderRadius: 12,
                  background: isToday ? `${current.color}14` : T.surface,
                  border: `1px solid ${isToday ? current.color + '66' : ringColor === T.border2 ? T.border : ringColor + '55'}`,
                  cursor: 'pointer', fontFamily: T.font, minHeight: 72,
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 600, color: T.text3, letterSpacing: '0.05em' }}>
                  {WEEKDAY_LABEL[i]}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: isToday ? current.color : T.text }}>
                  {d.getDate()}
                </span>
                {isOff ? (
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.red, lineHeight: 1 }}>✕</span>
                ) : hasReminders ? (
                  <span style={{
                    fontSize: 8, fontWeight: 600, color: current.color,
                    lineHeight: 1.15, textAlign: 'center',
                    maxWidth: '100%', overflow: 'hidden',
                  }}>
                    {reminders.length === 1 ? reminders[0] : `${reminders.length} rem.`}
                  </span>
                ) : (
                  <span style={{ fontSize: 10, color: T.text3, opacity: 0.5 }}>+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Level roadmap ─────────────────────── */}
      {state && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '12px 0 0', borderTop: `1px solid ${T.border}`,
          position: 'relative', zIndex: 1,
        }}>
          {LEVEL_ORDER.map((level, i) => {
            const cfg = LEVEL_CONFIG[level];
            const isCompleted = state.completedLevels.includes(level);
            const isCurrent = state.currentLevel === level && !allCompleted;

            return (
              <React.Fragment key={level}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted ? cfg.color : isCurrent ? `${cfg.color}22` : 'rgba(255,255,255,0.04)',
                    border: isCurrent ? `2px solid ${cfg.color}` : isCompleted ? 'none' : `1px solid ${T.border2}`,
                    fontSize: 14,
                  }}>
                    {isCompleted ? '✓' : cfg.icon}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted ? cfg.color : isCurrent ? T.text : T.text3,
                    marginTop: 5, fontFamily: T.font,
                  }}>
                    {cfg.label}
                  </span>
                </div>
                {i < LEVEL_ORDER.length - 1 && (
                  <div style={{
                    flex: 0.6, height: 2, marginTop: -16,
                    background: isCompleted ? cfg.color : `linear-gradient(90deg, ${T.border2}, ${T.border})`,
                    borderRadius: 1,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {editingDate && (
        <DayEditModal
          iso={editingDate}
          config={configs[editingDate] ?? { off: false, reminders: [] }}
          accent={current.color}
          onClose={() => setEditingDate(null)}
          onSave={(next) => {
            updateDay(editingDate, next);
            setEditingDate(null);
          }}
        />
      )}
    </div>
  );
};

// ── Day edit modal ───────────────────────────────────────────────────────────

interface DayEditModalProps {
  iso: string;
  config: DayConfig;
  accent: string;
  onClose: () => void;
  onSave: (cfg: DayConfig) => void;
}

const prettyDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dt.getDay()];
  return `${dow}, ${MONTH_LABEL[dt.getMonth()]} ${dt.getDate()}`;
};

const DayEditModal: React.FC<DayEditModalProps> = ({ iso, config, accent, onClose, onSave }) => {
  const [off, setOff] = useState<boolean>(config.off);
  const [reminders, setReminders] = useState<string[]>(config.reminders);
  const [draftTime, setDraftTime] = useState<string>('08:00');

  const addReminder = () => {
    if (!/^\d{2}:\d{2}$/.test(draftTime)) return;
    if (reminders.includes(draftTime)) return;
    setReminders([...reminders, draftTime].sort());
  };

  const removeReminder = (t: string) => {
    setReminders(reminders.filter(r => r !== t));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: 'linear-gradient(180deg, #1E1E22 0%, #141416 100%)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderTop: `1px solid ${T.border2}`,
          padding: 20, paddingBottom: 28,
          fontFamily: T.font, color: T.text,
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: T.border2, margin: '0 auto 14px',
        }} />

        <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 2 }}>
          Edit day
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          {prettyDate(iso)}
        </div>

        <button
          type="button"
          onClick={() => setOff(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', borderRadius: 14,
            background: off ? 'rgba(239,68,68,0.12)' : T.surface,
            border: `1px solid ${off ? T.red + '66' : T.border2}`,
            color: T.text, cursor: 'pointer', fontFamily: T.font, marginBottom: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, color: off ? T.red : T.text2 }}>{off ? '✕' : '○'}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Off day</div>
              <div style={{ fontSize: 11, color: T.text3 }}>
                {off ? 'No workout or reminders' : 'Tap to mark as a rest day'}
              </div>
            </div>
          </div>
          <div style={{
            width: 36, height: 22, borderRadius: 11, position: 'relative',
            background: off ? T.red : 'rgba(255,255,255,0.1)',
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: off ? 16 : 2,
              width: 18, height: 18, borderRadius: '50%',
              background: '#FFF', transition: 'left 0.2s',
            }} />
          </div>
        </button>

        <div style={{ opacity: off ? 0.4 : 1, pointerEvents: off ? 'none' : 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Daily reminders
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, minHeight: 36 }}>
            {reminders.length === 0 && (
              <div style={{ fontSize: 12, color: T.text3, padding: '8px 0' }}>
                No reminders set for this day.
              </div>
            )}
            {reminders.map(t => (
              <div
                key={t}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px 6px 12px', borderRadius: 999,
                  background: `${accent}18`, border: `1px solid ${accent}55`,
                  fontSize: 12, fontWeight: 600, color: accent,
                }}
              >
                <span>🔔 {t}</span>
                <button
                  type="button"
                  onClick={() => removeReminder(t)}
                  aria-label={`Remove reminder ${t}`}
                  style={{
                    width: 18, height: 18, borderRadius: 9,
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    color: T.text2, cursor: 'pointer', fontSize: 11, lineHeight: 1,
                  }}
                >×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="time"
              value={draftTime}
              onChange={e => setDraftTime(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: 12,
                background: T.surface, border: `1px solid ${T.border2}`,
                color: T.text, fontSize: 14, fontFamily: T.font,
                colorScheme: 'dark',
              }}
            />
            <button
              type="button"
              onClick={addReminder}
              style={{
                padding: '0 16px', borderRadius: 12,
                background: accent, border: 'none',
                color: '#0A0A0C', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: T.font,
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: 14, borderRadius: 14,
              background: T.surface, border: `1px solid ${T.border2}`,
              color: T.text2, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.font,
            }}
          >Cancel</button>
          <button
            type="button"
            onClick={() => onSave({ off, reminders })}
            style={{
              flex: 1, padding: 14, borderRadius: 14,
              background: `linear-gradient(90deg, ${accent}, ${accent}CC)`,
              border: 'none', color: '#0A0A0C',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: T.font,
            }}
          >Save</button>
        </div>
      </div>
    </div>
  );
};

export default DailyProgramLevelCard;
