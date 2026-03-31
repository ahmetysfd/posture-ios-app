import React from 'react';
import Layout from '../components/Layout';

const progressData = [
  { day: 'Mon', ex: 6, dur: 12 }, { day: 'Tue', ex: 9, dur: 18 },
  { day: 'Wed', ex: 4, dur: 8 }, { day: 'Thu', ex: 8, dur: 15 },
  { day: 'Fri', ex: 7, dur: 14 }, { day: 'Sat', ex: 10, dur: 20 },
  { day: 'Sun', ex: 5, dur: 10 },
];

const Progress: React.FC = () => {
  const maxEx = Math.max(...progressData.map(d => d.ex));
  const totalEx = progressData.reduce((s, d) => s + d.ex, 0);
  const totalMins = progressData.reduce((s, d) => s + d.dur, 0);

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        <div style={{ paddingTop: 52, marginBottom: 24, animation: 'fadeIn 0.5s ease' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>Progress</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-sec)', marginTop: 4 }}>Track your posture journey</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, animation: 'slideUp 0.4s ease 0.08s both' }}>
          {[
            { v: totalEx, l: 'Exercises', c: 'var(--color-primary)', e: '💪' },
            { v: `${totalMins}m`, l: 'Duration', c: 'var(--color-accent)', e: '⏱️' },
            { v: '7', l: 'Streak', c: '#F59E0B', e: '🔥' },
            { v: Math.round(totalEx / 7), l: 'Avg/Day', c: '#EC4899', e: '📊' },
          ].map((st, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 16, border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{st.e}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tert)', fontWeight: 500 }}>{st.l}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: st.c }}>{st.v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--color-surface)', borderRadius: 20, padding: 20, marginBottom: 16, border: '1px solid var(--color-border-light)', animation: 'slideUp 0.4s ease 0.16s both' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 18 }}>This Week</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, paddingBottom: 26, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, height: 1, background: 'var(--color-border-light)' }} />
            {progressData.map((d, i) => {
              const h = maxEx > 0 ? (d.ex / maxEx) * 100 : 0;
              const last = i === progressData.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', opacity: last ? 1 : 0 }}>{d.ex}</div>
                  <div style={{ width: '100%', maxWidth: 32, height: `${h}%`, minHeight: 4, borderRadius: 8, background: last ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-light))' : '#E0E7FF', boxShadow: last ? '0 4px 10px rgba(79,70,229,0.18)' : 'none' }} />
                  <div style={{ fontSize: 10, fontWeight: last ? 700 : 500, color: last ? 'var(--color-primary)' : 'var(--color-text-tert)' }}>{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Progress;
