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


## Luồng làm bài — cập nhật 14/11/2026

Các thư mục frontend/src/pages/attempts, pages/results và components/attempts đã chuyển sang TSX. AttemptSession nhận snapshot qua callback đã định kiểu trong types.ts. parseAttemptDraft kiểm tra nháp trên trình duyệt trước khi cấp initialState cho trang. Dữ liệu mẫu được tập trung trong data/attempt-samples.ts. DesktopOnly kiểm tra điều kiện hiển thị tại đầu vào bốn trang làm bài; Popup dùng native dialog và nhận trạng thái desktop qua context.
