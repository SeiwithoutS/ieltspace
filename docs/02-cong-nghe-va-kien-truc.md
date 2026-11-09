# 02. Công nghệ và kiến trúc

Cập nhật 09/11/2026. Nguồn: Chương 2, Chương 3 mục 3.1-3.2, bộ nhớ dự án. Chi tiết quy trình setup repo: [tai-lieu-goc/dac-ta-quy-trinh-va-cong-nghe-setup-repo.md](tai-lieu-goc/dac-ta-quy-trinh-va-cong-nghe-setup-repo.md).

## 1. Công nghệ đã chốt

| Lớp | Công nghệ |
|---|---|
| Ngôn ngữ | TypeScript (frontend có JSX lẫn TS) |
| Frontend | React 18 + Vite 5, Tailwind CSS 3, chế độ sáng/tối. Không dùng Next.js |
| Backend | Node.js + Express 4, REST/JSON, monolith chia module |
| CSDL | PostgreSQL trên Supabase |
| ORM | Prisma 6 |
| Xác thực | Supabase Auth: email + mật khẩu (bắt buộc xác minh email) và đăng nhập Google (chốt 30/10; Google dùng PKCE, xong 08/11) |
| Lưu tệp | Supabase Storage (ảnh bìa, ảnh đề, audio đề, audio bài mẫu, ghi âm Speaking). CSDL chỉ lưu đường dẫn |
| Deploy | Vercel (frontend), Render (backend, gói free có thể ngủ) |
| Khác | Git/GitHub, Python (sinh xlsx mẫu, ERD), Mermaid (sơ đồ UC) |

## 2. Kiến trúc

- Client-server 3 tầng. Backend nguyên khối chia 8 module: Người dùng và xác thực; Đề thi; Làm bài; Chấm bài; Từ vựng; Bài mẫu; Thống kê và động lực; Quản trị và nhập dữ liệu.
- Trong repo, `backend/src/modules/` đã có các thư mục: auth, exams, attempts, grading, imports, samples, vocabulary, notifications, statistics, reports, users, motivation (đa số còn rỗng, auth đã chạy).

## 3. Quy tắc kỹ thuật bắt buộc

1. Backend tự kiểm tra quyền theo vai trò. Prisma kết nối bằng quyền rộng nên **không dựa vào RLS** của Supabase.
2. API lấy đề cho Người học **không trả đáp án**. Điểm chính thức luôn tính ở backend.
3. Nộp bài chống trùng (idempotent); đề đã đăng thì không sửa ngược kết quả các lượt đã nộp.
4. Giờ và tuần tính theo múi giờ Việt Nam ở backend; cột thời gian lưu `timestamptz`.
5. Khóa chính UUID. Id hồ sơ người dùng trùng `auth.users.id`.
6. Tên bảng, cột snake_case (`@@map`, `@map`); model Prisma PascalCase.
7. File lưu ở Storage, DB chỉ lưu đường dẫn.
8. Khóa Supabase để trong `backend/.env` và `frontend/.env`, không commit, không gửi qua chat.

## 4. Hiện trạng repo (08/11/2026)

- Đã có: đăng ký, đăng nhập (email và Google), đăng xuất, khôi phục mật khẩu qua Supabase Auth.
- Các màn khác đã chuyển từ canvas UI sang React nhưng còn dùng dữ liệu mẫu, chưa gọi API.
- `schema.prisma` mới ánh xạ hồ sơ người dùng; các bảng nghiệp vụ chưa có (xem [10 Cơ sở dữ liệu](10-co-so-du-lieu.md)).
- Tác vụ định kỳ cần có ở backend: hủy yêu cầu chấm quá 72 giờ, làm mới lượt miễn phí thứ Hai, xóa nội dung W/S quá 14 ngày.
