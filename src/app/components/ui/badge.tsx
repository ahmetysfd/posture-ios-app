import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'var(--color-primary)',
  bgColor,
  size = 'sm',
  style: customStyle,
}) => {
  const bg = bgColor || `${color}15`;
  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px', borderRadius: 6 },
    md: { fontSize: 12, padding: '4px 10px', borderRadius: 8 },
  };

  return (
    <span style={{
      ...sizes[size],
      fontWeight: 600,
      color,
      background: bg,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap' as const,
      ...customStyle,
    }}>
      {children}
    </span>
  );
};

export default Badge;
