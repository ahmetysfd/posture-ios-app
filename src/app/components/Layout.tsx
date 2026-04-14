import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Home, ListChecks, Settings, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentScreen = location.pathname === '/' ? 'home'
    : location.pathname === '/welcome' ? 'welcome'
    : location.pathname.startsWith('/program') || location.pathname === '/scan/program' ? 'program'
    : location.pathname === '/progress' ? 'progress'
    : location.pathname === '/settings' ? 'settings' : '';

  const tabs = [
    { id: 'home', path: '/', label: 'Home', Icon: HomeIcon },
    { id: 'welcome', path: '/welcome', label: 'Welcome', Icon: WelcomeIcon },
    { id: 'program', path: '/program', label: 'Program', Icon: ProgramIcon },
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
        paddingBottom: hideNav ? 0 : 94,
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
          zIndex: 100,
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '12px 16px 28px',
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
                  gap: 4,
                  minWidth: 56,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 150ms ease',
                }}
              >
                <div style={{
                  position: 'relative',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: active ? '#F97316' : '#71717A',
                  transition: 'color 300ms ease',
                }}>
                  {active && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: 'rgba(249,115,22,0.15)',
                      filter: 'blur(6px)',
                    }} />
                  )}
                  <Icon active={active} />
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 400,
                  color: active ? '#F97316' : '#52525B',
                  letterSpacing: '0.02em',
                  transition: 'color 300ms ease',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
          </div>
        </nav>
      )}
    </div>
  );
};

const HomeIcon = ({ active }: { active: boolean }) => (
  <Home size={20} strokeWidth={active ? 2.2 : 1.6} />
);

const ChartIcon = ({ active }: { active: boolean }) => (
  <BarChart2 size={20} strokeWidth={active ? 2.2 : 1.6} />
);

const ProgramIcon = ({ active }: { active: boolean }) => (
  <ListChecks size={20} strokeWidth={active ? 2.2 : 1.6} />
);

const GearIcon = ({ active }: { active: boolean }) => (
  <Settings size={20} strokeWidth={active ? 2.2 : 1.6} />
);

const WelcomeIcon = ({ active }: { active: boolean }) => (
  <Sparkles size={20} strokeWidth={active ? 2.2 : 1.6} />
);

export default Layout;
