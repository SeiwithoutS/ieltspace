---
paths:
  - "backend/prisma/**"
  - "backend/src/lib/prisma.ts"
  - "backend/src/modules/**"
---

# Cơ sở dữ liệu

- `backend/prisma/schema.prisma` hiện chỉ ánh xạ bảng `users` có sẵn để đọc hồ sơ. **Không chạy `prisma migrate dev`, `migrate reset` hay `db push` bằng schema này** trên database đang dùng.
- Supabase có bảng `public.users` và trigger tạo hồ sơ khi Auth tạo tài khoản. `users.status` phải là `ACTIVE` mới đăng nhập được.
- Thiết kế CSDL đầy đủ nằm ngoài repo (thư mục `thiet-ke-csdl/` của project). Base hiện tại là `CSDL.docx` của team (39 bảng), bản đồng bộ có giải thích lý do từng thay đổi: `csdl-dong-bo-10-11.md` (10/11/2026).
- Đã chốt:
  - `exam_versions`: đề đã đăng bất biến.
  - Tách `attempts` / `skill_attempts`; tách credit, refund, review, score.
  - `exam_sets.cover_url` (tỉ lệ 3:2).
  - Academic/General ở `exam_sections.form` (bảng "Phần thi" trong CSDL của team; bắt buộc cho R/W, NULL cho L/S, không có `exams.exam_type`).
  - `exam_skills`: unique (phiên bản, kỹ năng), có `is_hidden`; mỗi đề tối đa một bản DRAFT, nhập xlsx và editor chỉ ghi vào bản nháp.
  - `import_batches` có `exam_id` + `skill`: mỗi tệp xlsx là một kỹ năng của một đề; có lỗi thì không lưu gì.
  - Cần giữ `attempt_section_states` (Listening nghe một lần, Speaking ghi âm một lần, làm tiếp lượt dở).
  - `public.users.id` khác `auth_user_id` (unique), code đang đọc theo `auth_user_id`.
  - `learning_activities` tính theo lượt làm.
  - Band, rubric, tham số hệ thống là dữ liệu seed.
- **Hỏi người dùng trước khi thêm model mới hoặc tạo migration.**
