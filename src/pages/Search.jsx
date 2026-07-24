import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';
import {
  Search as SearchIcon, MapPin, Star, Mic, Filter,
  GraduationCap, DollarSign, X as XIcon, ChevronRight,
  Info, TrendingUp, Sparkles, SlidersHorizontal,
} from 'lucide-react';

const EVENT_TYPES = [
  'WEDDING', 'CORPORATE_EVENT', 'CONFERENCE', 'SEMINAR', 'GALA_DINNER',
  'BIRTHDAY', 'FESTIVAL', 'CONCERT', 'WORKSHOP', 'AWARD_CEREMONY',
];

const EVENT_LABELS = {
  WEDDING: 'Cưới', CORPORATE_EVENT: 'Doanh nghiệp', CONFERENCE: 'Hội thảo',
  SEMINAR: 'Seminar', GALA_DINNER: 'Gala', BIRTHDAY: 'Sinh nhật',
  FESTIVAL: 'Lễ hội', CONCERT: 'Hòa nhạc', WORKSHOP: 'Workshop',
  AWARD_CEREMONY: 'Lễ trao giải',
};

const HOME_REGIONS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Đà Lạt', 'Nha Trang', 'Huế'];

const BUDGET_OPTIONS = [
  { label: 'Dưới 5 triệu', max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 50 triệu', min: 20000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000 },
];

const EXP_OPTIONS = [
  { label: 'Dưới 2 năm', min: 0, max: 2 },
  { label: '2 - 5 năm', min: 2, max: 5 },
  { label: '5 - 10 năm', min: 5, max: 10 },
  { label: 'Trên 10 năm', min: 10 },
];

function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const items = [
    { key: 'event_type_match', label: 'Loại sự kiện', icon: Mic },
    { key: 'region_match', label: 'Khu vực', icon: MapPin },
    { key: 'budget_fit', label: 'Ngân sách', icon: DollarSign },
    { key: 'experience_bonus', label: 'Kinh nghiệm', icon: GraduationCap },
    { key: 'rating_bonus', label: 'Đánh giá', icon: Star },
    { key: 'keyword_match', label: 'Từ khóa', icon: SearchIcon },
  ];
  return (
    <div className="absolute top-full left-0 mt-2 w-64 p-3 rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl z-10 text-[11px]">
      <p className="text-zinc-400 font-semibold mb-2 text-[10px] uppercase tracking-wider">Chi tiết điểm</p>
      <div className="space-y-1.5">
        {items.map(({ key, label, icon: Icon }) => {
          const val = breakdown[key];
          if (val === undefined || val === null) return null;
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Icon size={10} />
                {label}
              </span>
              <span className={val > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-600'}>
                {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}
              </span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between text-xs font-bold text-white">
        <span>Tổng</span>
        <span>{typeof breakdown.total === 'number' ? (Number.isInteger(breakdown.total) ? breakdown.total : breakdown.total.toFixed(1)) : breakdown.total}</span>
      </div>
    </div>
  );
}

export default function Search() {
  const [mcs, setMcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [budgetRange, setBudgetRange] = useState(null);
  const [expRange, setExpRange] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [showFilters, setShowFilters] = useState(false);
  const [tooltipId, setTooltipId] = useState(null);
  const [useSmartSearch, setUseSmartSearch] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchMcs = useSmartSearch
      ? api.post('/public/mcs/search', {
          keyword: search || undefined,
          eventTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
          regions: selectedRegions.length > 0 ? selectedRegions : undefined,
          budgetMax: budgetRange?.max,
          budgetMin: budgetRange?.min,
          minExperience: expRange?.min,
          sortBy,
        }).then(r => r.data.data || [])
      : api.get('/public/mcs').then(r => r.data.data?.mcs || []);

    fetchMcs.then(data => {
      setMcs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [useSmartSearch, search, selectedTypes, selectedRegions, budgetRange, expRange, sortBy]);

  const filtered = useMemo(() => {
    if (useSmartSearch) return mcs; // backend did filtering

    let result = mcs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (mc) =>
          (mc.name || '').toLowerCase().includes(q) ||
          (mc.biography || '').toLowerCase().includes(q) ||
          (mc.eventTypes || []).some((et) => et.toLowerCase().includes(q))
      );
    }
    if (selectedTypes.length > 0) {
      result = result.filter((mc) =>
        (mc.eventTypes || []).some((et) => selectedTypes.includes(et))
      );
    }
    if (selectedRegions.length > 0) {
      result = result.filter((mc) =>
        (mc.regions || []).some((r) => selectedRegions.includes(r))
      );
    }
    if (budgetRange) {
      result = result.filter((mc) => {
        const max = mc.ratesMax || Infinity;
        const min = mc.ratesMin || 0;
        if (budgetRange.max && min > budgetRange.max) return false;
        if (budgetRange.min != null && max < budgetRange.min) return false;
        return true;
      });
    }
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'experience') result.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    else if (sortBy === 'price_low') result.sort((a, b) => (a.ratesMin || 0) - (b.ratesMin || 0));
    else if (sortBy === 'price_high') result.sort((a, b) => (b.ratesMax || 0) - (a.ratesMax || 0));
    return result;
  }, [mcs, search, selectedTypes, selectedRegions, budgetRange, sortBy, useSmartSearch]);

  const toggleType = (type) => setSelectedTypes((p) => p.includes(type) ? p.filter(t => t !== type) : [...p, type]);
  const toggleRegion = (r) => setSelectedRegions((p) => p.includes(r) ? p.filter(x => x !== r) : [...p, r]);

  const clearFilters = () => {
    setSearch(''); setSelectedTypes([]); setSelectedRegions([]);
    setBudgetRange(null); setExpRange(null); setSortBy('score');
  };

  const hasFilters = search || selectedTypes.length > 0 || selectedRegions.length > 0 || budgetRange || expRange;
  const displayData = useSmartSearch ? mcs : filtered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tìm MC</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {mcs.length} MC chuyên nghiệp sẵn sàng cho sự kiện của bạn
            </p>
          </div>
          <button
            onClick={() => { setUseSmartSearch(!useSmartSearch); setShowFilters(true); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              useSmartSearch
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-amber-300'
            }`}
          >
            <Sparkles size={14} />
            {useSmartSearch ? 'Gợi ý thông minh' : 'Tìm thường'}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, loại sự kiện..."
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-20 py-3.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-sm"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-14 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showFilters ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <SlidersHorizontal size={16} />
          </button>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors">
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 mb-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                {/* Event type filter */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Loại sự kiện</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EVENT_TYPES.map((type) => (
                      <button key={type} onClick={() => toggleType(type)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                          selectedTypes.includes(type)
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}>
                        {EVENT_LABELS[type] || type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region filter */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Khu vực</p>
                  <div className="flex flex-wrap gap-1.5">
                    {HOME_REGIONS.map((r) => (
                      <button key={r} onClick={() => toggleRegion(r)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                          selectedRegions.includes(r)
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget filter */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Ngân sách</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGET_OPTIONS.map((opt, i) => (
                      <button key={i} onClick={() => setBudgetRange(budgetRange?.max === opt.max && budgetRange?.min === opt.min ? null : opt)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                          budgetRange?.max === opt.max && budgetRange?.min === (opt.min || undefined)
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience filter */}
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Kinh nghiệm</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXP_OPTIONS.map((opt, i) => (
                      <button key={i} onClick={() => setExpRange(expRange?.min === opt.min && expRange?.max === opt.max ? null : opt)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                          expRange?.min === opt.min && expRange?.max === opt.max
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort + results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-zinc-400">
            {displayData.length} kết quả
          </p>
          <div className="flex items-center gap-2">
            {useSmartSearch && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                <Sparkles size={10} />
                Gợi ý thông minh
              </span>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs outline-none focus:border-amber-400"
            >
              <option value="score">Gợi ý tốt nhất</option>
              <option value="rating">Xếp hạng cao nhất</option>
              <option value="experience">Kinh nghiệm nhiều nhất</option>
              <option value="price_low">Giá thấp → cao</option>
              <option value="price_high">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        {/* MC Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="h-10 w-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : displayData.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Mic size={28} className="text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-zinc-500 font-medium">Không tìm thấy MC phù hợp</p>
            <p className="text-xs text-zinc-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {displayData.map((item, i) => {
                // Normalize: backend returns {profile, score, scoreBreakdown}, get returns raw profile
                const mc = item.profile || item;
                const score = item.score;
                const breakdown = item.scoreBreakdown;
                const id = mc.id || mc._id || i;
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300 relative"
                  >
                    {/* Score badge */}
                    {score !== undefined && score !== null && score > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setTooltipId(tooltipId === id ? null : id)}
                          className="absolute top-0 right-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-semibold z-5"
                        >
                          <TrendingUp size={10} />
                          {score.toFixed(1)}
                          <Info size={9} className="opacity-60" />
                        </button>
                        {tooltipId === id && (
                          <div className="absolute top-6 right-0 z-20" onClick={() => setTooltipId(null)}>
                            <ScoreBreakdown breakdown={breakdown} />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800 group-hover:ring-amber-200 dark:group-hover:ring-amber-800 transition-all">
                          <img
                            src={mc.avatar || 'https://ui-avatars.com/api/?name=MC&background=amber&color=fff'}
                            alt={mc.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {mc.verified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-[9px] font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate group-hover:text-amber-600 transition-colors">
                          {mc.name}
                        </h3>
                        {mc.rating > 0 ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                              {mc.rating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              ({mc.reviewsCount || 0})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Chưa có đánh giá</span>
                        )}
                      </div>
                    </div>

                    {mc.eventTypes?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {mc.eventTypes.slice(0, 3).map((et) => (
                          <span key={et} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                            {EVENT_LABELS[et] || et}
                          </span>
                        ))}
                        {mc.eventTypes.length > 3 && (
                          <span className="text-[10px] text-zinc-400">+{mc.eventTypes.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-400 mb-4">
                      {mc.regions?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {mc.regions[0]}
                        </span>
                      )}
                      {mc.experience > 0 && (
                        <span className="flex items-center gap-1">
                          <GraduationCap size={10} />
                          {mc.experience} năm
                        </span>
                      )}
                      {mc.ratesMin > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} />
                          {mc.ratesMin.toLocaleString('vi-VN')}đ - {mc.ratesMax.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                      {mc.totalEvents > 0 && (
                        <span className="flex items-center gap-1" title="Tổng sự kiện đã dẫn">
                          🎤 {mc.totalEvents} SK
                        </span>
                      )}
                      {mc.responseTime > 0 && (
                        <span className="flex items-center gap-1 text-emerald-500" title="Thời gian phản hồi trung bình">
                          ⚡ {mc.responseTime}ph
                        </span>
                      )}
                      {mc.languages?.length > 0 && (
                        <span className="flex items-center gap-1">
                          🌐 {mc.languages.length} ngôn ngữ
                        </span>
                      )}
                    </div>

                    {mc.biography && (
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-2 leading-relaxed">{mc.biography}</p>
                    )}

                    {mc.achievements?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {mc.achievements.slice(0, 2).map((a, ai) => (
                          <span key={ai} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                            🏅 {a}
                          </span>
                        ))}
                        {mc.achievements.length > 2 && (
                          <span className="text-[9px] text-zinc-400">+{mc.achievements.length - 2}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                      <Link
                        to={`/m/mc/${mc.id || mc.userId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-all active:scale-[0.97] shadow-sm"
                      >
                        Xem hồ sơ <ChevronRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
