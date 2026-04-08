/**
 * SkeletonOverlay — draws skeleton + risk labels on user's actual photo.
 * Labels appear based on problem.showOnViews — each view shows its own problems.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { type Keypoint, KP } from '../services/MoveNetPoseService';
import {
  type PostureProblem,
  type RiskCategory,
  type IntendedView,
  RISK_INFO,
  VIEW_LABELS,
} from '../services/PostureAnalysisEngineV2';

interface SkeletonOverlayProps {
  photoUrl: string;
  keypoints: Keypoint[];
  view: IntendedView;
  problems: PostureProblem[];
  showSkeleton?: boolean;
  showLabels?: boolean;
}

const T = {
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
  bone: 'rgba(80, 220, 120, 0.8)',
  joint: 'rgba(100, 220, 255, 0.9)',
  midline: 'rgba(100, 180, 255, 0.35)',
  torso: 'rgba(230, 160, 50, 0.45)',
  guide: 'rgba(255, 199, 102, 0.7)',
};

const BONES: [number, number][] = [
  [KP.NOSE, KP.LEFT_EYE],
  [KP.NOSE, KP.RIGHT_EYE],
  [KP.LEFT_EYE, KP.LEFT_EAR],
  [KP.RIGHT_EYE, KP.RIGHT_EAR],
  [KP.NOSE, KP.LEFT_SHOULDER],
  [KP.NOSE, KP.RIGHT_SHOULDER],
  [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER],
  [KP.LEFT_SHOULDER, KP.LEFT_ELBOW],
  [KP.LEFT_ELBOW, KP.LEFT_WRIST],
  [KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW],
  [KP.RIGHT_ELBOW, KP.RIGHT_WRIST],
  [KP.LEFT_SHOULDER, KP.LEFT_HIP],
  [KP.RIGHT_SHOULDER, KP.RIGHT_HIP],
  [KP.LEFT_HIP, KP.RIGHT_HIP],
  [KP.LEFT_HIP, KP.LEFT_KNEE],
  [KP.LEFT_KNEE, KP.LEFT_ANKLE],
  [KP.RIGHT_HIP, KP.RIGHT_KNEE],
  [KP.RIGHT_KNEE, KP.RIGHT_ANKLE],
];

function getLabelAnchor(
  problemId: string,
  view: IntendedView,
): { kp: number | [number, number]; side: 'left' | 'right' } | null {
  const anchors: Record<
    string,
    Record<string, { kp: number | [number, number]; side: 'left' | 'right' }>
  > = {
    'forward-head': {
      front: { kp: KP.NOSE, side: 'left' },
      side: { kp: KP.NOSE, side: 'right' },
    },
    'winging-scapula': {
      back: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'left' },
    },
    'anterior-pelvic': {
      side: { kp: [KP.LEFT_HIP, KP.RIGHT_HIP], side: 'right' },
      front: { kp: [KP.LEFT_HIP, KP.RIGHT_HIP], side: 'left' },
    },
    'rounded-shoulders': {
      side: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'right' },
      front: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'right' },
    },
    kyphosis: {
      side: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'left' },
      back: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'right' },
    },
    'uneven-shoulders': {
      front: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'left' },
      back: { kp: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER], side: 'left' },
    },
  };
  return anchors[problemId]?.[view] ?? null;
}

function riskColor(risk: RiskCategory): string {
  return RISK_INFO[risk].color;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({
  photoUrl,
  keypoints,
  view,
  problems,
  showSkeleton = true,
  showLabels = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const viewProblems = problems.filter(p =>
    (p.showOnViews?.length ? p.showOnViews : p.detectedInViews).includes(view),
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !keypoints.length) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w < 2 || h < 2) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const kx = (i: number) => keypoints[i].x * w;
    const ky = (i: number) => keypoints[i].y * h;
    const vis = (i: number) => keypoints[i] && keypoints[i].score > 0.3;

    if (showSkeleton) {
      if (vis(KP.NOSE)) {
        const botY =
          vis(KP.LEFT_ANKLE) && vis(KP.RIGHT_ANKLE)
            ? Math.max(ky(KP.LEFT_ANKLE), ky(KP.RIGHT_ANKLE)) + 10
            : h * 0.95;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = T.midline;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(kx(KP.NOSE), ky(KP.NOSE) - 20);
        ctx.lineTo(kx(KP.NOSE), botY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (
        vis(KP.LEFT_SHOULDER) &&
        vis(KP.RIGHT_SHOULDER) &&
        vis(KP.LEFT_HIP) &&
        vis(KP.RIGHT_HIP)
      ) {
        ctx.strokeStyle = T.torso;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(kx(KP.LEFT_SHOULDER), ky(KP.LEFT_SHOULDER));
        ctx.lineTo(kx(KP.RIGHT_SHOULDER), ky(KP.RIGHT_SHOULDER));
        ctx.lineTo(kx(KP.RIGHT_HIP), ky(KP.RIGHT_HIP));
        ctx.lineTo(kx(KP.LEFT_HIP), ky(KP.LEFT_HIP));
        ctx.closePath();
        ctx.stroke();

        const shoulderMidX = (kx(KP.LEFT_SHOULDER) + kx(KP.RIGHT_SHOULDER)) / 2;
        const shoulderMidY = (ky(KP.LEFT_SHOULDER) + ky(KP.RIGHT_SHOULDER)) / 2;
        const hipMidX = (kx(KP.LEFT_HIP) + kx(KP.RIGHT_HIP)) / 2;
        const hipMidY = (ky(KP.LEFT_HIP) + ky(KP.RIGHT_HIP)) / 2;

        ctx.strokeStyle = T.guide;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(kx(KP.LEFT_SHOULDER), ky(KP.LEFT_SHOULDER));
        ctx.lineTo(kx(KP.RIGHT_SHOULDER), ky(KP.RIGHT_SHOULDER));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(kx(KP.LEFT_HIP), ky(KP.LEFT_HIP));
        ctx.lineTo(kx(KP.RIGHT_HIP), ky(KP.RIGHT_HIP));
        ctx.stroke();

        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(shoulderMidX, shoulderMidY);
        ctx.lineTo(hipMidX, hipMidY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = T.bone;
      ctx.lineCap = 'round';
      for (const [a, b] of BONES) {
        if (vis(a) && vis(b)) {
          ctx.beginPath();
          ctx.moveTo(kx(a), ky(a));
          ctx.lineTo(kx(b), ky(b));
          ctx.stroke();
        }
      }

      for (let i = 0; i < keypoints.length; i++) {
        if (!vis(i)) continue;
        ctx.beginPath();
        ctx.arc(kx(i), ky(i), 5, 0, Math.PI * 2);
        ctx.fillStyle = T.joint;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (showLabels) {
      const usedYRanges: Array<{ y: number; h: number }> = [];

      for (const problem of viewProblems) {
        const anchorDef = getLabelAnchor(problem.id, view);
        if (!anchorDef) continue;

        let ax: number;
        let ay: number;
        if (Array.isArray(anchorDef.kp)) {
          const [i1, i2] = anchorDef.kp;
          if (!vis(i1) || !vis(i2)) continue;
          ax = (kx(i1) + kx(i2)) / 2;
          ay = (ky(i1) + ky(i2)) / 2;
        } else {
          if (!vis(anchorDef.kp)) continue;
          ax = kx(anchorDef.kp);
          ay = ky(anchorDef.kp);
        }

        const color = riskColor(problem.riskCategory);
        const labelW = 155;
        const labelH = 42;
        const gap = 15;
        const offset = anchorDef.side === 'left' ? -(labelW + gap) : gap;
        let lx = ax + offset;
        let ly = ay - labelH / 2;

        lx = Math.max(4, Math.min(w - labelW - 4, lx));
        ly = Math.max(4, Math.min(h - labelH - 4, ly));

        for (const used of usedYRanges) {
          if (ly < used.y + used.h + 4 && ly + labelH > used.y - 4) {
            ly = used.y + used.h + 6;
          }
        }
        ly = Math.min(h - labelH - 4, ly);
        usedYRanges.push({ y: ly, h: labelH });

        const lineX = anchorDef.side === 'left' ? lx + labelW : lx;
        ctx.strokeStyle = `${color}88`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(lineX, ly + labelH / 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.strokeStyle = `${color}55`;
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, labelW, labelH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = color;
        roundRect(ctx, lx, ly, 3, labelH, 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(237, 237, 237, 0.95)';
        ctx.font = `500 13px ${T.font}`;
        ctx.textBaseline = 'top';
        ctx.fillText(problem.mapLabel, lx + 12, ly + 7);

        ctx.fillStyle = color;
        ctx.font = `600 12px ${T.font}`;
        ctx.fillText(RISK_INFO[problem.riskCategory].label, lx + 12, ly + 24);
      }
    }
  }, [keypoints, showSkeleton, showLabels, viewProblems, view]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    draw();
  }, [draw, dims]);

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
      <div ref={containerRef} style={{ position: 'relative', lineHeight: 0 }}>
        <img
          src={photoUrl}
          alt={`${VIEW_LABELS[view]} view`}
          style={{ width: '100%', display: 'block' }}
          onLoad={draw}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          padding: '6px 12px',
          borderRadius: 20,
          background: 'rgba(10,10,10,0.7)',
          border: '1px solid rgba(255,255,255,0.12)',
          fontSize: 12,
          fontWeight: 600,
          color: '#E5EEF6',
          fontFamily: T.font,
          backdropFilter: 'blur(8px)',
        }}
      >
        {VIEW_LABELS[view]} view
      </div>
      {viewProblems.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'rgba(10,10,10,0.7)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 11,
            fontWeight: 500,
            color: '#BAE6FD',
            fontFamily: T.font,
            backdropFilter: 'blur(8px)',
          }}
        >
          {viewProblems.length} issue{viewProblems.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default SkeletonOverlay;
