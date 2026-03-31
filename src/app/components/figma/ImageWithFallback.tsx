import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallback?: string;
  style?: React.CSSProperties;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, fallback = '🖼️', style }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-border-light)', borderRadius: 12, fontSize: 32 }}>
        {fallback}
      </div>
    );
  }

  return <img src={src} alt={alt} style={style} onError={() => setHasError(true)} />;
};

export default ImageWithFallback;
