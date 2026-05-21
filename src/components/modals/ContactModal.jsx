import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';

const ContactModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          reply_to: formData.email,
          message: formData.message,
          to_email: 'letritrung2605@gmail.com'
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Email error:', error);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0f172a] border border-white/10 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
          >
            {/* Sidebar Information */}
            <div className="md:w-2/5 bg-gradient-to-br from-yellow-500 to-yellow-600 p-12 text-slate-950 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-4xl font-black uppercase italic leading-none mb-4">
                  {t('contact.modalTitle')}
                </h2>
                <p className="text-slate-900/70 font-bold text-sm uppercase tracking-widest mb-12">
                  {t('contact.modalSubtitle')}
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-slate-950/10 p-3 rounded-xl">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-50 tracking-tighter">Email</p>
                      <p className="font-bold">letritrung2605@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-slate-950/10 p-3 rounded-xl">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-50 tracking-tighter">Hotline</p>
                      <p className="font-bold">0912158715</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-slate-950/10 p-3 rounded-xl">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-50 tracking-tighter">Address</p>
                      <p className="font-bold">Da Nang City, Vietnam</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-12 border-t border-slate-950/10 mt-12 flex gap-4">
                {['FB', 'IG', 'YT', 'LI'].map(social => (
                  <button key={social} className="w-10 h-10 rounded-full border border-slate-950/20 flex items-center justify-center font-black text-xs hover:bg-slate-950 hover:text-yellow-500 transition-all">
                    {social}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Section */}
            <div className="md:w-3/5 p-12 bg-[#0a0f1d] relative">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">{t('contact.successTitle')}</h3>
                  <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">{t('contact.successMsg')}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('contact.name')}</label>
                    <div className="relative group">

                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('contact.namePlaceholder')}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 pl-14 pr-6 focus:outline-none focus:border-yellow-500/30 focus:bg-white/[0.06] transition-all font-medium text-slate-200 placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('contact.email')}</label>
                    <div className="relative group">

                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('contact.emailPlaceholder')}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 pl-14 pr-6 focus:outline-none focus:border-yellow-500/30 focus:bg-white/[0.06] transition-all font-medium text-slate-200 placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('contact.message')}</label>
                    <div className="relative group">

                      <textarea
                        required
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.messagePlaceholder')}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 pl-14 pr-6 focus:outline-none focus:border-yellow-500/30 focus:bg-white/[0.06] transition-all font-medium text-slate-200 placeholder:text-slate-700 resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-500/10 p-5 rounded-2xl border border-red-500/20"
                    >
                      <AlertCircle size={18} /> {t('contact.errorMsg')}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={status === 'sending'}
                    type="submit"
                    className="w-full py-6 bg-yellow-500 text-slate-950 rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 shadow-2xl shadow-yellow-500/20 hover:bg-yellow-400 transition-all disabled:opacity-50"
                  >
                    {status === 'sending' ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Send size={18} /> {t('contact.send')}</>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
