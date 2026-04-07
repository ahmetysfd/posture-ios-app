import React from 'react';

/** Strip "(Exercise band)" from the displayed exercise name (legacy, kept for compat). */
export const displayName = (name: string) =>
  name.replace(' (Exercise band)', '');

/** True if this exercise requires a resistance band (legacy name-based check). */
export const requiresBand = (name: string) =>
  name.includes('(Exercise band)');

/** Canonical check — uses requiresEquipment field, falls back to name pattern. */
export const hasBandBadge = (ex: { requiresEquipment?: boolean; name: string }): boolean =>
  ex.requiresEquipment === true || requiresBand(ex.name);

/* ── Resistance band loop icon (outline) ─────────────────── */
const BandIcon = () => (
  <svg
    width="15" height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Outer loop — the band */}
    <ellipse cx="12" cy="12" rx="9" ry="4.5" />
    {/* Inner loop — the opening */}
    <ellipse cx="12" cy="12" rx="4.5" ry="2" />
  </svg>
);

/* ── Tooltip caret ────────────────────────────────────────── */
const Caret = () => (
  <span style={{
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0, height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid var(--color-border)',
    display: 'block',
  }} />
);

/* ── BandBadge ────────────────────────────────────────────── */
interface BandBadgeProps {
  /** Unique key for this exercise (used to track which tooltip is open). */
  exId: string;
  /** The currently open tooltip id, or null. */
  activeId: string | null;
  /** Called with the new activeId (or null to dismiss). */
  onToggle: (id: string | null) => void;
}

const BandBadge: React.FC<BandBadgeProps> = ({ exId, activeId, onToggle }) => {
  const visible = activeId === exId;

  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', flexShrink: 0 }}>
      {/* Full-screen dismiss backdrop */}
      {visible && (
        <div
          onClick={e => { e.stopPropagation(); onToggle(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        />
      )}

      {/* Icon button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onToggle(visible ? null : exId); }}
        aria-label="Resistance band required for this exercise"
        title="Resistance band required"
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 3px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--color-text-tert)',
          opacity: 0.7,
          lineHeight: 1,
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
      >
        <BandIcon />
      </button>

      {/* Tooltip */}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            /* animation overrides the transform, so translateX(-50%) is baked in */
            animation: 'tooltipIn 0.18s ease forwards',
            zIndex: 100,
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '7px 11px',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-text)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
        >
          Resistance band required
          <Caret />
        </div>
      )}
    </span>
  );
};

export default BandBadge;
