export interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  instructions: string[];
  emoji: string;
}

export interface PostureProblem {
  id: string;
  title: string;
  /** Public URL for home grid / detail hero (files in /public/problems/) */
  cardImage: string;
  exercises: number;
  duration: string;
  description: string;
  affectedAreas: string[];
  cardBg: string;
  cardBorder: string;
  emoji: string;
  exerciseList: Exercise[];
  tips: string[];
  /** Optional: illustration top-right of Reason card; use with reasonLead + reasonRest */
  reasonImage?: string;
  reasonLead?: string;
  reasonRest?: string;
}

export const postureProblems: PostureProblem[] = [
  {
    id: 'forward-head',
    title: 'Forward Head',
    cardImage: '/problems/forward-head.png',
    exercises: 5,
    duration: '3m',
    description: 'Forward head posture occurs when your head shifts forward past your shoulders, commonly caused by prolonged screen use. This puts extra strain on your cervical spine.',
    affectedAreas: ['Cervical spine', 'Upper trapezius', 'Suboccipitals', 'SCM'],
    cardBg: '#E8F4FE',
    cardBorder: '#C5E3FC',
    emoji: '🦒',
    exerciseList: [
      { id: 'chin-tuck', name: 'Chin Tucks', duration: 30, description: 'Retract your chin straight back, creating a double chin.', emoji: '🧘',
        instructions: ['Sit or stand tall with shoulders relaxed', 'Look straight ahead, eyes level', 'Draw chin straight back', 'Hold 5 seconds', 'Repeat 10 times'] },
      { id: 'neck-flexor', name: 'Neck Flexor Stretch', duration: 45, description: 'Tilt head to each side stretching the SCM.', emoji: '🙆',
        instructions: ['Sit tall, hands on thighs', 'Tilt right ear to right shoulder', 'Apply gentle pressure', 'Hold 15-20 seconds', 'Switch sides'] },
      { id: 'wall-angel', name: 'Wall Angels', duration: 60, description: 'Slide arms up and down against a wall.', emoji: '👼',
        instructions: ['Back flat against wall', 'Press head, upper back, hips to wall', 'Arms at 90° goalpost', 'Slide arms overhead', 'Lower slowly, 10 reps'] },
      { id: 'thoracic-ext', name: 'Thoracic Extension', duration: 45, description: 'Extend upper back over a foam roller.', emoji: '🤸',
        instructions: ['Place foam roller under upper back', 'Support head with hands', 'Extend back over roller', 'Hold 5 seconds', 'Move roller and repeat'] },
      { id: 'levator-stretch', name: 'Levator Scapulae Stretch', duration: 30, description: 'Target the muscle connecting neck to shoulder blade.', emoji: '💆',
        instructions: ['Turn head 45° to one side', 'Look down toward armpit', 'Gently pull head down', 'Hold 20 seconds', 'Switch sides'] },
    ],
    tips: ['Position screen at eye level', 'Break every 30 minutes', 'Use supportive pillow', 'Strengthen deep neck flexors'],
  },
  {
    id: 'rounded-shoulders',
    title: 'Rounded Shoulders',
    cardImage: '/problems/rounded-shoulders.png',
    exercises: 5,
    duration: '3m',
    description: 'Rounded shoulders happen when chest muscles tighten and upper back muscles weaken, pulling shoulders forward from desk work.',
    affectedAreas: ['Pectorals', 'Anterior deltoids', 'Upper back', 'Rotator cuff'],
    cardBg: '#E8FEF1',
    cardBorder: '#C5FADA',
    emoji: '🫧',
    exerciseList: [
      { id: 'doorway-stretch', name: 'Doorway Pec Stretch', duration: 45, description: 'Open up your chest using a doorway.', emoji: '🚪',
        instructions: ['Stand in doorway, arms at 90°', 'Place forearms on frame', 'Step forward gently', 'Lean into stretch', 'Hold 30s, repeat 3x'] },
      { id: 'band-pull', name: 'Band Pull Aparts', duration: 45, description: 'Strengthen upper back with resistance bands.', emoji: '💪',
        instructions: ['Hold band at shoulder width', 'Squeeze shoulder blades', 'Pull band to chest', 'Return slowly', '15 reps × 3 sets'] },
      { id: 'y-raise', name: 'Prone Y-Raises', duration: 60, description: 'Strengthen lower traps lying face down.', emoji: '🤸',
        instructions: ['Lie face down', 'Arms at 30° forming Y', 'Thumbs to ceiling', 'Lift arms, squeeze blades', 'Hold 3s, 12 reps'] },
      { id: 'blade-squeeze', name: 'Shoulder Blade Squeeze', duration: 30, description: 'Activate mid-back muscles.', emoji: '🎯',
        instructions: ['Sit or stand tall', 'Arms at sides', 'Squeeze shoulder blades together', 'Hold 5 seconds', 'Repeat 15 times'] },
      { id: 'chest-opener', name: 'Chest Opener Stretch', duration: 40, description: 'Open the chest with clasped hands behind back.', emoji: '🧘',
        instructions: ['Stand tall', 'Clasp hands behind back', 'Straighten arms', 'Lift hands away from body', 'Hold 20 seconds'] },
    ],
    tips: ['Set up ergonomic workstation', 'Strengthen upper back', 'Stretch chest daily', 'Watch shoulder position'],
  },
  {
    id: 'anterior-pelvic',
    title: 'Anterior Pelvic Tilt',
    cardImage: '/problems/anterior-pelvic.png',
    exercises: 5,
    duration: '4m',
    description: 'Anterior pelvic tilt occurs when the pelvis tilts forward, increasing lower back curve and weakening glutes and core.',
    affectedAreas: ['Hip flexors', 'Lumbar spine', 'Glutes', 'Core'],
    cardBg: '#F0EEFE',
    cardBorder: '#DDD9FC',
    emoji: '🦴',
    exerciseList: [
      { id: 'half-kneel', name: 'Half-Kneeling Stretch', duration: 60, description: 'Deep hip flexor stretch in a lunge position.', emoji: '🦵',
        instructions: ['Kneel on right knee', 'Left foot forward', 'Shift weight forward', 'Squeeze right glute', 'Hold 30s, switch'] },
      { id: 'glute-bridge', name: 'Glute Bridges', duration: 45, description: 'Strengthen glutes and stretch hip flexors.', emoji: '🌉',
        instructions: ['Lie back, knees bent', 'Drive through heels', 'Squeeze glutes at top', 'Hold 3 seconds', '15 reps'] },
      { id: 'dead-bug', name: 'Dead Bug', duration: 60, description: 'Core stabilization for spinal control.', emoji: '🪲',
        instructions: ['Lie back, arms to ceiling', 'Knees at 90° tabletop', 'Press lower back to floor', 'Extend opposite arm and leg', '10 reps each side'] },
      { id: 'cat-cow', name: 'Cat-Cow Stretch', duration: 50, description: 'Mobilize the spine with alternating movements.', emoji: '🐱',
        instructions: ['Hands and knees', 'Inhale: belly drops, chest lifts', 'Exhale: round spine, tuck chin', 'Move with breath', '10-15 cycles'] },
      { id: 'pelvic-tilt', name: 'Posterior Pelvic Tilts', duration: 30, description: 'Learn to control pelvic position.', emoji: '🔄',
        instructions: ['Lie on back, knees bent', 'Flatten lower back to floor', 'Tilt pelvis upward', 'Hold 5 seconds', 'Repeat 15 times'] },
    ],
    tips: ['Avoid prolonged sitting', 'Strengthen core and glutes', 'Stretch hip flexors daily', 'Practice neutral pelvis standing'],
  },
  {
    id: 'winging-scapula',
    title: 'Winging Scapula',
    cardImage: '/problems/winging-scapula.png',
    exercises: 5,
    duration: '3m',
    reasonImage: '/problems/desk-work-upper.png',
    reasonLead: `Most people spend hours:

Sitting
Looking at phones/laptops
With rounded shoulders`,
    reasonRest: `👉 Over time:

Chest muscles get tight
Upper back muscles (including scapular stabilizers) get weak
The scapula loses its stable position

This creates functional winging (not nerve damage, but poor control).`,
    description: `Most people spend hours:

Sitting
Looking at phones/laptops
With rounded shoulders

👉 Over time:

Chest muscles get tight
Upper back muscles (including scapular stabilizers) get weak
The scapula loses its stable position

This creates functional winging (not nerve damage, but poor control).`,
    affectedAreas: ['Serratus anterior', 'Rhomboids', 'Trapezius', 'Scapula'],
    cardBg: '#E8F0FE',
    cardBorder: '#C5D9FC',
    emoji: '🪽',
    exerciseList: [
      { id: 'wall-slide', name: 'Wall Slides (Serratus)', duration: 45, description: 'Reach along the wall to activate serratus anterior.', emoji: '🧱',
        instructions: ['Stand facing wall, forearms on wall', 'Slide arms up keeping contact', 'Think of wrapping scapula forward', 'Lower with control', '12 slow reps'] },
      { id: 'push-up-plus', name: 'Push-Up Plus', duration: 40, description: 'Protract the scapula at the top of a push-up.', emoji: '💪',
        instructions: ['High plank or knees plank', 'Lower chest toward floor', 'Press up', 'At top, push upper back toward ceiling', '10 reps'] },
      { id: 'band-punch', name: 'Band Punch Forward', duration: 45, description: 'Resisted reach trains upward rotation.', emoji: '🎯',
        instructions: ['Anchor band behind you', 'Hold at shoulder height', 'Punch forward with straight arm', 'Let shoulder blade glide', '12 each arm'] },
      { id: 'wall-angel-2', name: 'Wall Angels', duration: 60, description: 'Control scapula as arms move overhead.', emoji: '👼',
        instructions: ['Back to wall, head and hips touch', 'Arms 90° goalpost on wall', 'Slide up toward ceiling', 'Keep ribs down', '10 reps'] },
      { id: 'blade-squeeze-ws', name: 'Shoulder Blade Squeeze', duration: 30, description: 'Retraction to balance protraction work.', emoji: '🤝',
        instructions: ['Stand tall, palms forward', 'Pull shoulder blades together', 'Hold 5 seconds without shrugging', 'Repeat 15 times'] },
    ],
    tips: ['Avoid prolonged elbow-plank shrugging', 'Strengthen serratus gradually', 'Check desk elbow height', 'See a clinician if pain or numbness'],
  },
  {
    id: 'kyphosis',
    title: 'Kyphosis',
    cardImage: '/problems/kyphosis.png',
    exercises: 5,
    duration: '3m',
    description: 'Kyphosis is an excessive outward curve of the upper back (thoracic spine), sometimes called a rounded or hunched back, often worsened by prolonged sitting and weak upper-back muscles.',
    affectedAreas: ['Thoracic spine', 'Rhomboids', 'Middle trapezius', 'Pectorals'],
    cardBg: '#EEF2FF',
    cardBorder: '#C7D2FE',
    emoji: '📐',
    exerciseList: [
      { id: 'thoracic-ext-ky', name: 'Thoracic Extension', duration: 45, description: 'Extend the upper back over support.', emoji: '🤸',
        instructions: ['Place foam roller at mid-back', 'Support head lightly', 'Extend over roller in small segments', 'Pause 3–5 breaths each spot', 'Move roller 2–3 times'] },
      { id: 'cat-cow-ky', name: 'Cat-Cow', duration: 50, description: 'Mobilize thoracic spine with breath.', emoji: '🐱',
        instructions: ['Hands and knees', 'Inhale gently extend spine', 'Exhale round and spread shoulder blades', '10–15 slow cycles'] },
      { id: 'doorway-ky', name: 'Doorway Pec Stretch', duration: 45, description: 'Open tight chest that rounds the upper back.', emoji: '🚪',
        instructions: ['Forearms on door frame at ~90°', 'Step through until mild stretch in chest', 'Breathe into ribs', 'Hold 30s × 2'] },
      { id: 'prone-y', name: 'Prone Y-Raises', duration: 60, description: 'Strengthen lower traps and extend thoracic spine.', emoji: '🏋️',
        instructions: ['Lie face down', 'Arms in Y, thumbs up', 'Lift chest slightly off floor', 'Lower slowly', '10–12 reps'] },
      { id: 'wall-stand-ky', name: 'Wall Stand', duration: 30, description: 'Stack joints for neutral upper-back alignment.', emoji: '🧱',
        instructions: ['Heels, hips, shoulders, head to wall', 'Tuck chin lightly', 'Arms relaxed or W on wall', 'Hold 30–45 seconds'] },
    ],
    tips: ['Bring screen to eye height', 'Take movement breaks hourly', 'Pair stretching with upper-back strength', 'Seek evaluation for severe or painful curve'],
  },
  {
    id: 'uneven-shoulders',
    title: 'Uneven Shoulders',
    cardImage: '/problems/uneven-shoulders.png',
    exercises: 5,
    duration: '3m',
    reasonImage: '/problems/uneven-shoulders-reason.png',
    reasonLead: `Most people develop uneven shoulders due to:

Sitting with weight shifted to one side
Carrying bags on the same shoulder
Crossing legs consistently (pelvic shift)
Poor desk setup (monitor not centered)
Muscle imbalances (dominant side overuse)`,
    reasonRest: `👉 Over time:

One shoulder appears higher than the other
Neck muscles on one side get tight
Opposite side becomes weak and lengthened
Scapula positioning becomes asymmetric
Spine may slightly compensate (side bending)`,
    description: 'Uneven shoulders—one side higher than the other—can come from muscle imbalance, favored carrying patterns, scoliosis, or compensation elsewhere. Gentle symmetry and mobility work can help alongside professional assessment.',
    affectedAreas: ['Upper trapezius', 'Levator scapulae', 'Shoulder girdle', 'Neck'],
    cardBg: '#F8FAFC',
    cardBorder: '#E2E8F0',
    emoji: '⚖️',
    exerciseList: [
      { id: 'ear-stretch-hi', name: 'Side Neck Stretch (High Side)', duration: 45, description: 'Lengthen the typically tighter upper side.', emoji: '🙆',
        instructions: ['Sit tall', 'Gently tilt ear away from higher shoulder', 'Opposite hand can extend down', 'Light pressure only', '20–30 seconds each side'] },
      { id: 'shoulder-roll', name: 'Controlled Shoulder Rolls', duration: 30, description: 'Reduce guarding and encourage smooth motion.', emoji: '🔄',
        instructions: ['Slow circles both directions', 'Keep neck long', '10 reps each way'] },
      { id: 'uni-shrug', name: 'One-Sided Shrug Lowering', duration: 35, description: 'Teach the elevated side to relax down.', emoji: '🤷',
        instructions: ['Shrug both shoulders up', 'Lower the higher side first, slowly', 'Match the other side', '10 reps'] },
      { id: 'rib-breath', name: 'Ribcage Breathing', duration: 40, description: 'Encourage even expansion side to side.', emoji: '🫁',
        instructions: ['Hand on low ribs', 'Inhale 360° into ribs', 'Exhale fully', '5–8 breaths'] },
      { id: 'wand-pass', name: 'Overhead Dowel Pass', duration: 45, description: 'Improve shoulder elevation symmetry with feedback.', emoji: '🪄',
        instructions: ['Hold stick with wide grip', 'Lift overhead in pain-free range', 'Keep ribs quiet', '8 slow reps'] },
    ],
    tips: ['Stretch the tight side (elevated shoulder)', 'Strengthen the weak side (lower trap & serratus)', 'Keep shoulders level during daily activities', 'Adjust desk setup (screen centered!)', 'Train both sides equally'],
  },
];
