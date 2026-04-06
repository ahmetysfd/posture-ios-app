import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HabitPhaseSummaryCard from '../components/HabitPhaseSummaryCard';
import { postureProblems } from '../data/postureData';
import { loadUserProfile } from '../services/UserProfile';

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

const Home: React.FC = () => {
  const navigate = useNavigate();
  const profile = loadUserProfile();
  const hasScan = Boolean(profile?.scanTimestamp && profile.scanTimestamp > 0);

  return (
    <Layout>
      <div style={{ padding: '0 20px', fontFamily: T.font }}>
        <div style={{ paddingTop: 52, marginBottom: 20, animation: 'fadeIn 0.5s ease' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: T.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Good {getTimeOfDay()}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: T.text, letterSpacing: '-0.02em' }}>
            PostureFix
          </h1>
        </div>

        <div style={{
          marginBottom: 16,
          animation: 'slideUp 0.4s ease 0.04s both',
        }}>
          <HabitPhaseSummaryCard />
        </div>

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

        <div style={{ display: 'flex', gap: 10, marginBottom: 24, animation: 'slideUp 0.4s ease 0.08s both' }}>
          <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: T.text3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Streak</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: T.text }}>0</span>
              <span style={{ fontSize: 13, color: T.text3, fontWeight: 400 }}>days</span>
            </div>
          </div>
          <div style={{ flex: 1, background: T.surface, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: T.text3, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Total</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: T.text }}>0</span>
              <span style={{ fontSize: 13, color: T.text3, fontWeight: 400 }}>min</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 500, color: T.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, animation: 'slideUp 0.4s ease 0.1s both' }}>
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
                <img
                  src={problem.cardImage} alt="" draggable={false}
                  style={{ width: '100%', height: 150, objectFit: 'cover', objectPosition: problem.cardImageObjectPosition ?? 'center', display: 'block' }}
                />
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
