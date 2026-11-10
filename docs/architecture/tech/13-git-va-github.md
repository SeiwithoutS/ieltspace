# Git và GitHub

> Nguồn: Chương 2 §2.13 (Chương 2 - Cơ sở lý thuyết (bản gốc 20-10)). Giữ nguyên câu chữ báo cáo; sửa ở đây thì cập nhật lại bản Word.

## 2.13. Git và GitHub

### 2.13.1. Khái niệm

Git là hệ thống quản lý phiên bản phân tán, ghi lại lịch sử thay đổi và hỗ trợ phát triển trên nhiều nhánh. GitHub cung cấp nơi lưu trữ repository Git cùng các công cụ hỗ trợ cộng tác như pull request, issues và theo dõi công việc.

### 2.13.2. Ưu điểm

- Theo dõi thay đổi và khôi phục các phiên bản trước.
- Hỗ trợ phát triển song song bằng branch.
- Pull request giúp kiểm tra mã trước khi hợp nhất.
- Issues hỗ trợ ghi nhận lỗi và phân chia nhiệm vụ.
- Có thể tích hợp quy trình kiểm tra và triển khai tự động.

### 2.13.3. Nhược điểm

- Có thể phát sinh xung đột khi nhiều người chỉnh sửa cùng nội dung.
- Lịch sử khó theo dõi nếu thiếu quy ước commit.
- Secrets có nguy cơ bị lộ nếu đưa nhầm vào repository.
- Không phù hợp để lưu nhiều tệp nhị phân lớn như audio và video.

### 2.13.4. Lý do lựa chọn

Đồ án được thực hiện theo nhóm và có nhiều chức năng có thể phát triển độc lập. Git/GitHub hỗ trợ phân chia nhánh theo tính năng, kiểm tra thay đổi và theo dõi đóng góp.

Nhóm quản lý mã nguồn, migration, mẫu dữ liệu import và cấu hình triển khai trong repository. Mật khẩu, khóa API, dữ liệu cá nhân và tệp cấu hình chứa secrets không được đưa vào mã nguồn. Repository chỉ cung cấp tệp cấu hình mẫu với các giá trị minh họa.
