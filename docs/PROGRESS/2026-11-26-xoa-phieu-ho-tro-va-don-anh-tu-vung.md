# Tiến độ xóa phiếu hỗ trợ và dọn ảnh từ vựng ngày 26/11/2026

## Phạm vi và trạng thái

Đã thêm mã cho P1 (RS-A05) và P2. Quản lý xóa tài khoản Người học qua luồng hiện có. Migration 27 đã áp dụng và nghiệm thu ở cấp cơ sở dữ liệu trên Supabase chính `ielts-space`. Worker dọn ảnh đã kiểm tra local với R2 mô phỏng và còn chờ bật trên backend dùng chung.

## Công việc đã thực hiện

- Migration 27 xóa phiếu do Người học gửi trong giao dịch chuyển tài khoản sang `DELETED`. Khóa ngoại xóa dây chuyền lịch sử cập nhật chứa phản hồi. Dashboard và hàng đợi Quản lý đếm các phiếu còn lại.
- Khi Quản lý cập nhật phiếu, backend khóa các tài khoản theo cùng thứ tự với luồng xóa tài khoản rồi mới khóa phiếu. Cách này tránh xung đột thứ tự khóa nếu phản hồi và xóa tài khoản diễn ra đồng thời.
- Worker ảnh từ vựng dùng cùng hàm với API dọn ảnh. Khi bật, worker chạy lúc backend khởi động và mỗi giờ, xử lý tối đa 25 ảnh mỗi lượt. Tệp dọn lỗi được thử lại. Ảnh còn được tham chiếu trong nháp, bản công bố hoặc bộ đã ẩn được giữ lại.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| `npm run typecheck` và `npm run build` trong `backend` | Local | Đạt. |
| `admin-users.integration.mjs` | PostgreSQL cô lập, Auth mô phỏng, HTTP trong tiến trình | Áp migration 27 hai lần. Xóa phiếu có phản hồi, lịch sử và thông báo của Người học. Số đếm giảm, phiếu của tài khoản khác còn nguyên. Kiểm hoàn tác khi ghi audit lỗi, trả 404 khi mở lại phiếu để cập nhật và gọi xóa lại an toàn. |
| Migration 27 và thủ tục xóa tài khoản | Supabase chính `ielts-space` | Migration `remove_deleted_learner_support_reports` đã được ghi nhận và trigger đang bật. Gọi thủ tục xóa trên tài khoản thử trong giao dịch hoàn tác. Phiếu và lịch sử phản hồi của tài khoản thử biến mất, phiếu của tài khoản thử khác được giữ. Giao dịch hoàn tác toàn bộ dữ liệu thử. |
| `vocabulary-images.integration.mjs` | PostgreSQL cô lập, R2 mô phỏng, HTTP trong tiến trình | Kiểm lần chạy khi khởi động, lỗi R2 và thử lại theo lịch. Chỉ xóa ảnh cũ bỏ lại. Các ảnh mới và ảnh còn dùng trong nháp, bản công bố hoặc bộ đã ẩn vẫn tồn tại. |
| Bộ kiểm thử hồi quy backend ngoài ba bộ đề cần kết nối DB riêng | Local | 101 đạt, 0 lỗi, 2 bỏ qua do thiếu cấu hình thử Auth thật và dữ liệu từ vựng dev. |
| Kết nối R2 dev qua adapter của backend | Local đến R2 dev | Tra cứu DNS endpoint R2 trả `ENOTFOUND`. Chưa xác nhận được thao tác xóa qua worker trên bucket thật. |

## Phần còn mở

- Migration 27 áp dụng khi Người học chuyển sang trạng thái đã xóa sau thời điểm cài đặt. Các tài khoản đã xóa trước đó cần một đợt đối chiếu riêng nếu có nhu cầu dọn phiếu cũ.
- `VOCABULARY_IMAGE_CLEANUP_WORKER_ENABLED` mặc định tắt. Cần kiểm với R2 dev trước khi bật trên backend dùng chung.

## Bước tiếp theo

1. Kiểm tra thao tác qua giao diện Quản lý khi có phiên ứng dụng kết nối được Supabase chính, dùng tài khoản thử riêng.
2. Bật `VOCABULARY_IMAGE_CLEANUP_WORKER_ENABLED=true` trên backend thử có migration 22 và kết nối đúng bucket R2 dev. Đối chiếu một lượt chạy với ảnh thử trước khi bật vận hành.

## Tài liệu và cách tái hiện

[Migration 27](../csdl/27_remove_deleted_learner_support_reports.sql) · [Hợp đồng API](../API.md#ảnh-từ-vựng) · [Kiểm thử quản lý](../../backend/tests/admin-users.integration.mjs) · [Kiểm thử ảnh](../../backend/tests/vocabulary-images.integration.mjs).
