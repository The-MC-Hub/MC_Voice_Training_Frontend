import React from "react";
import { Loader2, ArrowLeft, Award, AlertCircle, Zap, RefreshCw, Square, Play, AudioLines } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoicePractice, clampMetric, ANALYZE_PHASES } from "../hooks/useVoicePractice";
import Navbar from "../components/Navbar";
import UpgradeBanner from "../components/ui/UpgradeBanner";
import Breadcrumb from "../components/ui/Breadcrumb";
import LessonInfoPanel from "../components/voice/LessonInfoPanel";
import { SimpleScriptPanel } from "../components/voice/ScriptPanel";
import ScriptPanel from "../components/voice/ScriptPanel";
import RecordingCard from "../components/voice/RecordingCard";
import AnalysisPanel from "../components/voice/AnalysisPanel";
import PracticeHistory from "../components/voice/PracticeHistory";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const VoicePractice = () => {
  const vp = useVoicePractice();
  const {
    navigate, mId, courseId,
    user, evalLanguage, i18nInstance, t, t_vp,
    lesson, course, loading, error,
    history, currentPage, setCurrentPage, itemsPerPage,
    recording, audioBlob, audioUrl, analyzing, analyzeProgress, analyzePhase, result, recordingTime,
    startRecording, stopRecording, handleAnalyze, resetPractice,
    cameraOn, videoRef, toggleCamera,
    bars, volumeLevel, audioStatus, EMPTY_BARS,
    scriptFontSize, setScriptFontSize, scriptAlign, setScriptAlign,
    scriptFont, setScriptFont, scriptBg, setScriptBg,
    teleprompter, setTeleprompter, teleprompterWpm, setTeleprompterWpm,
    teleprompterRunning, setTeleprompterRunning, scriptScrollRef,
    annotations, setAnnotations, annotationPopup, setAnnotationPopup,
    noteInput, setNoteInput, showNoteInput, setShowNoteInput,
    hoveredAnnotation, setHoveredAnnotation, annotationPopupRef,
    leftWidth, containerRef, handleMouseDown,
    accuracy, energy, pace, pacePercent,
    feedbackItems, expertTips, markdownReport,
    completionPercent, overallScore, overallLevel, paceInsight,
  } = vp;

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center bg-[#09090b]">
        <Loader2 className="animate-spin text-[#f5a623]" size={28} />
      </div>
    );

  const plan = user?.plan || "FREE";
  const aiUsed = user?.aiSessionsUsed ?? 0;
  const aiLimit = plan === "FREE" ? 5 : plan === "BASIC" ? 20 : null;
  const usagePct = aiLimit ? (aiUsed / aiLimit) * 100 : 0;

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      {/* Analyzing overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b]/95 backdrop-blur-sm"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f5a623]/[0.04] blur-[120px]" />
            </div>

            <div className="relative flex flex-col items-center max-w-sm w-full px-8">
              {/* Animated mic icon */}
              <div className="relative flex items-center justify-center mb-8">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full border border-[#f5a623]/20"
                    style={{ width: `${72 + i * 32}px`, height: `${72 + i * 32}px` }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                  />
                ))}
                <div className="w-16 h-16 rounded-full bg-[#f5a623]/10 border-2 border-[#f5a623]/40 flex items-center justify-center shadow-[0_0_32px_rgba(245,166,35,0.15)]">
                  <AudioLines size={28} className="text-[#f5a623] animate-pulse" />
                </div>
              </div>

              {/* Phase label */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={analyzePhase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-[15px] font-semibold text-white mb-1 text-center"
                >
                  {analyzePhase}
                </motion.p>
              </AnimatePresence>
              <p className="text-[12px] text-zinc-500 mb-6 text-center">Phân tích giọng nói AI · Vui lòng chờ</p>

              {/* Progress bar */}
              <div className="w-full mb-3">
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#f5a623] to-[#f5a623]/70"
                    animate={{ width: `${analyzeProgress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-zinc-600">Đang xử lý...</span>
                  <span className="text-[12px] font-bold text-[#f5a623] tabular-nums">{analyzeProgress}%</span>
                </div>
              </div>

              {/* Phase checklist */}
              <div className="w-full space-y-2 mt-4">
                {ANALYZE_PHASES.map((p, i) => {
                  const done = analyzeProgress >= p.target;
                  const active = analyzePhase === p.label;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${done ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : active ? "bg-[#f5a623] animate-pulse" : "bg-zinc-700"}`} />
                      <span className={`text-[12px] transition-colors duration-300 ${done ? "text-emerald-400/70 line-through decoration-emerald-500/40" : active ? "text-white font-medium" : "text-zinc-600"}`}>
                        {p.label}
                      </span>
                      {done && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-[10px] text-emerald-500">✓</motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 flex flex-col pt-20 min-h-[calc(100vh-3.5rem)] overflow-hidden">
        {aiLimit && usagePct >= 80 && (
          <UpgradeBanner variant="strip" plan={plan} used={aiUsed} limit={aiLimit} />
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Milestone sidebar */}
          {mId && (
            <aside className="hidden xl:flex w-72 border-r border-white/[0.07] bg-[#111113] flex-col sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden">
              <div className="p-5 border-b border-white/[0.07]">
                <button onClick={() => navigate(`/m/learning/milestone/${mId}`)} className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[12px] mb-4">
                  <ArrowLeft size={13} /> {t_vp("roadmap")}
                </button>
                <h2 className="text-[14px] font-semibold text-white line-clamp-2">{t("learning.progress")}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1" />
            </aside>
          )}

          <div className="flex-1 p-4 lg:p-6 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}>
            {/* Breadcrumb */}
            <Breadcrumb items={
              courseId
                ? [{ label: "Khóa học", href: "/m/courses" }, { label: course?.title || "Chi tiết khóa học", href: `/m/courses/${courseId}` }, { label: lesson?.title || "Bài luyện tập" }]
                : [{ label: "Luyện tập", href: "/m/voice/library" }, { label: lesson?.title || "Bài luyện tập" }]
            } />

            {/* Page header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between pb-5 border-b border-white/[0.07]">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">{lesson?.title}</h1>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  {lesson?.category} · {lesson?.difficulty} {t("common.level") || "Level"}
                </p>
                {history.length > 0 && (() => {
                  const best = Math.max(...history.map((h) => clampMetric(Number(h.accuracyScore || 0) * 0.45 + Number(h.rhythmScore || 0) * 0.35 + (Math.min(Number(h.speakingRateWpm || 0), 180) / 180) * 20)));
                  return <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold"><Award size={10} /> Best: {best.toFixed(1)}%</span>;
                })()}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Language toggle */}
                <div className="flex items-center rounded-lg bg-[#111113] border border-white/[0.07] p-0.5">
                  {["vi", "en"].map((lang) => (
                    <button key={lang} onClick={() => i18nInstance.changeLanguage(lang)}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${evalLanguage === lang ? "bg-[#f5a623] text-black" : "text-zinc-400 hover:text-white"}`}
                    >{lang.toUpperCase()}</button>
                  ))}
                </div>

                {audioBlob && !analyzing && !result && (
                  <button onClick={handleAnalyze} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors">
                    <Zap size={14} /> {t_vp("analyzeNow")}
                  </button>
                )}
                {audioBlob && (
                  <button onClick={resetPractice} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/[0.1] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.05] transition-colors">
                    <RefreshCw size={13} /> {t_vp("reRecord")}
                  </button>
                )}
                {recording ? (
                  <button onClick={stopRecording} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors">
                    <Square size={13} /> {t_vp("stop")}
                  </button>
                ) : !audioBlob ? (
                  <button onClick={startRecording} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors">
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

            {/* Lesson info */}
            <LessonInfoPanel lesson={lesson} />

            {/* Resizable 2-col layout */}
            <div ref={containerRef} className="flex gap-1 relative">
              {/* LEFT col */}
              <div style={{ width: result ? `${leftWidth}%` : "100%" }} className="space-y-4 min-w-[28%]">
                {/* Pre-record: script left + recorder right */}
                {!result && lesson && (
                  <div className="flex gap-4 items-stretch min-h-[480px]">
                    <SimpleScriptPanel lesson={lesson} />
                    <RecordingCard
                      recording={recording} audioBlob={audioBlob} audioUrl={audioUrl} analyzing={analyzing}
                      recordingTime={recordingTime} formatTime={formatTime}
                      startRecording={startRecording} stopRecording={stopRecording}
                      handleAnalyze={handleAnalyze} resetPractice={resetPractice}
                      bars={bars} volumeLevel={volumeLevel} audioStatus={audioStatus} EMPTY_BARS={EMPTY_BARS}
                      cameraOn={cameraOn} videoRef={videoRef} toggleCamera={toggleCamera}
                      t_vp={t_vp}
                    />
                  </div>
                )}

                {/* Post-record: annotatable script panel */}
                {result && lesson && (
                  <ScriptPanel
                    lesson={lesson}
                    scriptFontSize={scriptFontSize} setScriptFontSize={setScriptFontSize}
                    scriptAlign={scriptAlign} setScriptAlign={setScriptAlign}
                    scriptFont={scriptFont} setScriptFont={setScriptFont}
                    scriptBg={scriptBg} setScriptBg={setScriptBg}
                    teleprompter={teleprompter} setTeleprompter={setTeleprompter}
                    teleprompterWpm={teleprompterWpm} setTeleprompterWpm={setTeleprompterWpm}
                    teleprompterRunning={teleprompterRunning} setTeleprompterRunning={setTeleprompterRunning}
                    scriptScrollRef={scriptScrollRef}
                    annotations={annotations} setAnnotations={setAnnotations}
                    annotationPopup={annotationPopup} setAnnotationPopup={setAnnotationPopup}
                    noteInput={noteInput} setNoteInput={setNoteInput}
                    showNoteInput={showNoteInput} setShowNoteInput={setShowNoteInput}
                    hoveredAnnotation={hoveredAnnotation} setHoveredAnnotation={setHoveredAnnotation}
                    annotationPopupRef={annotationPopupRef}
                    t={t} t_vp={t_vp}
                  />
                )}

                {/* History */}
                <PracticeHistory
                  history={history} currentPage={currentPage} setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage} courseId={courseId} navigate={navigate}
                  t={t} t_vp={t_vp}
                />
              </div>

              {/* Resizable divider */}
              {result && (
                <div onMouseDown={handleMouseDown} className="group relative flex w-2 cursor-col-resize items-center justify-center mx-0.5">
                  <div className="h-10 w-0.5 rounded-full bg-white/[0.08] group-hover:bg-[#f5a623]/40 transition-colors" />
                </div>
              )}

              {/* RIGHT col: analysis */}
              <AnalysisPanel
                result={result} analyzing={analyzing}
                analyzeProgress={analyzeProgress} analyzePhase={analyzePhase} ANALYZE_PHASES={ANALYZE_PHASES}
                accuracy={accuracy} energy={energy} pace={pace} pacePercent={pacePercent}
                overallScore={overallScore} overallLevel={overallLevel}
                completionPercent={completionPercent} paceInsight={paceInsight}
                feedbackItems={feedbackItems} expertTips={expertTips} markdownReport={markdownReport}
                history={history} clampMetric={clampMetric}
                t={t} t_vp={t_vp}
                leftWidth={leftWidth}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoicePractice;
