/**
 * PostureAnalysisEngine v2 — measurement-driven 2D posture screening.
 *
 * This engine computes normalized front / side / back measurements first,
 * then scores common posture problems from those measurements with confidence
 * weighting so mild front/back findings do not get discarded.
 */

import { type Keypoint, KP } from './MoveNetPoseService';
import type { IntendedView, PostureLevel, RiskCategory, SeverityBand } from '../types/assessment';

export type { IntendedView, PostureLevel, RiskCategory, SeverityBand };

type BodyRegion = 'neck' | 'shoulders' | 'upperBack' | 'pelvis' | 'knees';
type MetricMap = Record<string, number>;

export interface PostureProblem {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  dominantView: IntendedView;
  riskCategory: RiskCategory;
  score: number;
  detectedInViews: IntendedView[];
  description: string;
  mapLabel: string;
  showOnViews?: IntendedView[];
  confidenceScore?: number;
  supportingMeasurements?: string[];
  rawMetrics?: MetricMap;
}

export interface ScanReport {
  postureLevel: PostureLevel;
  severityBand: SeverityBand;
  problems: PostureProblem[];
  allKeypoints: { front?: Keypoint[]; side?: Keypoint[]; back?: Keypoint[] };
  timestamp: number;
}

interface MeasurementPoint {
  x: number;
  y: number;
  score: number;
}

interface FrontMetrics {
  confidence: number;
  torsoHeight: number;
  shoulderTiltDeg: number;
  hipTiltDeg: number;
  trunkLeanDeg: number;
  headCenterOffset: number;
  shoulderWidthToHipWidth: number;
  elbowFlareAsym: number;
  armHangAsym: number;
  kneeOffsetLeft: number;
  kneeOffsetRight: number;
}

interface SideMetrics {
  confidence: number;
  torsoHeight: number;
  headForwardOffset: number;
  earShoulderVerticalDeg: number;
  shoulderForwardOffset: number;
  thoracicCurveAngle: number;
  hipAngle: number;
  ribPelvisStackOffset: number;
  trunkLeanDeg: number;
}

interface BackMetrics {
  confidence: number;
  torsoHeight: number;
  shoulderTiltDeg: number;
  hipTiltDeg: number;
  trunkLeanDeg: number;
  shoulderWidthToHipWidth: number;
  elbowFlareAsym: number;
  armHangAsym: number;
  waistTriangleAsym: number;
  scapularAsymmetryIndex: number;
}

interface ViewMetrics {
  front: FrontMetrics | null;
  side: SideMetrics | null;
  back: BackMetrics | null;
}

interface RawHit {
  rawScore: number;
  confidence: number;
  view: IntendedView;
  desc: string;
  measurements: string[];
  metrics: MetricMap;
}

interface ProblemDef {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  mapLabel: string;
  bestView: IntendedView;
  showOnViews: IntendedView[];
  buildHits: (metrics: ViewMetrics) => RawHit[];
}

function clamp(n: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, n));
}

function round(n: number, digits = 1): number {
  const m = 10 ** digits;
  return Math.round(n * m) / m;
}

function point(kp: Keypoint | undefined, threshold = 0.2): MeasurementPoint | null {
  if (!kp || kp.score < threshold) return null;
  return { x: kp.x, y: kp.y, score: kp.score };
}

function midpoint(a: MeasurementPoint | null, b: MeasurementPoint | null): MeasurementPoint | null {
  if (!a || !b) return null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    score: Math.min(a.score, b.score),
  };
}

function distance(a: MeasurementPoint | null, b: MeasurementPoint | null): number {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function lineAngleFromHorizontal(a: MeasurementPoint | null, b: MeasurementPoint | null): number {
  if (!a || !b) return 0;
  return Math.abs((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
}

function tiltDegFromHorizontal(a: MeasurementPoint | null, b: MeasurementPoint | null): number {
  const angle = lineAngleFromHorizontal(a, b);
  return angle > 90 ? Math.abs(180 - angle) : angle;
}

function lineAngleFromVertical(a: MeasurementPoint | null, b: MeasurementPoint | null): number {
  if (!a || !b) return 0;
  return (Math.atan2(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) * 180) / Math.PI;
}

function angle3(a: MeasurementPoint | null, b: MeasurementPoint | null, c: MeasurementPoint | null): number {
  if (!a || !b || !c) return 0;
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs((rad * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

function measurementConfidence(points: Array<MeasurementPoint | null>): number {
  const used = points.filter(Boolean) as MeasurementPoint[];
  if (!used.length) return 0;
  const avg = used.reduce((sum, p) => sum + p.score, 0) / used.length;
  const min = Math.min(...used.map(p => p.score));
  return clamp(avg * 0.65 + min * 0.35);
}

function safeScale(...values: number[]): number {
  const valid = values.filter(v => Number.isFinite(v) && v > 0.0001);
  if (!valid.length) return 0.18;
  return Math.max(0.12, valid.reduce((sum, v) => sum + v, 0) / valid.length);
}

function normalizedDx(a: MeasurementPoint | null, b: MeasurementPoint | null, scale: number): number {
  if (!a || !b) return 0;
  return Math.abs(a.x - b.x) / Math.max(scale, 0.0001);
}

function directScore(value: number, mild: number, severe: number): number {
  if (severe <= mild) return value >= severe ? 100 : 0;
  return clamp((value - mild) / (severe - mild), 0, 1) * 100;
}

function inverseScore(value: number, normalHigh: number, severeLow: number): number {
  if (normalHigh <= severeLow) return value <= severeLow ? 100 : 0;
  return clamp((normalHigh - value) / (normalHigh - severeLow), 0, 1) * 100;
}

function weightedScore(parts: Array<{ score: number; weight: number }>): number {
  const usable = parts.filter(p => Number.isFinite(p.score) && p.weight > 0);
  if (!usable.length) return 0;
  const totalWeight = usable.reduce((sum, p) => sum + p.weight, 0);
  return usable.reduce((sum, p) => sum + p.score * p.weight, 0) / totalWeight;
}

function scoreToRisk(score: number): RiskCategory {
  if (score >= 50) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

function visibleScore(raw: number, confidence: number): number {
  const dampened = raw * (0.72 + confidence * 0.28);
  if (dampened < 8) return 0;
  return Math.min(100, Math.max(10, Math.round(dampened)));
}

function fmt(label: string, value: number, suffix = ''): string {
  return `${label}: ${round(value)}${suffix}`;
}

function buildFrontMetrics(kps: Keypoint[]): FrontMetrics | null {
  const ls = point(kps[KP.LEFT_SHOULDER]);
  const rs = point(kps[KP.RIGHT_SHOULDER]);
  const lh = point(kps[KP.LEFT_HIP]);
  const rh = point(kps[KP.RIGHT_HIP]);
  if (!ls || !rs || !lh || !rh) return null;

  const le = point(kps[KP.LEFT_ELBOW], 0.15);
  const re = point(kps[KP.RIGHT_ELBOW], 0.15);
  const lk = point(kps[KP.LEFT_KNEE], 0.15);
  const rk = point(kps[KP.RIGHT_KNEE], 0.15);
  const la = point(kps[KP.LEFT_ANKLE], 0.15);
  const ra = point(kps[KP.RIGHT_ANKLE], 0.15);
  const nose = point(kps[KP.NOSE], 0.15);

  const shouldersMid = midpoint(ls, rs);
  const hipsMid = midpoint(lh, rh);
  const torsoHeight = safeScale(distance(shouldersMid, hipsMid));
  const shoulderWidth = distance(ls, rs);
  const hipWidth = distance(lh, rh);

  const shoulderTiltDeg = tiltDegFromHorizontal(ls, rs);
  const hipTiltDeg = tiltDegFromHorizontal(lh, rh);
  const trunkLeanDeg = lineAngleFromVertical(shouldersMid, hipsMid);
  const headCenterOffset = normalizedDx(nose, shouldersMid, torsoHeight);
  const shoulderWidthToHipWidth = shoulderWidth / Math.max(hipWidth, 0.0001);
  const elbowFlareAsym = Math.abs(Math.abs((le?.x ?? ls.x) - ls.x) - Math.abs((re?.x ?? rs.x) - rs.x)) / torsoHeight;
  const armHangAsym = Math.abs(Math.abs((le?.y ?? ls.y) - ls.y) - Math.abs((re?.y ?? rs.y) - rs.y)) / torsoHeight;
  const kneeOffsetLeft = normalizedDx(lk, la, torsoHeight);
  const kneeOffsetRight = normalizedDx(rk, ra, torsoHeight);

  return {
    confidence: measurementConfidence([ls, rs, lh, rh, nose, le, re, lk, rk, la, ra]),
    torsoHeight,
    shoulderTiltDeg,
    hipTiltDeg,
    trunkLeanDeg,
    headCenterOffset,
    shoulderWidthToHipWidth,
    elbowFlareAsym,
    armHangAsym,
    kneeOffsetLeft,
    kneeOffsetRight,
  };
}

function buildSideMetrics(kps: Keypoint[]): SideMetrics | null {
  const leftConfidence = Math.min(kps[KP.LEFT_SHOULDER]?.score ?? 0, kps[KP.LEFT_HIP]?.score ?? 0);
  const rightConfidence = Math.min(kps[KP.RIGHT_SHOULDER]?.score ?? 0, kps[KP.RIGHT_HIP]?.score ?? 0);
  const useLeft = leftConfidence >= rightConfidence;

  const shoulder = point(kps[useLeft ? KP.LEFT_SHOULDER : KP.RIGHT_SHOULDER]);
  const hip = point(kps[useLeft ? KP.LEFT_HIP : KP.RIGHT_HIP]);
  const knee = point(kps[useLeft ? KP.LEFT_KNEE : KP.RIGHT_KNEE], 0.15);
  const ear = point(kps[useLeft ? KP.LEFT_EAR : KP.RIGHT_EAR], 0.15)
    ?? point(kps[KP.NOSE], 0.15);
  const oppositeShoulder = point(kps[useLeft ? KP.RIGHT_SHOULDER : KP.LEFT_SHOULDER], 0.15);
  const oppositeHip = point(kps[useLeft ? KP.RIGHT_HIP : KP.LEFT_HIP], 0.15);
  if (!shoulder || !hip || !knee || !ear) return null;

  const torsoHeight = safeScale(distance(shoulder, hip));
  const headForwardOffset = normalizedDx(ear, shoulder, torsoHeight);
  const earShoulderVerticalDeg = lineAngleFromVertical(ear, shoulder);
  const shoulderForwardOffset = normalizedDx(shoulder, hip, torsoHeight);
  const thoracicCurveAngle = Math.max(0, 170 - angle3(ear, shoulder, hip));
  const hipAngle = angle3(shoulder, hip, knee);
  const ribPelvisStackOffset = normalizedDx(ear, hip, torsoHeight);
  const trunkLeanDeg = lineAngleFromVertical(shoulder, hip);

  return {
    confidence: measurementConfidence([shoulder, hip, knee, ear, oppositeShoulder, oppositeHip]),
    torsoHeight,
    headForwardOffset,
    earShoulderVerticalDeg,
    shoulderForwardOffset,
    thoracicCurveAngle,
    hipAngle,
    ribPelvisStackOffset,
    trunkLeanDeg,
  };
}

function buildBackMetrics(kps: Keypoint[]): BackMetrics | null {
  const ls = point(kps[KP.LEFT_SHOULDER]);
  const rs = point(kps[KP.RIGHT_SHOULDER]);
  const lh = point(kps[KP.LEFT_HIP]);
  const rh = point(kps[KP.RIGHT_HIP]);
  if (!ls || !rs || !lh || !rh) return null;

  const le = point(kps[KP.LEFT_ELBOW], 0.15);
  const re = point(kps[KP.RIGHT_ELBOW], 0.15);
  const lw = point(kps[KP.LEFT_WRIST], 0.15);
  const rw = point(kps[KP.RIGHT_WRIST], 0.15);
  const shouldersMid = midpoint(ls, rs);
  const hipsMid = midpoint(lh, rh);
  const torsoHeight = safeScale(distance(shouldersMid, hipsMid));
  const shoulderWidth = distance(ls, rs);
  const hipWidth = distance(lh, rh);

  const elbowFlareAsym = Math.abs(Math.abs((le?.x ?? ls.x) - ls.x) - Math.abs((re?.x ?? rs.x) - rs.x)) / torsoHeight;
  const armHangAsym = Math.abs(Math.abs((lw?.y ?? le?.y ?? ls.y) - ls.y) - Math.abs((rw?.y ?? re?.y ?? rs.y) - rs.y)) / torsoHeight;
  const waistTriangleAsym = Math.abs(Math.abs(ls.x - lh.x) - Math.abs(rs.x - rh.x)) / torsoHeight;
  const shoulderWidthToHipWidth = shoulderWidth / Math.max(hipWidth, 0.0001);
  const shoulderTiltDeg = tiltDegFromHorizontal(ls, rs);
  const hipTiltDeg = tiltDegFromHorizontal(lh, rh);
  const trunkLeanDeg = lineAngleFromVertical(shouldersMid, hipsMid);
  const scapularAsymmetryIndex = weightedScore([
    { score: directScore(shoulderTiltDeg, 1.2, 5.5), weight: 0.3 },
    { score: directScore(elbowFlareAsym, 0.025, 0.11), weight: 0.25 },
    { score: directScore(waistTriangleAsym, 0.03, 0.12), weight: 0.2 },
    { score: directScore(armHangAsym, 0.025, 0.11), weight: 0.15 },
    { score: inverseScore(shoulderWidthToHipWidth, 1.08, 0.84), weight: 0.1 },
  ]);

  return {
    confidence: measurementConfidence([ls, rs, lh, rh, le, re, lw, rw]),
    torsoHeight,
    shoulderTiltDeg,
    hipTiltDeg,
    trunkLeanDeg,
    shoulderWidthToHipWidth,
    elbowFlareAsym,
    armHangAsym,
    waistTriangleAsym,
    scapularAsymmetryIndex,
  };
}

function buildMetrics(front: Keypoint[], side: Keypoint[], back: Keypoint[]): ViewMetrics {
  return {
    front: buildFrontMetrics(front),
    side: buildSideMetrics(side),
    back: buildBackMetrics(back),
  };
}

function mergeProblem(def: ProblemDef, hits: RawHit[]): PostureProblem | null {
  if (!hits.length) return null;

  const weighted = hits.map(hit => ({
    ...hit,
    influence: Math.max(0.15, hit.confidence) * Math.max(10, hit.rawScore),
  }));
  const preferred = weighted.find(hit => hit.view === def.bestView);
  const anchor = preferred ?? weighted.reduce((best, cur) => (cur.influence > best.influence ? cur : best));
  const supportWeight = weighted.reduce((sum, hit) => sum + Math.max(0.2, hit.confidence), 0);
  const supportAvg = weighted.reduce((sum, hit) => sum + hit.rawScore * Math.max(0.2, hit.confidence), 0) / supportWeight;
  const avgConfidence = weighted.reduce((sum, hit) => sum + hit.confidence, 0) / weighted.length;
  const blendedRaw = anchor.rawScore * 0.62 + supportAvg * 0.38;
  const score = visibleScore(blendedRaw, avgConfidence);
  if (score === 0) return null;

  const detectedInViews = [...new Set(weighted.filter(hit => hit.rawScore >= 20).map(hit => hit.view))];
  const metrics = weighted.reduce<MetricMap>((acc, hit) => ({ ...acc, ...hit.metrics }), {});
  const measurements = [...new Set(weighted.flatMap(hit => hit.measurements))].slice(0, 5);

  return {
    id: def.id,
    name: def.name,
    bodyRegion: def.bodyRegion,
    dominantView: anchor.view,
    riskCategory: scoreToRisk(score),
    score,
    detectedInViews,
    description: anchor.desc,
    mapLabel: def.mapLabel,
    showOnViews: def.showOnViews,
    confidenceScore: Math.round(avgConfidence * 100),
    supportingMeasurements: measurements,
    rawMetrics: metrics,
  };
}

function forwardHeadHits(metrics: ViewMetrics): RawHit[] {
  const hits: RawHit[] = [];
  const side = metrics.side;
  if (side) {
    const rawScore = weightedScore([
      { score: directScore(side.headForwardOffset, 0.025, 0.12), weight: 0.7 },
      { score: directScore(side.earShoulderVerticalDeg, 4, 18), weight: 0.3 },
    ]);
    hits.push({
      rawScore,
      confidence: side.confidence,
      view: 'side',
      desc:
        rawScore >= 35
          ? `Head sits forward of the shoulder line in profile, which fits a forward-head pattern.`
          : 'Profile head position stays fairly close to the shoulder line.',
      measurements: [
        fmt('Head offset', side.headForwardOffset * 100, '% torso'),
        fmt('Ear-shoulder angle', side.earShoulderVerticalDeg, '°'),
      ],
      metrics: {
        side_headForwardOffset: round(side.headForwardOffset, 3),
        side_earShoulderVerticalDeg: round(side.earShoulderVerticalDeg),
      },
    });
  }
  const front = metrics.front;
  if (front) {
    const rawScore = weightedScore([
      { score: directScore(front.headCenterOffset, 0.02, 0.08), weight: 0.75 },
      { score: directScore(front.trunkLeanDeg, 1.5, 6), weight: 0.25 },
    ]);
    hits.push({
      rawScore,
      confidence: front.confidence * 0.85,
      view: 'front',
      desc:
        rawScore >= 30
          ? 'Front view shows the head drifting away from the shoulder midpoint.'
          : 'Front head position looks centered over the shoulders.',
      measurements: [
        fmt('Head center offset', front.headCenterOffset * 100, '% torso'),
        fmt('Trunk lean', front.trunkLeanDeg, '°'),
      ],
      metrics: {
        front_headCenterOffset: round(front.headCenterOffset, 3),
        front_trunkLeanDeg: round(front.trunkLeanDeg),
      },
    });
  }
  return hits;
}

function wingingScapulaHits(metrics: ViewMetrics): RawHit[] {
  const back = metrics.back;
  if (!back) return [];
  const rawScore = weightedScore([
    { score: back.scapularAsymmetryIndex, weight: 0.45 },
    { score: directScore(back.elbowFlareAsym, 0.02, 0.08), weight: 0.2 },
    { score: directScore(back.armHangAsym, 0.02, 0.08), weight: 0.15 },
    { score: directScore(back.waistTriangleAsym, 0.025, 0.1), weight: 0.1 },
    { score: inverseScore(back.shoulderWidthToHipWidth, 1.08, 0.84), weight: 0.1 },
  ]);
  return [{
    rawScore,
    confidence: back.confidence * 0.82,
    view: 'back',
    desc:
      rawScore >= 35
        ? 'Back-view asymmetry across shoulder height, arm flare, and waist shape suggests possible scapular winging.'
        : 'Back-view shoulder blade symmetry looks fairly balanced.',
    measurements: [
      fmt('Scapular asymmetry', back.scapularAsymmetryIndex),
      fmt('Elbow flare asymmetry', back.elbowFlareAsym * 100, '% torso'),
      fmt('Shoulder tilt', back.shoulderTiltDeg, '°'),
    ],
    metrics: {
      back_scapularAsymmetryIndex: round(back.scapularAsymmetryIndex),
      back_elbowFlareAsym: round(back.elbowFlareAsym, 3),
      back_shoulderTiltDeg: round(back.shoulderTiltDeg),
    },
  }];
}

function anteriorPelvicHits(metrics: ViewMetrics): RawHit[] {
  const hits: RawHit[] = [];
  const side = metrics.side;
  if (side) {
    const hipDeviation = Math.max(0, 176 - side.hipAngle);
    const rawScore = weightedScore([
      { score: directScore(hipDeviation, 4, 20), weight: 0.6 },
      { score: directScore(side.ribPelvisStackOffset, 0.04, 0.16), weight: 0.25 },
      { score: directScore(side.shoulderForwardOffset, 0.03, 0.12), weight: 0.15 },
    ]);
    hits.push({
      rawScore,
      confidence: side.confidence,
      view: 'side',
      desc:
        rawScore >= 35
          ? 'Side view shows the ribcage and pelvis drifting out of stack, which supports anterior pelvic tilt.'
          : 'Side-view hip and trunk stack looks fairly neutral.',
      measurements: [
        fmt('Hip deviation', hipDeviation, '°'),
        fmt('Rib-pelvis offset', side.ribPelvisStackOffset * 100, '% torso'),
        fmt('Shoulder-hip offset', side.shoulderForwardOffset * 100, '% torso'),
      ],
      metrics: {
        side_hipDeviationDeg: round(hipDeviation),
        side_ribPelvisStackOffset: round(side.ribPelvisStackOffset, 3),
        side_shoulderForwardOffset: round(side.shoulderForwardOffset, 3),
      },
    });
  }
  const front = metrics.front;
  if (front) {
    const rawScore = weightedScore([
      { score: directScore(front.hipTiltDeg, 1.2, 5.5), weight: 0.7 },
      { score: directScore(front.trunkLeanDeg, 1.5, 6), weight: 0.3 },
    ]);
    hits.push({
      rawScore: rawScore * 0.6,
      confidence: front.confidence * 0.8,
      view: 'front',
      desc:
        rawScore >= 30
          ? 'Front view suggests pelvic asymmetry, which can support a pelvic-tilt finding but does not prove true anterior tilt by itself.'
          : 'Front-view hips look fairly level.',
      measurements: [
        fmt('Hip tilt', front.hipTiltDeg, '°'),
        fmt('Trunk lean', front.trunkLeanDeg, '°'),
      ],
      metrics: {
        front_hipTiltDeg: round(front.hipTiltDeg),
        front_trunkLeanDeg: round(front.trunkLeanDeg),
      },
    });
  }
  return hits;
}

function roundedShouldersHits(metrics: ViewMetrics): RawHit[] {
  const hits: RawHit[] = [];
  const side = metrics.side;
  if (side) {
    const rawScore = weightedScore([
      { score: directScore(side.shoulderForwardOffset, 0.03, 0.13), weight: 0.55 },
      { score: directScore(side.earShoulderVerticalDeg, 4, 16), weight: 0.25 },
      { score: directScore(side.trunkLeanDeg, 1.5, 7), weight: 0.2 },
    ]);
    hits.push({
      rawScore,
      confidence: side.confidence,
      view: 'side',
      desc:
        rawScore >= 35
          ? 'Profile view shows the shoulder sitting forward of the torso stack, consistent with rounded shoulders.'
          : 'Shoulder position looks reasonably open in profile.',
      measurements: [
        fmt('Shoulder forward offset', side.shoulderForwardOffset * 100, '% torso'),
        fmt('Ear-shoulder angle', side.earShoulderVerticalDeg, '°'),
      ],
      metrics: {
        side_shoulderForwardOffset: round(side.shoulderForwardOffset, 3),
        side_earShoulderVerticalDeg: round(side.earShoulderVerticalDeg),
      },
    });
  }
  const front = metrics.front;
  if (front) {
    const rawScore = weightedScore([
      { score: inverseScore(front.shoulderWidthToHipWidth, 1.1, 0.82), weight: 0.5 },
      { score: directScore(front.armHangAsym, 0.02, 0.09), weight: 0.2 },
      { score: directScore(front.elbowFlareAsym, 0.02, 0.08), weight: 0.15 },
      { score: directScore(front.headCenterOffset, 0.02, 0.08), weight: 0.15 },
    ]);
    hits.push({
      rawScore,
      confidence: front.confidence * 0.9,
      view: 'front',
      desc:
        rawScore >= 30
          ? 'Front view shows a compressed shoulder line relative to the hips, which often accompanies rounded shoulders.'
          : 'Front shoulder line looks reasonably open.',
      measurements: [
        fmt('Shoulder/hip ratio', front.shoulderWidthToHipWidth),
        fmt('Arm hang asymmetry', front.armHangAsym * 100, '% torso'),
      ],
      metrics: {
        front_shoulderWidthToHipWidth: round(front.shoulderWidthToHipWidth, 3),
        front_armHangAsym: round(front.armHangAsym, 3),
      },
    });
  }
  return hits;
}

function kyphosisHits(metrics: ViewMetrics): RawHit[] {
  const hits: RawHit[] = [];
  const side = metrics.side;
  if (side) {
    const rawScore = weightedScore([
      { score: directScore(side.thoracicCurveAngle, 5, 24), weight: 0.55 },
      { score: directScore(side.shoulderForwardOffset, 0.03, 0.13), weight: 0.25 },
      { score: directScore(side.trunkLeanDeg, 1.5, 7), weight: 0.2 },
    ]);
    hits.push({
      rawScore,
      confidence: side.confidence,
      view: 'side',
      desc:
        rawScore >= 35
          ? 'Side view shows upper-back rounding through the head-shoulder-hip chain, which fits a kyphosis pattern.'
          : 'Thoracic posture looks fairly upright in profile.',
      measurements: [
        fmt('Thoracic deviation', side.thoracicCurveAngle, '°'),
        fmt('Shoulder forward offset', side.shoulderForwardOffset * 100, '% torso'),
      ],
      metrics: {
        side_thoracicCurveAngle: round(side.thoracicCurveAngle),
        side_shoulderForwardOffset: round(side.shoulderForwardOffset, 3),
      },
    });
  }
  const back = metrics.back;
  if (back) {
    const rawScore = weightedScore([
      { score: directScore(back.trunkLeanDeg, 1.5, 6.5), weight: 0.45 },
      { score: inverseScore(back.shoulderWidthToHipWidth, 1.08, 0.86), weight: 0.25 },
      { score: directScore(back.waistTriangleAsym, 0.025, 0.09), weight: 0.15 },
      { score: directScore(back.scapularAsymmetryIndex, 20, 55), weight: 0.15 },
    ]);
    hits.push({
      rawScore: rawScore * 0.8,
      confidence: back.confidence * 0.85,
      view: 'back',
      desc:
        rawScore >= 30
          ? 'Back view shows a rounded upper-body silhouette that supports the side-view kyphosis signal.'
          : 'Back-view upper-body line looks fairly neutral.',
      measurements: [
        fmt('Trunk lean', back.trunkLeanDeg, '°'),
        fmt('Shoulder/hip ratio', back.shoulderWidthToHipWidth),
      ],
      metrics: {
        back_trunkLeanDeg: round(back.trunkLeanDeg),
        back_shoulderWidthToHipWidth: round(back.shoulderWidthToHipWidth, 3),
      },
    });
  }
  return hits;
}

function unevenShouldersHits(metrics: ViewMetrics): RawHit[] {
  const hits: RawHit[] = [];
  const front = metrics.front;
  if (front) {
    const rawScore = weightedScore([
      { score: directScore(front.shoulderTiltDeg, 1.1, 4.8), weight: 0.6 },
      { score: directScore(front.hipTiltDeg, 1.2, 5), weight: 0.2 },
      { score: directScore(front.trunkLeanDeg, 1.5, 6), weight: 0.2 },
    ]);
    hits.push({
      rawScore,
      confidence: front.confidence,
      view: 'front',
      desc:
        rawScore >= 30
          ? 'Front view shows uneven shoulder height.'
          : 'Shoulders look fairly level from the front.',
      measurements: [
        fmt('Shoulder tilt', front.shoulderTiltDeg, '°'),
        fmt('Hip tilt', front.hipTiltDeg, '°'),
        fmt('Trunk lean', front.trunkLeanDeg, '°'),
      ],
      metrics: {
        front_shoulderTiltDeg: round(front.shoulderTiltDeg),
        front_hipTiltDeg: round(front.hipTiltDeg),
        front_trunkLeanDeg: round(front.trunkLeanDeg),
      },
    });
  }
  const back = metrics.back;
  if (back) {
    const rawScore = weightedScore([
      { score: directScore(back.shoulderTiltDeg, 1.1, 4.8), weight: 0.6 },
      { score: directScore(back.hipTiltDeg, 1.2, 5), weight: 0.2 },
      { score: directScore(back.trunkLeanDeg, 1.5, 6), weight: 0.2 },
    ]);
    hits.push({
      rawScore,
      confidence: back.confidence,
      view: 'back',
      desc:
        rawScore >= 30
          ? 'Back view shows a noticeable shoulder-line tilt.'
          : 'Shoulders look fairly level from behind.',
      measurements: [
        fmt('Shoulder tilt', back.shoulderTiltDeg, '°'),
        fmt('Hip tilt', back.hipTiltDeg, '°'),
      ],
      metrics: {
        back_shoulderTiltDeg: round(back.shoulderTiltDeg),
        back_hipTiltDeg: round(back.hipTiltDeg),
      },
    });
  }
  return hits.map(hit => ({
    ...hit,
    desc: hit.rawScore >= 30
      ? `${hit.view === 'front' ? 'Front' : 'Back'} view shows uneven shoulder height.`
      : hit.desc,
  }));
}

const PROBLEMS: ProblemDef[] = [
  {
    id: 'forward-head',
    name: 'Forward Head Posture',
    bodyRegion: 'neck',
    mapLabel: 'Forward head',
    bestView: 'side',
    showOnViews: ['side', 'front'],
    buildHits: forwardHeadHits,
  },
  {
    id: 'winging-scapula',
    name: 'Winging Scapula',
    bodyRegion: 'shoulders',
    mapLabel: 'Winging scapula',
    bestView: 'back',
    showOnViews: ['back'],
    buildHits: wingingScapulaHits,
  },
  {
    id: 'anterior-pelvic',
    name: 'Anterior Pelvic Tilt',
    bodyRegion: 'pelvis',
    mapLabel: 'Pelvic tilt',
    bestView: 'side',
    showOnViews: ['side', 'front'],
    buildHits: anteriorPelvicHits,
  },
  {
    id: 'rounded-shoulders',
    name: 'Rounded Shoulders',
    bodyRegion: 'shoulders',
    mapLabel: 'Rounded shoulders',
    bestView: 'side',
    showOnViews: ['side', 'front'],
    buildHits: roundedShouldersHits,
  },
  {
    id: 'kyphosis',
    name: 'Kyphosis',
    bodyRegion: 'upperBack',
    mapLabel: 'Kyphosis',
    bestView: 'side',
    showOnViews: ['side', 'back'],
    buildHits: kyphosisHits,
  },
  {
    id: 'uneven-shoulders',
    name: 'Uneven Shoulders',
    bodyRegion: 'shoulders',
    mapLabel: 'Uneven shoulders',
    bestView: 'front',
    showOnViews: ['front', 'back'],
    buildHits: unevenShouldersHits,
  },
];

export function analyzeThreePhotos(params: {
  front: Keypoint[];
  side: Keypoint[];
  back: Keypoint[];
}): ScanReport {
  const { front, side, back } = params;
  const metrics = buildMetrics(front, side, back);
  const problems = PROBLEMS
    .map(def => mergeProblem(def, def.buildHits(metrics)))
    .filter(Boolean) as PostureProblem[];

  const order: Record<RiskCategory, number> = { high: 0, medium: 1, low: 2 };
  problems.sort((a, b) => order[a.riskCategory] - order[b.riskCategory] || b.score - a.score);

  return {
    postureLevel: 'beginner',
    severityBand: severityBandFromProblems(problems),
    problems,
    allKeypoints: { front, side, back },
    timestamp: Date.now(),
  };
}

function severityBandFromProblems(problems: PostureProblem[]): SeverityBand {
  if (problems.some(p => p.riskCategory === 'high')) return 'severe';
  if (problems.some(p => p.riskCategory === 'medium')) return 'moderate';
  return 'mild';
}

export interface UserContext {
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  hasExistingPain: boolean;
  dailyScreenHours: number;
}

export function determineLevel(report: ScanReport, user: UserContext): PostureLevel {
  const significant = report.problems.filter(p => p.score >= 20);
  const count = significant.length;
  const hasHigh = significant.some(p => p.riskCategory === 'high');
  const medCount = significant.filter(p => p.riskCategory === 'medium').length;
  let riskBoost = 0;
  if (user.activityLevel === 'sedentary' || user.activityLevel === 'light') riskBoost++;
  if (user.hasExistingPain) riskBoost++;
  if (user.dailyScreenHours >= 8) riskBoost++;

  let level: PostureLevel;
  if (hasHigh || count >= 3 || (count >= 2 && riskBoost >= 2)) level = 'beginner';
  else if (count >= 2 || medCount >= 1 || (count === 1 && riskBoost >= 2)) level = 'intermediate';
  else if (count === 0 || (count === 1 && riskBoost === 0)) level = 'advanced';
  else level = 'intermediate';

  report.postureLevel = level;
  return level;
}

export const RISK_INFO: Record<RiskCategory, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High risk', color: '#E68C33', bgColor: 'rgba(230,140,51,0.1)' },
  medium: { label: 'Medium risk', color: '#D9B84C', bgColor: 'rgba(217,184,76,0.1)' },
  low: { label: 'Low risk', color: '#3DA878', bgColor: 'rgba(61,168,120,0.1)' },
};

export const LEVEL_INFO: Record<
  PostureLevel,
  { label: string; tagline: string; description: string; color: string; bgColor: string }
> = {
  beginner: {
    label: 'Beginner',
    tagline: 'Foundation building',
    description: 'Your scan shows several moderate or high-risk posture patterns that need attention.',
    color: '#E68C33',
    bgColor: 'rgba(230,140,51,0.1)',
  },
  intermediate: {
    label: 'Intermediate',
    tagline: 'Refining alignment',
    description: 'You have a decent baseline with a few moderate posture patterns to improve.',
    color: '#D9B84C',
    bgColor: 'rgba(217,184,76,0.1)',
  },
  advanced: {
    label: 'Advanced',
    tagline: 'Maintenance mode',
    description: 'Only low-risk posture findings were detected. Focus on maintenance and consistency.',
    color: '#3DA878',
    bgColor: 'rgba(61,168,120,0.1)',
  },
};

export const VIEW_LABELS: Record<IntendedView, string> = { front: 'Front', side: 'Side', back: 'Back' };

export const BODY_REGION_LABELS: Record<string, string> = {
  neck: 'Neck',
  shoulders: 'Shoulders',
  upperBack: 'Upper back',
  pelvis: 'Pelvis',
  knees: 'Knees',
};
