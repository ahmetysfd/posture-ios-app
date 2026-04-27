/**
 * Shared exercise image map used by Program / Edit / Create screens.
 *
 * Only mapped exercises render a thumbnail; everything else falls back to the
 * exercise emoji. `offsetX` lets us nudge the framing of cropped photos so the
 * subject sits roughly in the centre of the square thumbnail.
 */

export interface ExerciseImage {
  src: string;
  offsetX?: number;
}

export const DEFAULT_IMAGE_OFFSET_X = 15;

export const EXERCISE_IMAGES: Record<string, ExerciseImage> = {
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
