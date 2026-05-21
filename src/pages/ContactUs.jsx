import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
  const { t } = useTranslation();
  const form = useRef();
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true); setStatus(null);
    emailjs.sendForm('service_rrbzukc', 'template_66htbuq', form.current, '38LabtbQGWpILIEqz')
      .then(() => { setStatus('success'); form.current.reset(); })
      .catch(() => { setStatus('error'); })
      .finally(() => setIsSending(false));
  };

  const inputCls = "w-full bg-[#09090b] border border-white/[0.07] rounded-xl py-3 px-4 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-white/[0.14] transition-colors";

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left */}
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
                  {t('contact.titlePrefix')} <span className="text-[#f5a623]">{t('contact.titleSuffix')}</span>
                </h1>
                <p className="text-[14px] text-zinc-500 leading-relaxed max-w-sm">{t('contact.desc')}</p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: Mail, label: t('contact.emailUs'), value: "letritrung2605@gmail.com" },
                  { icon: Phone, label: t('contact.callUs'), value: "0912158715" },
                  { icon: MapPin, label: t('contact.visitUs'), value: "Đà Nẵng, Việt Nam" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f5a623]/[0.08] flex items-center justify-center text-[#f5a623] shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-[14px] font-medium text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-7">
              <form ref={form} onSubmit={sendEmail} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('contact.fullName')}</label>
                    <input name="user_name" type="text" required placeholder={t('contact.enterName')} className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('contact.emailAddress')}</label>
                    <input name="user_email" type="email" required placeholder={t('contact.enterEmail')} className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('contact.subject')}</label>
                  <input name="subject" type="text" required placeholder={t('contact.whatAbout')} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{t('contact.message')}</label>
                  <textarea name="message" required rows="5" placeholder={t('contact.tellMore')}
                    className={`${inputCls} resize-none`} />
                </div>

                <button type="submit" disabled={isSending}
                  className="w-full py-2.5 bg-[#f5a623] text-black rounded-xl text-[14px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSending ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Send size={15} /> {t('contact.sendMessage')}</>}
                </button>

                {status === 'success' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-medium justify-center">
                    <CheckCircle2 size={16} /> {t('contact.sentSuccess')}
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-[13px] font-medium justify-center">
                    <AlertCircle size={16} /> {t('contact.sentError')}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
