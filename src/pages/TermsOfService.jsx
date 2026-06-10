import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FileText, CheckCircle2, AlertCircle, Users, Shield, CreditCard,
  Ban, Scale, Mail, RefreshCw, Globe, ChevronRight, ArrowUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SECTIONS = [
  { id: 'acceptance',    icon: CheckCircle2, title: '1. Chấp nhận Điều khoản' },
  { id: 'services',      icon: Globe,        title: '2. Mô tả Dịch vụ' },
  { id: 'accounts',      icon: Users,        title: '3. Tài khoản Người dùng' },
  { id: 'content',       icon: FileText,     title: '4. Nội dung & Bản quyền' },
  { id: 'payment',       icon: CreditCard,   title: '5. Thanh toán & Premium' },
  { id: 'prohibited',    icon: Ban,          title: '6. Hành vi bị cấm' },
  { id: 'privacy',       icon: Shield,       title: '7. Quyền riêng tư' },
  { id: 'disclaimer',    icon: AlertCircle,  title: '8. Miễn trừ trách nhiệm' },
  { id: 'termination',   icon: RefreshCw,    title: '9. Chấm dứt dịch vụ' },
  { id: 'governing',     icon: Scale,        title: '10. Luật điều chỉnh' },
  { id: 'changes',       icon: RefreshCw,    title: '11. Thay đổi Điều khoản' },
  { id: 'contact',       icon: Mail,         title: '12. Liên hệ' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const SectionBlock = ({ id, icon: Icon, title, children }) => (
  <motion.div id={id} {...fadeUp} className="scroll-mt-24">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#f5a623]" />
      </div>
      <h2 className="text-[17px] font-semibold text-white">{title}</h2>
    </div>
    <div className="text-[14px] text-zinc-400 leading-[1.8] space-y-3 pl-12">
      {children}
    </div>
  </motion.div>
);

const Ul = ({ items }) => (
  <ul className="space-y-2 mt-1">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]/50 mt-[7px] shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const TermsOfService = () => {
  const [activeId, setActiveId] = useState('acceptance');
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handler = () => {
      setShowBackTop(window.scrollY > 400);
      const ids = SECTIONS.map(s => s.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(ids[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,166,35,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5a623]/20 to-transparent" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[11px] font-medium text-[#f5a623] mb-5 uppercase tracking-wider">
            <FileText size={11} /> Pháp lý
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
            Điều khoản <span className="text-[#f5a623]">Dịch vụ</span>
          </h1>
          <p className="text-zinc-500 text-[14px] max-w-lg mx-auto leading-relaxed">
            Vui lòng đọc kỹ các điều khoản này trước khi sử dụng nền tảng MC Hub. Bằng cách truy cập dịch vụ, bạn đồng ý bị ràng buộc bởi các điều khoản sau.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-[12px] text-zinc-600">
            <span>Có hiệu lực: <span className="text-zinc-400">16 tháng 5, 2026</span></span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Phiên bản: <span className="text-zinc-400">1.0</span></span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Ngôn ngữ: <span className="text-zinc-400">Tiếng Việt</span></span>
          </div>
        </motion.div>
      </div>

      <main className="flex-1 pb-24 px-6">
        <div className="max-w-6xl mx-auto flex gap-10 items-start">

          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-4 overflow-hidden">
              <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider px-2 mb-3">Mục lục</p>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ id, icon: Icon, title }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12px] transition-all ${
                      activeId === id
                        ? 'bg-[#f5a623]/[0.08] text-[#f5a623] font-medium'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={13} className={activeId === id ? 'text-[#f5a623]' : 'text-zinc-600'} />
                    <span className="leading-snug">{title}</span>
                    {activeId === id && <ChevronRight size={11} className="ml-auto shrink-0 text-[#f5a623]" />}
                  </button>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-white/[0.06] px-2">
                <Link to="/privacy" className="text-[11px] text-zinc-600 hover:text-[#f5a623] transition-colors flex items-center gap-1.5">
                  <Shield size={11} /> Chính sách bảo mật →
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Summary box */}
            <motion.div {...fadeUp} className="p-5 rounded-2xl bg-[#f5a623]/[0.05] border border-[#f5a623]/15">
              <p className="text-[13px] font-semibold text-[#f5a623] mb-2">Tóm tắt nhanh</p>
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                MC Hub là nền tảng luyện giọng MC chuyên nghiệp. Khi sử dụng dịch vụ, bạn đồng ý không sao chép nội dung, bảo mật tài khoản, và tuân thủ các điều khoản thanh toán. Dữ liệu giọng nói của bạn chỉ dùng để phân tích AI và cải thiện trải nghiệm cá nhân.
              </p>
            </motion.div>

            <SectionBlock id="acceptance" icon={CheckCircle2} title="1. Chấp nhận Điều khoản">
              <p>Bằng cách truy cập hoặc sử dụng nền tảng MC Hub (bao gồm website, ứng dụng và tất cả dịch vụ liên quan), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này.</p>
              <p>Nếu bạn sử dụng dịch vụ thay mặt cho một tổ chức, bạn đại diện và đảm bảo rằng bạn có thẩm quyền để ràng buộc tổ chức đó với các điều khoản này.</p>
              <Ul items={[
                'Bạn phải từ 16 tuổi trở lên để sử dụng dịch vụ.',
                'Người dùng dưới 18 tuổi cần có sự đồng ý của phụ huynh hoặc người giám hộ.',
                'Việc tiếp tục sử dụng sau khi Điều khoản được cập nhật đồng nghĩa với việc chấp nhận phiên bản mới.',
              ]} />
            </SectionBlock>

            <SectionBlock id="services" icon={Globe} title="2. Mô tả Dịch vụ">
              <p>MC Hub cung cấp nền tảng luyện giọng nói và phát triển kỹ năng MC chuyên nghiệp, bao gồm:</p>
              <Ul items={[
                'Thư viện kịch bản MC đa dạng theo chủ đề (đám cưới, gala, doanh nghiệp, talkshow, lễ khai mạc)',
                'Công cụ luyện tập giọng nói với phân tích AI thời gian thực',
                'Đánh giá các chỉ số: độ rõ ràng, nhịp điệu, tốc độ đọc (WPM)',
                'Báo cáo phản hồi song ngữ (Tiếng Việt và Tiếng Anh)',
                'Teleprompter và công cụ hỗ trợ đọc script',
                'Theo dõi tiến trình luyện tập theo thời gian',
                'Hệ thống Premium với phân tích AI chuyên sâu không giới hạn',
              ]} />
              <p>Chúng tôi bảo lưu quyền sửa đổi, tạm ngưng hoặc ngừng bất kỳ phần nào của dịch vụ mà không cần thông báo trước, trừ trường hợp được quy định khác.</p>
            </SectionBlock>

            <SectionBlock id="accounts" icon={Users} title="3. Tài khoản Người dùng">
              <p>Để sử dụng đầy đủ các tính năng, bạn cần tạo tài khoản với thông tin chính xác và đầy đủ. Bạn hoàn toàn chịu trách nhiệm về:</p>
              <Ul items={[
                'Bảo mật mật khẩu và thông tin đăng nhập của bạn.',
                'Tất cả hoạt động diễn ra dưới tài khoản của bạn.',
                'Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.',
                'Đảm bảo thông tin tài khoản luôn chính xác và cập nhật.',
              ]} />
              <p>Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc bạn không bảo mật thông tin tài khoản. Mỗi người dùng chỉ được phép có một tài khoản; việc tạo nhiều tài khoản để lách giới hạn Premium là vi phạm điều khoản.</p>
            </SectionBlock>

            <SectionBlock id="content" icon={FileText} title="4. Nội dung & Bản quyền">
              <p>Tất cả nội dung trên MC Hub — bao gồm kịch bản, tài liệu luyện tập, âm thanh mẫu, giao diện, logo và thương hiệu — là tài sản của MC Hub hoặc các đối tác có giấy phép.</p>
              <Ul items={[
                'Bạn được cấp quyền sử dụng cá nhân, không độc quyền, không thể chuyển nhượng để sử dụng nội dung cho mục đích luyện tập.',
                'Nghiêm cấm sao chép, phân phối, bán lại hoặc tạo sản phẩm phái sinh từ nội dung nền tảng.',
                'Các bản ghi âm luyện tập của bạn thuộc sở hữu của bạn; chúng tôi chỉ sử dụng để phân tích và cải thiện dịch vụ.',
                'Bạn không được tải lên nội dung vi phạm bản quyền, gây hiểu lầm hoặc có hại.',
                'Trích dẫn ngắn cho mục đích phi thương mại được chấp nhận với điều kiện ghi rõ nguồn.',
              ]} />
            </SectionBlock>

            <SectionBlock id="payment" icon={CreditCard} title="5. Thanh toán & Premium">
              <p>MC Hub cung cấp gói Premium với đầy đủ tính năng AI phân tích. Các điều khoản thanh toán:</p>
              <Ul items={[
                'Giá hiện tại: 20.000đ (khuyến mãi ra mắt, giá gốc 100.000đ) — thanh toán một lần, không tự động gia hạn.',
                'Thanh toán qua chuyển khoản ngân hàng MBBank với mã xác nhận duy nhất.',
                'Premium được kích hoạt tự động sau khi hệ thống xác nhận giao dịch (thông thường trong vòng vài phút).',
                'Không hoàn tiền sau khi Premium đã được kích hoạt và bạn đã sử dụng tính năng AI phân tích.',
                'Trong trường hợp lỗi kỹ thuật khiến Premium không được kích hoạt dù đã thanh toán, vui lòng liên hệ hỗ trợ trong vòng 48 giờ.',
                'Giá có thể thay đổi; người dùng Premium hiện tại không bị ảnh hưởng bởi thay đổi giá.',
              ]} />
            </SectionBlock>

            <SectionBlock id="prohibited" icon={Ban} title="6. Hành vi bị cấm">
              <p>Khi sử dụng MC Hub, bạn đồng ý không thực hiện các hành vi sau:</p>
              <Ul items={[
                'Truy cập trái phép hoặc cố gắng xâm nhập hệ thống, máy chủ, hoặc mạng của chúng tôi.',
                'Sử dụng bot, script tự động hoặc công cụ scraping để thu thập dữ liệu.',
                'Đăng tải hoặc truyền phát nội dung khiêu dâm, thù hận, bạo lực hoặc vi phạm pháp luật.',
                'Mạo danh người dùng khác, nhân viên MC Hub hoặc tổ chức bất kỳ.',
                'Sử dụng dịch vụ cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.',
                'Tạo nhiều tài khoản để lách giới hạn tính năng miễn phí.',
                'Phá vỡ, vô hiệu hóa hoặc cản trở tính năng bảo mật của nền tảng.',
                'Chia sẻ thông tin đăng nhập tài khoản với người khác.',
              ]} />
              <p>Vi phạm các điều khoản này có thể dẫn đến đình chỉ hoặc chấm dứt tài khoản ngay lập tức mà không cần thông báo trước.</p>
            </SectionBlock>

            <SectionBlock id="privacy" icon={Shield} title="7. Quyền riêng tư">
              <p>Việc sử dụng dịch vụ của bạn cũng chịu sự điều chỉnh của <Link to="/privacy" className="text-[#f5a623] hover:underline">Chính sách Bảo mật</Link> của chúng tôi, được tích hợp bởi tham chiếu vào các Điều khoản này.</p>
              <Ul items={[
                'Dữ liệu giọng nói được xử lý tạm thời để phân tích AI và không được lưu trữ vĩnh viễn trên máy chủ của chúng tôi.',
                'Chúng tôi không bán dữ liệu cá nhân của bạn cho bên thứ ba.',
                'Bạn có quyền yêu cầu xóa tài khoản và tất cả dữ liệu liên quan bất kỳ lúc nào.',
              ]} />
            </SectionBlock>

            <SectionBlock id="disclaimer" icon={AlertCircle} title="8. Miễn trừ trách nhiệm">
              <p>Dịch vụ được cung cấp trên cơ sở "nguyên trạng" và "sẵn có". MC Hub không đưa ra bảo đảm rõ ràng hoặc ngụ ý về:</p>
              <Ul items={[
                'Tính liên tục, không bị gián đoạn hoặc không có lỗi của dịch vụ.',
                'Kết quả cụ thể từ việc sử dụng dịch vụ luyện tập giọng nói.',
                'Tính chính xác tuyệt đối của các đánh giá AI (chỉ mang tính tham khảo hỗ trợ).',
                'Khả năng tương thích với tất cả thiết bị và trình duyệt.',
              ]} />
              <p>Trong phạm vi tối đa được pháp luật cho phép, MC Hub không chịu trách nhiệm về các thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả phát sinh từ việc sử dụng dịch vụ.</p>
            </SectionBlock>

            <SectionBlock id="termination" icon={RefreshCw} title="9. Chấm dứt dịch vụ">
              <p>Cả hai bên đều có quyền chấm dứt mối quan hệ dịch vụ:</p>
              <Ul items={[
                'Bạn có thể xóa tài khoản bất kỳ lúc nào qua trang Cài đặt hoặc bằng cách liên hệ với chúng tôi.',
                'Chúng tôi có thể đình chỉ hoặc chấm dứt tài khoản vi phạm Điều khoản mà không cần thông báo trước.',
                'Khi chấm dứt, quyền truy cập dịch vụ của bạn sẽ ngay lập tức bị thu hồi.',
                'Các điều khoản về bản quyền, miễn trừ trách nhiệm và luật điều chỉnh vẫn có hiệu lực sau khi chấm dứt.',
                'Dữ liệu tài khoản sẽ được xóa trong vòng 30 ngày kể từ ngày chấm dứt.',
              ]} />
            </SectionBlock>

            <SectionBlock id="governing" icon={Scale} title="10. Luật điều chỉnh">
              <p>Các Điều khoản Dịch vụ này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>
              <Ul items={[
                'Mọi tranh chấp phát sinh từ hoặc liên quan đến các Điều khoản này sẽ được giải quyết tại Tòa án có thẩm quyền tại Hà Nội, Việt Nam.',
                'Trước khi khởi kiện, các bên đồng ý thử giải quyết tranh chấp bằng thương lượng trong vòng 30 ngày.',
                'Nếu bất kỳ điều khoản nào bị tòa án tuyên vô hiệu, các điều khoản còn lại vẫn có hiệu lực đầy đủ.',
              ]} />
            </SectionBlock>

            <SectionBlock id="changes" icon={RefreshCw} title="11. Thay đổi Điều khoản">
              <p>Chúng tôi bảo lưu quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Khi có thay đổi quan trọng:</p>
              <Ul items={[
                'Chúng tôi sẽ thông báo qua email đăng ký hoặc thông báo nổi bật trên nền tảng.',
                'Ngày "Có hiệu lực" ở đầu trang sẽ được cập nhật.',
                'Việc tiếp tục sử dụng dịch vụ sau 7 ngày kể từ thông báo thay đổi đồng nghĩa với việc chấp nhận.',
                'Nếu bạn không đồng ý với thay đổi, bạn có quyền xóa tài khoản trước ngày có hiệu lực.',
              ]} />
            </SectionBlock>

            <SectionBlock id="contact" icon={Mail} title="12. Liên hệ">
              <p>Nếu bạn có câu hỏi về các Điều khoản Dịch vụ này, vui lòng liên hệ với chúng tôi:</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Email hỗ trợ', value: 'themchubforwork@gmail.com', icon: Mail },
                  { label: 'Nền tảng', value: 'MC Hub Voice Training', icon: Globe },
                  { label: 'Phản hồi', value: 'Trong vòng 24–48 giờ làm việc', icon: RefreshCw },
                  { label: 'Ngôn ngữ hỗ trợ', value: 'Tiếng Việt & English', icon: CheckCircle2 },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3 p-4 bg-[#111113] border border-white/[0.07] rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-600 mb-0.5">{label}</p>
                      <p className="text-[13px] text-zinc-300 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* Footer note */}
            <motion.div {...fadeUp} className="flex items-center justify-between p-5 rounded-2xl bg-[#111113] border border-white/[0.07]">
              <div>
                <p className="text-[13px] font-medium text-white mb-0.5">Chính sách Bảo mật</p>
                <p className="text-[12px] text-zinc-600">Tìm hiểu cách chúng tôi xử lý dữ liệu của bạn</p>
              </div>
              <Link to="/privacy"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.14] text-[13px] text-zinc-300 hover:text-white transition-all">
                Xem ngay <ChevronRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Back to top */}
      {showBackTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-[#f5a623] text-black flex items-center justify-center shadow-lg z-50 hover:bg-[#e09520] transition-colors"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}

      <Footer />
    </div>
  );
};

export default TermsOfService;
