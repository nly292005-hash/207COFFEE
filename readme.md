# 207 Coffee – CofBase MVP ☕

**207 Coffee CofBase** là một hệ thống quản trị vận hành và bán hàng nội bộ (POS & ERP MVP) được thiết kế chuyên biệt cho chuỗi cửa hàng cà phê 207 Coffee. Dự án ứng dụng kiến trúc **Single Page Application (SPA)** thuần bằng **Vanilla JavaScript (ES6+)**, tập trung vào tối ưu hóa hiệu năng, xử lý dữ liệu thời gian thực tại Client (Mock Data Store) và phân quyền nghiêm ngặt giữa các bộ phận từ Nhân viên, Trưởng ca đến Giám đốc (CEO).

---

## 📋 Lĩnh vực và Mô hình vận hành

* 🛍️ **Điểm bán hàng tại quầy (POS):** Phục vụ các danh mục đồ uống và thức ăn bao gồm Cà phê nóng, Cà phê đá, Trà & Trà sữa, Sinh tố, Đồ ăn nhanh.
* 👥 **Quản trị nhân sự (HRM):** Sắp xếp lịch ca làm việc linh hoạt, chấm công thông minh qua định vị và tự động tính toán sổ cái bảng lương.
* 📊 **Báo cáo tài chính (BI):** Theo dõi dòng tiền, doanh thu thực tế, kiểm kho nguyên vật liệu cuối ca và phân tích biểu đồ tăng trưởng kinh doanh.

---

## ⚡ Các tính năng cốt lõi (Key Features)

### 1. Kiến trúc cốt lõi & Tiện ích hệ thống (`app.js`)
* **Vanilla JS Router:** Bộ điều hướng Single Page mượt mà, lưu vết lịch sử di chuyển (`history.push`, `back`), chuyển đổi giao diện không tải lại trang.
* **Toast Notification System:** Hệ thống thông báo đẩy tự động thông minh (Success, Warning, Danger), tự hủy sau thời gian thiết lập và giải phóng bộ nhớ DOM để tránh rác dữ liệu.
* **Dynamic Modal Popup:** Hộp thoại động đa năng, hỗ trợ cấu hình kích thước linh hoạt, tích hợp UX tự động đóng khi click ra vùng nền đen mờ (`modal-backdrop`).
* **Bảo mật OTP xác thực:** Quy trình khôi phục mật khẩu thông qua cơ chế gửi mã OTP Demo (`123456`) và kiểm tra tính hợp lệ của độ dài mật khẩu mới.

### 2. Phân hệ Bán hàng tại quầy (`pos.js`)
* **Menu động thông minh:** Phân loại món ăn thức uống trực quan theo từng tab danh mục.
* **Giỏ hàng thời gian thực:** Tính toán tự động tổng tiền, số lượng món, cho phép đính kèm ghi chú đơn hàng của khách.
* **Đa dạng phương thức thanh toán:** Hỗ trợ linh hoạt giữa Tiền mặt (`cash`) và Chuyển khoản qua mã QR (`transfer`).
* **Quản lý danh mục cấp cao:** Tích hợp tính năng thêm món mới trực tiếp trên giao diện dành riêng cho cấp quản lý (Leader & CEO).

### 3. Hệ thống Xếp ca & Duyệt ca (`shifts.js`)
* **Đăng ký ca linh hoạt:** Nhân viên tự chủ động đăng ký ca làm việc cho tuần tiếp theo (Tùy biến theo Thứ 2 -> Chủ nhật) trước thời hạn khóa sổ (Deadline).
* **Quy trình phê duyệt thông minh:** Quản lý có thể duyệt nhanh toàn bộ ca của một nhân viên hoặc từ chối từng ca đơn lẻ.
* **Hệ thống cảnh báo an toàn nhân sự:** Tự động phát hiện và hiển thị cảnh báo `Warning` nếu một ca làm việc sau khi duyệt có tổng số nhân sự dưới 2 người.

### 4. Chấm công GPS & Nhật ký Chỉnh sửa (`attendance.js`)
* **Xác thực vị trí Check-in/out:** Mô phỏng định vị thực tế bằng công thức toán học Haversine (tính khoảng cách đường cong giữa tọa độ nhân viên và cửa hàng) để đảm bảo nhân viên check-in đúng bán kính cho phép.
* **Phát hiện ngoại lệ (Flagged Exception):** Hệ thống tự động đánh dấu cờ cảnh báo (`status: 'flag'`) đối với các trường hợp nhân viên quên check-out vào cuối ca.
* **Cơ chế Audit Log tối cao:** Cho phép Trưởng ca/CEO sửa đổi giờ chấm công sai của nhân viên. Hành động này bắt buộc phải nhập lý do giải trình và toàn bộ lịch sử chỉnh sửa sẽ được lưu lại vết nghiêm ngặt (Ai sửa, sửa lúc nào, giá trị cũ, giá trị mới).

### 5. Thiết lập Lương & Quản lý Tài chính (`payroll.js`)
* **Cấu hình mức lương theo vai trò:** Quản lý mức lương theo giờ linh hoạt cho từng nhân viên dựa trên cấp bậc chức vụ (Nhân viên, Trưởng ca, Kế toán), khống chế mức lương trần tối đa là 25.000đ/h để kiểm soát chi phí tối ưu.
* **Tổng hợp bảng lương tự động:** Kế toán quét toàn bộ số giờ làm việc thực tế từ dữ liệu chấm công đã qua kiểm duyệt để xuất bảng lương cuối tháng.
* **Xuất bản dữ liệu đa định dạng:** Tích hợp giao diện Modal lựa chọn định dạng kết xuất dữ liệu báo cáo tài chính ra file **Excel (.xlsx)** hoặc **PDF (.pdf)**.

### 6. Báo cáo chốt ca & Kiểm kho nguyên liệu (`reports.js`)
* **Bàn giao cuối ngày:** Thu ngân thực hiện tổng kết doanh thu tiền mặt thực tế đối soát với hệ thống, ghi nhận các sự cố phát sinh trong ca.
* **Kiểm kho định lượng:** Theo dõi trạng thái của các nguyên vật liệu cốt lõi (Cà phê hạt, Sữa đặc, Đá viên, Trà túi, Đường, Ly nhựa...) để kịp thời lên kế hoạch nhập hàng.
* **Khảo sát chất lượng (Rating):** Lưu vết điểm số đánh giá sao (1-5★) và phản hồi từ khách hàng trong ngày.

### 7. Hệ thống Dashboard Quản lý chuyên sâu
* **Leader Dashboard (`dashboard-leader.js`):** Giúp trưởng ca giám sát thời gian thực số lượng nhân sự đang có mặt trong ca trực, tổng đơn hàng trong ngày, doanh thu tiền mặt vs chuyển khoản, xử lý nhanh các ca chấm công bị lỗi (`flag`).
* **CEO Dashboard (`dashboard-ceo.js`):** Tích hợp thư viện đồ thị chuyên nghiệp **Chart.js v4.4.0** hiển thị biểu đồ trực quan doanh thu theo các mốc thời gian (Hôm nay, Tuần này, Tháng này) và sở hữu bộ lọc dữ liệu phân tách theo từng cơ sở/chi nhánh cụ thể (`CS1`, `CS2`...).

---

## 🔐 Hệ thống phân quyền & Bảo mật (Auth & Authorization)

### Vai trò người dùng (User Roles)
Hệ thống quản lý nghiêm ngặt 4 nhóm phân quyền cốt lõi được định nghĩa tại `data.js`:
* `employee`: Nhân viên cửa hàng. Quyền hạn: Xem lịch làm việc, đăng ký ca tuần mới, chấm công GPS, xem phiếu lương cá nhân.
* `leader`: Trưởng ca / Quản lý cơ sở. Quyền hạn: Quản lý POS, phê duyệt lịch ca, xử lý lỗi chấm công của nhân viên, xem báo cáo doanh thu cơ sở mình quản lý.
* `accountant`: Kế toán toàn chuỗi. Quyền hạn: Cấu hình mức lương nhân sự, tính toán và phê duyệt bảng lương, xuất file dữ liệu tài chính Excel/PDF.
* `ceo`: Giám đốc điều hành. Toàn quyền tối cao trên toàn hệ thống, cấu hình món ăn, xem biểu đồ phân tích kinh doanh nâng cao của tất cả các chi nhánh.

### Tài khoản thử nghiệm (Mock Accounts)

| Tài khoản (Username) | Mật khẩu (Password) | Chức vụ (Role) | Phạm vi quản lý |
| :--- | :--- | :--- | :--- |
| `ceo` | `207Coffee@123` | Giám đốc (CEO) | Toàn chuỗi hệ thống |
| `truongca1` | `207Coffee@123` | Trưởng ca (Leader) | Quản lý Cơ sở 1 (CS1) |
| `ketoan` | `207Coffee@123` | Kế toán (Accountant) | Quản lý tài chính tổng |

---

## 🛣️ Hệ thống Quản lý Giao diện (Routing System)

Do ứng dụng được thiết kế theo mô hình **Single Page Application (SPA)** dùng JavaScript thuần, các trang được quản lý dưới dạng các thành phần hiển thị (Views) và được nạp thông qua bộ định tuyến `Router.go(view)`:

| View ID (Tên Giao Diện) | Quyền truy cập (Role) | Chức năng chi tiết |
| :--- | :--- | :--- |
| `login` | Public (GUEST) | Màn hình đăng nhập hệ thống |
| `forgot-password` | Public (GUEST) | Khôi phục mật khẩu qua mã OTP |
| `employee-home` | `employee`, `leader` | Trang chủ nhân viên: Chấm công GPS, xem ca hôm nay |
| `shift-register` | `employee` | Form đăng ký lịch ca làm việc cho tuần sau |
| `my-schedule` | `employee`, `leader` | Xem lịch làm việc cá nhân đã được phê duyệt |
| `pos` | `leader`, `ceo` | Giao diện màn hình máy tính tiền / bán hàng tại quầy |
| `shift-approve` | `leader`, `ceo` | Giao diện xét duyệt lịch đăng ký ca cho nhân sự |
| `edit-attendance` | `leader`, `ceo` | Quản lý dữ liệu chấm công và sửa lỗi quên check-out |
| `leader-dashboard` | `leader`, `ceo` | Tổng quan vận hành, dòng tiền và nhân sự trong ngày của chi nhánh |
| `salary-setup` | `accountant`, `ceo` | Thiết lập và cấu hình mức lương theo giờ cho nhân sự |
| `payroll-calc` | `accountant`, `ceo` | Tổng hợp công, tính bảng lương tháng và xuất file báo cáo |
| `day-report` | `leader`, `ceo` | Biểu mẫu chốt ca, kiểm kho nguyên liệu cuối ngày |
| `ceo-dashboard` | `ceo` | Bảng phân tích số liệu đồ thị doanh thu, bộ lọc chi nhánh |

---

## 📁 Cấu trúc thư mục dự án

```text
207COFFEE/
├── index.html           # File chạy chính của ứng dụng (Entry point HTML)
├── app.js               # Khởi chạy ứng dụng, bộ định tuyến Router, module Toast & Modal
├── data.js              # Cơ sở dữ liệu Mock (DB Store), cấu hình phiên làm việc, hàm tiện ích chung
├── pos.js               # Module quản lý bán hàng tại quầy, giỏ hàng, tạo đơn hàng mới
├── shifts.js            # Module xử lý lịch đăng ký ca và quy trình phê duyệt ca của quản lý
├── attendance.js        # Module chấm công GPS, xử lý cờ ngoại lệ và ghi nhật ký Audit Log
├── payroll.js           # Module quản lý tiền lương, thiết lập biểu phí giờ làm và modal xuất file
├── reports.js           # Module biểu mẫu báo cáo chốt ca, chấm điểm và kiểm tra nguyên vật liệu
├── dashboard-leader.js  # Thành phần giao diện tổng quan vận hành dành cho Trưởng ca
├── dashboard-ceo.js     # Giao diện phân tích số liệu tài chính chuyên sâu và cấu hình biểu đồ cho CEO
└── chart.umd.min.js     # Thư viện đóng gói phân tích đồ họa Chart.js (Phiên bản v4.4.0)