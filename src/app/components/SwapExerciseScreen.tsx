import React, { useMemo, useState } from 'react';
import { postureProblems, type Exercise, type PostureProblem } from '../data/postureData';
import { type StoredDailyProgram } from '../services/DailyProgram';

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

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

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

function difficultyLabel(diff?: string): string {
  if (diff === 'medium') return 'Medium';
  if (diff === 'hard') return 'Hard';
  return 'Beginner';
}

function matchScore(isTarget: boolean, selectable: boolean, difficulty?: string): number {
  let score = isTarget ? 92 : 78;
  if (difficulty === 'medium') score -= 4;
  if (difficulty === 'hard') score -= 8;
  if (!selectable) score -= 18;
  return Math.max(60, Math.min(97, score));
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
  const [search, setSearch] = useState('');
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const swapEx = program.exercises.find(e => e.id === swapExerciseId);
  const swapExName = swapEx?.name ?? '';
  const targetSet = new Set(swapEx?.targetProblemIds ?? []);

  const categoryExercises = useMemo(() => {
    if (!selectedProblem) return [];
    return [...selectedProblem.exerciseList].sort((a, b) => {
      const aSelectable = isExerciseSelectable(program, a, swapExerciseId);
      const bSelectable = isExerciseSelectable(program, b, swapExerciseId);
      if (aSelectable !== bSelectable) return aSelectable ? -1 : 1;
      const rank = (d?: string) => d === 'hard' ? 2 : d === 'medium' ? 1 : 0;
      return rank(a.difficulty) - rank(b.difficulty);
    });
  }, [program, selectedProblem, swapExerciseId]);

  const filteredExercises = useMemo(() => {
    return categoryExercises.filter(ex =>
      ex.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categoryExercises, search]);

  function handleCategorySelect(problem: PostureProblem) {
    setSelectedProblem(problem);
    setSelectedExerciseId(null);
    setSearch('');
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setSelectedProblem(null);
    setSelectedExerciseId(null);
    setSearch('');
  }

  function handleConfirm() {
    if (!selectedExerciseId) return;
    const exercise = categoryExercises.find(ex => ex.id === selectedExerciseId);
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
            <div style={{ position: 'relative', marginTop: 16 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: '11px 14px 11px 38px',
                  color: T.text,
                  fontSize: 13,
                  fontFamily: T.font,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: targetSet.has(selectedProblem.id) ? T.gold2 : T.text2 }}>
                {selectedProblem.title}
              </span>
              <span style={{ fontSize: 10, color: T.text4 }}>
                {filteredExercises.length} available
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredExercises.map((exercise) => {
                const selectable = isExerciseSelectable(program, exercise, swapExerciseId);
                const selected = selectedExerciseId === exercise.id;
                const match = matchScore(targetSet.has(selectedProblem.id), selectable, exercise.difficulty);
                const vidId = exercise.youtubeUrl ? extractVideoId(exercise.youtubeUrl) : (exercise.videoId ?? null);

                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => selectable && setSelectedExerciseId(selected ? null : exercise.id)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: 18,
                      overflow: 'hidden',
                      padding: 0,
                      border: `1px solid ${selected ? 'rgba(249,115,22,0.30)' : 'rgba(255,255,255,0.04)'}`,
                      background: selected ? 'rgba(249,115,22,0.06)' : T.surface,
                      cursor: selectable ? 'pointer' : 'default',
                      opacity: selectable ? 1 : 0.42,
                    }}
                  >
                    {selected && (
                      <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 96, height: 96, borderRadius: '50%', background: 'rgba(249,115,22,0.10)', filter: 'blur(30px)', pointerEvents: 'none' }} />
                    )}
                    <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.15, color: selected ? '#FDBA74' : T.text, margin: 0 }}>
                              {exercise.name}
                            </h3>
                            <span style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 6,
                              border: `1px solid ${match >= 90 ? 'rgba(16,185,129,0.20)' : match >= 80 ? 'rgba(45,212,191,0.20)' : 'rgba(113,113,122,0.20)'}`,
                              background: match >= 90 ? 'rgba(16,185,129,0.10)' : match >= 80 ? 'rgba(45,212,191,0.10)' : 'rgba(113,113,122,0.10)',
                              color: match >= 90 ? '#34D399' : match >= 80 ? '#2DD4BF' : T.text2,
                            }}>
                              {match}%
                            </span>
                          </div>
                          <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                            {exercise.duration}s · {difficultyLabel(exercise.difficulty)}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: targetSet.has(selectedProblem.id) ? T.gold2 : T.text2 }}>
                              {selectedProblem.title}
                            </span>
                            {!selectable && (
                              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: T.text4 }}>
                                Already in program
                              </span>
                            )}
                          </div>
                          {selected && vidId && (
                            <div style={{ marginTop: 12 }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveVideoId(vidId);
                                }}
                                style={{
                                  height: 34,
                                  padding: '0 12px',
                                  borderRadius: 10,
                                  background: 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${T.border2}`,
                                  color: T.text2,
                                  cursor: 'pointer',
                                  fontFamily: T.font,
                                  fontSize: 12,
                                }}
                              >
                                Demo
                              </button>
                            </div>
                          )}
                        </div>
                        <div style={{
                          flexShrink: 0,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: selected ? T.gold : 'rgba(255,255,255,0.04)',
                          border: selected ? 'none' : `1px solid ${T.border}`,
                        }}>
                          {selected && (
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
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

      {activeVideoId && (
        <>
          <div
            onClick={() => setActiveVideoId(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              zIndex: 300,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
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
              position: 'fixed',
              zIndex: 302,
              top: 'max(54px, calc(env(safe-area-inset-top) + 10px))',
              right: 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(60,60,67,0.6)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </>
      )}
    </>
  );
};

export default SwapExerciseScreen;
