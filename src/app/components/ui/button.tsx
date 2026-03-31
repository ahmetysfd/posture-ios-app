import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  color?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  color,
  icon,
  style: customStyle,
}) => {
  const baseColor = color || 'var(--color-primary)';

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${baseColor}, ${baseColor}DD)`,
      color: 'white',
      border: 'none',
      boxShadow: `0 8px 24px ${baseColor}30`,
    },
    secondary: {
      background: 'var(--color-surface)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    },
    ghost: {
      background: 'transparent',
      color: baseColor,
      border: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, var(--color-danger), #DC2626)',
      color: 'white',
      border: 'none',
      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: 13, borderRadius: 10 },
    md: { padding: '12px 20px', fontSize: 15, borderRadius: 14 },
    lg: { padding: '16px 24px', fontSize: 16, borderRadius: 16 },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : 'auto',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        ...customStyle,
      }}
    >
      {children}
      {icon}
    </button>
  );
};

export default Button;
