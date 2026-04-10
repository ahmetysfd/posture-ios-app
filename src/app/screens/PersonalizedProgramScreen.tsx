import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getActiveProgramId,
  loadActiveProgramForSession,
  loadProgramLibrary,
  setActiveProgramId,
  type StoredDailyProgram,
} from '../services/DailyProgram';
import { loadUserProfile } from '../services/UserProfile';

const T = {
  bg: '#09090B', surface: '#141418', border: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.10)', text: '#FFFFFF',
  text2: 'rgba(161,161,170,1)', text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
  gold: '#F97316', gold2: '#FB923C',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

/** Map of exercise name → local image. Only mapped exercises show a picture. */
interface ExerciseImage {
  src: string;
  /** Extra pixels to translate the image horizontally from the default offset. */
  offsetX?: number;
}
const DEFAULT_IMAGE_OFFSET_X = 15;
const EXERCISE_IMAGES: Record<string, ExerciseImage> = {
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
  'Side Lean Wall Slide':    { src: '/exercises/side-lean-wall-slide.jpg' },
  'Wall Angel':              { src: '/exercises/wall-angel.jpg' },
  'Scapular Flutters':       { src: '/exercises/scapular-flutters.jpg' },
  'Quadruped Scapular Circles': { src: '/exercises/quadruped-scapular-circles.jpg' },
  'Bear Crawl Scapular Push Up': { src: '/exercises/bear-crawl-scapular-push-up.jpg' },
  'Elevated Scapular Push Up': { src: '/exercises/elevated-scapular-push-up.jpg' },
  'Standing Pelvic Tilt':    { src: '/exercises/standing-pelvic-tilt.jpg' },
  'Supine Pelvic Tilt':      { src: '/exercises/supine-pelvic-tilt.jpg' },
  'Pelvic Rocks':            { src: '/exercises/pelvic-rocks.jpg' },
  'TVA Frog Leg':            { src: '/exercises/tva-frog-leg.jpg' },
  'Wall Lean Plank':         { src: '/exercises/wall-lean-plank.jpg' },
  'Swimmers':                { src: '/exercises/swimmers.jpg' },
  'Adductor Squeeze Crunch': { src: '/exercises/adductor-squeeze-crunch.jpg' },
  'Crossed Leg Forward Stretch': { src: '/exercises/crossed-leg-forward-stretch.jpg' },
  'Bird Dog':                { src: '/exercises/bird-dog.jpg' },
  'Side Plank':              { src: '/exercises/side-plank.jpg' },
  'Archer Push-Up':          { src: '/exercises/archer-push-up.jpg' },
  'Push-Up Plus':            { src: '/exercises/push-up-plus.jpg' },
  'Prone Y-Raise':           { src: '/exercises/prone-y-raise.jpg' },
  'Split Squat Pelvic Tilts':{ src: '/exercises/split-squat-pelvic-tilts.jpg' },
};

const DIFFICULTY_LABEL_COLOR: Record<string, string> = {
  beginner: '#34D399',
  medium:   '#FBBF24',
  hard:     '#FB7185',
};

const PersonalizedProgramScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = loadUserProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [program, setProgram] = useState<StoredDailyProgram | null>(() =>
    loadActiveProgramForSession(profile),
  );
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (location.pathname !== '/program') return;
    setProgram(loadActiveProgramForSession(loadUserProfile()));
  }, [location.pathname, location.key]);

  useEffect(() => {
    if (!program || program.exercises.length === 0) {
      navigate('/');
    }
  }, [program, navigate]);

  if (!program || program.exercises.length === 0) {
    return null;
  }

  const lib = loadProgramLibrary();
  const sortedEntries = lib
    ? [...lib.entries].sort((a, b) => {
        if (a.kind === 'daily' && b.kind !== 'daily') return -1;
        if (a.kind !== 'daily' && b.kind === 'daily') return 1;
        return a.name.localeCompare(b.name);
      })
    : [];
  const activeId = getActiveProgramId();
  const headerProgramTitle = sortedEntries.find(e => e.id === activeId)?.name ?? 'Daily Program';

  const total = program.exercises.length;
  const completedCount = program.exercises.filter(e => e.completed).length;
  const allDone = completedCount === total;
  const started = completedCount > 0;
  const focusTitle = program.focusAreas.length > 0 ? program.focusAreas.slice(0, 2).join(' & ') : 'Daily Program';

  return (
    <Layout>
      <div style={{ minHeight: '100%', background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 160px' }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
            <button
              type="button"
              aria-label="Open programs"
              onClick={() => setMenuOpen(true)}
              style={{
                marginTop: 2,
                width: 40,
                height: 40,
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: T.surface,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              <span style={{ display: 'block', width: 18, height: 2, borderRadius: 2, background: T.text }} />
              <span style={{ display: 'block', width: 18, height: 2, borderRadius: 2, background: T.text }} />
              <span style={{ display: 'block', width: 18, height: 2, borderRadius: 2, background: T.text }} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 4 }}>
                Your routine
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: T.text, lineHeight: 1, margin: 0 }}>
                  {headerProgramTitle}
                </h1>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate('/program/create'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 12,
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px solid rgba(249,115,22,0.25)',
                    cursor: 'pointer', fontFamily: T.font,
                    flexShrink: 0,
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FB923C' }}>New</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close programs menu"
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, border: 'none', padding: 0, cursor: 'pointer',
              }}
            />
            <aside
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(88vw, 300px)', zIndex: 201,
                background: T.surface, borderRight: `1px solid ${T.border}`,
                padding: '20px 16px 90px', display: 'flex', flexDirection: 'column', fontFamily: T.font,
                boxShadow: '8px 0 40px rgba(0,0,0,0.35)',
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', marginBottom: 12 }}>
                Programs
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
                {(sortedEntries.length > 0 ? sortedEntries : [{ id: 'daily', name: 'Daily Program', kind: 'daily' as const, program }]).map(entry => {
                  const isActive = entry.id === activeId;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        setActiveProgramId(entry.id, loadUserProfile());
                        setProgram(loadActiveProgramForSession(loadUserProfile()));
                        setMenuOpen(false);
                      }}
                      style={{
                        textAlign: 'left', padding: '14px 14px', borderRadius: 14, cursor: 'pointer',
                        border: `1px solid ${isActive ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.06)'}`,
                        background: isActive ? 'rgba(249,115,22,0.10)' : T.bg,
                        color: T.text,
                        fontFamily: T.font,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{entry.name}</span>
                      {'kind' in entry && entry.kind === 'daily' && (
                        <span style={{ display: 'block', fontSize: 11, color: T.text3, marginTop: 4 }}>From your scan</span>
                      )}
                      {'kind' in entry && entry.kind === 'custom' && (
                        <span style={{ display: 'block', fontSize: 11, color: T.text3, marginTop: 4 }}>Your playlist</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); navigate('/program/create'); }}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '14px', borderRadius: 14,
                  border: `1px dashed rgba(249,115,22,0.35)`, background: 'rgba(249,115,22,0.06)',
                  color: T.gold2, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: T.font,
                }}
              >
                + New program
              </button>
            </aside>
          </>
        )}

        <div style={{ position: 'relative', marginTop: 20, borderRadius: 22, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1E1E22 0%, #121215 100%)', border: `1px solid ${T.border}`, borderRadius: 22 }} />
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, color: T.text3, fontWeight: 600 }}>
                    {completedCount}/{total} done
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {program.exercises.map(ex => {
                    const dc = ex.difficulty === 'hard'
                      ? { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' }
                      : ex.difficulty === 'medium'
                        ? { color: '#FB923C', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' }
                        : { color: '#D9B84C', bg: 'rgba(217,184,76,0.08)', border: 'rgba(217,184,76,0.25)' };
                    return (
                      <span
                        key={ex.id}
                        style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.02em',
                          padding: '4px 10px', borderRadius: 8,
                          background: dc.bg,
                          border: `1px solid ${dc.border}`,
                          color: dc.color,
                        }}
                      >
                        {ex.name}
                      </span>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.text2 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {program.totalDurationMin} min
                  </span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(63,63,70,1)' }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.text2 }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    {total} exercises
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/daily-exercise')}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                  flexShrink: 0,
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="#FFFFFF" />
                </svg>
              </button>
            </div>

            <div style={{ marginTop: 16, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #F97316 0%, #FB923C 100%)',
                  width: `${(completedCount / total) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: T.text3, textTransform: 'uppercase', fontFamily: T.font }}>
              Exercises
            </span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              {expanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
          </button>

          <button
            type="button"
            onClick={() => navigate('/program/edit')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11, color: T.text3, fontFamily: T.font }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
        </div>

        {expanded && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {program.exercises.map((ex) => {
              const levelLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard';
              const levelColor = DIFFICULTY_LABEL_COLOR[ex.difficulty] ?? T.text2;
              const imageCfg = EXERCISE_IMAGES[ex.name];
              const imageOffsetX = imageCfg?.offsetX ?? DEFAULT_IMAGE_OFFSET_X;
              const firstTarget = ex.targetProblemLabels[0];
              const extraTargets = ex.targetProblemLabels.length - 1;
              return (
                <div
                  key={ex.id}
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    opacity: ex.completed ? 0.62 : 1,
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: '#131316', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16 }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Image — square top */}
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

                    {/* Info */}
                    <div style={{ padding: '10px 12px 12px' }}>
                      <h3 style={{
                        fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.2, margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ex.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 10 }}>
                        <span style={{ color: T.text3 }}>{ex.displayReps}</span>
                        <span style={{ color: T.text4 }}>·</span>
                        <span style={{ color: levelColor }}>{levelLabel}</span>
                      </div>
                      {firstTarget && (
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                          <span
                            style={{
                              fontSize: 7,
                              fontWeight: 600,
                              letterSpacing: '0.03em',
                              padding: '1px 6px',
                              borderRadius: 4,
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'rgba(255,255,255,0.03)',
                              color: 'rgba(161,161,170,0.85)',
                            }}
                          >
                            {firstTarget}
                          </span>
                          {extraTargets > 0 && (
                            <span style={{ fontSize: 7, color: T.text4 }}>+{extraTargets}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, padding: '16px 20px 92px',
        background: T.bg,
        zIndex: 10,
      }}>
        {allDone ? (
          <div style={{
            background: T.surface, borderRadius: 18, padding: '16px 20px',
            border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.gold2} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.gold2 }}>All done for today</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/daily-exercise')}
            style={{
              width: '100%', padding: '16px 0',
              background: 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)', color: '#FFFFFF',
              fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
              borderRadius: 18, border: 'none',
              cursor: 'pointer', fontFamily: T.font,
              boxShadow: '0 0 24px rgba(249,115,22,0.22)',
            }}
          >
            {started ? `Continue session · ${completedCount}/${total} done` : 'Start session'}
          </button>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default PersonalizedProgramScreen;
