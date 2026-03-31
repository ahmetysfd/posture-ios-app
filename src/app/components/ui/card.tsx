import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 20,
  radius = 16,
  hoverable = false,
  onClick,
  style: customStyle,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'var(--color-surface)',
        borderRadius: radius,
        padding,
        border: '1px solid var(--color-border-light)',
        boxShadow: isHovered && hoverable
          ? 'var(--shadow-card-hover)'
          : 'var(--shadow-card)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && hoverable ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
