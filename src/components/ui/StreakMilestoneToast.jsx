import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { STREAK_FRAMES } from './AvatarFrame';

// ─── Toast display config ─────────────────────────────────────────────────────
const AUTO_DISMISS_MS = 6000;

const FRAME_ACCENT_COLORS = {
  NONE:     '#9ca3af',
  SPARK:    '#f5a623',
  FLAME:    '#ff6b35',
  STORM:    '#ff4500',
  LEGEND:   '#ffd700',
  ELITE:    '#00d4ff',
  IMMORTAL: '#ff00aa',
};

const MILESTONE_DAYS = [3, 7, 14, 30, 60, 100];

// ─── Confetti (CSS-based, no dep) ────────────────────────────────────────────
const CONFETTI_COLORS = ['#f5a623', '#ff6b35', '#ffd700', '#00d4ff', '#7b2fff', '#ff0080'];

function MiniConfetti({ accent }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -10, x: Math.random() * 100 + '%', opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: '120%', opacity: 0, rotate: Math.random() * 360, scale: 0.5 }}
          transition={{ duration: 1.2 + Math.random() * 0.8, delay: Math.random() * 0.4, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            width: 5 + Math.random() * 5,
            height: 5 + Math.random() * 5,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * StreakMilestoneToast
 * Show when: streakData.loginStreak just crossed a MILESTONE_DAYS value.
 *
 * Usage:
 *   <StreakMilestoneToast streak={streakData} prevStreak={prevStreakRef.current} />
 *
 * Props:
 *   streak     — LoginStreakDTO from API
 *   prevStreak — previous loginStreak value (before latest login)
 */
const StreakMilestoneToast = ({ streak, prevStreak }) => {
  const [visible, setVisible] = useState(false);
  const [milestoneDays, setMilestoneDays] = useState(0);

  useEffect(() => {
    if (!streak || prevStreak == null) return;
    const crossed = MILESTONE_DAYS.find(m => prevStreak < m && streak.loginStreak >= m);
    if (crossed) {
      setMilestoneDays(crossed);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
      return () => clearTimeout(t);
    }
  }, [streak?.loginStreak]);

  if (!streak) return null;

  const frame = STREAK_FRAMES[streak.streakFrame] || STREAK_FRAMES.NONE;
  const accent = FRAME_ACCENT_COLORS[streak.streakFrame] || '#f5a623';
  const isNewFrame = MILESTONE_DAYS.includes(milestoneDays) && frame.days === milestoneDays;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="streak-toast"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.93 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9985] w-full max-w-sm px-4"
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#111113',
              border: `1px solid ${accent}40`,
              boxShadow: `0 0 32px ${accent}30`,
            }}
          >
            <MiniConfetti accent={accent} />

            <div className="relative px-5 py-4 flex items-start gap-3">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: accent + '18', border: `1px solid ${accent}30` }}
              >
                {frame.icon || '🔥'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-snug">
                  🎉 Chuỗi {milestoneDays} ngày!
                </p>
                {isNewFrame ? (
                  <p className="text-[12px] mt-0.5" style={{ color: accent }}>
                    Mở khóa khung mới: <strong>{frame.label}</strong> {frame.icon}
                  </p>
                ) : (
                  <p className="text-[12px] text-zinc-400 mt-0.5">
                    Bạn đang giữ chuỗi <strong>{streak.loginStreak} ngày</strong> liên tiếp.
                  </p>
                )}
              </div>

              {/* Close */}
              <button
                onClick={() => setVisible(false)}
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
              >
                <X size={11} className="text-zinc-500" />
              </button>
            </div>

            {/* Progress bar countdown */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
              className="h-0.5"
              style={{ background: accent }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakMilestoneToast;
