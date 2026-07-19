import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users, Clock, BookOpen, Trophy, Flame, Award, Target, Zap, Play,
  ArrowRight, TrendingUp, Compass, Crown, Sparkles, Medal, Gamepad2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { fetchStats, fetchLeaderboards, fetchActiveArenas } from "../controllers/communityController";
import { trackCommunityPageView } from '@/utils/analytics';
import { useAuthStore } from "../store/useAuthStore";
import PageLoader from "../components/ui/PageLoader";
import PageBanner from '../components/ui/PageBanner';
import Breadcrumb from '../components/ui/Breadcrumb';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

const getTierBadge = (tier) => {
  const base = "flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium border";
  switch (tier) {
    case "ELITE_LEGEND": return <span className={`${base} bg-red-500/[0.08] text-red-400 border-red-500/20`}><Crown size={9} /> ELITE</span>;
    case "DIAMOND":      return <span className={`${base} bg-cyan-500/[0.08] text-cyan-400 border-cyan-500/20`}><Medal size={9} /> DIAMOND</span>;
    case "PLATINUM":     return <span className={`${base} bg-indigo-500/[0.08] text-indigo-400 border-indigo-500/20`}><Award size={9} /> PLATINUM</span>;
    case "GOLD":         return <span className={`${base} bg-[#f5a623]/[0.08] text-[#f5a623] border-[#f5a623]/20`}><Sparkles size={9} /> GOLD</span>;
    case "SILVER":       return <span className={`${base} bg-zinc-500/[0.08] text-zinc-400 border-zinc-500/20`}>SILVER</span>;
    default:             return <span className={`${base} bg-amber-900/[0.08] text-amber-600 border-amber-900/20`}>BRONZE</span>;
  }
};

const getRankMedal = (rank) => {
  if (rank === 1) return <Trophy size={16} className="text-[#f5a623]" />;
  if (rank === 2) return <Medal size={16} className="text-zinc-400" />;
  if (rank === 3) return <Award size={16} className="text-amber-600" />;
  return <span className="font-mono text-[11px] text-zinc-600">#{rank}</span>;
};

const Community = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("precision");
  const [stats, setStats] = useState({});
  const [leaderboards, setLeaderboards] = useState({ diligent: [], precision: [], streak: [] });
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } } },
    exit: (dir) => ({ x: dir < 0 ? 200 : -200, opacity: 0, transition: { opacity: { duration: 0.15 } } })
  };

  const allSlides = useMemo(() => arenas, [arenas]);

  useEffect(() => {
    trackCommunityPageView();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, leaderboardsData, arenasData] = await Promise.all([
          fetchStats(), fetchLeaderboards(), fetchActiveArenas(),
        ]);
        setStats(statsData);
        setLeaderboards(leaderboardsData);
        setArenas(arenasData);
      } catch (err) {
        console.error("Error loading community data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const slide = allSlides[currentSlideIndex];

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-12">
      <Breadcrumb items={[{ label: t('community.breadcrumb') }]} />
      <PageBanner
        icon={<Users size={22} />}
        eyebrow={t('community.arenaTitle')}
        title="MC"
        highlight="Community"
        description={t('community.subtitle')}
        stats={[
          { value: stats.totalUsers || 0, label: t('community.totalStudents') },
          { value: `${(stats.totalPracticeHours || 0).toFixed(1)}h`, label: t('community.practiceHours') },
          { value: stats.activeCompetitionsCount || 0, label: t('community.liveArenas') },
        ]}
      />

      {/* Active Arena */}
      {allSlides.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#f5a623]/[0.08] border border-[#f5a623]/20 rounded-xl flex items-center justify-center text-[#f5a623]">
                <Trophy size={18} />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-white">{t('community.arenaHeadline')}</h2>
                <p className="text-[12px] text-zinc-600">{t('community.arenaDescription')}</p>
              </div>
            </div>

            {allSlides.length > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => { setDirection(-1); setCurrentSlideIndex((prev) => (prev - 1 + allSlides.length) % allSlides.length); }}
                  className="w-8 h-8 rounded-lg bg-[#111113] border border-white/[0.07] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center gap-1.5">
                  {allSlides.map((_, idx) => (
                    <button key={idx}
                      onClick={() => { setDirection(idx > currentSlideIndex ? 1 : -1); setCurrentSlideIndex(idx); }}
                      className={`h-1.5 rounded-full transition-all ${idx === currentSlideIndex ? "w-5 bg-[#f5a623]" : "w-1.5 bg-white/[0.1] hover:bg-white/20"}`}
                    />
                  ))}
                </div>
                <Button
                  onClick={() => { setDirection(1); setCurrentSlideIndex((prev) => (prev + 1) % allSlides.length); }}
                  className="w-8 h-8 rounded-lg bg-[#111113] border border-white/[0.07] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden min-h-[420px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div key={currentSlideIndex} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="w-full">
                {slide && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Arena card */}
                    <div className="lg:col-span-2 bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col justify-between hover:border-[#f5a623]/20 transition-colors">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 rounded-lg bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[11px] text-[#f5a623] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {slide.competition.type} {t('community.challengeSuffix')}
                          </span>
                          <span className="text-[11px] text-zinc-600 flex items-center gap-1.5 bg-[#09090b] px-3 py-1 rounded-lg border border-white/[0.06]">
                            <Clock size={11} className="text-[#f5a623]" />
                            {t('community.deadline')}{new Date(slide.competition.endDate).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN')}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{slide.competition.title}</h3>
                          <p className="text-zinc-500 text-[13px] leading-relaxed">{slide.competition.description}</p>
                        </div>

                        <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-4 relative">
                          <div className="flex items-center gap-1.5 mb-2">
                            <BookOpen size={11} className="text-[#f5a623]" />
                            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('community.challengeScript')}</span>
                          </div>
                          <p className="text-[12px] text-[#f5a623] font-medium mb-2">{slide.challengeScriptTitle}</p>
                          <div className="text-zinc-500 text-[12px] leading-relaxed line-clamp-3">
                            <ReactMarkdown components={{
                              h1: ({ node, ...props }) => <span className="font-medium text-zinc-400 block mb-1" {...props} />,
                              h2: ({ node, ...props }) => <span className="font-medium text-zinc-400 block mb-1" {...props} />,
                              p: ({ node, ...props }) => <span className="inline" {...props} />
                            }}>
                              {slide.challengeScriptContent}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] pt-5 mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {slide.userRecord ? (
                          <div className="flex items-center gap-3 bg-emerald-500/[0.06] px-4 py-3 rounded-xl border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div>
                              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">{t('community.yourPerformance')}</span>
                              <span className="text-[13px] font-medium text-white">
                                {slide.userRecord.bestAccuracy.toFixed(1)}% · {slide.userRecord.bestRhythm.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-600 text-[12px] bg-[#09090b] px-3 py-2.5 rounded-xl border border-white/[0.06]">
                            <Zap size={13} className="text-[#f5a623]" />
                            {t('community.noAttemptText')}
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            if (slide.competition.id.startsWith("virtual-")) {
                              navigate("/m/voice/practice/664a382e2ddc9943efb38701");
                            } else {
                              navigate(`/m/voice/practice/${slide.competition.challengeScriptId}`);
                            }
                          }}
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] text-black text-[13px] font-semibold rounded-xl hover:bg-[#e09520] transition-colors h-auto"
                        >
                          {t('community.competeNow')} <Play size={12} fill="currentColor" />
                        </Button>
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col">
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                        <span className="text-[12px] font-medium text-white flex items-center gap-2">
                          <TrendingUp size={14} className="text-[#f5a623]" /> {t('community.arenaLeaderboard')}
                        </span>
                        <span className="text-[11px] text-zinc-600 bg-[#09090b] px-2 py-0.5 rounded-md border border-white/[0.06]">
                          {slide.leaderboard.length} {t('community.participants')}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px]">
                        {slide.leaderboard.length > 0 ? slide.leaderboard.map((record, index) => (
                          <div key={record.userId}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#09090b] border border-white/[0.04] hover:border-[#f5a623]/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-[#111113] border border-white/[0.06] flex items-center justify-center shrink-0">
                                {getRankMedal(index + 1)}
                              </div>
                              <div className="relative">
                                <Avatar className={`w-8 h-8 rounded-full border ${index === 0 ? "border-[#f5a623]/50" : "border-white/[0.08]"}`}>
                                  <AvatarImage src={record.userAvatar || "/default-avatar.png"} alt={record.userName} className="object-cover" />
                                  <AvatarFallback><img src="/default-avatar.png" alt={record.userName} className="w-full h-full object-cover" /></AvatarFallback>
                                </Avatar>
                                {index === 0 && <div className="absolute -top-1.5 -right-0.5 text-[#f5a623]"><Crown size={9} fill="currentColor" /></div>}
                              </div>
                              <div>
                                <span className="text-[12px] font-medium text-white max-w-[90px] truncate block">{record.userName}</span>
                                <span className="text-[10px] text-zinc-600">{record.attemptCount} {t('community.attempts')}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[13px] font-semibold text-[#f5a623] block">
                                {((record.bestAccuracy + record.bestRhythm) / 2).toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-zinc-600">+{record.pointsEarned.toFixed(0)} XP</span>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-10">
                            <Award size={24} className="text-zinc-800 mx-auto mb-2" />
                            <p className="text-[12px] text-zinc-600">{t('community.noSubmissions')}</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/[0.06] pt-3 mt-4 flex justify-between items-center text-[11px] text-zinc-600">
                        <span>{t('community.rank1XpBonus')}</span>
                        <Trophy size={11} className="text-[#f5a623]" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111113] border border-white/[0.07] rounded-xl flex items-center justify-center text-zinc-600">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white">{t('community.arenaHeadline')}</h2>
              <p className="text-[12px] text-zinc-600">{t('community.arenaDescription')}</p>
            </div>
          </div>
          <Card className="bg-[#111113] border border-white/[0.07] rounded-2xl p-12 flex flex-col items-center text-center gap-4 shadow-none">
            <div className="w-12 h-12 bg-[#09090b] border border-white/[0.07] rounded-xl flex items-center justify-center text-zinc-700">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-zinc-400 mb-1">{t('community.noActiveArenaTitle') || "Đấu trường đang chuẩn bị"}</h3>
              <p className="text-[13px] text-zinc-600 max-w-sm">{t('community.noActiveArenaDesc') || "Không có giải đấu nào đang diễn ra. Tiếp tục luyện tập!"}</p>
            </div>
            <Button onClick={() => navigate("/m/voice/library")}
              className="flex items-center gap-2 px-5 py-2 bg-[#111113] border border-white/[0.07] hover:border-[#f5a623]/30 text-zinc-400 hover:text-white text-[13px] rounded-xl transition-colors h-auto">
              {t('community.goToPractice') || "Luyện Tập Ngay"} <Play size={11} fill="currentColor" />
            </Button>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/[0.08] border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white">{t('community.heroLeaderboard')}</h2>
              <p className="text-[12px] text-zinc-600">{t('community.heroLeaderboardDesc')}</p>
            </div>
          </div>

          <div className="flex bg-[#09090b] p-1 rounded-xl border border-white/[0.06]">
            {[
              { id: "precision", label: t('community.precision'), icon: Target },
              { id: "diligent", label: t('community.diligent'), icon: Clock },
              { id: "streak", label: t('community.streak'), icon: Flame },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#f5a623] text-black"
                    : "text-zinc-500 hover:text-white"
                }`}>
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 gap-0 shadow-none">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Top 3 Podiums */}
            <div className="xl:col-span-1 flex flex-col justify-center items-center py-4 gap-4">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('community.crownOfGlory')}</p>

              <div className="flex items-end justify-center gap-3 mt-4 w-full min-h-[200px]">
                {/* 2nd */}
                {leaderboards[activeTab]?.[1] ? (
                  <div className="flex flex-col items-center flex-1">
                    <div className="flex flex-col items-center">
                      <Avatar className="w-14 h-14 rounded-full border-2 border-zinc-500">
                        <AvatarImage src={leaderboards[activeTab][1].userAvatar || "/default-avatar.png"} alt="2nd" className="object-cover" />
                        <AvatarFallback><img src="/default-avatar.png" alt="2nd" className="w-full h-full object-cover" /></AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-medium text-zinc-300 mt-2 max-w-[70px] truncate text-center">{leaderboards[activeTab][1].userName}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {activeTab === "precision" && `${leaderboards[activeTab][1].cumulativeXP.toFixed(0)} XP`}
                        {activeTab === "diligent" && `${leaderboards[activeTab][1].totalPracticeHours.toFixed(1)}h`}
                        {activeTab === "streak" && `${leaderboards[activeTab][1].currentStreak}d 🔥`}
                      </span>
                    </div>
                    <div className="w-16 h-12 bg-[#09090b] border border-white/[0.06] rounded-t-lg mt-3 flex items-center justify-center">
                      <span className="font-mono text-[13px] font-semibold text-zinc-500">2nd</span>
                    </div>
                  </div>
                ) : <div className="flex-1" />}

                {/* 1st */}
                {leaderboards[activeTab]?.[0] ? (
                  <div className="flex flex-col items-center flex-1 -translate-y-3">
                    <div className="flex flex-col items-center">
                      <Crown size={16} className="text-[#f5a623] mb-1" fill="currentColor" />
                      <Avatar className="w-16 h-16 rounded-full border-2 border-[#f5a623]">
                        <AvatarImage src={leaderboards[activeTab][0].userAvatar || "/default-avatar.png"} alt="1st" className="object-cover" />
                        <AvatarFallback><img src="/default-avatar.png" alt="1st" className="w-full h-full object-cover" /></AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-medium text-white mt-2 max-w-[80px] truncate text-center">{leaderboards[activeTab][0].userName}</span>
                      <span className="text-[10px] text-[#f5a623] font-mono">
                        {activeTab === "precision" && `${leaderboards[activeTab][0].cumulativeXP.toFixed(0)} XP`}
                        {activeTab === "diligent" && `${leaderboards[activeTab][0].totalPracticeHours.toFixed(1)}h`}
                        {activeTab === "streak" && `${leaderboards[activeTab][0].currentStreak}d 🔥`}
                      </span>
                    </div>
                    <div className="w-20 h-16 bg-[#f5a623]/[0.08] border border-[#f5a623]/20 rounded-t-xl mt-3 flex items-center justify-center">
                      <span className="font-mono text-[15px] font-bold text-[#f5a623]">1st</span>
                    </div>
                  </div>
                ) : <div className="flex-1" />}

                {/* 3rd */}
                {leaderboards[activeTab]?.[2] ? (
                  <div className="flex flex-col items-center flex-1">
                    <div className="flex flex-col items-center">
                      <Avatar className="w-12 h-12 rounded-full border-2 border-amber-600">
                        <AvatarImage src={leaderboards[activeTab][2].userAvatar || "/default-avatar.png"} alt="3rd" className="object-cover" />
                        <AvatarFallback><img src="/default-avatar.png" alt="3rd" className="w-full h-full object-cover" /></AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-medium text-zinc-400 mt-2 max-w-[65px] truncate text-center">{leaderboards[activeTab][2].userName}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {activeTab === "precision" && `${leaderboards[activeTab][2].cumulativeXP.toFixed(0)} XP`}
                        {activeTab === "diligent" && `${leaderboards[activeTab][2].totalPracticeHours.toFixed(1)}h`}
                        {activeTab === "streak" && `${leaderboards[activeTab][2].currentStreak}d 🔥`}
                      </span>
                    </div>
                    <div className="w-16 h-9 bg-[#09090b] border border-white/[0.06] rounded-t-lg mt-3 flex items-center justify-center">
                      <span className="font-mono text-[12px] font-semibold text-amber-700">3rd</span>
                    </div>
                  </div>
                ) : <div className="flex-1" />}
              </div>
            </div>

            {/* Full list */}
            <div className="xl:col-span-2 space-y-3">
              <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider pb-3 border-b border-white/[0.06]">
                {t('community.leaderboardList')}
              </p>
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {leaderboards[activeTab]?.length > 0 ? (() => {
                  const maxVal = activeTab === "precision"
                    ? Math.max(...leaderboards[activeTab].map(e => e.cumulativeXP))
                    : activeTab === "diligent"
                    ? Math.max(...leaderboards[activeTab].map(e => e.totalPracticeHours))
                    : Math.max(...leaderboards[activeTab].map(e => e.currentStreak));
                  return leaderboards[activeTab].map((entry, index) => {
                    const val = activeTab === "precision" ? entry.cumulativeXP
                      : activeTab === "diligent" ? entry.totalPracticeHours
                      : entry.currentStreak;
                    const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                    const barColor = activeTab === "precision" ? "#f5a623" : activeTab === "diligent" ? "#3b82f6" : "#f97316";
                    return (
                      <div key={entry.userId}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-white/[0.04] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02] transition-colors">
                        <span className="font-mono text-[12px] text-zinc-600 w-5 shrink-0">#{index + 1}</span>
                        <Avatar className={`w-10 h-10 rounded-xl border shrink-0 ${index === 0 ? 'border-[#f5a623]/50' : 'border-white/[0.08]'}`}>
                          <AvatarImage src={entry.userAvatar || "/default-avatar.png"} alt={entry.userName} className="object-cover" />
                          <AvatarFallback className="rounded-xl"><img src="/default-avatar.png" alt={entry.userName} className="w-full h-full object-cover" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px] font-medium text-white truncate max-w-[100px]">{entry.userName}</span>
                            <span className="text-[12px] font-semibold shrink-0 ml-2" style={{ color: barColor }}>
                              {activeTab === "precision" && `${entry.cumulativeXP.toFixed(0)} XP`}
                              {activeTab === "diligent" && `${entry.totalPracticeHours.toFixed(1)}h`}
                              {activeTab === "streak" && `${entry.currentStreak}d`}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                          </div>
                        </div>
                      </div>
                    );
                  });
                })() : (
                  <div className="text-center py-16">
                    <Compass size={24} className="text-zinc-800 mx-auto mb-2" />
                    <p className="text-[12px] text-zinc-600">{t('community.noLeaderboardData')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Community;
