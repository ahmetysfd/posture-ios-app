/**
 * SilhouetteOverlay.tsx — v2
 * Uses the cyan wireframe body images as camera overlay.
 * Images have a black background; mix-blend-mode: screen makes the black
 * invisible and only the cyan glow shows on top of the camera feed.
 * Cropped to head-to-knee (bottom hidden).
 */

import React from 'react';
import silhouetteFront from '../../assets/silhouette-front.png';
import silhouetteSide from '../../assets/silhouette-side.webp';
import silhouetteBack from '../../assets/silhouette-back.png';

interface SilhouetteOverlayProps {
  color?: string;
  viewType?: 'front' | 'side' | 'back';
  opacity?: number;
  showGuideLines?: boolean;
}

const IMAGE_MAP: Record<'front' | 'side' | 'back', string> = {
  front: silhouetteFront,
  side: silhouetteSide,
  back: silhouetteBack,
};

const SilhouetteOverlay: React.FC<SilhouetteOverlayProps> = ({
  color = '#7DD3FC',
  viewType = 'front',
  opacity = 0.55,
  showGuideLines = true,
}) => {
  const src = IMAGE_MAP[viewType];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {showGuideLines && (
        <svg
          viewBox="0 0 200 420"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin meet"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <line x1="100" y1="10" x2="100" y2="410" stroke={color} strokeWidth="0.6" strokeDasharray="8 8" opacity={opacity * 0.35} />
          <line x1="40" y1="120" x2="160" y2="120" stroke={color} strokeWidth="0.5" strokeDasharray="5 5" opacity={opacity * 0.3} />
          <line x1="55" y1="230" x2="145" y2="230" stroke={color} strokeWidth="0.5" strokeDasharray="5 5" opacity={opacity * 0.25} />
        </svg>
      )}

      <div
        style={{
          position: 'absolute',
          top: '2%',
          bottom: '-8%',
          left: '10%',
          right: '10%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'top center',
            mixBlendMode: 'screen',
            opacity,
            filter: 'brightness(1.3) contrast(1.1)',
            userSelect: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default SilhouetteOverlay;
