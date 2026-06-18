import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import { fetchLessonById, analyzePractice, analyzeGuestPractice, fetchPracticeHistory } from "../controllers/voiceController";
import { academyService } from "../services/academyService";
import { useAudioAnalyser } from "./useAudioAnalyser";
import celebrate from "../utils/celebrate";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const clampMetric = (v) => {
  const n = Number(v || 0);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
};

export const ANALYZE_PHASES = [
  { label: "Đang tải âm thanh lên...", target: 15 },
  { label: "Nhận dạng giọng nói...", target: 35 },
  { label: "Phân tích ngữ điệu & nhịp điệu...", target: 55 },
  { label: "Phân tích chất lượng giọng...", target: 75 },
  { label: "Tổng hợp & chấm điểm...", target: 93 },
];

export function useVoicePractice() {
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

  // Guest cooldown — tracked via localStorage, duration fetched from API
  const GUEST_COOLDOWN_KEY = "mchub_guest_practice_until";
  const [guestCooldownMs, setGuestCooldownMs] = useState(3 * 60 * 60 * 1000);
  const [guestCooldownUntil, setGuestCooldownUntil] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(GUEST_COOLDOWN_KEY);
    if (!stored) return null;
    const ts = parseInt(stored, 10);
    return ts > Date.now() ? ts : null;
  });

  useEffect(() => {
    if (user) return;
    import("../services/api").then(({ default: api }) => {
      api.get("/voice/guest-cooldown-hours")
        .then(res => {
          const h = res.data?.data?.hours;
          if (h && h > 0) setGuestCooldownMs(h * 60 * 60 * 1000);
        })
        .catch(() => {});
    });
  }, [user]);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const [totalPracticesCount, setTotalPracticesCount] = useState(0);
  const itemsPerPage = 4;

  // Script reader controls
  const [scriptFontSize, setScriptFontSize] = useState(24);
  const [scriptAlign, setScriptAlign] = useState("center");
  const [scriptFont, setScriptFont] = useState("sans");
  const [scriptBg, setScriptBg] = useState("cream");
  const [teleprompter, setTeleprompter] = useState(false);
  const [teleprompterWpm, setTeleprompterWpm] = useState(130);
  const [teleprompterRunning, setTeleprompterRunning] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [annotationPopup, setAnnotationPopup] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const annotationPopupRef = useRef(null);
  const scriptScrollRef = useRef(null);
  const teleprompterRef = useRef(null);

  // Resizable layout
  const [leftWidth, setLeftWidth] = useState(60);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  // Camera
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const liveStreamRef = useRef(null);

  const EMPTY_BARS = useMemo(() => new Array(36).fill(0), []);

  const { bars, volumeLevel, audioStatus } = useAudioAnalyser(
    recording ? liveStreamRef.current : null,
    { barCount: 36, fftSize: 256 }
  );

  const t_vp = (key) => t(`voicePractice.${key}`);

  // Resizable handlers
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
    if (distance <= 0) { setTeleprompterRunning(false); return; }
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

  // Camera attach
  useEffect(() => {
    if (videoRef.current && cameraStream) videoRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  // Cleanup
  useEffect(() => () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
  }, [cameraStream]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (analyzeTimerRef.current) clearInterval(analyzeTimerRef.current);
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
  }, []);

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
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
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

  const startRecording = async () => {
    if (user) {
      const plan = user?.plan || "FREE";
      const aiUsed = user?.aiSessionsUsed ?? 0;
      if (plan === "FREE" && aiUsed >= 5) { navigate("/m/payment"); return; }
      if (plan === "BASIC" && aiUsed >= 20) { navigate("/m/payment"); return; }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType || "audio/webm" });
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
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
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

  const startAnalyzeProgress = () => {
    setAnalyzeProgress(0);
    setAnalyzePhase(ANALYZE_PHASES[0].label);
    let phaseIdx = 0, current = 0;
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
    if (success) { setAnalyzePhase("Hoàn tất!"); setAnalyzeProgress(100); }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    // Guest cooldown gate
    if (!user) {
      const stored = localStorage.getItem(GUEST_COOLDOWN_KEY);
      if (stored) {
        const ts = parseInt(stored, 10);
        if (ts > Date.now()) {
          setGuestCooldownUntil(ts);
          return;
        }
      }
    }

    setAnalyzing(true);
    setError(null);
    startAnalyzeProgress();
    try {
      const data = user
          ? await analyzePractice(id, user.id, audioBlob)
          : await analyzeGuestPractice(audioBlob, lesson?.content);
          
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
        cer_rate: data.cer_rate ?? 0,
        wer_rate: data.wer_rate ?? 0,
        spectral_features: data.spectral_features ?? null,
        pitch_contour: data.pitch_contour ?? null,
        filler_words: data.filler_words ?? null,
        voice_quality: data.voice_quality ?? null,
        emotion_breakdown: data.emotion_breakdown ?? null,
        status: "success",
      });
      stopAnalyzeProgress(true);
      if (courseId && user) {
        academyService.completeLesson(courseId, id).catch(() => {});
        celebrate("🎉 Tuyệt vời! Bạn đã hoàn thành bài luyện!");
      } else if (!user) {
        const cooldownTs = Date.now() + guestCooldownMs;
        localStorage.setItem(GUEST_COOLDOWN_KEY, String(cooldownTs));
        setGuestCooldownUntil(cooldownTs);
        celebrate("🎉 Trải nghiệm hoàn tất! Đăng ký để lưu kết quả và luyện không giới hạn.");
      }
      
      if (user) {
        await Promise.all([fetchHistory(), refreshUser()]);
      }
    } catch (err) {
      stopAnalyzeProgress(false);
      if (err.response?.status === 402 || err.response?.data?.code === "ERR_4005") {
        navigate("/m/payment");
      }
      setError(err.response?.data?.message || "AI Analysis failed. Please try again.");
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
        const vs = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 360 } });
        setCameraStream(vs);
        setCameraOn(true);
      } catch {
        setError("Không thể bật camera. Kiểm tra quyền truy cập.");
      }
    }
  }, [cameraOn, cameraStream]);

  // Derived metrics
  const scriptMarkdown = useMemo(
    () => lesson?.content?.replace(/^\[(.+?)\]\s*$/gm, "## $1").replace(/\n{3,}/g, "\n\n") || "",
    [lesson]
  );
  const accuracy = useMemo(() => clampMetric(result?.accuracy_score), [result]);
  const energy = useMemo(() => clampMetric(result?.rhythm_score), [result]);
  const pace = useMemo(() => Number(result?.speaking_rate_wpm || 0), [result]);
  const pacePercent = useMemo(() => clampMetric((pace / 180) * 100), [pace]);

  const feedbackItems = useMemo(() => {
    const fb = evalLanguage === "vi" ? result?.feedback_vi : result?.feedback_en;
    if (!fb) return [];
    return fb.split("|").map((s) => s.trim()).filter(Boolean);
  }, [result, evalLanguage]);

  const expertTips = useMemo(() => {
    const tips = evalLanguage === "vi" ? result?.tips_vi : result?.tips_en;
    return Array.isArray(tips) ? tips : [];
  }, [result, evalLanguage]);

  const markdownReport = useMemo(
    () => (evalLanguage === "vi" ? result?.report_vi : result?.report_en),
    [result, evalLanguage]
  );

  const scriptWordCount = useMemo(() => lesson?.content?.trim().split(/\s+/).length || 0, [lesson]);
  const spokenWordCount = useMemo(() => result?.text_spoken?.trim().split(/\s+/).length || 0, [result]);
  const completionPercent = useMemo(() => clampMetric((spokenWordCount / scriptWordCount) * 100), [scriptWordCount, spokenWordCount]);
  const overallScore = useMemo(() => clampMetric(accuracy * 0.45 + energy * 0.35 + pacePercent * 0.2), [accuracy, energy, pacePercent]);

  const overallLevel = useMemo(() => {
    if (overallScore >= 85) return { label: "Excellent", color: "text-emerald-400" };
    if (overallScore >= 70) return { label: "Good", color: "text-cyan-400" };
    if (overallScore >= 55) return { label: "Developing", color: "text-amber-400" };
    return { label: "Needs Work", color: "text-orange-400" };
  }, [overallScore]);

  const paceInsight = useMemo(() => {
    if (!pace) return { text: "Pace data not available.", color: "text-zinc-500" };
    if (pace < 115) return { text: "Slow pace. Increase tempo slightly.", color: "text-amber-400" };
    if (pace <= 165) return { text: "Balanced pace. Suitable for MC contexts.", color: "text-emerald-400" };
    return { text: "Fast pace. Add pauses for clarity.", color: "text-orange-400" };
  }, [pace]);

  return {
    // routing
    id, navigate, mId, courseId,
    // auth
    user, evalLanguage, i18nInstance, t, t_vp,
    // data
    lesson, course, loading, error, history, currentPage, setCurrentPage, itemsPerPage, totalPracticesCount,
    // guest
    guestCooldownUntil,
    // recording state
    recording, audioBlob, audioUrl, analyzing, analyzeProgress, analyzePhase, result, recordingTime,
    // recording actions
    startRecording, stopRecording, handleAnalyze, resetPractice,
    // camera
    cameraOn, videoRef, toggleCamera,
    // audio analysis
    bars, volumeLevel, audioStatus, EMPTY_BARS,
    // script controls
    scriptFontSize, setScriptFontSize,
    scriptAlign, setScriptAlign,
    scriptFont, setScriptFont,
    scriptBg, setScriptBg,
    teleprompter, setTeleprompter,
    teleprompterWpm, setTeleprompterWpm,
    teleprompterRunning, setTeleprompterRunning,
    scriptScrollRef,
    annotations, setAnnotations,
    annotationPopup, setAnnotationPopup,
    noteInput, setNoteInput,
    showNoteInput, setShowNoteInput,
    hoveredAnnotation, setHoveredAnnotation,
    annotationPopupRef,
    // layout
    leftWidth, containerRef, handleMouseDown,
    // derived
    scriptMarkdown, accuracy, energy, pace, pacePercent,
    feedbackItems, expertTips, markdownReport,
    completionPercent, overallScore, overallLevel, paceInsight,
    // utils
    formatTime, ANALYZE_PHASES,
  };
}
