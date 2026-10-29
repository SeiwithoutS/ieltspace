# IELTSpace

Giao diện nền tảng luyện thi IELTS dành cho người học, giáo viên và quản trị viên.

## Công nghệ

- **Frontend:** React 18, Vite 5, JavaScript/JSX, TypeScript, Tailwind CSS và CSS.
- **Backend:** khung Node.js, Express, TypeScript; cấu hình Prisma/PostgreSQL để phát triển tiếp.
- **Hiện trạng:** frontend dùng dữ liệu mẫu và bộ nhớ trình duyệt; chưa kết nối API nghiệp vụ hoặc xác thực thật. Backend mới có API kiểm tra máy chủ.

## Cấu trúc

```text
frontend/       Giao diện và cấu hình chạy frontend
backend/        Khung API và module nghiệp vụ
.gitignore      Quy định những file không đưa lên Git
README.md       Hướng dẫn tổng quan
```

Xem [cấu trúc frontend](frontend/src/README.md) và [hướng dẫn backend](backend/README.md).

## Clone và chạy

Cần cài **Git**, **Node.js 22 LTS** (kèm npm).

```bash
git clone...
cd...
```

Thay `<URL_REPO_CUA_BAN>` bằng URL repo trên GitHub. Trong WebStorm, mở thư mục vừa clone, sau đó dùng Terminal.

### Frontend

Từ thư mục gốc dự án:

```bash
cd frontend
npm ci
npm run dev
```

Mở URL Vite hiện trong Terminal, thường là http://localhost:5173. Chỉ cần chạy frontend để xem và dùng thử giao diện hiện tại.

### Backend — tùy chọn

Mở Terminal thứ hai tại thư mục gốc:

```bash
cd backend
npm install
```

Sao chép `.env.example` thành `.env` (chỉ làm lần đầu), rồi chạy:

```bash
npm run dev
```

Kiểm tra tại http://localhost:3001/api/health. Chưa cần database để chạy API này. Cấu hình database và thêm model trước khi chạy Prisma generate/migrate.

### Dừng và chạy lại

- Dừng: **Ctrl+C** trong Terminal đang chạy; nếu hỏi `Terminate batch job (Y/N)?`, nhập **Y** rồi Enter. Nếu chạy bằng WebStorm Run, bấm **Stop ■**.
- Chạy lại: vào `frontend/` hoặc `backend/` rồi chạy `npm run dev`.
- Chỉ cần cài lại thư viện khi mới clone hoặc khi dependencies thay đổi.

## Build frontend

Trong `frontend/`:

```bash
npm run build
npm run preview
```

`npm run build` tạo thư mục `dist/`; `npm run preview` mở bản build để kiểm tra tại URL được in ra.

## File tự sinh và Git

- `node_modules/`: thư viện được tải khi chạy `npm ci` hoặc `npm install`.
- `dist/`: kết quả đóng gói khi chạy `npm run build`.
- `.idea/`: cấu hình WebStorm trên máy.
- Các script chuyển đổi/kiểm tra cũ nằm ở `_local/tools/scripts/`; đây là công cụ đã viết trong quá trình dựng giao diện, không phải file npm tự sinh.

Git bỏ qua các thư mục trên và `.env`. Giữ `package.json`, `package-lock.json` của từng ứng dụng, `.env.example`, `frontend/index.html` và mã nguồn trong repo.
