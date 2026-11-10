# PostgreSQL

> Nguồn: Chương 2 §2.7 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.7. PostgreSQL

### 2.7.1. Khái niệm

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, sử dụng SQL để định nghĩa, truy vấn và cập nhật dữ liệu. Hệ quản trị hỗ trợ khóa chính, khóa ngoại, ràng buộc dữ liệu, giao dịch, chỉ mục và các kiểu dữ liệu mở rộng như JSONB.

Trong nền tảng IELTS, PostgreSQL lưu trữ các dữ liệu cốt lõi như hồ sơ người dùng, đề thi, câu hỏi, bài làm, kết quả chấm, từ vựng và ghi chú.

### 2.7.2. Ưu điểm

- **Bảo đảm toàn vẹn dữ liệu:** các ràng buộc giúp hạn chế dữ liệu thiếu hoặc tham chiếu không hợp lệ.
- **Hỗ trợ giao dịch:** phù hợp với thao tác nộp bài và import nhiều bản ghi.
- **Truy vấn tổng hợp tốt:** phục vụ thống kê điểm, số bài làm và khối lượng chấm.
- **Hỗ trợ chỉ mục:** tối ưu truy vấn theo người dùng, đề thi, trạng thái và thời gian.
- **Hỗ trợ dữ liệu linh hoạt:** JSONB có thể lưu cấu hình riêng của từng dạng câu hỏi.
- **Không mất phí bản quyền:** có thể triển khai trên máy cá nhân hoặc máy chủ.

### 2.7.3. Nhược điểm

- Cần thiết kế quan hệ và migration cẩn thận.
- Truy vấn kết hợp nhiều bảng có thể phức tạp.
- Cần lựa chọn index phù hợp để cân bằng tốc độ đọc và ghi.
- Khi tự vận hành, nhóm phải quản lý sao lưu, bảo mật và dung lượng.
- Không nên dùng làm nơi lưu trữ chính cho các tệp audio hoặc hình ảnh lớn.

### 2.7.4. Lý do lựa chọn

Dữ liệu của hệ thống có nhiều quan hệ rõ ràng: bộ đề chứa đề thi, đề thi chứa các kỹ năng, bài làm thuộc người học và bài chấm thuộc bài nộp. PostgreSQL phù hợp để quản lý các liên kết này và bảo đảm tính nhất quán.

Giao dịch được sử dụng để tránh tình trạng nộp bài chỉ lưu được một phần câu trả lời. Các truy vấn tổng hợp hỗ trợ xây dựng dashboard và theo dõi tiến bộ. Những trường nội dung linh hoạt có thể sử dụng JSONB, nhưng dữ liệu cốt lõi vẫn được tổ chức bằng các bảng quan hệ.
