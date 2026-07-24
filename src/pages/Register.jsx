import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail, Lock, User, Phone, ShieldCheck, ArrowRight,
  Eye, EyeOff, CheckCircle2, Mic, Zap, BarChart3, Award, RefreshCw,
  BookOpen, Star, Crown, Gift, Sparkles, Heart, Briefcase,
  Search, Calendar, CreditCard, MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useApi } from "../hooks/useApi";
import { fetchUserRoles } from "../controllers/publicController";
import { academyService } from "../services/academyService";
import { trackRegisterSubmit, trackRegisterSuccess, trackRegisterEmailVerify, trackRegisterQuizComplete } from '@/utils/analytics';
import { Button } from "@/components/animate-ui/components/buttons/button";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import GoogleRoleSelectModal from "@/components/auth/GoogleRoleSelectModal";
const ROLE_REDIRECT = { admin: "/m/dashboard", mc: "/m/dashboard", client: "/m/dashboard" };

const SLIDE_FEATURES_MC = [
  { icon: Mic,      title: "AI phân tích giọng nói",   desc: "5 tiêu chí: phát âm, nhịp điệu, tốc độ, độ rõ ràng, cảm xúc" },
  { icon: BarChart3,title: "Theo dõi tiến trình",       desc: "Biểu đồ điểm số theo thời gian, streak luyện tập hàng ngày" },
  { icon: Award,    title: "50+ kịch bản MC",           desc: "Đám cưới, sự kiện doanh nghiệp, talkshow, lễ tốt nghiệp" },
  { icon: BookOpen, title: "Lộ trình học cá nhân",      desc: "AI gợi ý bài học phù hợp trình độ và mục tiêu của bạn" },
];

const SLIDE_PLANS_MC = [
  { icon: Star,  tier: "FREE",  price: "Miễn phí",   perks: ["5 AI sessions", "10 bài học cơ bản"], badge: null },
  { icon: Zap,   tier: "BASIC", price: "199k/tháng", perks: ["20 AI sessions/tháng", "50+ bài học"], badge: "Phổ biến" },
  { icon: Crown, tier: "FULL",  price: "299k/tháng", perks: ["AI không giới hạn", "Toàn bộ tính năng"], badge: null },
];

const SLIDE_TESTIMONIALS_MC = [
  { quote: "Điểm phát âm tăng từ 64 lên 91 chỉ sau 2 tuần.", name: "Nguyễn Minh Khoa", role: "MC Đám cưới" },
  { quote: "Phân tích nhịp điệu rất chính xác, giúp tôi tự tin dẫn chương trình hơn.", name: "Trần Bảo Châu", role: "MC TV" },
  { quote: "Luyện lúc 11 giờ đêm mà không cần ai chấm điểm.", name: "Lê Đức Anh", role: "MC Doanh nghiệp" },
];

const SLIDE_FEATURES_CLIENT = [
  { icon: Search,       title: "Tìm MC theo nhu cầu",      desc: "Lọc theo thể loại sự kiện, khu vực, ngân sách và phong cách" },
  { icon: Calendar,     title: "Đặt lịch dễ dàng",          desc: "Xem lịch rảnh, gửi yêu cầu và xác nhận booking trong vài phút" },
  { icon: Star,         title: "Đánh giá minh bạch",        desc: "Xếp hạng, nhận xét từ khách hàng trước giúp bạn chọn đúng MC" },
];

const SLIDE_TESTIMONIALS_CLIENT = [
  { quote: "Tìm được MC ưng ý cho đám cưới chỉ trong 2 ngày. Rất tiện lợi!", name: "Hoàng Thu Thảo", role: "Cô dâu" },
  { quote: "Đặt MC cho hội nghị công ty, quy trình nhanh gọn, MC chuyên nghiệp.", name: "Phạm Quốc Bảo", role: "Event Manager" },
  { quote: "Review chân thực giúp tôi yên tâm chọn MC, không lo giá ảo.", name: "Vũ Minh Trang", role: "Wedding Planner" },
];

const SLIDES_MC = [
  { key: "features", label: "✦ TÍNH NĂNG" },
  { key: "pricing",  label: "✦ BẢNG GIÁ" },
  { key: "reviews",  label: "✦ ĐÁNH GIÁ" },
];

const SLIDES_CLIENT = [
  { key: "features", label: "✦ TÌM MC" },
  { key: "booking",  label: "✦ ĐẶT LỊCH" },
  { key: "reviews",  label: "✦ ĐÁNH GIÁ" },
];

const RightPanel = ({ role }) => {
  const isMC = role === "MC";
  const SLIDES = isMC ? SLIDES_MC : SLIDES_CLIENT;
  const SLIDE_FEATURES = isMC ? SLIDE_FEATURES_MC : SLIDE_FEATURES_CLIENT;
  const SLIDE_TESTIMONIALS = isMC ? SLIDE_TESTIMONIALS_MC : SLIDE_TESTIMONIALS_CLIENT;

  const [slideIdx, setSlideIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [SLIDES.length]);

  useEffect(() => {
    if (slideIdx !== (isMC ? 2 : 2)) return;
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % SLIDE_TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, [slideIdx, isMC, SLIDE_TESTIMONIALS.length]);

  return (
    <div className="photo-panel relative w-full h-full overflow-hidden flex flex-col justify-between p-10 lg:p-14">
      <img
        src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80"
        alt="Stage lights"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-black/70" />

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
                    <div className="w-8 h-8 rounded-md bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
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

            {/* Slide 1 — Pricing (MC) / Booking (CLIENT) */}
            {slideIdx === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                {isMC ? SLIDE_PLANS_MC.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-md bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
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
                )) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-md bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
                        <Calendar size={15} className="text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white leading-none mb-1">Gửi yêu cầu booking</p>
                        <p className="text-[11px] text-white/70 leading-relaxed">Chọn MC, chọn ngày, gửi yêu cầu — MC xác nhận trong 24h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-md bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
                        <CreditCard size={15} className="text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white leading-none mb-1">Thanh toán an toàn</p>
                        <p className="text-[11px] text-white/70 leading-relaxed">Đặt cọc online, thanh toán qua PayOS, bảo vệ cả hai bên</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-md bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
                        <MessageCircle size={15} className="text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white leading-none mb-1">Trao đổi trực tiếp</p>
                        <p className="text-[11px] text-white/70 leading-relaxed">Chat với MC để thống nhất kịch bản và yêu cầu đặc biệt</p>
                      </div>
                    </div>
                  </div>
                )}
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
      <div className={`flex items-center gap-2.5 px-3.5 py-3 border rounded-md transition-all ${
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
        className="w-16 h-16 rounded-md bg-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-200"
      >
        <Mail size={28} className="text-white" />
      </motion.div>

      <h3 className="text-[24px] font-bold text-gray-900 mb-1.5">Kiểm tra hộp thư của bạn</h3>
      <p className="text-[13px] text-gray-500 mb-1">Chúng tôi đã gửi email đến</p>
      <p className="text-[14px] font-semibold text-amber-600 mb-2">{email}</p>

      {/* Magic link hint */}
      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-md p-3.5 mb-3 text-left">
        <p className="text-[12px] text-emerald-700 font-medium mb-0.5">✅ Cách nhanh nhất</p>
        <p className="text-[12px] text-emerald-600">Mở email và nhấn nút <strong>"Xác nhận email ngay"</strong>, tự động đăng nhập, không cần nhập mã.</p>
      </div>

      {/* Spam hint */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-md p-3 mb-6 text-left flex items-start gap-2">
        <span className="text-amber-500 text-[14px] mt-px">⚠️</span>
        <p className="text-[12px] text-amber-700">Không thấy email? Kiểm tra thư mục <strong>Spam / Quảng cáo</strong>, đôi khi email bị lọc nhầm.</p>
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
          className="w-full bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-md p-3 mb-4"
        >
          {error}
        </motion.div>
      )}
      {resendMsg && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] rounded-md p-3 mb-4"
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
            className={`w-11 h-13 text-center text-[20px] font-bold border-2 rounded-md transition-all outline-none
              ${d ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
              focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]`}
          />
        ))}
      </div>

      <Button
        onClick={() => handleVerify(digits.join(""))}
        disabled={loading || digits.some(d => !d)}
        hoverScale={1}
        className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 transition-all mb-4 h-auto"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <>Xác nhận mã <CheckCircle2 size={16} /></>
        }
      </Button>

      <div className="flex items-center justify-between w-full">
        <Button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-amber-600 disabled:opacity-40 transition-colors h-auto"
        >
          <RefreshCw size={13} />
          {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại email"}
        </Button>
        <span className="text-[12px] text-gray-400">Hiệu lực 10 phút</span>
      </div>
    </motion.div>
  );
};

const DIFF_LABEL = { BEGINNER: "Cơ bản", INTERMEDIATE: "Trung cấp", ADVANCED: "Nâng cao" };
const DIFF_COLOR = { BEGINNER: "#10b981", INTERMEDIATE: "#f59e0b", ADVANCED: "#ef4444" };

const CoursePickScreen = ({ onPick, onSkip, submitting }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    academyService.getAllCourses()
      .then(res => setAllCourses(res.data?.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎁</span>
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Quà tặng cho bạn</span>
        </div>
        <h3 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">Chọn 1 khóa học miễn phí</h3>
        <p className="text-[13px] text-gray-500">Được đăng ký ngay sau khi xác thực email.</p>
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-90 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {allCourses.map((c, i) => {
            const key = c.id || c._id || String(i);
            const isSelected = selectedKey === key;
            const diff = DIFF_LABEL[c.difficulty] || c.difficulty;
            const diffColor = DIFF_COLOR[c.difficulty] || "#6b7280";
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                onClick={() => setSelectedKey(key)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-md border-2 text-left transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,166,35,0.12)]"
                    : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-gray-100">
                  {c.thumbnail
                    ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate">{c.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {diff && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: diffColor + "18", color: diffColor }}>
                        {diff}
                      </span>
                    )}
                    {c.totalLessons > 0 && (
                      <span className="text-[10px] text-gray-400">{c.totalLessons} bài</span>
                    )}
                  </div>
                </div>

                {/* Radio */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300"
                }`}>
                  {isSelected && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2">
        <motion.button
          onClick={() => { const c = allCourses.find(x => (x.id || x._id || String(allCourses.indexOf(x))) === selectedKey); c ? onPick(c) : onSkip(); }}
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm shadow-amber-200"
        >
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo tài khoản...</>
            : selectedKey
              ? <>Nhận khóa học &amp; Xác nhận email <ArrowRight size={15} /></>
              : <>Bỏ qua &amp; Xác nhận email <ArrowRight size={15} /></>
          }
        </motion.button>
        {selectedKey && (
          <Button onClick={onSkip} disabled={submitting} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors text-center h-auto">
            Bỏ qua, không nhận quà
          </Button>
        )}
      </div>
    </div>
  );
};

// ── Role Selection Screen (KYC step) ───────────────────────────────────────
const RoleSelectScreen = ({ onSelect }) => {
  const [hovered, setHovered] = useState(null);

  const CARDS = [
    {
      role: "MC",
      icon: Mic,
      title: "Tôi là MC",
      desc: "Tôi muốn luyện giọng, nhận đào tạo và tìm kiếm sự kiện phù hợp",
      features: ["Luyện giọng với AI", "Khóa học chuyên sâu", "Nhận booking từ khách hàng"],
    },
    {
      role: "CLIENT",
      icon: Search,
      title: "Tôi cần thuê MC",
      desc: "Tôi muốn tìm MC chuyên nghiệp cho sự kiện của mình",
      features: ["Tìm MC theo nhu cầu", "Đặt lịch dễ dàng", "Đánh giá minh bạch"],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[520px]"
    >
      {/* Decorative top accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-16 h-0.5 bg-amber-400 rounded-full mb-8 origin-left"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-3">
          Chào mừng đến với <span className="text-amber-500">MC Hub</span>
        </h1>
        <p className="text-[15px] text-gray-400">Bạn muốn tham gia với vai trò nào?</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        {CARDS.map((card, i) => {
          const isHovered = hovered === card.role;
          return (
            <motion.button
              key={card.role}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHovered(card.role)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(card.role)}
              className={`group relative flex flex-col items-center text-center p-8 rounded-xl border-2 transition-all duration-300 ${
                isHovered
                  ? "border-amber-400 bg-gradient-to-b from-amber-50 to-white shadow-[0_8px_32px_rgba(245,166,35,0.12)] -translate-y-0.5"
                  : "border-gray-200 bg-white hover:border-amber-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              }`}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`} style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.08) 0%, transparent 60%)',
              }} />

              {/* Icon circle */}
              <div className={`relative w-[68px] h-[68px] rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                isHovered
                  ? "bg-amber-500 text-white shadow-[0_8px_24px_rgba(245,166,35,0.25)] scale-110"
                  : "bg-amber-50 text-amber-500 border border-amber-200/60"
              }`}>
                <card.icon size={30} />
              </div>

              {/* Title */}
              <h3 className={`relative text-[18px] font-bold mb-2 transition-colors duration-200 ${
                isHovered ? 'text-gray-900' : 'text-gray-800'
              }`}>
                {card.title}
              </h3>

              {/* Description */}
              <p className={`relative text-[13px] leading-relaxed mb-5 transition-colors duration-200 ${
                isHovered ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {card.desc}
              </p>

              {/* Feature list with amber checks */}
              <ul className="relative space-y-2 w-full">
                {card.features.map((f, fi) => (
                  <motion.li
                    key={fi}
                    initial={false}
                    animate={isHovered ? { x: 0 } : { x: 0 }}
                    className="flex items-center gap-2.5 text-[12px] text-left"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isHovered
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-100 text-amber-500'
                    }`}>
                      <CheckCircle2 size={11} />
                    </div>
                    <span className={isHovered ? 'text-gray-700' : 'text-gray-500'}>{f}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Bottom arrow indicator on hover */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="relative mt-5 flex items-center gap-1 text-[11px] font-semibold text-amber-500 uppercase tracking-wider"
              >
                Chọn
                <ArrowRight size={12} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="text-[11px] text-gray-400 mt-7"
      >
        Có thể thay đổi vai trò sau trong phần cài đặt
      </motion.p>
    </motion.div>
  );
};
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
  const { register, loginWithGoogle, loading, error } = useAuthStore();
  useApi(fetchUserRoles, []);
  const [googlePending, setGooglePending] = useState(null); // { pendingToken, email, name }
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = async (idToken) => {
    setGoogleError("");
    try {
      const res = await loginWithGoogle(idToken);
      if (res?.requiresAdminOtp) {
        // Admin accounts can't self-register via this page — surface as an error instead
        // of silently doing nothing.
        setGoogleError("Tài khoản admin cần đăng nhập qua trang Login.");
        return;
      }
      if (res?.requiresRoleSelection) {
        setGooglePending({ pendingToken: res.pendingToken, email: res.email, name: res.name });
        return;
      }
      navigate(ROLE_REDIRECT[res.user?.role?.toLowerCase()] || "/m/dashboard", { replace: true });
    } catch (err) {
      setGoogleError(err.response?.data?.message || "Đăng ký Google thất bại.");
    }
  };

  const refParam = searchParams.get("ref") || "";

  // ── Cookie helpers (no dependency) ─────────────────────────────────────
  const COOKIE_KEY = "mcvt_reg_draft";
  const readDraft = () => {
    try {
      const match = document.cookie.split("; ").find(r => r.startsWith(COOKIE_KEY + "="));
      if (!match) return null;
      return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
    } catch { return null; }
  };
  const saveDraft = (data) => {
    const val = encodeURIComponent(JSON.stringify(data));
    // 1-day expiry, SameSite=Lax
    document.cookie = `${COOKIE_KEY}=${val};max-age=86400;path=/;SameSite=Lax`;
  };
  const clearDraft = () => {
    document.cookie = `${COOKIE_KEY}=;max-age=0;path=/;SameSite=Lax`;
  };

  // Init form from saved draft (exclude passwords)
  const draft = readDraft();
  const [form, setForm] = useState({
    name: draft?.name || "",
    email: draft?.email || "",
    password: "",
    confirmPassword: "",
    phoneNumber: draft?.phoneNumber || "",
    referralCode: draft?.referralCode || refParam,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(draft?.avatar || AVATARS[0].id);
  const [localError, setLocalError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  // "roleSelect" | "form" | "coursePick" | "otp" | "success"
  const verifyParam = searchParams.get("verify");
  const [step, setStep] = useState(verifyParam ? "otp" : "roleSelect");
  const [registeredEmail, setRegisteredEmail] = useState(verifyParam || "");
  const [selectedRole, setSelectedRole] = useState("MC");
  const [userRole, setUserRole] = useState("");
  // Course picked during quiz — enrolled after OTP success
  const [pendingCourse, setPendingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Persist non-sensitive fields to cookie on change
  useEffect(() => {
    saveDraft({ name: form.name, email: form.email, phoneNumber: form.phoneNumber, referralCode: form.referralCode, avatar: selectedAvatar });
  }, [form.name, form.email, form.phoneNumber, form.referralCode, selectedAvatar]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    trackRegisterSubmit();
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
      // Send the actual emoji (not the picker's internal id) — the backend
      // stores `avatar` as-is and the rest of the app (AvatarFrame,
      // MCAvatar, Settings' picker) all expect either an emoji character or
      // an image URL, never an id like "mic".
      const avatarEmoji = AVATARS.find((av) => av.id === selectedAvatar)?.emoji;
      const payload = { name: form.name, email: form.email, password: form.password, phoneNumber: form.phoneNumber, role: selectedRole, avatar: avatarEmoji };
      if (form.referralCode.trim()) payload.referralCode = form.referralCode.trim().toUpperCase();
      const res = await register(payload);
      trackRegisterSuccess();
      clearDraft();
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
    trackRegisterEmailVerify();
    setUserRole(res.user?.role || "MC");
    // Enroll the picked course now that account is verified
    if (pendingCourse) {
      const id = pendingCourse.id || pendingCourse._id;
      try { await academyService.giftEnrollCourse(id); } catch { /* ignore */ }
    }
    // Flag tour to start on first dashboard visit
    localStorage.setItem("mcvt_tour_pending", "1");
    localStorage.removeItem("mcvt_tour_done");
    setStep("success");
    setTimeout(() => navigate(ROLE_REDIRECT[res.user?.role?.toLowerCase()] || "/m/dashboard"), 1500);
  };

  const finishRegistration = () => {
    setStep("success");
    setTimeout(() => navigate(ROLE_REDIRECT[userRole?.toLowerCase()] || "/m/dashboard"), 1500);
  };

  const displayError = localError || error;

  return (
    <>
    <AnimatePresence>
      {googlePending && (
        <GoogleRoleSelectModal
          pending={googlePending}
          onSuccess={(res) => {
            setGooglePending(null);
            localStorage.setItem("mcvt_tour_pending", "1");
            localStorage.removeItem("mcvt_tour_done");
            navigate(ROLE_REDIRECT[res.user?.role?.toLowerCase()] || "/m/dashboard", { replace: true });
          }}
          onCancel={() => setGooglePending(null)}
        />
      )}
    </AnimatePresence>
    <div className="min-h-screen flex flex-row-reverse">
      {/* Right image panel (visually right, DOM last) */}
      <div className="hidden lg:block lg:w-[46%] xl:w-[48%] shrink-0 sticky top-0 h-screen">
        <RightPanel role={step === "roleSelect" ? "MC" : selectedRole} />
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
            {step === "roleSelect" ? (
              <RoleSelectScreen onSelect={(role) => { setSelectedRole(role); setStep("form"); }} />
            ) : step === "success" ? (
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
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setStep("roleSelect")}
                    className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition-colors mb-3"
                  >
                    <ArrowRight size={12} className="rotate-180" />
                    Thay đổi vai trò
                  </button>
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
                      className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-md p-3 text-center overflow-hidden"
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
                        <Button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 h-auto">
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
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
                        : <Button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 h-auto">
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
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
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {AVATARS.map((av) => (
                        <Button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.id)}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-md border-2 transition-all text-[22px] h-auto ${
                            selectedAvatar === av.id
                              ? 'border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,166,35,0.15)]'
                              : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/50'
                          }`}
                          title={av.label}
                        >
                          {av.emoji}
                        </Button>
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
                    className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>{t('auth.createAccount')} <ArrowRight size={16} /></>
                    }
                  </motion.button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">Hoặc</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {googleError && (
                  <p className="text-center text-[12px] text-red-600 mb-3">{googleError}</p>
                )}
                <GoogleSignInButton
                  onCredential={handleGoogleCredential}
                  onError={() => setGoogleError("Không thể tải Google Sign-In.")}
                  disabled={loading}
                  text="signup_with"
                />

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
    </>
  );
};

export default Register;
