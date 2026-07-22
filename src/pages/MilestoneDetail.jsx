import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Play, Lock, Clock, Star,
  BookOpen, Zap, Trophy, ShieldCheck, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { academyService } from '../services/academyService';
import PageLoader from '../components/ui/PageLoader';
import { Card } from '@/components/ui/card';

const MilestoneDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    academyService.getCourseDetail(id)
      .then(res => {
        const c = res.data?.data;
        if (!c) return;
        setCourse(c);
        const completedLessonIds = c.myProgress?.completedLessonIds || [];
        const completedReadingIds = c.myProgress?.completedReadingIds || [];
        setItems([
          ...(c.lessons || []).map(l => ({
            id: l.id, title: l.title, type: 'VOICE_PRACTICE',
            duration: l.estimatedMinutes ? `${l.estimatedMinutes} min` : '—',
            status: completedLessonIds.includes(l.id) ? 'completed' : 'available',
          })),
          ...(c.readings || []).map(r => ({
            id: r.id, title: r.title, type: 'READING_GUIDE',
            duration: '—', status: completedReadingIds.includes(r.id) ? 'completed' : 'available',
          })),
        ]);
      })
      .catch(err => console.error('Failed to fetch course detail:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleItemClick = (item) => {
    if (item.status === 'locked') return;
    if (item.type === 'VOICE_PRACTICE') navigate(`/m/voice/practice/${item.id}?courseId=${id}`);
    else if (item.type === 'READING_GUIDE') navigate(`/m/learning/guide/${item.id}?courseId=${id}`);
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <PageLoader />;
  if (!course) return <div className="text-white text-center py-32 text-[14px]">{t('milestone.milestoneNotFound')}</div>;

  const progress = course.myProgress?.completionRate || 0;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-8 mb-8 border-b border-white/[0.07]">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[13px] mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> {t('milestone.backToRoadmap')}
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{course.title}</h1>
              <span className="px-3 py-1 rounded-md bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[#f5a623] text-[12px] font-medium">{course.difficulty}</span>
            </div>
            <p className="text-zinc-500 text-[14px] leading-relaxed max-w-xl">"{course.shortDescription}"</p>
          </div>

          <Card className="w-full lg:w-80 bg-[#111113] border border-white/[0.07] rounded-md p-5 shrink-0 gap-0 shadow-none">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('milestone.overallProgress')}</span>
              <span className="text-2xl font-bold text-[#f5a623]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-[#f5a623] rounded-full" />
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck size={13} /> {t('milestone.verified')}
            </div>
          </Card>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Curriculum */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="text-[#f5a623]" />
            <h2 className="text-[16px] font-semibold text-white">{t('milestone.curriculum')}</h2>
            <span className="text-[11px] text-zinc-500 bg-[#09090b] border border-white/[0.06] px-2.5 py-0.5 rounded-md">
              {items.length} {t('common.units')}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
              {paginatedItems.map((item, index) => {
                const isLocked = item.status === 'locked';
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                    onClick={() => handleItemClick(item)}
                    className={`flex items-center gap-4 p-4 rounded-md border transition-colors group ${
                      isLocked
                        ? 'border-white/[0.04] opacity-50 cursor-not-allowed'
                        : 'border-white/[0.06] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02] cursor-pointer'
                    }`}>
                    <div className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      item.status === 'completed' ? 'bg-emerald-500 text-black' :
                      item.status === 'in-progress' ? 'bg-[#f5a623] text-black' :
                      'bg-[#09090b] border border-white/[0.07] text-zinc-500 group-hover:text-[#f5a623]'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle2 size={20} /> : isLocked ? <Lock size={18} /> : <Play size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-medium text-white group-hover:text-[#f5a623] transition-colors truncate">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <Clock size={10} className="text-[#f5a623]" /> {item.duration}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <Zap size={10} className="text-[#f5a623]" /> {item.type.replace('_', ' ')}
                        </span>
                        {item.status === 'in-progress' && (
                          <span className="text-[10px] text-[#f5a623] uppercase tracking-wider">{t('milestone.resumeNow')}</span>
                        )}
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="w-8 h-8 rounded-md bg-[#09090b] border border-white/[0.06] flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-white/[0.14] transition-colors shrink-0">
                        <ChevronRight size={15} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-white/[0.07]">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-md text-[12px] font-medium border transition-colors ${
                      currentPage === idx + 1
                        ? 'bg-[#f5a623] border-[#f5a623] text-black'
                        : 'border-white/[0.07] text-zinc-500 hover:border-white/[0.14] hover:text-white'
                    }`}>{idx + 1}</button>
                ))}
                <span className="text-[11px] text-zinc-500 ml-2">
                  {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, items.length)} / {items.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-white/[0.07] text-zinc-500 hover:text-white hover:border-white/[0.14] text-[12px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={14} /> {t('common.prev')}
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-white/[0.07] text-zinc-500 hover:text-white hover:border-white/[0.14] text-[12px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  {t('common.next')} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar rewards */}
        <div className="lg:col-span-3">
          <Card className="bg-[#111113] border border-white/[0.07] rounded-md p-6 sticky top-20 gap-0 shadow-none">
            <div className="w-10 h-10 bg-[#f5a623] rounded-md flex items-center justify-center mb-4">
              <Trophy size={20} className="text-black" />
            </div>
            <h3 className="text-[15px] font-semibold text-white mb-1">{t('milestone.rewards')}</h3>
            <p className="text-zinc-500 text-[12px] mb-5">{t('milestone.elitePerks')}</p>

            <ul className="space-y-3 mb-6">
              {[
                { icon: Star, text: t('milestone.cert'), color: "text-[#f5a623]" },
                { icon: ShieldCheck, text: t('milestone.badge'), color: "text-emerald-400" },
                { icon: Play, text: t('milestone.highTier'), color: "text-blue-400" },
              ].map((reward, i) => (
                <li key={i} className="flex items-center gap-3 text-[13px] text-zinc-400">
                  <div className="w-7 h-7 rounded-md bg-[#09090b] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <reward.icon size={14} className={reward.color} />
                  </div>
                  {reward.text}
                </li>
              ))}
            </ul>

            <button className="w-full py-2.5 bg-[#f5a623] text-black rounded-md text-[13px] font-semibold hover:bg-[#e09520] transition-colors">
              {t('milestone.claim')}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetail;
