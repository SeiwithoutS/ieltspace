# Mô hình dữ liệu IELTSpace

Tra 40 bảng trong [từ điển CSDL](csdl/CSDL.md). Database đã chạy 01 cũ dùng [hướng dẫn nâng cấp](csdl/README.md).

PostgreSQL chứa hồ sơ và dữ liệu nghiệp vụ. Supabase Auth quản lý thông tin đăng nhập. Trigger tạo hồ sơ public.users có khóa id riêng. Backend tra users.auth_user_id duy nhất khi xác thực, dùng users.id trong các bảng nghiệp vụ. [Schema Prisma hiện tại](../backend/prisma/schema.prisma) chỉ ánh xạ một phần bảng users để đọc hồ sơ. Các bảng và khóa bên dưới là thiết kế đích. 

## Bảng và quan hệ

| Miền | Quan hệ chính và ý nghĩa |
|---|---|
| Người dùng | users → teacher_permissions theo giáo viên và kỹ năng (max_pending, is_accepting, status, last_assigned_at). study_goals giữ lịch sử mục tiêu qua effective_from. Theme lưu phía trình duyệt. |
| Đề | exam_sets → exams → exam_versions → exam_skills → exam_sections → question_groups → questions. question_options lưu phương án riêng từng câu, question_answers giữ accepted_answers, matching_rule và evidence. Bộ đề có cover_url. Thứ tự Test dựa trên order_no. |
| Cấu trúc kỹ năng | exam_skills có is_hidden và thời lượng. exam_sections.form bắt buộc với Reading/Writing, rỗng với Listening/Speaking. PASSAGE lưu danh sách đoạn có nhãn, SECTION có audio_path và transcript có mốc thời gian, TASK/PART có config riêng. |
| Nhóm câu | question_from/to xác định dải số hiển thị của nhóm. questions.number_from/to và answer_count biểu diễn một câu chiếm nhiều số. Cấu hình nhóm chứa phương án dùng chung và giới hạn từ. evidence có nhãn đoạn hoặc transcript và cụm từ khóa. |
| Chấm điểm | band_scales chứa quy đổi cho L/R. grading_rules và rubric_criteria giữ phiên bản, phạm vi, trọng số, quy tắc tổng hợp/làm tròn cho W/S. Chọn quy tắc theo kỹ năng khi ghi exam_skills. |
| Lượt làm | attempts gắn người học với phiên bản và phạm vi. skill_attempts chứa điểm, deadline_at, initial_expires_at và content_expires_at. attempt_answers lưu đáp án từng câu. attempt_section_states giữ tiến độ phần và mốc khóa nghe/ghi. submission_contents chứa bài viết hoặc đường dẫn audio và metadata. |
| Hỗ trợ | support_credits → grading_requests qua used_credit_id. Mỗi yêu cầu gắn một skill_attempt, có hạn phân công và giáo viên hiện tại. grading_reviews → grading_scores lưu phiếu và điểm tiêu chí. credit_refunds liên kết yêu cầu hủy với bonus sinh ra. |
| Từ vựng | vocabulary_sets ↔ vocabularies qua vocabulary_set_items. favorite_vocabularies và vocabulary_notes gắn người–từ. flashcard_sessions → flashcard_session_items ghi thẻ đã ôn và mức tự đánh giá. |
| Học tập và nội dung | sample_answers lưu bài mẫu công khai/nháp. learning_activities tham chiếu một attempt hoặc phiên flashcard đủ điều kiện. notifications lưu recipient_id, event_key, read_at. audit_logs giữ chủ thể, hành động và đối tượng. |
| Nhập | import_batches giữ request_key, exam_id, skill, loại nhập và số bản ghi. import_assets ghép tên tệp với Storage. import_errors giữ sheet_name, row_number, field_name và message. |

## Trạng thái và khóa cần thực thi ở DB

- Bộ đề có DRAFT/PUBLISHED/HIDDEN. Phiên bản có DRAFT/PUBLISHED. UNIQUE(exam_id, version_number), thêm unique có điều kiện theo exam_id khi DRAFT. UNIQUE(exam_version_id, skill). Thứ tự phần theo kỹ năng/form phải xử lý trường hợp form NULL.
- Yêu cầu đi từ WAITING_ASSIGNMENT sang ASSIGNED rồi COMPLETED. Hủy hợp lệ chuyển sang CANCELLED, lưu lý do ASSIGNMENT_TIMEOUT, TEACHER_UNAVAILABLE hoặc LEARNER_DELETED. Partial unique trên skill_attempt_id khi trạng thái là WAITING_ASSIGNMENT hoặc ASSIGNED. UNIQUE(used_credit_id), UNIQUE(grading_reviews.grading_request_id).
- Partial unique trên (user_id, week_start) cho FREE_WEEKLY. UNIQUE(credit_refunds.grading_request_id) và ràng buộc bonus được hoàn thuộc duy nhất một giao dịch. Kiểm tra quyền và số dư trong cùng giao dịch với việc tạo yêu cầu.
- UNIQUE(recipient_id, event_key) cho thông báo. Khóa duy nhất theo người–từ cho từng bảng yêu thích/ghi chú, theo phiên–từ cho chi tiết flashcard, theo nguồn hoạt động cho learning_activities và theo request_key cho lô nhập.
- CHECK dùng cho điều kiện trên cùng hàng, ví dụ loại kỹ năng và khóa thang điểm/rubric của exam_skills. Với form ở exam_sections và skill ở bảng cha, cần thiết kế ràng buộc liên bảng (chẳng hạn khóa ngoại ghép kèm CHECK hoặc trigger). Một CHECK đơn trên bảng con không kiểm tra được dữ liệu cha.
- Service kiểm tra chủ sở hữu, hạn nội dung, quyền giáo viên, tải, tính hợp lệ của XLSX và thứ tự chuyển trạng thái. Dùng khóa hàng/cập nhật có điều kiện cùng transaction cho phân công–hủy và công bố–hoàn. Unique ở DB giữ vai trò quyết định khi hai yêu cầu đến đồng thời.

## Xóa và triển khai

Ẩn đề hoặc khóa tài khoản giữ nguyên lịch sử, FK và phiên bản đã làm. Xóa tệp hết hạn phải giữ điểm, nhận xét, lịch sử tối thiểu và mốc xóa. Chặn tải ngay ở service trong thời gian chờ xóa vật lý. [BR-CONTENT và BR-AUTH](BUSINESS_RULES.md).

Bản SQL mới có system_settings theo từ điển bảng trong bản Word. Giữ band_scales.exam_type để tương thích 01 cũ. Chi tiết ánh xạ dữ liệu và cách chạy thử có trong [hướng dẫn SQL](csdl/README.md).
