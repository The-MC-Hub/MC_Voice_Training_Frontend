import React from 'react';
import { motion } from 'framer-motion';

const PageBanner = ({ icon, eyebrow, title, highlight, description, stats = [], accentColor = '#f5a623' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[#111113] border border-white/[0.08] rounded-2xl overflow-hidden mb-8"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${accentColor}66 35%, ${accentColor}66 65%, transparent 95%)` }}
      />
      {/* Glow left */}
      <div
        className="absolute top-0 left-0 w-[400px] h-[160px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${accentColor}12 0%, transparent 65%)` }}
      />

      <div className="relative z-10 px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">

        {/* Icon */}
        {icon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}28`,
              color: accentColor,
              boxShadow: `0 0 20px ${accentColor}18`,
            }}
          >
            {icon}
          </motion.div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
              className="text-[11px] font-semibold uppercase tracking-widest mb-1"
              style={{ color: accentColor }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl font-bold text-white tracking-tight leading-snug"
          >
            {title}{highlight && <> <span style={{ color: accentColor }}>{highlight}</span></>}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.26 }}
              className="text-zinc-500 text-[13px] mt-1 leading-relaxed max-w-lg"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex items-center gap-5 shrink-0">
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-8 bg-white/[0.07]" />}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PageBanner;
