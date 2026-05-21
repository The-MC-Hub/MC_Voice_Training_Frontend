import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ROLE_REDIRECT = { admin: "/m/dashboard", mc: "/m/dashboard", client: "/m/dashboard" };

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090b]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-xl font-bold text-white tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] mb-0.5" />
            <span className="text-xl font-bold text-white tracking-tight">Hub</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">{t('auth.welcomeBack')}</h2>
          <p className="mt-1.5 text-[14px] text-zinc-500">{t('auth.signInDesc')}</p>
        </div>

        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl p-3 text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.email')}</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
                <Mail size={15} className="text-zinc-600 shrink-0" />
                <input
                  type="email"
                  placeholder="you@mchub.com"
                  className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.password')}</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
                <Lock size={15} className="text-zinc-600 shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    rememberMe ? "bg-[#f5a623] border-[#f5a623]" : "border-white/[0.16] bg-transparent hover:border-white/30"
                  }`}
                >
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-zinc-400">{t('auth.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-[13px] text-zinc-500 hover:text-white transition-colors">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>{t('auth.signIn')} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-[13px] text-zinc-500">
              {t('auth.noAccount')}{" "}
              <Link to="/register" className="text-[#f5a623] hover:underline font-medium">{t('auth.registerHere')}</Link>
            </p>
            <p className="text-[12px] text-zinc-600">
              {t('auth.areYouMC')}{" "}
              <Link to="/register" className="text-[#f5a623] hover:underline">{t('auth.joinAsTalent')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
