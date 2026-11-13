# Tiến độ Quản lý bộ đề ngày 13/11/2026

## Phạm vi và trạng thái

- **Mã task:** QLBD-00 đến QLBD-14 (thuộc phạm vi [Kế hoạch Quản lý bộ đề](../PLAN_QUAN_LY_BO_DE.md)).
- **Mục tiêu:** Xây dựng trọn vẹn luồng Quản lý bộ đề từ Cơ sở dữ liệu, API Backend (A1–A16, P1) đến Giao diện Frontend (`AdminExams.jsx`, `AdminExamSet.jsx`, `ExamDetail.jsx`).
- **Trạng thái:** **HOÀN THÀNH TOÀN BỘ (100%)**. Đã kiểm thử unit test, kiểm tra kiểu dữ liệu (TypeScript) và build thành công ở cả Backend và Frontend.

## Công việc đã thực hiện

1. **Cơ sở dữ liệu (Database & Migration):**
   - Đã thực thi nâng cấp schema PostgreSQL lên D08 qua [04_nang_cap_tu_01.sql](../csdl/04_nang_cap_tu_01.sql).
   - Đã tạo bảng danh mục động [exam_set_categories](../csdl/05_danh_muc_bo_de.sql), chuyển đổi `category` sang `category_id` (FK), bổ sung trigger `updated_at` tự động cho `exam_sets` và `exams`, cùng ràng buộc duy nhất tên bộ đề `UNIQUE (name)`.
   - Seed sẵn 5 danh mục chuẩn: IELTS Cambridge, Actual Tests, Practice Tests, Dự đoán đề (Forecast), Khác.

2. **Prisma ORM & Pure Business Rules:**
   - Cập nhật [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma) đầy đủ các model: `exam_set_categories`, `exam_sets`, `exams`, `exam_skills`, `exam_sections`, `question_groups`, `questions`, `question_options`, `question_answers`, `audit_logs`.
   - Chạy `npm run prisma:generate` thành công.
   - Xây dựng module pure logic [backend/src/modules/exams/exam-rules.ts](../../backend/src/modules/exams/exam-rules.ts): các hàm `slotKey`, `buildSlots`, `slotUi`, `canDeleteSet`, `canDeleteExam`, `canPublishSet`, `defaultDuration`, `validateSkillReady`.
   - Viết bộ unit test độc lập [backend/tests/exam-rules.test.mjs](../../backend/tests/exam-rules.test.mjs) với 8 ca kiểm thử bao phủ toàn bộ logic xóa, công khai, phân ô kỹ năng.

3. **Backend Services & API Endpoints:**
   - Mở rộng `HttpError` hỗ trợ mã lỗi nghiệp vụ và chi tiết mảng lý do lỗi.
   - Viết module ghi vết hoạt động [audit.ts](../../backend/src/shared/audit.ts) đảm bảo an toàn transaction.
   - Tích hợp Supabase Storage [supabase-storage.ts](../../backend/src/shared/supabase-storage.ts) cho ảnh bìa bộ đề (bucket `exam-covers`, tự động dọn ảnh cũ khi ghi đè/xóa).
   - Triển khai 4 services nghiệp vụ:
     - `categories.service.ts`: lấy danh sách và tạo danh mục tự sinh slug.
     - `exam-sets.service.ts`: CRUD bộ đề, publish/hide/delete với khóa bi quan (`lockExamSet`), tính `max(updated_at)`.
     - `exam-tests.service.ts`: thêm, sửa, xóa Test và tự động đánh lại số thứ tự liên tục `order_no`.
     - `exam-skills.service.ts`: tạo nháp v1, publish nháp (kèm kiểm tra điều kiện sẵn sàng), ẩn, hiển thị lại, nhân bản nháp mới tăng version.
   - Xây dựng 16 API quản trị `A1–A16` ([exams.admin.routes.ts](../../backend/src/modules/exams/exams.admin.routes.ts)) gắn quyền `ADMIN` và 1 API công khai học viên `P1` ([exams.public.routes.ts](../../backend/src/modules/exams/exams.public.routes.ts)).
   - Đăng ký routes vào router chính [backend/src/routes.ts](../../backend/src/routes.ts) tại `/admin` và `/exam-sets`.

4. **Frontend Integration:**
   - Xây dựng HTTP client [frontend/src/lib/api.ts](../../frontend/src/lib/api.ts): tự động gắn token, xử lý refresh token khi gặp 401, quản lý lỗi `ApiError`.
   - Xây dựng API SDK [frontend/src/lib/exam-admin.ts](../../frontend/src/lib/exam-admin.ts): hàm gọi A1–A16 và P1, các hàm chuyển đổi mô hình dữ liệu `toUiSet`, `toLearnerSet`, `toUiTest`, `slotUi`, `fmtDate`.
   - Kết nối [AdminExams.jsx](../../frontend/src/pages/admin/exams/AdminExams.jsx): tải danh sách thật từ API, Combobox lọc/tạo danh mục mới tức thì, upload/xem trước ảnh bìa, tạo và xóa bộ đề với phản hồi người dùng.
   - Kết nối [AdminExamSet.jsx](../../frontend/src/pages/admin/exams/AdminExamSet.jsx): hiển thị chi tiết bộ đề theo ID từ URL, thêm/xóa Test, menu thao tác kỹ năng cố định viewport, công khai/ẩn bộ đề, xử lý điều kiện chặn đăng theo đúng quy tắc.
   - Kết nối [ExamDetail.jsx](../../frontend/src/pages/exams/ExamDetail.jsx): hiển thị dữ liệu bộ đề học viên thực tế từ API công khai, áp dụng Quyết định O4 (kỹ năng đang soạn hiển thị “—” thay vì lộ nhãn “Đang cập nhật”), hiển thị tối đa 5 bộ đề liên quan cùng danh mục, chuyển hướng làm bài thi thực tế.

5. **Đồng bộ tài liệu:**
   - Cập nhật [docs/API.md](../API.md): ghi nhận đầy đủ 17 API mới (A1–A16 và P1) kèm payload, mã trạng thái và mã lỗi nghiệp vụ.
   - Cập nhật [docs/DATABASE.md](../DATABASE.md) và [docs/csdl/CSDL.md](../csdl/CSDL.md): bổ sung bảng `exam_set_categories`, quan hệ `category_id`, trigger `updated_at`, ràng buộc `UNIQUE(name)`.
   - Cập nhật [docs/BUSINESS_RULES.md](../BUSINESS_RULES.md): chuẩn hóa BR-EXAM-002 theo Quyết định O4 và bổ sung các quy tắc BR-EXAM-003 đến BR-EXAM-009.
   - Cập nhật [docs/TASKS.md](../TASKS.md): bổ sung toàn bộ danh mục task QLBD-00 đến QLBD-14.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| Chạy 04 và 05 SQL trên PostgreSQL | Local PostgreSQL (port 5432) | Đạt. 40 bảng hoạt động đúng thiết kế D08, `select count(*) from public.exam_set_categories` = 5. |
| `npm run prisma:generate` | Local Node.js v20 | Đạt. Prisma Client tạo thành công với toàn bộ 40 models. |
| `node --test tests/exam-rules.test.mjs` | Local Node.js v20 | Đạt. 8/8 tests pass (82ms). |
| `node --test tests/exams-services.test.mjs` | Local Node.js v20 + PostgreSQL | Đạt. 3/3 suites pass (bao phủ QB-01 đến QB-12: danh mục, bộ đề, đề thi, kỹ năng, khóa, audit logs, điều kiện xóa/đăng). |
| `cd backend; npm run typecheck` | Local Node.js v20 | Đạt. 0 lỗi typecheck TypeScript (NodeNext). |
| `cd backend; npm run build` | Local Node.js v20 | Đạt. Biên dịch toàn bộ tsc sang thư mục `dist/` thành công. |
| `cd frontend; npm run build` | Local Node.js v20 | Đạt. `tsc --noEmit && vite build` hoàn tất không có lỗi, tạo bundle `dist/` hoàn chỉnh. |
| Kiểm tra menu thao tác kỹ năng (`AdminExamSet.jsx`) | Trình duyệt Chrome / Vite dev | Đạt. Menu hành động kỹ năng (`x.menuSt`) hiển thị nổi bằng tọa độ `position: fixed` bên ngoài bảng, không bị lọt/cắt trong container cuộn của bảng, tự lật lên/xuống và đóng khi cuộn. |
| Padding và giao diện menu kỹ năng | Trình duyệt Chrome / Vite dev | Đạt. Menu dùng `width: max-content` với `min-width: 240px`, padding 12px cân đối, không còn tràn mép phải; dòng "Đăng trong editor..." được render dạng thẻ tĩnh vô hiệu hóa không có hiệu ứng hover. |
| Kiểm tra tạo kỹ năng Listening & Speaking | Local API + Vite dev | Đạt. Khắc phục lỗi truyền nhầm `form: "ACADEMIC"` khi `c = null`. Listening và Speaking được gửi đúng `form: null`, tạo kỹ năng (Đang soạn) thành công không bị từ chối nghiệp vụ. |

## Phần còn mở

- Không có lỗi tồn đọng. Toàn bộ các yêu cầu chức năng, phi chức năng và giao diện trong kế hoạch Quản lý bộ đề đã hoàn thành và sẵn sàng cho các phân hệ tiếp theo.

## Bước tiếp theo

1. Tiến hành công việc nhập đề thi từ file XLSX cho 4 kỹ năng (nối tiếp các task `IMPORT-01`, `IMPORT-02`, `IMPORT-03` theo lộ trình).
2. Xây dựng các màn hình biên tập nội dung chi tiết theo từng kỹ năng (`AdminReadingEditor`, `AdminListeningEditor`, `AdminWritingEditor`, `AdminSpeakingEditor`) gắn với các bản nháp `exam_skills` đã được tạo từ màn hình quản lý bộ đề.

## Tài liệu và cách tái hiện

- Kế hoạch triển khai chi tiết: [docs/PLAN_QUAN_LY_BO_DE.md](../PLAN_QUAN_LY_BO_DE.md)
- Danh mục API: [docs/API.md](../API.md)
- Từ điển CSDL: [docs/csdl/CSDL.md](../csdl/CSDL.md)
- Quy tắc nghiệp vụ: [docs/BUSINESS_RULES.md](../BUSINESS_RULES.md)

