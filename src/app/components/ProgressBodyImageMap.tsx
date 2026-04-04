import React, { useId } from 'react';
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

/** Minimum vertical gap between label row centers (viewBox 0–100). */
const MIN_LABEL_GAP = 6.6;
const PANEL_MARGIN = 3;

type LocalKey = BodyRegion | 'chest' | 'winging';

function markerKey(finding: PostureProblem): LocalKey {
  if (finding.id === 'chest-ribcage') return 'chest';
  if (finding.id === 'winging-scapula') return 'winging';
  if (finding.id === 'forward-head') return 'neck';
  return finding.bodyRegion;
}

type LocalMarker = { lx: number; ly: number; labelSide: 'left' | 'right' };

/**
 * Recalibrated as % within each panel (figure proportions).
 * Head ~13, shoulders ~23–24, thoracic mid ~40, pelvis ~55, knees ~75.
 */
const LOCAL: Record<IntendedView, Record<LocalKey, LocalMarker>> = {
  front: {
    neck: { lx: 50, ly: 13, labelSide: 'left' },
    shoulders: { lx: 50, ly: 23, labelSide: 'left' },
    upperBack: { lx: 50, ly: 40, labelSide: 'left' },
    chest: { lx: 50, ly: 34, labelSide: 'left' },
    pelvis: { lx: 50, ly: 55, labelSide: 'left' },
    knees: { lx: 50, ly: 75, labelSide: 'left' },
    winging: { lx: 44, ly: 38, labelSide: 'left' },
  },
  side: {
    neck: { lx: 46, ly: 13, labelSide: 'right' },
    shoulders: { lx: 47, ly: 24, labelSide: 'right' },
    upperBack: { lx: 41, ly: 42, labelSide: 'right' },
    chest: { lx: 45, ly: 36, labelSide: 'right' },
    pelvis: { lx: 46, ly: 55, labelSide: 'right' },
    knees: { lx: 45, ly: 75, labelSide: 'right' },
    winging: { lx: 42, ly: 40, labelSide: 'right' },
  },
  back: {
    neck: { lx: 50, ly: 13, labelSide: 'left' },
    shoulders: { lx: 50, ly: 24, labelSide: 'left' },
    upperBack: { lx: 50, ly: 42, labelSide: 'left' },
    chest: { lx: 50, ly: 36, labelSide: 'left' },
    pelvis: { lx: 50, ly: 55, labelSide: 'left' },
    knees: { lx: 50, ly: 75, labelSide: 'left' },
    winging: { lx: 38, ly: 38, labelSide: 'left' },
  },
};

function toGlobal(panel: IntendedView, lx: number, ly: number): { x: number; y: number } {
  const { y0, y1 } = PANEL_Y[panel];
  return { x: lx, y: y0 + (ly / 100) * (y1 - y0) };
}

type BaseLayout = {
  pin: BodyMapPin;
  hotspotX: number;
  hotspotY: number;
  labelX: number;
  baseLabelY: number;
  labelSide: 'left' | 'right';
  panel: IntendedView;
};

function baseLayout(pin: BodyMapPin): BaseLayout {
  const key = markerKey(pin.problem);
  const local = LOCAL[pin.panel][key] ?? LOCAL[pin.panel].upperBack;
  const g = toGlobal(pin.panel, local.lx, local.ly);
  const labelX = local.labelSide === 'left' ? 14 : 86;
  return {
    pin,
    hotspotX: g.x,
    hotspotY: g.y,
    labelX,
    baseLabelY: g.y,
    labelSide: local.labelSide,
    panel: pin.panel,
  };
}

/**
 * Group by panel + label side; sort by Y; push labels apart; clamp inside panel band.
 */
function resolveCollisions(layouts: BaseLayout[]): Map<string, number> {
  const key = (p: IntendedView, s: 'left' | 'right') => `${p}:${s}`;
  const groups = new Map<string, BaseLayout[]>();

  for (const L of layouts) {
    const k = key(L.panel, L.labelSide);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(L);
  }

  const labelY = new Map<string, number>();

  for (const [, group] of groups) {
    const sorted = [...group].sort((a, b) => a.baseLabelY - b.baseLabelY);
    const ys: number[] = sorted.map(s => s.baseLabelY);

    for (let i = 1; i < ys.length; i++) {
      if (ys[i] < ys[i - 1] + MIN_LABEL_GAP) {
        ys[i] = ys[i - 1] + MIN_LABEL_GAP;
      }
    }

    const panel = sorted[0].panel;
    const { y0, y1 } = PANEL_Y[panel];
    const lo = y0 + PANEL_MARGIN;
    const hi = y1 - PANEL_MARGIN;

    if (ys[ys.length - 1] > hi) {
      const overflow = ys[ys.length - 1] - hi;
      for (let i = 0; i < ys.length; i++) ys[i] -= overflow;
    }
    if (ys[0] < lo) {
      const under = lo - ys[0];
      for (let i = 0; i < ys.length; i++) ys[i] += under;
    }
    if (ys.length > 1 && ys[ys.length - 1] > hi) {
      const n = ys.length;
      for (let i = 0; i < n; i++) {
        ys[i] = lo + (i / (n - 1)) * (hi - lo);
      }
    }
    if (ys.length === 1) {
      ys[0] = Math.min(hi, Math.max(lo, ys[0]));
    }

    sorted.forEach((item, i) => {
      labelY.set(item.pin.key, ys[i]);
    });
  }

  return labelY;
}

/** Gold / orange / muted green. */
function getPinColor(score: number): string {
  if (score >= 65) return '#E68C33';
  if (score >= 40) return '#D9B84C';
  return '#3DA878';
}

/** L-path: label pill edge → elbow (horizontal) → hotspot. */
function leaderPath(
  labelX: number,
  labelY: number,
  labelSide: 'left' | 'right',
  hotspotX: number,
  hotspotY: number,
): string {
  const pillHalf = 14;
  const edgeX = labelSide === 'left' ? labelX + pillHalf : labelX - pillHalf;
  const midX = edgeX + (hotspotX - edgeX) * 0.55;
  const elbowX = labelSide === 'left' ? Math.min(midX, hotspotX - 0.5) : Math.max(midX, hotspotX + 0.5);
  return `M ${edgeX} ${labelY} L ${elbowX} ${labelY} L ${hotspotX} ${hotspotY}`;
}

const ProgressBodyImageMap: React.FC<ProgressBodyImageMapProps> = ({
  findings,
  maxFindings = 4,
}) => {
  const uid = useId().replace(/:/g, '');
  const pinBudget = Math.min(12, Math.max(maxFindings * 3, 8));
  const pins = getBodyMapPins(findings, pinBudget);

  const bases = pins.map(baseLayout);
  const labelYMap = resolveCollisions(bases);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          borderRadius: 10,
          overflow: 'hidden',
          background: '#0A0A0A',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <img
          src={referenceBodyMapImage}
          alt="Front, side, and back body posture reference"
          style={{ width: '100%', display: 'block' }}
        />

        {/* Black overlay to hide star in bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '13%',
            paddingTop: '13%',
            background: '#0A0A0A',
          }}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <defs>
            <filter id={`pin-glow-${uid}`}>
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {bases.map(b => {
            const labelY = labelYMap.get(b.pin.key) ?? b.baseLabelY;
            const color = getPinColor(b.pin.problem.score);
            const pathD = leaderPath(b.labelX, labelY, b.labelSide, b.hotspotX, b.hotspotY);

            return (
              <g key={b.pin.key}>
                {/* Hotspot glow + dots */}
                <circle
                  cx={b.hotspotX}
                  cy={b.hotspotY}
                  r="3.8"
                  fill={`${color}22`}
                  filter={`url(#pin-glow-${uid})`}
                />
                <circle cx={b.hotspotX} cy={b.hotspotY} r="2" fill={`${color}55`} />
                <circle cx={b.hotspotX} cy={b.hotspotY} r="1" fill={color} />

                {/* Leader line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={`${color}55`}
                  strokeWidth="0.32"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Label card background */}
                <rect
                  x={b.labelX - 14}
                  y={labelY - 2.9}
                  width="28"
                  height="5.8"
                  rx="1.2"
                  fill="rgba(20,20,20,0.94)"
                  stroke={`${color}44`}
                  strokeWidth="0.2"
                />
                {/* Left accent bar */}
                <rect
                  x={b.labelX - 14}
                  y={labelY - 2.9}
                  width="0.8"
                  height="5.8"
                  rx="0"
                  fill={color}
                />

                {/* Label text */}
                <text
                  x={b.labelX - 12}
                  y={labelY + 0.5}
                  fill="rgba(237,237,237,0.92)"
                  fontSize="1.7"
                  fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
                  fontWeight="500"
                >
                  {b.pin.label}
                </text>

                {/* Percentage text */}
                <text
                  x={b.labelX + 13}
                  y={labelY + 0.5}
                  fill={color}
                  fontSize="1.7"
                  fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {b.pin.problem.displayPercent}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tag list below the body map */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 10,
        }}
      >
        {pins.length > 0 ? (
          pins.map(pin => {
            const tagColor = getPinColor(pin.problem.score);
            return (
              <span
                key={pin.key}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'rgba(160,160,155,1)',
                  padding: '5px 10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: `2px solid ${tagColor}`,
                  borderRadius: 6,
                  letterSpacing: '0.01em',
                  fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
                  background: 'rgba(20,20,20,0.6)',
                }}
              >
                {pin.label} · {VIEW_LABELS[pin.panel]} · {pin.problem.displayPercent}%
              </span>
            );
          })
        ) : (
          <span style={{
            fontSize: 12, color: 'rgba(102,102,100,1)',
            fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
          }}>
            No major body-region flags from the latest scan.
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBodyImageMap;
