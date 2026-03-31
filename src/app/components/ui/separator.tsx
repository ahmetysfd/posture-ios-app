import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  style: customStyle,
}) => {
  return (
    <div style={{
      background: 'var(--color-border-light)',
      ...(orientation === 'horizontal'
        ? { width: '100%', height: 1 }
        : { width: 1, height: '100%' }),
      ...customStyle,
    }} />
  );
};

export default Separator;
