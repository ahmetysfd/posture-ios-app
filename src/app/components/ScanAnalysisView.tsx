/**
 * ScanAnalysisView — shows the 3 analyzed photos with skeleton overlays
 * and a grouped risk summary below.
 *
 * This replaces the "done" flow section in BodyScanScreen.tsx.
 * Insert it where flow === 'done' renders.
 */
import React, { useEffect, useRef, useState } from 'react';
import SkeletonOverlay from './SkeletonOverlay';
import DailyProgramLevelCard from './DailyProgramLevelCard';
import { type Keypoint, KP } from '../services/MoveNetPoseService';
import {
  type IntendedView,
  type PostureProblem,
  type RiskCategory,
  type ScanReport,
  RISK_INFO,
  VIEW_LABELS,
} from '../services/PostureAnalysisEngineV2';

interface ScanAnalysisViewProps {
  report: ScanReport;
  photos: { front: string; side: string; back: string };
  keypoints: { front: Keypoint[]; side: Keypoint[]; back: Keypoint[] };
  onViewDailyPlan: () => void;
  onViewFullReport: () => void;
  onNewScan: () => void;
  showFullReportButton?: boolean;
  showNewScanButton?: boolean;
  /** When false, hides “See your daily plan” (e.g. on Progress). */
  showDailyPlanButton?: boolean;
  /** Optional — when provided, Risk Analysis cards become tappable. */
  onProblemSelect?: (problemId: string) => void;
}

// ── Body-region crop system ──────────────────────────────────────────────────
// For each problem: the MoveNet keypoints that bound the body region the user
// needs to look at, plus the views we'd like to crop from in order of preference.
// Keypoints come from the real scan; bbox + canvas crop happen on render.

interface RegionDef {
  viewPriority: IntendedView[];
  keypoints: number[];
  /** When set, always crop from this view regardless of confidence scoring. */
  forceView?: IntendedView;
}

const PROBLEM_REGIONS: Record<string, RegionDef> = {
  // Head over shoulders — forced to side view.
  'forward-head': {
    forceView: 'side',
    viewPriority: ['side'],
    keypoints: [KP.NOSE, KP.LEFT_EAR, KP.RIGHT_EAR, KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER],
  },
  // Shoulder curl — forced to side view.
  'rounded-shoulders': {
    forceView: 'side',
    viewPriority: ['side'],
    keypoints: [
      KP.LEFT_EAR, KP.RIGHT_EAR,
      KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER,
      KP.LEFT_ELBOW, KP.RIGHT_ELBOW,
    ],
  },
  // Horizontal shoulder line — forced to back view.
  'uneven-shoulders': {
    forceView: 'back',
    viewPriority: ['back'],
    keypoints: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER, KP.LEFT_ELBOW, KP.RIGHT_ELBOW],
  },
  // Shoulder blades — only visible from behind.
  'winging-scapula': {
    forceView: 'back',
    viewPriority: ['back'],
    keypoints: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER, KP.LEFT_ELBOW, KP.RIGHT_ELBOW],
  },
  // Upper-torso curve — forced to back view.
  kyphosis: {
    forceView: 'back',
    viewPriority: ['back'],
    keypoints: [
      KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER,
      KP.LEFT_HIP, KP.RIGHT_HIP,
    ],
  },
  // Pelvis + surrounding chain (shoulder-hip-knee stack).
  'anterior-pelvic': {
    forceView: 'side',
    viewPriority: ['side'],
    keypoints: [
      KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER,
      KP.LEFT_HIP, KP.RIGHT_HIP,
      KP.LEFT_KNEE, KP.RIGHT_KNEE,
    ],
  },
};

const DEFAULT_REGION: RegionDef = {
  viewPriority: ['front', 'side', 'back'],
  keypoints: [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER, KP.LEFT_HIP, KP.RIGHT_HIP],
};

/** Score how well a view supports a problem's region keypoints.
 *  Returns 0 if fewer than 2 relevant keypoints are visible. */
function scoreViewForRegion(kps: Keypoint[] | undefined, regionKps: number[]): number {
  if (!kps || !kps.length) return 0;
  const visible = regionKps
    .map(i => kps[i])
    .filter((p): p is Keypoint => Boolean(p) && p.score > 0.2);
  if (visible.length < 2) return 0;
  const avgConf = visible.reduce((sum, p) => sum + p.score, 0) / visible.length;
  return visible.length + avgConf * 2;
}

/** Pick which view to crop from. A forced view always wins if its photo exists;
 *  otherwise combine the engine's hint with real keypoint visibility. */
function pickViewForProblem(
  problem: PostureProblem,
  keypoints: { front: Keypoint[]; side: Keypoint[]; back: Keypoint[] },
  photos: { front: string; side: string; back: string },
  region: RegionDef,
): IntendedView {
  if (region.forceView && photos[region.forceView]) return region.forceView;

  const order: IntendedView[] = [];
  const push = (v: IntendedView | undefined) => {
    if (v && !order.includes(v)) order.push(v);
  };
  region.viewPriority.forEach(push);
  push(problem.dominantView);
  (problem.detectedInViews ?? []).forEach(push);
  (problem.showOnViews ?? []).forEach(push);
  (['front', 'side', 'back'] as IntendedView[]).forEach(push);

  let best: IntendedView = order[0] ?? 'front';
  let bestScore = -1;
  for (let i = 0; i < order.length; i++) {
    const v = order[i];
    const s = scoreViewForRegion(keypoints[v], region.keypoints);
    if (s <= 0) continue;
    const adjusted = s + (order.length - i) * 0.15;
    if (adjusted > bestScore) {
      bestScore = adjusted;
      best = v;
    }
  }
  return best;
}

/** Canvas-based body-region crop. Draws the requested region of a scan photo
 *  directly onto a square canvas so there are no CSS layout gymnastics. */
const RegionCropCanvas: React.FC<{
  photoUrl: string;
  keypoints: Keypoint[];
  regionKps: number[];
  reloadKey: string;
}> = ({ photoUrl, keypoints, regionKps, reloadKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const CW = 512;
    const CH = 512;
    canvas.width = CW;
    canvas.height = CH;
    ctx.fillStyle = '#0A0A0C';
    ctx.fillRect(0, 0, CW, CH);

    if (!photoUrl) return;

    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      const nW = img.naturalWidth;
      const nH = img.naturalHeight;
      if (!nW || !nH) return;

      const valid = regionKps
        .map(i => keypoints[i])
        .filter((p): p is Keypoint => Boolean(p) && p.score > 0.2);

      const minSide = Math.min(nW, nH);
      let sx: number;
      let sy: number;
      let side: number;

      if (valid.length < 2) {
        side = minSide * 0.95;
        sx = (nW - side) / 2;
        sy = (nH - side) / 2;
      } else {
        const xs = valid.map(p => p.x * nW);
        const ys = valid.map(p => p.y * nH);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const range = Math.max(maxX - minX, maxY - minY);

        // Generous padding so the body part reads as a region, not a tight cutout.
        side = range * 2.4 + minSide * 0.08;
        // Clamp: at least a third of the shorter image dimension, at most almost all of it.
        side = Math.max(side, minSide * 0.34);
        side = Math.min(side, minSide * 0.96);

        sx = cx - side / 2;
        sy = cy - side / 2;

        if (sx < 0) sx = 0;
        if (sy < 0) sy = 0;
        if (sx + side > nW) sx = nW - side;
        if (sy + side > nH) sy = nH - side;
      }

      ctx.clearRect(0, 0, CW, CH);
      ctx.drawImage(img, sx, sy, side, side, 0, 0, CW, CH);
    };
    img.src = photoUrl;
    return () => {
      cancelled = true;
    };
    // Intentionally depend on reloadKey only — array refs would cause noisy
    // re-runs while keypoints for a given scan don't actually change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
};

const T = {
  bg: '#09090B', surface: '#141416', surface2: '#1A1A1E', border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.10)', text: '#FFFFFF',
  text2: 'rgba(161,161,170,1)', text3: 'rgba(113,113,122,1)',
  gold: '#FB923C', orange: '#F97316', green: '#22C55E',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const ScanAnalysisView: React.FC<ScanAnalysisViewProps> = ({
  report,
  photos,
  keypoints,
  onViewDailyPlan,
  onViewFullReport,
  onNewScan,
  showFullReportButton = true,
  showNewScanButton = true,
  showDailyPlanButton = true,
  onProblemSelect,
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');

  // Group problems by risk
  const highRisk = report.problems.filter(p => p.riskCategory === 'high');
  const medRisk = report.problems.filter(p => p.riskCategory === 'medium');
  const lowRisk = report.problems.filter(p => p.riskCategory === 'low');

  const ToggleButton: React.FC<{
    label: string; icon: string; active: boolean; onPress: () => void;
  }> = ({ label, icon, active, onPress }) => (
    <button
      type="button"
      onClick={onPress}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '12px 0', borderRadius: 14,
        background: active ? T.surface2 : T.surface,
        border: `1px solid ${active ? T.border2 : T.border}`,
        color: active ? '#D4D4D8' : T.text3,
        fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {active ? `Hide ${label}` : `Show ${label}`}
    </button>
  );

  const ProblemCard: React.FC<{ problem: PostureProblem; color: string }> = ({ problem, color }) => {
    const region = PROBLEM_REGIONS[problem.id] ?? DEFAULT_REGION;
    const view = pickViewForProblem(problem, keypoints, photos, region);
    const viewKps = keypoints[view] ?? [];
    const photoUrl = photos[view] ?? '';
    const tappable = Boolean(onProblemSelect);
    // Re-run the canvas draw when the chosen view or photo changes.
    const reloadKey = `${problem.id}|${view}|${photoUrl.length}`;

    const handleClick = () => {
      if (onProblemSelect) onProblemSelect(problem.id);
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!tappable}
        style={{
          position: 'relative',
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          background: '#131316',
          border: `1px solid ${color}33`,
          cursor: tappable ? 'pointer' : 'default',
          textAlign: 'left',
          boxShadow: `0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 1px ${color}11`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Square body-region crop rendered via canvas (reliable across browsers) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            // Padding-bottom 100% creates a square that works everywhere
            // (doesn't rely on aspect-ratio propagating through grid+button).
            paddingBottom: '100%',
            overflow: 'hidden',
            background: '#0A0A0C',
          }}
        >
          <RegionCropCanvas
            photoUrl={photoUrl}
            keypoints={viewKps}
            regionKps={region.keypoints}
            reloadKey={reloadKey}
          />
          {/* Dark vignette bottom so the label area is always readable */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* Risk tag pill */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px 3px 6px',
              borderRadius: 999,
              background: 'rgba(10,10,10,0.72)',
              border: `1px solid ${color}66`,
              backdropFilter: 'blur(6px)',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 9, fontWeight: 700, color, fontFamily: T.font, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {RISK_INFO[problem.riskCategory].label.replace(' risk', '')}
            </span>
          </div>
          {/* View indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              padding: '3px 7px',
              borderRadius: 6,
              background: 'rgba(10,10,10,0.72)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 600, color: '#D4D4D8', fontFamily: T.font, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {VIEW_LABELS[view]}
            </span>
          </div>
        </div>

        {/* Info row */}
        <div
          style={{
            padding: '10px 12px 12px',
            borderTop: `1px solid rgba(255,255,255,0.05)`,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: 2,
              background: color,
            }}
          />
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: T.font, lineHeight: 1.25, marginBottom: 3 }}>
            {problem.mapLabel}
          </div>
          <div style={{ fontSize: 9, color: T.text3, fontFamily: T.font, letterSpacing: '0.02em' }}>
            {(problem.detectedInViews.length ? problem.detectedInViews : (problem.showOnViews ?? []))
              .map(v => VIEW_LABELS[v])
              .join(' · ')}
          </div>
        </div>
      </button>
    );
  };

  const RiskSection: React.FC<{
    risk: RiskCategory; problems: PostureProblem[];
  }> = ({ risk, problems: probs }) => {
    if (probs.length === 0) return null;
    const info = RISK_INFO[risk];
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 4,
            background: info.color,
          }} />
          <span style={{
            fontSize: 12, fontWeight: 600, color: info.color,
            fontFamily: T.font,
          }}>
            {info.label}
          </span>
          <span style={{
            fontSize: 11, color: T.text3, fontFamily: T.font,
          }}>
            · {probs.length} area{probs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {probs.map(p => (
            <ProblemCard key={p.id} problem={p} color={info.color} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

      {/* ── 21-day program level (replaces scan-only badge + thin bars) ── */}
      <DailyProgramLevelCard />

      {/* ── View tabs ─────────────────────────── */}
      <div style={{
        display: 'flex', background: T.surface, borderRadius: 18, padding: 4, border: `1px solid ${T.border}`,
      }}>
        {(['front', 'side', 'back'] as const).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setActiveView(v)}
            style={{
              flex: 1, textAlign: 'center', padding: '9px 0',
              borderRadius: 12, fontSize: 12,
              fontWeight: activeView === v ? 600 : 400,
              cursor: 'pointer', fontFamily: T.font, border: 'none',
              color: activeView === v ? T.text : T.text3,
              background: activeView === v ? 'linear-gradient(135deg, #2A2A2F 0%, #1A1A1E 100%)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {/* ── Skeleton overlay on photo ─────────── */}
      <SkeletonOverlay
        photoUrl={photos[activeView]}
        keypoints={keypoints[activeView]}
        view={activeView}
        problems={report.problems}
        showSkeleton={showSkeleton}
        showLabels={showLabels}
      />

      {/* ── Toggle buttons ────────────────────── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <ToggleButton
          label="Skeleton"
          icon="◉"
          active={showSkeleton}
          onPress={() => setShowSkeleton(!showSkeleton)}
        />
        <ToggleButton
          label="Labels"
          icon="▣"
          active={showLabels}
          onPress={() => setShowLabels(!showLabels)}
        />
      </div>

      {/* ── Risk summary ─────────────────────── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)',
        borderRadius: 24,
        padding: 20,
        border: `1px solid ${T.border}`,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          width: 128,
          height: 128,
          borderRadius: '50%',
          background: 'rgba(244,63,94,0.08)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'relative', zIndex: 1,
          fontSize: 11, fontWeight: 700, color: T.text3,
          fontFamily: T.font, marginBottom: 14,
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>
          Risk analysis
        </div>

        <RiskSection risk="high" problems={highRisk} />
        <RiskSection risk="medium" problems={medRisk} />
        <RiskSection risk="low" problems={lowRisk} />

        {report.problems.length === 0 && (
          <p style={{ fontSize: 13, color: T.text2, fontFamily: T.font }}>
            No significant posture issues detected. Great alignment!
          </p>
        )}

        {report.problems.some(p => {
          const conf = typeof p.confidenceScore === 'number';
          const sup = p.supportingMeasurements && p.supportingMeasurements.length > 0;
          return conf || sup;
        }) && (
          <details style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>
            <summary style={{ cursor: 'pointer', fontSize: 11, color: T.text2, fontFamily: T.font }}>
              Measurement details
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.problems.map(problem => {
                const hasConfidence = typeof problem.confidenceScore === 'number';
                const hasSupporting = problem.supportingMeasurements && problem.supportingMeasurements.length > 0;
                if (!hasConfidence && !hasSupporting) return null;
                return (
                  <div key={`${problem.id}-metrics`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text, fontFamily: T.font, marginBottom: 6 }}>
                      {problem.mapLabel}
                    </div>
                    {hasConfidence && (
                      <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font, marginBottom: hasSupporting ? 4 : 0 }}>
                        Confidence: {problem.confidenceScore}%
                      </div>
                    )}
                    {hasSupporting && (
                      <div style={{ fontSize: 11, color: T.text2, fontFamily: T.font, lineHeight: 1.45 }}>
                        {problem.supportingMeasurements!.join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>

      {/* ── Disclaimer ────────────────────────── */}
      <div style={{
        padding: '2px 4px',
        borderRadius: 8,
      }}>
        <p style={{ fontSize: 10, color: T.text3, lineHeight: 1.5, fontFamily: T.font }}>
          AI posture screen — not a medical diagnosis. Consult a professional for pain or clinical concerns.
        </p>
      </div>

      {/* ── Action buttons ────────────────────── */}
      {showDailyPlanButton && (
        <button
          type="button"
          onClick={onViewDailyPlan}
          style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)', color: '#FFFFFF',
            fontSize: 14, fontWeight: 600, border: 'none',
            cursor: 'pointer', fontFamily: T.font,
            boxShadow: '0 0 24px rgba(249,115,22,0.22)',
          }}
        >
          See your daily plan
        </button>
      )}
      {showFullReportButton && (
        <button
          type="button"
          onClick={onViewFullReport}
          style={{
            width: '100%', padding: 15, borderRadius: 16,
            background: T.surface, color: T.text,
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: T.font,
            border: `1px solid ${T.border}`,
          }}
        >
          Full report →
        </button>
      )}
      {showNewScanButton && (
        <button
          type="button"
          onClick={onNewScan}
          style={{
            width: '100%', padding: 15, borderRadius: 16,
            background: T.surface, color: T.text2,
            border: `1px solid ${T.border}`,
            fontSize: 13, cursor: 'pointer', fontFamily: T.font,
          }}
        >
          New scan
        </button>
      )}
    </div>
  );
};

export default ScanAnalysisView;
