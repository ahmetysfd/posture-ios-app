/**
 * UserProfile — onboarding data + posture level persistence.
 * Stored in localStorage so it survives across sessions.
 */

export type PostureLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseDifficulty = 'beginner' | 'medium' | 'hard';

export interface UserProfile {
  /** Basic info collected at onboarding */
  age: number;
  weight: number;                        // kg
  height: number;                        // cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  dailyScreenHours: number;              // hours at desk/phone
  hasExistingPain: boolean;
  painAreas: string[];                   // e.g. ['neck', 'lower-back']

  /** Posture assessment result */
  postureLevel: PostureLevel;
  detectedProblems: string[];            // problem IDs like 'forward-head'
  detectedProblemSeverities?: Record<string, 'low' | 'medium' | 'high'>; // per-problem risk level
  problemCount: number;
  scanTimestamp: number;

  /** Preferred exercise difficulty (user can override) */
  exerciseDifficulty: ExerciseDifficulty;

  /** Whether the user has equipment (foam roller, resistance band, etc.) */
  hasEquipment?: boolean;

  /** Onboarding completed flag */
  onboardingComplete: boolean;
}

const STORAGE_KEY = 'posturefix_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  age: 25,
  weight: 70,
  height: 170,
  gender: 'other',
  activityLevel: 'sedentary',
  dailyScreenHours: 6,
  hasExistingPain: false,
  painAreas: [],
  postureLevel: 'beginner',
  detectedProblems: [],
  problemCount: 0,
  scanTimestamp: 0,
  exerciseDifficulty: 'beginner',
  onboardingComplete: false,
};

export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const existing = loadUserProfile() ?? DEFAULT_PROFILE;
  const merged = { ...existing, ...profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function clearUserProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isOnboardingComplete(): boolean {
  const profile = loadUserProfile();
  return profile?.onboardingComplete === true;
}

/**
 * Determine posture level from scan results + user profile.
 *
 * Uses problem count + severity band + lifestyle risk factors
 * to produce a STABLE categorical level instead of a noisy percentage.
 *
 * Three levels:
 *   advanced  = 0–1 mild problems, active lifestyle
 *   intermediate = 1–2 moderate problems OR sedentary with 0–1
 *   beginner  = 3+ problems OR any severe problem OR sedentary + pain
 */
export function determinePostureLevel(
  detectedProblemIds: string[],
  severityBand: 'low' | 'medium' | 'high',
  profile: Partial<UserProfile>,
): PostureLevel {
  const count = detectedProblemIds.length;
  const isSedentary = profile.activityLevel === 'sedentary' || profile.activityLevel === 'light';
  const hasPain = profile.hasExistingPain === true;
  const highScreenTime = (profile.dailyScreenHours ?? 0) >= 8;

  // Risk multiplier from lifestyle
  let riskBoost = 0;
  if (isSedentary) riskBoost += 1;
  if (hasPain) riskBoost += 1;
  if (highScreenTime) riskBoost += 1;

  // Severity is the primary driver; count + risk are secondary modifiers.

  // High risk → always beginner
  if (severityBand === 'high') return 'beginner';

  // Medium risk → intermediate, downgrade only under very high lifestyle risk
  if (severityBand === 'medium') {
    if (riskBoost >= 2) return 'beginner';
    return 'intermediate';
  }

  // Low risk zone
  if (count === 0) return 'advanced';
  if (riskBoost >= 2 || count >= 3) return 'intermediate';
  if (count === 1 && riskBoost === 0) return 'advanced';

  return 'intermediate';
}

/** Map posture level to a default exercise difficulty */
export function levelToDefaultDifficulty(level: PostureLevel): ExerciseDifficulty {
  switch (level) {
    case 'beginner': return 'beginner';
    case 'intermediate': return 'medium';
    case 'advanced': return 'hard';
  }
}

/** Human-readable level info */
export const LEVEL_INFO: Record<PostureLevel, {
  label: string;
  tagline: string;
  description: string;
  color: string;
  bgColor: string;
}> = {
  beginner: {
    label: 'Beginner',
    tagline: '90-day plan · Days 1–30',
    description: 'Your scan shows several areas that need attention. Start with gentle corrective exercises and build consistency before progressing.',
    color: '#E68C33',
    bgColor: 'rgba(230,140,51,0.1)',
  },
  intermediate: {
    label: 'Intermediate',
    tagline: '90-day plan · Days 31–60',
    description: 'You have a decent baseline with a few areas to improve. Moderate exercises will help you strengthen and correct remaining imbalances.',
    color: '#D9B84C',
    bgColor: 'rgba(217,184,76,0.1)',
  },
  advanced: {
    label: 'Advanced',
    tagline: '90-day plan · Days 61–90',
    description: 'Your posture looks strong overall. Focus on maintaining mobility and preventing regression with challenging movement patterns.',
    color: '#3DA878',
    bgColor: 'rgba(61,168,120,0.1)',
  },
};

export const DIFFICULTY_INFO: Record<ExerciseDifficulty, {
  label: string;
  color: string;
}> = {
  beginner: { label: 'Beginner', color: '#3DA878' },
  medium: { label: 'Medium', color: '#D9B84C' },
  hard: { label: 'Hard', color: '#E68C33' },
};
