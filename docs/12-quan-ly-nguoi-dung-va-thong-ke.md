# 12. Quản lý người dùng (UC19), thống kê (UC25), theo dõi hỗ trợ chấm (UC18)

Cập nhật 09/11/2026. Nguồn: bộ nhớ dự án (canvas bản 113-117), đặc tả setup repo. Màn trong `docs/ui/canvas/`: `AdminUsers`, `AdminHome`, `AdminGrading`, `StaffProfile`.

## 1. Quy tắc tài khoản

- Chỉ Quản lý tạo, khóa, xóa tài khoản. Xóa khi tài khoản chưa có dữ liệu; có dữ liệu thì khóa.
- Tài khoản Giáo viên/Quản lý mới nhận email mời đặt mật khẩu.
- Giáo viên và Quản lý có quyền chấm theo kỹ năng do Quản lý đặt.
- Bắt buộc xác minh email với Người học đăng ký bằng email; tài khoản Google là Người học.

## 2. Trang Người dùng (`AdminUsers`)

- Danh sách full width (dữ liệu mẫu 12 tài khoản), lọc vai trò, trạng thái, ô tìm.
- Bấm dòng mở ngăn chi tiết từ phải: khóa, mở khóa, xóa.
- Form tạo tài khoản là overlay.
- Dưới danh sách có 2 bảng đặt cạnh nhau: "Hoạt động người học" (chỉ ghi lượt đăng nhập: thời điểm + người dùng) và "Hoạt động giáo viên". Lượt đăng nhập của Quản lý không hiện.
- CSDL chưa có bảng nhật ký đăng nhập riêng (xem [10 Cơ sở dữ liệu](10-co-so-du-lieu.md)).

## 3. Dashboard Quản lý (`AdminHome`, UC25)

- Thống kê tổng quan hệ thống.
- Nút "Tùy chọn" mở lịch chọn khoảng ngày; sau khi áp dụng, nút hiện khoảng ngày (ví dụ "05/10 – 18/10/2026") và các chú thích "trong N ngày" đổi theo.

## 4. Theo dõi hỗ trợ chấm (`AdminGrading`, UC18)

- Quản lý theo dõi yêu cầu chấm, xác nhận hủy khi giáo viên báo không thể hoàn thành (hoàn bonus, không phân công lại). Quy tắc đầy đủ: [04 Chấm Writing/Speaking](04-cham-bai-writing-speaking.md).

## 5. Hồ sơ

- Người học (`Profile`): "Thông tin cá nhân" (họ tên, email, mật khẩu với "Đổi mật khẩu") và "Mục tiêu học mỗi ngày" (band mục tiêu, số phiên/ngày), nút sửa từng mục, nút Sáng/Tối.
- Giáo viên/Quản lý (`StaffProfile`): một artboard nhiều biến thể, còn dùng sidebar cũ.
