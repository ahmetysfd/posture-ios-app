import React from 'react';
import {
  BODY_REGION_LABELS,
  getHighlightedProblems,
  type BodyRegion,
  type PostureProblem,
} from '../services/PostureAnalysisEngine';

interface PostureBodyMapProps {
  findings: PostureProblem[];
  maxFindings?: number;
  compact?: boolean;
}

type AnchorPoint = {
  x: number;
  y: number;
  textX: number;
  align: 'start' | 'end';
};

const frontAnchors: Record<BodyRegion, AnchorPoint> = {
  neck: { x: 53, y: 38, textX: 16, align: 'end' },
  shoulders: { x: 53, y: 58, textX: 16, align: 'end' },
  upperBack: { x: 53, y: 78, textX: 16, align: 'end' },
  pelvis: { x: 53, y: 112, textX: 16, align: 'end' },
  knees: { x: 53, y: 148, textX: 16, align: 'end' },
};

const sideAnchors: Record<BodyRegion, AnchorPoint> = {
  neck: { x: 127, y: 38, textX: 148, align: 'start' },
  shoulders: { x: 123, y: 58, textX: 148, align: 'start' },
  upperBack: { x: 121, y: 79, textX: 148, align: 'start' },
  pelvis: { x: 122, y: 112, textX: 148, align: 'start' },
  knees: { x: 120, y: 148, textX: 148, align: 'start' },
};

function getRiskColor(score: number): string {
  if (score >= 65) return '#E68C33';
  if (score >= 20) return '#D9B84C';
  return '#3DA878';
}

function getRiskLabel(score: number): string {
  if (score >= 65) return 'High risk';
  if (score >= 20) return 'Moderate';
  return 'Low risk';
}

function riskColorForFinding(f: PostureProblem): string {
  if (f.riskCategory === 'high') return '#E68C33';
  if (f.riskCategory === 'medium') return '#D9B84C';
  if (f.riskCategory === 'low') return '#3DA878';
  return getRiskColor(f.score);
}

function riskLabelForFinding(f: PostureProblem): string {
  if (f.riskCategory === 'high') return 'High risk';
  if (f.riskCategory === 'medium') return 'Medium risk';
  if (f.riskCategory === 'low') return 'Low risk';
  return getRiskLabel(f.score);
}

const PostureBodyMap: React.FC<PostureBodyMapProps> = ({
  findings,
  maxFindings = 4,
  compact = false,
}) => {
  const visibleFindings = getHighlightedProblems(findings, maxFindings);

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      borderRadius: compact ? 18 : 22,
      border: '1px solid var(--color-border)',
      padding: compact ? 16 : 20,
    }}>
      <svg
        viewBox="0 0 164 192"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Posture body map"
      >
        <defs>
          <linearGradient id="posture-map-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width="162" height="190" rx="22" fill="url(#posture-map-bg)" />

        <text x="40" y="18" fill="rgba(255,255,255,0.55)" fontSize="8" fontFamily="system-ui, sans-serif" textAnchor="middle">
          Front
        </text>
        <text x="121" y="18" fill="rgba(255,255,255,0.55)" fontSize="8" fontFamily="system-ui, sans-serif" textAnchor="middle">
          Side
        </text>

        <g fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 40 26 C 35 26 31 31 31 38 C 31 45 35 50 40 50 C 45 50 49 45 49 38 C 49 31 45 26 40 26 Z" />
          <path d="M 31 57 C 33 53 36 51 40 51 C 44 51 47 53 49 57" />
          <path d="M 27 63 C 30 59 34 58 37 59 L 29 88" />
          <path d="M 53 63 C 50 59 46 58 43 59 L 51 88" />
          <path d="M 34 58 C 31 70 31 87 34 106 C 35 113 36 121 37 131" />
          <path d="M 46 58 C 49 70 49 87 46 106 C 45 113 44 121 43 131" />
          <path d="M 37 131 L 34 168" />
          <path d="M 43 131 L 46 168" />
          <path d="M 33 170 L 29 182" />
          <path d="M 47 170 L 51 182" />
          <path d="M 39 52 L 41 52" opacity="0.5" />
        </g>

        <g fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 125 26 C 120 26 116 31 116 38 C 116 45 120 50 125 50 C 130 50 134 45 134 38 C 134 31 130 26 125 26 Z" />
          <path d="M 120 56 C 124 52 128 52 131 56" />
          <path d="M 118 61 C 113 67 112 78 114 92 C 115 103 118 117 120 131" />
          <path d="M 131 58 C 127 63 125 71 125 83" />
          <path d="M 121 132 L 119 168" />
          <path d="M 123 132 L 126 168" />
          <path d="M 118 170 L 114 182" />
          <path d="M 127 170 L 131 182" />
          <path d="M 120 63 L 111 94" />
          <path d="M 124 90 L 135 114" />
        </g>

        <line x1="40" y1="23" x2="40" y2="182" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
        <line x1="123" y1="23" x2="123" y2="182" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />

        {visibleFindings.map(finding => {
          const panel = finding.mapPanels?.[0] ?? finding.dominantView;
          const anchor = panel === 'side' ? sideAnchors[finding.bodyRegion] : frontAnchors[finding.bodyRegion];
          const color = riskColorForFinding(finding);
          const lineEndX = anchor.align === 'end' ? anchor.textX + 4 : anchor.textX - 4;

          return (
            <g key={finding.id}>
              <line x1={anchor.x} y1={anchor.y} x2={lineEndX} y2={anchor.y} stroke={color} strokeWidth="1.6" />
              <circle cx={anchor.x} cy={anchor.y} r="4" fill="#0B0F13" stroke={color} strokeWidth="2.2" />
              <text
                x={anchor.textX}
                y={anchor.y - 4}
                fill={color}
                fontSize="8.2"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
                textAnchor={anchor.align}
              >
                {finding.mapLabel ?? BODY_REGION_LABELS[finding.bodyRegion]}
              </text>
              <text
                x={anchor.textX}
                y={anchor.y + 7}
                fill="rgba(255,255,255,0.82)"
                fontSize="7.4"
                fontFamily="system-ui, sans-serif"
                textAnchor={anchor.align}
              >
                {riskLabelForFinding(finding)}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        marginTop: compact ? 12 : 14,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {visibleFindings.length > 0 ? visibleFindings.map(finding => (
          <span
            key={finding.id}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text)',
              padding: '7px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {finding.mapLabel ?? BODY_REGION_LABELS[finding.bodyRegion]}{' '}
            <span style={{ color: riskColorForFinding(finding) }}>{riskLabelForFinding(finding)}</span>
          </span>
        )) : (
          <span style={{ fontSize: 12, color: 'var(--color-text-tert)' }}>
            No major body-region flags from the latest scan.
          </span>
        )}
      </div>
    </div>
  );
};

export default PostureBodyMap;
