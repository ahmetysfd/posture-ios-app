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

        <button
          type="button"
          onClick={() => navigate('/scan')}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 18,
            marginBottom: 22,
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-button)',
            fontFamily: 'var(--font-display)',
            animation: 'slideUp 0.4s ease 0.08s both',
          }}
        >
          Body scan — personalized check
        </button>

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
            return (
              <div
                key={problem.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 10,
                  animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/problem/${problem.id}`)}
                  aria-label={problem.title}
                  style={{
                    position: 'relative',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 20,
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'block',
                    lineHeight: 0,
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
                  <img
                    src={problem.cardImage}
                    alt=""
                    draggable={false}
                    style={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      objectPosition: problem.cardImageObjectPosition ?? 'center',
                      display: 'block',
                    }}
                  />
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

                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1.25,
                    padding: '0 2px',
                  }}
                >
                  {problem.title}
                </div>
              </div>
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
