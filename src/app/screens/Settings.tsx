import React, { useState } from 'react';
import Layout from '../components/Layout';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingToggle[]>([
    { id: 'reminders', label: 'Posture Reminders', description: 'Get notified to check your posture', enabled: true, icon: '🔔' },
    { id: 'daily-goal', label: 'Daily Exercise Goal', description: 'Remind me to complete daily exercises', enabled: true, icon: '🎯' },
    { id: 'sounds', label: 'Exercise Sounds', description: 'Play sounds during exercises', enabled: false, icon: '🔊' },
    { id: 'haptics', label: 'Haptic Feedback', description: 'Vibrate on exercise transitions', enabled: true, icon: '📳' },
    { id: 'dark-mode', label: 'Dark Mode', description: 'Switch to dark theme', enabled: false, icon: '🌙' },
    { id: 'analytics', label: 'Health Data Sync', description: 'Sync with Apple Health', enabled: false, icon: '❤️' },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const profileOptions = [
    { label: 'Edit Profile', icon: '👤', action: () => {} },
    { label: 'Notification Schedule', icon: '🕐', action: () => {} },
    { label: 'Exercise Difficulty', icon: '⚡', action: () => {} },
    { label: 'About PostureFix', icon: 'ℹ️', action: () => {} },
    { label: 'Help & Support', icon: '💬', action: () => {} },
    { label: 'Privacy Policy', icon: '🔒', action: () => {} },
  ];

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{ paddingTop: 56, marginBottom: 24, animation: 'fadeIn 0.6s ease' }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)', letterSpacing: '-0.02em',
          }}>Settings</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Customize your experience
          </p>
        </div>

        {/* Profile Card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--color-surface)', borderRadius: 20,
          padding: 20, marginBottom: 24, border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.1s both',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: 'white', fontWeight: 800,
            fontFamily: 'var(--font-display)',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)',
          }}>
            PF
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
            }}>PostureFix User</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              7-day streak · Intermediate
            </div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-surface-raised)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Toggles Section */}
        <div style={{ marginBottom: 24, animation: 'slideUp 0.5s ease 0.15s both' }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 4,
          }}>Preferences</h3>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 20,
            border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            {settings.map((setting, i) => (
              <div key={setting.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px',
                borderBottom: i < settings.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              }}>
                <span style={{ fontSize: 22 }}>{setting.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                    {setting.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                    {setting.description}
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  style={{
                    width: 52, height: 30, borderRadius: 15,
                    background: setting.enabled
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
                      : 'var(--color-surface-raised)',
                    position: 'relative', transition: 'all 0.3s ease',
                    border: setting.enabled ? 'none' : '1px solid var(--color-border)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'white',
                    position: 'absolute', top: 3,
                    left: setting.enabled ? 25 : 3,
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Options */}
        <div style={{ marginBottom: 24, animation: 'slideUp 0.5s ease 0.2s both' }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text-tertiary)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 4,
          }}>General</h3>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 20,
            border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            {profileOptions.map((option, i) => (
              <button key={option.label} onClick={option.action} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', textAlign: 'left',
                borderBottom: i < profileOptions.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                transition: 'background 0.15s ease',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-raised)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 20 }}>{option.icon}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                  {option.label}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Goal Setting */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
          borderRadius: 20, padding: 20, marginBottom: 24,
          border: '1px solid var(--color-primary-200)',
          animation: 'slideUp 0.5s ease 0.25s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>⏰</span>
            <h3 style={{
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
              color: 'var(--color-primary-dark)',
            }}>Reminder Schedule</h3>
          </div>
          <p style={{
            fontSize: 13, color: 'var(--color-primary-700)', lineHeight: 1.5,
            marginBottom: 16, opacity: 0.8,
          }}>
            Set up posture check reminders throughout your day to build healthy habits.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
          }}>
            {['9:00 AM', '1:00 PM', '5:00 PM'].map((time, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 12, padding: '10px 8px',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--color-primary)',
                  fontFamily: 'var(--font-display)',
                }}>{time}</div>
                <div style={{ fontSize: 10, color: 'var(--color-primary-700)', marginTop: 2, opacity: 0.7 }}>
                  {['Morning', 'Afternoon', 'Evening'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <div style={{
          textAlign: 'center', padding: '16px 0 32px',
          animation: 'slideUp 0.5s ease 0.3s both',
        }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
            PostureFix v1.0.0
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4, opacity: 0.6 }}>
            Made with ❤️ for better posture
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
