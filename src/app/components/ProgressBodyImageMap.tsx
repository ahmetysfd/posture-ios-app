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
  left: string;
  top: string;
};

const markerPositions: Record<IntendedView, Record<BodyRegion, MarkerPosition>> = {
  front: {
    neck: { left: '50%', top: '8.5%' },
    shoulders: { left: '50%', top: '13.5%' },
    upperBack: { left: '50%', top: '18.5%' },
    pelvis: { left: '50%', top: '27.5%' },
    knees: { left: '50%', top: '36%' },
  },
  side: {
    neck: { left: '53.5%', top: '41%' },
    shoulders: { left: '53.5%', top: '46%' },
    upperBack: { left: '53%', top: '52%' },
    pelvis: { left: '52.5%', top: '61.5%' },
    knees: { left: '52%', top: '71%' },
  },
  back: {
    neck: { left: '50%', top: '74.5%' },
    shoulders: { left: '50%', top: '79.5%' },
    upperBack: { left: '50%', top: '85%' },
    pelvis: { left: '50%', top: '93.5%' },
    knees: { left: '50%', top: '99%' },
  },
};

function getMarkerColor(healthScore: number): string {
  if (healthScore >= 85) return '#34D399';
  if (healthScore >= 70) return '#FBBF24';
  return '#FB7185';
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

        {visibleFindings.map((finding) => {
          const position = markerPositions[finding.dominantView][finding.bodyRegion];
          const color = getMarkerColor(finding.displayPercent);

          return (
            <div
              key={finding.id}
              style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'rgba(10,10,10,0.86)',
                border: `3px solid ${color}`,
                boxShadow: `0 0 0 6px ${color}22`,
              }} />
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 'calc(100% + 6px)',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                padding: '4px 8px',
                borderRadius: 999,
                background: 'rgba(10,10,10,0.84)',
                border: `1px solid ${color}66`,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
              }}>
                {finding.displayPercent}%
              </div>
            </div>
          );
        })}
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
