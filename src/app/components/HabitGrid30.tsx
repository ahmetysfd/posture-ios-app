import React from 'react';
import type { PlanPhase } from '../services/HabitPlanStorage';
import { PHASE_META } from '../services/HabitPlanStorage';

const FONT = "system-ui, -apple-system, 'Helvetica Neue', sans-serif";

interface HabitGrid30Props {
  phase: PlanPhase;
  days: boolean[];
  globalDayOffset: number;
  onToggle: (phase: PlanPhase, dayIndex: number) => void;
  /** When true, only subtitle + grid (parent shows phase title and counts). */
  embed?: boolean;
}

/** 10×3 grid: days 1–30 left-to-right, top-to-bottom. */
const HabitGrid30: React.FC<HabitGrid30Props> = ({
  phase,
  days,
  globalDayOffset,
  onToggle,
  embed = false,
}) => {
  const meta = PHASE_META[phase];

  return (
    <div
      style={{
        background: '#141414',
        borderRadius: 14,
        padding: 16,
        border: '1px solid rgba(255,255,255,0.10)',
        marginBottom: 14,
      }}
    >
      {!embed && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: meta.accent,
                padding: '3px 8px', borderRadius: 6,
                background: `${meta.accent}18`,
                fontFamily: FONT,
              }}>
                {meta.title}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(102,102,100,1)', fontFamily: FONT }}>
                {meta.dayRange}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(160,160,155,1)', lineHeight: 1.5, margin: 0, fontFamily: FONT }}>
              {meta.subtitle}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#EDEDED', fontFamily: FONT }}>
              {days.filter(Boolean).length}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(102,102,100,1)' }}>/30</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(102,102,100,1)', fontFamily: FONT }}>days done</div>
          </div>
        </div>
      )}

      {embed && (
        <p style={{ fontSize: 12, color: 'rgba(160,160,155,1)', lineHeight: 1.5, margin: '0 0 12px', fontFamily: FONT }}>
          {meta.subtitle}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: 5,
        }}
      >
        {days.map((done, i) => {
          const globalDay = globalDayOffset + i + 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(phase, i)}
              aria-label={`Day ${globalDay}, ${done ? 'completed' : 'not completed'}`}
              title={`Day ${globalDay}`}
              style={{
                aspectRatio: '1',
                minWidth: 0,
                borderRadius: 6,
                border: done ? 'none' : '1px solid rgba(255,255,255,0.12)',
                background: done ? meta.accent : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 600,
                color: done ? 'rgba(10,10,10,0.92)' : 'rgba(102,102,100,1)',
                fontFamily: FONT,
                transition: 'transform 0.12s ease, background 0.15s ease',
              }}
            >
              {globalDay}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HabitGrid30;
