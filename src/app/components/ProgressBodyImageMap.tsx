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

/** Vertical gap between stacked label cards (viewBox units). */
const MIN_LABEL_GAP = 12.5;
const PANEL_MARGIN = 4;

type LocalKey = BodyRegion | 'chest' | 'winging';

function markerKey(finding: PostureProblem): LocalKey {
  if (finding.id === 'chest-ribcage') return 'chest';
  if (finding.id === 'winging-scapula') return 'winging';
  if (finding.id === 'forward-head') return 'neck';
  return finding.bodyRegion;
}

type LocalMarker = { lx: number; ly: number; labelSide: 'left' | 'right' };

/**
 * Hotspot anchors as % within each horizontal strip (figure is roughly centered).
 * Tuned for the triptych asset: front/back face camera; side profile faces right.
 */
const LOCAL: Record<IntendedView, Record<LocalKey, LocalMarker>> = {
  front: {
    neck: { lx: 50, ly: 11, labelSide: 'left' },
    shoulders: { lx: 50, ly: 24, labelSide: 'left' },
    upperBack: { lx: 50, ly: 37, labelSide: 'left' },
    chest: { lx: 50, ly: 31, labelSide: 'left' },
    pelvis: { lx: 50, ly: 53, labelSide: 'left' },
    knees: { lx: 50, ly: 71, labelSide: 'left' },
    winging: { lx: 50, ly: 36, labelSide: 'left' },
  },
  side: {
    neck: { lx: 54, ly: 11, labelSide: 'right' },
    shoulders: { lx: 52, ly: 24, labelSide: 'right' },
    upperBack: { lx: 46, ly: 38, labelSide: 'right' },
    chest: { lx: 52, ly: 32, labelSide: 'right' },
    pelvis: { lx: 51, ly: 53, labelSide: 'right' },
    knees: { lx: 50, ly: 71, labelSide: 'right' },
    winging: { lx: 45, ly: 36, labelSide: 'right' },
  },
  back: {
    neck: { lx: 50, ly: 11, labelSide: 'left' },
    shoulders: { lx: 50, ly: 24, labelSide: 'left' },
    upperBack: { lx: 50, ly: 38, labelSide: 'left' },
    chest: { lx: 50, ly: 32, labelSide: 'left' },
    pelvis: { lx: 50, ly: 53, labelSide: 'left' },
    knees: { lx: 50, ly: 71, labelSide: 'left' },
    winging: { lx: 38, ly: 35, labelSide: 'left' },
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

/** Label cards sit in side margins so they do not cover the figure (~32–68% x). */
const LABEL_CENTER_LEFT = 17;
const LABEL_CENTER_RIGHT = 83;

function baseLayout(pin: BodyMapPin): BaseLayout {
  const key = markerKey(pin.problem);
  const local = LOCAL[pin.panel][key] ?? LOCAL[pin.panel].upperBack;
  const g = toGlobal(pin.panel, local.lx, local.ly);
  const labelX = local.labelSide === 'left' ? LABEL_CENTER_LEFT : LABEL_CENTER_RIGHT;
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

function getPinColor(score: number): string {
  if (score >= 65) return '#E68C33';
  if (score >= 20) return '#D9B84C';
  return '#3DA878';
}

function getRiskLabel(score: number): string {
  if (score >= 65) return 'High risk';
  if (score >= 20) return 'Moderate';
  return 'Low risk';
}

function getRiskTag(score: number): string {
  if (score >= 65) return 'High';
  if (score >= 20) return 'Mod';
  return 'Low';
}

/** Card size in viewBox units (uniform scale via meet). */
const CARD_W = 32;
const CARD_H = 10;
const CARD_HALF_W = CARD_W / 2;

function leaderPath(
  labelX: number,
  labelY: number,
  labelSide: 'left' | 'right',
  hotspotX: number,
  hotspotY: number,
): string {
  const edgeX = labelSide === 'left' ? labelX + CARD_HALF_W : labelX - CARD_HALF_W;
  const midX = edgeX + (hotspotX - edgeX) * 0.5;
  const elbowX = labelSide === 'left' ? Math.min(midX, hotspotX - 1) : Math.max(midX, hotspotX + 1);
  return `M ${edgeX} ${labelY} L ${elbowX} ${labelY} L ${hotspotX} ${hotspotY}`;
}

function truncateLabel(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1)}…`;
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
          width: '100%',
          aspectRatio: '474 / 1024',
          borderRadius: 10,
          overflow: 'hidden',
          background: '#0A0A0A',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <img
          src={referenceBodyMapImage}
          alt="Front, side, and back body posture reference"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '13%',
            height: '11%',
            background: '#0A0A0A',
          }}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <defs>
            <filter id={`pin-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.35" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {bases.map(b => {
            const labelY = labelYMap.get(b.pin.key) ?? b.baseLabelY;
            const color = getPinColor(b.pin.problem.score);
            const riskLabel = getRiskLabel(b.pin.problem.score);
            const pathD = leaderPath(b.labelX, labelY, b.labelSide, b.hotspotX, b.hotspotY);
            const cardTop = labelY - CARD_H / 2;
            const title = truncateLabel(b.pin.label, 16);

            return (
              <g key={b.pin.key}>
                <circle
                  cx={b.hotspotX}
                  cy={b.hotspotY}
                  r="2.2"
                  fill={`${color}28`}
                  filter={`url(#pin-glow-${uid})`}
                />
                <circle cx={b.hotspotX} cy={b.hotspotY} r="1.35" fill={`${color}66`} />
                <circle cx={b.hotspotX} cy={b.hotspotY} r="0.75" fill={color} />

                <path
                  d={pathD}
                  fill="none"
                  stroke={`${color}70`}
                  strokeWidth="0.38"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <rect
                  x={b.labelX - CARD_HALF_W}
                  y={cardTop}
                  width={CARD_W}
                  height={CARD_H}
                  rx="1.4"
                  fill="rgba(12,12,12,0.96)"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="0.15"
                />
                <rect
                  x={b.labelX - CARD_HALF_W}
                  y={cardTop}
                  width="1.1"
                  height={CARD_H}
                  rx="0"
                  fill={color}
                />

                <text
                  x={b.labelX - CARD_HALF_W + 2}
                  y={labelY - 1.1}
                  fill="#F4F4F4"
                  fontSize="3.15"
                  fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
                  fontWeight="600"
                >
                  {title}
                </text>
                <text
                  x={b.labelX - CARD_HALF_W + 2}
                  y={labelY + 3.2}
                  fill={color}
                  fontSize="2.85"
                  fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
                  fontWeight="700"
                >
                  {riskLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

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
            const riskTag = getRiskTag(pin.problem.score);
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
                {pin.label} · {VIEW_LABELS[pin.panel]} ·{' '}
                <span style={{ color: tagColor, fontWeight: 600 }}>{riskTag}</span>
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
