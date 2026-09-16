# Phenikaa Schedule Dispatcher (Aura Court Edition)

[![Version](https://img.shields.io/badge/version-1.5.1-blue.svg?style=flat-square)](https://github.com/ndviet0303/phenikaa-schedule-ggcalendar/releases)
[![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg?style=flat-square)](manifest.json)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Edge%20%7C%20Brave-lightgrey.svg?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)

> Tiện ích mở rộng (Extension) dành cho trình duyệt Chromium (Chrome, Microsoft Edge, Brave, Cốc Cốc).  
> Tự động trích xuất payload từ cổng đào tạo Phenikaa, tùy biến khoảng thời gian tra cứu, giải mã dữ liệu thời khóa biểu và xuất file `.ics` đồng bộ vào **Google Calendar**, **Apple Calendar** và **Outlook**. Đồng thời hỗ trợ tính năng tự động hoàn thành phiếu khảo sát giảng viên.

---

## Tính Năng Chính

- **Tự động nhận diện phiên (Zero Config):** Trích xuất `JWT Bearer Token` và `Student ID` trực tiếp từ phiên làm việc trên portal.
- **Mã hóa & Giải mã 2 chiều:** Tích hợp thuật toán `AE` và `AD` của hệ thống cổng đào tạo Phenikaa (`AzzSystem`).
- **Giao diện Aura Court:** Thiết kế tối giản, hiện đại lấy cảm hứng từ [court.ziet.dev](https://court.ziet.dev/), hỗ trợ chuyển đổi giao diện Sáng / Tối (Light / Dark mode).
- **Tùy biến thời gian linh hoạt:** Lọc lịch học theo ngày bất kỳ hoặc chọn nhanh theo tuần (*Tuần này*, *Tuần sau*, *Tuần trước*, *Hôm nay*).
- **Xuất lịch iCalendar (.ics):** Tạo file `.ics` tuân thủ chuẩn RFC 5545, hỗ trợ đầy đủ múi giờ `Asia/Ho_Chi_Minh`, phòng học, giảng viên và mã màu riêng cho từng môn học.
- **Dock Widget trên trang:** Nút bấm nổi tích hợp trực tiếp trên portal giúp thao tác nhanh mà không cần mở popup trình duyệt.
- **Auto Tick Khảo Sát:** Tự động điền và nộp phiếu khảo sát ý kiến giảng viên với các chế độ linh hoạt (*Đồng ý*, *Hoàn toàn đồng ý*, hoặc *Ngẫu nhiên*), tự động điền nhận xét và duyệt nộp toàn bộ 1-Click.

---

## Thư Viện & Công Nghệ Sử Dụng

Dự án ưu tiên mã nguồn thuần (Vanilla JavaScript), không dùng framework nặng để đảm bảo tốc độ tối đa và kích thước siêu nhẹ:

- **Manifest V3:** Chuẩn kiến trúc extension mới nhất của Google Chrome và Microsoft Edge.
- **Feather Icons (SVG):** Thư viện icon mã nguồn mở tối giản, sắc nét và nhẹ nhàng thay vì dùng emoji.
- **RFC 5545 iCalendar Engine:** Module tự xây dựng sinh file lịch tương thích 100% với Google Calendar và Apple Calendar.
- **Web Crypto & Bitwise Cipher:** Xử lý giải mã thuật toán XOR cipher 2 chiều.
- **Plus Jakarta Sans:** Phông chữ hình học hiện đại từ Google Fonts.

---

## Hướng Dẫn Cài Đặt

### Cách 1: Cài đặt từ file nén (.zip) - Dành cho người dùng

1. Tải file **`phenikaa-schedule-v1.5.1.zip`** từ thư mục [`release/`](https://github.com/ndviet0303/phenikaa-schedule-ggcalendar/blob/main/release/phenikaa-schedule-v1.5.1.zip) hoặc trang [Releases](https://github.com/ndviet0303/phenikaa-schedule-ggcalendar/releases).
2. Giải nén file `.zip` vào một thư mục trên máy tính.
3. Mở trình duyệt và truy cập trang quản lý extension:
   - **Microsoft Edge:** `edge://extensions/`
   - **Google Chrome / Brave / Cốc Cốc:** `chrome://extensions/`
4. Bật công tắc **Developer mode** (Chế độ cho nhà phát triển).
5. Nhấn nút **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục vừa giải nén.

### Cách 2: Cài đặt từ mã nguồn Git - Dành cho Developer

```bash
git clone git@github.com:ndviet0303/phenikaa-schedule-ggcalendar.git
```
Sau đó mở trang quản lý tiện ích của trình duyệt, chọn **Load unpacked** và trỏ đến thư mục vừa clone.

---

## Hướng Dẫn Sử Dụng

### 1. Tra cứu thời khóa biểu
1. Đăng nhập vào trang đào tạo sinh viên Phenikaa: [https://qldtbeta.phenikaa-uni.edu.vn/congsinhvien/index.aspx](https://qldtbeta.phenikaa-uni.edu.vn/congsinhvien/index.aspx)
2. Mở bảng điều khiển bằng cách nhấn vào icon extension trên thanh công cụ hoặc nút Dock tròn ở góc màn hình.
3. Chọn khoảng thời gian hoặc tuần cần tra cứu, sau đó nhấn **Truy Vấn Lịch Học**.
4. Danh sách các lớp học phần sẽ hiển thị đầy đủ thông tin: phòng học, tiết học, giờ bắt đầu/kết thúc và tên giảng viên.

### 2. Đồng bộ lịch vào Google Calendar / Apple Calendar
- **Google Calendar (Android / iOS / Web):**
  1. Nhấn **Xuất .ics** trên tiện ích để tải file về máy.
  2. Mở [Google Calendar](https://calendar.google.com/) -> biểu tượng bánh răng **Cài đặt** -> **Nhập và xuất**.
  3. Chọn file `.ics` vừa tải và bấm **Nhập**.
- **Apple Calendar (macOS / iPhone / iPad):**
  - Nhấp đúp vào file `.ics` trên macOS hoặc mở file qua ứng dụng Tệp trên iOS và chọn **Thêm tất cả vào Lịch**.

### 3. Tự động tick phiếu khảo sát
1. Truy cập trang thực hiện khảo sát trên portal sinh viên.
2. Tiện ích sẽ tự động kích hoạt tab **Auto Tick Khảo Sát**:
   - Chọn mức độ đánh giá: *Đồng ý (4/5)*, *Hoàn toàn đồng ý (5/5)* hoặc *Ngẫu nhiên*.
   - Chỉnh sửa nội dung nhận xét nếu muốn (có sẵn nội dung gợi ý).
   - Nhấn **Auto Tick Phiếu Này** để tick phiếu hiện tại, hoặc nhấn **Auto Toàn Bộ Phiếu** để hệ thống tự động hoàn thành tất cả các phiếu còn lại.

---

## Cấu Trúc Mã Nguồn (Clean Architecture)

```
phenikaa-extension/
├── manifest.json              # Khai báo cấu hình Extension Manifest V3
├── package.json               # Cấu hình dự án & script đóng gói
├── build.js                   # Script đóng gói đa nền tảng (Windows / macOS / Linux)
├── .gitignore
├── release/                   # Thư mục chứa các bản phát hành (.zip)
│   └── phenikaa-schedule-v1.5.1.zip
│
└── src/
    ├── core/                  # Tầng Domain & Thuật toán
    │   ├── constants.js       # Hằng số, API Endpoint, Action, Candidate Keys
    │   ├── crypto.js          # Thuật toán mã hóa & giải mã AE / AD
    │   └── ics.js             # Bộ sinh file iCalendar chuẩn RFC 5545
    │
    ├── services/              # Tầng Dịch vụ ứng dụng
    │   ├── auth-service.js    # Quét & phân tích JWT Bearer Token, Student ID
    │   ├── schedule-service.js# Khởi tạo payload & gửi request lấy lịch học
    │   ├── survey-service.js  # Tự động hóa khảo sát & điều khiển nộp phiếu
    │   └── storage-service.js # Quản lý bộ nhớ đệm & Chrome Storage
    │
    ├── ui/                    # Tầng Giao diện & Thẩm mỹ
    │   ├── theme.js           # Quản lý giao diện Light / Dark mode
    │   ├── popup.css          # Stylesheet Aura Court cho Popup
    │   └── widget.css         # Stylesheet cho Dock & Panel trên trang
    │
    ├── popup/                 # Giao diện Popup trình duyệt
    │   ├── popup.html
    │   └── popup.js
    │
    └── content/               # Content Scripts tương tác trên portal trường
        ├── interceptor.js     # Hook XMLHttpRequest / Fetch & Render Dock Widget
        └── bridge.js          # Cầu nối dữ liệu giữa trang và extension storage
```

---

## Lệnh Đóng Gói (Build Package)

Để đóng gói tiện ích thành file zip sẵn sàng phát hành:

```bash
npm run build
```

File đóng gói sẽ được tạo tự động tại `release/phenikaa-schedule-v1.5.1.zip`.

---

## Tác Giả & Hỗ Trợ

- **Tác giả:** Nghiêm Đức Việt (Ziet)
- **Website:** [ziet.dev](https://ziet.dev)
- **Facebook cá nhân:** [fb.com/ziet.cute](https://fb.com/ziet.cute)
- **Báo lỗi / Góp ý:** Nhắn tin trực tiếp qua Messenger tại [m.me/ziet.cute](https://m.me/ziet.cute)
