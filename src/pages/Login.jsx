import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Mic, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

const ROLE_REDIRECT = { admin: "/m/dashboard", mc: "/m/dashboard", client: "/m/dashboard" };

const testimonials = [
  { name: "Nguyễn Minh Khoa", role: "MC Đám cưới", score: "91%", quote: "Điểm phát âm tăng từ 64 lên 91 chỉ sau 2 tuần luyện tập." },
  { name: "Trần Thị Bảo Châu", role: "Dẫn chương trình TV", score: "88%", quote: "Tiện nhất là luyện lúc 11 giờ đêm mà không cần ai chấm điểm." },
  { name: "Lê Đức Anh", role: "MC Sự kiện doanh nghiệp", score: "85%", quote: "Phân tích nhịp điệu và tốc độ nói rất chính xác." },
];

const LeftPanel = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveIdx(i => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="photo-panel relative w-full h-full overflow-hidden flex flex-col justify-between p-10 lg:p-14">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80"
        alt="MC on stage"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Strong overlay: dark on bottom 60% so text is always readable */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

      {/* Top: Logo */}
      <div className="relative z-10">
        <Link to="/" className="inline-flex items-center gap-1.5 group">
          <span className="text-[18px] font-bold text-white tracking-tight">MC</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[18px] font-bold text-white tracking-tight">Hub</span>
        </Link>
      </div>

      {/* Bottom: headline + testimonial */}
      <div className="relative z-10 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-widest mb-4">
            <Mic size={11} /> AI Voice Training Platform
          </span>
          <h2 className="text-[28px] lg:text-[36px] font-bold text-white leading-[1.2] tracking-tight drop-shadow-lg">
            Luyện giọng MC<br />chuyên nghiệp —<br />
            <span className="text-amber-400">mọi lúc, mọi nơi.</span>
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-[13px] text-white leading-relaxed mb-4 font-medium"
            >
              "{testimonials[activeIdx].quote}"
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={`a-${activeIdx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-[13px] font-semibold text-white">{testimonials[activeIdx].name}</p>
                <p className="text-[11px] text-white/70">{testimonials[activeIdx].role}</p>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={`s-${activeIdx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-right"
              >
                <p className="text-[24px] font-bold text-emerald-400 tabular-nums leading-none">{testimonials[activeIdx].score}</p>
                <p className="text-[10px] text-white/65 mt-0.5">Điểm đạt</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex gap-1.5 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {[{ value: "500+", label: "MC tin dùng" }, { value: "94%", label: "Độ chính xác" }, { value: "50+", label: "Kịch bản" }].map(s => (
            <div key={s.label}>
              <p className="text-[20px] font-bold text-white tabular-nums leading-none">{s.value}</p>
              <p className="text-[11px] text-white/65 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) { setShake(true); setTimeout(() => setShake(false), 400); }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    try {
      localStorage.setItem('rememberMe', rememberMe);
      const res = await login(email, password, rememberMe);
      navigate(ROLE_REDIRECT[res.user?.role?.toLowerCase()] || "/m/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.startsWith("EMAIL_NOT_VERIFIED:")) {
        clearError();
        const unverifiedEmail = msg.replace("EMAIL_NOT_VERIFIED:", "");
        navigate("/register?verify=" + encodeURIComponent(unverifiedEmail));
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left image panel */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[54%] shrink-0 sticky top-0 h-screen">
        <LeftPanel />
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-1.5">
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-0.5" />
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">Hub</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[30px] font-bold text-gray-900 tracking-tight leading-tight mb-2">{t('auth.welcomeBack')}</h1>
            <p className="text-[14px] text-gray-500">{t('auth.signInDesc')}</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl p-3 text-center overflow-hidden"
              >
                {error?.startsWith?.("EMAIL_NOT_VERIFIED:")
                  ? "Email chưa được xác thực. Đang chuyển đến trang xác thực..."
                  : error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleLogin}
            animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700">{t('auth.email')}</label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-amber-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] transition-all">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <input
                  type="email" placeholder="you@mchub.com" autoComplete="email" required
                  className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-900 placeholder:text-gray-400"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-gray-700">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-[12px] text-amber-600 hover:text-amber-700 font-medium transition-colors">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-amber-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] transition-all">
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  type={showPass ? "text" : "password"} placeholder="••••••••"
                  autoComplete="current-password" required
                  className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-900 placeholder:text-gray-400"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <button
                type="button" onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${rememberMe ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}
              >
                {rememberMe && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-[13px] text-gray-500 select-none">{t('auth.rememberMe')}</span>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01, boxShadow: loading ? 'none' : '0 4px 20px rgba(245,166,35,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-1"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>{t('auth.signIn')} <ArrowRight size={16} /></>
              }
            </motion.button>
          </motion.form>

          <p className="text-center text-[13px] text-gray-500 mt-7 pt-6 border-t border-gray-100">
            {t('auth.noAccount')}{" "}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
              {t('auth.registerHere')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
