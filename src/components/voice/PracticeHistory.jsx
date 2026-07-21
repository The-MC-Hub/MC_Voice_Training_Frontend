import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, GitCompare, X } from "lucide-react";
import { clampMetric } from "../../hooks/useVoicePractice";

// Side-by-side playback + score delta for two picked attempts — lets the user
// hear how their reading actually changed, not just compare numbers.
function CompareBar({ selected, onClear, calcScore, t_vp }) {
  if (selected.length !== 2) return null;
  const [older, newer] = [...selected].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const delta = calcScore(newer) - calcScore(older);
  const fmtDate = (d) => { const dt = new Date(d); return isNaN(dt.getTime()) ? "?" : dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mb-3 p-4 rounded-md bg-violet-500/[0.05] border border-violet-500/20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-semibold text-violet-300 flex items-center gap-1.5"><GitCompare size={13} /> {t_vp("compareTwoAttempts")}</p>
          <button onClick={onClear} className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 hover:text-white"><X size={12} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[older, newer].map((h, i) => (
            <div key={h.id} className="p-3 rounded-md bg-[#111113] border border-white/[0.07]">
              <p className="text-[10px] text-zinc-600 mb-1">{i === 0 ? t_vp("previousAttempt") : t_vp("thisAttempt")} · {fmtDate(h.createdAt)}</p>
              <p className="text-[15px] font-bold text-white mb-1.5">{calcScore(h).toFixed(1)}%</p>
              {h.audioUrl
                ? <audio controls src={h.audioUrl} className="w-full h-8" style={{ filter: "invert(0.9)" }} />
                : <p className="text-[10px] text-zinc-700 italic">{t_vp("noRecording")}</p>}
            </div>
          ))}
        </div>
        <p className={`text-[12px] font-semibold text-center mt-3 ${delta >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
          {delta >= 0 ? t_vp("progressUp") : t_vp("progressDown")} {Math.abs(delta).toFixed(1)}% {t_vp("comparedToLastTime")}
        </p>
      </div>
    </motion.div>
  );
}

export default function PracticeHistory({
  history, currentPage, setCurrentPage, itemsPerPage, courseId, navigate, t, t_vp,
}) {
  const [compareIds, setCompareIds] = useState([]);
  if (!history.length) return null;

  const toggleCompare = (h, e) => {
    e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(h.id)) return prev.filter((id) => id !== h.id);
      if (prev.length >= 2) return [prev[1], h.id]; // keep most recent 2 picks
      return [...prev, h.id];
    });
  };
  const selectedRecords = history.filter((h) => compareIds.includes(h.id));

  // Prefer the AI's own weighted overall_score; fall back to the fixed formula
  // only for older records saved before this field was tracked.
  const calcScore = (h) => {
    const aiScore = Number(h.overallScore || 0);
    if (aiScore > 0) return clampMetric(aiScore);
    return clampMetric(
      Number(h.accuracyScore || 0) * 0.45 +
      Number(h.rhythmScore || 0) * 0.35 +
      (Math.min(Number(h.speakingRateWpm || 0), 180) / 180) * 20
    );
  };

  const scores = [...history].reverse().slice(-8).map(calcScore);
  const min = Math.min(...scores), max = Math.max(...scores);
  const range = max - min || 1;
  const W = 80, H = 28, pad = 3;
  const pts = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = H - pad - ((s - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const lastScore = scores[scores.length - 1];
  const trend = scores.length >= 2 ? lastScore - scores[scores.length - 2] : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-white">
          {t_vp("pastAttempts")}
          <span className="ml-2 text-[11px] text-zinc-600">({history.length})</span>
        </h3>
        {history.length >= 2 && (
          <div className="flex items-center gap-2">
            <svg width={W} height={H} className="overflow-visible">
              <polyline points={pts} fill="none" stroke="rgba(245,166,35,0.4)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
              {scores.map((s, i) => {
                const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
                const y = H - pad - ((s - min) / range) * (H - pad * 2);
                return i === scores.length - 1
                  ? <circle key={i} cx={x} cy={y} r="3" fill="#f5a623" />
                  : <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(245,166,35,0.5)" />;
              })}
            </svg>
            <span className={`text-[11px] font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend >= 0 ? "↑" : "↓"}{Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        <CompareBar selected={selectedRecords} onClear={() => setCompareIds([])} calcScore={calcScore} t_vp={t_vp} />
      </AnimatePresence>

      {history.length >= 2 && (
        <p className="text-[10px] text-zinc-600 mb-2">
          {compareIds.length === 0 ? t_vp("selectTwoToCompare") : compareIds.length === 1 ? t_vp("selectOneMoreToCompare") : ""}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((h, i) => (
            <motion.div
              key={h.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => navigate(`/m/voice/report/${h.id}${courseId ? `?courseId=${courseId}` : ""}`)}
              className={`relative cursor-pointer p-4 rounded-md bg-[#111113] border transition-colors ${compareIds.includes(h.id) ? "border-violet-500/50 bg-violet-500/[0.03]" : "border-white/[0.07] hover:border-[#f5a623]/20 hover:bg-[#f5a623]/[0.02]"}`}
            >
              <button
                onClick={(e) => toggleCompare(h, e)}
                title={t_vp("selectToCompare")}
                className={`absolute top-3 right-3 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${compareIds.includes(h.id) ? "bg-violet-500 border-violet-500 text-white" : "border-white/[0.15] text-transparent hover:border-violet-400"}`}
              >
                <GitCompare size={11} />
              </button>
              <div className="flex justify-between items-start mb-3 pr-7">
                <p className="text-[11px] text-zinc-600">
                  {(() => {
                    const d = new Date(h.createdAt);
                    return isNaN(d.getTime()) ? t_vp("recentSession") : d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                  })()}
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20">Done</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] text-zinc-600">{t("overallScore")}</span>
                    <div className="relative group/tt cursor-help">
                      <Info size={9} className="text-zinc-700" />
                      <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-48 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">
                        {t_vp("overallScoreCardTooltip")}
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">{calcScore(h).toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] text-zinc-600">WPM</span>
                    <div className="relative group/tt cursor-help">
                      <Info size={9} className="text-zinc-700" />
                      <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-right">
                        {t_vp("wpmCardTooltip")}
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#f5a623]">{Math.round(h.speakingRateWpm || 0)}</p>
                </div>
              </div>
              <div className="mt-3 h-1 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${h.accuracyScore || 0}%` }} />
                <div className="h-full bg-blue-500" style={{ width: `${h.rhythmScore || 0}%` }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {history.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#111113] border border-white/[0.07] text-zinc-500 disabled:opacity-30 hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-[12px] text-zinc-600">{currentPage}/{Math.ceil(history.length / itemsPerPage)}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(Math.ceil(history.length / itemsPerPage), p + 1))} disabled={currentPage === Math.ceil(history.length / itemsPerPage)} className="w-7 h-7 flex items-center justify-center rounded-md bg-[#111113] border border-white/[0.07] text-zinc-500 disabled:opacity-30 hover:text-white transition-colors rotate-180">
            <ChevronLeft size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
