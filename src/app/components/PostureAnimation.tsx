/**
 * PostureAnimation — pure SVG + CSS keyframe animations, zero dependencies.
 * One unique animation per posture, auto-plays and loops on modal open.
 * All keyframe names are prefixed to avoid global conflicts.
 */
import React from 'react';

const wrap: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  overflow: 'hidden',
  marginBottom: 20,
};

/* ── Shared SVG props ─────────────────────────────────────────── */
const svgProps = { width: '100%', style: { display: 'block' as const } };

/* ══════════════════════════════════════════════════════════════
   1. FORWARD HEAD — head protrudes forward from neutral
══════════════════════════════════════════════════════════════ */
const AnimForwardHead = () => (
  <div style={wrap}>
    <svg {...svgProps} viewBox="0 0 260 108">
      <style>{`
        @keyframes p-fh {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(18px); }
        }
        .p-fh-group {
          animation: p-fh 2.8s ease-in-out infinite;
          transform-origin: 130px 64px;
        }
      `}</style>

      {/* Neutral / plumb guide line */}
      <line x1="130" y1="5" x2="130" y2="100" stroke="#34d399" strokeWidth="1.2" strokeDasharray="3,4" opacity="0.45"/>
      <text x="133" y="13" fontSize="7.5" fill="#34d399" opacity="0.5" fontFamily="-apple-system,sans-serif">neutral</text>

      {/* Torso / shoulders — static */}
      <rect x="92" y="66" width="76" height="26" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>

      {/* Head + neck — animates forward */}
      <g className="p-fh-group">
        {/* Neck */}
        <line x1="130" y1="65" x2="130" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round"/>
        {/* Head */}
        <circle cx="130" cy="33" r="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.8"/>
        {/* Face dot — indicates front of head */}
        <circle cx="140" cy="33" r="2.8" fill="rgba(255,255,255,0.45)"/>
      </g>

      <text x="130" y="106" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)" fontFamily="-apple-system,sans-serif">head shifts forward from alignment</text>
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   2. UNEVEN SHOULDERS — one shoulder elevated, opposite drops
══════════════════════════════════════════════════════════════ */
const AnimUnevenShoulders = () => (
  <div style={wrap}>
    <svg {...svgProps} viewBox="0 0 260 108">
      <style>{`
        @keyframes p-us-l {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-15px); }
        }
        @keyframes p-us-r {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(10px); }
        }
        .p-us-left  { animation: p-us-l 2.8s ease-in-out infinite; transform-origin: 74px 54px; }
        .p-us-right { animation: p-us-r 2.8s ease-in-out infinite; transform-origin: 186px 54px; }
      `}</style>

      {/* Level reference line */}
      <line x1="48" y1="54" x2="212" y2="54" stroke="#34d399" strokeWidth="1" strokeDasharray="3,4" opacity="0.35"/>

      {/* Torso center */}
      <rect x="118" y="52" width="24" height="38" rx="7" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>

      {/* Left shoulder group — goes up */}
      <g className="p-us-left">
        <line x1="118" y1="60" x2="80" y2="54" stroke="rgba(229,53,53,0.55)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="72" cy="54" r="9" fill="rgba(229,53,53,0.15)" stroke="#e53535" strokeWidth="1.8"/>
      </g>

      {/* Right shoulder group — drops slightly */}
      <g className="p-us-right">
        <line x1="142" y1="60" x2="180" y2="54" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="188" cy="54" r="9" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.8"/>
      </g>

      <text x="130" y="104" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)" fontFamily="-apple-system,sans-serif">one shoulder sits higher than the other</text>
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   3. KYPHOSIS — upper back hunches forward (side view)
══════════════════════════════════════════════════════════════ */
const AnimKyphosis = () => (
  <div style={wrap}>
    <svg {...svgProps} viewBox="0 0 260 108">
      <style>{`
        @keyframes p-ky {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(14deg); }
        }
        .p-ky-upper {
          animation: p-ky 3s ease-in-out infinite;
          transform-origin: 130px 70px;
        }
      `}</style>

      {/* Lumbar vertebrae — static */}
      <circle cx="130" cy="80" r="6.5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
      <circle cx="130" cy="68" r="6.5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
      <line x1="130" y1="87" x2="130" y2="62" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Thoracic + cervical + head — rotates forward */}
      <g className="p-ky-upper">
        {/* Thoracic vertebrae */}
        <circle cx="130" cy="57" r="6.5" fill="rgba(229,53,53,0.12)" stroke="rgba(229,53,53,0.5)" strokeWidth="1.5"/>
        <circle cx="130" cy="45" r="6.5" fill="rgba(229,53,53,0.12)" stroke="rgba(229,53,53,0.5)" strokeWidth="1.5"/>
        <circle cx="130" cy="34" r="6.5" fill="rgba(229,53,53,0.12)" stroke="rgba(229,53,53,0.5)" strokeWidth="1.5"/>
        <line x1="130" y1="62" x2="130" y2="28" stroke="rgba(229,53,53,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Neck + head */}
        <line x1="130" y1="28" x2="130" y2="16" stroke="rgba(255,255,255,0.28)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="130" cy="10" r="9" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5"/>
        <circle cx="136" cy="10" r="2" fill="rgba(255,255,255,0.4)"/>
      </g>

      {/* Neutral guide */}
      <line x1="130" y1="5" x2="130" y2="90" stroke="#34d399" strokeWidth="1" strokeDasharray="3,4" opacity="0.3"/>

      <text x="130" y="106" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)" fontFamily="-apple-system,sans-serif">upper back rounds forward excessively</text>
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   4. ANTERIOR PELVIC TILT — pelvis rocks forward, arch increases
══════════════════════════════════════════════════════════════ */
const AnimPelvicTilt = () => (
  <div style={wrap}>
    <svg {...svgProps} viewBox="0 0 260 108">
      <style>{`
        @keyframes p-apt {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(13deg); }
        }
        @keyframes p-apt-arch {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(10px); }
        }
        .p-apt-pelvis { animation: p-apt 3s ease-in-out infinite; transform-origin: 130px 68px; }
        .p-apt-arch   { animation: p-apt-arch 3s ease-in-out infinite; transform-origin: 130px 45px; }
      `}</style>

      {/* Level reference */}
      <line x1="92" y1="68" x2="168" y2="68" stroke="#34d399" strokeWidth="1" strokeDasharray="3,4" opacity="0.4"/>

      {/* Lower back arch — curves more when pelvis tilts */}
      <g className="p-apt-arch">
        <path d="M 130 20 Q 146 44 130 65" fill="none" stroke="rgba(229,53,53,0.45)" strokeWidth="2.5" strokeLinecap="round"/>
      </g>

      {/* Upper spine — static, straight */}
      <path d="M 130 20 L 130 10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round"/>

      {/* Pelvis shape — rotates forward */}
      <g className="p-apt-pelvis">
        <path d="M 108 68 Q 130 90 152 68" fill="none" stroke="#e53535" strokeWidth="2.5" strokeLinecap="round" opacity="0.75"/>
        <line x1="108" y1="68" x2="105" y2="53" stroke="rgba(229,53,53,0.5)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="152" y1="68" x2="155" y2="53" stroke="rgba(229,53,53,0.5)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="108" cy="68" r="4.5" fill="rgba(229,53,53,0.2)" stroke="rgba(229,53,53,0.65)" strokeWidth="1.5"/>
        <circle cx="152" cy="68" r="4.5" fill="rgba(229,53,53,0.2)" stroke="rgba(229,53,53,0.65)" strokeWidth="1.5"/>
      </g>

      <text x="130" y="106" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)" fontFamily="-apple-system,sans-serif">pelvis tips forward, lower back arch increases</text>
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   5. ROUNDED SHOULDERS — shoulders roll forward, chest narrows
══════════════════════════════════════════════════════════════ */
const AnimRoundedShoulders = () => (
  <div style={wrap}>
    <svg {...svgProps} viewBox="0 0 260 108">
      <style>{`
        @keyframes p-rs-l {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50%       { transform: translateX(20px) translateY(5px); }
        }
        @keyframes p-rs-r {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50%       { transform: translateX(-20px) translateY(5px); }
        }
        .p-rs-left  { animation: p-rs-l 2.8s ease-in-out infinite; transform-origin: 74px 52px; }
        .p-rs-right { animation: p-rs-r 2.8s ease-in-out infinite; transform-origin: 186px 52px; }
      `}</style>

      {/* Neutral reference dots */}
      <circle cx="62" cy="52" r="4" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" opacity="0.45"/>
      <circle cx="198" cy="52" r="4" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" opacity="0.45"/>

      {/* Chest center */}
      <rect x="116" y="40" width="28" height="38" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>

      {/* Left shoulder — rolls forward / inward */}
      <g className="p-rs-left">
        <line x1="116" y1="52" x2="80" y2="52" stroke="rgba(229,53,53,0.6)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="70" cy="52" r="10" fill="rgba(229,53,53,0.1)" stroke="#e53535" strokeWidth="1.8"/>
      </g>

      {/* Right shoulder — rolls forward / inward */}
      <g className="p-rs-right">
        <line x1="144" y1="52" x2="180" y2="52" stroke="rgba(229,53,53,0.6)" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="190" cy="52" r="10" fill="rgba(229,53,53,0.1)" stroke="#e53535" strokeWidth="1.8"/>
      </g>

      <text x="130" y="102" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)" fontFamily="-apple-system,sans-serif">shoulders roll forward, chest collapses inward</text>
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   6. WINGING SCAPULA — blade lifts away from the ribcage
══════════════════════════════════════════════════════════════ */
const AnimWingScapula = () => (
  <div style={wrap}>
    <svg {...svgProps} viewBox="0 0 260 108">
      <style>{`
        @keyframes p-ws {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50%       { transform: translateY(-11px) translateX(9px); }
        }
        .p-ws-blade { animation: p-ws 2.8s ease-in-out infinite; transform-origin: 162px 58px; }
      `}</style>

      {/* Back of torso */}
      <rect x="95" y="22" width="70" height="68" rx="13" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {/* Spine centerline */}
      <line x1="130" y1="25" x2="130" y2="88" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="3,3"/>

      {/* Left scapula — static, normal side */}
      <path d="M 104 38 L 97 64 L 120 56 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinejoin="round"/>

      {/* Right scapula — animated, wings outward */}
      <g className="p-ws-blade">
        <path d="M 156 38 L 163 64 L 140 56 Z" fill="rgba(229,53,53,0.14)" stroke="#e53535" strokeWidth="1.8" strokeLinejoin="round" opacity="0.8"/>
      </g>

      <text x="130" y="104" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.22)" fontFamily="-apple-system,sans-serif">scapula lifts away from the ribcage</text>
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   Main export
══════════════════════════════════════════════════════════════ */
const PostureAnimation: React.FC<{ problemId: string }> = ({ problemId }) => {
  switch (problemId) {
    case 'forward-head':       return <AnimForwardHead />;
    case 'uneven-shoulders':   return <AnimUnevenShoulders />;
    case 'kyphosis':           return <AnimKyphosis />;
    case 'anterior-pelvic':    return <AnimPelvicTilt />;
    case 'rounded-shoulders':  return <AnimRoundedShoulders />;
    case 'winging-scapula':    return <AnimWingScapula />;
    default:                   return null;
  }
};

export default PostureAnimation;
