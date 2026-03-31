import React, { useState } from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
  disabled = false,
  style: customStyle,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      ...customStyle,
    }}>
      {icon && (
        <div style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: focused ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
          transition: 'color 0.2s ease',
          pointerEvents: 'none',
        }}>
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: icon ? '13px 14px 13px 42px' : '13px 14px',
          borderRadius: 14,
          border: `1px solid ${focused ? 'var(--color-primary-200)' : 'var(--color-border)'}`,
          background: disabled ? 'var(--color-surface-raised)' : 'var(--color-surface)',
          fontSize: 15,
          color: 'var(--color-text)',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          fontFamily: 'var(--font-body)',
          boxShadow: focused ? '0 0 0 3px rgba(79, 70, 229, 0.1)' : 'none',
          opacity: disabled ? 0.6 : 1,
        }}
      />
    </div>
  );
};

export default Input;
