# Nền tảng triển khai Vercel và Render

> Nguồn: Chương 2 §2.12 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.12. Nền tảng triển khai Vercel và Render

### 2.12.1. Khái niệm

Vercel và Render là các nền tảng hỗ trợ triển khai ứng dụng web từ mã nguồn. Các nền tảng này cung cấp môi trường xây dựng và vận hành ứng dụng, quản lý biến môi trường, theo dõi log và hỗ trợ kết nối với kho mã nguồn.

Trong hệ thống, Vercel được sử dụng để triển khai frontend React được xây dựng bằng Vite. Render được sử dụng để vận hành backend Node.js và Express. Backend kết nối tới PostgreSQL trên Supabase để truy cập dữ liệu nghiệp vụ.

### 2.12.2. Ưu điểm

**Giảm công việc quản trị hạ tầng:** Nhóm không cần tự cài đặt hệ điều hành, máy chủ web hoặc quản lý VPS.

**Tích hợp với GitHub:** Có thể cấu hình xây dựng và triển khai ứng dụng khi mã nguồn trên nhánh được chỉ định thay đổi.

**Hỗ trợ HTTPS:** Cung cấp khả năng truy cập ứng dụng qua kết nối được mã hóa.

**Quản lý cấu hình thuận tiện:** Biến môi trường của backend được cấu hình trên nền tảng, hạn chế việc đưa thông tin nhạy cảm vào mã nguồn.

**Phù hợp với triển khai thử nghiệm:** Có thể tận dụng gói miễn phí nếu điều kiện và hạn mức tại thời điểm sử dụng phù hợp với đồ án.

### 2.12.3. Nhược điểm

Các gói miễn phí có giới hạn về tài nguyên, lưu lượng và số lần xây dựng ứng dụng.

Backend sử dụng gói miễn phí có thể tạm ngừng khi không có truy cập, dẫn đến thời gian phản hồi ban đầu tăng lên.

Việc triển khai phụ thuộc vào trạng thái dịch vụ và chính sách của nhà cung cấp.

Frontend và backend có thể sử dụng hai tên miền khác nhau, yêu cầu cấu hình CORS phù hợp.

Filesystem của dịch vụ backend không nên được sử dụng làm nơi lưu trữ lâu dài cho ảnh hoặc audio; các tệp này được lưu trên Supabase Storage.

### 2.12.4. Lý do lựa chọn

Đồ án được thực hiện bởi nhóm nhỏ, ưu tiên hoàn thiện nghiệp vụ và hạn chế chi phí vận hành. Vercel và Render giúp triển khai frontend, backend mà không phải tự quản trị máy chủ.

Việc tách hai thành phần cho phép cập nhật giao diện và API độc lập. PostgreSQL, xác thực và lưu trữ tệp được cung cấp thông qua Supabase, giúp nhóm tập trung vào quản lý đề thi, làm bài, chấm điểm và theo dõi tiến độ học tập.
