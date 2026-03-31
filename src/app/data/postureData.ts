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
  exercises: number;
  duration: string;
  description: string;
  affectedAreas: string[];
  cardBg: string;
  cardBorder: string;
  emoji: string;
  exerciseList: Exercise[];
  tips: string[];
}

export const postureProblems: PostureProblem[] = [
  {
    id: 'forward-head',
    title: 'Forward Head Posture',
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
    id: 'slouching',
    title: 'Slouching Posture',
    exercises: 5,
    duration: '3m',
    description: 'Slouching involves a rounded upper back and collapsed chest, often from poor sitting habits and weak postural muscles.',
    affectedAreas: ['Thoracic spine', 'Core', 'Erector spinae', 'Rhomboids'],
    cardBg: '#FEF0E8',
    cardBorder: '#FCD9C5',
    emoji: '🪑',
    exerciseList: [
      { id: 'thoracic-ext-2', name: 'Thoracic Extension', duration: 45, description: 'Extend upper back over chair back.', emoji: '🤸',
        instructions: ['Sit in chair', 'Clasp hands behind head', 'Arch upper back over chair', 'Hold 5 seconds', 'Repeat 10 times'] },
      { id: 'seated-row', name: 'Seated Row Motion', duration: 40, description: 'Mimic rowing to strengthen mid-back.', emoji: '🚣',
        instructions: ['Sit on edge of chair', 'Arms extended forward', 'Pull elbows back', 'Hold 3 seconds', '15 reps'] },
      { id: 'superman', name: 'Superman Hold', duration: 45, description: 'Strengthen the entire posterior chain.', emoji: '🦸',
        instructions: ['Lie face down', 'Arms extended overhead', 'Lift arms, chest, and legs', 'Hold 5 seconds', 'Repeat 10 times'] },
      { id: 'wall-stand', name: 'Wall Stand', duration: 30, description: 'Practice perfect posture alignment.', emoji: '🧱',
        instructions: ['Stand with back to wall', 'Touch head, shoulders, butt, heels', 'Hold position', 'Breathe normally', 'Hold 30 seconds'] },
      { id: 'cobra', name: 'Cobra Stretch', duration: 40, description: 'Open the chest and extend the spine.', emoji: '🐍',
        instructions: ['Lie face down', 'Hands under shoulders', 'Press up, extending arms', 'Keep hips on floor', 'Hold 15 seconds'] },
    ],
    tips: ['Set hourly posture reminders', 'Strengthen back extensors', 'Use lumbar support', 'Practice wall stands daily'],
  },
  {
    id: 'tech-neck',
    title: 'Tech Neck',
    exercises: 5,
    duration: '3m',
    description: 'Tech neck is caused by looking down at devices for extended periods, creating excessive strain on the cervical spine.',
    affectedAreas: ['Cervical spine', 'Upper trapezius', 'Levator scapulae', 'Scalenes'],
    cardBg: '#FEE8F0',
    cardBorder: '#FCC5D9',
    emoji: '📱',
    exerciseList: [
      { id: 'chin-tuck-2', name: 'Chin Tucks', duration: 30, description: 'The go-to exercise for tech neck.', emoji: '🧘',
        instructions: ['Sit tall, feet flat', 'Put phone down', 'Draw chin straight back', 'Hold 5 seconds', 'Repeat 10 times'] },
      { id: 'upper-trap', name: 'Upper Trap Release', duration: 45, description: 'Release tension from phone holding.', emoji: '🙆',
        instructions: ['Right hand behind back', 'Tilt left ear to left shoulder', 'Gentle pressure with left hand', 'Hold 20 seconds', 'Switch sides'] },
      { id: 'neck-rotation', name: 'Neck Rotation', duration: 30, description: 'Restore range of motion in the neck.', emoji: '🔄',
        instructions: ['Sit tall', 'Slowly turn head right', 'Hold at end range 5s', 'Return to center', '10 each side'] },
      { id: 'scalene', name: 'Scalene Stretch', duration: 40, description: 'Target side neck muscles tight from phone use.', emoji: '💆',
        instructions: ['Tilt head to one side', 'Rotate slightly upward', 'Gentle stretch on side of neck', 'Hold 15 seconds', 'Switch sides'] },
      { id: 'shrugs', name: 'Shoulder Shrugs', duration: 25, description: 'Release built-up upper trap tension.', emoji: '🤷',
        instructions: ['Stand or sit tall', 'Raise shoulders to ears', 'Hold 3 seconds', 'Drop and relax', 'Repeat 15 times'] },
    ],
    tips: ['Hold phone at eye level', 'Use voice-to-text', 'Break every 20 min', 'Chin tucks after phone use'],
  },
  {
    id: 'upper-back',
    title: 'Upper Back Tension',
    exercises: 5,
    duration: '3m',
    description: 'Upper back tension results from stress, poor posture, and repetitive movements, causing pain between shoulder blades.',
    affectedAreas: ['Rhomboids', 'Middle trapezius', 'Thoracic spine', 'Rear deltoids'],
    cardBg: '#FEF4E8',
    cardBorder: '#FCE3C5',
    emoji: '😺',
    exerciseList: [
      { id: 'thread-needle', name: 'Thread the Needle', duration: 45, description: 'Rotational stretch for thoracic spine.', emoji: '🧵',
        instructions: ['Start on hands and knees', 'Slide right arm under left', 'Lower right shoulder to floor', 'Hold 20 seconds', 'Switch sides'] },
      { id: 'cat-cow-2', name: 'Cat-Cow', duration: 50, description: 'Mobilize the entire spine gently.', emoji: '🐱',
        instructions: ['Hands and knees', 'Inhale: arch back', 'Exhale: round back', 'Move slowly with breath', '10-15 cycles'] },
      { id: 'roller-angels', name: 'Foam Roller Angels', duration: 60, description: 'Open the chest on a foam roller.', emoji: '👼',
        instructions: ['Lie on foam roller lengthwise', 'Arms out to sides', 'Slowly make snow angel motion', 'Feel chest opening', '10 slow reps'] },
      { id: 'rhomboid-squeeze', name: 'Rhomboid Squeeze', duration: 30, description: 'Target muscles between shoulder blades.', emoji: '🎯',
        instructions: ['Stand tall, arms at 90°', 'Squeeze shoulder blades', 'Hold 5 seconds', 'Release slowly', 'Repeat 15 times'] },
      { id: 'child-pose', name: "Child's Pose", duration: 45, description: 'Gentle stretch for the entire back.', emoji: '🧒',
        instructions: ['Kneel on floor', 'Sit back on heels', 'Extend arms forward on floor', 'Relax and breathe', 'Hold 30 seconds'] },
    ],
    tips: ['Manage stress levels', 'Stretch between shoulder blades', 'Use heat for tension relief', 'Strengthen mid-back muscles'],
  },
];
