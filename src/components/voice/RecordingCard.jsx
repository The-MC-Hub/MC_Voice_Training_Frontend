import { Mic, Square, Play, RefreshCw, Zap, AudioLines, CheckCircle2, Volume1, Volume2, AlertTriangle, Camera, CameraOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecordingCard({
  recording, audioBlob, audioUrl, analyzing,
  recordingTime, formatTime,
  startRecording, stopRecording, handleAnalyze, resetPractice,
  bars, volumeLevel, audioStatus, EMPTY_BARS,
  cameraOn, videoRef, toggleCamera,
  t_vp,
}) {
  return (
    <div className="flex-1 rounded-2xl border border-white/[0.07] bg-[#111113] overflow-hidden">
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

        {/* Mic area */}
        <div className={`flex-1 flex flex-col items-center justify-center py-8 transition-all duration-500 ${
          recording ? "bg-[#0d0d0f] shadow-[inset_0_0_80px_rgba(239,68,68,0.06)] ring-1 ring-inset ring-red-500/10"
            : analyzing ? "bg-[#0d0d0f] shadow-[inset_0_0_60px_rgba(245,166,35,0.04)] ring-1 ring-inset ring-amber-500/10"
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

          <p className="text-[13px] font-semibold text-white mb-1">{t_vp("voiceAnalysis")}</p>
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
