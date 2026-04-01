export interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  instructions: string[];
  emoji: string;
  /** Full YouTube URL for in-app video embed (youtu.be / shorts / watch) */
  youtubeUrl?: string;
  /** YouTube video ID — alternative to youtubeUrl */
  videoId?: string;
  /** Icon type for outline icon system */
  iconType?: 'neck' | 'chest' | 'side' | 'shoulder' | 'back' | 'core' | 'hip' | 'generic';
}

export interface PremiumLayout {
  whyItHappens: Array<{ bold: string; text: string }>;
  whatChanges: Array<{ bold: string; text: string }>;
  howToFix: {
    stretch: string[];
    strength: string[];
    habits: string[];
  };
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
  /** Optional: premium 3-card layout */
  premiumLayout?: PremiumLayout;
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
        instructions: ['Stand with back lightly touching the wall', "Soften ribs so lower back isn't overly arched", 'Gently tuck chin so head meets wall without straining', 'Hold easy breathing, relax shoulders down', 'Build up time gradually'] },
      { id: 'doorway-chest-stretch', name: 'Doorway Chest Stretch', duration: 45, description: 'Open the front of the shoulders and chest to counter forward-head and rounded shoulders.', emoji: '🚪',
        youtubeUrl: 'https://www.youtube.com/shorts/O8rJw_TmC1Y',
        instructions: ['Forearms on a door frame at about shoulder height', 'Step through until you feel a mild stretch in the chest', "Keep neck long—don't jut the chin forward", 'Breathe into the ribcage, hold 20–30 seconds', 'Repeat 2–3 rounds'] },
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
      {
        id: 'doorway-chest-rs', name: 'Doorway Chest Stretch', duration: 35,
        description: 'Releases the tight pectorals that are the primary driver pulling the shoulders into a rounded position.',
        emoji: '🚪', iconType: 'chest', videoId: 'O8rJw_TmC1Y',
        instructions: ['Stand in a doorway, forearms on the frame at 90°', 'Step one foot forward through the door', 'Lean gently forward until you feel a stretch across the chest', 'Keep chin tucked and shoulders down', 'Hold 30–35 seconds, breathe steadily'],
      },
      {
        id: 'wall-angels-rs', name: 'Wall Angels', duration: 40,
        description: 'Simultaneously trains scapular retraction and thoracic extension against a wall for real-time feedback.',
        emoji: '🧱', iconType: 'back', videoId: 'BdEXk-wHyfE',
        instructions: ['Stand with back flat against the wall, feet 6 inches from the base', 'Press head, upper back, and hips into the wall', 'Raise arms to a 90° goalpost position', 'Slowly slide arms overhead while keeping full wall contact', 'Lower with control — 10 reps'],
      },
      {
        id: 'prone-yt-rs', name: 'Prone Y-T Raise', duration: 40,
        description: 'Directly strengthens the mid and lower trapezius to actively pull the shoulder blades into correct position.',
        emoji: '💪', iconType: 'shoulder', videoId: 'w1AWGKubE5U',
        instructions: ['Lie face down on a mat, forehead resting lightly', 'For Y: extend arms at 45°, thumbs pointing up', 'Lift arms slightly, squeezing shoulder blades together', 'For T: move arms out to 90° and repeat the lift', 'Perform 8–10 reps per position, keep neck neutral'],
      },
      {
        id: 'chin-tuck-rs', name: 'Chin Tuck', duration: 30,
        description: 'Resets the forward head position that accompanies rounded shoulders by reactivating the deep neck flexors.',
        emoji: '🧘', iconType: 'neck', videoId: 'zpuL7KYvEi0',
        instructions: ['Sit or stand tall, eyes level', 'Draw chin straight back — not down', 'Feel a gentle lengthening at the back of the neck', 'Hold 3–5 seconds', 'Release and repeat 10–12 times'],
      },
      {
        id: 'arm-circles-rs', name: 'Arm Circles', duration: 35,
        description: 'Warms up the shoulder girdle and restores full rotational mobility lost from chronic forward positioning.',
        emoji: '🔄', iconType: 'shoulder', videoId: '35h5gdlm46w',
        instructions: ['Stand tall with arms extended out to the sides', 'Begin with small forward circles, gradually increasing size', 'Complete 10 reps forward, then reverse direction', 'Keep shoulders down and chest open throughout', 'Maintain a steady, controlled speed'],
      },
    ],
    tips: ['Set up ergonomic workstation', 'Strengthen upper back', 'Stretch chest daily', 'Watch shoulder position'],
    premiumLayout: {
      whyItHappens: [
        { bold: 'Prolonged sitting', text: 'keeps shoulders locked in a forward, protracted position for hours' },
        { bold: 'Excessive phone and laptop use', text: 'continuously reinforces rounded posture throughout the day' },
        { bold: 'Tight chest muscles', text: 'shorten and pull the shoulders inward with increasing force' },
        { bold: 'Weak upper back muscles', text: 'lose the endurance to hold the shoulder blades back and down' },
        { bold: 'Poor posture habits', text: 'cause the nervous system to accept the rounded position as normal' },
      ],
      whatChanges: [
        { bold: 'Shoulders migrate forward', text: 'protraction becomes the resting position of the shoulder girdle' },
        { bold: 'Chest tightens and shortens', text: 'restricting full shoulder flexion and breathing depth' },
        { bold: 'Upper back muscles weaken', text: 'mid and lower traps lose activation without regular use' },
        { bold: 'Scapular control decreases', text: 'shoulder blades lose proper tracking during arm movements' },
        { bold: 'Neck and upper back discomfort', text: 'develop as surrounding structures compensate for poor alignment' },
      ],
      howToFix: {
        stretch: [
          'Doorway chest stretch — 35s, twice daily minimum',
          'Arm circles — full range, forward and backward daily',
        ],
        strength: [
          'Prone Y-T raises — 8–10 reps, slow and controlled',
          'Wall angels — 10 reps with full wall contact for feedback',
        ],
        habits: [
          'Set your screen at eye level to stop the forward lean',
          'Check your shoulder position every 30 minutes at your desk',
          'Perform chin tucks throughout the day to reset head position',
        ],
      },
    },
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
      {
        id: 'half-kneel-apt', name: 'Half-Kneeling Hip Flexor Stretch', duration: 45,
        description: 'Directly targets the iliopsoas — the primary muscle that pulls the pelvis into an anterior tilt.',
        emoji: '🦵', iconType: 'hip', youtubeUrl: 'https://youtu.be/DXuStgWuJV8',
        instructions: ['Kneel on your right knee, left foot forward at 90°', 'Keep torso upright, hands on hips', 'Squeeze right glute and gently shift hips forward', 'Feel the stretch deep in the front of the right hip', 'Hold 30–40 seconds, then switch sides'],
      },
      {
        id: 'glute-bridge-apt', name: 'Glute Bridge', duration: 40,
        description: 'Activates the glutes that have become inhibited from prolonged sitting and restores pelvic control.',
        emoji: '🌉', iconType: 'hip', youtubeUrl: 'https://youtu.be/XLXGydU5DdU',
        instructions: ['Lie on your back, knees bent, feet hip-width apart', 'Press firmly through both heels', 'Drive hips up, squeezing glutes at the top', 'Keep ribs down, avoid arching the lower back', 'Hold 3 seconds at the top — 12–15 reps'],
      },
      {
        id: 'dead-bug-apt', name: 'Dead Bug', duration: 45,
        description: 'Trains anti-extension core control to keep the pelvis neutral under limb loading.',
        emoji: '🪲', iconType: 'core', youtubeUrl: 'https://youtu.be/jbWmbhElf3Q',
        instructions: ['Lie on your back, arms straight to the ceiling', 'Raise knees to 90° tabletop position', 'Press lower back firmly into the floor throughout', 'Slowly extend opposite arm and leg toward the floor', 'Return and alternate — 8–10 reps each side'],
      },
      {
        id: 'cat-cow-apt', name: 'Cat–Cow', duration: 35,
        description: 'Restores spinal mobility and teaches conscious control of pelvic positioning through both ranges.',
        emoji: '🐱', iconType: 'back', youtubeUrl: 'https://youtu.be/LIVJZZyZ2qM',
        instructions: ['Start on hands and knees, wrists under shoulders', 'Cow: inhale, let belly drop, lift tailbone and chest', 'Cat: exhale, round spine upward, tuck chin and pelvis', 'Move slowly and with full breath control', '10–12 smooth cycles'],
      },
      {
        id: 'posterior-tilt-apt', name: 'Posterior Pelvic Tilt', duration: 30,
        description: 'Directly trains the corrective movement pattern — flattening the lower back to counter the forward tilt.',
        emoji: '🔄', iconType: 'core', youtubeUrl: 'https://youtu.be/zHfuVboAWVM',
        instructions: ['Lie on your back, knees bent, feet flat', 'Flatten lower back completely into the floor', 'Tilt pelvis upward by engaging abs and glutes', 'Hold 5 seconds, feel the lumbar spine flatten', 'Release and repeat 12–15 times'],
      },
    ],
    tips: ['Avoid prolonged sitting', 'Strengthen core and glutes', 'Stretch hip flexors daily', 'Practice neutral pelvis standing'],
    premiumLayout: {
      whyItHappens: [
        { bold: 'Prolonged sitting', text: 'shortens the hip flexors and trains the pelvis to tilt forward' },
        { bold: 'Weak glutes', text: 'cannot generate enough force to pull the pelvis back into neutral' },
        { bold: 'Weak core', text: 'loses the control needed to maintain pelvic stability' },
        { bold: 'Habitual lower back arching', text: 'reinforces the tilt pattern until it becomes the default position' },
        { bold: 'Lack of movement', text: 'allows muscles to permanently adapt to an imbalanced position' },
      ],
      whatChanges: [
        { bold: 'Lower back arch deepens', text: 'excessive lordosis compresses lumbar joints over time' },
        { bold: 'Pelvis tips persistently forward', text: 'shifting the centre of gravity and stressing the spine' },
        { bold: 'Hip flexors become chronically tight', text: 'restricting stride length and hip extension' },
        { bold: 'Glutes become inhibited', text: 'losing both strength and neuromuscular activation' },
        { bold: 'Lower back discomfort develops', text: 'as compressed segments carry uneven load daily' },
      ],
      howToFix: {
        stretch: [
          'Half-kneeling hip flexor stretch — 40s each side, daily',
          'Cat–Cow — 10 slow cycles to restore pelvic range',
        ],
        strength: [
          'Glute bridges — 12–15 reps, pause at the top',
          'Dead bug — focus on keeping lower back flat throughout',
        ],
        habits: [
          'Stand up and walk for 2 minutes every 30 minutes',
          'Practice posterior pelvic tilt while seated at your desk',
          'Check your standing posture — pelvis should be neutral, not arched',
        ],
      },
    },
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
      {
        id: 'wall-angels-ky', name: 'Wall Angels', duration: 40,
        description: 'Trains scapular control and thoracic extension simultaneously against a wall for feedback.',
        emoji: '🧱', iconType: 'back', videoId: 'BdEXk-wHyfE',
        instructions: ['Stand with back flat against the wall', 'Feet 6 inches from the base', 'Press head, upper back, and hips into the wall', 'Raise arms to a 90° goalpost position', 'Slowly slide arms overhead while keeping contact', 'Lower with control — 10 reps'],
      },
      {
        id: 'doorway-chest-ky', name: 'Doorway Chest Stretch', duration: 35,
        description: 'Releases the tight pectorals that pull the upper back into a rounded position.',
        emoji: '🚪', iconType: 'chest', videoId: 'O8rJw_TmC1Y',
        instructions: ['Stand in a doorway, forearms on the frame at 90°', 'Step one foot forward through the door', 'Lean gently forward until you feel a stretch across the chest', 'Keep chin tucked and shoulders down', 'Hold 30–35 seconds, breathe steadily'],
      },
      {
        id: 'thoracic-ext-ky', name: 'Thoracic Extension', duration: 45,
        description: 'Directly mobilises the stiff thoracic segments that cause the kyphotic curve.',
        emoji: '🤸', iconType: 'back', videoId: 'EOHei8z22fY',
        instructions: ['Sit in a chair or lie over a foam roller at mid-back', 'Support your head with your hands', 'Gently extend backward over the support point', 'Pause and breathe for 3–5 seconds', 'Shift position and repeat 3–4 times along the upper back'],
      },
      {
        id: 'chin-tuck-ky', name: 'Chin Tuck', duration: 30,
        description: 'Resets forward head position that accompanies kyphosis by activating deep neck flexors.',
        emoji: '🧘', iconType: 'neck', videoId: 'zpuL7KYvEi0',
        instructions: ['Sit or stand tall, eyes level', 'Draw chin straight back (not down)', 'Feel a gentle lengthening at the back of the neck', 'Hold 3–5 seconds', 'Release and repeat 10–12 times'],
      },
      {
        id: 'prone-yt-ky', name: 'Prone Y-T Raise', duration: 40,
        description: 'Strengthens the lower and middle trapezius to actively counteract upper-back rounding.',
        emoji: '💪', iconType: 'shoulder', videoId: 'w1AWGKubE5U',
        instructions: ['Lie face down on a mat, forehead resting lightly', 'For Y: extend arms at 45° from shoulders, thumbs up', 'Lift arms slightly off the floor, squeeze shoulder blades', 'For T: move arms to 90° (T shape) and repeat', 'Perform 8–10 reps per position, keep neck neutral'],
      },
    ],
    tips: ['Bring screen to eye height', 'Take movement breaks hourly', 'Pair stretching with upper-back strength', 'Seek evaluation for severe or painful curve'],
    premiumLayout: {
      whyItHappens: [
        { bold: 'Prolonged sitting', text: 'keeps the spine locked in a flexed position for hours' },
        { bold: 'Looking down at screens', text: 'pulls the head and upper back progressively forward' },
        { bold: 'Weak upper back muscles', text: 'lose the endurance needed to hold you upright' },
        { bold: 'Tight chest muscles', text: 'shorten and pull the shoulders inward over time' },
        { bold: 'Limited thoracic mobility', text: 'makes the upper spine stiff and resistant to extension' },
      ],
      whatChanges: [
        { bold: 'Upper back becomes more rounded', text: 'the thoracic curve deepens and stiffens' },
        { bold: 'Head shifts forward', text: 'adding up to 10 lbs of load per inch of displacement' },
        { bold: 'Chest tightens and shortens', text: 'making full shoulder movement harder' },
        { bold: 'Shoulder blades lose position', text: 'drifting away from the spine and tipping forward' },
        { bold: 'Breathing capacity may decrease', text: 'as the ribcage has less room to fully expand' },
      ],
      howToFix: {
        stretch: [
          'Doorway chest stretch — hold 30s, 2× daily',
          'Thoracic extension over a roller — 3–4 segments',
        ],
        strength: [
          'Prone Y-T raises — 8–10 reps, focus on lower traps',
          'Wall angels — 10 slow reps with full wall contact',
        ],
        habits: [
          'Raise your screen to eye level',
          'Set a posture reminder every 30 minutes',
          'Practice chin tucks throughout the day',
        ],
      },
    },
  },
  {
    id: 'uneven-shoulders',
    title: 'Uneven Shoulders',
    cardImage: '/problems/uneven-shoulders.png',
    exercises: 4,
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
      {
        id: 'levator-stretch', name: 'Levator Scapulae Stretch', duration: 40,
        description: 'Releases the tight muscle that elevates the shoulder blade toward the neck.',
        emoji: '🙆', iconType: 'neck', videoId: 'YVv1ul6b6Cc',
        instructions: ['Sit tall, feet flat on the floor', 'Rotate head 45° toward your armpit', 'Gently nod chin down toward that armpit', 'Place hand on the back of your head for light pressure', 'Hold 30–40 seconds, then switch sides'],
      },
      {
        id: 'chest-opener', name: 'Chest Opener Stretch', duration: 35,
        description: 'Opens the chest and front shoulder to counteract rounded, uneven posture.',
        emoji: '🤸', iconType: 'chest', videoId: 'Cka38QWoVeY',
        instructions: ['Stand tall or sit upright', 'Clasp hands behind your back', 'Squeeze shoulder blades together', 'Lift chest up and slightly back', 'Hold 30–35 seconds, breathe deeply'],
      },
      {
        id: 'side-lat-stretch', name: 'Side Body & Lat Stretch', duration: 40,
        description: 'Lengthens the lateral chain from hip to shoulder, correcting side-bending compensation.',
        emoji: '🧘', iconType: 'side', videoId: 'Vko-SJok-fk',
        instructions: ['Stand with feet hip-width apart', 'Raise one arm overhead', 'Lean smoothly to the opposite side', 'Keep hips square, do not rotate', 'Hold 30–40 seconds each side'],
      },
      {
        id: 'scapular-depression', name: 'Scapular Depression Control', duration: 45,
        description: 'Trains the lower trapezius to actively pull the elevated shoulder blade down.',
        emoji: '💪', iconType: 'shoulder', videoId: 'maKLqBSn_Vo',
        instructions: ['Sit or stand tall', 'Let both shoulders relax completely', 'Slowly pull only the elevated shoulder blade down and back', 'Hold the depressed position for 5 seconds', 'Release and repeat 10 times on that side'],
      },
    ],
    tips: ['Stretch the tight side (elevated shoulder)', 'Strengthen the weak side (lower trap & serratus)', 'Keep shoulders level during daily activities', 'Adjust desk setup (screen centered!)', 'Train both sides equally'],
    premiumLayout: {
      whyItHappens: [
        { bold: 'Leaning to one side', text: 'shifts pelvis and raises one shoulder' },
        { bold: 'Carrying bags on one shoulder', text: 'overloads one side continuously' },
        { bold: 'Crossing legs consistently', text: 'creates a pelvic tilt that ripples upward' },
        { bold: 'Off-center monitor', text: 'forces head and shoulder to compensate' },
        { bold: 'Dominant side overuse', text: 'builds muscle imbalance over time' },
      ],
      whatChanges: [
        { bold: 'One shoulder sits visibly higher', text: 'upper trap becomes chronically tight' },
        { bold: 'Neck muscles tighten on one side', text: 'pulling the head slightly off-center' },
        { bold: 'Opposite side weakens', text: 'lower trap and serratus lose activation' },
        { bold: 'Scapula positioning shifts', text: 'asymmetric shoulder blade placement' },
        { bold: 'Spine compensates', text: 'mild side-bending becomes the new normal' },
      ],
      howToFix: {
        stretch: [
          'Side neck stretch — hold 30s on the tight side',
          'Upper trap release — ear-to-shoulder, 3× daily',
        ],
        strength: [
          'Single-arm row — focus on the weaker side',
          'Side-lying lateral raise — activate the lower shoulder',
        ],
        habits: [
          'Center your screen at eye level',
          'Alternate which shoulder carries your bag',
          'Reset your posture every 30 min at your desk',
        ],
      },
    },
  },
];
