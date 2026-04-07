/**
 * MoveNet Thunder (TensorFlow.js) — web analogue of ML Kit Accurate mode.
 */
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export interface PoseResult {
  keypoints: Keypoint[];
  score: number;
  timestamp: number;
}

export type PoseModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export const KP = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
} as const;

let detector: poseDetection.PoseDetector | null = null;
let detectorPromise: Promise<poseDetection.PoseDetector> | null = null;

async function pickBackend(): Promise<void> {
  try {
    await tf.setBackend('webgl');
    await tf.ready();
  } catch {
    await tf.setBackend('cpu');
    await tf.ready();
  }
}

export async function initPoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detector) return detector;
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    await pickBackend();

    const model = poseDetection.SupportedModels.MoveNet;
    const det = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableSmoothing: false,
    });

    detector = det;
    return det;
  })();

  return detectorPromise;
}

export async function detectPose(
  imageElement: HTMLImageElement | HTMLCanvasElement,
): Promise<PoseResult | null> {
  const det = await initPoseDetector();

  const poses = await det.estimatePoses(imageElement, {
    flipHorizontal: false,
  });

  if (!poses.length || !poses[0].keypoints.length) {
    return null;
  }

  const pose = poses[0];
  const imgWidth =
    imageElement instanceof HTMLImageElement ? imageElement.naturalWidth : imageElement.width;
  const imgHeight =
    imageElement instanceof HTMLImageElement ? imageElement.naturalHeight : imageElement.height;

  const keypoints: Keypoint[] = pose.keypoints.map((kp) => ({
    x: kp.x / imgWidth,
    y: kp.y / imgHeight,
    score: kp.score ?? 0,
    name: kp.name ?? '',
  }));

  const visible = keypoints.filter((kp) => kp.score > 0.3);
  const avgScore =
    visible.length > 0 ? visible.reduce((sum, kp) => sum + kp.score, 0) / visible.length : 0;

  return {
    keypoints,
    score: avgScore,
    timestamp: Date.now(),
  };
}

export function validatePoseForView(
  result: PoseResult,
  view: 'front' | 'side' | 'back',
): { valid: boolean; reason?: string } {
  const kps = result.keypoints;
  const MIN_CONF = 0.3;

  const isVisible = (idx: number) => kps[idx] && kps[idx].score >= MIN_CONF;

  const hasShoulders = isVisible(KP.LEFT_SHOULDER) && isVisible(KP.RIGHT_SHOULDER);
  const hasHips = isVisible(KP.LEFT_HIP) && isVisible(KP.RIGHT_HIP);

  if (!hasShoulders)
    return { valid: false, reason: 'Shoulders not visible. Step back and ensure your upper body is in frame.' };
  if (!hasHips)
    return { valid: false, reason: 'Hips not visible. Make sure your full torso is in the photo.' };

  if (view === 'front' || view === 'back') {
    const hasNose = isVisible(KP.NOSE);
    if (!hasNose)
      return { valid: false, reason: 'Head not visible. Include your head in the frame.' };
  }

  if (view === 'side') {
    const hasKnee = isVisible(KP.LEFT_KNEE) || isVisible(KP.RIGHT_KNEE);
    if (!hasKnee)
      return { valid: false, reason: 'Knees not visible. Stand farther from the camera.' };
  }

  return { valid: true };
}

export function detectViewType(keypoints: Keypoint[]): 'side' | 'frontal' {
  const ls = keypoints[KP.LEFT_SHOULDER];
  const rs = keypoints[KP.RIGHT_SHOULDER];

  if (!ls || !rs || ls.score < 0.3 || rs.score < 0.3) return 'frontal';

  const shoulderWidth = Math.abs(ls.x - rs.x);
  return shoulderWidth < 0.12 ? 'side' : 'frontal';
}

const CONNECTIONS: [number, number][] = [
  [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER],
  [KP.LEFT_SHOULDER, KP.LEFT_HIP],
  [KP.RIGHT_SHOULDER, KP.RIGHT_HIP],
  [KP.LEFT_HIP, KP.RIGHT_HIP],
  [KP.LEFT_SHOULDER, KP.LEFT_ELBOW],
  [KP.LEFT_ELBOW, KP.LEFT_WRIST],
  [KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW],
  [KP.RIGHT_ELBOW, KP.RIGHT_WRIST],
  [KP.LEFT_HIP, KP.LEFT_KNEE],
  [KP.LEFT_KNEE, KP.LEFT_ANKLE],
  [KP.RIGHT_HIP, KP.RIGHT_KNEE],
  [KP.RIGHT_KNEE, KP.RIGHT_ANKLE],
  [KP.NOSE, KP.LEFT_SHOULDER],
  [KP.NOSE, KP.RIGHT_SHOULDER],
];

export function drawSkeleton(
  canvas: HTMLCanvasElement,
  keypoints: Keypoint[],
  displayWidth: number,
  displayHeight: number,
  color = 'rgba(217, 184, 76, 0.75)',
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(displayWidth * dpr);
  canvas.height = Math.round(displayHeight * dpr);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  for (const [a, b] of CONNECTIONS) {
    const ka = keypoints[a];
    const kb = keypoints[b];
    if (ka?.score > 0.3 && kb?.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(ka.x * displayWidth, ka.y * displayHeight);
      ctx.lineTo(kb.x * displayWidth, kb.y * displayHeight);
      ctx.stroke();
    }
  }

  for (const kp of keypoints) {
    if (kp.score <= 0.3) continue;
    ctx.beginPath();
    ctx.arc(kp.x * displayWidth, kp.y * displayHeight, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,10,10,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
