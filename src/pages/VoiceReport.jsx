import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TypewriterMarkdown from '../components/TypewriterMarkdown';
import {
    ChevronLeft, Zap, TrendingUp, AudioLines, BarChart3,
    Lightbulb, Clock, Sparkles, Info, Calendar, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPracticeById, fetchLessonById } from '../controllers/voiceController';

const clamp = (v) => Math.max(0, Math.min(100, Number(v || 0)));

const MetricBar = ({ label, value, color, tooltip }) => (
    <div>
        <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
                {tooltip && (
                    <div className="relative group/tt cursor-help">
                        <Info size={11} className="text-zinc-700" />
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-44 rounded-lg bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <span className={`text-[13px] font-semibold ${color}`}>{value.toFixed(1)}{label.toLowerCase().includes('pace') ? ' WPM' : '%'}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${label.toLowerCase().includes('pace') ? Math.min(100, (value / 180) * 100) : value}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
            />
        </div>
    </div>
);

const VoiceReport = () => {
    const { t, i18n } = useTranslation();
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [lesson, setLesson] = useState(null);

    const isVi = i18n.language.startsWith('vi');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchPracticeById(sessionId);
                const n = {
                    accuracy_score: data.accuracy_score ?? data.accuracyScore ?? 0,
                    rhythm_score: data.rhythm_score ?? data.rhythmScore ?? 0,
                    speaking_rate_wpm: data.speaking_rate_wpm ?? data.speakingRateWpm ?? 0,
                    feedback_vi: data.feedback_vi ?? data.feedbackVi ?? "",
                    feedback_en: data.feedback_en ?? data.feedbackEn ?? "",
                    report_vi: data.report_vi ?? data.reportVi ?? "",
                    report_en: data.report_en ?? data.reportEn ?? "",
                    tips_vi: data.tips_vi ?? data.expertTipsVi ?? [],
                    tips_en: data.tips_en ?? data.expertTipsEn ?? [],
                    text_spoken: data.text_spoken ?? data.textSpoken ?? "",
                    createdAt: data.createdAt,
                    lessonId: data.lessonId
                };
                setSession(n);
                if (n.lessonId) setLesson(await fetchLessonById(n.lessonId));
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, [sessionId]);

    const accuracy = useMemo(() => clamp(session?.accuracy_score), [session]);
    const energy = useMemo(() => clamp(session?.rhythm_score), [session]);
    const pace = useMemo(() => Number(session?.speaking_rate_wpm || 0), [session]);
    const pacePercent = useMemo(() => clamp((pace / 180) * 100), [pace]);
    const scriptWords = useMemo(() => lesson?.content?.trim().split(/\s+/).length || 0, [lesson]);
    const spokenWords = useMemo(() => session?.text_spoken?.trim().split(/\s+/).length || 0, [session]);
    const coverage = useMemo(() => clamp(scriptWords ? (spokenWords / scriptWords) * 100 : 0), [scriptWords, spokenWords]);
    const overall = useMemo(() => clamp(accuracy * 0.45 + energy * 0.35 + pacePercent * 0.2), [accuracy, energy, pacePercent]);

    const levelLabel = overall >= 85 ? "excellent" : overall >= 70 ? "good" : overall >= 55 ? "developing" : "needsWork";
    const levelColor = overall >= 85 ? "text-emerald-400" : overall >= 70 ? "text-cyan-400" : overall >= 55 ? "text-amber-400" : "text-orange-400";

    const feedbackItems = useMemo(() => {
        const fb = isVi ? session?.feedback_vi : session?.feedback_en;
        return fb ? fb.split("|").map(s => s.trim()).filter(Boolean) : [];
    }, [session, isVi]);

    const expertTips = useMemo(() => {
        const tips = isVi ? session?.tips_vi : session?.tips_en;
        return Array.isArray(tips) ? tips : [];
    }, [session, isVi]);

    const report = useMemo(() => isVi ? session?.report_vi : session?.report_en, [session, isVi]);

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 animate-pulse text-[#f5a623]" />
                <p className="text-[13px] text-zinc-500 uppercase tracking-widest">{t('voiceReport.loadingReport')}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-16">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/[0.07]">
                <button onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-[#111113] border border-white/[0.07] text-zinc-400 hover:text-white hover:bg-[#1a1a1e] transition-colors shrink-0">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">{lesson?.title || t('voiceReport.practiceReportDetail')}</h1>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-zinc-600">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#f5a623]" />
                            {(() => {
                                const d = new Date(session?.createdAt);
                                return isNaN(d.getTime()) ? "Recent" : d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                            })()}
                        </span>
                        <span>·</span>
                        <span>{t('voiceReport.practiceReportDetail')}</span>
                    </div>
                </div>
                <div className="text-[11px] text-zinc-600 border border-white/[0.07] px-3 py-1.5 rounded-lg bg-[#111113] shrink-0">
                    {isVi ? 'Tiếng Việt' : 'English'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Overall score */}
                    <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">{t('voiceReport.overallScore')}</p>
                                    <div className="relative group/s cursor-help">
                                        <Info size={11} className="text-zinc-700" />
                                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-44 rounded-lg bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/s:opacity-100 transition-opacity z-50">
                                            {t('voiceReport.overallScoreDesc')}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-5xl font-bold text-white">{overall.toFixed(1)}%</p>
                            </div>
                            <div className="bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2 text-center shrink-0">
                                <TrendingUp size={16} className="text-[#f5a623] mx-auto mb-1" />
                                <p className={`text-[10px] font-semibold uppercase tracking-wider ${levelColor}`}>{t(`voiceReport.${levelLabel}`)}</p>
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06]">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${overall}%` }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-full bg-[#f5a623]" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <div className="bg-[#09090b] border border-white/[0.07] rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <BarChart3 size={13} className="text-cyan-400" />
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('voiceReport.coverage')}</p>
                                </div>
                                <p className="text-xl font-bold text-white">{coverage.toFixed(0)}%</p>
                            </div>
                            <div className="bg-[#09090b] border border-white/[0.07] rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <Clock size={13} className="text-purple-400" />
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('voiceReport.paceSummary')}</p>
                                </div>
                                <p className="text-xl font-bold text-white">{pace.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vocal metrics */}
                    <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
                        <h3 className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider flex items-center gap-1.5 mb-5">
                            <AudioLines size={13} className="text-[#f5a623]" /> {t('voiceReport.vocalDynamics')}
                        </h3>
                        <div className="space-y-5">
                            <MetricBar label={t('voiceReport.clarity')} value={accuracy} color="text-emerald-400" tooltip={t('voiceReport.clarityDesc')} />
                            <MetricBar label={t('voiceReport.energy')} value={energy} color="text-blue-400" tooltip={t('voiceReport.energyDesc')} />
                            <MetricBar label={t('voiceReport.pace')} value={pace} color="text-purple-400" tooltip={t('voiceReport.paceDesc')} />
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-8 space-y-5">
                    <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
                        <h2 className="text-[16px] font-semibold text-white flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.06]">
                            <Sparkles size={16} className="text-[#f5a623]" /> {t('voiceReport.aiAnalysis')}
                        </h2>

                        <div className="space-y-8">
                            {/* Feedback */}
                            {feedbackItems.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                                        <BarChart3 size={13} className="text-[#f5a623]" /> {t('voiceReport.feedbackBreakdown')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {feedbackItems.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-[#09090b] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-[#f5a623]/[0.08] flex items-center justify-center text-[#f5a623] shrink-0 mt-0.5">
                                                    <CheckCircle2 size={11} />
                                                </div>
                                                <p className="text-[13px] text-zinc-400 leading-relaxed">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            {expertTips.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                                        <Lightbulb size={13} className="text-[#f5a623]" /> {t('voiceReport.coachingTips')}
                                    </h3>
                                    <div className="space-y-2.5">
                                        {expertTips.map((item, i) => (
                                            <div key={i} className="flex gap-3 bg-[#f5a623]/[0.04] border border-[#f5a623]/[0.12] rounded-xl p-4 hover:border-[#f5a623]/20 transition-colors">
                                                <div className="w-0.5 bg-[#f5a623]/40 rounded-full shrink-0 self-stretch" />
                                                <div>
                                                    <span className="text-[10px] font-medium text-[#f5a623]/60 uppercase tracking-wider block mb-0.5">{item.label}</span>
                                                    <p className="text-[13px] text-zinc-300 leading-relaxed">{item.tip}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Markdown report */}
                            <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-6">
                                <TypewriterMarkdown content={report || ""} enabled={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceReport;
