# Báo cáo Hệ thống Tracking GA4 — MC Voice Training

**Công cụ phân tích:** Google Analytics 4 (GA4)  
**Measurement ID:** `G-S6MV5SK3E0`  
**Property name:** MC Voice Training Web  
**Domain theo dõi:** https://mc-voice-training.vercel.app  
**Tổng số sự kiện được theo dõi:** 45 events  
**Phạm vi:** Toàn bộ hành trình người dùng — từ lần đầu vào trang đến thanh toán và tập luyện lặp lại

---

## 1. Mục đích tổng quan

Hệ thống tracking được nhúng trực tiếp vào mã nguồn website. Khác với Google Analytics thông thường chỉ đo lượt xem trang, hệ thống này ghi lại **từng hành động cụ thể** của người dùng — mỗi lần bấm nút, mỗi lần ghi âm, mỗi lần bỏ ngang.

Dữ liệu thu thập phục vụ 4 mục tiêu:

| Mục tiêu | Câu hỏi trả lời được |
|----------|---------------------|
| **Đo chuyển đổi** | Bao nhiêu người dùng thử → trả phí? Gói nào bán tốt nhất? |
| **Tìm điểm thắt cổ chai** | Người dùng rời đi ở bước nào trong mỗi luồng? |
| **Hiểu thói quen tập luyện** | Ai tập nghiêm túc? Ai chỉ thử cho biết? |
| **Tối ưu nội dung** | Kịch bản nào giữ chân lâu nhất? Lesson nào bị bỏ nhiều nhất? |

---

## 2. Sơ đồ hành trình người dùng

```
┌─────────────────────────────────────────────────────────────────────┐
│  ACQUISITION                                                         │
│  Vào trang lần đầu → Đăng ký → Xác minh email                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ACTIVATION                                                          │
│  Onboarding Quiz → Tour hướng dẫn → Lần luyện giọng đầu tiên       │
│  ← Điểm mấu chốt: user vượt qua đây có retention cao hơn 3–5×      │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ENGAGEMENT                                                          │
│  Thư viện kịch bản → Ghi âm → Nhận phân tích AI → Xem điểm số      │
│  Khóa học → Học bài → Hoàn thành bài → Tiến trình khóa             │
│  Leaderboard → Bảng xếp hạng → Chia sẻ thứ hạng                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  MONETIZATION                                                        │
│  Hết quota AI → Banner nâng cấp / Modal Premium                     │
│  → Trang thanh toán → Chọn gói → Nhập mã giảm giá → Thanh toán     │
└──────────────────────────┬──────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│  RETENTION                                                           │
│  Streak luyện tập → Milestone → Dashboard theo dõi tiến trình       │
└─────────────────────────────────────────────────────────────────────┘
```

Mỗi bước chuyển tiếp trong sơ đồ đều có ít nhất một event GA4 ghi lại.

---

## 3. Chi tiết tất cả 45 sự kiện theo nhóm

---

### Nhóm 1 — Xác thực người dùng (10 events)

**Mục đích:** Đo tỷ lệ hoàn thành đăng ký, phát hiện bước nào người dùng bỏ cuộc, đo tần suất quên mật khẩu.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `login_submit` | Nhấn nút đăng nhập | — | Số lần thử đăng nhập |
| `login_success` | Đăng nhập thành công | `method` (email/google) | Tỷ lệ submit → success; phương thức nào phổ biến hơn |
| `login_otp_verify` | Xác minh OTP thành công | — | Drop-off ở bước nhập mã OTP |
| `logout_click` | Nhấn đăng xuất | — | Thời gian session trung bình trước khi rời |
| `register_submit` | Nhấn tạo tài khoản | — | Tổng người bắt đầu đăng ký |
| `register_success` | Tài khoản tạo thành công | — | Tỷ lệ submit → success (nếu thấp = form có vấn đề) |
| `register_email_verify` | Xác minh email qua link | — | % người dùng xác minh email sau đăng ký |
| `register_quiz_complete` | Hoàn thành quiz phân loại | `quiz_answers` (danh sách câu trả lời) | Phân bố profile người dùng: MC chuyên nghiệp / người mới bắt đầu / học viên |
| `forgot_password_submit` | Gửi yêu cầu đặt lại mật khẩu | — | Tần suất quên mật khẩu — nếu cao, xem xét "đăng nhập không mật khẩu" |
| `password_change_submit` | Đổi mật khẩu thành công | — | — |

**Funnel đăng ký cần dựng trong GA4:**
```
register_submit → register_success → register_email_verify → onboarding_submit
```
Drop-off lớn nhất thường xảy ra ở bước `register_email_verify` — người dùng không mở email.

---

### Nhóm 2 — Luyện giọng (8 events) ← Tính năng cốt lõi

**Mục đích:** Đây là trung tâm của sản phẩm. Các event này đo mức độ người dùng thực sự luyện tập — không chỉ mở trang mà còn ghi âm, nhận phân tích AI và làm lại.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `voice_practice_start` | Mở trang luyện giọng với kịch bản cụ thể | `lesson_id`, `category` | Kịch bản và chủ đề nào phổ biến nhất |
| `recording_start` | Nhấn nút bắt đầu ghi âm | `lesson_id` | Tỷ lệ xem kịch bản → thực sự ghi âm (dưới 50% = kịch bản không đủ thu hút) |
| `recording_stop` | Dừng ghi âm | `duration_seconds` | Phân bố thời lượng: <5s = test nhanh, 10–30s = luyện bình thường, >30s = nghiêm túc |
| `analysis_complete` | AI phân tích xong và trả kết quả | `accuracy`, `energy`, `pace`, `lesson_id` | Điểm trung bình theo chủ đề; điểm ngưỡng nào giữ chân người dùng quay lại |
| `teleprompter_enable` | Bật chế độ teleprompter cuộn tự động | — | % người dùng cần hỗ trợ đọc — chỉ số độ khó của kịch bản |
| `voice_annotation_add` | Thêm annotation highlight vào kịch bản | — | Người dùng học nghiêm túc — nhắm đến để upsell |
| `voice_note_add` | Thêm ghi chú cá nhân | — | Engagement sâu với nội dung |
| `voice_practice_reset` | Reset bài luyện để làm lại từ đầu | — | Tỷ lệ làm lại — perfectionistic users, cũng là chỉ số khó của bài |

**Signal người dùng chất lượng cao** (nên nhắm đến cho upsell):
> `recording_stop.duration_seconds > 20` AND `analysis_complete.accuracy > 70` AND `voice_annotation_add` xuất hiện trong cùng session

---

### Nhóm 3 — Thư viện kịch bản (3 events)

**Mục đích:** Hiểu người dùng đang tìm kiếm nội dung gì, chủ đề nào được ưa chuộng để định hướng sản xuất nội dung.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `lesson_click` | Nhấn vào kịch bản để mở | `lesson_id`, `category` | Top 10 kịch bản được chọn nhiều nhất |
| `voice_library_search` | Tìm kiếm kịch bản | `search_term` | Từ khóa người dùng tìm nhiều nhất → biết nhu cầu content chưa được đáp ứng |
| `voice_library_filter` | Lọc danh sách | `category`, `difficulty`, `length`, `sort` | Chủ đề phổ biến nhất; độ khó người dùng thường chọn |

---

### Nhóm 4 — Dashboard cá nhân (3 events)

**Mục đích:** Đo mức độ người dùng chủ động theo dõi tiến trình — tín hiệu mạnh của retention dài hạn.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `dashboard_view` | Vào trang Dashboard | — | Tần suất xem tiến trình của bản thân |
| `dashboard_tab_switch` | Chuyển tab trong Dashboard | `tab` (tên tab) | Tab nào người dùng quan tâm nhất |
| `dashboard_chart_filter` | Đổi khung thời gian biểu đồ | `time_frame` (Daily/Weekly/Monthly) | Người dùng muốn xem dữ liệu ngắn hạn hay dài hạn |

---

### Nhóm 5 — Thanh toán và chuyển đổi (9 events) ← Nhóm quan trọng nhất về doanh thu

**Mục đích:** Theo dõi toàn bộ funnel từ khi quan tâm đến khi trả tiền thành công. Đây là nhóm có giá trị cao nhất để phân tích.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `payment_page_view` | Vào trang chọn gói | — | Lượng người có ý định nâng cấp |
| `plan_select` | Chọn một gói cụ thể | `plan` (DAILY/BASIC/FULL/ANNUAL) | Gói nào được chọn nhiều nhất trước khi bỏ trang |
| `payment_submit` | Nhấn xác nhận thanh toán | `plan`, `value`, `currency: VND` | Tổng giá trị giao dịch được khởi tạo |
| `purchase` | Thanh toán thành công | `plan`, `value`, `currency: VND`, `transaction_id` | **Doanh thu thực** — GA4 tự tổng hợp vào Monetization report |
| `payment_cancel` | Hủy thanh toán | `plan` | Gói nào bị hủy nhiều nhất sau khi đã bắt đầu thanh toán |
| `discount_code_applied` | Áp dụng mã giảm giá | `code`, `success` (true/false) | Mã nào được dùng nhiều nhất; tỷ lệ nhập mã sai |
| `upgrade_banner_view` | Nhìn thấy banner nhắc nâng cấp | `usage_percent` (% AI session đã dùng) | Ngưỡng % nào người dùng bắt đầu chú ý đến banner |
| `upgrade_banner_click` | Nhấn vào banner | — | Tỷ lệ chuyển đổi banner → trang thanh toán |
| `premium_modal_view` | Pop-up Premium hiện ra | `trigger_reason` | Tình huống nào kích hoạt modal nhiều nhất |
| `premium_modal_upgrade_click` | Nhấn nâng cấp trong modal | `plan` | Tỷ lệ modal → hành động |
| `premium_modal_dismiss` | Đóng modal mà không nâng cấp | — | % người xem modal nhưng từ chối → cần tối ưu copy hoặc timing |

> **Lưu ý:** GA4 tự động nhận diện event `purchase` là revenue event — hiển thị vào báo cáo Monetization và tính tổng Revenue mà không cần cấu hình thêm.

**Funnel doanh thu chính:**
```
payment_page_view → plan_select → payment_submit → purchase ✓
```

**Funnel upsell thụ động qua banner:**
```
upgrade_banner_view → upgrade_banner_click → payment_page_view → purchase ✓
```

**Funnel upsell thụ động qua modal:**
```
premium_modal_view → premium_modal_upgrade_click → purchase ✓
    ↓ (nếu đóng)
premium_modal_dismiss  ← đo tỷ lệ từ chối
```

---

### Nhóm 6 — Khóa học (5 events)

**Mục đích:** Đo engagement với nội dung học có cấu trúc. Người dùng hoàn thành khóa học có LTV cao hơn đáng kể.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `course_list_view` | Vào trang danh sách khóa học | — | Bao nhiêu người khám phá nội dung có cấu trúc |
| `course_detail_view` | Mở trang chi tiết khóa học | `course_id`, `course_name` | Khóa học nào thu hút click nhiều nhất |
| `course_enroll_click` | Nhấn đăng ký khóa học | `course_id`, `course_name` | Tỷ lệ xem → đăng ký; khóa nào convert tốt nhất |
| `lesson_start` | Bắt đầu một bài học | `lesson_id`, `lesson_type` | Bài nào được bắt đầu nhiều nhất; điểm vào phổ biến trong khóa |
| `lesson_complete` | Nhấn "Hoàn thành bài học" | `lesson_id`, `course_id` | Tỷ lệ hoàn thành; bài nào có tỷ lệ complete thấp nhất |
| `lesson_abandon` | Rời trang bài học mà chưa hoàn thành | `lesson_id`, `time_spent_seconds` | Bài nào bị bỏ nhiều nhất; thời gian trung bình trước khi bỏ |

**Phân tích bài học bị bỏ:** So sánh `lesson_abandon.time_spent_seconds` giữa các bài — bài có median thấp (<60s) là bài quá khó hoặc nội dung không hấp dẫn ngay từ đầu.

---

### Nhóm 7 — Cộng đồng và bảng xếp hạng (3 events)

**Mục đích:** Đo mức độ tính năng gamification và social có giữ chân người dùng hay không.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `community_page_view` | Vào trang cộng đồng | — | Tần suất người dùng kiểm tra cộng đồng |
| `leaderboard_filter` | Lọc bảng xếp hạng | `leaderboard_type`, `period` | Người dùng quan tâm loại xếp hạng nào và khoảng thời gian nào |
| `leaderboard_share` | Chia sẻ thứ hạng | `rank` | Người ở thứ hạng nào có xu hướng chia sẻ nhiều nhất |

---

### Nhóm 8 — Cài đặt tài khoản (2 events)

| Tên sự kiện GA4 | Khi nào kích hoạt | Insight kinh doanh |
|-----------------|-------------------|--------------------|
| `settings_profile_update` | Cập nhật thông tin hồ sơ | Mức độ personalization — user hoàn thiện profile có retention cao hơn |
| `settings_avatar_upload` | Tải ảnh đại diện | Tương tự — chỉ số commitment của người dùng với nền tảng |

---

### Nhóm 9 — Onboarding lần đầu (4 events)

**Mục đích:** Người dùng hoàn thành onboarding có tỷ lệ giữ chân sau 7 ngày cao hơn ~40% so với người bỏ qua.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `onboarding_step_complete` | Hoàn thành từng bước onboarding | `step_number` | Bước nào người dùng bỏ cuộc nhiều nhất |
| `onboarding_submit` | Hoàn tất toàn bộ onboarding | — | Tỷ lệ hoàn thành onboarding |
| `onboarding_tour_skip` | Bỏ qua tour hướng dẫn sản phẩm | — | % người dùng không xem hướng dẫn — rủi ro churn sớm |
| `onboarding_tour_complete` | Xem hết tour hướng dẫn | — | % người dùng hiểu sản phẩm trước khi tự dùng |

---

### Nhóm 10 — Hành vi tập luyện sâu (2 events — Funnel Bottleneck)

**Mục đích:** Phát hiện thói quen tập luyện thực sự và điểm chú ý trong nội dung.

| Tên sự kiện GA4 | Khi nào kích hoạt | Dữ liệu kèm theo | Insight kinh doanh |
|-----------------|-------------------|------------------|--------------------|
| `script_scroll_depth` | Cuộn đọc kịch bản đến mốc 25%, 50%, 75%, 100% | `scroll_percent` | % người đọc hết kịch bản; tại mốc nào người dùng dừng đọc |
| `streak_milestone` | Đạt chuỗi luyện tập 3, 7, 14, 30 ngày liên tiếp | `streak_days` | Phân bố cam kết dài hạn; thời điểm cần gửi thông báo khuyến khích |

---

### Nhóm 11 — Liên hệ (1 event)

| Tên sự kiện GA4 | Khi nào kích hoạt |
|-----------------|-------------------|
| `contact_modal_submit` | Gửi form liên hệ thành công |

---

## 4. Các luồng chuyển đổi đặc biệt cần theo dõi

### Luồng A — Activation (Đăng ký → Vòng lặp đầu tiên)

```
register_success
    → onboarding_submit
        → voice_practice_start
            → recording_start
                → recording_stop
                    → analysis_complete  ← ACTIVATION EVENT
```

Người dùng hoàn thành vòng lặp này (đăng ký → luyện → nhận feedback AI) có xác suất dùng sản phẩm trong 30 ngày cao hơn **3–5 lần** so với người chỉ đăng ký mà không luyện. Đây là chỉ số sức khỏe quan trọng nhất của sản phẩm.

**Câu hỏi cần trả lời:** Bao nhiêu % người đăng ký đạt được `analysis_complete` trong 24 giờ đầu?

---

### Luồng B — Conversion (Free → Trả phí)

```
[Trigger]:
upgrade_banner_view (khi dùng hết >80% AI session)
    HOẶC
premium_modal_view (khi cố dùng tính năng bị giới hạn)

    ↓

upgrade_banner_click / premium_modal_upgrade_click
    ↓
payment_page_view
    ↓
plan_select  ← (người dùng dừng ở đây nhiều nhất)
    ↓
payment_submit
    ↓
purchase ✓  HOẶC  payment_cancel ✗
```

**Câu hỏi cần trả lời:**
- Tỷ lệ `payment_page_view` → `purchase` là bao nhiêu %?
- Gói nào bị `plan_select` nhưng không `payment_submit` nhiều nhất?
- `premium_modal_dismiss` / `premium_modal_view` = bao nhiêu %?

---

### Luồng C — Churn Risk (Tín hiệu người dùng sắp rời)

```
login_success
    → dashboard_view
        → (KHÔNG có voice_practice_start trong cùng session)
```

Người dùng đăng nhập, xem dashboard nhưng không bắt đầu luyện trong session đó — đây là tín hiệu engagement đang giảm. Nếu pattern này lặp lại 3 ngày liên tiếp, khả năng cao người dùng sẽ rời trong tuần tới.

**Hành động đề xuất:** Trigger email hoặc push notification nhắc luyện tập sau 48 giờ không có `recording_start`.

---

### Luồng D — Người dùng tập nghiêm túc (High-value segment)

```
recording_stop.duration_seconds > 20
    AND analysis_complete.accuracy > 70
    AND (voice_annotation_add OR voice_note_add)
    AND streak_milestone đã đạt
```

Đây là nhóm người dùng có LTV cao nhất — tập lâu, đạt điểm tốt, có ghi chú, duy trì streak. Nhắm đến nhóm này để:
- Upsell gói ANNUAL (tiết kiệm nhất)
- Gửi email case study / success story
- Mời tham gia chương trình ambassador

---

### Luồng E — Bài học thắt cổ chai trong khóa học

```
lesson_start
    → lesson_abandon (time_spent_seconds < 120)  ← bỏ trong 2 phút
```

Nếu một bài học có tỷ lệ `lesson_abandon` cao trong 2 phút đầu, bài đó có vấn đề về: nội dung quá khó ngay từ đầu, thiếu context, hoặc format không hấp dẫn.

---

### Luồng F — Hiệu quả mã giảm giá

```
discount_code_applied.success = false  (nhập sai)
    NHIỀU LẦN
    → payment_cancel
```

Người dùng nhập mã sai nhiều lần → thất vọng → hủy. Nếu tỷ lệ `discount_code_applied.success = false` cao, xem xét cải thiện UX form nhập mã (gợi ý mã, tự động uppercase).

---

## 5. Hướng dẫn đọc báo cáo trong GA4

### Xem tất cả events
> GA4 → **Reports → Engagement → Events**  
> Xem số lần kích hoạt từng event, người dùng unique, và xu hướng theo thời gian.

### Dựng funnel chuyển đổi
> GA4 → **Explore → Funnel Exploration**  
> Thêm các events theo thứ tự của luồng A, B, C ở trên → thấy % drop-off tại từng bước.

### Xem doanh thu
> GA4 → **Reports → Monetization → Overview**  
> Event `purchase` tự động tổng hợp thành Revenue, Average purchase value, và Purchasers.

### Xem theo dõi realtime
> GA4 → **Reports → Realtime**  
> Thấy người dùng đang làm gì ngay lúc này (trễ ~1 phút). Dùng để kiểm tra sau khi deploy tính năng mới.

### Tạo Audience từ hành vi
> GA4 → **Configure → Audiences**  
> Ví dụ: tạo audience "Người dùng có analysis_complete.accuracy > 70" → dùng cho Google Ads retargeting.

---

## 6. Bảng tổng hợp toàn bộ 45 events

| # | Tên event GA4 | Nhóm | Dữ liệu kèm | Mức ưu tiên |
|---|---------------|------|-------------|-------------|
| 1 | `login_submit` | Auth | — | Trung bình |
| 2 | `login_success` | Auth | `method` | Cao |
| 3 | `login_otp_verify` | Auth | — | Trung bình |
| 4 | `logout_click` | Auth | — | Thấp |
| 5 | `register_submit` | Auth | — | Cao |
| 6 | `register_success` | Auth | — | Cao |
| 7 | `register_email_verify` | Auth | — | Cao |
| 8 | `register_quiz_complete` | Auth | `quiz_answers` | Cao |
| 9 | `forgot_password_submit` | Auth | — | Thấp |
| 10 | `password_change_submit` | Auth | — | Thấp |
| 11 | `voice_practice_start` | Luyện giọng | `lesson_id`, `category` | Rất cao |
| 12 | `recording_start` | Luyện giọng | `lesson_id` | Rất cao |
| 13 | `recording_stop` | Luyện giọng | `duration_seconds` | Rất cao |
| 14 | `analysis_complete` | Luyện giọng | `accuracy`, `energy`, `pace`, `lesson_id` | Rất cao |
| 15 | `teleprompter_enable` | Luyện giọng | — | Trung bình |
| 16 | `voice_annotation_add` | Luyện giọng | — | Trung bình |
| 17 | `voice_note_add` | Luyện giọng | — | Trung bình |
| 18 | `voice_practice_reset` | Luyện giọng | — | Thấp |
| 19 | `lesson_click` | Thư viện | `lesson_id`, `category` | Cao |
| 20 | `voice_library_search` | Thư viện | `search_term` | Cao |
| 21 | `voice_library_filter` | Thư viện | `category`, `difficulty`, `length`, `sort` | Cao |
| 22 | `dashboard_view` | Dashboard | — | Trung bình |
| 23 | `dashboard_tab_switch` | Dashboard | `tab` | Thấp |
| 24 | `dashboard_chart_filter` | Dashboard | `time_frame` | Thấp |
| 25 | `payment_page_view` | Thanh toán | — | Rất cao |
| 26 | `plan_select` | Thanh toán | `plan` | Rất cao |
| 27 | `payment_submit` | Thanh toán | `plan`, `value`, `currency` | Rất cao |
| 28 | `purchase` | Thanh toán | `plan`, `value`, `currency`, `transaction_id` | Rất cao |
| 29 | `payment_cancel` | Thanh toán | `plan` | Rất cao |
| 30 | `discount_code_applied` | Thanh toán | `code`, `success` | Cao |
| 31 | `upgrade_banner_view` | Thanh toán | `usage_percent` | Cao |
| 32 | `upgrade_banner_click` | Thanh toán | — | Cao |
| 33 | `premium_modal_view` | Thanh toán | `trigger_reason` | Cao |
| 34 | `premium_modal_upgrade_click` | Thanh toán | `plan` | Cao |
| 35 | `premium_modal_dismiss` | Thanh toán | — | Cao |
| 36 | `course_list_view` | Khóa học | — | Trung bình |
| 37 | `course_detail_view` | Khóa học | `course_id`, `course_name` | Trung bình |
| 38 | `course_enroll_click` | Khóa học | `course_id`, `course_name` | Cao |
| 39 | `lesson_start` | Khóa học | `lesson_id`, `lesson_type` | Cao |
| 40 | `lesson_complete` | Khóa học | `lesson_id`, `course_id` | Cao |
| 41 | `lesson_abandon` | Khóa học | `lesson_id`, `time_spent_seconds` | Cao |
| 42 | `community_page_view` | Cộng đồng | — | Thấp |
| 43 | `leaderboard_filter` | Cộng đồng | `leaderboard_type`, `period` | Thấp |
| 44 | `leaderboard_share` | Cộng đồng | `rank` | Trung bình |
| 45 | `settings_profile_update` | Cài đặt | — | Thấp |
| 46 | `settings_avatar_upload` | Cài đặt | — | Thấp |
| 47 | `onboarding_step_complete` | Onboarding | `step_number` | Cao |
| 48 | `onboarding_submit` | Onboarding | — | Cao |
| 49 | `onboarding_tour_skip` | Onboarding | — | Cao |
| 50 | `onboarding_tour_complete` | Onboarding | — | Trung bình |
| 51 | `script_scroll_depth` | Hành vi sâu | `scroll_percent` | Cao |
| 52 | `streak_milestone` | Hành vi sâu | `streak_days` | Cao |
| 53 | `contact_modal_submit` | Liên hệ | — | Thấp |

---

## 7. Lưu ý kỹ thuật

- **Chặn bởi trình duyệt:** Brave Browser mặc định block Google Analytics. Sử dụng Chrome hoặc Edge khi kiểm tra dữ liệu Realtime.
- **Độ trễ dữ liệu:** Realtime report ~1 phút. Standard reports xuất hiện sau 24–48 giờ.
- **Bảo mật:** Tất cả events đều kiểm tra sự tồn tại của `window.gtag` trước khi gửi — không gây lỗi nếu GA4 bị chặn.
- **Không thu thập PII:** Không có tên, email, hay thông tin cá nhân nào được gửi vào GA4. Chỉ có ID ẩn danh và hành vi.
- **Phương thức triển khai:** Script GA4 được nhúng trong `index.html` — tải song song với ứng dụng, không làm chậm thời gian khởi động.

---

*Tài liệu này phản ánh trạng thái hệ thống tracking tính đến ngày 20/06/2026.*  
*Phụ trách kỹ thuật: Trung (CTO) — letritrung2605@gmail.com*
