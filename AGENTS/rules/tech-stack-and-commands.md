# Công nghệ, cấu trúc repo và lệnh thường dùng

## Công nghệ (đã chốt, Chương 2)

| Lớp | Công nghệ |
|---|---|
| Frontend | React 18 + Vite 5, TypeScript lẫn JSX, Tailwind 3 (`preflight: false`) |
| Backend | Node ≥ 20, Express 4 + TypeScript (ESM, `NodeNext`), zod, express-rate-limit |
| CSDL | PostgreSQL trên Supabase, Prisma 6 |
| Xác thực | Supabase Auth (email + xác minh email bắt buộc, Google cho Người học) |
| Lưu tệp | Supabase Storage (ảnh bìa, ảnh đề, audio, ghi âm Speaking); DB chỉ lưu đường dẫn |
| Deploy | Vercel (frontend, SPA fallback), Render (backend) |

Không dùng Next.js. Không đổi stack khi chưa được hỏi.

## Cấu trúc repo

```text
backend/
  prisma/schema.prisma   Chỉ ánh xạ rút gọn bảng users
  src/app.ts, server.ts  Cấu hình và khởi động Express
  src/config.ts          Kiểm tra biến môi trường
  src/routes.ts          Gắn route các module dưới /api
  src/lib/               prisma.ts, supabase.ts, supabase-oauth.ts
  src/middleware/        auth.ts (requireAuth, requireRole), error-handler.ts
  src/modules/<module>/  Mỗi nghiệp vụ một module, file <module>.routes.ts
  src/utils/http.ts      HttpError, asyncHandler
  tests/                 node:test (*.test.mjs) và script chẩn đoán chỉ đọc
frontend/
  src/app/pages.ts       Danh sách trang (lazy import), tên trang = route
  src/app/App.tsx        Router hash, kiểm tra phiên, chặn trang theo vai trò
  src/pages/<nhóm>/      Trang theo nghiệp vụ (auth, learner, exams, practice,
                         attempts, results, samples, vocabulary, grading,
                         notifications, account, admin/...)
  src/components/        auth, navigation (AdminSidebar, AdminTopbar,
                         TeacherSidebar), account, notifications, exams...
  src/lib/               auth.ts (phiên, login, home()), styles.ts, ...
  src/styles/            globals.css, motion.css, font
  src/data/              Dữ liệu mẫu (JSON)
  tests/                 node:test
```

## Lệnh thường dùng

```bash
# backend (cổng 3001)
cd backend && npm install && npm run prisma:generate
npm run dev          # tsx watch
npm run typecheck    # tsc --noEmit
npm run build && npm start
node --test tests/   # test auth

# frontend (cổng 3000)
cd frontend && npm install
npm run dev -- --port 3000 --strictPort
npm run build        # tsc --noEmit && vite build
node --test tests/
```

Cần `backend/.env` và `frontend/.env` sao từ `.env.example` (xem README). Mở `http://localhost:3000/#Login`.
