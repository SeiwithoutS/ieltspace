# Tổng quan dự án

- Đồ án 1 (ĐH CNTT): "Xây dựng nền tảng hỗ trợ học tập và ôn luyện IELTS". Tên sản phẩm: **IELTSpace**.
- Nhóm: Nguyễn Trọng Phúc, Võ Nguyễn Thanh Hương. GVHD: Nguyễn Thị Xuân Hương.
- Hệ thống luyện đề IELTS đủ 4 kỹ năng: Listening, Reading (chấm tự động), Writing, Speaking (giáo viên chấm tay).
- Hai phần chính: **Dashboard Quản lý** (nhập liệu, quản lý đề thi, bài mẫu, người dùng, điều phối chấm) và **Landing/khu Người học** (đăng ký, luyện đề, xem kết quả, theo dõi tiến độ). Có thêm khu **Giáo viên** để chấm W/S.
- 4 vai trò: Khách, Người học (`LEARNER`), Giáo viên (`TEACHER`), Quản lý (`ADMIN`). Dùng chữ "Giáo viên", không dùng "Trợ giảng".
- MVP: web desktop, giao diện tiếng Việt, không app native, không AI chấm. 35 use case (UC01–UC35) theo Chương 3 bản "sửa 20-10 lần 2". Khi tài liệu mâu thuẫn, **Chương 3 thắng**.

## Hiện trạng code

- Đã có: đăng ký, đăng nhập, đăng xuất, quên/đặt lại mật khẩu, đăng nhập Google (Supabase Auth, PKCE, refresh token trong HttpOnly cookie), phân quyền theo vai trò ở cả frontend và backend.
- Các màn học tập, chấm bài, quản trị đã dựng giao diện nhưng **còn dùng dữ liệu mẫu**, chưa gọi API.
- Backend: mới có `/api/health` và `/api/auth/*`. Các thư mục `src/modules/*` khác (exams, attempts, grading, imports, samples, vocabulary, notifications, statistics, reports, users, motivation) còn rỗng (`.gitkeep`).
