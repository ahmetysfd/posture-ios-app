import React, { useEffect, useRef, useState } from 'react';
import type { PostureProblem } from '../data/postureData';
import { loadUserProfile } from '../services/UserProfile';
import PostureAnimation from './PostureAnimation';

/* ── Sub-icons ───────────────────────────────────────────────── */
const IconStretch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/><path d="M12 12v10"/><path d="M8 18l4 4 4-4"/>
  </svg>
);
const IconStrength = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>
    <circle cx="3" cy="4" r="1"/><circle cx="21" cy="4" r="1"/><circle cx="3" cy="20" r="1"/><circle cx="21" cy="20" r="1"/>
  </svg>
);
const IconHabits = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconProgram = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Section header ──────────────────────────────────────────── */
const SectionHeader: React.FC<{ dot: string; bg: string; label: string }> = ({ dot, bg, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 0 12px' }}>
    <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
    </div>
    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{label}</span>
  </div>
);

/* ── Bold row item ───────────────────────────────────────────── */
const BoldRow: React.FC<{ bold: string; text: string; dot: string; last?: boolean }> = ({ bold, text, dot, last }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: last ? 0 : 11 }}>
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 7 }} />
    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--color-text-sec)', margin: 0 }}>
      <strong style={{ color: 'var(--color-text)', fontWeight: 650 }}>{bold}</strong>
      <span style={{ color: 'var(--color-text-tert)', margin: '0 4px' }}>→</span>
      {text}
    </p>
  </div>
);

/* ── Fix group ───────────────────────────────────────────────── */
const FixGroup: React.FC<{ icon: React.ReactNode; label: string; items: string[]; last?: boolean }> = ({ icon, label, items, last }) => (
  <div style={{ marginBottom: last ? 0 : 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9, color: 'var(--color-accent)' }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < items.length - 1 ? 8 : 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1.5px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-sec)' }}>{item}</span>
      </div>
    ))}
  </div>
);

/* ── Divider ─────────────────────────────────────────────────── */
const Divider = () => <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0 4px' }} />;

/* ── Main modal ──────────────────────────────────────────────── */
interface LearnMoreModalProps {
  open: boolean;
  problem: PostureProblem;
  onClose: () => void;
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ open, problem, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const touchStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const pl = problem.premiumLayout;
  const isInProgram = loadUserProfile()?.detectedProblems.includes(problem.id) ?? false;

  useEffect(() => {
    if (open) {
      setMounted(true);
      // rAF ensures the initial transform is applied before transitioning
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Swipe-down to dismiss
  const onTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 90) onClose();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: '50%', zIndex: 301,
          transform: `translateX(-50%) translateY(${visible ? '0' : '100%'})`,
          transition: 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
          width: '100%', maxWidth: 430,
          background: 'var(--color-surface)',
          borderRadius: '24px 24px 0 0',
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.55)',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 0', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>
              Learn More
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>
              {problem.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-sec)', flexShrink: 0 }}
          >
            <IconClose />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={sheetRef}
          style={{ overflowY: 'auto', padding: '16px 20px 48px', WebkitOverflowScrolling: 'touch' as any }}
        >
          {/* Personalization badge */}
          {isInProgram && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(229,53,53,0.08)', border: '1px solid rgba(229,53,53,0.2)', borderRadius: 12, padding: '9px 14px', marginBottom: 16 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>
                <IconProgram />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-sec)', lineHeight: 1.4 }}>
                This is part of your <strong style={{ color: 'var(--color-text)' }}>daily program</strong>. Fixing it will improve your overall posture balance.
              </span>
            </div>
          )}

          {/* Posture animation */}
          <PostureAnimation problemId={problem.id} />

          {/* Short description */}
          <p style={{ fontSize: 13.5, color: 'var(--color-text-sec)', lineHeight: 1.65, marginBottom: 8 }}>
            {problem.description.split('\n')[0]}
          </p>

          {/* Affected areas chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {problem.affectedAreas.map((area, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tert)', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: 20, padding: '4px 10px' }}>
                {area}
              </span>
            ))}
          </div>

          {pl ? (
            <>
              {/* ── Why it happens ── */}
              <SectionHeader dot="#EF4444" bg="rgba(239,68,68,0.1)" label="Why it happens" />
              <div style={{ paddingLeft: 4, marginBottom: 8 }}>
                {pl.whyItHappens.map((item, i) => (
                  <BoldRow key={i} bold={item.bold} text={item.text} dot="#EF4444" last={i === pl.whyItHappens.length - 1} />
                ))}
              </div>

              <Divider />

              {/* ── What changes ── */}
              <SectionHeader dot="#F97316" bg="rgba(249,115,22,0.1)" label="What changes over time" />
              <div style={{ paddingLeft: 4, marginBottom: 8 }}>
                {pl.whatChanges.map((item, i) => (
                  <BoldRow key={i} bold={item.bold} text={item.text} dot="#F97316" last={i === pl.whatChanges.length - 1} />
                ))}
              </div>

              <Divider />

              {/* ── How to fix it ── */}
              <SectionHeader dot="#34D399" bg="rgba(52,211,153,0.1)" label="How to fix it" />
              <div style={{ paddingLeft: 4 }}>
                <FixGroup icon={<IconStretch />} label="Stretch" items={pl.howToFix.stretch} />
                <FixGroup icon={<IconStrength />} label="Strengthen" items={pl.howToFix.strength} />
                <FixGroup icon={<IconHabits />} label="Habits" items={pl.howToFix.habits} last />
              </div>
            </>
          ) : (
            /* Fallback: show tips */
            <>
              <SectionHeader dot="#34D399" bg="rgba(52,211,153,0.1)" label="Tips" />
              {problem.tips.map((tip, i) => (
                <BoldRow key={i} bold="" text={tip} dot="#34D399" last={i === problem.tips.length - 1} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LearnMoreModal;
