import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postureProblems } from '../data/postureData';
import { getDailyStats } from '../services/DailyProgram';

const Completion: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === problemId);

  if (!problem) { navigate('/'); return null; }

  const totalDur = problem.exerciseList.reduce((s, e) => s + e.duration, 0);
  const { streak } = getDailyStats();
  const colors = ['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, bottom: '-10%', width: Math.random() * 10 + 5, height: Math.random() * 10 + 5, borderRadius: Math.random() > 0.5 ? '50%' : '2px', background: colors[Math.floor(Math.random() * colors.length)], animation: `confetti ${Math.random() * 1.5 + 1.5}s ease ${Math.random() * 0.5}s forwards`, opacity: 0.8 }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', animation: 'scaleIn 0.5s ease', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 110, height: 110, borderRadius: 32, background: problem.cardBg, border: `1.5px solid ${problem.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, margin: '0 auto 28px', animation: 'breathe 2s ease infinite' }}>🏆</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Great Job!</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-sec)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto 28px' }}>
          You completed all {problem.exerciseList.length} exercises for {problem.title}!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 32, width: '100%' }}>
          {[{ v: problem.exerciseList.length, l: 'Exercises', e: '💪' }, { v: `${Math.ceil(totalDur / 60)}m`, l: 'Duration', e: '⏱️' }, { v: streak, l: 'Streak', e: '🔥' }].map((st, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 16, padding: '14px 10px', border: '1px solid var(--color-border-light)', animation: `slideUp 0.4s ease ${0.15 + i * 0.08}s both` }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{st.e}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>{st.v}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tert)', fontWeight: 500 }}>{st.l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/')} style={{ width: '100%', padding: 15, borderRadius: 18, background: 'var(--color-primary)', color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 10, boxShadow: 'var(--shadow-button)', cursor: 'pointer', border: 'none' }}>Back to Home</button>
        <button onClick={() => navigate('/progress')} style={{ width: '100%', padding: 15, borderRadius: 18, background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer' }}>View Progress</button>
      </div>
    </div>
  );
};

export default Completion;
