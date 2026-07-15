import React from 'react';
import i18next from 'i18next';

// ─── Frame configuration — edit these to restyle any tier ────────────────────
// Labels/descriptions are resolved lazily via i18next so language switches apply live.
const FRAME_KEYS = {
  NONE: 'none', SPARK: 'spark', FLAME: 'flame', STORM: 'storm',
  LEGEND: 'legend', ELITE: 'elite', IMMORTAL: 'immortal',
};

const frameLabel = (tierKey) => i18next.t(`avatarFrame.frames.${FRAME_KEYS[tierKey]}.label`);
const frameDesc = (tierKey) => i18next.t(`avatarFrame.frames.${FRAME_KEYS[tierKey]}.description`);

export const STREAK_FRAMES = {
  NONE: {
    get label() { return frameLabel('NONE'); },
    days: 0,
    border: 'transparent',
    glow: 'none',
    animation: 'none',
    gradient: null,
    icon: null,
    get description() { return frameDesc('NONE'); },
  },
  SPARK: {
    get label() { return frameLabel('SPARK'); },
    days: 3,
    border: '#f5a623',
    glow: '0 0 10px rgba(245,166,35,0.5)',
    animation: 'streak-glow 2.5s ease-in-out infinite',
    gradient: null,
    icon: '🔥',
    get description() { return frameDesc('SPARK'); },
  },
  FLAME: {
    get label() { return frameLabel('FLAME'); },
    days: 7,
    border: '#ff6b35',
    glow: '0 0 16px rgba(255,107,53,0.6)',
    animation: 'streak-pulse 1.8s ease-in-out infinite',
    gradient: 'linear-gradient(135deg, #ff6b35, #f5a623)',
    icon: '🔥',
    get description() { return frameDesc('FLAME'); },
  },
  STORM: {
    get label() { return frameLabel('STORM'); },
    days: 14,
    border: '#ff4500',
    glow: '0 0 20px rgba(255,69,0,0.65)',
    animation: 'streak-shimmer 1.4s linear infinite',
    gradient: 'linear-gradient(135deg, #ff4500, #ff6b35, #f5a623)',
    icon: '⚡',
    get description() { return frameDesc('STORM'); },
  },
  LEGEND: {
    get label() { return frameLabel('LEGEND'); },
    days: 30,
    border: '#ffd700',
    glow: '0 0 24px rgba(255,215,0,0.7)',
    animation: 'streak-sparkle 1.2s linear infinite',
    gradient: 'linear-gradient(135deg, #ffd700, #ffaa00, #ff6b35)',
    icon: '👑',
    get description() { return frameDesc('LEGEND'); },
  },
  ELITE: {
    get label() { return frameLabel('ELITE'); },
    days: 60,
    border: '#00d4ff',
    glow: '0 0 28px rgba(0,212,255,0.75)',
    animation: 'streak-electric 0.9s linear infinite',
    gradient: 'linear-gradient(135deg, #00d4ff, #0066ff, #7b2fff)',
    icon: '⚡',
    get description() { return frameDesc('ELITE'); },
  },
  IMMORTAL: {
    get label() { return frameLabel('IMMORTAL'); },
    days: 100,
    border: 'url(#rainbow-gradient)',
    glow: '0 0 32px rgba(255,100,100,0.6)',
    animation: 'streak-rainbow 2s linear infinite',
    gradient: 'linear-gradient(135deg, #ff0080, #ff6b35, #ffd700, #00ff88, #00d4ff, #7b2fff)',
    icon: '✨',
    get description() { return frameDesc('IMMORTAL'); },
  },
};

// ─── Keyframe CSS injected once ───────────────────────────────────────────────
const FRAME_STYLES = `
@keyframes streak-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(245,166,35,0.4); }
  50%       { box-shadow: 0 0 16px rgba(245,166,35,0.75); }
}
@keyframes streak-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255,107,53,0.5); }
  50%       { box-shadow: 0 0 22px rgba(255,107,53,0.85); }
}
@keyframes streak-shimmer {
  0%   { filter: brightness(1); }
  50%  { filter: brightness(1.25); }
  100% { filter: brightness(1); }
}
@keyframes streak-sparkle {
  0%   { box-shadow: 0 0 18px rgba(255,215,0,0.6); }
  33%  { box-shadow: 0 0 28px rgba(255,170,0,0.9), 0 0 4px #fff; }
  66%  { box-shadow: 0 0 22px rgba(255,215,0,0.75); }
  100% { box-shadow: 0 0 18px rgba(255,215,0,0.6); }
}
@keyframes streak-electric {
  0%   { box-shadow: 0 0 20px rgba(0,212,255,0.7); }
  25%  { box-shadow: 0 0 30px rgba(0,102,255,0.9), 2px 0 8px rgba(0,212,255,0.5); }
  50%  { box-shadow: 0 0 24px rgba(123,47,255,0.8); }
  75%  { box-shadow: 0 0 30px rgba(0,212,255,0.9), -2px 0 8px rgba(0,102,255,0.5); }
  100% { box-shadow: 0 0 20px rgba(0,212,255,0.7); }
}
@keyframes streak-rainbow {
  0%   { filter: hue-rotate(0deg) brightness(1.1); }
  100% { filter: hue-rotate(360deg) brightness(1.1); }
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = FRAME_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * AvatarFrame — wraps any avatar image with a streak-tier border.
 *
 * Props:
 *   src          — avatar image URL
 *   alt          — img alt text
 *   frameKey     — one of STREAK_FRAMES keys (default "NONE")
 *   size         — number, px (default 64)
 *   locked       — show locked overlay (for "next frame" preview)
 *   showBadge    — show tier icon badge in corner
 *   className    — extra classes on wrapper div
 */
const AvatarFrame = ({
  src,
  alt = 'Avatar',
  frameKey = 'NONE',
  size = 64,
  locked = false,
  showBadge = true,
  fallbackEmoji = '😊',
  className = '',
}) => {
  injectStyles();
  const [imgErr, setImgErr] = React.useState(false);

  const frame = STREAK_FRAMES[frameKey] || STREAK_FRAMES.NONE;
  const hasFrame = frameKey !== 'NONE';
  const borderWidth = size >= 56 ? 3 : 2;
  const borderRadius = '50%';

  const wrapStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    flexShrink: 0,
  };

  // Gradient border via pseudo-like wrapper
  const ringStyle = hasFrame ? {
    position: 'absolute',
    inset: 0,
    borderRadius,
    padding: borderWidth,
    background: frame.gradient || frame.border,
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    animation: frame.animation !== 'none' ? frame.animation : undefined,
    zIndex: 1,
  } : null;

  const imgStyle = {
    width: size - borderWidth * 2 - 2,
    height: size - borderWidth * 2 - 2,
    borderRadius,
    objectFit: 'cover',
    display: 'block',
    position: 'relative',
    zIndex: 2,
    filter: locked ? 'grayscale(1) brightness(0.4)' : undefined,
  };

  const badgeStyle = {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: size >= 56 ? 14 : 11,
    lineHeight: 1,
    zIndex: 3,
    filter: locked ? 'grayscale(1)' : undefined,
  };

  const lockStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    fontSize: size * 0.3,
  };

  return (
    <div style={wrapStyle} className={className} title={locked ? `🔒 ${frame.label} — ${frame.description}` : frame.label}>
      {/* Gradient ring */}
      {hasFrame && <div style={ringStyle} />}

      {/* Avatar image or emoji fallback */}
      {src && !imgErr ? (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div
          style={{
            ...imgStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            fontSize: size * 0.45,
            lineHeight: 1,
          }}
        >
          {fallbackEmoji}
        </div>
      )}

      {/* Lock overlay */}
      {locked && (
        <div style={lockStyle}>🔒</div>
      )}

      {/* Tier badge */}
      {showBadge && frame.icon && !locked && (
        <div style={badgeStyle}>{frame.icon}</div>
      )}

      {/* Locked badge */}
      {showBadge && locked && (
        <div style={{ ...badgeStyle, fontSize: size >= 56 ? 12 : 10 }}>🔒</div>
      )}
    </div>
  );
};

export default AvatarFrame;
