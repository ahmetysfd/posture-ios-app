import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import YoutubeModal from '../components/YoutubeModal';
import DifficultySelector from '../components/DifficultySelector';
import { loadUserProfile, saveUserProfile, type ExerciseDifficulty } from '../services/UserProfile';
import { postureProblems } from '../data/postureData';

/* ── Exercise icon system ─────────────────────────────────────── */
const ExerciseIcon: React.FC<{ type?: string; size?: number; color?: string }> = ({ type, size = 20, color = 'var(--color-primary)' }) => {
  const s = { width: size, height: size };
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'neck': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M9 14c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9v-2z"/>
        <path d="M10 19c0 1.1.9 2 2 2s2-.9 2-2"/>
      </svg>
    );
    case 'chest': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <path d="M12 3C8 3 5 6 5 9v3h14V9c0-3-3-6-7-6z"/><path d="M5 12v4a7 7 0 0 0 14 0v-4"/>
        <path d="M9 10v2"/><path d="M15 10v2"/>
      </svg>
    );
    case 'side': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="4" r="2"/><path d="M12 6v6l-4 4"/><path d="M12 12l4 4"/>
        <path d="M8 20h8"/><path d="M17 7l2-2"/><path d="M19 5l1-1"/>
      </svg>
    );
    case 'shoulder': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v5"/><path d="M8 10h8"/>
        <path d="M9 17.5c0-1.7 1.3-3 3-3s3 1.3 3 3V20H9v-2.5z"/>
      </svg>
    );
    case 'back': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <path d="M12 2v20"/><path d="M8 6c0 2.2 1.8 4 4 4s4-1.8 4-4"/>
        <path d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
      </svg>
    );
    case 'core': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <ellipse cx="12" cy="12" rx="7" ry="5"/><path d="M12 7V5"/><path d="M12 19v-2"/>
        <path d="M5.2 9.5L3.5 8"/><path d="M20.5 8l-1.7 1.5"/><path d="M5.2 14.5L3.5 16"/><path d="M20.5 16l-1.7-1.5"/>
      </svg>
    );
    case 'hip': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <path d="M6 3c0 5 3 7 6 7s6-2 6-7"/><path d="M8 10l-2 11"/><path d="M16 10l2 11"/>
        <path d="M8 17h8"/>
      </svg>
    );
    default: return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M8 12h8"/>
        <path d="M10 20h4"/>
      </svg>
    );
  }
};

/* ── Video Modal ──────────────────────────────────────────────── */
const VideoModal: React.FC<{ ex: Exercise; onClose: () => void }> = ({ ex, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 16px',
      backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: '100%', maxWidth: 400,
        background: 'var(--color-surface)', borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        animation: 'slideUp 0.28s ease',
      }}
    >
      {/* Video embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ex.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={ex.name}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
      {/* Info row */}
      <div style={{ padding: '16px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(229,53,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ExerciseIcon type={ex.iconType} size={18} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{ex.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 1 }}>{ex.duration}s · Watch before you start</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.6, margin: '8px 0 14px' }}>{ex.description}</p>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 14,
            background: 'var(--color-primary)', color: 'white',
            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          Got it, close
        </button>
      </div>
    </div>
  </div>
);

/* ── Tip-section cards ────────────────────────────────────────── */
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'var(--color-surface)', borderRadius: 16, overflow: 'hidden',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)',
    marginTop: 14, ...style,
  }}>
    {children}
  </div>
);

const CardHeader: React.FC<{ dot: string; label: string; bg: string }> = ({ dot, label, bg }) => (
  <div style={{ background: bg, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 9 }}>
    <div style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.01em' }}>{label}</span>
  </div>
);

const BoldRow: React.FC<{ bold: string; text: string; color: string; last?: boolean }> = ({ bold, text, color, last }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: last ? 0 : 10 }}>
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 7 }} />
    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)', margin: 0 }}>
      <strong style={{ color: 'var(--color-text)', fontWeight: 650 }}>{bold}</strong>
      <span style={{ color: 'var(--color-text-tert)', margin: '0 4px' }}>→</span>
      {text}
    </p>
  </div>
);

const IconStretch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M12 12v10"/><path d="M8 18l4 4 4-4"/>
  </svg>
);
const IconStrength = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/><circle cx="3" cy="4" r="1"/><circle cx="21" cy="4" r="1"/><circle cx="3" cy="20" r="1"/><circle cx="21" cy="20" r="1"/>
  </svg>
);
const IconHabits = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const FixGroup: React.FC<{ icon: React.ReactNode; label: string; items: string[]; last?: boolean }> = ({ icon, label, items, last }) => (
  <div style={{ marginBottom: last ? 0 : 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, color: 'var(--color-accent)' }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
    </div>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < items.length - 1 ? 8 : 0 }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'rgba(52,211,153,0.12)', border: '1.5px solid var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
        }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-sec)' }}>{item}</span>
      </div>
    ))}
  </div>
);

/* ── Main component ───────────────────────────────────────────── */
const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === id);
  const [youtube, setYoutube] = useState<{ url: string; title: string } | null>(null);
  const [exerciseDifficulty, setExerciseDifficulty] = useState<ExerciseDifficulty>('beginner');

  useEffect(() => {
    const profile = loadUserProfile();
    if (profile?.exerciseDifficulty) setExerciseDifficulty(profile.exerciseDifficulty);
  }, []);

  if (!problem) {
    return <Layout><div style={{ padding: 40, textAlign: 'center' }}>Not found</div></Layout>;
  }

  const pl = problem.premiumLayout;

  const handleDifficultyChange = (d: ExerciseDifficulty) => {
    setExerciseDifficulty(d);
    saveUserProfile({ exerciseDifficulty: d });
  };

  /** Same moves for all levels for now — swap per `exerciseDifficulty` when you add tiers. */
  const exercisesForDifficulty = problem.exerciseList;

  return (
    <Layout hideNav>
      <div>
        {/* Hero */}
        <div style={{
          background: `linear-gradient(165deg, ${problem.cardBg}33 0%, var(--color-surface) 42%, var(--color-bg) 100%)`,
          padding: '48px 20px 28px',
          position: 'relative',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: problem.cardBorder, opacity: 0.12 }} />

          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(8px)',
            fontSize: 14, fontWeight: 600, color: 'var(--color-text)',
            marginBottom: 24, cursor: 'pointer', border: '1px solid var(--color-border)',
            position: 'relative', zIndex: 2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>

          <div style={{ position: 'relative', zIndex: 2, animation: 'slideUp 0.4s ease' }}>
            <div style={{
              borderRadius: 16, overflow: 'hidden', marginBottom: 14,
              border: `1px solid ${problem.cardBorder}66`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
              height: 376,
              background: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src={problem.cardImage} alt="" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginTop: 4, marginBottom: 0, letterSpacing: '-0.02em' }}>{problem.title}</h1>
          </div>
        </div>

        <div style={{ padding: '24px 20px', background: 'var(--color-bg)', minHeight: '100%' }}>

          <div style={{ marginBottom: 20, animation: 'slideUp 0.4s ease 0.08s both' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-tert)', marginBottom: 8 }}>
              Exercise difficulty
            </div>
            <DifficultySelector selected={exerciseDifficulty} onChange={handleDifficultyChange} />
          </div>

          {/* ── Exercise cards ── */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, animation: 'slideUp 0.4s ease 0.1s both' }}>
            Exercises
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-tert)', marginLeft: 8 }}>{exercisesForDifficulty.length} movements</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideUp 0.4s ease 0.14s both' }}>
            {exercisesForDifficulty.map((ex, i) => {
              const videoUrl = ex.youtubeUrl || (ex.videoId ? `https://www.youtube.com/watch?v=${ex.videoId}` : null);
              return (
                <div
                  key={ex.id}
                  onClick={() => videoUrl ? setYoutube({ url: videoUrl, title: ex.name }) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--color-surface)', borderRadius: 16, padding: '14px 16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: videoUrl ? 'pointer' : 'default',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseDown={e => { if (videoUrl) (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.985)'; }}
                  onMouseUp={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(229,53,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ExerciseIcon type={ex.iconType} size={22} color="var(--color-primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--color-text)', marginBottom: 3, lineHeight: 1.3 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tert)', fontWeight: 500 }}>{ex.duration}s</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {videoUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(229,53,53,0.12)', padding: '4px 9px', borderRadius: 8, border: '1px solid rgba(229,53,53,0.35)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
                        Video
                      </div>
                    )}
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-surface-elevated)', color: 'var(--color-text-tert)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PREMIUM 3-CARD LAYOUT ── */}
          {pl ? (
            <div style={{ animation: 'slideUp 0.4s ease 0.18s both' }}>

              {/* Card 1 — Why it happens */}
              <Card>
                {problem.reasonImage && (
                  <div style={{ background: '#0A0A0A', borderBottom: '1px solid var(--color-border)' }}>
                    <img src={problem.reasonImage} alt="" style={{ width: '100%', maxHeight: 282, objectFit: 'contain', display: 'block' }} />
                  </div>
                )}
                <CardHeader dot="#EF4444" label="Why it happens" bg="rgba(239,68,68,0.12)" />
                <div style={{ padding: '16px 18px' }}>
                  {pl.whyItHappens.map((item, i) => (
                    <BoldRow key={i} bold={item.bold} text={item.text} color="#EF4444" last={i === pl.whyItHappens.length - 1} />
                  ))}
                </div>
              </Card>

              {/* Card 2 — What changes over time */}
              <Card>
                <CardHeader dot="#F97316" label="What changes over time" bg="rgba(249,115,22,0.12)" />
                <div style={{ padding: '16px 18px' }}>
                  {pl.whatChanges.map((item, i) => (
                    <BoldRow key={i} bold={item.bold} text={item.text} color="#F97316" last={i === pl.whatChanges.length - 1} />
                  ))}
                </div>
              </Card>

              {/* Card 3 — How to fix it */}
              <Card>
                <CardHeader dot="#34D399" label="How to fix it" bg="rgba(52,211,153,0.1)" />
                <div style={{ padding: '18px 18px 16px' }}>
                  <FixGroup icon={<IconStretch />} label="Stretch" items={pl.howToFix.stretch} />
                  <FixGroup icon={<IconStrength />} label="Strength" items={pl.howToFix.strength} />
                  <FixGroup icon={<IconHabits />} label="Habits" items={pl.howToFix.habits} last />
                </div>
              </Card>

            </div>
          ) : (
            /* ── Legacy layout for other screens ── */
            <>
              <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginTop: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.18s both' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Reason</h3>
                {problem.reasonImage && problem.reasonLead != null && problem.reasonRest != null ? (
                  <>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <p style={{ flex: '1 1 160px', minWidth: 0, margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)', whiteSpace: 'pre-line' }}>{problem.reasonLead}</p>
                      <img src={problem.reasonImage} alt="" draggable={false} style={{ width: 347, maxWidth: '100%', flexShrink: 0, borderRadius: 12, objectFit: 'contain', alignSelf: 'flex-start', background: '#0A0A0A' }} />
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)', whiteSpace: 'pre-line', margin: '14px 0 0' }}>{problem.reasonRest}</p>
                  </>
                ) : (
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)', whiteSpace: 'pre-line', margin: 0 }}>{problem.description}</p>
                )}
              </div>
              <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginTop: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.22s both' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>💡 Tips</h3>
                {problem.tips.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < problem.tips.length - 1 ? 8 : 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-accent)', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</div>
                    <span style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <button onClick={() => navigate(`/exercise/${problem.id}`)} style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: 'var(--color-primary)', color: 'white', fontSize: 16, fontWeight: 700,
            fontFamily: 'var(--font-display)', marginTop: 24, marginBottom: 24,
            boxShadow: 'var(--shadow-button)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', border: 'none',
          }}>
            Start Exercises
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
          </button>
        </div>
      </div>
      <YoutubeModal
        open={!!youtube}
        watchUrl={youtube?.url ?? ''}
        title={youtube?.title}
        onClose={() => setYoutube(null)}
      />
    </Layout>
  );
};

export default ProblemDetail;
