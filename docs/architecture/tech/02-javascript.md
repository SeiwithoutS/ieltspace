# JavaScript

> Nguồn: Chương 2 §2.2 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.2. JavaScript

### 2.2.1. Khái niệm

JavaScript là ngôn ngữ lập trình được sử dụng phổ biến trong phát triển ứng dụng web. Trên trình duyệt, JavaScript hỗ trợ xử lý sự kiện, tương tác với giao diện và trao đổi dữ liệu với máy chủ. Thông qua môi trường Node.js, JavaScript còn có thể được thực thi phía máy chủ.

Trong hệ thống, mã nguồn ứng dụng chủ yếu được viết bằng TypeScript và chuyển đổi thành JavaScript trước khi thực thi. Vì vậy, JavaScript đóng vai trò nền tảng hoạt động chung cho cả frontend và backend.

### 2.2.2. Ưu điểm

- **Hỗ trợ tốt trên trình duyệt:** có thể triển khai các chức năng tương tác mà không yêu cầu người dùng cài đặt phần mềm bổ sung.
- **Sử dụng được ở nhiều tầng:** cùng một nền tảng ngôn ngữ có thể phục vụ giao diện và máy chủ.
- **Hệ sinh thái phong phú:** có nhiều thư viện hỗ trợ biểu mẫu, biểu đồ, âm thanh và giao tiếp API.
- **Hỗ trợ xử lý bất đồng bộ:** phù hợp với các tác vụ gọi API, tải nội dung và lưu bài làm.

### 2.2.3. Nhược điểm

- Cơ chế kiểu động có thể khiến một số lỗi chỉ xuất hiện khi chạy.
- Việc quản lý nhiều tác vụ bất đồng bộ đòi hỏi tổ chức mã rõ ràng.
- Mã chạy trên trình duyệt có thể bị người dùng xem hoặc thay đổi, do đó không phù hợp để giữ bí mật hay quyết định kết quả chấm chính thức.

### 2.2.4. Lý do lựa chọn

Hệ thống cần nhiều tương tác như chọn đáp án, đánh dấu câu hỏi, đếm thời gian, phát âm thanh và chuyển flashcard. JavaScript là nền tảng phù hợp để thực hiện những chức năng này trên trình duyệt. Việc sử dụng Node.js ở backend cũng giúp nhóm thống nhất hệ sinh thái phát triển, giảm thời gian chuyển đổi giữa các công nghệ.
