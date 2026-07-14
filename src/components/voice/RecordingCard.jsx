import { Mic, Square, RefreshCw, Zap, AudioLines, CheckCircle2, Volume1, Volume2, AlertTriangle, Camera, CameraOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_PHASES } from "../../hooks/useVoicePractice";

// Human speaking-voice range gate, matches the AI service's librosa.pyin bounds
// closely enough for a live sparkline (exact match isn't the goal here).
const PITCH_MIN_HZ = 70;
const PITCH_MAX_HZ = 500;

function PitchContour({ pitchHistory, pitchHz }) {
  if (!pitchHistory.length) {
    return (
      <div className="h-8 flex items-center justify-center">
        <p className="text-[10px] text-zinc-600">Đang chờ giọng nói để vẽ đường ngữ điệu...</p>
      </div>
    );
  }
  const W = 280, H = 32, pad = 3;
  const pts = pitchHistory.map((hz, i) => {
    const x = pad + (i / Math.max(pitchHistory.length - 1, 1)) * (W - pad * 2);
    const clamped = Math.max(PITCH_MIN_HZ, Math.min(PITCH_MAX_HZ, hz));
    const y = H - pad - ((clamped - PITCH_MIN_HZ) / (PITCH_MAX_HZ - PITCH_MIN_HZ)) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="w-full max-w-[280px] mx-auto">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      </svg>
      <p className="text-[10px] text-center text-violet-400 font-mono mt-0.5">
        {pitchHz > 0 ? `${pitchHz} Hz` : "—"} <span className="text-zinc-600">· ngữ điệu trực tiếp</span>
      </p>
    </div>
  );
}

export default function RecordingCard({
  recording, audioBlob, audioUrl, analyzing,
  recordingTime, formatTime,
  startRecording, stopRecording, handleAnalyze, resetPractice,
  bars, volumeLevel, audioStatus, EMPTY_BARS,
  pitchHz, pitchHistory,
  cameraOn, videoRef, toggleCamera,
  analyzeProgress, analyzePhase,
  t_vp,
}) {
  return (
    <div data-quest="quest-recording-card" className="flex-1 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
      <div className="rounded-2xl border-0 overflow-hidden h-full flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-zinc-700"}`} />
            <span className="text-[12px] text-zinc-500 font-medium">
              {recording ? t_vp("recordingInProgress") : analyzing ? t_vp("analyzingVoice") : t_vp("readyToRecord")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(recording || recordingTime > 0) && (
              <span className="text-[12px] font-mono text-zinc-400">{formatTime(recordingTime)}</span>
            )}
            <button
              onClick={toggleCamera}
              title={cameraOn ? "Tắt camera" : "Bật camera (MC Mirror)"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                cameraOn
                  ? "bg-[#f5a623]/10 border-[#f5a623]/30 text-[#f5a623]"
                  : "border-white/[0.07] text-zinc-600 hover:text-zinc-300 hover:border-white/[0.14]"
              }`}
            >
              {cameraOn ? <Camera size={12} /> : <CameraOff size={12} />}
              <span className="hidden sm:inline">{cameraOn ? "Camera bật" : "Camera"}</span>
            </button>
          </div>
        </div>

        {/* Camera PiP */}
        <AnimatePresence>
          {cameraOn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-50 overflow-hidden"
              style={{ bottom: "1.5rem", right: "1.5rem", width: "220px", aspectRatio: "4/3", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", background: "#000" }}
            >
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${recording ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-black/60 border-white/10 text-zinc-400"}`}>
                  <span className={`w-1 h-1 rounded-full ${recording ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
                  {recording ? "REC" : "CAM"}
                </span>
                {recording && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 border border-white/10 text-zinc-300">
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623]">🎙 Live</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyzing progress — shown instead of mic area */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="px-5 py-5 border-b border-white/[0.07] bg-[#0d0d0f]"
            >
              {/* Header row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex items-center justify-center shrink-0">
                  {[0, 1].map((i) => (
                    <motion.span key={i} className="absolute rounded-full border border-[#f5a623]/20"
                      style={{ width: `${36 + i * 18}px`, height: `${36 + i * 18}px` }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0, 0.35] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    />
                  ))}
                  <div className="w-9 h-9 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center justify-center">
                    <AudioLines size={16} className="text-[#f5a623] animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.p key={analyzePhase}
                      initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.2 }}
                      className="text-[13px] font-semibold text-white truncate"
                    >{analyzePhase}</motion.p>
                  </AnimatePresence>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Phân tích giọng nói AI</p>
                </div>
                <span className="text-[14px] font-bold text-[#f5a623] tabular-nums shrink-0">{analyzeProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#f5a623] to-[#f5a623]/60"
                  animate={{ width: `${analyzeProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              {/* Phase checklist */}
              <div className="space-y-1.5">
                {ANALYZE_PHASES.map((p, i) => {
                  const done = analyzeProgress >= p.target;
                  const active = analyzePhase === p.label;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${done ? "bg-emerald-500" : active ? "bg-[#f5a623] animate-pulse" : "bg-zinc-700"}`} />
                      <span className={`text-[11px] transition-colors duration-300 ${done ? "text-emerald-500/60 line-through" : active ? "text-white font-medium" : "text-zinc-600"}`}>{p.label}</span>
                      {done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-[10px] text-emerald-500">✓</motion.span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mic area */}
        <div className={`flex-1 flex flex-col items-center justify-center py-8 transition-all duration-500 ${
          analyzing ? "hidden"
            : recording ? "bg-[#0d0d0f] shadow-[inset_0_0_80px_rgba(239,68,68,0.06)] ring-1 ring-inset ring-red-500/10"
            : "bg-[#0d0d0f]"
        }`}>
          {/* Mic ring */}
          <div className="relative flex items-center justify-center mb-4">
            {recording && (
              <svg className="absolute" width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                <circle
                  cx="48" cy="48" r="44" fill="none" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - volumeLevel / 100)}`}
                  stroke={volumeLevel > 85 ? "#ef4444" : volumeLevel > 60 ? "#f5a623" : volumeLevel > 15 ? "#10b981" : "#f59e0b"}
                  style={{ transition: "stroke-dashoffset 0.08s linear, stroke 0.2s" }}
                />
              </svg>
            )}
            {recording && [0, 1, 2].map((i) => (
              <span key={i} className="absolute rounded-full border border-red-500/20"
                style={{ width: `${88 + i * 28}px`, height: `${88 + i * 28}px`, animation: `ping-slow 1.8s ease-out infinite`, animationDelay: `${i * 0.45}s`, opacity: 0 }}
              />
            ))}
            {analyzing && [0, 1].map((i) => (
              <span key={i} className="absolute rounded-full border border-[#f5a623]/20"
                style={{ width: `${72 + i * 24}px`, height: `${72 + i * 24}px`, animation: `ping-slow 1.2s ease-out infinite`, animationDelay: `${i * 0.3}s`, opacity: 0 }}
              />
            ))}
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              recording ? "bg-red-500/20 border-2 border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
                : analyzing ? "bg-[#f5a623]/10 border-2 border-[#f5a623]/40 shadow-[0_0_20px_rgba(245,166,35,0.15)]"
                : audioBlob ? "bg-emerald-500/10 border-2 border-emerald-500/30"
                : "bg-[#f5a623]/[0.06] border border-[#f5a623]/15"
            }`}>
              {analyzing
                ? <AudioLines size={26} className="text-[#f5a623] animate-pulse" />
                : <Mic size={26} className={recording ? "text-red-400" : audioBlob ? "text-emerald-400" : "text-[#f5a623]"} />
              }
            </div>
          </div>

          {/* Waveform */}
          <div className="flex items-end justify-center gap-[2px] h-10 mb-3 px-4 w-full max-w-[280px]">
            {(recording ? bars : analyzing ? bars.map(() => Math.random() * 30 + 5) : EMPTY_BARS).map((val, i) => {
              const h = recording ? Math.max(2, Math.round(val * 0.36)) : analyzing ? Math.max(2, Math.round(val * 0.3)) : 2;
              const color = recording
                ? audioStatus === "too_loud" ? `rgba(239,68,68,${0.4 + (val / 100) * 0.6})` : `rgba(245,166,35,${0.3 + (val / 100) * 0.7})`
                : analyzing ? `rgba(245,166,35,${0.2 + (val / 100) * 0.5})` : "rgba(63,63,70,0.3)";
              return (
                <div key={i} className="rounded-full shrink-0"
                  style={{ width: "3px", height: `${h}px`, background: color, transition: recording ? "height 0.05s linear" : "height 0.3s ease" }}
                />
              );
            })}
          </div>

          {/* Live pitch/intonation contour — visual feedback while reading, before AI grading */}
          {recording && <PitchContour pitchHistory={pitchHistory} pitchHz={pitchHz} />}

          <p className="text-[13px] font-semibold text-white mb-1 mt-2">{t_vp("voiceAnalysis")}</p>
          <p className="text-[11px] text-zinc-500 mb-3">
            {recording ? t_vp("recordingInProgress") : analyzing ? t_vp("analyzingVoice") : t_vp("readScript")}
          </p>

          {/* Action buttons */}
          <AnimatePresence mode="wait">
            {recording && (
              <motion.div key="big-stop" initial={{ opacity: 0, scale: 0.88, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 10 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="mt-2 mb-1 flex items-center gap-3">
                <motion.button onClick={stopRecording}
                  animate={{ boxShadow: ["0 0 12px rgba(239,68,68,0.3)", "0 0 32px rgba(239,68,68,0.6)", "0 0 12px rgba(239,68,68,0.3)"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-red-500 text-white text-[15px] font-bold"
                  style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                >
                  <Square size={18} /> {t_vp("stop")}
                </motion.button>
              </motion.div>
            )}
            {audioBlob && !analyzing && !recording && (
              <motion.div key="big-analyze" initial={{ opacity: 0, scale: 0.88, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 10 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="mt-2 mb-1 flex items-center gap-3">
                <motion.button onClick={handleAnalyze}
                  animate={{ boxShadow: ["0 0 12px rgba(245,166,35,0.25)", "0 0 36px rgba(245,166,35,0.55)", "0 0 12px rgba(245,166,35,0.25)"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gold text-black text-[15px] font-bold"
                  style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                >
                  <Zap size={18} /> {t_vp("analyzeNow")}
                </motion.button>
                <motion.button onClick={resetPractice} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-4 rounded-2xl border border-white/12 text-zinc-300 text-[14px] font-semibold hover:bg-white/6 transition-colors"
                  style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                >
                  <RefreshCw size={15} /> {t_vp("reRecord")}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!recording && !audioBlob && !analyzing && (
              <motion.button key="big-start" onClick={startRecording}
                initial={{ opacity: 0, scale: 0.88, y: 10 }}
                animate={{ opacity: 1, scale: [1, 1.03, 1], boxShadow: ["0 0 16px rgba(245,166,35,0.25)", "0 0 40px rgba(245,166,35,0.55)", "0 0 16px rgba(245,166,35,0.25)"] }}
                exit={{ opacity: 0, scale: 0.88, y: 10 }}
                transition={{ opacity: { duration: 0.35 }, scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }, boxShadow: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
                whileHover={{ scale: 1.06, boxShadow: "0 0 48px rgba(245,166,35,0.65)" }}
                whileTap={{ scale: 0.96 }}
                className="relative mt-2 mb-1 flex items-center gap-3 px-12 py-4 rounded-2xl bg-[#f5a623] text-black text-[15px] font-bold tracking-tight overflow-hidden"
                style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
              >
                {[0, 1].map((i) => (
                  <motion.span key={i} className="absolute inset-0 rounded-2xl border-2 border-gold"
                    animate={{ scale: [1, 1.18], opacity: [0.5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: i * 0.8 }}
                  />
                ))}
                <motion.span animate={{ rotate: [0, -8, 8, -4, 4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                  <Mic size={20} />
                </motion.span>
                {t_vp("startRecording")}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Audio quality feedback */}
          <AnimatePresence>
            {recording && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25 }} className="w-full max-w-[280px] px-4">
                {audioStatus === "too_quiet" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-400 text-[11px]">
                    <Volume1 size={13} className="shrink-0" /><span>Âm lượng quá nhỏ — hãy nói to hơn</span>
                  </div>
                )}
                {audioStatus === "too_loud" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[11px]">
                    <Volume2 size={13} className="shrink-0" /><span>Âm lượng quá lớn — ra xa mic hơn</span>
                  </div>
                )}
                {audioStatus === "noisy" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/[0.08] border border-orange-500/20 text-orange-400 text-[11px]">
                    <AlertTriangle size={13} className="shrink-0" /><span>Phát hiện tiếng ồn — đến nơi yên tĩnh hơn</span>
                  </div>
                )}
                {audioStatus === "good" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px]">
                    <CheckCircle2 size={13} className="shrink-0" /><span>Âm lượng tốt — {volumeLevel}%</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {audioBlob && !analyzing && !recording && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25 }} className="w-full max-w-[280px] mt-2 px-4">
                <p className="text-[10px] text-zinc-600 mb-1.5 text-center uppercase tracking-wider">Nghe lại trước khi gửi AI</p>
                <audio controls src={audioUrl} className="w-full h-8"
                  style={{ filter: "invert(1) hue-rotate(180deg) brightness(0.8)", borderRadius: "6px" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <style>{`
          @keyframes ping-slow {
            0%   { transform: scale(1); opacity: 0.45; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
