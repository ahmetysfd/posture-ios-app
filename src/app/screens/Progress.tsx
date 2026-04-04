import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBodyImageMap from '../components/ProgressBodyImageMap';
import Layout from '../components/Layout';
import {
  BODY_REGION_LABELS,
  deriveStretchPrescription,
  getHighlightedProblems,
  type PostureReport,
  VIEW_LABELS,
} from '../services/PostureAnalysisEngine';

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<PostureReport | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('postureReport');
    if (!raw) return;
    try {
      setReport(JSON.parse(raw));
    } catch {
      setReport(null);
    }
  }, []);

  const highlighted = report ? getHighlightedProblems(report.problems, 4) : [];
  const measuredRegions = report ? new Set(report.problems.map(problem => problem.bodyRegion)).size : 0;
  const lastScanLabel = report
    ? new Date(report.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const stretchPlan = report ? deriveStretchPrescription(report) : null;

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        <div style={{ paddingTop: 52, marginBottom: 24, animation: 'fadeIn 0.5s ease' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Progress</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-sec)', marginTop: 4 }}>Track your latest body-map scan</p>
        </div>

        {!report ? (
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 22,
            padding: 22,
            border: '1px solid var(--color-border-light)',
            animation: 'slideUp 0.4s ease 0.08s both',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>No scan yet</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.6, marginBottom: 16 }}>
              Take a front, side, and back posture scan to unlock your body-region map and latest health percentages.
            </p>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 16,
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-button)',
              }}
            >
              Start body scan
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, animation: 'slideUp 0.4s ease 0.08s both' }}>
              {[
                { v: report.overallScore, l: 'Overall score', c: 'var(--color-primary)' },
                { v: `${highlighted.length}`, l: 'Focus areas', c: 'var(--color-warning)' },
                { v: `${measuredRegions}`, l: 'Regions screened', c: 'var(--color-accent)' },
                { v: `${report.viewsCombined?.length ?? 1}`, l: 'Views used', c: '#7DD3FC' },
              ].map((st, i) => (
                <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 16, border: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tert)', fontWeight: 500, marginBottom: 8 }}>{st.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: st.c }}>{st.v}</div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              border: '1px solid var(--color-border-light)',
              animation: 'slideUp 0.4s ease 0.16s both',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Latest body map</h3>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.5 }}>
                    Your latest posture findings are pinned directly onto the front, side, and back body views.
                  </p>
                </div>
                {lastScanLabel && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-tert)' }}>Updated {lastScanLabel}</span>
                )}
              </div>
              <ProgressBodyImageMap findings={report.problems} maxFindings={4} />

              {stretchPlan && (
                <div style={{
                  marginTop: 20,
                  paddingTop: 18,
                  borderTop: '1px solid var(--color-border-light)',
                }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                    Daily stretch target
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.55, marginBottom: 12 }}>
                    {stretchPlan.summary}{' '}
                    {stretchPlan.sessionsPerDay === 2
                      ? `Try ~${stretchPlan.minutesPerSession[0]} min + ~${stretchPlan.minutesPerSession[1]} min on most days.`
                      : `One ~${stretchPlan.minutesPerSession[0]} min session most days is enough.`}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: 10,
                    marginBottom: 12,
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      flex: '1 1 120px',
                      background: 'rgba(124,211,255,0.1)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      border: '1px solid rgba(124,211,255,0.22)',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Daily total
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#7DD3FC', marginTop: 4 }}>
                        {stretchPlan.dailyMinutesTotal} min
                      </div>
                    </div>
                    <div style={{
                      flex: '1 1 120px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 14,
                      padding: '12px 14px',
                      border: '1px solid var(--color-border-light)',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Habit timeline
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginTop: 6, lineHeight: 1.35 }}>
                        Many people notice small wins in roughly {stretchPlan.habitsTimelineWeeks.min}–{stretchPlan.habitsTimelineWeeks.max} weeks
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-tert)', lineHeight: 1.5, marginBottom: 10 }}>
                    How this is guessed: we add a few minutes per flagged issue using its severity, bump up slightly if the overall score is lower, and when the daily target reaches about 18 minutes we split it into two shorter sessions (“little and often”) — not a clinical formula.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--color-text-sec)', lineHeight: 1.55 }}>
                    {stretchPlan.rationaleBullets.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 11, color: 'var(--color-text-tert)', lineHeight: 1.45, marginTop: 12, marginBottom: 0 }}>
                    {stretchPlan.disclaimer}
                  </p>
                </div>
              )}
            </div>

            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              border: '1px solid var(--color-border-light)',
              animation: 'slideUp 0.4s ease 0.24s both',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 14 }}>Top regions to watch</h3>
              {highlighted.length > 0 ? highlighted.map((problem, index) => (
                <div key={problem.id} style={{
                  padding: '12px 0',
                  borderBottom: index < highlighted.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                      {problem.mapLabel ?? BODY_REGION_LABELS[problem.bodyRegion]}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                      {problem.displayPercent}% health
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.5 }}>
                    {problem.confidenceLabel} Dominant view: {VIEW_LABELS[problem.dominantView]}.
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>
                  No major body-region issues were flagged in the latest scan.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/scan/results')}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 18,
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-button)',
                marginBottom: 10,
              }}
            >
              Open full report
            </button>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 18,
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                marginBottom: 24,
              }}
            >
              Take another scan
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Progress;
