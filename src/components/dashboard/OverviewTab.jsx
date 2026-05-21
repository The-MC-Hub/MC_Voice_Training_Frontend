import React from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, Cell,
  PieChart, Pie
} from "recharts";
import { Zap, MoreVertical, TrendingUp, Mic, Award, BarChart3, PieChart as PieIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const OverviewTab = ({
  dashboard, emptyMonthlyData, cardStyle, tooltipStyle, practiceHistory,
  timeFrame, setTimeFrame, skillsData, categoryStats, accuracyDistribution
}) => {
  const { t, i18n: i18nInstance } = useTranslation();

  const cleanTooltipStyle = {
    backgroundColor: "#111113",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#fafafa",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Main Chart & Progress Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#f5a623]" />
                  {t('dashboard.trainingProgress')}
                </h3>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {timeFrame === "Daily" ? t('dashboard.last7Days') :
                    timeFrame === "Weekly" ? t('dashboard.last4Weeks') :
                      t('dashboard.last6Months')}
                </p>
              </div>
              <div className="flex bg-[#09090b] p-1 rounded-xl border border-white/[0.06]">
                {["Daily", "Weekly", "Monthly"].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      timeFrame === tf
                        ? "bg-[#f5a623] text-black"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {tf === "Daily" ? t('dashboard.day') : tf === "Weekly" ? t('dashboard.week') : t('dashboard.month')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emptyMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5a623" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rhyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={cleanTooltipStyle} itemStyle={{ fontSize: "12px" }} />
                  <Legend verticalAlign="top" align="right" height={40} iconType="circle"
                    wrapperStyle={{ fontSize: "11px", letterSpacing: "0.05em", paddingBottom: "20px", color: "#a1a1aa" }} />
                  <Area name={t('dashboard.accuracyPercent')} type="monotone" dataKey="accuracy" stroke="#f5a623" strokeWidth={2} fillOpacity={1} fill="url(#accGrad)" />
                  <Area name={t('dashboard.rhythmPercent')} type="monotone" dataKey="rhythm" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#rhyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar: Mastery Roadmap */}
        <div className="lg:col-span-4">
          <div className="bg-[#f5a623] rounded-2xl p-6 h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-5">
              <div className="bg-black/[0.12] p-2.5 rounded-xl">
                <Zap size={20} className="text-black" />
              </div>
              <MoreVertical size={18} className="text-black/40 cursor-pointer" />
            </div>
            <h3 className="text-black font-bold text-[17px] mb-2 tracking-tight">{t('dashboard.voiceMasteryRoadmap')}</h3>
            <p className="text-black/70 text-[13px] mb-6 leading-relaxed">
              {practiceHistory?.length > 10 ? t('dashboard.masterDesc') : t('dashboard.newAmbassadorDesc')}
            </p>

            <div className="space-y-5">
              {[
                { label: t('dashboard.articulation'), val: 85 },
                { label: t('dashboard.rhythm'), val: 72 },
              ].map(p => (
                <div key={p.label}>
                  <div className="flex justify-between text-[11px] font-semibold text-black mb-2 uppercase tracking-wider">
                    <span>{p.label}</span><span>{p.val}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-black/50" style={{ width: `${p.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <Link to="/m/learning" className="w-full block mt-8">
              <button className="w-full py-2.5 rounded-xl bg-black text-white text-[12px] font-semibold hover:bg-black/80 transition-colors">
                {t('dashboard.viewDetailedPath')}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Row: Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Radar: Skills Balance */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-5">
            <Award size={13} className="text-[#f5a623]" />
            <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('dashboard.skillsMatrix')}</h4>
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10 }} />
                <Radar name={t('dashboard.skills')} dataKey="A" stroke="#f5a623" strokeWidth={2} fill="#f5a623" fillOpacity={0.1} />
                <Tooltip contentStyle={cleanTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-zinc-500 text-center mt-3 px-3 leading-relaxed bg-[#09090b] border border-white/[0.06] py-2 rounded-lg w-full">
            {t('dashboard.speedExcellent')}
          </p>
        </div>

        {/* Bar: Activity by Category */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={13} className="text-indigo-400" />
            <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('dashboard.trainingFocus')}</h4>
          </div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} layout="vertical" margin={{ left: -10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} width={80} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={cleanTooltipStyle} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#8b5cf6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut: Accuracy Breakdown */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-5">
            <PieIcon size={13} className="text-emerald-400" />
            <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('dashboard.proficiency')}</h4>
          </div>
          <div style={{ width: "100%", height: 200 }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={accuracyDistribution} innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                  {accuracyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name.includes('Advanced') ? '#10b981' : entry.name.includes('Intermediate') ? '#3b82f6' : '#3f3f46'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={cleanTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white leading-none">{practiceHistory?.length || 0}</span>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">{t('dashboard.sessions')}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            {[
              { label: t('dashboard.high'), color: "#10b981" },
              { label: t('dashboard.mid'), color: "#3b82f6" },
              { label: t('dashboard.low'), color: "#3f3f46" }
            ].map(d => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.06]">
          <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-[#f5a623]" />
            {t('dashboard.recentPracticeHistory')}
          </h3>
          <Link to="/m/dashboard?tab=History" className="text-[12px] text-[#f5a623] hover:underline">{t('dashboard.viewAllSessions')}</Link>
        </div>

        {practiceHistory && practiceHistory.length > 0 ? (
          <div className="space-y-2">
            {practiceHistory.slice(0, 3).map((session, idx) => (
              <Link key={idx} to={`/m/voice/report/${session.id || session._id}`}>
                <div className="group flex justify-between items-center p-4 rounded-xl border border-white/[0.04] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#09090b] border border-white/[0.06] flex items-center justify-center text-[#f5a623] shrink-0">
                      <Mic size={18} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-medium text-white group-hover:text-[#f5a623] transition-colors">
                        {session.lesson_title || `Session #${practiceHistory.length - idx}`}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {session.accuracy_score || 0}% {t('dashboard.accuracy')}
                        </span>
                        <span className="text-[11px] text-zinc-600">
                          {session.speaking_rate_wpm || 0} {t('dashboard.wpm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-600">
                      {session.created_at ? new Date(session.created_at).toLocaleDateString(
                        i18nInstance.language === 'vi' ? 'vi-VN' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      ) : t('dashboard.recent')}
                    </span>
                    <div className="w-7 h-7 rounded-lg border border-white/[0.06] flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:border-white/[0.12] transition-colors">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-white/[0.06] rounded-xl">
            <Mic size={28} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-[13px] text-zinc-600 mb-4">{t('dashboard.noSessionsYet')}</p>
            <Link to="/m/voice/library"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#f5a623] text-black text-[13px] font-semibold rounded-xl hover:bg-[#e09520] transition-colors">
              {t('dashboard.startFirstPractice')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
