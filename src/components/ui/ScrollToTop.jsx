import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrollProgress } from '../../hooks/useScrollProgress';

const ScrollToTop = () => {
  const progress = useScrollProgress();
  const visible = progress > 0.1;

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={handleClick}
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '1.5rem',
            zIndex: 999,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--accent-gold)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(253,184,19,0.35)',
          }}
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
