import React, { useState } from 'react';
import Layout from '../components/Layout';
import PostureCard from '../components/PostureCard';
import { postureProblems, sampleProgress } from '../data/postureData';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const todayProgress = sampleProgress[sampleProgress.length - 1];
  const streak = todayProgress?.streak || 0;

  const filteredProblems = postureProblems.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', 'neck', 'shoulder', 'back', 'hip', 'wrist'];
  const [activeCategory, setActiveCategory] = useState('all');

  const displayProblems = activeCategory === 'all'
    ? filteredProblems
    : filteredProblems.filter(p => p.category === activeCategory);

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{
          paddingTop: 56,
          paddingBottom: 8,
          animation: 'fadeIn 0.6s ease',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}>
            <div>
              <div style={{
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                marginBottom: 4,
              }}>
                Good morning ☀️
              </div>
              <h1 style={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}>
                PostureFix
              </h1>
            </div>
            {/* Streak Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              padding: '8px 14px',
              borderRadius: 20,
              boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)',
            }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#92400E',
                fontFamily: 'var(--font-display)',
              }}>
                {streak}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10,
          marginBottom: 24,
          animation: 'slideUp 0.5s ease 0.1s both',
        }}>
          {[
            { label: 'Today', value: `${todayProgress?.exercisesCompleted || 0}`, sub: 'exercises', color: 'var(--color-primary)' },
            { label: 'Duration', value: `${todayProgress?.totalDuration || 0}`, sub: 'minutes', color: 'var(--color-accent)' },
            { label: 'Streak', value: `${streak}`, sub: 'days', color: '#F59E0B' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)',
              borderRadius: 14,
              padding: '14px 12px',
              textAlign: 'center',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500, marginTop: 2 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: 16,
          animation: 'slideUp 0.5s ease 0.2s both',
        }}>
          <div style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-tertiary)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search posture problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 14px 13px 42px',
              borderRadius: 14,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 15,
              color: 'var(--color-text)',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              fontFamily: 'var(--font-body)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary-200)';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: 20,
          animation: 'slideUp 0.5s ease 0.25s both',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
                border: activeCategory === cat ? 'none' : '1px solid var(--color-border)',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          animation: 'slideUp 0.5s ease 0.3s both',
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text)',
          }}>
            Common Problems
          </h2>
          <span style={{
            fontSize: 13,
            color: 'var(--color-text-tertiary)',
            fontWeight: 500,
          }}>
            {displayProblems.length} found
          </span>
        </div>

        {/* Problem Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          paddingBottom: 20,
        }}>
          {displayProblems.map((problem, index) => (
            <PostureCard key={problem.id} problem={problem} index={index} />
          ))}
          {displayProblems.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--color-text-tertiary)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No problems found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
