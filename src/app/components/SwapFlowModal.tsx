import React, { useState } from 'react';
import { postureProblems, type Exercise, type PostureProblem } from '../data/postureData';
import { type StoredDailyProgram } from '../services/DailyProgram';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: '#111111',
  sheet: '#1C1C1E',       // iOS system grouped background
  cell: '#2C2C2E',        // iOS cell background (dark)
  separator: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  text2: 'rgba(235,235,245,0.6)',   // iOS secondary label
  text3: 'rgba(235,235,245,0.3)',   // iOS tertiary label
  gold: '#D9B84C',
  orange: '#FF9F0A',    // iOS system orange
  green: '#30D158',     // iOS system green
  blue: '#0A84FF',      // iOS system blue
  tint: '#D9B84C',      // app tint
  font: "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
};

const DIFF_LABEL: Record<string, string> = { beginner: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_COLOR: Record<string, string> = { beginner: T.green, medium: T.gold, hard: T.orange };

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function isExerciseSelectable(
  program: StoredDailyProgram,
  exercise: Exercise,
  excludeId: string,
): boolean {
  const otherNames = new Set(
    program.exercises.filter(e => e.id !== excludeId).map(e => e.name),
  );
  return !otherNames.has(exercise.name);
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** iOS-style inset grouped section wrapper */
const Section: React.FC<{
  label?: string;
  labelColor?: string;
  children: React.ReactNode;
}> = ({ label, labelColor, children }) => (
  <div style={{ marginBottom: 24 }}>
    {label && (
      <div style={{
        fontSize: 13, fontWeight: 600, fontFamily: T.font,
        color: labelColor ?? T.text2,
        letterSpacing: '0.02em',
        marginBottom: 8, paddingLeft: 4,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    )}
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: T.cell,
    }}>
      {children}
    </div>
  </div>
);

/** Hairline separator between rows */
const RowSep = () => (
  <div style={{ height: 1, background: T.separator, marginLeft: 16 }} />
);

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  swapExerciseId: string;
  program: StoredDailyProgram;
  detectedProblemIds: string[];
  hasEquipment: boolean;
  onReplace: (exercise: Exercise) => void;
  onClose: () => void;
}

const SwapFlowModal: React.FC<Props> = ({
  swapExerciseId,
  program,
  onReplace,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProblem, setSelectedProblem] = useState<PostureProblem | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const swapEx = program.exercises.find(e => e.id === swapExerciseId);
  const swapExName = swapEx?.name ?? '';
  const targetSet = new Set(swapEx?.targetProblemIds ?? []);

  function handleSelectProblem(problem: PostureProblem) {
    setSelectedProblem(problem);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setSelectedProblem(null);
  }

  function handleSelectExercise(exercise: Exercise) {
    if (!isExerciseSelectable(program, exercise, swapExerciseId)) return;
    setConfirmedId(exercise.id);
    setTimeout(() => { onReplace(exercise); onClose(); }, 480);
  }

  const grouped = selectedProblem ? {
    beginner: selectedProblem.exerciseList.filter(e => (e.difficulty ?? 'beginner') === 'beginner'),
    medium:   selectedProblem.exerciseList.filter(e => e.difficulty === 'medium'),
    hard:     selectedProblem.exerciseList.filter(e => e.difficulty === 'hard'),
  } as const : null;

  return (
    <>
      {/* ── Dim backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 200,
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* ── Sheet ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 201,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        // slide up from bottom
        animation: 'swapSheetIn 0.36s cubic-bezier(0.32, 0.72, 0, 1) both',
      }}>
        <style>{`
          @keyframes swapSheetIn {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* ── Drag handle ── */}
        <div style={{
          paddingTop: 'max(14px, env(safe-area-inset-top))',
          display: 'flex', justifyContent: 'center', paddingBottom: 6,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 5, borderRadius: 3,
            background: 'rgba(255,255,255,0.18)',
          }} />
        </div>

        {/* ── Navigation bar (iOS 44pt) ── */}
        <div style={{
          height: 44,
          display: 'flex', alignItems: 'center',
          paddingLeft: 8, paddingRight: 8,
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Left — back or close */}
          <button
            type="button"
            onClick={step === 2 ? handleBack : onClose}
            style={{
              minWidth: 44, height: 44,
              background: 'none', border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 3,
              color: T.tint,
              padding: '0 4px',
              flexShrink: 0,
            }}
          >
            {step === 2 ? (
              <>
                <svg width={11} height={18} viewBox="0 0 11 18" fill="none">
                  <path d="M9.5 1.5L2 9l7.5 7.5" stroke={T.tint} strokeWidth={2.2}
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 17, fontFamily: T.font, color: T.tint }}>Back</span>
              </>
            ) : (
              <span style={{ fontSize: 17, fontFamily: T.font, color: T.tint }}>Close</span>
            )}
          </button>

          {/* Center — title */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: 17, fontWeight: 600, fontFamily: T.font,
              color: T.text, letterSpacing: '-0.02em',
            }}>
              {step === 1 ? 'Replace Exercise' : selectedProblem?.title}
            </span>
          </div>

          {/* Right — step pills */}
          <div style={{
            marginLeft: 'auto', display: 'flex', gap: 5,
            paddingRight: 4, flexShrink: 0,
          }}>
            <div style={{
              width: 18, height: 4, borderRadius: 2,
              background: T.tint,
            }} />
            <div style={{
              width: 18, height: 4, borderRadius: 2,
              background: step === 2 ? T.tint : 'rgba(255,255,255,0.18)',
              transition: 'background 0.25s ease',
            }} />
          </div>
        </div>

        {/* ── Context bar — "replacing: Name" ── */}
        <div style={{
          height: 36,
          display: 'flex', alignItems: 'center',
          paddingLeft: 16, paddingRight: 16,
          background: 'rgba(255,255,255,0.03)',
          borderTop: `1px solid ${T.separator}`,
          borderBottom: `1px solid ${T.separator}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, fontFamily: T.font, color: T.text3 }}>
            Replacing
          </span>
          <span style={{ fontSize: 12, fontFamily: T.font, color: T.text2, marginLeft: 5, fontWeight: 500 }}>
            {swapExName}
          </span>
          {step === 1 && (
            <span style={{ fontSize: 12, fontFamily: T.font, color: T.text3, marginLeft: 'auto' }}>
              Step {step} of 2
            </span>
          )}
        </div>

        {/* ── Scrollable content ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
          overscrollBehavior: 'contain',
          padding: '16px 16px',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        } as React.CSSProperties}>

          {/* ════ STEP 1 — Category grid ════ */}
          {step === 1 && (
            <>
              {/* Hint text */}
              <div style={{
                fontSize: 13, fontFamily: T.font, color: T.text3,
                marginBottom: 16, lineHeight: 1.5,
              }}>
                Select a posture category to browse replacement exercises.
                {targetSet.size > 0 && (
                  <span style={{ color: T.tint }}> Highlighted categories match this exercise.</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {postureProblems.map(problem => {
                  const isTarget = targetSet.has(problem.id);
                  return (
                    <button
                      key={problem.id}
                      type="button"
                      onClick={() => handleSelectProblem(problem)}
                      style={{
                        background: T.cell,
                        border: `1.5px solid ${isTarget ? T.tint : 'transparent'}`,
                        borderRadius: 16,
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: T.font,
                        overflow: 'hidden',
                        position: 'relative',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {/* Gold dot for targeted categories */}
                      {isTarget && (
                        <div style={{
                          position: 'absolute', top: 9, right: 9, zIndex: 1,
                          width: 8, height: 8, borderRadius: '50%',
                          background: T.tint,
                          boxShadow: `0 0 0 2px ${T.cell}`,
                        }} />
                      )}

                      {/* Image */}
                      <div style={{
                        width: '100%', height: 100,
                        background: '#0A0A0A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        <img
                          src={problem.cardImage}
                          alt={problem.title}
                          style={{
                            width: '100%', height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      {/* Label */}
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{
                          fontSize: 14, fontWeight: 600, color: T.text,
                          letterSpacing: '-0.01em', lineHeight: 1.2,
                          marginBottom: 3,
                        }}>
                          {problem.title}
                        </div>
                        <div style={{ fontSize: 12, color: T.text3 }}>
                          {problem.exerciseList.length} exercises
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ════ STEP 2 — Exercise list ════ */}
          {step === 2 && grouped && selectedProblem && (
            <div>
              {(['beginner', 'medium', 'hard'] as const).map(diff => {
                const exercises = grouped[diff];
                if (exercises.length === 0) return null;

                return (
                  <Section
                    key={diff}
                    label={DIFF_LABEL[diff]}
                    labelColor={DIFF_COLOR[diff]}
                  >
                    {exercises.map((exercise, idx) => {
                      const selectable = isExerciseSelectable(program, exercise, swapExerciseId);
                      const confirmed = confirmedId === exercise.id;
                      const exDiff = exercise.difficulty ?? 'beginner';
                      const vidId = exercise.youtubeUrl
                        ? extractVideoId(exercise.youtubeUrl)
                        : (exercise.videoId ?? null);

                      return (
                        <React.Fragment key={exercise.id}>
                          {idx > 0 && <RowSep />}
                          <div style={{
                            padding: '14px 16px',
                            opacity: selectable ? 1 : 0.38,
                            background: confirmed
                              ? 'rgba(48, 209, 88, 0.10)'
                              : 'transparent',
                            transition: 'background 0.3s ease',
                          }}>
                            {/* Row top: emoji + name + badge */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                              <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
                                {exercise.emoji}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: 15, fontWeight: 600, color: T.text,
                                  fontFamily: T.font, letterSpacing: '-0.02em',
                                  marginBottom: 4,
                                }}>
                                  {exercise.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, fontFamily: T.font,
                                    color: DIFF_COLOR[exDiff],
                                    background: `${DIFF_COLOR[exDiff]}20`,
                                    padding: '2px 8px', borderRadius: 20,
                                    letterSpacing: '0.01em',
                                  }}>
                                    {DIFF_LABEL[exDiff]}
                                  </span>
                                  {!selectable && (
                                    <span style={{
                                      fontSize: 11, fontFamily: T.font, color: T.text3,
                                    }}>
                                      Already in program
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div style={{
                              fontSize: 13, color: T.text2, fontFamily: T.font,
                              lineHeight: 1.5, marginBottom: 12,
                              paddingLeft: 38, // align with text above
                            }}>
                              {exercise.description}
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 8, paddingLeft: 38 }}>
                              {vidId && (
                                <button
                                  type="button"
                                  onClick={() => setActiveVideoId(vidId)}
                                  style={{
                                    height: 36, flex: 1,
                                    background: 'rgba(255,255,255,0.07)',
                                    border: `1px solid ${T.border2}`,
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 6,
                                    fontFamily: T.font,
                                    WebkitTapHighlightColor: 'transparent',
                                  }}
                                >
                                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke={T.text2} strokeWidth={1.5} />
                                    <polygon points="10 8 16 12 10 16 10 8" fill={T.text2} />
                                  </svg>
                                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text2 }}>Demo</span>
                                </button>
                              )}

                              {selectable && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectExercise(exercise)}
                                  disabled={!!confirmedId}
                                  style={{
                                    height: 36, flex: 1,
                                    background: confirmed ? T.green : T.tint,
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: confirmedId ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 6,
                                    fontFamily: T.font,
                                    transition: 'background 0.3s ease',
                                    WebkitTapHighlightColor: 'transparent',
                                  }}
                                >
                                  {confirmed ? (
                                    <>
                                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                        <polyline points="20 6 9 17 4 12" stroke="#000" strokeWidth={2.5}
                                          strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Added</span>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Select</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </Section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Video overlay ── */}
      {activeVideoId && (
        <>
          <div
            onClick={() => setActiveVideoId(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.92)',
              zIndex: 300,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(82vw, 320px)',
            aspectRatio: '9 / 16',
            zIndex: 301,
            borderRadius: 20,
            overflow: 'hidden',
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button
            type="button"
            onClick={() => setActiveVideoId(null)}
            style={{
              position: 'fixed', zIndex: 302,
              top: 'max(54px, calc(env(safe-area-inset-top) + 10px))',
              right: 16,
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'rgba(60,60,67,0.6)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </>
      )}
    </>
  );
};

export default SwapFlowModal;
