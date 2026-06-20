import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy, Medal, Award, Crown, Sparkles, Flame,
  Clock, Mic, TrendingUp, RefreshCw, ChevronUp,
  ArrowUp, ArrowDown, Minus, Users, Zap, Target,
  Share2, Copy, Check, X, Filter, Star, ChevronRight,
  TrendingDown
} from 'lucide-react';
import { getLeaderboard, getMyRank } from '../services/communityService';
import { trackLeaderboardFilter, trackLeaderboardShare } from '@/utils/analytics';
import { useAuthStore } from '../store/useAuthStore';
import PageBanner from '../components/ui/PageBanner';
import Breadcrumb from '../components/ui/Breadcrumb';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES = [
  { key: 'streak',   label: 'Chuỗi ngày',  icon: Flame,  unit: 'ngày', field: 'currentStreak' },
  { key: 'diligent', label: 'Giờ luyện',   icon: Clock,  unit: 'giờ',  field: 'totalPracticeHours' },
  { key: 'sessions', label: 'Số buổi tập', icon: Mic,    unit: 'buổi', field: 'totalSessions' },
];

const PERIODS = [
  { key: 'all_time', label: 'Tất cả' },
  { key: 'weekly',   label: 'Tuần này' },
];

// Tier thresholds (streak days as baseline reference)
const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE_LEGEND'];
const TIER_THRESHOLDS = {
  BRONZE:       { min: 0,   max: 6,   label: 'Bronze',       next: 'SILVER',       emoji: '🥉' },
  SILVER:       { min: 7,   max: 13,  label: 'Silver',       next: 'GOLD',         emoji: '🥈' },
  GOLD:         { min: 14,  max: 29,  label: 'Gold',         next: 'PLATINUM',     emoji: '🥇' },
  PLATINUM:     { min: 30,  max: 59,  label: 'Platinum',     next: 'DIAMOND',      emoji: '💎' },
  DIAMOND:      { min: 60,  max: 99,  label: 'Diamond',      next: 'ELITE_LEGEND', emoji: '💠' },
  ELITE_LEGEND: { min: 100, max: 999, label: 'Elite Legend', next: null,           emoji: '👑' },
};

const TIER_COLORS = {
  ELITE_LEGEND: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    bar: 'from-red-600 to-red-400' },
  DIAMOND:      { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/20',   bar: 'from-cyan-600 to-cyan-400' },
  PLATINUM:     { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', bar: 'from-indigo-600 to-indigo-400' },
  GOLD:         { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  bar: 'from-amber-600 to-amber-400' },
  SILVER:       { bg: 'bg-zinc-500/10',   text: 'text-zinc-300',   border: 'border-zinc-500/20',   bar: 'from-zinc-500 to-zinc-300' },
  BRONZE:       { bg: 'bg-orange-900/10', text: 'text-orange-500', border: 'border-orange-900/20', bar: 'from-orange-700 to-orange-500' },
};

const PODIUM_STYLES = [
  { ring: 'ring-amber-500/60', bg: 'bg-amber-500/10', label: 'text-amber-400', icon: Trophy, iconColor: 'text-amber-400', order: 'order-2', h: 'h-24', glow: 'rgba(245,158,11,0.15)', shimmer: true },
  { ring: 'ring-zinc-400/40',  bg: 'bg-zinc-500/10',  label: 'text-zinc-300',  icon: Medal,  iconColor: 'text-zinc-300',  order: 'order-1', h: 'h-16', glow: 'rgba(161,161,170,0.10)', shimmer: false },
  { ring: 'ring-orange-600/40',bg: 'bg-orange-600/10',label: 'text-orange-400',icon: Award,  iconColor: 'text-orange-400',order: 'order-3', h: 'h-12', glow: 'rgba(194,65,12,0.10)',  shimmer: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTierProgress = (tier, streakValue) => {
  const t = TIER_THRESHOLDS[tier];
  if (!t || !t.next) return { pct: 100, needed: 0, nextTier: null };
  const nextT = TIER_THRESHOLDS[t.next];
  const range = nextT.min - t.min;
  const done  = Math.min(streakValue - t.min, range);
  const pct   = Math.round((done / range) * 100);
  const needed = nextT.min - streakValue;
  return { pct: Math.max(0, Math.min(100, pct)), needed: Math.max(0, needed), nextTier: t.next };
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
  const c = TIER_COLORS[tier] || TIER_COLORS.BRONZE;
  const label = tier === 'ELITE_LEGEND' ? 'ELITE' : tier;
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
      <div className={`${cls} rounded-full bg-white/8 ring-1 ring-white/10 flex items-center justify-center overflow-hidden font-semibold text-zinc-400`}>
        {isUrl ? <img src={src} alt={name} className="w-full h-full object-cover" />
               : isEmoji ? <span>{src}</span>
               : initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#09090b]" />
      )}
    </div>
  );
};

const MovementBadge = ({ delta }) => {
  if (delta === undefined || delta === null || delta === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[9px] text-zinc-600"><Minus size={8} /></span>
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

const MetricValue = ({ entry, typeKey, field, unit }) => {
  let val = entry[field];
  if (typeKey === 'diligent') val = Number(val).toFixed(1);
  const showFire = typeKey === 'streak' && entry.currentStreak >= 3;
  return (
    <span className="text-[13px] font-semibold text-white tabular-nums flex items-center gap-1">
      {showFire && <Flame size={12} className="text-orange-400 shrink-0" />}
      {val} <span className="text-zinc-500 font-normal text-[11px]">{unit}</span>
    </span>
  );
};

const SkeletonRow = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
  >
    <div className="w-6 h-3 bg-white/6 rounded animate-pulse" />
    <div className="w-9 h-9 rounded-full bg-white/6 shrink-0 animate-pulse" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-white/6 rounded w-32 animate-pulse" />
      <div className="h-2 bg-white/4 rounded w-16 animate-pulse" />
    </div>
    <div className="h-3 bg-white/6 rounded w-16 animate-pulse" />
  </motion.div>
);

// ─── Feature #2: Share Modal ───────────────────────────────────────────────────

const ShareModal = ({ myEntry, typeMeta, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareText = myEntry
    ? `🏆 Tôi đang xếp hạng #${myEntry.rank} trên MC Voice Training!\n🔥 Streak: ${myEntry.currentStreak} ngày | Tier: ${myEntry.currentTier}\nLuyện giọng MC cùng tôi tại MCHub!`
    : 'Luyện giọng MC tại MCHub!';

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
                <p className="text-[15px] font-bold text-white">{myEntry?.userName || 'Bạn'}</p>
                <TierBadge tier={myEntry?.currentTier || 'BRONZE'} />
                <p className="text-[24px] font-black text-amber-400 leading-none mt-1">
                  #{myEntry?.rank || '?'}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Streak', value: `${myEntry?.currentStreak || 0} ngày`, icon: '🔥' },
                { label: 'Giờ luyện', value: `${Number(myEntry?.totalPracticeHours || 0).toFixed(1)}h`, icon: '⏱️' },
                { label: 'Buổi tập', value: `${myEntry?.totalSessions || 0}`, icon: '🎤' },
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
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-[12px] font-medium text-zinc-300 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Đã sao chép!' : 'Sao chép văn bản'}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/4 hover:bg-white/8 text-zinc-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600">Chia sẻ kết quả để truyền cảm hứng cho bạn bè!</p>
      </motion.div>
    </motion.div>
  );
};

// ─── Feature #3: Tier Progress Card ───────────────────────────────────────────

const TierProgressCard = ({ myEntry }) => {
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
      className="bg-white/3 border border-white/8 rounded-xl overflow-hidden mt-3"
    >
      <div className="px-4 py-3 border-b border-white/6 bg-white/2 flex items-center gap-2">
        <Target size={13} className="text-indigo-400" />
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Tiến trình Tier</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Current → Next tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px]">{TIER_THRESHOLDS[tier]?.emoji}</span>
            <span className={`text-[12px] font-bold ${tierC.text}`}>{TIER_THRESHOLDS[tier]?.label}</span>
          </div>
          {!isMax && (
            <>
              <ChevronRight size={14} className="text-zinc-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-[16px]">{nextT?.emoji}</span>
                <span className={`text-[12px] font-bold ${nextC?.text}`}>{nextT?.label}</span>
              </div>
            </>
          )}
          {isMax && (
            <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <Crown size={11} /> Đỉnh cao
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isMax ? (
          <>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className={`h-full bg-linear-to-r ${tierC.bar} rounded-full`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-600">{pct}% hoàn thành</span>
              <span className={`font-semibold ${nextC?.text}`}>
                Cần thêm {needed} ngày streak
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
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 bg-white/2 rounded-lg px-3 py-2">
            <Flame size={10} className="text-orange-400 shrink-0" />
            Duy trì streak {needed} ngày nữa để lên <span className={`font-semibold ${nextC?.text} ml-1`}>{nextT?.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Feature #4: Personal Best Badge ──────────────────────────────────────────

const PersonalBestBadge = ({ allTimeEntry, weeklyEntry, typeMeta }) => {
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
      <p className="text-[10px] text-amber-400 font-semibold">Tuần bùng nổ! {typeMeta.label} tuần này cao hơn mức trung bình</p>
    </motion.div>
  );
};

// ─── Feature #1: Same-tier Filter Toggle ──────────────────────────────────────

const FilterBar = ({ myTier, filterSameTier, setFilterSameTier, totalShown, totalAll }) => (
  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/1">
    <button
      onClick={() => setFilterSameTier(v => !v)}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
        filterSameTier
          ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
          : 'bg-transparent border-white/8 text-zinc-600 hover:text-zinc-400'
      }`}
    >
      <Filter size={10} />
      Cùng tier {myTier && filterSameTier ? `(${myTier})` : ''}
    </button>
    {filterSameTier && (
      <span className="text-[10px] text-zinc-600">
        {totalShown} / {totalAll} người
      </span>
    )}
  </div>
);

// ─── Community Stats Bar ──────────────────────────────────────────────────────

const StatsBar = ({ total }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="flex items-center gap-6 px-4 py-3 bg-white/2 border border-white/6 rounded-xl mb-6 overflow-x-auto"
  >
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
        <Users size={12} className="text-amber-400" />
      </div>
      <div>
        <p className="text-[10px] text-zinc-600">Tổng thành viên</p>
        <p className="text-[13px] font-bold text-white tabular-nums">
          <AnimatedNumber value={total} />
        </p>
      </div>
    </div>
    <div className="w-px h-8 bg-white/6 shrink-0" />
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
        <Flame size={12} className="text-orange-400" />
      </div>
      <div>
        <p className="text-[10px] text-zinc-600">Đang thi đua</p>
        <p className="text-[13px] font-bold text-orange-400">🔥 Active</p>
      </div>
    </div>
    <div className="w-px h-8 bg-white/6 shrink-0" />
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <Zap size={12} className="text-emerald-400" />
      </div>
      <div>
        <p className="text-[10px] text-zinc-600">Cập nhật</p>
        <p className="text-[13px] font-bold text-emerald-400">Real-time</p>
      </div>
    </div>
  </motion.div>
);

// ─── Podium (top 3) ───────────────────────────────────────────────────────────

const Podium = ({ entries, type, currentUserId }) => {
  const [first, second, third] = entries;
  const pods = [
    { entry: second, style: PODIUM_STYLES[1], rank: 2 },
    { entry: first,  style: PODIUM_STYLES[0], rank: 1 },
    { entry: third,  style: PODIUM_STYLES[2], rank: 3 },
  ].filter(p => p.entry);

  const field = TYPES.find(t => t.key === type.key)?.field;
  const unit  = TYPES.find(t => t.key === type.key)?.unit;

  return (
    <div className="flex items-end justify-center gap-6 pt-8 pb-8 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-amber-500/5 rounded-full blur-3xl" />
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
                <Crown size={18} className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              </motion.div>
            )}

            <div
              className={`relative ring-2 ${style.ring} rounded-full ${isMe ? 'ring-offset-2 ring-offset-[#09090b]' : ''}`}
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
              <p className={`text-[12px] font-semibold truncate ${isMe ? 'text-emerald-400' : 'text-white'}`}>
                {entry.userName}
              </p>
              <p className={`text-[12px] font-black ${style.label}`}>
                {unit === 'giờ' ? Number(entry[field]).toFixed(1) + 'h' : `${entry[field]} ${unit}`}
              </p>
            </div>

            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200, damping: 25 }}
              style={{ transformOrigin: 'bottom' }}
              className={`${style.h} w-20 rounded-t-lg ${style.bg} border border-white/6 flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-linear-to-b from-white/8 to-transparent" />
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
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), type: 'spring', stiffness: 280, damping: 28 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`grid grid-cols-[44px_1fr_auto] gap-3 items-center px-4 py-3 border-b border-white/5 last:border-0 transition-colors relative ${
        isMe ? 'bg-emerald-500/6 border-l-2 border-l-emerald-500/50' : ''
      }`}
    >
      <AnimatePresence>
        {hovered && !isMe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white/2 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-0.5">
        <span className="font-mono text-[12px] font-semibold text-zinc-500">{entry.rank}</span>
        <MovementBadge delta={entry.rankDelta} />
      </div>

      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar src={entry.userAvatar} name={entry.userName} size="sm" online={entry.recentlyActive} />
        <div className="min-w-0">
          <p className={`text-[13px] font-medium truncate ${isMe ? 'text-emerald-400' : 'text-white'}`}>
            {entry.userName}
            {isMe && <span className="ml-1.5 text-[10px] text-emerald-500 font-normal">(bạn)</span>}
          </p>
          <div className="mt-0.5">
            <TierBadge tier={entry.currentTier} />
          </div>
        </div>
      </div>

      <MetricValue entry={entry} typeKey={type.key} field={type.field} unit={type.unit} />
    </motion.div>
  );
};

// ─── My Rank Card ─────────────────────────────────────────────────────────────

const MyRankCard = ({ myEntry, total, typeMeta, onShare }) => {
  if (!myEntry) return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/3 border border-white/8 rounded-xl p-5 text-center"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
        <Trophy size={18} className="text-zinc-600" />
      </div>
      <p className="text-[12px] text-zinc-500 leading-relaxed">Chưa có dữ liệu.<br/>Luyện tập để lên bảng!</p>
    </motion.div>
  );

  const percentile = total > 1 ? Math.round((1 - (myEntry.rank - 1) / total) * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.15 }}
      className="bg-white/3 border border-white/8 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between bg-white/2">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-400" />
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Vị trí của bạn</span>
        </div>
        {/* Feature #2: Share button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/6 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-[10px] font-medium"
        >
          <Share2 size={10} />
          Chia sẻ
        </motion.button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar src={myEntry.userAvatar} name={myEntry.userName} size="md" />
          <div>
            <p className="text-[13px] font-semibold text-white">{myEntry.userName}</p>
            <TierBadge tier={myEntry.currentTier} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/4 rounded-lg px-3 py-2.5 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent" />
            <p className="text-[10px] text-zinc-500 mb-0.5 relative z-10">Hạng</p>
            <p className="text-[20px] font-black text-amber-400 leading-none relative z-10">
              #<AnimatedNumber value={myEntry.rank} />
            </p>
          </div>
          <div className="bg-white/4 rounded-lg px-3 py-2.5 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-white/3 to-transparent" />
            <p className="text-[10px] text-zinc-500 mb-0.5 relative z-10">{typeMeta.label}</p>
            <p className="text-[20px] font-black text-white leading-none flex items-end gap-1 relative z-10">
              <AnimatedNumber
                value={typeMeta.key === 'diligent' ? Number(myEntry[typeMeta.field]) : myEntry[typeMeta.field]}
                decimals={typeMeta.key === 'diligent' ? 1 : 0}
              />
              <span className="text-[10px] font-normal text-zinc-500 mb-0.5">{typeMeta.unit}</span>
            </p>
          </div>
        </div>

        {/* Percentile bar */}
        <div className="bg-white/4 rounded-lg px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-zinc-500">Vượt qua</p>
            <span className="text-[12px] font-bold text-emerald-400">{percentile}%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentile}%` }}
              transition={{ duration: 1, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full"
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">người dùng</p>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between px-3 py-2 bg-orange-500/5 border border-orange-500/10 rounded-lg">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Flame size={12} className="text-orange-400" />
            <span>Streak hiện tại</span>
          </div>
          <span className="text-[13px] font-bold text-orange-400">{myEntry.currentStreak} ngày</span>
        </div>

        {/* Goal nudge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/2 border border-white/6 rounded-lg">
          <Target size={11} className="text-zinc-600 shrink-0" />
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Luyện tập hôm nay để giữ streak &amp; leo hạng!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const LeaderboardPage = () => {
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
    <div className="min-h-screen bg-[#09090b] text-white">
      <PageBanner />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Bảng xếp hạng' }]} />

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
              <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                <motion.span
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="text-[20px]"
                >
                  🎉
                </motion.span>
                <div>
                  <p className="text-[13px] font-bold text-amber-400">Xuất sắc! Bạn đang trong Top {myEntry.rank}!</p>
                  <p className="text-[11px] text-zinc-500">Tiếp tục duy trì để giữ vị trí này nhé.</p>
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
            <h1 className="text-[24px] font-black text-white flex items-center gap-2.5">
              <motion.span
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Trophy size={22} className="text-amber-400" />
              </motion.span>
              Bảng xếp hạng
            </h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              <AnimatedNumber value={total} /> người dùng đang thi đua
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-zinc-400 hover:text-white hover:bg-white/8 transition-colors text-[12px] disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Làm mới
          </motion.button>
        </motion.div>

        {/* Stats bar */}
        <StatsBar total={total} />

        {/* Period tabs */}
        <div className="flex gap-1 p-1 bg-white/4 border border-white/8 rounded-lg w-fit mb-4">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => { setPeriod(p); trackLeaderboardFilter(type.key, p.key); }}
              className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all relative ${
                period.key === p.key ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {period.key === p.key && (
                <motion.div
                  layoutId="period-indicator"
                  className="absolute inset-0 bg-white/10 rounded-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-6">
          {TYPES.map(t => {
            const Icon = t.icon;
            const active = type.key === t.key;
            return (
              <motion.button
                key={t.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setType(t); trackLeaderboardFilter(t.key, period.key); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all relative overflow-hidden ${
                  active
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-white/3 border-white/8 text-zinc-500 hover:text-zinc-300 hover:bg-white/6'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="type-indicator"
                    className="absolute inset-0 bg-amber-500/8"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={13} className="relative z-10" />
                <span className="relative z-10">{t.label}</span>
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
                className="bg-white/3 border border-white/8 rounded-xl overflow-hidden"
              >
                {/* Podium */}
                {loading ? (
                  <div className="h-56 flex items-center justify-center">
                    <div className="flex items-end gap-6">
                      {[16, 24, 12].map((h, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                          <div className="w-14 h-14 rounded-full bg-white/6" />
                          <div className="h-2 w-16 bg-white/6 rounded" />
                          <div className="w-20 bg-white/4 rounded-t-lg" style={{ height: `${h * 4}px` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : podiumEntries.length > 0 ? (
                  <div className="border-b border-white/6 bg-linear-to-b from-white/2 to-transparent">
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
                <div className="grid grid-cols-[44px_1fr_auto] gap-3 px-4 py-2.5 border-b border-white/6 bg-white/2">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">#</span>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Người dùng</span>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{type.label}</span>
                </div>

                {/* Rows */}
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} delay={i * 0.04} />)
                ) : filteredEntries.length === 0 ? (
                  <div className="py-20 text-center">
                    <TrendingUp size={32} className="mx-auto mb-3 text-zinc-700" />
                    <p className="text-[13px] text-zinc-600">
                      {filterSameTier ? 'Không có người cùng tier' : 'Chưa có dữ liệu'}
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
                    <div className="w-5 h-5 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
                  </div>
                )}
                {!hasMore && filteredEntries.length > 0 && !filterSameTier && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[11px] text-zinc-700 py-4"
                  >
                    Đã hiển thị tất cả {total} người dùng
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
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 transition-colors z-10"
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPage;
