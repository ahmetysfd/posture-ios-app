import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentScreen = location.pathname === '/' ? 'home'
    : location.pathname === '/progress' ? 'progress'
    : location.pathname === '/settings' ? 'settings' : '';

  const tabs = [
    { id: 'home', path: '/', label: 'Home', Icon: HomeIcon },
    { id: 'progress', path: '/progress', label: 'Progress', Icon: ChartIcon },
    { id: 'settings', path: '/settings', label: 'Settings', Icon: GearIcon },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: 430,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--color-bg)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-body)',
      boxShadow: '0 0 80px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: hideNav ? 0 : 80,
        WebkitOverflowScrolling: 'touch' as any,
      }}>
        {children}
      </div>

      {!hideNav && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          background: 'rgba(10, 10, 10, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '6px 0 20px',
          display: 'flex',
          justifyContent: 'space-around',
          zIndex: 100,
        }}>
          {tabs.map(({ id, path, label, Icon }) => {
            const active = currentScreen === id;
            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '6px 24px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon active={active} />
                <span style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--color-primary)' : '#444444',
                  letterSpacing: '0.01em',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

// Icons matching Figma exactly
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24"
    fill={active ? 'var(--color-primary)' : 'none'}
    stroke={active ? 'var(--color-primary)' : '#444444'}
    strokeWidth={active ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChartIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? 'var(--color-primary)' : '#444444'}
    strokeWidth={2} strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const GearIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? 'var(--color-primary)' : '#444444'}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default Layout;
