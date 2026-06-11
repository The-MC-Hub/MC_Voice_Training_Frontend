import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flame, BookOpen, Clock, ChevronRight, Mic, PlayCircle, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchFeaturedLessons } from '../../controllers/voiceController';

const EXCLUDED_PATHS = ['/m/admin', '/m/voice/practice', '/login', '/register', '/onboarding'];

const CATEGORY_COLOR = {
  WEDDING: '#f59e0b',
  GALA: '#a78bfa',
  CORPORATE: '#60a5fa',
  TALKSHOW: '#34d399',
  GENERAL: '#fb923c',
  PRODUCT_LAUNCH: '#f472b6',
};

const CATEGORY_LABEL = {
  WEDDING: 'Đám cưới',
  GALA: 'Gala',
  CORPORATE: 'Doanh nghiệp',
  TALKSHOW: 'Talkshow',
  GENERAL: 'Tổng hợp',
  PRODUCT_LAUNCH: 'Ra mắt SP',
};

const CATEGORY_ICON = {
  WEDDING: '💍',
  GALA: '✨',
  CORPORATE: '💼',
  TALKSHOW: '🎙️',
  GENERAL: '📢',
  PRODUCT_LAUNCH: '🚀',
};

const DIFF_META = {
  EASY:         { label: 'Dễ',          color: '#34d399', tag: 'Người mới' },
  BEGINNER:     { label: 'Sơ cấp',      color: '#34d399', tag: 'Người mới' },
  INTERMEDIATE: { label: 'Trung cấp',   color: '#f5a623', tag: 'Có kinh nghiệm' },
  MEDIUM:       { label: 'Trung cấp',   color: '#f5a623', tag: 'Có kinh nghiệm' },
  ADVANCED:     { label: 'Nâng cao',    color: '#f87171', tag: 'MC chuyên nghiệp' },
  HARD:         { label: 'Khó',         color: '#f87171', tag: 'MC chuyên nghiệp' },
};

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

function LessonCard({ lesson, rank }) {
  const navigate = useNavigate();
  const cat = lesson.category || 'GENERAL';
  const accent = CATEGORY_COLOR[cat] || '#f5a623';
  const diff = (lesson.difficulty || 'EASY').toUpperCase();
  const diffMeta = DIFF_META[diff] || DIFF_META.EASY;
  const preview = lesson.content
    ? lesson.content.trim().split(/\s+/).slice(0, 10).join(' ') + '…'
    : null;

  return (
    <div className="w-full bg-white border border-black/8 overflow-hidden">
      <div className="h-0.5" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />

      {/* Thumbnail */}
      {lesson.thumbnailUrl ? (
        <div className="w-full aspect-video overflow-hidden bg-gray-100">
          <img src={lesson.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="w-full h-10 flex items-center justify-center"
          style={{ background: `${accent}10` }}
        >
          <Mic size={14} style={{ color: `${accent}60` }} />
        </div>
      )}

      <div className="p-3">
        {/* Rank tag */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: accent }}>
            {RANK_MEDALS[rank] ? `${RANK_MEDALS[rank]} #${rank}` : `#${rank}`} · {CATEGORY_LABEL[cat] || cat}
          </span>
        </div>

        {/* Title */}
        <p className="text-[12px] font-semibold text-gray-900 mb-1.5 leading-tight line-clamp-2">
          {lesson.title}
        </p>

        {/* Content preview 10 words — rendered markdown */}
        {preview && (
          <div className="text-[10px] text-gray-500 leading-relaxed mb-2 line-clamp-3 prose prose-xs max-w-none
            [&_strong]:font-semibold [&_strong]:text-gray-700
            [&_em]:italic [&_h1]:text-[10px] [&_h2]:text-[10px] [&_h3]:text-[10px]
            [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview}</ReactMarkdown>
          </div>
        )}

        {/* Difficulty */}
        <span className="text-[10px] font-semibold block mb-2" style={{ color: diffMeta.color }}>
          {diffMeta.label} · {diffMeta.tag}
        </span>

        <button
          onClick={() => navigate(`/m/voice/practice/${lesson.id}`)}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-[11px] font-semibold transition-opacity hover:opacity-85"
          style={{ background: accent, color: '#000' }}
        >
          <Mic size={10} /> Luyện tập <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

const CACHE_KEY = 'mchub_popular_lessons_cache';
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const { data, exp } = JSON.parse(raw);
    return Date.now() < exp ? data : [];
  } catch { return []; }
}
function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, exp: Date.now() + 10 * 60 * 1000 }));
  } catch {}
}

export default function PopularLessonsSidebar() {
  const location = useLocation();
  const [lessons, setLessons] = useState(loadCache);

  const hidden = EXCLUDED_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const cached = loadCache();
    if (cached.length) setLessons(cached);

    const load = async () => {
      try {
        // Try featured first (sorted by practiceCount)
        const featured = await fetchFeaturedLessons(10);
        if (featured?.length >= 9) {
          saveCache(featured);
          setLessons(featured);
          return;
        }
        // Not enough featured — fallback to all lessons, featured first
        const { fetchLessons } = await import('../../controllers/voiceController');
        const all = await fetchLessons({});
        if (!all?.length) return;
        const featuredIds = new Set((featured || []).map(l => l.id));
        const rest = all.filter(l => !featuredIds.has(l.id));
        const merged = [...(featured || []), ...rest].slice(0, 10);
        saveCache(merged);
        setLessons(merged);
      } catch {}
    };
    load();
  }, []);

  if (hidden || !lessons.length) return null;

  return (
    <div
      className="hidden md:flex fixed top-14 left-0 bottom-0 z-40 flex-col overflow-y-auto"
      style={{
        width: '180px',
        background: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        scrollbarWidth: 'none',
      }}
    >
      <div className="flex flex-col gap-2 p-2 pt-3">
        <div className="flex items-center gap-1.5 px-1 mb-1">
          <Flame size={10} className="text-orange-400" />
          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Bài luyện phổ biến</p>
        </div>

        {lessons.map((lesson, i) => (
          <LessonCard key={lesson.id} lesson={lesson} rank={i + 1} />
        ))}

        <div className="h-px bg-black/6 mx-1 mt-1" />
        <button
          onClick={() => { window.location.href = '/m/voice/library'; }}
          className="flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          <BookOpen size={9} /> Xem tất cả <ChevronRight size={9} />
        </button>

        <p className="text-[8px] text-gray-300 text-center mt-1">MCHub · Gợi ý luyện tập</p>
      </div>
    </div>
  );
}
