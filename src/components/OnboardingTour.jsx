import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronRight } from "lucide-react";
import { useTour } from "../contexts/TourContext";
import { trackOnboardingTourSkip, trackOnboardingTourComplete } from '@/utils/analytics';

const PAD = 10; // spotlight padding px

const getRect = (targetId) => {
  const el = document.querySelector(`[data-tour="${targetId}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
    bottom: r.bottom + PAD,
    right: r.right + PAD,
  };
};

const TOOLTIP_W = 300;
const TOOLTIP_GAP = 14; // gap between spotlight edge and tooltip

const OnboardingTour = () => {
  const { active, currentStep, steps, stepIdx, nextStep, endTour } = useTour();
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [arrowStyle, setArrowStyle] = useState({});

  const recalc = useCallback(() => {
    if (!currentStep) return;
    const r = getRect(currentStep.target);
    setRect(r);
    if (!r) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Tooltip always below the spotlight (navbar items are at top)
    let top = r.bottom + TOOLTIP_GAP;
    let left = r.centerX - TOOLTIP_W / 2;

    // Clamp horizontally
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));

    // If would overflow bottom, flip above
    if (top + 160 > vh) {
      top = r.top - TOOLTIP_GAP - 160;
    }

    setTooltipPos({ top, left });

    // Arrow points from tooltip up to spotlight center
    const arrowLeft = r.centerX - left;
    setArrowStyle({ left: Math.max(16, Math.min(arrowLeft, TOOLTIP_W - 16)) });
  }, [currentStep]);

  useEffect(() => {
    if (!active) return;
    recalc();
    // Retry if DOM not ready yet (nav elements may still be mounting)
    const retry = setInterval(() => {
      if (currentStep && !document.querySelector(`[data-tour="${currentStep.target}"]`)) return;
      recalc();
      clearInterval(retry);
    }, 150);
    const timeout = setTimeout(() => clearInterval(retry), 3000);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      clearInterval(retry);
      clearTimeout(timeout);
    };
  }, [active, currentStep, recalc]);

  if (!active || !currentStep) return null;

  const isLast = stepIdx === steps.length - 1;

  // SVG spotlight mask: full dark overlay with a transparent cutout
  const svgMask = rect ? (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9998 }}
    >
      <defs>
        <mask id="tour-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect
            x={rect.left}
            y={rect.top}
            width={rect.width}
            height={rect.height}
            rx={10}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.72)"
        mask="url(#tour-mask)"
      />
      {/* Spotlight border ring */}
      <rect
        x={rect.left}
        y={rect.top}
        width={rect.width}
        height={rect.height}
        rx={10}
        fill="none"
        stroke="rgba(245,166,35,0.7)"
        strokeWidth="2"
      />
    </svg>
  ) : (
    <div className="fixed inset-0 bg-black/72 pointer-events-none" style={{ zIndex: 9998 }} />
  );

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Overlay + spotlight mask */}
          <motion.div
            key="tour-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0"
            style={{ zIndex: 9997 }}
            onClick={endTour}
          />
          <motion.div
            key="tour-mask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {svgMask}
          </motion.div>

          {/* Tooltip card */}
          <motion.div
            key={`tour-tooltip-${stepIdx}`}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_W,
              zIndex: 9999,
            }}
          >
            {/* Arrow pointing UP to spotlight */}
            <div
              className="absolute -top-2 w-4 h-2 overflow-hidden"
              style={{ left: arrowStyle.left - 8 }}
            >
              <div
                className="w-4 h-4 bg-white rotate-45 shadow-md"
                style={{ marginTop: 6 }}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-4 pt-3.5 pb-3 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest mb-0.5">
                    Bước {stepIdx + 1} / {steps.length}
                  </p>
                  <h3 className="text-[15px] font-bold text-white leading-tight">
                    {currentStep.title}
                  </h3>
                </div>
                <button
                  onClick={endTour}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0 ml-3 mt-0.5"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="px-4 py-3.5">
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                  {currentStep.desc}
                </p>

                {/* Step dots + buttons */}
                <div className="flex items-center justify-between">
                  {/* Dot progress */}
                  <div className="flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          width: i === stepIdx ? 16 : 6,
                          backgroundColor: i <= stepIdx ? "#f59e0b" : "#e5e7eb",
                        }}
                        transition={{ duration: 0.25 }}
                        className="h-1.5 rounded-full"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isLast && (
                      <button
                        onClick={() => { trackOnboardingTourSkip(); endTour(); }}
                        className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Bỏ qua
                      </button>
                    )}
                    <button
                      onClick={() => { if (isLast) { trackOnboardingTourComplete(); } nextStep(); }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold transition-colors active:scale-95"
                    >
                      {isLast ? "Hoàn tất" : "Tiếp theo"}
                      {isLast ? null : <ChevronRight size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pulse ring on spotlight */}
          {rect && (
            <motion.div
              key={`pulse-${stepIdx}`}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: rect.top - 4,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 8,
                borderRadius: 14,
                border: "2px solid rgba(245,166,35,0.9)",
                zIndex: 9998,
                pointerEvents: "none",
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
