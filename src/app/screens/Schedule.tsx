import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2, X } from 'lucide-react';
import Layout from '../components/Layout';
import {
  WEEKDAY_KEYS,
  WEEKDAY_FULL,
  type WeekdayKey,
  type DayConfig,
  type WeeklyTemplate,
  emptyTemplate,
  loadWeeklyTemplate,
  saveWeeklyTemplate,
  loadDayConfigMap,
  saveDayConfigMap,
  applyTemplateToDates,
  loadProgramOptions,
  getDayTimes,
  normalizeTimes,
  type ProgramOption,
} from '../services/WeeklySchedule';

const FONT = "system-ui, -apple-system, 'Helvetica Neue', sans-serif";

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const programs = useMemo<ProgramOption[]>(() => loadProgramOptions(), []);
  const defaultProgramId = programs[0]?.id ?? 'daily';

  // Seed each weekday with sensible defaults so the UI always shows time/program.
  const seedTemplate = (src: WeeklyTemplate | null): WeeklyTemplate => {
    const t = emptyTemplate();
    for (const k of WEEKDAY_KEYS) {
      const s = src?.[k] ?? {};
      const existingTimes = getDayTimes(s);
      const seededTimes = existingTimes.length > 0 ? existingTimes : ['08:00'];
      t[k] = {
        off: s.off ?? false,
        programId: s.programId ?? defaultProgramId,
        time: seededTimes[0],
        times: seededTimes,
        reminders: s.reminders,
      };
    }
    return t;
  };

  const [template, setTemplate] = useState<WeeklyTemplate>(() => seedTemplate(loadWeeklyTemplate()));
  const [editing, setEditing] = useState<WeekdayKey | null>(null);

  useEffect(() => {
    setTemplate(seedTemplate(loadWeeklyTemplate()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDay = (key: WeekdayKey, patch: Partial<DayConfig>) => {
    setTemplate(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const handleSave = () => {
    // Strip programId/time when off so storage stays clean.
    const cleaned = emptyTemplate();
    for (const k of WEEKDAY_KEYS) {
      const d = template[k];
      if (d.off) {
        cleaned[k] = { off: true, reminders: d.reminders };
      } else {
        const times = normalizeTimes(getDayTimes(d));
        cleaned[k] = {
          off: false,
          reminders: d.reminders,
          programId: d.programId || undefined,
          // Keep both fields in sync: `time` is the first reminder for any
          // legacy reader; `times` is the full canonical list.
          time: times[0],
          times: times.length > 0 ? times : undefined,
        };
      }
    }
    saveWeeklyTemplate(cleaned);
    saveDayConfigMap(applyTemplateToDates(cleaned, loadDayConfigMap(), 4));
    navigate('/');
  };

  const handleCancel = () => {
    setTemplate(seedTemplate(loadWeeklyTemplate()));
    navigate(-1);
  };

  return (
    <Layout>
      <div style={{ minHeight: '100%', background: '#000000', color: '#FFFFFF', fontFamily: FONT }}>
        <main style={{ padding: '52px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontSize: 10, letterSpacing: '0.22em', color: '#737373',
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              Weekly Schedule
            </span>
            <h1 style={{
              fontSize: 30, fontWeight: 600, color: '#FFFFFF',
              letterSpacing: '-0.02em', margin: 0, lineHeight: 1,
            }}>
              Your week
            </h1>
          </div>

          {/* 2-col grid of day cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}>
            {WEEKDAY_KEYS.map((key) => {
              const day = template[key];
              const isActive = editing === key;
              const programLabel = programs.find(p => p.id === day.programId)?.name;
              return (
                <DayCard
                  key={key}
                  name={WEEKDAY_FULL[key]}
                  times={getDayTimes(day)}
                  off={Boolean(day.off)}
                  active={isActive}
                  programLabel={programLabel ?? '—'}
                  onClick={() => setEditing(key)}
                />
              );
            })}
          </div>

          {/* Cancel / Save footer */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1, padding: '14px 0',
                borderRadius: 16,
                background: '#161618',
                border: 'none',
                color: '#d4d4d4',
                fontSize: 14, fontFamily: FONT, fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1d1d20'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#161618'; }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                flex: 1.4, padding: '14px 0',
                borderRadius: 16,
                background: '#F97316',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 14, fontFamily: FONT, fontWeight: 500,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ea580c'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F97316'; }}
            >
              <Check size={16} strokeWidth={2.5} />
              Save
            </button>
          </div>
        </main>
      </div>

      {editing && (
        <DayEditModal
          dayKey={editing}
          name={WEEKDAY_FULL[editing]}
          day={template[editing]}
          programs={programs}
          onChange={(patch) => updateDay(editing, patch)}
          onClose={() => setEditing(null)}
        />
      )}
    </Layout>
  );
};

// ── Day card ────────────────────────────────────────────────────────────────

interface DayCardProps {
  name: string;
  times: string[];
  off: boolean;
  active: boolean;
  programLabel: string;
  onClick: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ name, times, off, active, programLabel, onClick }) => {
  const bg = off
    ? 'rgba(255,255,255,0.025)'
    : active
      ? '#F97316'
      : '#161618';

  const nameColor = off ? '#525252' : '#FFFFFF';
  const timeColor = off ? '#404040' : '#FFFFFF';
  const labelColor = off
    ? '#404040'
    : active
      ? 'rgba(255,255,255,0.85)'
      : '#d4d4d8';

  const primaryTime = times[0] ?? '';
  const extraReminders = Math.max(0, times.length - 1);

  // Pill background for the +N badge — adjusts to the active orange state.
  const badgeBg = active ? 'rgba(255,255,255,0.18)' : 'rgba(249,115,22,0.18)';
  const badgeColor = active ? '#FFFFFF' : '#F97316';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        aspectRatio: '1 / 1',
        borderRadius: 24,
        padding: 20,
        background: bg,
        border: 'none',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        fontFamily: FONT,
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!off && !active) e.currentTarget.style.background = '#1d1d20';
      }}
      onMouseLeave={(e) => {
        if (!off && !active) e.currentTarget.style.background = '#161618';
      }}
    >
      <span style={{
        fontSize: 17, color: nameColor,
        letterSpacing: '-0.02em', lineHeight: 1, fontWeight: 500,
      }}>
        {name}
      </span>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontSize: 26, color: timeColor,
              letterSpacing: '-0.02em', lineHeight: 1, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {off ? '—' : (primaryTime || '—')}
            </span>
            {!off && extraReminders > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 7px',
                borderRadius: 9999,
                background: badgeBg,
                color: badgeColor,
                fontSize: 10, fontWeight: 600, lineHeight: 1.2,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
              }}>
                +{extraReminders}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 13, color: labelColor,
            letterSpacing: '-0.01em', lineHeight: 1.25, fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}>
            {off ? 'Rest' : programLabel}
          </span>
        </div>

        {!off && (
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: active ? '#FFFFFF' : '#F97316',
            flexShrink: 0,
            marginBottom: 6,
          }} />
        )}
      </div>
    </button>
  );
};

// ── Reminders field ─────────────────────────────────────────────────────────

const MAX_REMINDERS = 5;

interface RemindersFieldProps {
  times: string[];
  onChange: (next: string[]) => void;
}

const RemindersField: React.FC<RemindersFieldProps> = ({ times, onChange }) => {
  // Always show at least one row so the user has somewhere to type.
  const rows = times.length > 0 ? times : [''];
  const canAdd = rows.length < MAX_REMINDERS;

  const updateAt = (i: number, value: string) => {
    const next = [...rows];
    next[i] = value;
    onChange(next.filter(Boolean));
  };

  const removeAt = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next);
  };

  const add = () => {
    onChange([...rows.filter(Boolean), '08:00']);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 10, letterSpacing: '0.18em', color: '#737373',
          textTransform: 'uppercase', fontWeight: 500,
        }}>
          Reminders
        </span>
        <span style={{
          fontSize: 10, color: '#525252',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {rows.filter(Boolean).length}/{MAX_REMINDERS}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((value, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 16,
              padding: '10px 12px 10px 16px',
            }}
          >
            <span style={{ fontSize: 13, color: '#a3a3a3', flex: 1 }}>
              {i === 0 ? 'Time' : `Reminder ${i + 1}`}
            </span>
            <input
              type="time"
              value={value}
              onChange={(e) => updateAt(i, e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#FFFFFF',
                fontSize: 20,
                fontFamily: FONT,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                textAlign: 'right',
                colorScheme: 'dark',
              }}
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove reminder ${i + 1}`}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: 'none',
                  color: '#737373',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#737373';
                }}
              >
                <Trash2 size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>
        ))}
      </div>

      {canAdd && (
        <button
          type="button"
          onClick={add}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 0',
            borderRadius: 12,
            background: 'transparent',
            border: '1px dashed rgba(249,115,22,0.35)',
            color: '#F97316',
            fontSize: 12, fontWeight: 500, fontFamily: FONT,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add reminder
        </button>
      )}
    </div>
  );
};

// ── Edit modal ──────────────────────────────────────────────────────────────

interface DayEditModalProps {
  dayKey: WeekdayKey;
  name: string;
  day: DayConfig;
  programs: ProgramOption[];
  onChange: (patch: Partial<DayConfig>) => void;
  onClose: () => void;
}

const DayEditModal: React.FC<DayEditModalProps> = ({ name, day, programs, onChange, onClose }) => {
  const off = Boolean(day.off);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 380,
          background: '#1c1c1e',
          borderRadius: 24,
          padding: 24,
          display: 'flex', flexDirection: 'column', gap: 24,
          fontFamily: FONT, color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              fontSize: 10, letterSpacing: '0.22em', color: '#737373',
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              Editing
            </span>
            <h2 style={{
              fontSize: 22, fontWeight: 500, color: '#FFFFFF',
              letterSpacing: '-0.02em', margin: 0, lineHeight: 1,
            }}>
              {name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <X size={16} strokeWidth={2.2} color="#a3a3a3" />
          </button>
        </div>

        {/* Active / Rest pill toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 9999,
          padding: 4,
        }}>
          <button
            type="button"
            onClick={() => onChange({ off: false })}
            style={{
              flex: 1, padding: '8px 0',
              borderRadius: 9999, border: 'none',
              background: !off ? '#F97316' : 'transparent',
              color: !off ? '#FFFFFF' : '#a3a3a3',
              fontSize: 13, fontFamily: FONT, fontWeight: 500,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => onChange({ off: true })}
            style={{
              flex: 1, padding: '8px 0',
              borderRadius: 9999, border: 'none',
              background: off ? '#FFFFFF' : 'transparent',
              color: off ? '#000000' : '#a3a3a3',
              fontSize: 13, fontFamily: FONT, fontWeight: 500,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            Rest day
          </button>
        </div>

        {/* Disabled wrapper for active fields */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 20,
          opacity: off ? 0.3 : 1,
          pointerEvents: off ? 'none' : 'auto',
          transition: 'opacity 0.2s ease',
        }}>
          {/* Program selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{
              fontSize: 10, letterSpacing: '0.18em', color: '#737373',
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              Program
            </span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}>
              {programs.map((p) => {
                const sel = p.id === day.programId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ programId: p.id })}
                    style={{
                      padding: 12, borderRadius: 16,
                      background: sel ? '#F97316' : 'rgba(255,255,255,0.04)',
                      border: 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: FONT,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    }}
                    onMouseLeave={(e) => {
                      if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <span style={{
                      fontSize: 14, color: '#FFFFFF',
                      letterSpacing: '-0.01em', fontWeight: 500,
                    }}>
                      {p.name}
                    </span>
                    <span style={{
                      fontSize: 11, color: sel ? 'rgba(255,255,255,0.7)' : '#737373',
                      fontWeight: 400,
                    }}>
                      Type {p.name.trim().charAt(0).toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reminders — one or more times per day */}
          <RemindersField
            times={getDayTimes(day)}
            onChange={(next) => onChange({ time: next[0], times: next })}
          />
        </div>

        {/* Done button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '14px 0',
            borderRadius: 16,
            background: '#F97316',
            border: 'none',
            color: '#FFFFFF',
            fontSize: 14, fontFamily: FONT, fontWeight: 500,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ea580c'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F97316'; }}
        >
          <Check size={16} strokeWidth={2.5} />
          Done
        </button>
      </div>
    </div>
  );
};

export default Schedule;
