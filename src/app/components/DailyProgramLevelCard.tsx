import React from 'react';
import { getLevelInfo, type UserLevel } from '../services/DailyProgram';

const T = {
  border: 'rgba(255,255,255,0.05)', border2: 'rgba(255,255,255,0.10)',
  text: '#FFFFFF', text2: 'rgba(161,161,170,1)', text3: 'rgba(113,113,122,1)',
  green: '#22C55E',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const LEVEL_CONFIG: Record<UserLevel, { label: string; icon: string; color: string; glow: string }> = {
  beginner:     { label: 'Beginner',     icon: '🌱', color: '#22C55E', glow: 'rgba(34,197,94,0.18)' },
  intermediate: { label: 'Intermediate', icon: '⚡', color: '#F59E0B', glow: 'rgba(245,158,11,0.18)' },
  advanced:     { label: 'Advanced',     icon: '🔥', color: '#EF4444', glow: 'rgba(239,68,68,0.18)' },
};

const LEVEL_ORDER: UserLevel[] = ['beginner', 'intermediate', 'advanced'];

/** 21-day program level: current level, days left, progress, roadmap (replaces scan-only level strip in analysis). */
const DailyProgramLevelCard: React.FC = () => {
  const info = getLevelInfo();
  if (!info.state) return null;

  const { state, daysRemaining, progressPercent, isMaxLevel } = info;
  const current = LEVEL_CONFIG[state.currentLevel];
  const allCompleted = isMaxLevel;

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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{current.icon}</span>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, fontFamily: T.font }}>
              Current Level
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: current.color, fontFamily: T.font, letterSpacing: '-0.02em' }}>
              {current.label}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, fontFamily: T.font }}>
            {allCompleted ? 'Completed' : 'Days left'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: allCompleted ? T.green : T.text, fontFamily: T.font }}>
            {allCompleted ? 'All done!' : daysRemaining}
          </div>
        </div>
      </div>

      {!allCompleted && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.text2, fontFamily: T.font }}>
              {state.daysCompletedInLevel} / 21 days
            </span>
            <span style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>
              {progressPercent}%
            </span>
          </div>
          <div style={{
            width: '100%', height: 8, borderRadius: 4,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(90deg, ${current.color}CC, ${current.color})`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '12px 0 0',
        borderTop: `1px solid ${T.border}`,
      }}>
        {LEVEL_ORDER.map((level, i) => {
          const cfg = LEVEL_CONFIG[level];
          const isCompleted = state.completedLevels.includes(level);
          const isCurrent = state.currentLevel === level && !allCompleted;

          return (
            <React.Fragment key={level}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCompleted
                    ? cfg.color
                    : isCurrent
                      ? `${cfg.color}22`
                      : 'rgba(255,255,255,0.04)',
                  border: isCurrent
                    ? `2px solid ${cfg.color}`
                    : isCompleted
                      ? 'none'
                      : `1px solid ${T.border2}`,
                  fontSize: 16,
                  transition: 'all 0.3s ease',
                }}>
                  {isCompleted ? '✓' : cfg.icon}
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCompleted ? cfg.color : isCurrent ? T.text : T.text3,
                  marginTop: 6,
                  fontFamily: T.font,
                }}>
                  {cfg.label}
                </span>
                {isCompleted && (
                  <span style={{ fontSize: 8, color: T.text3, fontFamily: T.font, marginTop: 2 }}>21 days</span>
                )}
                {isCurrent && !allCompleted && (
                  <span style={{ fontSize: 8, color: cfg.color, fontFamily: T.font, marginTop: 2 }}>
                    {state.daysCompletedInLevel}/21
                  </span>
                )}
              </div>
              {i < LEVEL_ORDER.length - 1 && (
                <div style={{
                  flex: 0.6,
                  height: 2,
                  marginTop: -20,
                  background: isCompleted
                    ? cfg.color
                    : `linear-gradient(90deg, ${T.border2}, ${T.border})`,
                  borderRadius: 1,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DailyProgramLevelCard;
