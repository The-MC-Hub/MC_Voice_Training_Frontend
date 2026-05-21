import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Mic, Square, Play, RefreshCw, ChevronLeft,
    Zap, CheckCircle2, Award, TrendingUp, AlertCircle,
    Loader2, BookOpen, ArrowLeft, AudioLines, BarChart3,
    Clock, Sparkles, Info, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { fetchLessonById, analyzePractice, fetchPracticeHistory } from '../controllers/voiceController';
import { ProgressBar, ProgressBarTrack, ProgressBarFill } from '@heroui/react';
import TypewriterMarkdown from '../components/TypewriterMarkdown';
import Navbar from '../components/Navbar';
import PremiumModal from '../components/PremiumModal';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const clampMetric = (v) => {
    const n = Number(v || 0);
    return Number.isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
};

const VoicePractice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const mId = new URLSearchParams(location.search).get('mId');
    const { user } = useAuthStore();
    const { t, i18n: i18nInstance } = useTranslation();
    const evalLanguage = i18nInstance.language;

    const [lesson, setLesson]             = useState(null);
    const [loading, setLoading]           = useState(true);
    const [recording, setRecording]       = useState(false);
    const [audioBlob, setAudioBlob]       = useState(null);
    const [audioUrl, setAudioUrl]         = useState(null);
    const [analyzing, setAnalyzing]       = useState(false);
    const [result, setResult]             = useState(null);
    const [error, setError]               = useState(null);
    const [history, setHistory]           = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [recordingTime, setRecordingTime] = useState(0);
    const [totalPracticesCount, setTotalPracticesCount] = useState(0);
    const [isPremiumModalOpen, setIsPremiumModalOpen]   = useState(false);
    const itemsPerPage = 4;

    const t_vp = (key) => t(`voicePractice.${key}`);

    // Resizable layout
    const [leftWidth, setLeftWidth] = useState(60);
    const containerRef = useRef(null);
    const isResizing   = useRef(false);

    const handleMouseDown = () => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    };
    const handleMouseMove = (e) => {
        if (!isResizing.current || !containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        const w = ((e.clientX - r.left) / r.width) * 100;
        if (w >= 25 && w <= 75) setLeftWidth(w);
    };
    const handleMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
    };

    const mediaRecorderRef = useRef(null);
    const chunksRef        = useRef([]);
    const timerRef         = useRef(null);

    const fetchHistory = async () => {
        if (!user?.id || !id) return;
        try {
            const raw = await fetchPracticeHistory(user.id);
            setTotalPracticesCount(raw?.length || 0);
            const norm = (raw || []).map(h => ({
                id: h.id,
                lessonId: h.lesson_id ?? h.lessonId,
                accuracyScore: h.accuracy_score ?? h.accuracyScore ?? 0,
                rhythmScore: h.rhythm_score ?? h.rhythmScore ?? 0,
                speakingRateWpm: h.speaking_rate_wpm ?? h.speakingRateWpm ?? 0,
                createdAt: h.created_at ?? h.createdAt,
            }));
            setHistory(norm.filter(h => String(h.lessonId) === String(id)).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)));
            setCurrentPage(1);
        } catch {}
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchLessonById(id);
                setLesson(data);
                await fetchHistory();
            } catch { setError("Failed to load lesson content"); }
            finally { setLoading(false); }
        };
        load();
    }, [id, user?.id]);

    useEffect(() => () => {
        if (timerRef.current) clearInterval(timerRef.current);
        mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    }, []);

    const startRecording = async () => {
        if (!user?.isPremium && totalPracticesCount >= 5) { setIsPremiumModalOpen(true); return; }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };
            mediaRecorderRef.current.start();
            setRecording(true); setResult(null); setRecordingTime(0); setError(null);
            timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
        } catch { setError(t('micAccessDenied')); }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleAnalyze = async () => {
        if (!audioBlob) return;
        setAnalyzing(true); setError(null);
        try {
            const data = await analyzePractice(id, user.id, audioBlob);
            setResult({
                accuracy_score:  data.accuracy_score  ?? data.accuracyScore  ?? 0,
                rhythm_score:    data.rhythm_score    ?? data.rhythmScore    ?? 0,
                speaking_rate_wpm: data.speaking_rate_wpm ?? data.speakingRateWpm ?? 0,
                feedback_vi: data.feedback_vi ?? data.feedbackVi ?? "",
                feedback_en: data.feedback_en ?? data.feedbackEn ?? "",
                report_vi:   data.report_vi   ?? data.reportVi   ?? "",
                report_en:   data.report_en   ?? data.reportEn   ?? "",
                tips_vi: data.tips_vi ?? data.expertTipsVi ?? [],
                tips_en: data.tips_en ?? data.expertTipsEn ?? [],
                text_spoken: data.text_spoken ?? data.textSpoken ?? "",
                status: "success",
            });
            await fetchHistory();
        } catch (err) {
            if (err.response?.status === 402 || err.response?.data?.code === "ERR_4005") {
                setIsPremiumModalOpen(true);
            }
            setError("AI Analysis failed. Please try again.");
        } finally { setAnalyzing(false); }
    };

    const resetPractice = () => { setAudioBlob(null); setAudioUrl(null); setResult(null); setError(null); setRecordingTime(0); };

    // Derived metrics
    const scriptMarkdown = useMemo(() => lesson?.content?.replace(/^\[(.+?)\]\s*$/gm,"## $1").replace(/\n{3,}/g,"\n\n") || "", [lesson]);
    const accuracy    = useMemo(() => clampMetric(result?.accuracy_score), [result]);
    const energy      = useMemo(() => clampMetric(result?.rhythm_score), [result]);
    const pace        = useMemo(() => Number(result?.speaking_rate_wpm || 0), [result]);
    const pacePercent = useMemo(() => clampMetric((pace / 180) * 100), [pace]);

    const feedbackItems = useMemo(() => {
        const fb = evalLanguage === "vi" ? result?.feedback_vi : result?.feedback_en;
        if (!fb) return [];
        return fb.split("|").map(s => s.trim()).filter(Boolean);
    }, [result, evalLanguage]);

    const expertTips = useMemo(() => {
        const tips = evalLanguage === "vi" ? result?.tips_vi : result?.tips_en;
        return Array.isArray(tips) ? tips : [];
    }, [result, evalLanguage]);

    const markdownReport = useMemo(() => evalLanguage === "vi" ? result?.report_vi : result?.report_en, [result, evalLanguage]);

    const scriptWordCount  = useMemo(() => lesson?.content?.trim().split(/\s+/).length || 0, [lesson]);
    const spokenWordCount  = useMemo(() => result?.text_spoken?.trim().split(/\s+/).length || 0, [result]);
    const completionPercent = useMemo(() => clampMetric((spokenWordCount / scriptWordCount) * 100), [scriptWordCount, spokenWordCount]);
    const overallScore     = useMemo(() => clampMetric(accuracy * 0.45 + energy * 0.35 + pacePercent * 0.2), [accuracy, energy, pacePercent]);

    const overallLevel = useMemo(() => {
        if (overallScore >= 85) return { label: "Excellent", color: "text-emerald-400" };
        if (overallScore >= 70) return { label: "Good",      color: "text-cyan-400" };
        if (overallScore >= 55) return { label: "Developing",color: "text-amber-400" };
        return { label: "Needs Work", color: "text-orange-400" };
    }, [overallScore]);

    const paceInsight = useMemo(() => {
        if (!pace) return { text: "Pace data not available.", color: "text-zinc-500" };
        if (pace < 115) return { text: "Slow pace. Increase tempo slightly.", color: "text-amber-400" };
        if (pace <= 165) return { text: "Balanced pace. Suitable for MC contexts.", color: "text-emerald-400" };
        return { text: "Fast pace. Add pauses for clarity.", color: "text-orange-400" };
    }, [pace]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center bg-[#09090b]">
            <Loader2 className="animate-spin text-[#f5a623]" size={28} />
        </div>
    );

    return (
        <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
            <Navbar />

            <main className="flex-1 flex pt-14 min-h-[calc(100vh-3.5rem)] overflow-hidden">
                {/* Sidebar — only when inside milestone */}
                {mId && (
                    <aside className="hidden xl:flex w-72 border-r border-white/[0.07] bg-[#111113] flex-col sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden">
                        <div className="p-5 border-b border-white/[0.07]">
                            <button
                                onClick={() => navigate(`/m/learning/milestone/${mId}`)}
                                className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[12px] mb-4"
                            >
                                <ArrowLeft size={13} /> {t_vp('roadmap')}
                            </button>
                            <h2 className="text-[14px] font-semibold text-white line-clamp-2">{t('learning.progress')}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {/* curriculum items rendered here if mId active */}
                        </div>
                    </aside>
                )}

                <div className="flex-1 p-4 lg:p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>

                    {/* Page header */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between mb-5 pb-5 border-b border-white/[0.07]">
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">{lesson?.title}</h1>
                            <p className="text-[12px] text-zinc-500 mt-0.5">
                                {lesson?.category} · {lesson?.difficulty} {t('common.level') || 'Level'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Language toggle */}
                            <div className="flex items-center rounded-lg bg-[#111113] border border-white/[0.07] p-0.5">
                                {['vi','en'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => i18nInstance.changeLanguage(lang)}
                                        className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${evalLanguage === lang ? 'bg-[#f5a623] text-black' : 'text-zinc-400 hover:text-white'}`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {audioBlob && !analyzing && !result && (
                                <button
                                    onClick={handleAnalyze}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
                                >
                                    <Zap size={14} /> {t_vp('analyzeNow')}
                                </button>
                            )}
                            {audioBlob && (
                                <button
                                    onClick={resetPractice}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.1] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.05] transition-colors"
                                >
                                    <RefreshCw size={13} /> {t_vp('reRecord')}
                                </button>
                            )}
                            {recording ? (
                                <button
                                    onClick={stopRecording}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors"
                                >
                                    <Square size={13} /> {t_vp('stop')}
                                </button>
                            ) : !audioBlob ? (
                                <button
                                    onClick={startRecording}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
                                >
                                    <Play size={13} /> {t_vp('startRecording')}
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-red-400 text-[13px] mb-4">
                            <AlertCircle size={15} /> {error}
                        </div>
                    )}

                    {/* Resizable 2-col */}
                    <div ref={containerRef} className="flex gap-1 relative">

                        {/* ── LEFT: Script + Recording + History ── */}
                        <div style={{ width: `${leftWidth}%` }} className="space-y-4 min-w-[28%]">

                            {/* Recording area */}
                            <div className="rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
                                {/* Status bar */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
                                        <span className="text-[12px] text-zinc-500 font-medium">
                                            {recording ? t_vp('recordingInProgress') : analyzing ? t_vp('analyzingVoice') : t_vp('readyToRecord')}
                                        </span>
                                    </div>
                                    {(recording || recordingTime > 0) && (
                                        <span className="text-[12px] font-mono text-zinc-400">{formatTime(recordingTime)}</span>
                                    )}
                                </div>

                                {/* Mic area */}
                                <div className="flex flex-col items-center justify-center py-10 bg-[#0d0d0f]">
                                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                                        recording
                                            ? 'bg-red-500/20 border border-red-500/40'
                                            : 'bg-[#f5a623]/[0.08] border border-[#f5a623]/20'
                                    }`}>
                                        {recording && (
                                            <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping" />
                                        )}
                                        <Mic size={28} className={recording ? 'text-red-400 animate-pulse' : 'text-[#f5a623]'} />
                                    </div>
                                    <p className="text-[14px] font-semibold text-white mb-1">{t_vp('voiceAnalysis')}</p>
                                    <p className="text-[12px] text-zinc-500">{t_vp('readScript')}</p>
                                </div>

                                {/* Script */}
                                <div className="max-h-[500px] overflow-y-auto bg-[#faf8f3] px-8 py-8" style={{ scrollbarWidth: 'thin' }}>
                                    <h3 className="text-center text-[15px] font-semibold text-[#92400e] mb-6 uppercase tracking-wider">
                                        {t_vp('practiceScript')}
                                    </h3>
                                    <div className="font-reading text-stone-900">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h2: ({ children }) => (
                                                    <h2 className="mt-6 text-center text-[18px] font-bold tracking-wide text-[#92400e]">{children}</h2>
                                                ),
                                                p: ({ children }) => (
                                                    <p className="mt-4 text-center text-[22px] leading-relaxed text-stone-800 md:text-[28px]">{children}</p>
                                                ),
                                            }}
                                        >
                                            {scriptMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                    <p className="mt-6 text-center text-[16px] italic text-stone-400">— {t('endOfScript')} —</p>
                                </div>
                            </div>

                            {/* Past attempts */}
                            {history.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[13px] font-semibold text-white">
                                            {t_vp('pastAttempts')}
                                            <span className="ml-2 text-[11px] text-zinc-600">({history.length})</span>
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {history.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map((h,i) => (
                                                <motion.div
                                                    key={h.id || i}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => navigate(`/m/voice/report/${h.id}`)}
                                                    className="cursor-pointer p-4 rounded-xl bg-[#111113] border border-white/[0.07] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02] transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <p className="text-[11px] text-zinc-600">
                                                            {(() => {
                                                                const d = new Date(h.createdAt);
                                                                return isNaN(d.getTime()) ? t_vp('recentSession') : d.toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
                                                            })()}
                                                        </p>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20">
                                                            Done
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] text-zinc-600 mb-0.5">{t('overallScore')}</p>
                                                            <p className="text-lg font-bold text-white">
                                                                {clampMetric(Number(h.accuracyScore||0)*0.45 + Number(h.rhythmScore||0)*0.35 + (Math.min(Number(h.speakingRateWpm||0),180)/180*20)).toFixed(1)}%
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-zinc-600 mb-0.5">WPM</p>
                                                            <p className="text-lg font-bold text-[#f5a623]">{Math.round(h.speakingRateWpm||0)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                                                        <div className="h-full bg-emerald-500" style={{ width: `${h.accuracyScore||0}%` }} />
                                                        <div className="h-full bg-blue-500" style={{ width: `${h.rhythmScore||0}%` }} />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    {history.length > itemsPerPage && (
                                        <div className="flex justify-center items-center gap-2 mt-4">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1,p-1))}
                                                disabled={currentPage===1}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-500 disabled:opacity-30 hover:text-white transition-colors"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <span className="text-[12px] text-zinc-600">{currentPage}/{Math.ceil(history.length/itemsPerPage)}</span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(history.length/itemsPerPage),p+1))}
                                                disabled={currentPage===Math.ceil(history.length/itemsPerPage)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-500 disabled:opacity-30 hover:text-white transition-colors rotate-180"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── DIVIDER ── */}
                        <div
                            onMouseDown={handleMouseDown}
                            className="group relative flex w-2 cursor-col-resize items-center justify-center mx-0.5"
                        >
                            <div className="h-10 w-0.5 rounded-full bg-white/[0.08] group-hover:bg-[#f5a623]/40 transition-colors" />
                        </div>

                        {/* ── RIGHT: Metrics + AI Analysis ── */}
                        <div style={{ width: `${100-leftWidth}%` }} className="space-y-4 min-w-[25%]">

                            {/* Vocal dynamics */}
                            <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[13px] font-semibold text-white">{t('vocalDynamics')}</h3>
                                    <AudioLines size={16} className="text-blue-400" />
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: t_vp('clarity'), value: accuracy, pct: accuracy, color: 'bg-[#f5a623]', desc: t_vp('clarityDesc') },
                                        { label: t_vp('energy'), value: energy, pct: energy, color: 'bg-blue-500', desc: t_vp('energyDesc') },
                                        { label: t_vp('pace'), value: pace, pct: pacePercent, color: 'bg-emerald-500', desc: t_vp('paceDesc'), unit: ' wpm' },
                                    ].map((m) => (
                                        <div key={m.label} className="group/m relative">
                                            <div className="flex items-center justify-between text-[13px] mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-zinc-300 font-medium">{m.label}</span>
                                                    <div className="relative cursor-help">
                                                        <Info size={12} className="text-zinc-600 hover:text-zinc-400 transition-colors" />
                                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-300 leading-relaxed opacity-0 group-hover/m:opacity-100 transition-opacity z-50 shadow-xl">
                                                            {m.desc}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-zinc-400 font-medium">{m.value.toFixed(1)}{m.unit || '%'}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className={`rounded-2xl border p-5 transition-all ${result ? 'border-white/[0.07] bg-[#111113]' : 'border-dashed border-white/[0.05] bg-[#111113]/60 opacity-70'}`}>
                                <div className="flex items-center gap-2 mb-5">
                                    <Sparkles size={16} className={result ? 'text-[#f5a623]' : 'text-zinc-600'} />
                                    <h3 className="text-[13px] font-semibold text-white">{t_vp('aiAnalysis')}</h3>
                                </div>

                                {result ? (
                                    <div className="space-y-5">
                                        {markdownReport && (
                                            <div className="relative p-4 rounded-xl bg-[#09090b] border border-white/[0.06] overflow-hidden">
                                                <div className="absolute top-0 left-0 w-0.5 h-full bg-[#f5a623]/40" />
                                                <div className="pl-3 prose prose-invert prose-sm max-w-none prose-headings:text-[#f5a623] prose-strong:text-white text-zinc-300">
                                                    <TypewriterMarkdown content={markdownReport} />
                                                </div>
                                            </div>
                                        )}
                                        {feedbackItems.length > 0 && (
                                            <div>
                                                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2">{t_vp('feedbackBreakdown')}</p>
                                                <div className="space-y-2">
                                                    {feedbackItems.map((item,i) => (
                                                        <div key={i} className="px-3 py-2.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/15 text-[13px] text-zinc-300">
                                                            • {item}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {expertTips.length > 0 && (
                                            <div>
                                                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">{t_vp('coachingTips')}</p>
                                                <div className="space-y-2">
                                                    {expertTips.map((tip,i) => (
                                                        <div key={i} className="px-3 py-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                                                            <p className="text-[10px] font-semibold text-amber-400 mb-1">{tip.label}</p>
                                                            <p className="text-[13px] text-zinc-300">{tip.tip}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center">
                                        <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                                            <Loader2 size={20} className={recording ? 'animate-spin text-[#f5a623]' : 'text-zinc-700'} />
                                        </div>
                                        <p className="text-[14px] font-medium text-zinc-500">{recording ? t_vp('aiListening') : t_vp('lockedAnalysis')}</p>
                                        <p className="text-[12px] text-zinc-700 mt-1 max-w-[200px] mx-auto leading-relaxed">{t_vp('recordToUnlock')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Performance summary */}
                            <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Award size={16} className="text-[#f5a623]" />
                                        <h3 className="text-[13px] font-semibold text-white">{t('performanceSummary')}</h3>
                                    </div>
                                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${result ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-zinc-600'}`}>
                                        {result ? `✓ ${t('ready')}` : `⏳ ${t('waiting')}`}
                                    </span>
                                </div>

                                {result ? (
                                    <div className="space-y-4">
                                        {/* Overall score */}
                                        <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                                            <div className="flex items-end justify-between mb-3">
                                                <div>
                                                    <p className="text-[11px] text-zinc-600 mb-1">{t('overallScore')}</p>
                                                    <p className="text-4xl font-bold text-white">{overallScore.toFixed(1)}<span className="text-xl text-zinc-400">%</span></p>
                                                </div>
                                                <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-white/[0.06] ${overallLevel.color}`}>
                                                    {overallLevel.label}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#f5a623] rounded-full transition-all duration-700" style={{ width: `${overallScore}%` }} />
                                            </div>
                                        </div>

                                        {/* Coverage + Pace */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <BarChart3 size={13} className="text-cyan-400" />
                                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('coverage')}</p>
                                                </div>
                                                <p className="text-2xl font-bold text-white">{completionPercent.toFixed(0)}<span className="text-sm text-zinc-500">%</span></p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Clock size={13} className="text-purple-400" />
                                                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Pace</p>
                                                </div>
                                                <p className="text-2xl font-bold text-white">{pace.toFixed(0)}<span className="text-sm text-zinc-500"> wpm</span></p>
                                            </div>
                                        </div>

                                        {/* Pace insight */}
                                        <p className={`text-[12px] leading-relaxed ${paceInsight.color}`}>{paceInsight.text}</p>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <BarChart3 size={24} className="mx-auto mb-2 text-zinc-800" />
                                        <p className="text-[13px] text-zinc-600">{t('recordToUnlock')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUpgradeSuccess={fetchHistory} />
        </div>
    );
};

export default VoicePractice;
