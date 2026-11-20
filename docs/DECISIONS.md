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
| D14 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, O-B2, RS-01..03); sửa lại bởi D17. | Ban đầu: chặn điện thoại, tablet chỉ cảnh báo. Đã thay bằng D17. |
| D15 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11, O-D1, O-D2). | Lịch sử phiên bản kỹ năng giữ vĩnh viễn mọi bản ARCHIVED, không tự xóa. Khôi phục phiên bản cũ (tạo bản nháp mới từ bản ARCHIVED) lùi sang đợt tiếp theo. |
| D16 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11 đợt 2, R1). | Một header người học duy nhất ở `frontend/src/components/navigation/LearnerHeader.tsx`, gộp thiết kế responsive 3 mốc (>=1024, 768-1023, <768) với hỗ trợ theme CSS (`--attempt-*`), NotificationBadge và PageLink hash router. Xóa bản thừa ở `components/attempts/LearnerHeader.tsx`. |
| D17 | Trọng Phúc chốt 15/11 (Kế hoạch 15/11 đợt 2, O-R4). | Giữ `DesktopOnly.tsx` của THuong làm nơi duy nhất thực thi: màn dưới 1024px hoặc cảm ứng không làm bài được, kể cả lượt đã bắt đầu (bị che, nội dung vẫn giữ). `ExamDetail` dùng chung điều kiện (`lib/device.ts`) để chặn trước khi tạo lượt. |
| D18 | Người dùng chốt 20/11, quản trị đợt 2–3. | Giữ toàn bộ lịch sử đăng nhập ứng dụng. Cấm Quản lý tự khóa và tự hạ quyền. Có thể thao tác trên Quản lý khác nếu giữ ít nhất một Quản lý hoạt động. Cấp/thu hồi vai trò Quản lý và khóa/mở tài khoản Quản lý cần mã bảo mật dùng một lần do website gửi. |
| D19 | Người dùng chốt 20/11, quản trị đợt 4–5. | Mời/xóa Quản lý cần mã bảo mật. Khi xóa, bỏ Auth, tên/email/ảnh, dữ liệu học cá nhân, ghi chú và bài nộp. Giữ ID ẩn danh, điểm/kết quả đã công bố và audit. Dùng hộp xác nhận quản trị hiện có. |

## Điểm mở trước khi triển khai

| Vấn đề | Bằng chứng | Quyết định cần có |
|---|---|---|
| Nơi lưu tham số | Bản rà soát và phần bảng CSDL nêu system_settings, cuối CSDL vẫn đặt câu hỏi. | Bản SQL ngày 11/11 dùng bảng theo thiết kế Word, seed 72/14/10. Nhóm còn cần chốt tải mặc định của giáo viên và cách thay đổi cấu hình lúc vận hành. |
| Ngữ pháp | Chương 1 §1.3.2 có nêu, danh sách UC Chương 3 không có luồng tương ứng. | Chưa giao task triển khai. Cần xác nhận phạm vi nếu bổ sung. |

Khi chốt thay đổi mới, ghi ngày, người hoặc nguồn xác nhận, quyết định được thay thế và mã BR/task bị ảnh hưởng.
