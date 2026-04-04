import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostureBodyMap from '../components/PostureBodyMap';
import {
  BODY_REGION_LABELS,
  type PostureReport,
  generatePersonalizedProgram,
  getHighlightedProblems,
  SCAN_TO_APP_PROBLEM,
  VIEW_LABELS,
} from '../services/PostureAnalysisEngine';

const AnalysisResultScreen: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<PostureReport | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('postureReport');
    if (raw) setReport(JSON.parse(raw));
    else navigate('/scan');
  }, [navigate]);

  if (!report) return null;

  const detected = report.problems.filter(p => p.score >= 15);
  const good = report.problems.filter(p => p.score < 15);
  const highlighted = getHighlightedProblems(report.problems, 5);
  const stableGoodRegions = [...new Map(
    good
      .sort((a, b) => b.displayPercent - a.displayPercent)
      .map(problem => [problem.bodyRegion, problem]),
  ).values()];
  const scoreColor = report.overallScore >= 70 ? 'var(--color-accent)'
    : report.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  const label = report.overallScore >= 70 ? 'Looking solid' : report.overallScore >= 40 ? 'Room to improve' : 'Needs attention';

  const severityColor = (s: string) =>
    s === 'severe' ? 'var(--color-danger)' : s === 'moderate' ? 'var(--color-warning)' : s === 'mild' ? 'var(--color-primary-light)' : 'var(--color-accent)';
  const severityBg = (s: string) =>
    s === 'severe' ? 'rgba(239,68,68,0.12)' : s === 'moderate' ? 'rgba(251,191,36,0.12)' : s === 'mild' ? 'rgba(229,53,53,0.1)' : 'rgba(52,211,153,0.12)';

  const openProgram = () => {
    const program = generatePersonalizedProgram(report);
    sessionStorage.setItem('personalizedProgram', JSON.stringify(program));
    navigate('/scan/program');
  };

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: 'var(--color-bg)', fontFamily: 'var(--font-body)',
    }}>
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate('/scan')}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Report</h1>
      </div>

      <div style={{ padding: '0 20px 32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(229,53,53,0.16), rgba(255,255,255,0.03))',
          borderRadius: 22,
          padding: 22,
          border: '1px solid rgba(229,53,53,0.18)',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 18 }}>
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: scoreColor,
                padding: '4px 10px', borderRadius: 8,
                background: 'rgba(0,0,0,0.12)',
                border: `1px solid ${scoreColor}`,
                marginBottom: 10, display: 'inline-block',
              }}>{label}</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                Overall posture score
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>
                {detected.length === 0
                  ? 'No major posture flags were highlighted from this three-angle screen.'
                  : `${detected.length} body area${detected.length === 1 ? '' : 's'} need the most attention in your latest scan.`}
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{report.overallScore}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 4 }}>/100</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
            }}>
              {report.viewsCombined && report.viewsCombined.length > 1
                ? `Views: ${report.viewsCombined.map(view => VIEW_LABELS[view]).join(' + ')}`
                : report.viewType === 'side'
                  ? 'View: Side'
                  : 'View: Front'}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--color-text)',
            }}>
              AI posture screen, not a diagnosis
            </span>
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 22,
          padding: 20,
          border: '1px solid var(--color-border)',
          marginBottom: 22,
        }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Body health map</h3>
            <p style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.5 }}>
              Percentages show <strong>healthier alignment</strong> by region. Lower numbers mean that area showed more deviation in the scan.
            </p>
          </div>
          <PostureBodyMap findings={report.problems} maxFindings={5} />
        </div>

        {highlighted.length > 0 && (
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 18,
            padding: 16,
            border: '1px solid var(--color-border)',
            marginBottom: 22,
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Primary summary
            </h3>
            {highlighted.map((problem, index) => (
              <div key={problem.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 0',
                borderBottom: index < highlighted.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                    {problem.mapLabel ?? BODY_REGION_LABELS[problem.bodyRegion]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 3 }}>
                    {problem.confidenceLabel}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{problem.displayPercent}%</div>
              </div>
            ))}
          </div>
        )}

        {detected.length > 0 && (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Findings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
              {detected.map(p => (
                <div key={p.id} style={{
                  background: 'var(--color-surface)',
                  borderRadius: 18,
                  padding: 16,
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-tert)',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {BODY_REGION_LABELS[p.bodyRegion]}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                          background: severityBg(p.severity),
                          color: severityColor(p.severity),
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>{p.severity}</span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{p.name}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>{p.displayPercent}%</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-tert)' }}>body health</div>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--color-surface-elevated)', overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', width: `${p.displayPercent}%`, background: severityColor(p.severity), borderRadius: 3 }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.5, marginBottom: 10 }}>
                    {p.confidenceLabel} Dominant view: {VIEW_LABELS[p.dominantView]}.
                  </p>
                  {SCAN_TO_APP_PROBLEM[p.id] && (
                    <button
                      type="button"
                      onClick={() => navigate(`/problem/${SCAN_TO_APP_PROBLEM[p.id]}`)}
                      style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--color-primary)',
                        background: 'rgba(229,53,53,0.1)',
                        border: '1px solid rgba(229,53,53,0.25)',
                        borderRadius: 10,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        marginBottom: 10,
                        width: '100%',
                      }}
                    >
                      Open matching routine in app →
                    </button>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.55 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {stableGoodRegions.length > 0 && (
          <>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Healthier regions
            </h3>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 18,
              padding: 14,
              border: '1px solid var(--color-border)',
              marginBottom: 22,
            }}>
              {stableGoodRegions.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: i < stableGoodRegions.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)' }} />
                  <span style={{ fontSize: 13, color: 'var(--color-text-sec)' }}>
                    {BODY_REGION_LABELS[p.bodyRegion]} · {p.displayPercent}% health
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Suggestions
        </h3>
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 18,
          padding: 16,
          border: '1px solid var(--color-border)',
          marginBottom: 20,
        }}>
          {report.recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < report.recommendations.length - 1 ? 10 : 0 }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>•</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>{rec}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={openProgram}
          style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: 'var(--color-primary)', color: '#fff', fontSize: 16, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-button)',
            marginBottom: 10,
          }}
        >
          Build short program
        </button>
        <button
          type="button"
          onClick={() => navigate('/scan')}
          style={{
            width: '100%', padding: 14, borderRadius: 18,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: 14, fontWeight: 600,
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}
        >
          New scan
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultScreen;
