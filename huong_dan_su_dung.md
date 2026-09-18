# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG ĐIỀU PHỐI PHỎNG VẤN K71

Tài liệu này cung cấp hướng dẫn chi tiết về cách vận hành hệ thống điều phối phỏng vấn dành cho tất cả các vai trò: **Quản trị viên (Admin)**, **Lễ tân (Receptionist)**, **Người phỏng vấn (Interviewer)** và **Ứng viên (Candidate)**.

---

## 1. Vai trò Quản trị viên (Admin)

Admin có toàn quyền quản lý hệ thống, từ nhân sự, danh sách ứng viên đến kết quả phỏng vấn.
*Truy cập bằng tài khoản có quyền admin. Giao diện tại: `/admin`*

### 1.1. Quản lý Nhân sự (Người phỏng vấn / Lễ tân)
- **Thêm nhân sự:** Điền `Tài khoản (để login)` (thường là mã sinh viên của nhân sự), `Họ và Tên` và chọn `Ban` tương ứng. Sau đó nhấn **Thêm**.
- **Cấp / Thu hồi quyền:** Trong danh sách nhân sự, bạn có thể click vào các nút trạng thái (Quản trị, Lễ tân, Phỏng vấn) bên cạnh tên mỗi người để bật/tắt quyền tương ứng. Nút hiện màu xanh là đã cấp quyền, màu xám là chưa có.
- **Xóa nhân sự:** Nhấn biểu tượng thùng rác màu đỏ để xóa tài khoản nhân sự (hành động này cần xác nhận).

### 1.2. Quản lý Ứng viên
- **Upload danh sách (Excel):** Sử dụng nút **Tải file lên** để import danh sách ứng viên hàng loạt từ file Excel. Bạn có thể chọn tải lên cho Ban TCKT hoặc Ban Cán sự.
- **Thêm ứng viên thủ công:** Điền mã ứng viên (MSSV) và họ tên rồi ấn **Thêm**.
- **Xóa toàn bộ dữ liệu:** Nhấn nút **Xóa/Làm sạch** để reset toàn bộ hệ thống (xóa hết kết quả đánh giá, reset trạng thái ứng viên về ban đầu). Yêu cầu nhập mật khẩu bảo mật (Password làm sạch).

### 1.3. Theo dõi Bảng điều khiển (Dashboard)
- Admin có thể theo dõi tiến độ tổng quan: số lượng người đang chờ, đang phỏng vấn, đã xong, theo từng ban.
- Có thể dùng chức năng **Đóng vai** (Sang Lễ tân / Sang Người PV) trên thanh công cụ để trải nghiệm tính năng của các vai trò khác mà không cần đăng nhập lại.

### 1.4. Xem Báo cáo & Đánh giá
- **Xuất Excel:** Bấm nút **Xuất Excel** để tải báo cáo kết quả phỏng vấn chi tiết (điểm từng tiêu chí, nhận xét, quyết định) về máy tính.
- **Xem chi tiết:** Chọn bất kỳ ứng viên nào đã phỏng vấn xong để đọc lại bình luận và điểm số của người phỏng vấn.

---

## 2. Vai trò Lễ tân (Receptionist)

Lễ tân là người bao quát tình hình tại khu vực chờ, hỗ trợ ứng viên check-in và điều phối hiển thị màn hình TV.
*Truy cập bằng tài khoản có quyền lễ tân. Giao diện tại: `/receptionist`*

### 2.1. Quản lý Màn hình TV
- Nhấn nút **Mở màn hình TV** để bật giao diện bảng hàng chờ lớn (Dashboard).
- Giao diện này dùng để trình chiếu lên màn hình lớn/máy chiếu ở khu vực chờ để ứng viên tự theo dõi số thứ tự và trạng thái của mình.

### 2.2. Hỗ trợ Check-in hộ
Nếu ứng viên không mang điện thoại hoặc không tự truy cập web được:
1. Nhấn nút **Check-in Hộ**.
2. Nhập chính xác **MSSV** (Mã sinh viên) của ứng viên.
3. Chọn **Ban (TCKT / BCS)** mà ứng viên ứng tuyển.
4. Bấm **Check-in**. Hệ thống sẽ đối chiếu MSSV này với danh sách của Ban đó. Nếu có thông tin, ứng viên sẽ được đưa vào hàng chờ. Nếu không có, hệ thống sẽ báo lỗi.

---

## 3. Vai trò Người phỏng vấn (Interviewer)

Đây là chức năng dành cho các thành viên trực tiếp tham gia phỏng vấn tại các bàn.
*Truy cập bằng tài khoản có quyền phỏng vấn. Giao diện tại: `/interviewer`*

### 3.1. Thiết lập vị trí
- Ngay khi đăng nhập, hệ thống sẽ yêu cầu bạn nhập **Số Phòng** và **Số Bàn**. 
- Hãy nhập chính xác vì đây là vị trí mà hệ thống sẽ chỉ đường cho ứng viên tìm đến bạn.

### 3.2. Gọi ứng viên (2 Chế độ)
- **Tự động gọi (Auto-assign):** Bật công tắc "Tự động gọi ứng viên". Cứ mỗi khi bàn của bạn trống, hệ thống sẽ tự động bốc ứng viên đang chờ lâu nhất vào bàn của bạn.
- **Gọi thủ công:** Tắt tự động gọi. Ấn nút **Hàng chờ** và chủ động bấm "Gọi" một ứng viên cụ thể trong danh sách đang chờ.

### 3.3. Quy trình một phiên phỏng vấn
1. **Chờ ứng viên di chuyển:** Sau khi được gọi, trạng thái ứng viên chuyển thành "Đang di chuyển". 
2. **Xác nhận có mặt:** Khi ứng viên đã bước tới bàn, hãy bấm nút **XÁC NHẬN ĐÃ CÓ MẶT**.
3. **Tiến hành phỏng vấn:** Màn hình sẽ hiện Hồ sơ/CV của ứng viên (cột bên trái) và Form Đánh giá (cột bên phải).
4. **Đánh giá:**
   - Kéo thanh điểm (1-10) cho 3 tiêu chí: *Thái độ & Tác phong*, *Kỹ năng chuyên môn*, *Xử lý tình huống*.
   - Nhập **Nhận xét chi tiết** vào khung chữ.
   - Chọn một trong ba quyết định: **Đạt**, **Cân nhắc thêm**, hoặc **Không đạt**.
5. **Hoàn tất:** Bấm **Hoàn tất đánh giá & Lưu**. Ứng viên này sẽ kết thúc và hệ thống tự động gọi ứng viên tiếp theo (nếu bật Auto-assign).

### 3.4. Các chức năng hỗ trợ khác
- **Đổi trạng thái Bận/Nghỉ:** Gạt công tắc trạng thái ở góc phải để tạm nghỉ. Hệ thống sẽ không tự động gọi thêm ứng viên cho bạn.
- **Rời bàn:** Bấm biểu tượng Cửa/Thoát để rời bàn (bạn sẽ cần chọn lại số bàn khi quay lại).
- **Hủy phỏng vấn:** Nếu ứng viên được gọi mà bỏ về không tới bàn, bấm biểu tượng "X" (Hủy bỏ) để trả họ về hàng chờ, giải phóng bàn.
- **Kênh Chat:** Sử dụng hộp Chat ở góc dưới bên phải để liên lạc nhanh với Admin, Lễ tân và các bàn phỏng vấn khác.

---

## 4. Vai trò Ứng viên (Candidate)

Ứng viên tự truy cập vào hệ thống bằng điện thoại cá nhân.
*Giao diện tại trang chủ hệ thống (Mặc định).*

### 4.1. Đăng nhập và Check-in
1. Ứng viên truy cập trang web hệ thống.
2. Nhập **MSSV** của mình.
3. Nếu ứng viên ứng tuyển vào cả 2 ban, hệ thống sẽ hỏi ứng viên muốn check-in cho Ban nào trước.
4. Đăng nhập thành công, ấn nút **XÁC NHẬN CHECK-IN** to đùng trên màn hình để báo danh. 

### 4.2. Theo dõi trạng thái
- Màn hình điện thoại sẽ báo "Đang đợi tới lượt" và hiển thị số thứ tự.
- Ứng viên có thể cất điện thoại hoặc nhìn lên màn hình TV lớn.

### 4.3. Di chuyển đến bàn
- Khi được Lễ tân hoặc Người phỏng vấn gọi, điện thoại ứng viên sẽ **rung lên**, màn hình chuyển sang **màu xanh lá cây** và báo thông tin: *Vui lòng di chuyển đến PHÒNG X, BÀN Y*.
- Ứng viên bấm nút **ĐÃ HIỂU, ĐANG DI CHUYỂN TỚI BÀN** trên điện thoại để thông báo mình đang đi tới.
- Khi ứng viên đến bàn và người phỏng vấn ấn xác nhận, màn hình điện thoại ứng viên sẽ chuyển sang thông báo chúc thi tốt. 

---

## 5. Lưu ý chung
- Hệ thống hoạt động theo thời gian thực (Real-time). Mọi thao tác check-in, chấm điểm, gọi người đều lập tức hiển thị cho tất cả mọi người (không cần phải tải lại trang/F5).
- Trong trường hợp mạng chập chờn, nếu thấy dữ liệu không khớp, chỉ cần F5 (làm mới) lại trình duyệt web.
- Vui lòng phân công 1 người trực tài khoản Admin để có thể xử lý các sự cố khẩn cấp (như việc nhầm lẫn MSSV) qua tính năng thêm/xóa ứng viên.
