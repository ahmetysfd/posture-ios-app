import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === id);

  if (!problem) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>❓</div>
          <p style={{ marginTop: 12, color: 'var(--color-text-secondary)' }}>Problem not found</p>
          <button onClick={() => navigate('/')} style={{
            marginTop: 16, padding: '10px 24px', borderRadius: 12,
            background: 'var(--color-primary)', color: 'white', fontWeight: 600,
          }}>Go Back</button>
        </div>
      </Layout>
    );
  }

  const severityColor = {
    mild: { color: '#10B981', bg: '#ECFDF5' },
    moderate: { color: '#F59E0B', bg: '#FFFBEB' },
    severe: { color: '#EF4444', bg: '#FEF2F2' },
  }[problem.severity];

  return (
    <Layout hideNav>
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        {/* Hero Section */}
        <div style={{
          background: `linear-gradient(135deg, ${problem.bgColor}, ${problem.bgColor}DD)`,
          padding: '48px 20px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: `${problem.color}10`,
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: -20,
            width: 100, height: 100, borderRadius: '50%',
            background: `${problem.color}08`,
          }} />

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
              fontSize: 14, fontWeight: 600, color: 'var(--color-text)',
              marginBottom: 24, position: 'relative', zIndex: 2,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div style={{ position: 'relative', zIndex: 2, animation: 'slideUp 0.5s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{problem.icon}</div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 4, letterSpacing: '-0.02em',
            }}>{problem.title}</h1>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              {problem.subtitle}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 10px',
                borderRadius: 8, background: severityColor.bg, color: severityColor.color,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{problem.severity}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '4px 10px',
                borderRadius: 8, background: 'rgba(255,255,255,0.7)', color: problem.color,
              }}>{problem.exercises.length} exercises</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          {/* Description */}
          <div style={{
            background: 'var(--color-surface)', borderRadius: 16,
            padding: 20, marginBottom: 20, border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.1s both',
          }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 8,
            }}>About This Condition</h3>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
              {problem.description}
            </p>
          </div>

          {/* Affected Areas */}
          <div style={{
            background: 'var(--color-surface)', borderRadius: 16,
            padding: 20, marginBottom: 20, border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.15s both',
          }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 12,
            }}>Affected Areas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {problem.affectedAreas.map((area, i) => (
                <span key={i} style={{
                  fontSize: 13, padding: '6px 12px', borderRadius: 10,
                  background: problem.bgColor, color: problem.color,
                  fontWeight: 600,
                }}>{area}</span>
              ))}
            </div>
          </div>

          {/* Exercises Preview */}
          <div style={{ animation: 'slideUp 0.5s ease 0.2s both' }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 14,
            }}>Exercise Routine</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.exercises.map((ex, i) => (
                <div key={ex.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--color-surface)', borderRadius: 14,
                  padding: 14, border: '1px solid var(--color-border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: problem.bgColor, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                  }}>{ex.imageEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                      {ex.duration}s · {ex.difficulty}
                    </div>
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: problem.bgColor, color: problem.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            background: 'var(--color-surface)', borderRadius: 16,
            padding: 20, marginTop: 20, border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.25s both',
          }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 12,
            }}>💡 Daily Tips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--color-accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1,
                  }}>✓</div>
                  <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => navigate(`/exercise/${problem.id}`)}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 16,
              background: `linear-gradient(135deg, ${problem.color}, ${problem.color}DD)`,
              color: 'white', fontSize: 16, fontWeight: 700,
              fontFamily: 'var(--font-display)', marginTop: 24,
              boxShadow: `0 8px 24px ${problem.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.25s ease', marginBottom: 24,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${problem.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${problem.color}30`;
            }}
          >
            Start Exercises
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProblemDetail;
