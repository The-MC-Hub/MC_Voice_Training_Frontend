import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, Phone, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useApi } from "../hooks/useApi";
import { fetchUserRoles } from "../controllers/publicController";

const InputField = ({ icon: Icon, ...props }) => (
  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#09090b] border border-white/[0.07] rounded-xl focus-within:border-white/[0.16] transition-colors">
    <Icon size={15} className="text-zinc-600 shrink-0" />
    <input className="bg-transparent border-none outline-none flex-1 text-[14px] text-white placeholder:text-zinc-700" {...props} />
  </div>
);

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const { data: userRoles = [] } = useApi(fetchUserRoles, []);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", phoneNumber: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (formData.password !== formData.confirmPassword) { setLocalError(t('auth.passwordMismatch')); return; }
    if (formData.password.length < 6) { setLocalError(t('settings.passwordTooShort')); return; }
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber, role: "MC" });
      navigate("/onboarding");
    } catch (err) {
      setLocalError(err.response?.data?.message || error || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-[#09090b]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5">
            <span className="text-xl font-bold text-white tracking-tight">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] mb-0.5" />
            <span className="text-xl font-bold text-white tracking-tight">Hub</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">{t('auth.createAccount')}</h2>
          <p className="mt-1.5 text-[14px] text-zinc-500">{t('auth.registerDesc')}</p>
        </div>

        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-8">
          {(localError || error) && (
            <div className="bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] rounded-xl p-3 text-center mb-6">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.stageName')}</label>
                <InputField icon={User} type="text" name="name" placeholder="MC Nathan" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.phoneNumber')}</label>
                <InputField icon={Phone} type="tel" name="phoneNumber" placeholder="+84 9xx xxx xxxx" value={formData.phoneNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.email')}</label>
              <InputField icon={Mail} type="email" name="email" placeholder="you@mchub.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.password')}</label>
                <InputField icon={Lock} type="password" name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{t('auth.confirmPassword')}</label>
                <InputField icon={ShieldCheck} type="password" name="confirmPassword" placeholder={t('auth.reenterPassword')} value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#f5a623]/[0.06] border border-[#f5a623]/20 rounded-xl">
              <Zap size={16} className="text-[#f5a623] shrink-0" />
              <p className="text-[12px] text-zinc-400 leading-relaxed">{t('auth.onboardingNotice')}</p>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded accent-[#f5a623]" required />
              <label htmlFor="terms" className="text-[12px] text-zinc-500 leading-relaxed">
                {t('auth.agreeTerms')}{" "}
                <Link to="/terms" target="_blank" className="text-[#f5a623] hover:underline">{t('footer.termsOfService')}</Link>
                {" "}{t('auth.and')}{" "}
                <Link to="/privacy" target="_blank" className="text-[#f5a623] hover:underline">{t('footer.privacyPolicy')}</Link>.{" "}
                {t('auth.handleSecurely')}
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <>{t('auth.createAccount')} <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-[13px] text-zinc-500 mt-6">
            {t('auth.noAccount')}{" "}
            <Link to="/login" className="text-[#f5a623] hover:underline font-medium">{t('auth.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
