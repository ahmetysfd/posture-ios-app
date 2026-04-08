import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DetectedReasonsSection from '../components/DetectedReasonsSection';
import Layout from '../components/Layout';
import ScanAnalysisView from '../components/ScanAnalysisView';
import SwapFlowModal from '../components/SwapFlowModal';
import { postureProblems, type PostureProblem as AppPostureProblem } from '../data/postureData';
import {
  type PostureReport,
} from '../services/PostureAnalysisEngine';
import { type ScanReport } from '../services/PostureAnalysisEngineV2';
import {
  getDailyStats,
  getMonthlyCompletionCount,
  loadDailyProgram,
  loadProgressLog,
  replaceExercise,
  updateExerciseParams,
  isStrengthExercise,
  DURATION_PRESETS,
  REPS_PRESETS,
  getExerciseDaysCompleted,
  getUpgradeSuggestion,
  hasUpgradeBeenOffered,
  markUpgradeOffered,
  type DailyExercise,
  type StoredDailyProgram,
} from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';
import type { Exercise } from '../data/postureData';

const T = {
  bg: '#09090B', surface: '#141416', surface2: '#1A1A1E',
  border: 'rgba(255,255,255,0.05)', border2: 'rgba(255,255,255,0.10)',
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


const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 15, letterSpacing: '-0.01em', color: T.text, fontWeight: 500, marginBottom: 14, fontFamily: T.font }}>{children}</div>
);
const Divider = () => (
  <div style={{ height: '1px', background: T.border, margin: '28px 24px 0' }} />
);

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CompletionCalendar: React.FC = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = now.toISOString().slice(0, 10);
  const log = loadProgressLog();
  const completedDates = new Set(log.filter(e => e.fullyCompleted).map(e => e.date));

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: T.text2, marginBottom: 12, fontFamily: T.font }}>{monthLabel}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 500, color: T.text3, textAlign: 'center', fontFamily: T.font }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const done = completedDates.has(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: done ? 700 : 400,
              fontFamily: T.font,
              background: done ? T.gold : isToday ? T.surface2 : 'transparent',
              color: done ? '#0A0A0A' : isToday ? T.text : T.text3,
              border: isToday && !done ? `1px solid ${T.border2}` : 'none',
            }}>
              {done ? '🔥' : day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const stepperBtn = (disabled: boolean): React.CSSProperties => ({
  width: 26, height: 26, borderRadius: 6, border: `1px solid ${disabled ? 'rgba(255,255,255,0.04)' : T.border2}`,
  background: 'transparent', color: disabled ? T.text3 : T.text,
  fontSize: 16, lineHeight: 1, cursor: disabled ? 'default' : 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: T.font, opacity: disabled ? 0.3 : 1, flexShrink: 0,
});

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<PostureReport | null>(null);
  const [latestScan, setLatestScan] = useState<ScanReport | null>(null);
  const [scanCaptures, setScanCaptures] = useState<{ front: string; side: string; back: string } | null>(null);
  const [programExpanded, setProgramExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [upgradePopup, setUpgradePopup] = useState<{ exercise: DailyExercise; suggestion: Exercise | null } | null>(null);
  const [localProgram, setLocalProgram] = useState<StoredDailyProgram | null>(() => loadDailyProgram());
  const programSectionRef = useRef<HTMLDivElement | null>(null);
  const { streak, completedToday } = getDailyStats();
  const monthlyCount = getMonthlyCompletionCount();
  const profile = loadUserProfile();

  const sortedExercises = localProgram
    ? [...localProgram.exercises].sort((a, b) =>
        (a.targetProblemLabels[0] ?? '').localeCompare(b.targetProblemLabels[0] ?? ''))
    : [];

  function handleExerciseReplace(newExercise: Exercise) {
    if (!swapTarget || !localProgram) return;
    const updated = replaceExercise(localProgram, swapTarget, newExercise);
    setLocalProgram(updated);
  }

  function handleParamChange(
    exerciseId: string,
    params: { sets?: number; duration?: number; displayReps?: string },
  ) {
    if (!localProgram) return;
    setLocalProgram(updateExerciseParams(localProgram, exerciseId, params));
  }

  useEffect(() => {
    const raw = sessionStorage.getItem('postureReport') ?? localStorage.getItem('posturefix_scan_report');
    try {
      setReport(raw ? JSON.parse(raw) as PostureReport : null);
    } catch {
      setReport(null);
    }

    const rawScan = sessionStorage.getItem('postureScanV2') ?? localStorage.getItem('posturefix_scan_v2');
    try {
      setLatestScan(rawScan ? JSON.parse(rawScan) as ScanReport : null);
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

  // Check for 21-day milestones when the Daily Program section is expanded
  useEffect(() => {
    if (!programExpanded || !localProgram || upgradePopup) return;
    for (const ex of localProgram.exercises) {
      if (getExerciseDaysCompleted(ex.name) >= 21 && !hasUpgradeBeenOffered(ex.name)) {
        const suggestion = ex.difficulty === 'hard' ? null : getUpgradeSuggestion(ex, localProgram);
        setUpgradePopup({ exercise: ex, suggestion });
        return;
      }
    }
  }, [programExpanded, localProgram]);

  useEffect(() => {
    const shouldOpenEditor = Boolean((location.state as { openProgramEditor?: boolean } | null)?.openProgramEditor);
    if (!shouldOpenEditor || !localProgram) return;

    setProgramExpanded(true);
    setEditMode(true);

    requestAnimationFrame(() => {
      programSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.key, location.state, localProgram]);

  const detectedProblemCards: AppPostureProblem[] = report
    ? report.problems
        .map(problem => postureProblems.find(item => item.id === problem.id))
        .filter((item): item is AppPostureProblem => Boolean(item))
        .filter((item, index, arr) => arr.findIndex(other => other.id === item.id) === index)
    : [];
  const lastScanLabel = report
    ? new Date(report.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Layout>
      <div style={{ padding: '52px 24px 8px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 4, fontFamily: T.font }}>Body Scan</div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.04em', fontFamily: T.font, lineHeight: 1 }}>
              <span>Posture</span>
              <span style={{ color: T.gold }}>Fix</span>
            </h1>
          </div>
          {lastScanLabel && (
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <div style={{ fontSize: 10, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: T.font }}>Latest scan</div>
              <div style={{ fontSize: 11, color: T.text2, marginTop: 4, fontFamily: T.font }}>{lastScanLabel}</div>
            </div>
          )}
        </div>
      </div>

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
          />
        </div>
      )}

      <div style={{ padding: '20px 24px 0', animation: 'slideUp 0.35s ease 0.02s both' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)', borderRadius: 24, padding: 18, border: `1px solid ${T.border}`, marginBottom: 16 }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(249,115,22,0.08)', filter: 'blur(36px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            {/* Left — streak */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 6, fontFamily: T.font }}>Streak</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>🔥</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: streak > 0 ? T.gold : T.text, fontFamily: T.font, letterSpacing: '-0.02em' }}>{streak}</span>
                <span style={{ fontSize: 13, color: T.text3, fontFamily: T.font }}>days</span>
              </div>
            </div>
            {/* Right — monthly completion count */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.text3, fontWeight: 700, marginBottom: 6, fontFamily: T.font }}>This month</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: monthlyCount > 0 ? T.green : T.text, fontFamily: T.font, letterSpacing: '-0.02em' }}>{monthlyCount}</span>
                <span style={{ fontSize: 13, color: T.text3, fontFamily: T.font }}>days</span>
              </div>
            </div>
          </div>
          <CompletionCalendar />
        </div>
      </div>

      {/* ── Daily Program (collapsible, lives below monthly tracker) ── */}
      {localProgram && sortedExercises.length > 0 && (
        <div ref={programSectionRef} style={{ padding: '0 24px', animation: 'slideUp 0.35s ease 0.06s both' }}>

          {/* Collapsible header */}
          <button
            type="button"
            onClick={() => { setProgramExpanded(v => !v); if (editMode) setEditMode(false); }}
            style={{
              width: '100%', background: T.surface, border: `1px solid ${T.border2}`,
              borderRadius: programExpanded ? '12px 12px 0 0' : 12,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', fontFamily: T.font, transition: 'border-radius 0.2s ease',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, letterSpacing: '-0.01em' }}>
                Daily Program
              </div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontFamily: T.font }}>
                {localProgram.totalDurationMin} min · {sortedExercises.length} exercises
              </div>
            </div>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.3)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, transform: programExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Expanded body */}
          {programExpanded && (
            <div style={{
              background: T.surface, border: `1px solid ${T.border2}`,
              borderTop: `1px solid ${T.border}`, borderRadius: '0 0 12px 12px',
              padding: '12px 14px',
            }}>
              {/* Edit toggle row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditMode(v => !v)}
                  style={{
                    background: editMode ? 'rgba(217,184,76,0.12)' : 'transparent',
                    border: `1px solid ${editMode ? T.gold : T.border2}`,
                    borderRadius: 8, padding: '4px 12px',
                    fontSize: 12, fontWeight: 500,
                    color: editMode ? T.gold : T.text3,
                    cursor: 'pointer', fontFamily: T.font,
                  }}
                >
                  {editMode ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* Exercise cards */}
              {sortedExercises.map(ex => {
                const diffLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard';
                const isStrength = isStrengthExercise(ex.name);
                const durIdx = DURATION_PRESETS.indexOf(ex.duration);
                const repIdx = REPS_PRESETS.indexOf(ex.displayReps);

                return (
                  <div
                    key={ex.id}
                    style={{
                      border: `1px solid ${editMode ? T.border2 : T.border}`,
                      borderRadius: 10, padding: '12px 14px', marginBottom: 8,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {/* Name row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.font,
                          textDecoration: 'none',
                          letterSpacing: '-0.01em', lineHeight: 1.3,
                        }}>
                          {ex.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>{ex.displayReps}</span>
                          <span style={{ fontSize: 10, color: T.text3 }}>·</span>
                          <span style={{ fontSize: 12, color: T.text3, fontFamily: T.font }}>{diffLabel}</span>
                        </div>
                        {/* 21-day progress badge */}
                        {(() => {
                          const days = getExerciseDaysCompleted(ex.name);
                          const capped = Math.min(days, 21);
                          const done = capped >= 21;
                          return (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: done ? T.gold : T.text3, fontFamily: T.font, fontWeight: done ? 600 : 400 }}>
                                  {capped} / 21 days{done ? ' ✓' : ''}
                                </span>
                              </div>
                              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(capped / 21) * 100}%`, background: done ? T.gold : 'rgba(217,184,76,0.4)', borderRadius: 1, transition: 'width 0.3s ease' }} />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      {/* Right slot: swap icon only visible in edit mode */}
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => setSwapTarget(ex.id)}
                          title="Swap exercise"
                          style={{
                            background: 'transparent', border: `1px solid ${T.border2}`,
                            borderRadius: 7, padding: '4px 8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                            stroke={T.text3} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <span style={{ fontSize: 11, color: T.text3, fontFamily: T.font }}>Swap</span>
                        </button>
                      )}
                    </div>

                    {/* Edit controls row */}
                    {editMode && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        marginTop: 12, paddingTop: 10,
                        borderTop: `1px solid ${T.border}`,
                        flexWrap: 'wrap',
                      }}>
                        {/* Sets stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, color: T.text3, fontFamily: T.font, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sets</span>
                          <button type="button" onClick={() => ex.sets > 1 && handleParamChange(ex.id, { sets: ex.sets - 1 })}
                            style={stepperBtn(ex.sets <= 1)}>−</button>
                          <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.font, minWidth: 14, textAlign: 'center' }}>{ex.sets}</span>
                          <button type="button" onClick={() => ex.sets < 4 && handleParamChange(ex.id, { sets: ex.sets + 1 })}
                            style={stepperBtn(ex.sets >= 4)}>+</button>
                        </div>

                        {/* Duration or Reps */}
                        {isStrength ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: T.text3, fontFamily: T.font, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Reps</span>
                            <button type="button"
                              onClick={() => {
                                const prev = repIdx <= 0 ? REPS_PRESETS.length - 1 : repIdx - 1;
                                handleParamChange(ex.id, { displayReps: REPS_PRESETS[prev] });
                              }}
                              style={stepperBtn(false)}>‹</button>
                            <span style={{ fontSize: 12, fontWeight: 500, color: T.text, fontFamily: T.font, minWidth: 70, textAlign: 'center' }}>
                              {ex.displayReps}
                            </span>
                            <button type="button"
                              onClick={() => {
                                const next = repIdx >= REPS_PRESETS.length - 1 ? 0 : repIdx + 1;
                                handleParamChange(ex.id, { displayReps: REPS_PRESETS[next] });
                              }}
                              style={stepperBtn(false)}>›</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: T.text3, fontFamily: T.font, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Duration</span>
                            <button type="button"
                              onClick={() => durIdx > 0 && handleParamChange(ex.id, { duration: DURATION_PRESETS[durIdx - 1] })}
                              style={stepperBtn(durIdx <= 0)}>−</button>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: T.font, minWidth: 32, textAlign: 'center' }}>{ex.duration}s</span>
                            <button type="button"
                              onClick={() => durIdx < DURATION_PRESETS.length - 1 && handleParamChange(ex.id, { duration: DURATION_PRESETS[durIdx + 1] })}
                              style={stepperBtn(durIdx >= DURATION_PRESETS.length - 1)}>+</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Targets */}
                    {ex.targetProblemLabels.length > 0 && (
                      <>
                        <div style={{ height: 1, background: T.border, margin: '10px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: T.text3, fontFamily: T.font, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                            Targets
                          </span>
                          {ex.targetProblemLabels.map(label => (
                            <span key={label} style={{
                              fontSize: 11, fontWeight: 500, fontFamily: T.font,
                              color: T.gold, background: 'rgba(217,184,76,0.1)',
                              padding: '3px 8px', borderRadius: 6,
                            }}>
                              {label}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Swap flow modal ── */}
      {swapTarget && localProgram && (
        <SwapFlowModal
          swapExerciseId={swapTarget}
          program={localProgram}
          detectedProblemIds={profile?.detectedProblems ?? []}
          hasEquipment={profile?.hasEquipment !== false}
          onReplace={handleExerciseReplace}
          onClose={() => setSwapTarget(null)}
        />
      )}

      {/* ── 21-day milestone popup ── */}
      {upgradePopup && (
        <>
          <div
            onClick={() => { markUpgradeOffered(upgradePopup.exercise.name); setUpgradePopup(null); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(2px)' }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
            background: '#1A1A1A', borderRadius: '16px 16px 0 0',
            border: `1px solid ${T.border2}`, borderBottom: 'none',
            padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 0,
          }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: T.border2, borderRadius: 2, margin: '0 auto 20px' }} />

            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ background: 'rgba(217,184,76,0.12)', border: `1px solid rgba(217,184,76,0.3)`, borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.gold, fontFamily: T.font, letterSpacing: '0.04em' }}>21 / 21</span>
              </div>
            </div>

            {/* Heading */}
            <div style={{ fontSize: 20, fontWeight: 600, color: T.text, fontFamily: T.font, letterSpacing: '-0.02em', marginBottom: 6 }}>
              {upgradePopup.exercise.difficulty === 'hard' ? 'You\'ve mastered it.' : 'Ready to level up?'}
            </div>
            <div style={{ fontSize: 13, color: T.text2, fontFamily: T.font, lineHeight: 1.6, marginBottom: 20 }}>
              {upgradePopup.exercise.difficulty === 'hard'
                ? `You've completed ${upgradePopup.exercise.name} for 21 days straight. That's a real habit — keep it going.`
                : `You've built a solid 21-day habit with ${upgradePopup.exercise.name}. Time to challenge yourself with the next level.`}
            </div>

            {/* Suggestion card (non-Hard only) */}
            {upgradePopup.suggestion && (
              <div style={{ background: T.surface, border: `1px solid ${T.border2}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.text3, fontFamily: T.font, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Suggested upgrade</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{upgradePopup.suggestion.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.font, letterSpacing: '-0.01em' }}>{upgradePopup.suggestion.name}</div>
                    <div style={{ fontSize: 12, color: T.text3, fontFamily: T.font, marginTop: 3 }}>
                      {upgradePopup.suggestion.duration}s · {upgradePopup.suggestion.difficulty === 'medium' ? 'Medium' : 'Hard'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upgradePopup.suggestion ? (
                <>
                  <button type="button"
                    onClick={() => {
                      if (!localProgram || !upgradePopup.suggestion) return;
                      const updated = replaceExercise(localProgram, upgradePopup.exercise.id, upgradePopup.suggestion);
                      setLocalProgram(updated);
                      markUpgradeOffered(upgradePopup.exercise.name);
                      setUpgradePopup(null);
                    }}
                    style={{ width: '100%', padding: 14, borderRadius: 10, background: T.gold, color: '#0A0A0A', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: T.font }}>
                    Upgrade exercise
                  </button>
                  <button type="button"
                    onClick={() => { markUpgradeOffered(upgradePopup.exercise.name); setUpgradePopup(null); }}
                    style={{ width: '100%', padding: 14, borderRadius: 10, background: 'transparent', color: T.text3, fontSize: 13, fontWeight: 400, border: `1px solid ${T.border2}`, cursor: 'pointer', fontFamily: T.font }}>
                    Keep current exercise
                  </button>
                </>
              ) : (
                <button type="button"
                  onClick={() => { markUpgradeOffered(upgradePopup.exercise.name); setUpgradePopup(null); }}
                  style={{ width: '100%', padding: 14, borderRadius: 10, background: T.gold, color: '#0A0A0A', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: T.font }}>
                  Keep it up
                </button>
              )}
            </div>
          </div>
        </>
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
          <div style={{ padding: '20px 24px 0', animation: 'slideUp 0.35s ease 0.1s both' }}>
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

          <Divider />


          <div style={{ padding: '24px 24px 0', animation: 'slideUp 0.35s ease 0.18s both' }}>
            <DetectedReasonsSection report={report} maxCards={4} />
          </div>

          <div style={{ padding: '24px', animation: 'slideUp 0.35s ease 0.25s both' }}>
            <button type="button" onClick={() => navigate('/scan')} style={{ width: '100%', padding: 15, borderRadius: 18, background: T.surface, color: T.text2, border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font, display: 'block', marginBottom: 24 }}>Take another scan</button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Progress;
