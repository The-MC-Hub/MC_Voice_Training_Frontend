import React, { useEffect, useState } from "react";
import {
  CheckCircle2, Calendar, Star, ShieldCheck, Zap, MessageCircle, Briefcase, Lock, ArrowLeft,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Success = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const mcId = searchParams.get("mcId");
  const [mc, setMc] = useState(null);

  useEffect(() => {
    if (mcId) {
      const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/api\/v1\/?$/, "");
      fetch(`${apiBase}/api/v1/mcs/${mcId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) setMc(data.data);
          else if (data.name) setMc(data);
        })
        .catch(err => console.error("Error fetching MC:", err));
    }
  }, [mcId]);

  const mcName = mc?.name || (mcId ? t('payment.loadingMc') : "MC");
  const mcInitial = mcName.charAt(0);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center pt-32 pb-20 px-6 text-center">
      {/* Success icon */}
      <div className="w-24 h-24 rounded-full bg-[#f5a623] flex items-center justify-center mb-8 text-black">
        <CheckCircle2 size={48} />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {t('payment.stageIs')} <span className="text-[#f5a623]">{t('payment.stageSet')}</span>
          </h1>
          <p className="text-zinc-400 text-[15px] leading-relaxed max-w-xl mx-auto">
            {t('payment.bookingTransmitted')}
          </p>
        </div>

        {/* Booking summary */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 mt-8 flex flex-col md:flex-row gap-8 items-center text-left">
          <div className="flex items-center gap-4 md:border-r md:border-white/[0.07] md:pr-8">
            <div className="w-14 h-14 rounded-xl bg-[#09090b] border border-[#f5a623]/20 flex items-center justify-center text-[#f5a623] font-bold text-lg">
              {mcInitial}
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white">{mcName}</h4>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={10} className="text-[#f5a623]" /> {t('payment.platinumEliteMc')}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap gap-6 justify-center md:justify-start">
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">{t('payment.sessionDate')}</span>
              <div className="flex items-center gap-1.5 text-white text-[13px] font-medium">
                <Calendar size={13} className="text-[#f5a623]" /> Mar 21, 2026
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">{t('payment.status')}</span>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[13px] font-medium">
                <ShieldCheck size={13} /> {t('payment.fundsSecured')}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider block mb-1">{t('payment.trackingId')}</span>
              <div className="text-zinc-500 text-[13px] font-medium font-mono">
                #{bookingId ? bookingId.slice(-8).toUpperCase() : "HUB-S7-88219"}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (mcId) params.set("mcId", mcId);
              if (bookingId) params.set("bookingId", bookingId);
              navigate(`/m/messaging${params.toString() ? `?${params.toString()}` : ""}`);
            }}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14] text-[13px] font-medium transition-colors"
          >
            {t('payment.messageMc', { name: mc?.name || "MC" })} <MessageCircle size={16} className="text-[#f5a623]" />
          </button>
          <button
            onClick={() => navigate("/m/dashboard")}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
          >
            {t('payment.goToDashboard')} <Zap size={16} fill="currentColor" />
          </button>
        </div>

        {/* Footer badges */}
        <div className="flex justify-center gap-8 pt-8 text-zinc-700">
          {[
            { icon: ShieldCheck, text: t('payment.secureCheckout') },
            { icon: Lock, text: t('payment.escrowProtected') },
            { icon: Briefcase, text: t('payment.careerRoadmapReady') },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
              <Icon size={14} /> {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Success;
