import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import YoutubeModal from '../components/YoutubeModal';
import { toYouTubeEmbed } from '../lib/youtubeEmbed';
import { loadActiveProgramForSession, markExerciseComplete, type DailyExercise } from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

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
function saveSetRestSec(sec: number): void {
  localStorage.setItem(SET_REST_KEY, String(sec));
}

const DailyExerciseFlow: React.FC = () => {
  const navigate = useNavigate();

  // Only work on exercises that aren't done yet
  const [exercises] = useState<DailyExercise[]>(() => {
    const p = loadActiveProgramForSession(loadUserProfile());
    return p?.exercises.filter(e => !e.completed) ?? [];
  });

  const [exIdx, setExIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'active' | 'set-rest' | 'rest'>('intro');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [paused, setPaused] = useState(false);
  const [waitingToStart, setWaitingToStart] = useState(false);
  const [setRestSec, setSetRestSec] = useState(() => loadSetRestSec());
  const [ytModal, setYtModal] = useState<{ url: string; title: string } | null>(null);

  const ex = exercises[exIdx];
  const total = exercises.length;
  const overallProgress = total > 0 ? (exIdx / total) * 100 : 0;
  const circ = 2 * Math.PI * 45;

  // If all exercises already completed, go home
  useEffect(() => {
    if (exercises.length === 0) navigate('/');
  }, [exercises, navigate]);

  const beginEx = useCallback(() => {
    if (ex) { setCurrentSet(1); setPhase('active'); setTimeLeft(ex.duration); setPaused(false); setWaitingToStart(!!ex.youtubeUrl); }
  }, [ex]);

  const finishEx = useCallback(() => {
    if (!ex) return;
    markExerciseComplete(ex.id);
    if (exIdx < total - 1) {
      setPhase('rest');
      setTimeLeft(10);
    } else {
      navigate('/');
    }
  }, [ex, exIdx, total, navigate]);

  // Called when one set's timer reaches 0
  const completeSet = useCallback(() => {
    if (!ex) return;
    if (currentSet < ex.sets) {
      // More sets remain — short rest between sets
      setPhase('set-rest');
      setTimeLeft(setRestSec);
      setPaused(false);
    } else {
      // All sets done — finish the exercise
      finishEx();
    }
  }, [ex, currentSet, finishEx, setRestSec]);

  // Advance from set-rest into the next set
  const startNextSet = useCallback(() => {
    if (!ex) return;
    setCurrentSet(s => s + 1);
    setPhase('active');
    setTimeLeft(ex.duration);
    setPaused(false);
    setWaitingToStart(false);
  }, [ex]);

  // Skip = move on WITHOUT marking as completed
  const skipEx = useCallback(() => {
    if (!ex) return;
    if (exIdx < total - 1) {
      setExIdx(i => i + 1);
      setCurrentSet(1);
      setPhase('intro');
      setPaused(false);
    } else {
      navigate('/');
    }
  }, [ex, exIdx, total, navigate]);

  // Active timer (per set)
  useEffect(() => {
    if (phase !== 'active' || paused || waitingToStart || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); completeSet(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, paused, waitingToStart, timeLeft, completeSet]);

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
        if (prev <= 1) {
          clearInterval(t);
          setExIdx(i => i + 1);
          setCurrentSet(1);
          setPhase('intro');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  useEffect(() => { setYtModal(null); }, [exIdx]);

  if (!ex) return null;

  const totalDur = phase === 'active' ? ex.duration : phase === 'set-rest' ? setRestSec : 10;
  const ringOffset = circ - (timeLeft / totalDur) * circ;

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: T.font,
    }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 12px' }}>
        <button
          type="button"
          onClick={() => navigate('/program')}
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
        {phase === 'intro' ? (
          <button
            type="button"
            onClick={skipEx}
            style={{
              fontSize: 12, fontWeight: 600, color: T.text3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
              fontFamily: T.font,
            }}
          >
            Skip
          </button>
        ) : (
          <div style={{ width: 38 }} />
        )}
      </div>

      {/* ── Overall progress bar ─────────────────────────────────── */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: T.gold,
            width: `${overallProgress}%`, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* ── Phase content ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 32px' }}>

        {/* REST ─────────────────────────────────────────────────── */}
        {phase === 'rest' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: 20,
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: 20,
              background: 'rgba(52,211,153,0.1)', border: `1.5px solid rgba(52,211,153,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 6 }}>Rest</h2>
              <p style={{ fontSize: 13, color: T.text3 }}>
                Next: <span style={{ color: T.text2, fontWeight: 600 }}>{exercises[exIdx + 1]?.name}</span>
              </p>
            </div>
            {/* Rest ring */}
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={T.accent} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: T.text }}>
                {timeLeft}
              </div>
            </div>
          </div>
        )}

        {/* SET-REST ─────────────────────────────────────────────── */}
        {phase === 'set-rest' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: 20,
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: 20,
              background: 'rgba(217,184,76,0.1)', border: `1.5px solid rgba(217,184,76,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            }}>
              {ex.emoji}
            </div>

            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>
                Set {currentSet} done
              </h2>
              <p style={{ fontSize: 13, color: T.text3 }}>
                <span style={{ color: T.gold, fontWeight: 600 }}>{ex.sets - currentSet}</span>
                {' '}set{ex.sets - currentSet !== 1 ? 's' : ''} remaining · {ex.name}
              </p>
            </div>

            {/* Ring */}
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={ringOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{timeLeft}</div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 500, marginTop: 2 }}>seconds</div>
              </div>
            </div>

            {/* Rest duration control */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: T.surface, borderRadius: 14, padding: '12px 20px',
              border: `1px solid ${T.border2}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Rest between sets
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  type="button"
                  disabled={setRestSec <= SET_REST_MIN}
                  onClick={() => {
                    const next = Math.max(SET_REST_MIN, setRestSec - SET_REST_STEP);
                    setSetRestSec(next);
                    saveSetRestSec(next);
                  }}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: setRestSec <= SET_REST_MIN ? 'transparent' : T.surfaceEl,
                    border: `1px solid ${T.border2}`,
                    color: setRestSec <= SET_REST_MIN ? T.text3 : T.text,
                    fontSize: 18, cursor: setRestSec <= SET_REST_MIN ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: setRestSec <= SET_REST_MIN ? 0.3 : 1,
                    fontFamily: T.font,
                  }}
                >−</button>
                <span style={{ fontSize: 17, fontWeight: 700, color: T.text, minWidth: 40, textAlign: 'center', fontFamily: T.font }}>
                  {setRestSec}s
                </span>
                <button
                  type="button"
                  disabled={setRestSec >= SET_REST_MAX}
                  onClick={() => {
                    const next = Math.min(SET_REST_MAX, setRestSec + SET_REST_STEP);
                    setSetRestSec(next);
                    saveSetRestSec(next);
                  }}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: setRestSec >= SET_REST_MAX ? 'transparent' : T.surfaceEl,
                    border: `1px solid ${T.border2}`,
                    color: setRestSec >= SET_REST_MAX ? T.text3 : T.text,
                    fontSize: 18, cursor: setRestSec >= SET_REST_MAX ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: setRestSec >= SET_REST_MAX ? 0.3 : 1,
                    fontFamily: T.font,
                  }}
                >+</button>
              </div>
            </div>

            {/* Skip rest */}
            <button
              type="button"
              onClick={startNextSet}
              style={{
                fontSize: 13, fontWeight: 600, color: T.gold,
                background: 'none', border: `1px solid rgba(217,184,76,0.3)`,
                borderRadius: 10, padding: '8px 24px',
                cursor: 'pointer', fontFamily: T.font,
              }}
            >
              Skip rest →
            </button>
          </div>
        )}

        {/* INTRO ────────────────────────────────────────────────── */}
        {phase === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', animation: 'slideUp 0.35s ease' }}>

            {/* Exercise identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 58, height: 58, borderRadius: 18, flexShrink: 0,
                background: T.surfaceEl, border: `1px solid ${T.border2}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>
                {ex.emoji}
              </div>
              <div>
                <h2 style={{ fontSize: 21, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{ex.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: T.gold, fontWeight: 600 }}>
                    {ex.sets > 1 ? `${ex.sets} sets · ` : ''}{ex.displayReps}
                  </span>
                  {ex.requiresEquipment && (
                    <span style={{ fontSize: 10, color: T.text3, background: T.surface, padding: '2px 6px', borderRadius: 5, border: `1px solid ${T.border2}` }}>
                      Band
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Target posture types */}
            {ex.postureTypes && ex.postureTypes.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                {ex.postureTypes.map((pt, i) => (
                  <span key={i} style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                    background: 'rgba(217,184,76,0.1)', color: T.gold,
                    border: '1px solid rgba(217,184,76,0.18)',
                  }}>{pt}</span>
                ))}
              </div>
            )}

            {/* Steps */}
            <div style={{
              background: T.surface, borderRadius: 16, padding: 18,
              border: `1px solid ${T.border2}`, marginBottom: 16,
            }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                Steps
              </h4>
              {ex.instructions.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < ex.instructions.length - 1 ? 10 : 0 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: 'rgba(217,184,76,0.1)', border: '1px solid rgba(217,184,76,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: T.gold,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: T.text2, lineHeight: 1.55 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* Watch video */}
            {ex.youtubeUrl && (
              <button
                type="button"
                onClick={() => setYtModal({ url: ex.youtubeUrl!, title: ex.name })}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 12,
                  background: T.surface, border: `1px solid ${T.border2}`,
                  color: T.text2, fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', fontFamily: T.font, marginBottom: 12,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={T.text2}><polygon points="5 3 19 12 5 21" /></svg>
                Watch demo
              </button>
            )}

            {/* Start button */}
            <button
              type="button"
              onClick={beginEx}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 14,
                background: T.gold, color: '#0A0A0A',
                fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                border: 'none', cursor: 'pointer', fontFamily: T.font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(217,184,76,0.25)',
                marginTop: 24,
              }}
            >
              Start exercise
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
            </button>
          </div>
        )}

        {/* ACTIVE ───────────────────────────────────────────────── */}
        {phase === 'active' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center', gap: 0, animation: 'scaleIn 0.35s ease',
            paddingTop: 8,
          }}>
            {/* Video player or fallback emoji */}
            {ex.youtubeUrl ? (
              <div style={{
                width: '100%', padding: '0 16px', marginBottom: 16,
              }}>
                <div style={{
                  width: '100%', aspectRatio: '9 / 16', maxHeight: 'min(52vh, 420px)',
                  borderRadius: 16, overflow: 'hidden',
                  border: '1.5px solid rgba(217,184,76,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  background: '#000',
                }}>
                  <iframe
                    title={ex.name}
                    src={`${toYouTubeEmbed(ex.youtubeUrl)}?playsinline=1&rel=0&autoplay=1&mute=1&loop=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: 22,
                background: 'rgba(217,184,76,0.1)', border: `1.5px solid rgba(217,184,76,0.25)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 20,
                animation: 'breathe 3s ease infinite',
              }}>
                {ex.emoji}
              </div>
            )}

            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>{ex.name}</h2>
            {ex.sets > 1 && (
              <div style={{ fontSize: 13, color: T.gold, fontWeight: 600, marginBottom: 8 }}>
                Set {currentSet} of {ex.sets}
              </div>
            )}

            {/* Waiting to start — user watches video first, then taps to begin timer */}
            {waitingToStart ? (
              <button
                type="button"
                onClick={() => setWaitingToStart(false)}
                style={{
                  marginTop: 16, padding: '14px 40px', borderRadius: 14,
                  background: T.gold, color: '#0A0A0A',
                  fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                  border: 'none', cursor: 'pointer', fontFamily: T.font,
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 24px rgba(217,184,76,0.25)',
                }}
              >
                Start when ready
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
              </button>
            ) : (
              <>
                {/* Timer ring */}
                <div style={{ position: 'relative', width: 120, height: 120, marginTop: 8, marginBottom: 16 }}>
                  <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={circ} strokeDashoffset={ringOffset}
                      style={{ transition: 'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 30, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{timeLeft}</div>
                    <div style={{ fontSize: 10, color: T.text3, fontWeight: 500, marginTop: 2 }}>seconds</div>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 16 }}>
                  {/* Pause / Resume */}
                  <button
                    type="button"
                    onClick={() => setPaused(p => !p)}
                    style={{
                      width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
                      border: paused ? 'none' : `2px solid ${T.gold}`,
                      background: paused ? T.gold : T.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    {paused
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill={T.gold}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>}
                  </button>
                  {/* Skip */}
                  <button
                    type="button"
                    onClick={skipEx}
                    style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: T.surface, border: `2px solid ${T.border2}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text3}><polygon points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" stroke={T.text3} strokeWidth="2" /></svg>
                  </button>
                </div>

                {paused && (
                  <p style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: T.gold }}>Paused</p>
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

export default DailyExerciseFlow;
