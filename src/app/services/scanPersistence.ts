/**
 * Local scan log — persists a compact history of scans to localStorage.
 * All scan data lives on-device; there is no cloud component.
 */
import type { ScanReport } from './PostureAnalysisEngineV2';

const LOCAL_LOG_KEY = 'posturefix_local_scan_log';

export interface LocalScanEntry {
  savedAt: number;
  postureLevel: string;
  severityBand: string;
  problemIds: string[];
  riskSummary: { high: number; medium: number; low: number };
  modelVersion: string;
}

export function appendLocalScanLog(entry: LocalScanEntry): void {
  try {
    const prev = JSON.parse(localStorage.getItem(LOCAL_LOG_KEY) || '[]') as LocalScanEntry[];
    prev.unshift(entry);
    localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(prev.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

export function buildLocalScanEntry(scan: ScanReport): LocalScanEntry {
  return {
    savedAt: Date.now(),
    postureLevel: scan.postureLevel,
    severityBand: scan.severityBand,
    problemIds: scan.problems.map((p) => p.id),
    riskSummary: {
      high: scan.problems.filter((p) => p.riskCategory === 'high').length,
      medium: scan.problems.filter((p) => p.riskCategory === 'medium').length,
      low: scan.problems.filter((p) => p.riskCategory === 'low').length,
    },
    modelVersion: 'movenet-thunder-v4',
  };
}
