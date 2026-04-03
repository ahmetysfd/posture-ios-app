import React from 'react';
import captureScanGhost from '../../assets/capture-scan-ghost.png';

export type PoseGuideVariant = 'front' | 'side' | 'back';

interface PoseGuideOverlayProps {
  variant: PoseGuideVariant;
}

/**
 * Professional framing guide for the 3 scan angles.
 */
const PoseGuideOverlay: React.FC<PoseGuideOverlayProps> = ({ variant }) => {
  const centerLeft = variant === 'side' ? '57%' : '50%';
  const silhouetteStyle: React.CSSProperties = {
    position: 'absolute',
    left: centerLeft,
    top: '7%',
    width: variant === 'side' ? '48%' : '64%',
    height: '84%',
    transform: variant === 'side' ? 'translateX(-50%) scaleX(0.82)' : 'translateX(-50%)',
    overflow: 'hidden',
    opacity: variant === 'side' ? 0.26 : 0.34,
    filter: 'saturate(0.86) brightness(1.02)',
    mixBlendMode: 'screen',
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: '6% 10%',
        width: '80%',
        height: '86%',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        left: '14%',
        right: '14%',
        top: '12.5%',
        borderTop: '2px dashed rgba(124,211,255,0.55)',
      }} />
      <div style={{
        position: 'absolute',
        left: '14%',
        right: '14%',
        bottom: '10%',
        borderTop: '2px dashed rgba(124,211,255,0.55)',
      }} />
      <div style={{
        position: 'absolute',
        left: centerLeft,
        top: '9%',
        bottom: '10%',
        borderLeft: '2px dashed rgba(124,211,255,0.45)',
        transform: 'translateX(-50%)',
      }} />

      <div style={{
        position: 'absolute',
        left: centerLeft,
        top: '10.5%',
        bottom: '8.8%',
        width: variant === 'side' ? '42%' : '54%',
        transform: 'translateX(-50%)',
        borderRadius: '999px',
        background: 'radial-gradient(ellipse at center, rgba(120, 210, 255, 0.10), rgba(120, 210, 255, 0.02) 55%, rgba(120, 210, 255, 0) 72%)',
      }} />

      <div style={silhouetteStyle}>
        <img
          src={captureScanGhost}
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top: '-1%',
            height: '108%',
            width: '180%',
            transform: 'translateX(-50%)',
            objectFit: 'cover',
            objectPosition: 'center top',
            clipPath: variant === 'side'
              ? 'inset(1% 27% 12% 27%)'
              : 'inset(1% 18% 12% 18%)',
          }}
        />
      </div>
    </div>
  );
};

export default PoseGuideOverlay;
