import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';
import { getOrRefreshDailyProgram, loadDailyProgram } from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const T = {
  bg: '#09090B',
  surface: '#141416',
  surface2: '#101012',
  border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  text2: 'rgba(228,228,231,0.75)',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
  gold: '#F97316',
  emerald: '#22C55E',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const CARD_ACCENTS: Record<string, { glow: string; border: string; gradient: string }> = {
  'forward-head': { glow: 'rgba(249,115,22,0.16)', border: 'rgba(249,115,22,0.22)', gradient: 'linear-gradient(180deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0) 100%)' },
  'winging-scapula': { glow: 'rgba(96,165,250,0.16)', border: 'rgba(96,165,250,0.22)', gradient: 'linear-gradient(180deg, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0) 100%)' },
  'anterior-pelvic': { glow: 'rgba(251,113,133,0.16)', border: 'rgba(251,113,133,0.22)', gradient: 'linear-gradient(180deg, rgba(251,113,133,0.12) 0%, rgba(251,113,133,0) 100%)' },
  'rounded-shoulders': { glow: 'rgba(251,191,36,0.16)', border: 'rgba(251,191,36,0.22)', gradient: 'linear-gradient(180deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0) 100%)' },
  kyphosis: { glow: 'rgba(168,85,247,0.16)', border: 'rgba(168,85,247,0.22)', gradient: 'linear-gradient(180deg, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0) 100%)' },
  'uneven-shoulders': { glow: 'rgba(52,211,153,0.16)', border: 'rgba(52,211,153,0.22)', gradient: 'linear-gradient(180deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0) 100%)' },
};

function ProgressRing({ progress, done }: { progress: number; done: boolean }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, progress));
  return (
    <div style={{ width: 60, height: 60, position: 'relative', flexShrink: 0 }}>
      <svg width={60} height={60} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle
          cx={30}
          cy={30}
          r={28}
          fill="none"
          stroke="rgba(63,63,70,1)"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
          boxShadow: '0 0 20px rgba(249,115,22,0.3)',
        }}
      >
        <svg width={56} height={56} style={{ position: 'absolute', inset: -2, transform: 'rotate(-90deg)' }}>
          <circle cx={28} cy={28} r={24} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
          <circle
            cx={28}
            cy={28}
            r={24}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={(2 * Math.PI * 24) * (1 - Math.min(1, progress))}
            style={{ opacity: done ? 0 : 1, transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        {done ? (
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="#FFFFFF" />
          </svg>
        )}
      </div>
    </div>
  );
}

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(24,24,27,0.9)',
        border: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: T.text2,
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V22a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.57 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H2a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.57-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8a1.7 1.7 0 0 0 1.04-1.56V2a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.1 1.57 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V8c0 .68.4 1.3 1.04 1.56.16.07.33.1.52.1H22a2 2 0 1 1 0 4h-.09c-.68 0-1.3.4-1.57 1.04Z" />
      </svg>
    </button>
  );
}

function getFocusTitle(labels: string[]): string {
  if (!labels.length) return 'Daily Program';
  if (labels.length === 1) return `${labels[0]} Relief`;
  const compact = `${labels[0]} & ${labels[1]}`;
  return compact.length > 26 ? `${labels[0]} Relief` : compact;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const hasScan = Boolean(profile?.scanTimestamp && profile.scanTimestamp > 0);
  const program = hasScan && profile ? getOrRefreshDailyProgram(profile) : loadDailyProgram();
  const [expanded, setExpanded] = useState(false);

  const totalEx = program?.exercises.length ?? 0;
  const completedEx = program?.exercises.filter(e => e.completed).length ?? 0;
  const allDone = totalEx > 0 && completedEx === totalEx;
  const progress = totalEx > 0 ? completedEx / totalEx : 0;
  const hasProgram = Boolean(program && totalEx > 0);
  const focusTitle = useMemo(() => getFocusTitle(program?.focusAreas ?? []), [program]);
  const bottomLabel = allDone
    ? 'All done for today'
    : completedEx > 0
      ? `${completedEx}/${totalEx} exercises done`
      : 'Ready for today';
  const ctaLabel = hasProgram ? (completedEx > 0 ? 'Continue program' : 'Start program') : 'Start body scan';

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: T.bg }}>
        <div style={{ padding: '0 20px 20px', fontFamily: T.font }}>
          <div style={{ paddingTop: 52, marginBottom: 28, animation: 'fadeIn 0.45s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 4 }}>
                  Good {getTimeOfDay()}
                </p>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  <span>Posture</span>
                  <span style={{ color: T.gold }}>Fix</span>
                </h1>
              </div>
              <SettingsButton onClick={() => navigate('/settings')} />
            </div>
          </div>

          <section style={{ marginBottom: 28, animation: 'slideUp 0.4s ease 0.04s both' }}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: expanded ? '28px 28px 0 0' : 28,
                background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)',
                border: `1px solid ${T.border}`,
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5)',
                transition: 'border-radius 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-30%',
                  right: '-10%',
                  width: 192,
                  height: 192,
                  borderRadius: '50%',
                  background: 'rgba(249,115,22,0.15)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30%',
                  left: '-10%',
                  width: 128,
                  height: 128,
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.10)',
                  filter: 'blur(30px)',
                  pointerEvents: 'none',
                }}
              />

              <button
                type="button"
                onClick={() => hasProgram && setExpanded(v => !v)}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  padding: '20px 20px 18px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: hasProgram ? 'pointer' : 'default',
                  fontFamily: T.font,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: 'rgba(249,115,22,0.10)',
                          color: '#FB923C',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          border: '1px solid rgba(249,115,22,0.20)',
                        }}
                      >
                        Today's Focus
                      </span>
                    </div>

                    <div style={{ fontSize: 26, lineHeight: 1.05, fontWeight: 800, color: T.text, letterSpacing: '-0.04em' }}>
                      {hasProgram ? focusTitle : 'Start Your First Scan'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: T.text3 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        {hasProgram ? `${program!.totalDurationMin} min` : '2 min'}
                      </span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(63,63,70,1)' }} />
                      <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: T.text3 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        {hasProgram ? `${totalEx} exercises` : 'Personalized plan'}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(hasProgram ? '/daily-exercise' : '/scan');
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(hasProgram ? '/daily-exercise' : '/scan');
                      }
                    }}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    <ProgressRing progress={progress} done={allDone} />
                  </div>
                </div>

                <div style={{ height: 1, width: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)', marginBottom: 14 }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: completedEx > 0 || allDone ? '#D4D4D8' : T.text3, fontSize: 13 }}>
                      {completedEx > 0 || allDone ? (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={allDone ? T.emerald : T.gold} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(82,82,91,1)' }} />
                      )}
                      <span>{hasProgram ? bottomLabel : 'Take a body scan to unlock your program'}</span>
                    </div>
                    {hasProgram && completedEx > 0 && !allDone && (
                      <>
                        <span style={{ color: T.text4 }}>•</span>
                        <span style={{ color: T.text4, fontSize: 13 }}>Ready for main set</span>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: hasProgram ? '#A1A1AA' : '#F4F4F5', fontSize: 13, whiteSpace: 'nowrap' }}>
                    <span>{hasProgram ? (completedEx > 0 ? 'Continue' : 'Start') : 'Scan now'}</span>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {hasProgram && expanded && (
              <div
                style={{
                  background: '#121215',
                  border: `1px solid ${T.border}`,
                  borderTop: 'none',
                  borderRadius: '0 0 28px 28px',
                  overflow: 'hidden',
                }}
              >
                {[...program!.exercises]
                  .sort((a, b) => (a.targetProblemLabels[0] ?? '').localeCompare(b.targetProblemLabels[0] ?? ''))
                  .map((ex, i, arr) => (
                    <div
                      key={ex.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 18px',
                        borderTop: i === 0 ? `1px solid ${T.border}` : 'none',
                        borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                        opacity: ex.completed ? 0.45 : 1,
                      }}
                    >
                      <span style={{ width: 22, textAlign: 'center', fontSize: 17, flexShrink: 0 }}>{ex.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: ex.completed ? 'line-through' : 'none' }}>
                          {ex.name}
                        </div>
                        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>
                          {ex.sets > 1 ? `${ex.sets} sets · ` : ''}{ex.displayReps}{ex.targetProblemLabels[0] ? ` · ${ex.targetProblemLabels[0]}` : ''}
                        </div>
                      </div>
                      {ex.completed && (
                        <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.16)', border: '1px solid rgba(34,197,94,0.22)' }}>
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}

                <div style={{ padding: 16 }}>
                  <button
                    type="button"
                    onClick={() => navigate('/daily-exercise')}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      border: 'none',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      fontFamily: T.font,
                    }}
                  >
                    {ctaLabel}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section style={{ animation: 'slideUp 0.4s ease 0.1s both' }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 14 }}>
              Common Problems
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {postureProblems.map((problem, i) => {
                const accent = CARD_ACCENTS[problem.id] ?? CARD_ACCENTS['forward-head'];
                return (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => navigate(`/problem/${problem.id}`)}
                    aria-label={problem.title}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      padding: 0,
                      borderRadius: 24,
                      background: '#0D0D0F',
                      border: `1px solid ${T.border}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-end',
                      boxShadow: '0 10px 28px rgba(0,0,0,0.24)',
                      animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0, background: accent.gradient, opacity: 0.95, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', width: 140, height: 140, borderRadius: '50%', background: accent.glow, filter: 'blur(28px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.24) 62%, rgba(0,0,0,0.78) 100%)', pointerEvents: 'none', zIndex: 1 }} />

                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        background: '#050505',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={problem.cardImage}
                        alt=""
                        draggable={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: problem.cardImageObjectPosition ?? 'center',
                          transform: 'scale(1.08)',
                          filter: 'saturate(1.02) contrast(1.03)',
                        }}
                      />
                    </div>

                    <span
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#F4F4F5',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        minHeight: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 14px 14px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.55)',
                      }}
                    >
                      {problem.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: T.text4, margin: '18px 0 16px' }}>
              5 minutes a day for lasting posture change
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
