import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Sparkles, Award, Zap, BookOpen, X, ExternalLink, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/animations/ScrollReveal';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { fetchFeaturedTrainingStats } from '../controllers/publicController';
import LazyImage from '../components/ui/LazyImage';
import ScrollToTop from '../components/ui/ScrollToTop';
import ContactModal from '../components/modals/ContactModal';

// ─── Animation presets ───────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};
const stagger = (i) => ({ ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.09 } });

// ─── CSS-only dot-grid background ─────────────────────────────────────────────
const GridBackground = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
      maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)',
    }}
  />
);

const Home = () => {
  const { t, i18n } = useTranslation();
  const { data: trainingStats } = useApi(fetchFeaturedTrainingStats);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedMCForCert, setSelectedMCForCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  const featuredMCs = trainingStats?.length ? trainingStats : [];

  return (
    <div className="bg-[#09090b] text-white min-h-screen overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <GridBackground />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-[#f5a623]/[0.05] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...stagger(0)}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f5a623]/25 bg-[#f5a623]/[0.06] text-[#f5a623] text-[11px] font-semibold uppercase tracking-widest mb-8">
              <Sparkles size={11} />
              {t('home.aiCoaching')}
            </span>
          </motion.div>

          <motion.h1 {...stagger(1)} className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            {t('home.heroTitle1')}{' '}
            <span className="text-[#f5a623]">{t('home.heroTitle2')}</span>
          </motion.h1>

          <motion.p {...stagger(2)} className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {t('home.heroSubtitle')}
          </motion.p>

          <motion.div {...stagger(3)} className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isAuthenticated ? '/m/voice/library' : '/register')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors shadow-lg shadow-[#f5a623]/10"
            >
              {t('home.startTraining')} <ArrowRight size={16} />
            </motion.button>
            <Link
              to="/m/voice/library"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] text-zinc-300 text-[14px] font-medium hover:border-white/[0.18] hover:text-white transition-colors"
            >
              {t('home.browseLibrary')}
            </Link>
          </motion.div>

          {/* Metrics strip */}
          <motion.div
            {...stagger(4)}
            className="flex justify-center gap-12 mt-16 pt-8 border-t border-white/[0.06]"
          >
            {[
              { value: '2,400+', label: t('home.totalSessions') || 'Sessions' },
              { value: '94%', label: t('home.accuracy') || 'Avg Accuracy' },
              { value: '50+', label: t('home.extensiveLibrary') || 'Scripts' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[12px] text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 2. LOGO MARQUEE ───────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/[0.04] overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex gap-20 animate-marquee shrink-0">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex gap-20 items-center">
                {['FPT EVENT', 'VINGROUP', 'TikTok', 'Senashow', 'Sun Group', 'Google'].map(brand => (
                  <span key={brand} className="text-sm font-medium text-zinc-700 hover:text-zinc-400 transition-colors uppercase tracking-widest cursor-default">
                    {brand}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES ───────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <ScrollReveal direction="up">
          <div className="mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t('home.coreAdvantage')}</h2>
            <p className="text-zinc-400 max-w-lg leading-relaxed text-[15px]">{t('home.coreAdvantageDesc')}</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <Mic size={20} />, title: t('home.rhythmCoach'), desc: t('home.rhythmCoachDesc'), color: 'text-[#f5a623]', bg: 'bg-[#f5a623]/[0.08]' },
            { icon: <Zap size={20} />, title: t('home.realTimeFeedback'), desc: t('home.realTimeFeedbackDesc'), color: 'text-blue-400', bg: 'bg-blue-500/[0.08]' },
            { icon: <BookOpen size={20} />, title: t('home.extensiveLibrary'), desc: t('home.extensiveLibraryDesc'), color: 'text-violet-400', bg: 'bg-violet-500/[0.08]' },
          ].map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-7 bg-[#111113] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-colors h-full"
              >
                <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-semibold mb-3">{f.title}</h3>
                <p className="text-zinc-500 text-[14px] leading-relaxed">{f.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── 4. MC CAROUSEL ────────────────────────────────────────────────── */}
      {featuredMCs.length > 0 && (
        <section className="py-20 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 mb-10">
            <ScrollReveal direction="left">
              <h2 className="text-3xl font-bold tracking-tight mb-2">{t('home.premiumVoices')}</h2>
              <p className="text-zinc-500 text-[14px]">{t('home.premiumVoicesDesc')}</p>
            </ScrollReveal>
          </div>

          <div className="relative">
            <div className="flex gap-5 animate-marquee-slow">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-5 shrink-0">
                  {featuredMCs.map((mc, idx) => (
                    <motion.div
                      key={`${i}-${idx}`}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-[240px] aspect-[2/3] rounded-2xl overflow-hidden relative group border border-white/[0.07] cursor-pointer"
                    >
                      <LazyImage
                        src={mc.avatar || `https://i.pravatar.cc/600?u=${idx}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-250 bg-black/70 backdrop-blur-sm p-5">
                        <div className="w-full space-y-3 mb-5">
                          {[
                            { label: t('home.accuracy'), val: `${mc.avgAccuracy?.toFixed(1)}%`, color: 'text-[#f5a623]' },
                            { label: t('home.rhythm'), val: `${mc.avgRhythm?.toFixed(1)}%`, color: 'text-blue-400' },
                            { label: t('home.totalSessions'), val: mc.totalSessions, color: 'text-violet-400' },
                          ].map(({ label, val, color }, j) => (
                            <div key={j} className="flex justify-between items-center border-b border-white/[0.08] pb-2">
                              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</span>
                              <span className={`text-[14px] font-bold ${color}`}>{val}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          disabled={!mc.totalSessions}
                          onClick={() => { if (mc.totalSessions) { setSelectedMCForCert(mc); setShowCertModal(true); } }}
                          className={`w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                            mc.totalSessions ? 'bg-[#f5a623] text-black hover:bg-[#e09520]' : 'bg-white/[0.06] text-zinc-600 cursor-not-allowed'
                          }`}
                        >
                          {t('home.viewPerformance')}
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 group-hover:opacity-0 transition-opacity duration-200">
                        <p className="text-[10px] font-semibold text-[#f5a623] uppercase tracking-wider mb-0.5">MC Pro</p>
                        <h4 className="text-[16px] font-bold truncate">{mc.name || 'Elite Voice'}</h4>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#09090b] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#09090b] to-transparent pointer-events-none z-10" />
          </div>
        </section>
      )}

      {/* ── 5. ROADMAP ────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <ScrollReveal direction="up">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-16">{t('home.successRoadmap')}</h2>
        </ScrollReveal>

        <div className="space-y-10">
          {[
            { step: '01', title: t('home.step1Title'), desc: t('home.step1Desc'), icon: <Zap size={16} /> },
            { step: '02', title: t('home.step2Title'), desc: t('home.step2Desc'), icon: <Sparkles size={16} /> },
            { step: '03', title: t('home.step3Title'), desc: t('home.step3Desc'), icon: <Award size={16} /> },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <div className="flex gap-8 items-start group">
                <p className="text-[60px] font-bold leading-none text-zinc-800 select-none shrink-0 w-20 text-right group-hover:text-zinc-700 transition-colors">
                  {item.step}
                </p>
                <div className="pt-2 border-t border-white/[0.06] flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#f5a623]">{item.icon}</span>
                    <h3 className="text-[16px] font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-zinc-500 text-[14px] leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── 6. CTA BANNER ─────────────────────────────────────────────────── */}
      <section className="pb-24 px-6 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="bg-[#111113] border border-white/[0.07] rounded-3xl p-12 lg:p-16 text-center">
            <div className="w-11 h-11 bg-[#f5a623] rounded-xl flex items-center justify-center text-black mx-auto mb-8">
              <Mic size={22} />
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight">
              {t('home.readyToOwnMic')}{' '}
              <span className="text-[#f5a623]">{t('home.theMic')}</span>
            </h2>
            <p className="text-zinc-400 text-[15px] max-w-lg mx-auto mb-10 leading-relaxed">
              {t('home.ctaDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-7 py-3 rounded-xl bg-[#f5a623] text-black text-[14px] font-semibold hover:bg-[#e09520] transition-colors"
              >
                {t('home.sendMessage') || 'Liên hệ ngay'}
              </button>
              <Link
                to="/m/voice/library"
                className="px-7 py-3 rounded-xl border border-white/[0.1] text-zinc-300 text-[14px] font-medium hover:border-white/[0.18] hover:text-white transition-colors"
              >
                {t('home.startLearning')}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
      <ScrollToTop />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {/* ── MC Certificate Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCertModal && selectedMCForCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-[#111113] border border-white/[0.08] rounded-2xl p-8 shadow-2xl"
            >
              <button
                onClick={() => { setShowCertModal(false); setCopiedCert(false); }}
                className="absolute top-5 right-5 w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>

              <div className="text-center mb-7">
                <p className="text-[11px] font-semibold text-[#f5a623] uppercase tracking-widest mb-1">The MC Hub Academy</p>
                <h3 className="text-xl font-bold tracking-tight">
                  {i18n.language === 'vi' ? 'Chứng nhận kỹ năng giọng nói MC' : 'Voice Performance Certificate'}
                </h3>
              </div>

              <div className="text-center mb-7 py-6 border-y border-white/[0.06]">
                <p className="text-[13px] text-zinc-500 mb-2">
                  {i18n.language === 'vi' ? 'Chứng nhận thành tích của' : 'Certified performance of'}
                </p>
                <h4 className="text-3xl font-bold text-[#f5a623]">{selectedMCForCert.name}</h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                {[
                  { label: i18n.language === 'vi' ? 'Chính xác' : 'Accuracy', value: `${selectedMCForCert.avgAccuracy?.toFixed(1)}%`, color: 'text-[#f5a623]' },
                  { label: i18n.language === 'vi' ? 'Nhịp điệu' : 'Rhythm', value: `${selectedMCForCert.avgRhythm?.toFixed(1)}%`, color: 'text-blue-400' },
                  { label: i18n.language === 'vi' ? 'Buổi tập' : 'Sessions', value: selectedMCForCert.totalSessions, color: 'text-violet-400' },
                  { label: i18n.language === 'vi' ? 'Giờ tập' : 'Hours', value: `${selectedMCForCert.totalPracticeHours?.toFixed(1)}h`, color: 'text-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-[#09090b] rounded-xl border border-white/[0.05] text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-600 mb-5 pt-4 border-t border-white/[0.06]">
                <span>ID: MCHUB-{selectedMCForCert.mcId?.substring(0, 10)?.toUpperCase() || 'ELITE'}</span>
                <span className="italic">MCHub Academy Board</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { navigate(`/m/messaging?mcId=${selectedMCForCert.mcId}`); setShowCertModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-zinc-300 text-[13px] font-medium hover:bg-white/[0.04] transition-colors"
                >
                  <ExternalLink size={13} className="text-[#f5a623]" />
                  {i18n.language === 'vi' ? 'Đặt lịch MC' : 'Book MC'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/m/mc/${selectedMCForCert.mcId}`);
                    setCopiedCert(true);
                    setTimeout(() => setCopiedCert(false), 2000);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    copiedCert
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      : 'border border-white/[0.08] text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Copy size={13} />
                  {copiedCert ? (i18n.language === 'vi' ? 'Đã sao chép!' : 'Copied!') : (i18n.language === 'vi' ? 'Sao chép link' : 'Copy link')}
                </button>
                <button
                  onClick={() => { setShowCertModal(false); setCopiedCert(false); }}
                  className="px-6 py-2.5 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-[#e09520] transition-colors"
                >
                  {i18n.language === 'vi' ? 'Đóng' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marquee      { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-slow { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee      { animation: marquee 30s linear infinite; }
        .animate-marquee-slow { animation: marquee-slow 70s linear infinite; }
      `}</style>
    </div>
  );
};

export default Home;
