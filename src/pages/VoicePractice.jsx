import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Mic,
  Square,
  Play,
  RefreshCw,
  ChevronLeft,
  Zap,
  CheckCircle2,
  Award,
  TrendingUp,
  AlertCircle,
  Loader2,
  BookOpen,
  ArrowLeft,
  AudioLines,
  BarChart3,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Video,
  Target,
  ListChecks,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Minus,
  Plus,
  Moon,
  Sun,
  Gauge,
  ChevronDown,
  ChevronUp,
  Settings2,
  Camera,
  CameraOff,
  Volume1,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import { useAudioAnalyser } from "../hooks/useAudioAnalyser";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import {
  fetchLessonById,
  analyzePractice,
  fetchPracticeHistory,
} from "../controllers/voiceController";
import { academyService } from "../services/academyService";
import { ProgressBar, ProgressBarTrack, ProgressBarFill } from "@heroui/react";
import TypewriterMarkdown from "../components/TypewriterMarkdown";
import Navbar from "../components/Navbar";
import UpgradeBanner from "../components/ui/UpgradeBanner";
import Breadcrumb from '../components/ui/Breadcrumb';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60),
    s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const clampMetric = (v) => {
  const n = Number(v || 0);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
};

const VoicePractice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mId = new URLSearchParams(location.search).get("mId");
  const courseId = new URLSearchParams(location.search).get("courseId");
  const { user, refreshUser } = useAuthStore();
  const { t, i18n: i18nInstance } = useTranslation();
  const evalLanguage = i18nInstance.language;

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzePhase, setAnalyzePhase] = useState("");
  const analyzeTimerRef = useRef(null);
  const [result, setResult] = useState(null);

  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const [totalPracticesCount, setTotalPracticesCount] = useState(0);
  const itemsPerPage = 4;

  // Script reader controls
  const [scriptFontSize, setScriptFontSize] = useState(24); // px, range 16-48
  const [scriptAlign, setScriptAlign] = useState("center"); // 'left' | 'center' | 'right'
  const [scriptFont, setScriptFont] = useState("sans"); // 'serif' | 'sans' | 'mono'
  const [scriptBg, setScriptBg] = useState("cream"); // 'cream' | 'dark' | 'white' | 'sepia'
  const [teleprompter, setTeleprompter] = useState(false);
  const [teleprompterWpm, setTeleprompterWpm] = useState(130);
  const [teleprompterRunning, setTeleprompterRunning] = useState(false);
  const [showScriptSettings, setShowScriptSettings] = useState(false);
  // Annotations: { id, startOffset, endOffset, type: 'highlight'|'note', color, note, text }
  const [annotations, setAnnotations] = useState([]);
  const [annotationPopup, setAnnotationPopup] = useState(null); // { x, y, selectedText, startOffset, endOffset }
  const [noteInput, setNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null); // id
  const annotationPopupRef = useRef(null);
  const scriptScrollRef = useRef(null);
  const teleprompterRef = useRef(null);

  const t_vp = (key) => t(`voicePractice.${key}`);

  // Resizable layout
  const [leftWidth, setLeftWidth] = useState(60);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
  };
  const handleMouseMove = (e) => {
    if (!isResizing.current || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const w = ((e.clientX - r.left) / r.width) * 100;
    if (w >= 25 && w <= 75) setLeftWidth(w);
  };
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "default";
  };

  // Teleprompter auto-scroll
  useEffect(() => {
    if (!teleprompterRunning || !scriptScrollRef.current) return;
    const el = scriptScrollRef.current;
    const wordsPerMs = teleprompterWpm / 60000;
    const totalWords = lesson?.content?.split(/\s+/).length || 100;
    const durationMs = totalWords / wordsPerMs;
    const startScrollTop = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const distance = maxScroll - startScrollTop;
    if (distance <= 0) {
      setTeleprompterRunning(false);
      return;
    }
    const startTime = performance.now();
    let animId;
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      el.scrollTop = startScrollTop + distance * progress;
      if (progress < 1) animId = requestAnimationFrame(step);
      else setTeleprompterRunning(false);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [teleprompterRunning, teleprompterWpm, lesson]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const liveStreamRef = useRef(null); // raw mic stream for analyser

  const EMPTY_BARS = useMemo(() => new Array(36).fill(0), []);

  // Camera state
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // Audio analyser — only active while recording
  const { bars, volumeLevel, audioStatus } = useAudioAnalyser(
    recording ? liveStreamRef.current : null,
    { barCount: 36, fftSize: 256 },
  );

  const fetchHistory = async () => {
    if (!user?.id || !id) return;
    try {
      const raw = await fetchPracticeHistory(user.id);
      setTotalPracticesCount(raw?.length || 0);
      const norm = (raw || []).map((h) => ({
        id: h.id,
        lessonId: h.lesson_id ?? h.lessonId,
        accuracyScore: h.accuracy_score ?? h.accuracyScore ?? 0,
        rhythmScore: h.rhythm_score ?? h.rhythmScore ?? 0,
        speakingRateWpm: h.speaking_rate_wpm ?? h.speakingRateWpm ?? 0,
        createdAt: h.created_at ?? h.createdAt,
      }));
      setHistory(
        norm
          .filter((h) => String(h.lessonId) === String(id))
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          ),
      );
      setCurrentPage(1);
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLessonById(id);
        setLesson(data);
        if (courseId) {
          try {
            const cRes = await academyService.getCourseDetail(courseId);
            setCourse(cRes.data?.data || cRes.data);
          } catch (e) {
            console.error("Failed to fetch course:", e);
          }
        }
        await fetchHistory();
      } catch {
        setError("Failed to load lesson content");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.id]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const startRecording = async () => {
    const plan = user?.plan || "FREE";
    const aiUsed = user?.aiSessionsUsed ?? 0;
    if (plan === "FREE" && aiUsed >= 5) {
      navigate("/m/payment");
      return;
    }
    if (plan === "BASIC" && aiUsed >= 20) {
      navigate("/m/payment");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream; // expose to analyser
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current.mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        liveStreamRef.current = null;
      };
      mediaRecorderRef.current.start();
      setRecording(true);
      setResult(null);
      setRecordingTime(0);
      setError(null);
      timerRef.current = setInterval(
        () => setRecordingTime((p) => p + 1),
        1000,
      );
    } catch {
      setError(t("micAccessDenied"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const ANALYZE_PHASES = [
    { label: "Đang tải âm thanh lên...", target: 15 },
    { label: "Nhận dạng giọng nói...", target: 35 },
    { label: "Phân tích ngữ điệu & nhịp điệu...", target: 55 },
    { label: "Phân tích chất lượng giọng...", target: 75 },
    { label: "Tổng hợp & chấm điểm...", target: 93 },
  ];

  const startAnalyzeProgress = () => {
    setAnalyzeProgress(0);
    setAnalyzePhase(ANALYZE_PHASES[0].label);
    let phaseIdx = 0;
    let current = 0;
    analyzeTimerRef.current = setInterval(() => {
      const phase = ANALYZE_PHASES[phaseIdx];
      if (current < phase.target) {
        current = Math.min(current + (Math.random() * 1.2 + 0.4), phase.target);
        setAnalyzeProgress(Math.round(current));
      } else if (phaseIdx < ANALYZE_PHASES.length - 1) {
        phaseIdx++;
        setAnalyzePhase(ANALYZE_PHASES[phaseIdx].label);
      }
    }, 200);
  };

  const stopAnalyzeProgress = (success) => {
    if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
    if (success) {
      setAnalyzePhase("Hoàn tất!");
      setAnalyzeProgress(100);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setAnalyzing(true);
    setError(null);
    startAnalyzeProgress();
    try {
      const data = await analyzePractice(id, user.id, audioBlob);
      setResult({
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
        // Phase 1 extended
        cer_rate: data.cer_rate ?? 0,
        wer_rate: data.wer_rate ?? 0,
        // Phase 2+3 extended
        spectral_features: data.spectral_features ?? null,
        pitch_contour: data.pitch_contour ?? null,
        filler_words: data.filler_words ?? null,
        voice_quality: data.voice_quality ?? null,
        emotion_breakdown: data.emotion_breakdown ?? null,
        status: "success",
      });
      stopAnalyzeProgress(true);
      await Promise.all([fetchHistory(), refreshUser()]);
    } catch (err) {
      stopAnalyzeProgress(false);
      if (
        err.response?.status === 402 ||
        err.response?.data?.code === "ERR_4005"
      ) {
        navigate("/m/payment");
      }
      setError("AI Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const resetPractice = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setRecordingTime(0);
  };

  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      cameraStream?.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setCameraOn(false);
    } else {
      try {
        const vs = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 360 },
        });
        setCameraStream(vs);
        setCameraOn(true);
      } catch {
        setError("Không thể bật camera. Kiểm tra quyền truy cập.");
      }
    }
  }, [cameraOn, cameraStream]);

  // Attach camera stream to video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Cleanup camera on unmount
  useEffect(
    () => () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    },
    [cameraStream],
  );

  // Derived metrics
  const scriptMarkdown = useMemo(
    () =>
      lesson?.content
        ?.replace(/^\[(.+?)\]\s*$/gm, "## $1")
        .replace(/\n{3,}/g, "\n\n") || "",
    [lesson],
  );
  const accuracy = useMemo(() => clampMetric(result?.accuracy_score), [result]);
  const energy = useMemo(() => clampMetric(result?.rhythm_score), [result]);
  const pace = useMemo(() => Number(result?.speaking_rate_wpm || 0), [result]);
  const pacePercent = useMemo(() => clampMetric((pace / 180) * 100), [pace]);

  const feedbackItems = useMemo(() => {
    const fb =
      evalLanguage === "vi" ? result?.feedback_vi : result?.feedback_en;
    if (!fb) return [];
    return fb
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [result, evalLanguage]);

  const expertTips = useMemo(() => {
    const tips = evalLanguage === "vi" ? result?.tips_vi : result?.tips_en;
    return Array.isArray(tips) ? tips : [];
  }, [result, evalLanguage]);

  const markdownReport = useMemo(
    () => (evalLanguage === "vi" ? result?.report_vi : result?.report_en),
    [result, evalLanguage],
  );

  const scriptWordCount = useMemo(
    () => lesson?.content?.trim().split(/\s+/).length || 0,
    [lesson],
  );
  const spokenWordCount = useMemo(
    () => result?.text_spoken?.trim().split(/\s+/).length || 0,
    [result],
  );
  const completionPercent = useMemo(
    () => clampMetric((spokenWordCount / scriptWordCount) * 100),
    [scriptWordCount, spokenWordCount],
  );
  const overallScore = useMemo(
    () => clampMetric(accuracy * 0.45 + energy * 0.35 + pacePercent * 0.2),
    [accuracy, energy, pacePercent],
  );

  const overallLevel = useMemo(() => {
    if (overallScore >= 85)
      return { label: "Excellent", color: "text-emerald-400" };
    if (overallScore >= 70) return { label: "Good", color: "text-cyan-400" };
    if (overallScore >= 55)
      return { label: "Developing", color: "text-amber-400" };
    return { label: "Needs Work", color: "text-orange-400" };
  }, [overallScore]);

  const paceInsight = useMemo(() => {
    if (!pace)
      return { text: "Pace data not available.", color: "text-zinc-500" };
    if (pace < 115)
      return {
        text: "Slow pace. Increase tempo slightly.",
        color: "text-amber-400",
      };
    if (pace <= 165)
      return {
        text: "Balanced pace. Suitable for MC contexts.",
        color: "text-emerald-400",
      };
    return {
      text: "Fast pace. Add pauses for clarity.",
      color: "text-orange-400",
    };
  }, [pace]);

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center bg-[#09090b]">
        <Loader2 className="animate-spin text-[#f5a623]" size={28} />
      </div>
    );

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col pt-20 min-h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Usage warning strip — shown at >= 80% usage */}
        {(() => {
          const plan = user?.plan || "FREE";
          const aiUsed = user?.aiSessionsUsed ?? 0;
          const aiLimit = plan === "FREE" ? 5 : plan === "BASIC" ? 20 : null;
          const usagePct = aiLimit ? (aiUsed / aiLimit) * 100 : 0;
          if (aiLimit && usagePct >= 80) {
            return (
              <UpgradeBanner
                variant="strip"
                plan={plan}
                used={aiUsed}
                limit={aiLimit}
              />
            );
          }
          return null;
        })()}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar — only when inside milestone */}
          {mId && (
            <aside className="hidden xl:flex w-72 border-r border-white/[0.07] bg-[#111113] flex-col sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden">
              <div className="p-5 border-b border-white/[0.07]">
                <button
                  onClick={() => navigate(`/m/learning/milestone/${mId}`)}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[12px] mb-4"
                >
                  <ArrowLeft size={13} /> {t_vp("roadmap")}
                </button>
                <h2 className="text-[14px] font-semibold text-white line-clamp-2">
                  {t("learning.progress")}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {/* curriculum items rendered here if mId active */}
              </div>
            </aside>
          )}

          <div
            className="flex-1 p-4 lg:p-6 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#27272a transparent",
            }}
          >
            {/* Page header */}
            <Breadcrumb items={
              courseId ? [
                { label: 'Khóa học', href: '/m/courses' },
                { label: course?.title || 'Chi tiết khóa học', href: `/m/courses/${courseId}` },
                { label: lesson?.title || 'Bài luyện tập' }
              ] : [
                { label: 'Luyện tập', href: '/m/voice/library' },
                { label: lesson?.title || 'Bài luyện tập' }
              ]
            } />
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between pb-5 border-b border-white/[0.07]">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {lesson?.title}
                </h1>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  {lesson?.category} · {lesson?.difficulty}{" "}
                  {t("common.level") || "Level"}
                </p>
                {(() => {
                  if (!history.length) return null;
                  const best = Math.max(
                    ...history.map((h) =>
                      clampMetric(
                        Number(h.accuracyScore || 0) * 0.45 +
                          Number(h.rhythmScore || 0) * 0.35 +
                          (Math.min(Number(h.speakingRateWpm || 0), 180) /
                            180) *
                            20,
                      ),
                    ),
                  );
                  return (
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
                      <Award size={10} /> Best: {best.toFixed(1)}%
                    </span>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Language toggle */}
                <div className="flex items-center rounded-lg bg-[#111113] border border-white/[0.07] p-0.5">
                  {["vi", "en"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => i18nInstance.changeLanguage(lang)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${evalLanguage === lang ? "bg-[#f5a623] text-black" : "text-zinc-400 hover:text-white"}`}
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
                    <Zap size={14} /> {t_vp("analyzeNow")}
                  </button>
                )}
                {audioBlob && (
                  <button
                    onClick={resetPractice}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.1] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.05] transition-colors"
                  >
                    <RefreshCw size={13} /> {t_vp("reRecord")}
                  </button>
                )}
                {recording ? (
                  <button
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors"
                  >
                    <Square size={13} /> {t_vp("stop")}
                  </button>
                ) : !audioBlob ? (
                  <button
                    onClick={startRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
                  >
                    <Play size={13} /> {t_vp("startRecording")}
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

            {/* Lesson info panel */}
            {lesson && (
              <div className="mb-5 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail / Video */}
                  {(lesson.thumbnailUrl || lesson.videoUrl) && (
                    <div className="lg:w-72 shrink-0">
                      {lesson.videoUrl ? (
                        <div className="relative w-full aspect-video bg-black">
                          <video
                            src={lesson.videoUrl}
                            controls
                            poster={lesson.thumbnailUrl || undefined}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-[#f5a623] border border-[#f5a623]/30">
                            <Video size={10} /> Video mẫu
                          </span>
                        </div>
                      ) : lesson.thumbnailUrl ? (
                        <img
                          src={lesson.thumbnailUrl}
                          alt={lesson.title}
                          className="w-full h-full object-cover aspect-video lg:aspect-auto lg:h-full"
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 p-5 space-y-4">
                    {/* Description */}
                    {lesson.description && (
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                          <FileText size={12} /> Mô tả bài học
                        </p>
                        <p className="text-[14px] text-zinc-300 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      {/* Target WPM */}
                      {(lesson.targetWpmMin || lesson.targetWpmMax) && (
                        <div className="flex items-start gap-2">
                          <Target
                            size={14}
                            className="text-[#f5a623] mt-0.5 shrink-0"
                          />
                          <div>
                            <p className="text-[11px] text-zinc-600 uppercase tracking-wider">
                              Tốc độ mục tiêu
                            </p>
                            <p className="text-[14px] font-semibold text-white">
                              {lesson.targetWpmMin}–{lesson.targetWpmMax}{" "}
                              <span className="text-zinc-500 font-normal text-[12px]">
                                wpm
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Passing score */}
                      {lesson.passingScore > 0 && (
                        <div className="flex items-start gap-2">
                          <Award
                            size={14}
                            className="text-emerald-400 mt-0.5 shrink-0"
                          />
                          <div>
                            <p className="text-[11px] text-zinc-600 uppercase tracking-wider">
                              Điểm qua bài
                            </p>
                            <p className="text-[14px] font-semibold text-white">
                              {lesson.passingScore}
                              <span className="text-zinc-500 font-normal text-[12px]">
                                %
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Evaluation criteria */}
                    {lesson.evaluationCriteria?.length > 0 && (
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                          <ListChecks size={12} /> Tiêu chí đánh giá
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {lesson.evaluationCriteria.map((c, i) => (
                            <div key={i} className="group relative">
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:border-[#f5a623]/30 transition-colors cursor-default">
                                <span className="text-[12px] font-medium text-zinc-300">
                                  {c.aspect}
                                </span>
                                <span className="text-[11px] text-[#f5a623] font-semibold">
                                  {c.weight}%
                                </span>
                              </div>
                              {c.description && (
                                <div className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-56 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                                  <span className="font-semibold text-white">
                                    {c.aspect} ({c.weight}%)
                                  </span>
                                  <br />
                                  {c.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evaluation hint */}
                    {lesson.evaluationHint && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#f5a623]/[0.05] border border-[#f5a623]/15">
                        <Info
                          size={13}
                          className="text-[#f5a623] mt-0.5 shrink-0"
                        />
                        <p className="text-[12px] text-zinc-400 leading-relaxed">
                          {lesson.evaluationHint}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resizable 2-col */}
            <div ref={containerRef} className="flex gap-1 relative">
              {/* ── LEFT: Script + Recording + History ── */}
              <div
                style={{ width: result ? `${leftWidth}%` : "100%" }}
                className="space-y-4 min-w-[28%]"
              >
                {/* Split: script left + recording right — always shown before result */}
                {!result && lesson && (
                  <div className="flex gap-4 items-stretch min-h-[480px]">
                    {/* Script — left half */}
                    <div className="flex-1 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden flex flex-col">
                      <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-2">
                        <BookOpen size={13} className="text-zinc-500" />
                        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Kịch bản luyện tập</span>
                      </div>
                      <div
                        className="flex-1 overflow-y-auto px-8 py-6"
                        style={{ background: '#faf8f3', fontFamily: 'Georgia, serif', fontSize: '22px', color: '#292524', lineHeight: 1.8, textAlign: 'center' }}
                      >
                        {lesson.content ? lesson.content.split('\n').map((line, i) => {
                          const h = line.match(/^#{1,3}\s+(.+)$/);
                          if (h) return <p key={i} style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#78716c', margin: '1.5rem 0 0.5rem' }}>{h[1]}</p>;
                          if (!line.trim()) return <br key={i} />;
                          // bold **text**
                          const parts = line.split(/\*\*(.+?)\*\*/g);
                          return <p key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
                        }) : <p className="text-zinc-400 text-[14px]">Không có kịch bản</p>}
                      </div>
                    </div>
                    {/* Recording area — right half, always */}
                    <div className="flex-1 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
                <div className="rounded-2xl border-0 overflow-hidden h-full flex flex-col">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-zinc-700"}`}
                      />
                      <span className="text-[12px] text-zinc-500 font-medium">
                        {recording
                          ? t_vp("recordingInProgress")
                          : analyzing
                            ? t_vp("analyzingVoice")
                            : t_vp("readyToRecord")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(recording || recordingTime > 0) && (
                        <span className="text-[12px] font-mono text-zinc-400">
                          {formatTime(recordingTime)}
                        </span>
                      )}
                      {/* Camera toggle */}
                      <button
                        onClick={toggleCamera}
                        title={
                          cameraOn ? "Tắt camera" : "Bật camera (MC Mirror)"
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                          cameraOn
                            ? "bg-[#f5a623]/10 border-[#f5a623]/30 text-[#f5a623]"
                            : "border-white/[0.07] text-zinc-600 hover:text-zinc-300 hover:border-white/[0.14]"
                        }`}
                      >
                        {cameraOn ? (
                          <Camera size={12} />
                        ) : (
                          <CameraOff size={12} />
                        )}
                        <span className="hidden sm:inline">
                          {cameraOn ? "Camera bật" : "Camera"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Camera PiP — fixed bottom-right corner */}
                  <AnimatePresence>
                    {cameraOn && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed z-50 overflow-hidden"
                        style={{
                          bottom: "1.5rem",
                          right: "1.5rem",
                          width: "220px",
                          aspectRatio: "4/3",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                          background: "#000",
                        }}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                          style={{ transform: "scaleX(-1)" }}
                        />
                        {/* Vignette */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)",
                          }}
                        />
                        {/* Status badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              recording
                                ? "bg-red-500/20 border-red-500/40 text-red-400"
                                : "bg-black/60 border-white/10 text-zinc-400"
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`}
                            />
                            {recording ? "REC" : "CAM"}
                          </span>
                          {recording && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 border border-white/10 text-zinc-300">
                              {formatTime(recordingTime)}
                            </span>
                          )}
                        </div>
                        {/* MC Live badge */}
                        <div className="absolute top-2 right-2">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623]">
                            🎙 Live
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mic area */}
                  <div
                    className={`flex-1 flex flex-col items-center justify-center py-8 transition-all duration-500 ${
                      recording
                        ? "bg-[#0d0d0f] shadow-[inset_0_0_80px_rgba(239,68,68,0.06)] ring-1 ring-inset ring-red-500/10"
                        : analyzing
                          ? "bg-[#0d0d0f] shadow-[inset_0_0_60px_rgba(245,166,35,0.04)] ring-1 ring-inset ring-amber-500/10"
                          : "bg-[#0d0d0f]"
                    }`}
                  >
                    {/* Recording gold border glow on outer container — handled via parent class */}

                    {/* Animated mic ring */}
                    <div className="relative flex items-center justify-center mb-4">
                      {/* VU ring — volume-responsive */}
                      {recording && (
                        <svg
                          className="absolute"
                          width="96"
                          height="96"
                          viewBox="0 0 96 96"
                          style={{ transform: "rotate(-90deg)" }}
                        >
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44}`}
                            strokeDashoffset={`${2 * Math.PI * 44 * (1 - volumeLevel / 100)}`}
                            stroke={
                              volumeLevel > 85
                                ? "#ef4444"
                                : volumeLevel > 60
                                  ? "#f5a623"
                                  : volumeLevel > 15
                                    ? "#10b981"
                                    : "#f59e0b"
                            }
                            style={{
                              transition:
                                "stroke-dashoffset 0.08s linear, stroke 0.2s",
                            }}
                          />
                        </svg>
                      )}
                      {/* Expanding rings when recording */}
                      {recording &&
                        [0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="absolute rounded-full border border-red-500/20"
                            style={{
                              width: `${88 + i * 28}px`,
                              height: `${88 + i * 28}px`,
                              animation: `ping-slow 1.8s ease-out infinite`,
                              animationDelay: `${i * 0.45}s`,
                              opacity: 0,
                            }}
                          />
                        ))}
                      {analyzing &&
                        [0, 1].map((i) => (
                          <span
                            key={i}
                            className="absolute rounded-full border border-[#f5a623]/20"
                            style={{
                              width: `${72 + i * 24}px`,
                              height: `${72 + i * 24}px`,
                              animation: `ping-slow 1.2s ease-out infinite`,
                              animationDelay: `${i * 0.3}s`,
                              opacity: 0,
                            }}
                          />
                        ))}
                      <div
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                          recording
                            ? "bg-red-500/20 border-2 border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
                            : analyzing
                              ? "bg-[#f5a623]/10 border-2 border-[#f5a623]/40 shadow-[0_0_20px_rgba(245,166,35,0.15)]"
                              : audioBlob
                                ? "bg-emerald-500/10 border-2 border-emerald-500/30"
                                : "bg-[#f5a623]/[0.06] border border-[#f5a623]/15"
                        }`}
                      >
                        {analyzing ? (
                          <AudioLines
                            size={26}
                            className="text-[#f5a623] animate-pulse"
                          />
                        ) : (
                          <Mic
                            size={26}
                            className={
                              recording
                                ? "text-red-400"
                                : audioBlob
                                  ? "text-emerald-400"
                                  : "text-[#f5a623]"
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Real-time waveform bars from mic */}
                    <div className="flex items-end justify-center gap-[2px] h-10 mb-3 px-4 w-full max-w-[280px]">
                      {(recording
                        ? bars
                        : analyzing
                          ? bars.map(() => Math.random() * 30 + 5)
                          : EMPTY_BARS
                      ).map((val, i) => {
                        const h = recording
                          ? Math.max(2, Math.round(val * 0.36)) // 0–36px from live data
                          : analyzing
                            ? Math.max(2, Math.round(val * 0.3))
                            : 2;
                        const color = recording
                          ? audioStatus === "too_loud"
                            ? `rgba(239,68,68,${0.4 + (val / 100) * 0.6})`
                            : `rgba(245,166,35,${0.3 + (val / 100) * 0.7})`
                          : analyzing
                            ? `rgba(245,166,35,${0.2 + (val / 100) * 0.5})`
                            : "rgba(63,63,70,0.3)";
                        return (
                          <div
                            key={i}
                            className="rounded-full shrink-0"
                            style={{
                              width: "3px",
                              height: `${h}px`,
                              background: color,
                              transition: recording
                                ? "height 0.05s linear"
                                : "height 0.3s ease",
                            }}
                          />
                        );
                      })}
                    </div>

                    <p className="text-[13px] font-semibold text-white mb-1">
                      {t_vp("voiceAnalysis")}
                    </p>
                    <p className="text-[11px] text-zinc-500 mb-3">
                      {recording
                        ? t_vp("recordingInProgress")
                        : analyzing
                          ? t_vp("analyzingVoice")
                          : t_vp("readScript")}
                    </p>

                    {/* Big action buttons — Stop (recording) / Analyze+ReRecord (audioBlob) */}
                    <AnimatePresence mode="wait">
                      {recording && (
                        <motion.div
                          key="big-stop"
                          initial={{ opacity: 0, scale: 0.88, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.88, y: 10 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="mt-2 mb-1 flex items-center gap-3"
                        >
                          <motion.button
                            onClick={stopRecording}
                            animate={{
                              boxShadow: [
                                "0 0 12px rgba(239,68,68,0.3)",
                                "0 0 32px rgba(239,68,68,0.6)",
                                "0 0 12px rgba(239,68,68,0.3)",
                              ],
                            }}
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-red-500 text-white text-[15px] font-bold"
                            style={{
                              fontFamily: "'Be Vietnam Pro', sans-serif",
                            }}
                          >
                            <Square size={18} /> {t_vp("stop")}
                          </motion.button>
                        </motion.div>
                      )}
                      {audioBlob && !analyzing && !result && (
                        <motion.div
                          key="big-analyze"
                          initial={{ opacity: 0, scale: 0.88, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.88, y: 10 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="mt-2 mb-1 flex items-center gap-3"
                        >
                          <motion.button
                            onClick={handleAnalyze}
                            animate={{
                              boxShadow: [
                                "0 0 12px rgba(245,166,35,0.25)",
                                "0 0 36px rgba(245,166,35,0.55)",
                                "0 0 12px rgba(245,166,35,0.25)",
                              ],
                            }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gold text-black text-[15px] font-bold"
                            style={{
                              fontFamily: "'Be Vietnam Pro', sans-serif",
                            }}
                          >
                            <Zap size={18} /> {t_vp("analyzeNow")}
                          </motion.button>
                          <motion.button
                            onClick={resetPractice}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-white/12 text-zinc-300 text-[14px] font-semibold hover:bg-white/6 transition-colors"
                            style={{
                              fontFamily: "'Be Vietnam Pro', sans-serif",
                            }}
                          >
                            <RefreshCw size={15} /> {t_vp("reRecord")}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Big start button — only when idle */}
                    <AnimatePresence>
                      {!recording && !audioBlob && !analyzing && (
                        <motion.button
                          key="big-start"
                          onClick={startRecording}
                          initial={{ opacity: 0, scale: 0.88, y: 10 }}
                          animate={{
                            opacity: 1,
                            scale: [1, 1.03, 1],
                            boxShadow: [
                              "0 0 16px rgba(245,166,35,0.25)",
                              "0 0 40px rgba(245,166,35,0.55)",
                              "0 0 16px rgba(245,166,35,0.25)",
                            ],
                          }}
                          exit={{ opacity: 0, scale: 0.88, y: 10 }}
                          transition={{
                            opacity: { duration: 0.35 },
                            scale: {
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                            boxShadow: {
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }}
                          whileHover={{
                            scale: 1.06,
                            boxShadow: "0 0 48px rgba(245,166,35,0.65)",
                          }}
                          whileTap={{ scale: 0.96 }}
                          className="relative mt-2 mb-1 flex items-center gap-3 px-12 py-4 rounded-2xl bg-[#f5a623] text-black text-[15px] font-bold tracking-tight overflow-hidden"
                          style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                        >
                          {/* Pulse ring x2 */}
                          {[0, 1].map((i) => (
                            <motion.span
                              key={i}
                              className="absolute inset-0 rounded-2xl border-2 border-gold"
                              animate={{ scale: [1, 1.18], opacity: [0.5, 0] }}
                              transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: i * 0.8,
                              }}
                            />
                          ))}
                          <motion.span
                            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                            transition={{
                              duration: 2.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5,
                            }}
                          >
                            <Mic size={20} />
                          </motion.span>
                          {t_vp("startRecording")}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Audio quality feedback — only during recording */}
                    <AnimatePresence>
                      {recording && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.25 }}
                          className="w-full max-w-[280px] px-4"
                        >
                          {audioStatus === "too_quiet" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-400 text-[11px]">
                              <Volume1 size={13} className="shrink-0" />
                              <span>Âm lượng quá nhỏ — hãy nói to hơn</span>
                            </div>
                          )}
                          {audioStatus === "too_loud" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[11px]">
                              <Volume2 size={13} className="shrink-0" />
                              <span>Âm lượng quá lớn — ra xa mic hơn</span>
                            </div>
                          )}
                          {audioStatus === "noisy" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-[11px]">
                              <AlertTriangle size={13} className="shrink-0" />
                              <span>
                                Phát hiện tiếng ồn — đến nơi yên tĩnh hơn
                              </span>
                            </div>
                          )}
                          {audioStatus === "good" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px]">
                              <CheckCircle2 size={13} className="shrink-0" />
                              <span>Âm lượng tốt — {volumeLevel}%</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {audioBlob && !analyzing && !result && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.25 }}
                          className="w-full max-w-[280px] mt-2 px-4"
                        >
                          <p className="text-[10px] text-zinc-600 mb-1.5 text-center uppercase tracking-wider">
                            Nghe lại trước khi gửi AI
                          </p>
                          <audio
                            controls
                            src={audioUrl}
                            className="w-full h-8"
                            style={{
                              filter:
                                "invert(1) hue-rotate(180deg) brightness(0.8)",
                              borderRadius: "6px",
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CSS keyframes */}
                  <style>{`
                                    @keyframes ping-slow {
                                        0%   { transform: scale(1); opacity: 0.45; }
                                        100% { transform: scale(1.5); opacity: 0; }
                                    }
                                `}</style>

                  {/* Script toolbar + Script — hidden in split mode, shown only after result */}
                  {result && <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.07] bg-[#0d0d0f] gap-2 flex-wrap">
                    {/* Font size */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setScriptFontSize((s) => Math.max(16, s - 2))
                        }
                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-[11px] text-zinc-500 w-8 text-center font-mono">
                        {scriptFontSize}px
                      </span>
                      <button
                        onClick={() =>
                          setScriptFontSize((s) => Math.min(48, s + 2))
                        }
                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Alignment */}
                    <div className="flex items-center gap-0.5 bg-[#111113] border border-white/[0.07] rounded-lg p-0.5">
                      {[
                        ["left", AlignLeft],
                        ["center", AlignCenter],
                        ["right", AlignRight],
                      ].map(([v, Icon]) => (
                        <button
                          key={v}
                          onClick={() => setScriptAlign(v)}
                          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${scriptAlign === v ? "bg-gold/20 text-gold" : "text-zinc-500 hover:text-white"}`}
                        >
                          <Icon size={12} />
                        </button>
                      ))}
                    </div>

                    {/* Font family */}
                    <div className="flex items-center gap-0.5 bg-[#111113] border border-white/[0.07] rounded-lg p-0.5">
                      {[
                        ["serif", "S"],
                        ["sans", "A"],
                        ["mono", "M"],
                      ].map(([v, label]) => (
                        <button
                          key={v}
                          onClick={() => setScriptFont(v)}
                          className={`px-2 h-6 text-[11px] font-medium rounded transition-colors ${scriptFont === v ? "bg-gold/20 text-gold" : "text-zinc-500 hover:text-white"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Background */}
                    <div className="flex items-center gap-1">
                      {[
                        { v: "cream", bg: "#faf8f3", ring: "ring-amber-400" },
                        { v: "white", bg: "#ffffff", ring: "ring-zinc-300" },
                        { v: "sepia", bg: "#f5ecd7", ring: "ring-amber-600" },
                        { v: "dark", bg: "#1a1a1e", ring: "ring-zinc-600" },
                      ].map(({ v, bg, ring }) => (
                        <button
                          key={v}
                          onClick={() => setScriptBg(v)}
                          style={{ background: bg }}
                          className={`w-5 h-5 rounded-full border border-white/20 transition-all ${scriptBg === v ? `ring-2 ring-offset-1 ring-offset-[#0d0d0f] ${ring}` : ""}`}
                        />
                      ))}
                    </div>

                    {/* Teleprompter */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {teleprompter && (
                        <div className="flex items-center gap-1">
                          <Gauge size={11} className="text-zinc-600" />
                          <button
                            onClick={() =>
                              setTeleprompterWpm((w) => Math.max(60, w - 10))
                            }
                            className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-[11px] text-zinc-500 w-10 text-center font-mono">
                            {teleprompterWpm}
                          </span>
                          <button
                            onClick={() =>
                              setTeleprompterWpm((w) => Math.min(250, w + 10))
                            }
                            className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white hover:bg-white/[0.07] transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => {
                              if (teleprompterRunning) {
                                setTeleprompterRunning(false);
                              } else {
                                if (scriptScrollRef.current)
                                  scriptScrollRef.current.scrollTop = 0;
                                setTeleprompterRunning(true);
                              }
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${teleprompterRunning ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"}`}
                          >
                            {teleprompterRunning ? (
                              <>
                                <Square size={10} /> Dừng
                              </>
                            ) : (
                              <>
                                <Play size={10} /> Chạy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setTeleprompter((t) => !t);
                          setTeleprompterRunning(false);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${teleprompter ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "text-zinc-500 border-white/[0.07] hover:text-white hover:border-white/20"}`}
                      >
                        <Gauge size={11} /> Teleprompter
                      </button>
                    </div>
                  </div>}

                  {/* Script — hidden in split mode */}
                  {result ? (() => {
                    const bgMap = {
                      cream: "#faf8f3",
                      white: "#ffffff",
                      sepia: "#f5ecd7",
                      dark: "#1a1a1e",
                    };
                    const textMap = {
                      cream: "#292524",
                      white: "#1c1917",
                      sepia: "#44321a",
                      dark: "#e4e4e7",
                    };
                    const subTextMap = {
                      cream: "#78716c",
                      white: "#71717a",
                      sepia: "#92400e",
                      dark: "#71717a",
                    };
                    const fontMap = {
                      serif: 'Georgia, "Times New Roman", serif',
                      sans: "Inter, system-ui, sans-serif",
                      mono: '"Courier New", Courier, monospace',
                    };
                    const bg = bgMap[scriptBg];
                    const textColor = textMap[scriptBg];
                    const subColor = subTextMap[scriptBg];

                    const HIGHLIGHT_COLORS = [
                      {
                        id: "yellow",
                        bg: "rgba(253,224,71,0.45)",
                        border: "#fde047",
                      },
                      {
                        id: "green",
                        bg: "rgba(134,239,172,0.40)",
                        border: "#86efac",
                      },
                      {
                        id: "blue",
                        bg: "rgba(147,197,253,0.40)",
                        border: "#93c5fd",
                      },
                      {
                        id: "pink",
                        bg: "rgba(249,168,212,0.40)",
                        border: "#f9a8d4",
                      },
                      {
                        id: "orange",
                        bg: "rgba(253,186,116,0.40)",
                        border: "#fdba74",
                      },
                    ];

                    // Build plain text from lesson content (strip markdown heading markers)
                    const plainScript =
                      lesson?.content?.replace(
                        /^\[(.+?)\]\s*$/gm,
                        "\n[$1]\n",
                      ) || "";

                    // Handle mouseup — detect selection
                    const handleScriptMouseUp = (e) => {
                      if (annotationPopupRef.current?.contains(e.target))
                        return;
                      const sel = window.getSelection();
                      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
                        if (!annotationPopupRef.current?.contains(e.target))
                          setAnnotationPopup(null);
                        return;
                      }
                      const range = sel.getRangeAt(0);
                      const container = scriptScrollRef.current;
                      if (
                        !container ||
                        !container.contains(range.commonAncestorContainer)
                      )
                        return;

                      // Calculate offsets relative to plain text
                      const selectedText = sel.toString().trim();
                      if (selectedText.length < 2) return;

                      // Find start offset in plainScript
                      const startOffset = plainScript.indexOf(selectedText);
                      if (startOffset === -1) return;
                      const endOffset = startOffset + selectedText.length;

                      const rect = range.getBoundingClientRect();
                      const containerRect = container.getBoundingClientRect();
                      setAnnotationPopup({
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top - 8,
                        selectedText,
                        startOffset,
                        endOffset,
                      });
                      setShowNoteInput(false);
                      setNoteInput("");
                    };

                    const addAnnotation = (type, color) => {
                      if (!annotationPopup) return;
                      const id = Date.now().toString();
                      setAnnotations((prev) => [
                        ...prev,
                        {
                          id,
                          startOffset: annotationPopup.startOffset,
                          endOffset: annotationPopup.endOffset,
                          text: annotationPopup.selectedText,
                          type,
                          color: color || "yellow",
                          note: type === "note" ? noteInput : "",
                        },
                      ]);
                      setAnnotationPopup(null);
                      setNoteInput("");
                      setShowNoteInput(false);
                      window.getSelection()?.removeAllRanges();
                    };

                    const removeAnnotation = (id) => {
                      setAnnotations((prev) => prev.filter((a) => a.id !== id));
                    };

                    // Parse inline markdown: **bold**, *italic*, `code`, ~~strike~~
                    const renderInlineMarkdown = (text, baseStyle = {}) => {
                      const parts = [];
                      // Combined regex: **bold**, *italic*, `code`, ~~strike~~
                      const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
                      let last = 0,
                        m;
                      while ((m = re.exec(text)) !== null) {
                        if (m.index > last)
                          parts.push(
                            <span key={last}>{text.slice(last, m.index)}</span>,
                          );
                        if (m[0].startsWith("**"))
                          parts.push(
                            <strong
                              key={m.index}
                              style={{ fontWeight: 700, color: "inherit" }}
                            >
                              {m[2]}
                            </strong>,
                          );
                        else if (m[0].startsWith("*"))
                          parts.push(
                            <em key={m.index} style={{ fontStyle: "italic" }}>
                              {m[3]}
                            </em>,
                          );
                        else if (m[0].startsWith("`"))
                          parts.push(
                            <code
                              key={m.index}
                              style={{
                                fontFamily: "monospace",
                                background: "rgba(245,166,35,0.12)",
                                padding: "0 3px",
                                borderRadius: 3,
                              }}
                            >
                              {m[4]}
                            </code>,
                          );
                        else if (m[0].startsWith("~~"))
                          parts.push(<s key={m.index}>{m[5]}</s>);
                        last = m.index + m[0].length;
                      }
                      if (last < text.length)
                        parts.push(<span key={last}>{text.slice(last)}</span>);
                      return parts.length ? parts : text;
                    };

                    // Render plain script text with annotation spans
                    // Split text into segments: normal | annotated
                    const renderAnnotatedScript = () => {
                      if (!plainScript) return null;
                      // Build sorted non-overlapping segments
                      const sorted = [...annotations].sort(
                        (a, b) => a.startOffset - b.startOffset,
                      );
                      const segments = [];
                      let cursor = 0;
                      for (const ann of sorted) {
                        if (ann.startOffset > cursor) {
                          segments.push({
                            type: "text",
                            content: plainScript.slice(cursor, ann.startOffset),
                          });
                        }
                        const start = Math.max(ann.startOffset, cursor);
                        const end = ann.endOffset;
                        if (start < end) {
                          segments.push({
                            type: "annotation",
                            ann,
                            content: plainScript.slice(start, end),
                          });
                          cursor = end;
                        }
                      }
                      if (cursor < plainScript.length) {
                        segments.push({
                          type: "text",
                          content: plainScript.slice(cursor),
                        });
                      }

                      return segments.map((seg, i) => {
                        if (seg.type === "text") {
                          return seg.content.split("\n").map((line, li) => {
                            // [Section] heading (legacy format)
                            const bracketHeading = line.match(/^\[(.+?)\]$/);
                            if (bracketHeading) {
                              return (
                                <React.Fragment key={`${i}-${li}`}>
                                  {li > 0 && <br />}
                                  <span
                                    style={{
                                      display: "block",
                                      textAlign: "center",
                                      fontSize: `${Math.round(scriptFontSize * 0.75)}px`,
                                      fontWeight: 700,
                                      letterSpacing: "0.05em",
                                      color: subColor,
                                      marginTop: "1.5rem",
                                    }}
                                  >
                                    {bracketHeading[1]}
                                  </span>
                                </React.Fragment>
                              );
                            }
                            // ### / ## / # markdown headings
                            const h3 = line.match(/^###\s+(.+)$/);
                            const h2 = line.match(/^##\s+(.+)$/);
                            const h1 = line.match(/^#\s+(.+)$/);
                            if (h3)
                              return (
                                <React.Fragment key={`${i}-${li}`}>
                                  {li > 0 && <br />}
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: `${Math.round(scriptFontSize * 0.8)}px`,
                                      fontWeight: 700,
                                      color: subColor,
                                      marginTop: "1rem",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    {renderInlineMarkdown(h3[1])}
                                  </span>
                                </React.Fragment>
                              );
                            if (h2)
                              return (
                                <React.Fragment key={`${i}-${li}`}>
                                  {li > 0 && <br />}
                                  <span
                                    style={{
                                      display: "block",
                                      textAlign: "center",
                                      fontSize: `${Math.round(scriptFontSize * 0.9)}px`,
                                      fontWeight: 700,
                                      color: subColor,
                                      marginTop: "1.5rem",
                                      letterSpacing: "0.04em",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {renderInlineMarkdown(h2[1])}
                                  </span>
                                </React.Fragment>
                              );
                            if (h1)
                              return (
                                <React.Fragment key={`${i}-${li}`}>
                                  {li > 0 && <br />}
                                  <span
                                    style={{
                                      display: "block",
                                      textAlign: "center",
                                      fontSize: `${Math.round(scriptFontSize * 1.1)}px`,
                                      fontWeight: 800,
                                      color: subColor,
                                      marginTop: "2rem",
                                      letterSpacing: "0.05em",
                                    }}
                                  >
                                    {renderInlineMarkdown(h1[1])}
                                  </span>
                                </React.Fragment>
                              );
                            // Horizontal rule
                            if (/^---+$/.test(line.trim()))
                              return (
                                <React.Fragment key={`${i}-${li}`}>
                                  {li > 0 && <br />}
                                  <hr
                                    style={{
                                      border: "none",
                                      borderTop: `1px solid ${subColor}40`,
                                      margin: "1rem 0",
                                      display: "block",
                                    }}
                                  />
                                </React.Fragment>
                              );
                            return (
                              <React.Fragment key={`${i}-${li}`}>
                                {li > 0 && <br />}
                                {renderInlineMarkdown(line)}
                              </React.Fragment>
                            );
                          });
                        }
                        // Annotation span
                        const { ann } = seg;
                        const hlColor =
                          HIGHLIGHT_COLORS.find((c) => c.id === ann.color) ||
                          HIGHLIGHT_COLORS[0];
                        return (
                          <span
                            key={`ann-${ann.id}`}
                            style={{
                              background: hlColor.bg,
                              borderBottom:
                                ann.type === "note"
                                  ? `2px solid ${hlColor.border}`
                                  : "none",
                              borderRadius: "2px",
                              padding: "0 1px",
                              cursor: ann.type === "note" ? "help" : "default",
                              position: "relative",
                            }}
                            onMouseEnter={() =>
                              ann.type === "note" &&
                              setHoveredAnnotation(ann.id)
                            }
                            onMouseLeave={() => setHoveredAnnotation(null)}
                          >
                            {renderInlineMarkdown(seg.content)}
                            {ann.type === "note" &&
                              hoveredAnnotation === ann.id && (
                                <span
                                  style={{
                                    position: "absolute",
                                    bottom: "100%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    marginBottom: "6px",
                                    background: "#1a1a1e",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: "10px",
                                    padding: "8px 10px",
                                    fontSize: "11px",
                                    color: "#d4d4d8",
                                    lineHeight: 1.5,
                                    whiteSpace: "pre-wrap",
                                    maxWidth: "220px",
                                    zIndex: 60,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                    pointerEvents: "none",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      color: hlColor.border,
                                      marginBottom: "3px",
                                    }}
                                  >
                                    📝 Ghi chú
                                  </span>
                                  {ann.note}
                                </span>
                              )}
                          </span>
                        );
                      });
                    };

                    // Check if popup selection overlaps existing annotation
                    const overlapsAnnotation = annotationPopup
                      ? annotations.some(
                          (a) =>
                            annotationPopup.startOffset < a.endOffset &&
                            annotationPopup.endOffset > a.startOffset,
                        )
                      : false;

                    return (
                      <div style={{ position: "relative" }}>
                        {/* Annotation popup */}
                        {annotationPopup && (
                          <div
                            ref={annotationPopupRef}
                            style={{
                              position: "absolute",
                              left: `${annotationPopup.x}px`,
                              top: `${annotationPopup.y}px`,
                              transform: "translate(-50%, -100%)",
                              zIndex: 100,
                              background: "#1a1a1e",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: "12px",
                              padding: "8px 10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                              minWidth: showNoteInput ? "220px" : "auto",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {/* Highlight swatches */}
                              {HIGHLIGHT_COLORS.map((c) => (
                                <button
                                  key={c.id}
                                  title={`Highlight ${c.id}`}
                                  onClick={() =>
                                    addAnnotation("highlight", c.id)
                                  }
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: c.bg,
                                    border: `2px solid ${c.border}`,
                                    cursor: "pointer",
                                    flexShrink: 0,
                                  }}
                                />
                              ))}
                              {/* Divider */}
                              <div
                                style={{
                                  width: 1,
                                  height: 16,
                                  background: "rgba(255,255,255,0.1)",
                                  margin: "0 2px",
                                }}
                              />
                              {/* Note button */}
                              <button
                                onClick={() => setShowNoteInput((v) => !v)}
                                title="Thêm ghi chú"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "2px 7px",
                                  borderRadius: "6px",
                                  background: showNoteInput
                                    ? "rgba(245,166,35,0.15)"
                                    : "rgba(255,255,255,0.06)",
                                  border: `1px solid ${showNoteInput ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.1)"}`,
                                  color: showNoteInput ? "#f5a623" : "#a1a1aa",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                📝 Ghi chú
                              </button>
                              {/* Clear if overlaps */}
                              {overlapsAnnotation && (
                                <button
                                  onClick={() => {
                                    const toRemove = annotations.filter(
                                      (a) =>
                                        annotationPopup.startOffset <
                                          a.endOffset &&
                                        annotationPopup.endOffset >
                                          a.startOffset,
                                    );
                                    toRemove.forEach((a) =>
                                      removeAnnotation(a.id),
                                    );
                                    setAnnotationPopup(null);
                                  }}
                                  title="Xóa highlight/ghi chú"
                                  style={{
                                    padding: "2px 7px",
                                    borderRadius: "6px",
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    color: "#f87171",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  ✕ Xóa
                                </button>
                              )}
                              {/* Dismiss */}
                              <button
                                onClick={() => {
                                  setAnnotationPopup(null);
                                  window.getSelection()?.removeAllRanges();
                                }}
                                style={{
                                  marginLeft: "auto",
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  background: "rgba(255,255,255,0.06)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#71717a",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ×
                              </button>
                            </div>
                            {/* Note input */}
                            {showNoteInput && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "5px",
                                }}
                              >
                                <textarea
                                  autoFocus
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  placeholder="Nhập ghi chú..."
                                  rows={3}
                                  style={{
                                    width: "100%",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    padding: "6px 8px",
                                    color: "#e4e4e7",
                                    fontSize: "12px",
                                    resize: "none",
                                    outline: "none",
                                    fontFamily: "inherit",
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      if (noteInput.trim())
                                        addAnnotation("note", "yellow");
                                    }
                                  }}
                                />
                                <div style={{ display: "flex", gap: "4px" }}>
                                  {HIGHLIGHT_COLORS.map((c) => (
                                    <button
                                      key={c.id}
                                      onClick={() =>
                                        addAnnotation("note", c.id)
                                      }
                                      style={{
                                        flex: 1,
                                        padding: "4px 0",
                                        borderRadius: "6px",
                                        background: c.bg,
                                        border: `1px solid ${c.border}`,
                                        color: "#292524",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {c.id[0].toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                                <p
                                  style={{ fontSize: "10px", color: "#52525b" }}
                                >
                                  Enter để lưu · Shift+Enter xuống dòng
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          ref={scriptScrollRef}
                          className="max-h-125 overflow-y-auto px-8 py-8 select-text"
                          style={{
                            background: bg,
                            scrollbarWidth: "thin",
                            position: "relative",
                          }}
                          onMouseUp={handleScriptMouseUp}
                          onClick={(e) => {
                            if (
                              !annotationPopupRef.current?.contains(e.target) &&
                              !e.target.closest("[data-annotation]")
                            ) {
                              const sel = window.getSelection();
                              if (!sel || sel.isCollapsed)
                                setAnnotationPopup(null);
                            }
                          }}
                        >
                          <h3
                            style={{
                              color: subColor,
                              textAlign: "center",
                              fontSize: "13px",
                              fontWeight: 600,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              marginBottom: "1.5rem",
                            }}
                          >
                            {t_vp("practiceScript")}
                          </h3>
                          <div
                            style={{
                              fontFamily: fontMap[scriptFont],
                              fontSize: `${scriptFontSize}px`,
                              color: textColor,
                              textAlign: scriptAlign,
                              lineHeight: 1.7,
                            }}
                          >
                            {renderAnnotatedScript()}
                          </div>
                          <p
                            style={{
                              marginTop: "1.5rem",
                              textAlign: "center",
                              fontSize: "14px",
                              fontStyle: "italic",
                              color: subColor,
                            }}
                          >
                            — {t("endOfScript")} —
                          </p>
                        </div>
                      </div>
                    );
                  })() : null}
                </div>
                    </div>
                  </div>
                )}

                {/* Past attempts */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[13px] font-semibold text-white">
                        {t_vp("pastAttempts")}
                        <span className="ml-2 text-[11px] text-zinc-600">
                          ({history.length})
                        </span>
                      </h3>
                      {history.length >= 2 &&
                        (() => {
                          const scores = [...history]
                            .reverse()
                            .slice(-8)
                            .map((h) =>
                              clampMetric(
                                Number(h.accuracyScore || 0) * 0.45 +
                                  Number(h.rhythmScore || 0) * 0.35 +
                                  (Math.min(
                                    Number(h.speakingRateWpm || 0),
                                    180,
                                  ) /
                                    180) *
                                    20,
                              ),
                            );
                          const min = Math.min(...scores),
                            max = Math.max(...scores);
                          const range = max - min || 1;
                          const W = 80,
                            H = 28,
                            pad = 3;
                          const pts = scores
                            .map((s, i) => {
                              const x =
                                pad + (i / (scores.length - 1)) * (W - pad * 2);
                              const y =
                                H - pad - ((s - min) / range) * (H - pad * 2);
                              return `${x},${y}`;
                            })
                            .join(" ");
                          const lastScore = scores[scores.length - 1];
                          const trend =
                            scores.length >= 2
                              ? lastScore - scores[scores.length - 2]
                              : 0;
                          return (
                            <div className="flex items-center gap-2">
                              <svg
                                width={W}
                                height={H}
                                className="overflow-visible"
                              >
                                <polyline
                                  points={pts}
                                  fill="none"
                                  stroke="rgba(245,166,35,0.4)"
                                  strokeWidth="1.5"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                />
                                {scores.map((s, i) => {
                                  const x =
                                    pad +
                                    (i / (scores.length - 1)) * (W - pad * 2);
                                  const y =
                                    H -
                                    pad -
                                    ((s - min) / range) * (H - pad * 2);
                                  return i === scores.length - 1 ? (
                                    <circle
                                      key={i}
                                      cx={x}
                                      cy={y}
                                      r="3"
                                      fill="#f5a623"
                                    />
                                  ) : (
                                    <circle
                                      key={i}
                                      cx={x}
                                      cy={y}
                                      r="1.5"
                                      fill="rgba(245,166,35,0.5)"
                                    />
                                  );
                                })}
                              </svg>
                              <span
                                className={`text-[11px] font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}
                              >
                                {trend >= 0 ? "↑" : "↓"}
                                {Math.abs(trend).toFixed(1)}%
                              </span>
                            </div>
                          );
                        })()}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <AnimatePresence mode="popLayout">
                        {history
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage,
                          )
                          .map((h, i) => (
                            <motion.div
                              key={h.id || i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              onClick={() =>
                                navigate(`/m/voice/report/${h.id}${courseId ? `?courseId=${courseId}` : ''}`)
                              }
                              className="cursor-pointer p-4 rounded-xl bg-[#111113] border border-white/[0.07] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02] transition-colors"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <p className="text-[11px] text-zinc-600">
                                  {(() => {
                                    const d = new Date(h.createdAt);
                                    return isNaN(d.getTime())
                                      ? t_vp("recentSession")
                                      : d.toLocaleString("vi-VN", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        });
                                  })()}
                                </p>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20">
                                  Done
                                </span>
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-[10px] text-zinc-600">
                                      {t("overallScore")}
                                    </span>
                                    <div className="relative group/tt cursor-help">
                                      <Info
                                        size={9}
                                        className="text-zinc-700"
                                      />
                                      <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                        Điểm tổng hợp = Clarity 45% + Energy 35%
                                        + Pace 20%
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-lg font-bold text-white">
                                    {clampMetric(
                                      Number(h.accuracyScore || 0) * 0.45 +
                                        Number(h.rhythmScore || 0) * 0.35 +
                                        (Math.min(
                                          Number(h.speakingRateWpm || 0),
                                          180,
                                        ) /
                                          180) *
                                          20,
                                    ).toFixed(1)}
                                    %
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-[10px] text-zinc-600">
                                      WPM
                                    </span>
                                    <div className="relative group/tt cursor-help">
                                      <Info
                                        size={9}
                                        className="text-zinc-700"
                                      />
                                      <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-right">
                                        Words Per Minute — tốc độ nói. MC chuyên
                                        nghiệp: 120-165 WPM.
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-lg font-bold text-[#f5a623]">
                                    {Math.round(h.speakingRateWpm || 0)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${h.accuracyScore || 0}%` }}
                                />
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${h.rhythmScore || 0}%` }}
                                />
                              </div>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>
                    {history.length > itemsPerPage && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-500 disabled:opacity-30 hover:text-white transition-colors"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[12px] text-zinc-600">
                          {currentPage}/
                          {Math.ceil(history.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(
                                Math.ceil(history.length / itemsPerPage),
                                p + 1,
                              ),
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(history.length / itemsPerPage)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#111113] border border-white/[0.07] text-zinc-500 disabled:opacity-30 hover:text-white transition-colors rotate-180"
                        >
                          <ChevronLeft size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── DIVIDER — only when result shown ── */}
              {result && (
                <div
                  onMouseDown={handleMouseDown}
                  className="group relative flex w-2 cursor-col-resize items-center justify-center mx-0.5"
                >
                  <div className="h-10 w-0.5 rounded-full bg-white/[0.08] group-hover:bg-[#f5a623]/40 transition-colors" />
                </div>
              )}

              {/* ── RIGHT: Metrics + AI Analysis — only after result ── */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: `${100 - leftWidth}%` }}
                    className="space-y-4 min-w-[25%]"
                  >
                    {/* Vocal dynamics */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[13px] font-semibold text-white">
                          {t("voicePractice.vocalDynamics")}
                        </h3>
                        <AudioLines size={15} className="text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        {[
                          {
                            label: t_vp("clarity"),
                            value: accuracy,
                            pct: accuracy,
                            accent: "#f5a623",
                            unit: "%",
                            desc: t_vp("clarityDesc"),
                          },
                          {
                            label: t_vp("energy"),
                            value: energy,
                            pct: energy,
                            accent: "#3b82f6",
                            unit: "%",
                            desc: t_vp("energyDesc"),
                          },
                          {
                            label: t_vp("pace"),
                            value: pace,
                            pct: pacePercent,
                            accent: "#10b981",
                            unit: " wpm",
                            desc: t_vp("paceDesc"),
                          },
                        ].map((m) => (
                          <div
                            key={m.label}
                            className="group/m flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
                          >
                            <span className="text-[12px] text-zinc-500 w-20 shrink-0">
                              {m.label}
                            </span>
                            <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: result ? `${m.pct}%` : "0%" }}
                                transition={{
                                  duration: 0.7,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                style={{ backgroundColor: m.accent }}
                              />
                            </div>
                            <span className="text-[12px] font-semibold text-white w-14 text-right tabular-nums shrink-0">
                              {result ? `${m.value.toFixed(0)}${m.unit}` : "—"}
                            </span>
                            {/* Tooltip */}
                            <div className="relative cursor-help shrink-0">
                              <Info
                                size={11}
                                className="text-zinc-700 group-hover/m:text-zinc-500 transition-colors"
                              />
                              <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-300 leading-relaxed opacity-0 group-hover/m:opacity-100 transition-opacity z-50 shadow-xl">
                                {m.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Voice Quality — Phase 2+3 metrics */}
                    {result &&
                      (result.voice_quality ||
                        result.spectral_features ||
                        result.filler_words ||
                        result.wer_rate > 0 ||
                        result.cer_rate > 0) && (
                        <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-semibold text-white">
                              Voice Quality
                            </h3>
                            <BarChart3 size={15} className="text-purple-400" />
                          </div>
                          <div className="space-y-3">
                            {result.voice_quality && (
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  {
                                    label: "Jitter",
                                    value: result.voice_quality.jitter_pct,
                                    unit: "%",
                                    good: (v) => v < 1.0,
                                    warn: (v) => v < 2.0,
                                    color: (v) =>
                                      v < 1.0
                                        ? "text-emerald-400"
                                        : v < 2.0
                                          ? "text-amber-400"
                                          : "text-red-400",
                                    tooltip:
                                      "Độ rung tần số cơ bản. < 1% = ổn định, 1-2% = chấp nhận được, > 2% = giọng run/không đều",
                                  },
                                  {
                                    label: "Shimmer",
                                    value: result.voice_quality.shimmer_pct,
                                    unit: "%",
                                    color: (v) =>
                                      v < 3.0
                                        ? "text-emerald-400"
                                        : v < 5.0
                                          ? "text-amber-400"
                                          : "text-red-400",
                                    tooltip:
                                      "Độ biến động biên độ. < 3% = tốt, 3-5% = bình thường, > 5% = giọng yếu hoặc mệt",
                                  },
                                  {
                                    label: "HNR",
                                    value: result.voice_quality.hnr_db,
                                    unit: "dB",
                                    color: (v) =>
                                      v >= 15
                                        ? "text-emerald-400"
                                        : v >= 10
                                          ? "text-amber-400"
                                          : "text-red-400",
                                    tooltip:
                                      "Tỷ lệ hài âm/tạp âm (Harmonics-to-Noise Ratio). ≥ 15dB = giọng trong, 10-15dB = chấp nhận được, < 10dB = nhiều tạp âm",
                                  },
                                ].map((m) => (
                                  <div
                                    key={m.label}
                                    className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05] text-center"
                                  >
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <span className="text-[10px] text-zinc-600">
                                        {m.label}
                                      </span>
                                      {m.tooltip && (
                                        <div className="relative group/tt cursor-help">
                                          <Info
                                            size={9}
                                            className="text-zinc-700"
                                          />
                                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">
                                            {m.tooltip}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <p
                                      className={`text-[15px] font-bold tabular-nums ${m.color(m.value)}`}
                                    >
                                      {(m.value ?? 0).toFixed(1)}
                                      <span className="text-[10px] text-zinc-600">
                                        {m.unit}
                                      </span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {result.spectral_features && (
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-[10px] text-zinc-600">
                                      Spectral Centroid
                                    </span>
                                    <div className="relative group/tt cursor-help">
                                      <Info
                                        size={9}
                                        className="text-zinc-700"
                                      />
                                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">
                                        Trọng tâm phổ tần số. Giá trị cao hơn =
                                        giọng sáng, rõ hơn. Lý tưởng cho MC: ≥
                                        1500 Hz.
                                      </div>
                                    </div>
                                  </div>
                                  <p
                                    className={`text-[14px] font-bold tabular-nums ${(result.spectral_features.spectral_centroid_hz ?? 0) < 1500 ? "text-amber-400" : "text-emerald-400"}`}
                                  >
                                    {Math.round(
                                      result.spectral_features
                                        .spectral_centroid_hz ?? 0,
                                    )}
                                    <span className="text-[10px] text-zinc-600">
                                      {" "}
                                      Hz
                                    </span>
                                  </p>
                                </div>
                                <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-[10px] text-zinc-600">
                                      MFCC Stability
                                    </span>
                                    <div className="relative group/tt cursor-help">
                                      <Info
                                        size={9}
                                        className="text-zinc-700"
                                      />
                                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">
                                        Độ ổn định cấu trúc âm thanh (MFCC). ≥
                                        50/100 = phát âm nhất quán, ổn định.
                                        Thấp = phát âm không đều.
                                      </div>
                                    </div>
                                  </div>
                                  <p
                                    className={`text-[14px] font-bold tabular-nums ${(result.spectral_features.mfcc_stability_score ?? 0) >= 50 ? "text-emerald-400" : "text-amber-400"}`}
                                  >
                                    {(
                                      result.spectral_features
                                        .mfcc_stability_score ?? 0
                                    ).toFixed(1)}
                                    <span className="text-[10px] text-zinc-600">
                                      /100
                                    </span>
                                  </p>
                                </div>
                              </div>
                            )}
                            {result.pitch_contour && (
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                                <div className="flex items-center gap-1 w-24 shrink-0">
                                  <span className="text-[11px] text-zinc-500">
                                    Pitch Contour
                                  </span>
                                  <div className="relative group/tt cursor-help">
                                    <Info size={9} className="text-zinc-700" />
                                    <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                      Xu hướng cao độ giọng. Rising (↗) = giọng
                                      lên, thường hỏi. Falling (↘) = giọng
                                      xuống, khẳng định. Flat (→) = đều đặn.
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`text-[12px] font-semibold px-2 py-0.5 rounded-md ${
                                    result.pitch_contour.pitch_contour ===
                                    "rising"
                                      ? "bg-cyan-500/10 text-cyan-400"
                                      : result.pitch_contour.pitch_contour ===
                                          "falling"
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {result.pitch_contour.pitch_contour ===
                                  "rising"
                                    ? "↗ Rising"
                                    : result.pitch_contour.pitch_contour ===
                                        "falling"
                                      ? "↘ Falling"
                                      : "→ Flat"}
                                </span>
                                <span className="text-[11px] text-zinc-600 ml-auto tabular-nums">
                                  {(
                                    result.pitch_contour.pitch_slope ?? 0
                                  ).toFixed(2)}{" "}
                                  st/s
                                </span>
                              </div>
                            )}
                            {result.filler_words &&
                              result.filler_words.filler_count > 0 && (
                                <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[11px] text-zinc-500">
                                        Filler Words
                                      </span>
                                      <div className="relative group/tt cursor-help">
                                        <Info
                                          size={9}
                                          className="text-zinc-700"
                                        />
                                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                                          Từ đệm không cần thiết (ừm, ờ, thì là,
                                          kiểu như…). Nhiều filler words → giảm
                                          tính chuyên nghiệp. MC nên giảm xuống
                                          ≤ 2%.
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[12px] font-semibold text-amber-400">
                                      {result.filler_words.filler_count}{" "}
                                      detected
                                    </span>
                                  </div>
                                  {result.filler_words.fillers_found?.length >
                                    0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {result.filler_words.fillers_found
                                        .slice(0, 5)
                                        .map((f, i) => (
                                          <span
                                            key={i}
                                            className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15"
                                          >
                                            {f.word} ×{f.count}
                                          </span>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            {(result.wer_rate > 0 || result.cer_rate > 0) && (
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  {
                                    label: "WER",
                                    value: result.wer_rate,
                                    unit: "%",
                                    desc: "Word Error Rate — tỷ lệ từ bị nhận dạng sai. MC chuyên nghiệp nên đạt < 15%. Càng thấp càng chính xác.",
                                    color: (v) =>
                                      v < 15
                                        ? "text-emerald-400"
                                        : v < 30
                                          ? "text-amber-400"
                                          : "text-red-400",
                                  },
                                  {
                                    label: "CER",
                                    value: result.cer_rate,
                                    unit: "%",
                                    desc: "Character Error Rate — tỷ lệ ký tự bị nhận dạng sai. Phản ánh độ rõ từng âm. Tốt: < 10%.",
                                    color: (v) =>
                                      v < 10
                                        ? "text-emerald-400"
                                        : v < 20
                                          ? "text-amber-400"
                                          : "text-red-400",
                                  },
                                ].map((m) => (
                                  <div
                                    key={m.label}
                                    className="p-3 rounded-xl bg-[#09090b] border border-white/[0.05]"
                                  >
                                    <div className="flex items-center gap-1 mb-1">
                                      <span className="text-[10px] text-zinc-600">
                                        {m.label}
                                      </span>
                                      <div className="relative group/tt cursor-help">
                                        <Info
                                          size={9}
                                          className="text-zinc-700"
                                        />
                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-xl bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">
                                          {m.desc}
                                        </div>
                                      </div>
                                    </div>
                                    <p
                                      className={`text-[15px] font-bold tabular-nums ${m.color(m.value)}`}
                                    >
                                      {(m.value ?? 0).toFixed(1)}
                                      <span className="text-[10px] text-zinc-600">
                                        {m.unit}
                                      </span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* AI Analysis */}
                    <div
                      className={`rounded-2xl border transition-all ${result ? "border-[#f5a623]/20 bg-[#111113]" : analyzing ? "border-[#f5a623]/15 bg-[#111113]" : "border-[#f5a623]/10 bg-[#f5a623]/[0.02]"}`}
                    >
                      <div
                        className={`flex items-center gap-2 px-5 py-4 border-b ${result ? "border-[#f5a623]/10" : "border-[#f5a623]/[0.07]"}`}
                      >
                        <Sparkles size={14} className="text-[#f5a623]" />
                        <h3 className="text-[13px] font-semibold text-white">
                          {t_vp("aiAnalysis")}
                        </h3>
                        {result && (
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Done
                          </span>
                        )}
                      </div>

                      {result ? (
                        <div className="p-5 space-y-4">
                          {/* Markdown report — prose style */}
                          {markdownReport && (
                            <div className="relative rounded-xl bg-[#09090b] border border-white/[0.05] overflow-hidden">
                              <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#f5a623]/60 to-[#f5a623]/10" />
                              <div
                                className="pl-5 pr-4 py-4 prose prose-invert prose-sm max-w-none
                                                    prose-headings:text-[13px] prose-headings:font-semibold prose-headings:text-[#f5a623] prose-headings:mb-1 prose-headings:mt-3
                                                    prose-p:text-[13px] prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:my-1
                                                    prose-strong:text-white prose-strong:font-semibold
                                                    prose-li:text-[13px] prose-li:text-zinc-300
                                                    prose-ul:my-1 prose-ol:my-1"
                              >
                                <TypewriterMarkdown content={markdownReport} />
                              </div>
                            </div>
                          )}

                          {/* Feedback items — clean rows */}
                          {feedbackItems.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                                {t_vp("feedbackBreakdown")}
                              </p>
                              <div className="space-y-1">
                                {feedbackItems.map((item, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.25,
                                      delay: i * 0.05,
                                    }}
                                    className="flex items-start gap-2.5 py-2 border-b border-white/[0.04] last:border-0"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-blue-400 mt-[6px] shrink-0" />
                                    <p className="text-[13px] text-zinc-300 leading-relaxed">
                                      {item}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Expert tips — compact cards */}
                          {expertTips.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                                {t_vp("coachingTips")}
                              </p>
                              <div className="space-y-2">
                                {expertTips.map((tip, i) => (
                                  <div
                                    key={i}
                                    className="flex gap-3 p-3 rounded-xl bg-[#f5a623]/[0.04] border border-[#f5a623]/10"
                                  >
                                    <span className="text-[#f5a623] text-[16px] shrink-0 leading-none mt-0.5">
                                      ✦
                                    </span>
                                    <div>
                                      {tip.label && (
                                        <p className="text-[11px] font-semibold text-[#f5a623] mb-0.5">
                                          {tip.label}
                                        </p>
                                      )}
                                      <p className="text-[12px] text-zinc-300 leading-relaxed">
                                        {tip.tip}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : analyzing ? (
                        <div className="py-10 px-6 flex flex-col items-center">
                          {/* Phase icon */}
                          <div className="w-12 h-12 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 flex items-center justify-center mb-4">
                            <Loader2
                              size={20}
                              className="text-[#f5a623] animate-spin"
                            />
                          </div>

                          {/* Phase label */}
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={analyzePhase}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="text-[13px] font-medium text-white mb-4 text-center"
                            >
                              {analyzePhase}
                            </motion.p>
                          </AnimatePresence>

                          {/* Progress bar */}
                          <div className="w-full max-w-[240px] mb-3">
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-[#f5a623] to-[#f5a623]/70"
                                animate={{ width: `${analyzeProgress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              />
                            </div>
                            <div className="flex justify-between mt-1.5">
                              <span className="text-[10px] text-zinc-600">
                                AI đang xử lý
                              </span>
                              <span className="text-[10px] font-semibold text-[#f5a623]">
                                {analyzeProgress}%
                              </span>
                            </div>
                          </div>

                          {/* Phase steps */}
                          <div className="w-full max-w-[240px] space-y-1.5 mt-2">
                            {ANALYZE_PHASES.map((p, i) => {
                              const done = analyzeProgress >= p.target;
                              const active = analyzePhase === p.label;
                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                                      done
                                        ? "bg-emerald-500"
                                        : active
                                          ? "bg-[#f5a623] animate-pulse"
                                          : "bg-zinc-700"
                                    }`}
                                  />
                                  <span
                                    className={`text-[11px] transition-colors duration-300 ${
                                      done
                                        ? "text-emerald-500/70"
                                        : active
                                          ? "text-zinc-300"
                                          : "text-zinc-600"
                                    }`}
                                  >
                                    {p.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center px-5">
                          <div className="w-10 h-10 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 flex items-center justify-center mx-auto mb-3">
                            <Sparkles
                              size={16}
                              className={
                                recording
                                  ? "text-[#f5a623] animate-pulse"
                                  : "text-[#f5a623]/40"
                              }
                            />
                          </div>
                          <p className="text-[13px] font-medium text-zinc-400 mb-1">
                            {recording
                              ? t_vp("aiListening")
                              : t_vp("lockedAnalysis")}
                          </p>
                          <p className="text-[11px] text-zinc-600 leading-relaxed max-w-[180px] mx-auto">
                            {t_vp("recordToUnlock")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Performance summary */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-5">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-[#f5a623]" />
                          <h3 className="text-[13px] font-semibold text-white">
                            {t("performanceSummary")}
                          </h3>
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${result ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-zinc-600"}`}
                        >
                          {result ? `✓ ${t("ready")}` : `⏳ ${t("waiting")}`}
                        </span>
                      </div>

                      {result ? (
                        <div className="space-y-4">
                          {/* Overall score */}
                          <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                            <div className="flex items-end justify-between mb-3">
                              <div>
                                <p className="text-[11px] text-zinc-600 mb-1">
                                  {t("overallScore")}
                                </p>
                                <div className="flex items-end gap-3">
                                  <p className="text-4xl font-bold text-white">
                                    {overallScore.toFixed(1)}
                                    <span className="text-xl text-zinc-400">
                                      %
                                    </span>
                                  </p>
                                  {(() => {
                                    if (history.length < 1) return null;
                                    const prev = clampMetric(
                                      Number(history[0].accuracyScore || 0) *
                                        0.45 +
                                        Number(history[0].rhythmScore || 0) *
                                          0.35 +
                                        (Math.min(
                                          Number(
                                            history[0].speakingRateWpm || 0,
                                          ),
                                          180,
                                        ) /
                                          180) *
                                          20,
                                    );
                                    const delta = overallScore - prev;
                                    if (Math.abs(delta) < 0.1)
                                      return (
                                        <span className="text-[11px] text-zinc-600 mb-1">
                                          = lần trước
                                        </span>
                                      );
                                    return (
                                      <span
                                        className={`text-[12px] font-semibold mb-1 ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}
                                      >
                                        {delta > 0 ? "↑" : "↓"}{" "}
                                        {Math.abs(delta).toFixed(1)}%
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                              <span
                                className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-white/[0.06] ${overallLevel.color}`}
                              >
                                {overallLevel.label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#f5a623] rounded-full transition-all duration-700"
                                style={{ width: `${overallScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Coverage + Pace */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                              <div className="flex items-center gap-1.5 mb-2">
                                <BarChart3
                                  size={13}
                                  className="text-cyan-400"
                                />
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                  {t("coverage")}
                                </p>
                              </div>
                              <p className="text-2xl font-bold text-white">
                                {completionPercent.toFixed(0)}
                                <span className="text-sm text-zinc-500">%</span>
                              </p>
                            </div>
                            <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Clock size={13} className="text-purple-400" />
                                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                  Pace
                                </p>
                              </div>
                              <p className="text-2xl font-bold text-white">
                                {pace.toFixed(0)}
                                <span className="text-sm text-zinc-500">
                                  {" "}
                                  wpm
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Pace insight */}
                          <p
                            className={`text-[12px] leading-relaxed ${paceInsight.color}`}
                          >
                            {paceInsight.text}
                          </p>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <BarChart3
                            size={24}
                            className="mx-auto mb-2 text-zinc-800"
                          />
                          <p className="text-[13px] text-zinc-600">
                            {t("recordToUnlock")}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoicePractice;
