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

Mã A1–A16 và E1–E6 trùng chú thích trong `backend/src/modules/exams/exams.admin.routes.ts`. Các route `/admin/*` yêu cầu quyền ADMIN (`requireAuth`, `requireRole('ADMIN')`). Route công khai `/exam-sets/*` không yêu cầu xác thực. Mọi thao tác ghi trả về `ExamSetAdminDto` của cả bộ đề (trừ A10, A2, A7 của danh mục và nhóm E). Lỗi dạng `{ message, code }`; lỗi kiểm tra đầu vào là 400 `VALIDATION_ERROR` kèm danh sách chi tiết.

### Danh mục bộ đề (Categories)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A1 | GET /admin/exam-set-categories | Admin | 200, `{ items: CategoryDto[] }` sắp theo `order_no` | 401, 403 |
| A2 | POST /admin/exam-set-categories | Admin, body: `{ name }` (1–60 ký tự). Tên trùng (không phân biệt hoa thường) thì dùng lại danh mục đó | 201, `CategoryDto` | 400, 401, 403 |

### Bộ đề phía Quản trị (Admin Exam Sets)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A3 | GET /admin/exam-sets | Admin | 200, `{ items: ExamSetAdminDto[] }` | 401, 403 |
| A4 | POST /admin/exam-sets | Admin, body: `{ name, description?, categoryId? hoặc newCategoryName?, coverUrl? }` | 201, `ExamSetAdminDto` | 400, 401, 403, 409 EXAM_SET_NAME_EXISTS |
| A5 | GET /admin/exam-sets/:id | Admin | 200, `ExamSetAdminDto` kèm Test và ô kỹ năng | 401, 403, 404 EXAM_SET_NOT_FOUND |
| A6 | PATCH /admin/exam-sets/:id | Admin, body: `{ name?, description?, categoryId? hoặc newCategoryName?, coverUrl? }` | 200, `ExamSetAdminDto` | 400, 401, 403, 404, 409 EXAM_SET_NAME_EXISTS |
| A7 | PUT /admin/exam-sets/:id/cover | Admin, body nhị phân `image/jpeg`, `image/png`, `image/webp` (≤ 5 MB) | 200, `ExamSetAdminDto` với `coverUrl` | 400, 401, 403, 404, 413 COVER_TOO_LARGE, 415 COVER_TYPE, 503 STORAGE_UNAVAILABLE |
| A8 | POST /admin/exam-sets/:id/publish | Admin | 200, `ExamSetAdminDto` trạng thái PUBLISHED | 401, 403, 404, 409 EXAM_SET_EMPTY / EXAM_SET_NO_PUBLISHED_SKILL / INVALID_STATUS_TRANSITION |
| A9 | POST /admin/exam-sets/:id/hide | Admin | 200, `ExamSetAdminDto` trạng thái HIDDEN | 401, 403, 404, 409 INVALID_STATUS_TRANSITION |
| A10 | DELETE /admin/exam-sets/:id | Admin | 204 | 401, 403, 404, 409 EXAM_SET_NOT_DELETABLE |

### Quản lý Đề thi (Tests) trong bộ

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A11 | POST /admin/exam-sets/:id/exams | Admin, body: `{ title? }` (mặc định `Test {số thứ tự}`) | 201, `ExamSetAdminDto` | 400, 401, 403, 404 EXAM_SET_NOT_FOUND |
| A12 | DELETE /admin/exams/:examId | Admin | 200, `ExamSetAdminDto` sau khi xóa và đánh lại `order_no` | 401, 403, 404 EXAM_NOT_FOUND, 409 EXAM_NOT_DELETABLE |

### Quản lý Kỹ năng (Exam Skills)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| A13 | POST /admin/exams/:examId/skills | Admin, body: `{ skill, form? }` (`form` bắt buộc với READING/WRITING, rỗng với LISTENING/SPEAKING) | 201, `ExamSetAdminDto` sau khi tạo bản nháp | 400, 401, 403, 404 EXAM_NOT_FOUND, 409 SLOT_EXISTS |
| A14 | POST /admin/exam-skills/:skillId/hide | Admin | 200, `ExamSetAdminDto` (PUBLISHED sang HIDDEN) | 401, 403, 404 EXAM_SKILL_NOT_FOUND, 409 INVALID_STATUS_TRANSITION |
| A15 | POST /admin/exam-skills/:skillId/show | Admin | 200, `ExamSetAdminDto` (HIDDEN sang PUBLISHED) | 401, 403, 404, 409 INVALID_STATUS_TRANSITION |
| A16 | POST /admin/exam-skills/:skillId/publish | Admin. Writing/Speaking kiểm tra theo BR-EXAM-007 và gán quy tắc chấm `FULL_SKILL` mới nhất | 200, `ExamSetAdminDto` (bản cũ sang ARCHIVED) | 401, 403, 404, 409 INVALID_STATUS_TRANSITION, 422 SKILL_NOT_READY kèm danh sách lý do |

### Soạn đề thi 4 kỹ năng (Exam Editor)

Phục vụ `AdminWritingEditor`, `AdminSpeakingEditor`, `AdminReadingEditor`, `AdminListeningEditor` và thao tác xóa kỹ năng ở `AdminExamSet`. Hỗ trợ cả 4 kỹ năng: WRITING, SPEAKING, READING, LISTENING. Việc đăng dùng A16.

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| E1 | GET /admin/exam-skills/:skillId | Admin | 200, `EditorSkillDto` (kỹ năng, thời lượng, bộ đề, Test, ô kỹ năng, nội dung `writing`, `speaking`, `reading` hoặc `listening`; kỹ năng mới trả nội dung mặc định) | 401, 403, 404 EXAM_SKILL_NOT_FOUND |
| E2 | PUT /admin/exam-skills/:skillId/content | Admin, body: `{ baseUpdatedAt, writing }`, `{ baseUpdatedAt, speaking }`, `{ baseUpdatedAt, reading }` hoặc `{ baseUpdatedAt, listening }` (chỉ gửi 1 trong 4 nội dung; L/R hỗ trợ bản vá vi sai `LrPatch`); chỉ bản DRAFT | 200, `EditorSkillDto` sau khi lưu | 400, 401, 403, 404, 409 SKILL_NOT_DRAFT / SKILL_CHANGED (`baseUpdatedAt` đã cũ) |
| E3 | POST /admin/exam-skills/:skillId/draft | Admin, nguồn là bản PUBLISHED hoặc HIDDEN | 201 `EditorSkillDto` của bản sửa mới (`version_number` + 1); 200 nếu ô đã có bản nháp | 400, 401, 403, 404, 409 INVALID_STATUS_TRANSITION |
| E4 | – | Không có route riêng, dùng A16 | – | – |
| E5 | PUT /admin/exam-skills/:skillId/images | Admin, body nhị phân `image/jpeg`, `image/png`, `image/webp` (≤ 5 MB), bản DRAFT của Writing, Reading hoặc Listening | 201, `{ path, url }` trong bucket `exam-assets` | 400 SKILL_NOT_SUPPORTED, 401, 403, 404, 409 SKILL_NOT_DRAFT, 413 IMAGE_TOO_LARGE, 415 IMAGE_TYPE, 503 STORAGE_UNAVAILABLE |
| E6 | DELETE /admin/exam-skills/:skillId | Admin, chỉ bản DRAFT chưa có lượt làm | 200, `ExamSetAdminDto` (ô về trống, hoặc giữ bản đang hiển thị) | 401, 403, 404, 409 SKILL_NOT_DELETABLE |
| E7 | GET /admin/exam-skills/:skillId/history | Admin | 200, `SkillHistoryDto` gồm thông tin ô `slot`, danh sách `versions` (sắp xếp theo `versionNumber` giảm dần, có `basedOnVersion`, `isCurrent`, cờ thao tác) và dòng sự kiện `events` từ audit log | 401, 403, 404 EXAM_SKILL_NOT_FOUND |
| E8 | PUT /admin/exam-skills/:skillId/audio | Admin, body nhị phân `audio/mpeg`, `audio/wav`, `audio/m4a` (≤ 50 MB), chỉ Listening bản DRAFT | 201, `{ path, url, sizeBytes }` trong bucket `exam-assets` | 400 SKILL_NOT_SUPPORTED, 401, 403, 404, 409 SKILL_NOT_DRAFT, 413 AUDIO_TOO_LARGE, 415 AUDIO_TYPE, 503 STORAGE_UNAVAILABLE |
| E9 | POST /admin/exam-skills/:skillId/uploads/discard | Admin, body `{ paths: string[] }`, chỉ dọn tệp thuộc `exam-skills/:skillId/` | 200, `{ removedCount: number }` | 400 VALIDATION_ERROR, 401, 403, 404 |
| E10 | POST /admin/exam-skills/:skillId/sections/:orderNo/transcribe | Admin, body `{ audioPath: string }`, chỉ Listening bản DRAFT, giới hạn tần suất 20 lần/giờ/người quản lý | 202, `{ jobId: string }` | 400 SKILL_NOT_SUPPORTED, 401, 403, 404, 409 SKILL_NOT_DRAFT, 429 RATE_LIMIT_EXCEEDED, 503 TRANSCRIBE_UNAVAILABLE |
| E11 | GET /admin/transcriptions/:jobId | Admin (đúng người tạo job) | 200, `{ status: 'processing' \| 'done' \| 'error', paragraphs?: [...], message?: string }` | 401, 403 FORBIDDEN, 404 JOB_NOT_FOUND |

### Hiệu năng và Middleware (Performance & Middleware)

- **Đo thời gian (Server-Timing)**: Mọi phản hồi API trả header `Server-Timing` dạng `total;dur=X, auth;dur=Y, db;dur=Z` cho phép trình duyệt và công cụ kiểm thử đo chính xác thời gian xử lý tổng thể, thời gian xác thực và thời gian truy vấn DB.
- **Nén dữ liệu (HTTP Compression)**: Middleware `compression` được kích hoạt trên toàn bộ máy chủ với ngưỡng nén 1024 bytes (1KB), giúp giảm kích thước gói tin JSON đề thi và transcript từ hàng trăm KB xuống dưới 20–30KB.
- **Bộ nhớ đệm phản hồi (Response Cache-Control)**: Route `GET /admin/exam-set-categories` (A1) trả kèm header `Cache-Control: private, max-age=60` nhằm giảm tải truy vấn lặp lại khi người quản lý thao tác danh mục bộ đề.
- **Xác thực JWT tại chỗ (Local JWKS)**: Token Bearer được xác thực cục bộ bằng public key từ Supabase JWKS kèm bộ nhớ đệm hồ sơ người dùng 60 giây (`Map<userId, {user, expires}>`), giảm chi phí xác thực mạng từ 250–950ms xuống < 1.5ms mỗi request.

### Bộ đề phía Học viên (Public Learner API)

| Mã | Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|---|
| P1 | GET /exam-sets/:id | Công khai | 200, `ExamSetPublicDto` chỉ gồm Test có kỹ năng PUBLISHED, kèm tối đa 5 bộ đề cùng danh mục | 404 EXAM_SET_NOT_FOUND (không tồn tại hoặc chưa PUBLISHED) |

## Điều kiện trước khi công bố API học tập

Backend hiện chỉ mount health và Auth. Bảng này xác định quyền và điều kiện cho hợp đồng tiếp theo. Đường dẫn và payload nghiệp vụ cần được chốt khi triển khai.

| Thao tác dự kiến | Kiểm tra trên máy chủ | Cam kết khi ghi |
|---|---|---|
| Lấy đề, lưu và nộp bài | Chủ lượt làm, phiên bản và deadline. Loại đáp án, bằng chứng khỏi dữ liệu khi đang thi. | Nộp lại không sinh thêm điểm hoặc phiên học. BR-ATTEMPT-001/002. |
| Tải bài W/S | Chủ bài hoặc quan hệ phân công hợp lệ, nội dung còn hạn | Quyền tải tạm không vượt hạn. BR-CONTENT-002. |
| Gửi yêu cầu chấm | Người học sở hữu bài, lượt và trạng thái hợp lệ | Ghi yêu cầu, lượt và hạn trong một transaction. BR-REQUEST-001. |
| Công bố kết quả | Giáo viên được giao còn quyền và yêu cầu đang ASSIGNED | Một phiếu công bố, cập nhật hạn lưu cùng transaction. BR-REVIEW-001/002. |
| Nhập XLSX | Quản lý, đúng đề, kỹ năng, phiên bản nháp | Trả lỗi theo vị trí, chống trùng bằng request_key. BR-IMPORT-001. |
