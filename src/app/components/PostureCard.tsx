import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PostureProblem } from '../data/postureData';

interface PostureCardProps {
  problem: PostureProblem;
  index: number;
}

const PostureCard: React.FC<PostureCardProps> = ({ problem, index }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/problem/${problem.id}`)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'left',
        animation: `slideUp 0.5s ease ${index * 0.08}s both`,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: problem.bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        flexShrink: 0,
      }}>
        {problem.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: 2,
          fontFamily: 'var(--font-display)',
        }}>
          {problem.title}
        </div>
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          marginBottom: 6,
        }}>
          {problem.subtitle}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: problem.color,
            background: problem.bgColor,
            padding: '2px 8px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {problem.category}
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
          }}>
            {problem.exercises.length} exercises
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
};

export default PostureCard;
