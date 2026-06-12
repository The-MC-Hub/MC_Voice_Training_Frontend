import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Crown, Sparkles, Zap, Star, ArrowRight, ExternalLink, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchActiveSocialPosts, recordSocialPostClick } from '../../services/socialPostService';
import { useAuthStore } from '../../store/useAuthStore';


// Routes where ad sidebar should NOT appear
const EXCLUDED_PATHS = ['/login', '/register'];

const UPGRADE_ADS = {
  FREE: [
    {
      icon: Zap,
      accent: '#f5a623',
      tag: 'Phổ biến nhất',
      title: 'Nâng cấp Basic',
      body: '20 lượt AI/tháng · Mở toàn bộ bài học · Báo cáo chi tiết',
      cta: 'Nâng cấp ngay',
      price: '199k/tháng',
    },
    {
      icon: Star,
      accent: '#a78bfa',
      tag: 'Học nhanh 3×',
      title: 'Mở 50+ bài học',
      body: 'Gói Free giới hạn nội dung. Basic unlock toàn bộ lộ trình MC chuyên nghiệp.',
      cta: 'Xem gói Basic',
      price: '199k/tháng',
    },
    {
      icon: Crown,
      accent: '#f5a623',
      tag: 'Cao cấp nhất',
      title: 'Gói Full — AI vô hạn',
      body: 'Phân tích AI không giới hạn · Coaching cá nhân · Khóa học nâng cao',
      cta: 'Khám phá Full',
      price: '299k/tháng',
    },
  ],
  BASIC: [
    {
      icon: Crown,
      accent: '#f5a623',
      tag: 'Nâng cấp',
      title: 'Gói Full — AI vô hạn',
      body: 'AI không giới hạn · Tất cả khóa học cao cấp · Coaching 1-1 với AI.',
      cta: 'Nâng lên Full',
      price: '299k/tháng',
    },
    {
      icon: Sparkles,
      accent: '#34d399',
      tag: 'Tiết kiệm 44%',
      title: 'Annual — 166k/tháng',
      body: 'Trả 1 năm tiết kiệm gần 1 triệu. Unlock toàn bộ tính năng vĩnh viễn.',
      cta: 'Xem Annual',
      price: '1.99M/năm',
    },
  ],
  FULL: [
    {
      icon: Crown,
      accent: '#f5a623',
      tag: 'Tiết kiệm 44%',
      title: 'Chuyển sang Annual',
      body: 'Chỉ 1.990.000đ/năm — tiết kiệm 980.000đ so với trả tháng.',
      cta: 'Nâng lên Annual',
      price: '1.99M/năm',
    },
  ],
  ANNUAL: [],
};

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
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg,transparent,${ad.accent},transparent)` }} />
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
          <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-400">Fanpage</span>
        </div>
        <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-3 mb-2">{post.description}</p>
        <a
          href={post.fbLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordSocialPostClick(post.id)}
          className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink size={9} /> Xem bài đăng
        </a>
      </div>
    </div>
  );
}

const slideVariants = {
  enter: d => ({ x: d * 16, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: d => ({ x: d * -16, opacity: 0 }),
};
const slideTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

export default function AdSidebar() {
  const { user } = useAuthStore();
  const plan = user?.plan || 'FREE';
  const location = useLocation();

  const [socialPosts, setSocialPosts] = useState(loadSocialCache);
  const [adIdx, setAdIdx] = useState(0);
  const [adDir, setAdDir] = useState(1);

  // Hide on excluded routes
  const hidden = EXCLUDED_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const cached = loadSocialCache();
    if (cached.length) setSocialPosts(cached);
    fetchActiveSocialPosts()
      .then(data => { if (data?.length) { saveSocialCache(data); setSocialPosts(data); } })
      .catch(() => {});
  }, []);

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
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold px-1">ĐĂNG KÍ GÓI THÔI BẠN ƠI 😘</p>

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
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold px-1">Bài đăng Fanpage</p>
            {socialPosts.map(post => (
              <SocialCard key={post.id} post={post} />
            ))}
          </>
        )}

        <p className="text-[8px] text-gray-300 text-center mt-1">MCHub · Quảng cáo</p>
      </div>
    </div>
  );
}
