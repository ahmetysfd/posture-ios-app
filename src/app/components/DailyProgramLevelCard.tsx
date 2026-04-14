import React from 'react';
import { getLevelInfo, type UserLevel } from '../services/DailyProgram';

const LEVELS: Array<{ id: UserLevel; label: string; icon: string }> = [
  { id: 'beginner', label: 'Beginner', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', icon: '🔥' },
  { id: 'advanced', label: 'Advanced', icon: '👑' },
];

const ORANGE = '#ff6b35';

const DailyProgramLevelCard: React.FC = () => {
  const info = getLevelInfo();
  const state = info.state;

  const currentLevel: UserLevel = state?.currentLevel ?? 'beginner';
  const completedDays = Math.max(0, Math.min(21, state?.daysCompletedInLevel ?? 0));
  const currentIdx = LEVELS.findIndex((l) => l.id === currentLevel);
  const safeCurrentIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        background: '#111114',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 14,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '20%',
          width: 128,
          height: 128,
          borderRadius: '50%',
          background: 'rgba(255,107,53,0.04)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 14 }}>
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#52525b',
            fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          }}
        >
          Current level
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            lineHeight: 1.2,
            fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          }}
        >
          {LEVELS[safeCurrentIdx].label}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 24,
            right: 24,
            height: 1.5,
            background: 'rgba(255,255,255,0.04)',
            transform: 'translateY(-50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 24,
            height: 1.5,
            width: `${safeCurrentIdx * 50}%`,
            background: `linear-gradient(to right, ${ORANGE}, #ff8f5e)`,
            borderRadius: 999,
            transform: 'translateY(-50%)',
            transition: 'width 0.4s ease',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {LEVELS.map((level, idx) => {
            const isDone = idx < safeCurrentIdx;
            const isCurrent = idx === safeCurrentIdx;
            const icon = isDone ? '✓' : level.icon;
            return (
              <div key={level.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    background: isDone ? ORANGE : isCurrent ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.03)',
                    border: isDone ? '1px solid rgba(255,107,53,0.3)' : isCurrent ? '1.5px solid rgba(255,107,53,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isDone ? '0 0 12px rgba(255,107,53,0.2)' : 'none',
                    color: isDone ? '#fff' : isCurrent ? ORANGE : '#52525b',
                  }}
                >
                  {icon}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    color: isDone ? 'rgba(255,107,53,0.7)' : isCurrent ? '#fff' : '#52525b',
                    fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
                  }}
                >
                  {level.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#52525b',
              fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
            }}
          >
            Day {completedDays} of 21
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(255,107,53,0.6)',
              fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
            }}
          >
            {Math.round((completedDays / 21) * 100)}%
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
          {Array.from({ length: 21 }).map((_, i) => {
            const done = i < completedDays;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done ? ORANGE : 'rgba(255,255,255,0.03)',
                  border: done ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: done ? '0 0 6px rgba(255,107,53,0.15)' : 'none',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                {done ? '✓' : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyProgramLevelCard;
