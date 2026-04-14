import React from 'react';
import { getLevelInfo, type UserLevel } from '../services/DailyProgram';

const T = {
  border: 'rgba(255,255,255,0.05)',
  text: '#FFFFFF',
  text2: 'rgba(161,161,170,1)',
  text3: 'rgba(113,113,122,1)',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const LEVEL_CONFIG: Record<UserLevel, { label: string; icon: string; color: string; glow: string }> = {
  beginner: { label: 'Beginner', icon: '??', color: '#22C55E', glow: 'rgba(34,197,94,0.18)' },
  intermediate: { label: 'Intermediate', icon: '?', color: '#F59E0B', glow: 'rgba(245,158,11,0.18)' },
  advanced: { label: 'Advanced', icon: '??', color: '#EF4444', glow: 'rgba(239,68,68,0.18)' },
};

const LEVEL_ORDER: UserLevel[] = ['beginner', 'intermediate', 'advanced'];

/** Program level card - levels only (no calendar/date UI). */
const DailyProgramLevelCard: React.FC = () => {
  const info = getLevelInfo();
  const state = info.state;
  const isMaxLevel = info.isMaxLevel;
  const current = state ? LEVEL_CONFIG[state.currentLevel] : LEVEL_CONFIG.beginner;
  const allCompleted = Boolean(isMaxLevel);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)',
        borderRadius: 24,
        padding: 20,
        border: `1px solid ${T.border}`,
        marginBottom: 0,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '10%',
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: current.glow,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 22 }}>{current.icon}</span>
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: T.text3,
              fontWeight: 700,
              fontFamily: T.font,
            }}
          >
            {state ? 'Current Level' : 'Your program'}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: current.color,
              fontFamily: T.font,
              letterSpacing: '-0.02em',
            }}
          >
            {state ? current.label : 'Beginner'}
          </div>
        </div>
      </div>

      {state && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            padding: '12px 0 0',
            borderTop: `1px solid ${T.border}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {LEVEL_ORDER.map((level, i) => {
            const cfg = LEVEL_CONFIG[level];
            const isCompleted = state.completedLevels.includes(level);
            const isCurrent = state.currentLevel === level && !allCompleted;

            return (
              <React.Fragment key={level}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isCompleted ? cfg.color : isCurrent ? `${cfg.color}22` : 'rgba(255,255,255,0.04)',
                      border: isCurrent ? `2px solid ${cfg.color}` : isCompleted ? 'none' : `1px solid rgba(255,255,255,0.10)`,
                      fontSize: 14,
                    }}
                  >
                    {isCompleted ? '?' : cfg.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCompleted ? cfg.color : isCurrent ? T.text : T.text2,
                      marginTop: 5,
                      fontFamily: T.font,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
                {i < LEVEL_ORDER.length - 1 && (
                  <div
                    style={{
                      flex: 0.6,
                      height: 2,
                      marginTop: -16,
                      background: isCompleted ? cfg.color : 'linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))',
                      borderRadius: 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyProgramLevelCard;
