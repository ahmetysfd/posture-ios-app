import React from 'react';

export type PoseGuideVariant = 'front' | 'side' | 'back';

interface PoseGuideOverlayProps {
  variant: PoseGuideVariant;
}

/**
 * Professional framing guide for the 3 scan angles.
 */
const PoseGuideOverlay: React.FC<PoseGuideOverlayProps> = ({ variant }) => {
  return (
    <svg
      viewBox="0 0 100 168"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: 'absolute',
        inset: '6% 10%',
        width: '80%',
        height: '86%',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id={`capture-guide-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="84" height="152" rx="24" fill={`url(#capture-guide-${variant})`} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
      <line x1="14" y1="26" x2="86" y2="26" stroke="rgba(124,211,255,0.55)" strokeWidth="1" strokeDasharray="4 5" />
      <line x1="14" y1="145" x2="86" y2="145" stroke="rgba(124,211,255,0.55)" strokeWidth="1" strokeDasharray="4 5" />
      <line
        x1={variant === 'side' ? 58 : 50}
        y1="20"
        x2={variant === 'side' ? 58 : 50}
        y2="145"
        stroke="rgba(124,211,255,0.45)"
        strokeWidth="1"
        strokeDasharray="4 5"
      />

      <text x="50" y="18" fill="rgba(255,255,255,0.78)" fontSize="5.6" fontFamily="system-ui,sans-serif" textAnchor="middle">
        Full body inside frame
      </text>
      <text x="50" y="156" fill="rgba(255,255,255,0.72)" fontSize="5.4" fontFamily="system-ui,sans-serif" textAnchor="middle">
        Stand naturally
      </text>

      {variant === 'side' ? (
        <g fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 58 30 C 52 30 47 35 47 42 C 47 49 52 54 58 54 C 64 54 69 49 69 42 C 69 35 64 30 58 30 Z" />
          <path d="M 52 58 C 56 54 61 54 65 58" />
          <path d="M 51 62 C 45 70 44 82 46 96 C 48 108 50 121 53 136" />
          <path d="M 64 60 C 60 65 58 73 58 86" />
          <path d="M 53 136 L 51 147" />
          <path d="M 57 136 L 60 147" />
          <path d="M 50 148 L 46 154" />
          <path d="M 61 148 L 66 154" />
          <path d="M 51 67 L 43 99" />
          <path d="M 58 94 L 69 118" />
        </g>
      ) : variant === 'back' ? (
        <g fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 50 30 C 43 30 37 35 37 42 C 37 49 43 55 50 55 C 57 55 63 49 63 42 C 63 35 57 30 50 30 Z" />
          <path d="M 38 61 C 41 57 45 55 50 55 C 55 55 59 57 62 61" />
          <path d="M 34 66 C 38 61 43 60 47 61 L 40 92" />
          <path d="M 66 66 C 62 61 57 60 53 61 L 60 92" />
          <path d="M 43 60 C 40 73 40 91 43 110 C 44 118 45 127 46 137" />
          <path d="M 57 60 C 60 73 60 91 57 110 C 56 118 55 127 54 137" />
          <path d="M 46 137 L 43 149" />
          <path d="M 54 137 L 57 149" />
          <path d="M 42 150 L 38 156" />
          <path d="M 58 150 L 62 156" />
        </g>
      ) : (
        <g fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 50 30 C 43 30 37 35 37 42 C 37 49 43 55 50 55 C 57 55 63 49 63 42 C 63 35 57 30 50 30 Z" />
          <path d="M 38 61 C 41 57 45 55 50 55 C 55 55 59 57 62 61" />
          <path d="M 34 67 C 38 61 43 60 47 61 L 39 93" />
          <path d="M 66 67 C 62 61 57 60 53 61 L 61 93" />
          <path d="M 43 60 C 40 73 40 91 43 110 C 44 118 45 127 46 137" />
          <path d="M 57 60 C 60 73 60 91 57 110 C 56 118 55 127 54 137" />
          <path d="M 46 137 L 43 149" />
          <path d="M 54 137 L 57 149" />
          <path d="M 42 150 L 38 156" />
          <path d="M 58 150 L 62 156" />
        </g>
      )}

      <text x="50" y="164" fill="rgba(124,211,255,0.88)" fontSize="6" fontFamily="system-ui,sans-serif" textAnchor="middle">
        {variant === 'front' ? 'Face camera' : variant === 'side' ? 'Turn 90° sideways' : 'Back to camera'}
      </text>
    </svg>
  );
};

export default PoseGuideOverlay;
