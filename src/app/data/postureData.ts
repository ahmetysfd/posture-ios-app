export interface Exercise {
  id: string;
  name: string;
  difficulty?: 'beginner' | 'medium' | 'hard';
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
  /** True when a resistance band is required to perform the exercise */
  requiresEquipment?: boolean;
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
  /** Optional focal point for card hero image */
  cardImageObjectPosition?: string;
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
      // ── Beginner ──────────────────────────────────────────────
      { id: 'fh-b1', name: 'Chin Tuck', difficulty: 'beginner', duration: 35, emoji: '🧘', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/hBJBx1QN3-c',
        description: 'Retrains head-over-spine alignment with minimal effort by activating the deep neck flexors.',
        instructions: ['Sit or stand tall, eyes level and relaxed', 'Imagine a string pulling the crown of your head straight up', 'Slide your chin straight back — not down toward your chest', 'Hold 5 seconds, feel a gentle stretch at the base of the skull', 'Relax fully and repeat 8–10 reps'] },
      { id: 'fh-b2', name: 'Supine Chin Tuck', difficulty: 'beginner', duration: 35, emoji: '🛌', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/mIQ_CyPnv6c',
        description: 'Gravity-assisted deep neck flexor activation with full head support.',
        instructions: ['Lie flat on your back, knees bent, feet flat on the floor', 'Press the back of your head gently into the floor', 'Draw your chin back and down — create a double-chin against gravity', 'Hold 5 seconds, feel the front of the neck activate', 'Relax completely and repeat 10–12 reps'] },
      { id: 'fh-b3', name: 'Suboccipital Massage', difficulty: 'beginner', duration: 40, emoji: '🤲', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/tNoTUTJpzDE',
        description: 'Releases tight sub-skull muscles pulling the head forward.',
        instructions: ['Sit tall, interlace fingers behind your head near the base of the skull', 'Apply gentle circular pressure along the ridge with both thumbs', 'Move slowly across the suboccipital muscles for 30–40 seconds', 'If you find a tender spot, hold light steady pressure for 8–10 seconds', 'Breathe slowly — never press hard into bone'] },
      { id: 'fh-b4', name: 'Weight Assisted Neck Stretch', difficulty: 'beginner', duration: 40, emoji: '🙆', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/wWukY9E5T_w',
        description: 'Gentle traction on tight cervical extensors with arm weight only.',
        instructions: ['Sit tall, anchor one hand under the edge of your seat', 'Rest the opposite hand lightly on top of your head', 'Let the weight of your arm slowly tilt your ear toward your shoulder', 'Hold 20–25 seconds — the arm weight is enough, do not pull', 'Slowly return to neutral and switch sides'] },
      { id: 'fh-b5', name: 'Side Lying Chin Tuck', difficulty: 'beginner', duration: 35, emoji: '🛌', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/p-ok89KNPCk',
        description: 'Supported position that builds neck retraction awareness without gravity challenge.',
        instructions: ['Lie on your side with a pillow supporting your head', 'Align your body in a straight line from head to hips', 'Slide your chin straight back horizontally — no tilting', 'Hold 3–5 seconds, feel the back of the neck lengthen', 'Repeat 10–12 reps then switch sides'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'fh-m1', name: 'Wall Lean Chin Tuck', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/uSTnwYMsZ7A',
        description: 'Wall feedback increases deep neck flexor load for a more demanding retraction.',
        instructions: ['Stand with your back, head, and heels touching the wall', 'Step feet 3 inches away from the baseboard', 'Press your head into the wall and draw the chin back simultaneously', 'Hold 8 seconds maintaining full wall contact', 'Release slightly, reset posture, and repeat 10 reps'] },
      { id: 'fh-m2', name: 'Chin Tuck Rotations', difficulty: 'medium', duration: 45, emoji: '🔄', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/cU0RMzfj0dY',
        description: 'Adds rotational control to the retraction pattern for full cervical stability.',
        instructions: ['Begin with a full chin tuck — hold the retraction throughout', 'Keeping the tuck, slowly rotate your head to one side', 'Stop at a comfortable end range, hold 3 seconds', 'Return to center, then rotate to the other side', 'Perform 8–10 reps per direction without losing the retraction'] },
      { id: 'fh-m3', name: 'Chin Tuck Floor Angels', difficulty: 'medium', duration: 45, emoji: '🪄', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/tmZ6ufhHeNA',
        description: 'Combines neck retraction with full-arm overhead pattern for whole-chain correction.',
        instructions: ['Lie on your back, arms by your sides, lower back flat', 'Perform a full chin tuck — maintain it for the entire set', 'Slowly sweep both arms up the floor toward overhead like a snow angel', 'Keep your lower back flat — no arch should develop', 'Return arms to sides slowly, reset chin tuck if needed, 8–10 reps'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'fh-h1', name: 'Prone Chin Tuck', difficulty: 'hard', duration: 50, emoji: '🤸', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/UsNvYtfTGHY',
        description: 'Gravity-resisted neck retraction in the prone position builds deep flexor endurance.',
        instructions: ['Lie face down with a small rolled towel under your forehead', 'Keep your gaze toward the floor — do not lift your head', 'Draw your chin back against gravity, creating retraction', 'Hold 5–8 seconds, feel effort in the front of your neck', 'Relax and repeat 10–12 reps at a slow, controlled pace'] },
      { id: 'fh-h2', name: 'Banded Chin Tucks', difficulty: 'hard', duration: 55, emoji: '💫', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/LthybLqjstI', requiresEquipment: true,
        description: 'External resistance strengthens deep neck flexors against a forward-pulling load.',
        instructions: ['Loop a light resistance band around the back of your head at the occiput', 'Face the anchor point with the band creating forward tension', 'Against the band pull, perform a full chin retraction', 'Hold 5 seconds at maximum retraction — resist any forward drift', 'Return with control and repeat 10–12 reps, progressively increasing resistance'] },
      { id: 'fh-h3', name: 'Chin Tuck Neck Bridge', difficulty: 'hard', duration: 55, emoji: '🌉', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/M0Dg9ncnoao',
        description: 'High-load cervical stability exercise using bodyweight against the floor.',
        instructions: ['Lie on your back, knees bent, feet flat', 'Perform a full chin tuck and hold it throughout the movement', 'Press through your feet and slowly lift your head off the floor', 'Hold 8–10 seconds using only your deep neck flexors — no momentum', 'Lower with full control and repeat 8 reps'] },
    ],
    tips: ['Position screen at eye level', 'Break every 30 minutes', 'Use supportive pillow', 'Strengthen deep neck flexors'],
    premiumLayout: {
      whyItHappens: [
        { bold: 'Sedentary habits', text: 'Hours of sitting with rounded shoulders pull the head forward from its neutral balanced position.' },
        { bold: 'Screen placement', text: 'Monitors and phones positioned too low force sustained chin-forward strain on the cervical spine.' },
        { bold: 'Weak neck flexors', text: 'The deep muscles that hold your head upright fatigue and disengage from prolonged inactivity.' },
        { bold: 'Tight suboccipitals', text: 'Overactive muscles at the base of the skull compress the upper cervical joints over time.' },
      ],
      whatChanges: [
        { bold: 'Spinal load', text: 'For every inch the head protrudes forward, the effective load on the cervical spine roughly doubles.' },
        { bold: 'Muscle imbalance', text: 'Front neck muscles weaken while upper traps and suboccipitals become chronically tight.' },
        { bold: 'Breathing', text: 'Forward head compresses the chest cavity, reducing lung expansion and diaphragm function.' },
        { bold: 'Chronic headaches', text: 'Compressed nerves and tight posterior neck muscles generate recurring tension headaches.' },
      ],
      howToFix: {
        stretch: ['Chin tuck — 2 sets × 10 reps daily', 'Upper trap stretch — 30s each side', 'Doorway chest opener — 3 × 30s'],
        strength: ['Wall posture holds — build from 30s to 2 min', 'Scapular retractions — 3 × 12–15 reps', 'Deep neck flexor activation with resistance band'],
        habits: ['Raise your screen to eye level', 'Neck-reset break every 30 minutes', 'Check pillow height — neutral neck during sleep', 'Avoid using phone while lying on your back'],
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
      // ── Beginner ──────────────────────────────────────────────
      { id: 'ws-b1', name: 'Air Angel', difficulty: 'beginner', duration: 35, emoji: '🪄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/g1YnTIYRAxo',
        description: 'Activates serratus anterior through an overhead reaching pattern in open space.',
        instructions: ['Stand tall with arms relaxed at your sides', 'Sweep both arms out and up overhead in a wide arc like a snow angel', 'Keep shoulder blades retracted and depressed throughout the movement', 'Pause briefly overhead, then lower slowly back to the start', 'Complete 10–12 reps at a deliberate, controlled pace'] },
      { id: 'ws-b2', name: 'Shoulder Rockets', difficulty: 'beginner', duration: 35, emoji: '🚀', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/Yi3VqHQd8VY',
        description: 'Light scapular protraction-retraction rhythm trains the serratus-rhomboid balance.',
        instructions: ['Stand or sit tall, arms relaxed at your sides', 'Raise both shoulders in small quick pulses — 2–3 cm per pulse', 'Complete 20 quick alternating shoulder lifts', 'Keep your neck long — do not let the head nod forward', 'Finish with one slow full shrug and controlled release, 3 sets'] },
      { id: 'ws-b3', name: 'Thoracic Foam Roll', difficulty: 'beginner', duration: 40, emoji: '🫧', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/SAvPkMKTgwI',
        description: 'Releases periscapular tightness, allowing the scapula to track freely against the ribcage.',
        instructions: ['Place a foam roller perpendicular to your spine at mid-back level', 'Support your head with hands interlaced behind it', 'Let your thoracic spine gently extend over the roller', 'Move 2–3 inches up or down and repeat at each segment', 'Spend 35–45 seconds breathing into each position'] },
      { id: 'ws-b4', name: 'Wall Angel', difficulty: 'beginner', duration: 40, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/AVFrTWQKHJA',
        description: 'Scapular upward rotation against the wall targets serratus and lower trapezius together.',
        instructions: ['Stand with your back flat against the wall, feet 6 inches from the base', 'Press head, upper back, and hips firmly into the wall', 'Raise arms to a 90° goalpost position, backs of hands on wall', 'Slowly slide arms overhead while keeping all contact points on the wall', 'Lower with full control — 10 reps, keep ribs down throughout'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'ws-m1', name: 'Floor Angel', difficulty: 'medium', duration: 45, emoji: '🪄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/1Qy9ZazKYWg',
        description: 'Floor contact increases serratus anterior demand in the full overhead pattern.',
        instructions: ['Lie on your back, arms at 90° goalpost with elbows bent', 'Press the backs of your hands and forearms completely flat on the floor', 'Slowly slide arms overhead while maintaining floor contact throughout', 'Stop before you lose contact — return under full control', '10 slow reps, feeling the thoracic and scapular demand increase'] },
      { id: 'ws-m2', name: 'Face Pulls', difficulty: 'medium', duration: 45, emoji: '🎯', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/e8APCEYbpVY', requiresEquipment: true,
        description: 'Scapular retraction strengthens mid-traps to pin and stabilize the scapula against the ribcage.',
        instructions: ['Anchor a resistance band at face height', 'Hold both ends with an overhand grip, arms extended forward', 'Pull the band toward your face, driving elbows back and wide', 'Externally rotate at the end so hands end beside your ears', 'Squeeze 2 seconds at maximum retraction, then return — 12–15 reps'] },
      { id: 'ws-m3', name: 'Reverse Fly', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/OUn0pOyxqwE', requiresEquipment: true,
        description: 'Rhomboid and mid-trap strengthening pins the scapula to the ribcage under load.',
        instructions: ['Hinge forward 45° from hips, soft knees, back flat', 'Hold light weights or a band, arms hanging below chest', 'Raise both arms out to the sides in a wide arc, squeezing shoulder blades', 'Hold 1 second at the top — elbows slightly soft', 'Lower with full control, 12–15 reps'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'ws-h1', name: 'Cuffed Angels', difficulty: 'hard', duration: 50, emoji: '💫', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/0RtxcS9F_Hk',
        description: 'Rotator cuff plus scapular stabilizer co-contraction for integrated serratus activation under resistance.',
        instructions: ['Apply a light resistance band around both wrists', 'Perform the floor angel movement while keeping the band taut', 'Externally rotate against the band throughout the arc', 'The cuff forces rotator cuff activation alongside scapular movement', '10–12 reps maintaining constant rotational tension in the band'] },
      { id: 'ws-h2', name: 'Banded Rainbows', difficulty: 'hard', duration: 55, emoji: '🌈', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/uUFnCndr5JU', requiresEquipment: true,
        description: 'Full-arc overhead resistance demands continuous scapular stabilization through the entire range.',
        instructions: ['Stand tall with a resistance band anchored below your feet', 'Hold the band in both hands, arms extended above your head', 'Arc both arms in a wide rainbow from one side down through center to the other', 'Control the deceleration — resist the pull on the return arc', '10–12 full arcs, maintaining upright posture throughout'] },
      { id: 'ws-h3', name: 'Archer Rows', difficulty: 'hard', duration: 55, emoji: '🏹', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/YCjnjRQY3cU', requiresEquipment: true,
        description: 'Unilateral row forces independent scapular control on the pulling side.',
        instructions: ['Face a resistance band or cable anchored at shoulder height', 'Pull with one arm toward your hip while the other arm extends forward', 'Keep the pulling elbow close to your body like drawing a bowstring', 'Hold 1–2 seconds at full retraction on the pulling side', 'Extend and return with control — 10–12 reps per arm'] },
      { id: 'ws-h4', name: 'Bent Over Y Raise', difficulty: 'hard', duration: 55, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/watch?v=ULD3ff4TW4w',
        description: 'Lower trap isolation is critical for scapular depression and stable winging correction.',
        instructions: ['Hinge forward to nearly horizontal, back flat, soft knees', 'Start with arms hanging straight down in a neutral grip', 'Raise both arms in a Y shape — 30° above the shoulder line', 'Drive from the lower trapezius — no momentum or jerking', 'Hold 2 seconds at the top, lower for 3 seconds — 10–12 reps'] },
      { id: 'ws-h5', name: 'Eccentric Reverse Fly', difficulty: 'hard', duration: 60, emoji: '🔄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/74wyKVYgETU', requiresEquipment: true,
        description: 'Slow eccentric loading builds scapular retractor endurance to counter chronic winging.',
        instructions: ['Perform the reverse fly using both arms to raise (1 second concentric)', 'At the top, remove one hand and lower on ONE arm only over 4–5 seconds', 'Feel the rhomboid and mid-trap eccentrically loading through the lowering', 'Alternate the lowering arm each rep', '8–10 reps per arm — use moderate weight'] },
      { id: 'ws-h6', name: 'Chin Tuck Floor Angels', difficulty: 'hard', duration: 60, emoji: '🧘', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/tmZ6ufhHeNA',
        description: 'Full chain pattern demands coordinated scapular movement under cervical control.',
        instructions: ['Lie on your back, arms by your sides, lower back flat on the floor', 'Perform a full chin tuck and maintain it for the entire set', 'Slowly sweep both arms up the floor toward overhead', 'Keep your lower back flat — no arch should develop at any point', 'Return arms to sides slowly, reset chin tuck if needed — 8–10 reps'] },
    ],
    tips: ['Avoid prolonged elbow-plank shrugging', 'Strengthen serratus gradually', 'Check desk elbow height', 'See a clinician if pain or numbness'],
    premiumLayout: {
      whyItHappens: [
        { bold: 'Serratus anterior weakness', text: 'This often-neglected muscle is the primary stabilizer that pins the scapula flat against the ribcage.' },
        { bold: 'Desk posture', text: 'Sustained rounding and forward head positioning inhibit the serratus and overload the rhomboids.' },
        { bold: 'Push/pull imbalance', text: 'Training chest and shoulders without equal back work creates a pulling force that tips the scapula outward.' },
        { bold: 'Lost motor control', text: 'The brain loses the coordinated movement pattern needed for smooth, stable shoulder blade motion.' },
      ],
      whatChanges: [
        { bold: 'Impingement risk', text: 'A poorly positioned scapula reduces the subacromial space, increasing rotator cuff pinching risk.' },
        { bold: 'Rotator cuff strain', text: 'Without a stable scapular base, small rotator cuff muscles overcompensate and become chronically strained.' },
        { bold: 'Neck and thoracic pain', text: 'Inefficient scapular movement transfers excess load up into the cervical and thoracic spine.' },
        { bold: 'Asymmetry', text: 'The affected side develops compensatory movement patterns in the arm, shoulder, and neck over time.' },
      ],
      howToFix: {
        stretch: ['Pec minor doorway stretch — 3 × 30s', 'Lat stretch with arm overhead — 30s each side', 'Thoracic extension over foam roller — 60s'],
        strength: ['Wall push-up plus — 3 × 10–12 reps', 'Serratus punch with band — 3 × 12 each arm', 'Prone Y raises — 3 × 10 reps'],
        habits: ['Avoid resting elbows on desk for long periods', 'Include pull movements in every upper body session', 'Check shoulder height symmetry in mirror daily', 'See a physio if you notice clicking or catching'],
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
      // ── Beginner ──────────────────────────────────────────────
      { id: 'apt-b1', name: 'Supine Pelvic Tilt', difficulty: 'beginner', duration: 35, emoji: '🔄', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/DqqUIfMuDX4',
        description: 'Teaches posterior tilt awareness in a supported position with gravity removed.',
        instructions: ['Lie on your back, knees bent, feet flat, arms by your sides', 'Breathe out and gently flatten your lower back into the floor', 'Engage your abs lightly — feel the pelvis rotate backward', 'Hold 5 seconds, feel the lumbar spine contact the floor', 'Release completely and repeat 12–15 reps'] },
      { id: 'apt-b2', name: 'Standing Pelvic Tilt', difficulty: 'beginner', duration: 35, emoji: '🧍', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/MnvcnjCf710',
        description: 'Transfers pelvic tilt control to a functional standing position.',
        instructions: ['Stand with your back against a wall, feet 4–6 inches forward', 'Notice the gap between your lower back and the wall', 'Gently tuck your pelvis — engage your abs and glutes to flatten that gap', 'Hold 5 seconds, feel the lower back press toward the wall', 'Release and repeat 10–12 reps to build functional awareness'] },
      { id: 'apt-b3', name: 'Pelvic Twist', difficulty: 'beginner', duration: 40, emoji: '🌀', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/DqqUIfMuDX4',
        description: 'Mobilises the lumbar-pelvic junction to reduce lordotic stiffness.',
        instructions: ['Stand with feet hip-width apart, hands resting on your hips', 'Gently rotate your pelvis in small circles — 8–10 circles clockwise', 'Reverse for 8–10 circles counter-clockwise', 'Keep the movement slow and exploratory — find any stiff spots', 'Finish with slow side-to-side shifts to mobilise the lumbar-pelvic junction'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'apt-m1', name: 'Split Squat Pelvic Tilts', difficulty: 'medium', duration: 45, emoji: '🦵', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/DBDwIVPWZms',
        description: 'Hip flexor lengthening combined with tilt control in a functional split stance.',
        instructions: ['Stand in a split stance — right foot forward, left foot back, both feet flat', 'Lower your back knee toward the floor into a split squat', 'At the bottom, perform a posterior pelvic tilt — tuck and engage', 'Hold the tilt for 5 seconds, feeling the hip flexor stretch deepen', 'Rise and repeat 10 reps per side, alternating legs'] },
      { id: 'apt-m2', name: 'Wall Lean Plank', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/eGc5eLQ0KPA',
        description: 'Anterior core engagement in a plank position counters excessive lumbar lordosis.',
        instructions: ['Face a wall, place both forearms flat against it at shoulder height', 'Step feet back until your body forms a straight inclined plank', 'Engage your anterior core — prevent your lower back from arching', 'Maintain a posterior pelvic tilt throughout the hold', 'Hold 20–30 seconds, rest, and repeat 3 sets building duration'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'apt-h1', name: 'Swimmers', difficulty: 'hard', duration: 55, emoji: '🏊', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/oOaXVYntkfA',
        description: 'Prone extension with glute activation rebalances hip extensors that oppose the tilt.',
        instructions: ['Lie face down on a mat, arms extended overhead', 'Simultaneously lift your right arm and left leg off the floor', 'Hold 2 seconds then switch to left arm and right leg', 'Move in a controlled flutter pattern — 10 reps each side', 'Keep your neck neutral and squeeze glutes throughout'] },
      { id: 'apt-h2', name: 'Archer Rows', difficulty: 'hard', duration: 55, emoji: '🏹', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/YCjnjRQY3cU', requiresEquipment: true,
        description: 'Posterior chain strengthening reduces the anterior pull pattern through heavy unilateral loading.',
        instructions: ['Face a resistance band or cable anchored at shoulder height', 'Pull with one arm toward your hip while the other arm extends forward', 'Keep the pulling elbow close like drawing a bowstring — maintain hip stability', 'Hold 1–2 seconds at full retraction on the pulling side', 'Extend and return with control — 10–12 reps per arm'] },
      { id: 'apt-h3', name: 'Banded Rainbows', difficulty: 'hard', duration: 60, emoji: '🌈', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/uUFnCndr5JU', requiresEquipment: true,
        description: 'Overhead resistance demands continuous core bracing against the anterior tilt pattern.',
        instructions: ['Stand tall with a resistance band anchored below your feet', 'Hold the band in both hands, arms extended above your head', 'Arc both arms in a wide rainbow from one side down through center to the other', 'Control the deceleration — resist the pull on the return arc', '10–12 full arcs, keeping core braced and pelvis neutral throughout'] },
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
      // ── Beginner ──────────────────────────────────────────────
      { id: 'rs-b1', name: 'Thoracic Foam Roll', difficulty: 'beginner', duration: 40, emoji: '🫧', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/SAvPkMKTgwI',
        description: 'Releases stiff thoracic extensors and opens the chest to reduce the forward-rounding pull.',
        instructions: ['Place a foam roller perpendicular to your spine at mid-back level', 'Support your head with hands interlaced behind it', 'Let your thoracic spine gently extend over the roller', 'Move 2–3 inches up or down and repeat at each segment', 'Spend 35–45 seconds breathing into each position'] },
      { id: 'rs-b2', name: 'Shoulder Rockets', difficulty: 'beginner', duration: 35, emoji: '🚀', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/Yi3VqHQd8VY',
        description: 'Gentle rhythmic shoulder retraction mobilises anterior chest tightness with minimal effort.',
        instructions: ['Stand or sit tall, arms relaxed at your sides', 'Raise both shoulders in small quick pulses — 2–3 cm per pulse', 'Complete 20 quick alternating shoulder lifts at a lively pace', 'Keep your neck long — do not let your head bob forward', 'Finish with one slow full shrug and controlled release, 3 sets'] },
      { id: 'rs-b3', name: 'Thoracic Openers', difficulty: 'beginner', duration: 35, emoji: '🤸', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/B6h87p-TviI',
        description: 'Low-effort rotation that opens the front of the chest against the rounding pattern.',
        instructions: ['Sit upright or kneel, hands clasped behind your head', 'Inhale, then rotate your trunk to one side as far as comfortable', 'Use the exhale to rotate a little further into the range', 'Return to center slowly and rotate to the other side', 'Complete 10 rotations per side at a controlled, gentle tempo'] },
      { id: 'rs-b4', name: 'Air Angel', difficulty: 'beginner', duration: 35, emoji: '🪄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/g1YnTIYRAxo',
        description: 'Trains scapular retraction and external rotation in an open-space overhead pattern.',
        instructions: ['Stand tall with arms relaxed at your sides', 'Sweep both arms out and up overhead in a wide arc like a snow angel', 'Keep shoulder blades retracted and depressed throughout the movement', 'Pause briefly overhead, then lower slowly back to the start', 'Complete 10–12 reps at a deliberate, controlled pace'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'rs-m1', name: 'Wall Angel', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/AVFrTWQKHJA',
        description: 'Wall contact enforces full scapular retraction and upward rotation for real-time feedback.',
        instructions: ['Stand with your back flat against the wall, feet 6 inches from the base', 'Press head, upper back, and hips firmly into the wall', 'Raise arms to a 90° goalpost position, backs of hands on wall', 'Slowly slide arms overhead while keeping all contact points on the wall', 'Lower with full control — 10 reps, keep ribs down throughout'] },
      { id: 'rs-m2', name: 'Floor Angel', difficulty: 'medium', duration: 45, emoji: '🪄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/1Qy9ZazKYWg',
        description: 'The floor removes compensations and increases thoracic demand in the full overhead pattern.',
        instructions: ['Lie on your back, arms at 90° goalpost with elbows bent', 'Press the backs of your hands and forearms completely flat on the floor', 'Slowly slide arms overhead while maintaining full floor contact', 'Stop before you lose contact and return under full control', '10 slow reps, feeling the thoracic demand increase progressively'] },
      { id: 'rs-m3', name: 'Reverse Fly', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/OUn0pOyxqwE', requiresEquipment: true,
        description: 'Strengthens mid-traps and rhomboids under load to actively pull shoulders back.',
        instructions: ['Hinge forward 45° from hips, soft knees, back flat', 'Hold light weights or a resistance band, arms hanging below chest', 'Raise both arms out to the sides in a wide arc, squeezing shoulder blades', 'Hold 1 second at the top — elbows slightly soft throughout', 'Lower with full control — 12–15 reps'] },
      { id: 'rs-m4', name: 'Face Pulls', difficulty: 'medium', duration: 45, emoji: '🎯', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/e8APCEYbpVY', requiresEquipment: true,
        description: 'External rotation and retraction under band resistance directly counters the rounding pattern.',
        instructions: ['Anchor a resistance band at face height', 'Hold both ends with an overhand grip, arms extended forward', 'Pull the band toward your face, driving elbows back and wide', 'Externally rotate at the end so hands end beside your ears', 'Squeeze 2 seconds at maximum retraction, return controlled — 12–15 reps'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'rs-h1', name: 'Cuffed Angels', difficulty: 'hard', duration: 50, emoji: '💫', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/0RtxcS9F_Hk',
        description: 'Adds rotator cuff demand to the angel pattern for deeper scapular stability under resistance.',
        instructions: ['Apply a light resistance band around both wrists', 'Perform the floor angel movement while keeping the band taut throughout', 'Externally rotate against the band as you slide overhead', 'The cuff forces rotator cuff activation alongside scapular retraction', '10–12 reps maintaining constant rotational tension in the band'] },
      { id: 'rs-h2', name: 'Eccentric Reverse Fly', difficulty: 'hard', duration: 55, emoji: '🔄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/74wyKVYgETU', requiresEquipment: true,
        description: 'Slow negatives build deep upper back endurance to sustain correct shoulder position.',
        instructions: ['Perform the reverse fly using both arms to raise (1 second concentric)', 'At the top, remove one hand and lower on ONE arm only over 4–5 seconds', 'Feel the rhomboid and mid-trap eccentrically loading through the descent', 'Alternate the lowering arm each rep for bilateral balance', '8–10 reps per arm — use moderate weight'] },
      { id: 'rs-h3', name: 'Archer Rows', difficulty: 'hard', duration: 55, emoji: '🏹', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/YCjnjRQY3cU', requiresEquipment: true,
        description: 'Unilateral pull corrects asymmetric rounding by loading each scapular retractor independently.',
        instructions: ['Face a resistance band or cable anchored at shoulder height', 'Pull with one arm toward your hip while the other arm extends forward', 'Keep the pulling elbow close to your body like drawing a bowstring', 'Hold 1–2 seconds at full retraction on the pulling side', 'Extend and return with control — 10–12 reps per arm'] },
      { id: 'rs-h4', name: 'Bent Over Y Raise', difficulty: 'hard', duration: 55, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/watch?v=ULD3ff4TW4w',
        description: 'Lower trap activation in a gravity-challenging position directly opposes shoulder rounding.',
        instructions: ['Hinge forward to nearly horizontal, back flat, soft knees', 'Start with arms hanging straight down in a neutral grip', 'Raise both arms in a Y shape — 30° above the shoulder line', 'Drive from the lower trapezius — no momentum or body swing', 'Hold 2 seconds at the top, lower for 3 seconds — 10–12 reps'] },
      { id: 'rs-h5', name: 'Banded Rainbows', difficulty: 'hard', duration: 60, emoji: '🌈', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/uUFnCndr5JU', requiresEquipment: true,
        description: 'Full-arc overhead resistance challenges scapular control through the complete shoulder range.',
        instructions: ['Stand tall with a resistance band anchored below your feet', 'Hold the band in both hands, arms extended above your head', 'Arc both arms in a wide rainbow from one side down through center to the other', 'Control the deceleration — resist the pull on the return arc', '10–12 full arcs, maintaining upright posture throughout'] },
      { id: 'rs-h6', name: 'Seated Deconstructed Face Pull', difficulty: 'hard', duration: 60, emoji: '🏹', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/drJnKgXoRQc', requiresEquipment: true,
        description: 'Isolated retraction with a sustained hold builds scapular endurance for persistent correction.',
        instructions: ['Sit upright, resistance band anchored at face height in front', 'Retract your scapulae fully before initiating the pull each rep', 'Pull both hands to ear level, elbows flared 45° above shoulder line', 'Hold the fully retracted position for 3 seconds — isolate the movement', 'Reset scapulae each rep — 10–12 reps'] },
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
      // ── Beginner ──────────────────────────────────────────────
      { id: 'ky-b1', name: 'Thoracic Foam Roll', difficulty: 'beginner', duration: 40, emoji: '🫧', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/SAvPkMKTgwI',
        description: 'Mobilises stiff thoracic segments into extension to begin reversing the kyphotic curve.',
        instructions: ['Place a foam roller perpendicular to your spine at mid-back level', 'Support your head with hands interlaced behind it', 'Let your thoracic spine gently extend over the roller', 'Move 2–3 inches up or down and pause at each tight segment', 'Spend 35–45 seconds, breathing into each position to allow release'] },
      { id: 'ky-b2', name: 'Thoracic Openers', difficulty: 'beginner', duration: 35, emoji: '🤸', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/B6h87p-TviI',
        description: 'Gentle rotation restores mid-back mobility compressed by the kyphotic posture.',
        instructions: ['Sit upright or kneel, hands clasped behind your head', 'Inhale, then rotate your trunk to one side as far as comfortable', 'Use the exhale to rotate a little further into the end range', 'Return to center slowly and rotate to the other side', 'Complete 10 rotations per side at a gentle, controlled tempo'] },
      { id: 'ky-b3', name: 'Air Angel', difficulty: 'beginner', duration: 35, emoji: '🪄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/g1YnTIYRAxo',
        description: 'Teaches upright extension awareness with scapular engagement in an open pattern.',
        instructions: ['Stand tall with arms relaxed at your sides', 'Sweep both arms out and up overhead in a wide arc like a snow angel', 'Keep shoulder blades retracted and depressed throughout', 'Pause briefly overhead, then lower slowly back to the start', 'Complete 10–12 reps maintaining an upright extended spine'] },
      { id: 'ky-b4', name: 'Supine Chin Tuck', difficulty: 'beginner', duration: 35, emoji: '🛌', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/mIQ_CyPnv6c',
        description: 'Begins reversing the forward-flexed chain from the top by activating deep neck flexors.',
        instructions: ['Lie flat on your back, knees bent, feet flat on the floor', 'Press the back of your head gently into the floor', 'Draw your chin back and down — create a double-chin against gravity', 'Hold 5 seconds feeling the front of the neck activate', 'Relax completely and repeat 10–12 reps'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'ky-m1', name: 'Floor Angel', difficulty: 'medium', duration: 45, emoji: '🪄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/1Qy9ZazKYWg',
        description: 'Enforces thoracic extension against the floor, removing all compensatory strategies.',
        instructions: ['Lie on your back, arms at 90° goalpost with elbows bent', 'Press the backs of your hands and forearms completely flat on the floor', 'Slowly slide arms overhead while maintaining full floor contact', 'Stop before you lose contact and return under full control', '10 slow reps — the floor enforces honest thoracic movement'] },
      { id: 'ky-m2', name: 'Wall Angel', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/AVFrTWQKHJA',
        description: 'Strengthens thoracic extensors with real-time wall feedback for posture calibration.',
        instructions: ['Stand with your back flat against the wall, feet 6 inches from the base', 'Press head, upper back, and hips firmly into the wall', 'Raise arms to a 90° goalpost position, backs of hands on wall', 'Slowly slide arms overhead while keeping all contact points on the wall', 'Lower with full control — 10 reps, keep ribs down throughout'] },
      { id: 'ky-m3', name: 'Reverse Fly', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/OUn0pOyxqwE', requiresEquipment: true,
        description: 'Directly strengthens the muscles opposing thoracic flexion under external load.',
        instructions: ['Hinge forward 45° from hips, soft knees, back flat', 'Hold light weights or a resistance band, arms hanging below chest', 'Raise both arms out to the sides in a wide arc, squeezing shoulder blades', 'Hold 1 second at the top — elbows slightly soft', 'Lower with full control — 12–15 reps'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'ky-h1', name: 'Cuffed Angels', difficulty: 'hard', duration: 50, emoji: '💫', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/0RtxcS9F_Hk',
        description: 'Adds rotator cuff demand to extension patterning for deeper thoracic stability under resistance.',
        instructions: ['Apply a light resistance band around both wrists', 'Perform the floor angel movement while keeping the band taut throughout', 'Externally rotate against the band as you slide overhead', 'The cuff tension forces rotator cuff activation alongside thoracic extension', '10–12 reps maintaining constant rotational tension in the band'] },
      { id: 'ky-h2', name: 'Swimmers', difficulty: 'hard', duration: 50, emoji: '🏊', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/oOaXVYntkfA',
        description: 'Dynamic prone extension activates the full posterior chain to oppose the kyphotic curve.',
        instructions: ['Lie face down on a mat, arms extended overhead', 'Simultaneously lift your right arm and left leg off the floor', 'Hold 2 seconds then switch to left arm and right leg', 'Move in a controlled flutter pattern — 10 reps each side', 'Keep your neck neutral and core gently engaged throughout'] },
      { id: 'ky-h3', name: 'Archer Rows', difficulty: 'hard', duration: 55, emoji: '🏹', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/YCjnjRQY3cU', requiresEquipment: true,
        description: 'Heavy unilateral pull loads the thoracic extensors through significant spinal demand.',
        instructions: ['Face a resistance band or cable anchored at shoulder height', 'Pull with one arm toward your hip while the other arm extends forward', 'Keep the pulling elbow close to your body like drawing a bowstring', 'Hold 1–2 seconds at full retraction — feel the thoracic extensors engage', 'Extend and return with control — 10–12 reps per arm'] },
      { id: 'ky-h4', name: 'Eccentric Reverse Fly', difficulty: 'hard', duration: 55, emoji: '🔄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/74wyKVYgETU', requiresEquipment: true,
        description: 'Prolonged eccentric loading builds erector and mid-trap endurance for sustained upright posture.',
        instructions: ['Perform the reverse fly using both arms to raise (1 second concentric)', 'At the top, remove one hand and lower on ONE arm only over 4–5 seconds', 'Feel the mid-trap and erector eccentrically loading through the descent', 'Alternate the lowering arm each rep for bilateral balance', '8–10 reps per arm — use moderate weight'] },
      { id: 'ky-h5', name: 'Bent Over Y Raise', difficulty: 'hard', duration: 55, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/watch?v=ULD3ff4TW4w',
        description: 'Targets the lower traps, the key stabilizers that pull the thoracic spine out of a kyphotic curve.',
        instructions: ['Hinge forward to nearly horizontal, back flat, soft knees', 'Start with arms hanging straight down in a neutral grip', 'Raise both arms in a Y shape — 30° above the shoulder line', 'Drive from the lower trapezius — no momentum or body swing', 'Hold 2 seconds at the top, lower for 3 seconds — 10–12 reps'] },
      { id: 'ky-h6', name: 'Chin Tuck Floor Angels', difficulty: 'hard', duration: 60, emoji: '🧘', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/tmZ6ufhHeNA',
        description: 'Combines cervical and thoracic correction simultaneously for whole-chain postural training.',
        instructions: ['Lie on your back, lower back flat on the floor throughout', 'Perform a full chin tuck and maintain it for the entire set', 'Slowly sweep both arms up the floor toward overhead', 'Maintain the lower back flat — no arch should develop at any point', 'Return arms to sides slowly — 8–10 reps'] },
      { id: 'ky-h7', name: 'Banded Rainbows', difficulty: 'hard', duration: 60, emoji: '🌈', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/uUFnCndr5JU', requiresEquipment: true,
        description: 'Full overhead arc under resistance challenges thoracic extension through the complete shoulder range.',
        instructions: ['Stand tall with a resistance band anchored below your feet', 'Hold the band in both hands, arms extended above your head', 'Arc both arms in a wide rainbow from one side down through center to the other', 'Control the deceleration — resist the pull on the return arc', '10–12 full arcs — maintain an upright, extended spine throughout'] },
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
      // ── Beginner ──────────────────────────────────────────────
      { id: 'us-b1', name: 'Shoulder Rockets', difficulty: 'beginner', duration: 35, emoji: '🚀', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/Yi3VqHQd8VY',
        description: 'Bilateral rhythmic motion resets shoulder symmetry by equalising trap activation.',
        instructions: ['Stand or sit tall, arms relaxed at your sides', 'Raise both shoulders in small quick pulses — 2–3 cm per pulse', 'Complete 20 quick alternating shoulder lifts at a lively pace', 'Focus on keeping both sides working at exactly equal height', 'Finish with one slow full shrug and controlled release, 3 sets'] },
      { id: 'us-b2', name: 'Thoracic Openers', difficulty: 'beginner', duration: 35, emoji: '🤸', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/B6h87p-TviI',
        description: 'Rotational mobility corrects asymmetric thoracic stiffness contributing to the height difference.',
        instructions: ['Sit upright or kneel, hands clasped behind your head', 'Inhale, then rotate your trunk to the tighter side first', 'Use the exhale to rotate a little further into the end range', 'Return to center slowly and rotate to the other side', 'Complete 10 rotations per side noting any asymmetry'] },
      { id: 'us-b3', name: 'Air Angel', difficulty: 'beginner', duration: 35, emoji: '🪄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/g1YnTIYRAxo',
        description: 'Symmetrical overhead pattern highlights and corrects imbalance in real time.',
        instructions: ['Stand tall with arms relaxed at your sides', 'Sweep both arms out and up overhead in a wide symmetric arc', 'Watch in a mirror if possible to check for height discrepancy', 'Keep shoulder blades retracted and depressed equally throughout', 'Complete 10–12 reps at a controlled pace, aiming for perfect symmetry'] },
      { id: 'us-b4', name: 'Thoracic Foam Roll', difficulty: 'beginner', duration: 40, emoji: '🫧', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/SAvPkMKTgwI',
        description: 'Releases unilateral thoracic restrictions that are pulling one shoulder upward.',
        instructions: ['Place a foam roller perpendicular to your spine at mid-back level', 'Support your head with hands interlaced behind it', 'Let your thoracic spine gently extend over the roller', 'Spend extra time rolling the side of the elevated shoulder', 'Breathe into each position for 35–45 seconds total'] },
      { id: 'us-b5', name: 'Weight Assisted Neck Stretch', difficulty: 'beginner', duration: 40, emoji: '🙆', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/wWukY9E5T_w',
        description: 'Addresses asymmetric upper trap tightness on the elevated-shoulder side.',
        instructions: ['Sit tall, anchor one hand under the edge of your seat on the tight side', 'Rest the opposite hand lightly on top of your head', 'Let the arm weight slowly tilt your ear toward your shoulder', 'Hold 20–25 seconds — the arm weight is enough, do not pull', 'Switch sides, spending 5 extra seconds on the tight side'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'us-m1', name: 'Unilateral Y Raise', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/EuhDanbxxG4', requiresEquipment: true,
        description: 'Isolates the weaker side to directly correct the strength asymmetry driving unevenness.',
        instructions: ['Stand or hinge forward slightly, hold one dumbbell in the weaker-side arm only', 'Raise the arm in a Y direction — 45° above the shoulder line', 'Squeeze your lower trap at the top — hold 2 seconds', 'Lower for 3 seconds — feel the eccentric load on the weak side', 'Complete 10–12 reps on the weaker side, then match with dominant side'] },
      { id: 'us-m2', name: 'Wall Angel', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/AVFrTWQKHJA',
        description: 'Bilateral wall contact reveals and corrects the height discrepancy against a flat reference.',
        instructions: ['Stand with your back flat against the wall, feet 6 inches from the base', 'Press head, upper back, and hips into the wall — note any shoulder height gap', 'Raise arms to a 90° goalpost position, backs of hands on wall', 'Slowly slide arms overhead while keeping equal contact pressure both sides', 'Lower with full control — 10 reps, consciously evening both shoulders'] },
      { id: 'us-m3', name: 'Face Pulls', difficulty: 'medium', duration: 45, emoji: '🎯', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/e8APCEYbpVY', requiresEquipment: true,
        description: 'Bilateral retraction forces even scapular positioning on both sides simultaneously.',
        instructions: ['Anchor a resistance band at face height', 'Hold both ends with an overhand grip, arms extended forward', 'Pull the band toward your face, driving elbows back and wide', 'Externally rotate at the end so both hands end beside your ears', 'Squeeze 2 seconds at maximum retraction — check that both elbows are level'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'us-h1', name: 'Overhead Shrug Neck Rotations', difficulty: 'hard', duration: 50, emoji: '🔄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/6TpTyshL2t0',
        description: 'Identifies and trains rotational control under sustained shoulder elevation for asymmetry correction.',
        instructions: ['Stand tall, raise both arms overhead in a full shrug position', 'Hold the overhead shrug — keep shoulders elevated and equal', 'Slowly rotate your neck to one side, pause 2–3 seconds', 'Return to center and rotate to the other side', 'Complete 8 reps per direction — note any side that feels more restricted'] },
      { id: 'us-h2', name: 'Eccentric Shoulder External Rotation', difficulty: 'hard', duration: 55, emoji: '💫', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/-KhciDzFuqU', requiresEquipment: true,
        description: 'Unilateral eccentric control corrects the rotational asymmetry underlying shoulder unevenness.',
        instructions: ['Lie on your side, hold a light dumbbell on the higher-shoulder side, elbow at 90°', 'Use your top hand to assist the weight up in 1 second (concentric)', 'Remove the assisting hand and lower the weight over 4–5 seconds (eccentric)', 'Feel the rotator cuff eccentrically loading through the entire descent', '8–10 reps per side — complete more reps on the higher shoulder side'] },
      { id: 'us-h3', name: 'Archer Rows', difficulty: 'hard', duration: 55, emoji: '🏹', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/YCjnjRQY3cU', requiresEquipment: true,
        description: 'Single-arm loading addresses the side-to-side strength gap driving the imbalance.',
        instructions: ['Face a resistance band or cable anchored at shoulder height', 'Pull with the weaker arm toward your hip while the other arm extends forward', 'Keep the pulling elbow close to your body like drawing a bowstring', 'Hold 1–2 seconds at full retraction — note any difference from dominant side', 'Complete 10–12 reps per arm, performing 1–2 extra sets on the weaker side'] },
      { id: 'us-h4', name: 'Eccentric Reverse Fly', difficulty: 'hard', duration: 55, emoji: '🔄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/74wyKVYgETU', requiresEquipment: true,
        description: 'Slow bilateral eccentric reveals and corrects dominant-side compensatory patterns.',
        instructions: ['Perform the reverse fly using both arms to raise (1 second concentric)', 'At the top, remove the dominant-side hand and lower on the weaker arm only', 'Lower over 4–5 seconds — feel which side fatigues faster', 'Alternate the lowering arm each rep to identify and close the gap', '8–10 reps per arm — use light to moderate weight'] },
      { id: 'us-h5', name: 'Banded Rainbows', difficulty: 'hard', duration: 60, emoji: '🌈', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/uUFnCndr5JU', requiresEquipment: true,
        description: 'Overhead arc under resistance exposes and challenges asymmetric shoulder weakness.',
        instructions: ['Stand tall with a resistance band anchored below your feet', 'Hold the band in both hands, arms extended above your head', 'Arc both arms in a wide rainbow — note any deviation to the stronger side', 'Control the deceleration — resist the pull on the return arc', '10–12 full arcs, consciously keeping the arc centered and symmetric'] },
      { id: 'us-h6', name: 'Seated Deconstructed Face Pull', difficulty: 'hard', duration: 60, emoji: '🏹', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/drJnKgXoRQc', requiresEquipment: true,
        description: 'Isolated retraction builds symmetrical scapular control with a sustained hold.',
        instructions: ['Sit upright, resistance band anchored at face height in front', 'Retract your scapulae fully before initiating the pull each rep', 'Pull both hands to ear level, elbows flared 45° above shoulder line', 'Hold the fully retracted position for 3 seconds — check both elbows are equal', 'Reset scapulae each rep — 10–12 reps'] },
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
