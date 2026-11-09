# Từ điển dữ liệu

Sinh tự động từ `schema.prisma` và `constraints-bo-sung.sql` bằng `gen.py` (đừng sửa tay). Kiểu dữ liệu là kiểu PostgreSQL sau migration. Khóa: PK khóa chính, FK khóa ngoại, UK duy nhất.

## Mục lục

- **Module 1. NGƯỜI DÙNG (UC01-UC06, UC14, UC19, UC26, UC31)**: `profiles`, `audit_logs`
- **Module 2. ĐỀ THI (UC20, UC27): Bộ đề → Đề thi → (Kỹ năng) → Phần → Question Group → Question**: `exam_sets`, `exams`, `parts`, `question_groups`, `questions`
- **Module 3. LÀM BÀI VÀ CHẤM BÀI (UC07-UC11, UC13, UC15-UC18, UC33, UC34, mục 3.4)**: `attempts`, `attempt_answers`, `grading_credits`, `grading_requests`, `grading_scores`
- **Module 4. TỪ VỰNG (UC12, UC22, UC28-UC30)**: `vocab_topics`, `vocab_words`, `user_words`, `user_tags`, `word_tags`, `flashcard_sessions`
- **Module 5. BÀI MẪU, THÔNG BÁO, NHẬP DỮ LIỆU, CẤU HÌNH (UC05, UC21, UC23-UC25, UC32, UC35)**: `samples`, `notifications`, `import_batches`, `system_settings`
- **Enum**: `Role`, `AccountStatus`, `Skill`, `ExamForm`, `ContentStatus`, `QuestionType`, `WsTaskType`, `AttemptMode`, `AttemptStatus`, `PermissionStatus`, `CreditType`, `CreditStatus`, `GradingRequestStatus`, `CancelReason`, `FlashcardSource`, `NotificationType`, `ImportType`, `ImportStatus`

## Module 1. NGƯỜI DÙNG (UC01-UC06, UC14, UC19, UC26, UC31)

### 1. `profiles`

Hồ sơ người dùng (1-1 với auth.users); gộp cả mục tiêu học tập của Người học và năng lực chấm của Giáo viên

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không |  | = auth.users.id |
| 2 | `email` | varchar(255) | UK | Không |  | Bản sao email từ Supabase Auth |
| 3 | `full_name` | varchar(100) |  | Không |  | Họ tên / tên hiển thị |
| 4 | `avatar_path` | varchar(500) |  | Có |  | Ảnh đại diện trong Storage |
| 5 | `role` | Role |  | Không | LEARNER | Vai trò do hệ thống quản lý |
| 6 | `status` | AccountStatus |  | Không | ACTIVE |  |
| 7 | `goal_overall_band` | numeric(2,1) |  | Có |  | Người học: band mục tiêu tổng thể (UC31) |
| 8 | `goal_skill_bands` | jsonb |  | Có |  | Người học: mục tiêu theo kỹ năng {"LISTENING":7,...} (tùy chọn) |
| 9 | `goal_daily_sessions` | integer |  | Có |  | Người học: số phiên học mỗi ngày |
| 10 | `writing_permission` | PermissionStatus |  | Có |  | Giáo viên: quyền chấm Writing; NULL = chưa cấp |
| 11 | `speaking_permission` | PermissionStatus |  | Có |  | Giáo viên: quyền chấm Speaking; NULL = chưa cấp |
| 12 | `max_open_requests` | integer |  | Có |  | Giáo viên: giới hạn số bài chưa chấm |
| 13 | `is_accepting` | boolean |  | Không | true | Giáo viên: còn nhận bài mới |
| 14 | `last_assigned_at` | timestamptz |  | Có |  | Giáo viên: lần được phân công gần nhất |
| 15 | `created_at` | timestamptz |  | Không | now() |  |
| 16 | `updated_at` | timestamptz |  | Không | now() khi cập nhật |  |
| 17 | `deleted_at` | timestamptz |  | Có |  | Thời điểm xóa mềm |

Ràng buộc và chỉ mục:

- INDEX (role, status)
- CHECK `profiles_goal_band_chk`: `(goal_overall_band IS NULL OR (goal_overall_band BETWEEN 0 AND 9 AND goal_overall_band * 2 = trunc(goal_overall_band * 2)))`
- CHECK `profiles_goal_sessions_chk`: `(goal_daily_sessions IS NULL OR goal_daily_sessions BETWEEN 1 AND 20)`
- CHECK `profiles_max_open_chk`: `(max_open_requests IS NULL OR max_open_requests >= 0)`
- CHECK `profiles_permission_role_chk`: `(role = 'TEACHER' OR (writing_permission IS NULL AND speaking_permission IS NULL))`
- FOREIGN KEY `profiles_id_auth_fkey`: id → auth.users(id) ON DELETE CASCADE (chỉ trên Supabase)

### 2. `audit_logs`

Nhật ký thao tác quản trị và tác vụ tự động (UC19 BR10, UC23 BR5, mục 3.4.6)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `actor_id` | uuid | FK | Có |  | Người thực hiện; NULL = hệ thống → `profiles` (xóa: SetNull) |
| 3 | `action` | varchar(80) |  | Không |  | Ví dụ USER_LOCK, PERMISSION_REVOKE, REQUEST_CANCEL |
| 4 | `entity_type` | varchar(50) |  | Không |  | Bảng của đối tượng |
| 5 | `entity_id` | uuid |  | Có |  |  |
| 6 | `detail` | jsonb |  | Có |  | Lý do, giá trị trước/sau |
| 7 | `created_at` | timestamptz |  | Không | now() |  |

Ràng buộc và chỉ mục:

- INDEX (entity_type, entity_id)

## Module 2. ĐỀ THI (UC20, UC27): Bộ đề → Đề thi → (Kỹ năng) → Phần → Question Group → Question

### 3. `exam_sets`

Bộ đề (sheet Exams: set_code, set_name)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `code` | varchar(50) | UK | Không |  | set_code |
| 3 | `name` | varchar(200) |  | Không |  | set_name |
| 4 | `description` | text |  | Có |  | Mô tả bộ đề, có thể trống |
| 5 | `cover_url` | varchar(500) |  | Có |  | Ảnh bìa tỉ lệ 7:10 (Supabase Storage) |
| 6 | `status` | ContentStatus |  | Không | DRAFT |  |
| 7 | `created_at` | timestamptz |  | Không | now() |  |

Ràng buộc và chỉ mục:

- CHECK `exam_sets_cover_url_chk`: `(cover_url IS NULL OR length(trim(cover_url)) > 0)`

### 4. `exams`

Đề thi

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `exam_set_id` | uuid | FK | Không |  | → `exam_sets` (xóa: Restrict) |
| 3 | `code` | varchar(50) | UK | Không |  | exam_code |
| 4 | `title` | varchar(200) |  | Không |  | exam_title |
| 5 | `source` | varchar(200) |  | Có |  |  |
| 6 | `note` | text |  | Có |  |  |
| 7 | `status` | ContentStatus |  | Không | DRAFT | Mới nhập mặc định DRAFT (UC23 BR4) |
| 8 | `version` | integer |  | Không | 1 | Tăng khi sửa nội dung/đáp án |
| 9 | `published_at` | timestamptz |  | Có |  |  |
| 10 | `created_at` | timestamptz |  | Không | now() |  |
| 11 | `updated_at` | timestamptz |  | Không | now() khi cập nhật |  |

Ràng buộc và chỉ mục:

- INDEX (status)

### 5. `parts`

Phần thi: Section (L), Passage (R), Task (W), Part (S). Cấp "Kỹ năng" là cột skill

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `exam_id` | uuid | FK | Không |  | → `exams` (xóa: Cascade) |
| 3 | `skill` | Skill |  | Không |  | Kỹ năng của phần |
| 4 | `form` | ExamForm |  | Có |  | Academic/GT, chỉ R/W; L/S để trống. Lọc thư viện (UC20 BR5) |
| 5 | `code` | varchar(60) | UK | Không |  | part_code |
| 6 | `part_no` | integer |  | Không |  | Thứ tự trong kỹ năng (1-4) |
| 7 | `title` | varchar(200) |  | Không |  |  |
| 8 | `content` | text |  | Có |  | Bài đọc (R), đề bài (W), câu hỏi Speaking (S) |
| 9 | `transcript` | text |  | Có |  | Lời thoại Listening |
| 10 | `audio_path` | varchar(500) |  | Có |  |  |
| 11 | `image_path` | varchar(500) |  | Có |  |  |
| 12 | `duration_min` | integer |  | Không |  | Thời lượng; thời gian kỹ năng = tổng các phần |
| 13 | `ws_task_type` | WsTaskType |  | Có |  | Loại Task/Part (W/S) |

Ràng buộc và chỉ mục:

- UNIQUE (exam_id, skill, form, part_no)
- INDEX (skill, form)
- UNIQUE INDEX `parts_exam_skill_part_no_no_form` (exam_id, skill, part_no) WHERE form IS NULL
- CHECK `parts_no_chk`: `(part_no BETWEEN 1 AND 4)`
- CHECK `parts_duration_chk`: `(duration_min > 0)`
- CHECK `parts_task_type_chk`: `((ws_task_type IS NOT NULL) = (skill IN ('WRITING', 'SPEAKING')))`
- CHECK `parts_form_chk`: `((form IS NOT NULL) = (skill IN ('READING', 'WRITING')))`
- CHECK `parts_task1_form_chk`: `( (ws_task_type IS DISTINCT FROM 'W_TASK1_ACADEMIC' OR form = 'ACADEMIC') AND (ws_task_type IS DISTINCT FROM 'W_TASK1_GENERAL' OR form = 'GENERAL') )`

### 6. `question_groups`

Cụm câu hỏi (Question Group) - đơn vị luyện UC08 của L/R

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `part_id` | uuid | FK | Không |  | → `parts` (xóa: Cascade) |
| 3 | `code` | varchar(70) | UK | Không |  | group_code |
| 4 | `group_no` | integer |  | Không |  |  |
| 5 | `question_type` | QuestionType |  | Không |  | Quyết định widget và cách chấm |
| 6 | `instruction` | text |  | Không |  |  |
| 7 | `q_from` | integer |  | Không |  | Số câu bắt đầu |
| 8 | `q_to` | integer |  | Không |  | Số câu kết thúc |
| 9 | `config` | jsonb |  | Có |  | word_limit, option_reuse, word_bank, image_path, danh sách heading... |

Ràng buộc và chỉ mục:

- UNIQUE (part_id, group_no)
- CHECK `qg_range_chk`: `(q_from >= 1 AND q_from <= q_to)`

### 7. `questions`

Câu hỏi kèm đáp án (API lấy đề phải loại các cột đáp án khi select)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `group_id` | uuid | FK | Không |  | → `question_groups` (xóa: Cascade) |
| 3 | `code` | varchar(80) | UK | Không |  | question_code |
| 4 | `question_no` | integer |  | Không |  |  |
| 5 | `question_no_to` | integer |  | Có |  | Câu chọn nhiều đáp án chiếm question_no..question_no_to |
| 6 | `question_text` | text |  | Có |  |  |
| 7 | `options` | jsonb |  | Có |  | [{label:"A", text:"..."}] |
| 8 | `correct_answer` | text |  | Không |  | Đáp án; nhiều đáp án ngăn bằng / (A/C/E) |
| 9 | `accepted_answers` | text[] |  | Không | '{}' | Cách viết được chấp nhận |
| 10 | `explanation` | text |  | Có |  | Lời giải |

Ràng buộc và chỉ mục:

- UNIQUE (group_id, question_no)
- CHECK `questions_range_chk`: `(question_no_to IS NULL OR question_no_to > question_no)`

## Module 3. LÀM BÀI VÀ CHẤM BÀI (UC07-UC11, UC13, UC15-UC18, UC33, UC34, mục 3.4)

### 8. `attempts`

Lượt làm bài (một kỹ năng của một đề). Với W/S, lượt đã hoàn thành chính là "bài" có hạn nội dung 14 ngày

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `user_id` | uuid | FK | Không |  | Người học → `profiles` (xóa: Cascade) |
| 3 | `exam_id` | uuid | FK | Không |  | → `exams` (xóa: Restrict) |
| 4 | `skill` | Skill |  | Không |  |  |
| 5 | `exam_version` | integer |  | Không |  | Phiên bản đề lúc bắt đầu (UC09 BR2) |
| 6 | `mode` | AttemptMode |  | Không |  | FULL_TEST (UC07) hoặc PRACTICE (UC08) |
| 7 | `practice_group_id` | uuid | FK | Có |  | Luyện L/R: cụm câu hỏi → `question_groups` (xóa: Restrict) |
| 8 | `practice_part_id` | uuid | FK | Có |  | Luyện W/S: Task/Part → `parts` (xóa: Restrict) |
| 9 | `status` | AttemptStatus |  | Không | IN_PROGRESS |  |
| 10 | `started_at` | timestamptz |  | Không | now() |  |
| 11 | `deadline_at` | timestamptz |  | Có |  | Hạn nộp do backend tính |
| 12 | `completed_at` | timestamptz |  | Có |  | Hoàn thành; W/S: hạn lưu ban đầu = completed_at + 14 ngày |
| 13 | `progress` | jsonb |  | Có |  | Phần đã phát audio / đã ghi âm (thi đầy đủ chỉ 1 lần), phần đang làm |
| 14 | `correct_count` | integer |  | Có |  | L/R: số câu đúng |
| 15 | `total_questions` | integer |  | Có |  | L/R: tổng số câu |
| 16 | `band_score` | numeric(2,1) |  | Có |  | Chỉ FULL_TEST L/R |
| 17 | `content_expires_at` | timestamptz |  | Có |  | W/S: hạn nội dung hiện hành; NULL khi đang có yêu cầu chấm |
| 18 | `content_deleted_at` | timestamptz |  | Có |  | W/S: lúc nội dung bị xóa (giữ kết quả) |
| 19 | `submit_token` | varchar(64) | UK | Có |  | Chống nộp trùng |

Ràng buộc và chỉ mục:

- INDEX (user_id, completed_at)
- INDEX (exam_id)
- INDEX `attempts_content_expiry` (content_expires_at) WHERE content_deleted_at IS NULL AND content_expires_at IS NOT NULL
- CHECK `attempts_band_chk`: `(band_score IS NULL OR (band_score BETWEEN 0 AND 9 AND band_score * 2 = trunc(band_score * 2)))`
- CHECK `attempts_scope_chk`: `( (mode = 'FULL_TEST' AND practice_group_id IS NULL AND practice_part_id IS NULL) OR (mode = 'PRACTICE' AND skill IN ('LISTENING', 'READING') AND practice_group_id IS NOT NULL AND practice_part_id IS NULL) OR (mode = 'PRACTICE' AND skill IN ('WRITING', 'SPEAKING') AND practice_part_id IS NOT NULL AND practice_group_id IS NULL) )`
- CHECK `attempts_band_scope_chk`: `(band_score IS NULL OR (mode = 'FULL_TEST' AND skill IN ('LISTENING', 'READING')))`
- CHECK `attempts_count_chk`: `(correct_count IS NULL OR (correct_count >= 0 AND correct_count <= total_questions))`
- CHECK `attempts_completed_chk`: `(status <> 'COMPLETED' OR completed_at IS NOT NULL)`
- CHECK `attempts_content_ws_chk`: `(skill IN ('WRITING', 'SPEAKING') OR (content_expires_at IS NULL AND content_deleted_at IS NULL))`

### 9. `attempt_answers`

Câu trả lời: L/R theo từng câu hỏi; W/S theo từng Task/Part (bài viết hoặc ghi âm)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `attempt_id` | uuid | FK | Không |  | → `attempts` (xóa: Cascade) |
| 3 | `question_id` | uuid | FK | Có |  | L/R: câu hỏi → `questions` (xóa: Restrict) |
| 4 | `part_id` | uuid | FK | Có |  | W/S: Task/Part → `parts` (xóa: Restrict) |
| 5 | `response` | jsonb |  | Có |  | L/R: chuỗi hoặc mảng chữ cái |
| 6 | `points_awarded` | integer |  | Có |  | L/R: điểm đạt (MCQ_MULTI có thể đạt một phần) |
| 7 | `answer_snapshot` | text |  | Có |  | L/R: đáp án dùng khi chấm, không đổi khi sửa đề |
| 8 | `text_content` | text |  | Có |  | Writing: bài viết; xóa khi hết hạn |
| 9 | `audio_path` | varchar(500) |  | Có |  | Speaking: bản ghi âm cuối cùng; xóa khi hết hạn |
| 10 | `updated_at` | timestamptz |  | Không | now() khi cập nhật |  |

Ràng buộc và chỉ mục:

- UNIQUE (attempt_id, question_id)
- UNIQUE (attempt_id, part_id)
- CHECK `attempt_answers_target_chk`: `(num_nonnulls(question_id, part_id) = 1)`

### 10. `grading_credits`

Lượt hỗ trợ chấm: miễn phí theo tuần hoặc bonus được hoàn

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `user_id` | uuid | FK | Không |  | → `profiles` (xóa: Cascade) |
| 3 | `type` | CreditType |  | Không |  |  |
| 4 | `week_start` | date |  | Có |  | FREE_WEEKLY: thứ Hai của tuần |
| 5 | `expires_at` | timestamptz |  | Không |  | FREE: 00:00 thứ Hai kế tiếp; BONUS: hết Chủ nhật tuần kế tiếp |
| 6 | `status` | CreditStatus |  | Không | AVAILABLE |  |
| 7 | `source_request_id` | uuid | FK, UK | Có |  | BONUS: yêu cầu bị hủy sinh ra lượt (hoàn đúng 1 lần) → `grading_requests` (xóa: Restrict) |
| 8 | `created_at` | timestamptz |  | Không | now() |  |

Ràng buộc và chỉ mục:

- UNIQUE (user_id, type, week_start)
- INDEX (user_id, status, expires_at)
- CHECK `gcr_type_chk`: `( (type = 'FREE_WEEKLY' AND week_start IS NOT NULL AND source_request_id IS NULL) OR (type = 'BONUS' AND week_start IS NULL AND source_request_id IS NOT NULL) )`

### 11. `grading_requests`

Yêu cầu hỗ trợ chấm, gộp cả kết quả chấm (nháp và công bố)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `attempt_id` | uuid | FK | Không |  | Bài W/S → `attempts` (xóa: Restrict) |
| 3 | `user_id` | uuid | FK | Không |  | Người học gửi → `profiles` (xóa: Cascade) |
| 4 | `skill` | Skill |  | Không |  | WRITING hoặc SPEAKING |
| 5 | `credit_id` | uuid | FK, UK | Không |  | Lượt đã dùng → `grading_credits` (xóa: Restrict) |
| 6 | `status` | GradingRequestStatus |  | Không | PENDING_ASSIGNMENT |  |
| 7 | `requested_at` | timestamptz |  | Không | now() |  |
| 8 | `assignment_deadline_at` | timestamptz |  | Không |  | = requested_at + 72 giờ |
| 9 | `teacher_id` | uuid | FK | Có |  | Giáo viên được phân công → `profiles` (xóa: SetNull) |
| 10 | `assigned_at` | timestamptz |  | Có |  |  |
| 11 | `overall_band` | numeric(2,1) |  | Có |  | Điểm tổng hợp do backend tính |
| 12 | `general_comment` | text |  | Có |  | Nhận xét chung |
| 13 | `draft_saved_at` | timestamptz |  | Có |  | Lần lưu nháp gần nhất (UC16 A4) |
| 14 | `graded_at` | timestamptz |  | Có |  | Thời điểm công bố |
| 15 | `cancelled_at` | timestamptz |  | Có |  |  |
| 16 | `cancel_reason` | CancelReason |  | Có |  |  |
| 17 | `cancel_note` | text |  | Có |  | Lý do Quản lý nhập |
| 18 | `cancelled_by_id` | uuid | FK | Có |  | Quản lý xác nhận hủy; NULL = hệ thống → `profiles` (xóa: SetNull) |

Ràng buộc và chỉ mục:

- INDEX (status, skill, requested_at)
- INDEX (teacher_id, status)
- INDEX (user_id, requested_at)
- UNIQUE INDEX `grading_requests_one_active_per_attempt` (attempt_id) WHERE status IN ('PENDING_ASSIGNMENT', 'ASSIGNED')
- UNIQUE INDEX `grading_requests_one_graded_per_attempt` (attempt_id) WHERE status = 'GRADED'
- CHECK `gr_skill_chk`: `(skill IN ('WRITING', 'SPEAKING'))`
- CHECK `gr_deadline_chk`: `(assignment_deadline_at > requested_at)`
- CHECK `gr_assigned_chk`: `(status NOT IN ('ASSIGNED', 'GRADED') OR (teacher_id IS NOT NULL AND assigned_at IS NOT NULL))`
- CHECK `gr_graded_chk`: `(status <> 'GRADED' OR (graded_at IS NOT NULL AND overall_band IS NOT NULL))`
- CHECK `gr_band_chk`: `(overall_band IS NULL OR (overall_band BETWEEN 0 AND 9 AND overall_band * 2 = trunc(overall_band * 2)))`
- CHECK `gr_cancelled_chk`: `(status <> 'CANCELLED' OR (cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL))`
- CHECK `gr_timeout_chk`: `(cancel_reason IS DISTINCT FROM 'ASSIGNMENT_TIMEOUT' OR assigned_at IS NULL)`
- CHECK `gr_teacher_unable_chk`: `(cancel_reason IS DISTINCT FROM 'TEACHER_UNABLE' OR (cancelled_by_id IS NOT NULL AND cancel_note IS NOT NULL))`

### 12. `grading_scores`

Điểm và nhận xét theo tiêu chí (danh sách tiêu chí cố định trong system_settings)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `request_id` | uuid | PK, FK | Không |  | → `grading_requests` (xóa: Cascade) |
| 2 | `criterion` | varchar(20) | PK | Không |  | Writing: TA_TR, CC, LR, GRA; Speaking: FC, LR, GRA, PRON |
| 3 | `band` | numeric(2,1) |  | Không |  | 0-9, bước 0,5 |
| 4 | `comment` | text |  | Có |  |  |

Ràng buộc và chỉ mục:

- PRIMARY KEY (request_id, criterion)
- CHECK `grading_scores_band_chk`: `(band BETWEEN 0 AND 9 AND band * 2 = trunc(band * 2))`

## Module 4. TỪ VỰNG (UC12, UC22, UC28-UC30)

### 13. `vocab_topics`



| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `name` | varchar(100) | UK | Không |  |  |
| 3 | `status` | ContentStatus |  | Không | PUBLISHED |  |

### 14. `vocab_words`

Mục từ; trùng xác định theo (từ, loại từ, nghĩa) (UC22 BR1)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `topic_id` | uuid | FK | Không |  | → `vocab_topics` (xóa: Restrict) |
| 3 | `word` | varchar(100) |  | Không |  |  |
| 4 | `phonetic` | varchar(100) |  | Có |  | Phiên âm IPA |
| 5 | `part_of_speech` | varchar(30) |  | Không |  |  |
| 6 | `meaning_vi` | text |  | Không |  |  |
| 7 | `example` | text |  | Có |  |  |
| 8 | `difficulty` | smallint |  | Có |  | 1-5 |
| 9 | `status` | ContentStatus |  | Không | PUBLISHED | HIDDEN: không xuất hiện trong danh sách học mới |

Ràng buộc và chỉ mục:

- UNIQUE (word, part_of_speech, meaning_vi)
- INDEX (topic_id, status)
- CHECK `vw_difficulty_chk`: `(difficulty IS NULL OR difficulty BETWEEN 1 AND 5)`

### 15. `user_words`

Dữ liệu cá nhân của Người học với một mục từ: yêu thích (UC29) và ghi chú (UC30)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `user_id` | uuid | PK, FK | Không |  | → `profiles` (xóa: Cascade) |
| 2 | `word_id` | uuid | PK, FK | Không |  | → `vocab_words` (xóa: Restrict) |
| 3 | `is_favorite` | boolean |  | Không | false |  |
| 4 | `note` | text |  | Có |  |  |
| 5 | `updated_at` | timestamptz |  | Không | now() khi cập nhật |  |

Ràng buộc và chỉ mục:

- PRIMARY KEY (user_id, word_id)

### 16. `user_tags`

Nhãn cá nhân (UC30), tên duy nhất trong phạm vi một Người học

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `user_id` | uuid | FK | Không |  | → `profiles` (xóa: Cascade) |
| 3 | `name` | varchar(50) |  | Không |  |  |

Ràng buộc và chỉ mục:

- UNIQUE (user_id, name)

### 17. `word_tags`

Gắn nhãn cho từ (nhiều-nhiều)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `tag_id` | uuid | PK, FK | Không |  | → `user_tags` (xóa: Cascade) |
| 2 | `word_id` | uuid | PK, FK | Không |  | → `vocab_words` (xóa: Restrict) |

Ràng buộc và chỉ mục:

- PRIMARY KEY (tag_id, word_id)

### 18. `flashcard_sessions`

Phiên ôn flashcard (UC12); phiên đủ điều kiện được tính là phiên học

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `user_id` | uuid | FK | Không |  | → `profiles` (xóa: Cascade) |
| 3 | `source_type` | FlashcardSource |  | Không |  |  |
| 4 | `source_id` | uuid |  | Có |  | vocab_topics.id hoặc user_tags.id; NULL với FAVORITES |
| 5 | `total_cards` | integer |  | Không |  |  |
| 6 | `distinct_reviewed` | integer |  | Không | 0 | Số thẻ khác nhau đã ôn |
| 7 | `ratings` | jsonb |  | Có |  | Kết quả tự đánh giá {"KNOW":8,"UNSURE":3,"DONT_KNOW":1} |
| 8 | `is_qualified` | boolean |  | Không | false | Hết tập hoặc >= số thẻ tối thiểu (mặc định 10) |
| 9 | `started_at` | timestamptz |  | Không | now() |  |
| 10 | `ended_at` | timestamptz |  | Có |  |  |

Ràng buộc và chỉ mục:

- INDEX (user_id, started_at)
- CHECK `fs_count_chk`: `(distinct_reviewed BETWEEN 0 AND total_cards)`
- CHECK `fs_source_chk`: `((source_type = 'FAVORITES') = (source_id IS NULL))`

## Module 5. BÀI MẪU, THÔNG BÁO, NHẬP DỮ LIỆU, CẤU HÌNH (UC05, UC21, UC23-UC25, UC32, UC35)

### 19. `samples`

Bài mẫu Writing và Speaking (sheet Bai_mau)

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `code` | varchar(50) | UK | Không |  | sample_code |
| 3 | `sample_type` | WsTaskType |  | Không |  | Kỹ năng suy ra từ loại (W_* / S_*) |
| 4 | `topic` | varchar(100) |  | Không |  |  |
| 5 | `title` | varchar(200) |  | Không |  |  |
| 6 | `prompt` | text |  | Không |  | Đề bài |
| 7 | `content` | text |  | Không |  | Bài mẫu (Writing) hoặc transcript (Speaking) |
| 8 | `band` | numeric(2,1) |  | Có |  |  |
| 9 | `image_path` | varchar(500) |  | Có |  |  |
| 10 | `audio_path` | varchar(500) |  | Có |  | Audio mẫu Speaking (tùy chọn) |
| 11 | `linked_exam_id` | uuid | FK | Có |  | → `exams` (xóa: SetNull) |
| 12 | `linked_part_id` | uuid | FK | Có |  | → `parts` (xóa: SetNull) |
| 13 | `status` | ContentStatus |  | Không | DRAFT |  |
| 14 | `created_at` | timestamptz |  | Không | now() |  |
| 15 | `updated_at` | timestamptz |  | Không | now() khi cập nhật |  |

Ràng buộc và chỉ mục:

- INDEX (status, sample_type)
- CHECK `samples_band_chk`: `(band IS NULL OR (band BETWEEN 0 AND 9 AND band * 2 = trunc(band * 2)))`

### 20. `notifications`

Thông báo trong hệ thống (UC35); không email/đẩy

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `recipient_id` | uuid | FK | Không |  | → `profiles` (xóa: Cascade) |
| 3 | `type` | NotificationType |  | Không |  |  |
| 4 | `title` | varchar(200) |  | Không |  |  |
| 5 | `body` | text |  | Có |  | Không chứa toàn bộ bài viết/ghi âm |
| 6 | `entity_type` | varchar(50) |  | Có |  | Đối tượng liên quan để mở liên kết |
| 7 | `entity_id` | uuid |  | Có |  |  |
| 8 | `event_key` | varchar(120) |  | Không |  | Chống tạo trùng khi tác vụ chạy lại |
| 9 | `read_at` | timestamptz |  | Có |  | NULL = chưa đọc |
| 10 | `created_at` | timestamptz |  | Không | now() |  |

Ràng buộc và chỉ mục:

- UNIQUE (recipient_id, event_key)
- INDEX (recipient_id, read_at)

### 21. `import_batches`

Lô nhập dữ liệu xlsx (UC23, UC24); lỗi kiểm tra lưu dạng JSON theo sheet/dòng/cột

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `id` | uuid | PK | Không | gen_random_uuid() |  |
| 2 | `type` | ImportType |  | Không |  |  |
| 3 | `file_name` | varchar(255) |  | Không |  |  |
| 4 | `file_hash` | varchar(64) |  | Không |  | SHA-256, chống nhập trùng (UC23 E4) |
| 5 | `status` | ImportStatus |  | Không |  |  |
| 6 | `summary` | jsonb |  | Có |  | Số bản ghi theo sheet |
| 7 | `issues` | jsonb |  | Có |  | [{severity, sheet, row, column, message}] |
| 8 | `created_by_id` | uuid | FK | Không |  | Quản lý thực hiện → `profiles` (xóa: Restrict) |
| 9 | `created_at` | timestamptz |  | Không | now() |  |
| 10 | `committed_at` | timestamptz |  | Có |  |  |

Ràng buộc và chỉ mục:

- INDEX (file_hash)

### 22. `system_settings`

Tham số và dữ liệu khởi tạo cố định: 14 ngày, 72 giờ, số thẻ tối thiểu, bảng quy đổi band, tiêu chí W/S, Daily Motivation

| # | Cột | Kiểu | Khóa | Null | Mặc định | Mô tả |
|---|---|---|---|---|---|---|
| 1 | `key` | varchar(80) | PK | Không |  |  |
| 2 | `value` | jsonb |  | Không |  |  |
| 3 | `description` | text |  | Có |  |  |
| 4 | `updated_at` | timestamptz |  | Không | now() khi cập nhật |  |

## Enum

### `Role`

Vai trò người dùng (Khách không có tài khoản)

| Giá trị | Ý nghĩa |
|---|---|
| `LEARNER` | Người học |
| `TEACHER` | Giáo viên |
| `ADMIN` | Quản lý |

### `AccountStatus`

Trạng thái tài khoản

| Giá trị | Ý nghĩa |
|---|---|
| `ACTIVE` | Đang hoạt động |
| `LOCKED` | Bị khóa |
| `DELETED` | Đã xóa mềm |

### `Skill`



| Giá trị | Ý nghĩa |
|---|---|
| `LISTENING` |  |
| `READING` |  |
| `WRITING` |  |
| `SPEAKING` |  |

### `ExamForm`

Hình thức thi của phần Reading/Writing: Academic hoặc General Training

| Giá trị | Ý nghĩa |
|---|---|
| `ACADEMIC` |  |
| `GENERAL` |  |

### `ContentStatus`

Trạng thái cung cấp nội dung (đề thi, bài mẫu, từ vựng)

| Giá trị | Ý nghĩa |
|---|---|
| `DRAFT` | Nháp, chưa công khai |
| `PUBLISHED` | Công khai |
| `HIDDEN` | Ẩn, giữ dữ liệu tham chiếu |

### `QuestionType`

20 mã dạng câu hỏi Listening/Reading (spec/question-types-input-spec.md)

| Giá trị | Ý nghĩa |
|---|---|
| `MCQ_SINGLE` |  |
| `MCQ_MULTI` |  |
| `TFNG` |  |
| `YNNG` |  |
| `MATCH_HEADING` |  |
| `MATCH_INFO` |  |
| `MATCH_FEATURE` |  |
| `MATCH_ENDING` |  |
| `LIST_SELECT` |  |
| `TITLE_CHOICE` |  |
| `SENTENCE_COMP` |  |
| `SUMMARY_COMP` |  |
| `SUMMARY_BOX` |  |
| `NOTE_COMP` |  |
| `TABLE_COMP` |  |
| `FLOW_COMP` |  |
| `DIAGRAM_COMP` |  |
| `SHORT_ANSWER` |  |
| `MAP_LABEL` |  |
| `MATCH_LISTEN` |  |

### `WsTaskType`

Loại Task/Part Writing, Speaking (dùng cho phần thi và bài mẫu)

| Giá trị | Ý nghĩa |
|---|---|
| `W_TASK1_ACADEMIC` |  |
| `W_TASK1_GENERAL` |  |
| `W_TASK2` |  |
| `S_PART1` |  |
| `S_PART2` |  |
| `S_PART3` |  |

### `AttemptMode`



| Giá trị | Ý nghĩa |
|---|---|
| `FULL_TEST` | UC07: làm trọn một kỹ năng của đề |
| `PRACTICE` | UC08: luyện một Question Group (L/R) hoặc một Task/Part (W/S) |

### `AttemptStatus`



| Giá trị | Ý nghĩa |
|---|---|
| `IN_PROGRESS` | Đang làm (lưu tự động, làm tiếp được) |
| `COMPLETED` | Đã nộp/hoàn thành |
| `ABANDONED` | Bỏ dở |

### `PermissionStatus`

Quyền chấm theo kỹ năng của Giáo viên

| Giá trị | Ý nghĩa |
|---|---|
| `ACTIVE` | Có quyền, được phân công |
| `REVOKING` | Ngừng nhận bài mới, chấm nốt bài đã giao |
| `REVOKED` | Đã thu hồi |

### `CreditType`



| Giá trị | Ý nghĩa |
|---|---|
| `FREE_WEEKLY` | Lượt miễn phí của tuần |
| `BONUS` | Lượt bonus được hoàn |

### `CreditStatus`



| Giá trị | Ý nghĩa |
|---|---|
| `AVAILABLE` |  |
| `USED` |  |
| `EXPIRED` |  |

### `GradingRequestStatus`



| Giá trị | Ý nghĩa |
|---|---|
| `PENDING_ASSIGNMENT` | Chờ phân công (tối đa 72 giờ) |
| `ASSIGNED` | Đã phân công, chờ chấm (có thể đã có nháp) |
| `GRADED` | Đã công bố kết quả |
| `CANCELLED` | Đã hủy |

### `CancelReason`



| Giá trị | Ý nghĩa |
|---|---|
| `ASSIGNMENT_TIMEOUT` | Quá 72 giờ chưa phân công (hoàn bonus) |
| `TEACHER_UNABLE` | Giáo viên không thể hoàn thành, Quản lý xác nhận (hoàn bonus) |
| `LEARNER_DELETED` | Tài khoản Người học bị xóa (không hoàn) |

### `FlashcardSource`

Nguồn tập thẻ flashcard

| Giá trị | Ý nghĩa |
|---|---|
| `TOPIC` |  |
| `FAVORITES` |  |
| `TAG` |  |

### `NotificationType`

Sự kiện tạo thông báo (UC35 BR7)

| Giá trị | Ý nghĩa |
|---|---|
| `GRADING_RESULT_PUBLISHED` | Người học: có kết quả chấm |
| `GRADING_REQUEST_CANCELLED` | Người học: yêu cầu bị hủy, được hoàn bonus |
| `NEW_ASSIGNMENT` | Giáo viên: được phân công bài mới |
| `PERMISSION_REVOKED` | Giáo viên: bị thu hồi quyền chấm |
| `TEACHER_UNABLE_CONFIRM` | Quản lý: cần xác nhận Giáo viên không thể hoàn thành |

### `ImportType`



| Giá trị | Ý nghĩa |
|---|---|
| `EXAM` |  |
| `SAMPLE` |  |
| `VOCABULARY` |  |

### `ImportStatus`



| Giá trị | Ý nghĩa |
|---|---|
| `INVALID` | Có lỗi, không lưu gì |
| `VALIDATED` | Hợp lệ, chờ xác nhận |
| `COMMITTED` | Đã lưu toàn bộ lô |
| `FAILED` | Lưu thất bại, đã hoàn tác |
