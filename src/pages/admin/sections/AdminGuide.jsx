import React, { useState, useMemo } from 'react';
import {
  Search, BookOpen, Users, CreditCard, LayoutGrid, Award, Trophy,
  Terminal, Megaphone, Package, Bell, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, Info, Zap, Filter, Tag,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = ['Tất cả', 'Người dùng', 'Nội dung', 'Tài chính', 'Marketing', 'Hệ thống'];

const GUIDES = [

  // ════════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'dashboard-overview',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: 'Đọc KPI tổng quan',
    summary: 'Nắm nhanh 4 chỉ số chính: doanh thu, giao dịch, người dùng.',
    steps: [
      { type: 'info', text: 'Truy cập Admin → Dashboard (trang mặc định khi vào).' },
      { type: 'step', text: '4 thẻ KPI hàng trên: Tổng người dùng · Giao dịch thành công · Tổng giao dịch · Doanh thu thực tế.' },
      { type: 'step', text: 'Thẻ "Giao dịch thành công" hiển thị thêm: số đang Chờ và số Lỗi bên dưới.' },
      { type: 'step', text: 'Thẻ "Doanh thu thực tế" chỉ đếm giao dịch COMPLETED — không tính PENDING/FAILED.' },
      { type: 'step', text: 'Dữ liệu live từ MongoDB — nhấn F5 để cập nhật mới nhất.' },
      { type: 'warn', text: 'Nếu các thẻ hiện 0 hết, kiểm tra backend đang chạy (Admin → Server Logs).' },
    ],
  },
  {
    id: 'dashboard-revenue-chart',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: 'Đọc biểu đồ doanh thu theo tháng',
    summary: 'Phân tích xu hướng doanh thu qua biểu đồ vùng.',
    steps: [
      { type: 'step', text: 'Biểu đồ vùng "Doanh thu theo tháng" nằm giữa Dashboard.' },
      { type: 'step', text: 'Trục X = tháng (T1–T12) · Trục Y = doanh thu (đơn vị: VND).' },
      { type: 'step', text: 'Hover lên điểm dữ liệu → tooltip hiện số tiền chính xác.' },
      { type: 'step', text: 'Tháng không có giao dịch COMPLETED sẽ hiện 0 — bình thường.' },
      { type: 'info', text: 'Biểu đồ chỉ hiện năm hiện tại. Dữ liệu năm trước không có ở đây.' },
    ],
  },
  {
    id: 'dashboard-user-donut',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: 'Đọc phân bổ người dùng theo role',
    summary: 'Xem tỉ lệ MC / Client trong hệ thống.',
    steps: [
      { type: 'step', text: 'Biểu đồ donut "Phân bổ người dùng" hiện tỉ lệ MC (xanh) / Client (xanh lá).' },
      { type: 'step', text: 'ADMIN không tính vào biểu đồ này.' },
      { type: 'step', text: 'Hover lên slice → tooltip hiện số lượng và % tương ứng.' },
      { type: 'info', text: 'Nếu chỉ thấy 1 màu, toàn bộ user hiện tại là cùng role.' },
    ],
  },
  {
    id: 'dashboard-plan-bar',
    section: 'Dashboard',
    sectionIcon: LayoutGrid,
    sectionColor: 'text-blue-400',
    category: 'Hệ thống',
    title: 'Đọc doanh thu theo gói đăng ký',
    summary: 'So sánh đóng góp của BASIC / FULL / ANNUAL.',
    steps: [
      { type: 'step', text: 'Biểu đồ cột phía dưới Dashboard hiện doanh thu từng gói.' },
      { type: 'step', text: 'Click vào cột để lọc nhanh sang tab Giao dịch (nếu có liên kết).' },
      { type: 'step', text: 'Gói FREE không đóng góp doanh thu — cột luôn = 0.' },
      { type: 'info', text: 'Dùng chart này để quyết định gói nào cần khuyến mãi tăng chuyển đổi.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // NGƯỜI DÙNG
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'user-view',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Xem danh sách & tìm kiếm user',
    summary: 'Tìm user theo tên/email, lọc theo role.',
    steps: [
      { type: 'step', text: 'Vào Admin → Người dùng.' },
      { type: 'step', text: 'Dùng ô Search (góc trên) để tìm theo tên hoặc email (không phân biệt hoa/thường).' },
      { type: 'step', text: 'Dùng bộ lọc Role chip (ALL / MC / CLIENT / ADMIN) để thu hẹp danh sách.' },
      { type: 'step', text: 'Bảng hiển thị: Avatar · Tên · Email · Role · Trạng thái (Active/Suspended) · Verified.' },
      { type: 'step', text: 'Click vào một hàng để mở Side Panel bên phải với 3 tab: Info · Stats · Notify.' },
      { type: 'info', text: 'Nếu danh sách trống sau khi lọc, thử xoá bộ lọc và tìm lại.' },
    ],
  },
  {
    id: 'user-detail-info',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Xem thông tin chi tiết 1 user',
    summary: 'Đọc hồ sơ đầy đủ: avatar, gói, trạng thái, plan.',
    steps: [
      { type: 'step', text: 'Click user trong bảng → Side Panel mở bên phải.' },
      { type: 'step', text: 'Tab Info hiện: Tên, Email, Role, Plan hiện tại, Ngày tạo, Trạng thái khoá/mở.' },
      { type: 'step', text: 'Badge màu xanh lá = MC đã Verified · Màu vàng = chưa Verify.' },
      { type: 'step', text: 'Badge đỏ = Suspended · Màu xanh = Active.' },
      { type: 'info', text: 'Plan hiện tại cho biết user đang dùng gói Free/Basic/Full/Annual.' },
    ],
  },
  {
    id: 'user-detail-stats',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Xem thống kê luyện tập của user',
    summary: 'Kiểm tra mức độ hoạt động, điểm, streak của user.',
    steps: [
      { type: 'step', text: 'Click user → Side Panel → tab Stats.' },
      { type: 'step', text: 'Chỉ số: Tổng buổi luyện · Điểm trung bình · Streak liên tiếp · Bài hoàn thành.' },
      { type: 'step', text: 'Dùng để xác định user inactive (0 buổi trong 30 ngày) → cần re-engagement.' },
      { type: 'info', text: 'User mới chưa luyện tập sẽ hiện tất cả = 0 — bình thường.' },
    ],
  },
  {
    id: 'user-add',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Thêm user mới thủ công',
    summary: 'Tạo tài khoản cho thành viên nội bộ hoặc test.',
    steps: [
      { type: 'step', text: 'Vào Admin → Người dùng → nhấn nút "Thêm" (góc trên phải).' },
      { type: 'step', text: 'Điền: Tên hiển thị, Email (duy nhất trong hệ thống), Mật khẩu (≥6 ký tự).' },
      { type: 'step', text: 'Chọn Role: ADMIN / MC / CLIENT.' },
      { type: 'step', text: 'Nhấn "Tạo" — user xuất hiện ngay trong bảng.' },
      { type: 'warn', text: 'Email đã tồn tại sẽ báo lỗi — kiểm tra trùng trước khi tạo.' },
      { type: 'warn', text: 'Không cấp ADMIN cho người ngoài team — toàn quyền hệ thống.' },
      { type: 'info', text: 'User được tạo thủ công mặc định dùng gói FREE.' },
    ],
  },
  {
    id: 'user-verify-mc',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Duyệt / Huỷ duyệt MC',
    summary: 'Xác minh hoặc thu hồi badge MC chuyên nghiệp.',
    steps: [
      { type: 'step', text: 'Tìm user có role MC trong bảng (lọc Role = MC).' },
      { type: 'step', text: 'Click hàng → Side Panel → tab Info.' },
      { type: 'step', text: 'Nhấn "Verify MC" để xác minh → badge xanh xuất hiện trên profile.' },
      { type: 'step', text: 'Nhấn "Unverify" để thu hồi badge nếu MC vi phạm quy tắc.' },
      { type: 'info', text: 'Badge Verified hiển thị cho người dùng khác khi xem profile MC.' },
      { type: 'warn', text: 'Chỉ duyệt MC sau khi đã xác thực thông tin thật của họ.' },
    ],
  },
  {
    id: 'user-suspend',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Khoá / Mở khoá tài khoản',
    summary: 'Tạm dừng quyền đăng nhập của user vi phạm.',
    steps: [
      { type: 'step', text: 'Click user → Side Panel → tab Info.' },
      { type: 'step', text: 'Nhấn "Suspend" để khoá — user mất quyền đăng nhập ngay lập tức.' },
      { type: 'step', text: 'Nhấn "Unlock" để mở khoá — user đăng nhập bình thường trở lại.' },
      { type: 'warn', text: 'Khoá tài khoản không xoá dữ liệu của user.' },
      { type: 'warn', text: 'Nếu user đang online khi bị khoá, token hiện tại vô hiệu ngay — họ bị đăng xuất.' },
      { type: 'info', text: 'Dùng tính năng này cho vi phạm nội quy, spam, hoặc tài khoản nghi ngờ.' },
    ],
  },
  {
    id: 'user-password',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Đặt lại mật khẩu user',
    summary: 'Admin set mật khẩu mới khi user quên hoặc cần reset.',
    steps: [
      { type: 'step', text: 'Click user → Side Panel → tab Info.' },
      { type: 'step', text: 'Nhấn "Đổi mật khẩu" → nhập mật khẩu mới (≥6 ký tự).' },
      { type: 'step', text: 'Nhấn "Cập nhật" — mật khẩu đổi ngay lập tức.' },
      { type: 'warn', text: 'Mật khẩu không thể xem lại sau khi lưu — dùng mật khẩu tạm rồi yêu cầu user đổi.' },
      { type: 'step', text: 'Thông báo mật khẩu tạm cho user qua email hoặc Zalo.' },
      { type: 'info', text: 'Không cần biết mật khẩu cũ để thực hiện thao tác này.' },
    ],
  },
  {
    id: 'user-notify-single',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Gửi email cá nhân cho 1 user',
    summary: 'Gửi email trực tiếp đến một tài khoản cụ thể.',
    steps: [
      { type: 'step', text: 'Click user → Side Panel → tab Notify.' },
      { type: 'step', text: 'Hệ thống gợi ý nội dung thông minh theo trạng thái user (inactive / high score / streak..) — click gợi ý để điền sẵn.' },
      { type: 'step', text: 'Chỉnh Subject và Content theo ý muốn.' },
      { type: 'step', text: 'Dùng {{name}} trong nội dung — hệ thống tự thay bằng tên user.' },
      { type: 'step', text: 'Nhấn "Gửi" — email đến inbox user trong vài giây.' },
      { type: 'warn', text: 'Không gửi email không liên quan đến dịch vụ — có thể bị báo spam.' },
      { type: 'info', text: 'Email gửi qua Brevo SMTP từ địa chỉ themchubtraining@gmail.com.' },
    ],
  },
  {
    id: 'user-delete',
    section: 'Người dùng',
    sectionIcon: Users,
    sectionColor: 'text-emerald-400',
    category: 'Người dùng',
    title: 'Xoá tài khoản user',
    summary: 'Xoá vĩnh viễn user khỏi hệ thống.',
    steps: [
      { type: 'step', text: 'Click user → Side Panel → tab Info → tìm nút "Xoá tài khoản" (đỏ, cuối panel).' },
      { type: 'step', text: 'Hệ thống yêu cầu xác nhận — nhập email user để xác nhận.' },
      { type: 'step', text: 'Nhấn "Xác nhận xoá".' },
      { type: 'warn', text: 'KHÔNG THỂ HOÀN TÁC. Toàn bộ dữ liệu, lịch sử luyện tập, giao dịch của user bị xoá.' },
      { type: 'warn', text: 'Chỉ xoá khi user yêu cầu xoá tài khoản theo GDPR hoặc tài khoản giả mạo xác nhận.' },
      { type: 'info', text: 'Cân nhắc Suspend thay vì xoá nếu chỉ muốn ngăn user truy cập tạm thời.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // BÀI HỌC
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'lesson-view',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: 'Xem & tìm kiếm bài luyện tập',
    summary: 'Tra cứu toàn bộ kịch bản MC trong hệ thống.',
    steps: [
      { type: 'step', text: 'Vào Admin → Bài học.' },
      { type: 'step', text: 'Bảng hiển thị: Tiêu đề · Danh mục · Độ khó · Số lượt luyện tập · Điểm TB.' },
      { type: 'step', text: 'Dùng Search (tên bài) và Filter danh mục để thu hẹp.' },
      { type: 'step', text: 'Sort theo tên, ngày tạo, hoặc số lượt dùng.' },
      { type: 'info', text: 'Bài có nhiều lượt dùng nhất là bài phổ biến — giữ chất lượng kịch bản này.' },
    ],
  },
  {
    id: 'lesson-add',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: 'Thêm bài luyện tập mới',
    summary: 'Tạo kịch bản MC mới để học viên thực hành đọc giọng.',
    steps: [
      { type: 'step', text: 'Vào Admin → Bài học → nhấn "Add Practice Script".' },
      { type: 'step', text: 'Điền Tiêu đề (ngắn gọn, mô tả sự kiện).' },
      { type: 'step', text: 'Chọn Danh mục: Wedding MC / Corporate Event / Talkshow MC / General.' },
      { type: 'step', text: 'Nhập nội dung Script vào textarea — viết như script MC thật (dùng [Tên MC], [Tên khách]).' },
      { type: 'step', text: 'Chọn Độ khó: Easy (người mới) / Medium / Hard (chuyên nghiệp).' },
      { type: 'step', text: 'Thêm Mô tả ngắn giúp học viên biết bài này luyện kỹ năng gì.' },
      { type: 'step', text: 'Upload ảnh bìa (JPG/PNG, tối đa 2MB) hoặc để trống.' },
      { type: 'step', text: 'Nhấn Save — bài xuất hiện ngay trong Voice Library.' },
      { type: 'warn', text: 'Script quá ngắn (<50 chữ) AI khó phân tích — nên viết ≥150 chữ.' },
      { type: 'info', text: 'Tiêu chí đánh giá (EvaluationCriteria) gắn với danh mục — không cần cấu hình thêm.' },
    ],
  },
  {
    id: 'lesson-edit',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: 'Sửa nội dung bài luyện tập',
    summary: 'Cập nhật script, độ khó, danh mục đã tạo.',
    steps: [
      { type: 'step', text: 'Vào Admin → Bài học → tìm bài cần sửa.' },
      { type: 'step', text: 'Nhấn icon bút chì ở cuối hàng → form sửa mở ra.' },
      { type: 'step', text: 'Chỉnh các trường cần thiết.' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'warn', text: 'Sửa script của bài đang được dùng trong Academy Milestone sẽ ảnh hưởng trải nghiệm học viên đang học — nên thêm bài mới thay vì sửa.' },
    ],
  },
  {
    id: 'lesson-delete',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: 'Xoá bài luyện tập',
    summary: 'Gỡ bài không còn phù hợp khỏi hệ thống.',
    steps: [
      { type: 'step', text: 'Tìm bài cần xoá → nhấn icon thùng rác.' },
      { type: 'step', text: 'Hệ thống cảnh báo nếu bài đang được gán trong Academy Milestone.' },
      { type: 'step', text: 'Xác nhận → bài bị xoá khỏi Voice Library và danh sách admin.' },
      { type: 'warn', text: 'Học viên đã luyện bài này vẫn giữ lịch sử điểm — chỉ không thể luyện lại.' },
      { type: 'info', text: 'Nên gỡ bài khỏi Academy Milestone trước khi xoá để tránh lỗi hiển thị.' },
    ],
  },
  {
    id: 'lesson-reading-guide',
    section: 'Bài học',
    sectionIcon: BookOpen,
    sectionColor: 'text-amber-400',
    category: 'Nội dung',
    title: 'Quản lý Reading Guide (tài liệu đọc)',
    summary: 'Xem và thêm tài liệu lý thuyết cho học viên.',
    steps: [
      { type: 'step', text: 'Vào Admin → Bài học → tab Reading Guides (nếu có).' },
      { type: 'step', text: 'Reading Guide là tài liệu lý thuyết: kỹ thuật nói, điều phối sự kiện, phong cách MC...' },
      { type: 'step', text: 'Thêm guide: điền Tiêu đề, Nội dung (Markdown hỗ trợ), Danh mục, Thời đọc ước tính.' },
      { type: 'step', text: 'Gán guide vào Academy Milestone qua module Academy → Assign Content → READING_GUIDE.' },
      { type: 'info', text: 'Reading Guide không yêu cầu mic — học viên đọc và tự học lý thuyết.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ACADEMY
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'academy-overview',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Hiểu cấu trúc Academy',
    summary: 'Nắm logic khóa học: Course → Milestone → Content Item.',
    steps: [
      { type: 'info', text: 'Academy gồm 3 cấp: Course (khóa học) → Milestone/Stage (giai đoạn) → Content Item (bài cụ thể).' },
      { type: 'step', text: 'Ví dụ: Course "MC Đám Cưới" → Milestone "Level Associate" → Item "Kịch bản lễ cưới truyền thống".' },
      { type: 'step', text: 'Học viên phải hoàn thành tất cả item trong milestone để unlock milestone tiếp theo.' },
      { type: 'info', text: '3 Level chuẩn: Associate (cơ bản) · Professional (trung cấp) · Elite (chuyên nghiệp).' },
    ],
  },
  {
    id: 'academy-course-create',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Tạo Course mới',
    summary: 'Khởi tạo khóa học tổng thể chứa các milestone.',
    steps: [
      { type: 'step', text: 'Vào Admin → Academy → nhấn "New Course".' },
      { type: 'step', text: 'Điền: Tên khóa học, Mô tả, Danh mục (Wedding/Corporate/Talkshow...).' },
      { type: 'step', text: 'Upload ảnh bìa khóa học.' },
      { type: 'step', text: 'Nhấn Save — khóa học tạo ra chưa có milestone, chưa visible với học viên.' },
      { type: 'step', text: 'Thêm milestone vào khóa học (xem hướng dẫn "Tạo Milestone").' },
      { type: 'info', text: 'Course chỉ hiển thị cho học viên khi có ít nhất 1 milestone đã active.' },
    ],
  },
  {
    id: 'academy-milestone',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Tạo Milestone (giai đoạn học)',
    summary: 'Thêm giai đoạn mới vào lộ trình học.',
    steps: [
      { type: 'step', text: 'Vào Admin → Academy → expand course muốn thêm → nhấn "New Milestone Stage".' },
      { type: 'step', text: 'Điền: Tiêu đề giai đoạn, Level (Associate / Professional / Elite).' },
      { type: 'step', text: 'Điền Mô tả — học viên thấy khi hover vào milestone trên lộ trình.' },
      { type: 'step', text: 'Đặt Order number để sắp xếp thứ tự (1 = đầu tiên).' },
      { type: 'step', text: 'Nhấn Save — milestone xuất hiện như accordion có thể expand để gán nội dung.' },
      { type: 'warn', text: 'Thứ tự milestone ảnh hưởng đến lộ trình học — đặt đúng từ đầu.' },
    ],
  },
  {
    id: 'academy-content',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Gán nội dung vào Milestone',
    summary: 'Thêm bài học hoặc tài liệu đọc vào một giai đoạn.',
    steps: [
      { type: 'step', text: 'Expand milestone cần thêm nội dung → nhấn "Assign Content".' },
      { type: 'step', text: 'Chọn loại: VOICE_PRACTICE (kịch bản luyện giọng) hoặc READING_GUIDE (tài liệu lý thuyết).' },
      { type: 'step', text: 'Search và chọn bài từ danh sách dropdown.' },
      { type: 'step', text: 'Đặt Tiêu đề hiển thị trong milestone (khác với tên gốc của bài — tùy chọn).' },
      { type: 'step', text: 'Chọn Thời lượng ước tính: 5m / 10m / 15m / 30m / 45m / 1h.' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'step', text: 'Dùng nút ▲▼ bên phải mỗi item để sắp xếp thứ tự trong milestone.' },
      { type: 'info', text: 'Panel bên phải preview nội dung đã chọn trước khi lưu.' },
    ],
  },
  {
    id: 'academy-content-reorder',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Sắp xếp lại thứ tự nội dung',
    summary: 'Thay đổi trình tự bài học trong milestone.',
    steps: [
      { type: 'step', text: 'Expand milestone cần sắp xếp.' },
      { type: 'step', text: 'Nhấn ▲ để chuyển item lên trên · Nhấn ▼ để chuyển xuống dưới.' },
      { type: 'step', text: 'Thứ tự lưu ngay — không cần nhấn Save thêm.' },
      { type: 'info', text: 'Học viên thấy thứ tự này khi học trong lộ trình.' },
    ],
  },
  {
    id: 'academy-content-remove',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Gỡ bài khỏi Milestone',
    summary: 'Xoá item khỏi milestone (không xoá bài gốc).',
    steps: [
      { type: 'step', text: 'Expand milestone → tìm item cần gỡ → nhấn icon X hoặc Xoá.' },
      { type: 'step', text: 'Xác nhận → item bị gỡ khỏi milestone.' },
      { type: 'info', text: 'Bài học gốc vẫn còn trong Voice Library — chỉ link giữa milestone và bài bị xoá.' },
      { type: 'warn', text: 'Học viên đang học milestone này sẽ thấy bài bị gỡ biến mất — thông báo trước nếu cần.' },
    ],
  },
  {
    id: 'academy-quiz',
    section: 'Academy',
    sectionIcon: Award,
    sectionColor: 'text-purple-400',
    category: 'Nội dung',
    title: 'Quản lý câu hỏi Quiz',
    summary: 'Thêm/sửa câu hỏi trắc nghiệm trong Course.',
    steps: [
      { type: 'step', text: 'Vào Admin → Academy → expand course → tab Quiz Questions.' },
      { type: 'step', text: 'Nhấn "Add Question" → điền câu hỏi, 4 đáp án, đáp án đúng, độ khó.' },
      { type: 'step', text: 'Chọn loại: MULTIPLE_CHOICE (1 đáp án) hoặc TRUE_FALSE.' },
      { type: 'step', text: 'Điền giải thích (explanation) để học viên hiểu đáp án đúng.' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'info', text: 'Quiz hiện ở cuối course — học viên làm sau khi hoàn thành toàn bộ milestone.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THI ĐẤU
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'competition-overview',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: 'Hiểu cấu trúc hệ thống thi đấu',
    summary: 'Nắm logic Arena → Submission → Leaderboard.',
    steps: [
      { type: 'info', text: 'Hệ thống thi đấu gồm: Arena (cuộc thi) → Submission (bài dự thi) → Leaderboard (bảng xếp hạng).' },
      { type: 'info', text: 'Mỗi Arena có 1 kịch bản thách thức, chu kỳ reset (Daily/Weekly), và thời gian hoạt động.' },
      { type: 'step', text: 'Học viên ghi âm bài và submit → AI chấm điểm → vào leaderboard.' },
      { type: 'info', text: 'Leaderboard reset theo Interval: DAILY = reset 0h mỗi ngày · WEEKLY = reset 0h thứ Hai.' },
    ],
  },
  {
    id: 'competition-create',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: 'Tạo Arena thi đấu mới',
    summary: 'Mở cuộc thi luyện giọng theo kịch bản cụ thể.',
    steps: [
      { type: 'step', text: 'Vào Admin → Thi đấu → nhấn "New Contest Arena".' },
      { type: 'step', text: 'Điền: Tiêu đề Arena, Mô tả ngắn.' },
      { type: 'step', text: 'Chọn Challenge Script: kịch bản từ danh sách bài học (voice practice).' },
      { type: 'step', text: 'Chọn Contest Interval: DAILY (reset mỗi ngày) hoặc WEEKLY (reset mỗi tuần).' },
      { type: 'step', text: 'Đặt Start Date và End Date.' },
      { type: 'step', text: 'Bật toggle Active để kích hoạt — Arena xuất hiện ngay cho học viên.' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'warn', text: 'Khuyến nghị chỉ chạy 1 Arena ACTIVE cùng lúc để tập trung người thi.' },
      { type: 'warn', text: 'Kịch bản quá dài (>500 từ) làm khó người mới — chọn Medium/Easy cho Arena.' },
    ],
  },
  {
    id: 'competition-edit',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: 'Sửa / Tắt Arena',
    summary: 'Cập nhật thời gian, deactivate cuộc thi sớm.',
    steps: [
      { type: 'step', text: 'Vào Admin → Thi đấu → tìm Arena cần sửa.' },
      { type: 'step', text: 'Nhấn Edit → chỉnh ngày kết thúc, mô tả, hoặc tắt Active toggle.' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'warn', text: 'Đổi kịch bản Challenge của Arena đang active sẽ ảnh hưởng bài nộp đang chờ chấm — tránh đổi mid-contest.' },
      { type: 'info', text: 'Tắt Active không xoá bảng xếp hạng — kết quả vẫn lưu.' },
    ],
  },
  {
    id: 'competition-leaderboard',
    section: 'Thi đấu',
    sectionIcon: Trophy,
    sectionColor: 'text-rose-400',
    category: 'Nội dung',
    title: 'Xem bảng xếp hạng & submissions',
    summary: 'Kiểm tra ai đang dẫn đầu, quản lý bài dự thi.',
    steps: [
      { type: 'step', text: 'Click vào Arena → tab Leaderboard.' },
      { type: 'step', text: 'Bảng xếp hạng hiển thị: Hạng · Tên · Avatar · Điểm · Ngày nộp.' },
      { type: 'step', text: 'Click vào 1 submission để nghe lại bản ghi âm và xem điểm chi tiết từng tiêu chí.' },
      { type: 'step', text: 'Nếu phát hiện submission gian lận (dùng voice AI) → nhấn "Disqualify".' },
      { type: 'info', text: 'Điểm chấm bởi AI — nếu nghi ngờ sai, xem chi tiết phân tích rồi quyết định.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // GÓI & GIẢM GIÁ
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'plan-overview',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: 'Hiểu cấu trúc gói đăng ký',
    summary: 'Nắm 4 gói và giới hạn tính năng của mỗi gói.',
    steps: [
      { type: 'info', text: '4 gói: FREE (miễn phí) · BASIC · FULL · ANNUAL.' },
      { type: 'info', text: 'FREE: luyện tập cơ bản, giới hạn số AI session/tháng.' },
      { type: 'info', text: 'BASIC/FULL/ANNUAL: tăng dần giới hạn AI session, mở tính năng nâng cao.' },
      { type: 'step', text: 'Vào Admin → Gói & Giảm giá để xem và chỉnh cấu hình từng gói.' },
    ],
  },
  {
    id: 'plan-edit',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: 'Cập nhật thông tin gói đăng ký',
    summary: 'Thay đổi giá, mô tả, giới hạn tính năng.',
    steps: [
      { type: 'step', text: 'Vào Admin → Gói & Giảm giá → tab Gói đăng ký.' },
      { type: 'step', text: 'Expand gói cần sửa (FREE / BASIC / FULL / ANNUAL).' },
      { type: 'step', text: 'Sửa: Tên hiển thị, Giá (VND), Thời hạn (ngày), Giới hạn AI session/tháng.' },
      { type: 'step', text: 'Cập nhật Tagline và danh sách Tính năng nổi bật (mỗi dòng 1 tính năng).' },
      { type: 'step', text: 'Bật/tắt Active toggle để ẩn/hiện gói với người dùng.' },
      { type: 'step', text: 'Nhấn "Lưu thay đổi".' },
      { type: 'warn', text: 'Thay đổi giá KHÔNG ảnh hưởng user đã đang dùng gói đó — chỉ user đăng ký mới.' },
      { type: 'warn', text: 'Không tắt Active của gói đang có nhiều user — họ không renew được.' },
    ],
  },
  {
    id: 'plan-discount',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: 'Cài giảm giá trực tiếp cho gói',
    summary: 'Áp dụng % hoặc số tiền giảm ngay trên bảng giá.',
    steps: [
      { type: 'step', text: 'Expand gói cần giảm giá → tìm mục Discount.' },
      { type: 'step', text: 'Chọn kiểu: Percent (%) hoặc Fixed (số tiền cố định).' },
      { type: 'step', text: 'Nhập giá trị → hệ thống tự hiển thị giá sau giảm để xác nhận.' },
      { type: 'step', text: 'Nhấn "Lưu thay đổi".' },
      { type: 'info', text: 'Giảm giá này hiện trực tiếp trên trang Pricing — user thấy giá gốc và giá giảm.' },
      { type: 'warn', text: 'Để xoá giảm giá: nhập 0 vào trường Value rồi lưu.' },
    ],
  },
  {
    id: 'coupon-create',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: 'Tạo mã giảm giá (Coupon)',
    summary: 'Tạo coupon cho chiến dịch khuyến mãi, sự kiện.',
    steps: [
      { type: 'step', text: 'Vào Admin → Gói & Giảm giá → tab Mã giảm giá → nhấn "Tạo mã giảm giá".' },
      { type: 'step', text: 'Nhập Code (ví dụ: SUMMER30, WELCOME50) — viết hoa, không dấu cách.' },
      { type: 'step', text: 'Chọn Type: PERCENT (%) hoặc FIXED (số tiền cố định VND).' },
      { type: 'step', text: 'Nhập Value: ví dụ 30 (= 30%) hoặc 50000 (= 50.000 VND).' },
      { type: 'step', text: 'Đặt Max Uses: số lượt tối đa được dùng (để trống = không giới hạn).' },
      { type: 'step', text: 'Đặt Expiry Date: ngày hết hạn.' },
      { type: 'step', text: 'Chọn Applicable Plans: gói nào được áp mã (có thể chọn nhiều).' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'info', text: 'Mã tự hết hạn khi đến ngày hoặc đạt giới hạn lượt dùng.' },
      { type: 'warn', text: 'Code phân biệt hoa/thường — user nhập "summer30" sẽ không áp dụng được "SUMMER30".' },
    ],
  },
  {
    id: 'coupon-manage',
    section: 'Gói & Giảm giá',
    sectionIcon: Package,
    sectionColor: 'text-cyan-400',
    category: 'Tài chính',
    title: 'Quản lý mã giảm giá đã tạo',
    summary: 'Xem, vô hiệu hoá, hoặc xoá coupon.',
    steps: [
      { type: 'step', text: 'Vào Admin → Gói & Giảm giá → tab Mã giảm giá.' },
      { type: 'step', text: 'Bảng hiển thị: Code · Type · Value · Used/Max · Ngày hết hạn · Trạng thái.' },
      { type: 'step', text: 'Nhấn toggle Active/Inactive để bật/tắt mã mà không xoá.' },
      { type: 'step', text: 'Nhấn icon thùng rác → xác nhận → xoá mã vĩnh viễn.' },
      { type: 'info', text: 'Mã đã được dùng vẫn xoá được — chỉ ảnh hưởng đến lượt dùng mới.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // GIAO DỊCH
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'transaction-view',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: 'Xem & tra cứu giao dịch',
    summary: 'Tìm thanh toán theo trạng thái, user, gói, mã đơn.',
    steps: [
      { type: 'step', text: 'Vào Admin → Giao dịch.' },
      { type: 'step', text: 'Lọc theo Status chip: ALL / COMPLETED / PENDING / FAILED.' },
      { type: 'step', text: 'Search trong ô tìm kiếm: tên user, email, tên gói, memo thanh toán, hoặc mã đơn hàng.' },
      { type: 'step', text: 'Sort: Mới nhất / Cũ nhất / Số tiền cao / Số tiền thấp.' },
      { type: 'step', text: '3 thẻ tổng quan trên cùng: Tổng doanh thu · Giao dịch COMPLETED · PENDING.' },
    ],
  },
  {
    id: 'transaction-detail',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: 'Xem chi tiết 1 giao dịch',
    summary: 'Kiểm tra thông tin đầy đủ: user, gói, PayOS, thời gian.',
    steps: [
      { type: 'step', text: 'Click vào hàng giao dịch trong bảng.' },
      { type: 'step', text: 'Chi tiết hiện: Mã đơn hàng, User, Gói đăng ký, Số tiền, Trạng thái, Thời gian tạo, Thời gian hoàn thành.' },
      { type: 'step', text: 'Nếu có Coupon: hiển thị mã đã dùng và số tiền giảm.' },
      { type: 'info', text: 'Mã đơn hàng PayOS dùng để đối chiếu với cổng thanh toán khi cần xác minh.' },
    ],
  },
  {
    id: 'transaction-pending',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: 'Xử lý giao dịch PENDING',
    summary: 'Khi user báo đã thanh toán nhưng giao dịch vẫn PENDING.',
    steps: [
      { type: 'step', text: 'Lọc Status = PENDING để xem danh sách đang chờ xử lý.' },
      { type: 'step', text: 'Kiểm tra mã đơn PayOS trên cổng PayOS admin (ngoài hệ thống MC Hub).' },
      { type: 'step', text: 'Nếu PayOS đã nhận tiền nhưng webhook chưa gọi → liên hệ dev để trigger webhook thủ công.' },
      { type: 'warn', text: 'Không tự đổi trạng thái thành COMPLETED trong DB nếu chưa xác nhận tiền.' },
      { type: 'info', text: 'PENDING quá 24h thường là webhook bị lỗi — escalate lên dev.' },
    ],
  },
  {
    id: 'transaction-refund',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: 'Xử lý yêu cầu hoàn tiền',
    summary: 'Quy trình khi user yêu cầu refund gói đã thanh toán.',
    steps: [
      { type: 'step', text: 'Xác minh giao dịch COMPLETED tương ứng trong Giao dịch.' },
      { type: 'step', text: 'Vào cổng PayOS để thực hiện hoàn tiền từ phía payment gateway.' },
      { type: 'step', text: 'Sau khi hoàn tiền thành công trên PayOS, cập nhật ghi chú trong Admin (nếu có trường memo).' },
      { type: 'step', text: 'Vào Người dùng → downgrade user về gói FREE hoặc gói phù hợp.' },
      { type: 'warn', text: 'MC Hub không tự hoàn tiền — phải thao tác trực tiếp trên cổng PayOS.' },
      { type: 'info', text: 'Ghi lại mọi refund vào spreadsheet tracking nội bộ để đối soát.' },
    ],
  },
  {
    id: 'transaction-export',
    section: 'Giao dịch',
    sectionIcon: CreditCard,
    sectionColor: 'text-green-400',
    category: 'Tài chính',
    title: 'Xuất báo cáo CSV',
    summary: 'Tải file CSV để làm báo cáo tài chính, đối soát.',
    steps: [
      { type: 'step', text: 'Lọc dữ liệu muốn xuất (chọn Status, tìm kiếm theo gói hoặc thời gian).' },
      { type: 'step', text: 'Nhấn nút "Export CSV" góc trên phải.' },
      { type: 'step', text: 'File tải về chứa: Mã đơn · User · Gói · Số tiền · Trạng thái · Ngày tạo · Ngày hoàn thành.' },
      { type: 'info', text: 'CSV xuất toàn bộ kết quả đang lọc — không phân trang.' },
      { type: 'info', text: 'Mở bằng Google Sheets hoặc Excel — dùng UTF-8 encoding để hiển thị đúng tiếng Việt.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // THÔNG BÁO
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'notif-overview',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: 'Hiểu luồng tạo và gửi thông báo',
    summary: 'Nắm 3 bước: Soạn → Draft → Duyệt → Gửi.',
    steps: [
      { type: 'info', text: 'Luồng thông báo: Soạn thảo → Lưu DRAFT → Review → Gửi thật.' },
      { type: 'info', text: 'DRAFT chưa gửi đến ai — chỉ lưu trong hệ thống để review.' },
      { type: 'info', text: 'Sau khi Gửi: không thu hồi được. Luôn preview trước.' },
      { type: 'step', text: 'Tab "Lịch sử" lưu tất cả thông báo đã gửi để tham khảo sau.' },
    ],
  },
  {
    id: 'notif-compose',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: 'Soạn thông báo mới',
    summary: 'Tạo thông báo email và lưu Draft để duyệt.',
    steps: [
      { type: 'step', text: 'Vào Admin → Thông báo → tab "+ Tạo mới".' },
      { type: 'step', text: 'Chọn Loại thông báo: Bài học mới / Khuyến mãi / Bảo trì / Thi đấu / Tính năng mới / Bài đăng xã hội.' },
      { type: 'step', text: 'Điền Tiêu đề nội bộ (chỉ admin thấy, để phân biệt các thông báo).' },
      { type: 'step', text: 'Điền Tiêu đề Email (subject mà user nhận trong inbox).' },
      { type: 'step', text: 'Viết nội dung — dùng {{name}} để hệ thống tự điền tên người nhận.' },
      { type: 'step', text: 'Chọn người nhận: ALL hoặc lọc theo gói (FREE/BASIC/FULL/ANNUAL).' },
      { type: 'step', text: 'Nhấn "Xem trước email" để preview giao diện email trước khi gửi.' },
      { type: 'step', text: 'Nhấn "Tạo thông báo" → lưu trạng thái DRAFT.' },
      { type: 'warn', text: 'Một khi gửi không thể thu hồi — luôn preview và review Draft trước.' },
    ],
  },
  {
    id: 'notif-send',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: 'Duyệt và gửi thông báo',
    summary: 'Chuyển Draft sang trạng thái gửi thật.',
    steps: [
      { type: 'step', text: 'Vào Admin → Thông báo → tab "Chờ duyệt".' },
      { type: 'step', text: 'Xem danh sách thông báo DRAFT đang chờ.' },
      { type: 'step', text: 'Click vào thông báo để đọc lại nội dung và số người nhận ước tính.' },
      { type: 'step', text: 'Nhấn "Gửi" → xác nhận → hệ thống gửi email async (từng email một).' },
      { type: 'info', text: 'Tốc độ gửi: ~1-2 email/giây qua Brevo SMTP — 100 người ≈ 1-2 phút.' },
      { type: 'warn', text: 'Không gửi cùng 1 nội dung 2 lần trong 24h — có thể bị đánh dấu spam.' },
    ],
  },
  {
    id: 'notif-trigger',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: 'Dùng Trigger thông báo tự động',
    summary: 'Tạo Draft nhanh từ template sự kiện hệ thống.',
    steps: [
      { type: 'step', text: 'Vào Admin → Thông báo → tab "Gợi ý tự động".' },
      { type: 'step', text: 'Chọn trigger phù hợp với sự kiện cần thông báo.' },
      { type: 'step', text: 'Điền các biến đặc thù của trigger (VD: lessonTitle, discountPercent, code, date...).' },
      { type: 'step', text: 'Nhấn "Tạo bản nháp" — hệ thống generate nội dung và lưu DRAFT.' },
      { type: 'step', text: 'Sang tab "Chờ duyệt" để review và gửi.' },
      { type: 'info', text: 'Trigger có sẵn: Bài học mới · Khuyến mãi · Bảo trì · Tính năng mới · Thi đấu.' },
    ],
  },
  {
    id: 'notif-history',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: 'Xem lịch sử thông báo đã gửi',
    summary: 'Tra cứu nội dung và thống kê thông báo cũ.',
    steps: [
      { type: 'step', text: 'Vào Admin → Thông báo → tab "Lịch sử".' },
      { type: 'step', text: 'Bảng hiển thị: Tiêu đề · Loại · Người nhận · Ngày gửi · Trạng thái.' },
      { type: 'step', text: 'Click vào hàng để xem lại nội dung đầy đủ đã gửi.' },
      { type: 'info', text: 'Dùng để tham khảo khi soạn thông báo mới, tránh lặp nội dung.' },
    ],
  },
  {
    id: 'notif-delete-draft',
    section: 'Thông báo',
    sectionIcon: Bell,
    sectionColor: 'text-yellow-400',
    category: 'Marketing',
    title: 'Xoá Draft thông báo',
    summary: 'Huỷ thông báo nháp không còn cần thiết.',
    steps: [
      { type: 'step', text: 'Vào tab "Chờ duyệt" → tìm Draft cần xoá.' },
      { type: 'step', text: 'Nhấn icon thùng rác → xác nhận.' },
      { type: 'step', text: 'Draft bị xoá vĩnh viễn — nếu cần gửi lại, tạo mới từ đầu.' },
      { type: 'info', text: 'Thông báo đã gửi (status = SENT) không xoá được từ UI.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MARKETING
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'marketing-social-add',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Thêm bài đăng Social Feed',
    summary: 'Đưa bài Facebook/Instagram lên carousel trang chủ.',
    steps: [
      { type: 'step', text: 'Vào Admin → Marketing → tab Social Feed.' },
      { type: 'step', text: 'Nhấn "Thêm bài đăng".' },
      { type: 'step', text: 'Điền Mô tả bài đăng (text hiển thị dưới ảnh).' },
      { type: 'step', text: 'Nhập Link bài đăng Facebook (bắt buộc) — dạng https://facebook.com/...' },
      { type: 'step', text: 'Upload ảnh thumbnail (JPG/PNG) hoặc nhập URL ảnh trực tiếp.' },
      { type: 'step', text: 'Đặt Số thứ tự ưu tiên — số nhỏ hơn hiển thị trước trong carousel.' },
      { type: 'step', text: 'Bật Active toggle để hiển thị ngay trên trang chủ.' },
      { type: 'step', text: 'Nhấn Preview để xem trước carousel trước khi lưu.' },
      { type: 'step', text: 'Nhấn Save.' },
      { type: 'info', text: 'Trang chủ cập nhật ngay — không cần refresh backend.' },
    ],
  },
  {
    id: 'marketing-social-manage',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Sửa / Ẩn / Xoá bài Social Feed',
    summary: 'Cập nhật hoặc gỡ bài đã đăng.',
    steps: [
      { type: 'step', text: 'Vào Admin → Marketing → tab Social Feed.' },
      { type: 'step', text: 'Tìm bài cần thao tác trong danh sách.' },
      { type: 'step', text: 'Ẩn tạm: tắt toggle Active → bài không hiện trên trang chủ nhưng vẫn lưu.' },
      { type: 'step', text: 'Sửa: nhấn Edit → chỉnh các trường → Save.' },
      { type: 'step', text: 'Xoá: nhấn icon thùng rác → xác nhận → bài bị xoá vĩnh viễn.' },
    ],
  },
  {
    id: 'marketing-template-create',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Tạo Email Template chiến dịch',
    summary: 'Thiết kế mẫu email reusable cho nhiều campaign.',
    steps: [
      { type: 'step', text: 'Vào Admin → Marketing → tab Email Campaigns → tab Templates → nhấn "Tạo template".' },
      { type: 'step', text: 'Chọn chế độ soạn: Design Builder (điền từng ô trực quan) hoặc HTML thô (paste HTML).' },
      { type: 'step', text: 'Design Builder: điền Logo URL, Banner URL, Tiêu đề lớn, Nội dung chính, Nút CTA (text + link).' },
      { type: 'step', text: 'Panel bên phải preview email realtime khi nhập nội dung.' },
      { type: 'step', text: 'Nhấn "Test" → nhập email test → nhấn "Gửi test" để kiểm tra inbox thật.' },
      { type: 'step', text: 'Nhấn "Tạo template" để lưu.' },
      { type: 'info', text: 'Dùng {{tên}} trong HTML để personalize tên người nhận.' },
      { type: 'warn', text: 'Ảnh trong HTML phải là URL public (https://...) — không dùng localhost hay file cục bộ.' },
    ],
  },
  {
    id: 'marketing-template-edit',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Sửa / Xoá Email Template',
    summary: 'Cập nhật nội dung template hoặc dọn dẹp template cũ.',
    steps: [
      { type: 'step', text: 'Vào Admin → Marketing → Email Campaigns → tab Templates.' },
      { type: 'step', text: 'Tìm template cần sửa → nhấn Edit.' },
      { type: 'step', text: 'Chỉnh nội dung → nhấn "Cập nhật".' },
      { type: 'step', text: 'Nhấn icon thùng rác → xác nhận → xoá template.' },
      { type: 'warn', text: 'Không xoá template đang được dùng trong chiến dịch chưa gửi xong.' },
    ],
  },
  {
    id: 'marketing-template-test',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Gửi email test template',
    summary: 'Kiểm tra template trước khi dùng cho campaign thật.',
    steps: [
      { type: 'step', text: 'Mở template cần test (Edit hoặc xem chi tiết).' },
      { type: 'step', text: 'Nhấn nút "Test" → nhập địa chỉ email nhận test.' },
      { type: 'step', text: 'Nhấn "Gửi test" → kiểm tra inbox trong vài giây.' },
      { type: 'step', text: 'Kiểm tra: layout hiển thị đúng, ảnh load được, link CTA hoạt động.' },
      { type: 'warn', text: 'Nếu ảnh không hiển thị trong email test, URL ảnh có thể bị chặn hoặc không public.' },
      { type: 'info', text: 'Gửi test đến nhiều email client khác nhau (Gmail, Outlook) để kiểm tra tương thích.' },
    ],
  },
  {
    id: 'marketing-campaign-send',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Gửi chiến dịch email hàng loạt',
    summary: 'Chọn template → chọn người nhận → gửi campaign.',
    steps: [
      { type: 'step', text: 'Vào Admin → Marketing → Email Campaigns → tab Gửi chiến dịch.' },
      { type: 'step', text: 'Chọn template từ dropdown — panel phải hiện preview template.' },
      { type: 'step', text: 'Chỉnh Subject (tiêu đề email) nếu cần.' },
      { type: 'step', text: 'Chọn Đối tượng: Tất cả / Theo gói / Theo role / Premium / Email tùy chỉnh.' },
      { type: 'step', text: 'Hệ thống tự tải danh sách người nhận — có thể tick/untick từng người.' },
      { type: 'step', text: 'Nhấn "Gửi chiến dịch" → xác nhận số người nhận.' },
      { type: 'step', text: 'Theo dõi tiến độ ở tab Lịch sử (SENDING → COMPLETED).' },
      { type: 'warn', text: 'Tối đa 1 campaign/ngày cho cùng nhóm người dùng — tránh spam.' },
      { type: 'info', text: 'Khi gửi, hệ thống tự deduplicate email trùng — không lo gửi 2 lần cho 1 người.' },
    ],
  },
  {
    id: 'marketing-campaign-custom',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Gửi campaign đến danh sách email tùy chỉnh',
    summary: 'Nhập tay email cụ thể để gửi targeted campaign.',
    steps: [
      { type: 'step', text: 'Vào tab Gửi chiến dịch → chọn template.' },
      { type: 'step', text: 'Chọn Đối tượng: "Email tùy chỉnh".' },
      { type: 'step', text: 'Nhập từng email vào ô → Enter để thêm (hiện dạng chip).' },
      { type: 'step', text: 'Nhấn "Tải danh sách" để xác nhận email có trong hệ thống và xem trước.' },
      { type: 'step', text: 'Tick/untick từng người trong danh sách xác nhận.' },
      { type: 'step', text: 'Nhấn "Gửi chiến dịch".' },
      { type: 'warn', text: 'Email không tồn tại trong hệ thống sẽ bị bỏ qua khi gửi.' },
    ],
  },
  {
    id: 'marketing-campaign-history',
    section: 'Marketing',
    sectionIcon: Megaphone,
    sectionColor: 'text-pink-400',
    category: 'Marketing',
    title: 'Xem lịch sử chiến dịch',
    summary: 'Theo dõi kết quả, trạng thái campaign đã gửi.',
    steps: [
      { type: 'step', text: 'Vào Admin → Marketing → Email Campaigns → tab Lịch sử.' },
      { type: 'step', text: 'Bảng hiển thị: Tên chiến dịch · Template · Số người gửi · Trạng thái · Ngày gửi.' },
      { type: 'step', text: 'Trạng thái: SENDING (đang gửi) · COMPLETED (xong) · FAILED (lỗi).' },
      { type: 'step', text: 'Click vào campaign → xem danh sách email đã gửi và kết quả từng email.' },
      { type: 'info', text: 'Dùng để audit nội dung đã gửi và tránh gửi trùng.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SERVER LOGS
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: 'logs-overview',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: 'Hiểu giao diện Server Logs',
    summary: 'Nắm 3 panel: Live Logs · Watchlist · Bookmarks.',
    steps: [
      { type: 'info', text: 'Trang Server Logs có 3 vùng: Live Logs (trung tâm) · Watchlist (trên phải) · Bookmarks (dưới phải).' },
      { type: 'info', text: 'Live Logs: stream log thời gian thực qua WebSocket từ backend.' },
      { type: 'info', text: 'Watchlist: cấu hình cảnh báo tự động (keyword + threshold).' },
      { type: 'info', text: 'Bookmarks: danh sách log đã đánh dấu để điều tra sau.' },
    ],
  },
  {
    id: 'logs-monitor',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: 'Theo dõi log thời gian thực',
    summary: 'Xem log JAVA/AI backend live, lọc theo mức độ.',
    steps: [
      { type: 'step', text: 'Vào Admin → Server Logs → panel Live Logs.' },
      { type: 'step', text: 'Indicator trên cùng: xanh = Connected · đỏ = Offline (backend chưa chạy).' },
      { type: 'step', text: 'Lọc Level: ALL / DEBUG / INFO / WARN / ERROR.' },
      { type: 'step', text: 'Lọc Source: ALL / JAVA / AI (backend nào đang hiển thị).' },
      { type: 'step', text: 'Search text — kết quả highlight realtime trong log stream.' },
      { type: 'step', text: 'Nhấn Pause để dừng cuộn (log mới vẫn buffer) · Nhấn lại để resume.' },
      { type: 'step', text: 'Nhấn Group để gom các log có lỗi giống nhau thành 1 nhóm.' },
      { type: 'info', text: 'Click 1 dòng log → Detail Panel bên phải: Tab Info · API · User · Note.' },
    ],
  },
  {
    id: 'logs-read-error',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: 'Đọc và hiểu log lỗi ERROR',
    summary: 'Phân tích log ERROR để báo cáo lên dev đúng thông tin.',
    steps: [
      { type: 'step', text: 'Lọc Level = ERROR để chỉ thấy lỗi nghiêm trọng.' },
      { type: 'step', text: 'Click vào dòng lỗi → Detail Panel → tab Info: thời gian, service, message.' },
      { type: 'step', text: 'Tab API: endpoint bị lỗi, HTTP method, response code.' },
      { type: 'step', text: 'Tab User: userId liên quan (nếu có).' },
      { type: 'step', text: 'Bookmark log lỗi → tab Note → ghi lại thời điểm phát hiện và bối cảnh.' },
      { type: 'info', text: 'Khi báo lên dev, cung cấp: Thời gian · Error message · Endpoint · UserId (nếu có).' },
    ],
  },
  {
    id: 'logs-watchlist',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: 'Cài Watchlist cảnh báo tự động',
    summary: 'Nhận cảnh báo trình duyệt khi log khớp keyword hoặc quá nhiều lỗi.',
    steps: [
      { type: 'step', text: 'Vào Admin → Server Logs → panel Watchlist.' },
      { type: 'step', text: 'Đặt Error Threshold: số ERROR/phút để trigger browser notification.' },
      { type: 'step', text: 'Thêm Keywords cần theo dõi: nhập từ khoá → Enter → xuất hiện dạng chip.' },
      { type: 'step', text: 'Log khớp keyword tự highlight đỏ trong Live Logs.' },
      { type: 'step', text: 'Khi vượt threshold: browser notification pop up (cần cho phép notification).' },
      { type: 'info', text: 'Keyword gợi ý theo dõi: "OutOfMemoryError", "SocketTimeout", "NullPointer", "401".' },
    ],
  },
  {
    id: 'logs-bookmark',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: 'Bookmark log & ghi chú điều tra',
    summary: 'Đánh dấu log quan trọng, thêm ghi chú để xem lại.',
    steps: [
      { type: 'step', text: 'Hover lên dòng log muốn đánh dấu → nhấn icon bookmark.' },
      { type: 'step', text: 'Log xuất hiện trong panel Bookmarks (sidebar phải).' },
      { type: 'step', text: 'Detail Panel → tab Note → gõ ghi chú điều tra (không giới hạn độ dài).' },
      { type: 'step', text: 'Click bookmark trong danh sách → quay về Logs với log đó được highlight.' },
      { type: 'step', text: 'Nhấn icon X trên bookmark để xoá khi không cần theo dõi nữa.' },
      { type: 'info', text: 'Bookmark lưu trong browser localStorage — xoá cache thì mất.' },
    ],
  },
  {
    id: 'logs-backend-down',
    section: 'Server Logs',
    sectionIcon: Terminal,
    sectionColor: 'text-zinc-400',
    category: 'Hệ thống',
    title: 'Xử lý khi backend Offline',
    summary: 'Kiểm tra và escalate khi indicator chuyển đỏ.',
    steps: [
      { type: 'step', text: 'Nếu indicator đỏ "Offline", backend Java hoặc AI đang không chạy.' },
      { type: 'step', text: 'Kiểm tra health bằng cách truy cập: http://localhost:5000/actuator/health (nếu còn truy cập server).' },
      { type: 'step', text: 'Nếu không tự restart được, liên hệ ngay dev hoặc DevOps.' },
      { type: 'step', text: 'Ghi lại thời điểm phát hiện offline vào log nội bộ.' },
      { type: 'warn', text: 'Khi backend offline: toàn bộ tính năng AI, luyện tập, đăng nhập đều ngừng.' },
      { type: 'info', text: 'Chờ 2-3 phút trước khi báo — có thể backend đang restart tự động.' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STEP_ICON = {
  step: { icon: CheckCircle2, color: 'text-emerald-400' },
  warn: { icon: AlertTriangle, color: 'text-amber-400' },
  info: { icon: Info, color: 'text-blue-400' },
  tip:  { icon: Zap, color: 'text-purple-400' },
};

function StepIcon({ type }) {
  const { icon: Icon, color } = STEP_ICON[type] || STEP_ICON.step;
  return <Icon size={13} className={`${color} shrink-0 mt-0.5`} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminGuide() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeSection, setActiveSection] = useState('Tất cả');
  const [expanded, setExpanded] = useState(null);
  const [sort, setSort] = useState('section');

  const sections = useMemo(() => {
    return ['Tất cả', ...new Set(GUIDES.map(g => g.section))];
  }, []);

  const filtered = useMemo(() => {
    let result = GUIDES;
    if (activeCategory !== 'Tất cả') result = result.filter(g => g.category === activeCategory);
    if (activeSection !== 'Tất cả') result = result.filter(g => g.section === activeSection);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.section.toLowerCase().includes(q) ||
        g.steps.some(s => s.text.toLowerCase().includes(q))
      );
    }
    if (sort === 'alpha') return [...result].sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    if (sort === 'category') return [...result].sort((a, b) => a.category.localeCompare(b.category, 'vi'));
    return [...result].sort((a, b) => a.section.localeCompare(b.section, 'vi'));
  }, [search, activeCategory, activeSection, sort]);

  const grouped = useMemo(() => {
    if (sort !== 'section') return null;
    const map = {};
    filtered.forEach(g => {
      if (!map[g.section]) map[g.section] = [];
      map[g.section].push(g);
    });
    return map;
  }, [filtered, sort]);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const chipCls = (active) =>
    `px-3 py-1 text-[11px] font-semibold border cursor-pointer transition-colors shrink-0 ${
      active
        ? 'bg-gold/20 border-gold text-gold'
        : 'bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted] hover:border-[--text-muted] hover:text-[--text-secondary]'
    }`;

  const renderCard = (guide) => {
    const isOpen = expanded === guide.id;
    const SectionIcon = guide.sectionIcon;
    return (
      <div key={guide.id} className="bg-[--bg-surface] border border-[--border-subtle] overflow-hidden">
        <button
          onClick={() => toggle(guide.id)}
          className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-[--bg-elevated] transition-colors"
        >
          <div className={`mt-0.5 shrink-0 ${guide.sectionColor}`}>
            <SectionIcon size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-[--text-primary]">{guide.title}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 border bg-[--bg-elevated] border-[--border-subtle] text-[--text-muted]">
                {guide.category}
              </span>
            </div>
            <p className="text-[12px] text-[--text-muted] mt-0.5">{guide.summary}</p>
          </div>
          <span className="text-[--text-muted] shrink-0 mt-0.5">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>

        {isOpen && (
          <div className="border-t border-[--border-subtle] px-5 py-4 space-y-2.5 bg-[--bg-elevated]">
            <p className="text-[10px] text-[--text-muted] uppercase tracking-wider font-semibold mb-3">
              Các bước thực hiện
            </p>
            {guide.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <StepIcon type={s.type} />
                <div className="flex-1">
                  {s.type === 'step' && (
                    <span className="text-[10px] font-bold text-[--text-muted] mr-1.5">
                      {guide.steps.filter((x, j) => x.type === 'step' && j <= i).length}.
                    </span>
                  )}
                  <span className={`text-[12px] leading-relaxed ${
                    s.type === 'warn' ? 'text-amber-300' :
                    s.type === 'info' ? 'text-blue-300' :
                    'text-[--text-secondary]'
                  }`}>
                    {s.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-bold text-[--text-primary] tracking-tight">Hướng dẫn Admin</h2>
        <p className="text-[12px] text-[--text-muted] mt-1">
          {GUIDES.length} quy trình · {sections.length - 1} module · Tĩnh — không cần kết nối DB
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
          <input
            type="text"
            placeholder="Tìm quy trình, từ khoá..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[--bg-surface] border border-[--border-subtle] pl-9 pr-4 py-2 text-[12px] text-[--text-primary] placeholder:text-zinc-600 outline-none focus:border-[--text-muted]"
          />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Filter size={12} className="text-[--text-muted] ml-2" />
          <span className="text-[11px] text-[--text-muted]">Sắp xếp:</span>
          {[['section', 'Theo module'], ['alpha', 'A–Z'], ['category', 'Danh mục']].map(([val, label]) => (
            <button key={val} onClick={() => setSort(val)} className={chipCls(sort === val)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <p className="text-[10px] text-[--text-muted] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
          <Tag size={10} /> Danh mục công việc
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={chipCls(activeCategory === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Section filter */}
      <div>
        <p className="text-[10px] text-[--text-muted] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
          <LayoutGrid size={10} /> Module
        </p>
        <div className="flex flex-wrap gap-2">
          {sections.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className={chipCls(activeSection === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 py-2 border-t border-b border-[--border-subtle]">
        <span className="text-[12px] text-[--text-muted]">
          Hiển thị <span className="font-semibold text-[--text-primary]">{filtered.length}</span> / {GUIDES.length} quy trình
        </span>
        {(search || activeCategory !== 'Tất cả' || activeSection !== 'Tất cả') && (
          <button
            onClick={() => { setSearch(''); setActiveCategory('Tất cả'); setActiveSection('Tất cả'); }}
            className="text-[11px] text-gold hover:text-amber-400 transition-colors"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[--text-muted] text-[13px]">Không tìm thấy quy trình phù hợp.</div>
      ) : grouped ? (
        Object.entries(grouped).map(([section, guides]) => {
          const SectionIcon = guides[0].sectionIcon;
          const color = guides[0].sectionColor;
          return (
            <div key={section} className="space-y-2">
              <div className="flex items-center gap-2 py-1">
                <SectionIcon size={14} className={color} />
                <span className="text-[12px] font-bold text-[--text-secondary] uppercase tracking-wider">{section}</span>
                <span className="text-[10px] text-[--text-muted] bg-[--bg-elevated] border border-[--border-subtle] px-1.5 py-0.5">{guides.length} quy trình</span>
              </div>
              <div className="space-y-1.5">
                {guides.map(renderCard)}
              </div>
            </div>
          );
        })
      ) : (
        <div className="space-y-1.5">
          {filtered.map(renderCard)}
        </div>
      )}
    </div>
  );
}
