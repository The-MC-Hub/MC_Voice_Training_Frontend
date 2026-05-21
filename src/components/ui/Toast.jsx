import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const iconMap = {
  success: { icon: CheckCircle, color: '#22c55e' },
  error:   { icon: XCircle,     color: '#ef4444' },
  info:    { icon: Info,         color: '#fdb813' },
};

const Toast = ({ id, type = 'info', message, onClose }) => {
  const { icon: Icon, color } = iconMap[type] || iconMap.info;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'rgba(15,23,42,0.95)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        minWidth: 280,
        maxWidth: 380,
        cursor: 'default',
      }}
    >
      <Icon size={18} style={{ color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={() => onClose(id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timerRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRef.current[id]);
  }, []);

  const toast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.slice(-3);
    });
    timerRef.current[id] = setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'flex-end',
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
};

export default ToastProvider;
