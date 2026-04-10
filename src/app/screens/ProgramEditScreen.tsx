import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SwapExerciseScreen from '../components/SwapExerciseScreen';
import type { Exercise } from '../data/postureData';
import {
  DURATION_PRESETS,
  REPS_PRESETS,
  getExerciseDaysCompleted,
  isStrengthExercise,
  loadActiveProgramForSession,
  saveDailyProgram,
  replaceExercise,
  updateExerciseParams,
  type DailyExercise,
  type StoredDailyProgram,
} from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

const T = {
  bg: '#09090B',
  surface: '#141418',
  border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  text2: 'rgba(161,161,170,1)',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
  gold: '#F97316',
  gold2: '#FB923C',
  danger: '#F87171',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const targetProblemTagStyle: React.CSSProperties = {
  color: T.text2,
  borderColor: T.border2,
  background: 'rgba(255,255,255,0.03)',
};

function recomputeProgram(program: StoredDailyProgram): StoredDailyProgram {
  const totalSec = program.exercises.reduce((sum, ex) => sum + ex.duration * ex.sets + 15, 0);
  return {
    ...program,
    totalDurationMin: Math.round(totalSec / 60),
  };
}

const iconButton: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 10px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${T.border2}`,
  cursor: 'pointer',
  fontFamily: T.font,
};

const ProgramEditScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const [program, setProgram] = useState<StoredDailyProgram | null>(() =>
    loadActiveProgramForSession(profile),
  );
  const [swapTarget, setSwapTarget] = useState<string | null>(null);

  const exercises = useMemo(() => program?.exercises ?? [], [program]);

  if (!program || exercises.length === 0) {
    navigate('/program');
    return null;
  }

  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration * ex.sets, 0);
  const totalMin = Math.max(1, Math.ceil(totalDuration / 60));

  function handleReplace(newExercise: Exercise) {
    if (!swapTarget || !program) return;
    const updated = replaceExercise(program, swapTarget, newExercise);
    setProgram(updated);
    setSwapTarget(null);
  }

  function handleParamChange(
    exerciseId: string,
    params: { sets?: number; duration?: number; displayReps?: string },
  ) {
    if (!program) return;
    setProgram(updateExerciseParams(program, exerciseId, params));
  }

  function handleRemove(exerciseId: string) {
    if (!program) return;
    const updated = recomputeProgram({
      ...program,
      exercises: program.exercises.filter(ex => ex.id !== exerciseId),
    });
    saveDailyProgram(updated);
    setProgram(updated);
  }

  if (swapTarget && program) {
    return (
      <Layout>
        <div style={{ minHeight: '100%', background: T.bg }}>
          <SwapExerciseScreen
            swapExerciseId={swapTarget}
            program={program}
            onReplace={handleReplace}
            onClose={() => setSwapTarget(null)}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main style={{ padding: '32px 20px 112px', fontFamily: T.font }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 4 }}>
              Customize
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: T.text, lineHeight: 1 }}>
              Edit Program
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/program')}
            style={{
              marginTop: 4,
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: T.font,
              boxShadow: '0 0 16px rgba(249,115,22,0.25)',
            }}
          >
            Done
          </button>
        </div>

        <div style={{ position: 'relative', marginTop: 16, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)', border: `1px solid ${T.border}`, borderRadius: 18 }} />
          <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 128, height: 128, borderRadius: '50%', background: 'rgba(249,115,22,0.10)', filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text2 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={T.gold2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>~{totalMin} min</span>
            </div>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(63,63,70,1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text2 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={T.gold2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>{exercises.length} exercises</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {exercises.map((ex, index) => {
            const isStrength = isStrengthExercise(ex.name);
            const diffLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard';
            const progressDays = Math.min(getExerciseDaysCompleted(ex.name), 21);
            const durIdx = DURATION_PRESETS.indexOf(ex.duration);
            const repIdx = REPS_PRESETS.indexOf(ex.displayReps);

            return (
              <div key={ex.id} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: T.surface, border: `1px solid ${T.border}` }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.2, margin: 0 }}>
                        {ex.name}
                      </h3>
                      <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                        {isStrength ? ex.displayReps : `${ex.duration}s`} · {diffLabel}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                      <button
                        type="button"
                        onClick={() => setSwapTarget(ex.id)}
                        style={iconButton}
                      >
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <span style={{ fontSize: 10, color: T.text2 }}>Swap</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(ex.id)}
                        style={{ ...iconButton, padding: 7, color: T.text3 }}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 10, color: T.text4, marginTop: 8 }}>
                    {progressDays} / 21 days
                  </p>

                  <div style={{ marginTop: 6, height: 2, borderRadius: 999, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(progressDays / 21) * 100}%`, borderRadius: 999, background: 'rgba(249,115,22,0.6)' }} />
                  </div>

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '14px 0 12px' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase' }}>Sets</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => ex.sets > 1 && handleParamChange(ex.id, { sets: ex.sets - 1 })}
                          style={{ width: 28, height: 28, borderRadius: '10px 0 0 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, color: T.text2, cursor: ex.sets <= 1 ? 'default' : 'pointer', opacity: ex.sets <= 1 ? 0.3 : 1 }}
                        >
                          -
                        </button>
                        <div style={{ minWidth: 34, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderTop: `1px solid ${T.border2}`, borderBottom: `1px solid ${T.border2}`, color: T.text, fontSize: 13, fontWeight: 700 }}>
                          {ex.sets}
                        </div>
                        <button
                          type="button"
                          onClick={() => ex.sets < 4 && handleParamChange(ex.id, { sets: ex.sets + 1 })}
                          style={{ width: 28, height: 28, borderRadius: '0 10px 10px 0', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, color: T.text2, cursor: ex.sets >= 4 ? 'default' : 'pointer', opacity: ex.sets >= 4 ? 0.3 : 1 }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase' }}>
                        {isStrength ? 'Reps' : 'Duration'}
                      </span>
                      {isStrength ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const prev = repIdx <= 0 ? REPS_PRESETS.length - 1 : repIdx - 1;
                              handleParamChange(ex.id, { displayReps: REPS_PRESETS[prev] });
                            }}
                            style={{ width: 28, height: 28, borderRadius: '10px 0 0 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, color: T.text2, cursor: 'pointer' }}
                          >
                            ‹
                          </button>
                          <div style={{ minWidth: 74, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderTop: `1px solid ${T.border2}`, borderBottom: `1px solid ${T.border2}`, color: T.text, fontSize: 12, fontWeight: 600 }}>
                            {ex.displayReps}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = repIdx >= REPS_PRESETS.length - 1 ? 0 : repIdx + 1;
                              handleParamChange(ex.id, { displayReps: REPS_PRESETS[next] });
                            }}
                            style={{ width: 28, height: 28, borderRadius: '0 10px 10px 0', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, color: T.text2, cursor: 'pointer' }}
                          >
                            ›
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => durIdx > 0 && handleParamChange(ex.id, { duration: DURATION_PRESETS[durIdx - 1] })}
                            style={{ width: 28, height: 28, borderRadius: '10px 0 0 10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, color: T.text2, cursor: durIdx <= 0 ? 'default' : 'pointer', opacity: durIdx <= 0 ? 0.3 : 1 }}
                          >
                            -
                          </button>
                          <div style={{ minWidth: 44, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderTop: `1px solid ${T.border2}`, borderBottom: `1px solid ${T.border2}`, color: T.text, fontSize: 13, fontWeight: 700 }}>
                            {ex.duration}s
                          </div>
                          <button
                            type="button"
                            onClick={() => durIdx < DURATION_PRESETS.length - 1 && handleParamChange(ex.id, { duration: DURATION_PRESETS[durIdx + 1] })}
                            style={{ width: 28, height: 28, borderRadius: '0 10px 10px 0', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`, color: T.text2, cursor: durIdx >= DURATION_PRESETS.length - 1 ? 'default' : 'pointer', opacity: durIdx >= DURATION_PRESETS.length - 1 ? 0.3 : 1 }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: T.text4, textTransform: 'uppercase', marginRight: 2 }}>
                      Targets
                    </span>
                    {ex.targetProblemLabels.map((target) => (
                        <span
                          key={target}
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: `1px solid ${targetProblemTagStyle.borderColor}`,
                            background: targetProblemTagStyle.background,
                            color: targetProblemTagStyle.color,
                          }}
                        >
                          {target}
                        </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </Layout>
  );
};

export default ProgramEditScreen;
