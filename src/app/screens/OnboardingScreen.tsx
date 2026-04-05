import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserProfile, type UserProfile } from '../services/UserProfile';

const T = {
  bg:      '#0A0A0A',
  surface: '#141414',
  border:  'rgba(255,255,255,0.08)',
  text:    '#EDEDED',
  text2:   'rgba(160,160,155,1)',
  text3:   'rgba(102,102,100,1)',
  gold:    '#D9B84C',
  orange:  '#E68C33',
  green:   '#3DA878',
  font:    "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
};

type Step = 'welcome' | 'basics' | 'lifestyle' | 'pain' | 'ready';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');

  // Form state
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('sedentary');
  const [screenHours, setScreenHours] = useState('6');
  const [hasPain, setHasPain] = useState(false);
  const [painAreas, setPainAreas] = useState<string[]>([]);

  const togglePain = (area: string) => {
    setPainAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area],
    );
  };

  const finish = useCallback(() => {
    const profile: Partial<UserProfile> = {
      age: parseInt(age) || 25,
      weight: parseInt(weight) || 70,
      height: parseInt(height) || 170,
      gender,
      activityLevel: activity,
      dailyScreenHours: parseInt(screenHours) || 6,
      hasExistingPain: hasPain,
      painAreas,
      onboardingComplete: true,
    };
    saveUserProfile(profile);
    navigate('/scan');
  }, [age, weight, height, gender, activity, screenHours, hasPain, painAreas, navigate]);

  const Chip: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ label, selected, onPress }) => (
    <button
      type="button"
      onClick={onPress}
      style={{
        padding: '10px 18px',
        borderRadius: 10,
        background: selected ? 'rgba(217,184,76,0.12)' : T.surface,
        border: `1px solid ${selected ? T.gold : T.border}`,
        color: selected ? T.gold : T.text2,
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        fontFamily: T.font,
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );

  const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    unit: string;
    type?: string;
  }> = ({ label, value, onChange, unit, type = 'number' }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 12, color: T.text3, fontWeight: 500,
        fontFamily: T.font, display: 'block', marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type={type}
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 10,
            background: T.surface,
            border: `1px solid ${T.border}`,
            color: T.text,
            fontSize: 16,
            fontFamily: T.font,
            outline: 'none',
          }}
        />
        <span style={{ fontSize: 13, color: T.text3, fontFamily: T.font, minWidth: 24 }}>
          {unit}
        </span>
      </div>
    </div>
  );

  const NextButton: React.FC<{ label: string; onClick: () => void; disabled?: boolean }> = ({
    label, onClick, disabled,
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: 15, borderRadius: 10,
        background: disabled ? T.surface : T.gold,
        color: disabled ? T.text3 : '#0A0A0A',
        fontSize: 14, fontWeight: 600, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: T.font, marginTop: 12,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      width: '100%', maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: T.bg, fontFamily: T.font,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Progress dots */}
      <div style={{ padding: '60px 24px 0', display: 'flex', gap: 6, justifyContent: 'center' }}>
        {(['welcome', 'basics', 'lifestyle', 'pain', 'ready'] as Step[]).map((s, i) => {
          const steps: Step[] = ['welcome', 'basics', 'lifestyle', 'pain', 'ready'];
          const currentIdx = steps.indexOf(step);
          return (
            <div
              key={s}
              style={{
                width: i <= currentIdx ? 24 : 8,
                height: 4,
                borderRadius: 2,
                background: i <= currentIdx ? T.gold : 'rgba(255,255,255,0.08)',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>

        {/* ── WELCOME ────────────────────────────────── */}
        {step === 'welcome' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', marginBottom: 8 }}>
                Welcome to PostureFix
              </h1>
              <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.6 }}>
                We'll take 3 quick photos and ask a few questions to understand your posture and recommend the right level for you.
              </p>
            </div>

            <div style={{
              background: T.surface, borderRadius: 12, padding: 16,
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { num: '1', text: 'A few questions about you' },
                  { num: '2', text: '3 photos: front, side, back' },
                  { num: '3', text: 'Your level + personalized plan' },
                ].map(item => (
                  <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(217,184,76,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, color: T.gold, flexShrink: 0,
                    }}>
                      {item.num}
                    </div>
                    <span style={{ fontSize: 14, color: T.text, fontWeight: 400 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <NextButton label="Let's start" onClick={() => setStep('basics')} />
          </div>
        )}

        {/* ── BASICS ─────────────────────────────────── */}
        {step === 'basics' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: T.text, marginBottom: 4 }}>
              About you
            </h2>
            <p style={{ fontSize: 13, color: T.text3, marginBottom: 12 }}>
              This helps us calibrate results to your body.
            </p>

            <InputField label="Age" value={age} onChange={setAge} unit="yrs" />
            <InputField label="Weight" value={weight} onChange={setWeight} unit="kg" />
            <InputField label="Height" value={height} onChange={setHeight} unit="cm" />

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: T.text3, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Gender
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['male', 'female', 'other'] as const).map(g => (
                  <Chip key={g} label={g.charAt(0).toUpperCase() + g.slice(1)} selected={gender === g} onPress={() => setGender(g)} />
                ))}
              </div>
            </div>

            <NextButton
              label="Continue"
              onClick={() => setStep('lifestyle')}
              disabled={!age || !weight || !height}
            />
          </div>
        )}

        {/* ── LIFESTYLE ──────────────────────────────── */}
        {step === 'lifestyle' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: T.text, marginBottom: 4 }}>
              Your lifestyle
            </h2>
            <p style={{ fontSize: 13, color: T.text3, marginBottom: 12 }}>
              Helps us adjust your posture level assessment.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: T.text3, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Activity level
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {([
                  { key: 'sedentary', label: 'Sedentary' },
                  { key: 'light', label: 'Light' },
                  { key: 'moderate', label: 'Moderate' },
                  { key: 'active', label: 'Active' },
                ] as const).map(a => (
                  <Chip key={a.key} label={a.label} selected={activity === a.key} onPress={() => setActivity(a.key)} />
                ))}
              </div>
            </div>

            <InputField label="Daily screen time" value={screenHours} onChange={setScreenHours} unit="hrs" />

            <NextButton label="Continue" onClick={() => setStep('pain')} />
          </div>
        )}

        {/* ── PAIN ───────────────────────────────────── */}
        {step === 'pain' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: T.text, marginBottom: 4 }}>
              Any discomfort?
            </h2>
            <p style={{ fontSize: 13, color: T.text3, marginBottom: 12 }}>
              This is not a diagnosis — just helps us understand your starting point.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: T.text3, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                Do you experience regular pain or stiffness?
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Chip label="Yes" selected={hasPain} onPress={() => setHasPain(true)} />
                <Chip label="No" selected={!hasPain} onPress={() => { setHasPain(false); setPainAreas([]); }} />
              </div>
            </div>

            {hasPain && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: T.text3, fontWeight: 500, display: 'block', marginBottom: 8 }}>
                  Where? (select all that apply)
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Neck', 'Upper back', 'Lower back', 'Shoulders', 'Hips', 'Knees'].map(area => (
                    <Chip
                      key={area}
                      label={area}
                      selected={painAreas.includes(area.toLowerCase())}
                      onPress={() => togglePain(area.toLowerCase())}
                    />
                  ))}
                </div>
              </div>
            )}

            <NextButton label="Continue" onClick={() => setStep('ready')} />
          </div>
        )}

        {/* ── READY ──────────────────────────────────── */}
        {step === 'ready' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'rgba(217,184,76,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="5" r="3" /><path d="M12 8v8M9 12h6M8 21l4-5 4 5" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 500, color: T.text, marginBottom: 8 }}>
                Ready to scan
              </h2>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
                We'll take 3 photos — front, side, and back — to detect your posture patterns and assign your level.
              </p>
            </div>

            <div style={{
              background: T.surface, borderRadius: 12, padding: 14,
              border: `1px solid ${T.border}`,
            }}>
              <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.55 }}>
                Stand against a plain wall, in fitted clothing, with even lighting. Keep head to knees visible in each shot.
              </p>
            </div>

            <NextButton label="Start body scan" onClick={finish} />

            <button
              type="button"
              onClick={() => setStep('pain')}
              style={{
                width: '100%', padding: 12, borderRadius: 10,
                background: 'none', color: T.text3,
                border: `1px solid ${T.border}`,
                fontSize: 13, cursor: 'pointer', fontFamily: T.font,
              }}
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
