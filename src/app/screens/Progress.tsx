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
import {
  loadUserProfile,
  LEVEL_INFO,
  type PostureLevel,
} from '../services/UserProfile';

const T = {
  bg: '#0A0A0A', surface: '#141414', surface2: '#1A1A1A',
  border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.10)',
  text: '#EDEDED', text2: 'rgba(160,160,155,1)', text3: 'rgba(102,102,100,1)',
  gold: '#D9B84C', orange: '#E68C33', green: '#3DA878', blue: '#5BA8D9',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const severityColor = (s: string) =>
  s === 'severe' ? T.orange : s === 'moderate' ? T.gold : T.green;

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 15, letterSpacing: '-0.01em', color: T.text, fontWeight: 500, marginBottom: 14, fontFamily: T.font }}>{children}</div>
);
const Divider = () => (
  <div style={{ height: '1px', background: T.border, margin: '28px 24px 0' }} />
);

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<PostureReport | null>(null);
  const [level, setLevel] = useState<PostureLevel>('beginner');

  useEffect(() => {
    const raw = sessionStorage.getItem('postureReport');
    if (!raw) return;
    try { setReport(JSON.parse(raw)); } catch { setReport(null); }
    const profile = loadUserProfile();
    if (profile) setLevel(profile.postureLevel);
  }, []);

  const highlighted = report ? getHighlightedProblems(report.problems, 4) : [];
  const lastScanLabel = report
    ? new Date(report.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;
  const stretchPlan = report ? deriveStretchPrescription(report) : null;
  const levelInfo = LEVEL_INFO[level];

  return (
    <Layout>
      <div style={{ padding: '56px 24px 20px', borderBottom: `1px solid ${T.border}`, animation: 'fadeIn 0.4s ease' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.text3, fontWeight: 500, marginBottom: 6, fontFamily: T.font }}>Body scan</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: T.text, letterSpacing: '-0.02em', fontFamily: T.font }}>Progress</h1>
          {lastScanLabel && <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>{lastScanLabel}</span>}
        </div>
      </div>

      {!report ? (
        <div style={{ padding: '32px 24px', animation: 'slideUp 0.4s ease both' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.text3, fontWeight: 500, marginBottom: 16, fontFamily: T.font }}>No scan yet</p>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: 24, fontFamily: T.font }}>Take a front, side, and back posture scan to discover your posture level and get a personalized plan.</p>
          <button type="button" onClick={() => navigate('/scan')} style={{ width: '100%', padding: 15, borderRadius: 10, background: T.gold, color: '#0A0A0A', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: T.font }}>Start body scan</button>
        </div>
      ) : (
        <>
          <div style={{ padding: '20px 24px', animation: 'slideUp 0.35s ease 0.05s both' }}>
            <div style={{ background: T.surface, borderRadius: 14, padding: 18, border: `1px solid ${T.border2}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: levelInfo.color, padding: '4px 10px', borderRadius: 8, background: levelInfo.bgColor, display: 'inline-block', marginBottom: 10 }}>{levelInfo.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: T.text, marginBottom: 4 }}>{levelInfo.tagline}</div>
              <p style={{ fontSize: 12, color: T.text2, lineHeight: 1.55 }}>{levelInfo.description}</p>
              <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                {(['beginner', 'intermediate', 'advanced'] as PostureLevel[]).map(l => (
                  <div key={l} style={{ flex: 1, height: 5, borderRadius: 3, background: l === level ? (l === 'beginner' ? T.orange : l === 'intermediate' ? T.gold : T.green) : 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: T.text3 }}>Beginner</span>
                <span style={{ fontSize: 9, color: T.text3 }}>Intermediate</span>
                <span style={{ fontSize: 9, color: T.text3 }}>Advanced</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 24px 0', animation: 'slideUp 0.35s ease 0.1s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Label>Body map</Label>
              <span style={{ fontSize: 12, color: T.text3, marginBottom: 14, fontFamily: T.font }}>Front · Side · Back</span>
            </div>
            <ProgressBodyImageMap findings={report.problems} maxFindings={4} />
          </div>

          <Divider />

          {stretchPlan && (
            <div style={{ padding: '24px 24px 0', animation: 'slideUp 0.35s ease 0.15s both' }}>
              <Label>Daily stretch target</Label>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 16, fontFamily: T.font }}>
                {stretchPlan.summary}{' '}
                {stretchPlan.sessionsPerDay === 2
                  ? `Try ~${stretchPlan.minutesPerSession[0]} min + ~${stretchPlan.minutesPerSession[1]} min on most days.`
                  : `One ~${stretchPlan.minutesPerSession[0]} min session most days is enough.`}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: T.border, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ background: T.surface, padding: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.text3, fontWeight: 500, marginBottom: 6, fontFamily: T.font }}>Daily total</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: T.blue, letterSpacing: '-0.02em', fontFamily: T.font }}>{stretchPlan.dailyMinutesTotal} min</div>
                </div>
                <div style={{ background: T.surface, padding: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.text3, fontWeight: 500, marginBottom: 6, fontFamily: T.font }}>Timeline</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.4, marginTop: 2, fontFamily: T.font }}>~{stretchPlan.habitsTimelineWeeks.min}–{stretchPlan.habitsTimelineWeeks.max} weeks</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: T.text3, lineHeight: 1.55, paddingTop: 12, borderTop: `1px solid ${T.border}`, fontFamily: T.font }}>{stretchPlan.disclaimer}</p>
            </div>
          )}

          <Divider />

          <div style={{ padding: '24px 24px 0', animation: 'slideUp 0.35s ease 0.2s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Label>Detected issues</Label>
              {highlighted.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 500, color: T.gold, background: 'rgba(217,184,76,0.1)', padding: '2px 8px', borderRadius: 10, fontFamily: T.font, marginBottom: 14 }}>{highlighted.length}</span>
              )}
            </div>
            {highlighted.length > 0 ? highlighted.map(problem => {
              const color = severityColor(problem.severity);
              return (
                <div key={problem.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: T.surface, borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ width: 3, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.text, fontFamily: T.font, marginBottom: 2 }}>{problem.mapLabel ?? BODY_REGION_LABELS[problem.bodyRegion]}</div>
                    <div style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>{problem.severity.charAt(0).toUpperCase() + problem.severity.slice(1)} · {VIEW_LABELS[problem.dominantView]}</div>
                  </div>
                </div>
              );
            }) : (
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, fontFamily: T.font }}>No major body-region issues were flagged in the latest scan.</p>
            )}
          </div>

          <div style={{ padding: '24px', animation: 'slideUp 0.35s ease 0.25s both' }}>
            <button type="button" onClick={() => navigate('/scan')} style={{ width: '100%', padding: 14, borderRadius: 10, background: 'none', color: T.text2, border: `1px solid ${T.border2}`, fontSize: 13, fontWeight: 400, cursor: 'pointer', fontFamily: T.font, display: 'block', marginBottom: 24 }}>Take another scan</button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Progress;
