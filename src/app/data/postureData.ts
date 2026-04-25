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

/** Optional Figma-style copy for the bottom insight card (hero already shows title + image). */
export interface ProblemInsightOverrides {
  subtitle?: string;
  triggers?: string;
  impact?: string;
  stretch?: string;
  strengthen?: string;
  habits?: string;
  /** Short tagline shown at the top of the insight card */
  heroSubtitle?: string;
  /** "Does this sound familiar?" bullet points */
  familiarSymptoms?: string[];
  /** "Why it happens" paragraph */
  whyItHappensText?: string;
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
  /** Optional: overrides for bottom ProblemInsightCard */
  insightCard?: ProblemInsightOverrides;
}

export const postureProblems: PostureProblem[] = [
  {
    id: 'forward-head',
    title: 'Forward Head',
    cardImage: '/problems/forward-head.png',
    exercises: 12,
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
      // ── Beginner ──
      { id: 'fh-b1', name: 'Chin Tuck', difficulty: 'beginner', duration: 35, emoji: '🧘', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/hBJBx1QN3-c',
        description: 'Retrains head-over-spine alignment with minimal effort by activating the deep neck flexors.',
        instructions: ['Sit or stand tall, eyes level and relaxed', 'Imagine a string pulling the crown of your head straight up', 'Slide your chin straight back — not down toward your chest', 'Hold 5 seconds, feel a gentle stretch at the base of the skull', 'Relax fully and repeat 8–10 reps'] },
      { id: 'fh-b2', name: 'Supine Chin Tuck', difficulty: 'beginner', duration: 35, emoji: '🛌', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/mIQ_CyPnv6c',
        description: 'Gravity-assisted deep neck flexor activation with full head support.',
        instructions: ['Lie flat on your back, knees bent, feet flat on the floor', 'Press the back of your head gently into the floor', 'Draw your chin back and down — create a double-chin against gravity', 'Hold 5 seconds, feel the front of the neck activate', 'Relax completely and repeat 10–12 reps'] },
      { id: 'fh-b6', name: 'Upper Trapezius Stretch', difficulty: 'beginner', duration: 35, emoji: '🙆', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/3h0jsXcRT94',
        description: 'Releases the upper trapezius — a primary driver of forward head tension.',
        instructions: ['Sit tall with one hand anchored under your seat to stabilise the shoulder', 'Let your opposite ear drop toward your shoulder slowly and gently', 'Add a light hand weight on top of your head — do not pull', 'Hold 20–25 seconds feeling the lateral neck lengthen', 'Slowly return to neutral and switch sides'] },
      { id: 'fh-b7', name: 'Thoracic Openers', difficulty: 'beginner', duration: 40, emoji: '🌀', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/B6h87p-TviI',
        description: 'Gentle thoracic opening improves upper-back mobility to reduce forward-head compensation.',
        instructions: ['Sit or stand tall with your ribs stacked over your pelvis', 'Place hands behind your head and gently draw elbows wide', 'Lift your chest slightly and guide your upper back into extension', 'Pause briefly while keeping your neck long and relaxed', 'Return to neutral and repeat smooth controlled reps'] },
      // ── Medium ──
      { id: 'fh-m3', name: 'Chin Tuck Floor Angels', difficulty: 'medium', duration: 45, emoji: '🪄', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/tmZ6ufhHeNA',
        description: 'Combines neck retraction with full-arm overhead pattern for whole-chain correction.',
        instructions: ['Lie on your back, arms by your sides, lower back flat', 'Perform a full chin tuck — maintain it for the entire set', 'Slowly sweep both arms up the floor toward overhead like a snow angel', 'Keep your lower back flat — no arch should develop', 'Return arms to sides slowly, reset chin tuck if needed, 8–10 reps'] },
      { id: 'fh-m2', name: 'Chin Tuck Rotations', difficulty: 'medium', duration: 45, emoji: '🔄', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/cU0RMzfj0dY',
        description: 'Adds rotational control to the retraction pattern for full cervical stability.',
        instructions: ['Begin with a full chin tuck — hold the retraction throughout', 'Keeping the tuck, slowly rotate your head to one side', 'Stop at a comfortable end range, hold 3 seconds', 'Return to center, then rotate to the other side', 'Perform 8–10 reps per direction without losing the retraction'] },
      { id: 'fh-m1', name: 'Wall Lean Chin Tuck', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/uSTnwYMsZ7A',
        description: 'Wall feedback increases deep neck flexor load for a more demanding retraction.',
        instructions: ['Stand with your back, head, and heels touching the wall', 'Step feet 3 inches away from the baseboard', 'Press your head into the wall and draw the chin back simultaneously', 'Hold 8 seconds maintaining full wall contact', 'Release slightly, reset posture, and repeat 10 reps'] },
      { id: 'fh-m4', name: 'Seated Floor Taps', difficulty: 'medium', duration: 45, emoji: '🪑', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/9Tb2V_I46Fs',
        description: 'Seated thoracic side-bend and rotation taps improve neck-thoracic mobility with postural control.',
        instructions: ['Sit tall on a chair with feet wider than hip-width and core lightly braced', 'Reach one hand toward the floor beside your foot while the opposite arm reaches overhead', 'Rotate gently through your upper back as you tap toward the floor', 'Return to center with control and switch to the other side', 'Alternate side-to-side at a smooth pace while keeping your neck relaxed'] },
      // ── Hard ──
      { id: 'fh-h1', name: 'Prone Chin Tuck', difficulty: 'hard', duration: 50, emoji: '🤸', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/UsNvYtfTGHY',
        description: 'Gravity-resisted neck retraction in the prone position builds deep flexor endurance.',
        instructions: ['Lie face down with a small rolled towel under your forehead', 'Keep your gaze toward the floor — do not lift your head', 'Draw your chin back against gravity, creating retraction', 'Hold 5–8 seconds, feel effort in the front of your neck', 'Relax and repeat 10–12 reps at a slow, controlled pace'] },
      { id: 'fh-h3', name: 'Chin Tuck Neck Bridge', difficulty: 'hard', duration: 55, emoji: '🌉', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/M0Dg9ncnoao',
        description: 'High-load cervical stability exercise using bodyweight against the floor.',
        instructions: ['Lie on your back, knees bent, feet flat', 'Perform a full chin tuck and hold it throughout the movement', 'Press through your feet and slowly lift your head off the floor', 'Hold 8–10 seconds using only your deep neck flexors — no momentum', 'Lower with full control and repeat 8 reps'] },
      { id: 'fh-h2', name: 'Banded Chin Tucks', difficulty: 'hard', duration: 55, emoji: '💫', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/LthybLqjstI', requiresEquipment: true,
        description: 'External resistance strengthens deep neck flexors against a forward-pulling load.',
        instructions: ['Loop a light resistance band around the back of your head at the occiput', 'Face the anchor point with the band creating forward tension', 'Against the band pull, perform a full chin retraction', 'Hold 5 seconds at maximum retraction — resist any forward drift', 'Return with control and repeat 10–12 reps, progressively increasing resistance'] },
      { id: 'fh-h4', name: 'Side Lying Chin Tuck', difficulty: 'hard', duration: 55, emoji: '🛌', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/p-ok89KNPCk',
        description: 'Side-lying chin tuck trains deep neck flexors with lateral support for cleaner cervical alignment control.',
        instructions: ['Lie on your side with your head supported and your neck in a neutral line', 'Gently draw your chin straight back without lifting or tilting your head', 'Keep your shoulders relaxed and avoid rolling your trunk backward', 'Hold the tuck briefly while breathing steadily', 'Release slowly and repeat controlled reps on each side'] },
    ],
    tips: ['Position screen at eye level', 'Break every 30 minutes', 'Use supportive pillow', 'Strengthen deep neck flexors'],
    insightCard: {
      heroSubtitle: 'Your head sits in front of your shoulders, not above them.',
      familiarSymptoms: [
        'Your neck feels heavy by the end of the day',
        'Tension headaches show up behind your eyes or temples',
        'You catch yourself looking down at your phone right now',
      ],
      whyItHappensText: 'Your head weighs about as much as a bowling ball. When screens sit below eye level, the muscles at the back of your neck hold that weight all day instead of letting your skeleton do the work. Over time, holding becomes their default — and resting feels foreign.',
    },
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
    exercises: 12,
    duration: '3m',
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
      // ── Beginner ──
      { id: 'ws-b5', name: 'Quadruped Scapular Push', difficulty: 'beginner', duration: 35, emoji: '🐈', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/bujO-PR9Zpo',
        description: 'Serratus anterior activation on all fours — the foundational winging-scapula corrector.',
        instructions: ['Start on all fours — wrists under shoulders, knees under hips', 'Let your upper back sag between your shoulder blades (protraction)', 'Then push your shoulder blades apart and away from each other', 'Hold the protracted position for 3 seconds, then slowly release', '10–12 reps, feel the serratus activate along the side of your ribcage'] },
      { id: 'ws-b1', name: 'Air Angel', difficulty: 'beginner', duration: 35, emoji: '🪄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/g1YnTIYRAxo',
        description: 'Activates serratus anterior through an overhead reaching pattern in open space.',
        instructions: ['Stand tall with arms relaxed at your sides', 'Sweep both arms out and up overhead in a wide arc like a snow angel', 'Keep shoulder blades retracted and depressed throughout the movement', 'Pause briefly overhead, then lower slowly back to the start', 'Complete 10–12 reps at a deliberate, controlled pace'] },
      { id: 'ws-m1', name: 'Floor Angel', difficulty: 'beginner', duration: 40, emoji: '🪄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/1Qy9ZazKYWg',
        description: 'Floor contact increases serratus anterior demand in the full overhead pattern.',
        instructions: ['Lie on your back, arms at 90° goalpost with elbows bent', 'Press the backs of your hands and forearms completely flat on the floor', 'Slowly slide arms overhead while maintaining floor contact throughout', 'Stop before you lose contact — return under full control', '10 slow reps, feeling the thoracic and scapular demand increase'] },
      // ── Medium ──
      { id: 'ws-m4', name: 'Side Lean Wall Slide', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/3MuocTDKb-k',
        description: 'Unilateral wall slide trains each scapula independently for asymmetric winging correction.',
        instructions: ['Stand sideways to a wall, inside arm raised to 90° with the forearm against the wall', 'Slide your forearm upward along the wall while keeping the shoulder blade flat', 'Feel the serratus drive the blade into the ribcage at the top of each rep', 'Slide back down with control — do not let the scapula lift away from the wall', '10–12 reps each side at a slow, deliberate pace'] },
      { id: 'ws-m6', name: 'Prisoner Rotation', difficulty: 'medium', duration: 45, emoji: '🔄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/Zrl97dO6QKE',
        description: 'Controlled thoracic rotation in a prisoner setup improves scapular rhythm and shoulder mechanics.',
        instructions: ['Lie on your side with knees bent and hands behind your head in prisoner position', 'Keep your lower body stable as you rotate your upper torso open', 'Lead with your elbow and focus on smooth motion through the upper back', 'Pause briefly at end range without forcing the movement', 'Return under control and repeat evenly on both sides'] },
      { id: 'ws-b4', name: 'Wall Angel', difficulty: 'medium', duration: 40, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/AVFrTWQKHJA',
        description: 'Scapular upward rotation against the wall targets serratus and lower trapezius together.',
        instructions: ['Stand with your back flat against the wall, feet 6 inches from the base', 'Press head, upper back, and hips firmly into the wall', 'Raise arms to a 90° goalpost position, backs of hands on wall', 'Slowly slide arms overhead while keeping all contact points on the wall', 'Lower with full control — 10 reps, keep ribs down throughout'] },
      { id: 'ws-m5', name: 'Scapular Flutters', difficulty: 'medium', duration: 40, emoji: '🦋', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/-ZE0J-ro3r8',
        description: 'Rapid alternating scapular protraction-retraction builds serratus endurance for dynamic stability.',
        instructions: ['Stand tall with arms relaxed at your sides, shoulders relaxed', 'Alternately protract and retract each shoulder blade in a flutter rhythm', 'Keep your chest open and neck long throughout — no head bobbing', 'Perform 20–30 alternating flutter movements per set', 'Slow the flutter to a controlled retraction hold on the last rep each side'] },
      // ── Hard ──
      { id: 'ws-h10', name: 'Prayer Stretch', difficulty: 'hard', duration: 55, emoji: '🙏', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/sIcgbAQ837M',
        description: 'Supported prayer stretch position opens the chest and upper back while training scapular control.',
        instructions: ['Kneel in front of a bench or elevated surface and place your elbows on top', 'Bring your hands together behind your head to form a prayer position', 'Gently sink your chest toward the floor while keeping your ribs controlled', 'Focus on smooth shoulder-blade motion without shrugging into your neck', 'Hold and breathe steadily, then return slowly and repeat with control'] },
      { id: 'ws-h11', name: 'Plank Plus', difficulty: 'hard', duration: 55, emoji: '➕', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/tESvWKKm6aI',
        description: 'High-plank plus movement targets serratus anterior to reinforce scapular stability under load.',
        instructions: ['Set up in a strong high plank with hands under shoulders and elbows locked', 'Let your chest sink slightly between the shoulder blades with control', 'Push the floor away to fully protract your shoulder blades at the top', 'Keep your core braced and avoid sagging through the lower back', 'Repeat smooth controlled reps while maintaining neutral neck alignment'] },
      { id: 'ws-h7', name: 'Quadruped Scapular Circles', difficulty: 'beginner', duration: 55, emoji: '🔄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/LmfhXfoKGlI',
        description: 'Circles the scapula through its full range in a loaded position, building serratus stamina.',
        instructions: ['Start on all fours — wrists under shoulders, knees under hips', 'Fully protract both shoulder blades (push floor away)', 'Slowly draw large circles with each shoulder blade — forward, up, back, down', 'Keep the core engaged and avoid letting the lower back sag', '8–10 circles in each direction per side at a slow, deliberate pace'] },
      { id: 'ws-h8', name: 'Bear Crawl Scapular Push Up', difficulty: 'hard', duration: 55, emoji: '🐻', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/hi0fKb6EaXo',
        description: 'Dynamic serratus loading in a crawl position demands continuous scapular stability under movement.',
        instructions: ['Start in a bear plank — hands and toes on the floor, knees 2 inches off the ground', 'Perform a scapular push-up: let the blades wing together, then push them apart', 'Maintain the bear plank height throughout — do not let the hips rise or drop', 'After 5 push-ups, crawl forward 2 steps and repeat the push-up sequence', '3 rounds of 5 push-ups with 2-step crawl between each'] },
      { id: 'ws-h9', name: 'Elevated Scapular Push Up', difficulty: 'hard', duration: 60, emoji: '💪', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/CkZ-D7cFR8I',
        description: 'Incline position shifts load toward the serratus for high-demand scapular wall stabilisation.',
        instructions: ['Place hands on an elevated surface (bench or step) in a push-up position', 'Without bending your elbows, let your shoulder blades squeeze together (retract)', 'Then push your shoulder blades apart as far as possible (protract)', 'Hold 2 seconds at full protraction — feel the serratus fire along your ribs', '12–15 reps at full range, keeping the core braced throughout'] },
    ],
    tips: ['Avoid prolonged elbow-plank shrugging', 'Strengthen serratus gradually', 'Check desk elbow height', 'See a clinician if pain or numbness'],
    insightCard: {
      subtitle: 'Understanding shoulder blade control and serratus strength',
      triggers: 'Rounded desk posture and a weak serratus let the scapula lose solid contact with the ribcage.',
      impact: 'Poor upward rotation and stability can increase impingement risk and load the neck and upper back.',
      stretch: 'Pec minor doorway stretch — 3 × 30s',
      strengthen: 'Wall push-up plus — 3 × 10–12 reps',
      habits: 'Avoid resting elbows on desk for long periods',
      heroSubtitle: 'Your shoulder blade lifts off your back instead of lying flat.',
      familiarSymptoms: [
        'Push-ups feel wobbly or unstable in a way you can\'t explain',
        'Your shoulder clicks or pops when you move your arm',
        'Someone has mentioned your shoulder blades stick out',
      ],
      whyItHappensText: 'There\'s a muscle that wraps around your ribs and acts like a strap, holding your shoulder blade flat against your back. When this muscle goes quiet, your shoulder blade loses its anchor and starts drifting — and every other shoulder muscle has to scramble to cover for it. Shoulders don\'t love covering for missing teammates.',
    },
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
    cardImageObjectPosition: 'center 100%',
    exercises: 11,
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
      // ── Beginner ──
      { id: 'apt-b2', name: 'Standing Pelvic Tilt', difficulty: 'beginner', duration: 35, emoji: '🧍', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/MnvcnjCf710',
        description: 'Transfers pelvic tilt control to a functional standing position.',
        instructions: ['Stand with your back against a wall, feet 4–6 inches forward', 'Notice the gap between your lower back and the wall', 'Gently tuck your pelvis — engage your abs and glutes to flatten that gap', 'Hold 5 seconds, feel the lower back press toward the wall', 'Release and repeat 10–12 reps to build functional awareness'] },
      { id: 'apt-b1', name: 'Supine Pelvic Tilt', difficulty: 'beginner', duration: 35, emoji: '🔄', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/DqqUIfMuDX4',
        description: 'Teaches posterior tilt awareness in a supported position with gravity removed.',
        instructions: ['Lie on your back, knees bent, feet flat, arms by your sides', 'Breathe out and gently flatten your lower back into the floor', 'Engage your abs lightly — feel the pelvis rotate backward', 'Hold 5 seconds, feel the lumbar spine contact the floor', 'Release completely and repeat 12–15 reps'] },
      { id: 'apt-m3', name: 'TVA Frog Leg', difficulty: 'beginner', duration: 45, emoji: '🐸', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/lUK-PlvD8Ek',
        description: 'Transverse abdominis isolation in a hip-open position challenges deep core without hip flexor dominance.',
        instructions: ['Lie on your back with soles of feet together and knees open to the sides', 'Place one hand on your lower abdomen to feel the TVA engage', 'Exhale fully and draw your navel toward your spine — no glute squeeze', 'Hold the TVA engagement for 8–10 seconds while breathing normally', '10–12 reps, keeping the lower back neutral against the floor throughout'] },
      { id: 'apt-b4', name: 'Pelvic Rocks', difficulty: 'beginner', duration: 35, emoji: '🔄', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/QEZzyYGPCAQ',
        description: 'Gentle oscillating pelvic movement restores awareness of neutral pelvic position.',
        instructions: ['Lie on your back, knees bent, feet flat, arms resting by your sides', 'Rock your pelvis slowly forward — arch your lower back away from the floor', 'Then rock it backward — flatten your lower back into the floor', 'Find the midpoint between both extremes — that is your neutral pelvis', '15–20 slow rocks, pausing at neutral for 2 seconds each pass'] },
      // ── Medium ──
      { id: 'apt-m4', name: 'Chair Supported Squat', difficulty: 'medium', duration: 45, emoji: '🪑', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/O7n7Iu7Vph8',
        description: 'Chair-assisted squat pattern builds glute and core control to reduce excessive anterior pelvic tilt.',
        instructions: ['Stand behind a stable chair and hold the backrest lightly with both hands', 'Set your ribs down and gently tuck your pelvis to neutral before you descend', 'Sit your hips back and bend your knees into a controlled squat', 'Pause near parallel while keeping your lower back from over-arching', 'Press through your heels to stand tall and repeat for smooth controlled reps'] },
      { id: 'apt-m5', name: 'Frog Stretch', difficulty: 'medium', duration: 45, emoji: '🐸', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/ZdfZDBqvCGk',
        description: 'Deep adductor and hip-opening stretch helps reduce pelvic tension that reinforces anterior tilt.',
        instructions: ['Start on all fours and slide your knees wide while keeping your shins aligned', 'Lower onto your forearms and keep your spine long without collapsing the lower back', 'Gently rock your hips back and forth to find a strong but controlled stretch', 'Breathe slowly and let your inner thighs release with each exhale', 'Hold the stretch with control, then return to all fours slowly'] },
      { id: 'apt-m2', name: 'Wall Lean Plank', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/eGc5eLQ0KPA',
        description: 'Anterior core engagement in a plank position counters excessive lumbar lordosis.',
        instructions: ['Face a wall, place both forearms flat against it at shoulder height', 'Step feet back until your body forms a straight inclined plank', 'Engage your anterior core — prevent your lower back from arching', 'Maintain a posterior pelvic tilt throughout the hold', 'Hold 20–30 seconds, rest, and repeat 3 sets building duration'] },
      { id: 'apt-h1', name: 'Swimmers', difficulty: 'medium', duration: 50, emoji: '🏊', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/oOaXVYntkfA',
        description: 'Prone extension with glute activation rebalances hip extensors that oppose the tilt.',
        instructions: ['Lie face down on a mat, arms extended overhead', 'Simultaneously lift your right arm and left leg off the floor', 'Hold 2 seconds then switch to left arm and right leg', 'Move in a controlled flutter pattern — 10 reps each side', 'Keep your neck neutral and squeeze glutes throughout'] },
      // ── Hard ──
      { id: 'apt-m1', name: 'Split Squat Pelvic Tilts', difficulty: 'hard', duration: 50, emoji: '🦵', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/DBDwIVPWZms',
        description: 'Hip flexor lengthening combined with tilt control in a functional split stance.',
        instructions: ['Stand in a split stance — right foot forward, left foot back, both feet flat', 'Lower your back knee toward the floor into a split squat', 'At the bottom, perform a posterior pelvic tilt — tuck and engage', 'Hold the tilt for 5 seconds, feeling the hip flexor stretch deepen', 'Rise and repeat 10 reps per side, alternating legs'] },
      { id: 'apt-h6', name: '90 degree Hip Hinge', difficulty: 'hard', duration: 50, emoji: '📐', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/ylEkgvu0umg',
        description: 'Teaches loaded hip hinging at 90 degrees to strengthen posterior chain and improve pelvic alignment control.',
        instructions: ['Stand with feet hip-width and a soft bend in your knees', 'Brace your core and keep your spine long from head to tailbone', 'Push your hips straight back until your torso reaches about 90 degrees', 'Pause briefly while keeping the lower back neutral — no excessive arching', 'Drive hips forward to stand tall and repeat with controlled tempo'] },
      { id: 'apt-h4', name: 'Adductor Squeeze Crunch', difficulty: 'hard', duration: 55, emoji: '💪', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/MvkZbVhn0g0',
        description: 'Adductor-assisted abdominal crunch activates pelvic floor and deep core together for tilt control.',
        instructions: ['Lie on your back, knees bent, feet flat, a small ball or pillow between your knees', 'Squeeze the ball gently to activate your adductors — maintain throughout', 'Exhale and perform a controlled crunch — lift only your shoulder blades off the floor', 'Hold 2 seconds at the top while keeping the squeeze and tuck', 'Lower with control and repeat 12–15 reps, keeping the pelvis neutral throughout'] },
      { id: 'apt-h5', name: 'Crossed Leg Forward Stretch', difficulty: 'hard', duration: 50, emoji: '🧘', iconType: 'hip', youtubeUrl: 'https://www.youtube.com/shorts/575CtRbXA5k',
        description: 'Seated hip flexor and piriformis stretch in a crossed-leg position targets deep anterior tilt drivers.',
        instructions: ['Sit on the floor, cross one ankle over the opposite knee in a figure-4 shape', 'Sit tall and hinge forward from the hips — keep your back flat, not rounded', 'Feel the deep stretch in the outer hip and hip flexor of the crossed leg', 'Hold 25–30 seconds while breathing slowly into the stretch', 'Slowly return upright and switch sides — 2–3 rounds per side'] },
    ],
    tips: ['Avoid prolonged sitting', 'Strengthen core and glutes', 'Stretch hip flexors daily', 'Practice neutral pelvis standing'],
    insightCard: {
      heroSubtitle: 'Your pelvis tips forward, pulling your lower back into a deep arch.',
      familiarSymptoms: [
        'Your lower back aches after standing in one place for a while',
        'Your belly sticks out even when you\'re not bloated or heavy',
        'Standing tall feels like work, not rest',
      ],
      whyItHappensText: 'Sitting is the modern body\'s most repeated activity, and sitting puts the muscles at the front of your hips into a shortened position for hours every day. Eventually they decide short is their new normal. When you stand up, they keep pulling — and they pull your pelvis forward with them, dragging your lower back into an arch.',
    },
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
    exercises: 10,
    duration: '3m',
    description: 'Rounded shoulders happen when chest muscles tighten and upper back muscles weaken, pulling shoulders forward from desk work.',
    affectedAreas: ['Pectorals', 'Anterior deltoids', 'Upper back', 'Rotator cuff'],
    cardBg: '#E8FEF1',
    cardBorder: '#C5FADA',
    emoji: '🫧',
    exerciseList: [
      // ── Beginner ──────────────────────────────────────────────
      { id: 'rs-e1', name: 'Doorway Chest Stretch', difficulty: 'beginner', duration: 40, emoji: '🚪', iconType: 'chest', youtubeUrl: 'https://www.youtube.com/shorts/O8rJw_TmC1Y',
        description: 'Opens a chronically tight anterior chain by using the door frame to gently reverse the rounding pull.',
        instructions: ['Stand in a doorway, place both forearms on the frame at 90°', 'Step one foot forward and lean your chest gently through the opening', 'Feel the stretch across both pectorals and the front of the shoulders', 'Hold for 35–40 seconds, breathing slowly into the stretch', 'Keep your core lightly engaged and avoid arching the lower back'] },
      { id: 'rs-e2', name: 'Quadruped Scapular Push', difficulty: 'beginner', duration: 35, emoji: '🐈', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/bujO-PR9Zpo',
        description: 'Trains serratus anterior in a supported position to begin restoring scapular control.',
        instructions: ['Start on hands and knees, wrists under shoulders, knees under hips', 'Without bending your elbows, let your chest sink toward the floor (retract)', 'Then push the floor away, rounding your upper back slightly (protract)', 'Move slowly and with control — feel the shoulder blades glide together and apart', 'Complete 10–12 reps, pausing 1 second at each end range'] },
      { id: 'rs-e3', name: 'Floor Angel', difficulty: 'beginner', duration: 40, emoji: '🪄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/1Qy9ZazKYWg',
        description: 'The floor removes all compensation, enforcing honest thoracic extension throughout the overhead pattern.',
        instructions: ['Lie on your back, arms at 90° goalpost with elbows bent', 'Press the backs of your hands and forearms completely flat on the floor', 'Slowly slide arms overhead while maintaining full floor contact', 'Stop before you lose contact and return under full control', '10 slow reps — feel the thoracic demand increase as arms rise'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'rs-m1', name: 'Air Angel', difficulty: 'medium', duration: 40, emoji: '🪄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/g1YnTIYRAxo',
        description: 'Trains scapular retraction and upward rotation in a standing open-chain overhead pattern.',
        instructions: ['Stand tall with arms relaxed at your sides', 'Sweep both arms out and up overhead in a wide arc like a snow angel', 'Keep shoulder blades retracted and depressed throughout the movement', 'Pause briefly overhead, then lower slowly back to the start', 'Complete 10–12 reps at a deliberate, controlled pace'] },
      { id: 'rs-m4', name: 'Prisoner Rotation', difficulty: 'medium', duration: 45, emoji: '🔄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/Zrl97dO6QKE',
        description: 'Thoracic rotation in prisoner position restores upper-back mobility and improves scapular tracking.',
        instructions: ['Lie on your side with knees bent and hands behind your head', 'Rotate your top elbow backward to open the chest while keeping hips stacked', 'Move slowly and breathe into the rotation at end range', 'Return to start without collapsing the trunk', 'Repeat controlled reps on both sides to stay symmetrical'] },
      { id: 'rs-m2', name: 'Bear Hold', difficulty: 'medium', duration: 45, emoji: '🐻', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/u7LBw4Ubaqg',
        description: 'Isometric scapular protraction under load builds the endurance needed to hold shoulders in a corrected position.',
        instructions: ['Start on hands and knees, wrists under shoulders, knees under hips', 'Push the floor away to protract your shoulder blades — hold this position', 'Lift your knees 2–3 cm off the floor and hold, keeping hips level', 'Breathe steadily — do not let the upper back collapse or sink', 'Hold for 20–30 seconds, rest, repeat 3 times'] },
      { id: 'rs-m3', name: 'Prone T-Raise', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/3vY6GBtkUPI',
        description: 'Isolates mid-trapezius to directly counter the protraction pattern of rounded shoulders.',
        instructions: ['Lie face down on a mat, arms extended out to the sides in a T shape', 'Squeeze your shoulder blades together and lift both arms off the floor', 'Hold at the top for 2 seconds — keep thumbs pointing up throughout', 'Lower slowly under full control, do not let arms drop', 'Complete 10–12 reps per side, alternating if needed'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'rs-h1', name: 'Archer Push-Up', difficulty: 'hard', duration: 50, emoji: '🏹', iconType: 'chest', youtubeUrl: 'https://www.youtube.com/shorts/EccfDxgN4YM',
        description: 'Asymmetric loading builds unilateral chest and shoulder control to correct the rounding pattern under full bodyweight.',
        instructions: ['Start in a wide push-up position, both hands wider than shoulder-width', 'Lower your chest toward one hand while the opposite arm extends straight', 'Push back to the top and repeat to the other side', 'Keep hips level and core engaged — do not rotate through the trunk', 'Complete 8–10 reps per side at a slow, controlled tempo'] },
      { id: 'rs-h2', name: 'Push-Up Plus', difficulty: 'hard', duration: 50, emoji: '➕', iconType: 'chest', youtubeUrl: 'https://www.youtube.com/shorts/UaKvA4qoTzw',
        description: 'Adds a serratus anterior "plus" at the top of a push-up to integrate scapular control with pressing strength.',
        instructions: ['Set up in a standard push-up position, hands shoulder-width apart', 'Lower to the floor and push back up to full elbow extension', 'At the top, push the floor away further — let your upper back round slightly', 'Hold the "plus" position 1 second then reset for the next rep', 'Complete 8–12 reps with full serratus engagement at the top'] },
      { id: 'rs-h3', name: 'Y-Pull with Band', difficulty: 'hard', duration: 50, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/EuhDanbxxG4', requiresEquipment: true,
        description: 'Lower trap strengthening in a Y-pull pattern directly counters the downward scapular tipping of rounded shoulders.',
        instructions: ['Anchor a resistance band at low height or hold under your feet', 'Hold the band in both hands and hinge slightly forward', 'Pull both arms up and out in a Y shape — 45° above the shoulder line', 'Squeeze the lower traps at the top — hold 2 seconds', 'Lower with full control for 3 seconds — complete 10–12 reps'] },
    ],
    tips: ['Set up ergonomic workstation', 'Strengthen upper back', 'Stretch chest daily', 'Watch shoulder position'],
    insightCard: {
      heroSubtitle: 'Your shoulders have rolled forward and forgotten how to sit back.',
      familiarSymptoms: [
        'Reaching overhead feels stiff or blocked',
        'Your chest feels tight no matter how much you stretch it',
        'Look down right now — are your knuckles facing forward?',
      ],
      whyItHappensText: 'Almost everything you do happens in front of you: typing, driving, eating, scrolling. The muscles across your chest slowly shorten from all that forward reaching, while the muscles between your shoulder blades stretch out and go quiet. Your shoulders simply follow where your hands spend their time.',
    },
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
    exercises: 10,
    duration: '3m',
    description: 'Kyphosis is an excessive outward curve of the upper back (thoracic spine), sometimes called a rounded or hunched back, often worsened by prolonged sitting and weak upper-back muscles.',
    affectedAreas: ['Thoracic spine', 'Rhomboids', 'Middle trapezius', 'Pectorals'],
    cardBg: '#EEF2FF',
    cardBorder: '#C7D2FE',
    emoji: '📐',
    exerciseList: [
      // ── Beginner ──────────────────────────────────────────────
      { id: 'ky-e1', name: 'Baby Cobra', difficulty: 'beginner', duration: 35, emoji: '🐍', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/gGGb2C65bJk',
        description: 'Gently trains thoracic extension from the ground, beginning to reverse the kyphotic curve with minimal load.',
        instructions: ['Lie face down with hands under your shoulders, elbows close to your sides', 'Press your forearms and pelvis into the floor — keep hips down throughout', 'Inhale, then lift your head and chest using your back muscles, not your arms', 'Hold at the top for 3–5 seconds — feel the thoracic spine gently extend', 'Lower slowly and repeat 10–12 reps, breathing into each extension'] },
      { id: 'ky-e2', name: 'Foam Roller Thoracic Extension', difficulty: 'beginner', duration: 40, emoji: '🫧', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/SAvPkMKTgwI',
        description: 'Mobilises each stiff thoracic segment individually into extension to directly address the kyphotic curve.',
        instructions: ['Place a foam roller perpendicular to your spine at mid-back level', 'Support your head with hands interlaced behind it', 'Let your thoracic spine gently drape over the roller into extension', 'Move the roller 2–3 inches up or down and pause at each stiff segment', 'Spend 35–45 seconds total, breathing deeply into each position'] },
      { id: 'ky-e3', name: 'Quadruped Thoracic Rotation (Hand Behind Head)', difficulty: 'beginner', duration: 35, emoji: '🔄', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/hMQqwTkGwvs',
        description: 'Restores rotational mobility in the thoracic spine, unlocking segments stiffened by the kyphotic posture.',
        instructions: ['Start on hands and knees, one hand placed behind your head', 'Keep your lower back still — let only the upper back rotate', 'Rotate your elbow down toward the opposite knee, then open it toward the ceiling', 'Move through your comfortable range — do not force the rotation', 'Complete 10 reps per side, working the stiffer side first'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'ky-m1', name: 'Thoracic Extension', difficulty: 'medium', duration: 45, emoji: '🧘', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/Vj6rsRlgdcA',
        description: 'Directly trains active thoracic extension range against gravity to counteract the kyphotic posture.',
        instructions: ['Sit tall or kneel, hands clasped behind your head', 'Inhale to prepare, then gently extend your upper back backward', 'Open your chest toward the ceiling — feel the thoracic spine moving into extension', 'Hold 3–5 seconds at the end range without pushing into discomfort', 'Return to neutral and repeat 10–12 reps at a controlled pace'] },
      { id: 'ky-m2', name: 'Wall Assisted Shoulder Flexion', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/9SCZ-1NsvV0',
        description: 'Uses the wall to guide full overhead shoulder flexion while encouraging thoracic extension.',
        instructions: ['Stand facing a wall, arms extended overhead with hands on the wall', 'Walk your hands up the wall as high as comfortable', 'Gently lean your chest toward the wall as you raise your arms', 'Hold for 3–5 seconds at the top — feel the upper back open', 'Slide hands down slowly and repeat 10 reps'] },
      { id: 'ky-m3', name: 'Wall Slide', difficulty: 'medium', duration: 45, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/vTy_vg5nLs0',
        description: 'Trains upward scapular rotation and thoracic extension against the wall for real-time postural feedback.',
        instructions: ['Stand with your back against the wall, arms in a 90° goalpost position', 'Press your head, upper back, and forearms flat against the wall', 'Slowly slide both arms overhead, maintaining full wall contact throughout', 'Stop before any contact is lost — return under full control', 'Complete 10–12 reps, keeping ribs down and core lightly engaged'] },
      { id: 'ky-m4', name: 'Scapular Rows', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/lpdpeHNEMIE', requiresEquipment: true,
        description: 'Strengthens mid-traps and rhomboids under band resistance to actively pull the thoracic spine into extension.',
        instructions: ['Anchor a resistance band at chest height and hold one end in each hand', 'Stand tall, arms extended forward — do not let shoulders roll forward', 'Pull both elbows back, squeezing the shoulder blades firmly together', 'Hold 2 seconds at full retraction — keep wrists straight throughout', 'Return with control — complete 12–15 reps'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'ky-h1', name: 'Sphinx Cat Camels', difficulty: 'hard', duration: 50, emoji: '🐱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/G9p-gYv5ORc',
        description: 'Combines active thoracic extension with controlled flexion to build end-range spinal control in both directions.',
        instructions: ['Start in a sphinx position — forearms on the floor, elbows under shoulders', 'Inhale and press your chest forward, opening the thoracic spine into extension', 'Exhale, tuck your chin and round your upper back upward (cat)', 'Move fluidly between both positions, exploring the full range', 'Complete 10–12 slow, deliberate cycles — pause at each end range'] },
      { id: 'ky-h2', name: 'Prone Y-Raise', difficulty: 'hard', duration: 50, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/z0nTvguqbo0',
        description: 'Targets lower trapezius in a gravity-resisted position to actively pull the thoracic spine out of kyphosis.',
        instructions: ['Lie face down on a mat, arms extended overhead in a Y shape', 'Squeeze your shoulder blades down and together — no shrugging', 'Lift both arms off the floor, driving from the lower traps', 'Hold at the top for 2 seconds — keep your neck neutral', 'Lower slowly for 3 seconds — complete 10–12 reps per side'] },
      { id: 'ky-h3', name: 'Banded Reverse Fly', difficulty: 'hard', duration: 50, emoji: '🔄', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/OUn0pOyxqwE', requiresEquipment: true,
        description: 'Heavy mid-trap and rhomboid loading under band resistance builds the posterior chain strength to sustain an upright thoracic curve.',
        instructions: ['Hold a resistance band in both hands, arms extended at chest height', 'Hinge forward 45° from hips, soft knees, back flat', 'Raise both arms out to the sides in a wide arc, squeezing shoulder blades', 'Hold 1 second at the top — elbows slightly soft throughout', 'Lower with full control — complete 12–15 reps'] },
    ],
    tips: ['Bring screen to eye height', 'Take movement breaks hourly', 'Pair stretching with upper-back strength', 'Seek evaluation for severe or painful curve'],
    insightCard: {
      heroSubtitle: 'Your upper back has rounded forward and gotten stuck there.',
      familiarSymptoms: [
        'Standing fully upright feels like effort, not rest',
        'Taking a really deep breath feels restricted',
        'You see yourself in photos and feel older than you are',
      ],
      whyItHappensText: 'Your upper back is meant to have a gentle curve — but years of leaning over desks, books, phones, and steering wheels deepen that curve until the spine forgets how to extend. This is the kindest truth in posture work: if you\'ve been failing to "stand up straight" by willpower, it\'s not discipline you\'re missing. It\'s mobility. You can\'t muscle into a position your spine can\'t reach yet.',
    },
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
    exercises: 9,
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
      { id: 'us-e1', name: 'Lower Trap Activation', difficulty: 'beginner', duration: 35, emoji: '💪', iconType: 'shoulder', youtubeUrl: 'https://www.youtube.com/shorts/O6jMARBgECQ',
        description: 'Directly activates the lower trapezius on the depressed side to begin restoring shoulder symmetry.',
        instructions: ['Stand or sit tall, one arm raised to shoulder height, elbow soft', 'Press the arm slightly back and down — feel the lower trap fire under the shoulder blade', 'Hold the activation 3–5 seconds, then release completely', 'Do not shrug or use momentum — isolate the lower trap only', 'Complete 10–12 reps per side, focusing on the weaker side first'] },
      { id: 'us-e2', name: 'Levator Scapulae Stretch', difficulty: 'beginner', duration: 40, emoji: '🙆', iconType: 'neck', youtubeUrl: 'https://www.youtube.com/shorts/3h0jsXcRT94',
        description: 'Releases the levator scapulae on the elevated side, reducing the upward pull that creates shoulder asymmetry.',
        instructions: ['Sit tall and anchor one hand under your seat on the tight side', 'Rotate your head 45° toward the opposite shoulder', 'Tilt your chin downward until you feel the stretch along the back of the neck', 'Hold 35–40 seconds — the anchored hand prevents shoulder lifting', 'Repeat on both sides, spending more time on the elevated shoulder side'] },
      { id: 'us-e3', name: 'Wall Lean', difficulty: 'beginner', duration: 35, emoji: '🧱', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/uSTnwYMsZ7A',
        description: 'Uses wall contact as feedback to train symmetrical shoulder loading and spinal alignment.',
        instructions: ['Stand sideways to a wall, feet hip-width apart', 'Press your shoulder, hip, and the side of your foot against the wall', 'Hold the position with your core lightly engaged — do not compensate with your trunk', 'Keep both shoulders level — check in a mirror if available', 'Hold 20–30 seconds per side, leading with the weaker side'] },
      // ── Medium ────────────────────────────────────────────────
      { id: 'us-m1', name: 'Side Plank', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/E5koNMd2Ic0',
        description: 'Challenges lateral core and hip strength to correct the asymmetric loading pattern driving shoulder unevenness.',
        instructions: ['Lie on your side, stack your feet, and prop yourself on one forearm', 'Lift your hips off the floor — form a straight line from head to feet', 'Keep the top shoulder from dropping — press your hip upward throughout', 'Hold for 20–30 seconds, then switch sides', 'Spend an additional 5–10 seconds on the weaker side each set'] },
      { id: 'us-m2', name: 'Bird Dog', difficulty: 'medium', duration: 45, emoji: '🐕', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/X0FpQEjEA40',
        description: 'Trains anti-rotation stability and bilateral shoulder symmetry in a quadruped position.',
        instructions: ['Start on hands and knees, wrists under shoulders, knees under hips', 'Extend your right arm forward and left leg back simultaneously', 'Keep your hips level — do not rotate or shift weight to one side', 'Hold 3–5 seconds, then switch to left arm and right leg', 'Complete 10–12 reps per side, focusing on keeping shoulders even throughout'] },
      { id: 'us-m3', name: 'Banded Lat Pull-Down', difficulty: 'medium', duration: 45, emoji: '💪', iconType: 'back', youtubeUrl: 'https://www.youtube.com/shorts/XFUHrs8pnx8', requiresEquipment: true,
        description: 'Strengthens the latissimus dorsi and lower trap bilaterally to correct the muscle imbalance driving shoulder asymmetry.',
        instructions: ['Anchor a resistance band overhead and hold one end in each hand', 'Sit or kneel tall, arms extended upward — do not let shoulders shrug', 'Pull both elbows down and out, squeezing the lats and depressing the shoulders', 'Hold 2 seconds at the bottom — check both elbows are level', 'Return with full control — complete 12–15 reps'] },
      // ── Hard ──────────────────────────────────────────────────
      { id: 'us-h1', name: 'Single-Arm Plank', difficulty: 'hard', duration: 50, emoji: '💪', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/vChJ24IH9mA',
        description: 'Maximum unilateral loading exposes and trains the strength deficit on the weaker shoulder side.',
        instructions: ['Start in a full plank position, hands under shoulders, body in a straight line', 'Shift weight slightly to one arm and lift the other hand off the floor', 'Hold for 5–10 seconds — do not rotate the hips or drop a shoulder', 'Replace the hand and repeat on the other side', 'Complete 6–8 reps per side, spending more time on the weaker side'] },
      { id: 'us-h2', name: 'Advanced Bird Dog', difficulty: 'hard', duration: 50, emoji: '🐕', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/cJTAYR4dl0Y',
        description: 'Adds dynamic challenge to the Bird Dog pattern to build the anti-rotation endurance needed for sustained shoulder symmetry.',
        instructions: ['Start in Bird Dog position — right arm extended, left leg extended', 'Bring your elbow and knee together under your torso, rounding slightly', 'Extend them back out immediately — repeat in a controlled pulse', 'Keep your hips level throughout — do not swing or use momentum', 'Complete 10–12 reps per side at a steady, controlled tempo'] },
      { id: 'us-h3', name: 'Half Kneel Pallof Press', difficulty: 'hard', duration: 50, emoji: '💪', iconType: 'core', youtubeUrl: 'https://www.youtube.com/shorts/9ecCZQS01yo', requiresEquipment: true,
        description: 'Anti-rotation core loading in a half-kneeling position corrects the lateral asymmetry that drives shoulder imbalance.',
        instructions: ['Anchor a resistance band at shoulder height and kneel on the side closest to it', 'Hold the band with both hands at your chest — feel the rotational pull', 'Press both hands straight out in front, resisting the rotation throughout', 'Hold 2–3 seconds fully extended — do not let your torso twist', 'Return hands to chest and repeat — complete 10–12 reps per side'] },
    ],
    tips: ['Stretch the tight side (elevated shoulder)', 'Strengthen the weak side (lower trap & serratus)', 'Keep shoulders level during daily activities', 'Adjust desk setup (screen centered!)', 'Train both sides equally'],
    insightCard: {
      heroSubtitle: 'One shoulder sits higher than the other — and your body has gotten used to it.',
      familiarSymptoms: [
        'One bra strap or shirt collar always slips off the same side',
        'The neck tightness is worse on one specific side',
        'You always carry your bag on the same shoulder without thinking',
      ],
      whyItHappensText: 'Your body is brilliantly adaptive, and that\'s the problem. Whatever you do every day, it builds itself around. Years of carrying a bag on one side, sleeping curled toward one direction, or leaning into one hip teach your body that crooked is the new normal. It\'s not damage — it\'s a habit written into muscle.',
    },
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

// ── Special Index: Both-Side Exercises ───────────────────────────────────────
// Exercises that require alternating each side. Kept here for future filtering,
// UI hints, or per-side tracking. These entries still exist in the main dataset.
export interface ExerciseIndexEntry {
  id: string;
  name: string;
  postureTypes: string[];
}

export const bothSideExercises: ExerciseIndexEntry[] = [
  { id: 'apt-m4', name: 'Chair Supported Squat',                          postureTypes: ['anterior-pelvic'] },
  { id: 'ky-e3', name: 'Quadruped Thoracic Rotation (Hand Behind Head)', postureTypes: ['kyphosis'] },
  { id: 'ky-h2', name: 'Prone Y-Raise',                                  postureTypes: ['kyphosis'] },
  { id: 'rs-m3', name: 'Prone T-Raise',                                  postureTypes: ['rounded-shoulders'] },
  { id: 'rs-h1', name: 'Archer Push-Up',                                 postureTypes: ['rounded-shoulders'] },
  { id: 'us-e1', name: 'Lower Trap Activation',                          postureTypes: ['uneven-shoulders'] },
  { id: 'us-e2', name: 'Levator Scapulae Stretch',                       postureTypes: ['uneven-shoulders'] },
];

// ── Special Index: Resistance Band Exercises ─────────────────────────────────
// Exercises that require a resistance band (requiresEquipment: true via band).
// These entries still exist in the main dataset; this index enables band-based
// filtering, equipment-mode toggling, or future "band workout" features.
export const resistanceBandExercises: ExerciseIndexEntry[] = [
  { id: 'ky-m4', name: 'Scapular Rows',         postureTypes: ['kyphosis'] },
  { id: 'ky-h3', name: 'Banded Reverse Fly',    postureTypes: ['kyphosis'] },
  { id: 'us-m3', name: 'Banded Lat Pull-Down',  postureTypes: ['uneven-shoulders'] },
  { id: 'us-h3', name: 'Half Kneel Pallof Press', postureTypes: ['uneven-shoulders'] },
];
