# TypeScript

> Nguồn: Chương 2 §2.3 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.3. TypeScript

### 2.3.1. Khái niệm

TypeScript là ngôn ngữ mở rộng từ JavaScript, bổ sung hệ thống kiểu tĩnh. Mã TypeScript được chuyển đổi thành JavaScript để thực thi trên trình duyệt hoặc môi trường Node.js. Cơ chế kiểm tra kiểu giúp phát hiện sớm nhiều lỗi như truyền sai tham số, truy cập thuộc tính không tồn tại hoặc xử lý dữ liệu không đúng cấu trúc.

Trong hệ thống, TypeScript được sử dụng cho cả frontend và backend để mô tả các đối tượng như người dùng, đề thi, phần thi, cụm câu hỏi, bài làm và kết quả chấm.

### 2.3.2. Ưu điểm

- **Phát hiện lỗi sớm:** cảnh báo lỗi về kiểu dữ liệu trước khi ứng dụng được triển khai.
- **Mô hình hóa dữ liệu rõ ràng:** interface, type và union type hỗ trợ biểu diễn các dạng câu hỏi và trạng thái bài nộp.
- **Hỗ trợ công cụ phát triển:** cung cấp gợi ý mã, điều hướng định nghĩa và tái cấu trúc mã.
- **Thuận tiện làm việc nhóm:** các kiểu dữ liệu thể hiện rõ đầu vào, đầu ra của từng chức năng.
- **Tương thích hệ sinh thái JavaScript:** kết hợp thuận lợi với React, Express và Prisma.

### 2.3.3. Nhược điểm

- Cần thêm bước kiểm tra kiểu và chuyển đổi mã trước khi thực thi.
- Việc xây dựng kiểu dữ liệu chi tiết làm tăng công việc ban đầu.
- Thành viên chưa quen với generic hoặc union type cần thời gian học.
- TypeScript không tự kiểm tra dữ liệu nhận được tại thời điểm chạy.
- Sử dụng any thiếu kiểm soát làm giảm hiệu quả của hệ thống kiểu.

### 2.3.4. Lý do lựa chọn

Ngân hàng đề IELTS có cấu trúc phân cấp và nhiều loại nội dung khác nhau. Bài làm Listening/Reading chứa câu trả lời và kết quả tự động, trong khi bài Writing/Speaking còn có trạng thái phân công, điểm theo tiêu chí và nhận xét của trợ giảng.

TypeScript giúp biểu diễn rõ những khác biệt này, hạn chế nhầm lẫn khi xử lý dữ liệu. Tuy nhiên, dữ liệu từ API và file import vẫn phải được kiểm tra hợp lệ ở backend bằng các quy tắc validation riêng.
