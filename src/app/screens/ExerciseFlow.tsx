import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postureProblems, Exercise } from '../data/postureData';

const ExerciseFlow: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === problemId);

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'active' | 'rest'>('intro');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const exercise: Exercise | undefined = problem?.exercises[currentExIndex];
  const totalExercises = problem?.exercises.length || 0;
  const progress = totalExercises > 0 ? ((currentExIndex) / totalExercises) * 100 : 0;

  const startExercise = useCallback(() => {
    if (exercise) {
      setPhase('active');
      setTimeLeft(exercise.duration);
      setIsPaused(false);
    }
  }, [exercise]);

  useEffect(() => {
    if (phase !== 'active' || isPaused || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentExIndex < totalExercises - 1) {
            setPhase('rest');
            return 10; // 10 second rest
          } else {
            navigate(`/completion/${problemId}`);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isPaused, timeLeft, currentExIndex, totalExercises, navigate, problemId]);

  useEffect(() => {
    if (phase !== 'rest' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCurrentExIndex(i => i + 1);
          setPhase('intro');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  if (!problem || !exercise) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Exercise not found</p>
        <button onClick={() => navigate('/')} style={{
          marginTop: 16, padding: '10px 24px', borderRadius: 12,
          background: 'var(--color-primary)', color: 'white', fontWeight: 600,
        }}>Go Home</button>
      </div>
    );
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 45;
  const totalDuration = phase === 'active' ? exercise.duration : 10;
  const strokeOffset = circumference - (timeLeft / totalDuration) * circumference;

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: 'var(--color-bg)', display: 'flex', flexDirection: 'column',
      boxShadow: '0 0 60px rgba(0,0,0,0.08)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '52px 20px 16px', position: 'relative',
      }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--color-surface)', border: '1px solid var(--color-border-light)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Exercise {currentExIndex + 1} of {totalExercises}
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{
          height: 6, borderRadius: 3, background: 'var(--color-surface-raised)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: `linear-gradient(90deg, ${problem.color}, ${problem.color}BB)`,
            width: `${progress}%`, transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px' }}>
        {phase === 'rest' ? (
          /* Rest screen */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            animation: 'scaleIn 0.4s ease',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16, animation: 'breathe 2s ease infinite' }}>😮‍💨</div>
            <h2 style={{
              fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 8,
            }}>Rest</h2>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 32 }}>
              Next: {problem.exercises[currentExIndex + 1]?.name}
            </p>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-raised)" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-accent)"
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
              }}>{timeLeft}</div>
            </div>
          </div>
        ) : phase === 'intro' ? (
          /* Intro screen */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', paddingTop: 20,
            animation: 'slideUp 0.5s ease',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: 28,
              background: problem.bgColor, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 52, marginBottom: 24,
              boxShadow: `0 8px 32px ${problem.color}15`,
            }}>
              {exercise.imageEmoji}
            </div>
            <h2 style={{
              fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.01em',
            }}>{exercise.name}</h2>
            <p style={{
              fontSize: 14, color: 'var(--color-text-secondary)',
              lineHeight: 1.6, marginBottom: 24, maxWidth: 320,
            }}>{exercise.description}</p>

            {/* Difficulty & Duration badges */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px',
                borderRadius: 10, background: problem.bgColor, color: problem.color,
              }}>{exercise.duration}s</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '6px 14px',
                borderRadius: 10, background: 'var(--color-surface-raised)', color: 'var(--color-text-secondary)',
                textTransform: 'capitalize',
              }}>{exercise.difficulty}</span>
            </div>

            {/* Instructions */}
            <div style={{
              width: '100%', background: 'var(--color-surface)',
              borderRadius: 16, padding: 20, textAlign: 'left',
              border: '1px solid var(--color-border-light)',
            }}>
              <h4 style={{
                fontSize: 14, fontWeight: 700, color: 'var(--color-text)',
                marginBottom: 12, fontFamily: 'var(--font-display)',
              }}>Instructions</h4>
              {exercise.instructions.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, marginBottom: i < exercise.instructions.length - 1 ? 10 : 0,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7,
                    background: problem.bgColor, color: problem.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>

            {/* Start button */}
            <button
              onClick={startExercise}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: `linear-gradient(135deg, ${problem.color}, ${problem.color}DD)`,
                color: 'white', fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-display)', marginTop: 24, marginBottom: 24,
                boxShadow: `0 8px 24px ${problem.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              Start Exercise
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        ) : (
          /* Active exercise timer */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            animation: 'scaleIn 0.4s ease',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20, animation: 'breathe 3s ease infinite' }}>
              {exercise.imageEmoji}
            </div>
            <h2 style={{
              fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)', marginBottom: 16,
            }}>{exercise.name}</h2>

            {/* Timer ring */}
            <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 32 }}>
              <svg width="180" height="180" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-surface-raised)" strokeWidth="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={problem.color}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontSize: 40, fontWeight: 800, fontFamily: 'var(--font-display)',
                  color: 'var(--color-text)', letterSpacing: '-0.02em',
                }}>{formatTime(timeLeft)}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  remaining
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: isPaused ? problem.color : 'var(--color-surface)',
                  border: isPaused ? 'none' : `2px solid ${problem.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isPaused ? `0 4px 16px ${problem.color}30` : 'var(--shadow-md)',
                  transition: 'all 0.25s ease',
                }}
              >
                {isPaused ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={problem.color} stroke="none">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  if (currentExIndex < totalExercises - 1) {
                    setCurrentExIndex(i => i + 1);
                    setPhase('intro');
                  } else {
                    navigate(`/completion/${problemId}`);
                  }
                }}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--color-surface)', border: '2px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4" fill="var(--color-text-secondary)" stroke="none" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>

            {isPaused && (
              <div style={{
                marginTop: 16, fontSize: 14, fontWeight: 600,
                color: problem.color, animation: 'pulse 1.5s ease infinite',
              }}>Paused</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseFlow;
