import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          paddingTop: 52,
          marginBottom: 20,
          animation: 'fadeIn 0.5s ease',
        }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-primary)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            Good {getTimeOfDay()}
          </p>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
          }}>
            PostureFix
          </h1>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          marginBottom: 28,
          animation: 'slideUp 0.4s ease 0.06s both',
        }}>
          <div style={{
            flex: 1,
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '14px 16px',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#555555',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Streak</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>0</span>
              <span style={{ fontSize: 14, color: '#555555', fontWeight: 500 }}>days</span>
            </div>
          </div>
          <div style={{
            flex: 1,
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '14px 16px',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>⏱️</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#555555',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Total</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>0</span>
              <span style={{ fontSize: 14, color: '#555555', fontWeight: 500 }}>min</span>
            </div>
          </div>
        </div>

        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#555555',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 12,
          animation: 'slideUp 0.4s ease 0.1s both',
        }}>
          Common problems
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
        }}>
          {postureProblems.map((problem, i) => {
            const exCount = problem.exerciseList.length;
            const totalDur = Math.ceil(
              problem.exerciseList.reduce((a, e) => a + e.duration, 0) / 60
            );
            return (
              <button
                key={problem.id}
                type="button"
                onClick={() => navigate(`/problem/${problem.id}`)}
                aria-label={problem.title}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  textAlign: 'left',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 20,
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  minHeight: 0,
                  animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: problem.cardBorder,
                    opacity: 0.08,
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ position: 'relative', padding: '12px 12px 0 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 26, lineHeight: 1 }}>{problem.emoji}</span>
                  </div>
                  <div style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: `1px solid ${problem.cardBorder}55`,
                  }}>
                    <img
                      src={problem.cardImage}
                      alt=""
                      draggable={false}
                      style={{
                        width: '100%',
                        height: 108,
                        objectFit: 'cover',
                        objectPosition: problem.cardImageObjectPosition ?? 'center',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
                <div style={{ padding: '12px 14px 14px', position: 'relative', zIndex: 1 }}>
                  <p style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1.25,
                    marginBottom: 4,
                  }}>
                    {problem.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#555555' }}>
                    {exCount} exercises · {totalDur}m
                  </p>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 16,
                    right: 16,
                    height: 2,
                    borderRadius: 999,
                    background: problem.cardBorder,
                    opacity: 0.35,
                  }}
                />
              </button>
            );
          })}
        </div>

        <div style={{
          textAlign: 'center',
          padding: '8px 0 16px',
          animation: 'slideUp 0.4s ease 0.5s both',
        }}>
          <span style={{
            fontSize: 12,
            color: '#444444',
            fontWeight: 400,
          }}>
            5 minutes a day for lasting posture change
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
