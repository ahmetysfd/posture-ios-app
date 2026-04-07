import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postureProblems } from '../data/postureData';
import {
  saveUserProfile,
  determinePostureLevel,
  levelToDefaultDifficulty,
} from '../services/UserProfile';
import { generateAndStoreDailyProgram } from '../services/DailyProgram';

const T = {
  bg: '#0A0A0A',
  surface: '#141414',
  border: 'rgba(255,255,255,0.08)',
  text: '#EDEDED',
  text2: 'rgba(160,160,155,1)',
  text3: 'rgba(102,102,100,1)',
  gold: '#D9B84C',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const ManualSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const confirm = () => {
    const level = determinePostureLevel(selected, selected.length >= 3 ? 'moderate' : 'mild', {});
    const difficulty = levelToDefaultDifficulty(level);
    const profile = saveUserProfile({
      detectedProblems: selected,
      problemCount: selected.length,
      postureLevel: level,
      exerciseDifficulty: difficulty,
      scanTimestamp: Date.now(),
      onboardingComplete: true,
    });
    generateAndStoreDailyProgram(profile);
    navigate('/');
  };

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: T.surface, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>
            Select your issues
          </h1>
          <p style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>
            Pick all that apply to you
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: '8px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {postureProblems.map(problem => {
          const isSelected = selected.includes(problem.id);
          return (
            <button
              key={problem.id}
              type="button"
              onClick={() => toggle(problem.id)}
              style={{
                textAlign: 'left', padding: 0, borderRadius: 18, overflow: 'hidden',
                background: isSelected ? 'rgba(217,184,76,0.07)' : T.surface,
                border: `1.5px solid ${isSelected ? T.gold : T.border}`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Checkmark */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}

              <div style={{ padding: '12px 12px 0' }}>
                <span style={{ fontSize: 22, lineHeight: 1, display: 'block', marginBottom: 8 }}>{problem.emoji}</span>
                <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${problem.cardBorder}44` }}>
                  <img
                    src={problem.cardImage}
                    alt=""
                    draggable={false}
                    style={{ width: '100%', height: 90, objectFit: 'cover', objectPosition: problem.cardImageObjectPosition ?? 'center', display: 'block' }}
                  />
                </div>
              </div>
              <div style={{ padding: '10px 12px 14px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.25 }}>
                  {problem.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '16px 20px 36px' }}>
        <button
          type="button"
          onClick={confirm}
          disabled={selected.length === 0}
          style={{
            width: '100%', padding: 16, borderRadius: 14,
            background: selected.length > 0 ? T.gold : T.surface,
            color: selected.length > 0 ? '#0A0A0A' : T.text3,
            fontSize: 15, fontWeight: 700, border: 'none',
            cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: T.font, transition: 'all 0.2s ease',
          }}
        >
          {selected.length > 0
            ? `Continue with ${selected.length} issue${selected.length > 1 ? 's' : ''}`
            : 'Select at least one issue'}
        </button>
      </div>
    </div>
  );
};

export default ManualSelection;
