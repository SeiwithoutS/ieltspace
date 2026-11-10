# REST API, HTTP/HTTPS và JSON

> Nguồn: Chương 2 §2.10 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.10. REST API, HTTP/HTTPS và JSON

### 2.10.1. Khái niệm

REST là phong cách thiết kế API hướng tài nguyên. Các tài nguyên như đề thi, bài làm và từ vựng được truy cập thông qua URL và các phương thức HTTP như GET, POST, PATCH và DELETE.

JSON là định dạng trao đổi dữ liệu dạng văn bản, phù hợp để biểu diễn đối tượng và danh sách. HTTPS bảo vệ dữ liệu trên đường truyền thông qua mã hóa kết nối.

### 2.10.2. Ưu điểm

- Tách biệt frontend và backend, thuận tiện phát triển song song.
- Được hỗ trợ rộng rãi bởi trình duyệt và các công cụ kiểm thử.
- JSON dễ sử dụng với JavaScript và TypeScript.
- Có thể tận dụng mã trạng thái HTTP để biểu diễn kết quả xử lý.
- Tạo nền tảng tái sử dụng API nếu phát triển ứng dụng di động sau này.

### 2.10.3. Nhược điểm

- Cần thống nhất cấu trúc request, response và thông báo lỗi.
- Có thể phát sinh nhiều lượt gọi API nếu thiết kế tài nguyên không hợp lý.
- Không tự cung cấp validation hay phân quyền.
- Các danh sách lớn cần phân trang, lọc và giới hạn dữ liệu trả về.

### 2.10.4. Lý do lựa chọn

REST API phù hợp với các nghiệp vụ quản lý và trao đổi dữ liệu của hệ thống. Frontend có thể lấy danh sách đề, lưu câu trả lời và gửi bài nộp thông qua giao diện giao tiếp thống nhất.

API lấy đề không được trả về đáp án chuẩn trước thời điểm người học được phép xem. Điểm chính thức phải được tính hoặc xác nhận ở backend. Những thao tác như nộp bài cần có cơ chế chống xử lý trùng khi người dùng gửi lại yêu cầu do lỗi mạng.
