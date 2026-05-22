import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, Phone, ShieldCheck, ArrowRight, Zap, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useApi } from "../hooks/useApi";
import { fetchUserRoles } from "../controllers/publicController";

// Floating particles — same as Login
const Particles = () => {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    dur: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.25 + 0.05,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#f5a623]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [-12, 12, -12], opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
};

// Animated input
const FloatingInput = ({ icon: Icon, label, suffix, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <div className={`flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border rounded-xl transition-all duration-200 ${
        focused ? 'border-[#f5a623]/50 shadow-[0_0_0_3px_rgba(245,166,35,0.08)]' : 'border-white/[0.07] hover:border-white/[0.12]'
      }`}>
        <Icon size={15} className={`shrink-0 transition-colors ${focused ? 'text-[#f5a623]' : 'text-zinc-600'}`} />
        <input
          className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {suffix}
      </div>
    </div>
  );
};

// Password strength meter
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const labels = ['Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score-1] : 'bg-white/[0.06]'}`} />
        ))}
      </div>
      <p className={`text-[10px] ${score < 2 ? 'text-red-400' : score < 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
        Mật khẩu {labels[score - 1] || 'Yếu'}
      </p>
    </motion.div>
  );
};

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const { data: userRoles = [] } = useApi(fetchUserRoles, []);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "" });
  const [localError, setLocalError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0); // 0 = form, 1 = success

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (formData.password !== formData.confirmPassword) { setLocalError(t('auth.passwordMismatch')); return; }
    if (formData.password.length < 6) { setLocalError(t('settings.passwordTooShort')); return; }
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, role: "MC" });
      setStep(1);
      setTimeout(() => navigate("/onboarding"), 1800);
    } catch (err) {
      setLocalError(err.response?.data?.message || error || "Registration failed.");
    }
  };

  const displayError = localError || error;

  const stagger = (i) => ({ initial: { opacity: 0, x: -14 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.25 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] } });

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-[#09090b] relative overflow-hidden">
      <Particles />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-xl font-bold text-white tracking-tight">MC</span>
            <motion.span className="w-2 h-2 rounded-full bg-[#f5a623] mb-0.5"
              animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-xl font-bold text-white tracking-tight">Hub</span>
          </Link>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            className="mt-4 text-2xl font-bold text-white tracking-tight">{t('auth.createAccount')}</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            className="mt-1 text-[14px] text-zinc-500">{t('auth.registerDesc')}</motion.p>
        </motion.div>

        {/* Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, rotateY: -8, scale: 0.97 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 8, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ perspective: 1200 }}
                className="bg-[#111113] border border-white/[0.07] rounded-2xl p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
              >
                {/* top accent */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#f5a623]/25 to-transparent" />

                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl p-3 text-center overflow-hidden"
                    >
                      {displayError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div {...stagger(0)}>
                      <FloatingInput icon={User} label={t('auth.stageName')} type="text" name="name"
                        placeholder="MC Nathan" value={formData.name} onChange={handleChange} required />
                    </motion.div>
                    <motion.div {...stagger(1)}>
                      <FloatingInput icon={Phone} label={t('auth.phoneNumber')} type="tel" name="phoneNumber"
                        placeholder="+84 9xx xxx xxxx" value={formData.phoneNumber} onChange={handleChange} />
                    </motion.div>
                  </div>

                  <motion.div {...stagger(2)}>
                    <FloatingInput icon={Mail} label={t('auth.email')} type="email" name="email"
                      placeholder="you@mchub.com" value={formData.email} onChange={handleChange} required />
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div {...stagger(3)}>
                      <FloatingInput icon={Lock} label={t('auth.password')} type={showPass ? "text" : "password"}
                        name="password" placeholder="Min. 6 characters"
                        value={formData.password} onChange={handleChange} required
                        suffix={
                          <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => setShowPass(v => !v)}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors">
                            <AnimatePresence mode="wait">
                              <motion.span key={showPass ? 'on' : 'off'} initial={{ opacity: 0, rotate: -15 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                              </motion.span>
                            </AnimatePresence>
                          </motion.button>
                        }
                      />
                      <PasswordStrength password={formData.password} />
                    </motion.div>
                    <motion.div {...stagger(4)}>
                      <FloatingInput icon={ShieldCheck} label={t('auth.confirmPassword')}
                        type={showConfirm ? "text" : "password"} name="confirmPassword"
                        placeholder={t('auth.reenterPassword')}
                        value={formData.confirmPassword} onChange={handleChange} required
                        suffix={
                          <AnimatePresence mode="wait">
                            {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                              <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <CheckCircle2 size={14} className="text-emerald-400" />
                              </motion.span>
                            ) : (
                              <motion.button key="eye" type="button" whileTap={{ scale: 0.85 }} onClick={() => setShowConfirm(v => !v)}
                                className="text-zinc-600 hover:text-zinc-400 transition-colors">
                                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                              </motion.button>
                            )}
                          </AnimatePresence>
                        }
                      />
                    </motion.div>
                  </div>

                  <motion.div {...stagger(5)}>
                    <div className="flex items-center gap-3 p-4 bg-[#f5a623]/[0.06] border border-[#f5a623]/20 rounded-xl">
                      <Zap size={16} className="text-[#f5a623] shrink-0" />
                      <p className="text-[12px] text-zinc-400 leading-relaxed">{t('auth.onboardingNotice')}</p>
                    </div>
                  </motion.div>

                  <motion.div {...stagger(6)} className="flex items-start gap-3">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setAgreed(v => !v)}
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                        agreed ? 'bg-[#f5a623] border-[#f5a623]' : 'border-white/[0.16] bg-transparent hover:border-white/30'
                      }`}
                    >
                      <AnimatePresence>
                        {agreed && (
                          <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }} width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <label className="text-[12px] text-zinc-500 leading-relaxed cursor-pointer" onClick={() => setAgreed(v => !v)}>
                      {t('auth.agreeTerms')}{" "}
                      <Link to="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-[#f5a623] hover:underline">{t('footer.termsOfService')}</Link>
                      {" "}{t('auth.and')}{" "}
                      <Link to="/privacy" target="_blank" onClick={e => e.stopPropagation()} className="text-[#f5a623] hover:underline">{t('footer.privacyPolicy')}</Link>.{" "}
                      {t('auth.handleSecurely')}
                    </label>
                  </motion.div>

                  <motion.div {...stagger(7)}>
                    <motion.button
                      type="submit"
                      disabled={loading || !agreed}
                      whileHover={{ scale: (loading || !agreed) ? 1 : 1.01, boxShadow: (loading || !agreed) ? 'none' : '0 0 24px rgba(245,166,35,0.22)' }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <motion.span key="txt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                            {t('auth.createAccount')} <ArrowRight size={16} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                </form>

                <motion.p {...stagger(8)} className="text-center text-[13px] text-zinc-500 mt-5 pt-4 border-t border-white/[0.05]">
                  {t('auth.noAccount')}{" "}
                  <Link to="/login" className="text-[#f5a623] hover:underline font-medium">{t('auth.signIn')}</Link>
                </motion.p>
              </motion.div>
            ) : (
              // Success screen — card flip reveal
              <motion.div
                key="success"
                initial={{ opacity: 0, rotateY: 90, scale: 0.95 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ perspective: 1200 }}
                className="bg-[#111113] border border-white/[0.07] rounded-2xl p-12 shadow-[0_24px_80px_rgba(0,0,0,0.5)] flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 14, stiffness: 260 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </motion.div>
                <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2">Tài khoản đã tạo!</motion.h3>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="text-[14px] text-zinc-500">Đang chuyển đến trang thiết lập hồ sơ...</motion.p>
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.5, duration: 1.3, ease: "linear" }}
                  className="h-0.5 bg-[#f5a623] rounded-full mt-8 max-w-xs" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-1.5 mt-6">
          <Sparkles size={11} className="text-[#f5a623]/40" />
          <span className="text-[11px] text-zinc-700">MC Hub Voice Training Platform</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
