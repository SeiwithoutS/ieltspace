# Tổng quan công nghệ

> Nguồn: Chương 2 §2.1 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

Chi tiết từng công nghệ nằm trong [`tech/`](tech/). Thiết kế cơ sở dữ liệu dùng chung PostgreSQL và Prisma ở [DATABASE](DATABASE.md).

## 2.1. Tổng quan lựa chọn công nghệ

Nền tảng hỗ trợ học tập và ôn luyện IELTS được xây dựng dưới dạng ứng dụng web, phục vụ ba nhóm người dùng: người học, trợ giảng và quản trị viên. Hệ thống cần đáp ứng các nghiệp vụ chính như quản lý ngân hàng đề thi, làm bài trực tuyến, chấm điểm Listening/Reading, tiếp nhận và chấm bài Writing, học từ vựng, quản lý ghi chú và thống kê tiến độ học tập. Cấu trúc hệ thống cũng cần cho phép bổ sung chức năng Speaking trong giai đoạn phát triển tiếp theo.

Việc lựa chọn công nghệ dựa trên các tiêu chí sau:

- **Phù hợp với nghiệp vụ:** hỗ trợ giao diện tương tác, dữ liệu phân cấp và phân quyền theo vai trò.
- **Phù hợp với nguồn lực:** thuận tiện triển khai trong nhóm nhỏ và thời gian thực hiện đồ án.
- **Hạn chế chi phí:** ưu tiên công nghệ mã nguồn mở và dịch vụ có gói miễn phí phục vụ thử nghiệm.
- **Dễ bảo trì:** mã nguồn được tổ chức rõ ràng, có kiểm tra kiểu và khả năng kiểm thử.
- **Dễ triển khai:** môi trường chạy có thể tái tạo trên máy phát triển, máy kiểm thử và máy chủ.
- **Có khả năng mở rộng:** cho phép bổ sung kỹ năng, dạng câu hỏi và chức năng học tập mới.

Hệ thống sử dụng kiến trúc client–server, tách biệt giao diện người dùng với phần xử lý nghiệp vụ. Backend được tổ chức theo hướng nguyên khối có phân chia module, phù hợp với quy mô MVP và không yêu cầu hạ tầng phức tạp.

**Bảng 2.1. Các công nghệ và công cụ được lựa chọn**

| Thành phần | Công nghệ, công cụ | Mục đích sử dụng |
|---|---|---|
| Ngôn ngữ nền tảng | JavaScript | Ngôn ngữ thực thi trên trình duyệt và môi trường Node.js |
| Ngôn ngữ phát triển chính | TypeScript | Phát triển frontend và backend với cơ chế kiểm tra kiểu |
| Giao diện | React | Xây dựng giao diện theo component |
| Công cụ xây dựng frontend | Vite | Chạy môi trường phát triển và đóng gói frontend |
| Định dạng giao diện | Tailwind CSS | Xây dựng responsive, sáng/tối và thiết kế nhất quán |
| Môi trường backend | Node.js | Thực thi ứng dụng phía máy chủ |
| Framework backend | Express | Xây dựng REST API và tổ chức xử lý yêu cầu |
| Cơ sở dữ liệu | PostgreSQL | Lưu trữ dữ liệu quan hệ |
| Truy cập dữ liệu | Prisma ORM | Truy vấn dữ liệu và quản lý migration |
| Dịch vụ hỗ trợ | Supabase | Cung cấp PostgreSQL, xác thực và lưu trữ tệp |
| Giao tiếp | HTTP/HTTPS, REST, JSON | Trao đổi dữ liệu giữa frontend và backend |
| Triển khai frontend | Vercel | Triển khai bản build React và cung cấp truy cập HTTPS |
| Triển khai backend | Render | Vận hành ứng dụng Node.js và REST API |
| Quản lý mã nguồn | Git, GitHub | Quản lý phiên bản và phối hợp nhóm |
| Thiết kế giao diện | Figma | Thiết kế wireframe, giao diện và prototype |
