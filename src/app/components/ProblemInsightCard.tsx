import React from 'react';
import { Dumbbell, MonitorUp, StretchHorizontal } from 'lucide-react';

export interface ProblemInsightCardProps {
  /** When false (default), only the grid + action plan show — hero already has title. */
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  triggers: string;
  impact: string;
  stretch: string;
  strengthen: string;
  habits: string;
}

/** Minimal posture insight card — matches Figma Make “Create-Minimalistic-Card” layout. */
const ProblemInsightCard: React.FC<ProblemInsightCardProps> = ({
  showHeader = false,
  title,
  subtitle,
  triggers,
  impact,
  stretch,
  strengthen,
  habits,
}) => {
  const planRows: { icon: React.ReactNode; label: string; detail: string }[] = [
    { icon: <StretchHorizontal style={{ width: 18, height: 18 }} strokeWidth={2.5} />, label: 'Stretch', detail: stretch },
    { icon: <Dumbbell style={{ width: 18, height: 18 }} strokeWidth={2.5} />, label: 'Strengthen', detail: strengthen },
    { icon: <MonitorUp style={{ width: 18, height: 18 }} strokeWidth={2.5} />, label: 'Habits', detail: habits },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        marginLeft: 'auto',
        marginRight: 'auto',
        background: '#1C1C1E',
        borderRadius: 24,
        padding: 20,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'var(--font-body), system-ui, sans-serif',
      }}
    >
      {showHeader && (title || subtitle) && (
        <div style={{ marginBottom: 20 }}>
          {title && (
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ fontSize: 15, color: '#a3a3a3', marginTop: title ? 4 : 0, marginBottom: 0, lineHeight: 1.35 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div
            style={{
              background: 'rgba(42,42,44,0.8)',
              borderRadius: 18,
              padding: 16,
              border: '1px solid rgba(244,63,94,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#f43f5e',
                  boxShadow: '0 0 8px rgba(244,63,94,0.5)',
                }}
              />
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Triggers</h3>
            </div>
            <p style={{ fontSize: 13, color: '#a3a3a3', lineHeight: 1.45, margin: 0 }}>{triggers}</p>
          </div>

          <div
            style={{
              background: 'rgba(42,42,44,0.8)',
              borderRadius: 18,
              padding: 16,
              border: '1px solid rgba(245,158,11,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#f59e0b',
                  boxShadow: '0 0 8px rgba(245,158,11,0.5)',
                }}
              />
              <h3 style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Impact</h3>
            </div>
            <p style={{ fontSize: 13, color: '#a3a3a3', lineHeight: 1.45, margin: 0 }}>{impact}</p>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(42,42,44,0.8)',
            borderRadius: 18,
            padding: 16,
            border: '1px solid rgba(16,185,129,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16,185,129,0.5)',
              }}
            />
            <h3 style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Action Plan</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planRows.map((r, i) => (
              <React.Fragment key={r.label}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ marginTop: 2, color: 'rgba(16,185,129,0.85)', flexShrink: 0 }}>{r.icon}</div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.9)', display: 'block' }}>{r.label}</span>
                    <span style={{ fontSize: 13, color: '#a3a3a3', lineHeight: 1.45 }}>{r.detail}</span>
                  </div>
                </div>
                {i < planRows.length - 1 && (
                  <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.04)', marginLeft: 30 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemInsightCard;
