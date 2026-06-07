import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail, Lock, User, Phone, ShieldCheck, ArrowRight,
  Eye, EyeOff, CheckCircle2, Mic, Zap, BarChart3, Award, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useApi } from "../hooks/useApi";
import { fetchUserRoles } from "../controllers/publicController";
const ROLE_REDIRECT = { admin: "/m/dashboard", mc: "/m/dashboard", client: "/m/dashboard" };

const features = [
  { icon: Mic,       title: "AI phân tích giọng nói",   desc: "Nhận phản hồi chi tiết trên 5 tiêu chí trong 30 giây." },
  { icon: BarChart3, title: "Theo dõi tiến trình",       desc: "Dashboard cá nhân với biểu đồ điểm số theo thời gian." },
  { icon: Award,     title: "50+ kịch bản MC",           desc: "Đám cưới, sự kiện doanh nghiệp, talkshow truyền hình." },
];

const RightPanel = () => (
  <div className="photo-panel relative w-full h-full overflow-hidden flex flex-col justify-between p-10 lg:p-14">
    <img
      src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80"
      alt="Stage lights"
      className="absolute inset-0 w-full h-full object-cover object-center"
    />
    {/* Strong overlay so text is readable */}
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

    {/* Bottom content */}
    <div className="relative z-10 space-y-6">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-widest mb-4">
          <Zap size={11} /> Tham gia miễn phí
        </span>
        <h2 className="text-[28px] lg:text-[34px] font-bold text-white leading-[1.2] tracking-tight drop-shadow-lg">
          Bắt đầu hành trình<br />MC của bạn<br />
          <span className="text-amber-400">hôm nay.</span>
        </h2>
      </div>

      <div className="space-y-2.5">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 flex items-center gap-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/25 border border-amber-400/40 flex items-center justify-center shrink-0">
              <f.icon size={16} className="text-amber-300" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-none mb-1">{f.title}</p>
              <p className="text-[11px] text-white/75 leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[12px] text-white/40">Đã có 500+ MC đang luyện tập trên nền tảng</p>
    </div>
  </div>
);

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
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
      className="flex flex-col items-center text-center py-6"
    >
      <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-5">
        <Mail size={28} className="text-amber-500" />
      </div>
      <h3 className="text-[24px] font-bold text-gray-900 mb-2">Xác thực email</h3>
      <p className="text-[13px] text-gray-500 mb-1">Nhập mã 6 số đã gửi đến</p>
      <p className="text-[14px] font-semibold text-amber-600 mb-8">{email}</p>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-xl p-3 mb-4">
          {error}
        </div>
      )}
      {resendMsg && (
        <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] rounded-xl p-3 mb-4">
          {resendMsg}
        </div>
      )}

      {/* 6-digit input */}
      <div className="flex gap-2.5 mb-8" onPaste={handlePaste}>
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
            className={`w-12 h-14 text-center text-[22px] font-bold border-2 rounded-xl transition-all outline-none
              ${d ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
              focus:border-amber-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)]`}
          />
        ))}
      </div>

      <button
        onClick={() => handleVerify(digits.join(""))}
        disabled={loading || digits.some(d => !d)}
        className="w-full py-3 rounded-xl bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-2 transition-all mb-4"
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <>Xác nhận <CheckCircle2 size={16} /></>
        }
      </button>

      <button
        onClick={handleResend}
        disabled={resendCooldown > 0}
        className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-amber-600 disabled:opacity-40 transition-colors"
      >
        <RefreshCw size={13} />
        {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : "Gửi lại mã"}
      </button>
    </motion.div>
  );
};

// ── Register ──────────────────────────────────────────────────────────────
const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading, error } = useAuthStore();
  useApi(fetchUserRoles, []);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "" });
  const [localError, setLocalError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  // "form" | "otp" | "success"
  const verifyParam = searchParams.get("verify");
  const [step, setStep] = useState(verifyParam ? "otp" : "form");
  const [registeredEmail, setRegisteredEmail] = useState(verifyParam || "");

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (form.password !== form.confirmPassword) { setLocalError(t('auth.passwordMismatch')); return; }
    if (form.password.length < 6) { setLocalError(t('settings.passwordTooShort')); return; }
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password, phoneNumber: form.phoneNumber, role: "MC" });
      setRegisteredEmail(res.email || form.email);
      setStep("otp");
    } catch (err) {
      setLocalError(err.response?.data?.message || error || "Đăng ký thất bại.");
    }
  };

  const handleOtpSuccess = (res) => {
    setStep("success");
    setTimeout(() => navigate(ROLE_REDIRECT[res.user?.role?.toLowerCase()] || "/m/dashboard"), 1500);
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Phone row */}
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label={t('auth.stageName')} icon={User}
                      type="text" name="name" placeholder="MC Nathan"
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
                      placeholder="Tối thiểu 6 ký tự"
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
