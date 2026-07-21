import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Zap, Star, ArrowRight, ExternalLink, Facebook, Flame, Clock, Tag, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchActiveSocialPosts, recordSocialPostClick } from '../../services/socialPostService';
import { getFlashDeals } from '../../services/communityService';
import { useAuthStore } from '../../store/useAuthStore';


// Routes where ad sidebar should NOT appear
const EXCLUDED_PATHS = ['/login', '/register', '/m/admin'];

const UPGRADE_ADS_META = {
  FREE: [
    { icon: Zap, accent: '#f5a623', price: '199k/tháng' },
    { icon: Star, accent: '#a78bfa', price: '199k/tháng' },
    { icon: Crown, accent: '#f5a623', price: '299k/tháng' },
  ],
  BASIC: [
    { icon: Crown, accent: '#f5a623', price: '299k/tháng' },
    { icon: Sparkles, accent: '#34d399', price: '1.99M/năm' },
  ],
  FULL: [
    { icon: Crown, accent: '#f5a623', price: '1.99M/năm' },
  ],
  ANNUAL: [],
};

function useUpgradeAds() {
  const { t } = useTranslation();
  const build = (planKey, metas) => metas.map((m, i) => ({
    ...m,
    tag: t(`adSidebar.ads.${planKey}.${i}.tag`),
    title: t(`adSidebar.ads.${planKey}.${i}.title`),
    body: t(`adSidebar.ads.${planKey}.${i}.body`),
    cta: t(`adSidebar.ads.${planKey}.${i}.cta`),
  }));
  return {
    FREE: build('free', UPGRADE_ADS_META.FREE),
    BASIC: build('basic', UPGRADE_ADS_META.BASIC),
    FULL: build('full', UPGRADE_ADS_META.FULL),
    ANNUAL: [],
  };
}

const SOCIAL_CACHE_KEY = 'mchub_ad_social_cache';
function loadSocialCache() {
  try {
    const raw = localStorage.getItem(SOCIAL_CACHE_KEY);
    if (!raw) return [];
    const { data, exp } = JSON.parse(raw);
    return Date.now() < exp ? data : [];
  } catch { return []; }
}
function saveSocialCache(data) {
  try {
    localStorage.setItem(SOCIAL_CACHE_KEY, JSON.stringify({ data, exp: Date.now() + 5 * 60 * 1000 }));
  } catch {}
}

function UpgradeCard({ ad }) {
  if (!ad || !ad.icon) return null;
  const Icon = ad.icon;
  return (
    <div className="w-full bg-white border border-black/8 overflow-hidden">
      <div className="h-[2px]" style={{ background: ad.accent }} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 flex items-center justify-center shrink-0"
            style={{ background: `${ad.accent}18`, border: `1px solid ${ad.accent}28` }}>
            <Icon size={12} style={{ color: ad.accent }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: ad.accent }}>
            {ad.tag}
          </span>
        </div>
        <p className="text-[12px] font-semibold text-gray-900 mb-1 leading-tight">{ad.title}</p>
        <p className="text-[10px] text-gray-500 leading-relaxed mb-3">{ad.body}</p>
        <span className="text-[10px] font-semibold block mb-2" style={{ color: ad.accent }}>{ad.price}</span>
        <Link
          to="/m/payment"
          className="flex items-center justify-center gap-1.5 w-full py-2 text-[11px] font-semibold transition-opacity hover:opacity-85"
          style={{ background: ad.accent, color: '#000' }}
        >
          <Crown size={10} /> {ad.cta} <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}

function SocialCard({ post }) {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-white border border-black/8 overflow-hidden">
      {post.image ? (
        <div className="w-full aspect-video overflow-hidden bg-gray-100">
          <img src={post.image} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-10 bg-blue-500/10 flex items-center justify-center">
          <Facebook size={14} className="text-blue-400/50" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Facebook size={10} className="text-blue-400 shrink-0" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-400">{t('adSidebar.fanpageTag')}</span>
        </div>
        <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-3 mb-2">{post.description}</p>
        <a
          href={post.fbLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordSocialPostClick(post.id)}
          className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink size={9} /> {t('adSidebar.viewPost')}
        </a>
      </div>
    </div>
  );
}

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const calc = () => Math.max(0, new Date(expiresAt) - Date.now());
    setRemaining(calc());
    const t = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const pad = n => String(n).padStart(2, '0');
  return { h, m, s, pad, expired: remaining === 0 };
}

function FlashDealCard({ deal, onClaim }) {
  const { t } = useTranslation();
  const { h, m, s, pad, expired } = useCountdown(deal.expiresAt);
  const remaining = deal.maxUses > 0 ? deal.maxUses - deal.usedCount : null;
  const pct = remaining !== null ? Math.round((remaining / deal.maxUses) * 100) : 100;
  const isLastChance = remaining !== null && remaining <= Math.ceil(deal.maxUses * 0.2);

  if (expired) return null;

  const discountLabel = deal.type === 'PERCENT'
    ? `-${deal.discountValue}%`
    : `-${deal.discountValue.toLocaleString('vi-VN')}đ`;

  const planLabel = deal.applicablePlans?.length === 1
    ? deal.applicablePlans[0]
    : deal.applicablePlans?.length > 0
      ? deal.applicablePlans.join(' / ')
      : t('adSidebar.allPlans');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="w-full overflow-hidden relative"
      style={{
        background: '#0f172a',
        border: '1px solid rgba(251,191,36,0.22)',
        boxShadow: '0 0 24px rgba(251,191,36,0.07), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(251,191,36,0.06)' }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />

      {/* Top gold bar */}
      <div className="h-[1.5px]" style={{ background: '#f59e0b' }} />

      <div className="p-3 relative">

        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Flame size={11} style={{ color: '#f59e0b' }} />
            </motion.div>
            <span className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: '#f59e0b' }}>{t('adSidebar.luckyTime')}</span>
          </div>
          {isLastChance && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.65, repeat: Infinity }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <span className="text-[8px] font-bold text-red-400 uppercase tracking-wide">{t('adSidebar.almostGone')}</span>
            </motion.div>
          )}
        </div>

        {/* Discount + description */}
        <div className="gap-2.5 mb-2.5">
          <div
            className="shrink-0 px-2 py-1 rounded font-black text-[20px] leading-none tabular-nums"
            style={{
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: '#fcd34d',
              textShadow: '0 0 16px rgba(252,211,77,0.35)',
              letterSpacing: '-0.02em',
            }}
          >
            {discountLabel}
          </div>
          <div className="min-w-0 pt-0.5 mt-4">
            <p className="text-[10px] font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {deal.description || t('adSidebar.specialOffer')}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
              {t('adSidebar.planPrefix')} {planLabel}
            </p>
          </div>
        </div>

        {/* Code pill */}
        <div
          className="flex items-center justify-between px-2 py-1.5 mb-2.5 rounded"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px dashed rgba(251,191,36,0.28)' }}
        >
          <div className="flex items-center gap-1.5">
            <Ticket size={9} style={{ color: '#f59e0b' }} className="shrink-0" />
            <span className="font-mono font-bold text-[11px] tracking-[0.15em]" style={{ color: '#fcd34d' }}>{deal.code}</span>
          </div>
          <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(251,191,36,0.45)' }}>{t('adSidebar.promoCode')}</span>
        </div>

        {/* Countdown */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <Clock size={8} style={{ color: 'rgba(255,255,255,0.28)' }} />
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{t('adSidebar.endsIn')}</span>
            </div>
            {h === 0 && m < 10 && (
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                className="text-[8px] font-semibold" style={{ color: '#f87171' }}>
                {t('adSidebar.fewMinutesLeft')}
              </motion.span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1">
            {[{ v: pad(h), label: t('adSidebar.hoursUnit') }, { v: pad(m), label: t('adSidebar.minutesUnit') }, { v: pad(s), label: t('adSidebar.secondsUnit') }].map(({ v, label }, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[13px] font-black pb-2.5"
                    style={{ color: '#f59e0b' }}
                  >:</motion.span>
                )}
                <div className="flex flex-col items-center gap-0.5">
                  <motion.div
                    key={v}
                    initial={{ y: -4, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="font-mono font-black text-[15px] leading-none tabular-nums w-8 flex items-center justify-center py-1 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      textShadow: '0 0 8px rgba(251,191,36,0.2)',
                    }}
                  >
                    {v}
                  </motion.div>
                  <span className="text-[6px] font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Remaining uses */}
        {remaining !== null && (
          <div className="mb-2.5">
            <div className="flex justify-between mb-1">
              <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{t('adSidebar.remaining')}</span>
              <span className="text-[8px] font-semibold" style={{ color: pct <= 30 ? '#f87171' : '#f59e0b' }}>
                {remaining} / {deal.maxUses} {t('adSidebar.usesUnit')}
              </span>
            </div>
            <div className="h-0.75 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: pct > 40 ? '#f59e0b' : '#ef4444' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onClaim(deal)}
          className="w-full py-2 text-[11px] font-black uppercase tracking-[0.08em] flex items-center justify-center gap-1.5 rounded"
          style={{
            background: '#f59e0b',
            color: '#0f172a',
            boxShadow: '0 2px 12px rgba(245,158,11,0.35)',
          }}
        >
          <Flame size={10} />
          {t('adSidebar.useNow')}
          <ArrowRight size={10} />
        </motion.button>

      </div>
    </motion.div>
  );
}

const slideVariants = {
  enter: d => ({ x: d * 16, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: d => ({ x: d * -16, opacity: 0 }),
};
const slideTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

export default function AdSidebar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const plan = user?.plan || 'FREE';
  const location = useLocation();
  const navigate = useNavigate();
  const UPGRADE_ADS = useUpgradeAds();

  const [socialPosts, setSocialPosts] = useState(loadSocialCache);
  const [adIdx, setAdIdx] = useState(0);
  const [adDir, setAdDir] = useState(1);
  const [flashDeals, setFlashDeals] = useState([]);
  const flashPollRef = useRef(null);

  // Hide on excluded routes
  const hidden = EXCLUDED_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const cached = loadSocialCache();
    if (cached.length) setSocialPosts(cached);
    fetchActiveSocialPosts()
      .then(data => { if (data?.length) { saveSocialCache(data); setSocialPosts(data); } })
      .catch(() => {});
  }, []);

  // Poll flash deals every 30s so countdown stays in sync with BE
  const fetchFlash = useCallback(() => {
    getFlashDeals()
      .then(res => setFlashDeals(Array.isArray(res?.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchFlash();
    flashPollRef.current = setInterval(fetchFlash, 30_000);
    return () => clearInterval(flashPollRef.current);
  }, [fetchFlash]);

  const handleClaimDeal = useCallback((deal) => {
    const plan = deal.applicablePlans?.length === 1 ? deal.applicablePlans[0] : null;
    const params = new URLSearchParams({ code: deal.code });
    if (plan) params.set('plan', plan);
    navigate(`/m/payment?${params.toString()}`);
  }, [navigate]);

  const upgradeAds = UPGRADE_ADS[(plan || '').toUpperCase()] || [];

  // Reset adIdx when plan/ads list changes to avoid out-of-bounds
  useEffect(() => { setAdIdx(0); }, [plan]);

  // Rotate upgrade ad every 8s
  useEffect(() => {
    if (upgradeAds.length <= 1) return;
    const t = setInterval(() => { setAdDir(1); setAdIdx(i => (i + 1) % upgradeAds.length); }, 8000);
    return () => clearInterval(t);
  }, [upgradeAds.length]);

  if (hidden) return null;
  if (!upgradeAds.length && !socialPosts.length) return null;

  return (
    <div
      className="hidden md:flex fixed top-14 right-0 bottom-0 z-40 flex-col overflow-y-auto"
      style={{
        width: '180px',
        background: '#ffffff',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        scrollbarWidth: 'none',
      }}
    >
      <div className="flex flex-col gap-3 p-2 pt-3">

        {/* Flash deals — shown first, highest priority */}
        <AnimatePresence>
          {flashDeals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2"
            >
              {flashDeals.map(deal => (
                <FlashDealCard key={deal.id} deal={deal} onClaim={handleClaimDeal} />
              ))}
              <div className="h-px bg-orange-500/15 mx-1" />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold px-1">{t('adSidebar.subscribePrompt')}</p>

        {/* Upgrade ads */}
        {upgradeAds.length > 0 && (
          <div>
            <AnimatePresence mode="wait" custom={adDir}>
              <motion.div
                key={adIdx}
                custom={adDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
              >
                <UpgradeCard ad={upgradeAds[adIdx]} />
              </motion.div>
            </AnimatePresence>
            {upgradeAds.length > 1 && (
              <div className="flex justify-center gap-1 mt-1.5">
                {upgradeAds.map((_, i) => (
                  <button key={i} onClick={() => { setAdDir(i > adIdx ? 1 : -1); setAdIdx(i); }}
                    className="w-1 h-1 transition-colors"
                    style={{ background: i === adIdx ? '#f5a623' : 'rgba(0,0,0,0.15)' }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Social posts — scroll list */}
        {socialPosts.length > 0 && (
          <>
            <div className="h-px bg-black/6 mx-1" />
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold px-1">{t('adSidebar.fanpagePosts')}</p>
            {socialPosts.map(post => (
              <SocialCard key={post.id} post={post} />
            ))}
          </>
        )}

        <p className="text-[8px] text-gray-300 text-center mt-1">{t('adSidebar.adFooter')}</p>
      </div>
    </div>
  );
}
