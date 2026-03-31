import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === id);

  if (!problem) {
    return <Layout><div style={{ padding: 40, textAlign: 'center' }}>Not found</div></Layout>;
  }

  return (
    <Layout hideNav>
      <div>
        {/* Hero */}
        <div style={{
          background: problem.cardBg,
          padding: '48px 20px 28px',
          position: 'relative',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: `${problem.cardBorder}40` }} />

          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)',
            fontSize: 14, fontWeight: 600, color: 'var(--color-text)',
            marginBottom: 24, cursor: 'pointer', border: 'none', position: 'relative', zIndex: 2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>

          <div style={{ position: 'relative', zIndex: 2, animation: 'slideUp 0.4s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{problem.emoji}</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4, letterSpacing: '-0.02em' }}>{problem.title}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.7)', color: 'var(--color-text-sec)' }}>
                {problem.exercises} exercises
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.7)', color: 'var(--color-text-sec)' }}>
                {problem.duration}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          {/* About */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginBottom: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.1s both' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>About</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)' }}>{problem.description}</p>
          </div>

          {/* Affected Areas */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginBottom: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.14s both' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>Affected Areas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {problem.affectedAreas.map((a, i) => (
                <span key={i} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 10, background: problem.cardBg, color: 'var(--color-text)', fontWeight: 600, border: `1px solid ${problem.cardBorder}` }}>{a}</span>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, animation: 'slideUp 0.4s ease 0.18s both' }}>Exercises</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideUp 0.4s ease 0.2s both' }}>
            {problem.exerciseList.map((ex, i) => (
              <div key={ex.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--color-surface)', borderRadius: 16, padding: 14,
                border: '1px solid var(--color-border-light)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: problem.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `1px solid ${problem.cardBorder}` }}>{ex.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 2 }}>{ex.duration}s</div>
                </div>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: problem.cardBg, color: 'var(--color-text-sec)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, border: `1px solid ${problem.cardBorder}` }}>{i + 1}</div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginTop: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.24s both' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>💡 Tips</h3>
            {problem.tips.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < problem.tips.length - 1 ? 8 : 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</div>
                <span style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={() => navigate(`/exercise/${problem.id}`)} style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: 'var(--color-primary)', color: 'white', fontSize: 16, fontWeight: 700,
            fontFamily: 'var(--font-display)', marginTop: 24, marginBottom: 24,
            boxShadow: '0 8px 24px rgba(79,70,229,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', border: 'none',
          }}>
            Start Exercises
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProblemDetail;
