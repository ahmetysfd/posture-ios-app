import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YoutubeModal from '../components/YoutubeModal';
import { toYouTubeEmbed } from '../lib/youtubeEmbed';
import { postureProblems } from '../data/postureData';
import { loadUserProfile } from '../services/UserProfile';
import {
  EXERCISE_REPS, EXERCISE_TEMPO, DEFAULT_TEMPO_BY_PHASE,
  EXERCISE_BILATERAL, EXERCISE_ALTERNATING, EXERCISE_TIMED_BILATERAL, OSCILLATING_EXERCISES,
  EXERCISE_TYPE,
  type DailyExercise,
} from '../services/DailyProgram';
import { recordSetQuality, recordSessionCompletion } from '../services/ProgressionService';
import type { ExerciseDifficulty } from '../services/UserProfile';

const T = {
  bg: '#0A0A0A', surface: '#141414', surfaceEl: '#1E1E1E',
  border: 'rgba(255,255,255,0.06)', border2: 'rgba(255,255,255,0.10)',
  text: '#EDEDED', text2: 'rgba(160,160,155,1)', text3: 'rgba(102,102,100,1)',
  gold: '#D9B84C', accent: '#34D399', primary: '#E53535',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const SET_REST_KEY = 'posturefix_set_rest_sec';
const SET_REST_MIN = 5;
const SET_REST_MAX = 60;
const SET_REST_STEP = 5;
const SET_REST_DEFAULT = 20;
function loadSetRestSec(): number {
  const v = parseInt(localStorage.getItem(SET_REST_KEY) ?? '', 10);
  return isNaN(v) ? SET_REST_DEFAULT : Math.min(SET_REST_MAX, Math.max(SET_REST_MIN, v));
}
function saveSetRestSec(sec: number): void { localStorage.setItem(SET_REST_KEY, String(sec)); }

const EX_REST_KEY = 'posturefix_ex_rest_sec';
const EX_REST_MIN = 5;
const EX_REST_MAX = 120;
const EX_REST_STEP = 5;
const EX_REST_DEFAULT = 10;
function loadExRestSec(): number {
  const v = parseInt(localStorage.getItem(EX_REST_KEY) ?? '', 10);
  return isNaN(v) ? EX_REST_DEFAULT : Math.min(EX_REST_MAX, Math.max(EX_REST_MIN, v));
}
function saveExRestSec(sec: number): void { localStorage.setItem(EX_REST_KEY, String(sec)); }

/** Convert a raw postureData Exercise into DailyExercise format for this flow. */
function toDaily(ex: { id: string; name: string; emoji?: string; duration: number; difficulty?: string; instructions: string[]; youtubeUrl?: string; requiresEquipment?: boolean }, problemId: string, problemTitle: string): DailyExercise {
  const reps = EXERCISE_REPS[ex.name];
  const diff = (ex.difficulty as ExerciseDifficulty) ?? 'beginner';
  return {
    id: ex.id,
    name: ex.name,
    emoji: ex.emoji ?? '💪',
    duration: ex.duration,
    sets: 1,
    displayReps: reps != null ? `${reps} reps` : `${ex.duration}s`,
    reps,
    difficulty: diff,
    type: EXERCISE_TYPE[ex.name] ?? 'activation',
    targetProblemIds: [problemId],
    targetProblemLabels: [problemTitle],
    postureTypes: [problemTitle],
    instructions: ex.instructions,
    youtubeUrl: ex.youtubeUrl,
    requiresEquipment: ex.requiresEquipment ?? false,
    completed: false,
  };
}

const ExerciseFlow: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();

  const [exercises] = useState<DailyExercise[]>(() => {
    const problem = postureProblems.find(p => p.id === problemId);
    if (!problem) return [];
    const userDiff = loadUserProfile()?.exerciseDifficulty ?? 'beginner';
    return problem.exerciseList
      .filter(e => !e.difficulty || e.difficulty === userDiff)
      .map(e => toDaily(e, problem.id, problem.title));
  });

  const [exIdx, setExIdx] = useState(0);
  const [phase, setPhase] = useState<'active' | 'set-rest' | 'rest'>('active');
  const [timeLeft, setTimeLeft] = useState(() => exercises[0]?.duration ?? 0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [waitingToStart, setWaitingToStart] = useState(true);
  const [setRestSec, setSetRestSec] = useState(() => loadSetRestSec());
  const [exRestSec, setExRestSec] = useState(() => loadExRestSec());
  const [ytModal, setYtModal] = useState<{ url: string; title: string } | null>(null);

  const [tempoPhase, setTempoPhase] = useState(0);
  const [tempoProgress, setTempoProgress] = useState(0);
  const [sideChangeFired, setSideChangeFired] = useState(false);
  const [showSideChange, setShowSideChange] = useState(false);
  const [pendingQuality, setPendingQuality] = useState<number | null>(null);
  const [oscPulse, setOscPulse] = useState(false);
  const oscTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceRepRef = useRef<() => void>(() => {});
  const [repsDone, setRepsDone] = useState(false);
  const [restReady, setRestReady] = useState(false);

  const ex = exercises[exIdx];
  const targetReps: number | undefined = ex ? (ex.reps ?? EXERCISE_REPS[ex.name]) : undefined;
  const isRepBased = !!targetReps;
  const total = exercises.length;
  const overallProgress = total > 0 ? (exIdx / total) * 100 : 0;
  const circ = 2 * Math.PI * 45;

  const tempoStr = ex ? (EXERCISE_TEMPO[ex.name] ?? DEFAULT_TEMPO_BY_PHASE[ex.type] ?? '2-1-2') : '2-1-2';
  const tempoParts = useMemo(() => tempoStr.split('-').map(Number), [tempoStr]);
  const tempoLabels = ['Contract', 'Hold', 'Release'];
  const tempoColors = [T.gold, T.accent, T.text2];

  const bilateralRepsPerSide = ex ? (EXERCISE_BILATERAL[ex.name] ?? null) : null;
  const isBlockedBilateral = bilateralRepsPerSide !== null;
  const isAlternating = ex ? EXERCISE_ALTERNATING.has(ex.name) : false;
  const isBilateral = isBlockedBilateral || isAlternating;
  const currentSide = isAlternating
    ? (currentRep % 2 === 0 ? 1 : 2)
    : (isBlockedBilateral && targetReps && currentRep >= (targetReps / 2) ? 2 : 1);

  const oscIntervalMs = ex ? (OSCILLATING_EXERCISES[ex.name] ?? null) : null;
  const isTimedBilateral = ex ? EXERCISE_TIMED_BILATERAL.has(ex.name) : false;
  const timedSide = currentSet % 2 === 1 ? 'Left' : 'Right';

  useEffect(() => {
    if (exercises.length === 0) navigate(`/completion/${problemId}`);
  }, [exercises, navigate, problemId]);

  useEffect(() => {
    const newEx = exercises[exIdx];
    if (newEx) {
      setTimeLeft(newEx.duration);
      setCurrentSet(1);
      setCurrentRep(0);
      setPhase('active');
      setPaused(false);
      setWaitingToStart(true);
      setTempoPhase(0);
      setTempoProgress(0);
      setSideChangeFired(false);
      setShowSideChange(false);
      setPendingQuality(null);
      setRepsDone(false);
      setRestReady(false);
    }
  }, [exIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishEx = useCallback(() => {
    if (!ex) return;
    if (exIdx < total - 1) {
      setPhase('rest');
      setTimeLeft(exRestSec);
      setRestReady(false);
    } else {
      // Record progression for every exercise in the session (RPE defaults to 3 = just right)
      recordSessionCompletion(
        exercises.map(e => ({ name: e.name, emoji: e.emoji })),
        3,
      );
      const diff = exercises[0]?.difficulty ?? 'beginner';
      navigate(`/completion/${problemId}?done=${exercises.length}&diff=${diff}`);
    }
  }, [ex, exIdx, total, exRestSec, exercises, navigate, problemId]);

  const handleQualityRate = useCallback((quality: 1 | 2 | 3) => {
    if (!ex) return;
    setPendingQuality(quality);
    recordSetQuality(ex.name, quality);
  }, [ex]);

  const completeSet = useCallback(() => {
    if (!ex) return;
    if (currentSet < ex.sets) {
      setPhase('set-rest');
      setTimeLeft(setRestSec);
      setPaused(false);
    } else {
      finishEx();
    }
  }, [ex, currentSet, finishEx, setRestSec]);

  const startNextSet = useCallback(() => {
    if (!ex) return;
    setCurrentSet(s => s + 1);
    setCurrentRep(0);
    setPhase('active');
    setTimeLeft(ex.duration);
    setPaused(false);
    setWaitingToStart(false);
    setSideChangeFired(false);
    setShowSideChange(false);
    setTempoPhase(0);
    setTempoProgress(0);
    setPendingQuality(null);
    setRepsDone(false);
  }, [ex]);

  const skipEx = useCallback(() => {
    if (!ex) return;
    if (exIdx < total - 1) {
      setExIdx(i => i + 1);
    } else {
      const diff = exercises[0]?.difficulty ?? 'beginner';
      navigate(`/completion/${problemId}?done=${exIdx + 1}&diff=${diff}`);
    }
  }, [ex, exIdx, total, exercises, navigate, problemId]);

  // Active timer
  useEffect(() => {
    if (phase !== 'active' || paused || waitingToStart || timeLeft <= 0) return;
    if (isRepBased) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); completeSet(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, paused, waitingToStart, timeLeft, isRepBased, completeSet]);

  const handleRepTap = useCallback(() => {
    if (!targetReps || phase !== 'active' || waitingToStart || repsDone) return;
    const next = currentRep + 1;
    if (!isAlternating && !sideChangeFired && next >= Math.ceil(targetReps / 2) && next < targetReps) {
      setSideChangeFired(true);
      setShowSideChange(true);
      setTimeout(() => setShowSideChange(false), 1800);
    }
    if (next >= targetReps) {
      setCurrentRep(targetReps);
      setRepsDone(true);
    } else {
      setCurrentRep(next);
    }
  }, [targetReps, currentRep, phase, waitingToStart, repsDone, isAlternating, sideChangeFired]);

  autoAdvanceRepRef.current = handleRepTap;

  // Tempo cycling
  useEffect(() => {
    if (phase !== 'active' || waitingToStart || !isRepBased || repsDone) return;
    const phaseDurMs = tempoParts[tempoPhase] * 1000;
    if (phaseDurMs === 0) {
      const nextPhase = (tempoPhase + 1) % 3;
      if (tempoPhase === 2) autoAdvanceRepRef.current();
      setTempoPhase(nextPhase);
      setTempoProgress(0);
      return;
    }
    const tickMs = 50;
    let elapsed = 0;
    const t = setInterval(() => {
      elapsed += tickMs;
      const progress = Math.min(elapsed / phaseDurMs, 1);
      setTempoProgress(progress);
      if (elapsed >= phaseDurMs) {
        clearInterval(t);
        const nextPhase = (tempoPhase + 1) % 3;
        if (tempoPhase === 2) autoAdvanceRepRef.current();
        setTempoPhase(nextPhase);
        setTempoProgress(0);
      }
    }, tickMs);
    return () => clearInterval(t);
  }, [phase, waitingToStart, isRepBased, repsDone, tempoPhase, tempoParts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Oscillating metronome
  useEffect(() => {
    if (phase !== 'active' || waitingToStart || paused || !oscIntervalMs) return;
    if (oscTimerRef.current) clearInterval(oscTimerRef.current);
    oscTimerRef.current = setInterval(() => setOscPulse(p => !p), oscIntervalMs / 2);
    return () => { if (oscTimerRef.current) clearInterval(oscTimerRef.current); };
  }, [phase, waitingToStart, paused, oscIntervalMs]);

  // Set-rest timer
  useEffect(() => {
    if (phase !== 'set-rest' || paused || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); startNextSet(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, paused, timeLeft, startNextSet]);

  // Between-exercises rest timer
  useEffect(() => {
    if (phase !== 'rest' || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setRestReady(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  useEffect(() => { setYtModal(null); }, [exIdx]);

  if (!ex) return null;

  const totalDur = phase === 'active' ? ex.duration : phase === 'set-rest' ? setRestSec : exRestSec;
  const ringOffset = circ - (timeLeft / totalDur) * circ;

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100dvh',
      background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: T.font,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 12px' }}>
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate(`/problem/${problemId}`, { replace: true });
          }}
          style={{
            width: 38, height: 38, borderRadius: 11,
            background: T.surface, border: `1px solid ${T.border2}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text3, letterSpacing: '0.02em' }}>
          {exIdx + 1} / {total}
        </span>
        {phase === 'active' && waitingToStart ? (
          <button
            type="button"
            onClick={skipEx}
            style={{
              fontSize: 12, fontWeight: 600, color: T.text3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
              fontFamily: T.font,
            }}
          >Skip</button>
        ) : (
          <div style={{ width: 38 }} />
        )}
      </div>

      {/* Overall progress bar */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: T.gold,
            width: `${overallProgress}%`, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 32px' }}>

        {/* REST */}
        {phase === 'rest' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 18 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(52,211,153,0.1)', border: '1.5px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 6 }}>Rest</h2>
              <p style={{ fontSize: 13, color: T.text3 }}>
                Next: <span style={{ color: T.text2, fontWeight: 600 }}>{exercises[exIdx + 1]?.name}</span>
              </p>
            </div>
            {!restReady ? (
              <>
                <div style={{ position: 'relative', width: 110, height: 110 }}>
                  <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke={T.accent} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={ringOffset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: T.text }}>{timeLeft}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="button" onClick={() => { const n = Math.max(EX_REST_MIN, timeLeft - EX_REST_STEP); setTimeLeft(n); setExRestSec(n); saveExRestSec(n); }}
                    style={{ width: 36, height: 36, borderRadius: 10, background: T.surfaceEl, border: `1px solid ${T.border2}`, color: T.text2, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−5</button>
                  <span style={{ fontSize: 12, color: T.text3, fontWeight: 500 }}>adjust rest</span>
                  <button type="button" onClick={() => { const n = Math.min(EX_REST_MAX, timeLeft + EX_REST_STEP); setTimeLeft(n); setExRestSec(n); saveExRestSec(n); }}
                    style={{ width: 36, height: 36, borderRadius: 10, background: T.surfaceEl, border: `1px solid ${T.border2}`, color: T.text2, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+5</button>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 36 }}>✅</div>
            )}
            <button type="button" onClick={() => setExIdx(i => i + 1)}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 14,
                background: restReady ? T.accent : 'transparent',
                color: restReady ? '#0A0A0A' : T.accent,
                border: `1.5px solid ${restReady ? T.accent : 'rgba(52,211,153,0.35)'}`,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.3s, color 0.3s, border-color 0.3s',
              }}
            >
              Next exercise
              <svg width="14" height="14" viewBox="0 0 24 24" fill={restReady ? '#0A0A0A' : T.accent}><polygon points="5 3 19 12 5 21" /></svg>
            </button>
          </div>
        )}

        {/* SET-REST */}
        {phase === 'set-rest' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(217,184,76,0.1)', border: '1.5px solid rgba(217,184,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{ex.emoji}</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>Set {currentSet} done</h2>
              <p style={{ fontSize: 13, color: T.text3 }}>
                <span style={{ color: T.gold, fontWeight: 600 }}>{ex.sets - currentSet}</span>
                {' '}set{ex.sets - currentSet !== 1 ? 's' : ''} remaining · {ex.name}
              </p>
            </div>

            {/* Per-set quality rating */}
            <div style={{ background: T.surface, borderRadius: 14, padding: '12px 16px', border: `1px solid ${T.border2}`, width: '100%' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>How was that set?</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {([
                  { q: 1 as const, label: 'Hard', emoji: '😬', color: T.primary },
                  { q: 2 as const, label: 'Good', emoji: '👍', color: T.accent },
                  { q: 3 as const, label: 'Easy', emoji: '😴', color: T.text2 },
                ] as Array<{ q: 1|2|3; label: string; emoji: string; color: string }>).map(({ q, label, emoji, color }) => {
                  const picked = pendingQuality === q;
                  return (
                    <button key={q} type="button" onClick={() => handleQualityRate(q)}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: 10, background: picked ? `${color}22` : T.surfaceEl, border: `1.5px solid ${picked ? color : T.border2}`, cursor: 'pointer', fontFamily: T.font, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'border-color 0.15s, background 0.15s' }}>
                      <span style={{ fontSize: 20 }}>{emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: picked ? color : T.text3 }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={ringOffset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{timeLeft}</div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 500, marginTop: 2 }}>seconds</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: T.surface, borderRadius: 14, padding: '10px 20px', border: `1px solid ${T.border2}` }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rest between sets</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button type="button" disabled={setRestSec <= SET_REST_MIN} onClick={() => { const n = Math.max(SET_REST_MIN, setRestSec - SET_REST_STEP); setSetRestSec(n); saveSetRestSec(n); }}
                  style={{ width: 32, height: 32, borderRadius: 8, background: setRestSec <= SET_REST_MIN ? 'transparent' : T.surfaceEl, border: `1px solid ${T.border2}`, color: setRestSec <= SET_REST_MIN ? T.text3 : T.text, fontSize: 18, cursor: setRestSec <= SET_REST_MIN ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: setRestSec <= SET_REST_MIN ? 0.3 : 1, fontFamily: T.font }}>−</button>
                <span style={{ fontSize: 17, fontWeight: 700, color: T.text, minWidth: 40, textAlign: 'center', fontFamily: T.font }}>{setRestSec}s</span>
                <button type="button" disabled={setRestSec >= SET_REST_MAX} onClick={() => { const n = Math.min(SET_REST_MAX, setRestSec + SET_REST_STEP); setSetRestSec(n); saveSetRestSec(n); }}
                  style={{ width: 32, height: 32, borderRadius: 8, background: setRestSec >= SET_REST_MAX ? 'transparent' : T.surfaceEl, border: `1px solid ${T.border2}`, color: setRestSec >= SET_REST_MAX ? T.text3 : T.text, fontSize: 18, cursor: setRestSec >= SET_REST_MAX ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: setRestSec >= SET_REST_MAX ? 0.3 : 1, fontFamily: T.font }}>+</button>
              </div>
            </div>

            <button type="button" onClick={startNextSet}
              style={{ fontSize: 13, fontWeight: 600, color: T.gold, background: 'none', border: `1px solid rgba(217,184,76,0.3)`, borderRadius: 10, padding: '8px 24px', cursor: 'pointer', fontFamily: T.font }}>
              Skip rest →
            </button>
          </div>
        )}

        {/* ACTIVE */}
        {phase === 'active' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 0, animation: 'scaleIn 0.35s ease', paddingTop: 8 }}>

            {ex.youtubeUrl ? (
              <div style={{ width: '100%', padding: '0 16px', marginBottom: 16 }}>
                <div style={{ width: '100%', aspectRatio: '9 / 16', maxHeight: 'min(52vh, 420px)', borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(217,184,76,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', background: '#000' }}>
                  <iframe title={ex.name}
                    src={`${toYouTubeEmbed(ex.youtubeUrl)}?playsinline=1&rel=0&autoplay=1&mute=1&loop=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} />
                </div>
              </div>
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(217,184,76,0.1)', border: '1.5px solid rgba(217,184,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 20, animation: 'breathe 3s ease infinite' }}>
                {ex.emoji}
              </div>
            )}

            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>{ex.name}</h2>
            {!waitingToStart && ex.sets > 1 && (
              <div style={{ fontSize: 13, color: T.gold, fontWeight: 600, marginBottom: 8 }}>Set {currentSet} of {ex.sets}</div>
            )}

            {waitingToStart ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: T.gold, fontWeight: 600 }}>
                    {ex.sets > 1 ? `${ex.sets} sets · ` : ''}{ex.displayReps}
                  </span>
                  {ex.requiresEquipment && (
                    <span style={{ fontSize: 10, color: T.text3, background: T.surface, padding: '2px 6px', borderRadius: 5, border: `1px solid ${T.border2}` }}>Band</span>
                  )}
                </div>
                {ex.postureTypes && ex.postureTypes.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {ex.postureTypes.map((pt, i) => (
                      <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'rgba(217,184,76,0.1)', color: T.gold, border: '1px solid rgba(217,184,76,0.18)' }}>{pt}</span>
                    ))}
                  </div>
                )}
                <div style={{ background: T.surface, borderRadius: 16, padding: 18, border: `1px solid ${T.border2}`, textAlign: 'left' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Steps</h4>
                  {ex.instructions.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < ex.instructions.length - 1 ? 10 : 0 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, background: 'rgba(217,184,76,0.1)', border: '1px solid rgba(217,184,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: T.gold }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setWaitingToStart(false)}
                  style={{ width: '100%', padding: '16px 0', borderRadius: 14, background: T.gold, color: '#0A0A0A', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', border: 'none', cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(217,184,76,0.25)' }}>
                  Start when ready
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
                </button>
              </div>
            ) : (
              <>
                {isRepBased ? (
                  <>
                    {isBilateral && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: showSideChange ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showSideChange ? 'rgba(52,211,153,0.5)' : T.border2}`, borderRadius: 8, padding: '5px 12px', marginBottom: 4, transition: 'background 0.3s, border-color 0.3s' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: showSideChange ? T.accent : T.text2 }}>
                          {showSideChange ? '↔ Switch sides!' : isAlternating ? (currentSide === 1 ? '→ Right side' : '← Left side') : (currentSide === 1 ? '← Left side' : '→ Right side')}
                        </span>
                      </div>
                    )}

                    <button type="button" onClick={handleRepTap}
                      style={{ position: 'relative', width: 150, height: 150, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, marginBottom: 4, padding: 0 }}>
                      <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={circ}
                          strokeDashoffset={targetReps ? circ - (currentRep / targetReps) * circ : circ}
                          style={{ transition: 'stroke-dashoffset 0.15s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 44, fontWeight: 800, color: T.gold, letterSpacing: '-0.03em', lineHeight: 1 }}>{currentRep}</div>
                        <div style={{ fontSize: 12, color: T.text3, fontWeight: 500, marginTop: 2 }}>/ {targetReps} reps</div>
                        <div style={{ fontSize: 9, color: T.text3, marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>tap to correct</div>
                      </div>
                    </button>

                    {!repsDone && (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
                        {tempoParts.map((sec, i) => {
                          const isActive = tempoPhase === i;
                          const color = tempoColors[i];
                          const phaseDurMs = sec * 1000;
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <div style={{ width: 52, height: 5, borderRadius: 3, background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', overflow: 'hidden', border: isActive ? `1px solid ${color}44` : '1px solid transparent' }}>
                                {isActive && phaseDurMs > 0 && (
                                  <div style={{ height: '100%', background: color, width: `${tempoProgress * 100}%`, borderRadius: 3, transition: 'none' }} />
                                )}
                              </div>
                              <span style={{ fontSize: 9, color: isActive ? color : T.text3, fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em' }}>
                                {tempoLabels[i]}{sec > 0 ? ` ${sec}s` : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {repsDone ? (
                      <button type="button" onClick={completeSet}
                        style={{ width: '100%', padding: '16px 0', borderRadius: 14, background: T.gold, color: '#0A0A0A', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', border: 'none', cursor: 'pointer', fontFamily: T.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(217,184,76,0.3)', marginTop: 8 }}>
                        Set done ✓ — Continue
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                        <button type="button" onClick={() => setCurrentRep(r => Math.max(0, r - 1))} disabled={currentRep === 0}
                          style={{ width: 44, height: 44, borderRadius: '50%', background: T.surface, border: `1.5px solid ${T.border2}`, color: currentRep === 0 ? T.text3 : T.text2, fontSize: 20, fontWeight: 700, cursor: currentRep === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: currentRep === 0 ? 0.35 : 1, fontFamily: T.font }}>−</button>
                        <button type="button" onClick={skipEx}
                          style={{ width: 44, height: 44, borderRadius: '50%', background: T.surface, border: `1.5px solid ${T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={T.text3}><polygon points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" stroke={T.text3} strokeWidth="2" /></svg>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {isTimedBilateral && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, borderRadius: 8, padding: '5px 14px', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>
                          {timedSide === 'Left' ? '← Left side' : '→ Right side'}
                        </span>
                      </div>
                    )}
                    {oscIntervalMs && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: T.gold, transform: oscPulse ? 'scale(1.5)' : 'scale(0.8)', opacity: oscPulse ? 0.9 : 0.35, transition: `transform ${oscIntervalMs / 2}ms ease-in-out, opacity ${oscIntervalMs / 2}ms ease-in-out`, boxShadow: oscPulse ? `0 0 12px ${T.gold}88` : 'none' }} />
                        <span style={{ fontSize: 9, color: T.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {oscIntervalMs >= 1500 ? 'rock with rhythm' : 'flutter with rhythm'}
                        </span>
                      </div>
                    )}
                    <div style={{ position: 'relative', width: 120, height: 120, marginTop: 8, marginBottom: 16 }}>
                      <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={circ} strokeDashoffset={ringOffset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{timeLeft}</div>
                        <div style={{ fontSize: 10, color: T.text3, fontWeight: 500, marginTop: 2 }}>seconds</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <button type="button" onClick={() => setPaused(p => !p)}
                        style={{ width: 52, height: 52, borderRadius: '50%', cursor: 'pointer', border: paused ? 'none' : `2px solid ${T.gold}`, background: paused ? T.gold : T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                        {paused
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill={T.gold}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>}
                      </button>
                      <button type="button" onClick={skipEx}
                        style={{ width: 52, height: 52, borderRadius: '50%', background: T.surface, border: `2px solid ${T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text3}><polygon points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" stroke={T.text3} strokeWidth="2" /></svg>
                      </button>
                    </div>
                    {paused && <p style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: T.gold }}>Paused</p>}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <YoutubeModal open={!!ytModal} watchUrl={ytModal?.url ?? ''} title={ytModal?.title} onClose={() => setYtModal(null)} />
    </div>
  );
};

export default ExerciseFlow;
