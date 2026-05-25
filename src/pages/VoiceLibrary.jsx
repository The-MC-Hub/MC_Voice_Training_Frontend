import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, FileText, Award, Zap, Tag, History, Mic, PlayCircle, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { fetchLessons, fetchPracticeHistory } from "../controllers/voiceController";
import { useAuth } from "../hooks/useAuth";
import PageBanner from '../components/ui/PageBanner';

const VoiceLibrary = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterLength, setFilterLength] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const CATEGORY_LABEL = {
    GALA: t('dashboard.galaDinner'),
    WEDDING: t('dashboard.wedding'),
    CORPORATE: t('dashboard.corporate'),
    CORPORATE_EVENT: t('dashboard.corporate'),
    PRODUCT_LAUNCH: t('dashboard.productLaunch'),
    TALKSHOW: t('dashboard.talkshow'),
    GENERAL: t('dashboard.general') || 'General',
  };

  const { data: allLessons, loading: lessonsLoading } = useApi(
    () => fetchLessons({ search: searchTerm.trim() || null }),
    [searchTerm]
  );
  const { data: practiceHistory, loading: historyLoading } = useApi(
    () => fetchPracticeHistory(user?.id), [user?.id]
  );

  const loading = lessonsLoading || historyLoading;
  const lessons = allLessons || [];
  const history = practiceHistory || [];

  const getLessonStats = useCallback((lessonId) => {
    const lh = history.filter(h => h.lesson_id === lessonId || h.lessonId === lessonId);
    return { total: lh.length, best: lh.length ? Math.max(...lh.map(h => h.accuracy_score || 0)) : 0 };
  }, [history]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeCategory, filterDifficulty, filterLength, sortOrder]);

  const filteredLessons = useMemo(() => {
    let result = lessons.filter(l =>
      (activeCategory === "All" || l.category === activeCategory) &&
      (filterDifficulty === "All" || l.difficulty === filterDifficulty)
    );
    if (filterLength !== "All") {
      result = result.filter(l => {
        const w = l.content?.split(' ').length || 0;
        if (filterLength === "Short")  return w < 50;
        if (filterLength === "Medium") return w >= 50 && w <= 100;
        if (filterLength === "Long")   return w > 100;
        return true;
      });
    }
    result.sort((a, b) => {
      if (sortOrder === "newest")     return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortOrder === "score")      return getLessonStats(b.id).best - getLessonStats(a.id).best;
      if (sortOrder === "length")     return (b.content?.length || 0) - (a.content?.length || 0);
      if (sortOrder === "difficulty") { const m = { Easy: 1, Medium: 2, Hard: 3 }; return m[b.difficulty] - m[a.difficulty]; }
      return 0;
    });
    return result;
  }, [lessons, activeCategory, searchTerm, filterDifficulty, filterLength, sortOrder, getLessonStats]);

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const currentItems = filteredLessons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const difficultyStyle = (d) => {
    if (d === 'Hard')   return 'text-red-400 bg-red-500/[0.08] border-red-500/20';
    if (d === 'Medium') return 'text-[#f5a623] bg-[#f5a623]/[0.08] border-[#f5a623]/20';
    return 'text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20';
  };

  const categories = [...new Set(lessons.map(l => l.category).filter(Boolean))].sort();

  return (
    <div className="max-w-6xl mx-auto pb-16">

      <PageBanner
        icon={<Mic size={22} />}
        eyebrow="Thư viện kịch bản"
        title={t('voiceLibrary.titlePrefix')}
        highlight={t('voiceLibrary.titleSuffix')}
        description={t('voiceLibrary.description')}
        stats={[
          { value: lessons.length, label: t('voiceLibrary.lessons') },
          { value: history.length, label: t('voiceLibrary.practices') },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            {t('voiceLibrary.practiceCategories')}
          </p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveCategory("All")}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                activeCategory === "All"
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{t('voiceLibrary.allScripts')}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded ${activeCategory === "All" ? 'bg-gold/20 text-gold' : 'bg-white/6 text-zinc-600'}`}>
                {lessons.length}
              </span>
            </button>
            {categories.map(cat => {
              const count = lessons.filter(l => l.category === cat).length;
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{CATEGORY_LABEL[cat] || cat.replace(/_/g, ' ')}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${active ? 'bg-gold/20 text-gold' : 'bg-white/6 text-zinc-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI card */}
          <div className="mt-6 p-4 bg-[#111113] border border-white/[0.07] rounded-xl">
            <Zap size={18} className="text-gold mb-2.5" />
            <p className="text-[13px] font-semibold text-white mb-1.5">{t('voiceLibrary.aiCoaching')}</p>
            <p className="text-[12px] text-zinc-500 leading-relaxed">{t('voiceLibrary.aiCoachingDesc')}</p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-[#111113] border border-white/[0.07] rounded-xl focus-within:border-white/[0.14] transition-colors">
              <Search size={16} className="text-zinc-600 shrink-0" />
              <input
                type="text"
                placeholder={t('voiceLibrary.searchPlaceholder')}
                className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: filterDifficulty, onChange: setFilterDifficulty, opts: [
                  { v: 'All', l: t('voiceLibrary.difficulty') },
                  { v: 'Easy', l: t('dashboard.easy') },
                  { v: 'Medium', l: t('dashboard.medium') },
                  { v: 'Hard', l: t('dashboard.hard') },
                ]},
                { value: filterLength, onChange: setFilterLength, opts: [
                  { v: 'All', l: t('voiceLibrary.length') },
                  { v: 'Short', l: t('voiceLibrary.short') },
                  { v: 'Medium', l: t('voiceLibrary.med') },
                  { v: 'Long', l: t('voiceLibrary.long') },
                ]},
                { value: sortOrder, onChange: setSortOrder, opts: [
                  { v: 'newest', l: t('dashboard.newestFirst') },
                  { v: 'score', l: t('voiceLibrary.best') },
                  { v: 'length', l: t('voiceLibrary.lengthSort') },
                  { v: 'difficulty', l: t('voiceLibrary.hardest') },
                ]},
              ].map((sel, i) => (
                <select
                  key={i}
                  value={sel.value}
                  onChange={(e) => sel.onChange(e.target.value)}
                  className="bg-[#111113] border border-white/10 text-zinc-300 text-[12px] py-2 px-3 rounded-xl focus:outline-none focus:border-gold/30 cursor-pointer"
                >
                  {sel.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              ))}
            </div>
          </div>

          <p className="text-[12px] text-zinc-600 mb-4">
            {t('voiceLibrary.showing')} <span className="text-white">{filteredLessons.length}</span> {t('voiceLibrary.results')}
          </p>

          {/* Lesson grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-white/3 animate-pulse" />
              ))}
            </div>
          ) : currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map((lesson) => {
                const stats = getLessonStats(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col bg-[#111113] border border-white/[0.07] rounded-2xl hover:border-white/[0.14] hover:bg-[#141416] transition-colors group overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-[#0d0d0f] overflow-hidden shrink-0">
                      {lesson.thumbnailUrl ? (
                        <img
                          src={lesson.thumbnailUrl}
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Mic size={28} className="text-zinc-800" />
                        </div>
                      )}

                      {/* Video badge */}
                      {lesson.videoUrl && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-gold">
                          <Video size={10} />
                          Video
                        </div>
                      )}

                      {/* Difficulty badge */}
                      <span className={`absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded border backdrop-blur-sm bg-black/50 ${difficultyStyle(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>

                      {/* Best score badge */}
                      {stats.total > 0 && (
                        <span className="absolute bottom-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                          {stats.best.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-4">
                      {/* Category + word count */}
                      <div className="flex items-center gap-3 text-[11px] text-zinc-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Tag size={9} className="text-gold" />
                          {CATEGORY_LABEL[lesson.category] || lesson.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={9} />
                          {lesson.content?.split(' ').length || 0} {t('voiceLibrary.words')}
                        </span>
                        {stats.total > 0 && (
                          <span className="flex items-center gap-1 text-gold">
                            <History size={9} />
                            {stats.total}×
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-[14px] font-semibold text-white leading-snug mb-2 line-clamp-2">
                        {lesson.title}
                      </h3>

                      {/* Description */}
                      {lesson.description && (
                        <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2 mb-3">
                          {lesson.description}
                        </p>
                      )}

                      {/* CTA */}
                      <div className="mt-auto pt-3 border-t border-white/6">
                        <button
                          onClick={() => navigate(isAuthenticated ? `/m/voice/practice/${lesson.id}` : '/login')}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-black text-[12px] font-semibold hover:bg-gold-hover transition-colors"
                        >
                          <Zap size={13} />
                          {t('common.start')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Mic size={28} className="mx-auto text-zinc-800 mb-3" />
              <p className="text-zinc-600 text-[14px]">No lessons found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-400 text-[12px] disabled:opacity-30 hover:bg-[#1a1a1e] transition-colors"
              >
                {t('common.prev')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                    currentPage === p
                      ? 'bg-gold text-black'
                      : 'bg-[#111113] border border-white/10 text-zinc-400 hover:bg-[#1a1a1e]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-400 text-[12px] disabled:opacity-30 hover:bg-[#1a1a1e] transition-colors"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceLibrary;
