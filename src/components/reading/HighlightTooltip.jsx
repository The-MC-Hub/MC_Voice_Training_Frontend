import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const COLORS = [
  { id: 'yellow', hex: '#fef08a' }, // yellow-200
  { id: 'green', hex: '#bbf7d0' },  // green-200
  { id: 'blue', hex: '#bfdbfe' },   // blue-200
  { id: 'pink', hex: '#fbcfe8' }    // pink-200
];

const HighlightTooltip = ({ position, onHighlight, onClose }) => {
  const { t } = useTranslation();
  if (!position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="fixed z-50 flex items-center gap-2 p-1.5 bg-[#18181b] border border-white/[0.08] shadow-2xl rounded-xl"
      style={{ top: position.y - 50, left: position.x - 70 }}
    >
      <div className="flex gap-1.5 px-1.5">
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={(e) => {
              e.preventDefault();
              onHighlight(c.hex);
            }}
            className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform shadow-sm"
            style={{ backgroundColor: c.hex }}
            title={t('highlightTooltip.highlight')}
          />
        ))}
      </div>
      <div className="w-px h-5 bg-white/[0.1] mx-1"></div>
      <button
        onClick={onClose}
        className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
      >
        {t('common.cancel')}
      </button>
    </motion.div>
  );
};

export default HighlightTooltip;
