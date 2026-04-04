import React from 'react';
import referenceBodyMapImage from '../../assets/posture-body-map-reference.png';
import {
  getBodyMapPins,
  VIEW_LABELS,
  type BodyRegion,
  type BodyMapPin,
  type IntendedView,
  type PostureProblem,
} from '../services/PostureAnalysisEngine';

interface ProgressBodyImageMapProps {
  findings: PostureProblem[];
  maxFindings?: number;
}

/** Stacked reference: top third = front, middle = side, bottom = back. */
const PANEL_Y: Record<IntendedView, { y0: number; y1: number }> = {
  front: { y0: 0, y1: 100 / 3 },
  side: { y0: 100 / 3, y1: (100 * 2) / 3 },
  back: { y0: (100 * 2) / 3, y1: 100 },
};

type LocalKey = BodyRegion | 'chest' | 'winging';

function markerKey(finding: PostureProblem): LocalKey {
  if (finding.id === 'chest-ribcage') return 'chest';
  if (finding.id === 'winging-scapula') return 'winging';
  if (finding.id === 'forward-head') return 'neck';
  return finding.bodyRegion;
}

type LocalMarker = { lx: number; ly: number; labelSide: 'left' | 'right' };

/** lx, ly are 0–100 within that panel’s figure (ly=0 top of figure). */
const LOCAL: Record<IntendedView, Record<LocalKey, LocalMarker>> = {
  front: {
    neck: { lx: 50, ly: 10, labelSide: 'left' },
    shoulders: { lx: 50, ly: 22, labelSide: 'left' },
    upperBack: { lx: 50, ly: 34, labelSide: 'left' },
    chest: { lx: 50, ly: 28, labelSide: 'left' },
    pelvis: { lx: 50, ly: 50, labelSide: 'left' },
    knees: { lx: 50, ly: 72, labelSide: 'left' },
    winging: { lx: 44, ly: 32, labelSide: 'left' },
  },
  side: {
    neck: { lx: 46, ly: 10, labelSide: 'right' },
    shoulders: { lx: 47, ly: 22, labelSide: 'right' },
    upperBack: { lx: 41, ly: 35, labelSide: 'right' },
    chest: { lx: 45, ly: 29, labelSide: 'right' },
    pelvis: { lx: 46, ly: 52, labelSide: 'right' },
    knees: { lx: 45, ly: 73, labelSide: 'right' },
    winging: { lx: 42, ly: 34, labelSide: 'right' },
  },
  back: {
    neck: { lx: 50, ly: 10, labelSide: 'left' },
    shoulders: { lx: 50, ly: 24, labelSide: 'left' },
    upperBack: { lx: 50, ly: 36, labelSide: 'left' },
    chest: { lx: 50, ly: 30, labelSide: 'left' },
    pelvis: { lx: 50, ly: 52, labelSide: 'left' },
    knees: { lx: 50, ly: 74, labelSide: 'left' },
    winging: { lx: 38, ly: 32, labelSide: 'left' },
  },
};

function toGlobal(panel: IntendedView, lx: number, ly: number): { x: number; y: number } {
  const { y0, y1 } = PANEL_Y[panel];
  const gy = y0 + (ly / 100) * (y1 - y0);
  return { x: lx, y: gy };
}

function layoutPin(pin: BodyMapPin): {
  hotspotX: number;
  hotspotY: number;
  labelX: number;
  labelY: number;
} {
  const key = markerKey(pin.problem);
  const local = LOCAL[pin.panel][key] ?? LOCAL[pin.panel].upperBack;
  const g = toGlobal(pin.panel, local.lx, local.ly);
  const labelX = local.labelSide === 'left' ? 14 : 86;
  return {
    hotspotX: g.x,
    hotspotY: g.y,
    labelX,
    labelY: g.y,
  };
}

function getIssueColor(score: number): string {
  if (score >= 65) return '#FF4D4F';
  if (score >= 40) return '#FF8A3D';
  return '#FFC53D';
}

const ProgressBodyImageMap: React.FC<ProgressBodyImageMapProps> = ({
  findings,
  maxFindings = 4,
}) => {
  const pinBudget = Math.min(12, Math.max(maxFindings * 3, 8));
  const pins = getBodyMapPins(findings, pinBudget);

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

          {pins.map((pin) => {
            const position = layoutPin(pin);
            const color = getIssueColor(pin.problem.score);
            const lineStartX = position.labelX < position.hotspotX ? position.labelX + 10 : position.labelX - 10;
            const lineMidX = position.labelX < position.hotspotX ? position.hotspotX - 5 : position.hotspotX + 5;

            return (
              <g key={pin.key}>
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
                  x={position.labelX - 12}
                  y={position.labelY - 3.2}
                  width="24"
                  height="6.4"
                  rx="1.2"
                  fill="rgba(6,10,14,0.88)"
                  stroke={color}
                  strokeWidth="0.2"
                />
                <rect
                  x={position.labelX - 12}
                  y={position.labelY - 3.2}
                  width="1.4"
                  height="6.4"
                  rx="0.5"
                  fill={color}
                />
                <text
                  x={position.labelX - 10}
                  y={position.labelY - 0.2}
                  fill="rgba(255,255,255,0.92)"
                  fontSize="1.55"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="700"
                >
                  {pin.label}
                </text>
                <text
                  x={position.labelX + 10}
                  y={position.labelY - 0.2}
                  fill={color}
                  fontSize="1.55"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="800"
                  textAnchor="end"
                >
                  {pin.problem.displayPercent}%
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
        {pins.length > 0 ? pins.map((pin) => (
          <span
            key={pin.key}
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
            {pin.label} · {VIEW_LABELS[pin.panel]} {pin.problem.displayPercent}%
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
