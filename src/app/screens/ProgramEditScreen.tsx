import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SwapExerciseScreen from '../components/SwapExerciseScreen';
import type { Exercise } from '../data/postureData';
import {
  DURATION_PRESETS,
  REPS_PRESETS,
  isStrengthExercise,
  loadActiveProgramForSession,
  saveDailyProgram,
  replaceExercise,
  updateExerciseParams,
  type StoredDailyProgram,
} from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

const T = {
  bg: '#0a0a0a',
  card: '#121212',
  pillTrack: 'rgba(0,0,0,0.4)',
  pillInner: '#1a1a1a',
  border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.03)',
  borderHover: 'rgba(249,115,22,0.20)',
  text: '#F5F5F5',
  text2: '#A3A3A3',
  text3: '#737373',
  text4: '#525252',
  text5: 'rgba(163,163,163,0.85)',
  orange: '#F97316',
  orangeSoft: 'rgba(249,115,22,0.10)',
  orangeSoft2: 'rgba(249,115,22,0.20)',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

function recomputeProgram(program: StoredDailyProgram): StoredDailyProgram {
  const totalSec = program.exercises.reduce((sum, ex) => sum + ex.duration * ex.sets + 15, 0);
  return { ...program, totalDurationMin: Math.round(totalSec / 60) };
}

function ControlPill({
  label,
  value,
  isRange,
  onDec,
  onInc,
  disableDec,
  disableInc,
}: {
  label: string;
  value: string | number;
  isRange: boolean;
  onDec: () => void;
  onInc: () => void;
  disableDec?: boolean;
  disableInc?: boolean;
}) {
  const btn: React.CSSProperties = {
    padding: 8,
    background: 'transparent',
    border: 'none',
    color: T.text3,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: T.font,
  };
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: T.pillTrack,
        borderRadius: 12,
        padding: 4,
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: T.text3,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          paddingLeft: 12,
          paddingRight: 8,
          minWidth: 56,
          fontFamily: T.font,
        }}
      >
        {label}
      </span>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: T.pillInner,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={disableDec ? undefined : onDec}
          disabled={disableDec}
          style={{ ...btn, borderRadius: '8px 0 0 8px', opacity: disableDec ? 0.35 : 1 }}
          aria-label="decrement"
        >
          {isRange ? (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            width: 64,
            textAlign: 'center',
            color: T.text,
            fontFamily: T.font,
          }}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={disableInc ? undefined : onInc}
          disabled={disableInc}
          style={{ ...btn, borderRadius: '0 8px 8px 0', opacity: disableInc ? 0.35 : 1 }}
          aria-label="increment"
        >
          {isRange ? (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

const ProgramEditScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const [program, setProgram] = useState<StoredDailyProgram | null>(() =>
    loadActiveProgramForSession(profile),
  );
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const exercises = useMemo(() => program?.exercises ?? [], [program]);

  if (!program || exercises.length === 0) {
    navigate('/program');
    return null;
  }

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

  function handleSave() {
    if (program) saveDailyProgram(program);
    navigate('/program');
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
      <main
        style={{
          minHeight: '100%',
          background: T.bg,
          color: T.text,
          fontFamily: T.font,
          padding: '24px 20px 120px',
        }}
      >
        <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Header */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: T.orangeSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', margin: 0, color: T.text }}>
                Edit Routine
              </h1>
            </div>
            <button
              type="button"
              onClick={handleSave}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: T.orange,
                background: T.orangeSoft,
                border: 'none',
                padding: '8px 16px',
                borderRadius: 9999,
                cursor: 'pointer',
                fontFamily: T.font,
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = T.orangeSoft2;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = T.orangeSoft;
              }}
            >
              Save Changes
            </button>
          </header>

          {/* Exercise list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {exercises.map((ex) => {
              const isStrength = isStrengthExercise(ex.name);
              const diffLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard';
              const isHard = ex.difficulty === 'hard';
              const durIdx = DURATION_PRESETS.indexOf(ex.duration);
              const repIdx = REPS_PRESETS.indexOf(ex.displayReps);
              const isHover = hoverId === ex.id;

              return (
                <div
                  key={ex.id}
                  onMouseEnter={() => setHoverId(ex.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{
                    position: 'relative',
                    background: T.card,
                    borderRadius: 16,
                    padding: 20,
                    border: `1px solid ${isHover ? T.borderHover : T.border2}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  {/* Drag handle (visual only on hover) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isHover ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.text4} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="6" r="1" />
                      <circle cx="9" cy="12" r="1" />
                      <circle cx="9" cy="18" r="1" />
                      <circle cx="15" cy="6" r="1" />
                      <circle cx="15" cy="12" r="1" />
                      <circle cx="15" cy="18" r="1" />
                    </svg>
                  </div>

                  <div style={{ paddingLeft: 8 }}>
                    {/* Top row: info + actions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', color: '#F5F5F5', margin: 0 }}>
                          {ex.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isHard ? T.orange : T.text3,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: T.text3,
                              fontWeight: 500,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {diffLabel}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <ActionButton
                          onClick={() => setSwapTarget(ex.id)}
                          icon={
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="17 1 21 5 17 9" />
                              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                              <polyline points="7 23 3 19 7 15" />
                              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                            </svg>
                          }
                          label="Change Move"
                        />
                        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.10)', margin: '0 4px' }} />
                        <IconDeleteButton onClick={() => handleRemove(ex.id)} />
                      </div>
                    </div>

                    {/* Middle: controls */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                      <ControlPill
                        label="Sets"
                        value={ex.sets}
                        isRange={false}
                        onDec={() => ex.sets > 1 && handleParamChange(ex.id, { sets: ex.sets - 1 })}
                        onInc={() => ex.sets < 4 && handleParamChange(ex.id, { sets: ex.sets + 1 })}
                        disableDec={ex.sets <= 1}
                        disableInc={ex.sets >= 4}
                      />
                      {isStrength ? (
                        <ControlPill
                          label="Reps"
                          value={ex.displayReps}
                          isRange={true}
                          onDec={() => {
                            const prev = repIdx <= 0 ? REPS_PRESETS.length - 1 : repIdx - 1;
                            handleParamChange(ex.id, { displayReps: REPS_PRESETS[prev] });
                          }}
                          onInc={() => {
                            const next = repIdx >= REPS_PRESETS.length - 1 ? 0 : repIdx + 1;
                            handleParamChange(ex.id, { displayReps: REPS_PRESETS[next] });
                          }}
                        />
                      ) : (
                        <ControlPill
                          label="Time"
                          value={`${ex.duration}s`}
                          isRange={false}
                          onDec={() =>
                            durIdx > 0 && handleParamChange(ex.id, { duration: DURATION_PRESETS[durIdx - 1] })
                          }
                          onInc={() =>
                            durIdx < DURATION_PRESETS.length - 1 &&
                            handleParamChange(ex.id, { duration: DURATION_PRESETS[durIdx + 1] })
                          }
                          disableDec={durIdx <= 0}
                          disableInc={durIdx >= DURATION_PRESETS.length - 1}
                        />
                      )}
                    </div>

                    {/* Bottom: tags */}
                    {ex.targetProblemLabels.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {ex.targetProblemLabels.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              padding: '4px 10px',
                              borderRadius: 6,
                              background: 'rgba(255,255,255,0.05)',
                              color: T.text2,
                              border: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </Layout>
  );
};

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: hover ? T.orange : T.text3,
        background: hover ? T.orangeSoft : 'transparent',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: T.font,
        transition: 'color 0.2s ease, background 0.2s ease',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function IconDeleteButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Remove exercise"
      style={{
        padding: 6,
        color: hover ? '#EF4444' : T.text4,
        background: hover ? 'rgba(239,68,68,0.10)' : 'transparent',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease, background 0.2s ease',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}

export default ProgramEditScreen;
