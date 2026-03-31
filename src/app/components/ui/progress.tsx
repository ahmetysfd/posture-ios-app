import React from 'react';

interface ProgressProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
  style?: React.CSSProperties;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  color = 'var(--color-primary)',
  height = 6,
  animated = true,
  showLabel = false,
  style: customStyle,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div style={{ width: '100%', ...customStyle }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}>
            Progress
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color,
          }}>
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div style={{
        height,
        borderRadius: height / 2,
        background: 'var(--color-surface-raised)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          borderRadius: height / 2,
          background: `linear-gradient(90deg, ${color}, ${color}BB)`,
          width: `${clampedValue}%`,
          transition: animated ? 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }} />
      </div>
    </div>
  );
};

export default Progress;
