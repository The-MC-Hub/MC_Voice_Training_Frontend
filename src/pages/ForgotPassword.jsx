import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, ArrowRight, Shield, Key, CheckCircle2 } from "lucide-react";
import { forgotPassword, resetPassword } from "../services/authService";
import { trackForgotPasswordSubmit } from '@/utils/analytics';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try { await forgotPassword(email); setStep(2); }
    catch (err) { setError(err.response?.data?.message || "Failed to send reset code."); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError(t('auth.passwordMismatch')); return; }
    setLoading(true); setError("");
    try { await resetPassword(email, code, newPassword); trackForgotPasswordSubmit(); setStep(3); }
    catch (err) { setError(err.response?.data?.message || "Invalid code or failed to reset password."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090b]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-xl font-bold text-white tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] mb-0.5" />
            <span className="text-xl font-bold text-white tracking-tight">Hub</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">
            {step === 1 && t('auth.forgotPasswordTitle')}
            {step === 2 && t('auth.resetPasswordTitle')}
            {step === 3 && t('auth.passwordResetSuccessTitle')}
          </h2>
          <p className="mt-1.5 text-[14px] text-zinc-500">
            {step === 1 && t('auth.forgotPasswordDesc')}
            {step === 2 && t('auth.resetCodeSentDesc', { email })}
            {step === 3 && t('auth.resetSuccessDesc')}
          </p>
        </div>

        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl p-3 text-center mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.email')}</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
                  <Mail size={15} className="text-zinc-600 shrink-0" />
                  <input
                    type="email" placeholder="name@example.com"
                    className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>{t('auth.sendCode')} <ArrowRight size={16} /></>}
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-[13px] text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft size={14} /> {t('auth.backToLogin')}
              </Link>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.sixDigitCode')}</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
                  <Shield size={15} className="text-[#f5a623] shrink-0" />
                  <input
                    type="text" placeholder="000000" maxLength={6}
                    className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700 text-center tracking-[0.3em] font-bold"
                    value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.newPasswordLabel')}</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
                  <Key size={15} className="text-zinc-600 shrink-0" />
                  <input type="password" className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.confirmNewPasswordLabel')}</label>
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
                  <Shield size={15} className="text-zinc-600 shrink-0" />
                  <input type="password" className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={loading || code.length < 6}
                className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : t('auth.resetPasswordBtn')}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-[13px] text-zinc-500 hover:text-white transition-colors">
                {t('auth.resendCode')}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/[0.08] rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] text-zinc-400">{t('auth.securityUpdated')}</p>
                <p className="text-[13px] text-zinc-600">{t('auth.nowCanSignIn')}</p>
              </div>
              <Link to="/login"
                className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors flex items-center justify-center gap-2">
                {t('auth.goToLogin')} <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
