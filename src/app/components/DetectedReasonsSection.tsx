import React from 'react';
import { useNavigate } from 'react-router-dom';
import { postureProblems, type PostureProblem as AppPostureProblem } from '../data/postureData';
import {
  getHighlightedProblems,
  SCAN_TO_APP_PROBLEM,
  VIEW_LABELS,
  type PostureProblem as ScanFinding,
  type PostureReport,
} from '../services/PostureAnalysisEngine';

const T = {
  surface: '#141414',
  border: 'rgba(255,255,255,0.10)',
  text: '#EDEDED',
  text2: 'rgba(160,160,155,1)',
  text3: 'rgba(102,102,100,1)',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

/** Thumbnail width for reason illustration; ~17.5% larger frame to show full figures. */
const REASON_IMG_MAX_PX = 127;

interface DetectedReasonsSectionProps {
  report: PostureReport;
  maxCards?: number;
}

function reasonImageFor(data: AppPostureProblem): string | undefined {
  return data.reasonImage ?? data.cardImage;
}

function hasRenderableRow(data: AppPostureProblem): boolean {
  return Boolean(reasonImageFor(data) || getCompactCauseLines(data).length || getOneEffectLine(data));
}

/** Short cause lines — no long narrative blocks. */
function getCompactCauseLines(data: AppPostureProblem): string[] {
  if (data.premiumLayout?.whyItHappens?.length) {
    return data.premiumLayout.whyItHappens.slice(0, 3).map((item) => {
      const t = `${item.bold?.trim() ?? ''}${item.text ? ` ${item.text.trim()}` : ''}`.trim();
      return t.length > 90 ? `${t.slice(0, 87)}…` : t;
    });
  }
  if (data.reasonLead) {
    const lines = data.reasonLead.split('\n').map((l) => l.trim()).filter(Boolean);
    const hoursIdx = lines.findIndex((l) => l.toLowerCase().includes('hours'));
    const habits =
      hoursIdx >= 0
        ? lines
            .slice(hoursIdx + 1)
            .filter(
              (l) =>
                !l.includes('👉') &&
                !l.toLowerCase().startsWith('most people') &&
                !l.toLowerCase().startsWith('over time'),
            )
        : [];
    const cleaned = habits.filter((h) => h.length < 90).slice(0, 4);
    if (cleaned.length) return cleaned;
  }
  const first = data.description
    ?.split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith('👉'));
  if (first) return [first.length > 100 ? `${first.slice(0, 97)}…` : first];
  return [];
}

function getOneEffectLine(data: AppPostureProblem): string | null {
  if (data.reasonRest) {
    const lines = data.reasonRest
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.includes('👉') && !/^over time/i.test(l));
    const line = lines.find((l) => l.length > 8);
    if (line) return line.length > 100 ? `${line.slice(0, 97)}…` : line;
  }
  if (data.premiumLayout?.whatChanges?.[0]) {
    const w = data.premiumLayout.whatChanges[0];
    const s = `${w.bold} ${w.text}`.trim();
    return s.length > 100 ? `${s.slice(0, 97)}…` : s;
  }
  return null;
}

const DetectedReasonsSection: React.FC<DetectedReasonsSectionProps> = ({
  report,
  maxCards = 6,
}) => {
  const navigate = useNavigate();
  const highlights = getHighlightedProblems(report.problems, maxCards);
  const seenAppIds = new Set<string>();
  const rows: { finding: ScanFinding; data: AppPostureProblem }[] = [];

  for (const finding of highlights) {
    const appId = SCAN_TO_APP_PROBLEM[finding.id];
    if (!appId || seenAppIds.has(appId)) continue;
    const data = postureProblems.find((p) => p.id === appId);
    if (!data || !hasRenderableRow(data)) continue;
    seenAppIds.add(appId);
    rows.push({ finding, data });
  }

  if (rows.length === 0) return null;

  return (
    <div style={{ marginBottom: 24, animation: 'slideUp 0.4s ease 0.07s both' }}>
      <div
        style={{
          background: T.surface,
          borderRadius: 16,
          padding: 16,
          border: `1px solid ${T.border}`,
          fontFamily: T.font,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: T.text3,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Detected reasons
        </div>
        <p
          style={{
            fontSize: 13,
            color: T.text2,
            lineHeight: 1.45,
            margin: '0 0 14px',
          }}
        >
          Issues from your scan, with common causes and what tends to happen over time — tap a row for exercises.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {rows.map(({ finding, data }, i) => {
            const title = finding.mapLabel ?? finding.name;
            const meta = `${finding.severity.charAt(0).toUpperCase()}${finding.severity.slice(1)} · ${VIEW_LABELS[finding.dominantView]}`;
            const img = reasonImageFor(data);
            const causes = getCompactCauseLines(data);
            const effect = getOneEffectLine(data);

            return (
              <button
                key={finding.id}
                type="button"
                onClick={() => navigate(`/problem/${data.id}`)}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.border}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: T.font,
                }}
              >
                {img ? (
                  <div
                    style={{
                      flexShrink: 0,
                      width: REASON_IMG_MAX_PX,
                      height: REASON_IMG_MAX_PX,
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#0A0A0A',
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      draggable={false}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ width: REASON_IMG_MAX_PX, flexShrink: 0 }} aria-hidden />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                      marginBottom: 4,
                      lineHeight: 1.25,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: T.text3,
                      marginBottom: 8,
                    }}
                  >
                    {meta}
                  </div>
                  {causes.length > 0 && (
                    <ul
                      style={{
                        margin: '0 0 8px',
                        paddingLeft: 18,
                        fontSize: 12,
                        color: T.text2,
                        lineHeight: 1.45,
                      }}
                    >
                      {causes.map((line, j) => (
                        <li key={j} style={{ marginBottom: 3 }}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                  {effect ? (
                    <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600, color: T.text2 }}>Over time: </span>
                      {effect}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetectedReasonsSection;
