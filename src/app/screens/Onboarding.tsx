import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NAME_KEY = 'posturefix_name';

const T = {
  bg: '#0A0A0A',
  surface: '#141414',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(217,184,76,0.45)',
  text: '#EDEDED',
  text2: 'rgba(160,160,155,1)',
  text3: 'rgba(102,102,100,1)',
  gold: '#D9B84C',
  font: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'name' | 'method'>('name');
  const [name, setName] = useState('');

  const handleNameNext = () => {
    if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
    setStep('method');
  };

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: T.bg, fontFamily: T.font, display: 'flex', flexDirection: 'column',
    }}>
      {/* Progress dots */}
      <div style={{ padding: '60px 24px 0', display: 'flex', gap: 6, justifyContent: 'center' }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: (step === 'name' ? i === 0 : true) ? 24 : 8,
            height: 4, borderRadius: 2,
            background: (step === 'name' ? i === 0 : i <= 1) ? T.gold : 'rgba(255,255,255,0.08)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: '40px 24px 32px', display: 'flex', flexDirection: 'column' }}>

        {/* ── NAME ─────────────────────────────────── */}
        {step === 'name' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', marginBottom: 10 }}>
                Welcome to PostureFix
              </h1>
              <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.6 }}>
                What should we call you?
              </p>
            </div>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleNameNext()}
              placeholder="Your name"
              autoFocus
              style={{
                width: '100%', padding: '15px 16px', borderRadius: 12,
                background: T.surface,
                border: `1px solid ${name.trim() ? T.borderActive : T.border}`,
                color: T.text, fontSize: 17, fontFamily: T.font,
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
            />

            <button
              type="button"
              onClick={handleNameNext}
              disabled={!name.trim()}
              style={{
                width: '100%', padding: 15, borderRadius: 12,
                background: name.trim() ? T.gold : T.surface,
                color: name.trim() ? '#0A0A0A' : T.text3,
                fontSize: 15, fontWeight: 600, border: 'none',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                fontFamily: T.font, transition: 'all 0.2s ease',
              }}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={() => setStep('method')}
              style={{
                background: 'none', border: 'none', color: T.text3,
                fontSize: 13, cursor: 'pointer', fontFamily: T.font, padding: 0,
              }}
            >
              Skip
            </button>
          </div>
        )}

        {/* ── METHOD ───────────────────────────────── */}
        {step === 'method' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', marginBottom: 8 }}>
                How would you like to start?
              </h2>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                Choose how we identify your posture issues.
              </p>
            </div>

            {/* AI Scan */}
            <button
              type="button"
              onClick={() => navigate('/onboarding-demographics')}
              style={{
                width: '100%', textAlign: 'left', padding: 20, borderRadius: 16,
                background: 'rgba(217,184,76,0.06)', border: `1.5px solid ${T.borderActive}`,
                cursor: 'pointer', fontFamily: T.font, display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(217,184,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: T.text }}>AI Body Scan</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(217,184,76,0.15)', color: T.gold, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
                  Recommended
                </span>
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, margin: 0 }}>
                3 photos — front, side, back. AI detects your posture issues and builds a personalized plan.
              </p>
            </button>

            {/* Manual */}
            <button
              type="button"
              onClick={() => navigate('/onboarding-manual')}
              style={{
                width: '100%', textAlign: 'left', padding: 20, borderRadius: 16,
                background: T.surface, border: `1px solid ${T.border}`,
                cursor: 'pointer', fontFamily: T.font, display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="2" strokeLinecap="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Choose Manually</span>
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.5, margin: 0 }}>
                Pick the posture issues you already know you have and we'll target them directly.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStep('name')}
              style={{ background: 'none', border: 'none', color: T.text3, fontSize: 13, cursor: 'pointer', fontFamily: T.font, padding: 0, marginTop: 4 }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
