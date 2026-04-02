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
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 20,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'block',
        transition: 'all 0.2s ease',
        animation: `slideUp 0.4s ease ${0.14 + index * 0.05}s both`,
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
          objectPosition: problem.cardImageObjectPosition ?? 'center',
          display: 'block',
        }}
      />
    </button>
  );
};

export default PostureCard;
