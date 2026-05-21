import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ icon: Icon = SearchX, title = 'Nothing here', description = '', action = null }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      gap: '1rem',
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(253,184,19,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.5rem',
      }}
    >
      <Icon size={28} style={{ color: 'var(--accent-gold)' }} />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
    {description && (
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: 320 }}>{description}</p>
    )}
    {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
  </div>
);

export default EmptyState;
