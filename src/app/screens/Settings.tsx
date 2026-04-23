import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    localStorage.clear();
    sessionStorage.clear();
    navigate('/onboarding');
  };

  const [toggles, setToggles] = useState([
    { id: 'remind', label: 'Posture Reminders', desc: 'Get notified to check posture', on: true, icon: '🔔' },
    { id: 'goal', label: 'Daily Goal', desc: 'Remind me to complete exercises', on: true, icon: '🎯' },
    { id: 'sound', label: 'Sounds', desc: 'Play sounds during exercises', on: false, icon: '🔊' },
    { id: 'haptic', label: 'Haptics', desc: 'Vibrate on transitions', on: true, icon: '📳' },
  ]);

  const toggle = (id: string) => setToggles(t => t.map(x => x.id === id ? { ...x, on: !x.on } : x));

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        <div style={{ paddingTop: 52, marginBottom: 24, animation: 'fadeIn 0.5s ease' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Settings</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-sec)', marginTop: 4 }}>Customize your experience</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--color-surface)', borderRadius: 18, padding: 18, marginBottom: 24, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.08s both' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 800, boxShadow: 'var(--shadow-button)' }}>PF</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>PostureFix User</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-sec)', marginTop: 2 }}>Beginner</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: 18, border: '1px solid var(--color-border-light)', overflow: 'hidden', marginBottom: 24, animation: 'slideUp 0.4s ease 0.14s both' }}>
          {toggles.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', borderBottom: i < toggles.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tert)', marginTop: 1 }}>{s.desc}</div>
              </div>
              <button onClick={() => toggle(s.id)} style={{
                width: 48, height: 28, borderRadius: 14, position: 'relative', cursor: 'pointer',
                border: s.on ? 'none' : '1px solid var(--color-border)',
                background: s.on ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                transition: 'all 0.3s',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: s.on ? 23 : 3, transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ animation: 'slideUp 0.4s ease 0.2s both', marginBottom: 16 }}>
          <button
            onClick={handleReset}
            onBlur={() => setConfirmReset(false)}
            style={{ width: '100%', padding: '14px', borderRadius: 14, background: confirmReset ? 'rgba(239,68,68,0.12)' : 'var(--color-surface)', border: `1px solid ${confirmReset ? 'rgba(239,68,68,0.4)' : 'var(--color-border-light)'}`, color: confirmReset ? '#ef4444' : 'var(--color-text-sec)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {confirmReset ? 'Tap again to confirm reset' : 'Reset App & Redo Onboarding'}
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '4px 0 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-tert)' }}>PostureFix v2.0.0</div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
