import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Zap, Loader2, Mic, ChevronLeft, ChevronRight } from "lucide-react"; // Mic kept for empty-state
import SessionCard from "../components/dashboard/SessionCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import i18n from "../i18n";
import { useApi } from "../hooks/useApi";
import { fetchDashboard } from "../controllers/mcController";
import { fetchPracticeHistory } from "../controllers/voiceController";
import { useAuthStore } from "../store/useAuthStore";
import OverviewTab from "../components/dashboard/OverviewTab";
import PageBanner from '../components/ui/PageBanner';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Overview");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("All");
  const [timeFrame, setTimeFrame] = useState("Monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: dashboard, loading: dashLoading } = useApi(fetchDashboard);
  const { data: practiceHistory, loading: practiceLoading } = useApi(
    () => fetchPracticeHistory(user?.id),
    [user?.id]
  );
  const loading = dashLoading || practiceLoading;

  const avgAccuracy = practiceHistory?.length
    ? (practiceHistory.reduce((acc, p) => acc + (p.accuracy_score || 0), 0) / practiceHistory.length).toFixed(1)
    : "0";
  const totalPractices = practiceHistory?.length || 0;
  const avgWpm = practiceHistory?.length
    ? (practiceHistory.reduce((acc, p) => acc + (p.speaking_rate_wpm || 0), 0) / practiceHistory.length).toFixed(0)
    : "0";
  const level = Math.floor(totalPractices / 5) + 1;
  const levelLabel = totalPractices > 10 ? t('dashboard.professional') : t('dashboard.training');

  const chartData = useMemo(() => {
    if (!practiceHistory?.length) return [];
    const now = new Date();
    let data = [];
    if (timeFrame === "Daily") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        data.push({ key: d.toLocaleDateString('en-US', { weekday: 'short' }), date: d, accuracy: 0, rhythm: 0, count: 0 });
      }
      practiceHistory.forEach(p => {
        const pd = new Date(p.created_at || Date.now());
        const m = data.find(d => d.date.toDateString() === pd.toDateString());
        if (m) { m.accuracy += p.accuracy_score || 0; m.rhythm += p.rhythm_score || 0; m.count++; }
      });
    } else if (timeFrame === "Weekly") {
      for (let i = 3; i >= 0; i--) {
        data.push({ key: `Week ${4 - i}`, start: new Date(now.getTime() - (i + 1) * 7 * 86400000), end: new Date(now.getTime() - i * 7 * 86400000), accuracy: 0, rhythm: 0, count: 0 });
      }
      practiceHistory.forEach(p => {
        const pd = new Date(p.created_at || Date.now());
        const m = data.find(d => pd >= d.start && pd <= d.end);
        if (m) { m.accuracy += p.accuracy_score || 0; m.rhythm += p.rhythm_score || 0; m.count++; }
      });
    } else {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({ key: months[d.getMonth()], month: d.getMonth(), year: d.getFullYear(), accuracy: 0, rhythm: 0, count: 0 });
      }
      practiceHistory.forEach(p => {
        const pd = new Date(p.created_at || Date.now());
        const m = data.find(d => d.month === pd.getMonth() && d.year === pd.getFullYear());
        if (m) { m.accuracy += p.accuracy_score || 0; m.rhythm += p.rhythm_score || 0; m.count++; }
      });
    }
    return data.map(d => ({ name: d.key, accuracy: d.count ? +(d.accuracy / d.count).toFixed(1) : 0, rhythm: d.count ? +(d.rhythm / d.count).toFixed(1) : 0 }));
  }, [practiceHistory, timeFrame]);

  const skillsData = useMemo(() => {
    if (!practiceHistory?.length) return [];
    const n = practiceHistory.length;
    const avgAcc = practiceHistory.reduce((a, p) => a + (p.accuracy_score || 0), 0) / n;
    const avgRhy = practiceHistory.reduce((a, p) => a + (p.rhythm_score || 0), 0) / n;
    const avgW   = practiceHistory.reduce((a, p) => a + (p.speaking_rate_wpm || 0), 0) / n;
    return [
      { subject: t('dashboard.accuracy'),  A: avgAcc, fullMark: 100 },
      { subject: t('dashboard.rhythm'),    A: avgRhy, fullMark: 100 },
      { subject: t('dashboard.speed'),     A: Math.min(100, (avgW / 130) * 100), fullMark: 100 },
      { subject: t('dashboard.stability'), A: 85, fullMark: 100 },
      { subject: t('dashboard.tone'),      A: 78, fullMark: 100 },
    ];
  }, [practiceHistory]);

  const categoryStats = useMemo(() => {
    if (!practiceHistory) return [];
    const counts = {};
    practiceHistory.forEach(p => { const c = p.category || "General"; counts[c] = (counts[c] || 0) + 1; });
    return Object.keys(counts).map(cat => ({ name: cat, count: counts[cat] }));
  }, [practiceHistory]);

  const accuracyDistribution = useMemo(() => {
    if (!practiceHistory) return [];
    let b = 0, im = 0, a = 0;
    practiceHistory.forEach(p => { const s = p.accuracy_score || 0; if (s < 50) b++; else if (s < 85) im++; else a++; });
    return [
      { name: `${t('dashboard.beginner')} (<50%)`, value: b, color: '#71717a' },
      { name: `${t('dashboard.intermediate')} (50-85%)`, value: im, color: '#3b82f6' },
      { name: `${t('dashboard.advanced')} (>85%)`, value: a, color: '#f5a623' },
    ].filter(d => d.value > 0);
  }, [practiceHistory]);

  const filteredHistory = useMemo(() => {
    if (!practiceHistory) return [];
    return [...practiceHistory]
      .filter(p => filterCategory === "All" || p.category === filterCategory)
      .sort((a, b) => {
        if (sortOrder === "newest")  return new Date(b.created_at) - new Date(a.created_at);
        if (sortOrder === "oldest")  return new Date(a.created_at) - new Date(b.created_at);
        if (sortOrder === "highest") return (b.accuracy_score || 0) - (a.accuracy_score || 0);
        return 0;
      });
  }, [practiceHistory, filterCategory, sortOrder]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-[#f5a623]" size={28} />
    </div>
  );

  const statCards = [
    {
      label: t('dashboard.accuracy'),
      value: `${avgAccuracy}%`,
      tag: 'AVG',
      tagColor: 'text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20',
      sub: avgAccuracy >= 80 ? 'Xuất sắc' : avgAccuracy >= 60 ? 'Tiến bộ tốt' : 'Cần cải thiện',
      subColor: avgAccuracy >= 80 ? 'text-emerald-500' : avgAccuracy >= 60 ? 'text-blue-400' : 'text-zinc-600',
      bar: parseFloat(avgAccuracy),
      barColor: '#10b981',
    },
    {
      label: t('dashboard.practices'),
      value: totalPractices,
      tag: t('dashboard.sessions'),
      tagColor: 'text-blue-400 bg-blue-500/[0.08] border border-blue-500/20',
      sub: `${Math.max(0, 20 - totalPractices)} phiên đến cấp tiếp theo`,
      subColor: 'text-zinc-600',
      bar: Math.min(100, (totalPractices / 20) * 100),
      barColor: '#3b82f6',
    },
    {
      label: t('dashboard.level'),
      value: levelLabel,
      tag: `Lv ${level}`,
      tagColor: 'text-[#f5a623] bg-[#f5a623]/[0.08] border border-[#f5a623]/20',
      sub: `${totalPractices} phiên hoàn thành`,
      subColor: 'text-zinc-600',
      bar: ((totalPractices % 5) / 5) * 100,
      barColor: '#f5a623',
    },
    {
      label: t('dashboard.speakingRate'),
      value: avgWpm,
      tag: 'WPM',
      tagColor: 'text-violet-400 bg-violet-500/[0.08] border border-violet-500/20',
      sub: avgWpm >= 120 ? 'Tốc độ chuyên nghiệp' : 'Tốc độ trung bình',
      subColor: avgWpm >= 120 ? 'text-violet-400' : 'text-zinc-600',
      bar: Math.min(100, (avgWpm / 150) * 100),
      barColor: '#8b5cf6',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">

      <PageBanner
        icon={<Zap size={22} />}
        eyebrow={t('dashboard.greeting')}
        title={user?.fullName || t('dashboard.greetingDefault')}
        description={t('dashboard.trackProgress')}
        stats={[
          { value: `${avgAccuracy}%`, label: t('dashboard.accuracy') },
          { value: totalPractices, label: t('dashboard.sessions') || 'Buổi luyện' },
          { value: `${avgWpm}`, label: 'WPM' },
        ]}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 bg-[#111113] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">{s.label}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${s.tagColor}`}>{s.tag}</span>
            </div>
            <p className="text-[26px] font-bold text-white leading-none mb-2">{s.value}</p>
            <div className="h-1 w-full bg-white/[0.04] rounded-full mb-2">
              <div className="h-full rounded-full transition-all" style={{ width: `${s.bar}%`, backgroundColor: s.barColor }} />
            </div>
            <p className={`text-[11px] ${s.subColor}`}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/[0.06]">
        <div className="flex gap-1">
          {["Overview", "Training History"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === "Training History") setCurrentPage(1); }}
              className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? 'border-[#f5a623] text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === "Overview" ? t('dashboard.overview') : t('dashboard.trainingHistory')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "Overview" && (
          <OverviewTab
            dashboard={dashboard}
            emptyMonthlyData={chartData}
            practiceHistory={practiceHistory}
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            skillsData={skillsData}
            categoryStats={categoryStats}
            accuracyDistribution={accuracyDistribution}
          />
        )}

        {activeTab === "Training History" && (
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h3 className="text-[14px] font-semibold text-white">{t('dashboard.trainingHistory')}</h3>
              <div className="flex gap-2">
                {[
                  { value: filterCategory, onChange: (v) => { setFilterCategory(v); setCurrentPage(1); }, options: [
                    { v: 'All', l: t('dashboard.allCategories') },
                    { v: 'Basic', l: t('dashboard.basic') },
                    { v: 'News', l: t('dashboard.news') },
                    { v: 'Presentation', l: t('dashboard.presentation') },
                  ]},
                  { value: sortOrder, onChange: (v) => { setSortOrder(v); setCurrentPage(1); }, options: [
                    { v: 'newest', l: t('dashboard.newestFirst') },
                    { v: 'oldest', l: t('dashboard.oldestFirst') },
                    { v: 'highest', l: t('dashboard.highestAccuracy') },
                  ]},
                ].map((sel, i) => (
                  <select
                    key={i}
                    value={sel.value}
                    onChange={(e) => sel.onChange(e.target.value)}
                    className="bg-[#09090b] border border-white/[0.08] text-zinc-400 text-[12px] py-1.5 px-3 rounded-xl focus:outline-none focus:border-[#f5a623]/40 cursor-pointer"
                  >
                    {sel.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ))}
              </div>
            </div>

            {paginatedHistory.length > 0 ? (
              <>
                <div className="space-y-1">
                  {paginatedHistory.map((session, idx) => (
                    <SessionCard
                      key={session.id || session._id || idx}
                      session={session}
                      index={(currentPage - 1) * ITEMS_PER_PAGE + idx}
                      total={filteredHistory.length}
                      locale={i18n.language === 'vi' ? 'vi-VN' : 'en-US'}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-500 disabled:opacity-30 hover:bg-white/[0.08] hover:text-white transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="text-[12px] text-zinc-500 tabular-nums">{currentPage} / {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-500 disabled:opacity-30 hover:bg-white/[0.08] hover:text-white transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center border border-dashed border-white/[0.06] rounded-xl">
                <Mic size={28} className="mx-auto text-zinc-800 mb-3" />
                <p className="text-[13px] text-zinc-600 mb-4">{t('dashboard.noSessions')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
