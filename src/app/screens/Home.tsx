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

        {/* Stat cards: streak + total minutes */}
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
          gap: 14,
          marginBottom: 24,
        }}>
          {postureProblems.map((problem, i) => (
            <div
              key={problem.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 8,
                animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both`,
              }}
            >
              <button
                type="button"
                onClick={() => navigate(`/problem/${problem.id}`)}
                aria-label={problem.title}
                style={{
                  background: problem.cardBg,
                  border: `1.5px solid ${problem.cardBorder}`,
                  borderRadius: 20,
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'block',
                  lineHeight: 0,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <img
                  src={problem.cardImage}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: 132,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </button>
              <div style={{
                textAlign: 'center',
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.25,
                padding: '0 2px',
              }}>
                {problem.title}
              </div>
            </div>
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
