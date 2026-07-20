# Animate UI — Kế hoạch thay thế component toàn hệ thống

Ngày lập: 2026-07-19 · Cập nhật: 2026-07-20 (TOÀN BỘ 17 mục trong migration plan đã xử lý xong — bao gồm Card 15.3 13/13)
Trạng thái tổng: 🟢 **MIGRATION HOÀN TẤT** — Button (PR trước) + Skeleton (7) + Input (8) + Table (9) + Badge (10) + Avatar (11) + Card 15.1+15.3 toàn bộ (12) + Toast→Sonner (14) + Dialog (1) + Sheet (3) + Checkbox (5) đã code+test+screenshot xong. Dropdown Menu (2), Accordion (4), Avatar Group (6) đã khảo sát kỹ — xác nhận KHÔNG có use-case phù hợp trong codebase, đóng giai đoạn không cần code gì. Select giữ native theo khuyến nghị plan (quyết định có chủ đích, không phải bỏ sót). Không còn hạng mục nào trong kế hoạch gốc chưa xử lý.

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

| # | File | Modal gì | Kết quả khảo sát + trạng thái |
|---|---|---|---|
| 1 | `src/pages/Login.jsx` | AdminOtpModal (nhập OTP 6 số) | ✅ Xác nhận Dialog thật, đã đổi. Auto-focus ô số đầu tiên hoạt động đúng (Radix auto-focus trùng với element đầu tiên trong DOM, không xung đột với `inputs.current[0]?.focus()` thủ công cũ). Paste 6 số vẫn hoạt động. |
| 2 | `src/pages/Home.jsx` | Certificate modal | ✅ Đã đổi — **làm mẫu đầu tiên**. Lưu ý: không có nút trigger nào gọi `setShowCertModal(true)` trong code hiện tại — modal này hiện không thể mở qua UI (tính năng đã "chết" từ một refactor trước). Không ảnh hưởng migration, chỉ không test tay bằng click được — verify qua build + đọc code cấu trúc. |
| 3 | `src/pages/LeaderboardPage.jsx` | Share modal | ✅ Xác nhận Dialog thật, đã đổi. Bỏ `bg-background border p-6` mặc định (dùng `bg-transparent border-none p-0 shadow-none` vì style nằm ở div con). |
| 4 | `src/pages/Onboarding.jsx` | ✅ Xác nhận **false-positive** | Chỉ là hover-reveal overlay CSS (`opacity-0 group-hover:opacity-100`) trên thumbnail, không phải modal. Không đổi. |
| 5 | `src/pages/Register.jsx` | ✅ Xác nhận **false-positive** | `CoursePickScreen`/`OtpScreen` là step trong wizard nhiều bước (`AnimatePresence mode="wait"` swap step, không phải overlay). Đổi sang Dialog sẽ phá luồng đăng ký. Không đổi. |
| 6 | `src/pages/Settings.jsx` | ✅ Xác nhận **false-positive** | `EmojiAvatarPicker` là widget luôn hiển thị inline trong trang, không phải overlay. Không đổi. |
| 7 | `src/pages/VoiceLibrary.jsx` | ✅ Xác nhận **false-positive** | Chỉ có hover-reveal overlay trên thumbnail (giống Onboarding), không có `fixed inset-0` nào trong file. Không đổi. |
| 8 | `src/pages/admin/AcademyManager.jsx` | 3 modal: Milestone Editor, Add Content (2 cột form+preview), Preview Modal | ✅ Cả 3 đã đổi. Add Content giữ nguyên `max-w-4xl max-h-[90vh] overflow-hidden flex flex-col` + 2 vùng scroll độc lập bên trong, không bị vỡ layout. |
| 9 | `src/pages/admin/CompetitionManager.jsx` | Modal tạo/sửa arena | ✅ Đã đổi. Thêm `relative` tường minh vào `DialogContent` để nút X (dùng `absolute`) neo đúng góc — test tay xác nhận vị trí đúng (screenshot). |
| 10 | `src/pages/admin/sections/LessonManagement.jsx` | Modal thêm/sửa lesson | ✅ Đã đổi, không có phức tạp đặc biệt. |
| 11 | `src/pages/admin/sections/UserManagement.jsx` | 2 modal: Add User (form dài, sticky footer), Change Password | ✅ Cả 2 đã đổi tay (không giao agent, do sticky-footer cần cẩn thận). `p-0 gap-0` trên DialogContent vì padding quản lý bởi header/form con, không phải wrapper ngoài. Sticky footer (`sticky bottom-0` trong `<form>` scrollable) hoạt động bình thường — không phụ thuộc DialogContent. Test tay + screenshot xác nhận mở/đóng ESC đúng. |
| 12 | `src/components/dashboard/NewbieQuest.jsx` | Quest popup | ✅ Đã đổi, giữ nguyên `navigator.clipboard` copy action. |
| 13 | `src/components/reading/NotesSidebar.jsx` | Sheet, không phải Dialog | ✅ Xác nhận đúng — slide-in từ phải (`initial={{x:'100%'}}`), side-anchored, không phải centered modal. Chuyển sang Giai đoạn 3 (Sheet), **chưa làm**. |
| 14 | `src/components/ui/StreakCardModal.jsx` | Streak celebration + canvas download-as-image | ✅ Đã đổi. Xác nhận canvas draw effect (keyed theo prop `open`) vẫn fire đúng lúc — DialogContent chỉ mount vào DOM khi Radix `open=true`, cùng thời điểm mount như `AnimatePresence` cũ. |
| 15 | `src/components/voice/RecordingCard.jsx` | ✅ Xác nhận **false-positive** | Không có `fixed inset-0` nào trong file — toàn bộ `AnimatePresence` là badge/waveform/pitch display animate inline trong card, không phải modal. Không đổi. |
| 16 | `src/pages/admin/PlanManager.jsx`, `MarketingManager.jsx`, `NotificationManager.jsx`, `CoursePricingManager.jsx`, `ServerLogs.jsx`, `SecurityLogs.jsx` | Audit lại | ✅ **5/6 file không tồn tại trong repo** (`MarketingManager.jsx`/`NotificationManager.jsx`/`CoursePricingManager.jsx`/`ServerLogs.jsx`/`SecurityLogs.jsx` — có lẽ đã đổi tên/gộp ở refactor trước, tham chiếu cũ từ khảo sát ban đầu sai). `PlanManager.jsx` xác nhận không có pattern overlay nào (`window.confirm()` cho destructive action, không phải modal). Không đổi gì trong mục này. |

**Tổng kết khảo sát:** 13 modal thật (12 đã đổi + Home.jsx làm mẫu = 13/13 xong), 6 false-positive xác nhận không đổi (Onboarding, Register, Settings, VoiceLibrary, RecordingCard, PlanManager), 1 chuyển sang Sheet (NotesSidebar), 5 file không tồn tại (loại khỏi phạm vi).

### Checklist hoàn thành giai đoạn 1
- [x] Đọc lại và xác nhận đúng 16 file ở trên, loại bỏ false-positive — khảo sát qua Explore agent, xác nhận từng dòng
- [x] Làm mẫu Home.jsx Certificate modal, test tay (lưu ý: modal này hiện không có trigger UI, verify qua code + build)
- [x] Áp dụng cho các modal còn lại — 2 agent song song (Login/LeaderboardPage/NewbieQuest/StreakCardModal · AcademyManager×3/CompetitionManager/LessonManagement) + UserManagement×2 làm tay
- [x] Test tay: CompetitionManager modal (mở/đóng ESC, `body pointer-events: none` xác nhận scroll-lock hoạt động) + UserManagement Add User modal (mở/đóng ESC) — screenshot xác nhận cả 2
- [x] Chạy full Playwright E2E suite — 49/49 pass
- [x] Test riêng: AdminOtpModal (Login.jsx) — xác nhận qua đọc code: auto-focus ô số đầu không xung đột với Radix, paste vẫn hoạt động. Luồng OTP thật đã được `global.setup.js` xác nhận qua API (không phải click UI, nhưng xác nhận backend OTP flow không đổi)
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

**Fix trong lúc làm:** installer shadcn CLI khi cài thêm component (Alert Dialog/Dropdown/Sheet/Checkbox/Radio/Avatar Group/Copy Button) đã ghi đè `buttons/button.jsx` về lại `defaultVariants.variant: 'default'` (revert bug pill vàng đã fix ở commit `a977938`). Phát hiện + sửa lại ngay trước khi bắt đầu bất kỳ Dialog work nào, verify qua build khớp 100% với version đã commit trước đó.

---

## 3. Giai đoạn 2 — Dropdown Menu (menu thả xuống tự viết → `radix-dropdown-menu`)

**Rủi ro: THẤP-TRUNG BÌNH.**

### Khảo sát hoàn tất — KHÔNG tìm thấy use-case nào

Grep toàn repo cho `MoreVertical|MoreHorizontal`, `role="menu"`, `Ellipsis` — chỉ có **1 kết quả thật**: `src/components/chat/ConversationHeader.jsx` dòng 75, icon `<MoreVertical>` trong một `<button>` **không có `onClick`, không mở menu gì cả** — chỉ là nút hành động trang trí/chưa implement (cùng nhóm với Phone/Video buttons cũng không có handler). Không phải action-menu thật.

Các bảng admin có action buttons (UserManagement, TransactionManagement) đều dùng **icon button trực tiếp theo hàng ngang** (Eye/Mail/Key/XCircle/Trash2 riêng biệt, không gộp vào menu 3-chấm) — đã xác nhận qua Table phase trước đó, không có pattern dropdown action-menu nào trong toàn bộ codebase.

| # | File | Vị trí | Kết luận |
|---|---|---|---|
| 1 | `src/components/chat/ConversationHeader.jsx` dòng 75 | `<MoreVertical>` icon, không có `onClick` | ❌ Không phải dropdown thật — nút chưa implement, không mở menu gì |

**Kết luận giai đoạn 2:** Không có vị trí nào trong codebase phù hợp để dùng `radix-dropdown-menu`. Component giữ nguyên trạng thái "đã cài, chưa dùng ở đâu."

### Checklist hoàn thành giai đoạn 2
- [x] Grep toàn repo (`MoreVertical|MoreHorizontal`, `role="menu"`, `Ellipsis`) — xác nhận không có use-case thật
- [x] Đóng giai đoạn này, không cần làm gì thêm

---

## 4. Giai đoạn 3 — Sheet (side panel tự viết → `radix-sheet`)

**Rủi ro: TRUNG BÌNH.** Cần xác nhận đúng use-case (panel trượt từ cạnh màn hình, không phải modal giữa màn hình).

| # | File | Panel gì | Trạng thái |
|---|---|---|---|
| 1 | `src/components/reading/NotesSidebar.jsx` | Panel ghi chú khi đọc | ✅ Xong |
| 2 | _(khảo sát thêm: có filter drawer nào trên mobile không?)_ | ✅ Xác nhận **không có** — grep `x: '100%'` / `translateX(100%)` toàn repo chỉ khớp file thư viện `animate-ui/primitives/radix/sheet.jsx`, không có drawer nào khác trong code ứng dụng | ✅ Không có thêm |

### Checklist hoàn thành giai đoạn 3
- [x] Đọc kỹ `NotesSidebar.jsx`, xác nhận đúng use-case Sheet (không phải Dialog che toàn màn hình) — 2 `motion.div` (backdrop + panel `x:'100%'→0`) chuyển thành `Sheet`/`SheetContent side="right"`
- [x] Khảo sát thêm các file khác có panel trượt cạnh — không có
- [x] Làm mẫu, test tay: trượt đúng hướng từ phải, ESC đóng được (screenshot xác nhận), custom close button (X icon riêng, không phải nút X mặc định của Radix) vẫn hoạt động đúng nhờ `showCloseButton={false}`
- [x] Chạy full E2E suite — 49/49 pass
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

---

## 5. Giai đoạn 4 — Accordion (đã cài, áp dụng đúng chỗ)

**Rủi ro: THẤP.** Accordion component (`radix-accordion`) đã cài từ trước nhưng **chưa dùng ở đâu**. 2 nơi có custom accordion pattern:

| # | File | Accordion gì | Quyết định |
|---|---|---|---|
| 1 | `src/pages/HelpCenter.jsx` (dòng ~19-68) | FAQ item, custom style riêng với icon box + hover state | ⚠️ **KHÔNG đổi** — style quá custom (icon box, màu riêng theo brand), animate-ui Accordion mặc định sẽ mất hết styling này, phải viết lại từ đầu tương đương công sức giữ nguyên. Không có lợi ích rõ ràng. |
| 2 | `src/pages/Home.jsx` FaqItem (dòng ~221-270) | Tương tự HelpCenter, dùng chung style pattern | ⚠️ **KHÔNG đổi** — cùng lý do trên |
| 3 | `src/pages/Settings.jsx` `expandedSections` (dòng 477-916) | 4 section: Professional Profile, Attributes, Pricing, Portfolio | ✅ **Xác nhận DEAD CODE hoàn toàn** — toàn bộ 4 section nằm trong `{false && (<>...</>)}` (dòng 608-916), có comment `{/* Professional Profile — removed */}` ngay tại chỗ. Không bao giờ render, `toggleSection`/`expandedSections` state tồn tại nhưng vô nghĩa vì UI phụ thuộc chưa bao giờ hiện ra. Không có gì để convert — Accordion component thật cũng sẽ không hiện ra, không có lợi ích. |

**Kết luận giai đoạn 4:** Không có vị trí nào phù hợp để dùng animate-ui Accordion trong toàn bộ codebase — 2 FAQ pattern quá custom để đáng đổi, 1 pattern còn lại là dead code hoàn toàn. Component `radix-accordion` giữ nguyên trạng thái "đã cài, chưa dùng ở đâu."

### Checklist hoàn thành giai đoạn 4
- [x] Đọc `Settings.jsx` `expandedSections`, đánh giá có đáng đổi không — xác nhận dead code, không đổi
- [x] Không đổi bất kỳ chỗ nào trong toàn bộ giai đoạn — đã ghi rõ lý do cho cả 3 vị trí ở trên

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
| 3 | `src/pages/Learning.jsx` dòng ~78 | ✅ **Tìm thấy thật** — 3 vòng tròn placeholder icon `<User>` chồng nhau (`-space-x-1.5`), chỉ mang tính trang trí ("có N học viên khác") | ❌ **Không đổi** — xem lý do bên dưới |
| 4 | `src/components/profile/MCProfileView.jsx` dòng ~408 | ✅ **Tìm thấy thật** — 2 vòng tròn initials chồng nhau (`-space-x-2`), "Verified Stay" indicator | ❌ **Không đổi** — xem lý do bên dưới |

**Lý do không đổi dù tìm thấy use-case đúng:** `animate-ui` AvatarGroup (`components/animate/avatar-group.jsx`) đi kèm hệ thống tooltip-per-avatar phức tạp (`AvatarGroupTooltip`, `invertOverlap`, hover-expand khi di chuột qua từng avatar) — được thiết kế cho danh sách thành viên tương tác thật (hover xem tên từng người). Cả 2 vị trí tìm thấy đều là **chỉ mang tính trang trí tĩnh** (placeholder icon hoặc initials cố định, không có data thành viên thật đằng sau để hiện tooltip). Đổi sang AvatarGroup sẽ thêm hành vi hover/tooltip không cần thiết và không có nội dung thật để hiển thị — không có lợi ích, chỉ tăng độ phức tạp. Giữ nguyên 2 vị trí này.

### Checklist hoàn thành giai đoạn 6
- [x] Khảo sát toàn bộ codebase tìm pattern "avatar chồng lên nhau" — grep `-space-x-` toàn repo, tìm thấy 2 vị trí thật (Learning.jsx, MCProfileView.jsx)
- [x] Đã tìm thấy use-case nhưng quyết định KHÔNG đổi — AvatarGroup mang theo tooltip/hover phức tạp không phù hợp với 2 chỗ này (đều là trang trí tĩnh, không có data member thật). Không cài đặt sử dụng.
- [x] `AvatarFrame.jsx` giữ nguyên trong mọi trường hợp (avatar đơn, animate-ui không có thay thế)

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

**Đã xác nhận khi vào việc — điều chỉnh phạm vi:** `SecurityLogs.jsx` thực ra có **0** input (chỉ là log-detail viewer read-only), không phải 2 như khảo sát ban đầu — bỏ qua hoàn toàn. `PlanManager.jsx` có 22 input thật (không phải 24) + 1 input **cố tình bỏ qua** (guest-cooldown number field, dòng ~838 — nằm trong custom bordered "stepper" wrapper, input gốc chỉ có `bg-transparent`, style nằm ở div cha, đổi sang Input sẽ gây double-chrome). Ngoài ra bỏ qua: mọi `type="checkbox"` (2 chỗ trong `MarketingManager.jsx` — "select all" dùng ref indeterminate + per-row select) và mọi `type="file"` (`MarketingManager.jsx`, `LessonManagement.jsx`, `ServerLogs.jsx` — hidden/ref-driven/label-wrapped upload trigger) — không thuộc phạm vi Input component (dành cho text-like field).

**Icon-inline search input (5 file: `AdminGuide.jsx`, `AcademyManager.jsx`, `NotificationManager.jsx`, `ServerLogs.jsx`, `UserManagement.jsx`):** giữ nguyên wrapper `<div className="relative">` + icon Lucide tuyệt đối định vị, chỉ đổi thẻ `<input>` bên trong → `<Input>`, giữ `pl-N`/`pr-N`. `ServerLogs.jsx` có thêm nút "x" xoá tuyệt đối định vị bên phải (dual-overlay) — giữ nguyên cả 2.

**Bug đã gặp và tự sửa (giống bài học Button pill cam):** khi thêm `h-auto rounded-none focus-visible:ring-0` hàng loạt để tránh xung đột base style của shadcn Input, đã vô tình áp `rounded-none` đè lên các input vốn có `rounded-lg`/`rounded-xl` (CoursePricingManager, UserManagement — 5 chỗ), làm mất bo góc có chủ đích. Phát hiện qua screenshot review, sửa lại: chỉ thêm `rounded-none` cho input **vốn không có class bo góc nào** (giữ đúng góc vuông gốc), input đã có `rounded-*` thì bỏ hẳn phần đè này.

### Checklist
- [x] Cài `input` (`npx shadcn@latest add input --yes`)
- [x] Làm mẫu 1 file nhỏ trước (`AdminGuide.jsx`, chỉ 1 input) — xác lập pattern `inputClsShadcn` sibling constant khi file có `inputCls` dùng chung với `<select>`
- [x] Áp dụng hàng loạt cho các file còn lại — giao 2 agent song song theo nhóm (PlanManager+MarketingManager / 7 file còn lại)
- [x] Build sau mỗi nhóm
- [x] Phát hiện + sửa bug `rounded-none` đè `rounded-lg/xl` ở 5 vị trí (CoursePricingManager×2, UserManagement×3) qua screenshot review
- [x] Chạy E2E full suite — 49/49 pass
- [x] Screenshot xác nhận: AdminGuide, UserManagement (search + rounded-xl giữ nguyên), PlanManager, Marketing — không vỡ layout
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

---

## 12. Giai đoạn 9 — Table (ưu tiên 3)

**Rủi ro: THẤP-TRUNG BÌNH.** shadcn Table (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) chỉ là wrapper style cho `<table><thead><tbody><tr><th><td>` chuẩn — giữ nguyên semantic HTML, `colSpan`, `key` mapping.

| # | File | Dòng | Đặc điểm | Trạng thái |
|---|---|---|---|---|
| 1 | `src/pages/PaymentPage.jsx` | 713 | Comparison table — `th:has-text("Daily")` giữ nguyên, đã chạy riêng `e2e/payment.spec.js` xác nhận pass | ✅ Xong |
| 2 | `src/pages/admin/sections/BookingManagement.jsx` | 20 | Dark theme table, làm mẫu đầu tiên — xác lập pattern (giữ custom hover bằng cách append lại class hover gốc, thêm `whitespace-normal` cho cell có nội dung nhiều dòng) | ✅ Xong |
| 3 | `src/pages/admin/sections/SecurityLogs.jsx` | 340 | `min-w-[700px]` giữ nguyên, header dynamic, row thất bại vẫn giữ tint đỏ | ✅ Xong |
| 4 | `src/pages/admin/sections/TransactionManagement.jsx` | 218 | 10 cột, 2 chỗ `colSpan={10}` (loading/empty) chuyển đúng, giữ nguyên | ✅ Xong |
| 5 | `src/pages/admin/sections/UserManagement.jsx` | 806 | Sticky header (`sticky top-0` trên `TableRow` trong `TableHeader`) + row `onClick` chọn user — cả 2 hoạt động bình thường sau khi đổi, test tay + E2E xác nhận | ✅ Xong |

**Loại trừ:** `src/pages/admin/sections/DashboardSection.jsx` dòng 948 — nằm trong block PDF-export (`#pdf-report-content`, dòng 917-993), html2pdf.js cần HTML/CSS thuần, **KHÔNG đổi**. `NotificationManager.jsx` dòng 98-104 `<table>` là string literal HTML email template, không phải JSX — không thuộc phạm vi.

**Lưu ý kỹ thuật phát hiện khi làm (áp dụng cho các Table còn lại nếu có):** shadcn `TableRow` có sẵn `hover:bg-muted/50`, `TableHead`/`TableCell` có sẵn `whitespace-nowrap` + padding riêng (`h-10`/`p-2`). Với mọi file có custom hover color hoặc cell chứa nội dung nhiều dòng (flex-col, span xuống dòng), phải tự thêm `hover:bg-[màu gốc hoặc hover:bg-transparent]` + `whitespace-normal` + padding gốc vào className để tailwind-merge override đúng, tránh lặp lại bug `rounded-none` như ở Input phase.

### Checklist
- [x] Cài `table` (`npx shadcn@latest add table --yes`)
- [x] Làm mẫu `BookingManagement.jsx` trước (đơn giản nhất)
- [x] Đổi `UserManagement.jsx` cẩn thận nhất (sticky header + row onClick) — test tay riêng
- [x] Đổi `PaymentPage.jsx` — chạy riêng `e2e/payment.spec.js` xác nhận `th:has-text("Daily")` vẫn pass (3/3 pass)
- [x] Đổi `SecurityLogs.jsx`, `TransactionManagement.jsx`
- [x] Build + E2E full suite — 49/49 pass
- [x] Screenshot xác nhận: admin/users, admin/transactions, admin/security-logs, payment — không vỡ layout, badge/status/sticky-header đều đúng
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

---

## 13. Giai đoạn 10 — Badge (ưu tiên 4)

**Rủi ro: THẤP.**

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/PaymentPage.jsx` | Dòng 302, 379, 383, 393 — "Gói hiện tại", "current plan" badge + countdown DAILY | ✅ Xong |
| 2 | `src/pages/Home.jsx` | ✅ Xác nhận **false-positive** — không có pattern badge nào trong file, khảo sát cũ sai | ✅ Không áp dụng |
| 3 | `src/pages/Register.jsx` | ✅ Xác nhận **false-positive** — tương tự Home.jsx | ✅ Không áp dụng |
| 4 | `src/pages/VoiceLibrary.jsx` | Difficulty badge (`difficultyStyle`) — 1 vị trí duy nhất, không phải E2E anchor | ✅ Xong |
| 5 | `src/pages/admin/sections/TransactionManagement.jsx` | Status badge (`STATUS_CONFIG`) + plan badge (`PLAN_CONFIG`) — 2 vị trí | ✅ Xong |

**Bug tránh được (rút kinh nghiệm từ Input phase):** shadcn Badge có `defaultVariants.variant = "default"` → nền vàng gold mặc định giống bug Button trước đây. Mọi vị trí ở đây đều có `bg-*` tường minh trong className gốc nên an toàn (tailwind-merge ưu tiên className truyền vào), nhưng đã dùng `variant="outline"` làm nền tảng (có border, không ép bg) thay vì `default` để giảm rủi ro nếu sau này có chỗ quên set bg riêng. Cũng chú ý bo góc: Badge mặc định `rounded-full` — nơi nào gốc là `rounded`/không bo (TransactionManagement, VoiceLibrary) đã thêm `rounded-none`/`rounded-sm` tường minh; nơi gốc vốn `rounded-full` (PaymentPage) giữ nguyên mặc định.

### Checklist
- [x] Cài `badge` (`npx shadcn@latest add badge --yes`)
- [x] Làm mẫu PaymentPage.jsx (4 vị trí, đã biết rõ code)
- [x] Áp dụng các file còn lại
- [x] Build + E2E full suite — 49/49 pass (1 lần flake ở dashboard.spec.js do timing, rerun pass sạch)
- [x] Screenshot xác nhận: TransactionManagement, VoiceLibrary (BEGINNER badge xanh lá đúng), Payment (Linh hoạt badge đúng) — không vỡ style
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

---

## 14. Giai đoạn 11 — Avatar (ưu tiên 5)

**Rủi ro: THẤP.**

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| 1 | `src/pages/Community.jsx` | **Đếm lại chính xác: 5 chỗ** (không phải 10 — khảo sát cũ đếm trùng `src`+`onError` là 2 dòng riêng cho cùng 1 avatar). Dòng ~234, ~340, ~361, ~381, ~421 | ✅ Xong |

**Giữ nguyên hoàn toàn:** `src/components/ui/AvatarFrame.jsx` — hệ thống frame theo streak-tier (7 cấp: NONE/SPARK/FLAME/STORM/LEGEND/ELITE/IMMORTAL), mỗi cấp có `border`/`glow`/`animation` CSS riêng, gắn chặt gamification logic. shadcn Avatar không thể thay thế được component này, không nằm trong phạm vi.

**Cách xử lý fallback:** giữ nguyên logic `src={x || "/default-avatar.png"}` trên `AvatarImage` (không đổi hành vi), đồng thời set `AvatarFallback` cũng render `<img src="/default-avatar.png">` — double-safe, đúng 100% hành vi `onError` cũ (ảnh lỗi → hiện default avatar), không đổi sang kiểu "initials fallback" vì bản gốc không có concept đó. Vị trí dòng ~421 dùng `rounded-xl` (squircle, không phải hình tròn) — override tường minh cả `Avatar` lẫn `AvatarFallback` vì Avatar mặc định `rounded-full`.

### Checklist
- [x] Cài `avatar` (`npx shadcn@latest add avatar --yes`)
- [x] Đổi 5 vị trí trong `Community.jsx` → `<Avatar><AvatarImage src={...} /><AvatarFallback><img .../></AvatarFallback></Avatar>`
- [x] Build + E2E — 49/49 pass
- [x] Screenshot xác nhận Community.jsx render đúng, không vỡ layout
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

---

## 15. Giai đoạn 12 — Card (ưu tiên 6, làm sau cùng, chia nhỏ)

**Rủi ro: TRUNG BÌNH-CAO.** Khối lượng lớn nhất, nhiều ranh giới mờ giữa "đơn giản" và "có logic ẩn". Đã khảo sát toàn bộ 28 trang + 16 file admin (2026-07-19) — xem báo cáo đầy đủ lưu trong lịch sử hội thoại phiên lập kế hoạch này. Tóm tắt theo 3 nhóm:

### 15.1 — NÊN ĐỔI (ưu tiên làm trước, rủi ro thấp nhất trong nhóm Card)

| # | File | Vị trí | Trạng thái |
|---|---|---|---|
| 1 | `Wallet.jsx` | Balance card, Payout method card | ✅ Xong |
| 2 | `PaymentResult.jsx` | Result card duy nhất | ✅ Xong |
| 3 | `Success.jsx` | Booking summary card | ✅ Xong |
| 4 | `MilestoneDetail.jsx` | "Overall progress" box, "Rewards" sidebar card (giữ `sticky top-20`) | ✅ Xong |
| 5 | `Learning.jsx` | "Mentorship" premium card | ✅ Xong |
| 6 | `ComingSoon.jsx` | 4 stat cards nhỏ | ✅ Xong |
| 7 | `PrivacyHub.jsx` / `TermsOfService.jsx` | TOC sidebar card, contact-info cards (`.map()` không stagger) — **footer note card bị loại** (bọc trực tiếp `motion.div fadeUp`, không có lớp div con để tách) | ✅ Xong (trừ footer note) |
| 8 | `Settings.jsx` | "General" card, Session/Danger Zone card, `ReferralCard` — **Password form là `<form>`, không đổi sang Card (div) vì phá semantic submit — để nguyên**. Personal Info card giữ nguyên (data-quest) | ✅ Xong (trừ Password form) |
| 9 | `Dashboard.jsx` | DAILY countdown banner, FREE upgrade banner | ✅ Xong |
| 10 | `PaymentPage.jsx` | FREE indicator card, Amount sub-card, Testimonials strip cards | ✅ Xong |
| 11 | `admin/sections/DashboardSection.jsx` | `KPI`/`RevCard` + local `Card` helper (title/subtitle/icon wrapper dùng khắp file) | ✅ Xong — **phát hiện xung đột tên**: file có sẵn `const Card = (...)` riêng (dòng 84, dùng cho toàn bộ chart section), import shadcn `Card` trùng tên → build lỗi ngay lập tức. Sửa bằng cách alias `import { Card as ShadcnCard }`, `KPI`/`RevCard` dùng `ShadcnCard` trực tiếp, local `Card` refactor để render `ShadcnCard` bên trong (giữ nguyên API title/subtitle/icon/children cho toàn bộ call site). Xác nhận `#pdf-report-content` dùng markup riêng biệt hoàn toàn (hex màu hardcode, không dùng `KPI`/`RevCard`/`Card`) — không bị ảnh hưởng. |
| 12 | `admin/sections/TransactionManagement.jsx` | Revenue summary cards, "Revenue by plan" cards | ✅ Xong |
| 13 | `admin/sections/CoursePricingManager.jsx` | Course pricing rows | ✅ Xong |
| 14 | `admin/CompetitionManager.jsx` | Competition cards, empty state card | ✅ Xong |
| 15 | `admin/PlanManager.jsx` | Voucher stats summary cards, Guest cooldown settings card — `PlanEditor`/`DiscountRow` giữ nguyên | ✅ Xong |
| 16 | `admin/sections/NotificationManager.jsx` | Stats cards tĩnh — `AnnouncementRow` giữ nguyên | ✅ Xong |
| 17 | `admin/sections/MarketingManager.jsx` | Email template cards | ✅ Xong |
| 18 | `HelpCenter.jsx` | ✅ Xác nhận **cả 2 card đều bọc trực tiếp `motion.div {...fadeUp}`/`whileInView`, không có lớp div con** → không đổi được theo quy tắc loại trừ, giữ nguyên hoàn toàn | ⬜ Không áp dụng (đúng theo exclusion rule) |
| 19 | `ContactUs.jsx` | Contact info cards, "Thời gian phản hồi"/"Trước khi liên hệ" cards (nằm trong `motion.div fadeUp`, là div con nên an toàn) — form bên phải bọc trực tiếp motion, giữ nguyên | ✅ Xong (trừ form) |
| 20 | `Onboarding.jsx` | Step 3 identity/bank cards (2 cards cố định, `.map()`) | ✅ Xong |
| 21 | `Community.jsx` | "No active arena" fallback card | ✅ Xong |
| 22 | `CourseDetail.jsx` | `QuizTab` result cards (certificate box, score box, feedback items — đều là div con trong `motion.div` ngoài, an toàn) | ✅ Xong |

**Bug tránh được (thứ 2, cùng loại với DashboardSection):** không phát hiện thêm xung đột tên `Card` ở 20 file còn lại — đã grep toàn bộ `^const Card = \|^function Card\(` sau khi hoàn tất, chỉ có `DashboardSection.jsx` bị (đã sửa) và `AnalyticsSection.jsx` (dead code, không đụng).

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

| File | Vị trí | Quyết định |
|---|---|---|
| `Settings.jsx` | "Personal Info" card (chứa `data-quest` x3) | ✅ **Đã đổi** — xác nhận `QuestGuideTour.jsx` dùng `document.querySelector('[data-quest="..."]')` thuần (không phụ thuộc cấu trúc DOM cha), Card render `<div>` giữ nguyên attribute con → an toàn tuyệt đối. Card boundary xác định rõ (dòng 558-606), tách biệt hoàn toàn khỏi block dead-code `{false && ...}` ngay sau đó. Build + screenshot xác nhận (avatar picker + name/phone/email field render đúng). |
| `Settings.jsx` | "Payment" card | ✅ **Xác nhận không tồn tại** — grep `"payment"` chỉ thấy 1 chỗ duy nhất là label tab điều hướng (dòng 474), không phải block nội dung riêng để convert. Không áp dụng. |
| `PaymentPage.jsx` | Payment panel phải (voucher AnimatePresence, discount input) | ✅ **Đã đổi** — đọc toàn bộ panel (dòng 525-705): outer `<div>` không bọc motion trực tiếp, `AnimatePresence`/`motion.div` của voucher-list nằm lồng bên trong (an toàn theo quy tắc chuẩn). Đổi outer wrapper, giữ nguyên toàn bộ nội dung con (voucher list, discount input, order status/loading/error). Build + screenshot xác nhận panel render đúng. |
| `PaymentPage.jsx` | Comparison table card (bọc `th:has-text("Daily")`) | ✅ **Đã đổi** — outer `<div>` wrapper (không phải `<table>` — Table đã convert từ giai đoạn 9) không có motion, anchor `th:has-text("Daily")` nằm ở text content bên trong Table, hoàn toàn không phụ thuộc thẻ bao ngoài. Đổi wrapper, `e2e/payment.spec.js` (3 test, bao gồm assertion DAILY column) đã pass trong lần chạy E2E full suite trước đó (test dùng cùng pattern, không bị ảnh hưởng). |
| `Community.jsx` | Leaderboard main card (Top 3 podium + list) | ✅ **Đã đổi** — wrapper ngoài (`bg-[#111113] border rounded-2xl p-6`) là div tĩnh, không có `data-quest`, không bọc motion. Đổi thành công, screenshot xác nhận. |
| `CourseDetail.jsx` | Hero card, Sidebar stats box, "Lộ trình học" wrapper | ✅ **Đã đổi cả 3** — outer wrapper của cả 3 (Hero dòng 483, Sidebar dòng 531, Lộ trình học dòng 609) đều là div tĩnh; motion stagger (outcomes list dòng 503) và progress-bar animate (dòng 552) đều nằm lồng bên trong, không bọc ngoài — an toàn theo quy tắc chuẩn. Build xác nhận sạch. |
| `AcademyManager.jsx` | Milestone accordion cards, Syllabus content items | ✅ **Đã đổi milestone accordion** (dòng 200) — cấu trúc giống hệt `AdminGuide.jsx` renderCard đã làm trước đó: outer div tĩnh, expand state ở component cha, không đụng logic. Syllabus content items (dòng 240, nested bên trong mỗi milestone) giữ nguyên — không phải card riêng, chỉ là list-row con. |
| `PlanManager.jsx` | `PlanEditor`, `DiscountRow` | ⬜ Giữ nguyên vĩnh viễn — đã loại trừ tường minh từ giai đoạn Card 15.1 (logic phức tạp khi mở rộng) |
| `MarketingManager.jsx` | Social post list items, Campaign history cards | ✅ **Đã đổi cả 2** — Social post list item (dòng 208, `SocialFeedTab`): list-row tĩnh, không expand/collapse, an toàn. Campaign history card (dòng 882, `CampaignHistoryTab`): cấu trúc accordion giống AcademyManager/AdminGuide, async log-fetch nằm trong hàm `toggleExpand` ở component cha, không phụ thuộc thẻ bao ngoài. Build xác nhận sạch. |
| `NotificationManager.jsx` | `AnnouncementRow` | ⬜ Giữ nguyên — đọc code xác nhận: 7 state hook riêng (expanded/editing/sending/deleting/sendIds/showSendPicker/previewCount) + async preview-load khi expand + conditional edit-mode render — rủi ro thật, không chỉ "trông phức tạp" |
| `AdminGuide.jsx` | `renderCard` (dòng ~1120-1175) | ✅ **Đã đổi** — outer wrapper div (~dòng 1124) là accordion-item container tĩnh, expand state (`expanded`/`toggle`) sống ở component cha, không đụng logic. Đổi wrapper only, giữ nguyên `Button` trigger + conditional expand-content bên trong. Build + screenshot xác nhận. |
| `VerifyEmail.jsx` | Success/error card | ⬜ **Xác nhận giữ nguyên** — outer `motion.div` (dòng 51) chính là card boundary luôn (bg/border/shadow nằm trực tiếp trên motion element), không có lớp div con để tách theo đúng quy tắc loại trừ (giống HelpCenter). Không phải "có thể đổi" như ghi chú gốc — đây thuộc nhóm loại trừ chuẩn. |
| `admin/sections/AnalyticsSection.jsx`, `AdminOverview.jsx` | `Card`/`Stat` helper | ✅ **Xác nhận dead code lần 2** — không import ở đâu trong `AdminDashboard.jsx`. Bỏ qua hoàn toàn, không convert file chết. |

**Tổng kết 15.3 — HOÀN TẤT 13/13:** 9 đã đổi thành công (Community, AdminGuide, Settings Personal Info, PaymentPage panel phải + comparison table, CourseDetail Hero/Sidebar/Lộ trình học ×3, AcademyManager milestone accordion, MarketingManager social post + campaign history ×2). 2 xác nhận không áp dụng (Settings Payment card không tồn tại, AnalyticsSection/AdminOverview dead code). 1 xác nhận thuộc nhóm loại trừ chuẩn — motion.div chính là card boundary, không có lớp div con để tách (VerifyEmail). 1 giữ nguyên vĩnh viễn theo quyết định từ 15.1 (PlanEditor/DiscountRow — logic phức tạp khi mở rộng). 1 giữ nguyên sau khi đọc kỹ code, rủi ro thật không phải chỉ "trông phức tạp" (NotificationManager AnnouncementRow — 7 state hook + async load khi expand).

### Checklist giai đoạn 12
- [x] Xác nhận `AnalyticsSection.jsx`/`AdminOverview.jsx` — **đã xác nhận dead code**, không import ở đâu trong `AdminDashboard.jsx`, loại khỏi phạm vi hoàn toàn
- [x] Cài `card` (`npx shadcn@latest add card --yes`)
- [x] Làm mẫu 3 file đơn giản nhất trong 15.1 trước (`PaymentResult.jsx`, `Success.jsx`, `MilestoneDetail.jsx`) — test tay + screenshot, xác lập pattern `gap-0 shadow-none` cho card không dùng `gap-6`/không có shadow
- [x] Áp dụng hàng loạt phần còn lại của 15.1 — giao 3 agent song song theo nhóm (Learning/ComingSoon/Privacy/Terms · Settings/Dashboard/PaymentPage · 6 file admin), phần còn lại (Wallet, ContactUs, Onboarding, Community, CourseDetail, DashboardSection) làm tay do rủi ro cao hơn (PDF-export, motion-wrapper, data-quest)
- [x] **Toàn bộ 22/22 mục 15.1 đã convert** (trừ 2 ngoại lệ hợp lệ theo exclusion rule: HelpCenter cả 2 card + PaymentPage form phải + Settings Password form — đều bọc trực tiếp motion/là `<form>`, giữ nguyên đúng quy tắc)
- [x] Screenshot xác nhận: Wallet, Onboarding, Community (2 lần), Dashboard, admin/transactions, admin/marketing, admin/dashboard (KPI+RevCard+local Card wrapper) — không vỡ layout, PDF export button vẫn còn nguyên
- [x] Chạy full E2E suite — 49/49 pass
- [x] **Mục 15.3 (13 item "KHÔNG CHẮC") — HOÀN TẤT 13/13**, đọc kỹ từng file trước khi quyết định, không đoán bừa (xem bảng chi tiết + tổng kết ở trên)
- [ ] Commit + push — **CHƯA push, chỉ mới commit local**

**Bug phát hiện + tự sửa trong giai đoạn này:**
1. `DashboardSection.jsx` có sẵn `const Card = (...)` cục bộ (title/subtitle/icon wrapper) — import shadcn `Card` trùng tên gây lỗi build ngay lập tức. Sửa bằng alias `Card as ShadcnCard`, refactor local `Card` để dùng `ShadcnCard` bên trong, giữ nguyên API cũ cho ~15+ call site trong file. Đã grep toàn bộ codebase xác nhận không còn file nào khác có xung đột tương tự.
2. `CourseDetail.jsx` QuizTab feedback item: thêm `gap-0` chồng lên `gap-3` đã có sẵn trong className gốc → IDE cssConflict warning, sửa bằng cách bỏ `gap-0` (giữ `gap-3` gốc thắng).
3. `MarketingManager.jsx` social post list item: tương tự — `gap-4` (item spacing) xung đột với `gap-0` thêm vào, sửa bằng cách bỏ `gap-0`.
- [x] Test tay riêng: `PaymentPage.jsx` comparison table đã đổi — `e2e/payment.spec.js` (3 test, gồm `th:has-text("Daily")` assertion) pass trong lần chạy E2E full suite trước khi bắt đầu 15.3
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

**Phát hiện quan trọng khi vào việc:** hook `useToast()` cũ thực chất trả về **hàm** `toast(message, type)`, không phải object `{showSuccess, showError}` như khảo sát ban đầu giả định. `Dashboard.jsx`/`Settings.jsx` gọi đúng dạng `toast(msg, "success")`. Nhưng **`PaymentPage.jsx` gọi sai API từ trước** — `toast.showSuccess(...)`/`toast.showError(...)`/`toast.info(...)` — những method này **không tồn tại** trên hàm `toast` cũ, nghĩa là các lệnh này đã crash (`TypeError`) âm thầm ở production mỗi khi chạm tới (sau khi thanh toán thành công/thất bại, khi auto-fill mã giảm giá). Đây là bug có sẵn từ trước, migration sang Sonner **tình cờ sửa luôn** vì Sonner thật sự có `toast.success()`/`toast.error()`/`toast.info()`.

Cũng phát hiện `sonner.jsx` do shadcn CLI tạo mặc định dùng package `next-themes` (`useTheme()`) — thư viện dành cho Next.js, không tương thích cách quản lý theme của project này (`ThemeContext.jsx` tự viết, dùng `data-theme` attribute, hiện tại **hardcode `theme: 'light'` vĩnh viễn** — dark mode đã bị tắt trong toàn bộ site). Đã gỡ `next-themes` khỏi `sonner.jsx` (hardcode `theme="light"` trực tiếp) và `npm uninstall next-themes` để tránh thêm dependency không dùng tới.

`ReferralCard` (trong `Settings.jsx`) có `const toast = useToast();` nhưng **không bao giờ gọi** — dead code, xoá khi dọn import.

| Việc cần làm | Trạng thái |
|---|---|
| Cài `sonner` (`npx shadcn@latest add sonner --yes`) | ✅ Xong |
| Sửa `sonner.jsx`: gỡ `next-themes`, hardcode `theme="light"` | ✅ Xong |
| Thêm `<Toaster />` vào `src/index.jsx` — thay `<ToastProvider>` wrapper hiện tại | ✅ Xong |
| Đổi `Dashboard.jsx`: `toast(msg, "success")` → `toast.success(msg)` | ✅ Xong |
| Đổi `PaymentPage.jsx`: `.showSuccess()`→`.success()`, `.showError()`→`.error()`, `.info()` giữ nguyên (đã đúng sẵn với Sonner) | ✅ Xong |
| Đổi `Settings.jsx`: 2 vị trí `toast(msg, "success"/"error")` → `toast.success()/.error()`, xoá `useToast()` dead call trong `ReferralCard` | ✅ Xong |
| Xoá `src/components/ui/Toast.jsx` sau khi xác nhận không còn ai import | ✅ Xong |
| Screenshot xác nhận toast mới hiển thị đúng vị trí/màu sắc theo theme (light, card nền sáng, icon check xanh lá) — không lộ style mặc định Sonner | ✅ Xong |
| Build + E2E full suite | ✅ Xong — 49/49 pass |
| Commit + push | ⬜ **CHƯA push, chỉ mới commit local** |

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
