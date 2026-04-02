import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    emoji: '🧘',
    title: 'Fix Your Posture',
    description: 'Guided exercises designed to correct common posture problems from daily habits like sitting and screen use.',
    color: '#e53535',
    bgGradient: 'linear-gradient(165deg, #1a1214 0%, #0a0a0a 55%)',
  },
  {
    emoji: '📱',
    title: 'Personalized Routines',
    description: 'Choose from targeted routines for neck, shoulder, back, hip, and wrist issues. Each exercise comes with clear step-by-step instructions.',
    color: '#ff6b6b',
    bgGradient: 'linear-gradient(165deg, #141018 0%, #0a0a0a 55%)',
  },
  {
    emoji: '📊',
    title: 'Track Your Progress',
    description: 'Build a daily streak, see your improvement over time, and stay motivated with visual progress tracking.',
    color: '#34d399',
    bgGradient: 'linear-gradient(165deg, #0f1a16 0%, #0a0a0a 55%)',
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(c => c + 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{
      maxWidth: 430,
      margin: '0 auto',
      minHeight: '100vh',
      background: slide.bgGradient,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      transition: 'background 0.5s ease',
      boxShadow: '0 0 60px rgba(0,0,0,0.5)',
    }}>
      {/* Skip button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '52px 20px 0',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text-sec)',
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(20,20,20,0.85)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        textAlign: 'center',
      }}>
        {/* Animated emoji */}
        <div
          key={current}
          style={{
            width: 140,
            height: 140,
            borderRadius: 40,
            background: 'rgba(30,30,30,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 72,
            marginBottom: 40,
            boxShadow: `0 16px 48px ${slide.color}15`,
            animation: 'scaleIn 0.5s ease',
          }}
        >
          {slide.emoji}
        </div>

        {/* Title */}
        <h1
          key={`title-${current}`}
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 12,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            animation: 'slideUp 0.5s ease 0.1s both',
          }}
        >
          {slide.title}
        </h1>

        {/* Description */}
        <p
          key={`desc-${current}`}
          style={{
            fontSize: 15,
            color: 'var(--color-text-sec)',
            lineHeight: 1.65,
            maxWidth: 300,
            animation: 'slideUp 0.5s ease 0.2s both',
          }}
        >
          {slide.description}
        </p>
      </div>

      {/* Bottom controls */}
      <div style={{
        padding: '0 32px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        {/* Dots */}
        <div style={{
          display: 'flex',
          gap: 8,
        }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? slide.color : `${slide.color}30`,
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={next}
          style={{
            width: '100%',
            padding: '16px 24px',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${slide.color}, ${slide.color}DD)`,
            color: 'white',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${slide.color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.3s ease',
          }}
        >
          {current < slides.length - 1 ? 'Continue' : 'Get Started'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
