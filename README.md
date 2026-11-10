Ngày tạo README: 07/11/2026

# IELTSpace

[Báo cáo bàn giao dự án ngày 07/11/2026](docs/BAO_CAO_BAN_GIAO.md) · [Trạng thái tại ngày bàn giao](docs/PROGRESS/2026-11-07-trang-thai-du-an.md)

Ứng dụng web hỗ trợ luyện IELTS, gồm giao diện người học, giáo viên và quản lý. Hiện đã tích hợp đăng ký, đăng nhập, đăng xuất và khôi phục mật khẩu bằng Supabase Auth. Các màn hình học tập/quản trị còn chủ yếu dùng dữ liệu mẫu.

## Công nghệ

React 18, Vite, TypeScript/JSX; Express, TypeScript, Prisma 6; PostgreSQL và Supabase Auth.

## Cấu trúc

```text
backend/
  prisma/       Ánh xạ hồ sơ người dùng đã có trong PostgreSQL
  src/
    config.ts   Kiểm tra biến môi trường
    lib/        Kết nối Prisma và Supabase
    middleware/ Xác thực, kiểm tra vai trò, xử lý lỗi
    modules/auth/ API tài khoản và khôi phục mật khẩu
    app.ts      Cấu hình Express
    server.ts   Khởi động server
  tests/        Kiểm thử và chẩn đoán chỉ đọc
frontend/
  src/
    app/        Danh sách trang, điều hướng và kiểm tra phiên
    components/ Thành phần giao diện dùng chung
    pages/      Giao diện theo nhóm chức năng
    lib/        API Auth, phiên đăng nhập, tài khoản và tiện ích
    styles/     CSS và font
    data/       Dữ liệu mẫu
  tests/        Kiểm thử liên kết email
```

## Chạy ở máy cá nhân

Cần Node.js 20 trở lên và một project Supabase có bảng `public.users`, trigger tạo hồ sơ khi Auth tạo tài khoản. Trigger tạo hồ sơ cần được cài riêng theo thiết kế tài khoản.

1. Sao chép `backend/.env.example` thành `backend/.env`, điền Project URL, publishable key và DATABASE_URL (Session pooler) của Supabase. Đặt FRONTEND_ORIGIN=http://localhost:3000 và AUTH_EMAIL_REDIRECT_URL=http://localhost:3000/login.
2. Sao chép `frontend/.env.example` thành `frontend/.env`, giữ VITE_API_URL=http://localhost:3001/api.
3. Bật Email provider/Confirm email trong Supabase. Site URL=http://localhost:3000; Redirect URLs gồm /login và /reset-password trên origin này. Email Confirm signup dùng `{{ .ConfirmationURL }}`. Liên kết Reset Password dùng `{{ .SiteURL }}/reset-password#token_hash={{ .TokenHash }}&type=recovery`.

Terminal backend:

```powershell
cd backend
npm install
npm run prisma:generate
npm run dev
```

Terminal frontend:

```powershell
cd frontend
npm install
npm run dev -- --port 3000 --strictPort
```

Mở http://localhost:3000/#Login. Backend chạy http://localhost:3001/api, health check ở /api/health.

## Build

Chạy `npm run build` trong từng thư mục backend/frontend. Backend production dùng `npm start`; frontend xuất ra `frontend/dist` để triển khai như SPA (cần fallback đường dẫn về index.html).

Schema Prisma hiện là ánh xạ rút gọn để đọc hồ sơ: **không chạy migrate reset, migrate dev hoặc db push bằng schema này trên database hiện có**. Không đưa `.env`, mật khẩu hoặc secret key lên GitHub. Chỉ README gốc được theo dõi; tài liệu Markdown nội bộ được bỏ qua.

## Đăng nhập Google

Đã tích hợp Google qua Supabase Auth bằng PKCE, giữ phiên bằng HttpOnly cookie. Bật Google provider trong Supabase và nhập Google Client ID/Secret tại đó. Google Cloud dùng callback Supabase; Supabase Redirect URLs phải có `http://localhost:3001/api/auth/google/callback`.

Backend `.env`: thêm `AUTH_GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback` (mặc định local cũng dùng URL này). Không đưa Google Client Secret vào frontend. Callback Express kiểm tra hồ sơ ACTIVE, đặt refresh cookie rồi chuyển về `/auth/callback` của frontend; frontend dùng refresh chung để nhận phiên và điều hướng theo vai trò từ DB.

Khi deploy, đổi callback backend và các URL môi trường tương ứng; frontend cần SPA fallback cho `/auth/callback`, `/login`, `/reset-password`. Google login mới dùng trigger hồ sơ hiện có, không cần thêm bảng. Tài khoản Google vẫn tuân thủ quyền và trạng thái khóa của ứng dụng.
