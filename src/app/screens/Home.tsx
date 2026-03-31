import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{
          paddingTop: 52,
          marginBottom: 20,
          animation: 'fadeIn 0.5s ease',
        }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
          }}>
            PostureFix
          </h1>
        </div>

        {/* Stat Pills */}
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
            border: '1px solid var(--color-border-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'var(--color-text-tert)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>STREAK</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>0</span>
              <span style={{ fontSize: 14, color: 'var(--color-text-tert)', fontWeight: 500 }}>days</span>
            </div>
          </div>
          <div style={{
            flex: 1,
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '14px 16px',
            border: '1px solid var(--color-border-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>✅</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'var(--color-text-tert)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>TOTAL</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>0</span>
              <span style={{ fontSize: 14, color: 'var(--color-text-tert)', fontWeight: 500 }}>min</span>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-text-tert)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 14,
          animation: 'slideUp 0.4s ease 0.1s both',
        }}>
          COMMON PROBLEMS
        </div>

        {/* 2-Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
        }}>
          {postureProblems.map((problem, i) => (
            <button
              key={problem.id}
              onClick={() => navigate(`/problem/${problem.id}`)}
              style={{
                background: problem.cardBg,
                border: `1.5px solid ${problem.cardBorder}`,
                borderRadius: 20,
                padding: '20px 16px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transition: 'all 0.2s ease',
                animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
              }}
            >
              <span style={{ fontSize: 36 }}>{problem.emoji}</span>
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  lineHeight: 1.3,
                  marginBottom: 6,
                  fontFamily: 'var(--font-display)',
                }}>
                  {problem.title}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--color-text-sec)',
                    fontWeight: 500,
                  }}>
                    {problem.exercises} exercises · {problem.duration}
                  </span>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `${problem.cardBorder}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={problem.cardBorder} strokeWidth={2.5} strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '8px 0 16px',
          animation: 'slideUp 0.4s ease 0.5s both',
        }}>
          <span style={{
            fontSize: 13,
            color: 'var(--color-text-tert)',
            fontStyle: 'italic',
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
