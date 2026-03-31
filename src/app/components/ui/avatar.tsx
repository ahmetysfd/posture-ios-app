import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  fallback: string;
  size?: number;
  borderRadius?: number;
  gradient?: string;
  style?: React.CSSProperties;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  fallback,
  size = 48,
  borderRadius = 16,
  gradient = 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
  style: customStyle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={fallback}
        onError={() => setHasError(true)}
        style={{
          width: size,
          height: size,
          borderRadius,
          objectFit: 'cover',
          ...customStyle,
        }}
      />
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius,
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.38,
      color: 'white',
      fontWeight: 800,
      fontFamily: 'var(--font-display)',
      flexShrink: 0,
      ...customStyle,
    }}>
      {fallback}
    </div>
  );
};

export default Avatar;
