# Kiến trúc IELTSpace

Trình duyệt chạy React 18 và Vite 5. Backend là một dịch vụ Node.js 20+ dùng Express 4, TypeScript, Zod và Prisma 6. Supabase cung cấp Auth, PostgreSQL và kho tệp theo thiết kế. Frontend có cả TS/TSX và JSX, Tailwind 3 chạy cùng CSS và kiểu viết ngay trong component.

## Bản đồ mã nguồn

| Vị trí | Trách nhiệm hiện tại hoặc dự kiến |
|---|---|
| `frontend/src/main.tsx`, `app/` | Khởi động ứng dụng, chọn trang, điều hướng theo phiên và vai trò. |
| `frontend/src/pages/`, `components/` | Màn hình theo nghiệp vụ và thành phần dùng lại. Nhiều trang còn dùng dữ liệu mẫu trong trình duyệt. |
| `frontend/src/lib/`, `styles/` | Gọi Auth, xử lý liên kết email, kiểu giao diện, bảng màu và font. |
| `backend/src/app.ts`, `routes.ts` | CORS, cookie, JSON, mount Auth và health, sau cùng xử lý 404/lỗi. |
| `backend/src/modules/auth/`, `middleware/`, `lib/` | Route xác thực đang hoạt động, kiểm tra hồ sơ/quyền, kết nối Prisma và Supabase. |
| `backend/src/modules/`, `jobs/`, `integrations/storage/` | Ranh giới cho exams, attempts, grading, imports và các nghiệp vụ khác. Các thư mục khung chưa chứng minh có chức năng chạy được. |
| `backend/prisma/` | Schema đọc hồ sơ. Thư mục migrations là nơi quản lý SQL triển khai trong tương lai. |

## Luồng chạy

1. **Đăng nhập email.** Form gửi JSON đến Express. Supabase xác thực, backend tra hồ sơ hoạt động qua Prisma, trả access token và đặt cookie HttpOnly. Frontend giữ token trong bộ nhớ. Khi tải lại trang, frontend gửi cookie để khôi phục phiên.
2. **Google.** Backend bắt đầu PKCE, trình duyệt chuyển đến nhà cung cấp. Callback backend đổi code, kiểm tra hồ sơ và đặt cookie. Frontend nhận chuyển hướng rồi gọi refresh. [Chi tiết hợp đồng](API.md).
3. **Nạp đề theo thiết kế.** Quản lý gửi XLSX và asset. Module imports kiểm tra cấu trúc, tham chiếu, form và tệp. Service ghi các bảng đề trong một giao dịch vào bản nháp. Đường dẫn Storage lưu trong DB. Phát hành là thao tác riêng của exams.
4. **Nộp và lấy bài theo thiết kế.** Backend xác định người dùng, phiên bản và thời hạn. L/R chấm trên máy chủ. W/S lưu nội dung và metadata. Khi tải, kiểm tra sở hữu/phân công và hạn còn lại rồi cấp quyền tải tạm. Storage dùng cho tệp âm thanh, ảnh và tệp xuất.
5. **Xử lý nền theo thiết kế.** Cấp lượt tuần, xét phân công, hủy quá hạn, hoàn bonus, xóa nội dung hết hạn. Mỗi lần chạy lại kiểm tra trạng thái và khóa duy nhất. Thông báo dựa trên sự kiện đã ghi nhận. [Điều kiện giao dịch](BUSINESS_RULES.md).

## Ranh giới triển khai

Duy trì một backend chia module. Route/controller đọc đầu vào và trả HTTP. Service kiểm tra quyền theo bản ghi, áp dụng quy tắc và mở giao dịch. Lớp truy cập dữ liệu dùng Prisma/SQL. Auth hiện tập trung phần lớn xử lý ở auth.routes.ts. Vercel cho frontend tĩnh và Render cho backend là phương án triển khai. Cần kiểm thử redirect, HTTPS, CORS và cookie với tên miền thực. [Cấu hình Auth của dự án](PROGRESS/2026-11-07-trang-thai-du-an.md#cấu-hình-auth).

## Cấu trúc kết nối CSDL và Hiệu năng (Performance Architecture)

- **Supavisor Pooler & Direct URL**: 
  - `DATABASE_URL` trỏ vào Supavisor transaction pooler qua cổng 6543 với `pgbouncer=true&connection_limit=5`, phục vụ xử lý đồng thời của Node.js Express.
  - `DIRECT_URL` trỏ vào PostgreSQL trực tiếp qua cổng 5432 cho Prisma CLI thực thi các câu lệnh DDL migration.
- **Xác thực JWT tại chỗ (Local JWKS)**:
  - Middleware `requireAuth` xác thực chữ ký JWT bằng public key từ endpoint JWKS của Supabase (`jose` quản lý cache khóa cục bộ), không gọi HTTP tới Supabase Auth qua mạng.
  - Hồ sơ người dùng được lưu tạm trong bộ nhớ RAM (`Map<authUserId, {user, expires}>`) với TTL 60 giây, giúp giảm thời gian xác thực từ 250–950ms xuống < 1.5ms mỗi request.
- **Ghi theo lô (Batch Writes)**:
  - Sinh UUID v4 trực tiếp tại ứng dụng Node.js và thực hiện chèn dữ liệu theo lô qua Prisma `createMany` (sections → groups → questions → options → answers), giảm từ hàng trăm truy vấn lặp xuống 5 câu lệnh SQL duy nhất.
- **Quan hệ nạp dữ liệu bằng JOIN (relationLoadStrategy: 'join')**:
  - Prisma 6 với `previewFeatures = ["relationJoins"]` nạp toàn bộ cây dữ liệu bộ đề và kỹ năng trong một câu truy vấn SQL JOIN đơn lẻ, loại bỏ việc nạp lồng nhiều câu lệnh rời rạc.
- **Khung giao diện quản trị đáp ứng (StaffLayout)**:
  - Khung chuẩn hóa `StaffLayout` quản lý thanh bên (Sidebar) co giãn theo breakpoint: mở rộng (≥ 1280px), thu gọn icon (1024–1279px), ngăn kéo phủ overlay khi thao tác nút ☰ (768–1023px) và dải cảnh báo thiết bị (< 768px).
