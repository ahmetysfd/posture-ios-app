import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YoutubeModal from '../components/YoutubeModal';
import { postureProblems } from '../data/postureData';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 14px' }}>
        <button onClick={() => navigate(`/problem/${problemId}`)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-sec)' }}>{exIdx + 1} / {total}</span>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ height: 5, borderRadius: 3, background: '#ECEEF1', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.4s' }} />
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
        {phase === 'rest' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'scaleIn 0.35s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 14, animation: 'breathe 2s ease infinite' }}>😮‍💨</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Rest</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-sec)', marginBottom: 28 }}>Next: {problem.exerciseList[exIdx + 1]?.name}</p>
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ECEEF1" strokeWidth="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'var(--color-text)' }}>{timeLeft}</div>
            </div>
          </div>
        ) : phase === 'intro' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 16, animation: 'slideUp 0.4s ease', width: '100%' }}>
            <div style={{ width: 90, height: 90, borderRadius: 26, background: problem.cardBg, border: `1.5px solid ${problem.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, marginBottom: 22 }}>{ex.emoji}</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{ex.name}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--color-text-sec)', lineHeight: 1.55, marginBottom: 20, maxWidth: 300 }}>{ex.description}</p>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 10, background: problem.cardBg, border: `1px solid ${problem.cardBorder}`, color: 'var(--color-text)', marginBottom: 24 }}>{ex.duration}s</span>
            <div style={{ width: '100%', background: 'var(--color-surface)', borderRadius: 18, padding: 18, textAlign: 'left', border: '1px solid var(--color-border-light)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Steps</h4>
              {ex.instructions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < ex.instructions.length - 1 ? 8 : 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 7, background: problem.cardBg, border: `1px solid ${problem.cardBorder}`, color: 'var(--color-text-sec)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
            {ex.youtubeUrl && (
              <button
                type="button"
                onClick={() => setYtModal({ url: ex.youtubeUrl!, title: ex.name })}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 18,
                  background: 'var(--color-surface)',
                  color: 'var(--color-primary)',
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 14,
                  border: '2px solid var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
                Watch demo
              </button>
            )}
            <button onClick={beginEx} style={{ width: '100%', padding: 15, borderRadius: 18, background: 'var(--color-primary)', color: 'white', fontSize: 15, fontWeight: 700, marginTop: 22, marginBottom: 22, boxShadow: '0 6px 20px rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', border: 'none' }}>
              Start <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'scaleIn 0.35s ease' }}>
            <div style={{ fontSize: 52, marginBottom: 18, animation: 'breathe 3s ease infinite' }}>{ex.emoji}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>{ex.name}</h2>
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
                {paused ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21" /></svg>
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
