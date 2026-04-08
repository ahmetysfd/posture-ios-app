import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getExerciseDaysCompleted, getOrRefreshDailyProgram, loadDailyProgram } from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

const T = {
  bg: '#09090B', surface: '#141418', border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.10)', text: '#FFFFFF',
  text2: 'rgba(161,161,170,1)', text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
  gold: '#F97316', gold2: '#FB923C',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const tagColors: Record<string, React.CSSProperties> = {
  'Forward Head': { color: '#FB923C', borderColor: 'rgba(249,115,22,0.25)', background: 'rgba(249,115,22,0.08)' },
  Kyphosis: { color: '#C084FC', borderColor: 'rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.08)' },
  'Rounded Shoulders': { color: '#2DD4BF', borderColor: 'rgba(45,212,191,0.25)', background: 'rgba(45,212,191,0.08)' },
  'Uneven Shoulders': { color: '#FBBF24', borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.08)' },
  'Winging Scapula': { color: '#FB7185', borderColor: 'rgba(244,63,94,0.25)', background: 'rgba(244,63,94,0.08)' },
  'Anterior Pelvic Tilt': { color: '#60A5FA', borderColor: 'rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)' },
  'Lower Back': { color: '#60A5FA', borderColor: 'rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.08)' },
};

const PersonalizedProgramScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const program = profile?.scanTimestamp ? getOrRefreshDailyProgram(profile) : loadDailyProgram();
  const [expanded, setExpanded] = useState(true);

  if (!program || program.exercises.length === 0) {
    navigate('/');
    return null;
  }

  const total = program.exercises.length;
  const completedCount = program.exercises.filter(e => e.completed).length;
  const allDone = completedCount === total;
  const started = completedCount > 0;
  const focusTitle = program.focusAreas.length > 0 ? program.focusAreas.slice(0, 2).join(' & ') : 'Daily Program';

  return (
    <Layout>
      <div style={{ minHeight: '100%', background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 112px' }}>
        <div style={{ marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 4 }}>
            Your routine
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: T.text, lineHeight: 1 }}>
            Daily Program
          </h1>
        </div>

        <div style={{ position: 'relative', marginTop: 20, borderRadius: 22, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)', border: `1px solid ${T.border}`, borderRadius: 22 }} />
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, background: 'rgba(249,115,22,0.10)', color: T.gold2, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid rgba(249,115,22,0.20)' }}>
                    Today
                  </span>
                  <span style={{ fontSize: 10, color: T.text3, fontWeight: 600 }}>
                    {completedCount}/{total} done
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                  {focusTitle}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.text2 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {program.totalDurationMin} min
                  </span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(63,63,70,1)' }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.text2 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    {total} exercises
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/daily-exercise')}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                  flexShrink: 0,
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="#FFFFFF" />
                </svg>
              </button>
            </div>

            <div style={{ marginTop: 16, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #F97316 0%, #FB923C 100%)',
                  width: `${(completedCount / total) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', fontFamily: T.font }}>
              Exercises
            </span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              {expanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
          </button>

          <button
            type="button"
            onClick={() => navigate('/program/edit')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: T.text3, fontFamily: T.font }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
        </div>

        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {program.exercises.map((ex) => {
              const days = Math.min(getExerciseDaysCompleted(ex.name), 21);
              const pct = (days / 21) * 100;
              return (
                <div key={ex.id} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', opacity: ex.completed ? 0.62 : 1 }}>
                  <div style={{ position: 'absolute', inset: 0, background: T.surface, border: `1px solid rgba(255,255,255,0.04)`, borderRadius: 18 }} />
                  <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.2, margin: 0 }}>
                          {ex.name}
                        </h3>
                        <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                          {ex.displayReps} · {ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard'}
                        </p>
                      </div>
                      <span style={{ fontSize: 10, color: T.text4, fontWeight: 600, whiteSpace: 'nowrap', marginTop: 2 }}>
                        {days}/21 days
                      </span>
                    </div>

                    <div style={{ marginTop: 10, height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: 'rgba(249,115,22,0.7)', transition: 'width 0.3s ease' }} />
                    </div>

                    {ex.targetProblemLabels.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {ex.targetProblemLabels.map((target) => {
                          const tokenStyle = tagColors[target] ?? { color: T.text2, borderColor: 'rgba(63,63,70,1)', background: 'rgba(39,39,42,0.7)' };
                          return (
                            <span
                              key={target}
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: `1px solid ${tokenStyle.borderColor}`,
                                background: tokenStyle.background,
                                color: tokenStyle.color,
                              }}
                            >
                              {target}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, padding: '16px 20px 92px',
        background: `linear-gradient(to top, ${T.bg} 72%, transparent)`,
      }}>
        {allDone ? (
          <div style={{
            background: T.surface, borderRadius: 18, padding: '16px 20px',
            border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.gold2} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold2 }}>All done for today</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/daily-exercise')}
            style={{
              width: '100%', padding: '16px 0',
              background: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)', color: '#FFFFFF',
              fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
              borderRadius: 18, border: 'none',
              cursor: 'pointer', fontFamily: T.font,
              boxShadow: '0 0 24px rgba(249,115,22,0.22)',
            }}
          >
            {started ? `Continue session · ${completedCount}/${total} done` : 'Start session'}
          </button>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default PersonalizedProgramScreen;
