# Tailwind CSS

> Nguồn: Chương 2 §2.5 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.5. Tailwind CSS

### 2.5.1. Khái niệm

Tailwind CSS là framework CSS theo hướng utility-first. Framework cung cấp các lớp tiện ích để điều khiển bố cục, khoảng cách, màu sắc, kiểu chữ, đường viền và trạng thái tương tác.

Tailwind CSS hỗ trợ responsive thông qua các breakpoint và cách tiếp cận mobile-first. Các biến thể sáng/tối cho phép định nghĩa giao diện phù hợp với từng chế độ hiển thị. Ứng dụng chịu trách nhiệm áp dụng và lưu lựa chọn chế độ của người dùng.

### 2.5.2. Ưu điểm

- Phát triển giao diện nhanh bằng các lớp tiện ích.
- Dễ thống nhất màu sắc, khoảng cách và kiểu chữ.
- Hỗ trợ điều chỉnh bố cục theo kích thước màn hình.
- Thuận tiện xây dựng chế độ sáng và tối.
- Phù hợp với component React và các mẫu giao diện dùng chung.
- Hỗ trợ tạo CSS dựa trên các lớp được phát hiện trong mã nguồn.

### 2.5.3. Nhược điểm

- Thuộc tính className có thể dài và khó đọc.
- Thành viên mới cần làm quen với tên lớp và các biến thể.
- Không tự bảo đảm tính nhất quán nếu nhóm thiếu quy chuẩn thiết kế.
- Một số hiệu ứng đặc thù vẫn cần CSS tùy chỉnh.
- Tên lớp tạo bằng cách ghép chuỗi động cần được xử lý phù hợp để tránh thiếu CSS khi build.

### 2.5.4. Lý do lựa chọn

Nền tảng có nhiều màn hình dành cho ba vai trò nhưng cần duy trì thiết kế thống nhất. Tailwind CSS giúp dùng chung hệ thống màu, khoảng cách và trạng thái tương tác, đồng thời giảm thời gian viết CSS riêng.

Đối với trang làm bài, framework hỗ trợ bố trí nội dung, câu hỏi và đồng hồ rõ ràng trên màn hình máy tính. Đối với dashboard và hàng đợi chấm bài, Tailwind CSS hỗ trợ xây dựng bảng, biểu mẫu và bộ lọc nhất quán. Khả năng hỗ trợ sáng/tối cũng phù hợp với yêu cầu cá nhân hóa trải nghiệm.
