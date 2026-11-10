# Vai trò và quyền hạn

> Nguồn: Chương 3 §3.6.1 (Bảng 3.4), §3.5 và quy định chung §3.6.2. Tên vai trò theo [PDR-002](../decisions/PDR-002-ten-vai-tro.md).

## Tác nhân

| Tác nhân | Mô tả | Nhóm chức năng chính |
|---|---|---|
| Khách (Guest) | Người truy cập chưa đăng nhập; muốn làm bài phải đăng ký và đăng nhập | Xem Landing Page, đăng ký tài khoản, xem kho bài mẫu<br>Không được làm đề hay nộp bài<br>Xem được thư viện đề, bộ từ vựng hiện có |
| Người học (User) | Học sinh, sinh viên, người đi làm tự ôn luyện IELTS, đã có tài khoản; kế thừa các chức năng của Khách | Làm bài và luyện tập, xem kết quả, nộp bài Writing/Speaking, học từ vựng, xem lịch sử và tiến độ |
| Giáo viên (Assistant) | Người chấm bài Writing/Speaking, tài khoản do Quản lý cấp | Chấm bài theo hàng đợi, xem lịch sử chấm |
| Quản lý (Admin) | Người quản trị nội dung và người dùng của hệ thống | Quản lý tài khoản, Bộ đề, Đề thi, bài mẫu và từ vựng; nhập dữ liệu hàng loạt; xem thống kê toàn hệ thống. Giám sát hỗ trợ chấm và quản lý năng lực tiếp nhận. |

## Nguyên tắc truy cập

- Các chức năng yêu cầu đăng nhập phải kiểm tra phiên, trạng thái tài khoản và quyền truy cập tại backend.
- Quyền truy cập bài làm phải được kiểm tra theo quyền sở hữu hoặc quan hệ phân công, không chỉ theo vai trò.
- Giáo viên chỉ truy cập bài Writing/Speaking được phân công cho mình; quyền chấm không đồng nghĩa quyền xem tiến độ Người học.
- Tài khoản Giáo viên do Quản lý cấp; Khách chỉ xem Landing Page, bài mẫu và đăng ký.

Use case theo tác nhân: [FEATURE.md](../FEATURE.md).
