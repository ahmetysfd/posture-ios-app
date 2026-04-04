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

/* ─── design tokens ─────────────────────────────────────────────────── */
const T = {
  bg:        '#0A0A0A',
  surface:   '#141414',
  surface2:  '#1A1A1A',
  border:    'rgba(255,255,255,0.06)',
  border2:   'rgba(255,255,255,0.10)',
  text:      '#EDEDED',
  text2:     'rgba(160,160,155,1)',
  text3:     'rgba(102,102,100,1)',
  gold:      '#D9B84C',
  orange:    '#E68C33',
  green:     '#3DA878',
  blue:      '#5BA8D9',
  font:      "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
  mono:      "'SF Mono', 'Menlo', 'Consolas', monospace",
};

/* ─── tiny helpers ───────────────────────────────────────────────────── */
const scoreColor = (s: number) => s >= 65 ? T.orange : s >= 40 ? T.gold : T.green;

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 15,
    letterSpacing: '-0.01em',
    color: T.text,
    fontWeight: 500,
    marginBottom: 14,
    fontFamily: T.font,
  }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ height: '1px', background: T.border, margin: '28px 24px 0' }} />
);

/* ─── component ─────────────────────────────────────────────────────── */
const Progress: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<PostureReport | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('postureReport');
    if (!raw) return;
    try { setReport(JSON.parse(raw)); } catch { setReport(null); }
  }, []);

  const highlighted     = report ? getHighlightedProblems(report.problems, 4) : [];
  const measuredRegions = report ? new Set(report.problems.map(p => p.bodyRegion)).size : 0;
  const lastScanLabel   = report
    ? new Date(report.timestamp).toLocaleString([], {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;
  const stretchPlan = report ? deriveStretchPrescription(report) : null;

  return (
    <Layout>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '56px 24px 20px',
        borderBottom: `1px solid ${T.border}`,
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: T.text3, fontWeight: 500, marginBottom: 6, fontFamily: T.font,
        }}>
          Body scan
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{
            fontSize: 22, fontWeight: 500, color: T.text,
            letterSpacing: '-0.02em', fontFamily: T.font,
          }}>
            Progress
          </h1>
          {lastScanLabel && (
            <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font, letterSpacing: '0.01em' }}>
              {lastScanLabel}
            </span>
          )}
        </div>
      </div>

      {!report ? (
        /* ── Empty state ──────────────────────────────────────────── */
        <div style={{ padding: '32px 24px', animation: 'slideUp 0.4s ease both' }}>
          <p style={{
            fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: T.text3, fontWeight: 500, marginBottom: 16, fontFamily: T.font,
          }}>
            No scan yet
          </p>
          <p style={{
            fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: 24,
            fontFamily: T.font,
          }}>
            Take a front, side, and back posture scan to unlock your body-region map and health percentages.
          </p>
          <button
            type="button"
            onClick={() => navigate('/scan')}
            style={{
              width: '100%', padding: 15, borderRadius: 10,
              background: T.gold, color: '#0A0A0A',
              fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
              fontFamily: T.font, letterSpacing: '0.01em',
            }}
          >
            Start body scan
          </button>
        </div>
      ) : (
        <>
          {/* ── Stats grid ──────────────────────────────────────────── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '1px', background: T.border,
            animation: 'slideUp 0.35s ease 0.05s both',
          }}>
            {[
              { label: 'Score',            value: report.overallScore,            color: T.orange },
              { label: 'Focus areas',       value: highlighted.length,             color: T.gold  },
              { label: 'Regions screened',  value: measuredRegions,                color: T.blue  },
              { label: 'Views used',        value: report.viewsCombined?.length ?? 1, color: T.green },
            ].map((st, i) => (
              <div key={i} style={{ background: T.bg, padding: '18px 20px' }}>
                <div style={{
                  fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: T.text3, fontWeight: 500, marginBottom: 8, fontFamily: T.font,
                }}>
                  {st.label}
                </div>
                <div style={{
                  fontSize: 26, fontWeight: 600, color: st.color,
                  letterSpacing: '-0.03em', lineHeight: 1, fontFamily: T.font,
                }}>
                  {st.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Body map ────────────────────────────────────────────── */}
          <div style={{
            padding: '28px 24px 0',
            animation: 'slideUp 0.35s ease 0.1s both',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 14,
            }}>
              <Label>Body map</Label>
              <span style={{
                fontSize: 12, color: T.text3, marginBottom: 14,
                fontFamily: T.font, letterSpacing: '0.02em',
              }}>
                Front · Side · Back
              </span>
            </div>
            <ProgressBodyImageMap findings={report.problems} maxFindings={4} />
          </div>

          <Divider />

          {/* ── Stretch plan ────────────────────────────────────────── */}
          {stretchPlan && (
            <div style={{
              padding: '24px 24px 0',
              animation: 'slideUp 0.35s ease 0.15s both',
            }}>
              <Label>Daily stretch target</Label>

              <p style={{
                fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 16,
                fontFamily: T.font,
              }}>
                {stretchPlan.summary}{' '}
                {stretchPlan.sessionsPerDay === 2
                  ? `Try ~${stretchPlan.minutesPerSession[0]} min + ~${stretchPlan.minutesPerSession[1]} min on most days.`
                  : `One ~${stretchPlan.minutesPerSession[0]} min session most days is enough.`}
              </p>

              {/* Two cells */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '1px', background: T.border,
                borderRadius: 10, overflow: 'hidden', marginBottom: 16,
              }}>
                <div style={{ background: T.surface, padding: 16 }}>
                  <div style={{
                    fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: T.text3, fontWeight: 500, marginBottom: 6, fontFamily: T.font,
                  }}>
                    Daily total
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 600, color: T.blue,
                    letterSpacing: '-0.02em', fontFamily: T.font,
                  }}>
                    {stretchPlan.dailyMinutesTotal} min
                  </div>
                </div>
                <div style={{ background: T.surface, padding: 16 }}>
                  <div style={{
                    fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: T.text3, fontWeight: 500, marginBottom: 6, fontFamily: T.font,
                  }}>
                    Habit timeline
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: T.text,
                    lineHeight: 1.4, marginTop: 2, fontFamily: T.font,
                  }}>
                    Small wins in roughly {stretchPlan.habitsTimelineWeeks.min}–{stretchPlan.habitsTimelineWeeks.max} weeks
                  </div>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
                {stretchPlan.rationaleBullets.map((line, i) => (
                  <li key={i} style={{
                    fontSize: 12, color: T.text3, padding: '4px 0',
                    paddingLeft: 16, position: 'relative', lineHeight: 1.55,
                    fontFamily: T.font,
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: T.text3 }}>—</span>
                    {line}
                  </li>
                ))}
              </ul>

              <p style={{
                fontSize: 11, color: T.text3, lineHeight: 1.55,
                paddingTop: 12, borderTop: `1px solid ${T.border}`,
                fontFamily: T.font,
              }}>
                {stretchPlan.disclaimer}
              </p>
            </div>
          )}

          <Divider />

          {/* ── Detected issues (was: Top regions) ──────────────────── */}
          <div style={{
            padding: '24px 24px 0',
            animation: 'slideUp 0.35s ease 0.2s both',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            }}>
              <Label>Detected issues</Label>
              {highlighted.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 500, color: T.gold,
                  background: 'rgba(217,184,76,0.1)',
                  padding: '2px 8px', borderRadius: 10,
                  fontFamily: T.font, marginBottom: 14,
                }}>
                  {highlighted.length}
                </span>
              )}
            </div>

            {highlighted.length > 0 ? highlighted.map((problem) => {
              const color = scoreColor(problem.score);
              return (
                <div key={problem.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: T.surface,
                  borderRadius: 10,
                  marginBottom: 8,
                }}>
                  {/* Severity color bar */}
                  <div style={{
                    width: 3, height: 28, borderRadius: 2,
                    background: color, flexShrink: 0,
                  }} />

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 500, color: T.text,
                      fontFamily: T.font, marginBottom: 2,
                    }}>
                      {problem.mapLabel ?? BODY_REGION_LABELS[problem.bodyRegion]}
                    </div>
                    <div style={{
                      fontSize: 11, color: T.text3,
                      fontFamily: T.font, letterSpacing: '0.01em',
                    }}>
                      {VIEW_LABELS[problem.dominantView]}
                    </div>
                  </div>

                  {/* Percentage */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 17, fontWeight: 600, color,
                      fontFamily: T.font, letterSpacing: '-0.02em',
                    }}>
                      {problem.displayPercent}%
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, fontFamily: T.font }}>
                No major body-region issues were flagged in the latest scan.
              </p>
            )}
          </div>

          {/* ── CTAs ────────────────────────────────────────────────── */}
          <div style={{
            padding: '24px',
            animation: 'slideUp 0.35s ease 0.25s both',
          }}>
            <button
              type="button"
              onClick={() => navigate('/scan/results')}
              style={{
                width: '100%', padding: 15, borderRadius: 10,
                background: T.gold, color: '#0A0A0A',
                fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                fontFamily: T.font, letterSpacing: '0.01em', marginBottom: 8, display: 'block',
              }}
            >
              Open full report
            </button>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              style={{
                width: '100%', padding: 14, borderRadius: 10,
                background: 'none', color: T.text2,
                border: `1px solid ${T.border2}`,
                fontSize: 13, fontWeight: 400, cursor: 'pointer',
                fontFamily: T.font, letterSpacing: '0.01em', display: 'block',
                marginBottom: 24,
              }}
            >
              Take another scan
            </button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Progress;
