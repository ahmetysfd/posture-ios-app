import React from 'react';

export interface ProblemInsightCardProps {
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  triggers?: string;
  impact?: string;
  stretch?: string;
  strengthen?: string;
  habits?: string;
  /** Short tagline shown at the top of the card */
  heroSubtitle?: string;
  /** "Does this sound familiar?" bullet points */
  familiarSymptoms?: string[];
  /** "Why it happens" paragraph */
  whyItHappensText?: string;
}

const ProblemInsightCard: React.FC<ProblemInsightCardProps> = ({
  showHeader = false,
  title,
  subtitle,
  heroSubtitle,
  familiarSymptoms,
  whyItHappensText,
}) => {
  const hasNewContent = heroSubtitle || (familiarSymptoms && familiarSymptoms.length > 0) || whyItHappensText;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'var(--font-body), system-ui, sans-serif',
      }}
    >
      {showHeader && (title || subtitle) && (
        <div style={{ marginBottom: 4 }}>
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

      {hasNewContent && (
        <div
          style={{
            background: '#1C1C1E',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Hero subtitle */}
          {heroSubtitle && (
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: familiarSymptoms || whyItHappensText ? '1px solid rgba(255,255,255,0.05)' : undefined,
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.45,
                  margin: 0,
                  fontStyle: 'italic',
                  letterSpacing: '-0.01em',
                }}
              >
                "{heroSubtitle}"
              </p>
            </div>
          )}

          {/* Does this sound familiar? */}
          {familiarSymptoms && familiarSymptoms.length > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderBottom: whyItHappensText ? '1px solid rgba(255,255,255,0.05)' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#f43f5e',
                    boxShadow: '0 0 8px rgba(244,63,94,0.5)',
                    flexShrink: 0,
                  }}
                />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Does this sound familiar?
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {familiarSymptoms.map((symptom, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: 'rgba(244,63,94,0.12)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5.5L4 7.5L8 3" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, color: '#a3a3a3', lineHeight: 1.5 }}>{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why it happens */}
          {whyItHappensText && (
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#f59e0b',
                    boxShadow: '0 0 8px rgba(245,158,11,0.5)',
                    flexShrink: 0,
                  }}
                />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Why it happens
                </h3>
              </div>
              <p style={{ fontSize: 14, color: '#a3a3a3', lineHeight: 1.65, margin: 0 }}>
                {whyItHappensText}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ProblemInsightCard;
