---
paths:
  - "backend/**"
---

# Quy ước backend

- ESM với `NodeNext`: import nội bộ phải có đuôi `.js` (`'../lib/prisma.js'`).
- Route bọc `asyncHandler`, lỗi ném `HttpError(status, CODE, "thông báo tiếng Việt")`. Kiểm tra dữ liệu vào bằng zod.
- Route cần đăng nhập dùng `requireAuth`, giới hạn vai trò bằng `requireRole(...)`.
- Mỗi nghiệp vụ một module trong `src/modules/<module>/`, file `<module>.routes.ts`, gắn vào `src/routes.ts`.
- Trước khi báo xong: chạy `npm run typecheck` trong `backend/`.

## Quy tắc kỹ thuật bắt buộc

1. Backend tự kiểm tra quyền. Prisma dùng quyền rộng nên **không dựa vào RLS**.
2. API lấy đề cho Người học **không trả đáp án**. Điểm chính thức luôn tính ở backend.
3. Nộp bài chống trùng (idempotent). Đề đã đăng không sửa ngược kết quả các lượt đã nộp.
4. Giờ và tuần tính theo múi giờ Việt Nam ở backend; cột thời gian `timestamptz`. Khóa chính UUID.
5. Bảng, cột snake_case; model Prisma PascalCase với `@@map`/`@map` (trừ model `users` hiện có).
