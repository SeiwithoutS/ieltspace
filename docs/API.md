# Hợp đồng HTTP hiện có

Base URL local là `http://localhost:3001/api`. Bảng dưới dùng đường dẫn tương đối với base này. Các route Auth đặt Cache-Control: no-store. Mọi POST Auth yêu cầu Origin khớp FRONTEND_ORIGIN. Trình duyệt gửi credentials để nhận/gửi cookie. Body có dữ liệu dùng JSON. [Router Auth](../backend/src/modules/auth/auth.routes.ts) và [middleware bảo vệ](../backend/src/middleware/auth.ts) là căn cứ.

| Method và đường dẫn | Người gọi và đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|
| GET /health | Công khai | 200, status=ok, service=ieltspace-backend | Lỗi kết nối dịch vụ |
| POST /auth/register | Công khai, email, password 8–128 ký tự, fullName sau trim 2–100 ký tự | 202 {message}, hướng dẫn kiểm tra email | 400, 429, lỗi đăng ký/dịch vụ |
| POST /auth/login | Công khai, email, password 1–128 ký tự | 200 {user,session}, đặt cookie | 401 LOGIN_FAILED, 403 EMAIL_NOT_VERIFIED hoặc hồ sơ, 429, 503 |
| POST /auth/resend-verification | Công khai, chỉ nhận {email}, tối đa 5 yêu cầu mỗi phút theo IP tại ứng dụng | 202 {message} trung tính sau khi gửi yêu cầu xác minh đăng ký qua Supabase Auth | 400 sai đầu vào hoặc gửi thất bại, 429, 503 |
| POST /auth/refresh | Cookie phiên hiện tại, không cần body | 200 {user,session}, thay cookie và đọc lại hồ sơ | 401 NO_SESSION/SESSION_EXPIRED, 403 hồ sơ, 503 |
| POST /auth/logout | Cookie phiên hiện tại, không cần body | 204, xóa cookie. Thiếu phiên cũng trả 204 | LOGOUT_FAILED hoặc lỗi dịch vụ |
| GET /auth/me | Authorization: Bearer accessToken | 200 {user} của chính phiên | 401 UNAUTHENTICATED/INVALID_TOKEN, 403 hồ sơ, 503 |
| POST /auth/forgot-password | Công khai, email | 202 {message} chung, tránh tiết lộ tài khoản | 400, 429, 503 |
| POST /auth/reset-password | `{ tokenHash, password, code? }`, mật khẩu mới 8–128 ký tự | 200 `{ message }`, xóa cookie. Với tài khoản có TOTP, website yêu cầu mã 6 số sau khi xác minh liên kết và giữ phiên khôi phục trong cookie HttpOnly tối đa 5 phút. | 400 INVALID_RECOVERY/RESET_FAILED, 403 AUTHENTICATOR_REQUIRED/AUTHENTICATOR_FAILED, 429, 503 |
| POST /auth/google | Công khai, không cần body | 200 {url}, frontend điều hướng đến URL OAuth | GOOGLE_LOGIN_START_FAILED, 429, 503 |
| GET /auth/google/callback | Trình duyệt quay về với code và cookie PKCE, hoặc lỗi provider | 303 tới frontend /auth/callback sau khi đặt cookie | Khi OAuth thất bại, chuyển hướng về /login với auth_error |

**Dữ liệu phiên.** user có id, auth_user_id, full_name, display_name, email, avatar_url, role, status và must_change_password. Cờ này dùng để nhắc nhân sự đổi mật khẩu tạm. session có accessToken, expiresAt, expiresIn và tokenType. Cookie ielts_refresh_token là HttpOnly, path=/api/auth, Secure ở production, SameSite theo cấu hình. Cookie lưu 7 ngày. Các API này xác định người dùng từ phiên. BR-AUTH-001 áp dụng khi kiểm tra hồ sơ.

**Lỗi.** HttpError trả {message,code}. Zod hoặc JSON hỏng trả 400 {message}. Bộ giới hạn tần suất đăng nhập có dạng {error:{code,message}}. 403 INVALID_ORIGIN khác với 403 PROFILE_NOT_FOUND/ACCOUNT_UNAVAILABLE. Frontend cần xử lý theo trạng thái HTTP và kiểu body thực tế.

### Hồ sơ cá nhân

Đọc hồ sơ bằng `GET /auth/me` hoặc dữ liệu phiên hiện có. Các route bên dưới dùng Bearer, kiểm tra tài khoản còn hoạt động và dùng được cho Người học, Giáo viên và Quản lý. Với thao tác ghi, `Origin` phải khớp `FRONTEND_ORIGIN`. `user.id` được xác định từ phiên.

| Method và đường dẫn | Đầu vào | Thành công và lỗi cần xử lý |
|---|---|---|
| PATCH /auth/me | `{ displayName }`, 2–100 ký tự sau trim | 200 `{ user }`. 400 tên hoặc trường không hợp lệ. |
| GET /auth/me/avatar-options | Không có | 200 `{ maxBytes }`. 5 MiB khi ghi lên R2, 2 MiB khi ghi lên Supabase Storage. |
| PUT /auth/me/avatar | Body nhị phân JPG/PNG, giới hạn theo `avatar-options` | 200 `{ user }`. 413 quá dung lượng, 415 sai định dạng, 503 lỗi Storage. |
| GET /auth/me/avatar | Không có | 200 `{ url }`, `null` nếu chưa có ảnh của ứng dụng. URL ký hết hạn sau 5 phút. |
| DELETE /auth/me/avatar | Không có | 200 `{ user }`, đã gỡ ảnh. |
| GET /auth/me/password-options | Không có | 200 `{ google, canSendSetupEmail, authenticator }` lấy từ Auth. |
| POST /auth/me/password | `{ currentPassword, newPassword, code? }`, mật khẩu mới 8–128 ký tự. Tài khoản có TOTP cần mã 6 số. | 200 `{ message }`, xóa refresh cookie và yêu cầu đăng nhập lại. 400 nếu sai mật khẩu hiện tại, mật khẩu trùng hoặc mật khẩu mới bị từ chối. |
| POST /auth/me/password/setup | Không có | 202 `{ message }` khi Auth tiếp nhận yêu cầu gửi link đặt mật khẩu đến email đã xác minh của tài khoản có Google. 403 khi chưa đủ điều kiện. |
| GET /auth/me/authenticator | Quản lý đang hoạt động | 200 `{ enabled }`. |
| POST /auth/me/authenticator/enroll | Quản lý đang hoạt động, đã đổi mật khẩu tạm nếu có | 201 `{ factorId, qrCode }`. Mã QR là ảnh chỉ hiện trong lúc thiết lập. |
| POST /auth/me/authenticator/verify | `{ factorId, code }`, mã TOTP 6 số từ ứng dụng đã quét QR | 200 `{ user, session }` và cập nhật cookie phiên sau khi bật TOTP. |

Backend giữ bucket avatar riêng tư. `AVATAR_STORAGE_PROVIDER=auto` dùng R2 cho ảnh mới nếu có `R2_ENDPOINT`, `R2_ACCESS_KEY_ID` và `R2_SECRET_ACCESS_KEY`. Khi chưa cấu hình R2, ảnh mới dùng Supabase Storage và `STORAGE_BUCKET_AVATARS`. `users.avatar_url` giữ khóa đối tượng. Khóa R2 có tiền tố `r2:` để đọc/xóa đúng kho. Giữ cấu hình cũ khi còn ảnh tham chiếu đến kho đó. Tài khoản Google dùng template khôi phục và trang `/reset-password` hiện có. Sau khi đổi mật khẩu, backend yêu cầu thu hồi refresh session toàn cục. Access token cũ có thể còn hiệu lực đến khi hết hạn theo D11.

### Mục tiêu và Flashcard người học

Yêu cầu Bearer, vai trò `LEARNER` và `Origin` hợp lệ đối với POST. Backend truy vấn theo chủ sở hữu từ phiên. Cần [migration 14](csdl/14_learner_study_history.sql) cho metadata và nguồn Flashcard `REVIEW`.

| Method và đường dẫn | Đầu vào | Thành công |
|---|---|---|
| GET /learner/goals | Không có | `{ current, history }`, lịch sử 20 bản có hiệu lực gần nhất. |
| POST /learner/goals | `{ overall, listening, reading, writing, speaking, dailySessions }`. Band nullable, từ 0 đến 9 theo bước 0,5. `dailySessions` là số nguyên dương. | `{ current, history }`. Tạo bản mới với `effectiveFrom` nếu nội dung thay đổi. |
| POST /learner/flashcards | `{ id, ownerId, title, source, cardIds, reviews, finishedAt, elapsedSeconds, reason }`. `id` là UUID ổn định. `source.type` là `SET` (có `setId`), `FAVORITES` hoặc `REVIEW`. Mỗi đánh giá là `{ wordId, remembered }`. `finishedAt` tính bằng ms Unix. `reason` nhận `completed`, `timeout`, `stopped`. `ownerId` phải trùng phiên đăng nhập để tránh gửi nhầm khi đổi tài khoản. | 201 `{ id }` khi tạo. 200 cùng `id` nếu phiên của người học đã lưu. 409 nếu mã đã thuộc tài khoản khác. |
| GET /learner/flashcards | `before` tùy chọn (UUID phiên cuối trang trước) | `{ items, nextCursor, stats? }`. Trang đầu trả số phiên, số từ khác nhau đã ôn và ID các từ chưa nhớ theo đánh giá gần nhất. Các trang sau trả danh sách phiên. |
| GET /learner/progress | Không có | `{ today, nextDayAt, goal, todaySessions, currentStreak, longestStreak, checkedInToday, checkInDays, flashcards }`. `checkInDays` gồm bảy phần tử `{ date, checkedIn }` từ thứ Hai đến Chủ nhật. Ngày và thời điểm nửa đêm kế tiếp lấy theo giờ Việt Nam. `goal` có thể `null`. |
| GET /learner/dashboard | `days=7\|30`, mặc định 7 | `{ practice, flashcards, reviewedWords, days, skills }`. Đếm lượt làm bài đã hoàn thành, phiên Flashcard đã lưu và số từ khác nhau đã ôn của người học. `days` gồm `{ date, practice, flashcards }` theo ngày Việt Nam, kể cả ngày chưa có hoạt động. `skills` đếm lượt hoàn thành theo kỹ năng. |
| GET /learner/activity-calendar | `year` tùy chọn. Mặc định 365 ngày gần nhất gồm hôm nay. | `{ startDate, endDate, years, days }` theo giờ Việt Nam. `years` gồm năm hiện tại và các năm có hoạt động. `days` gồm `{ date, practice, flashcards }` cho những ngày có lượt thi/luyện hoàn thành hoặc Flashcard đủ điều kiện. Ngày hiện tại là giới hạn cuối khi xem năm đang diễn ra. |
| POST /learner/check-in | `{ ownerId }` khớp tài khoản người học trong phiên hiện tại. | Ghi một lượt điểm danh cho ngày Việt Nam hiện tại và trả cùng cấu trúc với `GET /learner/progress`. Gửi lại trong ngày trả tiến độ mới nhất và dùng lại lượt điểm danh của ngày đó. |
| GET /learner/results | `kind=all\|band\|practice`, tùy chọn `group=LR\|WS`, `skill`, `before` là ID kết quả cuối trang, `limit` 1–25 | `{ items, nextCursor }`. `band` và `accuracy` nullable theo phạm vi kết quả. Khi có `group` và `kind=all`, trả cả bài hoàn thành chưa có điểm. Bài luyện theo phần hoặc nhóm câu dùng tỷ lệ đúng đã lưu. Band Writing/Speaking toàn kỹ năng chỉ đọc sau công bố. Item WRITING/SPEAKING có thêm: `contentStatus` (`AVAILABLE\|HELD\|EXPIRED\|DELETED\|null`, `AVAILABLE` được tính là `EXPIRED` khi đến hạn), `contentExpiresAt` (ISO\|null), `grading` `{ status: WAITING_ASSIGNMENT\|ASSIGNED\|COMPLETED\|CANCELLED\|null, cancelReason, assignmentDeadlineAt }` lấy từ yêu cầu chấm mới nhất (null nếu chưa gửi chấm), `published` (đã công bố nhận xét), `recordingCount` (số bản ghi `UPLOADED`, chỉ Speaking), `attemptMode` (`REAL\|PRACTICE\|null`). `sections` là số thứ tự Task/Part đã chọn (từ 1) hoặc `null` cho lượt cũ. Item Listening/Reading không có các trường này. |

`POST /learner/flashcards` ghi một hoạt động hợp lệ trong cùng giao dịch với phiên và thẻ. Ngưỡng là số thẻ khác nhau theo cấu hình (mặc định 10), giảm xuống số thẻ đã chọn nếu tập nhỏ hơn. Tiến độ cộng thêm các lượt làm bài đã hoàn tất theo `attempts.id`, mỗi lượt một lần. Các phiên Flashcard đủ điều kiện đã lưu trước được bổ sung bằng [migration 15](csdl/15_learner_activity.sql). Chuỗi đăng nhập và kỷ lục đọc từ bảng điểm danh được tạo trong [migration 16](csdl/16_learner_checkins.sql).

### Lượt làm Speaking/Writing và bản ghi âm, văn bản (Người học)

Yêu cầu Bearer, vai trò `LEARNER`; POST/PUT/DELETE cần `Origin` hợp lệ. Mã trong `skill-attempts` là `skill_attempts.id`. Người không phải chủ lượt nhận 404 `ATTEMPT_NOT_FOUND`. Cần [migration 26](csdl/26_speaking_attempts.sql) và bucket Storage riêng tư. Mã nguồn: `backend/src/modules/attempts`.

| Method và đường dẫn | Đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|
| GET /learner/exam-skills/:examSkillId/speaking | Không có | `{ examSkillId, title, durationMinutes, parts }`. `parts` luôn 3 phần tử theo thứ tự Part 1, 2, 3: `{ kind:'qs', questions:string[], instr? }` hoặc `{ kind:'cue', cue:{ prep, speak, text, topic? } }`. `prep`, `speak` tính bằng phút. Chỉ ô kỹ năng Speaking `PUBLISHED` trong bộ `PUBLISHED`; không có thông tin chấm. | 404 EXAM_SKILL_NOT_FOUND |
| GET /learner/exam-skills/:examSkillId/writing | Không có | `{ examSkillId, title, form ('ACADEMIC'\|'GENERAL'\|null), durationMinutes, tasks }`. `tasks` luôn 2 phần tử: `{ taskKey:'task1'\|'task2', prompt, imageUrl (URL công khai hoặc null), minWords (cấu hình đề, mặc định 150/250), essayType?, topic? }`. Chỉ ô kỹ năng Writing `PUBLISHED` trong bộ `PUBLISHED`; không có thông tin chấm. Id của kỹ năng khác (Speaking...) trả 404. | 404 EXAM_SKILL_NOT_FOUND |
| POST /learner/skill-attempts | `{ clientAttemptId (uuid), examSkillId (Speaking hoặc Writing), mode: REAL hoặc PRACTICE, limitMinutes: 1..60 hoặc null, sections?: number[] }` | 201 `{ id, status, startedAt, deadlineAt }` (`deadlineAt` có thể `null`). Gọi lại cùng `clientAttemptId` của cùng người dùng trả 200 với bản cũ. `started_at` do máy chủ ghi; kỹ năng do máy chủ suy ra từ `examSkillId`. REAL: Speaking `deadlineAt = startedAt + 15 phút`, Writing `+ 60 phút`, bỏ qua `limitMinutes`. PRACTICE: `sections` ghi thứ tự Task/Part từ 1, bỏ trùng và kiểm với kỹ năng. Bỏ `sections` hoặc chọn REAL thì lưu cả kỹ năng. `limitMinutes=null` là không giới hạn, Speaking tối đa 30 phút, Writing tối đa 60. | 400 VALIDATION_ERROR hoặc INVALID_SECTION, 404 EXAM_SKILL_NOT_FOUND, 409 CLIENT_ATTEMPT_ID_CONFLICT (mã đã dùng cho đề khác hoặc cho lượt không phải Speaking/Writing) |
| GET /learner/skill-attempts/:id | Không có | `{ id, skill ('SPEAKING'\|'WRITING'), status, mode, startedAt, deadlineAt, completedAt, contentStatus, contentExpiresAt, sections, elapsedSeconds, recordings:[{ questionId, partIndex, status, durationMs, size }] }`, `status` của bản ghi là `PENDING` hoặc `UPLOADED`. `elapsedSeconds` chỉ có khi `COMPLETED`, ngược lại `null`. `HELD` trả hạn `null`. Lượt hết hạn vẫn trả metadata, không trả bản ghi hoặc số từ. Lượt Writing: `recordings` luôn `[]` và có thêm `tasks:[{ taskKey, wordCount, updatedAt }]` (không kèm nội dung; `[]` khi chưa lưu gì hoặc nội dung đã hết hạn). | 404 ATTEMPT_NOT_FOUND |
| GET /learner/skill-attempts/:id/writing | Không có | 200 `{ sections, tasks:[{ taskKey, text }] }` cho chủ lượt Writing đã hoàn thành. Chỉ trả Task có văn bản. Trình duyệt dùng phản hồi này để xem và tạo tệp .docx. | 404 ATTEMPT_NOT_FOUND, 409 ATTEMPT_NOT_COMPLETED, 410 CONTENT_EXPIRED |
| PUT /learner/skill-attempts/:id/writing/:taskKey | `{ text: string, tối đa 20.000 ký tự (có thể rỗng) }`, `taskKey` là `task1` hoặc `task2` | 200 `{ taskKey, wordCount, updatedAt }`. Lưu văn bản vào `submission_contents.text_content` (`question_key` = taskKey, `section_id` = Task tương ứng); ghi đè được nhiều lần, gọi lại cùng nội dung vẫn 200 (idempotent). Chỉ nhận khi `IN_PROGRESS` và chưa quá `deadline_at` + 120 giây; sau `COMPLETED` không sửa được (client phải PUT lần cuối trước khi gọi `complete`). Chỉ lượt Writing của chính người gọi; lượt Speaking hoặc của người khác trả 404. Nội dung bài viết không được ghi log. | 400 VALIDATION_ERROR, 404 ATTEMPT_NOT_FOUND, TASK_NOT_FOUND; 409 ATTEMPT_TIME_EXPIRED, ATTEMPT_NOT_ACTIVE; 410 CONTENT_EXPIRED |
| GET /learner/skill-attempts/:id/writing/:taskKey | Không có | 200 `{ taskKey, text, wordCount, updatedAt }` cho chủ lượt Writing (khôi phục bài dở hoặc xem lại). Chưa lưu gì cho Task đó thì `{ text:'', wordCount:0, updatedAt:null }`. Không đổi hạn nội dung. | 404 ATTEMPT_NOT_FOUND, TASK_NOT_FOUND; 410 CONTENT_EXPIRED (đến hạn 14 ngày hoặc đã dọn) |
| POST /learner/skill-attempts/:id/recordings | `{ questionId (khóa câu do client đặt, [A-Za-z0-9_.:-]{1,64}), partIndex 0..2 (Part 1 = 0), durationMs, mimeType (audio/*), size (1 byte đến 25 MB) }` | 200 `{ uploadUrl, path, alreadyUploaded }`. Client PUT file lên `uploadUrl` (URL ký của Supabase, hiệu lực do Supabase quy định, hiện 2 giờ, không chỉnh được), rồi gọi `confirm`. Tạo hoặc cập nhật hàng `PENDING` ở `submission_contents`. REAL: câu đã `UPLOADED` thì 409; câu `PENDING` được cấp lại URL nhưng storage vẫn cấm ghi đè (tắt upsert). Hàng `PENDING` đã có thì giữ nguyên `path`, loại và dung lượng đã khai lần đầu (chỉ cấp lại URL, không xóa file cũ); `mimeType` khác loại đã khai (bỏ phần sau `;`) thì 409 RECORDING_MIME_MISMATCH. Nếu hàng `PENDING` đã có và file đã nằm trên storage đúng dung lượng thì trả `{ uploadUrl:null, path, alreadyUploaded:true }`: client bỏ PUT và gọi `confirm`. PRACTICE đang làm: ghi đè được; sau `COMPLETED` PRACTICE cũng như REAL (chỉ tải nốt hàng `PENDING`, không ghi đè). Chỉ nhận khi `IN_PROGRESS` (đến `deadline_at` + 120 giây ân hạn) hoặc trong 15 phút sau `COMPLETED`; sau hoàn thành, mọi chế độ chỉ cho hàng đã đăng ký lúc đang làm. | 400 VALIDATION_ERROR, INVALID_PART, QUESTION_PART_MISMATCH; 404; 409 RECORDING_ALREADY_EXISTS, ATTEMPT_TIME_EXPIRED, ATTEMPT_NOT_ACTIVE; 410 CONTENT_EXPIRED; 503 STORAGE_UNAVAILABLE |
| POST /learner/skill-attempts/:id/recordings/:questionId/confirm | Không có | 200 `{ status:'UPLOADED' }`. Kiểm file có trong storage và dung lượng khớp `size` đã khai. Gọi lại khi đã `UPLOADED` vẫn 200. Không phụ thuộc `deadline_at`, ân hạn hay cửa sổ 15 phút sau hoàn thành (file đã nằm trên storage); chỉ chặn khi nội dung đã hết hạn lưu. | 404 RECORDING_NOT_FOUND, 409 RECORDING_NOT_UPLOADED, 410 CONTENT_EXPIRED, 422 RECORDING_SIZE_MISMATCH |
| POST /learner/skill-attempts/:id/complete | `{ elapsedSeconds, reason?: SUBMITTED hoặc TIME_UP }` | 200 `{ status:'COMPLETED', completedAt, contentExpiresAt (= completedAt + 14 ngày), durationSeconds }`. Một transaction cập nhật `skill_attempts` và `attempts`. Máy chủ tự tính `durationSeconds` từ `started_at`, không vượt giới hạn của lượt; `elapsedSeconds` của client chỉ để tham chiếu (số >= 0, không giới hạn trên, máy chủ không dùng). Gọi lại trả đúng kết quả lần đầu. Không tự gửi chấm (BR-CONTENT-001). | 404, 409 ATTEMPT_NOT_ACTIVE (lượt đã hủy) |
| GET /learner/skill-attempts/:id/recordings/:questionId/url | Không có | 200 `{ url, expiresAt }`, URL tải ký tối đa 300 giây, chỉ cho bản ghi `UPLOADED`. Khi còn thời hạn, TTL được giới hạn theo số giây tròn còn lại và trả 410 nếu không còn đủ một giây để ký. Bài `HELD` dùng TTL 300 giây. Không đổi hạn nội dung. URL không được ghi log. | 404 RECORDING_NOT_FOUND, 410 CONTENT_EXPIRED (đến hạn 14 ngày hoặc đã dọn) |
| DELETE /learner/skill-attempts/:id | Không có | 204. Chỉ hủy lượt chưa `COMPLETED`. Lượt có audio chuyển `ABANDONED`, dọn tệp sau giao dịch và giữ đường dẫn đến khi xóa thành công. Lượt không có audio được xóa trực tiếp. Idempotent (lượt không tồn tại hoặc của người khác cũng 204, không làm gì). | 409 ATTEMPT_ALREADY_COMPLETED (lượt đã hoàn thành), 409 ATTEMPT_ALREADY_SUBMITTED (đã có yêu cầu chấm) |
| GET /learner/skill-attempts/:id/grading-request | Không có | `{ request }` của chủ bài, `null` khi chưa từng gửi. | 404 ATTEMPT_NOT_FOUND |
| POST /learner/skill-attempts/:id/grading-request | `{ retryOf?: uuid }`. Gửi lần đầu dùng `{}`. Gửi lại sau khi hủy dùng mã yêu cầu đã hủy đang hiện trên bài. | 201 khi tiếp nhận, 200 với yêu cầu đã có khi gọi lại. Tạo `WAITING_ASSIGNMENT`, trừ một lượt, giữ nội dung và đặt hạn 72 giờ trong cùng giao dịch. | 404 ATTEMPT_NOT_FOUND, 409 ATTEMPT_NOT_COMPLETED, RECORDINGS_PENDING, GRADING_CONTENT_MISSING, GRADING_ALREADY_GRADED, NO_GRADING_CREDIT, GRADING_REQUEST_CHANGED, 410 CONTENT_EXPIRED |

Bản ghi nằm ở bucket `STORAGE_BUCKET_RECORDINGS` (mặc định `speaking-recordings`), khóa `speaking/{userId}/{skillAttemptId}/{questionId}.{ext}`. Tạo bucket thủ công trên Supabase Storage với **Public bucket tắt** (riêng tư), không cần policy cho người dùng cuối vì backend ký URL bằng service role. Đặt giới hạn dung lượng file của bucket tối thiểu 25 MB. Account deletion xóa file `speaking/...` ở bucket này (Supabase), đường dẫn khác ở R2. Hàm dọn dẹp `cleanupAttemptContent` (`modules/attempts/attempts.service.ts`) đổi trạng thái DB trước (có điều kiện: lượt `COMPLETED` quá `content_expires_at` không có yêu cầu chấm `WAITING_ASSIGNMENT`/`ASSIGNED`, hoặc lượt `IN_PROGRESS` bị bỏ quá 48 giờ), rồi mới xóa file; xóa file lỗi thì `audio_path` của hàng `DELETED` còn nguyên và được thử lại ở lần chạy sau. Sau `npm run build`, gọi `npm run attempts:cleanup` (xem trước) hoặc `npm run attempts:cleanup -- --apply`. Đặt `ATTEMPT_CLEANUP_WORKER_ENABLED=true` để backend dọn khi khởi động và mỗi giờ. Mặc định worker tắt để có thể chủ động bật theo môi trường hoặc dùng cron bên ngoài. Khi đến hạn, API đọc/tải trả 410 dù job chưa chạy (BR-CONTENT-002). Với `HELD`, tạm ngưng xét hạn khi đọc/tải và dọn. Bên gửi chấm cần chuyển trạng thái trong cùng giao dịch, dùng hạn gốc khi hủy và hạn mới khi công bố. Job cũng đặt `text_content = NULL` và `recording_status = 'DELETED'` cho văn bản Writing hết hạn (cùng điều kiện, không xóa bài đang chờ chấm). Các endpoint bản ghi âm (`recordings`) chỉ dành cho lượt Speaking, `writing/:taskKey` chỉ cho lượt Writing; sai kỹ năng trả 404 `ATTEMPT_NOT_FOUND`. Writing dùng các cột sẵn có. Lượt W/S giữ `attempt_type=FULL_SKILL` để tính tiến độ và lưu phần đã chọn trong `attempts.selected_scope.wsSections`. Đọc/tải dùng `Cache-Control: no-store`.

## Lượt hỗ trợ và phân công chấm W/S

`GET /learner/grading/credits` trả `{ free, bonus }`, mỗi loại có `count` và `expiresAt`. Mốc của bonus là hạn sớm nhất trong các lượt còn dùng được. Mốc miễn phí là 00:00 thứ Hai kế tiếp theo giờ Việt Nam. Lượt miễn phí dùng chung hai kỹ năng và được ghi vào DB trong giao dịch gửi chấm đầu tiên của tuần. Dùng lượt có hạn sớm nhất, ưu tiên lượt miễn phí nếu bằng hạn.

Yêu cầu trả `id, attemptId, status, requestedAt, assignmentDeadline, cancelReason`. `GET` xem trạng thái và `GET` lịch sử W/S đều có mã yêu cầu để người học gửi lại rõ ràng sau khi bị hủy. Hai yêu cầu gửi đồng thời chỉ trừ một lượt cho một bài. Việc gửi lại yêu cầu đã hủy là thao tác chủ động của người học.

| Method và đường dẫn | Hành vi |
|---|---|
| GET /teacher/grading/overview | Tổng số bài đang giao, số bản nháp, số bài công bố tuần này, tối đa ba bài chờ, trạng thái nhận bài và tiêu chí Writing/Speaking. |
| GET /teacher/grading/requests?page=1 | Bài đang giao của chính Giáo viên. Có thể lọc theo `skill`, tên Người học `q` và sắp xếp `sort=oldest` hoặc `newest`. Trả `items`, `total`, `nextPage` và `loads`. Mỗi dòng có tên Người học và trạng thái bản nháp. |
| GET /teacher/grading/history?days=30 | Kết quả do chính Giáo viên công bố và số liệu tuần/tháng theo giờ Việt Nam. Có thể lọc theo `skill`, tên Người học `q` và dùng `from`/`to` dạng `YYYY-MM-DD` thay cho `days`. Khoảng tùy chọn tính cả hai ngày theo giờ Việt Nam. Trả `items` và `totals`. |
| GET /teacher/grading/requests/:id | Phiếu theo mã yêu cầu. Giáo viên được giao đọc bài, rubric và bản nháp. Phiếu đã công bố chỉ đọc. Sau hạn, API vẫn trả phiếu và lược bỏ nội dung gốc. |
| GET /teacher/grading/requests/:id/recordings/:questionId/url | URL nghe Speaking theo quyền trên phiếu và phạm vi đã làm. Trả 410 khi hết hạn nội dung. |
| PUT /teacher/grading/requests/:id/draft | `{ scores, generalComment }`. Mỗi điểm chứa `criterionId`, `sectionId`, `score` và có thể có `comment`. Chấp nhận phiếu chưa đủ điểm. Nháp chỉ người được giao đọc được. |
| POST /teacher/grading/requests/:id/publish | Cùng nội dung với lưu nháp và yêu cầu đủ điểm đúng rubric. Lần đầu tính điểm, công bố phiếu và chuyển yêu cầu sang `COMPLETED` trong một giao dịch. Hạn lưu mới bằng lúc công bố cộng 14 ngày. Gửi lại trả phiếu đã công bố. Trả 409 nếu Quản lý đã hủy. |
| GET /learner/grading/results/:id | Kết quả của chính Người học theo `skill_attempt_id`. Trả trạng thái, rubric và phiếu đã công bố, kèm nội dung còn hạn. Sau khi dọn bài vẫn trả điểm, nhận xét và các mốc yêu cầu. |
| GET /admin/grading/requests?status=WAITING_ASSIGNMENT&page=1 | Danh sách chờ phân công, đang giao (`ASSIGNED`) hoặc đã hủy (`CANCELLED`). Kèm phạm vi Task/Part nếu biết, thời điểm giao/hủy, lý do hủy và hạn bonus khi có. |
| GET /admin/grading/teachers?page=1 | Quyền, trạng thái tiếp nhận, số bài đang giao và giới hạn theo từng kỹ năng. |
| GET /admin/grading/teachers/:id?page=1 | Quyền/tải của một Giáo viên và danh sách bài đang giao. |
| PUT /admin/grading/teachers/:id/permissions/:skill | `{ canGrade, isAccepting, maxPending }` với kỹ năng `WRITING` hoặc `SPEAKING`, giới hạn nguyên 0–50. Dừng nhận và hạ giới hạn giữ bài đã giao. Thu hồi quyền khi còn bài chuyển `PENDING_REVOKE`. |
| POST /admin/grading/teachers/:id/requests/:requestId/cancel | `{ reason }`, bắt buộc 1–500 ký tự. Yêu cầu phải được giao đúng Giáo viên. Hủy ghi audit, khôi phục hạn lưu gốc, hoàn một bonus. Gửi lại thao tác hủy đã thành công trả 200 cùng kết quả. |

Worker phân công chạy lúc khởi động và mỗi 30 giây, bật mặc định qua `GRADING_WORKER_ENABLED`. Chọn yêu cầu hợp lệ cũ nhất có Giáo viên phù hợp. Trong một kỹ năng, ưu tiên tải thấp rồi đến lần giao cũ nhất, trong đó người chưa nhận bài đứng trước. Khi đến 72 giờ, chỉ yêu cầu còn chờ mới được tự hủy. Bonus hết hiệu lực lúc 00:00 thứ Hai sau Chủ nhật tuần kế tiếp theo giờ Việt Nam. Xóa Người học dùng quy tắc riêng trong xóa tài khoản và không hoàn bonus. Worker thông báo dựa vào trạng thái đã ghi để gửi sự kiện tiếp nhận, phân công, hủy/hoàn bonus và công bố. Khóa duy nhất theo người nhận và sự kiện chống thông báo trùng.

## Quản lý người dùng

Các API quản lý người dùng yêu cầu Bearer và hồ sơ `ADMIN` đang hoạt động. Phản hồi dùng `Cache-Control: private, no-store`.

| Method và đường dẫn | Đầu vào | Thành công | Lỗi cần xử lý |
|---|---|---|---|
| GET /admin/users | `q` tìm tên/email, tối đa 150 ký tự. `role` là LEARNER/TEACHER/ADMIN. `status` là ACTIVE/LOCKED/DELETED. `page` mặc định 1, `pageSize` mặc định 20, tối đa 50. Bỏ bộ lọc để lấy mọi vai trò/trạng thái. | `{ items, total, page, pageSize, counts: { all, byRole, byStatus } }`. `total` theo bộ lọc; `counts` toàn bộ danh sách. Sắp xếp ngày tạo và ID mới nhất trước. Trang vượt giới hạn trả trang cuối. | 400 INVALID_USER_FILTER, 401, 403 |
| GET /admin/users/:id | UUID của `public.users.id` | Hồ sơ cùng `auth` và `avatar` | 400 INVALID_USER_ID, 401, 403, 404 USER_NOT_FOUND |
| GET /admin/users/activity | `role` tùy chọn, `page` mặc định 1 | `{ items, nextPage }`, 20 sự kiện Email/Google mỗi trang, lọc theo vai trò hiện tại của tài khoản. | 400, 401, 403 |
| GET /admin/users/:id/history | `kind=login\|admin`, `page` mặc định 1 | `{ items, nextPage }`, 5 sự kiện mỗi trang. Nhật ký quản trị trả hành động, người thao tác, giá trị trước/sau, lý do và thời điểm. | 400, 401, 403, 404 |
| PATCH /admin/users/:id/role hoặc /status | `{ action, code? }` với `Origin` hợp lệ. Tùy hành động, `action` có `kind`, `previousRole`, `previousStatus`, `role` hoặc `status` mới và `reason` (1–500 ký tự). Thay đổi liên quan đến Quản lý cần mã TOTP 6 số của người thao tác. | `{ id, role, status, changed }`. Gửi lại cùng thay đổi đã thành công trả `changed:false`. | 400, 401, 403, 404, 409, 429, 503 |
| POST /admin/users/staff | `{ account, code? }` với `Origin` hợp lệ. Account có `fullName`, `email`, `role` (TEACHER/ADMIN). Giáo viên có thêm `writing`, `speaking` và `maxPending` (1–50). Tạo Quản lý cần mã TOTP 6 số. | 201 `{ id, role, status: "ACTIVE", email, temporaryPassword }`. Mật khẩu tạm chỉ có trong phản hồi tạo. | 400, 403, 409 STAFF_EMAIL_EXISTS, 429, 503 |
| DELETE /admin/users/:id | `{ action, code? }` với `kind=delete`, vai trò/trạng thái trước đó và lý do. Xóa Quản lý cần mã TOTP. | 200 khi hoàn tất hoặc 202 khi đã ẩn danh và còn dọn Auth/tệp. `cleanup` là COMPLETE hoặc PENDING. | 400, 403, 404, 409, 429, 503 |
| POST /admin/users/:id/deletion-retry | Tài khoản đã xóa. | 200 `{ cleanup }`. | 400, 403, 409 |

Mỗi hồ sơ có `id`, `name` (ưu tiên tên hiển thị), `email`, `role`, `status`, `createdAt` và `lastLoginAt` (mốc gần nhất mà ứng dụng đã ghi, có thể null). Chi tiết Auth có `state`. Khi `available`, Auth trả email hiện tại, `emailVerified`, `source` (EMAIL/GOOGLE/STAFF/INVITE hoặc null) và `lastSignInAt` (nullable). `missing` nghĩa là chưa có danh tính Auth tương ứng, `unavailable` nghĩa là tạm thời chưa đọc được Auth. Server dùng `SUPABASE_SERVICE_ROLE_KEY` để đọc và tạo tài khoản Auth. Avatar ứng dụng có `{ url, unavailable }`, URL ký có hạn 5 phút.

Lịch sử đăng nhập bắt đầu từ khi triển khai, dùng mã băm session để ghi một lần. Tạo tài khoản, đổi vai trò, khóa/mở và xóa ghi `audit_logs`. Quy tắc tự thao tác và bảo vệ Quản lý cuối cùng được kiểm tra trên server. Website chuyển mã TOTP của mỗi thao tác cần xác thực đến Supabase Auth. Các lỗi 403 gồm `AUTHENTICATOR_REQUIRED`, `AUTHENTICATOR_NOT_CONFIGURED` và `AUTHENTICATOR_FAILED`. 429 báo giới hạn thử mã.

Trạng thái `INVITED` dùng cho hồ sơ cũ. Liên kết mời cũ đã hết hiệu lực. Chi tiết trả `cleanupPending`. Thao tác ghi của Quản lý yêu cầu Bearer và `Origin` hợp lệ.

## Thống kê tổng quan Quản lý

`GET /admin/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD` yêu cầu Bearer và vai trò ADMIN. Cả hai ngày đều được tính theo `Asia/Ho_Chi_Minh`. Ngày sai hoặc thứ tự đảo trả 400 INVALID_STATISTICS_RANGE. API chỉ đọc và không cache phản hồi riêng tư.

- `accountsNew` đếm hồ sơ được tạo, `usersSignedIn` đếm tài khoản khác nhau có nhật ký đăng nhập, `accountLocks` đếm sự kiện khóa trong khoảng. `loginHistoryFrom` là ngày sớm nhất đang có bản ghi thực tế hoặc null.
- `accountsTotal`, `accountsActive`, `accountsLocked` là số hồ sơ toàn hệ thống theo trạng thái hiện tại. Tổng bao gồm hồ sơ chờ kích hoạt và hồ sơ đã xóa được giữ để đối soát.
- `flashcardSessions` và `flashcardLearners` đếm phiên Flashcard đủ điều kiện và người dùng khác nhau trong khoảng. `dailyFlashcards` trả ngày và số phiên của tối đa 7 ngày cuối, gồm cả ngày có 0 phiên.
- `supportReports` đếm phiếu hỗ trợ được tạo trong khoảng ngày Việt Nam, gồm tất cả trạng thái. Phản hồi cũng trả `from`, `to` và thời điểm lấy số liệu `measuredAt`.

## Thông báo và phiếu hỗ trợ

Đường dẫn bên dưới dùng tiền tố `/api`. API đọc hồ sơ đang hoạt động từ DB và trả `Cache-Control: private, no-store`. Trang có tối đa 20 mục, sắp xếp mới nhất trước theo thời điểm và ID. Dùng `nextCursor` làm `after` để đọc trang tiếp theo. `nextCursor: null` báo hết danh sách.

| Phương thức và đường dẫn | Vai trò và hành vi |
|---|---|
| GET /notifications | Hộp thư của tài khoản trong phiên, nhận `unread=1` và `after` tùy chọn. Trả `{ items, nextCursor }`. Mỗi mục có `id, type, title, content, referenceType, referenceId, createdAt, readAt`. |
| GET /notifications/unread-count | Trả `{ unread }` của toàn hộp thư. |
| PATCH /notifications/:id/read | Chỉ người nhận. Trả `{ readAt }`, giữ nguyên mốc ở lần gửi lại. |
| POST /notifications/read-all | Đánh dấu tất cả mục chưa đọc của người nhận. Trả 204. |
| GET /support/reports | Người học/Giáo viên đọc phiếu của mình. Nhận `status` và `after` tùy chọn. |
| GET /support/reports/:id | Người học/Giáo viên đọc một phiếu của mình, dùng khi mở từ thông báo. |
| POST /support/reports | Người học/Giáo viên gửi `{ requestId, text }`, nội dung 1–3.000 ký tự. Trả 201 khi tạo, 200 nếu gửi lại cùng UUID và nội dung, 409 nếu UUID đã dùng cho nội dung khác. |
| GET /admin/support/reports | Quản lý đọc hàng đợi, nhận cùng bộ lọc. Trả thêm `counts` cho toàn bộ hàng đợi và tên/email chủ phiếu. |
| PATCH /admin/support/reports/:id | Quản lý cập nhật `{ status, reply, revision }`. Phản hồi trống được lưu thành null. Trả 409 nếu có thay đổi đồng thời và kết quả mong muốn chưa được lưu. |

Trạng thái phiếu gồm `PENDING`, `IN_PROGRESS` và `RESOLVED`. Phiếu trả `id, text, status, reply, revision, createdAt`. Cập nhật ghi lịch sử, audit và thông báo cùng giao dịch. Một lượt cập nhật có phản hồi mới hoặc đổi trạng thái gửi tối đa một thông báo cho chủ phiếu đang hoạt động. Hộp thư dùng tham chiếu `SUPPORT_REPORT` để mở chi tiết qua API vẫn kiểm tra chủ phiếu.

### Thông báo chung và mẫu nghiệp vụ

| Phương thức và đường dẫn | Hành vi |
|---|---|
| GET /admin/notifications/announcements | Quản lý đọc lịch sử 20 mục/trang, dùng `after`. Bao gồm trạng thái và số người nhận của đợt đã gửi. |
| POST /admin/notifications/announcements | Tạo nháp từ `{ requestId, title, content, audience }`. Cùng yêu cầu gửi lại dùng chung bản nháp. |
| PATCH /admin/notifications/announcements/:id | Sửa nháp từ `{ title, content, audience, revision }`. Có thể gửi lại đúng nội dung và revision của lần sửa vừa thành công để lấy lại phản hồi. Thay đổi cạnh tranh hoặc nháp đã lên lịch/gửi trả 409. |
| POST /admin/notifications/announcements/:id/send | `{ mode, revision, scheduledAt? }`. Chế độ `now` hoặc `scheduled`. Hẹn giờ nhận chuỗi ISO có múi giờ. Trả 200 khi đã gửi hoặc 202 khi đang chờ tác vụ. |
| GET /admin/notifications/settings | Danh sách mẫu, biến cho phép, trạng thái bắt buộc và giờ nhắc. |
| PATCH /admin/notifications/settings/:event | Sửa `{ title, content, enabled, leadHours, revision }`. Sự kiện bắt buộc luôn bật. Chỉ nhắc hết hạn được đặt `leadHours` từ 1 đến 168. |
| GET /notifications/:id/target | Trả kỹ năng, trạng thái, hạn lưu nếu còn và `destination`. Giáo viên mở theo mã yêu cầu, Người học mở theo `skill_attempt_id`. Kiểm tra quyền sở hữu thông báo và bài. Phiếu đã công bố mở được sau khi nội dung hết hạn. Nhắc hạn của bài chưa có kết quả trả 410 khi nội dung đã hết hạn. |

Nhóm nhận gồm `ALL`, `LEARNER`, `TEACHER`. Hệ thống chọn tài khoản hoạt động tại lúc gửi. Trạng thái chuyển `DRAFT → SCHEDULED → SENT`. Tác vụ duy nhất giữ khóa đợt gửi, tạo bản ghi hộp thư và cập nhật lịch sử trong cùng giao dịch. Số người nhận có thể là 0. Mốc hẹn lưu theo timestamp có múi giờ và hiển thị theo giờ Việt Nam.

Backend có tác vụ kiểm tra mỗi 30 giây khi đang chạy. Hạ tầng chạy lịch ngoài có thể gọi `npm run notifications:dispatch` sau khi build. Trên môi trường dùng tác vụ ngoài, đặt `NOTIFICATION_WORKER_ENABLED=false` nếu muốn tắt vòng kiểm tra trong tiến trình web. Tránh chạy lệnh tác vụ với kết nối sai môi trường.

## Job dọn media bài mẫu

`npm run samples:cleanup-media` xem trước. `npm run samples:cleanup-media -- --apply` dọn tối đa 100 mục mỗi lần. Media từ 7 ngày trở lên chỉ được dọn khi không còn tham chiếu trong bản nháp hoặc bản công bố. Mục đã chuyển `DELETING` được thử lại nếu kho lưu trữ lỗi. Cần SQL 11–12 và bucket riêng tư `STORAGE_BUCKET_SAMPLE_ASSETS`.

`SAMPLE_MEDIA_CLEANUP_WORKER_ENABLED=true` chạy job lúc backend khởi động và mỗi 24 giờ. Mặc định tắt để từng môi trường chọn worker hoặc chạy lệnh theo cron đã cấu hình. Chạy xem trước trên đúng DB thử trước khi bật chế độ dọn.

## Ảnh từ vựng

| Phương thức và đường dẫn | Hành vi |
|---|---|
| POST /api/admin/vocabulary/media/upload | Quản lý tải thân yêu cầu dạng JPG, PNG hoặc WebP, tối đa 1 MiB. Backend kiểm tra nội dung tệp rồi ghi R2. Trả 201 với `{ image, imagePreview }`. |
| POST /api/admin/vocabulary/media/image | Chọn `{ id }` từ lần tra ảnh. Wikipedia và Unsplash trả URL nguồn. Pixabay được chọn sẽ lưu vào R2, trả tham chiếu ổn định, URL xem trước và thông tin ghi công. |
| GET /api/admin/vocabulary/media/preview | Quản lý gửi `image` là mã tham chiếu để lấy URL xem trước mới. |
| GET /api/vocabulary/sets/images/:id | Trả 302 đến URL ký 60 giây nếu có bộ đang công bố dùng ảnh. Trả 404 khi không còn bộ đang công bố nào dùng ảnh. |
| POST /api/admin/vocabulary/media/cleanup | Quản lý dọn tối đa 25 ảnh từ 24 giờ trở lên không còn tham chiếu trong nháp hoặc bản công bố, kể cả bản đã ẩn. Trả `{ removed, pending }`. Tệp lỗi có thể dọn lại. |

Bản nháp lưu `vocab-image:<uuid>` cho ảnh từ và ảnh bìa trên R2. Danh sách quản lý và API đọc nháp trả thêm URL xem trước có hạn 5 phút. URL ký chỉ dùng để hiển thị. Ảnh bên ngoài qua HTTPS và bìa màu vẫn đọc được. Giữ ảnh công bố cũ cho tới khi công bố lại thay đổi từ nháp.

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
