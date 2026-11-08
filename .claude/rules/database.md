---
paths:
  - "backend/prisma/**"
  - "backend/src/lib/prisma.ts"
  - "backend/src/modules/**"
---

# Cơ sở dữ liệu

- `backend/prisma/schema.prisma` hiện chỉ ánh xạ bảng `users` có sẵn để đọc hồ sơ. **Không chạy `prisma migrate dev`, `migrate reset` hay `db push` bằng schema này** trên database đang dùng.
- Supabase có bảng `public.users` và trigger tạo hồ sơ khi Auth tạo tài khoản. `users.status` phải là `ACTIVE` mới đăng nhập được.
- Thiết kế CSDL đầy đủ nằm ngoài repo (thư mục `thiet-ke-csdl/` của project). Base hiện tại là **bản nhóm viết lại 29/10 (39–40 bảng)**, `nhom-csdl-draft.md`.
- Đã chốt:
  - `exam_versions`: đề đã đăng bất biến.
  - Tách `attempts` / `skill_attempts`; tách credit, refund, review, score.
  - `exam_sets.cover_url` (tỉ lệ 3:2).
  - Academic/General ở `parts.form` (bắt buộc cho R/W, NULL cho L/S, không có `exams.exam_type`).
  - `learning_activities` tính theo lượt làm.
  - Band, rubric, tham số hệ thống là dữ liệu seed.
- **Hỏi người dùng trước khi thêm model mới hoặc tạo migration.**
