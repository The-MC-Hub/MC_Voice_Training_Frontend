import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail, Lock, User, Phone, ShieldCheck, ArrowRight,
  Eye, EyeOff, CheckCircle2, Mic, Zap, BarChart3, Award, RefreshCw,
  BookOpen, Star, Crown, Gift, Sparkles, Heart, Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useApi } from "../hooks/useApi";
import { fetchUserRoles } from "../controllers/publicController";
import { academyService } from "../services/academyService";
const ROLE_REDIRECT = { admin: "/m/dashboard", mc: "/m/dashboard", client: "/m/dashboard" };

const SLIDE_FEATURES = [
  { icon: Mic,      title: "AI phân tích giọng nói",   desc: "5 tiêu chí: phát âm, nhịp điệu, tốc độ, độ rõ ràng, cảm xúc" },
  { icon: BarChart3,title: "Theo dõi tiến trình",       desc: "Biểu đồ điểm số theo thời gian, streak luyện tập hàng ngày" },
  { icon: Award,    title: "50+ kịch bản MC",           desc: "Đám cưới, sự kiện doanh nghiệp, talkshow, lễ tốt nghiệp" },
  { icon: BookOpen, title: "Lộ trình học cá nhân",      desc: "AI gợi ý bài học phù hợp trình độ và mục tiêu của bạn" },
];

const SLIDE_PLANS = [
  { icon: Star,  tier: "FREE",  price: "Miễn phí",   perks: ["5 AI sessions", "10 bài học cơ bản"], badge: null },
  { icon: Zap,   tier: "BASIC", price: "199k/tháng", perks: ["20 AI sessions/tháng", "50+ bài học"], badge: "Phổ biến" },
  { icon: Crown, tier: "FULL",  price: "299k/tháng", perks: ["AI không giới hạn", "Toàn bộ tính năng"], badge: null },
];

const SLIDE_TESTIMONIALS = [
  { quote: "Điểm phát âm tăng từ 64 lên 91 chỉ sau 2 tuần.", name: "Nguyễn Minh Khoa", role: "MC Đám cưới" },
  { quote: "Phân tích nhịp điệu rất chính xác, giúp tôi tự tin dẫn chương trình hơn.", name: "Trần Bảo Châu", role: "MC TV" },
  { quote: "Luyện lúc 11 giờ đêm mà không cần ai chấm điểm.", name: "Lê Đức Anh", role: "MC Doanh nghiệp" },
];

const SLIDES = [
  { key: "features", label: "✦ TÍNH NĂNG" },
  { key: "pricing",  label: "✦ BẢNG GIÁ" },
  { key: "reviews",  label: "✦ ĐÁNH GIÁ" },
];

const RightPanel = () => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (slideIdx !== 2) return;
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % SLIDE_TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, [slideIdx]);

  return (
    <div className="photo-panel relative w-full h-full overflow-hidden flex flex-col justify-between p-10 lg:p-14">
      <img
        src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80"
        alt="Stage lights"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/50 to-black/85" />

      {/* Top: logo */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-1.5 group">
          <span className="text-[18px] font-bold text-white tracking-tight">MC</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[18px] font-bold text-white tracking-tight">Hub</span>
        </Link>
      </div>

      {/* Slide area */}
      <div className="relative z-10 flex flex-col gap-5">
        {/* Slide badge */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-widest">
          {SLIDES[slideIdx].label}
        </span>

        <div className="relative min-h-[220px]">
          <AnimatePresence mode="wait">
            {/* Slide 0 — Features */}
            {slideIdx === 0 && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {SLIDE_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <f.icon size={15} className="text-amber-300" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white leading-none mb-1">{f.title}</p>
                      <p className="text-[11px] text-white/70 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Slide 1 — Pricing */}
            {slideIdx === 1 && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {SLIDE_PLANS.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <p.icon size={15} className="text-amber-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-bold text-white tracking-wide">{p.tier}</p>
                        {p.badge && <span className="bg-amber-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{p.badge}</span>}
                      </div>
                      <p className="text-[11px] text-white/65">{p.perks.join(' · ')}</p>
                    </div>
                    <p className="text-[12px] font-semibold text-amber-400 shrink-0">{p.price}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Slide 2 — Testimonials */}
            {slideIdx === 2 && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-[15px] text-white/90 leading-relaxed mb-5 italic">"{SLIDE_TESTIMONIALS[testimonialIdx].quote}"</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0">
                        <Mic size={12} className="text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-white leading-none">{SLIDE_TESTIMONIALS[testimonialIdx].name}</p>
                        <p className="text-[10px] text-white/55 mt-0.5">{SLIDE_TESTIMONIALS[testimonialIdx].role}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                {/* Testimonial dots */}
                <div className="flex items-center justify-center gap-1.5">
                  {SLIDE_TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialIdx(i)}
                      className={`rounded-full transition-all ${i === testimonialIdx ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Slide indicator dots */}
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/40">Đã có 500+ MC đang luyện tập</p>
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`rounded-full transition-all ${i === slideIdx ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const barColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
  const labels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i < score ? barColors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-[10px] font-medium ${score < 2 ? 'text-red-500' : score < 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
        Mật khẩu {labels[score - 1] || 'Yếu'}
      </p>
    </div>
  );
};

const InputField = ({ label, icon: Icon, suffix, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] font-semibold text-gray-700">{label}</label>}
      <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-xl transition-all ${
        focused
          ? 'border-amber-400 bg-white shadow-[0_0_0_3px_rgba(245,166,35,0.12)]'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}>
        {Icon && <Icon size={15} className={`shrink-0 transition-colors ${focused ? 'text-amber-500' : 'text-gray-400'}`} />}
        <input
          className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 min-w-0"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffix}
      </div>
    </div>
  );
};

// ── OTP Verification Screen ───────────────────────────────────────────────
const OtpScreen = ({ email, onSuccess }) => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, loading } = useAuthStore();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendMsg, setResendMsg] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleDigit = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d) && val) {
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code) => {
    setError("");
    try {
      const res = await verifyOtp(email, code);
      onSuccess(res);
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOtp(email);
      setResendMsg("Đã gửi lại mã OTP mới.");
      setResendCooldown(60);
      setTimeout(() => setResendMsg(""), 4000);
    } catch {
      setError("Không thể gửi lại OTP. Thử lại sau.");
    }
  };

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center py-4"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 14, stiffness: 260 }}
        className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-200"
      >
        <Mail size={28} className="text-white" />
      </motion.div>

      <h3 className="text-[24px] font-bold text-gray-900 mb-1.5">Kiểm tra hộp thư của bạn</h3>
      <p className="text-[13px] text-gray-500 mb-1">Chúng tôi đã gửi email đến</p>
      <p className="text-[14px] font-semibold text-amber-600 mb-2">{email}</p>

      {/* Magic link hint */}
      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-6 text-left">
        <p className="text-[12px] text-emerald-700 font-medium mb-0.5">✅ Cách nhanh nhất</p>
        <p className="text-[12px] text-emerald-600">Mở email và nhấn nút <strong>"Xác nhận email ngay"</strong> — tự động đăng nhập, không cần nhập mã.</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full mb-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Hoặc nhập mã OTP</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="w-full bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl p-3 mb-4"
        >
          {error}
        </motion.div>
      )}
      {resendMsg && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] rounded-xl p-3 mb-4"
        >
          {resendMsg}
        </motion.div>
      )}

      {/* 6-digit input */}
      <div className="flex gap-2 mb-5" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`w-11 h-13 text-center text-[20px] font-bold border-2 rounded-xl transition-all outline-none
              ${d ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
              focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]`}
          />
        ))}
      </div>

      <button
        onClick={() => handleVerify(digits.join(""))}
        disabled={loading || digits.some(d => !d)}
        className="w-full py-3 rounded-xl bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 transition-all mb-4"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <>Xác nhận mã <CheckCircle2 size={16} /></>
        }
      </button>

      <div className="flex items-center justify-between w-full">
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-amber-600 disabled:opacity-40 transition-colors"
        >
          <RefreshCw size={13} />
          {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại email"}
        </button>
        <span className="text-[12px] text-gray-400">Hiệu lực 10 phút</span>
      </div>
    </motion.div>
  );
};

// ── Free course pick (shown after OTP for new FREE users) ────────────────
const CATEGORY_META = {
  WEDDING:        { emoji: "💍", label: "MC Đám cưới",    color: "#f59e0b", desc: "Kịch bản dẫn lễ cưới chuyên nghiệp, từ nhập tiệc đến trao nhẫn" },
  CORPORATE:      { emoji: "💼", label: "MC Doanh nghiệp", color: "#60a5fa", desc: "Hội nghị, tổng kết, lễ ra mắt sản phẩm — phong cách lịch lãm" },
  GALA:           { emoji: "✨", label: "MC Gala Dinner",   color: "#a78bfa", desc: "Dẫn chương trình gala sang trọng, xử lý tình huống sân khấu lớn" },
  TALKSHOW:       { emoji: "🎙️", label: "MC Talkshow",      color: "#34d399", desc: "Dẫn chuyện, phỏng vấn, điều phối khách mời tự nhiên, cuốn hút" },
  PRODUCT_LAUNCH: { emoji: "🚀", label: "Ra mắt sản phẩm", color: "#f472b6", desc: "Tạo điểm nhấn, build hype, dẫn sự kiện launch ấn tượng" },
  GENERAL:        { emoji: "📢", label: "Tổng hợp",         color: "#fb923c", desc: "Kỹ năng nền tảng MC: giọng nói, nhịp điệu, xử lý sự cố" },
};

// Quiz questions — each has options that carry category weights
const QUIZ = [
  {
    id: "goal",
    question: "Mục tiêu chính của bạn khi luyện tập?",
    icon: "🎯",
    options: [
      { label: "Trở thành MC chuyên nghiệp", icon: "🎤", weights: { WEDDING: 3, GALA: 2 } },
      { label: "Thuyết trình & giao tiếp công việc", icon: "💼", weights: { CORPORATE: 3, TALKSHOW: 2 } },
      { label: "Cải thiện phát âm, chữa ngọng", icon: "🗣️", weights: { GENERAL: 3 } },
      { label: "Khám phá, chưa có mục tiêu cụ thể", icon: "✨", weights: { GENERAL: 2, PRODUCT_LAUNCH: 1 } },
    ],
  },
  {
    id: "experience",
    question: "Kinh nghiệm MC của bạn hiện tại?",
    icon: "📊",
    options: [
      { label: "Chưa từng dẫn chương trình", icon: "🌱", weights: { GENERAL: 2 } },
      { label: "Đã dẫn vài buổi nhỏ", icon: "🙂", weights: { WEDDING: 1, CORPORATE: 1 } },
      { label: "Có kinh nghiệm, muốn nâng cao", icon: "🚀", weights: { GALA: 2, TALKSHOW: 1 } },
    ],
  },
  {
    id: "event",
    question: "Loại sự kiện bạn quan tâm nhất?",
    icon: "🎪",
    options: [
      { label: "Đám cưới & tiệc gia đình", icon: "💍", weights: { WEDDING: 3 } },
      { label: "Hội nghị & doanh nghiệp", icon: "🏢", weights: { CORPORATE: 3 } },
      { label: "Gala, sự kiện sang trọng", icon: "✨", weights: { GALA: 3 } },
      { label: "Talkshow, phỏng vấn, livestream", icon: "🎙️", weights: { TALKSHOW: 3, PRODUCT_LAUNCH: 1 } },
    ],
  },
];

const CoursePickScreen = ({ onPick, onSkip, submitting }) => {
  const [allCourses, setAllCourses] = useState([]);
  // "quiz" | "analyzing" | "result"
  const [phase, setPhase] = useState("quiz");
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [suggestedCourse, setSuggestedCourse] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null); // highlight on tap before transition
  const [direction, setDirection] = useState(1); // 1 = forward

  useEffect(() => {
    academyService.getAllCourses()
      .then(res => setAllCourses(res.data?.data || res.data || []))
      .catch(() => {});
  }, []);

  const pickBestCourse = (collectedAnswers, courses) => {
    const scores = {};
    for (const opt of collectedAnswers) {
      for (const [cat, w] of Object.entries(opt.weights)) {
        scores[cat] = (scores[cat] || 0) + w;
      }
    }
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    let match = null;
    for (const [cat] of ranked) {
      match = courses.find(c => c.category === cat);
      if (match) break;
    }
    return match || courses[0] || null;
  };

  const handleAnswer = (option, idx) => {
    setSelectedIdx(idx);
    const newAnswers = [...answers, option];

    setTimeout(() => {
      setSelectedIdx(null);
      if (quizStep < QUIZ.length - 1) {
        setDirection(1);
        setAnswers(newAnswers);
        setQuizStep(q => q + 1);
      } else {
        setAnswers(newAnswers);
        setPhase("analyzing");
        setTimeout(() => {
          const best = pickBestCourse(newAnswers, allCourses);
          setSuggestedCourse(best);
          setPhase("result");
        }, 1600);
      }
    }, 180);
  };

  // ── Quiz phase ──────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const q = QUIZ[quizStep];

    return (
      <div className="flex flex-col h-full">
        {/* Dot timeline + skip */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {QUIZ.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === quizStep ? 24 : 8,
                  backgroundColor: i < quizStep ? "#f59e0b" : i === quizStep ? "#f59e0b" : "#e5e7eb",
                  opacity: i > quizStep ? 0.5 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Bỏ qua
          </button>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={quizStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col flex-1"
          >
            {/* Question header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
                  {quizStep + 1} / {QUIZ.length}
                </span>
              </div>
              <h3 className="text-[19px] font-bold text-gray-900 leading-snug">{q.question}</h3>
              {quizStep === 0 && (
                <p className="text-[12px] text-gray-500 mt-1.5">
                  MC Hub sẽ tặng bạn <span className="font-semibold text-amber-600">1 khóa học miễn phí</span> dựa trên câu trả lời của bạn.
                </p>
              )}
            </div>

            {/* Option cards — large, tap-friendly */}
            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => {
                const isSelected = selectedIdx === i;
                return (
                  <motion.button
                    key={opt.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => handleAnswer(opt, i)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-150 group
                      ${isSelected
                        ? "border-amber-500 bg-amber-50 scale-[0.98]"
                        : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30 active:scale-[0.98]"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors
                      ${isSelected ? "bg-amber-100" : "bg-gray-50 group-hover:bg-amber-100/60"}`}>
                      {opt.icon}
                    </div>
                    <span className="text-[13.5px] font-semibold text-gray-800 leading-snug flex-1">{opt.label}</span>
                    <motion.div
                      animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0"
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    {!isSelected && (
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-amber-400 transition-colors shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Analyzing phase ─────────────────────────────────────────────────────
  if (phase === "analyzing") {
    const steps = ["Phân tích câu trả lời...", "Tìm khóa học phù hợp...", "Chuẩn bị quà tặng..."];
    return (
      <motion.div
        key="analyzing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        {/* Pulsing rings */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-amber-200"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-amber-300"
          />
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200 z-10">
            <span className="text-2xl">🎁</span>
          </div>
        </div>

        <h3 className="text-[18px] font-bold text-gray-900 mb-4">Đang tìm quà cho bạn</h3>

        <div className="flex flex-col gap-2 w-full max-w-55">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.4, duration: 0.4 }}
              className="flex items-center gap-2 text-[12px] text-gray-500"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.4 + 0.2, type: "spring", stiffness: 300 }}
                className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </motion.div>
              {s}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── Result phase ────────────────────────────────────────────────────────
  if (phase === "result") {
    if (!suggestedCourse) { onSkip(); return null; }
    const meta = CATEGORY_META[suggestedCourse.category] || CATEGORY_META.GENERAL;
    return (
      <motion.div
        key="gift"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col py-1"
      >
        {/* Header strip */}
        <div className="flex items-center gap-3 mb-5">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-200 shrink-0"
          >
            <span className="text-2xl">🎁</span>
          </motion.div>
          <div>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Quà tặng của bạn</p>
            <h3 className="text-[18px] font-bold text-gray-900 leading-tight">Khóa học miễn phí!</h3>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="ml-auto text-2xl"
          >✨</motion.span>
        </div>

        {/* Course card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5"
              style={{ background: meta.color + "18", border: `1.5px solid ${meta.color}35` }}
            >
              {meta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ background: meta.color + "18", color: meta.color }}
              >
                {meta.label}
              </span>
              <p className="text-[14px] font-bold text-gray-900 leading-snug mb-1">
                {suggestedCourse.title || meta.label}
              </p>
              {suggestedCourse.description && (
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{suggestedCourse.description}</p>
              )}
            </div>
          </div>

          {/* Match badge */}
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L4.5 8.5L10 3" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] text-amber-600 font-semibold">Phù hợp với mục tiêu của bạn</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => onPick(suggestedCourse)}
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 transition-all mb-2.5 shadow-sm shadow-amber-200"
        >
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo tài khoản...</>
            : <>Nhận quà &amp; Xác nhận email <ArrowRight size={15} /></>
          }
        </motion.button>

        <button
          onClick={onSkip}
          disabled={submitting}
          className="text-[12px] text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors text-center"
        >
          Bỏ qua, chỉ xác nhận email
        </button>
      </motion.div>
    );
  }

  return null;
};

// ── Avatar options (10 icons, emoji-based) ────────────────────────────────
const AVATARS = [
  { id: "mic",     emoji: "🎤", label: "Mic" },
  { id: "star",    emoji: "⭐", label: "Star" },
  { id: "crown",   emoji: "👑", label: "Crown" },
  { id: "fire",    emoji: "🔥", label: "Fire" },
  { id: "diamond", emoji: "💎", label: "Diamond" },
  { id: "rocket",  emoji: "🚀", label: "Rocket" },
  { id: "music",   emoji: "🎵", label: "Music" },
  { id: "trophy",  emoji: "🏆", label: "Trophy" },
  { id: "sparkle", emoji: "✨", label: "Sparkle" },
  { id: "bolt",    emoji: "⚡", label: "Bolt" },
];

// ── Register ──────────────────────────────────────────────────────────────
const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading, error } = useAuthStore();
  useApi(fetchUserRoles, []);

  const refParam = searchParams.get("ref") || "";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "", referralCode: refParam });
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [localError, setLocalError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  // "form" | "coursePick" | "otp" | "success"
  const verifyParam = searchParams.get("verify");
  const [step, setStep] = useState(verifyParam ? "otp" : "form");
  const [registeredEmail, setRegisteredEmail] = useState(verifyParam || "");
  const [userRole, setUserRole] = useState("");
  // Course picked during quiz — enrolled after OTP success
  const [pendingCourse, setPendingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    if (form.password !== form.confirmPassword) { setLocalError(t('auth.passwordMismatch')); return; }
    if (form.password.length < 8) { setLocalError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    // Go to quiz first — register API called after quiz
    setStep("coursePick");
  };

  const handleQuizDone = async (pickedCourse) => {
    // pickedCourse may be null (skipped)
    setPendingCourse(pickedCourse || null);
    // Persist so VerifyEmail page can enroll after magic link click
    if (pickedCourse) {
      localStorage.setItem("giftCourseId", pickedCourse.id || pickedCourse._id);
    } else {
      localStorage.removeItem("giftCourseId");
    }
    setLocalError("");
    setSubmitting(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, phoneNumber: form.phoneNumber, role: "MC", avatar: selectedAvatar };
      if (form.referralCode.trim()) payload.referralCode = form.referralCode.trim().toUpperCase();
      const res = await register(payload);
      setRegisteredEmail(res.email || form.email);
      setStep("otp");
    } catch (err) {
      setLocalError(err.response?.data?.message || error || "Đăng ký thất bại.");
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSuccess = async (res) => {
    setUserRole(res.user?.role || "MC");
    // Enroll the picked course now that account is verified
    if (pendingCourse) {
      const id = pendingCourse.id || pendingCourse._id;
      try { await academyService.giftEnrollCourse(id); } catch { /* ignore */ }
    }
    setStep("success");
    setTimeout(() => navigate(ROLE_REDIRECT[res.user?.role?.toLowerCase()] || "/m/dashboard"), 1500);
  };

  const finishRegistration = () => {
    setStep("success");
    setTimeout(() => navigate(ROLE_REDIRECT[userRole?.toLowerCase()] || "/m/dashboard"), 1500);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right image panel (visually right, DOM last) */}
      <div className="hidden lg:block lg:w-[46%] xl:w-[48%] shrink-0 sticky top-0 h-screen">
        <RightPanel />
      </div>

      {/* Left form panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-110"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-1.5">
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-0.5" />
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">Hub</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', damping: 14, stiffness: 260 }}
                  className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </motion.div>
                <h3 className="text-[26px] font-bold text-gray-900 mb-2">Email đã xác thực!</h3>
                <p className="text-[14px] text-gray-500 mb-10">Đang chuyển đến dashboard...</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.4, duration: 1.4, ease: "linear" }}
                  className="h-0.5 bg-amber-500 rounded-full max-w-xs"
                />
              </motion.div>
            ) : step === "coursePick" ? (
              <CoursePickScreen
                onPick={handleQuizDone}
                onSkip={() => handleQuizDone(null)}
                submitting={submitting}
              />
            ) : step === "otp" ? (
              <OtpScreen email={registeredEmail} onSuccess={handleOtpSuccess} />
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-7">
                  <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    {t('auth.createAccount')}
                  </h1>
                  <p className="text-[14px] text-gray-500">{t('auth.registerDesc')}</p>
                </div>

                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl p-3 text-center overflow-hidden"
                    >
                      {displayError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Name + Phone row */}
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label={t('auth.stageName')} icon={User}
                      type="text" name="name" placeholder="Nguyễn Văn A"
                      value={form.name} onChange={set('name')} required />
                    <InputField label={t('auth.phoneNumber')} icon={Phone}
                      type="tel" name="phoneNumber" placeholder="+84 9xx xxx"
                      value={form.phoneNumber} onChange={set('phoneNumber')} />
                  </div>

                  <InputField label={t('auth.email')} icon={Mail}
                    type="email" name="email" placeholder="you@mchub.com"
                    value={form.email} onChange={set('email')} required />

                  {/* Password */}
                  <div>
                    <InputField
                      label={t('auth.password')}
                      icon={Lock}
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="Tối thiểu 8 ký tự"
                      value={form.password}
                      onChange={set('password')}
                      required
                      suffix={
                        <button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                    />
                    <PasswordStrength password={form.password} />
                  </div>

                  {/* Confirm password */}
                  <InputField
                    label={t('auth.confirmPassword')}
                    icon={ShieldCheck}
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t('auth.reenterPassword')}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    required
                    suffix={
                      form.confirmPassword && form.password === form.confirmPassword
                        ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        : <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                    }
                  />

                  {/* Referral code */}
                  <InputField
                    label="Mã giới thiệu (không bắt buộc)"
                    icon={Gift}
                    type="text"
                    name="referralCode"
                    placeholder="Ví dụ: 5TY6H"
                    value={form.referralCode}
                    onChange={e => setForm(p => ({ ...p, referralCode: e.target.value.toUpperCase().slice(0, 5) }))}
                    maxLength={5}
                  />

                  {/* Avatar picker */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-gray-700">Chọn avatar của bạn</label>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all text-[22px] ${
                            selectedAvatar === av.id
                              ? 'border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,166,35,0.15)]'
                              : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/50'
                          }`}
                          title={av.label}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400">Vào website sẽ có thêm nhiều lựa chọn hơn.</p>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setAgreed(v => !v)}
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-all ${agreed ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white hover:border-amber-400'}`}
                    >
                      {agreed && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <p className="text-[12px] text-gray-500 leading-relaxed">
                      <span className="cursor-pointer" onClick={() => setAgreed(v => !v)}>{t('auth.agreeTerms')}{" "}</span>
                      <Link to="/terms" target="_blank" className="text-amber-600 hover:underline font-medium">{t('footer.termsOfService')}</Link>
                      {" "}{t('auth.and')}{" "}
                      <Link to="/privacy" target="_blank" className="text-amber-600 hover:underline font-medium">{t('footer.privacyPolicy')}</Link>.
                    </p>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading || !agreed}
                    whileHover={{ scale: (loading || !agreed) ? 1 : 1.01, boxShadow: (loading || !agreed) ? 'none' : '0 4px 20px rgba(245,166,35,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>{t('auth.createAccount')} <ArrowRight size={16} /></>
                    }
                  </motion.button>
                </form>

                <p className="text-center text-[13px] text-gray-500 mt-6 pt-5 border-t border-gray-100">
                  {"Đã có tài khoản?"}{" "}
                  <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                    {t('auth.signIn')}
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
