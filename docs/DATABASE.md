# Mô hình dữ liệu IELTSpace

Tra 39 bảng trong [từ điển CSDL](csdl/CSDL.md). Database đã chạy 01 cũ dùng [hướng dẫn nâng cấp](csdl/README.md).

PostgreSQL chứa hồ sơ và dữ liệu nghiệp vụ. Supabase Auth quản lý thông tin đăng nhập. Trigger tạo hồ sơ public.users có khóa id riêng. Backend tra users.auth_user_id duy nhất khi xác thực, dùng users.id trong các bảng nghiệp vụ. [Schema Prisma hiện tại](../backend/prisma/schema.prisma) chỉ ánh xạ một phần bảng users để đọc hồ sơ. Các bảng và khóa bên dưới là thiết kế đích. 

## Bảng và quan hệ

| Miền | Quan hệ chính và ý nghĩa |
|---|---|
| Người dùng | users → teacher_permissions theo giáo viên và kỹ năng (max_pending, is_accepting, status, last_assigned_at). study_goals giữ lịch sử mục tiêu qua effective_from. learner_checkins có khóa (user_id, checkin_date), sinh ngày Việt Nam từ checked_in_at và được truy cập qua backend. Theme lưu phía trình duyệt. |
| Đề | exam_set_categories → exam_sets → exams → exam_skills → exam_sections → question_groups → questions. exam_set_categories phân loại động bộ đề. exam_sets liên kết category_id, có cover_url, name (UNIQUE), status, published_at, updated_at (tự cập nhật qua trigger). question_options lưu phương án riêng từng câu, question_answers giữ accepted_answers, matching_rule và evidence. Thứ tự Test dựa trên order_no. |
| Cấu trúc kỹ năng | exam_skills là đơn vị đăng và phiên bản (D08): exam_id, skill, form, version_number, status, thời lượng. form bắt buộc với Reading/Writing, rỗng với Listening/Speaking. PASSAGE lưu danh sách đoạn có nhãn, SECTION có audio_path và transcript có mốc thời gian, TASK/PART có config riêng. |
| Nhóm câu | question_from/to xác định dải số hiển thị của nhóm. questions.number_from/to và answer_count biểu diễn một câu chiếm nhiều số. Cấu hình nhóm chứa phương án dùng chung và giới hạn từ. evidence có nhãn đoạn hoặc transcript và cụm từ khóa. |
| Chấm điểm | band_scales chứa quy đổi cho L/R. grading_rules và rubric_criteria giữ phiên bản, phạm vi, trọng số, quy tắc tổng hợp/làm tròn cho W/S. Chọn quy tắc theo kỹ năng khi ghi exam_skills. |
| Lượt làm | attempts gắn người học với phiên bản và phạm vi. skill_attempts chứa điểm, deadline_at, initial_expires_at và content_expires_at. attempt_answers lưu đáp án từng câu. attempt_section_states giữ tiến độ phần và mốc khóa nghe/ghi. submission_contents chứa bài viết hoặc đường dẫn audio và metadata. |
| Hỗ trợ | support_credits → grading_requests qua used_credit_id. Mỗi yêu cầu gắn một skill_attempt, có hạn phân công và giáo viên hiện tại. grading_reviews → grading_scores lưu phiếu và điểm tiêu chí. credit_refunds liên kết yêu cầu hủy với bonus sinh ra. |
| Báo cáo & hỗ trợ | support_reports lưu chủ phiếu, khóa gửi lại, nội dung, trạng thái, phản hồi gần nhất và revision. support_report_updates lưu từng lần đổi cùng người xử lý. Truy cập qua API backend, bật RLS và thu hồi quyền truy cập trực tiếp của khách/người dùng. |
| Thông báo chung và mẫu chấm bài | announcements lưu nháp, nhóm nhận, lịch, thời điểm gửi và số người nhận. notification_settings lưu mẫu chỉnh sửa, revision, trạng thái và khoảng nhắc hết hạn. Bản ghi hộp thư tiếp tục chống trùng theo recipient_id và event_key. |
| Ảnh từ vựng | vocabulary_image_assets lưu bucket, khóa tệp R2, MIME, kích thước, nguồn tải từ máy/Pixabay và trạng thái lưu. Nháp và bản công bố lưu mã tham chiếu ổn định. |
| Từ vựng | vocabulary_sets ↔ vocabularies qua vocabulary_set_items. favorite_vocabularies và vocabulary_notes gắn người–từ. flashcard_sessions → flashcard_session_items ghi thẻ đã ôn và mức tự đánh giá. |
| Học tập và nội dung | sample_answers lưu bài mẫu công khai/nháp. learning_activities tham chiếu một attempt hoặc phiên flashcard đủ điều kiện. notifications lưu recipient_id, event_key, read_at. audit_logs giữ chủ thể, hành động và đối tượng. |
| Quản lý tài khoản | user_login_events lưu ID hồ sơ, phương thức, thời điểm và mã băm phiên duy nhất. Supabase Auth quản lý TOTP. Trigger Auth tạo hồ sơ nhân sự, quyền chấm và audit trong cùng giao dịch. users.must_change_password nhắc đổi mật khẩu tạm và được xóa khi Auth cập nhật mật khẩu. audit_logs lưu người thao tác, tài khoản đích, lý do và giá trị trước/sau. |
| Nhập | import_batches giữ request_key, exam_id, skill, form (R/W), loại nhập và số bản ghi. import_assets ghép tên tệp với Storage. import_errors giữ sheet_name, row_number, field_name và message. |

## Trạng thái và khóa cần thực thi ở DB

- Bộ đề có DRAFT/PUBLISHED/HIDDEN. Kỹ năng có DRAFT/PUBLISHED/HIDDEN/ARCHIVED. Theo (exam_id, skill, form): unique version_number, tối đa một DRAFT và một bản PUBLISHED/HIDDEN. Đăng lại một kỹ năng: chuyển bản đang hiển thị sang ARCHIVED rồi đăng bản nháp, trong một transaction. Người học thấy bộ đề khi bộ đề PUBLISHED; từng ô kỹ năng hiện Làm bài (PUBLISHED) hoặc — (DRAFT/HIDDEN/chưa có, ô DRAFT ở phía người học hiển thị — thay vì Đang cập nhật theo Quyết định O4). Lượt làm cũ giữ exam_skill_id của bản đã làm.
- Yêu cầu đi từ WAITING_ASSIGNMENT sang ASSIGNED rồi COMPLETED. Hủy hợp lệ chuyển sang CANCELLED, lưu lý do ASSIGNMENT_TIMEOUT, TEACHER_UNAVAILABLE hoặc LEARNER_DELETED. Partial unique trên skill_attempt_id khi trạng thái là WAITING_ASSIGNMENT hoặc ASSIGNED. UNIQUE(used_credit_id), UNIQUE(grading_reviews.grading_request_id).
- Partial unique trên (user_id, week_start) cho FREE_WEEKLY. UNIQUE(credit_refunds.grading_request_id) và ràng buộc bonus được hoàn thuộc duy nhất một giao dịch. Kiểm tra quyền và số dư trong cùng giao dịch với việc tạo yêu cầu.
- Tiếp nhận, phân công, hủy/hoàn bonus và đổi quyền nhận bài dùng khóa PostgreSQL chung với thay đổi tài khoản. Tiếp nhận khóa thêm `skill_attempts` để việc kiểm nội dung và giữ bài không chạy đua với xóa hết hạn hay cập nhật bản ghi. Giới hạn chấm tính số yêu cầu `ASSIGNED` của đúng Giáo viên và kỹ năng.
- UNIQUE(recipient_id, event_key) cho thông báo. Khóa duy nhất theo người–từ cho từng bảng yêu thích/ghi chú, theo phiên–từ cho chi tiết flashcard, theo nguồn hoạt động cho learning_activities và theo request_key cho lô nhập.
- CHECK dùng cho điều kiện trên cùng hàng, ví dụ loại kỹ năng và khóa thang điểm/rubric của exam_skills. Loại phần thi khớp kỹ năng cha qua cột sinh section_skill và khóa ngoại ghép. Thang band Reading khớp form qua khóa ngoại ghép (band_scale_id, skill, form); với Listening (form NULL) service kiểm tra.
- Service kiểm tra chủ sở hữu, hạn nội dung, quyền giáo viên, tải, tính hợp lệ của XLSX và thứ tự chuyển trạng thái. Dùng khóa hàng/cập nhật có điều kiện cùng transaction cho phân công–hủy và công bố–hoàn. Unique ở DB giữ vai trò quyết định khi hai yêu cầu đến đồng thời.

## Xóa và triển khai

Ẩn đề hoặc khóa tài khoản giữ nguyên lịch sử, FK và phiên bản đã làm. Xóa tệp hết hạn phải giữ điểm, nhận xét, lịch sử tối thiểu và mốc xóa. Chặn tải ngay ở service trong thời gian chờ xóa vật lý. [BR-CONTENT và BR-AUTH](BUSINESS_RULES.md).

## Tối ưu hóa chỉ mục và kết nối (Index & Connection Pooling)

### 1. Chỉ mục tăng tốc bộ đề (Migration 07)
Tệp `docs/csdl/07_index_bo_de.sql` bổ sung 8 chỉ mục trên các khóa ngoại và điều kiện lọc thường dùng của hệ thống bộ đề:
- `idx_exam_skills_exam_id`: Khóa ngoại `exam_skills(exam_id)`.
- `idx_exam_sections_exam_skill_id`: Khóa ngoại `exam_sections(exam_skill_id)`.
- `idx_question_groups_section_id`: Khóa ngoại `question_groups(section_id)`.
- `idx_questions_group_id`: Khóa ngoại `questions(question_group_id)`.
- `idx_question_options_question_id`: Khóa ngoại `question_options(question_id)`.
- `idx_skill_attempts_exam_skill_id`: Đếm lượt làm theo kỹ năng `skill_attempts(exam_skill_id)`.
- `idx_attempts_exam_id_status`: Đếm và lọc lượt làm `attempts(exam_id, status)`.
- `idx_audit_logs_entity`: Tra cứu dòng thời gian phiên bản `audit_logs(entity_type, entity_id)`.

### 2. Cổng kết nối Supavisor (Connection Pooling)
- **DATABASE_URL (Transaction mode - cổng 6543)**: Sử dụng chuỗi kết nối qua Supavisor pooler kèm tham số `?pgbouncer=true&connection_limit=5` cho ứng dụng runtime nhằm tối ưu số lượng kết nối đồng thời và giảm độ trễ bắt tay TCP.
- **DIRECT_URL (Session mode - cổng 5432)**: Dùng kết nối trực tiếp đến PostgreSQL phục vụ Prisma CLI (`prisma migrate`, `prisma db push`) khi cần thay đổi schema DDL.

Bản SQL mới có system_settings theo từ điển bảng trong bản Word. band_scales.exam_type đổi thành form (ACADEMIC/GENERAL, NULL với Listening). Tệp 04 nâng cấp từ 01 cũ chưa theo D08, xem [hướng dẫn SQL](csdl/README.md). Chi tiết ánh xạ dữ liệu và cách chạy thử có trong [hướng dẫn SQL](csdl/README.md).
