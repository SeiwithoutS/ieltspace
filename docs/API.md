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

## Điều kiện trước khi công bố API học tập

Backend hiện chỉ mount health và Auth. Bảng này xác định quyền và điều kiện cho hợp đồng tiếp theo. Đường dẫn và payload nghiệp vụ cần được chốt khi triển khai.

| Thao tác dự kiến | Kiểm tra trên máy chủ | Cam kết khi ghi |
|---|---|---|
| Lấy đề, lưu và nộp bài | Chủ lượt làm, phiên bản và deadline. Loại đáp án, bằng chứng khỏi dữ liệu khi đang thi. | Nộp lại không sinh thêm điểm hoặc phiên học. BR-ATTEMPT-001/002. |
| Tải bài W/S | Chủ bài hoặc quan hệ phân công hợp lệ, nội dung còn hạn | Quyền tải tạm không vượt hạn. BR-CONTENT-002. |
| Gửi yêu cầu chấm | Người học sở hữu bài, lượt và trạng thái hợp lệ | Ghi yêu cầu, lượt và hạn trong một transaction. BR-REQUEST-001. |
| Công bố kết quả | Giáo viên được giao còn quyền và yêu cầu đang ASSIGNED | Một phiếu công bố, cập nhật hạn lưu cùng transaction. BR-REVIEW-001/002. |
| Nhập XLSX | Quản lý, đúng đề, kỹ năng, phiên bản nháp | Trả lỗi theo vị trí, chống trùng bằng request_key. BR-IMPORT-001. |
