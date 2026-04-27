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
  bg: '#09090B',
  card: 'rgba(20,20,24,0.7)',
  pillTrack: 'rgba(255,255,255,0.04)',
  pillInner: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.05)',
  borderHover: 'rgba(249,115,22,0.25)',
  text: '#FAFAFA',
  text2: '#A1A1AA',
  text3: '#71717A',
  text4: '#52525B',
  text5: 'rgba(161,161,170,0.85)',
  orange: '#F97316',
  orangeSoft: 'rgba(249,115,22,0.10)',
  orangeSoft2: 'rgba(249,115,22,0.18)',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

interface ExerciseImage { src: string; offsetX?: number }
const DEFAULT_IMAGE_OFFSET_X = 15;
const EXERCISE_IMAGES: Record<string, ExerciseImage> = {
  'Doorway Chest Stretch':   { src: '/exercises/doorway-chest-stretch.jpg',   offsetX: 0 },
  'Bear Hold':               { src: '/exercises/bear-hold.jpg',               offsetX: 0 },
  'Prone T-Raise':           { src: '/exercises/prone-t-raise.jpg',           offsetX: 0 },
  'Y-Pull with Band':        { src: '/exercises/y-pull-with-band.jpg',        offsetX: 0 },
  'Baby Cobra':              { src: '/exercises/baby-cobra.jpg',              offsetX: 0 },
  'Foam Roller Thoracic Extension': { src: '/exercises/foam-roller-thoracic-extension.jpg', offsetX: 0 },
  'Quadruped Thoracic Rotation (Hand Behind Head)': { src: '/exercises/quadruped-thoracic-rotation.jpg', offsetX: 0 },
  'Thoracic Extension':      { src: '/exercises/thoracic-extension.jpg',      offsetX: 0 },
  'Wall Assisted Shoulder Flexion': { src: '/exercises/wall-assisted-shoulder-flexion.jpg', offsetX: 0 },
  'Wall Slide':              { src: '/exercises/wall-slide.jpg',              offsetX: 0 },
  'Scapular Rows':           { src: '/exercises/scapular-rows.jpg',           offsetX: 0 },
  'Sphinx Cat Camels':       { src: '/exercises/sphinx-cat-camels.jpg',       offsetX: 0 },
  'Banded Reverse Fly':      { src: '/exercises/Banded Reverse Fly.png',      offsetX: 0 },
  'Lower Trap Activation':   { src: '/exercises/lower-trap-activation.jpg',   offsetX: 0 },
  'Levator Scapulae Stretch':{ src: '/exercises/levator-scapulae-stretch.jpg',offsetX: 0 },
  'Wall Lean':               { src: '/exercises/wall-lean.jpg',               offsetX: 0 },
  'Single-Arm Plank':        { src: '/exercises/single-arm-plank.jpg',        offsetX: 0 },
  'Advanced Bird Dog':       { src: '/exercises/advanced-bird-dog.jpg',       offsetX: 0 },
  'Banded Lat Pull-Down':    { src: '/exercises/banded-lat-pull-down.jpg',    offsetX: 0 },
  'Half Kneel Pallof Press': { src: '/exercises/half-kneel-pallof-press.jpg', offsetX: 0 },
  'Chin Tuck Neck Bridge':   { src: '/exercises/chin-tuck-neck-bridge.jpg',   offsetX: 0 },
  'Quadruped Scapular Push': { src: '/exercises/quadruped-scapular-push.jpg', offsetX: 0 },
  'Air Angel':               { src: '/exercises/air-angel.jpg', offsetX: 9 },
  'Floor Angel':             { src: '/exercises/floor-angel.jpg', offsetX: 11 },
  'Chin Tuck Floor Angels':  { src: '/exercises/floor-angel.jpg', offsetX: 10 },
  'Chin Tuck Rotations':     { src: '/exercises/chin-tuck-rotations.jpg', offsetX: 5 },
  'Prone Chin Tuck':         { src: '/exercises/prone-chin-tuck.jpg' },
  'Banded Chin Tucks':       { src: '/exercises/banded-chin-tucks.jpg' },
  'Wall Lean Chin Tuck':     { src: '/exercises/wall-lean-chin-tuck.jpg' },
  'Chin Tuck':               { src: '/exercises/chin-tuck.jpg' },
  'Supine Chin Tuck':        { src: '/exercises/supine-chin-tuck.jpg' },
  'Upper Trapezius Stretch': { src: '/exercises/upper-trapezius-stretch.jpg' },
  'Side Lying Chin Tuck':    { src: '/exercises/side-lying-chin-tuck.jpg' },
  'Thoracic Openers':        { src: '/exercises/thoracic-openers.jpg' },
  'Seated Floor Taps':       { src: '/exercises/seated-floor-taps.jpg' },
  'Side Lean Wall Slide':    { src: '/exercises/side-lean-wall-slide.jpg' },
  'Wall Angel':              { src: '/exercises/wall-angel.jpg' },
  'Scapular Flutters':       { src: '/exercises/scapular-flutters.jpg' },
  'Prisoner Rotation':       { src: '/exercises/prisoner-rotation.jpg' },
  'Prayer Stretch':         { src: '/exercises/prayer-stretch.jpg' },
  'Plank Plus':             { src: '/exercises/plank-plus.jpg' },
  'Quadruped Scapular Circles': { src: '/exercises/quadruped-scapular-circles.jpg' },
  'Bear Crawl Scapular Push Up': { src: '/exercises/bear-crawl-scapular-push-up.jpg' },
  'Elevated Scapular Push Up': { src: '/exercises/elevated-scapular-push-up.jpg' },
  'Standing Pelvic Tilt':    { src: '/exercises/standing-pelvic-tilt.jpg' },
  'Supine Pelvic Tilt':      { src: '/exercises/supine-pelvic-tilt.jpg' },
  'Pelvic Rocks':            { src: '/exercises/pelvic-rocks.jpg' },
  'TVA Frog Leg':            { src: '/exercises/tva-frog-leg.jpg' },
  'Frog Stretch':            { src: '/exercises/frog-stretch.jpg' },
  'Wall Lean Plank':         { src: '/exercises/wall-lean-plank.jpg' },
  'Swimmers':                { src: '/exercises/swimmers.jpg' },
  'Chair Supported Squat':   { src: '/exercises/chair-supported-squat.jpg' },
  '90 degree Hip Hinge':     { src: '/exercises/90-degree-hip-hinge.jpg' },
  'Adductor Squeeze Crunch': { src: '/exercises/adductor-squeeze-crunch.jpg' },
  'Crossed Leg Forward Stretch': { src: '/exercises/crossed-leg-forward-stretch.jpg' },
  'Bird Dog':                { src: '/exercises/bird-dog.jpg' },
  'Side Plank':              { src: '/exercises/side-plank.jpg' },
  'Archer Push-Up':          { src: '/exercises/archer-push-up.jpg' },
  'Push-Up Plus':            { src: '/exercises/push-up-plus.jpg' },
  'Prone Y-Raise':           { src: '/exercises/prone-y-raise.jpg' },
  'Split Squat Pelvic Tilts':{ src: '/exercises/split-squat-pelvic-tilts.jpg' },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#22C55E',
  medium:   '#EAB308',
  hard:     '#EF4444',
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
    width: 28, height: 28,
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: T.text2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: T.font,
    borderRadius: 8,
  };
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 12px',
        background: T.pillTrack,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.04)',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 10,
          color: T.text3,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontFamily: T.font,
        }}
      >
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button
          type="button"
          onClick={disableDec ? undefined : onDec}
          disabled={disableDec}
          style={{ ...btn, opacity: disableDec ? 0.3 : 1 }}
          aria-label="decrement"
        >
          {isRange ? (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>

        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: T.text,
            fontFamily: T.font,
            letterSpacing: '-0.01em',
            flex: 1, textAlign: 'center',
          }}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={disableInc ? undefined : onInc}
          disabled={disableInc}
          style={{ ...btn, opacity: disableInc ? 0.3 : 1 }}
          aria-label="increment"
        >
          {isRange ? (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
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
          padding: '32px 20px 120px',
        }}
      >
        <div style={{ maxWidth: 672, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <header style={{ marginBottom: 4 }}>
            <button
              type="button"
              onClick={() => navigate('/program')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', fontFamily: T.font,
                color: T.text3, fontSize: 13, fontWeight: 500,
                marginBottom: 14,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', margin: 0, marginBottom: 6 }}>
                  Customize
                </p>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: T.text, lineHeight: 1 }}>
                  Edit Routine
                </h1>
              </div>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: T.orange,
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: T.font,
                  letterSpacing: '-0.01em',
                  boxShadow: '0 6px 14px -4px rgba(249,115,22,0.4)',
                  flexShrink: 0,
                }}
              >
                Save
              </button>
            </div>
          </header>

          {/* Summary box */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text2, fontWeight: 500 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                {exercises.length} moves
              </span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.text4 }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text2, fontWeight: 500 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {program.totalDurationMin} min
              </span>
            </div>
          </div>

          {/* Exercise list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {exercises.map((ex) => {
              const isStrength = isStrengthExercise(ex.name);
              const diffLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard';
              const diffColor = DIFFICULTY_COLOR[ex.difficulty] ?? T.text2;
              const durIdx = DURATION_PRESETS.indexOf(ex.duration);
              const repIdx = REPS_PRESETS.indexOf(ex.displayReps);
              const isHover = hoverId === ex.id;
              const imageCfg = EXERCISE_IMAGES[ex.name];
              const imageOffsetX = imageCfg?.offsetX ?? DEFAULT_IMAGE_OFFSET_X;

              return (
                <div
                  key={ex.id}
                  onMouseEnter={() => setHoverId(ex.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{
                    position: 'relative',
                    background: T.card,
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: `1px solid ${isHover ? T.borderHover : T.border}`,
                    backdropFilter: 'blur(8px)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* Top row: image + name + actions */}
                  <div style={{ display: 'flex', gap: 14, padding: 14 }}>
                    {/* Exercise thumbnail */}
                    <div style={{
                      width: 88, height: 88, borderRadius: 14,
                      overflow: 'hidden', background: '#0F0F12',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {imageCfg ? (
                        <img
                          src={imageCfg.src}
                          alt={ex.name}
                          style={{
                            width: '100%', height: '100%',
                            objectFit: 'contain', display: 'block',
                            transform: `translateX(${imageOffsetX * 0.45}px) scale(1.18)`,
                            transformOrigin: 'center',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 36, opacity: 0.7 }} aria-hidden>{ex.emoji}</span>
                      )}
                    </div>

                    {/* Title + difficulty + actions */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h3 style={{
                            fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em',
                            color: T.text, margin: 0, lineHeight: 1.25,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {ex.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <span style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: diffColor,
                            }} />
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: diffColor,
                              letterSpacing: '0.04em', textTransform: 'uppercase',
                            }}>
                              {diffLabel}
                            </span>
                          </div>
                        </div>
                        <IconDeleteButton onClick={() => handleRemove(ex.id)} />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSwapTarget(ex.id)}
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: 8,
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 10px', borderRadius: 8,
                          background: T.orangeSoft, border: 'none',
                          color: T.orange, fontSize: 11, fontWeight: 600,
                          letterSpacing: '0.02em',
                          cursor: 'pointer', fontFamily: T.font,
                        }}
                      >
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="17 1 21 5 17 9" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <polyline points="7 23 3 19 7 15" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                        Change move
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 14px' }} />

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: 10, padding: 14, flexWrap: 'wrap' }}>
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

                  {/* Tags */}
                  {ex.targetProblemLabels.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 14px 14px' }}>
                      {ex.targetProblemLabels.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.04)',
                            color: T.text2,
                            border: '1px solid rgba(255,255,255,0.05)',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </Layout>
  );
};

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
        width: 32, height: 32,
        color: hover ? '#EF4444' : T.text3,
        background: hover ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.04)',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.15s ease, background 0.15s ease',
        flexShrink: 0,
      }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
