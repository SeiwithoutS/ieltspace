# PDR-005 · Công nghệ và xác thực

- **Trạng thái:** Đã chốt
- **Ngày:** 2026-10-20, bổ sung 2026-10-30

## Bối cảnh

Chương 1 gợi ý Next.js; Chương 2 chọn React + Vite.

## Quyết định

Frontend React + Vite (không Next.js). Backend Express, PostgreSQL, Prisma, Supabase. Đăng nhập bằng Supabase Auth (email và Google, bắt buộc xác minh email).

## Hệ quả

Backend vẫn tự kiểm tra quyền, không dựa vào RLS (Chương 2 §2.8, §2.9).
