import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDailyProgram } from '../services/DailyProgram';

const T = {
  bg: '#0A0A0A', surface: '#141414', border: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)', text: '#EDEDED',
  text2: 'rgba(160,160,155,1)', text3: 'rgba(102,102,100,1)',
  gold: '#D9B84C', font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

function phaseLabel(name: string): { label: string; color: string } {
  if (/foam roll|massage|opener|stretch|twist/i.test(name))
    return { label: 'Mobility', color: 'rgba(52,211,153,0.85)' };
  if (/raise|row|fly|pull|push|bridge|plank|squat|swimmer|rocket|banded|cuffed/i.test(name))
    return { label: 'Strength', color: 'rgba(249,115,22,0.85)' };
  return { label: 'Activation', color: 'rgba(99,179,237,0.85)' };
}

const PersonalizedProgramScreen: React.FC = () => {
  const navigate = useNavigate();
  const program = loadDailyProgram();

  if (!program || program.exercises.length === 0) {
    navigate('/');
    return null;
  }

  const total = program.exercises.length;
  const completedCount = program.exercises.filter(e => e.completed).length;
  const allDone = completedCount === total;
  const started = completedCount > 0;

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '52px 20px 20px' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            width: 38, height: 38, borderRadius: 11,
            background: T.surface, border: `1px solid ${T.border2}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2.5} strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.1 }}>
            Today's Session
          </h1>
          <p style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>
            {program.totalDurationMin} min · {total} exercises
          </p>
        </div>
      </div>

      {/* ── Focus areas ─────────────────────────────────────────── */}
      {program.focusAreas.length > 0 && (
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {program.focusAreas.map((area, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
              background: 'rgba(217,184,76,0.1)', color: T.gold,
              border: '1px solid rgba(217,184,76,0.2)', letterSpacing: '0.01em',
            }}>
              {area}
            </span>
          ))}
        </div>
      )}

      {/* ── Progress bar ────────────────────────────────────────── */}
      {started && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.text3 }}>Progress</span>
            <span style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>
              {completedCount}/{total}
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, background: T.gold,
              width: `${(completedCount / total) * 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── Exercise list ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 120 }}>
        <div style={{
          background: T.surface,
          borderRadius: 16,
          border: `1px solid ${T.border2}`,
          overflow: 'hidden',
        }}>
          {program.exercises.map((ex, i) => {
            const phase = phaseLabel(ex.name);
            return (
              <div
                key={ex.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 13,
                  padding: '12px 16px',
                  borderBottom: i < total - 1 ? `1px solid ${T.border}` : 'none',
                  opacity: ex.completed ? 0.38 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Index or checkmark */}
                <div style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                  background: ex.completed ? T.gold : 'rgba(255,255,255,0.05)',
                  border: ex.completed ? 'none' : `1px solid ${T.border2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ex.completed
                    ? <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    : <span style={{ fontSize: 10, fontWeight: 700, color: T.text3 }}>{i + 1}</span>
                  }
                </div>

                {/* Emoji */}
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{ex.emoji}</span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: T.text,
                    textDecoration: ex.completed ? 'line-through' : 'none',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {ex.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: T.text3 }}>{ex.displayReps}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: phase.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {phase.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sticky CTA ──────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        padding: '16px 20px 32px',
        background: `linear-gradient(to top, ${T.bg} 70%, transparent)`,
      }}>
        {allDone ? (
          <div style={{
            background: T.surface, borderRadius: 14, padding: '16px 20px',
            border: `1px solid ${T.border2}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>All done for today</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/daily-exercise')}
            style={{
              width: '100%', padding: '15px 0',
              background: T.gold, color: '#0A0A0A',
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
              borderRadius: 14, border: 'none',
              cursor: 'pointer', fontFamily: T.font,
              boxShadow: '0 8px 24px rgba(217,184,76,0.25)',
            }}
          >
            {started ? `Continue session · ${completedCount}/${total} done` : 'Start session'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PersonalizedProgramScreen;
