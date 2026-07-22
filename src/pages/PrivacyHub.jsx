import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Database, Eye, Lock, Share2, UserCheck, Trash2,
  Cookie, Globe, Mail, RefreshCw, ChevronRight, ArrowUp, FileText, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';

const SECTIONS = [
  { id: 'overview',      icon: Shield,    title: '1. Tổng quan' },
  { id: 'collect',       icon: Database,  title: '2. Dữ liệu chúng tôi thu thập' },
  { id: 'voice',         icon: Eye,       title: '3. Dữ liệu giọng nói & AI' },
  { id: 'use',           icon: UserCheck, title: '4. Mục đích sử dụng dữ liệu' },
  { id: 'share',         icon: Share2,    title: '5. Chia sẻ dữ liệu' },
  { id: 'security',      icon: Lock,      title: '6. Bảo mật dữ liệu' },
  { id: 'retention',     icon: Database,  title: '7. Thời gian lưu trữ' },
  { id: 'cookies',       icon: Cookie,    title: '8. Cookies & Tracking' },
  { id: 'rights',        icon: UserCheck, title: '9. Quyền của bạn' },
  { id: 'children',      icon: Shield,    title: '10. Trẻ em & Vị thành niên' },
  { id: 'international', icon: Globe,     title: '11. Chuyển dữ liệu quốc tế' },
  { id: 'changes',       icon: RefreshCw, title: '12. Thay đổi Chính sách' },
  { id: 'contact',       icon: Mail,      title: '13. Liên hệ DPO' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } };

const SectionBlock = ({ id, icon: Icon, title, children }) => (
  <motion.div id={id} {...fadeUp} className="scroll-mt-24">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-md bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center shrink-0">
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

const DataTable = ({ rows }) => (
  <div className="mt-3 rounded-md overflow-hidden border border-white/[0.07]">
    {rows.map(([cat, data, purpose], i) => (
      <div key={i} className={`grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-4 p-3.5 text-[12px] ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'} ${i > 0 ? 'border-t border-white/[0.05]' : ''}`}>
        <span className="text-zinc-300 font-medium">{cat}</span>
        <span className="text-zinc-500">{data}</span>
        <span className="text-zinc-500">{purpose}</span>
      </div>
    ))}
  </div>
);

const PrivacyHub = () => {
  const [activeId, setActiveId] = useState('overview');
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handler = () => {
      setShowBackTop(window.scrollY > 400);
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveId(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(245,166,35,0.035)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-[#f5a623]/20" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[11px] font-medium text-[#f5a623] mb-5 uppercase tracking-wider">
            <Shield size={11} /> Pháp lý
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
            Chính sách <span className="text-[#f5a623]">Bảo mật</span>
          </h1>
          <p className="text-zinc-500 text-[14px] max-w-lg mx-auto leading-relaxed">
            MC Hub cam kết bảo vệ quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-[12px] text-zinc-500">
            <span>Cập nhật: <span className="text-zinc-400">16 tháng 5, 2026</span></span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>GDPR: <span className="text-zinc-400">Tuân thủ</span></span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Luật PDPD VN: <span className="text-zinc-400">Tuân thủ</span></span>
          </div>
        </motion.div>
      </div>

      <main className="flex-1 pb-24 px-6">
        <div className="max-w-6xl mx-auto flex gap-10 items-start">

          {/* Sticky TOC */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            <Card className="bg-[#111113] border border-white/[0.07] rounded-md p-4 gap-0 shadow-none">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-3">Mục lục</p>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ id, icon: Icon, title }) => (
                  <button key={id} onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-[12px] transition-all ${
                      activeId === id ? 'bg-[#f5a623]/[0.08] text-[#f5a623] font-medium' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={13} className={activeId === id ? 'text-[#f5a623]' : 'text-zinc-500'} />
                    <span className="leading-snug">{title}</span>
                    {activeId === id && <ChevronRight size={11} className="ml-auto shrink-0 text-[#f5a623]" />}
                  </button>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-white/[0.06] px-2">
                <Link to="/terms" className="text-[11px] text-zinc-500 hover:text-[#f5a623] transition-colors flex items-center gap-1.5">
                  <FileText size={11} /> Điều khoản dịch vụ →
                </Link>
              </div>
            </Card>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Commitment banner */}
            <motion.div {...fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Lock, label: 'Không bán dữ liệu', desc: 'Dữ liệu của bạn không bao giờ được bán cho bên thứ ba.' },
                { icon: Eye, label: 'Minh bạch hoàn toàn', desc: 'Chúng tôi rõ ràng về những gì chúng tôi thu thập và lý do.' },
                { icon: UserCheck, label: 'Bạn kiểm soát', desc: 'Xóa tài khoản và dữ liệu bất kỳ lúc nào.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="p-4 rounded-md bg-[#111113] border border-white/[0.07] text-center">
                  <div className="w-9 h-9 rounded-md bg-[#f5a623]/[0.08] border border-[#f5a623]/15 flex items-center justify-center mx-auto mb-3">
                    <Icon size={16} className="text-[#f5a623]" />
                  </div>
                  <p className="text-[13px] font-semibold text-white mb-1">{label}</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </motion.div>

            <SectionBlock id="overview" icon={Shield} title="1. Tổng quan">
              <p>MC Hub ("chúng tôi", "của chúng tôi") vận hành nền tảng luyện giọng MC tại Việt Nam. Chính sách Bảo mật này áp dụng cho tất cả dịch vụ của chúng tôi và mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn.</p>
              <p>Bằng cách sử dụng dịch vụ, bạn đồng ý với các thực hành được mô tả trong Chính sách này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.</p>
              <div className="p-4 rounded-md bg-emerald-500/[0.05] border border-emerald-500/15 flex items-start gap-3">
                <Shield size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[13px] text-emerald-300/80">Chúng tôi tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của Việt Nam và các nguyên tắc GDPR của châu Âu.</p>
              </div>
            </SectionBlock>

            <SectionBlock id="collect" icon={Database} title="2. Dữ liệu chúng tôi thu thập">
              <p>Chúng tôi thu thập các loại thông tin sau khi bạn sử dụng dịch vụ:</p>
              <DataTable rows={[
                ['Thông tin tài khoản', 'Tên, email, số điện thoại, mật khẩu (mã hóa)', 'Xác thực & liên lạc'],
                ['Dữ liệu giọng nói', 'File âm thanh trong phiên luyện tập', 'Phân tích AI, không lưu dài hạn'],
                ['Dữ liệu hiệu suất', 'Điểm số, WPM, lịch sử luyện tập', 'Theo dõi tiến trình'],
                ['Thông tin thanh toán', 'Memo giao dịch, trạng thái Premium', 'Xác nhận gói Premium'],
                ['Dữ liệu kỹ thuật', 'IP, trình duyệt, thiết bị, thời gian truy cập', 'Bảo mật & cải thiện UX'],
                ['Cookies', 'Token phiên, tùy chọn ngôn ngữ', 'Duy trì đăng nhập'],
              ]} />
            </SectionBlock>

            <SectionBlock id="voice" icon={Eye} title="3. Dữ liệu giọng nói & AI">
              <p>Chúng tôi hiểu rằng dữ liệu giọng nói là thông tin nhạy cảm. Đây là cách chúng tôi xử lý:</p>
              <Ul items={[
                'File âm thanh được gửi đến AI (Google Speech-to-Text hoặc Whisper) để chuyển đổi thành văn bản và phân tích.',
                'File âm thanh thô KHÔNG được lưu trữ vĩnh viễn, chỉ tồn tại trong bộ nhớ tạm thời trong quá trình xử lý.',
                'Kết quả phân tích (điểm số, phản hồi văn bản) được lưu trữ liên kết với tài khoản của bạn.',
                'Chúng tôi không sử dụng giọng nói của bạn để huấn luyện mô hình AI thương mại mà không có sự đồng ý rõ ràng.',
                'Bạn có thể xóa lịch sử luyện tập bất kỳ lúc nào từ trang Dashboard.',
              ]} />
              <div className="p-4 rounded-md bg-amber-500/[0.05] border border-amber-500/15 flex items-start gap-3">
                <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[13px] text-amber-300/80">API AI của bên thứ ba (Google/OpenAI) có thể giữ lại dữ liệu theo chính sách của họ. Chúng tôi chọn các đối tác cam kết không dùng dữ liệu khách hàng để huấn luyện.</p>
              </div>
            </SectionBlock>

            <SectionBlock id="use" icon={UserCheck} title="4. Mục đích sử dụng dữ liệu">
              <p>Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:</p>
              <Ul items={[
                'Cung cấp, duy trì và cải thiện dịch vụ luyện giọng MC.',
                'Cá nhân hóa trải nghiệm và theo dõi tiến trình học tập của bạn.',
                'Xử lý thanh toán và quản lý trạng thái gói Premium.',
                'Gửi thông báo quan trọng về tài khoản, cập nhật dịch vụ.',
                'Phân tích tổng hợp (không định danh cá nhân) để cải thiện tính năng.',
                'Phát hiện và ngăn chặn gian lận, vi phạm bảo mật.',
                'Tuân thủ nghĩa vụ pháp lý.',
              ]} />
              <p>Chúng tôi KHÔNG sử dụng dữ liệu để: quảng cáo mục tiêu bên thứ ba, bán cho công ty khác, hoặc tạo hồ sơ người dùng cho mục đích không liên quan đến dịch vụ.</p>
            </SectionBlock>

            <SectionBlock id="share" icon={Share2} title="5. Chia sẻ dữ liệu">
              <p>Chúng tôi không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ trong các trường hợp sau:</p>
              <Ul items={[
                'Nhà cung cấp dịch vụ: Cloudinary (lưu trữ media), MongoDB Atlas (database), Google/OpenAI (phân tích AI), tất cả đều ký NDA và chỉ xử lý dữ liệu theo hướng dẫn của chúng tôi.',
                'Yêu cầu pháp lý: Khi được yêu cầu bởi cơ quan pháp luật có thẩm quyền tại Việt Nam.',
                'Bảo vệ quyền lợi: Để ngăn chặn gian lận hoặc bảo vệ an toàn người dùng.',
                'Chuyển nhượng doanh nghiệp: Nếu MC Hub được mua lại, dữ liệu người dùng có thể được chuyển với thông báo trước 30 ngày.',
              ]} />
            </SectionBlock>

            <SectionBlock id="security" icon={Lock} title="6. Bảo mật dữ liệu">
              <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin của bạn:</p>
              <Ul items={[
                'Mã hóa HTTPS/TLS cho tất cả dữ liệu truyền tải.',
                'Mật khẩu được mã hóa một chiều với BCrypt (không thể giải mã).',
                'JWT token có thời gian hết hạn ngắn với refresh token rotation.',
                'MongoDB Atlas với kiểm soát truy cập dựa trên vai trò (RBAC).',
                'Cloudinary với signed URL cho media files nhạy cảm.',
                'Kiểm tra bảo mật định kỳ và cập nhật dependency.',
              ]} />
              <p>Tuy nhiên, không có phương thức truyền tải qua Internet hoặc lưu trữ điện tử nào là an toàn 100%. Chúng tôi cam kết thông báo cho bạn trong vòng 72 giờ nếu xảy ra vi phạm dữ liệu ảnh hưởng đến bạn.</p>
            </SectionBlock>

            <SectionBlock id="retention" icon={Database} title="7. Thời gian lưu trữ">
              <p>Chúng tôi chỉ giữ dữ liệu cá nhân trong thời gian cần thiết:</p>
              <DataTable rows={[
                ['Dữ liệu tài khoản', 'Trong suốt thời gian tài khoản hoạt động', 'Xóa sau 30 ngày khi tài khoản bị xóa'],
                ['File âm thanh', 'Tạm thời trong quá trình xử lý', 'Xóa ngay sau khi phân tích xong'],
                ['Kết quả luyện tập', 'Vô thời hạn (hoặc khi bạn xóa)', 'Bạn có thể xóa bất kỳ lúc nào'],
                ['Log giao dịch', '5 năm', 'Tuân thủ yêu cầu thuế/kế toán VN'],
                ['Log truy cập', '90 ngày', 'Phát hiện bảo mật'],
                ['Backup', '30 ngày vòng quay', 'Phục hồi thảm họa'],
              ]} />
            </SectionBlock>

            <SectionBlock id="cookies" icon={Cookie} title="8. Cookies & Tracking">
              <p>Chúng tôi sử dụng cookies và công nghệ tương tự:</p>
              <Ul items={[
                'Cookie phiên (Session): Duy trì trạng thái đăng nhập, bắt buộc, không thể tắt.',
                'Cookie tùy chọn: Lưu cài đặt ngôn ngữ, giao diện, có thể xóa.',
                'Cookie phân tích: Đo lường hiệu suất trang (nếu áp dụng), có thể từ chối.',
                'Chúng tôi không dùng cookie theo dõi quảng cáo hoặc cookie của mạng xã hội.',
              ]} />
              <p>Bạn có thể kiểm soát cookie qua cài đặt trình duyệt. Xóa cookie phiên sẽ đăng xuất bạn khỏi tài khoản.</p>
            </SectionBlock>

            <SectionBlock id="rights" icon={UserCheck} title="9. Quyền của bạn">
              <p>Theo pháp luật bảo vệ dữ liệu cá nhân, bạn có các quyền sau:</p>
              <Ul items={[
                'Quyền truy cập: Yêu cầu bản sao dữ liệu cá nhân chúng tôi đang lưu trữ về bạn.',
                'Quyền chỉnh sửa: Cập nhật thông tin không chính xác qua trang Cài đặt.',
                'Quyền xóa ("Quyền được lãng quên"): Yêu cầu xóa tài khoản và dữ liệu liên quan.',
                'Quyền hạn chế xử lý: Yêu cầu chúng tôi hạn chế xử lý dữ liệu trong khi tranh chấp.',
                'Quyền phản đối: Phản đối việc xử lý dữ liệu cho mục đích tiếp thị.',
                'Quyền di chuyển dữ liệu: Nhận dữ liệu ở định dạng có thể đọc được (JSON/CSV).',
                'Quyền rút lại đồng ý: Bất kỳ lúc nào, không ảnh hưởng đến tính hợp pháp của xử lý trước đó.',
              ]} />
              <p>Để thực hiện bất kỳ quyền nào, liên hệ: <span className="text-[#f5a623]">themchubforwork@gmail.com</span>. Chúng tôi sẽ phản hồi trong vòng 30 ngày.</p>
            </SectionBlock>

            <SectionBlock id="children" icon={Shield} title="10. Trẻ em & Vị thành niên">
              <p>Dịch vụ MC Hub không hướng đến trẻ em dưới 13 tuổi. Đối với người dùng từ 13-17 tuổi:</p>
              <Ul items={[
                'Cần có sự đồng ý của phụ huynh hoặc người giám hộ hợp pháp.',
                'Phụ huynh có thể liên hệ chúng tôi để xem xét và xóa dữ liệu của trẻ.',
                'Chúng tôi không thu thập thêm thông tin từ người dùng vị thành niên ngoài những gì cần thiết.',
              ]} />
              <p>Nếu chúng tôi phát hiện đã thu thập dữ liệu từ trẻ em dưới 13 tuổi mà không có sự đồng ý, chúng tôi sẽ xóa ngay lập tức.</p>
            </SectionBlock>

            <SectionBlock id="international" icon={Globe} title="11. Chuyển dữ liệu quốc tế">
              <p>Dữ liệu của bạn chủ yếu được lưu trữ tại máy chủ MongoDB Atlas (AWS AP-Southeast-1, Singapore). Khi sử dụng API AI:</p>
              <Ul items={[
                'Dữ liệu giọng nói tạm thời có thể được xử lý tại máy chủ ở Hoa Kỳ (Google/OpenAI).',
                'Các đối tác này tuân thủ EU Standard Contractual Clauses và đảm bảo mức độ bảo vệ tương đương.',
                'Chúng tôi luôn ưu tiên sử dụng nhà cung cấp có trung tâm dữ liệu trong khu vực ASEAN khi có thể.',
              ]} />
            </SectionBlock>

            <SectionBlock id="changes" icon={RefreshCw} title="12. Thay đổi Chính sách">
              <p>Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Khi có thay đổi quan trọng:</p>
              <Ul items={[
                'Thông báo qua email đến địa chỉ đăng ký ít nhất 14 ngày trước.',
                'Banner thông báo nổi bật trên nền tảng.',
                'Ngày "Cập nhật" ở đầu trang sẽ phản ánh phiên bản mới nhất.',
                'Với thay đổi quan trọng về quyền của bạn, chúng tôi sẽ yêu cầu đồng ý lại.',
              ]} />
            </SectionBlock>

            <SectionBlock id="contact" icon={Mail} title="13. Liên hệ DPO">
              <p>Nếu bạn có câu hỏi, lo ngại hoặc muốn thực hiện quyền bảo mật dữ liệu, liên hệ Người phụ trách bảo vệ dữ liệu (DPO):</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Email DPO', value: 'themchubforwork@gmail.com', icon: Mail },
                  { label: 'Thời gian phản hồi', value: 'Trong vòng 30 ngày', icon: RefreshCw },
                  { label: 'Đối tượng áp dụng', value: 'Người dùng tại Việt Nam và quốc tế', icon: Globe },
                  { label: 'Khiếu nại', value: 'Bộ TT&TT Việt Nam (nếu không giải quyết được)', icon: AlertCircle },
                ].map(({ label, value, icon: Icon }) => (
                  <Card key={label} className="flex-row items-start gap-3 p-4 bg-[#111113] border border-white/[0.07] rounded-md shadow-none">
                    <div className="w-8 h-8 rounded-md bg-white/[0.04] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-500 mb-0.5">{label}</p>
                      <p className="text-[13px] text-zinc-300 font-medium">{value}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </SectionBlock>

            {/* Footer note */}
            <motion.div {...fadeUp} className="flex items-center justify-between p-5 rounded-md bg-[#111113] border border-white/[0.07]">
              <div>
                <p className="text-[13px] font-medium text-white mb-0.5">Điều khoản Dịch vụ</p>
                <p className="text-[12px] text-zinc-500">Xem thêm quyền và nghĩa vụ của bạn</p>
              </div>
              <Link to="/terms"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.14] text-[13px] text-zinc-300 hover:text-white transition-all">
                Xem ngay <ChevronRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

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

export default PrivacyHub;
