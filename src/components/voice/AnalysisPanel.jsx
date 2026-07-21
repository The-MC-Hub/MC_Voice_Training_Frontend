import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioLines, BarChart3, Award, Clock, Sparkles, Info, Loader2, Download } from "lucide-react";
import TypewriterMarkdown from "../TypewriterMarkdown";
import SampleComparisonCard from "./SampleComparisonCard";

export default function AnalysisPanel({
  result, analyzing,
  analyzeProgress, analyzePhase, ANALYZE_PHASES,
  accuracy, energy, pace, pacePercent,
  overallScore, overallLevel, completionPercent, paceInsight,
  feedbackItems, expertTips, markdownReport,
  history, clampMetric,
  t, t_vp,
  leftWidth,
  audioUrl, sampleAudioUrl,
  lessonTitle,
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const element = document.getElementById("voice-report-pdf-content");
    if (!element) return;
    setIsDownloading(true);
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const opt = {
        margin: 10,
        filename: `BaoCaoLuyenDoc_${(lessonTitle || "bai-tap").replace(/[^\p{L}\p{N}]+/gu, "_")}_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0a0a0b" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      const generator = typeof html2pdf === "function" ? html2pdf : html2pdf.default;
      await generator().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF export failed:", err);
      alert(t_vp("pdfExportError"));
    } finally {
      setIsDownloading(false);
    }
  };
  return (
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
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {isDownloading ? t_vp("pdfGenerating") : t_vp("pdfDownload")}
          </button>

          <div id="voice-report-pdf-content" className="space-y-4">
          {/* Vocal dynamics */}
          <div className="rounded-md border border-white/[0.07] bg-[#111113] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-white">{t("voicePractice.vocalDynamics")}</h3>
              <AudioLines size={15} className="text-blue-400" />
            </div>
            <div className="space-y-2">
              {[
                { label: t_vp("clarity"), value: accuracy, pct: accuracy, accent: "#f5a623", unit: "%", desc: t_vp("clarityDesc") },
                { label: t_vp("energy"), value: energy, pct: energy, accent: "#3b82f6", unit: "%", desc: t_vp("energyDesc") },
                { label: t_vp("pace"), value: pace, pct: pacePercent, accent: "#10b981", unit: " wpm", desc: t_vp("paceDesc") },
              ].map((m) => (
                <div key={m.label} className="group/m flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-[12px] text-zinc-500 w-20 shrink-0">{m.label}</span>
                  <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ backgroundColor: m.accent }} />
                  </div>
                  <span className="text-[12px] font-semibold text-white w-14 text-right tabular-nums shrink-0">{`${m.value.toFixed(0)}${m.unit}`}</span>
                  <div className="relative cursor-help shrink-0">
                    <Info size={11} className="text-zinc-700 group-hover/m:text-zinc-500 transition-colors" />
                    <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-44 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-300 leading-relaxed opacity-0 group-hover/m:opacity-100 transition-opacity z-50 shadow-xl">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sampleAudioUrl && (
            <SampleComparisonCard userAudioUrl={audioUrl} sampleAudioUrl={sampleAudioUrl} />
          )}

          {/* Voice Quality — Phase 2+3 */}
          {(result.voice_quality || result.spectral_features || result.filler_words || result.wer_rate > 0 || result.cer_rate > 0) && (
            <div className="rounded-md border border-white/[0.07] bg-[#111113] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-white">Voice Quality</h3>
                <BarChart3 size={15} className="text-purple-400" />
              </div>
              <div className="space-y-3">
                {result.voice_quality && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Jitter", value: result.voice_quality.jitter_pct, unit: "%", color: (v) => v < 1.0 ? "text-emerald-400" : v < 2.0 ? "text-amber-400" : "text-red-400", tooltip: t_vp("jitterTooltip") },
                      { label: "Shimmer", value: result.voice_quality.shimmer_pct, unit: "%", color: (v) => v < 3.0 ? "text-emerald-400" : v < 5.0 ? "text-amber-400" : "text-red-400", tooltip: t_vp("shimmerTooltip") },
                      { label: "HNR", value: result.voice_quality.hnr_db, unit: "dB", color: (v) => v >= 15 ? "text-emerald-400" : v >= 10 ? "text-amber-400" : "text-red-400", tooltip: t_vp("hnrTooltip") },
                    ].map((m) => (
                      <div key={m.label} className="p-3 rounded-md bg-[#09090b] border border-white/[0.05] text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-[10px] text-zinc-600">{m.label}</span>
                          {m.tooltip && (
                            <div className="relative group/tt cursor-help">
                              <Info size={9} className="text-zinc-700" />
                              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">{m.tooltip}</div>
                            </div>
                          )}
                        </div>
                        <p className={`text-[15px] font-bold tabular-nums ${m.color(m.value)}`}>
                          {(m.value ?? 0).toFixed(1)}<span className="text-[10px] text-zinc-600">{m.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {result.spectral_features && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-md bg-[#09090b] border border-white/[0.05]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] text-zinc-600">Spectral Centroid</span>
                        <div className="relative group/tt cursor-help"><Info size={9} className="text-zinc-700" /><div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">{t_vp("spectralCentroidTooltip")}</div></div>
                      </div>
                      <p className={`text-[14px] font-bold tabular-nums ${(result.spectral_features.spectral_centroid_hz ?? 0) < 1500 ? "text-amber-400" : "text-emerald-400"}`}>
                        {Math.round(result.spectral_features.spectral_centroid_hz ?? 0)}<span className="text-[10px] text-zinc-600"> Hz</span>
                      </p>
                    </div>
                    <div className="p-3 rounded-md bg-[#09090b] border border-white/[0.05]">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] text-zinc-600">MFCC Stability</span>
                        <div className="relative group/tt cursor-help"><Info size={9} className="text-zinc-700" /><div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">{t_vp("mfccStabilityTooltip")}</div></div>
                      </div>
                      <p className={`text-[14px] font-bold tabular-nums ${(result.spectral_features.mfcc_stability_score ?? 0) >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
                        {(result.spectral_features.mfcc_stability_score ?? 0).toFixed(1)}<span className="text-[10px] text-zinc-600">/100</span>
                      </p>
                    </div>
                  </div>
                )}
                {result.pitch_contour && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-[#09090b] border border-white/[0.05]">
                    <div className="flex items-center gap-1 w-24 shrink-0">
                      <span className="text-[11px] text-zinc-500">Pitch Contour</span>
                      <div className="relative group/tt cursor-help"><Info size={9} className="text-zinc-700" /><div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">{t_vp("pitchContourTooltip")}</div></div>
                    </div>
                    <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-md ${result.pitch_contour.pitch_contour === "rising" ? "bg-cyan-500/10 text-cyan-400" : result.pitch_contour.pitch_contour === "falling" ? "bg-purple-500/10 text-purple-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {result.pitch_contour.pitch_contour === "rising" ? "↗ Rising" : result.pitch_contour.pitch_contour === "falling" ? "↘ Falling" : "→ Flat"}
                    </span>
                    <span className="text-[11px] text-zinc-600 ml-auto tabular-nums">{(result.pitch_contour.pitch_slope ?? 0).toFixed(2)} st/s</span>
                  </div>
                )}
                {result.filler_words && result.filler_words.filler_count > 0 && (
                  <div className="p-3 rounded-md bg-amber-500/[0.04] border border-amber-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-zinc-500">Filler Words</span>
                        <div className="relative group/tt cursor-help"><Info size={9} className="text-zinc-700" /><div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl">{t_vp("fillerWordsTooltip")}</div></div>
                      </div>
                      <span className="text-[12px] font-semibold text-amber-400">{result.filler_words.filler_count} detected</span>
                    </div>
                    {result.filler_words.fillers_found?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.filler_words.fillers_found.slice(0, 5).map((f, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15">{f.word} ×{f.count}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {(result.wer_rate > 0 || result.cer_rate > 0) && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "WER", value: result.wer_rate, unit: "%", desc: t_vp("werTooltip"), color: (v) => v < 15 ? "text-emerald-400" : v < 30 ? "text-amber-400" : "text-red-400" },
                      { label: "CER", value: result.cer_rate, unit: "%", desc: t_vp("cerTooltip"), color: (v) => v < 10 ? "text-emerald-400" : v < 20 ? "text-amber-400" : "text-red-400" },
                    ].map((m) => (
                      <div key={m.label} className="p-3 rounded-md bg-[#09090b] border border-white/[0.05]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[10px] text-zinc-600">{m.label}</span>
                          <div className="relative group/tt cursor-help"><Info size={9} className="text-zinc-700" /><div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-md bg-[#1a1a1e] border border-white/[0.08] p-3 text-[11px] text-zinc-400 leading-relaxed opacity-0 group-hover/tt:opacity-100 transition-opacity z-50 shadow-xl text-left">{m.desc}</div></div>
                        </div>
                        <p className={`text-[15px] font-bold tabular-nums ${m.color(m.value)}`}>
                          {(m.value ?? 0).toFixed(1)}<span className="text-[10px] text-zinc-600">{m.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className={`rounded-md border transition-all ${result ? "border-[#f5a623]/20 bg-[#111113]" : analyzing ? "border-[#f5a623]/15 bg-[#111113]" : "border-[#f5a623]/10 bg-[#f5a623]/[0.02]"}`}>
            <div className={`flex items-center gap-2 px-5 py-4 border-b ${result ? "border-[#f5a623]/10" : "border-[#f5a623]/[0.07]"}`}>
              <Sparkles size={14} className="text-[#f5a623]" />
              <h3 className="text-[13px] font-semibold text-white">{t_vp("aiAnalysis")}</h3>
              {result && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Done</span>}
            </div>
            {result ? (
              <div className="p-5 space-y-4">
                {markdownReport && (
                  <div className="relative rounded-md bg-[#09090b] border border-white/[0.05] overflow-hidden">
                    <div className="absolute top-0 left-0 w-[3px] h-full bg-[#f5a623]/40" />
                    <div className="pl-5 pr-4 py-4 prose prose-invert prose-sm max-w-none prose-headings:text-[13px] prose-headings:font-semibold prose-headings:text-[#f5a623] prose-headings:mb-1 prose-headings:mt-3 prose-p:text-[13px] prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:my-1 prose-strong:text-white prose-strong:font-semibold prose-li:text-[13px] prose-li:text-zinc-300 prose-ul:my-1 prose-ol:my-1">
                      <TypewriterMarkdown content={markdownReport} />
                    </div>
                  </div>
                )}
                {feedbackItems.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">{t_vp("feedbackBreakdown")}</p>
                    <div className="space-y-1">
                      {feedbackItems.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.05 }} className="flex items-start gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                          <span className="w-1 h-1 rounded-full bg-blue-400 mt-[6px] shrink-0" />
                          <p className="text-[13px] text-zinc-300 leading-relaxed">{item}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {expertTips.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">{t_vp("coachingTips")}</p>
                    <div className="space-y-2">
                      {expertTips.map((tip, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-md bg-[#f5a623]/[0.04] border border-[#f5a623]/10">
                          <span className="text-[#f5a623] text-[16px] shrink-0 leading-none mt-0.5">✦</span>
                          <div>
                            {tip.label && <p className="text-[11px] font-semibold text-[#f5a623] mb-0.5">{tip.label}</p>}
                            <p className="text-[12px] text-zinc-300 leading-relaxed">{tip.tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : analyzing ? (
              <div className="py-10 px-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 flex items-center justify-center mb-4">
                  <Loader2 size={20} className="text-[#f5a623] animate-spin" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={analyzePhase} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="text-[13px] font-medium text-white mb-4 text-center">
                    {analyzePhase}
                  </motion.p>
                </AnimatePresence>
                <div className="w-full max-w-[240px] mb-3">
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div className="h-full rounded-full bg-[#f5a623]" animate={{ width: `${analyzeProgress}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-zinc-600">{t_vp("aiProcessing")}</span>
                    <span className="text-[10px] font-semibold text-[#f5a623]">{analyzeProgress}%</span>
                  </div>
                </div>
                <div className="w-full max-w-[240px] space-y-1.5 mt-2">
                  {ANALYZE_PHASES.map((p, i) => {
                    const done = analyzeProgress >= p.target;
                    const active = analyzePhase === p.label;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${done ? "bg-emerald-500" : active ? "bg-[#f5a623] animate-pulse" : "bg-zinc-700"}`} />
                        <span className={`text-[11px] transition-colors duration-300 ${done ? "text-emerald-500/70" : active ? "text-zinc-300" : "text-zinc-600"}`}>{p.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center px-5">
                <div className="w-10 h-10 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={16} className="text-[#f5a623]/40" />
                </div>
                <p className="text-[13px] font-medium text-zinc-400 mb-1">{t_vp("lockedAnalysis")}</p>
                <p className="text-[11px] text-zinc-600 leading-relaxed max-w-[180px] mx-auto">{t_vp("recordToUnlock")}</p>
              </div>
            )}
          </div>

          {/* Performance summary */}
          <div className="rounded-md border border-white/[0.07] bg-[#111113] p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#f5a623]" />
                <h3 className="text-[13px] font-semibold text-white">{t("performanceSummary")}</h3>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${result ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-zinc-600"}`}>
                {result ? `✓ ${t("ready")}` : `⏳ ${t("waiting")}`}
              </span>
            </div>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-[#09090b] border border-white/[0.06]">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-[11px] text-zinc-600 mb-1">{t("overallScore")}</p>
                      <div className="flex items-end gap-3">
                        <p className="text-4xl font-bold text-white">{overallScore.toFixed(1)}<span className="text-xl text-zinc-400">%</span></p>
                        {history.length >= 1 && (() => {
                          const prev = clampMetric(Number(history[0].accuracyScore || 0) * 0.45 + Number(history[0].rhythmScore || 0) * 0.35 + (Math.min(Number(history[0].speakingRateWpm || 0), 180) / 180) * 20);
                          const delta = overallScore - prev;
                          if (Math.abs(delta) < 0.1) return <span className="text-[11px] text-zinc-600 mb-1">{t_vp("sameAsLastTime")}</span>;
                          return <span className={`text-[12px] font-semibold mb-1 ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>{delta > 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%</span>;
                        })()}
                      </div>
                    </div>
                    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-md bg-white/[0.06] ${overallLevel.color}`}>{overallLevel.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f5a623] rounded-full transition-all duration-700" style={{ width: `${overallScore}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-md bg-[#09090b] border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-2"><BarChart3 size={13} className="text-cyan-400" /><p className="text-[10px] text-zinc-600 uppercase tracking-wider">{t("coverage")}</p></div>
                    <p className="text-2xl font-bold text-white">{completionPercent.toFixed(0)}<span className="text-sm text-zinc-500">%</span></p>
                  </div>
                  <div className="p-4 rounded-md bg-[#09090b] border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-2"><Clock size={13} className="text-purple-400" /><p className="text-[10px] text-zinc-600 uppercase tracking-wider">Pace</p></div>
                    <p className="text-2xl font-bold text-white">{pace.toFixed(0)}<span className="text-sm text-zinc-500"> wpm</span></p>
                  </div>
                </div>
                <p className={`text-[12px] leading-relaxed ${paceInsight.color}`}>{paceInsight.text}</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <BarChart3 size={24} className="mx-auto mb-2 text-zinc-800" />
                <p className="text-[13px] text-zinc-600">{t("recordToUnlock")}</p>
              </div>
            )}
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
