import React, { useMemo } from 'react';
import { loadProgressLog, getDailyStats } from '../services/DailyProgram';

// ── Simulation mode ───────────────────────────────────────────────────────────
// Set to true to preview the calendar as if it's April 30 with random past data.
// Remove this block (and the sim branches below) when done testing.
const SIMULATE = true;

// April 2026 — day N → completed?  (null = today, not yet marked)
const SIM_APRIL: Record<number, boolean | null> = {
   1: true,  2: true,  3: false,  4: true,  5: false,
   6: true,  7: true,  8: false,  9: true, 10: true,
  11: false, 12: false, 13: true, 14: true, 15: true,
  16: false, 17: true, 18: false, 19: false, 20: true,
  21: true, 22: false, 23: true, 24: true, 25: true,
  26: true, 27: true, 28: true, 29: true, 30: true, // streak of 6: Apr 25–30
};
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  bg: '#141416',
  border: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  text2: 'rgba(228,228,231,0.75)',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(63,63,70,1)',
  gold: '#F97316',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const StreakCalendar: React.FC = () => {
  const realStats = getDailyStats();
  const log = loadProgressLog();

  // ── Sim overrides ──────────────────────────────────────────────────────────
  const now    = SIMULATE ? new Date(2026, 3, 30) : new Date(); // April = month 3
  const year   = now.getFullYear();
  const month  = now.getMonth();
  const today  = now.getDate();
  const todayStr = toDateStr(year, month, today);

  const completedToday = SIMULATE ? SIM_APRIL[30] === true : realStats.completedToday;

  // Streak: count backwards from today through consecutive sim completions
  const streak = useMemo(() => {
    if (!SIMULATE) return realStats.streak;
    let s = 0;
    for (let d = today; d >= 1; d--) {
      if (SIM_APRIL[d] === true) s++;
      else break;
    }
    return s;
  }, []);

  const completedDates = useMemo(() => {
    if (SIMULATE) {
      const set = new Set<string>();
      Object.entries(SIM_APRIL).forEach(([d, done]) => {
        if (done === true) set.add(toDateStr(year, month, Number(d)));
      });
      return set;
    }
    const set = new Set<string>();
    log.forEach(e => { if (e.fullyCompleted) set.add(e.date); });
    return set;
  }, [log]);
  // ──────────────────────────────────────────────────────────────────────────

  // First day of month (0=Sun … 6=Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build grid cells: leading empty slots + day cells
  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push({ day: null });

  return (
    <div
      style={{
        borderRadius: 24,
        background: 'linear-gradient(135deg, #1a1a1f 0%, #111114 100%)',
        border: `1px solid ${T.border}`,
        padding: '20px 20px 18px',
        fontFamily: T.font,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow */}
      <div style={{
        position: 'absolute', top: '-30%', right: '-10%',
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(249,115,22,0.07)', filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
            {MONTH_NAMES[month]} {year}
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>
            {completedToday ? 'Completed today' : 'Not done yet today'}
          </div>
        </div>

        {/* Streak badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 12,
            background: streak > 0 ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${streak > 0 ? 'rgba(249,115,22,0.22)' : 'rgba(255,255,255,0.06)'}`,
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={streak > 0 ? '#f97316' : T.text3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 800, color: streak > 0 ? '#FFFFFF' : T.text3, letterSpacing: '-0.02em' }}>
              {streak}
            </span>
          </div>
          <span style={{ fontSize: 9, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            day streak
          </span>
        </div>
      </div>

      {/* Weekday labels */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        marginBottom: 8, position: 'relative', zIndex: 1,
      }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: 10, fontWeight: 700,
            color: 'rgba(113,113,122,0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            paddingBottom: 6,
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '5px 4px',
        position: 'relative', zIndex: 1,
      }}>
        {cells.map((cell, idx) => {
          if (cell.day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = toDateStr(year, month, cell.day);
          const isToday = dateStr === todayStr;
          const isPast = cell.day < today;
          const isFuture = cell.day > today;
          const isCompleted = completedDates.has(dateStr);
          const isMissed = isPast && !isCompleted;

          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                // Completed: bright orange fill; today + completed gets fill + ring
                background: isCompleted
                  ? 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)'
                  : isToday
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
                border: isToday && !isCompleted
                  ? '1.5px solid rgba(249,115,22,0.60)'
                  : isToday && isCompleted
                    ? '1.5px solid rgba(255,255,255,0.30)'
                    : 'none',
                boxShadow: isCompleted
                  ? '0 0 10px rgba(249,115,22,0.30)'
                  : 'none',
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: isToday || isCompleted ? 700 : 500,
                color: isCompleted
                  ? '#FFFFFF'
                  : isToday
                    ? '#fb923c'
                    : isMissed
                      ? 'rgba(82,82,91,0.7)'
                      : isFuture
                        ? 'rgba(63,63,70,0.6)'
                        : T.text2,
              }}>
                {cell.day}
              </span>

              {/* Missed day: small dot indicator */}
              {isMissed && (
                <div style={{
                  position: 'absolute',
                  bottom: 3,
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'rgba(63,63,70,0.6)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', zIndex: 1,
      }}>
        <LegendItem color="#f97316" label="Completed" />
        <LegendItem color="rgba(63,63,70,0.9)" label="Missed" dim />
        <LegendItem color="transparent" label="Today" border="rgba(249,115,22,0.50)" />
      </div>
    </div>
  );
};

function LegendItem({ color, label, dim, border }: { color: string; label: string; dim?: boolean; border?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{
        width: 10, height: 10, borderRadius: 3,
        background: color,
        border: border ? `1.5px solid ${border}` : 'none',
        opacity: dim ? 0.7 : 1,
      }} />
      <span style={{ fontSize: 10, color: 'rgba(113,113,122,1)', fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

export default StreakCalendar;
