import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import ScanAnalysisView from '../components/ScanAnalysisView';
import DailyProgramLevelCard from '../components/DailyProgramLevelCard';
import { postureProblems, type PostureProblem as AppPostureProblem } from '../data/postureData';
import {
  type PostureReport,
} from '../services/PostureAnalysisEngine';
import { type ScanReport } from '../services/PostureAnalysisEngineV2';
import {
  loadLevelState,
  initLevelSystem,
} from '../services/DailyProgram';

const T = {
  bg: '#09090B', surface: '#141416', surface2: '#1A1A1E',
  border: 'rgba(255,255,255,0.05)',
  text: '#FFFFFF', text2: 'rgba(161,161,170,1)', text3: 'rgba(113,113,122,1)',
  gold: '#F97316', orange: '#FB923C', green: '#22C55E', blue: '#5BA8D9',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const CARD_ACCENTS: Record<string, { glow: string; border: string; gradient: string }> = {
  'forward-head': { glow: 'rgba(249,115,22,0.16)', border: 'rgba(249,115,22,0.22)', gradient: 'linear-gradient(180deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0) 100%)' },
  'winging-scapula': { glow: 'rgba(244,63,94,0.16)', border: 'rgba(244,63,94,0.22)', gradient: 'linear-gradient(180deg, rgba(244,63,94,0.12) 0%, rgba(244,63,94,0) 100%)' },
  'anterior-pelvic': { glow: 'rgba(251,113,133,0.16)', border: 'rgba(251,113,133,0.22)', gradient: 'linear-gradient(180deg, rgba(251,113,133,0.12) 0%, rgba(251,113,133,0) 100%)' },
  'rounded-shoulders': { glow: 'rgba(59,130,246,0.16)', border: 'rgba(59,130,246,0.22)', gradient: 'linear-gradient(180deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 100%)' },
  kyphosis: { glow: 'rgba(168,85,247,0.16)', border: 'rgba(168,85,247,0.22)', gradient: 'linear-gradient(180deg, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0) 100%)' },
  'uneven-shoulders': { glow: 'rgba(245,158,11,0.16)', border: 'rgba(245,158,11,0.22)', gradient: 'linear-gradient(180deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0) 100%)' },
};


const Progress: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<PostureReport | null>(null);
  const [latestScan, setLatestScan] = useState<ScanReport | null>(null);
  const [scanCaptures, setScanCaptures] = useState<{ front: string; side: string; back: string } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('postureReport') ?? localStorage.getItem('posturefix_scan_report');
    try {
      setReport(raw ? JSON.parse(raw) as PostureReport : null);
    } catch {
      setReport(null);
    }

    const rawScan = sessionStorage.getItem('postureScanV2') ?? localStorage.getItem('posturefix_scan_v2');
    try {
      const scan = rawScan ? JSON.parse(rawScan) as ScanReport : null;
      setLatestScan(scan);
      // Auto-init level system for existing scans that predate the feature
      if (scan && !loadLevelState()) {
        const riskSummary = {
          high: scan.problems.filter((p: any) => p.riskCategory === 'high').length,
          medium: scan.problems.filter((p: any) => p.riskCategory === 'medium').length,
          low: scan.problems.filter((p: any) => p.riskCategory === 'low').length,
        };
        initLevelSystem(riskSummary);
      }
    } catch {
      setLatestScan(null);
    }

    const rawCaptures = sessionStorage.getItem('scanCaptures') ?? localStorage.getItem('posturefix_scan_captures');
    try {
      setScanCaptures(rawCaptures ? JSON.parse(rawCaptures) as { front: string; side: string; back: string } : null);
    } catch {
      setScanCaptures(null);
    }
  }, [location.pathname, location.key]);

  const detectedProblemCards: AppPostureProblem[] = report
    ? report.problems
        .map(problem => postureProblems.find(item => item.id === problem.id))
        .filter((item): item is AppPostureProblem => Boolean(item))
        .filter((item, index, arr) => arr.findIndex(other => other.id === item.id) === index)
    : [];

  return (
    <Layout>
      <div style={{ padding: '52px 24px 8px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 4, fontFamily: T.font }}>Body Scan</div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.04em', fontFamily: T.font, lineHeight: 1 }}>
              <span>Posture</span>
              <span style={{ color: T.gold }}>Fix</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/scan')}
            style={{
              flexShrink: 0,
              marginTop: 2,
              padding: '10px 14px',
              borderRadius: 14,
              background: T.surface,
              color: T.text2,
              border: `1px solid ${T.border}`,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: T.font,
              whiteSpace: 'nowrap',
            }}
          >
            Take new scan
          </button>
        </div>
      </div>

      {!(latestScan && scanCaptures) && (
        <div style={{ padding: '16px 24px 0', animation: 'slideUp 0.35s ease 0.01s both' }}>
          <DailyProgramLevelCard />
        </div>
      )}

      {latestScan && scanCaptures && (
        <div style={{ padding: '20px 24px 0', animation: 'slideUp 0.35s ease 0.01s both' }}>
          <div style={{ marginBottom: 12, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, fontFamily: T.font }}>
            Latest analysis
          </div>
          <ScanAnalysisView
            report={latestScan}
            photos={scanCaptures}
            keypoints={latestScan.allKeypoints as { front: any[]; side: any[]; back: any[] }}
            onViewDailyPlan={() => navigate('/program')}
            onViewFullReport={() => {}}
            onNewScan={() => navigate('/scan')}
            showFullReportButton={false}
            showDailyPlanButton={false}
            showNewScanButton={false}
          />
        </div>
      )}

      {!report ? (
        <div style={{ padding: '0 24px 24px', animation: 'slideUp 0.4s ease both' }}>
          <div style={{ padding: '28px 0 8px' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 16, fontFamily: T.font }}>No scan yet</p>
            <div style={{ background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)', border: `1px solid ${T.border}`, borderRadius: 24, padding: 20, boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)' }}>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, marginBottom: 20, fontFamily: T.font }}>Take a front, side, and back posture scan to discover your posture level and get a personalized plan.</p>
              <button type="button" onClick={() => navigate('/scan')} style={{ width: '100%', padding: 16, borderRadius: 18, background: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)', color: '#FFFFFF', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 24px rgba(249,115,22,0.22)' }}>Start body scan</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '20px 24px 32px', animation: 'slideUp 0.35s ease 0.1s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, fontFamily: T.font }}>
                Detected Problems
              </div>
              <span style={{ fontSize: 10, color: T.text3, fontFamily: T.font, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {detectedProblemCards.length} shown
              </span>
            </div>
            {detectedProblemCards.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {detectedProblemCards.map((problem, index) => {
                  const accent = CARD_ACCENTS[problem.id] ?? CARD_ACCENTS['forward-head'];
                  return (
                    <button
                      key={problem.id}
                      type="button"
                      onClick={() => navigate(`/problem/${problem.id}`)}
                      style={{
                        position: 'relative',
                        aspectRatio: '4 / 5',
                        background: '#141416',
                        border: `1px solid ${T.border}`,
                        borderRadius: 22,
                        padding: 0,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'stretch',
                        justifyContent: 'flex-end',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.26)',
                        animation: `slideUp 0.35s ease ${0.12 + index * 0.04}s both`,
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, background: accent.gradient, opacity: 0.95, pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', width: 130, height: 130, borderRadius: '50%', background: accent.glow, filter: 'blur(28px)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.82) 100%)', zIndex: 1, pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', inset: 0, background: '#080809', zIndex: 0 }} />
                      <img
                        src={problem.cardImage}
                        alt={problem.title}
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: problem.cardImageObjectPosition ?? 'center',
                          transform: 'scale(1.06)',
                          zIndex: 0,
                        }}
                      />
                      <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: '0 12px 12px', textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.font, lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>
                          {problem.title}
                        </div>
                        <div style={{ fontSize: 10, color: T.text2, marginTop: 4, fontFamily: T.font }}>
                          Open exercises and details
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)',
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: 18,
              }}>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, fontFamily: T.font }}>
                  No known posture problem images matched the latest scan yet.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Progress;
