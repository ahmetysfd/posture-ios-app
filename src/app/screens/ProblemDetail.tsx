import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import YoutubeModal from '../components/YoutubeModal';
import { postureProblems } from '../data/postureData';

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problem = postureProblems.find(p => p.id === id);
  const [youtube, setYoutube] = useState<{ url: string; title: string } | null>(null);

  if (!problem) {
    return <Layout><div style={{ padding: 40, textAlign: 'center' }}>Not found</div></Layout>;
  }

  return (
    <Layout hideNav>
      <div>
        {/* Hero */}
        <div style={{
          background: problem.cardBg,
          padding: '48px 20px 28px',
          position: 'relative',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: `${problem.cardBorder}40` }} />

          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)',
            fontSize: 14, fontWeight: 600, color: 'var(--color-text)',
            marginBottom: 24, cursor: 'pointer', border: 'none', position: 'relative', zIndex: 2,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>

          <div style={{ position: 'relative', zIndex: 2, animation: 'slideUp 0.4s ease' }}>
            <div style={{
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 14,
              border: `1px solid ${problem.cardBorder}`,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            }}>
              <img
                src={problem.cardImage}
                alt=""
                style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
              />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', marginTop: 4, marginBottom: 0, letterSpacing: '-0.02em' }}>{problem.title}</h1>
          </div>
        </div>

        <div style={{ padding: '24px 20px' }}>
          {/* Exercises */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, animation: 'slideUp 0.4s ease 0.1s both' }}>Exercises</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideUp 0.4s ease 0.14s both' }}>
            {problem.exerciseList.map((ex, i) => {
              const rowStyle: React.CSSProperties = {
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--color-surface)', borderRadius: 16, padding: 14,
                border: '1px solid var(--color-border-light)',
                width: '100%',
                textAlign: 'left',
                transition: 'box-shadow 0.2s ease',
              };
              const body = (
                <>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: problem.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, border: `1px solid ${problem.cardBorder}` }}>{ex.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 2 }}>
                      {ex.duration}s
                      {ex.youtubeUrl ? ' · Tap for video' : ''}
                    </div>
                  </div>
                  {ex.youtubeUrl ? (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
                    </div>
                  ) : (
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: problem.cardBg, color: 'var(--color-text-sec)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, border: `1px solid ${problem.cardBorder}`, flexShrink: 0 }}>{i + 1}</div>
                  )}
                </>
              );
              if (ex.youtubeUrl) {
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setYoutube({ url: ex.youtubeUrl!, title: ex.name })}
                    style={{
                      ...rowStyle,
                      cursor: 'pointer',
                      font: 'inherit',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                    }}
                  >
                    {body}
                  </button>
                );
              }
              return (
                <div key={ex.id} style={{ ...rowStyle, cursor: 'default' }}>
                  {body}
                </div>
              );
            })}
          </div>

          {/* Reason */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginTop: 16, marginBottom: 0, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.18s both' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Reason</h3>
            {problem.reasonImage && problem.reasonLead != null && problem.reasonRest != null ? (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <p style={{
                    flex: '1 1 160px',
                    minWidth: 0,
                    margin: 0,
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: 'var(--color-text-sec)',
                    whiteSpace: 'pre-line',
                  }}>
                    {problem.reasonLead}
                  </p>
                  <img
                    src={problem.reasonImage}
                    alt=""
                    draggable={false}
                    style={{
                      width: 295,
                      maxWidth: '100%',
                      flexShrink: 0,
                      borderRadius: 12,
                      objectFit: 'contain',
                      alignSelf: 'flex-start',
                      background: '#FAFAFA',
                    }}
                  />
                </div>
                <p style={{
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  color: 'var(--color-text-sec)',
                  whiteSpace: 'pre-line',
                  margin: '14px 0 0',
                }}>
                  {problem.reasonRest}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)', whiteSpace: 'pre-line', margin: 0 }}>{problem.description}</p>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginTop: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.22s both' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>💡 Tips</h3>
            {problem.tips.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < problem.tips.length - 1 ? 8 : 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</div>
                <span style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={() => navigate(`/exercise/${problem.id}`)} style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: 'var(--color-primary)', color: 'white', fontSize: 16, fontWeight: 700,
            fontFamily: 'var(--font-display)', marginTop: 24, marginBottom: 24,
            boxShadow: '0 8px 24px rgba(79,70,229,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', border: 'none',
          }}>
            Start Exercises
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
          </button>
        </div>
      </div>
      <YoutubeModal
        open={!!youtube}
        watchUrl={youtube?.url ?? ''}
        title={youtube?.title}
        onClose={() => setYoutube(null)}
      />
    </Layout>
  );
};

export default ProblemDetail;
