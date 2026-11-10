# React và Vite

> Nguồn: Chương 2 §2.4 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.4. React và Vite

### 2.4.1. Khái niệm

React là thư viện JavaScript dùng để xây dựng giao diện người dùng theo component. Mỗi component phụ trách một phần giao diện và có thể được kết hợp, tái sử dụng để tạo thành các trang hoàn chỉnh. React cập nhật giao diện dựa trên sự thay đổi của dữ liệu và trạng thái ứng dụng.

Vite là công cụ hỗ trợ phát triển và xây dựng frontend. Công cụ cung cấp máy chủ phát triển, cơ chế cập nhật mã nhanh và quy trình tạo bản đóng gói phục vụ triển khai.

Trong hệ thống, React được sử dụng để xây dựng giao diện, còn Vite đảm nhiệm môi trường phát triển và quá trình build.

### 2.4.2. Ưu điểm

- **Tái sử dụng giao diện:** các thành phần như thẻ đề thi, câu hỏi, đồng hồ, flashcard và bảng dữ liệu có thể dùng ở nhiều trang.
- **Phù hợp với tương tác liên tục:** giao diện cập nhật theo đáp án, trạng thái lưu bài và kết quả trả về.
- **Kết hợp tốt với TypeScript:** hỗ trợ khai báo kiểu cho props, state và dữ liệu API.
- **Hệ sinh thái phong phú:** có các thư viện hỗ trợ định tuyến, biểu mẫu, biểu đồ và đa ngôn ngữ.
- **Môi trường phát triển thuận tiện:** Vite giúp khởi tạo và xây dựng ứng dụng React với cấu hình tương đối đơn giản.

### 2.4.3. Nhược điểm

- React không cung cấp sẵn toàn bộ giải pháp định tuyến, lấy dữ liệu và quản lý biểu mẫu.
- Trạng thái trang làm bài có thể phức tạp nếu không phân chia trách nhiệm hợp lý.
- Component quá lớn hoặc phụ thuộc chéo gây khó khăn khi bảo trì.
- Ứng dụng SPA cần giải pháp bổ sung nếu sau này có yêu cầu SEO cao.
- Vite không thay thế backend và không đảm nhiệm xử lý nghiệp vụ phía máy chủ.

### 2.4.4. Lý do lựa chọn

Hệ thống chủ yếu phục vụ các thao tác sau đăng nhập như làm bài, chấm bài, quản lý từ vựng và xem thống kê. Đây là những chức năng có mức độ tương tác cao, phù hợp với React.

Các thành phần hiển thị câu hỏi và bài làm có thể được tái sử dụng giữa người học và trợ giảng, trong khi quyền thao tác được điều chỉnh theo vai trò. Vite giúp giảm công việc cấu hình và đáp ứng tốt nhu cầu xây dựng frontend độc lập trong phạm vi đồ án.
