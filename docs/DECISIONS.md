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
| D08 | Trọng Phúc chốt 13/11 (rà luồng đăng đề, PROGRESS/2026-11-13). Thay phần “form ở phần thi” của D02. | Đơn vị đăng và phiên bản là exam_skills theo Test + kỹ năng + form. Bỏ exam_versions và exams.status. attempts trỏ exams, skill_attempts trỏ bản kỹ năng đã làm. band_scales.exam_type đổi thành form. |
| D09 | Trọng Phúc chốt 13/11. Giữ chốt 09/11. | Thẻ luyện ở Landing và thư viện theo kỹ năng là một kỹ năng của một Test (ví dụ “Vol 4 · Test 1 · Reading · 40 câu”), lấy từ exam_skills PUBLISHED. Chọn Passage/Section/Task/Part trong hộp Bắt đầu. Không có bảng bài luyện riêng. |
| D10 | Trọng Phúc chốt 13/11. | exam_sets thêm category và published_at. FullTests nhóm theo category, “Bộ đề cùng loại” lọc theo category, “Mới” dựa trên published_at. |
| D11 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, Phần E). | Xác thực JWT tại chỗ bằng JWKS của Supabase và cache hồ sơ người dùng 60 giây trong RAM. Đổi lấy tốc độ xác thực < 1.5ms, chấp nhận độ trễ thu hồi quyền tối đa 60 giây và token cũ còn hạn tối đa 1 giờ. |
| D12 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, E4). | Kết nối PostgreSQL dùng Supavisor transaction pooler (cổng 6543) cho ứng dụng runtime và DIRECT_URL (cổng 5432) cho Prisma CLI migration. |
| D13 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, O-B1). | Phía quản lý trên điện thoại (< 768px) chỉ hiện dải cảnh báo khuyến nghị dùng máy tính, giữ bố cục tablet và cuộn ngang trong nội dung, không làm bố cục mobile riêng. |
| D14 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, O-B2, RS-01..03). | Chặn làm bài thi trên điện thoại trước khi bắt đầu bằng màn che yêu cầu dùng máy tính; máy tính bảng chỉ cảnh báo. Lượt làm đã bắt đầu mà thu nhỏ/xoay màn hình chỉ hiện dải cảnh báo, không che để tránh mất bài. |
| D15 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, O-D1, O-D2). | Lịch sử phiên bản kỹ năng giữ vĩnh viễn mọi bản ARCHIVED, không tự xóa. Khôi phục phiên bản cũ (tạo bản nháp mới từ bản ARCHIVED) lùi sang đợt tiếp theo. |

## Điểm mở trước khi triển khai

| Vấn đề | Bằng chứng | Quyết định cần có |
|---|---|---|
| Nơi lưu tham số | Bản rà soát và phần bảng CSDL nêu system_settings, cuối CSDL vẫn đặt câu hỏi. | Bản SQL ngày 11/11 dùng bảng theo thiết kế Word, seed 72/14/10. Nhóm còn cần chốt tải mặc định của giáo viên và cách thay đổi cấu hình lúc vận hành. |
| Nhật ký đăng nhập | Bản rà soát ghi bổ sung nếu cần cho trang Người dùng. | Chốt nhu cầu hiển thị, dữ liệu tối thiểu và thời gian giữ. |
| Ngữ pháp | Chương 1 §1.3.2 có nêu, danh sách UC Chương 3 không có luồng tương ứng. | Chưa giao task triển khai. Cần xác nhận phạm vi nếu bổ sung. |

Khi chốt thay đổi mới, ghi ngày, người hoặc nguồn xác nhận, quyết định được thay thế và mã BR/task bị ảnh hưởng.
