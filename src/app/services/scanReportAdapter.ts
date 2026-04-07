/**
 * Converts MoveNet ScanReport (v2) into legacy PostureReport for existing UI.
 */
import type { PostureReport as LegacyReport, PostureProblem as LegacyProblem } from './PostureAnalysisEngine';
import { summarizeConfidence, generateRecommendations } from './PostureAnalysisEngine';
import type { ScanReport } from './PostureAnalysisEngineV2';
import type { RiskCategory } from '../types/assessment';

function riskToSeverity(r: RiskCategory): LegacyProblem['severity'] {
  switch (r) {
    case 'low':
      return 'mild';
    case 'medium':
      return 'moderate';
    case 'high':
      return 'severe';
    default:
      return 'mild';
  }
}

export function scanReportToPostureReport(scan: ScanReport): LegacyReport {
  const problems: LegacyProblem[] = scan.problems.map((p) => {
    const { confidenceLevel, confidenceLabel } = summarizeConfidence(
      p.detectedInViews,
      p.dominantView,
    );
    return {
      id: p.id,
      name: p.name,
      severity: riskToSeverity(p.riskCategory),
      score: p.score,
      bodyRegion: p.bodyRegion,
      dominantView: p.dominantView,
      healthScore: Math.max(0, 100 - p.score),
      displayPercent: Math.max(0, 100 - p.score),
      confidenceLevel,
      confidenceLabel,
      description: p.description,
      details: p.description,
      mapLabel: p.mapLabel,
      mapPanels: p.detectedInViews,
      riskCategory: p.riskCategory,
    };
  });

  const avg = problems.length ? problems.reduce((s, p) => s + p.score, 0) / problems.length : 0;

  return {
    overallScore: Math.max(0, Math.round(100 - avg)),
    problems: problems.sort((a, b) => b.score - a.score),
    viewType: 'side',
    recommendations: generateRecommendations(problems),
    timestamp: scan.timestamp,
    viewsCombined: ['front', 'side', 'back'],
  };
}
