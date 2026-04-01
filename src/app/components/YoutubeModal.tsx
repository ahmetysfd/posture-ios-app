import React, { useEffect } from 'react';
import { toYouTubeEmbed } from '../lib/youtubeEmbed';

export interface YoutubeModalProps {
  open: boolean;
  watchUrl: string;
  title?: string;
  onClose: () => void;
}

const YoutubeModal: React.FC<YoutubeModalProps> = ({ open, watchUrl, title, onClose }) => {
  const embed = toYouTubeEmbed(watchUrl);
  const src = `${embed}${embed.includes('?') ? '&' : '?'}playsinline=1&rel=0`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Video'}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#0f172a',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: '#1e293b',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title || 'YouTube'}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#f8fafc',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '9 / 16', maxHeight: 'min(72vh, 640px)', margin: '0 auto', background: '#000' }}>
          <iframe
            title={title || 'Exercise demo'}
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default YoutubeModal;
