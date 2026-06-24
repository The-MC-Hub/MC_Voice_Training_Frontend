import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { STREAK_FRAMES } from './AvatarFrame';

// ─── Card visual config — edit to restyle the exported image ─────────────────
const CARD_WIDTH  = 560;
const CARD_HEIGHT = 240;
const CARD_RADIUS = 24;

const CARD_BG_COLOR      = '#ffffff';
const CARD_NAME_COLOR    = '#111827';
const CARD_SUB_COLOR     = '#6b7280';
const CARD_MUTED_COLOR   = '#9ca3af';
const CARD_DIVIDER_COLOR = '#f3f4f6';
const CARD_BRAND_TEXT    = 'MC Hub · Voice Training';

// Hero emoji per frame (same as StreakWidget)
const FRAME_HERO_EMOJI = {
  NONE:     '🌱',
  SPARK:    '🔥',
  FLAME:    '🔥',
  STORM:    '⚡',
  LEGEND:   '👑',
  ELITE:    '💎',
  IMMORTAL: '✨',
};

const FRAME_ACCENT_COLORS = {
  NONE:     '#9ca3af',
  SPARK:    '#f5a623',
  FLAME:    '#ff6b35',
  STORM:    '#ff4500',
  LEGEND:   '#eab308',
  ELITE:    '#0ea5e9',
  IMMORTAL: '#ec4899',
};

// ─── Canvas drawing ───────────────────────────────────────────────────────────
async function drawStreakCard(canvas, { user, streak }) {
  const ctx = canvas.getContext('2d');
  const W = CARD_WIDTH;
  const H = CARD_HEIGHT;
  const R = CARD_RADIUS;
  const frame  = STREAK_FRAMES[streak.streakFrame] || STREAK_FRAMES.NONE;
  const accent = FRAME_ACCENT_COLORS[streak.streakFrame] || '#f5a623';
  const emoji  = FRAME_HERO_EMOJI[streak.streakFrame] || '🌱';

  canvas.width  = W;
  canvas.height = H;

  // ── Background: white + accent tint corner ──────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, R);
  ctx.fillStyle = CARD_BG_COLOR;
  ctx.fill();

  const bgGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.65);
  bgGrd.addColorStop(0, accent + '12');
  bgGrd.addColorStop(1, 'transparent');
  ctx.fillStyle = bgGrd;
  ctx.fill();

  ctx.strokeStyle = accent + '30';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Left accent bar
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, 5, H, [R, 0, 0, R]);
  const barGrd = ctx.createLinearGradient(0, 0, 0, H);
  barGrd.addColorStop(0, accent);
  barGrd.addColorStop(1, accent + '55');
  ctx.fillStyle = barGrd;
  ctx.fill();
  ctx.restore();

  // ── Hero icon box ─────────────────────────────────────────────────────────────
  const BX = 26, BY = H / 2 - 38, BS = 76, BR = 16;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(BX, BY, BS, BS, BR);
  ctx.fillStyle = accent + '14';
  ctx.fill();
  ctx.strokeStyle = accent + '35';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.font = '36px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, BX + BS / 2, BY + BS / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Vertical divider
  const DX = BX + BS + 20;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(DX, 22);
  ctx.lineTo(DX, H - 22);
  ctx.strokeStyle = CARD_DIVIDER_COLOR;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // ── Text block ────────────────────────────────────────────────────────────────
  const TX = DX + 18;
  const CY  = H / 2;

  // Tier pill
  const tierLabel = (frame.label || '').toUpperCase();
  ctx.save();
  ctx.font = 'bold 9px system-ui, sans-serif';
  const pillW = ctx.measureText(tierLabel).width + 14;
  ctx.beginPath();
  ctx.roundRect(TX, CY - 68, pillW, 18, 9);
  ctx.fillStyle = accent + '1a';
  ctx.fill();
  ctx.strokeStyle = accent + '40';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.textBaseline = 'middle';
  ctx.fillText(tierLabel, TX + 7, CY - 59);
  ctx.restore();

  // Name
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = CARD_NAME_COLOR;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(user?.name || 'MC Hub User', TX, CY - 34);

  // Streak number
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(`${streak.loginStreak}`, TX, CY + 16);
  const numW = ctx.measureText(`${streak.loginStreak}`).width;

  // "ngày liên tiếp" inline
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = CARD_SUB_COLOR;
  ctx.fillText('ngày liên tiếp', TX + numW + 8, CY + 8);

  // Record
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = CARD_MUTED_COLOR;
  ctx.fillText(`🏆  Kỷ lục: ${streak.longestLoginStreak} ngày`, TX, CY + 36);

  // ── Progress bar ─────────────────────────────────────────────────────────────
  const PX = TX, PY = CY + 52, PW = W - TX - 28, PH = 6;
  const milestones = [3, 7, 14, 30, 60, 100];
  const nextM = milestones.find(m => m > streak.loginStreak) ?? streak.loginStreak;
  const prevM = milestones.filter(m => m <= streak.loginStreak).at(-1) ?? 0;
  const pct   = nextM === streak.loginStreak ? 1 : (streak.loginStreak - prevM) / (nextM - prevM);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(PX, PY, PW, PH, PH / 2);
  ctx.fillStyle = '#f3f4f6';
  ctx.fill();
  if (pct > 0) {
    const fillGrd = ctx.createLinearGradient(PX, 0, PX + PW, 0);
    fillGrd.addColorStop(0, accent + 'cc');
    fillGrd.addColorStop(1, accent);
    ctx.beginPath();
    ctx.roundRect(PX, PY, PW * pct, PH, PH / 2);
    ctx.fillStyle = fillGrd;
    ctx.fill();
  }
  ctx.restore();

  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = CARD_MUTED_COLOR;
  ctx.fillText(`${streak.loginStreak} / ${nextM} ngày`, PX, PY + 17);

  // ── Bottom brand strip ────────────────────────────────────────────────────────
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, H - 28, W, 28, [0, 0, R, R]);
  ctx.fillStyle = '#f9fafb';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, H - 28); ctx.lineTo(W, H - 28);
  ctx.strokeStyle = CARD_DIVIDER_COLOR;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.font = '10px system-ui, sans-serif';
  ctx.fillStyle = CARD_MUTED_COLOR;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CARD_BRAND_TEXT, W / 2, H - 14);
  ctx.textAlign = 'right';
  ctx.fillText(new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }), W - 14, H - 14);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── Modal component ──────────────────────────────────────────────────────────
const StreakCardModal = ({ open, onClose, user, streak }) => {
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open || !streak) return;
    setReady(false);
    setRendering(true);
    // No avatar loading needed — just draw
    drawStreakCard(canvasRef.current, { user, streak })
      .then(() => { setReady(true); setRendering(false); });
  }, [open, streak, user]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mchub-streak-${streak?.loginStreak ?? 0}-ngay.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const accent = FRAME_ACCENT_COLORS[streak?.streakFrame] || '#f5a623';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990]"
            onClick={onClose}
          />

          <motion.div
            key="sc-modal"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9991] w-full max-w-[520px] px-4"
          >
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">Ảnh chuỗi của bạn</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Lưu và chia sẻ thành tích luyện tập</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={13} className="text-gray-500" />
                </button>
              </div>

              {/* Canvas preview */}
              <div className="p-5 flex items-center justify-center bg-gray-50">
                {rendering && (
                  <div className="flex items-center gap-2 text-gray-400 py-10">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[12px]">Đang tạo ảnh...</span>
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  style={{
                    width: CARD_WIDTH / 1.5,
                    height: CARD_HEIGHT / 1.5,
                    borderRadius: 14,
                    display: rendering ? 'none' : 'block',
                    boxShadow: `0 4px 24px ${accent}20, 0 1px 4px rgba(0,0,0,0.08)`,
                  }}
                />
              </div>

              {/* Download */}
              <div className="px-5 pb-5 pt-1">
                <button
                  onClick={handleDownload}
                  disabled={!ready}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-black text-[13px] font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: accent }}
                >
                  <Download size={14} />
                  Tải về máy (.PNG)
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Ảnh PNG 480×240px · không có watermark
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StreakCardModal;
