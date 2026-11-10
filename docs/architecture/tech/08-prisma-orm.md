# Prisma ORM

> Nguồn: Chương 2 §2.8 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.8. Prisma ORM

### 2.8.1. Khái niệm

Prisma là bộ công cụ truy cập dữ liệu dành cho ứng dụng JavaScript và TypeScript. Prisma cho phép mô tả mô hình dữ liệu bằng schema, sinh bộ truy vấn có hỗ trợ kiểu và quản lý thay đổi cấu trúc cơ sở dữ liệu thông qua migration.

Trong hệ thống, Prisma là lớp kết nối giữa backend Express và PostgreSQL.

### 2.8.2. Ưu điểm

- **Hỗ trợ kiểu dữ liệu:** giảm lỗi khi truy vấn và sử dụng kết quả trong TypeScript.
- **Giảm mã lặp:** thuận tiện thực hiện các thao tác tạo, đọc, cập nhật và xóa.
- **Quản lý migration:** giúp các thành viên đồng bộ cấu trúc database.
- **Hỗ trợ quan hệ và giao dịch:** phù hợp với cấu trúc đề thi và quy trình nộp bài.
- **Mô hình dữ liệu rõ ràng:** schema hỗ trợ việc đọc hiểu và bảo trì.

### 2.8.3. Nhược điểm

- Cần học cú pháp schema và cách xử lý quan hệ.
- Một số truy vấn phức tạp vẫn cần SQL trực tiếp.
- ORM không tự bảo đảm hiệu năng; truy vấn vẫn có thể lấy thừa dữ liệu.
- Migration cần được kiểm tra trước khi áp dụng lên cơ sở dữ liệu đang sử dụng.

### 2.8.4. Lý do lựa chọn

Prisma phù hợp với backend TypeScript và giúp nhóm giảm thời gian viết mã truy cập dữ liệu. Migration hỗ trợ theo dõi thay đổi của các bảng khi bổ sung dạng câu hỏi, trạng thái bài nộp hoặc tiêu chí chấm.

Đối với các nghiệp vụ như nộp bài và import ngân hàng đề, Prisma hỗ trợ thực hiện nhiều thao tác trong một giao dịch. Các truy vấn thống kê đặc thù có thể sử dụng SQL khi cần thiết.
