import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { academyService } from '../services/academyService';
import {
    BookOpen, Flag, Award, Play, Zap, TrendingUp, Star,
    CheckCircle2, User, Lock, ArrowRight, Sparkles, Trophy, Target
} from 'lucide-react';

const Learning = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [roadmapSteps, setRoadmapSteps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        academyService.getRoadmap()
            .then(res => {
                const courses = Array.isArray(res.data?.data) ? res.data.data : [];
                setRoadmapSteps(courses.map(c => ({
                    id: c.id,
                    title: c.title,
                    level: c.difficulty,
                    status: c.status || 'Locked',
                    progress: c.myProgress?.completionRate || 0,
                    description: c.shortDescription,
                })));
            })
            .catch(err => console.error('Failed to fetch roadmap:', err))
            .finally(() => setLoading(false));
    }, []);

    const resources = [
        { title: 'The Perfect Wedding Script', type: 'PDF Book', time: '15 min read', icon: <BookOpen size={16} /> },
        { title: 'Voice Modulation Masterclass', type: 'Video Course', time: '45 min watch', icon: <Play size={16} /> },
        { title: 'Corporate Etiquette Protocol', type: 'Interactive Unit', time: '30 min', icon: <Zap size={16} /> },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 border-2 border-[#f5a623]/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-16 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/[0.07]">
                <div>
                    <p className="text-[11px] font-medium text-[#f5a623] uppercase tracking-wider mb-1">{t('learning.officialAcademy')}</p>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        {t('learning.title').split(' ')[0]} <span className="text-[#f5a623]">{t('learning.title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-zinc-500 text-[13px] mt-1 max-w-lg">{t('learning.description')}</p>
                </div>
                <div className="bg-[#111113] border border-white/[0.07] rounded-xl px-5 py-4 flex items-center gap-4 shrink-0">
                    <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center">
                        <Award size={20} className="text-black" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('learning.currentTier')}</p>
                        <p className="text-[15px] font-bold text-white">Associate</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Roadmap */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
                            <Target size={16} className="text-[#f5a623]" />
                            {t('learning.mastersPath')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#09090b] bg-[#111113] border-[#111113] flex items-center justify-center text-zinc-600">
                                        <User size={11} />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[11px] text-zinc-600">+{roadmapSteps.length}k {t('learning.activeUsers')}</span>
                        </div>
                    </div>

                    <div className="relative space-y-4 pl-5 border-l border-dashed border-white/[0.08] ml-3">
                        {roadmapSteps.map((step, i) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.3 }}
                                className="relative"
                            >
                                <div className={`absolute -left-[27px] top-6 w-4 h-4 rounded-full border-2 border-[#09090b] z-20 transition-colors ${
                                    step.status === 'Completed' ? 'bg-emerald-500' :
                                    step.status === 'In Progress' ? 'bg-[#f5a623]' :
                                    'bg-[#1a1a1e]'
                                }`} />

                                <div className={`bg-[#111113] border rounded-2xl p-6 transition-colors ${
                                    step.status === 'Locked' ? 'border-white/[0.04] opacity-60' :
                                    'border-white/[0.07] hover:border-[#f5a623]/20'
                                }`}>
                                    <div className="flex flex-col md:flex-row gap-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                                            step.status === 'Completed' ? 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20' :
                                            step.status === 'In Progress' ? 'bg-[#f5a623]/[0.08] text-[#f5a623] border border-[#f5a623]/20' :
                                            'bg-[#09090b] text-zinc-600 border border-white/[0.06]'
                                        }`}>
                                            {i === 0 ? <Flag size={24} /> : i === 1 ? <Sparkles size={24} /> : <Trophy size={24} />}
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-[16px] font-semibold text-white">{step.title}</h3>
                                                        {step.status === 'Completed' && <CheckCircle2 size={15} className="text-emerald-400" />}
                                                    </div>
                                                    <span className="text-[11px] text-zinc-600 uppercase tracking-wider">{step.level} Stage</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-lg text-[11px] font-medium border shrink-0 ${
                                                    step.status === 'Completed' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.06]' :
                                                    step.status === 'In Progress' ? 'text-[#f5a623] border-[#f5a623]/20 bg-[#f5a623]/[0.06]' :
                                                    'text-zinc-600 border-white/[0.06] bg-[#09090b]'
                                                }`}>
                                                    {step.status === 'Completed' ? t('common.completed') :
                                                     step.status === 'In Progress' ? t('common.inProgress') :
                                                     t('common.locked')}
                                                </span>
                                            </div>

                                            <p className="text-zinc-500 text-[13px] leading-relaxed">
                                                {step.text || step.description}
                                            </p>

                                            {step.status === 'In Progress' && (
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[11px] text-zinc-600 uppercase tracking-wider">
                                                        <span>{t('learning.progress')}</span>
                                                        <span>{step.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${step.progress || 0}%` }}
                                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                                            className="h-full bg-[#f5a623] rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {step.status !== 'Locked' ? (
                                                <button
                                                    onClick={() => navigate(isAuthenticated ? `/m/learning/milestone/${step.id}` : '/login')}
                                                    className="flex items-center gap-2 px-5 py-2 bg-[#f5a623] text-black text-[13px] font-semibold rounded-xl hover:bg-[#e09520] transition-colors"
                                                >
                                                    {step.status === 'Completed' ? t('learning.reviewMilestone') : t('learning.resumeJourney')}
                                                    <ArrowRight size={14} />
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[12px] text-zinc-600">
                                                    <Lock size={13} /> {t('learning.finishPrevious')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Resources */}
                    <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
                        <h3 className="text-[14px] font-semibold text-white flex items-center gap-2 mb-5">
                            <BookOpen size={15} className="text-[#f5a623]" />
                            {i18n.language === 'vi' ? (
                                <>Tài liệu <span className="text-[#f5a623]">Đề xuất</span></>
                            ) : (
                                <>{t('learning.resources').substring(0, t('learning.resources').lastIndexOf(' '))} <span className="text-[#f5a623]">{t('learning.resources').substring(t('learning.resources').lastIndexOf(' ') + 1)}</span></>
                            )}
                        </h3>

                        <div className="space-y-2">
                            {resources.map((res, i) => (
                                <div key={i} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[#09090b] border border-transparent hover:border-white/[0.06] transition-colors cursor-pointer">
                                    <div className="w-9 h-9 rounded-xl bg-[#09090b] border border-white/[0.06] flex items-center justify-center text-[#f5a623] group-hover:bg-[#f5a623] group-hover:text-black transition-colors shrink-0">
                                        {res.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[13px] font-medium text-white group-hover:text-[#f5a623] transition-colors truncate">{res.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-zinc-600">{res.type}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="text-[11px] text-[#f5a623]/60">{res.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2.5 rounded-xl border border-white/[0.07] hover:border-[#f5a623]/30 text-zinc-500 hover:text-white text-[12px] font-medium flex items-center justify-center gap-2 transition-colors">
                            {t('learning.browseLibrary')} <ArrowRight size={13} />
                        </button>
                    </div>

                    {/* Mentorship */}
                    <div className="bg-[#f5a623] rounded-2xl p-6 relative overflow-hidden">
                        <div className="w-12 h-12 bg-black/[0.12] rounded-xl flex items-center justify-center mb-4">
                            <Star size={24} fill="black" className="text-black" />
                        </div>
                        <h4 className="text-[17px] font-bold text-black mb-2 tracking-tight">
                            {t('learning.mentorship').split(' ')[0]} <span className="text-black/70">{t('learning.mentorship').split(' ').slice(1).join(' ')}</span>
                        </h4>
                        <p className="text-black/70 text-[13px] leading-relaxed mb-5">{t('learning.mentorshipDesc')}</p>
                        <button
                            onClick={() => navigate(isAuthenticated ? '#' : '/login')}
                            className="w-full py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-black/80 transition-colors"
                        >
                            {t('learning.applyCoaching')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learning;
