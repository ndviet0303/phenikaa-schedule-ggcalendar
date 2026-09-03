# Phenikaa Schedule Dispatcher (Aura Court Edition)

Tiện ích mở rộng Chrome / Edge giúp tự động bắt payload từ network portal Phenikaa, tùy biến khoảng thời gian, truy vấn và hiển thị thời khóa biểu kèm chức năng xuất lịch `.ics` sang Google Calendar, Apple Calendar và Outlook.

---

## Tính Năng Nổi Bật

- **Bắt Động 100% (Zero Hardcode):** Tự động nhận diện JWT Token & ID sinh viên ngay khi tải trang mà không cần gán cứng dữ liệu.
- **Thiết Kế Chuẩn Aura Court:** Giao diện tối màu Obsidian quý phái kết hợp ánh kim Gold, hỗ trợ chuyển đổi Light / Dark mode 1-click.
- **Datepicker Tiện Dụng:** Tùy chọn ngày bắt đầu & kết thúc linh hoạt hoặc dùng nhanh các chip tuần (*Tuần này*, *Tuần sau*, *Tuần trước*, *Hôm nay*).
- **Xuất Lịch (.ics):** Xuất toàn bộ lớp học trong khoảng thời gian đã chọn thành file chuẩn RFC 5545 để đồng bộ với điện thoại.
- **Clean Architecture:** Tách biệt rõ ràng giữa Core logic, Services, UI và Content script.

---

## Cấu Trúc Dự Án (Clean Architecture)

```
phenikaa-extension/
├── manifest.json              # Khai báo cấu hình Extension Manifest V3
├── package.json               # Quản lý script đóng gói release
├── build.js                   # Script đóng gói tự động thành file .zip
├── .gitignore
├── release/                   # Chứa các bản build đóng gói sẵn (.zip)
│
└── src/
    ├── core/                  # Tầng Domain & Logic thuần
    │   ├── constants.js       # Hằng số, API Endpoint, Mật khẩu giải mã
    │   ├── crypto.js          # Bộ mã hóa/giải mã AE & AD
    │   └── ics.js             # Bộ tạo file iCalendar (.ics)
    │
    ├── services/              # Tầng Dịch vụ ứng dụng
    │   ├── auth-service.js    # Quét & giải mã JWT Bearer Token
    │   ├── schedule-service.js# Tạo payload & dispatch request lịch học
    │   └── storage-service.js # Quản lý bộ nhớ đệm & Chrome Storage
    │
    ├── ui/                    # Tầng Giao diện (Aura Court)
    │   ├── theme.js           # Bộ điều khiển Light / Dark Mode
    │   ├── popup.css          # Stylesheet cho Popup
    │   └── widget.css         # Stylesheet cho Widget Dock trên trang
    │
    ├── popup/                 # Entrypoint Popup trình duyệt
    │   ├── popup.html
    │   └── popup.js
    │
    └── content/               # Entrypoint Content script trên trang portal
        ├── interceptor.js     # Hook XMLHttpRequest/Fetch & Render Dock Widget
        └── bridge.js          # Cầu nối dữ liệu giữa trang và Extension
```

---

## Hướng Dẫn Cài Đặt

### Cách 1: Cài đặt từ thư mục Unpacked (Dành cho Developer)
1. Mở trình duyệt (Edge: `edge://extensions/` hoặc Chrome: `chrome://extensions/`).
2. Bật chế độ **Developer mode** (Chế độ dành cho nhà phát triển).
3. Nhấn **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục `d:\WorkSpace\PKA\Tools\phenikaa-extension`.

### Cách 2: Cài đặt từ bản Release (.zip)
1. Tải bản build nén từ thư mục `release/phenikaa-schedule-v1.3.0.zip`.
2. Giải nén vào một thư mục bất kỳ.
3. Làm theo các bước ở **Cách 1** và trỏ đến thư mục vừa giải nén.

---

## Đóng Gói Bản Phát Hành (Build Release)

Chạy lệnh sau để tự động tạo file `.zip` trong thư mục `release/`:

```bash
npm run build
```

---

## Tác Giả & Hỗ Trợ

- **Tác giả:** Nghiêm Đức Việt (Ziet)
- **Website:** [ziet.dev](https://ziet.dev)
- **Báo lỗi / Góp ý:** [m.me/ziet.cute](https://m.me/ziet.cute) hoặc Facebook [fb.com/ziet.cute](https://fb.com/ziet.cute)
