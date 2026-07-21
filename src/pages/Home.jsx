import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mic, ArrowRight, Sparkles, Award, Zap, BookOpen, X, ExternalLink, Copy,
  ChevronDown, ChevronLeft, ChevronRight, Star, TrendingUp, CheckCircle2, BarChart3, AudioLines,
  MessageSquare, Quote
} from 'lucide-react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/animate-ui/components/buttons/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/animations/ScrollReveal';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { fetchFeaturedTrainingStats } from '../controllers/publicController';
import { fetchFeaturedLessons } from '../controllers/voiceController';
import ScrollToTop from '../components/ui/ScrollToTop';
import ContactModal from '../components/modals/ContactModal';
import { Dialog, DialogContent } from '@/components/animate-ui/components/radix/dialog';
import SpotlightCard from '../components/ui/SpotlightCard';
import SocialFeedCarousel from '../components/ui/SocialFeedCarousel';

const CARD_HOVER_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] };
const DIFF_COLOR = {
  EASY:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  HARD:   'text-red-400 bg-red-500/10 border-red-500/20',
};
const DIFF_LABEL = { EASY: 'Cơ bản', MEDIUM: 'Trung bình', HARD: 'Nâng cao' };

const MOCK_LESSONS = [
  { id: 'demo-1', title: 'Dẫn chương trình hội nghị doanh nghiệp', category: 'Sự kiện', difficulty: 'MEDIUM', content: 'Kính thưa quý vị đại biểu, kính thưa toàn thể các bạn tham dự hội nghị hôm nay. Chúng tôi xin nhiệt liệt chào mừng quý vị đã đến tham dự sự kiện thường niên quan trọng này.' },
  { id: 'demo-2', title: 'Lễ trao giải thưởng cuối năm', category: 'Lễ trao giải', difficulty: 'HARD', content: 'Đây là khoảnh khắc mà tất cả chúng ta đã mong chờ. Những con người đặc biệt, những nỗ lực phi thường, và những thành tựu đáng tự hào.' },
  { id: 'demo-3', title: 'Khai mạc triển lãm nghệ thuật', category: 'Văn hóa', difficulty: 'EASY', content: 'Xin kính chào quý khách đến tham dự buổi khai mạc triển lãm nghệ thuật hôm nay. Đây là không gian hội tụ của sáng tạo và cảm xúc.' },
  { id: 'demo-4', title: 'Dẫn tiệc cưới sang trọng', category: 'Đám cưới', difficulty: 'MEDIUM', content: 'Trong không gian lộng lẫy và ấm áp của buổi tiệc hôm nay, chúng tôi trân trọng giới thiệu đôi uyên ương tân lang tân nương.' },
  { id: 'demo-5', title: 'Giới thiệu sản phẩm ra mắt', category: 'Doanh nghiệp', difficulty: 'EASY', content: 'Hôm nay là một ngày đặc biệt khi chúng tôi chính thức giới thiệu đến quý vị sản phẩm mới nhất, được nghiên cứu và phát triển trong suốt hai năm qua.' },
  { id: 'demo-6', title: 'Lễ kỷ niệm thành lập công ty', category: 'Doanh nghiệp', difficulty: 'HARD', content: 'Hai mươi năm hình thành và phát triển, công ty chúng ta đã vượt qua bao thăng trầm để đứng vững như ngày hôm nay.' },
];

// ─── Animation presets ────────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};
const stagger = (i) => ({ ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.09 } });

// ─── Cursor spotlight + stage lights for Hero ─────────────────────────────────
const SpotlightHero = () => {
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const leftPct = useTransform(spotX, v => `${v}%`);
  const topPct  = useTransform(spotY, v => `${v}%`);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    let cur = { x: 50, y: 50 }, tgt = { x: 50, y: 50 }, raf;
    const onMove = (e) => {
      tgt = { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 };
    };
    const tick = () => {
      cur = { x: lerp(cur.x, tgt.x, 0.06), y: lerp(cur.y, tgt.y, 0.06) };
      spotX.set(cur.x);
      spotY.set(cur.y);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [spotX, spotY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Cursor-following spotlight — motion.div avoids React re-renders */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          left: leftPct,
          top: topPct,
          x: '-50%',
          y: '-50%',
          background: 'rgba(245,166,35,0.03)',
          transition: 'none',
        }}
      />
      {/* Fixed stage left spotlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '15%', top: '-60px',
          width: '320px', height: '600px',
          background: 'rgba(245,166,35,0.02)',
          filter: 'blur(1px)',
        }}
      />
      {/* Fixed stage right spotlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: '15%', top: '-60px',
          width: '320px', height: '600px',
          background: 'rgba(245,166,35,0.02)',
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
      backgroundColor: 'rgba(255,255,255,0.03)',
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
      <p className="text-2xl font-bold text-amber-500 tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-[12px] text-gray-400 mt-1">{label}</p>
    </div>
  );
};

// ─── 2. FAQ Accordion ─────────────────────────────────────────────────────────
const faqs = [
  {
    icon: AudioLines,
    q: 'AI phân tích giọng nói như thế nào?',
    short: 'Ghi âm → AI so sánh chuẩn MC chuyên nghiệp trên 5 tiêu chí. Kết quả trong 30 giây.',
    full: 'Hệ thống ghi âm giọng đọc của bạn, sau đó AI so sánh với chuẩn MC chuyên nghiệp trên 5 tiêu chí: Phát âm, Nhịp điệu, Tốc độ, Cảm xúc và Độ chính xác. Kết quả trả về trong vòng 30 giây.',
  },
  {
    icon: Zap,
    q: 'Tài khoản miễn phí có những tính năng gì?',
    short: '5 buổi luyện/ngày, 20 kịch bản cơ bản, điểm tổng thể và feedback ngắn.',
    full: 'Miễn phí cho phép 5 buổi luyện tập/ngày, truy cập 20 kịch bản cơ bản, xem điểm tổng thể và feedback ngắn. Gói Premium mở khóa không giới hạn phiên, 50+ kịch bản nâng cao và báo cáo chi tiết PDF.',
  },
  {
    icon: Mic,
    q: 'Tôi cần thiết bị gì để sử dụng?',
    short: 'Trình duyệt Chrome/Firefox/Edge + microphone. Không cần cài phần mềm.',
    full: 'Chỉ cần trình duyệt Chrome/Firefox/Edge phiên bản mới nhất và microphone — laptop tích hợp hoặc USB mic đều hoạt động. Không cần cài phần mềm.',
  },
  {
    icon: BarChart3,
    q: 'Kết quả phân tích có chính xác không?',
    short: 'Mô hình huấn luyện từ hàng nghìn mẫu giọng MC Việt. Độ chính xác >90%.',
    full: 'Mô hình AI được huấn luyện trên hàng nghìn mẫu giọng MC chuyên nghiệp người Việt. Độ chính xác đạt >90% so với đánh giá thủ công từ chuyên gia trong các bài kiểm thử nội bộ.',
  },
  {
    icon: TrendingUp,
    q: 'Các gói dịch vụ thanh toán như thế nào?',
    short: 'Thanh toán qua PayOS — kích hoạt tự động. 4 gói: Ngày / Basic / Full / Annual.',
    full: 'Thanh toán qua cổng PayOS tích hợp sẵn trên trang. Hệ thống kích hoạt gói tự động ngay sau khi xác nhận. Có 4 gói: Gói Ngày (24h), Basic (tháng), Full (tháng), Annual (năm) — không tự gia hạn.',
  },
  {
    icon: CheckCircle2,
    q: 'Dữ liệu giọng nói của tôi có bị lưu không?',
    short: 'File ghi âm chỉ dùng trong phiên hiện tại, không lưu vĩnh viễn.',
    full: 'File ghi âm chỉ dùng để phân tích trong phiên hiện tại và không lưu vĩnh viễn. Điểm số và lịch sử được lưu vào tài khoản của bạn. Xem Chính sách bảo mật để biết thêm.',
  },
];

const FaqItem = ({ icon: Icon, q, short, full, index }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
    <SpotlightCard
      spotlightColor="rgba(245,166,35,0.08)"
      spotlightSize={280}
      className={`border rounded-md overflow-hidden transition-all duration-200 ${open ? 'border-amber-200 bg-amber-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-amber-100 hover:shadow-sm'}`}
    >
      <Button hoverScale={1} onClick={() => { setOpen(!open); setExpanded(false); }} className="w-full flex items-center justify-between p-5 text-left gap-4 group h-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500 group-hover:bg-amber-50 group-hover:text-amber-500'}`}>
            <Icon size={14} />
          </div>
          <span className={`text-[14px] font-medium transition-colors ${open ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{q}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className={`shrink-0 transition-colors ${open ? 'text-amber-500' : 'text-gray-400'}`}>
          <ChevronDown size={16} />
        </motion.div>
      </Button>
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
            <div className="px-5 pb-5 pl-16">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {expanded ? full : short}
              </p>
              {full !== short && (
                <Button
                  onClick={() => setExpanded(v => !v)}
                  className="mt-2 text-[12px] text-amber-600 hover:text-amber-700 font-medium transition-colors h-auto"
                >
                  {expanded ? 'Thu gọn ↑' : 'Xem thêm →'}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SpotlightCard>
    </motion.div>
  );
};

// ─── 4. Testimonials ──────────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Nguyễn Minh Khoa',
    role: 'MC Đám cưới — 3 năm kinh nghiệm',
    score: 91,
    quote: 'Sau 2 tuần luyện với MC Hub, điểm phát âm tăng từ 64 lên 91. Feedback AI chỉ ra đúng âm nào sai, ngắt nghỉ chỗ nào — cụ thể hơn thầy giáo thật.',
    avatar: 'https://i.pravatar.cc/96?img=11',
    fallback: 'https://i.pravatar.cc/96?img=11',
  },
  {
    name: 'Trần Thị Bảo Châu',
    role: 'Dẫn chương trình TV — Freelance',
    score: 88,
    quote: 'Luyện lúc 11 giờ đêm mà không cần ai chấm điểm. Báo cáo chi tiết giúp biết chính xác cần sửa gì trước sự kiện.',
    avatar: 'https://i.pravatar.cc/96?img=47',
    fallback: 'https://i.pravatar.cc/96?img=47',
  },
  {
    name: 'Lê Đức Anh',
    role: 'MC Sự kiện doanh nghiệp',
    score: 85,
    quote: 'Phần phân tích nhịp điệu và tốc độ nói rất chính xác so với feedback từ đạo diễn. Kết quả AI chấm giọng tiếng Việt thật sự ấn tượng.',
    avatar: 'https://i.pravatar.cc/96?img=52',
    fallback: 'https://i.pravatar.cc/96?img=52',
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
    <div ref={ref} className="bg-[#111113] border border-white/[0.08] rounded-md overflow-hidden relative">
      {/* Gold top line */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'rgba(245,166,35,0.5)' }} />

      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#f5a623]/[0.1] border border-[#f5a623]/20 flex items-center justify-center">
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
          <Button
            key={id}
            variant="ghost"
            hoverScale={1}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-colors relative h-auto rounded-none bg-transparent hover:bg-transparent ${
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
          </Button>
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
                    style={{ background: '#f5a623' }}
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
              <div className="bg-[#0e0e10] rounded-md p-4 border border-white/[0.05]">
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
                  <div key={i} className="bg-[#0e0e10] rounded-md p-3 border border-white/[0.05] text-center">
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


const CARD_W = 220;
const CARD_GAP = 12;
const AUTO_INTERVAL = 3000;

const LessonCarousel = ({ lessons, navigate }) => {
  const scrollRef = useRef(null);
  const isPaused = useRef(false);
  const timerRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = (CARD_W + CARD_GAP) * 2;
    const next = el.scrollLeft + dir * step;
    const max = el.scrollWidth - el.clientWidth;
    // loop: if near end scroll back to start, if before start go to end
    if (dir > 0 && next >= max - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir < 0 && el.scrollLeft <= 10) {
      el.scrollTo({ left: max, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: dir * step, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPaused.current) scroll(1);
    }, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [lessons]);

  return (
    <div
      className="relative"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <Button
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
      >
        <ChevronRight size={16} />
      </Button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-10 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {[...lessons, ...lessons].map((lesson, idx) => {
          const wordCount = lesson.content?.split(/\s+/).filter(Boolean).length || 0;
          const diffColor = DIFF_COLOR[lesson.difficulty] || DIFF_COLOR.HARD;
          const diffLabel = DIFF_LABEL[lesson.difficulty] || lesson.difficulty;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={CARD_HOVER_TRANSITION}
              onClick={() => navigate(`/m/voice/practice/${lesson.id}`)}
              className="min-w-[220px] bg-white border border-gray-100 rounded-md overflow-hidden cursor-pointer hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all duration-300 group flex flex-col shrink-0"
            >
              {/* Thumbnail */}
              <div className="relative h-28 bg-amber-50 overflow-hidden shrink-0">
                {lesson.thumbnailUrl ? (
                  <img
                    src={lesson.thumbnailUrl}
                    alt={lesson.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50">
                    <div className="w-10 h-10 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center">
                      <Mic size={18} className="text-amber-400" />
                    </div>
                  </div>
                )}
                {lesson.difficulty && (
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${diffColor}`}>
                      {diffLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3.5 flex flex-col flex-1">
                <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5 block">
                  {lesson.category || 'Luyện đọc'}
                </span>
                <h4 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-2.5 group-hover:text-amber-500 transition-colors duration-200">
                  {lesson.title}
                </h4>
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-1">
                    <BookOpen size={10} className="text-gray-400" />
                    <span className="text-[11px] text-gray-400">{wordCount} từ</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Luyện ngay <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const { data: trainingStats } = useApi(fetchFeaturedTrainingStats);
  const { data: featuredLessonsRaw } = useApi(() => fetchFeaturedLessons(8));
  const featuredLessons = featuredLessonsRaw?.length > 0 ? featuredLessonsRaw : MOCK_LESSONS;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedMCForCert, setSelectedMCForCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  return (
    <div className="bg-white text-gray-900 min-h-[100dvh] overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <GridBackground />
        <SpotlightHero />
        {/* Ambient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'rgba(245,166,35,0.06)' }} />
        <div className="absolute top-20 -left-20 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'rgba(251,191,36,0.04)', filter: 'blur(40px)' }} />
        <div className="absolute top-20 -right-20 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'rgba(245,166,35,0.03)', filter: 'blur(40px)' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...stagger(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-[11px] font-semibold uppercase tracking-widest mb-8">
              <Sparkles size={11} />
              {t('home.aiCoaching')}
            </span>
          </motion.div>

          <motion.h1 {...stagger(1)} className="text-3xl sm:text-4xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            {t('home.heroTitle1')}{' '}
            <span className="text-[#f5a623]">{t('home.heroTitle2')}</span>
          </motion.h1>

          <motion.p {...stagger(2)} className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </motion.p>

          <motion.div {...stagger(3)} className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isAuthenticated ? '/m/voice/library' : '/register')}
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors shadow-lg shadow-[#f5a623]/10"
            >
              {t('home.startTraining')} <ArrowRight size={16} />
            </motion.button>
            <Link
              to="/m/voice/library"
              className="flex items-center gap-2 px-6 py-3 rounded-md border border-gray-200 text-gray-600 text-[14px] font-medium hover:border-gray-300 hover:text-gray-900 transition-colors"
            >
              {t('home.browseLibrary')}
            </Link>
          </motion.div>

          {/* ── Metrics strip — count-up ── */}
          <motion.div {...stagger(4)} className="flex justify-center gap-6 sm:gap-12 mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-amber-100/20">
            <CountMetric value="2400" suffix="+" label={t('home.totalSessions') || 'Buổi luyện tập'} />
            <CountMetric value="94" suffix="%" label={t('home.accuracy') || 'Độ chính xác TB'} />
            <CountMetric value="50" suffix="+" label={t('home.extensiveLibrary') || 'Kịch bản'} />
          </motion.div>
        </div>
      </section>

      {/* ── LOGO MARQUEE ────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-gray-100 overflow-hidden bg-gray-50/50">
        <div className="flex whitespace-nowrap">
          <div className="flex gap-20 animate-marquee shrink-0">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-20 items-center">
                {['FPT EVENT', 'VINGROUP', 'TikTok', 'Senashow', 'Sun Group', 'Google'].map(brand => (
                  <span key={brand} className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-widest cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-28 max-w-6xl mx-auto px-6 mt-12 relative">
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'rgba(245,166,35,0.035)', filter: 'blur(60px)' }} />
        <ScrollReveal direction="up">
          <div className="mb-16">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500 mb-4">{t('home.whyChooseUs')}</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-gray-900">{t('home.coreAdvantage')}</h2>
            <p className="text-gray-500 max-w-lg leading-relaxed text-[15px]">{t('home.coreAdvantageDesc')}</p>
          </div>
        </ScrollReveal>

        {/* Asymmetric bento: 1 featured left (2 col) + 2 compact right stacked */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {/* Featured card — 2 cols wide */}
          {(() => {
            const f = {
              icon: <Mic size={24} />, title: t('home.rhythmCoach'), desc: t('home.rhythmCoachDesc'),
              iconColor: '#f5a623', iconBg: 'rgba(245,166,35,0.08)', iconBorder: 'rgba(245,166,35,0.2)',
              accentColor: '#f5a623', glow: 'rgba(245,166,35,0.07)',
              metric: '94%', metricLabel: 'Độ chính xác TB',
            };
            return (
              <ScrollReveal delay={0} direction="up" className="md:col-span-3">
                <SpotlightCard
                  spotlightColor="rgba(245,166,35,0.14)"
                  spotlightSize={400}
                  className="relative group p-8 bg-white rounded-md overflow-hidden flex flex-col h-full min-h-[280px] cursor-default transition-all duration-300 shadow-sm hover:shadow-xl"
                  style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5a62340'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(245,166,35,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                >
                  <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(245,166,35,0.5)' }} />
                  <div className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none opacity-30"
                    style={{ background: 'rgba(245,166,35,0.08)' }} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-md flex items-center justify-center mb-6"
                      style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}`, color: f.iconColor }}>
                      {f.icon}
                    </div>
                    <h3 className="text-[18px] font-semibold mb-3 text-gray-900 leading-snug">{f.title}</h3>
                    <p className="text-gray-500 text-[14px] leading-relaxed flex-1 max-w-xs">{f.desc}</p>
                    <div className="mt-8 pt-5 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <p className="text-[32px] font-bold tabular-nums leading-none text-amber-500">{f.metric}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{f.metricLabel}</p>
                      </div>
                      <ArrowRight size={16} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            );
          })()}

          {/* Compact cards stacked — 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {[
              {
                icon: <Zap size={20} />, title: t('home.realTimeFeedback'), desc: t('home.realTimeFeedbackDesc'),
                iconColor: '#60a5fa', iconBg: 'rgba(59,130,246,0.08)', iconBorder: 'rgba(59,130,246,0.2)',
                accentColor: '#60a5fa', metric: '<2s', metricLabel: 'Phản hồi',
              },
              {
                icon: <BookOpen size={20} />, title: t('home.extensiveLibrary'), desc: t('home.extensiveLibraryDesc'),
                iconColor: '#a78bfa', iconBg: 'rgba(139,92,246,0.08)', iconBorder: 'rgba(139,92,246,0.2)',
                accentColor: '#a78bfa', metric: '50+', metricLabel: 'Kịch bản',
              },
            ].map((f, i) => (
              <ScrollReveal key={i} delay={(i + 1) * 0.12} direction="up" className="flex-1">
                <SpotlightCard
                  spotlightColor={`rgba(${i === 0 ? '59,130,246' : '139,92,246'},0.12)`}
                  spotlightSize={250}
                  className="relative group p-6 bg-white rounded-md overflow-hidden flex flex-col h-full cursor-default transition-all duration-300 shadow-sm hover:shadow-lg"
                  style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.accentColor + '40'; e.currentTarget.style.boxShadow = `0 8px 24px ${f.accentColor}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                >
                  <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${f.accentColor}50` }} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}`, color: f.iconColor }}>
                        {f.icon}
                      </div>
                      <p className="text-[22px] font-bold tabular-nums leading-none" style={{ color: f.accentColor }}>{f.metric}</p>
                    </div>
                    <h3 className="text-[14px] font-semibold mb-1.5 text-gray-900 leading-snug">{f.title}</h3>
                    <p className="text-gray-400 text-[12px] leading-relaxed flex-1 line-clamp-2">{f.desc}</p>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
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
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-snug text-gray-900">
                Phân tích chi tiết <span className="text-amber-500">từng tiêu chí</span>
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
                Sau mỗi buổi luyện, AI trả về báo cáo gồm điểm 5 tiêu chí, feedback cụ thể và gợi ý cải thiện — không phải nhận xét chung chung.
              </p>
              <ul className="space-y-3">
                {[
                  'Điểm từng tiêu chí: Phát âm, Nhịp điệu, Tốc độ, Cảm xúc, Chính xác',
                  'Feedback bằng tiếng Việt, cụ thể từng lỗi phát âm',
                  'So sánh tiến trình qua các buổi luyện',
                  'Gợi ý mẹo luyện tập từ chuyên gia AI',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] text-gray-600">
                    <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={isAuthenticated ? '/m/voice/library' : '/register'}
                className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-md bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
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
      {(
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 mb-10 flex items-end justify-between">
            <ScrollReveal direction="left">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-900">Bài luyện đọc</h2>
              <p className="text-gray-500 text-[14px]">Chọn bài và bắt đầu luyện giọng ngay hôm nay.</p>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <Link
                to={isAuthenticated ? "/m/voice/library" : "/login"}
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-gray-900 transition-colors shrink-0"
              >
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </ScrollReveal>
          </div>

          <LessonCarousel lessons={featuredLessons} navigate={navigate} />
        </section>
      )}

      {/* ── 4. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <ScrollReveal direction="up">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-[11px] font-semibold uppercase tracking-widest mb-5">
              <MessageSquare size={10} /> Từ người dùng thật
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              MC Hub đã giúp được <span className="text-amber-500">họ</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Asymmetric: featured (col-span-2) + 2 compact stacked */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Featured testimonial */}
          <ScrollReveal className="md:col-span-3">
            <SpotlightCard
              spotlightColor="rgba(245,166,35,0.09)"
              spotlightSize={380}
              className="p-8 bg-white border border-gray-100 rounded-md hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50/60 transition-all h-full flex flex-col"
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={13} className="text-[#f5a623] fill-[#f5a623]" />
                ))}
              </div>
              <Quote size={24} className="text-amber-200 mb-4" />
              <p className="text-[15px] text-gray-700 leading-relaxed flex-1 mb-6">"{testimonials[0].quote}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <img src={testimonials[0].avatar} alt={testimonials[0].name} onError={e => { e.currentTarget.src = testimonials[0].fallback; }} className="w-12 h-12 rounded-md object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900">{testimonials[0].name}</p>
                  <p className="text-[12px] text-gray-400">{testimonials[0].role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[22px] font-bold text-emerald-500 tabular-nums leading-none">{testimonials[0].score}%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Điểm cao nhất</p>
                </div>
              </div>
            </SpotlightCard>
          </ScrollReveal>

          {/* 2 compact stacked */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {testimonials.slice(1).map((t, i) => (
              <ScrollReveal key={i} delay={(i + 1) * 0.1} className="flex-1">
                <SpotlightCard
                  spotlightColor="rgba(245,166,35,0.07)"
                  spotlightSize={240}
                  className="p-6 bg-white border border-gray-100 rounded-md hover:border-amber-200 hover:shadow-md hover:shadow-amber-50 transition-all h-full flex flex-col"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={11} className="text-[#f5a623] fill-[#f5a623]" />)}
                  </div>
                  <p className="text-[13px] text-gray-600 leading-relaxed flex-1 mb-4 line-clamp-3">"{t.quote}"</p>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                    <img src={t.avatar} alt={t.name} onError={e => { e.currentTarget.src = t.fallback; }} className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-900">{t.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{t.role}</p>
                    </div>
                    <p className="text-[16px] font-bold text-emerald-500 tabular-nums shrink-0">{t.score}%</p>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ─────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <ScrollReveal direction="up">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-16 text-gray-900">{t('home.successRoadmap')}</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01', title: t('home.step1Title'), icon: <Zap size={14} />,
              caption: 'Ghi âm — nhận điểm AI trong 30 giây',
              img: '/images/step-record.png',
              fallback: 'https://picsum.photos/seed/step-record/480/320',
              offset: 'md:mt-0',
              imgClass: 'object-cover',
            },
            {
              step: '02', title: t('home.step2Title'), icon: <Sparkles size={14} />,
              caption: 'Biểu đồ 5 tiêu chí, theo dõi streak hàng ngày',
              img: '/images/step-report.png',
              fallback: 'https://picsum.photos/seed/step-report/480/320',
              offset: 'md:mt-10',
              imgClass: 'object-cover',
            },
            {
              step: '03', title: t('home.step3Title'), icon: <Award size={14} />,
              caption: 'Tự tin dẫn bất kỳ sự kiện nào',
              img: '/images/step-stage.png',
              fallback: 'https://picsum.photos/seed/step-stage/480/320',
              offset: 'md:mt-20',
              imgClass: 'object-cover object-top',
            },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.12} className={item.offset}>
              <div className="group flex flex-col gap-4">
                {/* Image */}
                <div className="rounded-md overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-amber-100 transition-all">
                  <img
                    src={item.img}
                    alt={item.title}
                    onError={e => { e.currentTarget.src = item.fallback; }}
                    className={`w-full h-52 ${item.imgClass}`}
                  />
                </div>
                {/* Text below image */}
                <div className="flex gap-3 items-start px-1">
                  <p className="text-[36px] font-bold leading-none text-amber-200 select-none shrink-0 group-hover:text-amber-300 transition-colors">
                    {item.step}
                  </p>
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-amber-500">{item.icon}</span>
                      <h3 className="text-[15px] font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-400 text-[12px] leading-relaxed">{item.caption}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── 2. FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: sticky header + contact CTA */}
          <div className="lg:col-span-2">
            <ScrollReveal direction="up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-[11px] font-semibold uppercase tracking-widest mb-5">
                Câu hỏi thường gặp
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-4 mb-4">
                Bạn còn <span className="text-amber-500">thắc mắc?</span>
              </h2>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
                Câu trả lời cho những câu hỏi phổ biến nhất. Không tìm thấy? Liên hệ trực tiếp.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-gray-200 text-gray-700 text-[13px] font-medium hover:border-amber-300 hover:text-amber-600 transition-colors"
              >
                Liên hệ hỗ trợ <ArrowRight size={13} />
              </Link>
            </ScrollReveal>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-3 space-y-2">
            {faqs.map((faq, i) => (
              <FaqItem key={i} icon={faq.icon} q={faq.q} short={faq.short} full={faq.full} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="pb-24 px-6 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="relative bg-amber-50 border border-amber-100 rounded-md overflow-hidden">
            {/* Top gold line */}
            <div className="absolute top-0 inset-x-0 h-px"
              style={{ background: 'rgba(245,166,35,0.45)' }} />
            {/* Subtle glow center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#f5a623]/[0.04] rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-16 lg:px-20 lg:py-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left: icon + text + buttons */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-[#f5a623] text-black mb-6 shadow-lg shadow-[#f5a623]/20">
                  <Mic size={22} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-3">
                  {t('home.readyToOwnMic')}{' '}
                  <span className="text-[#f5a623]">{t('home.theMic')}</span>
                </h2>
                <p className="text-gray-500 text-[13px] leading-relaxed max-w-sm mx-auto lg:mx-0 mb-7">
                  500+ MC đã nâng điểm trung bình <strong className="text-gray-700">+24 điểm</strong> sau 2 tuần.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    to="/m/payment"
                    className="flex items-center justify-center gap-2 px-7 py-3 rounded-md bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors shadow-lg shadow-[#f5a623]/15 whitespace-nowrap"
                  >
                    Xem gói <ArrowRight size={14} />
                  </Link>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsContactModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-7 py-3 rounded-md border border-gray-200 text-gray-600 text-[14px] font-medium hover:border-gray-300 hover:text-gray-900 transition-colors whitespace-nowrap"
                  >
                    {t('home.sendMessage') || 'Liên hệ ngay'}
                  </motion.button>
                </div>
              </div>

              {/* Right: mockup image */}
              <div className="shrink-0 w-full max-w-xs lg:max-w-sm">
                <div className="rounded-md overflow-hidden shadow-xl shadow-amber-100/60 border border-amber-100/60">
                  <img
                    src="/images/cta-mockup.png"
                    alt="MC Hub app mockup"
                    onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/cta-mockup/600/420'; }}
                    className="w-full h-56 lg:h-64 object-cover object-bottom"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Social Feed ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <SocialFeedCarousel />
        </div>
      </section>

      <Footer />
      <ScrollToTop />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {/* ── MC Certificate Modal ─────────────────────────────────────────── */}
      <Dialog open={showCertModal && !!selectedMCForCert} onOpenChange={(open) => { if (!open) { setShowCertModal(false); setCopiedCert(false); } }}>
        {selectedMCForCert && (
          <DialogContent
            showCloseButton={false}
            className="w-full max-w-2xl bg-[#111113] border border-white/[0.08] rounded-md p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
              <Button
                onClick={() => { setShowCertModal(false); setCopiedCert(false); }}
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-zinc-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </Button>

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
                  <div key={i} className="p-4 bg-[#09090b] rounded-md border border-white/[0.05] text-center">
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
                <Button
                  onClick={() => { navigate(`/m/messaging?mcId=${selectedMCForCert.mcId}`); setShowCertModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-white/[0.08] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.04] transition-colors h-auto"
                >
                  <ExternalLink size={13} className="text-[#f5a623]" />
                  {i18n.language === 'vi' ? 'Đặt lịch MC' : 'Book MC'}
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/m/mc/${selectedMCForCert.mcId}`);
                    setCopiedCert(true);
                    setTimeout(() => setCopiedCert(false), 2000);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors h-auto ${
                    copiedCert
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      : 'border border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Copy size={13} />
                  {copiedCert ? (i18n.language === 'vi' ? 'Đã sao chép!' : 'Copied!') : (i18n.language === 'vi' ? 'Sao chép link' : 'Copy link')}
                </Button>
                <Button
                  onClick={() => { setShowCertModal(false); setCopiedCert(false); }}
                  className="px-6 py-2.5 rounded-md bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors h-auto"
                >
                  {i18n.language === 'vi' ? 'Đóng' : 'Close'}
                </Button>
              </div>
          </DialogContent>
        )}
      </Dialog>

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
