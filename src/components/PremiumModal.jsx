import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { trackPremiumModalView, trackPremiumModalUpgradeClick, trackPremiumModalDismiss } from '@/utils/analytics';

const PremiumModal = ({ isOpen, onClose, onUpgradeSuccess }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) trackPremiumModalView();
    if (isOpen && user?.id) fetchOrderDetails();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isOpen, user?.id]);

  // Start polling once QR is shown
  useEffect(() => {
    if (!orderData || success || !user?.id) return;
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payment/status/${user.id}`);
        if (res.data?.data?.isPremium === true) {
          clearInterval(pollRef.current);
          setPolling(false);
          updateUser({ isPremium: true });
          setSuccess(true);
          if (onUpgradeSuccess) onUpgradeSuccess();
          setTimeout(() => { onClose(); setSuccess(false); }, 3000);
        }
      } catch { /* silent — keep polling */ }
    }, 3000);
    return () => { clearInterval(pollRef.current); setPolling(false); };
  }, [orderData, success]);

  const fetchOrderDetails = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.post(`/payment/create-order?userId=${user.id}`);
      setOrderData(res.data.data);
    } catch (err) {
      console.error("Failed to generate checkout details:", err);
      setError(t('premiumModal.initError'));
    } finally { setLoading(false); }
  };

  const handleSimulateSuccess = async () => {
    setSimulating(true); setError(null);
    try {
      await api.post(`/payment/simulate-success?userId=${user.id}`);
      updateUser({ isPremium: true });
      setSuccess(true);
      if (onUpgradeSuccess) onUpgradeSuccess();
      setTimeout(() => { onClose(); setSuccess(false); }, 3000);
    } catch (err) {
      console.error("Failed to simulate upgrade:", err);
      setError(t('premiumModal.simulationError'));
    } finally { setSimulating(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => { trackPremiumModalDismiss(); onClose(); }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, y: 12, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 12, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-md border border-white/[0.08] bg-[#111113] text-white shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        >
          {/* Gold top bar */}
          <div className="h-1 w-full bg-[#f5a623]" />

          <button onClick={() => { trackPremiumModalDismiss(); onClose(); }}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-md border border-white/[0.07] text-zinc-500 hover:text-white hover:border-white/[0.14] transition-colors">
            <X size={16} />
          </button>

          {success ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('premiumModal.upgradeSuccess')}</h2>
              <p className="mt-3 max-w-sm text-zinc-400 text-[14px] leading-relaxed">
                {t('premiumModal.welcomeTo')} <span className="font-semibold text-[#f5a623]">MC Hub Premium</span>! {t('premiumModal.unlimitedUnlocked')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Features */}
              <div className="p-7 flex flex-col justify-between border-r border-white/[0.06]">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[#f5a623]/[0.08] border border-[#f5a623]/20 px-3 py-1 text-[11px] font-medium text-[#f5a623] mb-4">
                    <Sparkles size={11} fill="currentColor" /> {t('premiumModal.premiumTier')}
                  </div>
                  <h3 className="text-[20px] font-bold text-white leading-tight mb-2">
                    {t('premiumModal.upgradeTo')}<br /><span className="text-[#f5a623]">MC Hub Premium</span>
                  </h3>
                  <p className="text-zinc-500 text-[13px] leading-relaxed mb-6">
                    {t('premiumModal.tagline')}
                  </p>
                  <div className="space-y-3">
                    {[
                      { title: t('premiumModal.feature1Title'), desc: t('premiumModal.feature1Desc') },
                      { title: t('premiumModal.feature2Title'), desc: t('premiumModal.feature2Desc') },
                      { title: t('premiumModal.feature3Title'), desc: t('premiumModal.feature3Desc') },
                    ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <Check size={11} />
                        </div>
                        <p className="text-[13px] text-zinc-400">
                          <strong className="text-white">{feat.title}</strong>: {feat.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{t('premiumModal.promoOffer')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">20,000đ</span>
                    <span className="text-[13px] text-zinc-500 line-through">100,000đ</span>
                    <span className="rounded-md bg-red-500/[0.08] border border-red-500/20 px-2 py-0.5 text-[11px] text-red-400">-80%</span>
                  </div>
                </div>
              </div>

              {/* Checkout */}
              <div className="p-7 flex flex-col justify-center items-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-3 py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f5a623] border-t-transparent" />
                    <p className="text-[12px] text-zinc-500 uppercase tracking-wider">{t('premiumModal.generatingQr')}</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <AlertCircle className="mx-auto text-red-400 mb-3" size={28} />
                    <p className="text-[13px] text-zinc-400">{error}</p>
                    <button onClick={fetchOrderDetails}
                      className="mt-4 px-4 py-2 bg-[#09090b] border border-white/[0.07] rounded-md text-[12px] text-zinc-400 hover:text-white hover:border-white/[0.14] transition-colors">
                      {t('premiumModal.tryAgain')}
                    </button>
                  </div>
                ) : orderData ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="p-2 rounded-md bg-white shadow-lg mb-4">
                      <img src={orderData.qrUrl} alt="Payment VietQR" className="w-44 h-44 object-contain rounded-md" />
                    </div>
                    <div className="w-full space-y-2 rounded-md bg-[#09090b] border border-white/[0.06] p-4 text-left mb-5">
                      {[
                        { label: t('premiumModal.accountOwner'), val: orderData.accountName },
                        { label: t('premiumModal.bank'), val: "MBBank" },
                        { label: t('premiumModal.accountNo'), val: orderData.accountNumber },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex justify-between text-[12px]">
                          <span className="text-zinc-500">{label}:</span>
                          <span className="font-medium text-zinc-300">{val}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-[11px] text-[#f5a623] uppercase tracking-wider mb-1">{t('premiumModal.transferMemo')}</p>
                        <div className="flex items-center justify-between rounded-md bg-[#f5a623]/[0.06] border border-[#f5a623]/20 px-3 py-1.5">
                          <code className="text-[12px] font-medium text-[#f5a623] select-all">{orderData.memo}</code>
                          <span className="text-[10px] text-zinc-500">{t('premiumModal.doubleClickCopy')}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { trackPremiumModalUpgradeClick('premium'); handleSimulateSuccess(); }} disabled={simulating}
                      className="w-full py-2.5 bg-emerald-500 text-white font-medium rounded-md text-[13px] hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {simulating ? (
                        <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> {t('premiumModal.upgrading')}</>
                      ) : (
                        <><ShieldCheck size={14} /> {t('premiumModal.simulatePayment')}</>
                      )}
                    </button>
                    <div className="mt-2.5 flex items-center justify-center gap-1.5">
                      {polling && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      <p className="text-[11px] text-zinc-500 text-center">
                        {polling ? t('premiumModal.waitingPayment') : t('premiumModal.autoDetected')}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PremiumModal;
