import React from 'react';
import referenceBodyMapImage from '../../assets/posture-body-map-reference.png';
import {
  BODY_REGION_LABELS,
  getHighlightedProblems,
  type BodyRegion,
  type IntendedView,
  type PostureProblem,
} from '../services/PostureAnalysisEngine';

interface ProgressBodyImageMapProps {
  findings: PostureProblem[];
  maxFindings?: number;
}

type MarkerPosition = {
  hotspotX: number;
  hotspotY: number;
  labelX: number;
  labelY: number;
};

const preferredViewByRegion: Record<BodyRegion, IntendedView> = {
  neck: 'side',
  shoulders: 'front',
  upperBack: 'side',
  pelvis: 'side',
  knees: 'side',
};

const markerPositions: Record<IntendedView, Record<BodyRegion, MarkerPosition>> = {
  front: {
    neck: { hotspotX: 50, hotspotY: 9.5, labelX: 18, labelY: 8.5 },
    shoulders: { hotspotX: 50, hotspotY: 15.3, labelX: 18, labelY: 14.4 },
    upperBack: { hotspotX: 50, hotspotY: 21.2, labelX: 18, labelY: 20.5 },
    pelvis: { hotspotX: 50, hotspotY: 31.5, labelX: 21, labelY: 30.8 },
    knees: { hotspotX: 50, hotspotY: 42.2, labelX: 21, labelY: 41.5 },
  },
  side: {
    neck: { hotspotX: 44.8, hotspotY: 40.8, labelX: 79, labelY: 39.8 },
    shoulders: { hotspotX: 45.2, hotspotY: 46.7, labelX: 80, labelY: 45.8 },
    upperBack: { hotspotX: 43.6, hotspotY: 53.6, labelX: 79.5, labelY: 52.8 },
    pelvis: { hotspotX: 45.8, hotspotY: 64.2, labelX: 79.5, labelY: 63.4 },
    knees: { hotspotX: 45.4, hotspotY: 76.2, labelX: 79.5, labelY: 75.2 },
  },
  back: {
    neck: { hotspotX: 50, hotspotY: 75.2, labelX: 18.5, labelY: 74.2 },
    shoulders: { hotspotX: 50, hotspotY: 80.8, labelX: 18.5, labelY: 79.9 },
    upperBack: { hotspotX: 50, hotspotY: 87.1, labelX: 18.5, labelY: 86.2 },
    pelvis: { hotspotX: 50, hotspotY: 95.6, labelX: 21.5, labelY: 94.8 },
    knees: { hotspotX: 50, hotspotY: 99.3, labelX: 21.5, labelY: 98.5 },
  },
};

function getIssueColor(score: number): string {
  if (score >= 65) return '#FF4D4F';
  if (score >= 40) return '#FF8A3D';
  return '#FFC53D';
}

const ProgressBodyImageMap: React.FC<ProgressBodyImageMapProps> = ({
  findings,
  maxFindings = 4,
}) => {
  const visibleFindings = getHighlightedProblems(findings, maxFindings);

  return (
    <div>
      <div style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#000',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <img
          src={referenceBodyMapImage}
          alt="Front, side, and back body posture reference"
          style={{ width: '100%', display: 'block' }}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <defs>
            <filter id="hotspot-blur">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>

          {visibleFindings.map((finding) => {
            const markerView = preferredViewByRegion[finding.bodyRegion] ?? finding.dominantView;
            const position = markerPositions[markerView][finding.bodyRegion];
            const color = getIssueColor(finding.score);
            const lineStartX = position.labelX < position.hotspotX ? position.labelX + 10 : position.labelX - 10;
            const lineMidX = position.labelX < position.hotspotX ? position.hotspotX - 5 : position.hotspotX + 5;

            return (
              <g key={finding.id}>
                <circle
                  cx={position.hotspotX}
                  cy={position.hotspotY}
                  r="4.5"
                  fill={`${color}55`}
                  filter="url(#hotspot-blur)"
                />
                <circle
                  cx={position.hotspotX}
                  cy={position.hotspotY}
                  r="2.4"
                  fill={`${color}AA`}
                />
                <circle
                  cx={position.hotspotX}
                  cy={position.hotspotY}
                  r="1.2"
                  fill={color}
                />

                <path
                  d={`M ${lineStartX} ${position.labelY} L ${lineMidX} ${position.labelY} L ${position.hotspotX} ${position.hotspotY}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <rect
                  x={position.labelX - 10}
                  y={position.labelY - 3}
                  width="20"
                  height="6"
                  rx="1.2"
                  fill="rgba(6,10,14,0.88)"
                  stroke={color}
                  strokeWidth="0.2"
                />
                <rect
                  x={position.labelX - 10}
                  y={position.labelY - 3}
                  width="1.4"
                  height="6"
                  rx="0.5"
                  fill={color}
                />
                <text
                  x={position.labelX - 8}
                  y={position.labelY - 0.3}
                  fill="rgba(255,255,255,0.92)"
                  fontSize="1.7"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="700"
                >
                  {BODY_REGION_LABELS[finding.bodyRegion]}
                </text>
                <text
                  x={position.labelX + 8}
                  y={position.labelY - 0.3}
                  fill={color}
                  fontSize="1.7"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="800"
                  textAnchor="end"
                >
                  {finding.displayPercent}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
      }}>
        {visibleFindings.length > 0 ? visibleFindings.map((finding) => (
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
            {BODY_REGION_LABELS[finding.bodyRegion]} {finding.displayPercent}%
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

export default ProgressBodyImageMap;
