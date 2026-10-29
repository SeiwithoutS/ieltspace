# IELTSpace Backend — khung ban đầu

Node.js + Express + TypeScript + Prisma/PostgreSQL. Đây là khung để phát triển tiếp: chưa có model database, đăng nhập, API nghiệp vụ hoặc kết nối frontend/Supabase. Chỉ có endpoint kiểm tra máy chủ `GET /api/health`.

## Chạy trong Terminal WebStorm

```powershell
cd C:\IELTS\backend
npm install
Copy-Item .env.example .env
npm run dev
```

Chỉ sao chép `.env.example` khi chưa có `.env`. Endpoint kiểm tra máy chủ: http://localhost:3001/api/health. Chưa cần database để chạy endpoint này.

Frontend chạy ở Terminal riêng: `cd C:\IELTS\frontend`, sau đó `npm run dev`. Nếu Vite dùng cổng khác 5173, cập nhật `FRONTEND_URL` trong `.env`.

## Tắt ứng dụng

Bấm Ctrl+C tại Terminal đang chạy ứng dụng. Nếu PowerShell hỏi xác nhận thì nhập Y rồi Enter. Nếu chạy bằng cấu hình Run của WebStorm, bấm Stop. Frontend và backend chạy ở hai Terminal thì cần dừng từng bên.

## Cấu trúc

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/env.ts
│   ├── lib/
│   ├── middleware/error-handler.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── exams/
│   │   ├── attempts/
│   │   ├── grading/
│   │   ├── vocabulary/
│   │   ├── samples/
│   │   ├── statistics/
│   │   ├── motivation/
│   │   ├── notifications/
│   │   ├── imports/
│   │   ├── reports/
│   ├── jobs/
│   ├── integrations/storage/
│   ├── shared/{errors,types,utils}/
│   ├── routes.ts
│   ├── app.ts
│   └── server.ts
├── tests/{integration,fixtures}/
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

Các file `.gitkeep` giữ lại thư mục rỗng khi đưa lên Git. Supabase service-role key chỉ đặt trong `.env` của backend. Chỉ chạy Prisma generate/migrate sau khi bổ sung model và cấu hình database.

Chưa cài thư viện hay chạy kiểm tra backend trong bước tạo khung này.
