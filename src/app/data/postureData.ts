export interface Exercise {
  id: string;
  name: string;
  duration: number; // seconds
  description: string;
  instructions: string[];
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageEmoji: string;
}

export interface PostureProblem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  color: string;
  bgColor: string;
  icon: string;
  severity: 'mild' | 'moderate' | 'severe';
  affectedAreas: string[];
  exercises: Exercise[];
  tips: string[];
}

export const postureProblems: PostureProblem[] = [
  {
    id: 'forward-head',
    title: 'Forward Head',
    subtitle: 'Tech Neck Syndrome',
    description: 'Forward head posture occurs when your head shifts forward past your shoulders, commonly caused by prolonged screen use. This puts extra strain on your cervical spine and upper back muscles.',
    category: 'neck',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    icon: '🦒',
    severity: 'moderate',
    affectedAreas: ['Cervical spine', 'Upper trapezius', 'Suboccipitals', 'SCM'],
    exercises: [
      {
        id: 'chin-tuck',
        name: 'Chin Tucks',
        duration: 30,
        description: 'Gently retract your chin straight back, creating a double chin. Hold, then release.',
        instructions: [
          'Sit or stand tall with shoulders relaxed',
          'Look straight ahead, keeping your eyes level',
          'Draw your chin straight back (not down)',
          'Hold for 5 seconds, feel the stretch at the base of your skull',
          'Release slowly and repeat 10 times'
        ],
        muscleGroups: ['Deep neck flexors', 'Suboccipitals'],
        difficulty: 'beginner',
        imageEmoji: '🧘'
      },
      {
        id: 'neck-stretch',
        name: 'Lateral Neck Stretch',
        duration: 45,
        description: 'Gently tilt your head to each side, stretching the SCM and upper trapezius.',
        instructions: [
          'Sit tall with both hands on your thighs',
          'Slowly tilt your right ear toward right shoulder',
          'For deeper stretch, gently press with right hand',
          'Hold for 15-20 seconds',
          'Return to center and repeat on left side'
        ],
        muscleGroups: ['SCM', 'Upper trapezius', 'Scalenes'],
        difficulty: 'beginner',
        imageEmoji: '🙆'
      },
      {
        id: 'wall-angel',
        name: 'Wall Angels',
        duration: 60,
        description: 'Stand against a wall and slide your arms up and down like making a snow angel.',
        instructions: [
          'Stand with your back flat against a wall',
          'Press the back of your head, upper back, and hips against the wall',
          'Raise arms to goal post position (90° at shoulder and elbow)',
          'Slowly slide arms up overhead while maintaining wall contact',
          'Lower back down slowly, repeat 10 times'
        ],
        muscleGroups: ['Rhomboids', 'Lower trapezius', 'Serratus anterior'],
        difficulty: 'intermediate',
        imageEmoji: '👼'
      }
    ],
    tips: [
      'Position your screen at eye level',
      'Take breaks every 30 minutes',
      'Use a supportive pillow at night',
      'Strengthen your deep neck flexors daily'
    ]
  },
  {
    id: 'rounded-shoulders',
    title: 'Rounded Shoulders',
    subtitle: 'Desk Worker Syndrome',
    description: 'Rounded shoulders happen when the chest muscles tighten and upper back muscles weaken, pulling your shoulders forward. This is extremely common with desk work.',
    category: 'shoulder',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    icon: '🏋️',
    severity: 'moderate',
    affectedAreas: ['Pectorals', 'Anterior deltoids', 'Upper back', 'Rotator cuff'],
    exercises: [
      {
        id: 'doorway-stretch',
        name: 'Doorway Pec Stretch',
        duration: 45,
        description: 'Use a doorway to open up your chest and stretch tight pectoral muscles.',
        instructions: [
          'Stand in a doorway with arms at 90° angle',
          'Place forearms on the door frame',
          'Step one foot forward gently',
          'Lean into the stretch until you feel it in your chest',
          'Hold for 20-30 seconds, repeat 3 times'
        ],
        muscleGroups: ['Pectoralis major', 'Pectoralis minor', 'Anterior deltoids'],
        difficulty: 'beginner',
        imageEmoji: '🚪'
      },
      {
        id: 'band-pull-apart',
        name: 'Band Pull Aparts',
        duration: 45,
        description: 'Use a resistance band to strengthen your upper back and improve shoulder position.',
        instructions: [
          'Hold a resistance band at shoulder width, arms extended forward',
          'Squeeze your shoulder blades together',
          'Pull the band apart until it touches your chest',
          'Slowly return to the starting position',
          'Repeat 15 times for 3 sets'
        ],
        muscleGroups: ['Rhomboids', 'Rear deltoids', 'Middle trapezius'],
        difficulty: 'beginner',
        imageEmoji: '💪'
      },
      {
        id: 'prone-y-raise',
        name: 'Prone Y-Raises',
        duration: 60,
        description: 'Lie face down and raise arms into a Y position to strengthen lower traps.',
        instructions: [
          'Lie face down on the floor or a bench',
          'Extend arms overhead at a 30° angle forming a Y',
          'Thumbs pointing toward the ceiling',
          'Lift arms 3-4 inches off the ground, squeeze shoulder blades',
          'Hold for 3 seconds, lower slowly, repeat 12 times'
        ],
        muscleGroups: ['Lower trapezius', 'Serratus anterior', 'Rhomboids'],
        difficulty: 'intermediate',
        imageEmoji: '🤸'
      }
    ],
    tips: [
      'Set up an ergonomic workstation',
      'Strengthen your upper back muscles',
      'Stretch your chest muscles daily',
      'Be conscious of shoulder position when walking'
    ]
  },
  {
    id: 'lower-back-pain',
    title: 'Lower Back Pain',
    subtitle: 'Lumbar Strain',
    description: 'Lower back pain from poor posture typically involves excessive lordosis or prolonged flexion, weakening the core stabilizers and straining the lumbar spine.',
    category: 'back',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    icon: '🔥',
    severity: 'severe',
    affectedAreas: ['Lumbar spine', 'Erector spinae', 'Quadratus lumborum', 'Core muscles'],
    exercises: [
      {
        id: 'cat-cow',
        name: 'Cat-Cow Stretch',
        duration: 60,
        description: 'Alternate between arching and rounding your back to mobilize the spine.',
        instructions: [
          'Start on hands and knees, wrists under shoulders, knees under hips',
          'Inhale: drop belly, lift chest and tailbone (Cow)',
          'Exhale: round spine, tuck chin and tailbone (Cat)',
          'Move slowly with your breath',
          'Repeat 10-15 cycles'
        ],
        muscleGroups: ['Erector spinae', 'Rectus abdominis', 'Multifidus'],
        difficulty: 'beginner',
        imageEmoji: '🐱'
      },
      {
        id: 'bird-dog',
        name: 'Bird Dog',
        duration: 60,
        description: 'A core stabilization exercise that strengthens your back without compression.',
        instructions: [
          'Start on hands and knees in a neutral spine position',
          'Extend your right arm forward and left leg back simultaneously',
          'Keep your hips level and core braced',
          'Hold for 5 seconds at the top',
          'Return to start and switch sides, 10 reps each'
        ],
        muscleGroups: ['Multifidus', 'Transverse abdominis', 'Glutes', 'Erector spinae'],
        difficulty: 'intermediate',
        imageEmoji: '🐕'
      },
      {
        id: 'dead-bug',
        name: 'Dead Bug',
        duration: 60,
        description: 'A core exercise that teaches you to stabilize your spine during movement.',
        instructions: [
          'Lie on your back, arms pointing to the ceiling',
          'Bring knees to 90° angle (tabletop position)',
          'Press your lower back firmly into the floor',
          'Slowly extend right arm back and left leg forward',
          'Return and switch sides, 10 reps each side'
        ],
        muscleGroups: ['Transverse abdominis', 'Rectus abdominis', 'Hip flexors'],
        difficulty: 'beginner',
        imageEmoji: '🪲'
      }
    ],
    tips: [
      'Avoid sitting for more than 45 minutes at a time',
      'Strengthen your core muscles daily',
      'Use lumbar support when sitting',
      'Sleep on your side with a pillow between your knees'
    ]
  },
  {
    id: 'hip-flexor-tightness',
    title: 'Tight Hip Flexors',
    subtitle: 'Sitting Syndrome',
    description: 'Prolonged sitting causes hip flexors to shorten and tighten, leading to anterior pelvic tilt and contributing to lower back pain and poor posture.',
    category: 'hip',
    color: '#F97316',
    bgColor: '#FFF7ED',
    icon: '🪑',
    severity: 'moderate',
    affectedAreas: ['Iliopsoas', 'Rectus femoris', 'TFL', 'Glutes'],
    exercises: [
      {
        id: 'half-kneeling-stretch',
        name: 'Half-Kneeling Hip Stretch',
        duration: 60,
        description: 'A deep hip flexor stretch performed in a lunge position.',
        instructions: [
          'Kneel on your right knee, left foot forward in a lunge',
          'Keep your torso upright and core engaged',
          'Shift your weight forward gently',
          'Squeeze your right glute to deepen the stretch',
          'Hold 30 seconds, switch sides'
        ],
        muscleGroups: ['Iliopsoas', 'Rectus femoris'],
        difficulty: 'beginner',
        imageEmoji: '🦵'
      },
      {
        id: 'glute-bridge',
        name: 'Glute Bridges',
        duration: 45,
        description: 'Strengthen your glutes and stretch your hip flexors simultaneously.',
        instructions: [
          'Lie on your back with knees bent, feet flat on the floor',
          'Drive through your heels to lift your hips',
          'Squeeze your glutes hard at the top',
          'Hold for 3 seconds at the top',
          'Lower slowly, repeat 15 times'
        ],
        muscleGroups: ['Gluteus maximus', 'Hamstrings', 'Core'],
        difficulty: 'beginner',
        imageEmoji: '🌉'
      },
      {
        id: 'pigeon-pose',
        name: 'Pigeon Pose',
        duration: 60,
        description: 'A deep hip opener that targets the external rotators and hip flexors.',
        instructions: [
          'From all fours, bring your right knee behind your right wrist',
          'Extend your left leg straight behind you',
          'Square your hips toward the floor',
          'Fold forward over your front leg for a deeper stretch',
          'Hold for 30-45 seconds, switch sides'
        ],
        muscleGroups: ['Hip external rotators', 'Iliopsoas', 'Piriformis'],
        difficulty: 'intermediate',
        imageEmoji: '🐦'
      }
    ],
    tips: [
      'Stand up and walk every 30-45 minutes',
      'Use a standing desk when possible',
      'Stretch hip flexors before and after sitting',
      'Strengthen your glutes to counteract tightness'
    ]
  },
  {
    id: 'text-neck',
    title: 'Text Neck',
    subtitle: 'Phone Posture',
    description: 'Text neck is caused by looking down at your phone for extended periods, creating excessive strain on the cervical spine — up to 60 lbs of force at 60° forward tilt.',
    category: 'neck',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    icon: '📱',
    severity: 'mild',
    affectedAreas: ['Cervical spine', 'Upper trapezius', 'Levator scapulae'],
    exercises: [
      {
        id: 'chin-tuck-2',
        name: 'Seated Chin Tucks',
        duration: 30,
        description: 'A variation of chin tucks specifically designed for phone users.',
        instructions: [
          'Sit tall in a chair with feet flat on the floor',
          'Hold your phone at eye level or put it down',
          'Draw your chin straight back, making a double chin',
          'Hold for 5 seconds, repeat 10 times',
          'Do this every time you finish using your phone'
        ],
        muscleGroups: ['Deep neck flexors', 'Longus colli'],
        difficulty: 'beginner',
        imageEmoji: '🧘'
      },
      {
        id: 'upper-trap-stretch',
        name: 'Upper Trap Release',
        duration: 45,
        description: 'Release tension in the upper trapezius from holding your phone.',
        instructions: [
          'Sit or stand with good posture',
          'Reach your right hand behind your back',
          'Tilt your left ear toward your left shoulder',
          'Gently apply pressure with your left hand on your head',
          'Hold 20 seconds, release gently, switch sides'
        ],
        muscleGroups: ['Upper trapezius', 'Levator scapulae'],
        difficulty: 'beginner',
        imageEmoji: '🙆'
      }
    ],
    tips: [
      'Hold your phone at eye level',
      'Use voice-to-text when possible',
      'Take a phone break every 20 minutes',
      'Do chin tucks after each phone session'
    ]
  },
  {
    id: 'wrist-strain',
    title: 'Wrist Strain',
    subtitle: 'Repetitive Stress',
    description: 'Wrist strain from typing and mouse use causes tension in the forearm flexors and extensors, leading to conditions like carpal tunnel syndrome.',
    category: 'wrist',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    icon: '⌨️',
    severity: 'mild',
    affectedAreas: ['Wrist flexors', 'Wrist extensors', 'Carpal tunnel', 'Forearm'],
    exercises: [
      {
        id: 'wrist-circles',
        name: 'Wrist Circles',
        duration: 30,
        description: 'Gentle circular motions to improve wrist mobility and blood flow.',
        instructions: [
          'Extend your arms in front of you',
          'Make fists with both hands',
          'Rotate your wrists in circles — 10 clockwise',
          'Then 10 counter-clockwise',
          'Shake your hands out after'
        ],
        muscleGroups: ['Wrist flexors', 'Wrist extensors'],
        difficulty: 'beginner',
        imageEmoji: '🔄'
      },
      {
        id: 'prayer-stretch',
        name: 'Prayer Stretch',
        duration: 30,
        description: 'A stretch that targets the wrist flexors and forearm.',
        instructions: [
          'Press your palms together in front of your chest',
          'Slowly lower your hands while keeping palms together',
          'Stop when you feel a stretch in your wrists and forearms',
          'Hold for 15-20 seconds',
          'Repeat 3 times'
        ],
        muscleGroups: ['Wrist flexors', 'Forearm muscles'],
        difficulty: 'beginner',
        imageEmoji: '🙏'
      }
    ],
    tips: [
      'Keep wrists neutral while typing',
      'Use an ergonomic keyboard and mouse',
      'Take micro-breaks every 15 minutes',
      'Strengthen your grip and forearm muscles'
    ]
  }
];

export interface DailyProgress {
  date: string;
  exercisesCompleted: number;
  totalDuration: number; // minutes
  streak: number;
  problemsAddressed: string[];
}

export const sampleProgress: DailyProgress[] = [
  { date: '2026-03-24', exercisesCompleted: 6, totalDuration: 12, streak: 1, problemsAddressed: ['forward-head', 'rounded-shoulders'] },
  { date: '2026-03-25', exercisesCompleted: 9, totalDuration: 18, streak: 2, problemsAddressed: ['forward-head', 'lower-back-pain', 'hip-flexor-tightness'] },
  { date: '2026-03-26', exercisesCompleted: 4, totalDuration: 8, streak: 3, problemsAddressed: ['text-neck'] },
  { date: '2026-03-27', exercisesCompleted: 8, totalDuration: 15, streak: 4, problemsAddressed: ['rounded-shoulders', 'wrist-strain', 'lower-back-pain'] },
  { date: '2026-03-28', exercisesCompleted: 7, totalDuration: 14, streak: 5, problemsAddressed: ['forward-head', 'hip-flexor-tightness'] },
  { date: '2026-03-29', exercisesCompleted: 10, totalDuration: 20, streak: 6, problemsAddressed: ['rounded-shoulders', 'lower-back-pain', 'text-neck'] },
  { date: '2026-03-30', exercisesCompleted: 5, totalDuration: 10, streak: 7, problemsAddressed: ['forward-head', 'wrist-strain'] },
];

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    neck: '#8B5CF6',
    shoulder: '#3B82F6',
    back: '#EC4899',
    hip: '#F97316',
    knee: '#14B8A6',
    wrist: '#6366F1',
  };
  return colors[category] || '#6366F1';
};

export const getCategoryBgColor = (category: string): string => {
  const bgColors: Record<string, string> = {
    neck: '#F5F3FF',
    shoulder: '#EFF6FF',
    back: '#FDF2F8',
    hip: '#FFF7ED',
    knee: '#F0FDFA',
    wrist: '#EEF2FF',
  };
  return bgColors[category] || '#EEF2FF';
};
