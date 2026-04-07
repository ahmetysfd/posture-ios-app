import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postureProblems } from '../data/postureData';
import { loadUserProfile } from '../services/UserProfile';
import { loadDailyProgram } from '../services/DailyProgram';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const T = {
  bg: '#0A0A0A', surface: '#141414', border: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)', text: '#EDEDED',
  text2: 'rgba(160,160,155,1)', text3: 'rgba(102,102,100,1)',
  gold: '#D9B84C', font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

// Circular progress ring for the program card header
function ProgressRing({ progress, done }: { progress: number; done: boolean }) {
  const r = 11;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, progress));
  return (
    <div style={{ width: 28, height: 28, flexShrink: 0, position: 'relative' }}>
      <svg width={28} height={28} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={14} cy={14} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
        {/* Progress arc */}
        <circle
          cx={14} cy={14} r={r} fill="none"
          stroke={done ? T.gold : 'rgba(217,184,76,0.7)'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      {done && (
        <svg
          width={10} height={10}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.gold}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(0deg)' }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const hasScan = Boolean(profile?.scanTimestamp && profile.scanTimestamp > 0);
  const program = loadDailyProgram();
  const [expanded, setExpanded] = useState(false);

  const totalEx = program?.exercises.length ?? 0;
  const completedEx = program?.exercises.filter(e => e.completed).length ?? 0;
  const allDone = totalEx > 0 && completedEx === totalEx;
  const progress = totalEx > 0 ? completedEx / totalEx : 0;
  const hasProgram = Boolean(program && totalEx > 0);

  return (
    <Layout>
      <div style={{ padding: '0 20px', fontFamily: T.font }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ paddingTop: 52, marginBottom: 24, animation: 'fadeIn 0.5s ease' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: T.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Good {getTimeOfDay()}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: T.text, letterSpacing: '-0.02em' }}>
            PostureFix
          </h1>
        </div>

        {/* ── No scan CTA ─────────────────────────────────────── */}
        {!hasScan && (
          <div style={{
            background: T.surface, borderRadius: 14, padding: 16,
            border: `1px solid ${T.border2}`, marginBottom: 16,
            animation: 'slideUp 0.4s ease 0.06s both',
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 6 }}>
              No scan yet
            </div>
            <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginBottom: 12 }}>
              Take your first body scan to personalize your posture report and body map.
            </p>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              style={{
                width: '100%', padding: 12, borderRadius: 10,
                background: T.gold, color: '#0A0A0A',
                fontSize: 13, fontWeight: 600, border: 'none',
                cursor: 'pointer', fontFamily: T.font,
              }}
            >
              Start body scan
            </button>
          </div>
        )}

        {/* ── Daily Program Card ──────────────────────────────── */}
        {hasProgram && (
          <div style={{ marginBottom: 24, animation: 'slideUp 0.4s ease 0.04s both' }}>

            {/* Collapsed header — always visible, tap to expand */}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              style={{
                width: '100%',
                background: T.surface,
                border: `1px solid ${T.border2}`,
                borderRadius: expanded ? '14px 14px 0 0' : 14,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', fontFamily: T.font,
                transition: 'border-radius 0.2s ease',
              }}
            >
              <ProgressRing progress={progress} done={allDone} />

              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>
                  Daily Program
                  {allDone && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: T.gold, marginLeft: 8, letterSpacing: '0.02em' }}>
                      Complete
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>
                  {program!.totalDurationMin} min · {totalEx} exercises
                  {completedEx > 0 && !allDone && (
                    <span style={{ color: 'rgba(217,184,76,0.7)', marginLeft: 6 }}>
                      · {completedEx}/{totalEx} done
                    </span>
                  )}
                </div>
              </div>

              {/* Chevron */}
              <svg
                width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.3)" strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Expanded body */}
            {expanded && (
              <div style={{
                background: T.surface,
                border: `1px solid ${T.border2}`,
                borderTop: `1px solid ${T.border}`,
                borderRadius: '0 0 14px 14px',
                overflow: 'hidden',
              }}>
                {/* Exercise list — sorted by primary posture issue */}
                {[...program!.exercises]
                  .sort((a, b) => (a.targetProblemLabels[0] ?? '').localeCompare(b.targetProblemLabels[0] ?? ''))
                  .map((ex, i) => (
                  <div
                    key={ex.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px',
                      borderBottom: i < totalEx - 1 ? `1px solid ${T.border}` : 'none',
                      opacity: ex.completed ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>
                      {ex.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: T.text,
                        textDecoration: ex.completed ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {ex.name}
                      </div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>
                        {ex.displayReps}
                      </div>
                    </div>
                    {ex.completed && (
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        background: T.gold, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                {/* CTA */}
                <div style={{ padding: '12px 16px' }}>
                  {allDone ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '12px 0',
                    }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.gold }}>
                        All done for today
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/scan/program')}
                      style={{
                        width: '100%', padding: '13px 0',
                        background: T.gold, color: '#0A0A0A',
                        fontSize: 14, fontWeight: 600,
                        borderRadius: 10, border: 'none',
                        cursor: 'pointer', fontFamily: T.font,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {completedEx > 0 ? 'Continue program' : 'Start program'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Common Problems ─────────────────────────────────── */}
        <div style={{ fontSize: 11, fontWeight: 500, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, animation: 'slideUp 0.4s ease 0.1s both' }}>
          Common problems
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {postureProblems.map((problem, i) => (
            <div key={problem.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10, animation: `slideUp 0.4s ease ${0.14 + i * 0.05}s both` }}>
              <button
                type="button"
                onClick={() => navigate(`/problem/${problem.id}`)}
                aria-label={problem.title}
                style={{
                  position: 'relative', background: T.surface,
                  border: `1px solid ${T.border}`, borderRadius: 14,
                  padding: 0, overflow: 'hidden', cursor: 'pointer',
                  display: 'block', lineHeight: 0,
                }}
              >
                <div style={{ height: 176, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={problem.cardImage} alt="" draggable={false}
                    style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', objectPosition: problem.cardImageObjectPosition ?? 'center', display: 'block' }}
                  />
                </div>
              </button>
              <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.25, padding: '0 2px' }}>
                {problem.title}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '8px 0 16px', animation: 'slideUp 0.4s ease 0.5s both' }}>
          <span style={{ fontSize: 12, color: T.text3, fontWeight: 400 }}>
            5 minutes a day for lasting posture change
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
