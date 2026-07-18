import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, FileText, Award, Zap, Tag, History, Mic, PlayCircle, Video, TrendingUp, Flame, LayoutList, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { fetchLessons, fetchPracticeHistory, fetchFeaturedLessons } from "../controllers/voiceController";
import { useAuth } from "../hooks/useAuth";
import PageBanner from '../components/ui/PageBanner';
import UpgradeBanner from '../components/ui/UpgradeBanner';
import Breadcrumb from '../components/ui/Breadcrumb';
import { trackLessonClick, trackVoiceLibrarySearch, trackVoiceLibraryFilter } from '@/utils/analytics';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Skeleton } from '@/components/ui/skeleton';

const VoiceLibrary = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterLength, setFilterLength] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
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
  const { data: featuredLessons } = useApi(() => fetchFeaturedLessons(6), []);

  const loading = lessonsLoading || historyLoading;
  const lessons = allLessons || [];
  const history = practiceHistory || [];

  const getLessonStats = useCallback((lessonId) => {
    const lh = history.filter(h => h.lesson_id === lessonId || h.lessonId === lessonId);
    return { total: lh.length, best: lh.length ? Math.max(...lh.map(h => h.accuracy_score || 0)) : 0 };
  }, [history]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeCategory, filterDifficulty, filterLength, sortOrder]);

  const searchDebounceRef = useRef(null);
  useEffect(() => {
    if (!searchTerm.trim()) return;
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      trackVoiceLibrarySearch(searchTerm.trim());
    }, 600);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchTerm]);

  useEffect(() => {
    trackVoiceLibraryFilter(activeCategory, filterDifficulty, filterLength, sortOrder);
  }, [activeCategory, filterDifficulty, filterLength, sortOrder]);

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
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6">
      <Breadcrumb items={[{ label: t('voicePractice.breadcrumbPractice') }]} />

      <PageBanner
        icon={<Mic size={22} />}
        eyebrow={t('voiceLibrary.titlePrefix') + ' ' + t('voiceLibrary.titleSuffix')}
        title={t('voiceLibrary.titlePrefix')}
        highlight={t('voiceLibrary.titleSuffix')}
        description={t('voiceLibrary.description')}
        stats={[
          { value: lessons.length, label: t('voiceLibrary.lessons') },
          { value: history.length, label: t('voiceLibrary.practices') },
        ]}
      />

      {/* Featured lessons */}
      {featuredLessons?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={15} className="text-gold" />
            <span className="text-[13px] font-semibold text-white">{t('voiceLibrary.featuredLessons')}</span>
            <span className="text-[11px] text-zinc-600 ml-1">{t('voiceLibrary.mostPracticed')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredLessons.map((lesson, i) => {
              const stats = getLessonStats(lesson.id);
              return (
                <div
                  key={lesson.id}
                  onClick={() => { trackLessonClick(lesson.id, lesson.category); navigate(`/m/voice/practice/${lesson.id}`); }}
                  className="relative flex items-center gap-3 px-4 py-3 bg-[#111113] border border-white/[0.07] rounded-xl hover:border-gold/30 hover:bg-[#141416] transition-all cursor-pointer group"
                >
                  {/* Rank badge */}
                  <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                    i === 0 ? 'bg-gold text-black' : i === 1 ? 'bg-zinc-400/20 text-zinc-300' : 'bg-zinc-700/30 text-zinc-500'
                  }`}>
                    {i + 1}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate leading-snug">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-600">{CATEGORY_LABEL[lesson.category] || lesson.category}</span>
                      <span className="text-[10px] text-zinc-600">·</span>
                      <span className={`text-[10px] font-medium ${lesson.difficulty === 'Hard' ? 'text-red-400' : lesson.difficulty === 'Medium' ? 'text-gold' : 'text-emerald-400'}`}>
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                  {/* Practice count */}
                  <div className="shrink-0 flex items-center gap-1 text-gold">
                    <TrendingUp size={11} />
                    <span className="text-[12px] font-bold tabular-nums">{lesson.practiceCount}</span>
                    <span className="text-[10px] text-zinc-600">{t('voiceLibrary.usesUnit')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar — vertical on lg+, horizontal scroll on mobile */}
        <aside className="md:w-56 shrink-0">
          <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider mb-3">
            {t('voiceLibrary.practiceCategories')}
          </p>

          {/* Mobile: horizontal scroll pill row */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            {[{ cat: 'All', label: t('voiceLibrary.allScripts'), count: lessons.length },
              ...categories.map(cat => ({ cat, label: CATEGORY_LABEL[cat] || cat.replace(/_/g, ' '), count: lessons.filter(l => l.category === cat).length }))
            ].map(({ cat, label, count }) => {
              const active = activeCategory === cat;
              return (
                <Button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors h-auto ${
                    active ? 'bg-gold/10 text-gold border border-gold/20' : 'text-zinc-400 bg-white/5 border border-white/8 hover:text-white'
                  }`}
                >
                  {label}
                  <span className={`text-[10px] px-1 rounded ${active ? 'text-gold' : 'text-zinc-600'}`}>{count}</span>
                </Button>
              );
            })}
          </div>

          {/* Desktop: vertical list */}
          <div className="hidden md:flex flex-col gap-1">
            <Button
              hoverScale={1}
              onClick={() => setActiveCategory("All")}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors h-auto ${
                activeCategory === "All"
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{t('voiceLibrary.allScripts')}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded ${activeCategory === "All" ? 'bg-gold/20 text-gold' : 'bg-white/6 text-zinc-600'}`}>
                {lessons.length}
              </span>
            </Button>
            {categories.map(cat => {
              const count = lessons.filter(l => l.category === cat).length;
              const active = activeCategory === cat;
              return (
                <Button
                  key={cat}
                  hoverScale={1}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors h-auto ${
                    active
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{CATEGORY_LABEL[cat] || cat.replace(/_/g, ' ')}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${active ? 'bg-gold/20 text-gold' : 'bg-white/6 text-zinc-600'}`}>
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Upgrade upsell or AI card — desktop only */}
          <div className="hidden md:block">
            {(() => {
              const plan = user?.plan || 'FREE';
              const aiUsed = user?.aiSessionsUsed ?? 0;
              const aiLimit = plan === 'FREE' ? 5 : plan === 'BASIC' ? 20 : null;
              const usagePct = aiLimit ? (aiUsed / aiLimit) * 100 : 0;
              if (aiLimit && usagePct >= 60) {
                return (
                  <div className="mt-6">
                    <UpgradeBanner variant="inline" plan={plan} used={aiUsed} limit={aiLimit} />
                  </div>
                );
              }
              return (
                <div className="mt-6 p-4 bg-[#111113] border border-white/[0.07] rounded-xl">
                  <Zap size={18} className="text-gold mb-2.5" />
                  <p className="text-[13px] font-semibold text-white mb-1.5">{t('voiceLibrary.aiCoaching')}</p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">{t('voiceLibrary.aiCoachingDesc')}</p>
                </div>
              );
            })()}
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

          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] text-zinc-600">
              {t('voiceLibrary.showing')} <span className="text-white">{filteredLessons.length}</span> {t('voiceLibrary.results')}
            </p>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-[#111113] border border-white/[0.07] rounded-xl p-1 shrink-0">
              <Button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors h-auto ${viewMode === 'list' ? 'bg-gold/10 text-gold' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                <LayoutList size={15} />
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors h-auto ${viewMode === 'grid' ? 'bg-gold/10 text-gold' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                <LayoutGrid size={15} />
              </Button>
            </div>
          </div>

          {/* Lesson list / grid */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'flex flex-col gap-2'}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className={`rounded-xl bg-white/3 ${viewMode === 'grid' ? 'aspect-[3/4]' : 'h-20'}`} />
              ))}
            </div>
          ) : currentItems.length > 0 ? (
            viewMode === 'list' ? (
              <div className="flex flex-col gap-2">
                {currentItems.map((lesson, lessonIdx) => {
                  const stats = getLessonStats(lesson.id);
                  const wordCount = lesson.content?.split(' ').length || 0;
                  return (
                    <div
                      key={lesson.id}
                      {...(lessonIdx === 0 ? { 'data-quest': 'quest-first-lesson' } : {})}
                      className="flex items-center gap-4 px-4 py-3 bg-[#111113] border border-white/[0.07] rounded-xl hover:border-white/[0.14] hover:bg-[#141416] transition-all group cursor-pointer"
                      onClick={() => { trackLessonClick(lesson.id, lesson.category); navigate(`/m/voice/practice/${lesson.id}`); }}
                    >
                      <div className="relative w-16 h-16 rounded-xl bg-[#0d0d0f] border border-white/[0.06] overflow-hidden shrink-0 flex items-center justify-center">
                        {lesson.thumbnailUrl ? (
                          <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Mic size={18} className="text-zinc-600" />
                            <span className="text-[9px] text-zinc-700 uppercase tracking-wide">MC</span>
                          </div>
                        )}
                        {lesson.videoUrl && (
                          <div className="absolute bottom-1 right-1 w-4 h-4 rounded flex items-center justify-center bg-black/80">
                            <Video size={8} className="text-gold" />
                          </div>
                        )}
                        {/* Hover mic overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                          <Mic size={20} className="text-gold" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-white leading-snug truncate mb-1.5">{lesson.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${difficultyStyle(lesson.difficulty)}`}>
                            {lesson.difficulty}
                          </span>
                          <span className="text-[11px] text-zinc-500">{CATEGORY_LABEL[lesson.category] || lesson.category}</span>
                          <span className="text-[11px] text-zinc-600">·</span>
                          <span className="text-[11px] text-zinc-600">{wordCount} {t('voiceLibrary.words')}</span>
                          {stats.total > 0 && (
                            <span className="text-[11px] text-gold/70 ml-auto hidden sm:block">{t('voiceLibrary.timesPracticed', { count: stats.total })}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {stats.total > 0 && (
                          <div className="text-right hidden sm:block">
                            <p className="text-[17px] font-bold text-emerald-400 tabular-nums leading-none">{stats.best.toFixed(0)}%</p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">{t('voiceLibrary.bestScore')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Grid view */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {currentItems.map((lesson, lessonIdx) => {
                  const stats = getLessonStats(lesson.id);
                  const wordCount = lesson.content?.split(' ').length || 0;
                  return (
                    <div
                      key={lesson.id}
                      {...(lessonIdx === 0 ? { 'data-quest': 'quest-first-lesson' } : {})}
                      className="group flex flex-col bg-[#111113] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-gold/25 hover:shadow-[0_0_20px_rgba(245,166,35,0.06)] transition-all cursor-pointer"
                      onClick={() => { trackLessonClick(lesson.id, lesson.category); navigate(`/m/voice/practice/${lesson.id}`); }}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-video bg-[#0d0d0f] flex items-center justify-center overflow-hidden">
                        {lesson.thumbnailUrl ? (
                          <img src={lesson.thumbnailUrl} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                              <Mic size={18} className="text-zinc-600" />
                            </div>
                            <span className="text-[9px] text-zinc-700 uppercase tracking-wider">MC Script</span>
                          </div>
                        )}
                        {lesson.videoUrl && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 border border-white/10">
                            <Video size={9} className="text-gold" />
                            <span className="text-[9px] text-gold">Video</span>
                          </div>
                        )}
                        {stats.total > 0 && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 border border-white/10">
                            <span className="text-[9px] text-emerald-400 font-bold tabular-nums">{stats.best.toFixed(0)}%</span>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                            <PlayCircle size={20} className="text-black" />
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        {/* Title */}
                        <h3 className="text-[13px] font-semibold text-white leading-snug line-clamp-2">{lesson.title}</h3>

                        {/* Category + read time */}
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                          <Tag size={9} className="shrink-0" />
                          <span className="truncate">{CATEGORY_LABEL[lesson.category] || lesson.category}</span>
                          <span>·</span>
                          <span className="shrink-0">~{Math.max(1, Math.round(wordCount / 130))} {t('voiceLibrary.minRead')}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-1">
                          <div className="flex justify-between text-[9px] mb-1">
                            <span className="text-zinc-700">{t('voiceLibrary.highestScore')}</span>
                            <span className={stats.total > 0 ? 'text-emerald-400 font-bold tabular-nums' : 'text-zinc-700'}>
                              {stats.total > 0 ? `${stats.best.toFixed(0)}%` : '—'}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${stats.total > 0 ? stats.best : 0}%`,
                                backgroundColor: stats.best >= 80 ? '#10b981' : stats.best >= 50 ? '#f5a623' : '#6366f1'
                              }}
                            />
                          </div>
                        </div>

                        {/* Status chip + lượt luyện */}
                        <div className="flex items-center justify-between mt-auto pt-1">
                          {(() => {
                            if (stats.total === 0) return (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-600">{t('voiceLibrary.statusNotPracticed')}</span>
                            );
                            if (stats.best < 60) return (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">{t('voiceLibrary.statusLearning')}</span>
                            );
                            if (stats.best < 85) return (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold">{t('voiceLibrary.statusImproving')}</span>
                            );
                            return (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{t('voiceLibrary.statusMastered')}</span>
                            );
                          })()}
                          {stats.total > 0 && (
                            <span className="text-[10px] text-zinc-600">{t('voiceLibrary.timesPracticed', { count: stats.total })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="py-20 text-center">
              <Mic size={28} className="mx-auto text-zinc-800 mb-3" />
              <p className="text-zinc-600 text-[14px]">{t('voiceLibrary.noLessonsFound')}</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-8">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-400 text-[12px] disabled:opacity-30 hover:bg-[#1a1a1e] transition-colors h-auto"
              >
                {t('common.prev')}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                    currentPage === p
                      ? 'bg-gold text-black'
                      : 'bg-[#111113] border border-white/10 text-zinc-400 hover:bg-[#1a1a1e]'
                  }`}
                >
                  {p}
                </Button>
              ))}
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-400 text-[12px] disabled:opacity-30 hover:bg-[#1a1a1e] transition-colors h-auto"
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceLibrary;
