import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postureProblems } from '../data/postureData';

const Completion: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === problemId);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!problem) {
    navigate('/');
    return null;
  }

  const totalDuration = problem.exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalMinutes = Math.ceil(totalDuration / 60);

  const confettiColors = ['#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: 'var(--color-bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 0 60px rgba(0,0,0,0.08)',
    }}>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              bottom: '-10%',
              width: Math.random() * 10 + 6,
              height: Math.random() * 10 + 6,
              borderRadius: Math.random() > 0.5 ? '50%' : 2,
              background: confettiColors[Math.floor(Math.random() * confettiColors.length)],
              animation: `confetti ${Math.random() * 1.5 + 1.5}s ease ${Math.random() * 0.5}s forwards`,
              opacity: 0.8,
            }} />
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ textAlign: 'center', animation: 'scaleIn 0.6s ease', position: 'relative', zIndex: 2 }}>
        {/* Trophy */}
        <div style={{
          width: 120, height: 120, borderRadius: 36,
          background: `linear-gradient(135deg, ${problem.bgColor}, ${problem.bgColor}AA)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 60, margin: '0 auto 28px',
          boxShadow: `0 12px 40px ${problem.color}15`,
          animation: 'breathe 2s ease infinite',
        }}>
          🏆
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
          color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em',
        }}>Great Job!</h1>
        <p style={{
          fontSize: 15, color: 'var(--color-text-secondary)',
          lineHeight: 1.6, marginBottom: 32, maxWidth: 280, margin: '0 auto 32px',
        }}>
          You completed all {problem.exercises.length} exercises for {problem.title}!
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12, marginBottom: 36, width: '100%',
        }}>
          {[
            { value: problem.exercises.length, label: 'Exercises', emoji: '💪' },
            { value: `${totalMinutes}m`, label: 'Duration', emoji: '⏱️' },
            { value: '7', label: 'Day Streak', emoji: '🔥' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)', borderRadius: 16,
              padding: '16px 12px', border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
              animation: `slideUp 0.5s ease ${0.2 + i * 0.1}s both`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.emoji}</div>
              <div style={{
                fontSize: 22, fontWeight: 800, color: problem.color,
                fontFamily: 'var(--font-display)',
              }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: `linear-gradient(135deg, ${problem.color}, ${problem.color}DD)`,
            color: 'white', fontSize: 16, fontWeight: 700,
            fontFamily: 'var(--font-display)', marginBottom: 12,
            boxShadow: `0 8px 24px ${problem.color}30`,
          }}
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/progress')}
          style={{
            width: '100%', padding: '16px', borderRadius: 16,
            background: 'var(--color-surface)', color: 'var(--color-text)',
            fontSize: 15, fontWeight: 600, border: '1px solid var(--color-border)',
          }}
        >
          View Progress
        </button>
      </div>
    </div>
  );
};

export default Completion;
