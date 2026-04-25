import React, { useMemo, useState } from 'react';
import DifficultySelector from './DifficultySelector';
import BandBadge, { displayName, hasBandBadge } from './BandBadge';
import { postureProblems, type Exercise, type PostureProblem } from '../data/postureData';
import { type StoredDailyProgram } from '../services/DailyProgram';
import { loadUserProfile, saveUserProfile, type ExerciseDifficulty } from '../services/UserProfile';

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
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const CARD_T = {
  text: '#FFFFFF',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
};

const DIFFICULTY_LABEL_COLOR: Record<string, string> = {
  beginner: '#22C55E',
  medium:   '#EAB308',
  hard:     '#EF4444',
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
  'Thoracic Openers':        { src: '/exercises/thoracic-openers.jpg' },
  'Side Lean Wall Slide':    { src: '/exercises/side-lean-wall-slide.jpg' },
  'Wall Angel':              { src: '/exercises/wall-angel.jpg' },
  'Scapular Flutters':       { src: '/exercises/scapular-flutters.jpg' },
  'Prisoner Rotation':       { src: '/exercises/prisoner-rotation.jpg' },
  'Prayer Stretch':         { src: '/exercises/prayer-stretch.jpg' },
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

function isExerciseSelectable(
  program: StoredDailyProgram,
  exercise: Exercise,
  excludeId: string,
): boolean {
  const otherNames = new Set(
    program.exercises.filter(e => e.id !== excludeId).map(e => e.name),
  );
  return !otherNames.has(exercise.name);
}

interface Props {
  swapExerciseId: string;
  program: StoredDailyProgram;
  onReplace: (exercise: Exercise) => void;
  onClose: () => void;
}

const SwapExerciseScreen: React.FC<Props> = ({
  swapExerciseId,
  program,
  onReplace,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProblem, setSelectedProblem] = useState<PostureProblem | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [bandTooltip, setBandTooltip] = useState<string | null>(null);
  const [exerciseDifficulty, setExerciseDifficulty] = useState<ExerciseDifficulty>(() => {
    const profile = loadUserProfile();
    return profile?.exerciseDifficulty ?? 'beginner';
  });

  const swapEx = program.exercises.find(e => e.id === swapExerciseId);
  const swapExName = swapEx?.name ?? '';
  const targetSet = new Set(swapEx?.targetProblemIds ?? []);

  const exercisesForDifficulty = useMemo(() => {
    if (!selectedProblem) return [];
    return selectedProblem.exerciseList.filter(
      e => !e.difficulty || e.difficulty === exerciseDifficulty,
    );
  }, [selectedProblem, exerciseDifficulty]);

  function handleCategorySelect(problem: PostureProblem) {
    setSelectedProblem(problem);
    setSelectedExerciseId(null);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setSelectedProblem(null);
    setSelectedExerciseId(null);
  }

  function handleDifficultyChange(d: ExerciseDifficulty) {
    setExerciseDifficulty(d);
    saveUserProfile({ exerciseDifficulty: d });
  }

  function handleSelectExercise(exercise: Exercise) {
    if (!isExerciseSelectable(program, exercise, swapExerciseId)) return;
    setSelectedExerciseId(exercise.id);
  }

  function handleConfirm() {
    if (!selectedExerciseId || !selectedProblem) return;
    const exercise = selectedProblem.exerciseList.find(ex => ex.id === selectedExerciseId);
    if (!exercise || !isExerciseSelectable(program, exercise, swapExerciseId)) return;
    setConfirmedId(exercise.id);
    window.setTimeout(() => {
      onReplace(exercise);
      onClose();
    }, 420);
  }

  return (
    <>
      <main style={{ padding: '32px 20px 112px', fontFamily: T.font }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <button
            type="button"
            onClick={step === 2 ? handleBack : onClose}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: T.gold2, fontSize: 13, fontFamily: T.font }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {step === 2 ? 'Back' : 'Close'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 4, borderRadius: 999, background: step === 1 ? T.gold : 'rgba(249,115,22,0.3)' }} />
            <div style={{ width: 24, height: 4, borderRadius: 999, background: step === 2 ? T.gold : 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>

        <div style={{ marginTop: 16, marginBottom: 4 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 4 }}>
            {step === 1 ? 'Step 1 - Choose Category' : 'Step 2 - Pick Exercise'}
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: T.text, lineHeight: 1 }}>
            Replace Exercise
          </h1>
        </div>

        <div style={{ position: 'relative', marginTop: 16, borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)', border: `1px solid ${T.border}`, borderRadius: 18 }} />
          <div style={{ position: 'absolute', top: '-40%', left: '-15%', width: 128, height: 128, borderRadius: '50%', background: 'rgba(249,115,22,0.08)', filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 4 }}>
                Replacing
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                {swapExName}
              </p>
            </div>
            {step === 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: T.gold2, textAlign: 'right' }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                </svg>
                <span>Matched categories highlighted</span>
              </div>
            )}
          </div>
        </div>

        {step === 1 && (
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {postureProblems.map((problem) => {
              const isTarget = targetSet.has(problem.id);
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => handleCategorySelect(problem)}
                  style={{
                    position: 'relative',
                    borderRadius: 18,
                    overflow: 'hidden',
                    textAlign: 'left',
                    padding: 0,
                    border: `1px solid ${isTarget ? 'rgba(249,115,22,0.30)' : 'rgba(255,255,255,0.04)'}`,
                    background: T.surface,
                    cursor: 'pointer',
                    minHeight: 112,
                  }}
                >
                  {isTarget && (
                    <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', filter: 'blur(24px)', pointerEvents: 'none' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.72) 100%)', pointerEvents: 'none', zIndex: 1 }} />
                  <div style={{ position: 'absolute', inset: 0, background: '#080809', zIndex: 0 }} />
                  <img
                    src={problem.cardImage}
                    alt={problem.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: problem.cardImageObjectPosition ?? 'center',
                      zIndex: 0,
                      transform: 'scale(1.05)',
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 2, minHeight: 112, padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, color: isTarget ? T.gold2 : T.text2, background: isTarget ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isTarget ? 'rgba(249,115,22,0.20)' : 'rgba(255,255,255,0.06)'}` }}>
                        {problem.exerciseList.length} exercises
                      </span>
                      {isTarget && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 6, background: 'rgba(249,115,22,0.10)', color: T.gold2, fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid rgba(249,115,22,0.20)' }}>
                          Match
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>
                        {problem.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: T.text3 }}>Browse replacements</span>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && selectedProblem && (
          <>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: T.text3, marginBottom: 8 }}>
                Exercise difficulty
              </div>
              <DifficultySelector selected={exerciseDifficulty} onChange={handleDifficultyChange} />
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 20, marginBottom: 12 }}>
              <span style={{ color: targetSet.has(selectedProblem.id) ? T.gold2 : T.text }}>
                {selectedProblem.title}
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.text3, marginLeft: 8 }}>
                {exercisesForDifficulty.length} movements
              </span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {exercisesForDifficulty.map((ex) => {
                const selectable = isExerciseSelectable(program, ex, swapExerciseId);
                const selected = selectedExerciseId === ex.id;
                const levelLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : ex.difficulty === 'hard' ? 'Hard' : '';
                const levelColor = DIFFICULTY_LABEL_COLOR[ex.difficulty ?? 'beginner'] ?? CARD_T.text3;
                const imageCfg = EXERCISE_IMAGES[ex.name];
                const imageOffsetX = imageCfg?.offsetX ?? DEFAULT_IMAGE_OFFSET_X;

                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleSelectExercise(ex)}
                    disabled={!selectable}
                    style={{
                      position: 'relative',
                      borderRadius: 16,
                      overflow: 'hidden',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: selectable ? 'pointer' : 'default',
                      opacity: selectable ? 1 : 0.42,
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: selected ? 'rgba(249,115,22,0.06)' : '#131316',
                        border: `1px solid ${selected ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.04)'}`,
                        borderRadius: 16,
                      }}
                    />
                    {selected && (
                      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 22, height: 22, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(249,115,22,0.4)' }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                          background: '#18181B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {imageCfg ? (
                          <img
                            src={imageCfg.src}
                            alt={ex.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              display: 'block',
                              transform: `translateX(${imageOffsetX}px) scale(1.15)`,
                              transformOrigin: 'center',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 48 }} aria-hidden>{ex.emoji}</span>
                        )}
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <h3 style={{
                            fontSize: 13, fontWeight: 600, color: CARD_T.text, lineHeight: 1.2, margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0,
                          }}>
                            {displayName(ex.name)}
                          </h3>
                          {hasBandBadge(ex) && (
                            <BandBadge exId={ex.id} activeId={bandTooltip} onToggle={setBandTooltip} />
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 10 }}>
                          <span style={{ color: CARD_T.text3 }}>{ex.duration}s</span>
                          {levelLabel && (
                            <>
                              <span style={{ color: CARD_T.text4 }}>·</span>
                              <span style={{ color: levelColor }}>{levelLabel}</span>
                            </>
                          )}
                          {!selectable && (
                            <>
                              <span style={{ color: CARD_T.text4 }}>·</span>
                              <span style={{ color: CARD_T.text4 }}>In program</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedExerciseId && (
              <div style={{ marginTop: 18 }}>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!!confirmedId}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 18,
                    border: 'none',
                    cursor: confirmedId ? 'default' : 'pointer',
                    background: confirmedId ? '#22C55E' : 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: T.font,
                    boxShadow: '0 0 24px rgba(249,115,22,0.22)',
                  }}
                >
                  {confirmedId ? 'Exercise swapped' : 'Swap Exercise'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default SwapExerciseScreen;
