import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchActiveSocialPosts } from '../../services/socialPostService';

const CACHE_KEY = 'mchub_social_posts_cache';
const CACHE_TTL = 5 * 60 * 1000;

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    return Date.now() > expiresAt ? null : data;
  } catch { return null; }
}
function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL })); } catch {}
}
export function invalidateSocialPostCache() { localStorage.removeItem(CACHE_KEY); }

// ─── Compact (sidebar) ────────────────────────────────────────────────────────
function CompactCarousel({ posts }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);

  const start = (len) => {
    clearInterval(timerRef.current);
    if (len <= 1) return;
    timerRef.current = setInterval(() => { setDir(1); setIdx(i => (i + 1) % len); }, 6000);
  };
  useEffect(() => { start(posts.length); return () => clearInterval(timerRef.current); }, [posts.length]);

  const go = (d) => { clearInterval(timerRef.current); setDir(d); setIdx(i => (i + posts.length + d) % posts.length); start(posts.length); };
  const post = posts[idx];

  return (
    <div className="w-full bg-[--bg-surface] border border-[--border-subtle] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[--border-subtle]">
        <Facebook size={12} className="text-gold" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]">{t('socialFeedCarousel.fromFanpage')}</span>
      </div>
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={idx} custom={dir}
          variants={{ enter: d => ({ x: d * 40, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: d => ({ x: d * -40, opacity: 0 }) }}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="px-3 py-3"
        >
          <p className="text-[11px] text-[--text-secondary] leading-relaxed line-clamp-3 mb-2">{post.description}</p>
          <a href={post.fbLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-gold hover:text-gold/80 transition-colors">
            <ExternalLink size={10} /> {t('socialFeedCarousel.viewPost')}
          </a>
        </motion.div>
      </AnimatePresence>
      {posts.length > 1 && (
        <div className="flex items-center justify-between px-3 pb-2">
          <div className="flex gap-1">
            {posts.map((_, i) => (
              <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                className="w-1 h-1 transition-colors"
                style={{ background: i === idx ? 'var(--text-primary)' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => go(-1)} className="text-[--text-muted] hover:text-[--text-primary] transition-colors p-0.5"><ChevronLeft size={12} /></button>
            <button onClick={() => go(1)} className="text-[--text-muted] hover:text-[--text-primary] transition-colors p-0.5"><ChevronRight size={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Full carousel (Home page) ────────────────────────────────────────────────
function FullCarousel({ posts }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const start = () => {
    clearInterval(timerRef.current);
    if (posts.length <= 1 || paused) return;
    timerRef.current = setInterval(() => { setDir(1); setIdx(i => (i + 1) % posts.length); }, 4500);
  };

  useEffect(() => { start(); return () => clearInterval(timerRef.current); }, [posts.length, paused]);

  const go = (d) => {
    clearInterval(timerRef.current);
    setDir(d);
    setIdx(i => (i + posts.length + d) % posts.length);
    if (!paused) { timerRef.current = setTimeout(start, 300); }
  };

  const post = posts[idx];

  // Progress bar
  const [progress, setProgress] = useState(0);
  const progRef = useRef(null);
  useEffect(() => {
    setProgress(0);
    if (paused || posts.length <= 1) return;
    const step = 100 / (4500 / 50);
    progRef.current = setInterval(() => setProgress(p => Math.min(p + step, 100)), 50);
    return () => clearInterval(progRef.current);
  }, [idx, paused, posts.length]);

  return (
    <div className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gold flex items-center justify-center">
            <Facebook size={12} className="text-white" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-900 leading-none">{t('socialFeedCarousel.updatesFromFanpage')}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{t('socialFeedCarousel.official')}</p>
          </div>
        </div>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 border border-gold text-gold text-[10px] font-semibold hover:bg-gold hover:text-white transition-all">
          <Facebook size={11} /> {t('socialFeedCarousel.follow')}
        </a>
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden bg-white border border-gray-100 shadow-sm">
        {/* Progress bar */}
        {posts.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-100 z-10">
            <div className="h-full bg-gold transition-none" style={{ width: `${progress}%` }} />
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={idx} custom={dir}
            variants={{
              enter: d => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: d => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            {/* Image — large, full width, 16:9 */}
            <div className="w-full aspect-video overflow-hidden bg-gray-50">
              {post.image
                ? <img src={post.image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <Facebook size={48} className="text-gold/15" />
                  </div>
              }
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/8 text-gold text-[11px] font-semibold uppercase tracking-wider">
                  <Facebook size={10} /> {t('socialFeedCarousel.fromFanpage')}
                </span>
                <span className="text-[11px] text-gray-400">#{idx + 1} / {posts.length}</span>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-3">{post.description}</p>
              <a href={post.fbLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold hover:bg-amber-600 text-white text-[12px] font-semibold transition-colors self-start">
                <Facebook size={14} /> {t('socialFeedCarousel.viewOriginalPost')} <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrow nav */}
        {posts.length > 1 && (
          <>
            <button onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all shadow-sm z-10">
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all shadow-sm z-10">
              <ChevronRight size={13} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {posts.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {posts.map((p, i) => (
            <button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
              className={`shrink-0 w-8 h-6 overflow-hidden border-2 transition-all ${
                i === idx ? 'border-gold opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
              }`}
            >
              {p.image
                ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Facebook size={10} className="text-gold/40" />
                  </div>
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function SocialFeedCarousel({ compact = false }) {
  const [posts, setPosts] = useState(() => loadCache() || []);

  useEffect(() => {
    let cancelled = false;
    const cached = loadCache();
    if (cached) setPosts(cached);
    fetchActiveSocialPosts()
      .then(data => { if (cancelled || !data?.length) return; saveCache(data); setPosts(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!posts.length) return null;
  return compact ? <CompactCarousel posts={posts} /> : <FullCarousel posts={posts} />;
}
