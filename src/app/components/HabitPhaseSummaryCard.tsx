import React from 'react';
import {
  loadHabit90,
  countCompleted,
  getActivePlanPhase,
  PHASE_META,
} from '../services/HabitPlanStorage';

const T = {
  surface: '#141414',
  border2: 'rgba(255,255,255,0.10)',
  text: '#EDEDED',
  text2: 'rgba(160,160,155,1)',
  text3: 'rgba(102,102,100,1)',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

/**
 * Phase badge + Phase X of 3 · Days — + X/30 bar + hint + All-time X/90.
 * Reads latest habit state from localStorage on each render.
 */
const HabitPhaseSummaryCard: React.FC = () => {
  const habits = loadHabit90();
  const done90 = countCompleted(habits);
  const activePhase = getActivePlanPhase(habits);
  const activeDays = habits[activePhase];
  const activeDone = activeDays.filter(Boolean).length;
  const meta = PHASE_META[activePhase];
  const seg = `${Math.round((activeDone / 30) * 100)}%`;
  const phaseIndex = activePhase === 'beginner' ? 1 : activePhase === 'medium' ? 2 : 3;

  let hint = '';
  if (activePhase === 'beginner' && activeDone < 30) {
    hint = 'Complete all 30 days to unlock the Medium phase.';
  } else if (activePhase === 'medium' && activeDone < 30) {
    hint = 'Complete all 30 days to unlock the Advanced phase.';
  } else if (activePhase === 'advanced' && activeDone >= 30) {
    hint = 'You finished every day of the 90-day plan. Keep the habit going by revisiting any day above.';
  }

  return (
    <div style={{
      background: T.surface,
      borderRadius: 14,
      padding: 16,
      border: `1px solid ${T.border2}`,
      fontFamily: T.font,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: meta.accent,
            padding: '4px 10px', borderRadius: 8,
            background: `${meta.accent}18`,
          }}>
            {meta.title}
          </span>
          <span style={{ fontSize: 12, color: T.text3 }}>
            Phase {phaseIndex} of 3 · {meta.dayRange}
          </span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 600, color: meta.accent }}>
          {activeDone}<span style={{ fontSize: 14, fontWeight: 500, color: T.text3 }}>/30</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginBottom: 8 }}>
        <div style={{ height: '100%', width: seg, background: meta.accent }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        {hint ? (
          <span style={{ fontSize: 11, color: T.text2, lineHeight: 1.45 }}>{hint}</span>
        ) : (
          <span style={{ fontSize: 11, color: T.text3 }}>Keep logging days in this phase.</span>
        )}
        <span style={{ fontSize: 10, color: T.text3 }}>All-time: {done90}/90</span>
      </div>
    </div>
  );
};

export default HabitPhaseSummaryCard;
