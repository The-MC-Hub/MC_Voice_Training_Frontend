import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import TypewriterMarkdown from '../components/TypewriterMarkdown';
import {
    ChevronLeft, Zap, TrendingUp, AudioLines, BarChart3,
    Lightbulb, Clock, Sparkles, Info, Calendar, CheckCircle2,
    Mic, BookOpen, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPracticeById, fetchLessonById } from '../controllers/voiceController';

const clamp = (v) => Math.max(0, Math.min(100, Number(v || 0)));

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
});

const scoreColor = (v) => {
    if (v >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-400', ring: 'border-emerald-500/20 bg-emerald-500/[0.08]' };
    if (v >= 55) return { text: 'text-amber-400',   bg: 'bg-amber-400',   ring: 'border-amber-500/20 bg-amber-500/[0.08]' };
    return             { text: 'text-red-400',       bg: 'bg-red-400',     ring: 'border-red-500/20 bg-red-500/[0.08]' };
};

const MetricBar = ({ label, value, maxValue = 100, color, tooltip }) => {
    const pct = clamp((value / maxValue) * 100);
    const sc = scoreColor(pct);
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
                    {tooltip && (
                        <div className="relative group/tt cursor-help">
                            <Info size={10} className="text-zinc-700" />
                            <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                {tooltip}
                            </div>
                        </div>
                    )}
                </div>
                <span className={`text-[13px] font-bold ${sc.text}`}>
                    {maxValue === 180 ? `${value.toFixed(0)} WPM` : `${value.toFixed(1)}%`}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${sc.bg}`}
                />
            </div>
        </div>
    );
};

const CriteriaBar = ({ label, value, tooltip }) => {
    const sc = scoreColor(value);
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-24 shrink-0">
                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{label}</span>
                {tooltip && (
                    <div className="relative group/tt cursor-help">
                        <Info size={9} className="text-zinc-700" />
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-44 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clamp(value)}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${sc.bg}`}
                />
            </div>
            <span className={`text-[11px] font-semibold w-10 text-right ${sc.text}`}>{Math.round(value)}</span>
        </div>
    );
};

const CRITERIA_LABEL = {
    PRONUNCIATION: 'Phát âm',
    RHYTHM:        'Nhịp điệu',
    PACING:        'Tốc độ',
    EMOTION:       'Cảm xúc',
    ACCURACY:      'Chính xác',
};

const CRITERIA_TOOLTIP = {
    PRONUNCIATION: 'Độ chính xác phát âm từng từ, âm tiết.',
    RHYTHM:        'Nhịp điệu, ngữ điệu lên xuống đúng ngữ cảnh.',
    PACING:        'Tốc độ nói có phù hợp mục tiêu WPM không.',
    EMOTION:       'Mức độ cảm xúc, biểu cảm trong giọng nói.',
    ACCURACY:      'Độ khớp giữa văn bản đọc và kịch bản gốc.',
};

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
                    accuracy_score:   data.accuracy_score ?? data.accuracyScore ?? 0,
                    rhythm_score:     data.rhythm_score ?? data.rhythmScore ?? 0,
                    speaking_rate_wpm: data.speaking_rate_wpm ?? data.speakingRateWpm ?? 0,
                    overall_score:    data.overall_score ?? data.overallScore ?? 0,
                    criteria_scores:  data.criteria_scores ?? data.criteriaScores ?? {},
                    feedback_vi:      data.feedback_vi ?? data.feedbackVi ?? "",
                    feedback_en:      data.feedback_en ?? data.feedbackEn ?? "",
                    report_vi:        data.report_vi ?? data.reportVi ?? "",
                    report_en:        data.report_en ?? data.reportEn ?? "",
                    tips_vi:          data.tips_vi ?? data.expertTipsVi ?? [],
                    tips_en:          data.tips_en ?? data.expertTipsEn ?? [],
                    text_spoken:      data.text_spoken ?? data.textSpoken ?? "",
                    createdAt:        data.createdAt,
                    lessonId:         data.lessonId,
                    cer_rate:          data.cer_rate          ?? 0,
                    wer_rate:          data.wer_rate          ?? 0,
                    voice_quality:     data.voice_quality     ?? null,
                    spectral_features: data.spectral_features ?? null,
                    pitch_contour:     data.pitch_contour     ?? null,
                    filler_words:      data.filler_words      ?? null,
                    emotion_breakdown: data.emotion_breakdown ?? null,
                };
                setSession(n);
                if (n.lessonId) setLesson(await fetchLessonById(n.lessonId));
            } catch {}
            finally { setLoading(false); }
        };
        load();
    }, [sessionId]);

    const accuracy  = useMemo(() => clamp(session?.accuracy_score), [session]);
    const energy    = useMemo(() => clamp(session?.rhythm_score), [session]);
    const pace      = useMemo(() => Number(session?.speaking_rate_wpm || 0), [session]);
    const pacePercent = useMemo(() => clamp((pace / 180) * 100), [pace]);
    const scriptWords = useMemo(() => lesson?.content?.trim().split(/\s+/).length || 0, [lesson]);
    const spokenWords = useMemo(() => session?.text_spoken?.trim().split(/\s+/).length || 0, [session]);
    const coverage  = useMemo(() => clamp(scriptWords ? (spokenWords / scriptWords) * 100 : 0), [scriptWords, spokenWords]);

    const overall = useMemo(() => {
        const s = session?.overall_score;
        return s && s > 0 ? clamp(s) : clamp(accuracy * 0.45 + energy * 0.35 + pacePercent * 0.2);
    }, [session, accuracy, energy, pacePercent]);

    const sc = scoreColor(overall);
    const levelLabel  = overall >= 85 ? 'excellent' : overall >= 70 ? 'good' : overall >= 55 ? 'developing' : 'needsWork';
    const levelTextVi = overall >= 85 ? 'Xuất sắc' : overall >= 70 ? 'Tốt' : overall >= 55 ? 'Đang phát triển' : 'Cần cải thiện';

    const feedbackItems = useMemo(() => {
        const fb = isVi ? session?.feedback_vi : session?.feedback_en;
        return fb ? fb.split('|').map(s => s.trim()).filter(Boolean) : [];
    }, [session, isVi]);

    const expertTips = useMemo(() => {
        const tips = isVi ? session?.tips_vi : session?.tips_en;
        return Array.isArray(tips) ? tips : [];
    }, [session, isVi]);

    const report = useMemo(() => isVi ? session?.report_vi : session?.report_en, [session, isVi]);

    const criteriaEntries = useMemo(() => {
        const c = session?.criteria_scores;
        if (!c || typeof c !== 'object') return [];
        return Object.entries(c).map(([k, v]) => ({ key: k, label: CRITERIA_LABEL[k] || k, value: Number(v), tooltip: CRITERIA_TOOLTIP[k] }));
    }, [session]);

    const dateStr = useMemo(() => {
        const d = new Date(session?.createdAt);
        return isNaN(d.getTime()) ? 'Gần đây' : d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }, [session, isVi]);

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <Sparkles className="mx-auto mb-3 h-7 w-7 animate-pulse text-[#f5a623]" />
                <p className="text-[12px] text-zinc-600 uppercase tracking-widest">{t('voiceReport.loadingReport')}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">

            {/* Header */}
            <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06]">
                <button onClick={() => navigate(-1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#111113] border border-white/[0.07] text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors shrink-0">
                    <ChevronLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-0.5">Báo cáo luyện tập</p>
                    <h1 className="text-[18px] font-bold text-white truncate">{lesson?.title || t('voiceReport.practiceReportDetail')}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-600">
                    <Calendar size={11} className="text-zinc-700" />
                    <span>{dateStr}</span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* ── Left col ── */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Overall score card */}
                    <motion.div {...fadeUp(0.05)} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-6 right-6 h-px"
                            style={{ background: `linear-gradient(90deg, transparent, ${overall >= 80 ? 'rgba(16,185,129,0.4)' : overall >= 55 ? 'rgba(245,166,35,0.35)' : 'rgba(239,68,68,0.35)'}, transparent)` }} />

                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">{t('voiceReport.overallScore')}</p>
                                <p className={`text-5xl font-bold leading-none ${sc.text}`}>{overall.toFixed(1)}<span className="text-2xl text-zinc-600 ml-1">%</span></p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${sc.ring} ${sc.text}`}>
                                {levelTextVi}
                            </div>
                        </div>

                        <div className="h-1.5 w-full rounded-full bg-white/[0.05] mb-5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${overall}%` }}
                                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                                className={`h-full rounded-full ${sc.bg}`} />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { icon: BarChart3, label: t('voiceReport.coverage'), value: `${coverage.toFixed(0)}%`, color: 'text-cyan-400', tooltip: 'Tỷ lệ % kịch bản đã đọc được. 100% = đọc đủ toàn bộ nội dung.' },
                                { icon: Clock,     label: t('voiceReport.paceSummary'), value: `${pace.toFixed(0)} WPM`, color: 'text-violet-400', tooltip: 'Words Per Minute — tốc độ nói. MC chuyên nghiệp: 120-165 WPM.' },
                            ].map(({ icon: Icon, label, value, color, tooltip }) => (
                                <div key={label} className="bg-[#09090b] border border-white/[0.06] rounded-xl p-3">
                                    <Icon size={13} className={`${color} mb-1.5`} />
                                    <div className="flex items-center gap-1 mb-1">
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
                                        <div className="relative group/tt cursor-help">
                                            <Info size={9} className="text-zinc-700" />
                                            <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-44 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                                {tooltip}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-[17px] font-bold ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Vocal dynamics */}
                    <motion.div {...fadeUp(0.1)} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
                        <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-5">
                            <AudioLines size={13} className="text-[#f5a623]" /> {t('voiceReport.vocalDynamics')}
                        </h3>
                        <div className="space-y-5">
                            <MetricBar label={t('voiceReport.clarity')} value={accuracy} tooltip={t('voiceReport.clarityDesc')} />
                            <MetricBar label={t('voiceReport.energy')} value={energy} tooltip={t('voiceReport.energyDesc')} />
                            <MetricBar label={t('voiceReport.pace')} value={pace} maxValue={180} tooltip={t('voiceReport.paceDesc')} />
                        </div>
                    </motion.div>

                    {/* Criteria scores */}
                    {criteriaEntries.length > 0 && (
                        <motion.div {...fadeUp(0.15)} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
                            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-5">
                                <Target size={13} className="text-indigo-400" /> Điểm tiêu chí
                            </h3>
                            <div className="space-y-3.5">
                                {criteriaEntries.map(({ key, label, value, tooltip }) => (
                                    <CriteriaBar key={key} label={label} value={value} tooltip={tooltip} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Voice Quality — Phase 2+3 */}
                    {(session?.voice_quality || session?.spectral_features || session?.filler_words || session?.pitch_contour) && (
                        <motion.div {...fadeUp(0.18)} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
                            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-5">
                                <BarChart3 size={13} className="text-purple-400" /> Chất lượng giọng nói
                            </h3>
                            <div className="space-y-3">
                                {session.voice_quality && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Jitter', value: session.voice_quality.jitter_pct, unit: '%', color: v => v < 1.0 ? 'text-emerald-400' : v < 2.0 ? 'text-amber-400' : 'text-red-400', tooltip: 'Độ rung tần số cơ bản. < 1% = ổn định, 1-2% = chấp nhận được, > 2% = giọng run/không đều' },
                                            { label: 'Shimmer', value: session.voice_quality.shimmer_pct, unit: '%', color: v => v < 3.0 ? 'text-emerald-400' : v < 5.0 ? 'text-amber-400' : 'text-red-400', tooltip: 'Độ biến động biên độ. < 3% = tốt, 3-5% = bình thường, > 5% = giọng yếu hoặc mệt' },
                                            { label: 'HNR', value: session.voice_quality.hnr_db, unit: 'dB', color: v => v >= 15 ? 'text-emerald-400' : v >= 10 ? 'text-amber-400' : 'text-red-400', tooltip: 'Tỷ lệ hài âm/tạp âm. ≥ 15dB = giọng trong, 10-15dB = chấp nhận được, < 10dB = nhiều tạp âm' },
                                        ].map(m => (
                                            <div key={m.label} className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05] text-center">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <span className="text-[10px] text-zinc-600">{m.label}</span>
                                                    <div className="relative group/tt cursor-help">
                                                        <Info size={9} className="text-zinc-700" />
                                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">
                                                            {m.tooltip}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className={`text-[15px] font-bold tabular-nums ${m.color(m.value ?? 0)}`}>
                                                    {(m.value ?? 0).toFixed(1)}<span className="text-[10px] text-zinc-600">{m.unit}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {session.spectral_features && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-[10px] text-zinc-600">Spectral Centroid</span>
                                                <div className="relative group/tt cursor-help">
                                                    <Info size={9} className="text-zinc-700" />
                                                    <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                                        Trọng tâm phổ tần số. Giá trị cao hơn = giọng sáng, rõ hơn. Lý tưởng cho MC: ≥ 1500 Hz.
                                                    </div>
                                                </div>
                                            </div>
                                            <p className={`text-[14px] font-bold tabular-nums ${(session.spectral_features.spectral_centroid_hz ?? 0) < 1500 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {Math.round(session.spectral_features.spectral_centroid_hz ?? 0)}<span className="text-[10px] text-zinc-600"> Hz</span>
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-[10px] text-zinc-600">MFCC Stability</span>
                                                <div className="relative group/tt cursor-help">
                                                    <Info size={9} className="text-zinc-700" />
                                                    <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                                        Độ ổn định cấu trúc âm thanh (MFCC). ≥ 50/100 = phát âm nhất quán, ổn định.
                                                    </div>
                                                </div>
                                            </div>
                                            <p className={`text-[14px] font-bold tabular-nums ${(session.spectral_features.mfcc_stability_score ?? 0) >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {(session.spectral_features.mfcc_stability_score ?? 0).toFixed(1)}<span className="text-[10px] text-zinc-600">/100</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {session.pitch_contour && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                                        <div className="flex items-center gap-1 w-24 shrink-0">
                                            <span className="text-[11px] text-zinc-500">Pitch Contour</span>
                                            <div className="relative group/tt cursor-help">
                                                <Info size={9} className="text-zinc-700" />
                                                <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                                    Xu hướng cao độ giọng. Rising (↗) = giọng lên. Falling (↘) = giọng xuống. Flat (→) = đều đặn.
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-md ${
                                            session.pitch_contour.pitch_contour === 'rising' ? 'bg-cyan-500/10 text-cyan-400' :
                                            session.pitch_contour.pitch_contour === 'falling' ? 'bg-purple-500/10 text-purple-400' :
                                            'bg-amber-500/10 text-amber-400'
                                        }`}>
                                            {session.pitch_contour.pitch_contour === 'rising' ? '↗ Rising' :
                                             session.pitch_contour.pitch_contour === 'falling' ? '↘ Falling' : '→ Flat'}
                                        </span>
                                        <span className="text-[11px] text-zinc-600 ml-auto tabular-nums">{(session.pitch_contour.pitch_slope ?? 0).toFixed(2)} st/s</span>
                                    </div>
                                )}
                                {session.filler_words && session.filler_words.filler_count > 0 && (
                                    <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[11px] text-zinc-500">Filler Words</span>
                                                <div className="relative group/tt cursor-help">
                                                    <Info size={9} className="text-zinc-700" />
                                                    <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                                        Từ đệm không cần thiết (ừm, ờ, thì là…). MC nên giảm xuống ≤ 2% tổng số từ.
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[12px] font-semibold text-amber-400">{session.filler_words.filler_count} detected</span>
                                        </div>
                                        {session.filler_words.fillers_found?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {session.filler_words.fillers_found.slice(0, 5).map((f, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15">
                                                        {f.word} ×{f.count}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Lesson script preview */}
                    {lesson?.content && (
                        <motion.div {...fadeUp(0.2)} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
                            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                                <BookOpen size={13} className="text-zinc-500" /> Kịch bản bài học
                            </h3>
                            <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-6 italic">
                                "{lesson.content.slice(0, 300)}{lesson.content.length > 300 ? '…' : ''}"
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* ── Right col ── */}
                <div className="lg:col-span-8 space-y-5">
                    <motion.div {...fadeUp(0.08)} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-7">
                        <h2 className="text-[15px] font-semibold text-white flex items-center gap-2 mb-6 pb-5 border-b border-white/[0.05]">
                            <Sparkles size={15} className="text-[#f5a623]" /> {t('voiceReport.aiAnalysis')}
                        </h2>

                        <div className="space-y-8">

                            {/* Feedback breakdown */}
                            {feedbackItems.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                                        <BarChart3 size={12} className="text-[#f5a623]" /> {t('voiceReport.feedbackBreakdown')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {feedbackItems.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-[#0e0e10] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 size={10} className="text-[#f5a623]" />
                                                </div>
                                                <p className="text-[13px] text-zinc-400 leading-relaxed">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Expert tips */}
                            {expertTips.length > 0 && (
                                <div>
                                    <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                                        <Lightbulb size={12} className="text-zinc-500" /> {t('voiceReport.coachingTips')}
                                    </h3>
                                    <div className="space-y-2">
                                        {expertTips.map((item, i) => (
                                            <div key={i} className="bg-[#0e0e10] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]/50 shrink-0" />
                                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                                                </div>
                                                <p className="text-[13px] text-zinc-300 leading-relaxed pl-3.5">{item.tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AI report markdown */}
                            {report && (
                                <div>
                                    <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                                        <Mic size={12} className="text-zinc-500" /> Báo cáo phân tích chuyên sâu
                                    </h3>
                                    <div className="bg-[#0e0e10] border border-white/[0.06] rounded-xl p-6">
                                        <TypewriterMarkdown content={report} enabled={false} />
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VoiceReport;
