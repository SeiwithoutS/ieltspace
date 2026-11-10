# Supabase

> Nguồn: Chương 2 §2.9 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.9. Supabase

### 2.9.1. Khái niệm

Supabase là nền tảng cung cấp các dịch vụ hỗ trợ phát triển ứng dụng, bao gồm cơ sở dữ liệu PostgreSQL, xác thực người dùng và lưu trữ tệp. Supabase không thay thế PostgreSQL bằng một hệ quản trị khác mà cung cấp PostgreSQL dưới dạng dịch vụ được quản lý.

Trong phạm vi hệ thống, các thành phần được sử dụng gồm:

- **Supabase Database:** cung cấp PostgreSQL cho môi trường thử nghiệm trực tuyến.
- **Supabase Auth:** hỗ trợ đăng ký, đăng nhập và quản lý phiên xác thực.
- **Supabase Storage:** lưu ảnh đại diện, audio Listening và file ghi âm khi chức năng Speaking được triển khai.

### 2.9.2. Ưu điểm

- Giảm công việc cài đặt và vận hành dịch vụ.
- Tích hợp database, xác thực và lưu trữ trên cùng nền tảng.
- Có giao diện quản lý dữ liệu thuận tiện.
- Có gói miễn phí phục vụ phát triển và thử nghiệm trong hạn mức quy định.
- Hỗ trợ bucket riêng tư và đường dẫn truy cập có thời hạn cho tệp cần bảo vệ.

### 2.9.3. Nhược điểm

- Phụ thuộc vào kết nối mạng và trạng thái dịch vụ.
- Gói miễn phí có giới hạn tài nguyên, dung lượng và lưu lượng.
- Các chính sách về tạm dừng dự án, sao lưu hoặc gửi email có thể thay đổi.
- Việc sử dụng Auth và Storage tạo thêm phụ thuộc vào API của nền tảng.
- Vẫn cần thiết kế phân quyền đúng, không thể chỉ dựa vào việc người dùng đã đăng nhập.

### 2.9.4. Lý do lựa chọn

Supabase giúp nhóm giảm công việc vận hành, tập trung vào các nghiệp vụ học tập và chấm bài. PostgreSQL được cung cấp sẵn, trong khi Auth và Storage đáp ứng những nhu cầu phổ biến mà không phải tự xây dựng toàn bộ.

Frontend thực hiện đăng nhập qua Supabase Auth và gửi access token khi gọi backend. Backend phải xác minh token, kiểm tra trạng thái tài khoản, vai trò và quyền đối với tài nguyên. Hồ sơ nghiệp vụ liên kết với định danh xác thực; hệ thống không lưu thêm bản sao mật khẩu.

Các tệp được lưu trong Storage, còn database lưu đường dẫn đối tượng và metadata. Bài ghi âm cá nhân phải được kiểm soát truy cập, không công khai mặc định.

Khi backend truy cập PostgreSQL bằng Prisma với tài khoản có quyền rộng, backend phải thực hiện đầy đủ kiểm tra phân quyền. Không được mặc định rằng chính sách bảo mật áp dụng cho truy cập qua Supabase API sẽ tự bảo vệ mọi truy vấn Prisma.
