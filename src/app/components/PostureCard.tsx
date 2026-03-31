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
        animation: `slideUp 0.4s ease ${0.14 + index * 0.05}s both`,
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-sec)', fontWeight: 500 }}>
            {problem.exercises} exercises · {problem.duration}
          </span>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `${problem.cardBorder}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={problem.cardBorder} strokeWidth={2.5} strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

export default PostureCard;
