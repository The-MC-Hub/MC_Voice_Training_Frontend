import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from '../../contexts/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  BarChart, Bar, Cell,
  PieChart, Pie
} from "recharts";
import { Zap, TrendingUp, Mic, Award, BarChart3, PieChart as PieIcon, ChevronRight, Target, Flame, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SessionCard from "./SessionCard";
import SpotlightCard from '../ui/SpotlightCard';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

const OverviewTab = ({
  dashboard, emptyMonthlyData, practiceHistory,
  timeFrame, setTimeFrame, skillsData, categoryStats, accuracyDistribution
}) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { theme } = useTheme();
  const cleanTooltipStyle = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#18181b',
    border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '12px',
    fontSize: '12px',
    color: theme === 'light' ? '#111113' : '#fafafa',
    boxShadow: theme === 'light' ? '0 8px 32px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.4)',
  };
  const n = practiceHistory?.length || 0;
  const avgAcc = n ? (practiceHistory.reduce((a, p) => a + (p.accuracy_score || 0), 0) / n).toFixed(1) : 0;
  const avgRhy = n ? (practiceHistory.reduce((a, p) => a + (p.rhythm_score || 0), 0) / n).toFixed(1) : 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Row 1: Chart + Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Area Chart */}
        <motion.div {...fadeUp} className="lg:col-span-8">
          <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                <TrendingUp size={14} className="text-[#f5a623]" />
                {t('dashboard.trainingProgress')}
              </h3>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                {timeFrame === "Daily" ? t('dashboard.last7Days') : timeFrame === "Weekly" ? t('dashboard.last4Weeks') : t('dashboard.last6Months')}
              </p>
            </div>
            <div className="flex bg-[#09090b] p-1 rounded-xl border border-white/[0.06]">
              {["Daily", "Weekly", "Monthly"].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFrame(tf)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    timeFrame === tf ? "bg-[#f5a623] text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {tf === "Daily" ? t('dashboard.day') : tf === "Weekly" ? t('dashboard.week') : t('dashboard.month')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: "100%", height: 260, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height={260} minHeight={260}>
              <AreaChart data={emptyMonthlyData.length ? emptyMonthlyData : [{ name: '', accuracy: 0, rhythm: 0 }]} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5a623" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rhyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={cleanTooltipStyle} itemStyle={{ fontSize: "12px" }} />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "16px", color: "#71717a" }} />
                <Area name={t('dashboard.accuracyPercent')} type="monotone" dataKey="accuracy" stroke="#f5a623" strokeWidth={2} fillOpacity={1} fill="url(#accGrad)" dot={false} activeDot={{ r: 4, fill: "#f5a623" }} />
                <Area name={t('dashboard.rhythmPercent')} type="monotone" dataKey="rhythm" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#rhyGrad)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </SpotlightCard>
        </motion.div>

        {/* Roadmap card — dark style, no orange bg */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-4"
        >
          <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.3), transparent)' }} />

          <div className="w-10 h-10 rounded-2xl bg-[#f5a623]/[0.1] border border-[#f5a623]/20 flex items-center justify-center mb-4">
            <Zap size={18} className="text-[#f5a623]" />
          </div>
          <h3 className="text-[14px] font-semibold text-white mb-1 tracking-tight">{t('dashboard.voiceMasteryRoadmap')}</h3>
          <p className="text-[12px] text-zinc-500 mb-6 leading-relaxed">
            {n > 10 ? t('dashboard.masterDesc') : t('dashboard.newAmbassadorDesc')}
          </p>

          <div className="space-y-4 flex-1">
            {[
              { label: t('dashboard.articulation'), val: 85, color: '#f5a623' },
              { label: t('dashboard.rhythm'), val: parseFloat(avgRhy) || 72, color: '#6366f1' },
              { label: 'Độ chính xác', val: parseFloat(avgAcc) || 0, color: '#10b981' },
            ].map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-zinc-500 font-medium uppercase tracking-wider">{p.label}</span>
                  <span className="text-zinc-400 font-semibold">{Math.round(p.val)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.val}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>

          <Link to="/m/learning"
            className="mt-6 w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-[12px] font-semibold hover:bg-white/[0.08] hover:border-white/[0.14] transition-all flex items-center justify-center gap-2">
            {t('dashboard.viewDetailedPath')} <ChevronRight size={13} />
          </Link>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* Row 2: Quick metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: 'Streak hiện tại', value: `${Math.min(n, 7)} ngày`, color: 'text-orange-400', bg: 'bg-orange-500/[0.08] border-orange-500/20' },
          { icon: Target, label: 'Mục tiêu tuần', value: `${Math.min(n, 5)}/5 phiên`, color: 'text-blue-400', bg: 'bg-blue-500/[0.08] border-blue-500/20' },
          { icon: Clock, label: 'Thời gian luyện tập', value: `${(n * 12).toFixed(0)} phút`, color: 'text-violet-400', bg: 'bg-violet-500/[0.08] border-violet-500/20' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="p-4 bg-[#111113] border border-white/[0.07] rounded-2xl flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${bg}`}>
                <Icon size={15} className={color} />
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
                <p className="text-[14px] font-semibold text-white">{value}</p>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>

      {/* Row 3: Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Radar */}
        <motion.div {...fadeUp}>
          <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-4">
            <Award size={13} className="text-[#f5a623]" />
            <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.skillsMatrix')}</h4>
          </div>
          <div style={{ width: "100%", height: 210, minHeight: 210 }}>
            <ResponsiveContainer width="100%" height={210} minHeight={210}>
              <RadarChart cx="50%" cy="50%" outerRadius="78%" data={skillsData.length ? skillsData : [{ subject: '', A: 0, fullMark: 100 }]}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10 }} />
                <Radar name={t('dashboard.skills')} dataKey="A" stroke="#f5a623" strokeWidth={2} fill="#f5a623" fillOpacity={0.08} />
                <Tooltip contentStyle={cleanTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-zinc-600 text-center mt-2 leading-relaxed bg-[#09090b] border border-white/[0.05] py-2 px-3 rounded-xl w-full">
            {t('dashboard.speedExcellent')}
          </p>
          </SpotlightCard>
        </motion.div>

        {/* Bar */}
        <motion.div {...fadeUp}>
          <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={13} className="text-indigo-400" />
            <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.trainingFocus')}</h4>
          </div>
          <div style={{ width: "100%", height: 195, minHeight: 195 }}>
            <ResponsiveContainer width="100%" height={195} minHeight={195}>
              <BarChart data={categoryStats.length ? categoryStats : [{ name: '—', count: 0 }]} layout="vertical" margin={{ left: -10, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} width={80} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={cleanTooltipStyle} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={10}>
                  {categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#8b5cf6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          </SpotlightCard>
        </motion.div>

        {/* Donut */}
        <motion.div {...fadeUp}>
          <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-4">
            <PieIcon size={13} className="text-emerald-400" />
            <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('dashboard.proficiency')}</h4>
          </div>
          <div style={{ width: "100%", height: 180, minHeight: 180 }} className="relative">
            <ResponsiveContainer width="100%" height={180} minHeight={180}>
              <PieChart>
                <Pie data={accuracyDistribution.length ? accuracyDistribution : [{ value: 1, color: '#27272a' }]}
                  innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {(accuracyDistribution.length ? accuracyDistribution : [{ color: '#27272a' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      accuracyDistribution.length
                        ? (entry.name?.includes('Advanced') ? '#10b981' : entry.name?.includes('Intermediate') ? '#3b82f6' : '#3f3f46')
                        : '#27272a'
                    } />
                  ))}
                </Pie>
                {accuracyDistribution.length > 0 && <Tooltip contentStyle={cleanTooltipStyle} />}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white leading-none">{n}</span>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">{t('dashboard.sessions')}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
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
          </SpotlightCard>
        </motion.div>
      </div>

      {/* Row 4: Recent sessions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <SpotlightCard spotlightColor="rgba(245,166,35,0.10)" spotlightSize={300} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/[0.05]">
          <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
            <TrendingUp size={14} className="text-[#f5a623]" />
            {t('dashboard.recentPracticeHistory')}
          </h3>
          <Link to="/m/dashboard?tab=History" className="text-[12px] text-zinc-500 hover:text-[#f5a623] transition-colors">
            {t('dashboard.viewAllSessions')} →
          </Link>
        </div>

        {practiceHistory && n > 0 ? (
          <div className="space-y-1">
            {practiceHistory.slice(0, 4).map((session, idx) => (
              <SessionCard
                key={session.id || session._id || idx}
                session={session}
                index={idx}
                total={n}
                locale={i18nInstance.language === 'vi' ? 'vi-VN' : 'en-US'}
              />
            ))}
          </div>
        ) : (
          <div className="py-14 text-center border border-dashed border-white/[0.06] rounded-xl">
            <Mic size={28} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-[13px] text-zinc-600 mb-4">{t('dashboard.noSessionsYet')}</p>
            <Link to="/m/voice/library"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#f5a623] text-black text-[13px] font-semibold rounded-xl hover:bg-[#e09520] transition-colors">
              {t('dashboard.startFirstPractice')}
            </Link>
          </div>
        )}
        </SpotlightCard>
      </motion.div>

    </div>
  );
};

export default OverviewTab;
