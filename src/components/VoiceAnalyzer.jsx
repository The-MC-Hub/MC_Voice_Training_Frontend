import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Mic,
    Square,
    RotateCcw,
    Activity,
    Award,
    Zap,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { analyzeVoice } from "../services/aiService";
import CountUp from "./animations/CountUp";

const VoiceAnalyzer = ({ scriptText }) => {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                await handleAnalysis(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAnalysisResult(null);
            setError(null);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError(t('voiceAnalyzer.micAccessError'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
    };

    const handleAnalysis = async (audioBlob) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeVoice(audioBlob, scriptText);
            if (result.status === "success") {
                setAnalysisResult(result);
            } else {
                setError(result.message || t('voiceAnalyzer.analysisFailed'));
            }
        } catch (err) {
            console.error("Analysis error:", err);
            setError(t('voiceAnalyzer.serverError'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="voice-analyzer-container space-y-8">
            <div className="analyzer-controls bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-30"></div>

                <div className="action-buttons flex items-center gap-6">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            disabled={isAnalyzing}
                            className="btn btn-primary px-10 py-5 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(253,184,19,0.2)] hover:shadow-[0_0_50px_rgba(253,184,19,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <Mic size={24} /> <span className="text-lg font-black uppercase tracking-tight">{t('voiceAnalyzer.startPractice')}</span>
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="btn bg-red-500 hover:bg-red-600 text-white px-10 py-5 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 border-none outline-none"
                        >
                            <Square size={24} fill="currentColor" /> <span className="text-lg font-black uppercase tracking-tight">{t('voiceAnalyzer.finish')}</span>
                        </button>
                    )}

                    {analysisResult && !isRecording && (
                        <button
                            onClick={() => {
                                setAnalysisResult(null);
                                setRecordingTime(0);
                            }}
                            className="icon-btn lg bg-slate-800/50 rounded-2xl text-slate-400 hover:text-gold hover:border-gold/50 transition-all border border-white/5"
                            title={t('voiceAnalyzer.resetLab')}
                        >
                            <RotateCcw size={22} />
                        </button>
                    )}
                </div>

                <div className="recording-status flex items-center gap-6">
                    <div className="timer-wrapper relative">
                        <div className={`absolute inset-0 rounded-full blur-lg opacity-50 ${isRecording ? "bg-red-500" : "bg-gold/20"}`}></div>
                        <div className={`timer-display font-mono text-3xl font-black text-white relative z-10 w-24 h-24 rounded-full border-2 ${isRecording ? "border-red-500" : "border-white/10"} flex items-center justify-center bg-slate-950/50`}>
                            {formatTime(recordingTime)}
                        </div>
                    </div>

                    <div className="status-info flex flex-col">
                        {isRecording ? (
                            <>
                                <span className="text-xs font-black text-red-500 uppercase tracking-[0.2em] animate-pulse mb-1">
                                    {t('voiceAnalyzer.recordingLive')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('voiceAnalyzer.speakClearly')}</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xs font-black text-gold uppercase tracking-[0.2em] mb-1">
                                    {t('voiceAnalyzer.vocalLabReady')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('voiceAnalyzer.calibratePresence')}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isAnalyzing && (
                <div className="analysis-loading bg-slate-900/80 backdrop-blur-xl p-16 rounded-[2rem] border border-gold/20 flex flex-col items-center justify-center space-y-8 text-center animate-in zoom-in-95 duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gold blur-3xl opacity-20 animate-pulse"></div>
                        <Loader2 size={64} className="text-gold animate-spin relative z-10" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-white tracking-tight">{t('voiceAnalyzer.aiDecoding')}</h3>
                        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                            {t('voiceAnalyzer.evaluatingVocal')}
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-card p-8 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-6 text-red-400 shadow-lg">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black uppercase text-xs tracking-widest">{t('voiceAnalyzer.labError')}</p>
                        <p className="text-lg font-medium">{error}</p>
                    </div>
                </div>
            )}

            {analysisResult && (
                <div className="analysis-results animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="results-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <div className="result-stat-card bg-slate-900/90 p-10 rounded-[2rem] border border-white/5 transition-all hover:border-gold/30 group overflow-hidden relative shadow-lg">
                            <div className="absolute -right-4 -top-4 text-gold opacity-5 group-hover:opacity-10 transition-opacity">
                                <CheckCircle2 size={120} />
                            </div>
                            <p className="text-micro font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{t('voiceAnalyzer.accuracyScore')}</p>
                            <div className="text-5xl font-black text-white flex items-end gap-1 mb-8">
                                <CountUp to={analysisResult.accuracy_score} decimals={1} />
                                <span className="text-2xl text-gold pb-1.5">%</span>
                            </div>
                            <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="bg-gradient-to-r from-gold/50 to-gold h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(253,184,19,0.3)]"
                                    style={{ width: `${analysisResult.accuracy_score}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="result-stat-card bg-slate-900/90 p-10 rounded-[2rem] border border-white/5 transition-all hover:border-blue-400/30 group overflow-hidden relative shadow-lg">
                            <div className="absolute -right-4 -top-4 text-blue-400 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity size={120} />
                            </div>
                            <p className="text-micro font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{t('voiceAnalyzer.resonanceIndex')}</p>
                            <div className="text-5xl font-black text-white flex items-end gap-1 mb-8">
                                <CountUp to={analysisResult.rhythm_score} decimals={1} />
                                <span className="text-2xl text-blue-400 pb-1.5">/ 100</span>
                            </div>
                            <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="bg-gradient-to-r from-blue-600/50 to-blue-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(96,165,250,0.3)]"
                                    style={{ width: `${analysisResult.rhythm_score}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="result-stat-card bg-slate-900/90 p-10 rounded-[2rem] border border-white/5 transition-all hover:border-green-400/30 group overflow-hidden relative shadow-lg">
                            <div className="absolute -right-4 -top-4 text-green-400 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Clock size={120} />
                            </div>
                            <p className="text-micro font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{t('voiceAnalyzer.speakingPace')}</p>
                            <div className="text-5xl font-black text-white flex items-end gap-1 mb-8">
                                <CountUp to={analysisResult.speaking_rate_wpm} />
                                <span className="text-2xl text-green-400 pb-1.5 font-sans">WPM</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${analysisResult.speaking_rate_wpm > 130 && analysisResult.speaking_rate_wpm < 160 ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"}`}>
                                    {analysisResult.speaking_rate_wpm > 130 && analysisResult.speaking_rate_wpm < 160 ? t('voiceAnalyzer.optimalPace') : t('voiceAnalyzer.paceVariation')}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('voiceAnalyzer.target')}: 130 - 160</span>
                            </div>
                        </div>
                    </div>

                    <div className="feedback-section grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-900/90 p-10 rounded-[2rem] border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent relative overflow-hidden group shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors"></div>
                            <h3 className="text-xl font-black flex items-center gap-4 mb-8 text-white">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                    <Zap size={20} className="text-gold" />
                                </div>
                                {t('voiceAnalyzer.aiInsights')}
                            </h3>
                            <p className="text-2xl text-slate-200 leading-relaxed font-serif italic relative z-10 selection:bg-gold selection:text-slate-950">
                                "{analysisResult.feedback}"
                            </p>
                        </div>

                        <div className="bg-slate-900/90 p-10 rounded-[2rem] border border-white/10 shadow-lg">
                            <h3 className="text-xl font-black flex items-center gap-4 mb-8 text-white">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Award size={20} className="text-blue-400" />
                                </div>
                                {t('voiceAnalyzer.proTips')}
                            </h3>
                            <div className="space-y-6">
                                {analysisResult.expert_tips.map((tip, idx) => (
                                    <div key={idx} className="tip-item flex gap-6 group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-sm font-black text-gold group-hover:border-gold/30 transition-all shrink-0">
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-lg mb-1.5 group-hover:text-gold transition-colors tracking-tight">{tip.label}</p>
                                            <p className="text-slate-400 text-base leading-relaxed">{tip.tip}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="transcript-preview mt-8 bg-slate-900/90 p-10 rounded-[2rem] border border-white/5 shadow-inner group">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-micro font-black text-slate-500 uppercase tracking-[0.4em]">{t('voiceAnalyzer.sttTranscription')}</h4>
                            <div className="text-[10px] font-black text-gold/50 bg-gold/5 px-2 py-1 rounded border border-gold/10 uppercase tracking-widest">{t('voiceAnalyzer.analysisSuite')}</div>
                        </div>
                        <p className="text-slate-300 text-xl leading-relaxed font-medium selection:bg-gold selection:text-slate-950">
                            {analysisResult.text_spoken}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAnalyzer;
