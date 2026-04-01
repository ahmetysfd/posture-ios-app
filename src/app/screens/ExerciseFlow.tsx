import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YoutubeModal from '../components/YoutubeModal';
import { postureProblems } from '../data/postureData';

/* ── Outline icon matching iconType ──────────────────────────── */
const ExerciseIcon: React.FC<{ type?: string; size?: number; color?: string }> = ({ type, size = 28, color = '#4F46E5' }) => {
  const s = { width: size, height: size };
  const p = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
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

const ExerciseFlow: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === problemId);
  const [exIdx, setExIdx] = useState(0);
  const [ytModal, setYtModal] = useState<{ url: string; title: string } | null>(null);
  const [phase, setPhase] = useState<'intro' | 'active' | 'rest'>('intro');
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);

  const ex = problem?.exerciseList[exIdx];
  const total = problem?.exerciseList.length || 0;
  const progress = total > 0 ? (exIdx / total) * 100 : 0;
  const circ = 2 * Math.PI * 45;


  const beginEx = useCallback(() => {
    if (ex) { setPhase('active'); setTimeLeft(ex.duration); setPaused(false); }
  }, [ex]);

  useEffect(() => {
    if (phase !== 'active' || paused || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          if (exIdx < total - 1) { setPhase('rest'); return 10; }
          else { navigate(`/completion/${problemId}`); return 0; }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, paused, timeLeft, exIdx, total, navigate, problemId]);

  useEffect(() => {
    if (phase !== 'rest' || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setExIdx(i => i + 1); setPhase('intro'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  useEffect(() => {
    setYtModal(null);
  }, [exIdx]);

  if (!problem || !ex) return <div style={{ padding: 40, textAlign: 'center' }}>Not found</div>;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const totalDur = phase === 'active' ? ex.duration : 10;
  const offset = circ - (timeLeft / totalDur) * circ;

  return (
    <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 14px' }}>
        <button onClick={() => navigate(`/problem/${problemId}`)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-sec)' }}>{exIdx + 1} / {total}</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ height: 5, borderRadius: 3, background: '#ECEEF1', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.4s' }} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>

        {/* ── REST phase ── */}
        {phase === 'rest' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'scaleIn 0.35s ease' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: '#F0FDF4', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M8 12s1 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Rest</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-sec)', marginBottom: 28 }}>Next: <strong>{problem.exerciseList[exIdx + 1]?.name}</strong></p>
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ECEEF1" strokeWidth="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'var(--color-text)' }}>{timeLeft}</div>
            </div>
          </div>

        ) : phase === 'intro' ? (
          /* ── INTRO phase ── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 8, animation: 'slideUp 0.4s ease', width: '100%' }}>


            {/* Exercise header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: '#EEF2FF', border: '1.5px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ExerciseIcon type={ex.iconType} size={26} color="#4F46E5" />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.25 }}>{ex.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4F46E5', marginTop: 4, display: 'inline-block' }}>{ex.duration}s</span>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--color-text-sec)', lineHeight: 1.6, marginBottom: 18, textAlign: 'left', alignSelf: 'flex-start' }}>{ex.description}</p>

            {/* Steps */}
            <div style={{ width: '100%', background: 'var(--color-surface)', borderRadius: 18, padding: 18, textAlign: 'left', border: '1px solid var(--color-border-light)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Steps</h4>
              {ex.instructions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < ex.instructions.length - 1 ? 10 : 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.55 }}>{s}</span>
                </div>
              ))}
            </div>
            {(ex.youtubeUrl || ex.videoId) && (
              <button
                type="button"
                onClick={() => setYtModal({ url: ex.youtubeUrl || `https://www.youtube.com/watch?v=${ex.videoId}`, title: ex.name })}
                style={{ width: '100%', padding: 14, borderRadius: 18, background: 'var(--color-surface)', color: 'var(--color-primary)', fontSize: 15, fontWeight: 700, marginTop: 14, border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
                Watch demo
              </button>
            )}
            <button onClick={beginEx} style={{ width: '100%', padding: 15, borderRadius: 18, background: 'var(--color-primary)', color: 'white', fontSize: 15, fontWeight: 700, marginTop: 14, marginBottom: 22, boxShadow: '0 6px 20px rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', border: 'none' }}>
              Start Exercise
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
            </button>
          </div>

        ) : (
          /* ── ACTIVE phase ── */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'scaleIn 0.35s ease' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: '#EEF2FF', border: '1.5px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, animation: 'breathe 3s ease infinite' }}>
              <ExerciseIcon type={ex.iconType} size={32} color="#4F46E5" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>{ex.name}</h2>

            <div style={{ position: 'relative', width: 170, height: 170, marginBottom: 28 }}>
              <svg width="170" height="170" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ECEEF1" strokeWidth="4.5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-primary)" strokeWidth="4.5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)' }}>{fmt(timeLeft)}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tert)', fontWeight: 500 }}>remaining</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => setPaused(!paused)} style={{ width: 60, height: 60, borderRadius: '50%', cursor: 'pointer', border: paused ? 'none' : '2px solid var(--color-primary)', background: paused ? 'var(--color-primary)' : 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                {paused
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21" /></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-primary)"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>}
              </button>
              <button onClick={() => { if (exIdx < total - 1) { setExIdx(i => i + 1); setPhase('intro'); } else navigate(`/completion/${problemId}`); }} style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-surface)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-text-sec)"><polygon points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" stroke="var(--color-text-sec)" strokeWidth="2" /></svg>
              </button>
            </div>
            {paused && <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', animation: 'pulse 1.5s ease infinite' }}>Paused</div>}
          </div>
        )}
      </div>
      <YoutubeModal open={!!ytModal} watchUrl={ytModal?.url ?? ''} title={ytModal?.title} onClose={() => setYtModal(null)} />
    </div>
  );
};

export default ExerciseFlow;
