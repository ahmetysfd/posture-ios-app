/**
 * MediaPipe Pose — browser, jsDelivr.
 *
 * Only one WASM runtime may exist per page. React 18 StrictMode runs effects twice in dev;
 * we dedupe script injection + `new Pose()` so initialization happens once.
 */
import type { Landmark } from './PostureAnalysisEngine';

const POSE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose';

declare global {
  interface Window {
    Pose: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (o: Record<string, unknown>) => void;
      initialize: () => Promise<void>;
      onResults: (cb: (results: unknown) => void) => void;
      send: (input: { image: CanvasImageSource }) => void;
      close: () => void;
    };
  }
}

export type PoseModelStatus = 'loading' | 'ready' | 'error' | 'idle';

export interface PoseResult {
  landmarks: Landmark[];
  worldLandmarks: Landmark[];
  timestamp: number;
}

export type MediaPipePose = any;

let scriptsLoadPromise: Promise<void> | null = null;
let poseReadyPromise: Promise<MediaPipePose> | null = null;

export function loadMediaPipeScripts(): Promise<void> {
  if (typeof window !== 'undefined' && window.Pose) {
    return Promise.resolve();
  }
  if (scriptsLoadPromise) {
    return scriptsLoadPromise;
  }
  scriptsLoadPromise = new Promise((resolve, reject) => {
    const mark = 'script[data-posturefix-mp-pose]';
    const existing = document.querySelector(mark);
    if (existing) {
      const el = existing as HTMLScriptElement;
      if (window.Pose) {
        resolve();
        return;
      }
      el.addEventListener('load', () => resolve(), { once: true });
      el.addEventListener('error', () => reject(new Error('MediaPipe Pose script failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `${POSE_CDN}/pose.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-posturefix-mp-pose', '');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${script.src}`));
    document.head.appendChild(script);
  });
  return scriptsLoadPromise;
}

/** One shared detector for the app session (avoids duplicate WASM / Module.arguments abort). */
export function createPoseDetector(): Promise<MediaPipePose> {
  if (poseReadyPromise) {
    return poseReadyPromise;
  }
  poseReadyPromise = (async () => {
    await loadMediaPipeScripts();
    if (!window.Pose) {
      throw new Error('MediaPipe Pose not available');
    }
    const pose = new window.Pose({
      locateFile: (file: string) => `${POSE_CDN}/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    await pose.initialize();
    return pose;
  })();
  return poseReadyPromise;
}

export async function detectPoseFromImage(
  pose: MediaPipePose,
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<PoseResult | null> {
  return new Promise(resolve => {
    let done = false;
    const finish = (value: PoseResult | null) => {
      if (done) return;
      done = true;
      resolve(value);
    };

    pose.onResults((results: {
      poseLandmarks?: Array<{ x: number; y: number; z: number; visibility?: number }>;
      poseWorldLandmarks?: Array<{ x: number; y: number; z: number; visibility?: number }>;
    }) => {
      if (results.poseLandmarks && results.poseLandmarks.length >= 33) {
        finish({
          landmarks: results.poseLandmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility ?? 1,
          })),
          worldLandmarks: results.poseWorldLandmarks
            ? results.poseWorldLandmarks.map(lm => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
                visibility: lm.visibility ?? 1,
              }))
            : [],
          timestamp: Date.now(),
        });
      } else {
        finish(null);
      }
    });

    pose.send({ image: imageElement });
    window.setTimeout(() => finish(null), 12000);
  });
}

const LINE = 'rgba(229, 53, 53, 0.75)';
const DOT = '#e53535';
const DOT_DIM = 'rgba(229, 53, 53, 0.45)';

export function drawSkeleton(
  canvas: HTMLCanvasElement,
  landmarks: Landmark[],
  displayWidth: number,
  displayHeight: number,
  accentColor = LINE,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  canvas.width = Math.max(1, Math.round(displayWidth * dpr));
  canvas.height = Math.max(1, Math.round(displayHeight * dpr));
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const connections: [number, number][] = [
    [11, 12], [11, 23], [12, 24], [23, 24],
    [11, 13], [13, 15],
    [12, 14], [14, 16],
    [23, 25], [25, 27],
    [24, 26], [26, 28],
    [0, 7], [0, 8],
    [7, 11], [8, 12],
  ];

  ctx.clearRect(0, 0, displayWidth, displayHeight);
  ctx.lineWidth = 3;
  connections.forEach(([a, b]) => {
    const la = landmarks[a];
    const lb = landmarks[b];
    if (!la || !lb) return;
    if (la.visibility > 0.3 && lb.visibility > 0.3) {
      ctx.beginPath();
      ctx.strokeStyle = accentColor;
      ctx.moveTo(la.x * displayWidth, la.y * displayHeight);
      ctx.lineTo(lb.x * displayWidth, lb.y * displayHeight);
      ctx.stroke();
    }
  });

  landmarks.forEach((lm, i) => {
    if (lm.visibility <= 0.3) return;
    const key = [0, 7, 8, 11, 12, 23, 24, 25, 26, 27, 28].includes(i);
    ctx.beginPath();
    ctx.arc(lm.x * displayWidth, lm.y * displayHeight, key ? 5 : 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = key ? accentColor : accentColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,10,10,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}
