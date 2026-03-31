import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  color = 'var(--color-primary)',
}) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        border: checked ? 'none' : '1px solid var(--color-border)',
        background: checked
          ? `linear-gradient(135deg, ${color}, ${color}CC)`
          : 'var(--color-surface-raised)',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: 3,
        left: checked ? 25 : 3,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
};

export default Switch;
