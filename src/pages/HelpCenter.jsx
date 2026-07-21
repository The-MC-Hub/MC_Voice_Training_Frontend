import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, HelpCircle, Book, MessageSquare, Zap, ChevronDown,
  Mic, Star, Settings, CreditCard, Shield, ArrowUp, LifeBuoy,
  PlayCircle, BarChart2, Users, FileText
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

/* ── Accordion FAQ item ── */
const FaqItem = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`border rounded-md overflow-hidden transition-colors ${
        open ? 'border-[#f5a623]/25 bg-[#111113]' : 'border-white/[0.07] bg-[#111113] hover:border-white/[0.12]'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left gap-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
            open ? 'bg-[#f5a623]/[0.15] text-[#f5a623]' : 'bg-white/[0.04] text-zinc-500 group-hover:text-[#f5a623] group-hover:bg-[#f5a623]/[0.08]'
          }`}>
            <HelpCircle size={14} />
          </div>
          <span className={`text-[13px] font-medium transition-colors ${open ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{q}</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 transition-colors ${open ? 'text-[#f5a623]' : 'text-zinc-600'}`}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[13px] text-zinc-400 leading-relaxed pl-[60px]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const categories = [
  {
    icon: PlayCircle, label: 'Tất cả', value: 'all',
  },
  {
    icon: Book, label: 'Bắt đầu', value: 'start',
    title: 'Bắt đầu sử dụng',
    desc: 'Hướng dẫn đăng ký, thiết lập hồ sơ và bước đầu làm quen với MC Hub',
    count: 8,
  },
  {
    icon: Mic, label: 'Luyện giọng', value: 'voice',
    title: 'Luyện giọng & AI',
    desc: 'Cách thực hành hiệu quả với hệ thống phân tích AI và thư viện kịch bản',
    count: 12,
  },
  {
    icon: BarChart2, label: 'Kết quả', value: 'result',
    title: 'Kết quả & Tiến trình',
    desc: 'Đọc hiểu báo cáo điểm số, biểu đồ tiến trình và lịch sử luyện tập',
    count: 6,
  },
  {
    icon: CreditCard, label: 'Thanh toán', value: 'billing',
    title: 'Gói & Thanh toán',
    desc: 'Nâng cấp tài khoản, phương thức thanh toán và chính sách hoàn tiền',
    count: 4,
  },
  {
    icon: Shield, label: 'Tài khoản', value: 'account',
    title: 'Tài khoản & Bảo mật',
    desc: 'Quản lý thông tin cá nhân, đổi mật khẩu và cài đặt bảo mật',
    count: 7,
  },
];

const faqs = {
  start: [
    { q: 'Làm thế nào để tạo tài khoản trên MC Hub?', a: 'Truy cập trang đăng ký, điền email và mật khẩu, sau đó xác nhận qua email. Sau khi xác thực, bạn có thể bắt đầu sử dụng ngay.' },
    { q: 'Tôi cần thiết bị gì để luyện tập?', a: 'Bạn chỉ cần trình duyệt hiện đại (Chrome, Firefox, Edge) và microphone — laptop tích hợp hoặc USB mic đều dùng được. Không cần cài thêm phần mềm.' },
    { q: 'Làm thế nào để bắt đầu buổi luyện tập đầu tiên?', a: 'Vào mục "Luyện tập", chọn kịch bản từ thư viện hoặc dùng kịch bản mẫu, nhấn "Bắt đầu" và cho phép trình duyệt truy cập microphone.' },
    { q: 'Tôi có thể dùng MC Hub trên điện thoại không?', a: 'MC Hub hiện là nền tảng web, hoạt động tốt trên cả desktop và mobile browser. App native đang trong quá trình phát triển.' },
  ],
  voice: [
    { q: 'AI phân tích giọng nói như thế nào?', a: 'Hệ thống AI phân tích nhiều chiều: phát âm (so sánh với chuẩn phát âm MC chuyên nghiệp), nhịp điệu (tốc độ đọc, ngắt nghỉ), ngữ điệu (lên xuống âm thanh), và độ rõ ràng của từng âm tiết.' },
    { q: 'Điểm số của tôi được tính như thế nào?', a: 'Điểm tổng được tổng hợp từ 4 chỉ số: Phát âm (35%), Nhịp điệu (25%), Ngữ điệu (25%), và Độ tự nhiên (15%). Mỗi chỉ số được AI chấm trên thang 0–100.' },
    { q: 'Tôi có thể tải kịch bản của riêng mình lên không?', a: 'Hiện tại bạn sử dụng kịch bản từ thư viện có sẵn. Tính năng tải kịch bản tùy chỉnh đang được phát triển và sẽ ra mắt trong bản cập nhật tới.' },
    { q: 'Làm thế nào để cải thiện điểm phát âm?', a: 'Tập trung luyện các âm khó trước (ch/tr/x/s, hỏi/ngã), nghe lại bản ghi âm của mình và so sánh với mẫu chuẩn trong thư viện. Luyện đều đặn 15–30 phút/ngày cho kết quả tốt nhất.' },
    { q: 'Tại sao microphone không hoạt động?', a: 'Kiểm tra: (1) Trình duyệt đã được cấp quyền microphone chưa (biểu tượng khóa trên thanh địa chỉ), (2) Không có app nào khác đang dùng mic, (3) Thử làm mới trang và cho phép lại.' },
  ],
  result: [
    { q: 'Báo cáo sau buổi luyện có ý nghĩa gì?', a: 'Báo cáo hiển thị điểm tổng, điểm từng tiêu chí, biểu đồ so sánh với buổi trước, và gợi ý cụ thể từ AI về điểm cần cải thiện.' },
    { q: 'Lịch sử luyện tập được lưu bao lâu?', a: 'Tài khoản Free: kết quả luyện tập được lưu nhưng không có biểu đồ tiến độ. Gói Full và Annual: lịch sử không giới hạn kèm biểu đồ tiến trình chi tiết.' },
    { q: 'Làm thế nào để xem tiến trình theo thời gian?', a: 'Vào Dashboard → mục "Tiến trình", chọn khoảng thời gian muốn xem. Biểu đồ đường thể hiện xu hướng điểm số theo ngày/tuần/tháng.' },
  ],
  billing: [
    { q: 'Các gói dịch vụ có những gì?', a: 'MC Hub có 4 gói: Gói Ngày (10 AI sessions/24h, tất cả chủ đề), Basic (20 sessions/tháng, thư viện kịch bản), Full (sessions không giới hạn, phân tích nâng cao WER/CER/Jitter/HNR, biểu đồ tiến độ), Annual (toàn bộ Full + huy hiệu Elite, hỗ trợ 24/7, truy cập Beta). Xem giá chi tiết tại trang Thanh toán.' },
    { q: 'Thanh toán bằng cách nào?', a: 'Thanh toán qua cổng PayOS tích hợp trực tiếp trên trang. Gói được kích hoạt tự động ngay sau khi xác nhận giao dịch thành công.' },
    { q: 'Tôi có thể hủy gói không?', a: 'Các gói không tự động gia hạn. Gói Ngày hết sau 24h, gói tháng/năm hết sau chu kỳ đã chọn. Khi hết hạn tài khoản về Free — bạn có thể mua lại bất kỳ lúc nào.' },
    { q: 'Chính sách hoàn tiền như thế nào?', a: 'Hoàn tiền trong 7 ngày nếu gặp lỗi kỹ thuật nghiêm trọng từ phía chúng tôi. Liên hệ support qua email để được hỗ trợ.' },
  ],
  account: [
    { q: 'Làm thế nào để đổi mật khẩu?', a: 'Vào Cài đặt → Bảo mật → Đổi mật khẩu. Nhập mật khẩu hiện tại và mật khẩu mới, xác nhận và lưu.' },
    { q: 'Tôi quên mật khẩu, phải làm gì?', a: 'Tại trang đăng nhập, nhấn "Quên mật khẩu", nhập email đăng ký. Hệ thống gửi mã OTP 6 chữ số về email trong vòng vài phút. Nhập mã, đặt mật khẩu mới là xong. Mã có hiệu lực trong 10 phút.' },
    { q: 'Làm thế nào để xóa tài khoản?', a: 'Vào Cài đặt → Tài khoản → Xóa tài khoản. Lưu ý: toàn bộ dữ liệu luyện tập sẽ bị xóa vĩnh viễn và không thể khôi phục.' },
    { q: 'Dữ liệu giọng nói của tôi có được bảo mật không?', a: 'Có. Bản ghi âm chỉ dùng để phân tích trong session hiện tại và không lưu trữ vĩnh viễn. Xem Chính sách bảo mật để biết thêm chi tiết.' },
  ],
};

const allFaqs = Object.values(faqs).flat();

const quickLinks = [
  { icon: PlayCircle, label: 'Hướng dẫn luyện tập', desc: 'Video 3 phút', link: '/training' },
  { icon: FileText, label: 'Điều khoản dịch vụ', desc: 'Quyền & nghĩa vụ', link: '/terms' },
  { icon: Shield, label: 'Chính sách bảo mật', desc: 'Xử lý dữ liệu', link: '/privacy' },
  { icon: MessageSquare, label: 'Liên hệ hỗ trợ', desc: 'Email trong 24h', link: '/contact' },
];

const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const currentFaqs = (() => {
    let pool = activeCategory === 'all' ? allFaqs : (faqs[activeCategory] || []);
    if (query.trim()) {
      const q = query.toLowerCase();
      pool = pool.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
    }
    return pool;
  })();

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(245,166,35,0.035)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'rgba(245,166,35,0.2)' }} />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[11px] font-medium text-[#f5a623] mb-5 uppercase tracking-wider">
            <LifeBuoy size={11} /> Trung tâm trợ giúp
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
            Chúng tôi có thể <span className="text-[#f5a623]">giúp gì?</span>
          </h1>
          <p className="text-zinc-500 text-[14px] max-w-lg mx-auto leading-relaxed mb-8">
            Tìm câu trả lời nhanh hoặc duyệt theo chủ đề. Đội ngũ hỗ trợ luôn sẵn sàng nếu bạn cần thêm.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative mt-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search size={15} className="text-zinc-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
              className="w-full bg-[#0f0f11] border border-white/[0.09] rounded-md py-4 pl-[44px] pr-10 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-[#f5a623]/40 focus:bg-[#111113] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.07)] transition-all"
            />
            {query ? (
              <button onClick={() => setQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-zinc-600 hover:text-zinc-300 transition-colors text-sm">
                ✕
              </button>
            ) : (
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="text-[11px] text-zinc-700 border border-white/[0.06] rounded px-1.5 py-0.5">⌘K</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <main className="flex-1 pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Category cards */}
          {!query && (
            <motion.div {...fadeUp} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {categories.filter(c => c.value !== 'all').map(({ icon: Icon, label, value, title, desc, count }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(activeCategory === value ? 'all' : value)}
                  className={`p-4 text-left rounded-md border transition-all ${
                    activeCategory === value
                      ? 'border-[#f5a623]/30 bg-[#f5a623]/[0.05]'
                      : 'border-white/[0.07] bg-[#111113] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 transition-colors ${
                    activeCategory === value ? 'bg-[#f5a623]/[0.15] text-[#f5a623]' : 'bg-[#f5a623]/[0.08] border border-[#f5a623]/15 text-[#f5a623]'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-[12px] font-semibold text-white mb-0.5">{title}</p>
                  <p className="text-[11px] text-zinc-600 leading-snug">{desc}</p>
                  <p className="text-[11px] text-zinc-700 mt-2">{count} bài viết</p>
                </button>
              ))}
            </motion.div>
          )}

          {/* FAQ section */}
          <div>
            <motion.div {...fadeUp} className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[18px] font-semibold text-white">
                  {query
                    ? `Kết quả cho "${query}"`
                    : activeCategory === 'all'
                    ? 'Câu hỏi thường gặp'
                    : categories.find(c => c.value === activeCategory)?.title}
                </h2>
                <p className="text-[12px] text-zinc-600 mt-0.5">{currentFaqs.length} câu hỏi</p>
              </div>
              {activeCategory !== 'all' && !query && (
                <button onClick={() => setActiveCategory('all')}
                  className="text-[12px] text-zinc-500 hover:text-[#f5a623] transition-colors">
                  Xem tất cả →
                </button>
              )}
            </motion.div>

            {currentFaqs.length > 0 ? (
              <div className="space-y-2">
                {currentFaqs.map((faq, i) => (
                  <FaqItem key={i} {...faq} index={i} />
                ))}
              </div>
            ) : (
              <motion.div {...fadeUp} className="text-center py-16 text-zinc-600">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-[14px]">Không tìm thấy kết quả cho "{query}"</p>
                <p className="text-[12px] mt-1">Thử từ khóa khác hoặc <Link to="/contact" className="text-[#f5a623] hover:underline">liên hệ hỗ trợ</Link></p>
              </motion.div>
            )}
          </div>

          {/* Quick links + still need help */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div {...fadeUp} className="p-6 bg-[#111113] border border-white/[0.07] rounded-md space-y-3">
              <p className="text-[13px] font-semibold text-white mb-4">Tài nguyên hữu ích</p>
              {quickLinks.map(({ icon: Icon, label, desc, link }) => (
                <Link key={label} to={link}
                  className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#f5a623]/[0.08] flex items-center justify-center">
                      <Icon size={14} className="text-[#f5a623]" />
                    </div>
                    <div>
                      <p className="text-[13px] text-zinc-300 group-hover:text-white transition-colors">{label}</p>
                      <p className="text-[11px] text-zinc-600">{desc}</p>
                    </div>
                  </div>
                  <span className="text-zinc-600 group-hover:text-[#f5a623] transition-colors text-sm">→</span>
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 bg-[#111113] border border-white/[0.07] rounded-md relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-8 right-8 h-px"
                style={{ background: 'rgba(245,166,35,0.25)' }} />
              <div>
                <div className="w-10 h-10 rounded-md bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center mb-4">
                  <LifeBuoy size={18} className="text-[#f5a623]" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">Vẫn cần trợ giúp?</h3>
                <p className="text-[13px] text-zinc-400 leading-relaxed mb-6">
                  Không tìm được câu trả lời? Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp mọi thắc mắc của bạn.
                </p>
                <div className="space-y-2.5">
                  {[
                    { dot: 'bg-emerald-400', label: 'Email hỗ trợ', time: '24–48 giờ làm việc' },
                    { dot: 'bg-[#f5a623]', label: 'Hỗ trợ kỹ thuật', time: '2–4 giờ (8:00–22:00)' },
                  ].map(({ dot, label, time }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        <span className="text-[12px] text-zinc-400">{label}</span>
                      </div>
                      <span className="text-[11px] text-zinc-600">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/contact"
                className="mt-6 w-full py-2.5 bg-[#f5a623] text-black rounded-md text-[13px] font-semibold hover:bg-[#e09520] transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={14} /> Liên hệ hỗ trợ
              </Link>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-10 h-10 bg-[#111113] border border-white/[0.1] rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.2] transition-all z-50 shadow-lg"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default HelpCenter;
