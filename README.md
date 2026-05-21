# FPT S7 Website Frontend

Frontend cho hệ thống The MC Hub, xây dựng bằng React + Vite.
Ứng dụng phục vụ 4 nhóm người dùng (guest, client, mc, admin) với các luồng chính: tìm MC, đặt booking, nhắn tin theo conversation, quản lý dashboard theo role.

## Công nghệ chính

- React 19 + React Router
- Vite 7
- Axios (API client)
- Socket.IO client (real-time messaging/notifications)
- Zustand (auth state)

## Environment Variables

Tạo file .env từ .env.example:

| Biến | Mô tả | Ví dụ |
| --- | --- | --- |
| VITE_APP_NAME | Tên hiển thị ứng dụng | The MC Hub |
| VITE_API_URL | Base URL backend REST API | http://localhost:5000/api/v1 |
| VITE_AI_API_URL | Base URL AI service (voice analyze) | http://localhost:8000 |

## Role Matrix

| Role | Quyền truy cập chính |
| --- | --- |
| guest | Xem trang chủ, đăng nhập, đăng ký |
| client | Tìm MC, tạo booking, xem booking của mình, nhắn tin, thông báo |
| mc | Dashboard MC, calendar, booking requests, wallet, scripts, nhắn tin |
| admin | Admin dashboard, user/booking/transaction management, các khu vực dùng chung |

## Chạy local

1. Cài dependencies:

```bash
npm install
```

2. Tạo file môi trường:

```bash
cp .env.example .env
```

Trên Windows PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

3. Chạy dev server:

```bash
npm run dev
```

4. Build production:

```bash
npm run build
```

5. Preview build:

```bash
npm run preview
```

## Cấu trúc thư mục chính

```text
src/
	components/      # Reusable UI (animations, ui, chat, v.v.)
	controllers/     # Lớp điều phối dữ liệu từ services -> pages
	hooks/           # Custom hooks (API, auth, socket)
	layout/          # Layout dùng chung
	pages/           # Màn hình theo route
	services/        # Gọi API backend/AI
	store/           # Zustand stores
	styles/          # CSS theo module/chức năng
```

## 💎 Giai đoạn Hiện đại hóa UI/UX (2026-05)

Dự án đã trải qua đợt nâng cấp toàn diện về mặt thị giác (Cinematic Design):

### 1. Ngôn ngữ thiết kế
- **Theme**: Deep Navy & Gold (Sử dụng `slate-950` và `yellow-500`).
- **Typography**: Chuyển sang font Inter/Outfit, tối ưu `tracking-tighter` cho tiêu đề lớn.
- **Spacing**: Hệ thống "Luxury Spacing" với các utility class `py-24` đến `py-60` được định nghĩa trong `index.css`.

### 2. Thành phần đặc trưng (Signature Components)
- **DotField**: Nền hạt tương tác xây dựng trên Canvas API, mask radial gradient.
- **AI Waveform**: Hiệu ứng sóng âm nhảy động mô phỏng phân tích giọng nói AI.
- **ScrollReveal**: Hệ thống hiệu ứng xuất hiện theo nhịp cuộn trang.

### 3. Trang mới & Cập nhật
- **About Us**: Trang giới thiệu Storytelling hoàn chỉnh (`/about`).
- **Home Modernization**: Hero section mới, Talents Carousel và các khối nội dung thoáng đãng hơn.

## Ghi chú

- Messaging dùng query param mcId/bookingId để điều hướng đúng conversation cũ khi đi từ luồng booking.
- Script reader có route riêng: /m/scripts/:id/read.

---
*Cập nhật lần cuối: 2026-05-11 bởi Antigravity Agent.*
