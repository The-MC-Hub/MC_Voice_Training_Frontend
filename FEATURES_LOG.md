# Features Log — MC Hub Voice Training

> Lịch sử toàn bộ tính năng đã phát triển, từ cũ → mới.

---

## [Sprint 0] Nền tảng ban đầu — Core Platform

### Kiến trúc hệ thống

**Backend:** `MC_Voice_Training_Backend/` — Java 21 + Spring Boot 3.3, port 5000
- 4-layer: Controller → Service → Repository → MongoDB Atlas
- MapStruct Entity ↔ DTO, Lombok @Data/@Builder
- JWT Auth, Spring Security
- Enums: `SubscriptionPlan` (FREE/BASIC/FULL/ANNUAL), `UserRole`, `LearningPathType`

**Frontend:** `MC_Voice_Training_Frontend/` — React 19 + Vite 7, port 5173
- Tailwind CSS v4, Framer Motion, React Router v7
- i18n: `react-i18next` (vi/en)
- Zustand auth store

**AI Service:** `TrainingAiSample/` — FastAPI + Python, port 8001
- Whisper STT (small model)
- `/analyze-voice` → accuracy, WPM, rhythm, feedback song ngữ
- `/generate-mc-voice` → TTS tiếng Việt

---

## [Sprint 1] AI Voice Analysis — Cải thiện thuật toán

**File:** `TrainingAiSample/main.py`

6 cải tiến thuật toán:
1. **Auto Whisper model selection** — chọn large-v3/medium/small theo VRAM
2. **Pitch analysis** (`librosa.pyin`) — đo độ biến thiên cao độ theo semitone → `expressiveness_score`
3. **WER (Word Error Rate)** via `jiwer` — đo độ chính xác phát âm tiếng Việt tonal
4. **Speech-only WPM** — trừ thời gian dừng khỏi duration trước khi tính tốc độ
5. **SNR estimation** — dùng 0.3s đầu làm noise floor, trả về dB (0-60)
6. **Vocal energy fade detection** — 5-segment RMS, phát hiện giọng tắt dần cuối câu
7. **`.env` integration** — toàn bộ threshold đọc từ env vars

---

## [Sprint 2] Dark/Light Theme — Chế độ sáng/tối

**Files:** `index.css`, `ThemeContext.jsx`, `Navbar.jsx`, `About.jsx`, nhiều trang khác

- `ThemeContext.jsx` viết lại hoàn toàn: đọc `localStorage` + `prefers-color-scheme`, set `data-theme` trên `<html>`
- `index.css`: 40+ override class Tailwind cho `[data-theme='light']`
  - `bg-[#09090b]` → `var(--bg-base)` | `text-white` → `var(--text-primary)` | etc.
- Navbar: thêm nút toggle 🌙/☀️ (Sun/Moon icon)
- Gold accent giữ nguyên ở cả 2 mode
- Persist vào `localStorage` key `mchub-theme`

---

## [Sprint 3] Deploy Production

**Frontend:** Vercel — `https://mc-voice-training.vercel.app/`
- `vercel.json` SPA rewrite rule cho React Router

**Backend:** Render (Docker) — `https://mc-voice-training-backend.onrender.com/`
- `Dockerfile` multi-stage build Java 21
- `render.yaml` với env vars mapping
- Fix CORS: `SecurityConfig.java` đọc từ `${mchub.cors.allowed-origins}` thay vì hardcode

**AI Service:** Hugging Face Spaces (CPU Basic 16GB)
- `Dockerfile` cho HF Space (port 7860, user 1000)
- `README.md` frontmatter `sdk: docker`

---

## [Sprint 4] Bug Fixes & UX

**Files:** nhiều pages

- Fix thumbnails không hiển thị (course/lesson cards)
- Fix category labels sai
- Fix Learning page trống: filter đúng `LearningPathType.MILESTONE_PATH`
- Fix CoursesList trống: API endpoint + query params
- Fix navigation avatar hiển thị text `default-avatar.png`

---

## [Sprint 5] Camera PiP + Markdown Script Reader

**File:** `VoicePractice.jsx`

- **Camera PiP overlay:** Framer Motion `AnimatePresence` — camera chuyển từ full-width block → góc dưới phải (Picture-in-Picture)
- **Markdown script reader:** Inline parser regex-based — render `**bold**`, `*italic*`, `# heading` trong phần đọc kịch bản luyện tập

---

## [Sprint 6] Subscription Plans — Gamification cơ bản

**Files:** `PaymentPage.jsx`, `PaymentController.java`, `VoiceServiceImpl.java`

- Plans: FREE / BASIC (49k/tháng) / FULL (99k/tháng) / ANNUAL (799k/năm)
- PayOS payment gateway integration
- Session limit enforcement theo plan (`aiSessionsUsed`)
- `PremiumModal.jsx` — popup upsell khi hết lượt

---

## [Sprint 7] Search & Discovery

**Files:** `VoiceLessonSearchService.java`, `VoiceLessonSearchDocument.java`, `InstantSearchResults.jsx`

- Elasticsearch 7.17 full-text search bài học
- `InstantSearchResults.jsx` — dropdown kết quả realtime khi gõ
- `VoiceLessonSearchDocument.java` — Elasticsearch document model

---

## [Sprint 8] Admin Dashboard

**Files:** `AdminDashboard.jsx`, sections: `AdminOverview`, `UserManagement`, `LessonManagement`, `TransactionManagement`, `AcademyManager`, `CompetitionManager`

- Quản lý users, bài học, giao dịch
- Thống kê tổng quan (users, revenue, sessions)
- Quản lý Academy và Competition (ComingSoon)
- `PlanManager.jsx` — quản lý gói subscription + discount codes

---

## [Sprint 9] Learning Path & Courses

**Files:** `Learning.jsx`, `MilestoneDetail.jsx`, `CoursesList.jsx`, `CourseDetail.jsx`, `ReadingView.jsx`

- Learning path 3 loại: `STRUCTURED_COURSE`, `MILESTONE_PATH`, `SELF_PACED`
- Milestone-based progression
- Course detail + lesson list
- `ReadingView.jsx` — full-screen script reader

---

## [Sprint 10] Community & Social

**Files:** `Community.jsx`, `Notifications.jsx`, `Wallet.jsx`

- Community feed (bài đăng, bình luận)
- Notifications system
- Wallet — quản lý điểm/credits

---

## [Sprint 11] Onboarding & Auth Flow

**Files:** `Onboarding.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`

- Multi-step onboarding sau đăng ký
- Auth flow đầy đủ (login/register/forgot password)
- JWT token management

---

## [Sprint 12] Dashboard Overview

**Files:** `Dashboard.jsx`, `OverviewTab.jsx`, `SessionCard.jsx`

- Stats cards: accuracy trend, session count, WPM, level progress
- Recent sessions list với `SessionCard`
- Quest / NewbieQuest system (gamification mới bắt đầu)

---

## 1. Carousel tự động — Home.jsx

**File:** `MC_Voice_Training_Frontend/src/pages/Home.jsx`

- Thêm `MOCK_LESSONS` fallback (6 bài mẫu tiếng Việt) — section luôn hiển thị dù API lỗi
- Đổi sang `fetchFeaturedLessons` (endpoint nhẹ hơn)
- Viết lại `LessonCarousel` component:
  - Auto-slide mỗi 3 giây (trái → phải, loop về đầu)
  - Nút Prev / Next
  - Hover chuột → tạm dừng auto-slide
  - Scroll mượt bằng `scrollBy({ behavior: 'smooth' })`

---

## 2. Fix Quest Guide Tour — QuestGuideTour.jsx

**File:** `MC_Voice_Training_Frontend/src/components/QuestGuideTour.jsx`

- **Lỗi cũ:** Click bất kỳ đâu trên màn hình → tooltip hướng dẫn biến mất
- **Fix:** Xóa `onClick={endGuide}` khỏi backdrop overlay div

---

## 3. Đếm voucher còn lại — PlanManager.jsx (Admin)

**File:** `MC_Voice_Training_Frontend/src/pages/admin/PlanManager.jsx`

- Hiển thị badge "còn X" cạnh mỗi voucher:
  - 🟢 Xanh: còn nhiều (< 80% đã dùng)
  - 🟡 Vàng: sắp hết (≥ 80%)
  - 🔴 Đỏ: hết lượt (= 0)
- Thêm 3-card summary stats phía trên danh sách:
  - Số voucher đang hoạt động
  - Tổng lượt còn lại
  - Tổng lượt đã sử dụng

---

## 4. Daily Login Streak Reward — Hệ thống chuỗi đăng nhập

### 4a. Backend — Dữ liệu & Logic

**Files:**
- `MC_Voice_Training_Backend/.../models/UserStats.java` — thêm 5 fields mới
- `MC_Voice_Training_Backend/.../services/impl/GamificationServiceImpl.java` — method `processLoginStreak()`
- `MC_Voice_Training_Backend/.../controllers/AuthController.java` — gọi streak sau login
- `MC_Voice_Training_Backend/.../dto/LoginStreakDTO.java` — DTO response mới
- `MC_Voice_Training_Backend/.../controllers/UserController.java` — 2 endpoint mới

**Fields thêm vào `UserStats`:**
```
loginStreak         — chuỗi hiện tại
longestLoginStreak  — kỷ lục cá nhân
lastLoginDate       — ngày login cuối
freezesAvailable    — lượt đóng băng (1/tháng)
lastFreezeGranted   — để tự nạp lại đầu tháng
```

**Logic `processLoginStreak()`:**
| Tình huống | Kết quả |
|---|---|
| Cùng ngày | Không thay đổi |
| Gap = 1 ngày | +1 streak |
| Gap = 2 ngày + có freeze | Dùng freeze, +1 streak |
| Gap > 2 ngày / hết freeze | Reset về 1 |
| Tháng mới | Nạp lại 1 freeze |

**Endpoints:**
- `GET /api/v1/users/me/streak` — lấy thông tin streak + frame hiện tại + frame tiếp theo
- `POST /api/v1/users/me/streak/freeze` — kiểm tra freeze còn không

### 4b. 7 Tier khung avatar

| Tier | Ngày | Màu | Emoji |
|---|---|---|---|
| NONE | 0 | Gray | 🌱 |
| SPARK | 3 | Vàng cam `#f5a623` | 🔥 |
| FLAME | 7 | Cam `#ff6b35` | 🔥 |
| STORM | 14 | Đỏ cam `#ff4500` | ⚡ |
| LEGEND | 30 | Vàng `#eab308` | 👑 |
| ELITE | 60 | Xanh dương `#0ea5e9` | 💎 |
| IMMORTAL | 100 | Hồng `#ec4899` | ✨ |

### 4c. Frontend Components

**`AvatarFrame.jsx`** (mới)
- Border gradient + glow animation theo tier
- CSS mask trick (`WebkitMask` + `maskComposite: exclude`) cho gradient border
- CSS keyframes inject một lần vào `<head>`
- Prop `locked` → grayscale + 🔒 overlay (xem trước khung chưa mở)
- Prop `fallbackEmoji` → hiển thị emoji khi không có avatar URL

**`StreakWidget.jsx`** (mới — light theme)
- Layout: trái (emoji hero + số ngày) | phải (tier label, kỷ lục, freeze badge, progress bar, tier track)
- Tier track: 6 dot hiển thị toàn bộ tier, tier hiện tại glow
- Khung tiếp theo (bị khóa): emoji mờ + 🔒 + "Còn X ngày nữa"
- Nút "Lưu ảnh chuỗi" ở đáy
- Màu sắc: **white/light theme** (`bg-white`, gray text, accent theo tier)
- Config màu tập trung ở đầu file (`FRAME_ACCENT`, `FRAME_HERO`)

**`StreakCardModal.jsx`** (mới — light theme)
- Canvas 560×240px vẽ ảnh streak card:
  - Nền trắng + accent tint góc
  - Left accent bar dọc màu tier
  - Emoji hero trong rounded square
  - Tier pill badge, tên user, số ngày lớn, kỷ lục
  - Progress bar (nền `#f3f4f6`, fill gradient accent)
  - Bottom strip brand + ngày
- Tải về máy `.PNG` (không watermark)
- Modal light: `bg-white`, nút tải màu theo tier

**`StreakMilestoneToast.jsx`** (mới)
- Xuất hiện khi vượt mốc (3, 7, 14, 30, 60, 100 ngày)
- Mini confetti 18 particles CSS
- Tự đóng sau 6 giây, countdown progress bar
- Hiển thị khung mới mở khóa (nếu có)

---

## 5. Avatar Navbar — Khung theo tier streak

**Files:**
- `MC_Voice_Training_Frontend/src/components/Navbar.jsx`
- `MC_Voice_Training_Frontend/src/components/ui/AvatarFrame.jsx`
- `MC_Voice_Training_Frontend/src/components/ui/StreakWidget.jsx`

**Cơ chế:**
1. `StreakWidget` fetch API → lưu `streakFrame` vào `localStorage`
2. `Navbar` đọc từ `localStorage` lúc mount + lắng nghe `storage` event
3. Avatar navbar tự cập nhật border/glow theo tier không cần reload
4. Tier NONE → không hiện badge icon góc
5. Emoji avatar (không phải URL) → dùng làm fallback emoji

---

## Tóm tắt files thay đổi

| File | Loại |
|---|---|
| `Home.jsx` | Sửa |
| `QuestGuideTour.jsx` | Sửa |
| `PlanManager.jsx` | Sửa |
| `UserStats.java` | Sửa |
| `GamificationServiceImpl.java` | Sửa |
| `AuthController.java` | Sửa |
| `LoginStreakDTO.java` | Mới |
| `UserController.java` | Mới |
| `AvatarFrame.jsx` | Mới |
| `StreakWidget.jsx` | Mới |
| `StreakCardModal.jsx` | Mới |
| `StreakMilestoneToast.jsx` | Mới |
| `Navbar.jsx` | Sửa |
| `Dashboard.jsx` | Sửa |
