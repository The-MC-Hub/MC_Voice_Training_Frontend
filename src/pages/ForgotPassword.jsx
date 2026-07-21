import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, ArrowRight, Shield, Key, CheckCircle2 } from "lucide-react";
import { forgotPassword, resetPassword } from "../services/authService";
import { trackForgotPasswordSubmit } from '@/utils/analytics';
import { Button } from "@/components/animate-ui/components/buttons/button";

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

  const inputCls = "flex items-center gap-2.5 px-3.5 py-3 border border-gray-200 bg-gray-50 rounded-md focus-within:border-amber-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] transition-all";
  const iconCls = "shrink-0 text-gray-400";
  const textInputCls = "bg-transparent border-none outline-none flex-1 text-[14px] text-gray-900 placeholder:text-gray-400";
  const labelCls = "text-[13px] font-semibold text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-xl font-bold text-gray-900 tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-0.5" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Hub</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
            {step === 1 && t('auth.forgotPasswordTitle')}
            {step === 2 && t('auth.resetPasswordTitle')}
            {step === 3 && t('auth.passwordResetSuccessTitle')}
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            {step === 1 && t('auth.forgotPasswordDesc')}
            {step === 2 && t('auth.resetCodeSentDesc', { email })}
            {step === 3 && t('auth.resetSuccessDesc')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-md p-3 text-center mb-5">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('auth.email')}</label>
              <div className={inputCls}>
                <Mail size={15} className={iconCls} />
                <input type="email" placeholder="name@example.com"
                  className={textInputCls}
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-2 h-auto">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{t('auth.sendCode')} <ArrowRight size={16} /></>}
            </Button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-[13px] text-gray-500 hover:text-gray-800 transition-colors pt-1">
              <ArrowLeft size={14} /> {t('auth.backToLogin')}
            </Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('auth.sixDigitCode')}</label>
              <div className={inputCls}>
                <Shield size={15} className="shrink-0 text-amber-500" />
                <input type="text" placeholder="000000" maxLength={6}
                  className={`${textInputCls} text-center tracking-[0.3em] font-bold`}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('auth.newPasswordLabel')}</label>
              <div className={inputCls}>
                <Key size={15} className={iconCls} />
                <input type="password" className={textInputCls}
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('auth.confirmNewPasswordLabel')}</label>
              <div className={inputCls}>
                <Shield size={15} className={iconCls} />
                <input type="password" className={textInputCls}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" disabled={loading || code.length < 6}
              className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-2 h-auto">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('auth.resetPasswordBtn')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(1)}
              className="w-full text-[13px] text-gray-400 hover:text-gray-600 transition-colors pt-1 h-auto">
              {t('auth.resendCode')}
            </Button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[14px] text-gray-600">{t('auth.securityUpdated')}</p>
              <p className="text-[13px] text-gray-400">{t('auth.nowCanSignIn')}</p>
            </div>
            <Link to="/login"
              className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
              {t('auth.goToLogin')} <ArrowRight size={16} />
            </Link>
          </div>
        )}

        <p className="text-center text-[13px] text-gray-400 mt-8 pt-6 border-t border-gray-100">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
