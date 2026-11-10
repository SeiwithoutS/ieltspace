# Quyết định và điểm cần chốt

| Mã | Nội dung và căn cứ | Hệ quả |
|---|---|---|
| D01 | Theo Chương 3 §3.3–3.4, Giáo viên chấm Writing/Speaking khi người học chủ động gửi bài. | Lưu bài và trừ lượt là hai thao tác riêng. |
| D02 | Rà soát 10/11 dẫn quyết định 27–29/10 đặt Academic/General ở phần thi và chốt ảnh bìa 3:2. | Editor và XLSX ghi form ở Reading/Writing. Một đề có thể chứa nhiều form. |
| D03 | Rà soát 10/11 xác nhận mỗi tệp đề nhập một kỹ năng vào bản nháp. | Ghi nguyên tử, giữ bất biến phiên bản đã công khai. |
| D04 | CSDL nhóm người dùng, rà soát 10/11 và middleware Auth thống nhất dùng khóa hồ sơ riêng. | Tra người dùng bằng auth_user_id duy nhất. Dùng users.id cho quan hệ nghiệp vụ. |
| D05 | CSDL và rà soát 10/11 ghi rõ bỏ nhãn từ vựng. CSDL quy định tự đánh giá flashcard hai mức. | UC30 giữ phần ghi chú. Dùng “Chưa nhớ” và “Đã nhớ”. |
| D06 | UC13 BR9 và rà soát 10/11 tính hoạt động học theo lượt làm. | Mỗi attempt hoàn thành sinh tối đa một hoạt động, kể cả khi có nhiều kỹ năng. Phiên flashcard hợp lệ có nguồn riêng. |
| D07 | Rà soát 10/11 chuyển thông điệp hằng ngày sang dữ liệu khởi tạo/tệp tài nguyên. | UC32 vẫn hiển thị thông điệp, bỏ bảng daily_motivations. |

## Điểm mở trước khi triển khai

| Vấn đề | Bằng chứng | Quyết định cần có |
|---|---|---|
| Tên cột bảng quy đổi Reading | CSDL đang ghi band_scales.exam_type và đặt câu hỏi đổi thành form. | Chốt tên, cách chọn đúng thang khi cùng đề có cả hai form và cách chuyển dữ liệu. |
| Nơi lưu tham số | Bản rà soát và phần bảng CSDL nêu system_settings, cuối CSDL vẫn đặt câu hỏi. | Bản SQL ngày 11/11 dùng bảng theo thiết kế Word, seed 72/14/10. Nhóm còn cần chốt tải mặc định của giáo viên và cách thay đổi cấu hình lúc vận hành. |
| Nhật ký đăng nhập | Bản rà soát ghi bổ sung nếu cần cho trang Người dùng. | Chốt nhu cầu hiển thị, dữ liệu tối thiểu và thời gian giữ. |
| Ngữ pháp | Chương 1 §1.3.2 có nêu, danh sách UC Chương 3 không có luồng tương ứng. | Chưa giao task triển khai. Cần xác nhận phạm vi nếu bổ sung. |

Khi chốt thay đổi mới, ghi ngày, người hoặc nguồn xác nhận, quyết định được thay thế và mã BR/task bị ảnh hưởng.
