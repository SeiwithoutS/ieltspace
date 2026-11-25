# Tiến độ nghiệm thu Supabase chính ngày 26/11/2026

## Phạm vi và trạng thái

Đối chiếu dự án Supabase chính `ielts-space` với backend IELTSpace, chạy build và kiểm thử local. `SUPABASE_URL`, `DATABASE_URL` và `DIRECT_URL` trong cấu hình hiện tại cùng trỏ về dự án chính. Frontend local gọi backend local. Đợt đối chiếu ban đầu chỉ đọc dữ liệu và kiểm tra đối tượng R2. Sau đó đã áp migration 27 trên Supabase chính và xác minh bằng dữ liệu thử trong giao dịch hoàn tác. Dự án Supabase dev dành cho kiểm thử riêng.

## Công việc đã thực hiện

- So sánh các bảng được backend sử dụng, cột nghiệp vụ, chỉ mục và trigger với mã nguồn và SQL migration. Kiểm tra riêng xóa tài khoản, Flashcard, Writing/Speaking, phân công, thông báo, hỗ trợ, media bài mẫu và ảnh từ vựng.
- Kiểm tra đủ ba vai trò có hồ sơ Auth hoạt động, ba số liệu ở Chi tiết Người học và các tham chiếu vào Supabase Storage lẫn Cloudflare R2.
- Đếm trước theo điều kiện của các job dọn dữ liệu. Chạy thử frontend và backend local, tắt các tác vụ tự động trong tiến trình thử để các lượt kiểm tra không phát sinh ghi dữ liệu.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Schema | Supabase chính | Có đủ 50 bảng, 29 cột và 9 chỉ mục trong danh sách kiểm tra. 50 bảng đã kiểm có RLS. Có `flashcard_sessions.title`, cấu trúc lượt làm W/S và khóa chống thêm trùng, bảng thông báo theo lịch và bảng phiếu hỗ trợ. |
| Xóa phiếu hỗ trợ | Supabase chính | Lần đối chiếu đầu chưa có hàm và trigger của migration 27. Sau khi áp, trigger đã hoạt động và thủ tục xóa tài khoản đã xóa đúng phiếu, phản hồi và lịch sử trong ca thử hoàn tác. |
| Auth và ba số liệu Người học | Supabase chính | Có hồ sơ Auth hoạt động cho cả ba vai trò, không thấy hồ sơ hoạt động bị thiếu danh tính Auth. Truy vấn tính được đủ ba số liệu cho cả hai Người học đang hoạt động. Có dữ liệu danh tính Google và xác nhận có Quản lý đã bật TOTP. Các dấu hiệu này chưa kiểm chứng quá trình đăng nhập, SMTP hay callback hiện tại. |
| Supabase Storage | Supabase chính | `speaking-recordings` riêng tư, giới hạn 25 MiB, có 11 đối tượng và không phát hiện bản ghi Speaking đã upload bị thiếu tệp. `sample-assets` riêng tư, giới hạn 50 MiB, chưa có đối tượng. Kho `avatars` dự phòng chưa tồn tại, ảnh đại diện hiện dùng R2. |
| Tham chiếu R2 | DB chính và Cloudflare | Hai ảnh từ vựng có trong `ieltspace-vocabpic-dev`, một ảnh đại diện có trong `ieltspace-avatars-dev`. Đây cũng là hai bucket mà cấu hình backend local hiện dùng. Danh sách R2 của tài khoản kết nối chỉ có các bucket mang hậu tố `-dev`. |
| Xem trước dọn dữ liệu | Supabase chính | Không thấy lượt W/S đủ điều kiện dọn, tệp W/S đang chờ xóa lại, media bài mẫu mồ côi hoặc ảnh từ vựng mồ côi đủ tuổi ở thời điểm kiểm. |
| Build và test | Local, PostgreSQL cô lập | Build frontend và backend, typecheck backend đều đạt. Frontend 148/148. Backend 101 đạt, 0 lỗi, 2 bỏ qua do thiếu cấu hình ca Auth thật và ca từ vựng dev. Ba bộ kiểm thử bộ đề có ghi DB nằm ngoài lượt này. Hai ca xóa phiếu và worker dọn ảnh đều đạt trên dữ liệu cô lập. |
| Chạy ứng dụng | Local | Vite và Express khởi động. `/api/health` trả 200 trong ca kiểm tra HTTP trong tiến trình. Kết nối Prisma từ shell tới DB chính không tới được máy chủ. Endpoint Auth gọi từ shell gặp lỗi DNS. Phiên điều khiển trình duyệt không mở được, nên chưa xác nhận luồng giao diện đăng nhập, nghe/tải hay đọc ba số liệu qua API live. |

## Phần còn mở

- Tác vụ dọn ảnh đã có trong backend và mặc định tắt. Lịch chạy sau khi khởi động lại chưa thể nghiệm thu trên máy chủ triển khai vì dự án chưa deploy.
- Hai bucket R2 đang phục vụ dữ liệu từ DB chính hiện mang hậu tố `-dev`. Nếu tách kho chính ra riêng, cần sao chép và đối chiếu các đối tượng hiện có cùng tham chiếu trước khi đổi kết nối. Hồ sơ ảnh đại diện chỉ lưu khóa, trong khi bản ghi ảnh từ vựng lưu cả tên bucket.
- Giới hạn khi tạo Giáo viên vẫn có hai giá trị. DB mặc định 5 bài mỗi kỹ năng, form tạo điền sẵn 10.

## Bước tiếp theo

1. Dùng tài khoản thử riêng để nghiệm thu xóa phiếu qua giao diện Quản lý khi ứng dụng kết nối được với Supabase chính.
2. Xác nhận kho R2 chính và tách kết nối thử nếu dev cần độc lập. Kiểm đăng nhập, thông báo, ba số liệu Người học và media đầu cuối từ môi trường có thể kết nối trực tiếp dịch vụ thật.
3. Khi có bản deploy thử, kiểm thông báo quanh thời điểm backend khởi động lại và xem trước dữ liệu của các job dọn trước khi bật lịch.

## Tài liệu và cách tái hiện

[Migration 27](../csdl/27_remove_deleted_learner_support_reports.sql) · [Tiến độ P1–P2](2026-11-26-xoa-phieu-ho-tro-va-don-anh-tu-vung.md) · [Báo cáo tổng hợp](2026-11-26-tong-hop.md) · [Quy tắc kiểm thử](../RULES.md).
