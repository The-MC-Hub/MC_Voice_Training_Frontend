import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, MessageSquare, Sparkles } from 'lucide-react';
import emailjs from '@emailjs/browser';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const FloatingInput = ({ label, error, textarea, ...props }) => {
  const [focused, setFocused] = useState(false);
  const base = `w-full bg-[#09090b] border rounded-xl text-[14px] text-white placeholder:text-zinc-700 outline-none transition-all duration-200 ${
    focused ? 'border-[#f5a623]/50 shadow-[0_0_0_3px_rgba(245,166,35,0.08)]' : 'border-white/[0.07] hover:border-white/[0.12]'
  }`;
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      {textarea ? (
        <textarea
          className={`${base} py-3 px-4 resize-none`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      ) : (
        <input
          className={`${base} py-3 px-4`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      )}
    </div>
  );
};

const ContactUs = () => {
  const form = useRef();
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true); setStatus(null);
    emailjs.sendForm('REMOVED_SERVICE_ID', 'REMOVED_TEMPLATE_ID', form.current, 'REMOVED_PUBLIC_KEY')
      .then(() => { setStatus('success'); form.current.reset(); })
      .catch(() => setStatus('error'))
      .finally(() => setIsSending(false));
  };

  const contacts = [
    { icon: Mail,   label: 'Email hỗ trợ',  value: 'themchubforwork@gmail.com', sub: 'Phản hồi trong 24–48 giờ' },
    { icon: Phone,  label: 'Điện thoại',     value: '0912 158 715',             sub: 'Thứ 2 – Thứ 6, 8:00–17:00' },
    { icon: MapPin, label: 'Địa chỉ',        value: 'Đà Nẵng, Việt Nam',        sub: 'Văn phòng chính' },
    { icon: Clock,  label: 'Giờ hỗ trợ',     value: '8:00 – 22:00 hằng ngày',  sub: 'Kể cả cuối tuần' },
  ];

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,166,35,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.2), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[11px] font-medium text-[#f5a623] mb-5 uppercase tracking-wider">
            <MessageSquare size={11} /> Liên hệ
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
            Liên hệ <span className="text-[#f5a623]">với chúng tôi</span>
          </h1>
          <p className="text-zinc-500 text-[14px] max-w-lg mx-auto leading-relaxed">
            Có câu hỏi hoặc cần hỗ trợ? Đội ngũ MC Hub luôn sẵn sàng lắng nghe và giúp đỡ bạn.
          </p>
        </motion.div>
      </div>

      <main className="flex-1 pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Contact info cards */}
          <motion.div {...fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {contacts.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="p-4 bg-[#111113] border border-white/[0.07] rounded-2xl hover:border-white/[0.12] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center mb-3">
                  <Icon size={16} className="text-[#f5a623]" />
                </div>
                <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-[13px] font-semibold text-white leading-snug">{value}</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Main 2-col */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left — info + social */}
            <motion.div {...fadeUp} className="space-y-6">
              <div className="p-6 bg-[#111113] border border-white/[0.07] rounded-2xl space-y-4">
                <p className="text-[13px] font-semibold text-white mb-1">Thời gian phản hồi dự kiến</p>
                {[
                  { type: 'Email',   time: '24–48 giờ làm việc', dot: 'bg-emerald-400' },
                  { type: 'Hỗ trợ kỹ thuật', time: '2–4 giờ (8:00–22:00)', dot: 'bg-[#f5a623]' },
                  { type: 'Khiếu nại thanh toán', time: '48 giờ', dot: 'bg-blue-400' },
                ].map(({ type, time, dot }) => (
                  <div key={type} className="flex items-center justify-between py-2.5 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className="text-[13px] text-zinc-400">{type}</span>
                    </div>
                    <span className="text-[12px] text-zinc-600">{time}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-[#111113] border border-white/[0.07] rounded-2xl">
                <p className="text-[13px] font-semibold text-white mb-3">Trước khi liên hệ, thử xem</p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Trung tâm trợ giúp', link: '/help', desc: 'Câu hỏi thường gặp & hướng dẫn' },
                    { label: 'Điều khoản dịch vụ', link: '/terms', desc: 'Quyền và nghĩa vụ của bạn' },
                    { label: 'Chính sách bảo mật', link: '/privacy', desc: 'Cách chúng tôi xử lý dữ liệu' },
                  ].map(({ label, link, desc }) => (
                    <Link key={label} to={link}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group">
                      <div>
                        <p className="text-[13px] text-zinc-300 group-hover:text-white transition-colors">{label}</p>
                        <p className="text-[11px] text-zinc-600">{desc}</p>
                      </div>
                      <span className="text-zinc-600 group-hover:text-[#f5a623] transition-colors text-sm">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111113] border border-white/[0.07] rounded-2xl p-7 relative overflow-hidden"
            >
              <div className="absolute top-0 left-8 right-8 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.25), transparent)' }} />

              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={16} className="text-[#f5a623]" />
                <h2 className="text-[15px] font-semibold text-white">Gửi tin nhắn</h2>
              </div>

              <form ref={form} onSubmit={sendEmail} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Họ và tên" name="user_name" type="text" required placeholder="Nguyễn Văn A" />
                  <FloatingInput label="Email" name="user_email" type="email" required placeholder="you@example.com" />
                </div>
                <FloatingInput label="Chủ đề" name="subject" type="text" required placeholder="Vấn đề bạn cần hỗ trợ..." />
                <FloatingInput label="Lời nhắn" name="message" required textarea rows={5} placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..." />

                <motion.button
                  type="submit"
                  disabled={isSending}
                  whileHover={{ scale: isSending ? 1 : 1.01, boxShadow: isSending ? 'none' : '0 0 20px rgba(245,166,35,0.22)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 bg-[#f5a623] text-black rounded-xl text-[14px] font-semibold hover:bg-[#e09520] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <AnimatePresence mode="wait">
                    {isSending ? (
                      <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <motion.span key="txt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        <Send size={15} /> Gửi tin nhắn
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[13px] font-medium justify-center">
                      <CheckCircle2 size={16} /> Tin nhắn đã gửi thành công! Chúng tôi sẽ phản hồi sớm.
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px] font-medium justify-center">
                      <AlertCircle size={16} /> Gửi thất bại. Vui lòng thử lại hoặc email trực tiếp.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
