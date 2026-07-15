import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Canvas-rendered certificate — single render path for both preview and download,
 * so the PNG users download is pixel-identical to what they see.
 */

const W = 1600, H = 1131;
const GOLD = '#f5a623';
const GOLD_LIGHT = '#fbd38d';

function drawCertificate(canvas, { name, courseTitle, date, certId, preview }) {
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  /* ── Background ── */
  ctx.fillStyle = '#0b0b0e';
  ctx.fillRect(0, 0, W, H);

  // corner glows
  const glow = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(0, 0, 700, 'rgba(245,166,35,0.10)');
  glow(W, H, 700, 'rgba(245,166,35,0.10)');
  glow(W / 2, H / 2, 900, 'rgba(245,166,35,0.04)');

  // subtle dot grid
  ctx.fillStyle = 'rgba(245,166,35,0.05)';
  for (let x = 40; x < W; x += 38) {
    for (let y = 40; y < H; y += 38) {
      ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ── Double frame ── */
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.strokeStyle = 'rgba(245,166,35,0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  // corner ornaments
  const corner = (cx, cy, sx, sy) => {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 70 * sx, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + 70 * sy);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(cx + 14 * sx, cy + 14 * sy, 4, 0, Math.PI * 2); ctx.fill();
  };
  corner(86, 86, 1, 1);
  corner(W - 86, 86, -1, 1);
  corner(86, H - 86, 1, -1);
  corner(W - 86, H - 86, -1, -1);

  /* ── Medal ── */
  const mx = W / 2, my = 200;
  // ribbon
  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  ctx.moveTo(mx - 26, my + 20); ctx.lineTo(mx - 44, my + 92); ctx.lineTo(mx - 14, my + 76); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(mx + 26, my + 20); ctx.lineTo(mx + 44, my + 92); ctx.lineTo(mx + 14, my + 76); ctx.closePath(); ctx.fill();
  // medal disc
  const mg = ctx.createRadialGradient(mx - 12, my - 12, 5, mx, my, 56);
  mg.addColorStop(0, GOLD_LIGHT);
  mg.addColorStop(1, GOLD);
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(mx, my, 52, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b97a10';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(mx, my, 52, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(185,122,16,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(mx, my, 42, 0, Math.PI * 2); ctx.stroke();
  // star in medal
  ctx.fillStyle = '#7c4a03';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a + Math.PI / 5;
    const R = 24, r = 10;
    if (i === 0) ctx.moveTo(mx + R * Math.cos(a), my + R * Math.sin(a));
    else ctx.lineTo(mx + R * Math.cos(a), my + R * Math.sin(a));
    ctx.lineTo(mx + r * Math.cos(a2), my + r * Math.sin(a2));
  }
  ctx.closePath(); ctx.fill();

  /* ── Text ── */
  ctx.textAlign = 'center';

  // brand
  ctx.fillStyle = '#fafafa';
  ctx.font = '600 34px Outfit, sans-serif';
  ctx.fillText('MC', mx - 34, 330);
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.arc(mx, 320, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fafafa';
  ctx.fillText('Hub', mx + 40, 330);

  // title
  ctx.fillStyle = GOLD;
  ctx.font = '700 76px "Playfair Display", serif';
  ctx.fillText('CHỨNG CHỈ HOÀN THÀNH', mx, 430);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '400 26px Outfit, sans-serif';
  ctx.fillText('Trân trọng trao tặng', mx, 500);

  // recipient name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 700 88px "Playfair Display", serif';
  ctx.fillText(name || 'Học viên MC Hub', mx, 610);

  // divider
  ctx.strokeStyle = 'rgba(245,166,35,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx - 260, 650); ctx.lineTo(mx + 260, 650);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.arc(mx, 650, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '400 26px Outfit, sans-serif';
  ctx.fillText('đã hoàn thành xuất sắc khóa học', mx, 712);

  // course title (wrap if long)
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = '700 48px Outfit, sans-serif';
  const words = (courseTitle || '').split(' ');
  const lines = [];
  let line = '';
  for (const w2 of words) {
    const test = line ? `${line} ${w2}` : w2;
    if (ctx.measureText(test).width > W - 420 && line) { lines.push(line); line = w2; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, mx, 778 + i * 60));
  const afterTitleY = 778 + (Math.min(lines.length, 2) - 1) * 60;

  ctx.fillStyle = '#71717a';
  ctx.font = '400 22px Outfit, sans-serif';
  ctx.fillText('với kết quả bài kiểm tra cuối khóa đạt yêu cầu của hội đồng MC Hub Academy', mx, afterTitleY + 56);

  /* ── Footer ── */
  const footY = H - 170;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#71717a';
  ctx.font = '400 20px Outfit, sans-serif';
  ctx.fillText('Ngày cấp', 200, footY);
  ctx.fillStyle = '#fafafa';
  ctx.font = '600 26px Outfit, sans-serif';
  ctx.fillText(date, 200, footY + 38);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#71717a';
  ctx.font = '400 20px Outfit, sans-serif';
  ctx.fillText('MC Hub Academy', W - 200, footY);
  ctx.fillStyle = GOLD;
  ctx.font = 'italic 700 34px "Playfair Display", serif';
  ctx.fillText('MC • Hub', W - 200, footY + 44);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W - 430, footY + 58); ctx.lineTo(W - 200, footY + 58);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#52525b';
  ctx.font = '400 18px "DM Mono", monospace';
  ctx.fillText(`Mã chứng chỉ: ${certId}`, mx, H - 92);

  /* ── Preview watermark ── */
  if (preview) {
    ctx.save();
    ctx.translate(mx, H / 2);
    ctx.rotate(-Math.PI / 7);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = '800 160px Outfit, sans-serif';
    ctx.fillText('XEM TRƯỚC', 0, 0);
    ctx.restore();
  }
}

const CertificateModal = ({ open, onClose, name, courseTitle, courseId, isCompleted }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [fontsReady, setFontsReady] = useState(false);

  const date = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const certId = `MCHUB-${String(courseId || '').slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // Ensure Playfair/Outfit glyphs loaded before canvas draw
    Promise.all([
      document.fonts.load('700 76px "Playfair Display"'),
      document.fonts.load('italic 700 88px "Playfair Display"'),
      document.fonts.load('600 34px Outfit'),
    ]).catch(() => {}).finally(() => { if (!cancelled) setFontsReady(true); });
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (open && fontsReady && canvasRef.current) {
      drawCertificate(canvasRef.current, { name, courseTitle, date, certId, preview: !isCompleted });
    }
  }, [open, fontsReady, name, courseTitle, isCompleted]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `MCHub-Certificate-${(courseTitle || 'khoa-hoc').replace(/\s+/g, '-')}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#f5a623]">
                <Award size={18} />
                <h3 className="text-[15px] font-semibold text-white">
                  {isCompleted ? t('certificateModal.yourCertificate') : t('certificateModal.previewCertificate')}
                </h3>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* certificate canvas */}
            <div className="rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(245,166,35,0.15)] border border-[#f5a623]/20">
              <canvas ref={canvasRef} className="w-full h-auto block" />
            </div>

            {/* footer */}
            <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
              <p className="text-[12px] text-zinc-400">
                {isCompleted
                  ? t('certificateModal.completedNote')
                  : t('certificateModal.previewNote')}
              </p>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] active:scale-[0.98] transition-all shrink-0">
                <Download size={14} /> {t('certificateModal.downloadPng')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CertificateModal;
