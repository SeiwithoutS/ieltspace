# 03. Use case (35 UC) và các quyết định rà soát

Cập nhật 09/11/2026. Nguồn: Chương 3 bản "sửa 20-10 lần 2", quyết định rà soát ngày 20/10, đối chiếu canvas 29/10.

## 1. Danh sách use case

| UC | Tên | Tác nhân |
|---|---|---|
| UC01 | Đăng nhập | Người dùng |
| UC02 | Đăng xuất | Người dùng |
| UC03 | Xem trang giới thiệu | Khách |
| UC04 | Đăng ký | Khách |
| UC05 | Xem bài mẫu | Khách |
| UC06 | Quản lý thông tin cá nhân | Người học, Giáo viên, Quản lý |
| UC07 | Làm bài kiểm tra | Người học |
| UC08 | Luyện theo dạng câu hỏi | Người học |
| UC09 | Xem kết quả và lời giải | Người học |
| UC10 | Hoàn thành và lưu bài Writing/Speaking | Người học |
| UC11 | Xem nhận xét của Giáo viên | Người học |
| UC12 | Ôn tập từ vựng bằng flashcard | Người học |
| UC13 | Xem lịch sử và thống kê | Người học |
| UC14 | Tùy chỉnh giao diện (sáng/tối) | Người học, Giáo viên, Quản lý |
| UC15 | Xem hàng đợi bài chờ chấm | Giáo viên |
| UC16 | Chấm bài Writing/Speaking | Giáo viên |
| UC17 | Xem lịch sử bài đã chấm | Giáo viên |
| UC18 | Theo dõi hoạt động hỗ trợ chấm | Quản lý |
| UC19 | Quản lý người dùng | Quản lý |
| UC20 | Quản lý Bộ đề và Đề thi | Quản lý |
| UC21 | Quản lý bài mẫu | Quản lý |
| UC22 | Quản lý từ vựng | Quản lý |
| UC23 | Nhập dữ liệu hàng loạt (include UC24) | Quản lý |
| UC24 | Kiểm tra hợp lệ dữ liệu | Quản lý |
| UC25 | Xem thống kê hệ thống | Quản lý |
| UC26 | Khôi phục mật khẩu (extend UC01) | Người dùng |
| UC27 | Xem thư viện đề | Khách, Người học |
| UC28 | Tra cứu thư viện từ vựng | Khách, Người học |
| UC29 | Quản lý từ yêu thích | Người học |
| UC30 | Quản lý ghi chú và nhãn | Người học |
| UC31 | Thiết lập mục tiêu học tập | Người học |
| UC32 | Daily Motivation | Người học |
| UC33 | Tải bài làm W/S (.docx / ghi âm) | Người học |
| UC34 | Gửi yêu cầu hỗ trợ chấm W/S (extend UC10) | Người học |
| UC35 | Xem và quản lý thông báo | Người học, Giáo viên, Quản lý |

"Người dùng" là tác nhân trừu tượng trên sơ đồ tổng quan (Hình 3.2). Sơ đồ hoạt động và tuần tự từng UC (Mermaid): [usecase/so-do-dac-ta-use-case.md](usecase/so-do-dac-ta-use-case.md).

## 2. Quyết định rà soát đã chốt (20/10/2026)

- Giữ chế độ sáng/tối (UC14 cho cả 3 vai trò); bỏ song ngữ.
- Thông báo: trung tâm thông báo trong hệ thống (UC35) cho 3 vai trò, có chấm đỏ số chưa đọc. **Không gửi email hay push.**
- Bảng quy đổi band và bộ tiêu chí W/S là dữ liệu khởi tạo cố định (seed), không có UC cấu hình.
- UC08 cho luyện cả W/S theo từng Task/Part (L/R theo Question Group).
- Phiên học hợp lệ = hoàn thành 1 lượt UC07, 1 bài UC08 hoặc 1 phiên flashcard (hết tập hoặc từ 10 thẻ khác nhau). Số thẻ tối thiểu là tham số cấu hình, mặc định 10. Streak khi có ít nhất 1 phiên/ngày.
- Listening: đề đầy đủ chỉ nghe 1 lần; chế độ luyện được nghe lại. Ghi âm lại Speaking chỉ khi luyện (UC08).
- Bắt buộc xác minh email khi đăng ký. Tài khoản Giáo viên/Quản lý mới nhận email mời đặt mật khẩu. Đăng nhập/đăng ký bằng Google: tài khoản là Người học, bỏ qua xác minh email (thêm 26/10, Chương 3 UC01/UC04 chưa ghi luồng này).
- Người học bị khóa: giữ yêu cầu chấm. Bị xóa: hủy yêu cầu chưa có kết quả, không hoàn bonus.
- Giáo viên được lưu nháp khi chấm.
- Có lưu tự động bài làm và làm tiếp lượt dở; ngoại lệ không có micro; mục 3.4.9 "Tác vụ tự động".
- Bài mẫu gồm Writing (Task 1 Academic/General, Task 2) và Speaking (Part 1/2/3, có thể kèm audio).
- Nhập hàng loạt dùng xlsx (xem [06 Nhập liệu xlsx](06-nhap-lieu-xlsx.md)).
- UC32 Daily Motivation đặt ở Trang chủ người học (khối "Động lực mỗi ngày").

Chi tiết 29 lỗ hổng rà soát: [usecase/ra-soat-uc-chuong3-2026-10-20.md](usecase/ra-soat-uc-chuong3-2026-10-20.md).

## 3. Đối chiếu UC với giao diện (29/10)

Bảng đầy đủ: [ui/doi-chieu-uc-canvas-29-10.md](ui/doi-chieu-uc-canvas-29-10.md). Tóm tắt phần còn thiếu lúc đó:

- Chưa có màn: UC22 Quản lý từ vựng, lịch sử nhập (UC23), bản tối cho các màn (UC14).
- Chưa trọn flow: làm tiếp lượt dở (UC07), màn làm bài chế độ luyện (UC08), streak trên Dashboard (UC13), sidebar Giáo viên theo khuôn chung (UC15-UC17), flashcard 3 mức hay 2 mức (UC12, chưa chốt).
