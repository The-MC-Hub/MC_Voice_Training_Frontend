# Báo cáo Hệ thống Tracking GA4 — MC Voice Training

**Công cụ:** Google Analytics 4 (GA4)  
**Measurement ID:** G-S6MV5SK3E0  
**Property:** MC Voice Training Web  
**Domain theo dõi:** https://mc-voice-training.vercel.app  
**Phạm vi:** Toàn bộ website MC Voice Training

---

## Mục đích tổng quan

Hệ thống tracking được tích hợp trực tiếp vào mã nguồn website nhằm **ghi lại hành vi thực tế của người dùng** tại từng điểm chạm trong hành trình sử dụng sản phẩm. Dữ liệu thu thập được dùng để:

- **Đo chuyển đổi** — bao nhiêu người dùng thử → trả phí → giữ chân
- **Phát hiện điểm thắt cổ chai** — người dùng rời khỏi ở bước nào trong từng luồng
- **Hiểu thói quen tập luyện** — tần suất, giờ cao điểm, chủ đề yêu thích
- **Tối ưu doanh thu** — gói nào được xem nhiều nhất, lý do không chuyển đổi
- **Đánh giá chất lượng nội dung** — kịch bản, khóa học nào giữ chân người dùng

---

## Sơ đồ hành trình người dùng và điểm tracking

```
[Đăng ký] → [Onboarding Quiz] → [Thư viện kịch bản] → [Luyện giọng] → [Xem kết quả AI]
    ↓                                                                           ↓
[Dashboard]  ←──────────────────────────────────────────────────────────── [Lưu tiến trình]
    ↓
[Nâng cấp gói] → [Trang thanh toán] → [Hoàn tất thanh toán]
```

Mỗi mũi tên trong sơ đồ đều có ít nhất một event GA4 theo dõi.

---

## Chi tiết các nhóm sự kiện (Events)

---

### 1. Xác thực người dùng (Auth)

**Mục đích:** Đo tỷ lệ hoàn thành đăng ký, phát hiện người dùng bỏ giữa chừng ở bước nào.

| Tên sự kiện | Khi nào kích hoạt | Insight thu được |
|-------------|-------------------|-----------------|
| `login_submit` | Nhấn nút đăng nhập | Số lần thử đăng nhập |
| `login_success` | Đăng nhập thành công | Tỷ lệ submit → success (nếu thấp = vấn đề UX form) |
| `login_otp_verify` | Xác minh OTP thành công | Drop-off ở bước OTP |
| `logout_click` | Đăng xuất | Session length trước khi rời |
| `register_submit` | Nhấn nút tạo tài khoản | Lượng người bắt đầu đăng ký |
| `register_success` | Đăng ký hoàn tất | Funnel: submit → success |
| `register_email_verify` | Xác minh email | Tỷ lệ xác minh email sau đăng ký |
| `register_quiz_complete` | Hoàn thành quiz phân loại | Phân bố profile người dùng (MC chuyên nghiệp / mới bắt đầu) |
| `forgot_password_submit` | Gửi yêu cầu đặt lại mật khẩu | Tần suất quên mật khẩu → UX vấn đề |
| `password_change_submit` | Đổi mật khẩu thành công | — |

**Funnel chuyển đổi cần theo dõi:**
> `register_submit` → `register_success` → `register_email_verify` → `onboarding_submit`

---

### 2. Luyện giọng (Voice Practice)

**Mục đích:** Đây là **tính năng cốt lõi** của sản phẩm. Tracking đo mức độ engaged thực sự của người dùng — không chỉ mở trang mà còn thực sự ghi âm và nhận phân tích AI.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo | Insight |
|-------------|-------------------|------------------|---------|
| `voice_practice_start` | Mở trang luyện giọng kịch bản cụ thể | `lesson_id`, `category` | Kịch bản / chủ đề nào phổ biến nhất |
| `recording_start` | Nhấn nút ghi âm | `lesson_id` | Tỷ lệ xem kịch bản → thực sự ghi âm |
| `recording_stop` | Dừng ghi âm | `duration_seconds` | Phân bố thời lượng: <5s = test nhanh, >30s = nghiêm túc |
| `analysis_complete` | AI phân tích xong | `accuracy`, `energy`, `pace`, `lesson_id` | Điểm trung bình theo chủ đề; điểm ngưỡng nào giữ chân người dùng |
| `teleprompter_enable` | Bật chế độ teleprompter | — | % người dùng cần hỗ trợ đọc |
| `voice_annotation_add` | Thêm annotation vào kịch bản | — | Mức độ chú thích → người dùng học nghiêm túc |
| `voice_note_add` | Thêm ghi chú | — | Engagement sâu với nội dung |
| `voice_practice_reset` | Reset bài luyện | — | Tỷ lệ làm lại bài → chỉ số perfectionistic |

**Insight đặc biệt:**
- Nếu `recording_start` thấp hơn `voice_practice_start` nhiều → trang kịch bản không đủ thu hút để người dùng ghi âm
- `duration_seconds` median < 10 giây → người dùng đang test tính năng, không luyện thật
- `analysis_complete` với `accuracy` cao → nhóm người dùng nên nhắm đến cho upsell Premium

---

### 3. Thư viện kịch bản (Voice Library)

**Mục đích:** Hiểu người dùng tìm kiếm nội dung gì, chủ đề nào được ưa chuộng.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo | Insight |
|-------------|-------------------|------------------|---------|
| `lesson_click` | Nhấn vào một kịch bản | `lesson_id`, `category` | Top kịch bản được chọn nhiều nhất |
| `voice_library_search` | Tìm kiếm kịch bản | `search_term` | Từ khóa người dùng tìm → biết nhu cầu content |
| `voice_library_filter` | Lọc theo thể loại / độ khó | `category`, `difficulty`, `length`, `sort` | Chủ đề phổ biến nhất, độ khó phù hợp với đa số |

---

### 4. Dashboard (Trang tổng quan cá nhân)

**Mục đích:** Đo mức độ người dùng theo dõi tiến trình của chính họ — tín hiệu retention.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo |
|-------------|-------------------|------------------|
| `dashboard_view` | Vào trang Dashboard | — |
| `dashboard_tab_switch` | Chuyển tab trong Dashboard | `tab` (tên tab) |
| `dashboard_chart_filter` | Đổi khung thời gian biểu đồ | `time_frame` (7 ngày / 30 ngày...) |

---

### 5. Thanh toán & Chuyển đổi (Payment) — Nhóm quan trọng nhất

**Mục đích:** Đo toàn bộ funnel doanh thu. Đây là luồng có giá trị cao nhất cần theo dõi sát.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo | Insight |
|-------------|-------------------|------------------|---------|
| `payment_page_view` | Vào trang chọn gói | — | Lượng người quan tâm nâng cấp |
| `plan_select` | Chọn một gói cụ thể | `plan` (BASIC/FULL/ANNUAL) | Gói nào được chọn nhiều nhất trước khi bỏ |
| `payment_submit` | Nhấn xác nhận thanh toán | `plan`, `value`, `currency: VND` | Tổng giá trị giao dịch cố gắng |
| `purchase` | Thanh toán thành công | `plan`, `value`, `currency`, `transaction_id` | **Doanh thu thực** — GA4 tự tính tổng Revenue |
| `payment_cancel` | Hủy thanh toán | `plan` | Gói nào bị hủy nhiều nhất |
| `upgrade_banner_view` | Thấy banner nhắc nâng cấp | `usage_percent` (% đã dùng) | Ngưỡng % nào khiến người dùng chú ý nhất |
| `upgrade_banner_click` | Nhấn vào banner nâng cấp | — | Tỷ lệ banner → trang thanh toán |
| `premium_modal_view` | Pop-up Premium hiện ra | `trigger_reason` | Tình huống nào trigger modal nhiều nhất |
| `premium_modal_upgrade_click` | Nhấn nâng cấp trong modal | `plan` | Tỷ lệ modal → hành động |

**Funnel doanh thu cần theo dõi:**
> `payment_page_view` → `plan_select` → `payment_submit` → `purchase`

**Luồng upsell thụ động:**
> `upgrade_banner_view` → `upgrade_banner_click` → `payment_page_view` → `purchase`

> `premium_modal_view` → `premium_modal_upgrade_click` → `purchase`

---

### 6. Khóa học (Courses)

**Mục đích:** Đo engagement với nội dung học có cấu trúc — chỉ số giữ chân dài hạn.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo | Insight |
|-------------|-------------------|------------------|---------|
| `course_list_view` | Vào trang danh sách khóa học | — | Bao nhiêu người khám phá khóa học |
| `course_detail_view` | Xem chi tiết một khóa | `course_id`, `course_name` | Khóa học nào thu hút nhất |
| `course_enroll_click` | Nhấn đăng ký khóa học | `course_id`, `course_name` | Tỷ lệ xem → đăng ký |
| `lesson_start` | Bắt đầu một bài học | `lesson_id`, `lesson_type` | Điểm bắt đầu phổ biến trong khóa |
| `lesson_complete` | Hoàn thành bài học | `lesson_id`, `course_id` | Tỷ lệ hoàn thành, bài nào bị bỏ nhiều |

---

### 7. Cộng đồng & Bảng xếp hạng (Community)

**Mục đích:** Đo tính năng social / gamification có giữ chân người dùng không.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo |
|-------------|-------------------|------------------|
| `community_page_view` | Vào trang cộng đồng | — |
| `leaderboard_filter` | Lọc bảng xếp hạng | `leaderboard_type`, `period` |
| `leaderboard_share` | Chia sẻ thứ hạng | `rank` (vị trí hiện tại) |

---

### 8. Cài đặt (Settings)

| Tên sự kiện | Khi nào kích hoạt |
|-------------|-------------------|
| `settings_profile_update` | Cập nhật thông tin hồ sơ |
| `settings_avatar_upload` | Tải ảnh đại diện mới |

---

### 9. Onboarding (Giới thiệu lần đầu)

**Mục đích:** Đo mức độ hoàn thành setup ban đầu — người dùng hoàn thành onboarding có retention cao hơn đáng kể.

| Tên sự kiện | Khi nào kích hoạt | Dữ liệu kèm theo |
|-------------|-------------------|------------------|
| `onboarding_step_complete` | Hoàn thành từng bước | `step_number` |
| `onboarding_submit` | Hoàn tất toàn bộ onboarding | — |
| `onboarding_tour_skip` | Bỏ qua tour hướng dẫn | — |
| `onboarding_tour_complete` | Xem hết tour hướng dẫn | — |

---

### 10. Liên hệ

| Tên sự kiện | Khi nào kích hoạt |
|-------------|-------------------|
| `contact_modal_submit` | Gửi form liên hệ |

---

## Các luồng chuyển đổi đặc biệt cần theo dõi

### Luồng A — Đăng ký → Luyện đầu tiên (Activation)
```
register_success
    → onboarding_submit
        → voice_practice_start
            → recording_start
                → analysis_complete
```
**Ý nghĩa:** Người dùng hoàn thành vòng lặp đầu tiên (đăng ký → luyện → nhận feedback AI). Đây là **activation event** — người dùng nào vượt qua điểm này có xác suất giữ chân cao hơn 3–5 lần so với người chỉ đăng ký mà không luyện.

---

### Luồng B — Free → Premium (Conversion funnel)
```
upgrade_banner_view (hoặc premium_modal_view)
    → upgrade_banner_click (hoặc premium_modal_upgrade_click)
        → payment_page_view
            → plan_select
                → payment_submit
                    → purchase ✓
```
**Ý nghĩa:** Funnel doanh thu chính. Tỷ lệ chuyển đổi từng bước giúp xác định: banner có đủ thuyết phục không, trang thanh toán có ma sát ở đâu, gói nào bị từ chối nhiều nhất.

---

### Luồng C — Tập luyện tích cực (Engagement depth)
```
voice_practice_start
    → teleprompter_enable (tùy chọn)
        → recording_start
            → recording_stop (duration_seconds > 20)
                → analysis_complete (accuracy > 70)
                    → voice_annotation_add hoặc voice_note_add
```
**Ý nghĩa:** Người dùng ghi âm >20 giây + điểm accuracy >70 + có annotation = **người dùng chất lượng cao**, nên là mục tiêu của chiến dịch upsell hoặc email nurturing.

---

### Luồng D — Rủi ro churn (người dùng có thể rời)
```
login_success
    → dashboard_view
        → (không có voice_practice_start trong session này)
```
**Ý nghĩa:** Người dùng đăng nhập, xem dashboard nhưng không luyện → tín hiệu engagement giảm dần. Có thể trigger push notification hoặc email nhắc luyện tập.

---

## Cách đọc báo cáo trong GA4

1. **GA4 → Reports → Engagement → Events** — xem tần suất từng event
2. **GA4 → Explore → Funnel Exploration** — tạo funnel với các event theo thứ tự → thấy drop-off %
3. **GA4 → Reports → Monetization → Purchase Journey** — tự động track `purchase` event
4. **GA4 → Realtime** — xem người dùng đang làm gì ngay lúc này (trễ ~1 phút)

---

## Lưu ý kỹ thuật

- Tất cả event đi qua hàm `track()` tập trung, có kiểm tra `window.gtag` tồn tại trước khi gửi → không gây lỗi nếu GA4 bị chặn bởi trình duyệt
- Brave Browser mặc định chặn Google Analytics — cần dùng Chrome/Edge để kiểm tra Realtime
- Dữ liệu xuất hiện trong GA4 Reports sau ~24 giờ; Realtime report có trễ ~1 phút
- Event `purchase` được GA4 nhận diện là **revenue event** — tự động tổng hợp vào báo cáo Monetization

---

*Tài liệu này phản ánh trạng thái tracking tính đến lần triển khai cuối cùng lên Vercel.*
