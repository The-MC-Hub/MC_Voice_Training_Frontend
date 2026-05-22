import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

const ROLE_REDIRECT = { admin: "/m/dashboard", mc: "/m/dashboard", client: "/m/dashboard" };

// Floating particles background
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
      {/* subtle grid */}
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

// Animated input field
const FloatingInput = ({ icon: Icon, label, error, ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value?.length > 0;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.35 }}
        className={`flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border rounded-xl transition-all duration-200 ${
          focused ? 'border-[#f5a623]/50 shadow-[0_0_0_3px_rgba(245,166,35,0.08)]' : error ? 'border-red-500/40' : 'border-white/[0.07] hover:border-white/[0.12]'
        }`}
      >
        <Icon size={15} className={`shrink-0 transition-colors ${focused ? 'text-[#f5a623]' : 'text-zinc-600'}`} />
        <input
          className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </motion.div>
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
      navigate(ROLE_REDIRECT[res.user?.role] || "/m/dashboard", { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090b] relative overflow-hidden">
      <Particles />

      {/* Gold glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-6"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 group">
            <motion.span
              className="text-xl font-bold text-white tracking-tight"
              whileHover={{ letterSpacing: '0.05em' }}
              transition={{ duration: 0.2 }}
            >MC</motion.span>
            <motion.span
              className="w-2 h-2 rounded-full bg-[#f5a623] mb-0.5"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="text-xl font-bold text-white tracking-tight"
              whileHover={{ letterSpacing: '0.05em' }}
              transition={{ duration: 0.2 }}
            >Hub</motion.span>
          </Link>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-2xl font-bold text-white tracking-tight"
          >{t('auth.welcomeBack')}</motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-1 text-[14px] text-zinc-500"
          >{t('auth.signInDesc')}</motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-[#111113] border border-white/[0.07] rounded-2xl p-7 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {/* Gold top accent */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#f5a623]/30 to-transparent" />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl p-3 text-center overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <FloatingInput
                icon={Mail} label={t('auth.email')} error={!!error}
                type="email" placeholder="you@mchub.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t('auth.password')}</label>
                <div className={`flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border rounded-xl transition-all duration-200 border-white/[0.07] hover:border-white/[0.12] focus-within:border-[#f5a623]/50 focus-within:shadow-[0_0_0_3px_rgba(245,166,35,0.08)]`}>
                  <Lock size={15} className="text-zinc-600 shrink-0" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required autoComplete="current-password"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setShowPass(!showPass)}
                    className="text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span key={showPass ? 'off' : 'on'} initial={{ opacity: 0, rotate: -15 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 15 }} transition={{ duration: 0.15 }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
              className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <motion.div
                  onClick={() => setRememberMe(!rememberMe)}
                  whileTap={{ scale: 0.9 }}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    rememberMe ? "bg-[#f5a623] border-[#f5a623]" : "border-white/[0.16] bg-transparent hover:border-white/30"
                  }`}
                >
                  <AnimatePresence>
                    {rememberMe && (
                      <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }} width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-[13px] text-zinc-400 group-hover:text-zinc-300 transition-colors">{t('auth.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-[13px] text-zinc-500 hover:text-[#f5a623] transition-colors">
                {t('auth.forgotPassword')}
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01, boxShadow: loading ? 'none' : '0 0 20px rgba(245,166,35,0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden relative"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2">
                      {t('auth.signIn')} <ArrowRight size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="mt-5 pt-4 border-t border-white/[0.05] text-center space-y-1.5"
          >
            <p className="text-[13px] text-zinc-500">
              {t('auth.noAccount')}{" "}
              <Link to="/register" className="text-[#f5a623] hover:underline font-medium transition-colors">
                {t('auth.registerHere')}
              </Link>
            </p>
            <p className="text-[12px] text-zinc-600">
              {t('auth.areYouMC')}{" "}
              <Link to="/register" className="text-[#f5a623] hover:underline transition-colors">
                {t('auth.joinAsTalent')}
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex items-center justify-center gap-1.5 mt-6"
        >
          <Sparkles size={11} className="text-[#f5a623]/40" />
          <span className="text-[11px] text-zinc-700">MC Hub Voice Training Platform</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
