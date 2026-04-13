import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import YoutubeModal from '../components/YoutubeModal';
import DifficultySelector from '../components/DifficultySelector';
import BandBadge, { displayName, hasBandBadge } from '../components/BandBadge';
import ProblemInsightCard from '../components/ProblemInsightCard';
import { loadUserProfile, saveUserProfile, type ExerciseDifficulty } from '../services/UserProfile';
import { postureProblems, type Exercise, type PostureProblem, type PremiumLayout } from '../data/postureData';

/* ── Exercise image system (mirrors PersonalizedProgramScreen) ── */
interface ExerciseImage {
  src: string;
  offsetX?: number;
}
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

const CARD_T = {
  text: '#FFFFFF',
  text3: 'rgba(113,113,122,1)',
  text4: 'rgba(82,82,91,1)',
};

/* ── Exercise icon system ─────────────────────────────────────── */
const ExerciseIcon: React.FC<{ type?: string; size?: number; color?: string }> = ({ type, size = 20, color = 'var(--color-primary)' }) => {
  const s = { width: size, height: size };
  const p = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'neck': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M9 14c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9v-2z"/>
        <path d="M10 19c0 1.1.9 2 2 2s2-.9 2-2"/>
      </svg>
    );
    case 'chest': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <path d="M12 3C8 3 5 6 5 9v3h14V9c0-3-3-6-7-6z"/><path d="M5 12v4a7 7 0 0 0 14 0v-4"/>
        <path d="M9 10v2"/><path d="M15 10v2"/>
      </svg>
    );
    case 'side': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="4" r="2"/><path d="M12 6v6l-4 4"/><path d="M12 12l4 4"/>
        <path d="M8 20h8"/><path d="M17 7l2-2"/><path d="M19 5l1-1"/>
      </svg>
    );
    case 'shoulder': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v5"/><path d="M8 10h8"/>
        <path d="M9 17.5c0-1.7 1.3-3 3-3s3 1.3 3 3V20H9v-2.5z"/>
      </svg>
    );
    case 'back': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <path d="M12 2v20"/><path d="M8 6c0 2.2 1.8 4 4 4s4-1.8 4-4"/>
        <path d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4"/>
      </svg>
    );
    case 'core': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <ellipse cx="12" cy="12" rx="7" ry="5"/><path d="M12 7V5"/><path d="M12 19v-2"/>
        <path d="M5.2 9.5L3.5 8"/><path d="M20.5 8l-1.7 1.5"/><path d="M5.2 14.5L3.5 16"/><path d="M20.5 16l-1.7-1.5"/>
      </svg>
    );
    case 'hip': return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <path d="M6 3c0 5 3 7 6 7s6-2 6-7"/><path d="M8 10l-2 11"/><path d="M16 10l2 11"/>
        <path d="M8 17h8"/>
      </svg>
    );
    default: return (
      <svg {...s} viewBox="0 0 24 24" {...p}>
        <circle cx="12" cy="5" r="3"/><path d="M12 8v8"/><path d="M8 12h8"/>
        <path d="M10 20h4"/>
      </svg>
    );
  }
};

/* ── Video Modal ──────────────────────────────────────────────── */
const VideoModal: React.FC<{ ex: Exercise; onClose: () => void }> = ({ ex, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 16px',
      backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: '100%', maxWidth: 400,
        background: 'var(--color-surface)', borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        animation: 'slideUp 0.28s ease',
      }}
    >
      {/* Video embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ex.videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={ex.name}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>
      {/* Info row */}
      <div style={{ padding: '16px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(217,184,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ExerciseIcon type={ex.iconType} size={18} color="#D9B84C" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{ex.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 1 }}>{ex.duration}s · Watch before you start</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.6, margin: '8px 0 14px' }}>{ex.description}</p>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 14,
            background: '#D9B84C', color: '#0A0A0A',
            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}
        >
          Got it, close
        </button>
      </div>
    </div>
  </div>
);

function insightSubtitle(problem: PostureProblem): string {
  return `Understanding and correcting ${problem.title}`;
}

function insightContent(problem: PostureProblem, pl: PremiumLayout | undefined) {
  const o = problem.insightCard;
  if (pl) {
    return {
      subtitle: o?.subtitle ?? insightSubtitle(problem),
      triggers: o?.triggers ?? pl.whyItHappens[0]?.text ?? '',
      impact: o?.impact ?? pl.whatChanges[0]?.text ?? '',
      stretch: o?.stretch ?? pl.howToFix.stretch[0] ?? '—',
      strengthen: o?.strengthen ?? pl.howToFix.strength[0] ?? '—',
      habits: o?.habits ?? pl.howToFix.habits[0] ?? '—',
      heroSubtitle: o?.heroSubtitle,
      familiarSymptoms: o?.familiarSymptoms,
      whyItHappensText: o?.whyItHappensText,
    };
  }
  return {
    subtitle: o?.subtitle ?? insightSubtitle(problem),
    triggers: o?.triggers ?? (problem.description.split('\n').filter(Boolean).slice(0, 2).join(' ') || '—'),
    impact: o?.impact ?? problem.tips[0] ?? '—',
    stretch: o?.stretch ?? problem.tips[0] ?? '—',
    strengthen: o?.strengthen ?? problem.tips[1] ?? problem.tips[0] ?? '—',
    habits: o?.habits ?? problem.tips[2] ?? problem.tips[0] ?? '—',
    heroSubtitle: o?.heroSubtitle,
    familiarSymptoms: o?.familiarSymptoms,
    whyItHappensText: o?.whyItHappensText,
  };
}

/* ── Main component ───────────────────────────────────────────── */
const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === id);
  const [youtube, setYoutube] = useState<{ url: string; title: string } | null>(null);
  const [exerciseDifficulty, setExerciseDifficulty] = useState<ExerciseDifficulty>('beginner');
  const [bandTooltip, setBandTooltip] = useState<string | null>(null);

  useEffect(() => {
    const profile = loadUserProfile();
    if (profile?.exerciseDifficulty) setExerciseDifficulty(profile.exerciseDifficulty);
  }, []);

  if (!problem) {
    return <Layout><div style={{ padding: 40, textAlign: 'center' }}>Not found</div></Layout>;
  }

  const pl = problem.premiumLayout;

  const handleDifficultyChange = (d: ExerciseDifficulty) => {
    setExerciseDifficulty(d);
    saveUserProfile({ exerciseDifficulty: d });
  };

  const exercisesForDifficulty = problem.exerciseList.filter(
    e => !e.difficulty || e.difficulty === exerciseDifficulty,
  );

  return (
    <Layout hideNav>
      <div>
        {/* Hero — problem card image + title */}
        <div style={{
          background: `linear-gradient(165deg, ${problem.cardBg}33 0%, var(--color-surface) 42%, var(--color-bg) 100%)`,
          padding: '48px 20px 28px',
          position: 'relative',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: problem.cardBorder, opacity: 0.12 }} />

          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(8px)',
            fontSize: 14, fontWeight: 600, color: 'var(--color-text)',
            marginBottom: 24, cursor: 'pointer', border: '1px solid var(--color-border)',
            position: 'relative', zIndex: 2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>

          <div style={{ position: 'relative', zIndex: 2, animation: 'slideUp 0.4s ease' }}>
            <div style={{
              borderRadius: 16, overflow: 'hidden', marginBottom: 14,
              border: `1px solid ${problem.cardBorder}66`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
              height: 376,
              background: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={problem.cardImage}
                alt=""
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  objectPosition: problem.cardImageObjectPosition ?? 'center',
                }}
              />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginTop: 4, marginBottom: 0, letterSpacing: '-0.02em' }}>{problem.title}</h1>
          </div>
        </div>

        <div style={{ padding: '24px 20px 100px', background: 'var(--color-bg)', minHeight: '100%' }}>

          <div style={{ marginBottom: 20, animation: 'slideUp 0.4s ease 0.08s both' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-tert)', marginBottom: 8 }}>
              Exercise difficulty
            </div>
            <DifficultySelector selected={exerciseDifficulty} onChange={handleDifficultyChange} />
          </div>

          {/* ── Exercise cards ── */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, animation: 'slideUp 0.4s ease 0.1s both' }}>
            Exercises
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-tert)', marginLeft: 8 }}>{exercisesForDifficulty.length} movements</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, animation: 'slideUp 0.4s ease 0.14s both' }}>
            {exercisesForDifficulty.map((ex) => {
              const videoUrl = ex.youtubeUrl || (ex.videoId ? `https://www.youtube.com/watch?v=${ex.videoId}` : null);
              const levelLabel = ex.difficulty === 'beginner' ? 'Beginner' : ex.difficulty === 'medium' ? 'Medium' : ex.difficulty === 'hard' ? 'Hard' : '';
              const levelColor = DIFFICULTY_LABEL_COLOR[ex.difficulty ?? 'beginner'] ?? CARD_T.text3;
              const imageCfg = EXERCISE_IMAGES[ex.name];
              const imageOffsetX = imageCfg?.offsetX ?? DEFAULT_IMAGE_OFFSET_X;
              return (
                <div
                  key={ex.id}
                  onClick={() => videoUrl ? setYoutube({ url: videoUrl, title: ex.name }) : undefined}
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: videoUrl ? 'pointer' : 'default',
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 28, animation: 'slideUp 0.4s ease 0.18s both' }}>
            <ProblemInsightCard
              showHeader={false}
              {...insightContent(problem, pl)}
            />
          </div>

          {/* Sticky CTA */}
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 430,
            padding: '16px 20px 32px',
            background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)',
          }}>
            <button
              type="button"
              onClick={() => navigate(`/exercise/${problem.id}`)}
              style={{
                width: '100%', padding: 16, borderRadius: 14,
                background: '#D9B84C', color: '#0A0A0A', fontSize: 15, fontWeight: 700,
                boxShadow: '0 8px 24px rgba(217,184,76,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
              }}
            >
              Start Exercises
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A0A"><polygon points="5 3 19 12 5 21" /></svg>
            </button>
          </div>
        </div>
      </div>
      <YoutubeModal
        open={!!youtube}
        watchUrl={youtube?.url ?? ''}
        title={youtube?.title}
        onClose={() => setYoutube(null)}
      />
    </Layout>
  );
};

export default ProblemDetail;
