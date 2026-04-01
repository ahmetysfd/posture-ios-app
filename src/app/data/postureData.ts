export interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  instructions: string[];
  emoji: string;
  /** Optional demo (opens in-app YouTube embed) */
  youtubeUrl?: string;
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
    reasonImage: '/problems/forward-head-reason.png',
    reasonLead: `Most people spend hours:

Sitting
Looking down at phones/laptops
With rounded shoulders`,
    reasonRest: `👉 Over time:

Neck muscles (front) get weak
Upper neck and shoulder muscles get tight
The head shifts forward from its natural position`,
    description: `Most people spend hours:

Sitting
Looking down at phones/laptops
With rounded shoulders

👉 Over time:

Neck muscles (front) get weak
Upper neck and shoulder muscles get tight
The head shifts forward from its natural position`,
    affectedAreas: ['Cervical spine', 'Upper trapezius', 'Suboccipitals', 'SCM'],
    cardBg: '#E8F4FE',
    cardBorder: '#C5E3FC',
    emoji: '🦒',
    exerciseList: [
      { id: 'wall-posture-hold', name: 'Wall Posture Hold', duration: 45, description: 'Use the wall as feedback to stack head, shoulders, and hips in better alignment.', emoji: '🧱',
        youtubeUrl: 'https://www.youtube.com/shorts/X6t9aVDugyg',
        instructions: ['Stand with back lightly touching the wall', 'Soften ribs so lower back isn’t overly arched', 'Gently tuck chin so head meets wall without straining', 'Hold easy breathing, relax shoulders down', 'Build up time gradually'] },
      { id: 'doorway-chest-stretch', name: 'Doorway Chest Stretch', duration: 45, description: 'Open the front of the shoulders and chest to counter forward-head and rounded shoulders.', emoji: '🚪',
        youtubeUrl: 'https://www.youtube.com/shorts/O8rJw_TmC1Y',
        instructions: ['Forearms on a door frame at about shoulder height', 'Step through until you feel a mild stretch in the chest', 'Keep neck long—don’t jut the chin forward', 'Breathe into the ribcage, hold 20–30 seconds', 'Repeat 2–3 rounds'] },
      { id: 'scapular-retraction-fh', name: 'Scapular Retraction', duration: 30, description: 'Draw shoulder blades back and down to support an upright neck.', emoji: '🤝',
        youtubeUrl: 'https://www.youtube.com/shorts/LbqxzzTA7pA',
        instructions: ['Sit or stand tall with arms relaxed', 'Imagine tucking shoulder blades into back pockets', 'Squeeze gently—no shrugging toward ears', 'Hold 3–5 seconds, release slowly', 'Repeat 12–15 times'] },
      { id: 'upper-trap-stretch', name: 'Upper Trap Stretch', duration: 45, description: 'Ease tension at the base of the neck and top of the shoulders.', emoji: '🙆',
        youtubeUrl: 'https://www.youtube.com/shorts/Kvqlsyo28N8',
        instructions: ['Sit tall; optionally anchor one hand under your chair', 'Gently tilt ear toward opposite shoulder', 'Keep opposite shoulder relaxed downward', 'Hold 20–30 seconds, switch sides', 'Only go to a comfortable stretch'] },
      { id: 'chin-tuck', name: 'Chin Tuck', duration: 30, description: 'Train deep neck flexors by sliding the chin straight back.', emoji: '🧘',
        youtubeUrl: 'https://www.youtube.com/shorts/hBJBx1QN3-c',
        instructions: ['Eyes level; imagine a string pulling the crown of your head up', 'Slide chin straight back (not down toward chest)', 'Hold 5 seconds with light effort', 'Relax and repeat 8–12 reps', 'You may feel a mild stretch at the base of the skull'] },
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
    reasonImage: '/problems/anterior-pelvic-reason.png',
    reasonLead: `Most people spend hours:

Sitting
Looking at phones/laptops
With poor hip and lower back posture`,
    reasonRest: `👉 Over time:

Hip flexor muscles get tight
Glutes and core muscles get weak
The pelvis tilts forward from its neutral position`,
    description: `Most people spend hours:

Sitting
Looking at phones/laptops
With poor hip and lower back posture

👉 Over time:

Hip flexor muscles get tight
Glutes and core muscles get weak
The pelvis tilts forward from its neutral position`,
    affectedAreas: ['Hip flexors', 'Lumbar spine', 'Glutes', 'Core'],
    cardBg: '#F0EEFE',
    cardBorder: '#DDD9FC',
    emoji: '🦴',
    exerciseList: [
      { id: 'glute-bridge', name: 'Glute Bridges', duration: 45, description: 'Strengthen glutes to help pull the pelvis toward neutral.', emoji: '🌉',
        youtubeUrl: 'https://www.youtube.com/shorts/QX0xvlPuruM',
        instructions: ['Lie on your back, knees bent, feet hip-width', 'Brace lightly through your core', 'Drive through heels and lift hips', 'Squeeze glutes at the top without overarching the low back', 'Lower with control, 12–15 reps'] },
      { id: 'dead-bug', name: 'Dead Bug', duration: 60, description: 'Train the deep core while keeping the lower back stable.', emoji: '🪲',
        youtubeUrl: 'https://www.youtube.com/shorts/8hpYXi4XGEU',
        instructions: ['Lie on back, arms toward ceiling, knees at 90°', 'Press low back gently toward the floor', 'Slowly extend opposite arm and leg', 'Return with control and switch sides', 'Keep ribs down', '8–10 each side'] },
      { id: 'lunge-stretch', name: 'Lunge Stretch', duration: 60, description: 'Stretch the hip flexors that pull the pelvis into anterior tilt.', emoji: '🦵',
        youtubeUrl: 'https://www.youtube.com/shorts/VRUpNw-jfWk',
        instructions: ['Half-kneel or lunge with back knee down', 'Tuck pelvis slightly (don’t dump into the low back)', 'Shift weight forward until you feel a mild stretch in the front hip', 'Squeeze the back glute for more stretch', 'Hold 30–45 seconds each side'] },
      { id: 'tall-plank-shoulder-tap', name: 'Tall Plank Shoulder Tap', duration: 45, description: 'Build anti-extension core control in a tall plank position.', emoji: '🧘',
        youtubeUrl: 'https://www.youtube.com/shorts/niAvJrDrxMo',
        instructions: ['Set up in a high plank, hands under shoulders', 'Press the floor away; ribs stay in toward hips', 'Tap one shoulder with the opposite hand without rocking hips', 'Alternate sides with control', '8–12 taps each side'] },
      { id: 'active-hamstring-stretch', name: 'Active Hamstring Stretch', duration: 45, description: 'Improve hamstring mobility with active control (often tight with APT).', emoji: '🦿',
        youtubeUrl: 'https://www.youtube.com/shorts/bUE5PEkCsK0',
        instructions: ['Lie on your back or use a strap for one leg', 'Extend the leg up toward hip height without forcing', 'Gently flex and extend within a comfortable range', 'Keep opposite leg relaxed or bent', 'Switch legs after 30–45 seconds'] },
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
      { id: 'wall-push-up', name: 'Wall Push-Up', duration: 40, description: 'Wall-based push-up pattern to protract the scapula and wake up serratus.', emoji: '💪',
        youtubeUrl: 'https://www.youtube.com/shorts/yZVsAWcZRQ8',
        instructions: ['Hands on wall at chest height, body angled in', 'Keep ribs quiet, neck long', 'Lower chest toward wall with control', 'Press away and finish with a slight “plus”—push upper back toward ceiling', '8–12 reps'] },
      { id: 'scapular-retraction', name: 'Scapular Retraction', duration: 30, description: 'Pinch shoulder blades together without hiking the shoulders.', emoji: '🤝',
        youtubeUrl: 'https://www.youtube.com/shorts/LbqxzzTA7pA',
        instructions: ['Stand or sit tall, arms at sides or 90° elbows bent', 'Draw shoulder blades back and slightly down', 'Hold 3–5 seconds', 'Relax and repeat 12–15 times'] },
      { id: 'wall-slide', name: 'Scapular Wall Slides', duration: 45, description: 'Slide forearms up the wall while keeping contact and rib control.', emoji: '🧱',
        youtubeUrl: 'https://www.youtube.com/shorts/OtgQDv7u1TM',
        instructions: ['Stand facing wall, forearms and backs of hands on wall', 'Slide upward in a “W to Y” path if comfortable', 'Keep ribs from flaring', 'Lower with control, 10 slow reps'] },
      { id: 'serratus-punch', name: 'Serratus Punch', duration: 45, description: 'Straight-arm punch pattern to train serratus reach.', emoji: '🎯',
        youtubeUrl: 'https://www.youtube.com/shorts/WV1JN8XH7Z4',
        instructions: ['Band anchored behind you or light cable', 'Start elbow slightly bent, then punch forward and slightly up', 'Let the shoulder blade glide around the rib cage', 'Control the return, 10–12 each arm'] },
      { id: 'prone-y-ws', name: 'Prone Y', duration: 60, description: 'Lift arms in a Y to strengthen lower traps and posterior shoulder.', emoji: '🏋️',
        youtubeUrl: 'https://www.youtube.com/shorts/_uvCj0C1NA0',
        instructions: ['Lie face down, forehead or towel under forehead', 'Arms overhead in a Y, thumbs up or out', 'Lift chest and arms slightly off floor', 'Lower slowly, 10–12 reps'] },
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
