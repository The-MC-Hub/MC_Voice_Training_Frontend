import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuestGuide } from "../contexts/QuestGuideContext";

const PAD = 12;
const TOOLTIP_W = 300;
const TOOLTIP_GAP = 16;

const getRect = (target) => {
  const el = document.querySelector(`[data-quest="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const top    = Math.max(0, r.top - PAD);
  const left   = Math.max(0, r.left - PAD);
  const bottom = Math.min(vh, r.bottom + PAD);
  const right  = Math.min(vw, r.right + PAD);

  return {
    top,
    left,
    width: right - left,
    height: bottom - top,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
    bottom,
    right,
  };
};

const QuestGuideTour = () => {
  const { t } = useTranslation();
  const { active, questId, currentStep, stepIdx, steps, nextStep, prevStep, endGuide, waitingForNav } = useQuestGuide();

  // Quest accent color map
  const QUEST_COLORS = {
    profile:     { accent: "#16a34a", bg: "#f0fdf4", label: t('questGuide.profile') },
    practice:    { accent: "#16a34a", bg: "#f0fdf4", label: t('questGuide.practice') },
    courses:     { accent: "#16a34a", bg: "#f0fdf4", label: t('questGuide.courses') },
    reading:     { accent: "#16a34a", bg: "#f0fdf4", label: t('questGuide.reading') },
    leaderboard: { accent: "#16a34a", bg: "#f0fdf4", label: t('questGuide.leaderboard') },
  };
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [arrowLeft, setArrowLeft] = useState(50);
  const [arrowDir, setArrowDir] = useState("up"); // "up" = tooltip below element, "down" = tooltip above

  const colors = QUEST_COLORS[questId] || QUEST_COLORS.profile;
  const isLast = stepIdx === steps.length - 1;

  const recalc = useCallback(() => {
    if (!currentStep) return;
    const r = getRect(currentStep.target);
    setRect(r);
    if (!r) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const TOOLTIP_H = 200;

    let top;
    let left = r.centerX - TOOLTIP_W / 2;
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));

    let dir = "up";
    // Element taller than half viewport — place tooltip at center of visible area
    if (r.height > vh * 0.5) {
      top = Math.max(80, (vh - TOOLTIP_H) / 2);
      // Arrow direction based on which side of center the element's center is
      dir = "none"; // no arrow needed — element fills the background
    } else if (r.bottom + TOOLTIP_GAP + TOOLTIP_H <= vh) {
      // Fits below element — arrow points up (▲)
      top = r.bottom + TOOLTIP_GAP;
      dir = "up";
    } else if (r.top - TOOLTIP_GAP - TOOLTIP_H >= 0) {
      // Fits above element — arrow points down (▼)
      top = r.top - TOOLTIP_GAP - TOOLTIP_H;
      dir = "down";
    } else {
      // Fallback: center vertically
      top = Math.max(80, (vh - TOOLTIP_H) / 2);
      dir = "none";
    }

    setTooltipPos({ top, left });
    setArrowLeft(Math.max(16, Math.min(r.centerX - left, TOOLTIP_W - 16)));
    setArrowDir(dir);
  }, [currentStep]);

  useEffect(() => {
    if (!active) return;

    // Scroll target into view, then recalc
    const scrollAndRecalc = () => {
      if (!currentStep) return;
      const el = document.querySelector(`[data-quest="${currentStep.target}"]`);
      if (el) {
        // Scroll the nearest scrollable ancestor to top so element is visible from top
        const scrollable = el.closest('[class*="overflow-y-auto"]') || el.closest('[style*="overflow"]');
        if (scrollable) {
          scrollable.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        setTimeout(recalc, 400);
      } else {
        recalc();
      }
    };

    // Lock body scroll while guide active
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    scrollAndRecalc();

    const retry = setInterval(() => {
      if (!currentStep) return;
      const el = document.querySelector(`[data-quest="${currentStep.target}"]`);
      if (el) { scrollAndRecalc(); clearInterval(retry); }
    }, 150);
    const timeout = setTimeout(() => clearInterval(retry), 4000);
    window.addEventListener("resize", recalc);

    return () => {
      window.removeEventListener("resize", recalc);
      document.body.style.overflow = prevOverflow;
      clearInterval(retry);
      clearTimeout(timeout);
    };
  }, [active, currentStep, recalc]);

  // Waiting badge — shown while user navigates to dynamic page
  if (waitingForNav) {
    const wColors = QUEST_COLORS[questId] || QUEST_COLORS.profile;
    return (
      <AnimatePresence>
        <motion.div
          key="quest-waiting"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: wColors.accent,
            borderRadius: "999px",
            padding: "0.625rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.9)", flexShrink: 0 }}
          />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
            {t('questGuide.clickToContinue')}
          </span>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!active || !currentStep) return null;

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Backdrop — blocks clicks on page content behind guide */}
          <motion.div
            key="quest-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0"
            style={{ zIndex: 9997 }}
          />

          {/* SVG spotlight mask */}
          <motion.div
            key="quest-mask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              className="fixed inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 9998 }}
            >
              <defs>
                <mask id="quest-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {rect && (
                    <rect
                      x={rect.left} y={rect.top}
                      width={rect.width} height={rect.height}
                      rx={10} fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%" height="100%"
                fill="rgba(0,0,0,0.68)"
                mask="url(#quest-mask)"
              />
              {rect && (
                <rect
                  x={rect.left} y={rect.top}
                  width={rect.width} height={rect.height}
                  rx={10} fill="none"
                  stroke={colors.accent}
                  strokeWidth="2"
                  strokeOpacity="0.8"
                />
              )}
            </svg>
          </motion.div>

          {/* Pulse ring */}
          {rect && (
            <motion.div
              key={`quest-pulse-${stepIdx}`}
              initial={{ opacity: 0.7, scale: 1 }}
              animate={{ opacity: 0, scale: 1.18 }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: rect.top - 4,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 8,
                borderRadius: 14,
                border: `2px solid ${colors.accent}`,
                zIndex: 9998,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={`quest-tooltip-${stepIdx}`}
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_W,
              zIndex: 9999,
            }}
          >
            {/* Arrow pointing up (▲) — tooltip is below element */}
            {arrowDir === "up" && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: arrowLeft - 8,
                  width: 16,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div style={{
                  width: 14,
                  height: 14,
                  background: "white",
                  transform: "rotate(45deg)",
                  marginTop: 7,
                  marginLeft: 1,
                  boxShadow: "-2px -2px 4px rgba(0,0,0,0.08)",
                }} />
              </div>
            )}
            {/* Arrow pointing down (▼) — tooltip is above element */}
            {arrowDir === "down" && (
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: arrowLeft - 8,
                  width: 16,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div style={{
                  width: 14,
                  height: 14,
                  background: "white",
                  transform: "rotate(45deg)",
                  marginTop: -7,
                  marginLeft: 1,
                  boxShadow: "2px 2px 4px rgba(0,0,0,0.08)",
                }} />
              </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)" }}>
              {/* Gradient header */}
              <div
                className="px-4 pt-4 pb-3 relative"
                style={{ background: colors.accent }}
              >
                {/* Badge + close row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20">
                    <MapPin size={9} className="text-white/90" />
                    <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">{colors.label}</span>
                  </div>
                  <button
                    onClick={endGuide}
                    className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <X size={11} className="text-white" />
                  </button>
                </div>
                <h3 className="text-[16px] font-bold text-white leading-tight tracking-tight">
                  {currentStep.title}
                </h3>
              </div>

              {/* Body */}
              <div className="bg-white px-4 pt-3 pb-4">
                <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                  {currentStep.desc}
                </p>

                {/* Footer: dots + nav */}
                <div className="flex items-center justify-between">
                  {/* Step dots */}
                  <div className="flex items-center gap-1">
                    {steps.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          width: i === stepIdx ? 18 : 5,
                          backgroundColor: i < stepIdx ? colors.accent + "80" : i === stepIdx ? colors.accent : "#e5e7eb",
                        }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: 5, borderRadius: 99 }}
                      />
                    ))}
                  </div>

                  {/* Nav buttons */}
                  <div className="flex items-center gap-1.5">
                    {stepIdx > 0 && (
                      <button
                        onClick={prevStep}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all active:scale-95"
                      >
                        <ChevronLeft size={14} />
                      </button>
                    )}
                    {!isLast && (
                      <button
                        onClick={endGuide}
                        className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors px-1"
                      >
                        {t('questGuide.skip')}
                      </button>
                    )}
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[12px] font-bold transition-all active:scale-95 hover:opacity-90"
                      style={{ background: colors.accent }}
                    >
                      {isLast ? t('questGuide.finish') : t('questGuide.next')}
                      {!isLast && <ChevronRight size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuestGuideTour;
