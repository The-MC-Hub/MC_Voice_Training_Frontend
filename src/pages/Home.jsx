import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic, ArrowRight, Sparkles, Award, Zap, BookOpen, X, ExternalLink, Copy,
  ChevronDown, Star, TrendingUp, CheckCircle2, BarChart3, AudioLines,
  MessageSquare, Quote
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/animations/ScrollReveal';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { fetchFeaturedTrainingStats } from '../controllers/publicController';
import { fetchLessons } from '../controllers/voiceController';
import LazyImage from '../components/ui/LazyImage';
import ScrollToTop from '../components/ui/ScrollToTop';
import ContactModal from '../components/modals/ContactModal';

// ─── Animation presets ────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};
const stagger = (i) => ({ ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.09 } });

// ─── Cursor spotlight + stage lights for Hero ─────────────────────────────────
const SpotlightHero = () => {
  const [pos, setPos] = useState({ x: 50, y: 50 }); // percent
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 50, y: 50 });
  const currentRef = useRef({ x: 50, y: 50 });

  const onMouseMove = useCallback((e) => {
    const pct = {
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    };
    targetRef.current = pct;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      currentRef.current = {
        x: lerp(currentRef.current.x, targetRef.current.x, 0.06),
        y: lerp(currentRef.current.y, targetRef.current.y, 0.06),
      };
      setPos({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onMouseMove]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Cursor-following spotlight */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(245,166,35,0.055) 0%, rgba(245,166,35,0.018) 40%, transparent 70%)',
          transition: 'none',
        }}
      />
      {/* Fixed stage left spotlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '15%', top: '-60px',
          width: '320px', height: '600px',
          background: 'conic-gradient(from 0deg at 50% 0%, transparent 70deg, rgba(245,166,35,0.04) 90deg, transparent 110deg)',
          filter: 'blur(1px)',
        }}
      />
      {/* Fixed stage right spotlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '15%', top: '-60px',
          width: '320px', height: '600px',
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 70deg, rgba(245,166,35,0.04) 90deg, transparent 110deg)',
          filter: 'blur(1px)',
        }}
      />
      {/* Sound wave rings */}
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: `${280 + i * 220}px`,
            height: `${280 + i * 220}px`,
            border: `1px solid rgba(245,166,35,${0.18 - i * 0.03})`,
            animation: `stage-pulse ${2.8 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes stage-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%,-50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// ─── CSS-only dot-grid background ─────────────────────────────────────────────
const GridBackground = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
      maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
    }}
  />
);

// ─── 1. Count-up hook ─────────────────────────────────────────────────────────
const useCountUp = (target, duration = 1800, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const started = useRef(false);

  useEffect(() => {
    if (startOnView && !inView) return;
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration, startOnView]);

  return { count, ref };
};

const CountMetric = ({ value, suffix = '', label }) => {
  const numeric = parseInt(value.replace(/\D/g, ''), 10);
  const { count, ref } = useCountUp(numeric);
  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl font-bold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-[12px] text-zinc-500 mt-1">{label}</p>
    </div>
  );
};

// ─── 2. FAQ Accordion ─────────────────────────────────────────────────────────
const faqs = [
  { q: 'AI phân tích giọng nói như thế nào?', a: 'Hệ thống ghi âm giọng đọc của bạn, sau đó AI so sánh với chuẩn MC chuyên nghiệp trên 5 tiêu chí: Phát âm, Nhịp điệu, Tốc độ, Cảm xúc và Độ chính xác. Kết quả trả về trong vòng 30 giây.' },
  { q: 'Tài khoản miễn phí có những tính năng gì?', a: 'Miễn phí cho phép 5 buổi luyện tập/ngày, truy cập 20 kịch bản cơ bản, xem điểm tổng thể và feedback ngắn. Gói Premium mở khóa không giới hạn phiên, 50+ kịch bản nâng cao và báo cáo chi tiết PDF.' },
  { q: 'Tôi cần thiết bị gì để sử dụng?', a: 'Chỉ cần trình duyệt Chrome/Firefox/Edge phiên bản mới nhất và microphone — laptop tích hợp hoặc USB mic đều hoạt động. Không cần cài phần mềm.' },
  { q: 'Kết quả phân tích có chính xác không?', a: 'Mô hình AI được huấn luyện trên hàng nghìn mẫu giọng MC chuyên nghiệp người Việt. Độ chính xác đạt >90% so với đánh giá thủ công từ chuyên gia trong các bài kiểm thử nội bộ.' },
  { q: 'Premium thanh toán như thế nào?', a: 'Chuyển khoản ngân hàng (MBBank). Sau khi chuyển đúng nội dung, hệ thống tự động kích hoạt trong vài phút. Gói Premium là một lần, không tự gia hạn.' },
  { q: 'Dữ liệu giọng nói của tôi có bị lưu không?', a: 'File ghi âm chỉ dùng để phân tích trong phiên hiện tại và không lưu vĩnh viễn. Điểm số và lịch sử được lưu vào tài khoản của bạn. Xem Chính sách bảo mật để biết thêm.' },
];

const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`border rounded-2xl overflow-hidden transition-colors ${open ? 'border-[#f5a623]/20 bg-[#111113]' : 'border-white/[0.07] bg-[#111113] hover:border-white/[0.12]'}`}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left gap-4 group">
        <span className={`text-[14px] font-medium transition-colors ${open ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className={`shrink-0 transition-colors ${open ? 'text-[#f5a623]' : 'text-zinc-600'}`}>
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="ans"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[13px] text-zinc-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── 4. Testimonials ──────────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Nguyễn Minh Khoa',
    role: 'MC Đám cưới — 3 năm kinh nghiệm',
    score: 91,
    quote: 'Sau 2 tuần luyện với MC Hub, điểm phát âm của tôi tăng từ 64 lên 91. Feedback AI cụ thể hơn hẳn thầy giáo thật — chỉ ra đúng âm nào sai, ngắt nghỉ chỗ nào.',
    avatar: 'https://i.pravatar.cc/80?u=khoa',
  },
  {
    name: 'Trần Thị Bảo Châu',
    role: 'Dẫn chương trình TV — Freelance',
    score: 88,
    quote: 'Tôi dùng để ôn kịch bản trước sự kiện. Tiện nhất là có thể luyện lúc 11 giờ đêm mà không cần ai chấm điểm. Báo cáo chi tiết giúp tôi biết chính xác cần sửa gì.',
    avatar: 'https://i.pravatar.cc/80?u=chau',
  },
  {
    name: 'Lê Đức Anh',
    role: 'MC Sự kiện doanh nghiệp',
    score: 85,
    quote: 'Ban đầu tôi skeptical về AI chấm giọng tiếng Việt, nhưng kết quả thật sự impressive. Phần phân tích nhịp điệu và tốc độ nói rất chính xác so với feedback từ đạo diễn.',
    avatar: 'https://i.pravatar.cc/80?u=ducanh',
  },
];

// ─── 3. Radar Chart (pure SVG) ────────────────────────────────────────────────
const RadarChart = ({ criteria, animated }) => {
  const cx = 110, cy = 110, r = 80;
  const n = criteria.length;
  const toXY = (i, pct) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const radius = r * pct;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  };
  const labelXY = (i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const radius = r + 20;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  };
  const dataPoints = animated
    ? criteria.map((c, i) => toXY(i, c.value / 100))
    : criteria.map((c, i) => toXY(i, 0));
  const polyStr = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  const spiderGrid = (pct) =>
    Array.from({ length: n }, (_, i) => toXY(i, pct)).map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg viewBox="0 0 220 220" className="w-full h-full">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <polygon
          key={pct}
          points={spiderGrid(pct)}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = toXY(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
      })}
      {/* Data area */}
      <motion.polygon
        points={polyStr}
        fill="rgba(245,166,35,0.12)"
        stroke="#f5a623"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={animated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Dots */}
      {criteria.map((c, i) => {
        const [x, y] = toXY(i, c.value / 100);
        return (
          <motion.circle
            key={i}
            cx={x} cy={y} r="3.5"
            fill="#f5a623"
            initial={{ opacity: 0, scale: 0 }}
            animate={animated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.06 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        );
      })}
      {/* Labels */}
      {criteria.map((c, i) => {
        const [lx, ly] = labelXY(i);
        return (
          <text
            key={i}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="rgba(161,161,170,0.8)"
            fontFamily="inherit"
          >
            {c.label}
          </text>
        );
      })}
    </svg>
  );
};

// ─── Animated waveform bars ───────────────────────────────────────────────────
const WaveformBar = ({ delay, height, active }) => (
  <motion.div
    className="w-[3px] rounded-full bg-[#f5a623]/60"
    animate={active ? {
      height: [`${height * 0.3}px`, `${height}px`, `${height * 0.5}px`, `${height * 0.8}px`, `${height * 0.3}px`],
    } : { height: '4px' }}
    transition={{ duration: 1.6, repeat: Infinity, delay, ease: 'easeInOut' }}
    style={{ height: '4px' }}
  />
);

// ─── 3. Sample score card preview ─────────────────────────────────────────────
const SampleReportCard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [tab, setTab] = useState('radar');

  const criteria = [
    { label: 'Phát âm',   value: 87, color: '#10b981', textClass: 'text-emerald-400' },
    { label: 'Nhịp điệu', value: 74, color: '#60a5fa', textClass: 'text-blue-400' },
    { label: 'Tốc độ',    value: 82, color: '#a78bfa', textClass: 'text-violet-400' },
    { label: 'Cảm xúc',   value: 69, color: '#f5a623', textClass: 'text-amber-400' },
    { label: 'Chính xác', value: 91, color: '#10b981', textClass: 'text-emerald-400' },
  ];
  const overall = Math.round(criteria.reduce((a, c) => a + c.value, 0) / criteria.length);
  const { count: scoreCount, ref: scoreRef } = useCountUp(overall, 1400);

  const waveHeights = [12, 22, 18, 28, 14, 32, 20, 24, 16, 26, 18, 30, 12, 22, 28, 16, 24, 20, 14, 18];

  return (
    <div ref={ref} className="bg-[#111113] border border-white/[0.08] rounded-2xl overflow-hidden relative">
      {/* Gold top line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(245,166,35,0.5) 40%, rgba(245,166,35,0.5) 60%, transparent 95%)' }} />

      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f5a623]/[0.1] border border-[#f5a623]/20 flex items-center justify-center">
            <Sparkles size={13} className="text-[#f5a623]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Báo cáo AI</p>
            <p className="text-[13px] font-semibold text-white leading-tight">Kịch bản đám cưới — Nâng cao</p>
          </div>
        </div>
        <div className="text-right" ref={scoreRef}>
          <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Tổng điểm</p>
          <p className="text-3xl font-bold text-emerald-400 tabular-nums leading-none">
            {inView ? scoreCount : 0}<span className="text-base text-zinc-600 font-normal">/100</span>
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-white/[0.05]">
        {[
          { id: 'radar', label: 'Radar' },
          { id: 'bars',  label: 'Chi tiết' },
          { id: 'wave',  label: 'Sóng âm' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-colors relative ${
              tab === id ? 'text-[#f5a623]' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {label}
            {tab === id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 inset-x-0 h-px bg-[#f5a623]"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {tab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-4"
            >
              <div className="w-[220px] h-[220px] shrink-0">
                <RadarChart criteria={criteria} animated={inView} />
              </div>
              <div className="flex-1 space-y-2.5">
                {criteria.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[11px] text-zinc-500">{c.label}</span>
                    <span className={`text-[12px] font-bold ${c.textClass}`}>{c.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'bars' && (
            <motion.div
              key="bars"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-3.5"
            >
              {/* Overall arc-like progress */}
              <div className="mb-5">
                <div className="flex justify-between text-[10px] text-zinc-600 mb-1.5">
                  <span>Tổng thể</span><span className="text-emerald-400 font-medium">Xuất sắc</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${overall}%` } : {}}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #10b981, #f5a623)' }}
                  />
                </div>
              </div>
              {criteria.map((c, i) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-600 w-16 shrink-0">{c.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${c.value}%` } : {}}
                      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold w-6 text-right ${c.textClass}`}>{c.value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'wave' && (
            <motion.div
              key="wave"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] text-zinc-500">Phân tích sóng âm</p>
                  <p className="text-[13px] font-semibold text-white mt-0.5">118 WPM — Nhịp điệu ổn định</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/[0.1] border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">Live</span>
              </div>
              <div className="bg-[#0e0e10] rounded-xl p-4 border border-white/[0.05]">
                <div className="flex items-end justify-center gap-[3px] h-[52px]">
                  {waveHeights.map((h, i) => (
                    <WaveformBar key={i} height={h} delay={i * 0.06} active={inView} />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-[9px] text-zinc-700">
                  <span>0:00</span><span>0:15</span><span>0:30</span><span>0:45</span><span>1:00</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Ngắt nghỉ', value: '0.82s', sub: 'Trung bình', color: 'text-emerald-400' },
                  { label: 'Cao điểm', value: '142', sub: 'WPM tối đa', color: 'text-blue-400' },
                  { label: 'Cảm xúc', value: '69%', sub: 'Biểu cảm', color: 'text-amber-400' },
                ].map((m, i) => (
                  <div key={i} className="bg-[#0e0e10] rounded-xl p-3 border border-white/[0.05] text-center">
                    <p className={`text-[14px] font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-[9px] text-zinc-600 mt-0.5">{m.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback strip */}
      <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-2">
        {[
          { icon: CheckCircle2, text: 'Ngắt nghỉ đúng nhịp (0.82s trung bình)', color: 'text-emerald-400' },
          { icon: TrendingUp,   text: 'Tốc độ 118 WPM — trong ngưỡng mục tiêu', color: 'text-blue-400' },
          { icon: AudioLines,   text: 'Nhấn mạnh từ khóa cần tăng cường', color: 'text-amber-400' },
        ].map(({ icon: Icon, text, color }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3, delay: 0.8 + i * 0.08 }}
            className="flex items-center gap-2"
          >
            <Icon size={11} className={color} />
            <p className="text-[11px] text-zinc-500">{text}</p>
          </motion.div>
        ))}
      </div>

    
    </div>
  );
};


const Home = () => {
  const { t, i18n } = useTranslation();
  const { data: trainingStats } = useApi(fetchFeaturedTrainingStats);
  const { data: featuredLessons } = useApi(fetchLessons);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedMCForCert, setSelectedMCForCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  return (
    <div className="bg-[#09090b] text-white min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <GridBackground />
        <SpotlightHero />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-[#f5a623]/[0.05] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...stagger(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f5a623]/25 bg-[#f5a623]/[0.06] text-[#f5a623] text-[11px] font-semibold uppercase tracking-widest mb-8">
              <Sparkles size={11} />
              {t('home.aiCoaching')}
            </span>
          </motion.div>

          <motion.h1 {...stagger(1)} className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            {t('home.heroTitle1')}{' '}
            <span className="text-[#f5a623]">{t('home.heroTitle2')}</span>
          </motion.h1>

          <motion.p {...stagger(2)} className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </motion.p>

          <motion.div {...stagger(3)} className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isAuthenticated ? '/m/voice/library' : '/register')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors shadow-lg shadow-[#f5a623]/10"
            >
              {t('home.startTraining')} <ArrowRight size={16} />
            </motion.button>
            <Link
              to="/m/voice/library"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] text-zinc-300 text-[14px] font-medium hover:border-white/[0.18] hover:text-white transition-colors"
            >
              {t('home.browseLibrary')}
            </Link>
          </motion.div>

          {/* ── Metrics strip — count-up ── */}
          <motion.div {...stagger(4)} className="flex justify-center gap-12 mt-16 pt-8 border-t border-white/[0.06]">
            <CountMetric value="2400" suffix="+" label={t('home.totalSessions') || 'Buổi luyện tập'} />
            <CountMetric value="94" suffix="%" label={t('home.accuracy') || 'Độ chính xác TB'} />
            <CountMetric value="50" suffix="+" label={t('home.extensiveLibrary') || 'Kịch bản'} />
          </motion.div>
        </div>
      </section>

      {/* ── LOGO MARQUEE ────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/[0.04] overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex gap-20 animate-marquee shrink-0">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-20 items-center">
                {['FPT EVENT', 'VINGROUP', 'TikTok', 'Senashow', 'Sun Group', 'Google'].map(brand => (
                  <span key={brand} className="text-sm font-medium text-zinc-700 hover:text-zinc-400 transition-colors uppercase tracking-widest cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-28 max-w-6xl mx-auto px-6 mt-12">
        <ScrollReveal direction="up">
          <div className="mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#f5a623] mb-4">{t('home.whyChooseUs')}</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t('home.coreAdvantage')}</h2>
            <p className="text-zinc-400 max-w-lg leading-relaxed text-[15px]">{t('home.coreAdvantageDesc')}</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: <Mic size={22} />, title: t('home.rhythmCoach'), desc: t('home.rhythmCoachDesc'),
              iconColor: '#f5a623', iconBg: 'rgba(245,166,35,0.08)', iconBorder: 'rgba(245,166,35,0.2)',
              accentColor: '#f5a623', glow: 'rgba(245,166,35,0.07)',
              metric: '94%', metricLabel: 'Avg accuracy',
            },
            {
              icon: <Zap size={22} />, title: t('home.realTimeFeedback'), desc: t('home.realTimeFeedbackDesc'),
              iconColor: '#60a5fa', iconBg: 'rgba(59,130,246,0.08)', iconBorder: 'rgba(59,130,246,0.2)',
              accentColor: '#60a5fa', glow: 'rgba(59,130,246,0.07)',
              metric: '<2s', metricLabel: 'Response time',
            },
            {
              icon: <BookOpen size={22} />, title: t('home.extensiveLibrary'), desc: t('home.extensiveLibraryDesc'),
              iconColor: '#a78bfa', iconBg: 'rgba(139,92,246,0.08)', iconBorder: 'rgba(139,92,246,0.2)',
              accentColor: '#a78bfa', glow: 'rgba(139,92,246,0.07)',
              metric: '500+', metricLabel: 'Scripts',
            },
          ].map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.12} direction="up">
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
                className="relative group p-8 bg-[#111113] rounded-2xl overflow-hidden flex flex-col h-full cursor-default transition-colors duration-300"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.accentColor + '33'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.accentColor}60, transparent)` }} />
                {/* Corner glow */}
                <div className="absolute top-0 left-0 w-40 h-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full"
                  style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.glow} 0%, transparent 70%)` }} />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon box */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.2 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-7 shrink-0"
                    style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}`, color: f.iconColor }}
                  >
                    {f.icon}
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-[16px] font-semibold mb-3 text-white leading-snug">{f.title}</h3>
                  <p className="text-zinc-500 text-[13px] leading-relaxed flex-1">{f.desc}</p>

                  {/* Metric row */}
                  <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-end justify-between">
                    <div>
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[26px] font-bold tabular-nums leading-none"
                        style={{ color: f.accentColor }}
                      >
                        {f.metric}
                      </motion.p>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">{f.metricLabel}</p>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: f.accentColor }}
                    >
                      <ArrowRight size={15} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── 3. SAMPLE REPORT PREVIEW ────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f5a623]/20 bg-[#f5a623]/[0.05] text-[#f5a623] text-[11px] font-semibold uppercase tracking-widest mb-5">
                <BarChart3 size={10} /> Báo cáo AI
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-snug">
                Phân tích chi tiết <span className="text-[#f5a623]">từng tiêu chí</span>
              </h2>
              <p className="text-zinc-400 text-[15px] leading-relaxed mb-6">
                Sau mỗi buổi luyện, AI trả về báo cáo gồm điểm 5 tiêu chí, feedback cụ thể và gợi ý cải thiện — không phải nhận xét chung chung.
              </p>
              <ul className="space-y-3">
                {[
                  'Điểm từng tiêu chí: Phát âm, Nhịp điệu, Tốc độ, Cảm xúc, Chính xác',
                  'Feedback bằng tiếng Việt, cụ thể từng lỗi phát âm',
                  'So sánh tiến trình qua các buổi luyện',
                  'Gợi ý mẹo luyện tập từ chuyên gia AI',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] text-zinc-400">
                    <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={isAuthenticated ? '/m/voice/library' : '/register'}
                className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
              >
                Thử ngay miễn phí <ArrowRight size={14} />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <SampleReportCard />
          </ScrollReveal>
        </div>
      </section>

      {/* ── LESSON CAROUSEL ─────────────────────────────────────────────────── */}
      {featuredLessons?.length > 0 && (
        <section className="py-20 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 mb-10 flex items-end justify-between">
            <ScrollReveal direction="left">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Bài luyện đọc</h2>
              <p className="text-zinc-500 text-[14px]">Chọn bài và bắt đầu luyện giọng ngay hôm nay.</p>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <Link
                to={isAuthenticated ? "/m/voice/library" : "/login"}
                className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>

          <div className="relative">
            <div className="flex gap-5 animate-marquee-slow">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-5 shrink-0">
                  {featuredLessons.map((lesson, idx) => {
                    const wordCount = lesson.content?.split(/\s+/).filter(Boolean).length || 0;
                    const diffColor = lesson.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : lesson.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20';
                    const diffLabel = lesson.difficulty === 'EASY' ? 'Cơ bản' : lesson.difficulty === 'MEDIUM' ? 'Trung bình' : lesson.difficulty === 'HARD' ? 'Nâng cao' : lesson.difficulty;
                    return (
                      <motion.div
                        key={`${i}-${idx}`}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => navigate(isAuthenticated ? `/m/voice/practice/${lesson.id}` : '/login')}
                        className="min-w-[340px] bg-[#111113] border border-white/[0.07] rounded-2xl overflow-hidden cursor-pointer hover:border-white/[0.16] transition-all duration-300 group flex flex-col"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-44 bg-[#09090b] overflow-hidden shrink-0">
                          {lesson.thumbnailUrl ? (
                            <LazyImage
                              src={lesson.thumbnailUrl}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0d0d0f]">
                              <div className="w-12 h-12 rounded-2xl bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center">
                                <Mic size={22} className="text-[#f5a623]/60" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/20 to-transparent" />
                          {/* Category pill — bottom left over gradient */}
                          <div className="absolute bottom-3 left-3">
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-black/70 border border-white/[0.1] text-[#f5a623] backdrop-blur-sm uppercase tracking-widest">
                              {lesson.category || 'Luyện đọc'}
                            </span>
                          </div>
                          {/* Difficulty — top right */}
                          {lesson.difficulty && (
                            <div className="absolute top-3 right-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border backdrop-blur-sm ${diffColor}`}>
                                {diffLabel}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-5 flex flex-col flex-1">
                          <h4 className="text-[14px] font-semibold text-white leading-snug line-clamp-2 mb-2 group-hover:text-[#f5a623] transition-colors duration-200">
                            {lesson.title}
                          </h4>
                          {lesson.description && (
                            <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <BookOpen size={11} className="text-zinc-600" />
                                <span className="text-[11px] text-zinc-600">{wordCount} từ</span>
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#f5a623] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Luyện ngay <ArrowRight size={11} />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#09090b] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#09090b] to-transparent pointer-events-none z-10" />
          </div>
        </section>
      )}

      {/* ── 4. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <ScrollReveal direction="up">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-5">
              <MessageSquare size={10} /> Từ người dùng thật
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              MC Hub đã giúp được <span className="text-[#f5a623]">họ</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 bg-[#111113] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-all h-full flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className="text-[#f5a623] fill-[#f5a623]" />
                  ))}
                </div>

                {/* Quote */}
                <Quote size={18} className="text-zinc-700 mb-3" />
                <p className="text-[13px] text-zinc-400 leading-relaxed flex-1 mb-5">"{t.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-white/[0.1]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white">{t.name}</p>
                    <p className="text-[11px] text-zinc-600 truncate">{t.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Điểm đạt</p>
                    <p className="text-[14px] font-bold text-emerald-400">{t.score}</p>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── ROADMAP ─────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <ScrollReveal direction="up">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-16">{t('home.successRoadmap')}</h2>
        </ScrollReveal>

        <div className="space-y-10">
          {[
            { step: '01', title: t('home.step1Title'), desc: t('home.step1Desc'), icon: <Zap size={16} /> },
            { step: '02', title: t('home.step2Title'), desc: t('home.step2Desc'), icon: <Sparkles size={16} /> },
            { step: '03', title: t('home.step3Title'), desc: t('home.step3Desc'), icon: <Award size={16} /> },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="flex gap-8 items-start group">
                <p className="text-[60px] font-bold leading-none text-zinc-800 select-none shrink-0 w-20 text-right group-hover:text-zinc-700 transition-colors">
                  {item.step}
                </p>
                <div className="pt-2 border-t border-white/[0.06] flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#f5a623]">{item.icon}</span>
                    <h3 className="text-[16px] font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-zinc-500 text-[14px] leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── 2. FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <ScrollReveal direction="up">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-5">
              Câu hỏi thường gặp
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Bạn còn <span className="text-[#f5a623]">thắc mắc?</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center text-[13px] text-zinc-600"
        >
          Vẫn còn câu hỏi?{' '}
          <Link to="/contact" className="text-[#f5a623] hover:underline">Liên hệ hỗ trợ →</Link>
        </motion.div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="pb-24 px-6 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="relative bg-[#111113] border border-white/[0.08] rounded-3xl overflow-hidden">
            {/* Top gold line */}
            <div className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(245,166,35,0.45) 40%, rgba(245,166,35,0.45) 60%, transparent 90%)' }} />
            {/* Subtle glow center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#f5a623]/[0.04] rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 px-10 py-16 lg:px-20 lg:py-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left: icon + text */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f5a623] text-black mb-6 shadow-lg shadow-[#f5a623]/20">
                  <Mic size={22} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-4">
                  {t('home.readyToOwnMic')}{' '}
                  <span className="text-[#f5a623]">{t('home.theMic')}</span>
                </h2>
                <p className="text-zinc-400 text-[14px] leading-relaxed max-w-md mx-auto lg:mx-0">
                  {t('home.ctaDesc')}
                </p>
              </div>

              {/* Right: buttons + social proof */}
              <div className="flex flex-col items-center lg:items-end gap-5 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsContactModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors shadow-lg shadow-[#f5a623]/15 whitespace-nowrap"
                  >
                    {t('home.sendMessage') || 'Liên hệ ngay'}
                  </motion.button>
                  <Link
                    to="/m/voice/library"
                    className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-white/[0.1] text-zinc-300 text-[14px] font-medium hover:border-white/[0.2] hover:text-white transition-colors whitespace-nowrap"
                  >
                    {t('home.startLearning')} <ArrowRight size={14} />
                  </Link>
                </div>
                {/* Social proof */}
                <p className="text-[12px] text-zinc-600">
                  Đã có <span className="text-zinc-400 font-medium">500+</span> MC tin dùng
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
      <ScrollToTop />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {/* ── MC Certificate Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCertModal && selectedMCForCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-[#111113] border border-white/[0.08] rounded-2xl p-8 shadow-2xl"
            >
              <button
                onClick={() => { setShowCertModal(false); setCopiedCert(false); }}
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>

              <div className="text-center mb-7">
                <p className="text-[11px] font-semibold text-[#f5a623] uppercase tracking-widest mb-1">The MC Hub Academy</p>
                <h3 className="text-xl font-bold tracking-tight">
                  {i18n.language === 'vi' ? 'Chứng nhận kỹ năng giọng nói MC' : 'Voice Performance Certificate'}
                </h3>
              </div>

              <div className="text-center mb-7 py-6 border-y border-white/[0.06]">
                <p className="text-[13px] text-zinc-500 mb-2">
                  {i18n.language === 'vi' ? 'Chứng nhận thành tích của' : 'Certified performance of'}
                </p>
                <h4 className="text-3xl font-bold text-[#f5a623]">{selectedMCForCert.name}</h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                {[
                  { label: i18n.language === 'vi' ? 'Chính xác' : 'Accuracy', value: `${selectedMCForCert.avgAccuracy?.toFixed(1)}%`, color: 'text-[#f5a623]' },
                  { label: i18n.language === 'vi' ? 'Nhịp điệu' : 'Rhythm', value: `${selectedMCForCert.avgRhythm?.toFixed(1)}%`, color: 'text-blue-400' },
                  { label: i18n.language === 'vi' ? 'Buổi tập' : 'Sessions', value: selectedMCForCert.totalSessions, color: 'text-violet-400' },
                  { label: i18n.language === 'vi' ? 'Giờ tập' : 'Hours', value: `${selectedMCForCert.totalPracticeHours?.toFixed(1)}h`, color: 'text-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-[#09090b] rounded-xl border border-white/[0.05] text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-600 mb-5 pt-4 border-t border-white/[0.06]">
                <span>ID: MCHUB-{selectedMCForCert.mcId?.substring(0, 10)?.toUpperCase() || 'ELITE'}</span>
                <span className="italic">MCHub Academy Board</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { navigate(`/m/messaging?mcId=${selectedMCForCert.mcId}`); setShowCertModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.04] transition-colors"
                >
                  <ExternalLink size={13} className="text-[#f5a623]" />
                  {i18n.language === 'vi' ? 'Đặt lịch MC' : 'Book MC'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/m/mc/${selectedMCForCert.mcId}`);
                    setCopiedCert(true);
                    setTimeout(() => setCopiedCert(false), 2000);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    copiedCert
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      : 'border border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Copy size={13} />
                  {copiedCert ? (i18n.language === 'vi' ? 'Đã sao chép!' : 'Copied!') : (i18n.language === 'vi' ? 'Sao chép link' : 'Copy link')}
                </button>
                <button
                  onClick={() => { setShowCertModal(false); setCopiedCert(false); }}
                  className="px-6 py-2.5 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
                >
                  {i18n.language === 'vi' ? 'Đóng' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marquee      { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-slow { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee      { animation: marquee 30s linear infinite; }
        .animate-marquee-slow { animation: marquee-slow 70s linear infinite; }
      `}</style>
    </div>
  );
};

export default Home;
