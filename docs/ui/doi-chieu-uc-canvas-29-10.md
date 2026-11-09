# Đối chiếu 35 UC (Chương 3, sửa 20-10 lần 2) với canvas bản 227 (29/10/2026)

Cách làm: lấy danh sách 35 UC ở `usecase/mermaid/UC00-use-case-tong-quan.mmd`, mở từng màn trong canvas và kiểm tra nội dung chính. Chưa chạy từng nhánh ngoại lệ (E1, E2...) của từng UC.

## 1. Chưa có màn (cần làm)

| UC | Còn thiếu | Ghi chú |
|---|---|---|
| UC22 Quản lý từ vựng | Không có màn Quản lý từ vựng và chủ đề trên canvas | File `AdminContent` (Bài mẫu và từ vựng) còn trong dự án nhưng đã bỏ khỏi canvas, sidebar Quản lý không có mục Từ vựng. Bài mẫu đã tách riêng nên cần trang Từ vựng riêng (bảng từ, chủ đề, trạng thái Công khai/Bản nháp/Đã ẩn, thêm/sửa/ẩn, nhập xlsx) |
| UC23 Nhập hàng loạt | Nhập xlsx chỉ có ở editor Reading và Listening | Writing, Speaking và Từ vựng chưa có hộp nhập; chưa có màn xem lịch sử nhập (lô, thời gian, kết quả) như đặc tả; `AdminImport` đã bỏ |
| UC14 Giao diện sáng/tối | Nút gạt có đủ chỗ, nhưng chưa có bản tối cho màn nào | Đã hoãn theo quyết định 26/10 (chờ chốt bản sáng) |

## 2. Có màn nhưng chưa trọn flow

| UC | Vấn đề |
|---|---|
| UC07 Làm bài | Có hộp thoại Lưu và thoát, hết giờ, nộp; nhưng chưa có chỗ vào lại lượt làm dở (thẻ "Làm tiếp" ở Dashboard hoặc Thư viện đề). Chỉ có 1 màn Reading, 1 Listening mẫu |
| UC08 Luyện theo dạng | Thư viện luyện có lọc dạng câu hỏi, nhưng chưa có màn làm bài ở chế độ luyện (nghe lại, xem lời giải ngay, nút kiểm tra) |
| UC13 Lịch sử và tiến độ | Dashboard có biểu đồ, lịch sử; chuỗi học (streak) mới hiện ở Hồ sơ, Flashcard, Landing, chưa có trên Dashboard |
| UC20 Bộ đề | Xem trước đề như người học đang dùng nút mở ExamDetail; chưa có xem trước nội dung từng kỹ năng |
| UC06 Hồ sơ | Hồ sơ Giáo viên/Quản lý (StaffProfile) vẫn dùng sidebar cũ, chưa dùng AdminSidebar mới; hồ sơ Quản lý không có mục Từ vựng |
| UC15 đến UC17 Giáo viên | Chưa dùng khuôn sidebar/topbar chung như Quản lý (mục "Teacher sidebar" còn hoãn) |
| UC12 Flashcard | Màn dùng 3 mức (Chưa nhớ, Còn phân vân, Đã nhớ); Chương 3 ghi "đã thuộc/chưa thuộc", cần chốt một cách và sửa tài liệu hoặc màn |
| UC05 Bài mẫu | Trang Speaking/Writing xong, nhưng chưa có bài tập và từ vựng đi kèm; SampleLibrary chưa có "Xem thêm" và dữ liệu thật |

## 3. Đã đủ màn (theo nội dung chính)

UC01, UC02, UC03, UC04, UC26 (cụm xác thực, Quên mật khẩu, Kiểm tra email, Đặt mật khẩu mới), UC09 (ResultLR), UC10 và UC34 và UC33 (Writing/Speaking Test, hộp thoại Hoàn thành, Gửi yêu cầu chấm, tải .docx, MyWS, PracticeWS), UC11 (ResultWS), UC16 (TeacherGrade 4 tiêu chí), UC17, UC18 (AdminGrading), UC19 (AdminUsers), UC21 (AdminSamples và hai editor bài mẫu), UC25 (AdminHome), UC27 (FullTests, ExamDetail, PracticeLibrary), UC28, UC29, UC30 (Vocab: tìm, yêu thích, ghi chú, nhãn), UC31 (Hồ sơ: band mục tiêu, số phiên), UC32 (khối động lực ở StudentLanding), UC35 (Notifications).

## 4. Dọn dẹp nhỏ

- `AdminContent.dc.html` và `AdminImport.dc.html` còn nằm trong dự án nhưng không có trên canvas; cần quyết định xóa hay dùng lại (AdminContent nên được thay bằng trang Từ vựng).
- Sidebar Quản lý chưa có mục Từ vựng.

## 5. Đề xuất thứ tự làm

1. Trang Quản lý từ vựng (UC22) kèm chủ đề và nhập xlsx, thêm mục vào AdminSidebar.
2. Lịch sử nhập xlsx (UC23) và hộp nhập cho Writing, Speaking, Từ vựng.
3. Lượt làm dở ở Dashboard (UC07) và màn làm bài chế độ luyện (UC08).
4. Sidebar Giáo viên theo khuôn chung, sửa StaffProfile.
5. Bản tối.
