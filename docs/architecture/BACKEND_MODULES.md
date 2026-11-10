# Các module backend

> Nguồn: Chương 3 §3.2 (Chương 3 - bản team 10-11 (đã đồng bộ).docx). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 3.2. Các module của backend

Backend chia thành các module bám theo nhóm chức năng đã nêu ở Chương 1. Mỗi module gồm tuyến API (route), bộ điều khiển (controller), lớp nghiệp vụ (service) và truy cập dữ liệu, nên có thể bảo trì hoặc bổ sung một module mà ít ảnh hưởng đến các module còn lại.

**Bảng 3.2. Các module của backend**

| Module | Chức năng chính |
|---|---|
| Người dùng và xác thực | Đăng ký, đăng nhập, đăng xuất và quản lý phiên truy cập; quản lý hồ sơ cá nhân; khóa/mở tài khoản; phân quyền Người học, Giáo viên và Quản lý |
| Đề thi | Quản lý và tra cứu cấu trúc Bộ đề → Đề thi → Kỹ năng → Phần → Question Group → Question → Answer/Rubric |
| Làm bài | Nhận và lưu bài theo kỹ năng hoặc cụm câu hỏi; chấm tự động Listening/Reading; tính số câu đúng, tỷ lệ chính xác và band đối với bài đủ điều kiện; lưu nội dung Writing/Speaking theo thời hạn, hỗ trợ tải bài và xử lý xóa nội dung hết hạn |
| Chấm bài | Kiểm tra và sử dụng lượt miễn phí/bonus; tiếp nhận yêu cầu hỗ trợ; quản lý hàng đợi và tự động phân công; chấm theo tiêu chí; xử lý hủy, hoàn bonus và cập nhật thời hạn nội dung sau khi công bố kết quả<br>lưu điểm, nhận xét và cập nhật trạng thái bài nộp |
| Từ vựng | Quản lý từ vựng và chủ đề; cung cấp danh sách từ, flashcard, từ yêu thích, ghi chú và nhãn cá nhân; cho phép Quản lý tạo, chỉnh sửa, xóa hoặc ẩn nội dung từ vựng |
| Bài mẫu | Quản lý và tra cứu bài mẫu; cho phép Quản lý tạo, chỉnh sửa, xóa hoặc ẩn bài mẫu, phân loại theo kỹ năng (Writing, Speaking), chủ đề và liên kết với đề hoặc phần thi khi cần |
| Thống kê và động lực | Lịch sử học tập, thống kê kết quả theo kỹ năng, biểu đồ tiến độ, streak và Daily Motivation |
| Quản trị và nhập dữ liệu | Dashboard tổng quan, giám sát hoạt động hỗ trợ chấm; nhập đề thi, bài mẫu và từ vựng bằng tệp xlsx theo mẫu chuẩn có bước kiểm tra hợp lệ trước khi lưu |

Các chức năng quản trị nội dung được xử lý tại module nghiệp vụ tương ứng. Module Quản trị và nhập dữ liệu cung cấp thống kê tổng quan và điều phối quá trình nhập dữ liệu hàng loạt; việc kiểm tra quy tắc nghiệp vụ và lưu nội dung được thực hiện thông qua module Đề thi, Từ vựng hoặc Bài mẫu.
