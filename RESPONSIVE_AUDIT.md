# Responsive/Mobile-Tablet Audit

Audit ngày 2026-07-22, cập nhật lần 3 (đối chiếu với toàn bộ route thật trong `App.jsx`). Phạm vi: **toàn bộ 28 route đã đăng ký** — mọi trang trong `src/pages/**` (kể cả `About`, `ComingSoon`, `Login`, `ForgotPassword`, `VerifyEmail`, `TermsOfService`, `Success`, `PaymentResult` — nhóm trang phụ chưa được audit lần trước) và `src/components/**`, bao gồm `src/pages/admin/**`, `src/pages/AdminDashboard.jsx` (layout gốc admin), `src/layout/MainLayout.jsx` và `Footer.jsx` (wrapper mọi trang `/m/*`). Breakpoint tham chiếu: phone 375px, tablet 768px, desktop 1024px+.

**Đã kiểm tra sạch, không có lỗi:** `Login.jsx`, `ForgotPassword.jsx`, `VerifyEmail.jsx`, `Success.jsx`, `PaymentResult.jsx`, `TermsOfService.jsx`, `ComingSoon.jsx`, `Onboarding.jsx`, `MainLayout.jsx`, `Footer.jsx` — không có grid-cols cố định, fixed-width lớn, hay pattern rủi ro nào.

**Xác nhận: không có tuyên bố "desktop-only" nào trong code hoặc comment ở bất kỳ đâu trong admin.** Audit này có ý nghĩa thực tế — không phải thiết kế có chủ đích.

Trạng thái: **✅ ĐÃ SỬA — tất cả 24 vấn đề (A1-A3, B1-B3, C1-C9, D1-D11) đã fix và build thành công qua 4 đợt (test sau mỗi nhóm).** D10 (SecurityLogs bảng min-width) không cần code change — kỹ thuật đã đúng (`overflow-x-auto`), chỉ là ghi chú UX. Chi tiết cách sửa từng mục xem trong bảng bên dưới.

---

## 🔴 Nghiêm trọng nhất — lỗi cấp layout, ảnh hưởng toàn bộ khu vực

| # | File | Dòng | Loại lỗi | Ảnh hưởng |
|---|------|------|----------|-----------|
| A1 | `src/pages/AdminDashboard.jsx` | 102, 105 | Layout admin gốc: `fixed inset-0 flex` + `<aside className="w-[220px] shrink-0">` — **không hamburger, không drawer, không breakpoint nào**. Bọc *mọi* 12 mục admin (dashboard/users/lessons/transactions/academy/courses/competitions/logs/marketing/plans/notifications/guide/security-logs) | Phone 375px: sidebar chiếm 59% màn hình, content còn ~155px — **không dùng được**. Tablet 768px: chật, không tối ưu. Đây là khung sườn cứng — mọi cải thiện ở section con vẫn bị giới hạn bởi lỗi này |
| A2 | `src/pages/admin/sections/MarketingManager.jsx` | 397, 464 | `flex gap-0 min-h-[600px]` 2 cột cố định không `flex-col md:flex-row`; panel preview email `w-[480px] shrink-0` không `max-w-full` | Phone 375px: panel 480px riêng đã vượt viewport → tràn ngang chắc chắn, form bên trái gần như không hiển thị. Tablet 768px: 480px + form tối thiểu → chỉ còn ~288px cho form |
| A3 | `src/pages/admin/sections/ServerLogs.jsx` | 1018, 579 | Layout 3 cột cố định lồng nhau: sidebar icon `w-[42px]` + main `flex-1` + detail panel `w-[400px]`, không `flex-col`/breakpoint | Phone 375px: riêng panel 400px đã vượt viewport → hoàn toàn không khả dụng. Tablet 768px: 442px cố định chỉ còn ~326px cho log chính |

---

## 🟠 Cao — mất chức năng hoặc rất khó dùng trên mobile

| # | File | Dòng | Loại lỗi | Ưu tiên |
|---|------|------|----------|---------|
| B1 | `src/components/TypewriterMarkdown.jsx` | 35-38 | Table dùng `overflow-hidden` thay vì `overflow-x-auto` → nội dung bị cắt, không cuộn được. Ảnh hưởng báo cáo AI chi tiết trong `VoiceReport.jsx` | Mọi kích thước màn hình có bảng rộng hơn container — không riêng mobile |
| B2 | `src/components/voice/ScriptPanel.jsx` | 180, 182, 187, 199, 207, 209, 481, 483, 512, 514 | 10 nút điều khiển teleprompter (font size/align/màu/tốc độ) chỉ `w-5 h-5`/`w-6 h-6` (20-24px), dưới ngưỡng chạm tối thiểu 44px, đặt sát nhau trong toolbar dày đặc | Phone 375px: cao |
| B3 | `src/components/Navbar.jsx` | 174 | Nút hamburger menu chính (mở menu mobile) `w-8 h-8` (32px) — dưới ngưỡng 44px. Đây là nút điều hướng chính dùng trên **mọi trang** khi ở mobile | Phone/Tablet: ảnh hưởng cao vì tần suất dùng lớn |

---

## 🟡 Trung bình

| # | File | Dòng | Loại lỗi | Ghi chú |
|---|------|------|----------|---------|
| C1 | `src/components/animate-ui/components/radix/sheet.jsx` | 50-51 | Sheet/drawer dùng chung toàn app: `w-[350px]` cố định, không co trên phone nhỏ hơn 375px | iPhone SE 320px, Android budget ~360px sẽ tràn hoặc sát mép |
| C2 | `src/components/reading/NotesSidebar.jsx` | 38 | Sidebar ghi chú `w-[360px]` cố định | Cùng vấn đề C1 |
| C3 | `src/pages/Register.jsx` | 816 | Avatar picker `grid-cols-5` không breakpoint | 375px: mỗi ô ~55-60px, khít, dễ chọn nhầm |
| C4 | `src/pages/admin/sections/DashboardSection.jsx` | 139 | KPI 4 card chính (Tổng users/Giao dịch thành công/Tổng giao dịch/Doanh thu): `grid-cols-4` không breakpoint — **ngoại lệ duy nhất**, các grid khác cùng file (dòng 160, 257, 305, 311, 459, 684, 744, 814) đều đã có breakpoint đúng | Phone 375px: mỗi card ~85px, số liệu/label vỡ dòng/cắt chữ |
| C5 | `src/pages/admin/PlanManager.jsx` | 165, 226, 432, 596, 896 | 5 chỗ `grid-cols-3` không breakpoint — form marketing copy, form giảm giá, form voucher (2 chỗ), stat card voucher | Phone 375px: input/label bị bóp nghiêm trọng ở cả 5 vị trí |
| C6 | `src/pages/admin/sections/MarketingManager.jsx` | 401, 439 | `grid-cols-2` không breakpoint trong panel vốn đã hẹp do lỗi A2 | Phone 375px: form vỡ nặng hơn vì cộng dồn với lỗi panel 480px |
| C7 | `src/pages/admin/sections/NotificationManager.jsx` | 585, 675 | 2 chỗ `grid-cols-3` không breakpoint — panel chọn trigger tự động, 3 stat card | Phone 375px: label vỡ dòng, số liệu chồng nhau |
| C8 | `src/pages/admin/AcademyManager.jsx` | 483 | `grid-cols-3` trong modal chi tiết nội dung (category/duration/...), text đã nhỏ (`[9px]`/`[12px]`) | Phone 375px: mỗi cột ~110px, càng khó đọc hơn |
| C9 | `src/pages/PrivacyHub.jsx` | 58 | `DataTable` component: `grid-cols-3` không breakpoint, mỗi hàng chứa **3 cột text dài** (category/data/purpose — mô tả loại dữ liệu thu thập + mục đích sử dụng), không phải số ngắn như các trường hợp khác | Phone 375px: cao hơn các grid-cols-3 khác — nội dung câu dài trong cột ~110px sẽ vỡ dòng nghiêm trọng, khó đọc |

---

## 🟢 Thấp — vẫn dùng được, nên sửa khi có thời gian

| # | File | Dòng | Loại lỗi |
|---|------|------|----------|
| D1 | `src/components/voice/PracticeHistory.jsx` | 19, 180, 184 | Nút đóng compare (`w-5 h-5`) + phân trang (`w-7 h-7`) dưới 44px |
| D2 | `src/pages/CourseDetail.jsx` | 338, 368 | Nút chọn đáp án quiz + số câu hỏi `w-7 h-7` (28px) |
| D3 | `src/pages/Wallet.jsx` | 98, 163 | Nút mũi tên giao dịch/payout `w-7 h-7`/`w-8 h-8` |
| D4 | `src/pages/Community.jsx` | 120, 134 | Nút prev/next carousel arena `w-8 h-8` (32px) |
| D5 | `src/pages/admin/AcademyManager.jsx` | 218-221, 261-264 | Nút xoá milestone (`p-1.5`≈24px), nút sắp xếp lên/xuống (`p-1`≈20px) — 2 nút sắp xếp đặt sát nhau, rủi ro chạm nhầm cao hơn |
| D6 | `src/pages/admin/sections/MarketingManager.jsx` | 157 | Nút xoá ảnh preview `w-5 h-5` (20px), đặt góc ảnh |
| D7 | `src/pages/admin/sections/ServerLogs.jsx` | 1029, 1037, 1042 | 3 nút điều hướng sidebar chính (Live logs/Bookmarks/Analytics/Watchlist/Upload/Notification) `w-8 h-8` (32px), xếp dọc sát nhau trong cột 42px |
| D8 | `src/components/dashboard/OverviewTab.jsx` | 189 | Row "Quick metrics" (Streak/Mục tiêu tuần/Tổng thời gian) `grid-cols-3` không breakpoint — nội dung ngắn, vẫn đọc được nhưng chật |
| D9 | `src/pages/VoiceReport.jsx` | 341 | Voice Quality (Jitter/Shimmer/HNR) `grid-cols-3` không breakpoint — cùng lý do D8 |
| D10 | `src/pages/admin/sections/SecurityLogs.jsx` | 340-341 | `<Table className="min-w-[700px]">` bọc đúng `overflow-x-auto` (không phải lỗi thiếu overflow) nhưng buộc cuộn ngang trên phone — UX kém dù kỹ thuật đúng |
| D11 | `src/pages/About.jsx` | 111 | Stats bar (500+ MCs / 10K+ Sessions / 94% Satisfaction) `grid-cols-3` không breakpoint — nội dung ngắn (số + nhãn 1 từ), có `gap-3 sm:gap-8` responsive dù cột cố định |

---

## 🎨 Ngoài phạm vi responsive — phát hiện thêm: emoji dùng làm icon UI

Không phải lỗi responsive, nhưng cùng nhóm "vi phạm design-system" đã sửa 1 chỗ ở `VoiceReport.jsx` trước đó (thay `⚠` bằng `AlertTriangle` từ lucide-react). Quét mở rộng phát hiện đây là **pattern có hệ thống**, không phải lỗi rời rạc:

| File | Số lượng | Ghi chú |
|------|----------|---------|
| `src/components/ui/StreakWidget.jsx` | 8 | `FRAME_EMOJI` — NONE/SPARK/FLAME/STORM/LEGEND/ELITE/IMMORTAL |
| `src/components/ui/StreakCardModal.jsx` | 8 | `FRAME_HERO_EMOJI` — **cùng hệ thống tier với StreakWidget**, phải đồng bộ nếu sửa |
| `src/components/ui/AvatarFrame.jsx` | 10 | Frame tier icon — có thể cùng hệ thống streak-tier trên |
| `src/pages/PaymentPage.jsx` | 37 | Checkmark/cross trong bảng so sánh gói cước (`✓`/`✗`), warning icon |
| `src/pages/Register.jsx` | 16 | Avatar picker (mic/crown/fire/diamond/rocket/music/trophy/sparkle/bolt), section label icon |
| `src/pages/LeaderboardPage.jsx` | 10 | Stat icon (streak/hours/sessions), "active" badge |
| `src/components/ui/PopularLessonsSidebar.jsx` | 9 | Category icon (wedding/gala/corporate/...), rank medal (1st/2nd/3rd) |
| `src/pages/admin/sections/UserManagement.jsx` | 8 | Stat card icon, toast message prefix |

**Không tự sửa** — phạm vi lớn, đặc biệt hệ thống streak-tier (StreakWidget + StreakCardModal + có thể AvatarFrame) dùng chung 1 bộ emoji, sửa lệch giữa các file sẽ gây hiển thị không nhất quán. Cần quyết định bộ icon SVG thay thế trước khi động vào.

---

## Đã kiểm tra — không phải lỗi (loại trừ khỏi audit)

- **Modal/Dialog user-facing**: `CertificateModal`, `PremiumModal`, `ContactModal`, `StreakCardModal` — đều `w-full max-w-*`, co giãn đúng chuẩn.
- **Table admin có overflow đúng**: `TransactionManagement.jsx`, `UserManagement.jsx`, `BookingManagement.jsx` — đều bọc `overflow-x-auto`/`overflow-auto` đúng cách. Toolbar filter của cả 3 file + `SecurityLogs.jsx` dùng `flex-wrap`/`flex-col sm:flex-row` đúng.
- **Bảng PDF export ẩn**: `DashboardSection.jsx:949` nằm trong `id="pdf-report-content"` với `absolute top-[-9999px] w-[800px] pointer-events-none` — không hiển thị UI thật, không tính lỗi.
- **Flex header/toolbar user-facing**: `Wallet.jsx`, `VoiceReport.jsx`, `VoicePractice.jsx`, `Community.jsx` — đã dùng đúng `flex-col sm/md:flex-row` hoặc `flex-wrap`.
- **Text truncate**: heading quan trọng (VoiceReport title) đã có `truncate` + `shrink-0` trên phần tử phụ.
- **Decorative absolute elements** (Home.jsx glow/blur background) — `pointer-events-none`, không ảnh hưởng layout.
- **`AdminOverview.jsx`, `AnalyticsSection.jsx`**: theo `CLAUDE.md`, đây là dead code không được `AdminDashboard.jsx` import — có `grid-cols` lỗi tương tự nhưng không render ra UI thật, không tính vào tổng kết.
- **Các file admin khác** (`CompetitionManager.jsx`, `LessonManagement.jsx`, `CoursePricingManager.jsx`, `AdminGuide.jsx`, `BookingManagement.jsx`, `CourseManager.jsx`): không phát hiện lỗi grid-cols/fixed-width/table/touch-target nào ngoài đã liệt kê.

---

## Tổng kết số lượng

| Mức độ | Số lượng vấn đề | File liên quan |
|--------|-----------------|-----------------|
| 🔴 Nghiêm trọng (layout gốc) | 3 | AdminDashboard.jsx, MarketingManager.jsx, ServerLogs.jsx |
| 🟠 Cao | 3 | TypewriterMarkdown.jsx, ScriptPanel.jsx (10 nút), Navbar.jsx |
| 🟡 Trung bình | 9 (17 vị trí) | sheet.jsx, NotesSidebar.jsx, Register.jsx, DashboardSection.jsx, PlanManager.jsx (5), MarketingManager.jsx (2), NotificationManager.jsx (2), AcademyManager.jsx, PrivacyHub.jsx |
| 🟢 Thấp | 11 (20+ vị trí) | PracticeHistory.jsx, CourseDetail.jsx, Wallet.jsx, Community.jsx, AcademyManager.jsx, MarketingManager.jsx, ServerLogs.jsx, OverviewTab.jsx, VoiceReport.jsx, SecurityLogs.jsx, About.jsx |
| 🎨 Ngoài scope (emoji-icon) | 8 file, ~106 vị trí | StreakWidget, StreakCardModal, AvatarFrame, PaymentPage, Register, LeaderboardPage, PopularLessonsSidebar, UserManagement |

**Khuyến nghị thứ tự xử lý:** A1 (sidebar admin) trước tiên — mọi trang admin phụ thuộc vào nó. Sau đó A2/A3 (2 trang layout riêng lẻ vỡ nặng nhất). Rồi tới nhóm 🟠 Cao (ảnh hưởng UX rộng). Nhóm 🟡/🟢 có thể gộp thành 1-2 đợt sửa hàng loạt bằng pattern giống nhau (thêm breakpoint cho grid-cols, tăng kích thước touch target).

---

## Nguồn

Audit thực hiện bằng Grep + đọc code trực tiếp (không suy đoán), gồm 2 batch: tự soi (non-admin + phát hiện bổ sung) và 1 subagent audit riêng cho `src/pages/admin/**`. Grep pattern dùng: `grid-cols-[2-9]` thiếu breakpoint, `w-[NNNpx]`/`min-w-[NNNpx]` > 300px, `w-N h-N` với N < 9 trên phần tử `<button>`/`onClick`, `<table>` không bọc `overflow-x-auto`, flex row 3+ phần tử không `flex-wrap`, emoji Unicode range dùng trong field `icon`/`emoji`.
