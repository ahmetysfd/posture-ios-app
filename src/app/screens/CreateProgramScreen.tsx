import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems, type Exercise, type PostureProblem } from '../data/postureData';
import { addCustomProgramToLibrary, buildProgramFromPickedExercises } from '../services/DailyProgram';

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

type PickRow = { key: string; exercise: Exercise; appId: string; title: string };

function difficultyLabel(diff?: string): string {
  if (diff === 'medium') return 'Medium';
  if (diff === 'hard') return 'Hard';
  return 'Beginner';
}

const CreateProgramScreen: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'pick' | 'save'>('pick');
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProblem, setSelectedProblem] = useState<PostureProblem | null>(null);
  const [search, setSearch] = useState('');
  const [playlist, setPlaylist] = useState<PickRow[]>([]);
  const [programName, setProgramName] = useState('');

  const namesInPlaylist = useMemo(() => new Set(playlist.map(p => p.exercise.name)), [playlist]);

  const categoryExercises = useMemo(() => {
    if (!selectedProblem) return [];
    return [...selectedProblem.exerciseList].sort((a, b) => {
      const rank = (d?: string) => (d === 'hard' ? 2 : d === 'medium' ? 1 : 0);
      return rank(a.difficulty) - rank(b.difficulty);
    });
  }, [selectedProblem]);

  const filteredExercises = useMemo(() => {
    return categoryExercises.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));
  }, [categoryExercises, search]);

  function handleCategorySelect(problem: PostureProblem) {
    setSelectedProblem(problem);
    setSearch('');
    setStep(2);
  }

  function handleBack() {
    if (phase === 'save') {
      setPhase('pick');
      return;
    }
    if (step === 2) {
      setStep(1);
      setSelectedProblem(null);
      setSearch('');
      return;
    }
    navigate('/program');
  }

  function addExercise(ex: Exercise) {
    if (namesInPlaylist.has(ex.name)) return;
    if (!selectedProblem) return;
    setPlaylist(prev => [
      ...prev,
      {
        key: `${Date.now()}-${ex.id}-${Math.random().toString(36).slice(2, 8)}`,
        exercise: ex,
        appId: selectedProblem.id,
        title: selectedProblem.title,
      },
    ]);
  }

  function removeFromPlaylist(key: string) {
    setPlaylist(prev => prev.filter(p => p.key !== key));
  }

  function handleSaveProgram() {
    if (playlist.length === 0) return;
    const built = buildProgramFromPickedExercises(playlist);
    addCustomProgramToLibrary(programName.trim() || 'My program', built);
    navigate('/program');
  }

  const pickFooter = (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, padding: '12px 20px 92px',
      background: `linear-gradient(to top, ${T.bg} 85%, transparent)`,
      borderTop: `1px solid ${T.border}`,
    }}>
      {playlist.length > 0 && (
        <div style={{ maxHeight: 112, overflowY: 'auto', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {playlist.map(row => (
            <div
              key={row.key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                padding: '8px 10px', borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.exercise.name}
              </span>
              <button
                type="button"
                onClick={() => removeFromPlaylist(row.key)}
                style={{
                  flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
                  padding: '4px 8px', cursor: 'pointer', color: T.text3, fontSize: 11, fontFamily: T.font,
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: T.text2 }}>
          {playlist.length === 0 ? 'Add moves from the list (same as Swap)' : `${playlist.length} move${playlist.length === 1 ? '' : 's'}`}
        </span>
      </div>
      <button
        type="button"
        disabled={playlist.length === 0}
        onClick={() => setPhase('save')}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 18, border: 'none',
          cursor: playlist.length === 0 ? 'default' : 'pointer',
          background: playlist.length === 0
            ? 'rgba(255,255,255,0.06)'
            : 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)',
          color: playlist.length === 0 ? 'rgba(255,255,255,0.25)' : '#fff',
          fontSize: 14, fontWeight: 700, fontFamily: T.font,
          boxShadow: playlist.length === 0 ? 'none' : '0 0 24px rgba(249,115,22,0.22)',
        }}
      >
        Name & save
      </button>
    </div>
  );

  return (
    <Layout>
      <div style={{ minHeight: '100%', background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', color: T.gold2, fontSize: 13, fontFamily: T.font,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 4, borderRadius: 999, background: phase === 'pick' && step === 1 ? T.gold : 'rgba(249,115,22,0.3)' }} />
              <div style={{ width: 24, height: 4, borderRadius: 999, background: phase === 'pick' && step === 2 ? T.gold : phase === 'save' ? T.gold : 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>

          {phase === 'save' ? (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginTop: 16, marginBottom: 4 }}>
                New program
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: T.text, lineHeight: 1.1 }}>
                Name your program
              </h1>
              <p style={{ fontSize: 13, color: T.text2, marginTop: 8, marginBottom: 16 }}>
                It appears in your program menu next to Daily Program.
              </p>
              <input
                type="text"
                value={programName}
                onChange={e => setProgramName(e.target.value)}
                placeholder="e.g. Morning mobility"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: 16,
                  background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 15, fontFamily: T.font, outline: 'none',
                  marginBottom: 20,
                }}
              />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 10 }}>
                Moves ({playlist.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {playlist.map(row => (
                  <div
                    key={row.key}
                    style={{
                      padding: '12px 14px', borderRadius: 14, background: T.surface, border: `1px solid rgba(255,255,255,0.04)`,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{row.exercise.name}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>
                      {row.title} · {row.exercise.duration}s · {difficultyLabel(row.exercise.difficulty)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ marginTop: 16, marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 4 }}>
                  {step === 1 ? 'Step 1 — Category' : 'Step 2 — Exercises'}
                </p>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: T.text, lineHeight: 1.1 }}>
                  Build your program
                </h1>
                <p style={{ fontSize: 13, color: T.text2, marginTop: 8 }}>
                  Pick categories and add moves — same browser as Swap.
                </p>
              </div>

              {step === 1 && (
                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {postureProblems.map(problem => (
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
                        border: '1px solid rgba(255,255,255,0.04)',
                        background: T.surface,
                        cursor: 'pointer',
                        minHeight: 112,
                      }}
                    >
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
                        <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, color: T.text2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', alignSelf: 'flex-start' }}>
                          {problem.exerciseList.length} exercises
                        </span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}>
                            {problem.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <span style={{ fontSize: 11, color: T.text3 }}>Tap to add moves</span>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
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
                      onChange={e => setSearch(e.target.value)}
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
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.gold2 }}>
                      {selectedProblem.title}
                    </span>
                    <span style={{ fontSize: 10, color: T.text4 }}>
                      {filteredExercises.length} shown
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredExercises.map(exercise => {
                      const already = namesInPlaylist.has(exercise.name);
                      return (
                        <div
                          key={exercise.id}
                          style={{
                            position: 'relative',
                            width: '100%',
                            textAlign: 'left',
                            borderRadius: 18,
                            overflow: 'hidden',
                            padding: 0,
                            border: `1px solid rgba(255,255,255,0.04)`,
                            background: T.surface,
                          }}
                        >
                          <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.15, color: T.text, margin: 0 }}>
                                  {exercise.name}
                                </h3>
                                <p style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                                  {exercise.duration}s · {difficultyLabel(exercise.difficulty)}
                                </p>
                                {already && (
                                  <p style={{ fontSize: 10, color: T.text4, marginTop: 8 }}>
                                    Already in your program
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={already}
                                onClick={() => addExercise(exercise)}
                                style={{
                                  flexShrink: 0,
                                  padding: '8px 12px',
                                  borderRadius: 12,
                                  border: 'none',
                                  cursor: already ? 'default' : 'pointer',
                                  background: already ? 'rgba(255,255,255,0.04)' : 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)',
                                  color: already ? T.text4 : '#fff',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  fontFamily: T.font,
                                }}
                              >
                                {already ? 'Added' : 'Add'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </main>

        {phase === 'pick' ? pickFooter : (
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 430, padding: '16px 20px 92px',
            background: `linear-gradient(to top, ${T.bg} 72%, transparent)`,
          }}>
            <button
              type="button"
              onClick={handleSaveProgram}
              style={{
                width: '100%', padding: '16px 0', borderRadius: 18, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: T.font,
                boxShadow: '0 0 24px rgba(249,115,22,0.22)',
              }}
            >
              Save program
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateProgramScreen;
