import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PersonalizedProgram, PostureReport } from '../services/PostureAnalysisEngine';
import { SCAN_TO_APP_PROBLEM } from '../services/PostureAnalysisEngine';

const PersonalizedProgramScreen: React.FC = () => {
  const navigate = useNavigate();
  const [program, setProgram] = useState<PersonalizedProgram | null>(null);
  const [routines, setRoutines] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem('personalizedProgram');
    if (raw) setProgram(JSON.parse(raw));
    else navigate('/scan');
    const repRaw = sessionStorage.getItem('postureReport');
    if (repRaw) {
      try {
        const rep = JSON.parse(repRaw) as PostureReport;
        const hits = rep.problems.filter(p => p.score >= 15 && SCAN_TO_APP_PROBLEM[p.id]);
        setRoutines(hits.map(p => ({ id: p.id, name: p.name })));
      } catch { /* ignore */ }
    }
  }, [navigate]);

  if (!program) return null;

  const priColor = (p: string) =>
    p === 'high' ? 'var(--color-danger)' : p === 'medium' ? 'var(--color-warning)' : 'var(--color-primary-light)';
  const priBg = (p: string) =>
    p === 'high' ? 'rgba(239,68,68,0.12)' : p === 'medium' ? 'rgba(251,191,36,0.12)' : 'rgba(229,53,53,0.1)';

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: 'var(--color-bg)', fontFamily: 'var(--font-body)',
    }}>
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate('/scan/results')}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Your plan</h1>
      </div>

      <div style={{ padding: '0 20px 28px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          borderRadius: 22,
          padding: 22,
          marginBottom: 18,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{program.title}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14 }}>{program.dailyGoal}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
                ⏱ {program.totalDuration}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
                {program.exercises.length} moves
              </span>
            </div>
          </div>
        </div>

        {program.focusAreas.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Focus</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {program.focusAreas.map((area, i) => (
                <span key={i} style={{
                  fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 10,
                  background: 'rgba(229,53,53,0.12)', color: 'var(--color-primary)', border: '1px solid rgba(229,53,53,0.25)',
                }}>{area}</span>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tert)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Exercises</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
          {program.exercises.map((ex, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)',
              borderRadius: 18,
              padding: 16,
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{ex.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{ex.name}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tert)' }}>{ex.duration}s</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: priBg(ex.priority), color: priColor(ex.priority),
                      textTransform: 'uppercase',
                    }}>{ex.priority}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 8 }}>{ex.targetProblem}</div>
              {ex.instructions.map((step, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tert)', width: 18 }}>{j + 1}.</span>
                  <span style={{ fontSize: 12.5, color: 'var(--color-text-sec)', lineHeight: 1.4 }}>{step}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {routines.length > 0 && (
          <>
            <p style={{ fontSize: 12, color: 'var(--color-text-tert)', marginBottom: 10, lineHeight: 1.5 }}>
              Open a full routine with videos in the app:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {routines.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/problem/${SCAN_TO_APP_PROBLEM[r.id]}`)}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  → {r.name}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: 'var(--color-primary)', color: '#fff', fontSize: 16, fontWeight: 700,
            border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-button)', marginBottom: 10,
          }}
        >
          Back to home
        </button>
        <button
          type="button"
          onClick={() => navigate('/scan')}
          style={{
            width: '100%', padding: 14, borderRadius: 18,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: 14, fontWeight: 600,
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}
        >
          New scan
        </button>
      </div>
    </div>
  );
};

export default PersonalizedProgramScreen;
