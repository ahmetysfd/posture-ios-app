import React, { useState } from 'react';
import Layout from '../components/Layout';
import { sampleProgress, postureProblems } from '../data/postureData';

const Progress: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxExercises = Math.max(...sampleProgress.map(d => d.exercisesCompleted));
  const totalExercises = sampleProgress.reduce((sum, d) => sum + d.exercisesCompleted, 0);
  const totalMinutes = sampleProgress.reduce((sum, d) => sum + d.totalDuration, 0);
  const avgPerDay = Math.round(totalExercises / sampleProgress.length);
  const currentStreak = sampleProgress[sampleProgress.length - 1]?.streak || 0;

  // Count problems addressed
  const problemCounts: Record<string, number> = {};
  sampleProgress.forEach(d => {
    d.problemsAddressed.forEach(p => {
      problemCounts[p] = (problemCounts[p] || 0) + 1;
    });
  });

  const topProblems = Object.entries(problemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, count]) => {
      const problem = postureProblems.find(p => p.id === id);
      return { id, count, problem };
    });

  return (
    <Layout>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{ paddingTop: 56, marginBottom: 24, animation: 'fadeIn 0.6s ease' }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)', letterSpacing: '-0.02em',
          }}>Progress</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Track your posture improvement journey
          </p>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, marginBottom: 24, animation: 'slideUp 0.5s ease 0.1s both',
        }}>
          {[
            { value: totalExercises, label: 'Total Exercises', color: 'var(--color-primary)', emoji: '💪' },
            { value: `${totalMinutes}m`, label: 'Total Duration', color: 'var(--color-accent)', emoji: '⏱️' },
            { value: currentStreak, label: 'Current Streak', color: '#F59E0B', emoji: '🔥' },
            { value: avgPerDay, label: 'Daily Average', color: '#EC4899', emoji: '📊' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)', borderRadius: 16,
              padding: 16, border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-sm)',
              animation: `slideUp 0.5s ease ${0.15 + i * 0.05}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{stat.emoji}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{
                fontSize: 26, fontWeight: 800, color: stat.color,
                fontFamily: 'var(--font-display)',
              }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab selector */}
        <div style={{
          display: 'flex', gap: 4, background: 'var(--color-surface-raised)',
          borderRadius: 12, padding: 4, marginBottom: 20,
          animation: 'slideUp 0.5s ease 0.25s both',
        }}>
          {(['week', 'month'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px 16px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, textTransform: 'capitalize',
              background: activeTab === tab ? 'var(--color-surface)' : 'transparent',
              color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-tertiary)',
              boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}>{tab}</button>
          ))}
        </div>

        {/* Bar Chart */}
        <div style={{
          background: 'var(--color-surface)', borderRadius: 20,
          padding: 20, marginBottom: 20, border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.3s both',
        }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)', marginBottom: 20,
          }}>Exercises Completed</h3>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            height: 140, paddingBottom: 28, position: 'relative',
          }}>
            {/* Y-axis reference line */}
            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 28,
              height: 1, background: 'var(--color-border-light)',
            }} />
            {sampleProgress.map((day, i) => {
              const height = maxExercises > 0 ? (day.exercisesCompleted / maxExercises) * 100 : 0;
              const isToday = i === sampleProgress.length - 1;
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--color-primary)',
                    opacity: isToday ? 1 : 0,
                  }}>{day.exercisesCompleted}</div>
                  <div style={{
                    width: '100%', maxWidth: 36,
                    height: `${height}%`, minHeight: 4,
                    borderRadius: 8,
                    background: isToday
                      ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-light))'
                      : 'var(--color-primary-100)',
                    transition: `height 0.5s ease ${i * 0.05}s`,
                    boxShadow: isToday ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                  }} />
                  <div style={{
                    fontSize: 11, fontWeight: isToday ? 700 : 500,
                    color: isToday ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                  }}>{weekDays[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Problems Addressed */}
        <div style={{
          background: 'var(--color-surface)', borderRadius: 20,
          padding: 20, marginBottom: 20, border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.35s both',
        }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)', marginBottom: 16,
          }}>Most Addressed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topProblems.map(({ problem, count }, i) => {
              if (!problem) return null;
              const maxCount = topProblems[0]?.count || 1;
              const barWidth = (count / maxCount) * 100;
              return (
                <div key={problem.id}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{problem.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                        {problem.title}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: problem.color,
                    }}>{count}x</span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 4, background: 'var(--color-surface-raised)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: `linear-gradient(90deg, ${problem.color}, ${problem.color}AA)`,
                      width: `${barWidth}%`,
                      transition: `width 0.6s ease ${i * 0.1}s`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Duration Chart */}
        <div style={{
          background: 'var(--color-surface)', borderRadius: 20,
          padding: 20, marginBottom: 20, border: '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-sm)', animation: 'slideUp 0.5s ease 0.4s both',
        }}>
          <h3 style={{
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
            color: 'var(--color-text)', marginBottom: 16,
          }}>Duration (minutes)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {sampleProgress.map((day, i) => {
              const maxDur = Math.max(...sampleProgress.map(d => d.totalDuration));
              const h = maxDur > 0 ? (day.totalDuration / maxDur) * 100 : 0;
              return (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, minHeight: 4,
                  borderRadius: 6,
                  background: `linear-gradient(180deg, var(--color-accent), var(--color-accent-light))`,
                  opacity: 0.4 + (i / sampleProgress.length) * 0.6,
                  transition: `height 0.5s ease ${i * 0.05}s`,
                }} />
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Progress;
