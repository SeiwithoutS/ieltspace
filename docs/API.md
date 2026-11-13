# Hợp đồng HTTP hiện có

Base URL local là `http://localhost:3001/api`. Bảng dưới dùng đường dẫn tương đối với base này. Các route Auth đặt Cache-Control: no-store. Mọi POST Auth yêu cầu Origin khớp FRONTEND_ORIGIN. Trình duyệt gửi credentials để nhận/gửi cookie. Body có dữ liệu dùng JSON. [Router Auth](../backend/src/modules/auth/auth.routes.ts) và [middleware bảo vệ](../backend/src/middleware/auth.ts) là căn cứ.

| Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|
| GET /health | Công khai | 200, status=ok, service=ieltspace-backend | Lỗi kết nối dịch vụ |
| POST /auth/register | Công khai, email, password 8–128 ký tự, fullName sau trim 2–100 ký tự | 202 {message}, hướng dẫn kiểm tra email | 400, 429, lỗi đăng ký/dịch vụ |
| POST /auth/login | Công khai, email, password 1–128 ký tự | 200 {user,session}, đặt cookie | 401 LOGIN_FAILED, 403 hồ sơ, 429, 503 |
| POST /auth/refresh | Cookie phiên hiện tại, không cần body | 200 {user,session}, thay cookie và đọc lại hồ sơ | 401 NO_SESSION/SESSION_EXPIRED, 403 hồ sơ, 503 |
| POST /auth/logout | Cookie phiên hiện tại, không cần body | 204, xóa cookie. Thiếu phiên cũng trả 204 | LOGOUT_FAILED hoặc lỗi dịch vụ |
| GET /auth/me | Authorization: Bearer accessToken | 200 {user} của chính phiên | 401 UNAUTHENTICATED/INVALID_TOKEN, 403 hồ sơ, 503 |
| POST /auth/forgot-password | Công khai, email | 202 {message} chung, tránh tiết lộ tài khoản | 400, 429, 503 |
| POST /auth/reset-password | tokenHash của luồng recovery, password mới 8–128 ký tự | 200 {message}, xóa cookie. Đọc thông điệp nếu chưa xác nhận được thu hồi phiên cũ | 400 INVALID_RECOVERY/RESET_FAILED, 429, 503 |
| POST /auth/google | Công khai, không cần body | 200 {url}, frontend điều hướng đến URL OAuth | GOOGLE_LOGIN_START_FAILED, 429, 503 |
| GET /auth/google/callback | Trình duyệt quay về với code và cookie PKCE, hoặc lỗi provider | 303 tới frontend /auth/callback sau khi đặt cookie | Khi OAuth thất bại, chuyển hướng về /login với auth_error |

**Dữ liệu phiên.** user có id, auth_user_id, full_name, display_name, email, avatar_url, role, status. session có accessToken, expiresAt, expiresIn và tokenType. Cookie ielts_refresh_token là HttpOnly, path=/api/auth, Secure ở production, SameSite theo cấu hình. Cookie lưu 7 ngày. Mã phía client không cần đọc refresh token. Các API này xác định người dùng từ phiên, không nhận user_id đích. BR-AUTH-001 áp dụng khi kiểm tra hồ sơ.

**Lỗi.** HttpError trả {message,code}. Zod hoặc JSON hỏng trả 400 {message}. Bộ giới hạn tần suất đăng nhập có dạng {error:{code,message}}. 403 INVALID_ORIGIN khác với 403 PROFILE_NOT_FOUND/ACCOUNT_UNAVAILABLE. Frontend cần xử lý theo trạng thái HTTP và kiểu body thực tế.

## Quản lý bộ đề (Exam Sets)

Các route `/admin/*` yêu cầu quyền ADMIN (`requireRole(['ADMIN'])`). Route công khai `/exam-sets/*` không yêu cầu xác thực.

### Danh mục bộ đề (Categories)

| Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|
| GET /admin/categories | Admin, không cần body | 200, danh sách `ExamSetCategoryDto[]` sắp xếp theo order_no | 401, 403 |
| POST /admin/categories | Admin, body: `{ name, description?, orderNo? }` | 201, `ExamSetCategoryDto` vừa tạo | 400, 401, 403, 409 CATEGORY_NAME_EXISTS |

### Bộ đề phía Quản trị (Admin Exam Sets)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A1 | GET /admin/exam-sets | Admin, query: `status?` (DRAFT/PUBLISHED/HIDDEN), `categoryId?`, `q?` | 200, danh sách `ExamSetAdminDto[]` | 401, 403 |
| A2 | POST /admin/exam-sets | Admin, body: `{ name, description?, categoryId?, newCategoryName?, coverUrl? }` | 201, `ExamSetAdminDto` vừa tạo | 400, 401, 403, 409 EXAM_SET_NAME_EXISTS |
| A3 | GET /admin/exam-sets/:id | Admin, param: `id` (UUID) | 200, `ExamSetAdminDto` chi tiết kèm danh sách Tests và kỹ năng | 401, 403, 404 EXAM_SET_NOT_FOUND |
| A4 | PATCH /admin/exam-sets/:id | Admin, param: `id`, body: `{ name?, description?, categoryId?, newCategoryName?, coverUrl? }` | 200, `ExamSetAdminDto` sau cập nhật | 400, 401, 403, 404, 409 EXAM_SET_NAME_EXISTS |
| A5 | PUT /admin/exam-sets/:id/cover | Admin, param: `id`, binary body: `image/jpeg, image/png, image/webp` (≤ 5MB) | 200, `ExamSetAdminDto` với `coverUrl` từ Storage | 400, 401, 403, 404, 413, 415 |
| A6 | POST /admin/exam-sets/:id/publish | Admin, param: `id` | 200, `ExamSetAdminDto` trạng thái PUBLISHED | 401, 403, 404, 409 CANNOT_PUBLISH_EMPTY_SET / NO_PUBLISHED_SKILLS |
| A7 | POST /admin/exam-sets/:id/hide | Admin, param: `id` | 200, `ExamSetAdminDto` trạng thái HIDDEN | 401, 403, 404, 409 |
| A8 | DELETE /admin/exam-sets/:id | Admin, param: `id` | 204 No Content | 401, 403, 404, 409 CANNOT_DELETE_PUBLISHED_SET / CANNOT_DELETE_SET_WITH_TESTS / CANNOT_DELETE_SET_WITH_ATTEMPTS |

### Quản lý Đề thi (Tests) trong bộ

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A9 | POST /admin/exam-sets/:id/exams | Admin, param: `id` (examSetId), body: `{ title? }` | 201, `ExamSetAdminDto` sau khi thêm Test | 400, 401, 403, 404 |
| A10 | PATCH /admin/exams/:examId | Admin, param: `examId`, body: `{ title?, description? }` | 200, `ExamSetAdminDto` sau khi sửa | 400, 401, 403, 404 |
| A11 | DELETE /admin/exams/:examId | Admin, param: `examId` | 200, `ExamSetAdminDto` sau khi xóa Test và re-index order_no | 401, 403, 404, 409 CANNOT_DELETE_EXAM_PUBLISHED / CANNOT_DELETE_EXAM_WITH_ATTEMPTS |

### Quản lý Kỹ năng (Exam Skills)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A12 | POST /admin/exams/:examId/skills | Admin, param: `examId`, body: `{ skill, form? }` | 201, `ExamSetAdminDto` sau khi tạo bản nháp DRAFT v1 | 400, 401, 403, 404, 409 DRAFT_ALREADY_EXISTS |
| A13 | POST /admin/exam-skills/:id/publish | Admin, param: `id` (skillId) | 200, `ExamSetAdminDto` sau khi công khai kỹ năng | 401, 403, 404, 409 SKILL_NOT_READY (kèm reasons) |
| A14 | POST /admin/exam-skills/:id/hide | Admin, param: `id` | 200, `ExamSetAdminDto` trạng thái HIDDEN | 401, 403, 404, 409 |
| A15 | POST /admin/exam-skills/:id/show | Admin, param: `id` (kỹ năng đang HIDDEN) | 200, `ExamSetAdminDto` trạng thái PUBLISHED | 401, 403, 404, 409 |
| A16 | POST /admin/exam-skills/:id/draft | Admin, param: `id` (nhân bản từ PUBLISHED/HIDDEN/ARCHIVED) | 201, `ExamSetAdminDto` với bản DRAFT mới tăng version_number | 401, 403, 404, 409 DRAFT_ALREADY_EXISTS |

### Bộ đề phía Học viên (Public Learner API)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| P1 | GET /exam-sets/:id | Công khai, param: `id` | 200, `ExamSetPublicDto` chỉ chứa tests có kỹ năng PUBLISHED, kèm tối đa 5 bộ đề liên quan cùng danh mục | 404 EXAM_SET_NOT_FOUND (khi không tồn tại hoặc chưa PUBLISHED) |

## Điều kiện trước khi công bố API học tập

Backend hiện chỉ mount health và Auth. Bảng này xác định quyền và điều kiện cho hợp đồng tiếp theo. Đường dẫn và payload nghiệp vụ cần được chốt khi triển khai.

| Thao tác dự kiến | Kiểm tra trên máy chủ | Cam kết khi ghi |
|---|---|---|
| Lấy đề, lưu và nộp bài | Chủ lượt làm, phiên bản và deadline. Loại đáp án, bằng chứng khỏi dữ liệu khi đang thi. | Nộp lại không sinh thêm điểm hoặc phiên học. BR-ATTEMPT-001/002. |
| Tải bài W/S | Chủ bài hoặc quan hệ phân công hợp lệ, nội dung còn hạn | Quyền tải tạm không vượt hạn. BR-CONTENT-002. |
| Gửi yêu cầu chấm | Người học sở hữu bài, lượt và trạng thái hợp lệ | Ghi yêu cầu, lượt và hạn trong một transaction. BR-REQUEST-001. |
| Công bố kết quả | Giáo viên được giao còn quyền và yêu cầu đang ASSIGNED | Một phiếu công bố, cập nhật hạn lưu cùng transaction. BR-REVIEW-001/002. |
| Nhập XLSX | Quản lý, đúng đề, kỹ năng, phiên bản nháp | Trả lỗi theo vị trí, chống trùng bằng request_key. BR-IMPORT-001. |
