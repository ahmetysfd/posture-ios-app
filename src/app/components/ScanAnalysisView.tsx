/**
 * ScanAnalysisView — shows the 3 analyzed photos with skeleton overlays
 * and a grouped risk summary below.
 *
 * This replaces the "done" flow section in BodyScanScreen.tsx.
 * Insert it where flow === 'done' renders.
 */
import React, { useState } from 'react';
import SkeletonOverlay from './SkeletonOverlay';
import { type Keypoint } from '../services/MoveNetPoseService';
import {
  type PostureProblem,
  type RiskCategory,
  type PostureLevel,
  type ScanReport,
  RISK_INFO,
  LEVEL_INFO,
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
}

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
}) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeView, setActiveView] = useState<'front' | 'side' | 'back'>('front');

  const levelInfo = LEVEL_INFO[report.postureLevel];

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

  const RiskSection: React.FC<{
    risk: RiskCategory; problems: PostureProblem[];
  }> = ({ risk, problems: probs }) => {
    if (probs.length === 0) return null;
    const info = RISK_INFO[risk];
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
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
        {probs.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '4px 0 4px 12px',
            marginBottom: 8,
            borderLeft: `2px solid ${info.color}99`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text, fontFamily: T.font }}>
                {p.mapLabel}
              </div>
              <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font, marginTop: 2 }}>
                <span style={{ color: T.text2 }}>Labels: </span>
                {(p.showOnViews?.length ? p.showOnViews : p.detectedInViews)
                  .map(v => VIEW_LABELS[v])
                  .join(' + ')}
                {p.detectedInViews.length > 0 && (
                  <>
                    {' · '}
                    <span style={{ color: T.text2 }}>detected: </span>
                    {p.detectedInViews.map(v => VIEW_LABELS[v]).join(' + ')}
                  </>
                )}
              </div>
              {typeof p.confidenceScore === 'number' && (
                <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font, marginTop: 4 }}>
                  Confidence: {p.confidenceScore}%
                </div>
              )}
              {p.supportingMeasurements && p.supportingMeasurements.length > 0 && (
                <div style={{ fontSize: 11, color: T.text2, fontFamily: T.font, marginTop: 4, lineHeight: 1.45 }}>
                  {p.supportingMeasurements.slice(0, 3).join(' · ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

      {/* ── Level result card ──────────────────── */}
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
          top: '-30%',
          right: '-10%',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(249,115,22,0.10)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 11, fontWeight: 600, color: levelInfo.color,
          padding: '3px 8px', borderRadius: 6,
          background: levelInfo.bgColor,
          display: 'inline-block', marginBottom: 8,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {levelInfo.label}
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: T.font, letterSpacing: '-0.02em' }}>
          {levelInfo.tagline}
        </div>
        <p style={{ position: 'relative', zIndex: 1, fontSize: 12, color: T.text2, lineHeight: 1.5, fontFamily: T.font }}>
          {report.problems.length} posture issue{report.problems.length !== 1 ? 's' : ''} detected across 3 views.
        </p>
        <p style={{ position: 'relative', zIndex: 1, fontSize: 10, color: T.text3, lineHeight: 1.55, fontFamily: T.font, marginTop: 6 }}>
          Low findings stay visible so front and back asymmetries do not disappear from the report.
        </p>

        {/* Level bar */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 4, marginTop: 12 }}>
          {(['beginner', 'intermediate', 'advanced'] as PostureLevel[]).map(l => (
            <div key={l} style={{
              flex: 1, height: 5, borderRadius: 3,
              background: l === report.postureLevel
                ? (l === 'beginner' ? T.orange : l === 'intermediate' ? T.gold : T.green)
                : 'rgba(255,255,255,0.05)',
            }} />
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: T.text3 }}>Beginner</span>
          <span style={{ fontSize: 9, color: T.text3 }}>Intermediate</span>
          <span style={{ fontSize: 9, color: T.text3 }}>Advanced</span>
        </div>
      </div>

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

        {report.problems.some(p => p.rawMetrics && Object.keys(p.rawMetrics).length > 0) && (
          <details style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>
            <summary style={{ cursor: 'pointer', fontSize: 11, color: T.text2, fontFamily: T.font }}>
              Measurement details
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.problems.map(problem => {
                const entries = Object.entries(problem.rawMetrics ?? {}).slice(0, 4);
                if (!entries.length) return null;
                return (
                  <div key={`${problem.id}-metrics`} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 10 }}>
                    <div style={{ fontSize: 12, color: T.text, fontFamily: T.font, marginBottom: 4 }}>
                      {problem.mapLabel}
                    </div>
                    <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font, lineHeight: 1.45 }}>
                      {entries.map(([key, value]) => `${key}: ${value}`).join(' · ')}
                    </div>
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
