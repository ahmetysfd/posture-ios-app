import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';
import { loadActiveProgramForSession, getDailyStats, getLevelInfo, type UserLevel } from '../services/DailyProgram';
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

const LEVEL_CONFIG: Record<UserLevel, { label: string; icon: string; color: string }> = {
  beginner:     { label: 'Beginner',     icon: '🌱', color: '#22C55E' },
  intermediate: { label: 'Intermediate', icon: '⚡', color: '#F59E0B' },
  advanced:     { label: 'Advanced',     icon: '🔥', color: '#EF4444' },
};
const LEVEL_ORDER: UserLevel[] = ['beginner', 'intermediate', 'advanced'];

function getFocusTitle(labels: string[]): string {
  if (!labels.length) return 'Daily Program';
  if (labels.length === 1) return `${labels[0]} Relief`;
  const compact = `${labels[0]} & ${labels[1]}`;
  return compact.length > 26 ? `${labels[0]} Relief` : compact;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const program = loadActiveProgramForSession(profile);
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

          {/* ── Daily Program Card (Figma V7) ── */}
          <section style={{ marginBottom: 28, animation: 'slideUp 0.4s ease 0.04s both' }}>
            {(() => {
              const { streak: realStreak } = getDailyStats();
              const levelState = getLevelInfo().state;
              const LEVEL_LABELS: Record<string, { label: string }> = {
                beginner:     { label: 'Beginner' },
                intermediate: { label: 'Intermediate' },
                advanced:     { label: 'Advanced' },
              };
              const lvl = levelState ? LEVEL_LABELS[levelState.currentLevel] : null;
              const realDaysDone = levelState?.daysCompletedInLevel ?? 0;
              const totalDays = 21;

              // Dummy data for display — remove when real data flows
              const streak = realStreak || 8;
              const daysDone = realDaysDone || 8;

              return (
                <>
                  <div
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: expanded ? '24px 24px 0 0' : 24,
                      background: 'linear-gradient(135deg, #1a1a1f 0%, #111114 100%)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'border-radius 0.2s ease',
                    }}
                  >
                    {/* Orange glow */}
                    <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 176, height: 176, borderRadius: '50%', background: 'rgba(249,115,22,0.10)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, padding: 20 }}>
                      {/* Top row: Title left, Play + Streak right */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Daily Program
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: '#71717a' }}>
                            <span>{hasProgram ? `${program!.totalDurationMin} min` : '6 min'}</span>
                            <span style={{ color: '#3f3f46' }}>·</span>
                            <span>{hasProgram ? `${totalEx} exercises` : '6 exercises'}</span>
                          </div>
                        </div>

                        {/* Play button + Streak */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0, marginLeft: 12 }}>
                          <button
                            type="button"
                            onClick={() => navigate(hasProgram ? '/program' : '/scan')}
                            aria-label={ctaLabel}
                            style={{
                              width: 42, height: 42, borderRadius: '50%',
                              background: 'linear-gradient(to top right, #ea580c, #fb923c)',
                              border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                              flexShrink: 0,
                            }}
                          >
                            {allDone ? (
                              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg width={16} height={16} viewBox="0 0 24 24" fill="#FFFFFF" style={{ marginLeft: 2 }}>
                                <path d="M8 5.5v13l10-6.5-10-6.5Z" />
                              </svg>
                            )}
                          </button>

                          {/* Streak box */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                            <div style={{
                              position: 'relative',
                              width: 48, height: 48, borderRadius: 16,
                              background: 'rgba(249,115,22,0.08)',
                              border: '1px solid rgba(249,115,22,0.20)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(249,115,22,0.05)', filter: 'blur(2px)' }} />
                              {/* Flame SVG */}
                              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                              </svg>
                            </div>
                            <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, marginTop: 4 }}>{streak}</span>
                            <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Streak</span>
                          </div>
                        </div>
                      </div>

                      {/* Level pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '4px 10px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          fontSize: 11, fontWeight: 600,
                          color: '#fb923c',
                        }}>
                          {lvl?.label ?? 'Beginner'}
                        </span>
                      </div>

                      {/* 21-day progress grid */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
                          <span style={{ fontSize: 10, color: '#52525b' }}>{daysDone}/{totalDays}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: 3 }}>
                          {Array.from({ length: totalDays }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                aspectRatio: '1',
                                borderRadius: 3,
                                background: i < daysDone ? '#f97316' : 'rgba(255,255,255,0.04)',
                                boxShadow: i < daysDone ? '0 0 4px rgba(249,115,22,0.3)' : 'none',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 3-level roadmap */}
                      {levelState && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0,
                          marginBottom: 16,
                        }}>
                          {LEVEL_ORDER.map((level, i) => {
                            const cfg = LEVEL_CONFIG[level];
                            const isCompleted = levelState.completedLevels.includes(level);
                            const isCurrent = levelState.currentLevel === level;

                            return (
                              <React.Fragment key={level}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                  <div style={{
                                    width: 34, height: 34, borderRadius: '50%',
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
                                        : '1px solid rgba(255,255,255,0.10)',
                                    fontSize: 15,
                                  }}>
                                    {isCompleted ? '✓' : cfg.icon}
                                  </div>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: isCurrent ? 700 : 500,
                                    color: isCompleted ? cfg.color : isCurrent ? '#FFFFFF' : '#71717a',
                                    marginTop: 5,
                                  }}>
                                    {cfg.label}
                                  </span>
                                  {isCurrent && (
                                    <span style={{ fontSize: 8, color: cfg.color, marginTop: 2 }}>
                                      {levelState.daysCompletedInLevel}/21
                                    </span>
                                  )}
                                </div>
                                {i < LEVEL_ORDER.length - 1 && (
                                  <div style={{
                                    flex: 0.6,
                                    height: 2,
                                    marginTop: -14,
                                    background: isCompleted
                                      ? cfg.color
                                      : 'linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))',
                                    borderRadius: 1,
                                  }} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      )}

                      {(!hasProgram || allDone) && (
                        <>
                          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 16 }} />
                          <div style={{ fontSize: 13, color: '#71717a' }}>
                            {hasProgram ? 'All done for today' : 'Take a scan to begin'}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expandable exercise list (tap card title area) */}
                  {hasProgram && (
                    <button
                      type="button"
                      onClick={() => setExpanded(v => !v)}
                      style={{
                        width: '100%', padding: '10px 0 0', background: 'transparent', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: '#52525b', fontFamily: T.font }}>{expanded ? 'Hide exercises' : 'Show exercises'}</span>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}

                  {hasProgram && expanded && (
                    <div style={{
                      background: '#121215',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 20,
                      overflow: 'hidden',
                      marginTop: 8,
                    }}>
                      {[...program!.exercises]
                        .sort((a, b) => (a.targetProblemLabels[0] ?? '').localeCompare(b.targetProblemLabels[0] ?? ''))
                        .map((ex, i, arr) => (
                          <div key={ex.id} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 18px',
                            borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            opacity: ex.completed ? 0.45 : 1,
                          }}>
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
                        <button type="button" onClick={() => navigate('/program')} style={{
                          width: '100%', padding: '13px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(to top right, #ea580c, #fb923c)',
                          color: '#FFFFFF', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', fontFamily: T.font,
                        }}>
                          {ctaLabel}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </section>

          <section style={{ animation: 'slideUp 0.4s ease 0.1s both' }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 14 }}>
              Common Problems
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {postureProblems.map((problem, i) => {
                const accent = CARD_ACCENTS[problem.id] ?? CARD_ACCENTS['forward-head'];
                return (
                  <div
                    key={problem.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
                    }}
                  >
                    <button
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
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, background: accent.gradient, opacity: 0.95, pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', width: 140, height: 140, borderRadius: '50%', background: accent.glow, filter: 'blur(28px)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: '#050505', zIndex: 0 }} />
                      <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
                    </button>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#F4F4F5',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        marginTop: 10,
                        fontFamily: T.font,
                      }}
                    >
                      {problem.title}
                    </span>
                  </div>
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
