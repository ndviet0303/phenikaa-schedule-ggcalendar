# 📅 Phenikaa Schedule Dispatcher (Aura Court Edition)

> **Tiện ích mở rộng (Extension) cho trình duyệt Chrome, Microsoft Edge, Brave, Cốc Cốc.**  
> Tự động bắt gói tin từ cổng đào tạo Phenikaa, tùy biến khoảng thời gian tra cứu, giải mã thuật toán độc quyền và xuất file lịch `.ics` để đồng bộ trực tiếp vào **Google Calendar**, **Apple Calendar** và **Outlook**.

---

## 🌟 Tính Năng Nổi Bật

* 🔄 **Tự động bắt phiên 100% (Zero Hardcode):** Tự động trích xuất `JWT Bearer Token` và `Student ID` từ phiên đăng nhập hiện tại trên portal mà không cần cấu hình thủ công.
* 🛡️ **Mã hóa & Giải mã 2 chiều:** Tích hợp thuật toán mã hóa `AE` và giải mã `AD` chuẩn của portal trường Phenikaa, tự động giải mã chuỗi phản hồi bằng mật mã hệ thống (`AzzSystem`).
* ✨ **Giao diện chuẩn Aura Court:** Thiết kế cao cấp lấy cảm hứng từ [court.ziet.dev](https://court.ziet.dev/), bo tròn sang trọng, nút bấm dạng Pill ánh kim và hỗ trợ chuyển đổi **Light / Dark mode** mượt mà.
* 📆 **Tùy biến ngày linh hoạt:** Tra cứu theo ngày cụ thể hoặc chọn nhanh bằng các chip: *Tuần này*, *Tuần sau*, *Tuần trước*, *Hôm nay*.
* 📥 **Xuất file chuẩn iCalendar (.ics):** Tải về lịch học chi tiết gồm tên môn, mã lớp, phòng học, giảng viên, tiết học và giờ bắt đầu/kết thúc chính xác theo múi giờ `Asia/Ho_Chi_Minh`.
* 📌 **Dock Widget trên trang:** Tích hợp một nút bấm tròn nổi gọn gàng ở góc trái màn hình portal, bấm là bung bảng điều khiển ngay trên trang web mà không cần mở popup.

---

## 🚀 Hướng Dẫn Cài Đặt

### Cách 1: Cài đặt từ file bản phát hành (.zip) — *Khuyên dùng cho người dùng*
1. Tải file **`phenikaa-schedule-v1.4.0.zip`** từ thư mục [`release/`](https://github.com/ndviet0303/phenikaa-schedule-ggcalendar/blob/main/release/phenikaa-schedule-v1.4.0.zip) hoặc trang [Releases](https://github.com/ndviet0303/phenikaa-schedule-ggcalendar/releases).
2. Giải nén file `.zip` ra một thư mục trên máy tính.
3. Mở trình duyệt và truy cập vào trang quản lý tiện ích:
   * **Microsoft Edge:** Truy cập `edge://extensions/`
   * **Google Chrome / Brave / Cốc Cốc:** Truy cập `chrome://extensions/`
4. Bật công tắc **Developer mode** (Chế độ cho nhà phát triển) ở góc trên bên phải hoặc thanh bên trái.
5. Nhấn nút **Load unpacked** (Tải tiện ích đã giải nén).
6. Chọn thư mục mà bạn vừa giải nén ở Bước 2.
7. Tiện ích sẽ xuất hiện trên thanh công cụ của trình duyệt!

---

### Cách 2: Cài đặt từ mã nguồn Git (Dành cho Developer)
```bash
# Clone repository về máy
git clone git@github.com:ndviet0303/phenikaa-schedule-ggcalendar.git

# Mở edge://extensions hoặc chrome://extensions
# Chọn 'Load unpacked' và trỏ tới thư mục vừa clone
```

---

## 📖 Hướng Dẫn Sử Dụng Chi Tiết

### Bước 1: Đăng nhập Portal sinh viên Phenikaa
1. Truy cập vào trang đào tạo: **[https://qldtbeta.phenikaa-uni.edu.vn/congsinhvien/index.aspx](https://qldtbeta.phenikaa-uni.edu.vn/congsinhvien/index.aspx)**
2. Đăng nhập vào tài khoản sinh viên của bạn.

### Bước 2: Mở bảng điều khiển tiện ích
Bạn có 2 cách mở:
* **Cách 1:** Nhấn vào icon tiện ích **Z Schedule Dispatcher** trên thanh công cụ của trình duyệt.
* **Cách 2:** Nhấn vào biểu tượng Dock tròn màu vàng ở góc dưới bên trái màn hình trang web.

> Trạng thái trên đầu tiện ích sẽ hiển thị **`Live Synced`** (màu xanh lá), chứng tỏ tiện ích đã tự động nhận diện tài khoản của bạn.

### Bước 3: Chọn ngày & Truy vấn lịch học
1. Chọn khoảng thời gian bạn muốn xem lịch (hoặc bấm nhanh vào chip *Tuần này*, *Tuần sau*...).
2. Nhấn nút **`Truy Vấn Lịch Học`**.
3. Tiện ích sẽ gửi request mã hóa lên hệ thống và hiển thị danh sách các lớp học phần cùng đầy đủ thông tin:
   * Môn học & tên lớp học phần
   * Địa điểm (phòng học)
   * Thời gian (thứ, tiết học, giờ bắt đầu - kết thúc)
   * Giảng viên đứng lớp

---

## 📲 Hướng Dẫn Nhập Lịch Vào Google Calendar & Apple Calendar

### 1. Đồng bộ vào Google Calendar (Điện thoại Android, iPhone, Web)
1. Trên tiện ích, sau khi hiển thị lịch học, nhấn nút **`Xuất .ics`** để tải file `.ics` về máy.
2. Mở trình duyệt vào **[Google Calendar](https://calendar.google.com/)**.
3. Nhấn vào biểu tượng bánh răng **Cài đặt (Settings)** ở góc trên bên phải ➔ chọn **Cài đặt**.
4. Ở menu bên trái, chọn **Nhập và xuất (Import & export)**.
5. Tại mục **Nhập**:
   * Nhấn **Chọn tệp từ máy tính** ➔ chọn file `.ics` bạn vừa tải về.
   * Chọn lịch bạn muốn thêm vào (ví dụ: Lịch chính của bạn).
   * Nhấn nút **Nhập (Import)**.
6. Toàn bộ lịch học sẽ hiển thị trên Google Calendar và tự động thông báo nhắc nhở trước giờ học trên điện thoại của bạn!

### 2. Đồng bộ vào Apple Calendar (iPhone, iPad, MacBook)
* **Trên MacBook:** Nhấn đúp chuột vào file `.ics` vừa tải về ➔ chọn Lịch muốn thêm ➔ nhấn **OK**.
* **Trên iPhone/iPad:** Gửi file `.ics` qua AirDrop, Zalo hoặc mở trong ứng dụng Tệp (Files) ➔ nhấn **Thêm tất cả vào Lịch (Add All to Calendar)**.

---

## 🏗️ Cấu Trúc Mã Nguồn (Clean Architecture)

Dự án được phân chia theo mô hình Clean Architecture rõ ràng, độc lập và dễ bảo trì:

```
phenikaa-extension/
├── manifest.json              # Khai báo cấu hình Extension Manifest V3
├── package.json               # Quản lý script đóng gói release
├── build.js                   # Script đóng gói tự động thành file .zip
├── .gitignore
├── release/                   # Chứa bản nén phát hành
│   └── phenikaa-schedule-v1.4.0.zip
│
└── src/
    ├── core/                  # Tầng Domain & Thuật toán thuần
    │   ├── constants.js       # Hằng số, API Endpoint, Action, Passwords
    │   ├── crypto.js          # Động cơ mã hóa / giải mã AE & AD
    │   └── ics.js             # Bộ sinh file iCalendar chuẩn RFC 5545
    │
    ├── services/              # Tầng Dịch vụ ứng dụng
    │   ├── auth-service.js    # Quét & phân tích JWT Bearer Token, Student ID
    │   ├── schedule-service.js# Khởi tạo payload & gọi API lấy lịch học
    │   └── storage-service.js # Quản lý bộ nhớ đệm & Chrome Storage
    │
    ├── ui/                    # Tầng Giao diện người dùng
    │   ├── theme.js           # Bộ điều khiển chuyển đổi Light / Dark mode
    │   ├── popup.css          # Stylesheet phong cách Aura Court cho Popup
    │   └── widget.css         # Stylesheet cho Dock & Panel trên trang
    │
    ├── popup/                 # Giao diện Popup trình duyệt
    │   ├── popup.html
    │   └── popup.js
    │
    └── content/               # Content Script tương tác trên portal trường
        ├── interceptor.js     # Hook XMLHttpRequest/Fetch & Render Dock Widget
        └── bridge.js          # Cầu nối dữ liệu giữa trang và tiện ích
```

---

## 📦 Lệnh Đóng Gói (Build Package)

Để tự động đóng gói toàn bộ tiện ích thành file zip sẵn sàng phát hành:

```bash
npm run build
```
File đóng gói sẽ được tạo tự động tại `release/phenikaa-schedule-v1.4.0.zip`.

---

## 👨‍💻 Tác Giả & Hỗ Trợ

* **Tác giả:** Nghiêm Đức Việt (Ziet)
* **Website:** [ziet.dev](https://ziet.dev)
* **Facebook cá nhân:** [fb.com/ziet.cute](https://fb.com/ziet.cute)
* **Báo lỗi / Góp ý:** Nhắn tin trực tiếp qua Messenger tại [m.me/ziet.cute](https://m.me/ziet.cute)
