import React, { useEffect, useMemo, useState } from 'react';

const T = {
  bg: '#09090B',
  surface: '#141416',
  text: '#FFFFFF',
  text2: 'rgba(228,228,231,0.75)',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
  gold: '#F97316',
  gold2: '#FB923C',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

// ── Storage shared with Home.tsx (same keys, same shapes) ───────────────────

interface DayConfig {
  off?: boolean;
  reminders?: string[];
  programId?: string;
  time?: string;
}

const DAY_CONFIG_KEY = 'posturefix_day_config';
const WEEKLY_TEMPLATE_KEY = 'posturefix_weekly_template';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type WeekdayKey = typeof WEEKDAY_KEYS[number];
type WeeklyTemplate = Record<WeekdayKey, DayConfig>;

const SHORT_LABEL: Record<WeekdayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
  fri: 'Fri', sat: 'Sat', sun: 'Sun',
};
const FULL_LABEL: Record<WeekdayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

function emptyTemplate(): WeeklyTemplate {
  return WEEKDAY_KEYS.reduce((acc, k) => { acc[k] = {}; return acc; }, {} as WeeklyTemplate);
}

function isConfigEmpty(c: DayConfig): boolean {
  return !c.off && !c.programId && !c.time && (!c.reminders || c.reminders.length === 0);
}

function loadTemplate(): WeeklyTemplate | null {
  try {
    const raw = localStorage.getItem(WEEKLY_TEMPLATE_KEY);
    return raw ? (JSON.parse(raw) as WeeklyTemplate) : null;
  } catch { return null; }
}

function saveTemplate(t: WeeklyTemplate): void {
  try { localStorage.setItem(WEEKLY_TEMPLATE_KEY, JSON.stringify(t)); } catch {}
}

function loadDayConfigMap(): Record<string, DayConfig> {
  try {
    const raw = localStorage.getItem(DAY_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DayConfig>) : {};
  } catch { return {}; }
}

function saveDayConfigMap(cfg: Record<string, DayConfig>): void {
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

/** Apply a weekly template to per-date configs for `weeksAhead` weeks from this
 *  week's Monday. Only writes future dates and never overwrites days the user
 *  has already customised individually. */
function applyTemplateToDates(
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
      if (iso < todayIso) continue;
      if (next[iso] && !isConfigEmpty(next[iso])) continue;
      const slot = template[WEEKDAY_KEYS[i]];
      if (!slot || isConfigEmpty(slot)) continue;
      next[iso] = { ...slot };
    }
  }
  return next;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface ProgramOption { id: string; name: string }

interface WeeklyProgramCardProps {
  programs: ProgramOption[];
  onChange?: () => void;
}

// ── Card ────────────────────────────────────────────────────────────────────

const WeeklyProgramCard: React.FC<WeeklyProgramCardProps> = ({ programs, onChange }) => {
  const [template, setTemplate] = useState<WeeklyTemplate>(() => loadTemplate() ?? emptyTemplate());
  const [open, setOpen] = useState(false);

  // Re-read template from storage whenever the modal closes — keeps the card
  // in sync if the user edited days from another screen.
  useEffect(() => {
    if (!open) setTemplate(loadTemplate() ?? emptyTemplate());
  }, [open]);

  const programNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of programs) m[p.id] = p.name;
    return m;
  }, [programs]);

  const hasAnything = WEEKDAY_KEYS.some(k => !isConfigEmpty(template[k]));

  return (
    <section
      style={{
        marginBottom: 16,
        borderRadius: 20,
        background: 'rgba(20,20,24,0.7)',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '18px 18px 14px',
        backdropFilter: 'blur(8px)',
        fontFamily: T.font,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', margin: 0, marginBottom: 4 }}>
            Schedule
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
            Weekly Program
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(249,115,22,0.45)',
            color: T.gold2,
            fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
            cursor: 'pointer', fontFamily: T.font,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          {hasAnything ? 'Edit' : 'Set up'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {WEEKDAY_KEYS.map((k) => {
          const cfg = template[k];
          const off = Boolean(cfg.off);
          const programName = cfg.programId ? programNameById[cfg.programId] ?? null : null;
          const time = cfg.time;
          const empty = isConfigEmpty(cfg);
          const initial = programName ? programName.trim().charAt(0).toUpperCase() : null;

          return (
            <button
              key={k}
              type="button"
              onClick={() => setOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12,
                background: off
                  ? 'rgba(239,68,68,0.05)'
                  : empty
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(249,115,22,0.05)',
                border: `1px solid ${
                  off
                    ? 'rgba(239,68,68,0.18)'
                    : empty
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(249,115,22,0.18)'
                }`,
                cursor: 'pointer', fontFamily: T.font,
                textAlign: 'left',
              }}
            >
              <span style={{
                width: 36, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                color: off ? '#fca5a5' : empty ? T.text4 : T.text2,
                textTransform: 'uppercase', flexShrink: 0,
              }}>
                {SHORT_LABEL[k]}
              </span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 8,
                background: off
                  ? 'rgba(239,68,68,0.12)'
                  : initial
                    ? 'rgba(249,115,22,0.18)'
                    : 'rgba(255,255,255,0.04)',
                color: off ? '#fca5a5' : initial ? T.gold2 : T.text4,
                fontSize: 11, fontWeight: 800,
                flexShrink: 0,
              }}>
                {off ? '×' : (initial ?? '–')}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: empty ? T.text3 : T.text,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {off ? 'Off day' : (programName ?? 'No program set')}
                </div>
              </div>

              {!off && time && (
                <span style={{
                  fontSize: 12, fontWeight: 600, color: T.text2,
                  fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                }}>
                  {time}
                </span>
              )}
              {!off && !time && !empty && (
                <span style={{ fontSize: 11, color: T.text4, flexShrink: 0 }}>No reminder</span>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <WeeklySetupModal
          initial={template}
          programs={programs}
          onClose={() => setOpen(false)}
          onSave={(t) => {
            saveTemplate(t);
            const merged = applyTemplateToDates(t, loadDayConfigMap(), 4);
            saveDayConfigMap(merged);
            setTemplate(t);
            setOpen(false);
            onChange?.();
          }}
        />
      )}
    </section>
  );
};

// ── Modal ───────────────────────────────────────────────────────────────────

interface WeeklySetupModalProps {
  initial: WeeklyTemplate;
  programs: ProgramOption[];
  onClose: () => void;
  onSave: (t: WeeklyTemplate) => void;
}

const WeeklySetupModal: React.FC<WeeklySetupModalProps> = ({ initial, programs, onClose, onSave }) => {
  const [template, setTemplate] = useState<WeeklyTemplate>(() => {
    const seeded = emptyTemplate();
    for (const k of WEEKDAY_KEYS) {
      const src = initial[k] ?? {};
      seeded[k] = {
        off: src.off,
        programId: src.programId ?? programs[0]?.id,
        time: src.time ?? '08:00',
        reminders: src.reminders,
      };
    }
    return seeded;
  });

  const updateDay = (key: WeekdayKey, patch: Partial<DayConfig>) => {
    setTemplate(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const applyToAll = (patch: Partial<DayConfig>) => {
    setTemplate(prev => {
      const next = { ...prev };
      for (const k of WEEKDAY_KEYS) next[k] = { ...next[k], ...patch };
      return next;
    });
  };

  const handleSave = () => {
    const cleaned = emptyTemplate();
    for (const k of WEEKDAY_KEYS) {
      const d = template[k];
      if (d.off) {
        cleaned[k] = { off: true, reminders: d.reminders };
      } else {
        cleaned[k] = {
          off: false,
          reminders: d.reminders,
          programId: d.programId || undefined,
          time: d.time || undefined,
        };
      }
    }
    onSave(cleaned);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: '92dvh',
          background: 'linear-gradient(180deg, #1E1E22 0%, #141416 100%)',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: 20, paddingBottom: 28,
          fontFamily: T.font, color: T.text,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.12)', margin: '0 auto 14px',
          flexShrink: 0,
        }} />

        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 2 }}>
            Weekly schedule
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Set up your week
          </div>
          <div style={{ fontSize: 12, color: T.text3, marginBottom: 14 }}>
            Pick a program and reminder time for each day. Tap “Off” for rest days — they keep your streak.
          </div>
        </div>

        <div style={{
          overflowY: 'auto', flex: 1,
          display: 'flex', flexDirection: 'column', gap: 10,
          paddingRight: 4,
        }}>
          {WEEKDAY_KEYS.map((key) => {
            const day = template[key];
            const off = Boolean(day.off);
            return (
              <div
                key={key}
                style={{
                  borderRadius: 14,
                  border: `1px solid ${off ? 'rgba(239,68,68,0.32)' : 'rgba(255,255,255,0.08)'}`,
                  background: off ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                  padding: 12,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>
                    {FULL_LABEL[key]}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateDay(key, { off: !off })}
                    style={{
                      padding: '6px 10px', borderRadius: 9999,
                      background: off ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${off ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.1)'}`,
                      color: off ? '#fca5a5' : T.text2,
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                      cursor: 'pointer', fontFamily: T.font,
                    }}
                  >
                    {off ? 'OFF DAY' : 'OFF?'}
                  </button>
                </div>

                {!off && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {programs.map(p => {
                        const selected = day.programId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => updateDay(key, { programId: p.id })}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 10px', borderRadius: 9999,
                              background: selected ? 'rgba(249,115,22,0.16)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${selected ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
                              color: selected ? '#fb923c' : T.text2,
                              fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: T.font,
                            }}
                          >
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 18, height: 18, borderRadius: 6,
                              background: selected ? '#fb923c' : 'rgba(255,255,255,0.08)',
                              color: selected ? '#0a0a0c' : '#a1a1aa',
                              fontSize: 10, fontWeight: 800,
                            }}>
                              {p.name.trim().charAt(0).toUpperCase()}
                            </span>
                            {p.name}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Remind
                      </span>
                      <input
                        type="time"
                        value={day.time ?? ''}
                        onChange={(e) => updateDay(key, { time: e.target.value })}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: T.text, fontSize: 13, fontFamily: T.font,
                          colorScheme: 'dark',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => applyToAll({ time: template.mon.time, programId: template.mon.programId, off: false })}
            style={{
              padding: '8px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: T.text2, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.font,
            }}
          >
            Apply Monday to all
          </button>
          <button
            type="button"
            onClick={() => setTemplate(prev => {
              const next = { ...prev };
              next.sat = { ...next.sat, off: true };
              next.sun = { ...next.sun, off: true };
              return next;
            })}
            style={{
              padding: '8px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: T.text2, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.font,
            }}
          >
            Weekends off
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: 14, borderRadius: 14,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: T.text2, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: T.font,
            }}
          >Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1, padding: 14, borderRadius: 14,
              background: 'linear-gradient(90deg, #ea580c, #fb923c)',
              border: 'none', color: '#0a0a0c',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: T.font,
            }}
          >Save week</button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgramCard;
