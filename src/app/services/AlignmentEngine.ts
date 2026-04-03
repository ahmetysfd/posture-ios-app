/**
 * AlignmentEngine.ts — v2 (head-to-knee framing)
 *
 * CHANGED FROM v1:
 * - Replaced ankle landmarks (27/28) with knee landmarks (25/26)
 * - feetY targets -> kneesY targets (knees land at ~72-92% of frame)
 * - All "feet" messages -> "knees"
 * - Side-view shoulder-width range widened slightly
 */

import type { Landmark, IntendedView } from './PostureAnalysisEngine';

export interface AlignmentCheck {
  id: string;
  label: string;
  passed: boolean;
  message: string;
}

export interface AlignmentFeedback {
  score: number;
  isReady: boolean;
  messages: string[];
  checks: AlignmentCheck[];
}

type AlignmentTarget = {
  headY: { min: number; max: number };
  centerX: { min: number; max: number };
  kneesY: { min: number; max: number };
  shoulderWidth: { min: number; max: number };
  maxTilt: number;
  maxShoulderTilt: number;
};

const TARGETS: Record<IntendedView, AlignmentTarget> = {
  front: {
    headY: { min: 0.06, max: 0.2 },
    centerX: { min: 0.38, max: 0.62 },
    kneesY: { min: 0.72, max: 0.94 },
    shoulderWidth: { min: 0.16, max: 0.36 },
    maxTilt: 0.055,
    maxShoulderTilt: 0.045,
  },
  side: {
    headY: { min: 0.06, max: 0.22 },
    centerX: { min: 0.38, max: 0.65 },
    kneesY: { min: 0.72, max: 0.94 },
    shoulderWidth: { min: 0.03, max: 0.17 },
    maxTilt: 0.06,
    maxShoulderTilt: 0.06,
  },
  back: {
    headY: { min: 0.06, max: 0.2 },
    centerX: { min: 0.38, max: 0.62 },
    kneesY: { min: 0.72, max: 0.94 },
    shoulderWidth: { min: 0.16, max: 0.36 },
    maxTilt: 0.055,
    maxShoulderTilt: 0.045,
  },
};

export function getAlignmentColor(score: number): string {
  if (score >= 85) return '#34D399';
  if (score >= 60) return '#7DD3FC';
  if (score >= 40) return '#FBBF24';
  return '#FB7185';
}

export function checkAlignment(
  landmarks: Landmark[],
  intendedView: IntendedView,
): AlignmentFeedback {
  if (!landmarks || landmarks.length < 33) {
    return {
      score: 0,
      isReady: false,
      messages: ['Step into frame'],
      checks: [],
    };
  }

  const target = TARGETS[intendedView];
  const checks: AlignmentCheck[] = [];
  const messages: string[] = [];

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];

  const keyPoints = [nose, leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee];
  const visibleCount = keyPoints.filter(pt => pt.visibility > 0.4).length;
  const fullyVisible = visibleCount >= 5;

  checks.push({
    id: 'visibility',
    label: 'Body visible',
    passed: fullyVisible,
    message: fullyVisible ? 'Body detected' : 'Show head to knees',
  });

  if (!fullyVisible) {
    return {
      score: Math.round((visibleCount / 7) * 35),
      isReady: false,
      messages: ['Head and knees must be visible in frame'],
      checks,
    };
  }

  const headY = nose.y;
  const headInRange = headY >= target.headY.min && headY <= target.headY.max;
  if (!headInRange) {
    messages.push(headY < target.headY.min ? 'Step back a little' : 'Move farther from camera');
  }
  checks.push({
    id: 'head',
    label: 'Head position',
    passed: headInRange,
    message: headInRange ? 'Head aligned' : 'Adjust head position',
  });

  const kneesVisible = leftKnee.visibility > 0.35 && rightKnee.visibility > 0.35;
  const kneesY = (leftKnee.y + rightKnee.y) / 2;
  const kneesInRange = kneesVisible && kneesY >= target.kneesY.min && kneesY <= target.kneesY.max;

  if (!kneesVisible) {
    messages.push('Show your knees in the frame');
  } else if (kneesY < target.kneesY.min) {
    messages.push('Step closer - knees should be near bottom');
  } else if (kneesY > target.kneesY.max) {
    messages.push('Step back - knees are cut off');
  }
  checks.push({
    id: 'knees',
    label: 'Knees visible',
    passed: kneesInRange,
    message: kneesInRange ? 'Knees in frame' : 'Show knees',
  });

  const centerX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
  const centered = centerX >= target.centerX.min && centerX <= target.centerX.max;
  if (!centered) {
    messages.push(centerX < target.centerX.min ? 'Move right' : 'Move left');
  }
  checks.push({
    id: 'centered',
    label: 'Centered',
    passed: centered,
    message: centered ? 'Centered' : 'Re-center',
  });

  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  const distanceOk = shoulderWidth >= target.shoulderWidth.min && shoulderWidth <= target.shoulderWidth.max;
  if (!distanceOk) {
    if (intendedView === 'side' && shoulderWidth > target.shoulderWidth.max) {
      messages.push('Turn more sideways');
    } else {
      messages.push(shoulderWidth < target.shoulderWidth.min ? 'Step closer' : 'Step back');
    }
  }
  checks.push({
    id: 'distance',
    label: intendedView === 'side' ? 'Side profile' : 'Distance',
    passed: distanceOk,
    message: distanceOk ? 'Distance good' : intendedView === 'side' ? 'Rotate to profile' : 'Adjust distance',
  });

  const kneesCenterX = (leftKnee.x + rightKnee.x) / 2;
  const bodyTilt = Math.abs(nose.x - kneesCenterX);
  const standingStraight = bodyTilt <= target.maxTilt;
  if (!standingStraight) {
    messages.push('Stand straighter');
  }
  checks.push({
    id: 'tilt',
    label: 'Vertical',
    passed: standingStraight,
    message: standingStraight ? 'Standing straight' : 'Straighten up',
  });

  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  const shouldersLevel = shoulderTilt <= target.maxShoulderTilt;
  if (!shouldersLevel && intendedView !== 'side') {
    messages.push('Level your shoulders');
  }
  checks.push({
    id: 'shoulders-level',
    label: 'Shoulders level',
    passed: shouldersLevel,
    message: shouldersLevel ? 'Shoulders level' : 'Uneven shoulders',
  });

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const isReady = score >= 85;

  if (isReady && messages.length === 0) {
    messages.push('Perfect alignment');
  }

  return {
    score,
    isReady,
    messages: [...new Set(messages)].slice(0, 2),
    checks,
  };
}
