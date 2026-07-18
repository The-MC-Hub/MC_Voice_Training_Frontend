# Animate UI — Kế hoạch thay thế component toàn hệ thống

Ngày lập: 2026-07-19 · Cập nhật: 2026-07-18 (Giai đoạn 7 — Skeleton đã code xong, build+E2E+screenshot pass, xem mục 10)
Trạng thái tổng: 🟡 Đang triển khai — Button (PR trước) + Skeleton (giai đoạn 7) đã xong. Còn lại: Input(8), Table(9), Badge(10), Avatar(11), Card(12), Select(13, chờ xác nhận), Toast(14), Dialog(1), Dropdown Menu(2), Sheet(3), Accordion(4), Checkbox(5), Avatar Group(6) — theo thứ tự ưu tiên trong mục "Khảo sát hoàn tất".

## Mục tiêu

Thay các component UI tự viết (modal overlay, dropdown menu, accordion, checkbox/radio, tooltip, sheet/drawer...) bằng component tương ứng từ [animate-ui.com](https://animate-ui.com) — chỉ ở những chỗ animate-ui **thực sự có** component phù hợp và việc thay thế **không đổi hành vi/UX hiện tại**.

## Giới hạn quan trọng — animate-ui KHÔNG có những gì

Đã research kỹ toàn bộ catalog (7 nhóm: Animate, Radix, Base UI, Headless UI, Buttons, Backgrounds, Community). animate-ui **hoàn toàn không cung cấp**:

- ❌ Card cơ bản (chỉ có Flip Card — hiệu ứng lật, không dùng được làm content card thường)
- ❌ Input / Textarea / Form field / Label
- ❌ Select / Combobox (Dropdown Menu ≠ Select — Dropdown Menu dùng cho action menu, không bind value như `<select>`)
- ❌ Table
- ❌ Toast hệ thống (có "Notification List" nhưng là list tĩnh animate, không có hook `toast()`/queue/auto-dismiss như Sonner)
- ❌ Badge
- ❌ Avatar đơn (chỉ có Avatar Group — nhóm avatar chồng nhau)
- ❌ Skeleton / Loading placeholder
- ❌ Slider, Calendar/Date-picker, Breadcrumb, Pagination, Alert banner, Command palette

**Hệ quả:** `Toast.jsx`, `Skeleton.jsx`, `Breadcrumb.jsx`, mọi `<select>` filter, mọi custom "badge" pill hiện tại — **giữ nguyên, không đổi bởi animate-ui**. animate-ui chỉ thay thế được nhóm overlay/interactive/navigation.

## Nguồn thay thế cho Card/Input/Select/Table/Toast/Badge/Avatar/Skeleton — shadcn/ui gốc

Quyết định (2026-07-19): dùng **shadcn/ui gốc**, không phải react-bits (react-bits chỉ là snippet gallery cho hiệu ứng WebGL/animation qua `ogl`, không phải component-library có logic — đã dùng riêng cho background effects, không liên quan phần này). shadcn/ui dùng chung `components.json`/CLI/token bridge đã build sẵn khi cài animate-ui — không thêm hệ thống thiết kế thứ 2, không cần setup mới.

| Cần | shadcn component | Slug cài | Rủi ro |
|---|---|---|---|
| Card | `card` | `card` | Thấp — thuần layout Tailwind, không dependency runtime |
| Input / Textarea / Label | `input`, `textarea`, `label` | `input`, `textarea`, `label` | Thấp |
| Select | `select` | `select` | Trung bình — Radix Select thay `<select>` native, cần giữ đúng `value`/`onChange` binding khi đổi |
| Table | `table` | `table` | Thấp — thuần HTML semantic + Tailwind |
| Badge | `badge` | `badge` | Thấp |
| Avatar | `avatar` | `avatar` | Thấp — Radix Avatar có fallback initials tự động |
| Skeleton | `skeleton` | `skeleton` | Thấp |
| Toast | `sonner` | `sonner` | **Cao** — thay hẳn API `Toast.jsx`/`useToast()` hiện tại đang dùng ở nhiều nơi, đổi cách gọi (`toast.success(...)` kiểu Sonner khác hẳn hook hiện tại), cần audit lại toàn bộ call site |

Lệnh cài (khi bắt đầu, gộp mọi thứ trừ Toast — Toast tách riêng vì rủi ro cao):
```bash
npx shadcn@latest add card input textarea label select table badge avatar skeleton --yes
```
Sonner tách thành giai đoạn riêng (xem mục 10), audit toàn bộ `useToast()`/`Toast.jsx` call site trước khi đổi.

### Khảo sát hoàn tất (2026-07-19) — xem chi tiết từng giai đoạn ở mục 11-17 bên dưới

| Loại | Số file/vị trí liên quan | Rủi ro tổng | Độ ưu tiên |
|---|---|---|---|
| Skeleton | 8 file dùng `animate-pulse` inline + `Skeleton.jsx`/`SkeletonCard` riêng (2 nơi) | Thấp | 1 — làm trước, đơn giản nhất |
| Input | 61 raw `<input>` rải khắp 12 file admin (nhiều nhất: PlanManager 24, MarketingManager 10) | Thấp | 2 — passthrough props thuần |
| Table | 5 file UI thật (PaymentPage, BookingManagement, SecurityLogs, TransactionManagement, UserManagement) + 1 file PDF-export loại trừ (DashboardSection) | Thấp-Trung bình | 3 |
| Badge | PaymentPage (4 chỗ trực tiếp) + 4 file có badge-helper riêng (Home, Register, VoiceLibrary, TransactionManagement) | Thấp | 4 |
| Avatar | Chỉ Community.jsx (10 chỗ `<img>`+`onError` lặp lại) — `AvatarFrame.jsx` (streak-tier, 7 cấp, glow/animation riêng) **giữ nguyên hoàn toàn**, không phải ứng viên | Thấp | 5 |
| Card | ~40+ vị trí NÊN ĐỔI, ~50+ KHÔNG NÊN ĐỔI (animation/E2E-anchor), ~30+ KHÔNG CHẮC — xem bảng chi tiết mục 15 | Trung bình-Cao (khối lượng lớn, nhiều false-positive nếu vội) | 6 — làm sau cùng, chia nhỏ nhiều giai đoạn con |
| Select | 11 file dùng native `<select>` value-bound | Trung bình | 7 — cân nhắc kỹ, có thể giữ nguyên native |
| Toast | Chỉ 3 file gọi (`Dashboard.jsx`, `PaymentPage.jsx`, `Settings.jsx`), nhưng đổi API hoàn toàn (`toast.showSuccess()` → Sonner `toast.success()`) + cần `<Toaster />` provider mới trong `index.jsx` | Trung bình (không "cao" như đánh giá ban đầu — phạm vi nhỏ hơn dự kiến) | 8 — làm riêng, tách biệt hoàn toàn |

## Quyết định kỹ thuật: dùng nhóm "Radix" của animate-ui, không dùng "Base UI"/"Headless UI"

Project đã có sẵn `@radix-ui/react-popover` (dùng trong `date-picker.jsx`/`popover.jsx` — nhưng 2 file này hiện là **dead code**, không import ở đâu). Nhóm Radix của animate-ui dùng package hợp nhất `radix-ui` (re-export toàn bộ `@radix-ui/react-*`), tương thích hệ sinh thái đã quen thuộc. Không dùng Base UI (cần thêm `@base-ui-components/react`, API khác) hay Headless UI (ít component hơn, thiếu Dialog nâng cao/Sheet/Sidebar).

---

## 0. Đã hoàn thành trước đó

- [x] Cài đặt animate-ui registry (`components.json`, `jsconfig.json`)
- [x] Token bridge CSS (`--primary`, `--accent`, v.v ánh xạ theme gold-accent hiện có)
- [x] `Button` (animate-ui) áp dụng cho toàn bộ 28 trang + 16 file admin (~200 button)
- [x] Fix bug default variant Button (đổi `default` → `ghost` để tránh lộ nền cam mặc định)
- [x] Cài sẵn nhưng **chưa dùng đúng chỗ**: Dialog, Tabs, Tooltip, Accordion, Switch, Progress (`src/components/animate-ui/components/radix/*.jsx`)

## 1. Component cần cài thêm

| Component | Slug | Trạng thái |
|---|---|---|
| Alert Dialog | `radix-alert-dialog` | ⬜ Chưa cài |
| Dropdown Menu | `radix-dropdown-menu` | ⬜ Chưa cài |
| Sheet | `radix-sheet` | ⬜ Chưa cài |
| Checkbox | `radix-checkbox` | ⬜ Chưa cài |
| Radio Group | `radix-radio-group` | ⬜ Chưa cài |
| Avatar Group | `animate-avatar-group` | ⬜ Chưa cài (dùng thận trọng — xem mục 7) |
| Copy Button | `buttons-copy` | ⬜ Chưa cài (thay pattern "copy to clipboard" thủ công) |
| Sidebar | `radix-sidebar` | ⬜ Đánh giá riêng, KHÔNG ưu tiên (xem mục 8) |

Lệnh cài (chạy 1 lần, gộp):
```bash
npx shadcn@latest add \
  https://animate-ui.com/r/components-radix-alert-dialog.json \
  https://animate-ui.com/r/components-radix-dropdown-menu.json \
  https://animate-ui.com/r/components-radix-sheet.json \
  https://animate-ui.com/r/components-radix-checkbox.json \
  https://animate-ui.com/r/components-radix-radio-group.json \
  https://animate-ui.com/r/components-animate-avatar-group.json \
  https://animate-ui.com/r/components-buttons-copy.json \
  --yes
```
Sau khi cài: `npm run build` xác nhận 0 lỗi trước khi bắt đầu bất kỳ giai đoạn nào bên dưới.

---

## 2. Giai đoạn 1 — Dialog (modal overlay tự viết → `radix-dialog`)

**Rủi ro: TRUNG BÌNH.** Dialog animate-ui dùng Radix Dialog thật (focus trap, ESC-to-close, scroll-lock tự động, ARIA đầy đủ) — hành vi có thể khác modal tự viết hiện tại (vd không tự ESC-close). Phải test tay từng modal sau khi đổi, không chỉ dựa E2E.

### Danh sách modal cần khảo sát (16 file có pattern `fixed inset-0` / `bg-black/6*` overlay)

| # | File | Modal gì | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/Login.jsx` | AdminOtpModal (nhập OTP 6 số) | ⬜ |
| 2 | `src/pages/Home.jsx` | Certificate modal (xem/copy link chứng chỉ) | ⬜ |
| 3 | `src/pages/LeaderboardPage.jsx` | Share modal | ⬜ |
| 4 | `src/pages/Onboarding.jsx` | (xác nhận lại — có thể là dropdown, không phải modal) | ⬜ Cần đọc lại |
| 5 | `src/pages/Register.jsx` | (xác nhận lại — có thể liên quan CoursePickScreen) | ⬜ Cần đọc lại |
| 6 | `src/pages/Settings.jsx` | (xác nhận — có thể emoji picker, không phải modal chuẩn) | ⬜ Cần đọc lại |
| 7 | `src/pages/VoiceLibrary.jsx` | (xác nhận lại) | ⬜ Cần đọc lại |
| 8 | `src/pages/admin/AcademyManager.jsx` | Nhiều modal (milestone, add-content, preview) | ⬜ |
| 9 | `src/pages/admin/CompetitionManager.jsx` | Modal tạo/sửa arena | ⬜ |
| 10 | `src/pages/admin/sections/LessonManagement.jsx` | Modal thêm/sửa lesson | ⬜ |
| 11 | `src/pages/admin/sections/UserManagement.jsx` | Modal user detail/action | ⬜ |
| 12 | `src/components/dashboard/NewbieQuest.jsx` | Quest popup | ⬜ |
| 13 | `src/components/reading/NotesSidebar.jsx` | Có thể là Sheet, không phải Dialog — xem mục 4 | ⬜ |
| 14 | `src/components/ui/StreakCardModal.jsx` | Streak celebration modal | ⬜ |
| 15 | `src/components/voice/RecordingCard.jsx` | Xác nhận lại — có thể không phải modal thật | ⬜ |
| 16 | `src/pages/admin/PlanManager.jsx`, `MarketingManager.jsx`, `NotificationManager.jsx`, `CoursePricingManager.jsx`, `ServerLogs.jsx`, `SecurityLogs.jsx` | Đã convert Button ở PR trước, có thể có modal riêng — audit lại | ⬜ |

**Việc cần làm trước khi sửa bất kỳ file nào ở trên:** đọc lại từng file, xác nhận đây thật sự là "modal chặn tương tác nền" (đúng use-case Dialog) hay chỉ là dropdown/tooltip/inline-panel (sai use-case, không đổi).

### Cách làm 1 file mẫu (làm tay, không giao agent, để xác lập pattern chuẩn trước)
1. Chọn `Home.jsx` Certificate modal làm mẫu đầu tiên (đã biết rõ code).
2. Đổi cấu trúc từ `<AnimatePresence>{show && <div className="fixed inset-0..."><motion.div>...` sang:
   ```jsx
   import { Dialog, DialogContent, DialogTrigger } from '@/components/animate-ui/components/radix/dialog';
   <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
     <DialogContent>...nội dung cũ...</DialogContent>
   </Dialog>
   ```
3. Giữ nguyên toàn bộ nội dung bên trong (header, body, footer buttons) — chỉ đổi wrapper.
4. Test tay: mở modal, ESC đóng được, click ngoài đóng được, animation mượt, nội dung không vỡ layout.
5. Build + chạy E2E full suite.
6. Nếu ổn → áp dụng pattern này cho các file còn lại (có thể giao agent sau khi có 1 mẫu chuẩn).

### Checklist hoàn thành giai đoạn 1
- [ ] Đọc lại và xác nhận đúng 16 file ở trên, loại bỏ false-positive
- [ ] Làm mẫu Home.jsx Certificate modal, test tay
- [ ] Áp dụng cho các modal còn lại (chia nhóm nhỏ, build+test sau mỗi nhóm)
- [ ] Test tay TỪNG modal: mở/đóng, ESC, click-outside, focus-trap không phá layout xung quanh
- [ ] Chạy full Playwright E2E suite — 49/49 pass
- [ ] Test riêng: AdminOtpModal (Login.jsx) — luồng đăng nhập admin thật với OTP, không được để Dialog's focus-trap phá auto-focus vào ô số đầu tiên
- [ ] Commit + push

---

## 3. Giai đoạn 2 — Dropdown Menu (menu thả xuống tự viết → `radix-dropdown-menu`)

**Rủi ro: THẤP-TRUNG BÌNH.**

### Cần khảo sát trước khi liệt kê chính xác
Chưa xác định được file nào dùng dropdown-menu pattern (menu context, action menu 3-chấm) khác với `<select>` (form value picker — KHÔNG đổi). Việc cần làm:
- [ ] Grep toàn bộ `MoreVertical|MoreHorizontal|⋮|"..."` icon + state toggle liền kề → khả năng cao là dropdown action menu (thường thấy trong bảng admin: UserManagement, TransactionManagement, LessonManagement)
- [ ] Với mỗi kết quả tìm được, xác nhận đây là menu hành động (Edit/Delete/...) hay chỉ là filter dropdown (giữ nguyên)
- [ ] Liệt kê danh sách chính xác vào bảng dưới đây trước khi sửa

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| _(điền sau khi grep)_ | | | ⬜ |

### Checklist hoàn thành giai đoạn 2
- [ ] Grep + xác nhận danh sách chính xác
- [ ] Làm mẫu 1 file, test tay (menu mở đúng vị trí trigger, đóng khi click ngoài, điều hướng bàn phím hoạt động)
- [ ] Áp dụng cho các file còn lại
- [ ] Chạy full E2E suite
- [ ] Commit + push

---

## 4. Giai đoạn 3 — Sheet (side panel tự viết → `radix-sheet`)

**Rủi ro: TRUNG BÌNH.** Cần xác nhận đúng use-case (panel trượt từ cạnh màn hình, không phải modal giữa màn hình).

| # | File | Panel gì | Trạng thái |
|---|---|---|---|
| 1 | `src/components/reading/NotesSidebar.jsx` | Panel ghi chú khi đọc — ứng viên rõ nhất | ⬜ Xác nhận lại cấu trúc trước khi đổi |
| 2 | _(khảo sát thêm: có filter drawer nào trên mobile không?)_ | | ⬜ |

### Checklist hoàn thành giai đoạn 3
- [ ] Đọc kỹ `NotesSidebar.jsx`, xác nhận đúng use-case Sheet (không phải Dialog che toàn màn hình)
- [ ] Khảo sát thêm các file khác có panel trượt cạnh (đặc biệt mobile menu, filter drawer)
- [ ] Làm mẫu, test tay (trượt đúng hướng, đóng bằng vuốt/click ngoài, không đè lên nội dung quan trọng)
- [ ] Chạy full E2E suite
- [ ] Commit + push

---

## 5. Giai đoạn 4 — Accordion (đã cài, áp dụng đúng chỗ)

**Rủi ro: THẤP.** Accordion component (`radix-accordion`) đã cài từ trước nhưng **chưa dùng ở đâu**. 2 nơi có custom accordion pattern:

| # | File | Accordion gì | Quyết định |
|---|---|---|---|
| 1 | `src/pages/HelpCenter.jsx` (dòng ~19-68) | FAQ item, custom style riêng với icon box + hover state | ⚠️ **KHÔNG đổi** — style quá custom (icon box, màu riêng theo brand), animate-ui Accordion mặc định sẽ mất hết styling này, phải viết lại từ đầu tương đương công sức giữ nguyên. Không có lợi ích rõ ràng. |
| 2 | `src/pages/Home.jsx` FaqItem (dòng ~221-270) | Tương tự HelpCenter, dùng chung style pattern | ⚠️ **KHÔNG đổi** — cùng lý do trên |
| 3 | `src/pages/Settings.jsx` `expandedSections` (dòng ~478) | Cần đọc lại — có thể là accordion section trong 1 form dài | ⬜ Khảo sát, có thể đổi được nếu style đơn giản hơn 2 case trên |

### Checklist hoàn thành giai đoạn 4
- [ ] Đọc `Settings.jsx` `expandedSections`, đánh giá có đáng đổi không
- [ ] Nếu đổi: làm mẫu, test tay, chạy E2E
- [ ] Nếu không đổi bất kỳ chỗ nào: đóng giai đoạn này, ghi rõ lý do (đã ghi ở trên)

---

## 6. Giai đoạn 5 — Checkbox / Radio Group (checkbox tự viết → `radix-checkbox`/`radix-radio-group`)

**Rủi ro: THẤP.**

| # | File | Vị trí | Quyết định |
|---|---|---|---|
| 1 | `src/pages/Login.jsx` | "Ghi nhớ tôi" checkbox | ⬜ Ứng viên tốt — checkbox đơn giản, boolean state rõ ràng |
| 2 | `src/pages/Register.jsx` | Terms-of-service checkbox | ⚠️ **KHÔNG đổi** — đã quyết định giữ nguyên ở phiên trước (semantically vẫn nên đơn giản, tránh phá luồng đăng ký quan trọng nhất hệ thống) |

### Checklist hoàn thành giai đoạn 5
- [ ] Đổi Login.jsx "Ghi nhớ tôi" sang `radix-checkbox`, test tay (check/uncheck, submit form vẫn đọc đúng state)
- [ ] Chạy E2E `e2e/auth.spec.js` — đặc biệt test login flow không bị phá
- [ ] Commit + push
- [ ] KHÔNG đổi Register.jsx terms checkbox (giữ nguyên theo quyết định trước)

---

## 7. Giai đoạn 6 — Avatar Group (đánh giá, có thể không cần)

**Rủi ro: THẤP nhưng lợi ích không rõ ràng.**

animate-ui chỉ có "Avatar Group" (nhiều avatar chồng nhau), không có Avatar đơn. Project hiện dùng `AvatarFrame.jsx` (custom, có thể có logic riêng: fallback ảnh, border theo streak/level).

| # | File | Có phải Avatar Group thật không? | Quyết định |
|---|---|---|---|
| 1 | `src/pages/Community.jsx` leaderboard | Avatar đơn từng dòng, KHÔNG chồng lên nhau | ❌ Không áp dụng — sai use-case |
| 2 | `src/pages/LeaderboardPage.jsx` | Tương tự — avatar đơn | ❌ Không áp dụng |
| 3 | _(nếu tìm thấy chỗ nào thật sự cần "stacked avatars" — vd "X người đang online")_ | | ⬜ Khảo sát thêm |

### Checklist hoàn thành giai đoạn 6
- [ ] Khảo sát toàn bộ codebase tìm pattern "avatar chồng lên nhau" (thường thấy ở "X thành viên tham gia")
- [ ] Nếu không tìm thấy use-case phù hợp: đóng giai đoạn này, không cài `animate-avatar-group`, ghi rõ lý do
- [ ] `AvatarFrame.jsx` giữ nguyên trong mọi trường hợp (avatar đơn, animate-ui không có thay thế)

---

## 8. Không làm — Sidebar (`radix-sidebar`)

Project đã có `PopularLessonsSidebar.jsx` + `AdSidebar.jsx` (2 sidebar cố định 2 bên, không collapsible, gắn chặt với `app-container.has-sidebars` CSS layout trong `index.css`). animate-ui Sidebar là component điều hướng app collapsible kiểu dashboard-shell — **khác hoàn toàn mục đích** với 2 sidebar hiện tại (chúng là nội dung quảng cáo/gợi ý, không phải nav). **Quyết định: không đổi, không cài.**

## 9. animate-ui không có Card/Input/Select/Table/Toast/Badge/Avatar/Skeleton — dùng shadcn/ui thay thế (xem mục 10-17)

Đã xác nhận animate-ui không cung cấp các loại này (xem phần đầu file). Không tự viết thêm, không để `Toast.jsx`/`Skeleton.jsx`/native `<select>`/custom badge pill/card layout mãi mãi — **dùng shadcn/ui gốc** (đã quyết định ở phần đầu file), triển khai theo các giai đoạn 10-17 dưới đây, khảo sát xong ngày 2026-07-19.

---

## 10. Giai đoạn 7 — Skeleton (ưu tiên 1, làm trước)

**Rủi ro: THẤP.**

| # | File | Việc cần làm | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/AdminDashboard.jsx` | ✅ Xác nhận **false-positive** — dòng 161 chỉ là dot "system online" (`w-1.5 h-1.5 bg-emerald-400 animate-pulse`), không phải skeleton. Không đổi. | ✅ Không áp dụng |
| 2 | `src/pages/Community.jsx` | ✅ Xác nhận **false-positive** — dòng ~150 là dot live-indicator trên badge loại thi đấu. Không đổi. | ✅ Không áp dụng |
| 3 | `src/pages/CoursesList.jsx` | `SkeletonCard` (dòng 29-39) — giữ nguyên wrapper ngoài, đổi 5 `<div>` con → `<Skeleton>` | ✅ Xong |
| 4 | `src/pages/LeaderboardPage.jsx` | 2 vị trí: `SkeletonRow` (dòng ~172-187, 5 div) + podium loading block (dòng ~1017-1027, 3× trong `.map()`) — cả 2 đổi sang `<Skeleton>`, giữ nguyên `motion.div`/`data-quest` wrapper | ✅ Xong |
| 5 | `src/pages/PaymentPage.jsx` | Dòng 325-336 — xác nhận đây là skeleton loading thuần (`plansLoading` ternary, không phải Card thật) → đổi 3 div con sang `<Skeleton>`, giữ nguyên khung card ngoài | ✅ Xong |
| 6 | `src/pages/VoiceLibrary.jsx` | Dòng 332-336 (6× trong `.map()`) → `<Skeleton>` | ✅ Xong |
| 7 | `src/pages/VoiceReport.jsx` | ✅ Xác nhận **false-positive** — dòng 206 là icon `Sparkles` với `animate-pulse` trang trí trong full-page loading state, không phải div placeholder hình khối. Không đổi. | ✅ Không áp dụng |
| 8 | `src/pages/admin/sections/ServerLogs.jsx` | ✅ Xác nhận **false-positive** — dòng 1057 là dot connection-status (emerald/red). Không đổi. | ✅ Không áp dụng |
| 9 | `src/components/ui/skeleton.jsx` | shadcn CLI ghi đè trực tiếp lên file cũ (Windows case-insensitive FS, `Skeleton.jsx`/`skeleton.jsx` là cùng 1 file vật lý) — nay export named `{ Skeleton }` thay vì default export. `SkeletonCard` cũ trong file này là dead code (không ai import ngoài chính nó) → đã bị xoá cùng lúc, không mất gì. Cập nhật `LazyImage.jsx` sang `import { Skeleton } from './skeleton'`. Xoá CSS `.skeleton-shimmer`/`@keyframes shimmer` khỏi `index.css` (không còn consumer). | ✅ Xong |

Lệnh cài: `npx shadcn@latest add skeleton --yes`

### Checklist
- [x] Cài `skeleton`
- [x] Đổi từng file, build sau mỗi file
- [x] Screenshot xác nhận — VoiceLibrary/LeaderboardPage (bắt được đúng lúc podium skeleton đang hiển thị, style pastel/bg-accent đúng theme)/CoursesList render đúng, không layout-shift, không vỡ giao diện
- [x] Chạy E2E full suite — 49/49 pass
- [x] Commit + push — **CHƯA push, chỉ mới commit local, chờ xác nhận trước khi push theo thói quen đã thiết lập**

---

## 11. Giai đoạn 8 — Input (ưu tiên 2)

**Rủi ro: THẤP.** shadcn Input là styled `<input>` thuần, props passthrough 100% — không đổi `value`/`onChange`/logic.

12 file, 61 vị trí (nhiều nhất: `PlanManager.jsx` 24, `MarketingManager.jsx` 10, `NotificationManager.jsx` 4, `ServerLogs.jsx` 4, `AcademyManager.jsx` 4). Danh sách đầy đủ:

| # | File | Số lượng `<input>` |
|---|---|---|
| 1 | `src/pages/admin/PlanManager.jsx` | 24 |
| 2 | `src/pages/admin/sections/MarketingManager.jsx` | 10 |
| 3 | `src/pages/admin/AcademyManager.jsx` | 4 |
| 4 | `src/pages/admin/sections/NotificationManager.jsx` | 4 |
| 5 | `src/pages/admin/sections/ServerLogs.jsx` | 4 |
| 6 | `src/pages/admin/CompetitionManager.jsx` | 3 |
| 7 | `src/pages/admin/sections/CoursePricingManager.jsx` | 2 |
| 8 | `src/pages/admin/sections/LessonManagement.jsx` | 2 |
| 9 | `src/pages/admin/sections/SecurityLogs.jsx` | 2 |
| 10 | `src/pages/admin/sections/AdminGuide.jsx` | 1 |
| 11 | `src/pages/admin/sections/TransactionManagement.jsx` | 1 |
| 12 | `src/pages/admin/sections/UserManagement.jsx` | 4 |

**Không nằm trong phạm vi giai đoạn này:** input trong `Login.jsx`/`Register.jsx`/`ForgotPassword.jsx`/`Settings.jsx` — các form auth/settings này có styling riêng phức tạp (icon-inline, focus-glow shadow riêng theo brand amber) đã audit kỹ ở phiên trước, đổi sang shadcn Input mặc định sẽ mất style đó. Chỉ đổi input "trần" (không icon-inline, không custom focus style) trong admin.

### Checklist
- [ ] Cài `input` (`npx shadcn@latest add input --yes`)
- [ ] Làm mẫu 1 file nhỏ trước (`AdminGuide.jsx`, chỉ 1 input)
- [ ] Áp dụng hàng loạt cho các file còn lại — có thể giao agent theo nhóm 3-4 file
- [ ] Build sau mỗi nhóm
- [ ] Chạy E2E full suite (đặc biệt `reading-and-admin.spec.js` — các section admin đều phải vẫn render "Đăng xuất" button, không lỗi)
- [ ] Commit + push

---

## 12. Giai đoạn 9 — Table (ưu tiên 3)

**Rủi ro: THẤP-TRUNG BÌNH.** shadcn Table (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) chỉ là wrapper style cho `<table><thead><tbody><tr><th><td>` chuẩn — giữ nguyên semantic HTML, `colSpan`, `key` mapping.

| # | File | Dòng | Đặc điểm | Trạng thái |
|---|---|---|---|---|
| 1 | `src/pages/PaymentPage.jsx` | 713 | Comparison table — **CẢNH BÁO**: E2E `e2e/payment.spec.js` check `th:has-text("Daily")`, phải giữ nguyên `<th>` chứa đúng text "Daily" ở đúng vị trí | ⬜ |
| 2 | `src/pages/admin/sections/BookingManagement.jsx` | 20 | Dark theme table (`bg-[#0f172a]`), đơn giản | ⬜ |
| 3 | `src/pages/admin/sections/SecurityLogs.jsx` | 340 | `min-w-[700px]`, header dynamic từ mảng label | ⬜ |
| 4 | `src/pages/admin/sections/TransactionManagement.jsx` | 218 | 10 cột, có `colSpan={10}` cho loading/empty state | ⬜ |
| 5 | `src/pages/admin/sections/UserManagement.jsx` | 806 | Sticky header (`sticky top-0`), 8 cột, row có `onClick` chọn user — **shadcn TableRow phải giữ được `onClick` + `sticky` trên `TableHead`** | ⬜ |

**Loại trừ:** `src/pages/admin/sections/DashboardSection.jsx` dòng 948 — nằm trong block PDF-export (`#pdf-report-content`, dòng 917-993), html2pdf.js cần HTML/CSS thuần, **KHÔNG đổi**. `NotificationManager.jsx` dòng 98-104 `<table>` là string literal HTML email template, không phải JSX — không thuộc phạm vi.

### Checklist
- [ ] Cài `table` (`npx shadcn@latest add table --yes`)
- [ ] Làm mẫu `BookingManagement.jsx` trước (đơn giản nhất)
- [ ] Đổi `UserManagement.jsx` cẩn thận nhất (sticky header + row onClick) — test tay riêng
- [ ] Đổi `PaymentPage.jsx` — sau khi đổi, chạy riêng `e2e/payment.spec.js` xác nhận `th:has-text("Daily")` vẫn pass
- [ ] Đổi `SecurityLogs.jsx`, `TransactionManagement.jsx`
- [ ] Build + E2E full suite sau mỗi file
- [ ] Commit + push

---

## 13. Giai đoạn 10 — Badge (ưu tiên 4)

**Rủi ro: THẤP.**

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/PaymentPage.jsx` | Dòng 302, 379, 383, 393 — "Gói hiện tại", "current plan" badge | ⬜ |
| 2 | `src/pages/Home.jsx` | Badge helper (khảo sát lại vị trí chính xác khi vào việc) | ⬜ |
| 3 | `src/pages/Register.jsx` | nt | ⬜ |
| 4 | `src/pages/VoiceLibrary.jsx` | Difficulty badge (`difficultyStyle`) | ⬜ |
| 5 | `src/pages/admin/sections/TransactionManagement.jsx` | Status badge (`STATUS_CONFIG`) | ⬜ |

### Checklist
- [ ] Cài `badge` (`npx shadcn@latest add badge --yes`)
- [ ] Làm mẫu PaymentPage.jsx (4 vị trí, đã biết rõ code)
- [ ] Áp dụng các file còn lại
- [ ] Build + E2E full suite
- [ ] Commit + push

---

## 14. Giai đoạn 11 — Avatar (ưu tiên 5)

**Rủi ro: THẤP.**

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/Community.jsx` | 10 chỗ `<img src={x || "/default-avatar.png"} onError={...}>` (dòng 234-236, 340-342, 361-363, 381-383, 421-423, +5 nữa) | ⬜ |

**Giữ nguyên hoàn toàn:** `src/components/ui/AvatarFrame.jsx` — hệ thống frame theo streak-tier (7 cấp: NONE/SPARK/FLAME/STORM/LEGEND/ELITE/IMMORTAL), mỗi cấp có `border`/`glow`/`animation` CSS riêng, gắn chặt gamification logic. shadcn Avatar không thể thay thế được component này, không nằm trong phạm vi.

### Checklist
- [ ] Cài `avatar` (`npx shadcn@latest add avatar --yes`)
- [ ] Đổi 10 vị trí trong `Community.jsx` → `<Avatar><AvatarImage src={...} /><AvatarFallback>...</AvatarFallback></Avatar>` (bỏ được `onError` thủ công, dùng `AvatarFallback` tự động)
- [ ] Build + E2E
- [ ] Commit + push

---

## 15. Giai đoạn 12 — Card (ưu tiên 6, làm sau cùng, chia nhỏ)

**Rủi ro: TRUNG BÌNH-CAO.** Khối lượng lớn nhất, nhiều ranh giới mờ giữa "đơn giản" và "có logic ẩn". Đã khảo sát toàn bộ 28 trang + 16 file admin (2026-07-19) — xem báo cáo đầy đủ lưu trong lịch sử hội thoại phiên lập kế hoạch này. Tóm tắt theo 3 nhóm:

### 15.1 — NÊN ĐỔI (ưu tiên làm trước, rủi ro thấp nhất trong nhóm Card)

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| 1 | `Wallet.jsx` | Balance card, Payout method card (không import framer-motion) | ⬜ |
| 2 | `PaymentResult.jsx` | Result card duy nhất | ⬜ |
| 3 | `Success.jsx` | Booking summary card | ⬜ |
| 4 | `MilestoneDetail.jsx` | "Overall progress" box, "Rewards" sidebar card | ⬜ |
| 5 | `Learning.jsx` | "Mentorship" premium card | ⬜ |
| 6 | `ComingSoon.jsx` | 4 stat cards nhỏ | ⬜ |
| 7 | `PrivacyHub.jsx` / `TermsOfService.jsx` | TOC sidebar card, contact-info cards (`.map()` không stagger), footer note card | ⬜ |
| 8 | `Settings.jsx` | "General" card, Password form card, Session/Danger Zone card, `ReferralCard` — **KHÔNG đụng "Personal Info" card** (chứa `data-quest="quest-avatar-picker"`/`quest-name-input"`/`quest-save-profile"`, để riêng ở 15.3) | ⬜ |
| 9 | `Dashboard.jsx` | DAILY countdown banner, FREE upgrade banner | ⬜ |
| 10 | `PaymentPage.jsx` | FREE indicator card, Amount sub-card, Testimonials strip cards — **KHÔNG đụng plan cards (motion.button) hay comparison table** | ⬜ |
| 11 | `admin/sections/DashboardSection.jsx` | `Card`/`KPI`/`RevCard`/`Stat` helper component (phần **visible only**) — ứng viên tốt nhất vì đây là pattern thủ công gần giống shadcn Card nhất | ⬜ **BẮT BUỘC loại trừ hoàn toàn block `#pdf-report-content` dòng 917-993** |
| 12 | `admin/sections/TransactionManagement.jsx` | Revenue summary cards, "Revenue by plan" cards | ⬜ |
| 13 | `admin/sections/CoursePricingManager.jsx` | Course pricing rows (dòng 71-129) | ⬜ |
| 14 | `admin/CompetitionManager.jsx` | Competition cards (dòng 98-132), empty state card | ⬜ |
| 15 | `admin/PlanManager.jsx` | Voucher stats summary cards (dòng 899-905), Guest cooldown settings card (dòng 826-867) — **KHÔNG đụng `PlanEditor`/`DiscountRow` accordion (logic phức tạp)** | ⬜ |
| 16 | `admin/sections/NotificationManager.jsx` | Stats cards tĩnh (dòng 681-693) — **KHÔNG đụng `AnnouncementRow`** | ⬜ |
| 17 | `admin/sections/MarketingManager.jsx` | Email template cards (dòng 481-509) | ⬜ |
| 18 | `HelpCenter.jsx` | "Tài nguyên hữu ích" card, "Vẫn cần trợ giúp?" card (tách khỏi `motion.div fadeUp` wrapper — giữ wrapper, đổi nội dung Card con bên trong) | ⬜ |
| 19 | `ContactUs.jsx` | Contact info cards, "Thời gian phản hồi"/"Trước khi liên hệ" cards | ⬜ |
| 20 | `Onboarding.jsx` | Step 3 identity/bank cards (2 cards cố định) | ⬜ |
| 21 | `Community.jsx` | "No active arena" fallback card | ⬜ |
| 22 | `CourseDetail.jsx` | `QuizTab` result cards (dòng 281-373, khi hiển thị kết quả) | ⬜ |

### 15.2 — KHÔNG ĐỔI (giữ nguyên, ghi lý do để không ai đổi nhầm sau này)

- `Home.jsx`, `About.jsx` — toàn bộ dùng `SpotlightCard`, đổi sẽ mất hiệu ứng
- `CoursesList.jsx` `CourseCard` — anchor E2E `quest-first-course` + stagger animation
- `VoiceLibrary.jsx` lesson cards (list & grid) — anchor E2E `quest-first-lesson`
- `LeaderboardPage.jsx` — toàn bộ file, anchor E2E `quest-leaderboard-table` + Podium/StatsBar/TierProgressCard đều có motion riêng
- `VoiceReport.jsx` — mọi card bọc `motion.div {...fadeUp(delay)}`
- `Login.jsx`, `Register.jsx` — testimonial carousel, AdminOtpModal, slide panels, CoursePickScreen stagger
- `admin/sections/DashboardSection.jsx` block `#pdf-report-content` (dòng 917-993)
- `admin/sections/ServerLogs.jsx`, `SecurityLogs.jsx`, `LessonManagement.jsx`, `BookingManagement.jsx` — không có Card pattern rõ ràng (log-line/table-row layout chuyên biệt)

### 15.3 — KHÔNG CHẮC (cần quyết định thêm trước khi làm, KHÔNG tự ý giao agent)

Đây là "wrapper card lớn" chứa nội dung con phức tạp — ranh giới mờ:

| File | Vị trí | Vì sao không chắc |
|---|---|---|
| `Settings.jsx` | "Personal Info" card (chứa `data-quest` x3) | Cần test kỹ quest-anchor sau khi đổi cấu trúc DOM |
| `Settings.jsx` | "Payment" card (nhiều nhánh điều kiện lồng) | Cấu trúc lồng phức tạp |
| `PaymentPage.jsx` | Payment panel phải (voucher AnimatePresence, discount input) | Logic phức tạp bên trong |
| `PaymentPage.jsx` | Comparison table card (bọc `th:has-text("Daily")`) | E2E-critical, chỉ nên đổi phần header/footer CTA nếu tách riêng được |
| `Community.jsx` | Leaderboard main card (Top 3 podium + list) | Nội dung con phức tạp dù wrapper tĩnh |
| `CourseDetail.jsx` | Hero card, Sidebar stats box, "Lộ trình học" wrapper | Có `motion.div` stagger nhỏ + progress-bar animate bên trong |
| `AcademyManager.jsx` | Milestone accordion cards, Syllabus content items | Không animation library nhưng logic accordion+hover-reveal phức tạp |
| `PlanManager.jsx` | `PlanEditor`, `DiscountRow` | Logic phức tạp khi mở rộng |
| `MarketingManager.jsx` | Social post list items, Campaign history cards | Expand/collapse phức tạp |
| `NotificationManager.jsx` | `AnnouncementRow` | Expand/collapse với send-picker |
| `AdminGuide.jsx` | `renderCard` (dòng 1119-1174) | 50+ guide cards, expand/collapse, có thể tách header ra đổi riêng |
| `VerifyEmail.jsx` | Success/error card | `motion.div` chỉ mount 1 lần (không stagger) — có thể đổi được nhưng cần xác nhận animation wrapper không vỡ |
| `admin/sections/AnalyticsSection.jsx`, `AdminOverview.jsx` | `Card`/`Stat` helper | **Nghi ngờ không active trong routing** (`AdminDashboard.jsx` chỉ import `DashboardSection`, không thấy import 2 file này) — xác nhận trước khi đổi, nếu dead code thì bỏ qua hoàn toàn, không tốn công |

### Checklist giai đoạn 12
- [ ] Xác nhận `AnalyticsSection.jsx`/`AdminOverview.jsx` có active trong routing không (`grep -n "AnalyticsSection\|AdminOverview" src/pages/AdminDashboard.jsx`) — nếu dead code, loại khỏi phạm vi hoàn toàn
- [ ] Cài `card` (`npx shadcn@latest add card --yes`)
- [ ] Làm mẫu 2-3 file đơn giản nhất trong 15.1 trước (`PaymentResult.jsx`, `Success.jsx`) — test tay + screenshot
- [ ] Áp dụng hàng loạt phần còn lại của 15.1 — chia nhóm nhỏ 3-4 file/agent, build sau mỗi nhóm
- [ ] Với từng mục 15.3: đọc kỹ, quyết định NÊN/KHÔNG trước khi đổi — không đoán
- [ ] Screenshot trước/sau cho mỗi trang đã đổi — bài học từ vụ Button pill cam, không chỉ tin build pass
- [ ] Chạy full E2E suite sau mỗi nhóm lớn
- [ ] Test tay riêng: `Settings.jsx` Personal Info card nếu có đổi — quest-tour (`QuestGuideTour.jsx`) vẫn phải tìm đúng `data-quest` anchor
- [ ] Test tay riêng: `PaymentPage.jsx` comparison table nếu có đổi — `e2e/payment.spec.js` phải pass
- [ ] Commit theo từng nhóm nhỏ (không gộp 1 commit khổng lồ cho cả giai đoạn 12)

---

## 16. Giai đoạn 13 — Select (đánh giá, có thể giữ nguyên native)

**Rủi ro: TRUNG BÌNH.** 11 file dùng native `<select>` value-bound (filter dropdown chủ yếu). shadcn `Select` (Radix-based) đổi hoàn toàn hành vi UI (custom dropdown thay vì OS-native `<select>`), cần re-test kỹ trên mobile/touch.

**Khuyến nghị: cân nhắc giữ nguyên native `<select>`** — lợi ích thẩm mỹ không lớn (đa số là filter dropdown nhỏ, không phải trọng tâm UI), trong khi rủi ro về hành vi mobile/accessibility của Radix Select cần test kỹ hơn nhiều so với lợi ích. Chỉ nên làm nếu có yêu cầu rõ ràng cải thiện UI filter cụ thể — không tự ý đưa vào phạm vi mặc định.

### Checklist (chỉ làm nếu quyết định tiến hành)
- [ ] Xác nhận với người dùng có thực sự cần đổi Select không trước khi bắt đầu (không mặc định làm)
- [ ] Nếu có: liệt kê chính xác 11 file, làm mẫu 1 file, test tay kỹ trên mobile viewport
- [ ] Build + E2E
- [ ] Commit + push

---

## 17. Giai đoạn 14 — Toast → Sonner (tách riêng, làm cuối)

**Rủi ro: TRUNG BÌNH.** Phạm vi nhỏ hơn dự kiến ban đầu — chỉ 3 file gọi (`Dashboard.jsx`, `PaymentPage.jsx`, `Settings.jsx`), nhưng đổi toàn bộ API.

| Việc cần làm | Trạng thái |
|---|---|
| Cài `sonner` (`npx shadcn@latest add sonner --yes`) | ⬜ |
| Thêm `<Toaster />` vào `src/index.jsx` (hoặc `App.jsx`) — thay `<ToastProvider>` wrapper hiện tại | ⬜ |
| Đổi `Dashboard.jsx`: `toast.showSuccess(...)` → `toast.success(...)` (import `{ toast } from 'sonner'`, bỏ `useToast()` hook) | ⬜ |
| Đổi `PaymentPage.jsx`: tương tự (dòng 187, 218, 234, 237 đã biết vị trí) | ⬜ |
| Đổi `Settings.jsx`: tương tự | ⬜ |
| Xoá `src/components/ui/Toast.jsx` + `ToastProvider` wrapper trong `index.jsx`/`App.jsx` sau khi không còn ai import | ⬜ |
| Screenshot xác nhận toast mới hiển thị đúng vị trí/màu sắc theo theme, không lộ style mặc định Sonner (trắng/đen) không khớp brand | ⬜ |
| Build + E2E full suite | ⬜ |
| Commit + push |

---

## Quy trình chuẩn cho MỌI giai đoạn (bắt buộc tuân theo)

1. Đọc kỹ từng file trước khi sửa — không đoán, không giao agent khi chưa có bảng danh sách chính xác
2. Làm mẫu 1 file trước, test tay kỹ (không chỉ dựa E2E — animate-ui Dialog/Sheet có hành vi thật sự khác native, như focus-trap, ESC-close, scroll-lock)
3. Sau mẫu ổn → áp dụng hàng loạt (có thể giao agent nếu pattern đã rõ ràng và lặp lại)
4. `npm run build` sau mỗi file/nhóm file
5. Chạy full Playwright E2E suite (`MONGODB_TEST_URI="..." npx playwright test`) — phải 49/49 pass (số lượng test có thể tăng nếu cần thêm test case cho hành vi mới của Dialog/Sheet)
6. Test tay riêng cho hành vi tương tác (ESC, click-outside, focus-trap, animation) — Playwright hiện tại chỉ check "page loads"/"element visible", KHÔNG check các hành vi này
7. Commit + hỏi ý kiến trước khi push (theo thói quen đã thiết lập trong phiên làm việc)

## Rủi ro tổng thể cần lưu ý

- **Radix Dialog/AlertDialog có focus-trap thật** — nếu modal cũ có input tự-focus (như AdminOtpModal 6 ô số) phải test kỹ không bị conflict với focus-trap của Radix.
- **Radix Dialog mặc định lock scroll body** — nếu modal cũ không lock scroll (hoặc lock theo cách khác), giao diện có thể nhảy layout (scrollbar biến mất) khi đổi.
- **animate-ui Accordion/Dropdown mặc định có styling riêng** (dùng token `--muted`, `--accent`...) — nếu không viết className override kỹ, dễ lặp lại đúng bug "lộ nền mặc định" đã gặp với Button (xem commit `a977938` — bài học: LUÔN kiểm tra bằng screenshot thật, không chỉ tin build pass).
- Ưu tiên **test tay bằng screenshot Playwright** sau mỗi giai đoạn, không chỉ dựa vào E2E pass — bài học từ vụ Button pill cam vừa xảy ra.
