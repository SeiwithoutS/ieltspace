# Node.js và Express

> Nguồn: Chương 2 §2.6 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.6. Node.js và Express

### 2.6.1. Khái niệm

Node.js là môi trường thực thi JavaScript phía máy chủ, hỗ trợ mô hình xử lý hướng sự kiện và các thao tác vào/ra bất đồng bộ. Express là framework web hoạt động trên Node.js, cung cấp cơ chế định tuyến, middleware và xử lý yêu cầu HTTP.

Trong hệ thống, Node.js và Express được sử dụng để xây dựng REST API. Backend tiếp nhận yêu cầu từ frontend, kiểm tra dữ liệu và quyền truy cập, thực hiện nghiệp vụ, sau đó trả kết quả.

### 2.6.2. Ưu điểm

- **Thống nhất công nghệ:** sử dụng TypeScript cho cả frontend và backend.
- **Phù hợp với ứng dụng API:** hỗ trợ tốt các thao tác truy vấn dữ liệu và giao tiếp mạng.
- **Cấu trúc linh hoạt:** Express cho phép tổ chức các module theo nghiệp vụ.
- **Dễ tích hợp:** có nhiều thư viện phục vụ validation, xác thực, kiểm thử và xử lý tệp.
- **Chi phí tiếp cận thấp:** phù hợp với nhóm nhỏ đã có kiến thức JavaScript.

### 2.6.3. Nhược điểm

- Express không áp đặt kiến trúc nên nhóm phải tự quy định cách tổ chức mã.
- Cần chủ động xây dựng xử lý lỗi, validation và phân quyền.
- Tác vụ tính toán nặng có thể ảnh hưởng khả năng phục vụ nếu chạy trực tiếp trên luồng xử lý chính.
- Việc sử dụng nhiều thư viện bên thứ ba yêu cầu kiểm soát phiên bản và cập nhật bảo mật.

### 2.6.4. Lý do lựa chọn

Backend của hệ thống chủ yếu xử lý quản lý người dùng, đề thi, bài làm và thống kê. Chức năng chấm Listening/Reading dựa trên đáp án mẫu có độ phức tạp tính toán phù hợp với Node.js.

Backend được tổ chức theo các module nghiệp vụ như:

- Người dùng và phân quyền.
- Ngân hàng đề thi.
- Phiên làm bài và bài nộp.
- Phân công và chấm bài.
- Từ vựng và ghi chú.
- Import dữ liệu.
- Lịch sử và thống kê.

Việc chia theo nghiệp vụ giúp tránh lặp lại logic giữa User, Assistant và Admin. Quyền truy cập được kiểm tra tại từng API và đối với từng tài nguyên cụ thể.
