import React, { useEffect, useState } from 'react';
import { Shield, Lock, ImageDown, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { STREAK_FRAMES } from './AvatarFrame';
import api from '../../services/api';

// ─── Display config ───────────────────────────────────────────────────────────
const MILESTONE_LABELS = [3, 7, 14, 30, 60, 100];

const FRAME_ACCENT = {
  NONE:     '#9ca3af',
  SPARK:    '#f5a623',
  FLAME:    '#ff6b35',
  STORM:    '#ff4500',
  LEGEND:   '#eab308',
  ELITE:    '#0ea5e9',
  IMMORTAL: '#ec4899',
};

const FRAME_EMOJI = {
  NONE: '🌱', SPARK: '🔥', FLAME: '🔥', STORM: '⚡',
  LEGEND: '👑', ELITE: '💎', IMMORTAL: '✨',
};
const FRAME_TIER_KEY = {
  NONE: 'none', SPARK: 'spark', FLAME: 'flame', STORM: 'storm',
  LEGEND: 'legend', ELITE: 'elite', IMMORTAL: 'immortal',
};

const TIER_ORDER = ['NONE', 'SPARK', 'FLAME', 'STORM', 'LEGEND', 'ELITE', 'IMMORTAL'];

// ─── Component ────────────────────────────────────────────────────────────────
const StreakWidget = ({ onOpenCard, onStreakLoaded }) => {
  const { t } = useTranslation();
  const FRAME_HERO = TIER_ORDER.reduce((acc, k) => {
    acc[k] = { emoji: FRAME_EMOJI[k], label: t(`streakWidget.tiers.${FRAME_TIER_KEY[k]}`) };
    return acc;
  }, {});
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/streak')
      .then(r => {
        setStreak(r.data.data);
        onStreakLoaded?.(r.data.data);
        // Cache frame for Navbar to read without extra API call
        try { localStorage.setItem('mchub_streak_frame', r.data.data?.streakFrame || 'NONE'); } catch {}
      })
      .catch(() => setStreak(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-2xl bg-white border border-gray-100 h-44 animate-pulse shadow-sm" />;
  }
  if (!streak) return null;

  const { loginStreak, longestLoginStreak, freezesAvailable, streakFrame, nextFrame, daysToNextFrame } = streak;
  const accent     = FRAME_ACCENT[streakFrame] || FRAME_ACCENT.NONE;
  const hero       = FRAME_HERO[streakFrame]   || FRAME_HERO.NONE;
  const nextHero   = nextFrame ? FRAME_HERO[nextFrame]   : null;
  const nextAccent = nextFrame ? FRAME_ACCENT[nextFrame] : null;

  const prevM    = MILESTONE_LABELS.filter(m => m <= loginStreak).at(-1) ?? 0;
  const nextM    = MILESTONE_LABELS.find(m => m > loginStreak) ?? loginStreak;
  const progress = nextM === loginStreak ? 100
    : Math.round(((loginStreak - prevM) / (nextM - prevM)) * 100);

  const tierIdx = TIER_ORDER.indexOf(streakFrame);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden bg-white shadow-sm relative"
      style={{ border: `1px solid ${accent}30` }}
    >
      {/* Subtle top accent line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      {/* Faint radial glow top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 50% 70% at 5% 50%, ${accent}0c 0%, transparent 65%)` }}
      />

      <div className="relative flex items-stretch">

        {/* ── Left: hero + number ──────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center justify-center px-6 py-5 shrink-0"
          style={{ borderRight: `1px solid ${accent}18` }}
        >
          <motion.div
            animate={loginStreak > 0 ? { scale: [1, 1.07, 1] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-2"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: `${accent}12`,
                border: `1.5px solid ${accent}30`,
                boxShadow: `0 4px 16px ${accent}18`,
              }}
            >
              {hero.emoji}
            </div>
          </motion.div>

          <p className="text-[30px] font-black tabular-nums leading-none" style={{ color: accent }}>
            {loginStreak}
          </p>
          <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5">{t('streakWidget.daysUnit')}</p>
        </div>

        {/* ── Right: info ──────────────────────────────────────────────────── */}
        <div className="flex-1 py-4 px-4 flex flex-col justify-between min-w-0">

          {/* Tier label + freeze + record */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[13px] font-bold leading-snug" style={{ color: accent }}>
                {hero.label}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Trophy size={10} className="text-gray-400" />
                <span className="text-[11px] text-gray-400">
                  {t('streakWidget.recordLabel')} <span className="font-semibold text-gray-600">{t('streakWidget.recordValue', { count: longestLoginStreak })}</span>
                </span>
              </div>
            </div>

            {/* Freeze */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
              title={t('streakWidget.freezeTooltip')}
            >
              <Shield size={10} className="text-blue-400" />
              <span className="text-[11px] font-bold text-blue-500">{freezesAvailable}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400 font-medium">{t('streakWidget.progressLabel', { current: loginStreak, next: nextM })}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: accent }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: `linear-gradient(90deg, ${accent}90, ${accent})` }}
              >
                <motion.div
                  className="absolute inset-y-0 w-8"
                  animate={{ x: ['-200%', '400%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Tier track dots */}
          <div className="flex items-center gap-1">
            {TIER_ORDER.filter(t => t !== 'NONE').map((tier, i) => {
              const tAccent = FRAME_ACCENT[tier];
              const tHero   = FRAME_HERO[tier];
              const done    = TIER_ORDER.indexOf(tier) <= tierIdx;
              const current = tier === streakFrame;
              return (
                <div key={tier} className="flex items-center gap-1">
                  <div
                    title={`${tHero.label} — ${t('streakWidget.recordValue', { count: STREAK_FRAMES[tier]?.days })}`}
                    className="flex items-center justify-center rounded-full transition-all"
                    style={{
                      width: current ? 22 : 17,
                      height: current ? 22 : 17,
                      background: done ? `${tAccent}18` : '#f3f4f6',
                      border: `1.5px solid ${done ? tAccent + '50' : '#e5e7eb'}`,
                      opacity: done ? 1 : 0.5,
                      boxShadow: current ? `0 0 8px ${tAccent}40` : 'none',
                      fontSize: current ? 11 : 8,
                    }}
                  >
                    {tHero.emoji}
                  </div>
                  {i < 5 && (
                    <div
                      className="h-px"
                      style={{ width: 8, background: done ? `${tAccent}40` : '#e5e7eb' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Next locked tier ─────────────────────────────────────────────────── */}
      {nextHero && (
        <div
          className="mx-3 mb-3 px-3 py-2 rounded-xl flex items-center gap-2.5"
          style={{ background: `${nextAccent}08`, border: `1px solid ${nextAccent}20` }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center relative shrink-0"
            style={{ background: `${nextAccent}10`, border: `1px solid ${nextAccent}20`, fontSize: 16 }}
          >
            <span style={{ filter: 'grayscale(0.5) brightness(0.85)' }}>{nextHero.emoji}</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <Lock size={7} className="text-gray-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-gray-500 leading-snug">
              {t('streakWidget.nextLabel')} <span style={{ color: nextAccent }} className="font-bold">{nextHero.label}</span>
            </p>
            <p className="text-[10px] text-gray-400">
              <Trans i18nKey="streakWidget.daysToUnlock" values={{ days: daysToNextFrame }} components={{ 1: <strong style={{ color: nextAccent }} /> }} />
            </p>
          </div>
          <Zap size={12} style={{ color: nextAccent, opacity: 0.5 }} className="shrink-0" />
        </div>
      )}

      {!nextHero && (
        <div className="mx-3 mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
          <span>✨</span>
          <p className="text-[11px] font-bold text-yellow-700">{t('streakWidget.maxTierReached')}</p>
        </div>
      )}

      {/* ── Save button ──────────────────────────────────────────────────────── */}
      <button
        onClick={onOpenCard}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-gray-100 text-[12px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
      >
        <ImageDown size={13} />
        {t('streakWidget.saveImageBtn')}
      </button>
    </motion.div>
  );
};

export default StreakWidget;
