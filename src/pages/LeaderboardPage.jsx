import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import {
  Trophy, Medal, Award, Crown, Sparkles, Flame,
  Clock, Mic, TrendingUp, RefreshCw, ChevronUp,
  ArrowUp, ArrowDown, Minus, Users, Zap, Target,
  Share2, Copy, Check, X, Filter, Star, ChevronRight,
  TrendingDown
} from 'lucide-react';
import { getLeaderboard, getMyRank } from '../services/communityService';
import { trackLeaderboardFilter, trackLeaderboardShare } from '@/utils/analytics';
import { questService } from '../services/questService';
import { useAuthStore } from '../store/useAuthStore';
import PageBanner from '../components/ui/PageBanner';
import Breadcrumb from '../components/ui/Breadcrumb';
import { Button } from "@/components/animate-ui/components/buttons/button";

// ─── Constants ────────────────────────────────────────────────────────────────
// Note: `label` fields below are now resolved via i18n at render time using LABEL_KEYS maps,
// kept here only as fallback technical identifiers where needed.

const TYPES = [
  { key: 'streak',   labelKey: 'leaderboard.typeStreak',   icon: Flame,  unitKey: 'leaderboard.unitDays',      field: 'currentStreak' },
  { key: 'diligent', labelKey: 'leaderboard.typeDiligent', icon: Clock,  unitKey: 'leaderboard.unitHours',     field: 'totalPracticeHours' },
  { key: 'sessions', labelKey: 'leaderboard.typeSessions', icon: Mic,    unitKey: 'leaderboard.unitSessions',  field: 'totalSessions' },
];

const PERIODS = [
  { key: 'all_time', labelKey: 'leaderboard.periodAllTime' },
  { key: 'weekly',   labelKey: 'leaderboard.periodWeekly' },
];

// Tier thresholds (streak days as baseline reference)
const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE_LEGEND'];
const TIER_THRESHOLDS = {
  BRONZE:       { min: 0,   max: 6,   labelKey: 'leaderboard.tierBronze',      next: 'SILVER',       emoji: '🥉' },
  SILVER:       { min: 7,   max: 13,  labelKey: 'leaderboard.tierSilver',      next: 'GOLD',         emoji: '🥈' },
  GOLD:         { min: 14,  max: 29,  labelKey: 'leaderboard.tierGold',        next: 'PLATINUM',     emoji: '🥇' },
  PLATINUM:     { min: 30,  max: 59,  labelKey: 'leaderboard.tierPlatinum',    next: 'DIAMOND',      emoji: '💎' },
  DIAMOND:      { min: 60,  max: 99,  labelKey: 'leaderboard.tierDiamond',     next: 'ELITE_LEGEND', emoji: '💠' },
  ELITE_LEGEND: { min: 100, max: 999, labelKey: 'leaderboard.tierEliteLegend', next: null,           emoji: '👑' },
};

const TIER_COLORS = {
  ELITE_LEGEND: { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    bar: 'from-red-600 to-red-400' },
  DIAMOND:      { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200',   bar: 'from-cyan-600 to-cyan-400' },
  PLATINUM:     { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', bar: 'from-indigo-600 to-indigo-400' },
  GOLD:         { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  bar: 'from-amber-600 to-amber-400' },
  SILVER:       { bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200',   bar: 'from-gray-500 to-gray-400' },
  BRONZE:       { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', bar: 'from-orange-700 to-orange-500' },
};

const PODIUM_STYLES = [
  { ring: 'ring-amber-400/70', bg: 'bg-amber-100', label: 'text-amber-600', icon: Trophy, iconColor: 'text-amber-600', order: 'order-2', h: 'h-24', glow: 'rgba(245,158,11,0.20)', shimmer: true },
  { ring: 'ring-gray-400/50',  bg: 'bg-gray-100',  label: 'text-gray-600',  icon: Medal,  iconColor: 'text-gray-600',  order: 'order-1', h: 'h-16', glow: 'rgba(156,163,175,0.15)', shimmer: false },
  { ring: 'ring-orange-400/50',bg: 'bg-orange-100',label: 'text-orange-600',icon: Award,  iconColor: 'text-orange-600',order: 'order-3', h: 'h-12', glow: 'rgba(234,88,12,0.15)',  shimmer: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTierProgress = (tier, streakValue) => {
  const tt = TIER_THRESHOLDS[tier];
  if (!tt || !tt.next) return { pct: 100, needed: 0, nextTier: null };
  const nextT = TIER_THRESHOLDS[tt.next];
  const range = nextT.min - tt.min;
  const done  = Math.min(streakValue - tt.min, range);
  const pct   = Math.round((done / range) * 100);
  const needed = nextT.min - streakValue;
  return { pct: Math.max(0, Math.min(100, pct)), needed: Math.max(0, needed), nextTier: tt.next };
};

const fireCelebration = () => {
  const opts = { particleCount: 80, spread: 70, origin: { y: 0.55 }, colors: ['#f59e0b', '#10b981', '#6366f1', '#ef4444'] };
  confetti({ ...opts, angle: 60, origin: { x: 0.1, y: 0.6 } });
  confetti({ ...opts, angle: 120, origin: { x: 0.9, y: 0.6 } });
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

const AnimatedNumber = ({ value, decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const target = Number(value) || 0;
    const duration = 800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, inView]);

  return (
    <span ref={ref}>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
    </span>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TierBadge = ({ tier }) => {
  const { t } = useTranslation();
  const c = TIER_COLORS[tier] || TIER_COLORS.BRONZE;
  const label = tier === 'ELITE_LEGEND' ? t('leaderboard.tierEliteShort') : tier;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {tier === 'ELITE_LEGEND' && <Crown size={8} />}
      {tier === 'DIAMOND' && <Sparkles size={8} />}
      {label}
    </span>
  );
};

const Avatar = ({ src, name, size = 'md', online = false }) => {
  const cls = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const isUrl = src && src.startsWith('http');
  const isEmoji = src && !src.includes('.') && src.length <= 4;
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div className="relative shrink-0">
      <div className={`${cls} rounded-full bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center overflow-hidden font-semibold text-gray-500`}>
        {isUrl ? <img src={src} alt={name} className="w-full h-full object-cover" />
               : isEmoji ? <span>{src}</span>
               : initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      )}
    </div>
  );
};

const MovementBadge = ({ delta }) => {
  if (delta === undefined || delta === null || delta === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-gray-400"><Minus size={8} /></span>
  );
  if (delta > 0) return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-500 font-semibold">
      <ArrowUp size={8} />{delta}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-red-400 font-semibold">
      <ArrowDown size={8} />{Math.abs(delta)}
    </span>
  );
};

const MetricValue = ({ entry, typeKey, field, unitKey }) => {
  const { t } = useTranslation();
  let val = entry[field];
  if (typeKey === 'diligent') val = Number(val).toFixed(1);
  const showFire = typeKey === 'streak' && entry.currentStreak >= 3;
  return (
    <span className="text-[13px] font-semibold text-gray-900 tabular-nums flex items-center gap-1">
      {showFire && <Flame size={12} className="text-orange-400 shrink-0" />}
      {val} <span className="text-gray-400 font-normal text-[11px]">{t(unitKey)}</span>
    </span>
  );
};

const SkeletonRow = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
  >
    <div className="w-6 h-3 bg-gray-200 rounded animate-pulse" />
    <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0 animate-pulse" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
      <div className="h-2 bg-gray-100 rounded w-16 animate-pulse" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
  </motion.div>
);

// ─── Feature #2: Share Modal ───────────────────────────────────────────────────

const ShareModal = ({ myEntry, typeMeta, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareText = myEntry
    ? t('leaderboard.shareTextWithRank', { rank: myEntry.rank, streak: myEntry.currentStreak, tier: myEntry.currentTier })
    : t('leaderboard.shareTextDefault');

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tierC = TIER_COLORS[myEntry?.currentTier] || TIER_COLORS.BRONZE;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Share Card Preview */}
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-3">
          {/* Card */}
          <div className="bg-[#0d0d10] p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/8 rounded-full blur-2xl" />
            </div>

            {/* Logo */}
            <div className="flex items-center gap-1 mb-5">
              <span className="text-[14px] font-bold text-white">MC</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[14px] font-bold text-white">Hub</span>
              <span className="ml-2 text-[10px] text-zinc-600">Voice Training</span>
            </div>

            {/* Rank display */}
            <div className="flex items-center gap-4 mb-5">
              <Avatar src={myEntry?.userAvatar} name={myEntry?.userName} size="lg" />
              <div>
                <p className="text-[15px] font-bold text-white">{myEntry?.userName || t('leaderboard.you')}</p>
                <TierBadge tier={myEntry?.currentTier || 'BRONZE'} />
                <p className="text-[24px] font-black text-amber-400 leading-none mt-1">
                  #{myEntry?.rank || '?'}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t('leaderboard.statStreak'), value: `${myEntry?.currentStreak || 0} ${t('leaderboard.unitDays')}`, icon: '🔥' },
                { label: t('leaderboard.statHours'), value: `${Number(myEntry?.totalPracticeHours || 0).toFixed(1)}h`, icon: '⏱️' },
                { label: t('leaderboard.statSessions'), value: `${myEntry?.totalSessions || 0}`, icon: '🎤' },
              ].map(s => (
                <div key={s.label} className="bg-white/4 rounded-lg p-2 text-center">
                  <p className="text-[14px]">{s.icon}</p>
                  <p className="text-[12px] font-bold text-white">{s.value}</p>
                  <p className="text-[9px] text-zinc-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action bar */}
          <div className="bg-[#111114] border-t border-white/6 p-3 flex items-center gap-2">
            <Button
              onClick={handleCopy}
              hoverScale={1}
              className="h-auto flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-[12px] font-medium text-zinc-300 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? t('leaderboard.copied') : t('leaderboard.copyText')}
            </Button>
            <Button
              onClick={onClose}
              className="h-auto w-9 h-9 flex items-center justify-center rounded-lg bg-white/4 hover:bg-white/8 text-zinc-500 transition-colors"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600">{t('leaderboard.shareFooter')}</p>
      </motion.div>
    </motion.div>
  );
};

// ─── Feature #3: Tier Progress Card ───────────────────────────────────────────

const TierProgressCard = ({ myEntry }) => {
  const { t } = useTranslation();
  if (!myEntry) return null;
  const tier = myEntry.currentTier || 'BRONZE';
  const streak = myEntry.currentStreak || 0;
  const { pct, needed, nextTier } = getTierProgress(tier, streak);
  const tierC = TIER_COLORS[tier] || TIER_COLORS.BRONZE;
  const nextT = nextTier ? TIER_THRESHOLDS[nextTier] : null;
  const nextC = nextTier ? TIER_COLORS[nextTier] : null;
  const isMax = !nextTier;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-3 shadow-sm"
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <Target size={13} className="text-indigo-500" />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{t('leaderboard.tierProgressTitle')}</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Current → Next tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px]">{TIER_THRESHOLDS[tier]?.emoji}</span>
            <span className={`text-[12px] font-bold ${tierC.text}`}>{t(TIER_THRESHOLDS[tier]?.labelKey)}</span>
          </div>
          {!isMax && (
            <>
              <ChevronRight size={14} className="text-gray-400" />
              <div className="flex items-center gap-1.5">
                <span className="text-[16px]">{nextT?.emoji}</span>
                <span className={`text-[12px] font-bold ${nextC?.text}`}>{t(nextT?.labelKey)}</span>
              </div>
            </>
          )}
          {isMax && (
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Crown size={11} /> {t('leaderboard.peakReached')}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isMax ? (
          <>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className={`h-full bg-linear-to-r ${tierC.bar} rounded-full`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">{t('leaderboard.percentComplete', { pct })}</span>
              <span className={`font-semibold ${nextC?.text}`}>
                {t('leaderboard.needMoreStreakDays', { needed })}
              </span>
            </div>
          </>
        ) : (
          <div className="h-2 bg-amber-500/20 rounded-full overflow-hidden">
            <div className="h-full w-full bg-linear-to-r from-amber-600 to-amber-400 rounded-full" />
          </div>
        )}

        {/* Milestone hint */}
        {!isMax && (
          <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-orange-50 rounded-lg px-3 py-2">
            <Flame size={10} className="text-orange-400 shrink-0" />
            {t('leaderboard.maintainStreakHint', { needed })} <span className={`font-semibold ${nextC?.text} ml-1`}>{t(nextT?.labelKey)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Feature #4: Personal Best Badge ──────────────────────────────────────────

const PersonalBestBadge = ({ allTimeEntry, weeklyEntry, typeMeta }) => {
  const { t } = useTranslation();
  if (!allTimeEntry || !weeklyEntry) return null;
  const field = typeMeta.field;
  const weekly = Number(weeklyEntry[field]) || 0;
  const allTime = Number(allTimeEntry[field]) || 0;

  // Weekly better than all-time average proxy: weekly > allTime / 4
  const isBestWeek = weekly > 0 && weekly >= allTime * 0.25;
  if (!isBestWeek) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', delay: 0.3 }}
      className="flex items-center gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-lg"
    >
      <Star size={12} className="text-amber-400 shrink-0" />
      <p className="text-[10px] text-amber-400 font-semibold">{t('leaderboard.bestWeekBadge', { label: t(typeMeta.labelKey) })}</p>
    </motion.div>
  );
};

// ─── Feature #1: Same-tier Filter Toggle ──────────────────────────────────────

const FilterBar = ({ myTier, filterSameTier, setFilterSameTier, totalShown, totalAll }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
    <Button
      onClick={() => setFilterSameTier(v => !v)}
      className={`h-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
        filterSameTier
          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
          : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
      }`}
    >
      <Filter size={10} />
      {t('leaderboard.sameTier')} {myTier && filterSameTier ? `(${myTier})` : ''}
    </Button>
    {filterSameTier && (
      <span className="text-[10px] text-gray-400">
        {t('leaderboard.shownOfTotalPeople', { shown: totalShown, total: totalAll })}
      </span>
    )}
  </div>
  );
};

// ─── Community Stats Bar ──────────────────────────────────────────────────────

const StatsBar = ({ total }) => {
  const { t } = useTranslation();
  return (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="flex items-center gap-6 px-5 py-4 border border-amber-200 rounded-xl mb-6 overflow-x-auto relative overflow-hidden bg-white shadow-sm"
  >
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
        <Users size={12} className="text-amber-600" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500">{t('leaderboard.totalMembers')}</p>
        <p className="text-[13px] font-bold text-gray-900 tabular-nums">
          <AnimatedNumber value={total} />
        </p>
      </div>
    </div>
    <div className="w-px h-8 bg-gray-200 shrink-0" />
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
        <Flame size={12} className="text-orange-500" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500">{t('leaderboard.competing')}</p>
        <p className="text-[13px] font-bold text-orange-500">🔥 {t('leaderboard.active')}</p>
      </div>
    </div>
    <div className="w-px h-8 bg-gray-200 shrink-0" />
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
        <Zap size={12} className="text-emerald-600" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500">{t('leaderboard.updated')}</p>
        <p className="text-[13px] font-bold text-emerald-600">{t('leaderboard.realTime')}</p>
      </div>
    </div>
  </motion.div>
  );
};

// ─── Podium (top 3) ───────────────────────────────────────────────────────────

const Podium = ({ entries, type, currentUserId }) => {
  const { t } = useTranslation();
  const [first, second, third] = entries;
  const pods = [
    { entry: second, style: PODIUM_STYLES[1], rank: 2 },
    { entry: first,  style: PODIUM_STYLES[0], rank: 1 },
    { entry: third,  style: PODIUM_STYLES[2], rank: 3 },
  ].filter(p => p.entry);

  const field = TYPES.find(tp => tp.key === type.key)?.field;
  const unitKey = TYPES.find(tp => tp.key === type.key)?.unitKey;

  return (
    <div className="flex items-end justify-center gap-6 pt-8 pb-8 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-400/6 rounded-full blur-2xl" />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-400/40"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-4, 4, -4], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      {pods.map(({ entry, style, rank }) => {
        const Icon = style.icon;
        const isMe = entry.userId === currentUserId;
        const delay = rank === 1 ? 0.05 : rank === 2 ? 0.15 : 0.25;

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
            className={`${style.order} flex flex-col items-center gap-2 relative`}
          >
            {rank === 1 && style.shimmer && (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 left-1/2 -translate-x-1/2"
              >
                <Crown size={20} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,1)]" />
              </motion.div>
            )}

            <div
              className={`relative ring-2 ${style.ring} rounded-full ${isMe ? 'ring-offset-2 ring-offset-white' : ''}`}
              style={{ boxShadow: `0 0 20px ${style.glow}` }}
            >
              <Avatar src={entry.userAvatar} name={entry.userName} size="lg" />
              <motion.span
                animate={rank === 1 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${style.bg} flex items-center justify-center`}
              >
                <Icon size={11} className={style.iconColor} />
              </motion.span>
            </div>

            <div className="text-center space-y-0.5 max-w-22">
              <p className={`text-[12px] font-semibold truncate ${isMe ? 'text-emerald-600' : 'text-gray-900'}`}>
                {entry.userName}
              </p>
              <p className={`text-[12px] font-black ${style.label}`}>
                {field === 'totalPracticeHours' ? Number(entry[field]).toFixed(1) + 'h' : `${entry[field]} ${t(unitKey)}`}
              </p>
            </div>

            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200, damping: 25 }}
              style={{ transformOrigin: 'bottom' }}
              className={`${style.h} w-20 rounded-t-xl ${style.bg} border border-gray-200 flex items-center justify-center relative overflow-hidden`}
              style={{ boxShadow: rank === 1 ? '0 -4px 20px rgba(245,158,11,0.12)' : undefined }}
            >
              <div className="absolute inset-0 bg-linear-to-b from-white/50 to-transparent" />
              <span className={`text-[20px] font-black ${style.label} relative z-10`}>#{rank}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Leaderboard Row ──────────────────────────────────────────────────────────

const LeaderboardRow = ({ entry, type, isMe, index }) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), type: 'spring', stiffness: 280, damping: 28 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`grid grid-cols-[44px_1fr_auto] gap-3 items-center px-4 py-3 border-b border-gray-100 last:border-0 transition-colors relative ${
        isMe ? 'bg-emerald-50 border-l-2 border-l-emerald-400' : ''
      }`}
    >
      <AnimatePresence>
        {hovered && !isMe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)' }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-[12px] font-semibold text-gray-400">{entry.rank}</span>
        <MovementBadge delta={entry.rankDelta} />
      </div>

      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar src={entry.userAvatar} name={entry.userName} size="sm" online={entry.recentlyActive} />
        <div className="min-w-0">
          <p className={`text-[13px] font-medium truncate ${isMe ? 'text-emerald-600' : 'text-gray-900'}`}>
            {entry.userName}
            {isMe && <span className="ml-1.5 text-[10px] text-emerald-500 font-normal">{t('leaderboard.youParen')}</span>}
          </p>
          <div className="mt-0.5">
            <TierBadge tier={entry.currentTier} />
          </div>
        </div>
      </div>

      <MetricValue entry={entry} typeKey={type.key} field={type.field} unitKey={type.unitKey} />
    </motion.div>
  );
};

// ─── My Rank Card ─────────────────────────────────────────────────────────────

const MyRankCard = ({ myEntry, total, typeMeta, onShare }) => {
  const { t } = useTranslation();
  if (!myEntry) return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <Trophy size={18} className="text-gray-400" />
      </div>
      <p className="text-[12px] text-gray-500 leading-relaxed">{t('leaderboard.noDataYet')}<br/>{t('leaderboard.practiceToRank')}</p>
    </motion.div>
  );

  const percentile = total > 1 ? Math.round((1 - (myEntry.rank - 1) / total) * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.15 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-500" />
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{t('leaderboard.yourRank')}</span>
        </div>
        {/* Feature #2: Share button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors text-[10px] font-medium"
        >
          <Share2 size={10} />
          {t('leaderboard.share')}
        </motion.button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar src={myEntry.userAvatar} name={myEntry.userName} size="md" />
          <div>
            <p className="text-[13px] font-semibold text-gray-900">{myEntry.userName}</p>
            <TierBadge tier={myEntry.currentTier} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 relative overflow-hidden">
            <p className="text-[10px] text-gray-500 mb-0.5">{t('leaderboard.rank')}</p>
            <p className="text-[20px] font-black text-amber-600 leading-none">
              #<AnimatedNumber value={myEntry.rank} />
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 relative overflow-hidden">
            <p className="text-[10px] text-gray-500 mb-0.5">{t(typeMeta.labelKey)}</p>
            <p className="text-[20px] font-black text-gray-900 leading-none flex items-end gap-1">
              <AnimatedNumber
                value={typeMeta.key === 'diligent' ? Number(myEntry[typeMeta.field]) : myEntry[typeMeta.field]}
                decimals={typeMeta.key === 'diligent' ? 1 : 0}
              />
              <span className="text-[10px] font-normal text-gray-400 mb-0.5">{t(typeMeta.unitKey)}</span>
            </p>
          </div>
        </div>

        {/* Percentile bar */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-gray-500">{t('leaderboard.surpassed')}</p>
            <span className="text-[12px] font-bold text-emerald-400">{percentile}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentile}%` }}
              transition={{ duration: 1, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{t('leaderboard.usersUnit')}</p>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between px-3 py-2 bg-orange-500/5 border border-orange-500/10 rounded-lg">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Flame size={12} className="text-orange-400" />
            <span>{t('leaderboard.currentStreak')}</span>
          </div>
          <span className="text-[13px] font-bold text-orange-500">{myEntry.currentStreak} {t('leaderboard.unitDays')}</span>
        </div>

        {/* Goal nudge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
          <Target size={11} className="text-gray-400 shrink-0" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            {t('leaderboard.goalNudge')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const LeaderboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [type, setType]     = useState(TYPES[0]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [entries, setEntries]     = useState([]);
  const [myEntry, setMyEntry]     = useState(null);
  const [myAllTimeEntry, setMyAllTimeEntry] = useState(null); // for personal best comparison
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [hasMore, setHasMore]     = useState(true);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showShare, setShowShare]     = useState(false);
  const [filterSameTier, setFilterSameTier] = useState(false); // Feature #1
  const [celebrationFired, setCelebrationFired] = useState(false);
  const loaderRef = useRef(null);
  const PAGE_SIZE = 20;

  useEffect(() => { questService.completeQuest('leaderboard').catch(() => {}); }, []);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    try {
      const res = await getLeaderboard({ type: type.key, period: period.key, page: pageNum, size: PAGE_SIZE });
      const content = res.data?.content ?? [];
      const totalEls = res.data?.totalElements ?? 0;
      setTotal(totalEls);
      setEntries(prev => reset ? content : [...prev, ...content]);
      setHasMore(content.length === PAGE_SIZE && (pageNum + 1) * PAGE_SIZE < totalEls);
    } catch {
      setHasMore(false);
    }
  }, [type, period]);

  const fetchMyRank = useCallback(async () => {
    try {
      const res = await getMyRank({ type: type.key, period: period.key });
      setMyEntry(res.data ?? null);
      return res.data;
    } catch {
      setMyEntry(null);
      return null;
    }
  }, [type, period]);

  // Fetch all-time rank for personal best comparison (only when on weekly tab)
  const fetchMyAllTimeRank = useCallback(async () => {
    if (period.key !== 'weekly') return;
    try {
      const res = await getMyRank({ type: type.key, period: 'all_time' });
      setMyAllTimeEntry(res.data ?? null);
    } catch {
      setMyAllTimeEntry(null);
    }
  }, [type, period]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setPage(0);
      setEntries([]);
      setHasMore(true);
      setCelebrationFired(false);
      const [, entry] = await Promise.all([fetchPage(0, true), fetchMyRank()]);
      if (!cancelled) {
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [type, period]);

  // Fetch all-time in background for personal best
  useEffect(() => {
    fetchMyAllTimeRank();
  }, [fetchMyAllTimeRank]);

  // Feature #5: confetti when top 10
  useEffect(() => {
    if (myEntry && myEntry.rank <= 10 && !celebrationFired && !loading) {
      const t = setTimeout(() => {
        fireCelebration();
        setCelebrationFired(true);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [myEntry, loading, celebrationFired]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        setLoadingMore(true);
        fetchPage(nextPage).finally(() => setLoadingMore(false));
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [loaderRef, hasMore, loadingMore, loading, page, fetchPage]);

  useEffect(() => {
    const h = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    setEntries([]);
    setCelebrationFired(false);
    await Promise.all([fetchPage(0, true), fetchMyRank()]);
    setRefreshing(false);
  };

  // Feature #1: same-tier filter
  const myTier = myEntry?.currentTier;
  const filteredEntries = filterSameTier && myTier
    ? entries.filter(e => e.currentTier === myTier)
    : entries;

  const podiumEntries = filteredEntries.slice(0, 3);
  const listEntries   = filteredEntries.slice(3);
  const tabKey = `${type.key}-${period.key}`;

  // Feature #5: top 10 banner
  const isTop10 = myEntry && myEntry.rank <= 10;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative overflow-x-hidden">
      <PageBanner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Breadcrumb items={[{ label: t('navbar.home'), href: '/' }, { label: t('leaderboard.pageTitle') }]} />

        {/* Feature #5: Top 10 congrats banner */}
        <AnimatePresence>
          {isTop10 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="mt-4 mb-2"
            >
              <div className="flex items-center gap-3 px-4 py-3 border border-amber-500/25 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%)', boxShadow: '0 0 24px rgba(245,158,11,0.08)' }}>
                <motion.span
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-[20px]"
                >
                  🎉
                </motion.span>
                <div>
                  <p className="text-[13px] font-bold text-amber-400">{t('leaderboard.topRank', { rank: myEntry.rank })}</p>
                  <p className="text-[11px] text-zinc-500">{t('leaderboard.keepItUp')}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[24px] font-black text-amber-400/30">#{myEntry.rank}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-4 mb-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.1, 1] }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
                style={{ boxShadow: '0 0 24px rgba(245,158,11,0.15)' }}
              >
                <Trophy size={22} className="text-amber-400" />
              </motion.div>
              <div>
                <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-none">{t('leaderboard.pageTitle')}</h1>
                <p className="text-[12px] text-gray-400 mt-0.5 font-mono">
                  {t('leaderboard.competingRealtime', { count: total })}
                </p>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors text-[12px] disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {t('leaderboard.refresh')}
          </motion.button>
        </motion.div>

        {/* Stats bar */}
        <StatsBar total={total} />

        {/* Period tabs */}
        <div className="flex gap-1 p-1 border border-gray-200 rounded-xl w-fit mb-4 bg-white shadow-sm">
          {PERIODS.map(p => (
            <Button
              key={p.key}
              onClick={() => { setPeriod(p); trackLeaderboardFilter(type.key, p.key); }}
              hoverScale={1}
              className={`h-auto px-4 py-1.5 rounded-md text-[12px] font-medium transition-all relative ${
                period.key === p.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {period.key === p.key && (
                <motion.div
                  layoutId="period-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.08) 100%)', boxShadow: '0 0 12px rgba(245,158,11,0.1)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t(p.labelKey)}</span>
            </Button>
          ))}
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-6">
          {TYPES.map(tp => {
            const Icon = tp.icon;
            const active = type.key === tp.key;
            return (
              <motion.button
                key={tp.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setType(tp); trackLeaderboardFilter(tp.key, period.key); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all relative overflow-hidden ${
                  active
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="type-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%)', boxShadow: '0 0 16px rgba(245,158,11,0.12) inset' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={13} className="relative z-10" />
                <span className="relative z-10">{t(tp.labelKey)}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Main layout */}
        <div className="flex gap-6 items-start">

          {/* Left: leaderboard */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tabKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                data-quest="quest-leaderboard-table"
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Podium */}
                {loading ? (
                  <div className="h-56 flex items-center justify-center">
                    <div className="flex items-end gap-6">
                      {[16, 24, 12].map((h, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                          <div className="w-14 h-14 rounded-full bg-gray-200" />
                          <div className="h-2 w-16 bg-gray-200 rounded" />
                          <div className="w-20 bg-gray-100 rounded-t-lg" style={{ height: `${h * 4}px` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : podiumEntries.length > 0 ? (
                  <div className="border-b border-amber-100 relative" style={{ background: 'linear-gradient(180deg, rgba(245,158,11,0.05) 0%, transparent 100%)' }}>
                    <Podium entries={podiumEntries} type={type} currentUserId={user?.id} />
                  </div>
                ) : null}

                {/* Feature #1: Filter bar */}
                {myTier && !loading && (
                  <FilterBar
                    myTier={myTier}
                    filterSameTier={filterSameTier}
                    setFilterSameTier={setFilterSameTier}
                    totalShown={filteredEntries.length}
                    totalAll={entries.length}
                  />
                )}

                {/* Column header */}
                <div className="grid grid-cols-[44px_1fr_auto] gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">#</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t('leaderboard.userColumn')}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t(type.labelKey)}</span>
                </div>

                {/* Rows */}
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} delay={i * 0.04} />)
                ) : filteredEntries.length === 0 ? (
                  <div className="py-20 text-center">
                    <TrendingUp size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-[13px] text-gray-400">
                      {filterSameTier ? t('leaderboard.noSameTierPeople') : t('leaderboard.noDataYet')}
                    </p>
                  </div>
                ) : (
                  listEntries.map((entry, idx) => (
                    <LeaderboardRow
                      key={entry.userId + entry.rank}
                      entry={entry}
                      type={type}
                      isMe={entry.userId === user?.id}
                      index={idx}
                    />
                  ))
                )}

                <div ref={loaderRef} className="h-4" />
                {loadingMore && (
                  <div className="py-5 flex justify-center">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-amber-400 rounded-full animate-spin" />
                  </div>
                )}
                {!hasMore && filteredEntries.length > 0 && !filterSameTier && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[11px] text-gray-400 py-4"
                  >
                    {t('leaderboard.allShown', { total })}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right sidebar — sticky */}
          <div className="w-64 shrink-0 sticky top-20 space-y-0">
            {/* My rank card with share button */}
            <MyRankCard
              myEntry={myEntry}
              total={total}
              typeMeta={type}
              onShare={() => { setShowShare(true); trackLeaderboardShare(myEntry?.rank); }}
            />

            {/* Feature #4: Personal best badge (weekly period only) */}
            {period.key === 'weekly' && myEntry && myAllTimeEntry && (
              <div className="mt-3">
                <PersonalBestBadge
                  allTimeEntry={myAllTimeEntry}
                  weeklyEntry={myEntry}
                  typeMeta={type}
                />
              </div>
            )}

            {/* Feature #3: Tier progress */}
            <TierProgressCard myEntry={myEntry} />
          </div>
        </div>
      </div>

      {/* Feature #2: Share modal */}
      <AnimatePresence>
        {showShare && (
          <ShareModal
            myEntry={myEntry}
            typeMeta={type}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 hover:text-amber-300 transition-all z-10"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%)', boxShadow: '0 0 20px rgba(245,158,11,0.15)' }}
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPage;
