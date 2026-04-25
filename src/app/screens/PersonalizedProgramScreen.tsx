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
import {
  applyProgressionsToProgram,
  getProgressionDisplay,
  getUpgradeInfo,
  acceptTierUpgrade,
  dismissUpgrade,
  loadProgressionLog,
} from '../services/ProgressionService';
import { saveDailyProgram } from '../services/DailyProgram';

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
  // Rounded Shoulders
  'Doorway Chest Stretch':   { src: '/exercises/doorway-chest-stretch.jpg',   offsetX: 0 },
  'Bear Hold':               { src: '/exercises/bear-hold.jpg',               offsetX: 0 },
  'Prone T-Raise':           { src: '/exercises/prone-t-raise.jpg',           offsetX: 0 },
  'Y-Pull with Band':        { src: '/exercises/y-pull-with-band.jpg',        offsetX: 0 },
  // Kyphosis
  'Baby Cobra':              { src: '/exercises/baby-cobra.jpg',              offsetX: 0 },
  'Foam Roller Thoracic Extension': { src: '/exercises/foam-roller-thoracic-extension.jpg', offsetX: 0 },
  'Quadruped Thoracic Rotation (Hand Behind Head)': { src: '/exercises/quadruped-thoracic-rotation.jpg', offsetX: 0 },
  'Thoracic Extension':      { src: '/exercises/thoracic-extension.jpg',      offsetX: 0 },
  'Wall Assisted Shoulder Flexion': { src: '/exercises/wall-assisted-shoulder-flexion.jpg', offsetX: 0 },
  'Wall Slide':              { src: '/exercises/wall-slide.jpg',              offsetX: 0 },
  'Scapular Rows':           { src: '/exercises/scapular-rows.jpg',           offsetX: 0 },
  'Sphinx Cat Camels':       { src: '/exercises/sphinx-cat-camels.jpg',       offsetX: 0 },
  'Banded Reverse Fly':      { src: '/exercises/Banded Reverse Fly.png',      offsetX: 0 },
  // Uneven Shoulders
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

const DIFFICULTY_LABEL_COLOR: Record<string, string> = {
  beginner: '#22C55E',
  medium:   '#EAB308',
  hard:     '#EF4444',
};

const PersonalizedProgramScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = loadUserProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [program, setProgram] = useState<StoredDailyProgram | null>(() => {
    const p = loadActiveProgramForSession(profile);
    return p ? applyProgressionsToProgram(p) : null;
  });
  const [expanded, setExpanded] = useState(true);

  // Set of exercise names that have a pending tier-upgrade suggestion
  const [pendingUpgrades, setPendingUpgrades] = useState<Set<string>>(() => {
    const p = loadActiveProgramForSession(loadUserProfile());
    if (!p) return new Set();
    const log = loadProgressionLog();
    return new Set(
      p.exercises
        .filter(ex => log[ex.name]?.pendingTierUpgrade && ex.difficulty !== 'hard')
        .map(ex => ex.name),
    );
  });

  useEffect(() => {
    if (location.pathname !== '/program') return;
    const p = loadActiveProgramForSession(loadUserProfile());
    setProgram(p ? applyProgressionsToProgram(p) : null);
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
                        ? { color: '#EAB308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)' }
                        : { color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' };
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

        {/* ── Tier upgrade suggestions ─────────────────────────── */}
        {pendingUpgrades.size > 0 && program.exercises
          .filter(ex => pendingUpgrades.has(ex.name))
          .map(ex => {
            const info = getUpgradeInfo(ex);
            if (!info) return null;
            return (
              <div
                key={ex.name}
                style={{
                  marginBottom: 10,
                  borderRadius: 16,
                  border: '1px solid rgba(217,184,76,0.25)',
                  background: 'rgba(217,184,76,0.06)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⬆️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#D9B84C' }}>
                      Ready to level up
                    </div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>
                      You've completed <span style={{ color: T.text2, fontWeight: 600 }}>{ex.name}</span> 21 times
                    </div>
                  </div>
                </div>

                {/* Arrow: current → next */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '8px 12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      Current
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{ex.emoji} {ex.name}</div>
                    <div style={{ fontSize: 10, color: T.text4, marginTop: 1 }}>{ex.difficulty}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#D9B84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      Next
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{info.nextExerciseName}</div>
                    <div style={{ fontSize: 10, color: '#D9B84C', marginTop: 1 }}>{info.nextTier}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = acceptTierUpgrade(program, ex.name);
                      saveDailyProgram(updated);
                      setProgram(applyProgressionsToProgram(updated));
                      setPendingUpgrades(prev => {
                        const s = new Set(prev);
                        s.delete(ex.name);
                        return s;
                      });
                    }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      background: '#D9B84C', color: '#0A0A0A',
                      fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                      fontFamily: T.font,
                    }}
                  >
                    Upgrade
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dismissUpgrade(ex.name);
                      setPendingUpgrades(prev => {
                        const s = new Set(prev);
                        s.delete(ex.name);
                        return s;
                      });
                    }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      background: 'transparent', color: T.text3,
                      fontSize: 12, fontWeight: 600,
                      border: `1px solid ${T.border2}`, cursor: 'pointer',
                      fontFamily: T.font,
                    }}
                  >
                    Not yet
                  </button>
                </div>
              </div>
            );
          })}

        {expanded && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {program.exercises.map((ex) => {
              const levelLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : 'Hard';
              const levelColor = DIFFICULTY_LABEL_COLOR[ex.difficulty] ?? T.text2;
              const imageCfg = EXERCISE_IMAGES[ex.name];
              const imageOffsetX = imageCfg?.offsetX ?? DEFAULT_IMAGE_OFFSET_X;
              const firstTarget = ex.targetProblemLabels[0];
              const extraTargets = ex.targetProblemLabels.length - 1;
              const prog = getProgressionDisplay(ex.name);
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
                        {ex.sets > 1 && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                            padding: '1px 5px', borderRadius: 5,
                            background: 'rgba(217,184,76,0.15)', color: '#D9B84C',
                            border: '1px solid rgba(217,184,76,0.25)',
                          }}>{ex.sets}×</span>
                        )}
                        <span style={{ color: T.text3 }}>{ex.displayReps}</span>
                        <span style={{ color: T.text4 }}>·</span>
                        <span style={{ color: levelColor }}>{levelLabel}</span>
                      </div>
                      {/* Set progression bar — only show if not maxed and has some progress */}
                      {!prog.isMaxed && prog.percentToNext > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <div style={{
                            height: 2, borderRadius: 2,
                            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              background: 'rgba(217,184,76,0.55)',
                              width: `${prog.percentToNext}%`,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: 8, color: T.text4, marginTop: 3 }}>
                            {prog.completionsAtVolume}/{prog.threshold} → {ex.sets + 1} sets
                          </div>
                        </div>
                      )}
                      {/* Tier upgrade progress bar — show for all non-hard exercises */}
                      {ex.difficulty !== 'hard' && !prog.pendingTierUpgrade && (
                        <div style={{ marginTop: 5 }}>
                          <div style={{
                            height: 2, borderRadius: 2,
                            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              background: 'rgba(249,115,22,0.55)',
                              width: `${Math.min(100, Math.round((prog.totalCompletions / 21) * 100))}%`,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: 8, color: T.text4, marginTop: 3 }}>
                            {prog.totalCompletions}/21 → next exercise
                          </div>
                        </div>
                      )}
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
