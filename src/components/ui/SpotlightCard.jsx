import React, { useRef, useCallback } from 'react';

/**
 * SpotlightCard — mouse-tracking radial gradient spotlight on hover.
 * Usage:
 *   <SpotlightCard className="p-6 rounded-md bg-white border border-gray-100">
 *     content
 *   </SpotlightCard>
 *
 * Props:
 *   spotlightColor  — CSS color string for the spotlight (default: amber)
 *   spotlightSize   — radius in px (default: 350)
 *   className       — card container classes
 *   style           — additional inline styles
 *   children
 *   ...rest         — forwarded to the div (onClick, etc.)
 */
const SpotlightCard = ({
  children,
  className = '',
  style = {},
  spotlightColor = 'rgba(245,166,35,0.13)',
  spotlightSize = 350,
  ...rest
}) => {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spotlight-x', `${x}px`);
    card.style.setProperty('--spotlight-y', `${y}px`);
    card.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      style={{
        '--spotlight-color': spotlightColor,
        '--spotlight-size': `${spotlightSize}px`,
        '--spotlight-x': '50%',
        '--spotlight-y': '50%',
        '--spotlight-opacity': '0',
        position: 'relative',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {/* Spotlight overlay — sits above bg, below content */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)`,
          opacity: 'var(--spotlight-opacity)',
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Content above spotlight */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
