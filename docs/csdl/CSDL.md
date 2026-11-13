# Từ điển cơ sở dữ liệu IELTSpace

39 bảng nghiệp vụ (bỏ exam_versions theo D08 ngày 13/11), chia theo tám nhóm của bản Word. Mỗi bảng có danh sách trường và một dòng mô tả. PostgreSQL tự sinh thêm cột kỹ thuật `exam_sections.section_skill` để kiểm tra loại phần thi với bảng cha.

## 1. Người dùng

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Người dùng · `users` | `id`, `auth_user_id`, `full_name`, `display_name`, `email`, `avatar_url`, `role`, `status`, `created_at`, `updated_at`, `deleted_at` | Hồ sơ, vai trò và trạng thái tài khoản. |
| Quyền chấm của Giáo viên · `teacher_permissions` | `id`, `teacher_id`, `skill`, `max_pending`, `is_accepting`, `status`, `last_assigned_at`, `updated_at` | Kỹ năng được chấm, sức chứa và trạng thái nhận bài. |
| Mục tiêu học tập · `study_goals` | `id`, `user_id`, `overall_target`, `listening_target`, `reading_target`, `writing_target`, `speaking_target`, `daily_session_target`, `effective_from` | Band mục tiêu và số phiên học mỗi ngày, theo thời điểm áp dụng. |

## 2. Đề thi và câu hỏi

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Bộ đề · `exam_sets` | `id`, `name`, `description`, `cover_url`, `category`, `status`, `published_at`, `created_by`, `created_at`, `updated_at` | Tên bộ đề, ảnh bìa 3:2, danh mục (MOCK_TEST, ACTUAL_TEST, PRACTICE_TEST, FORECAST, OTHER), trạng thái công khai và ngày đăng lần đầu. |
| Đề thi · `exams` | `id`, `exam_set_id`, `title`, `order_no`, `description`, `created_by`, `created_at`, `updated_at` | Tên Test và thứ tự trong bộ. Trạng thái của Test suy từ các kỹ năng. |
| Kỹ năng trong đề · `exam_skills` | `id`, `exam_id`, `skill`, `form`, `version_number`, `status`, `duration_minutes`, `band_scale_id`, `grading_rule_id`, `created_by`, `created_at`, `published_at` | Đơn vị đăng và phiên bản: một kỹ năng của một Test, Reading/Writing tách Academic/General. Trạng thái DRAFT, PUBLISHED, HIDDEN, ARCHIVED. |
| Phần thi · `exam_sections` | `id`, `exam_skill_id`, `title`, `section_type`, `instruction`, `content`, `audio_path`, `image_path`, `transcript`, `config`, `order_no` | Nội dung theo Passage, Section, Task hoặc Part và tệp liên quan. Form lấy từ kỹ năng cha. |
| Nhóm câu hỏi · `question_groups` | `id`, `section_id`, `title`, `question_type`, `instruction`, `content`, `audio_path`, `image_path`, `question_from`, `question_to`, `config`, `order_no` | Dạng bài, dải số câu và cấu hình dùng chung cho nhóm. |
| Câu hỏi · `questions` | `id`, `question_group_id`, `content`, `question_type`, `number_from`, `number_to`, `answer_count`, `max_score`, `explanation`, `order_no` | Nội dung câu, dải số hiển thị, số đáp án và điểm tối đa. |
| Lựa chọn trả lời · `question_options` | `id`, `question_id`, `label`, `content`, `order_no` | Các phương án lựa chọn riêng của một câu. |
| Đáp án chuẩn · `question_answers` | `id`, `question_id`, `accepted_answers`, `matching_rule`, `evidence` | Đáp án hợp lệ, cách so khớp và bằng chứng cho lời giải. |

## 3. Chấm điểm

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Bảng quy đổi band · `band_scales` | `id`, `name`, `skill`, `form`, `version`, `conversion_rules` | Thang chuyển số câu đúng sang band theo kỹ năng; Reading có form, Listening để trống. |
| Bộ quy tắc chấm · `grading_rules` | `id`, `name`, `skill`, `assessment_scope`, `version`, `aggregation_rules`, `rounding_rules` | Phạm vi chấm, cách tính điểm và làm tròn theo phiên bản. |
| Tiêu chí chấm · `rubric_criteria` | `id`, `grading_rule_id`, `name`, `description`, `weight`, `min_score`, `max_score`, `score_step`, `order_no` | Trọng số, khoảng điểm và bước điểm của từng tiêu chí. |

## 4. Bài làm và nội dung bài nộp

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Lượt làm bài · `attempts` | `id`, `user_id`, `exam_id`, `attempt_type`, `selected_scope`, `status`, `started_at`, `completed_at` | Người làm, Test, phạm vi và thời gian làm bài. Bản kỹ năng đã làm ghi ở skill_attempts. |
| Bài làm theo kỹ năng · `skill_attempts` | `id`, `attempt_id`, `exam_skill_id`, `section_id`, `question_group_id`, `status`, `started_at`, `deadline_at`, `completed_at`, `duration_seconds`, `correct_count`, `total_questions`, `accuracy`, `band_score`, `band_scale_id`, `grading_rule_id`, `initial_expires_at`, `content_expires_at`, `content_status`, `content_deleted_at` | Kết quả từng kỹ năng, hạn làm, hạn lưu và trạng thái nội dung. |
| Câu trả lời · `attempt_answers` | `id`, `skill_attempt_id`, `question_id`, `answer_data`, `earned_score`, `correct_count`, `updated_at` | Đáp án đã nhập và điểm từng câu của người học. |
| Nội dung Writing/Speaking · `submission_contents` | `id`, `skill_attempt_id`, `section_id`, `text_content`, `audio_path`, `file_type`, `file_size`, `audio_duration`, `recording_status`, `updated_at` | Văn bản hoặc tệp ghi âm đã nộp theo Task/Part. |
| Trạng thái làm từng phần · `attempt_section_states` | `id`, `skill_attempt_id`, `section_id`, `status`, `started_at`, `completed_at`, `listening_started_at`, `recording_started_at`, `recording_locked_at` | Tiến độ từng phần và mốc phát nghe hoặc khóa ghi âm. |

## 5. Hỗ trợ chấm Writing/Speaking

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Lượt hỗ trợ chấm · `support_credits` | `id`, `user_id`, `credit_type`, `week_start`, `valid_from`, `expires_at`, `used_at`, `created_at` | Lượt tuần hoặc bonus, thời hạn và thời điểm sử dụng. |
| Yêu cầu hỗ trợ chấm · `grading_requests` | `id`, `skill_attempt_id`, `used_credit_id`, `status`, `requested_at`, `assignment_deadline`, `teacher_id`, `assigned_at`, `cancel_reason`, `cancel_note`, `cancelled_at`, `cancelled_by` | Bài cần chấm, lượt đã dùng, phân công và thông tin hủy. |
| Phiếu chấm · `grading_reviews` | `id`, `grading_request_id`, `teacher_id`, `grading_rule_id`, `status`, `overall_score`, `general_comment`, `updated_at`, `published_at` | Phiếu nháp hoặc đã công bố, điểm tổng và nhận xét. |
| Điểm theo tiêu chí · `grading_scores` | `id`, `grading_review_id`, `criterion_id`, `assessment_scope`, `section_id`, `score`, `comment` | Điểm, nhận xét từng tiêu chí theo kỹ năng hoặc phần. |
| Giao dịch hoàn bonus · `credit_refunds` | `id`, `grading_request_id`, `bonus_credit_id`, `status`, `created_at`, `refunded_at`, `error_message` | Yêu cầu được hoàn, lượt bonus tương ứng và kết quả xử lý. |

## 6. Từ vựng và flashcard

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Bộ từ vựng · `vocabulary_sets` | `id`, `name`, `description`, `status`, `created_at`, `updated_at` | Bộ từ theo chủ đề và trạng thái công khai. |
| Từ vựng · `vocabularies` | `id`, `word`, `phonetic`, `definitions`, `audio_url`, `sources`, `fetched_at`, `status`, `created_at`, `updated_at` | Từ, phiên âm, nghĩa, âm thanh và nguồn tra cứu. |
| Từ trong bộ · `vocabulary_set_items` | `id`, `set_id`, `vocabulary_id`, `order_no` | Danh sách từ và thứ tự trong mỗi bộ. |
| Từ yêu thích · `favorite_vocabularies` | `id`, `user_id`, `vocabulary_id`, `created_at` | Từ đã lưu vào danh sách yêu thích của từng người. |
| Ghi chú từ vựng · `vocabulary_notes` | `id`, `user_id`, `vocabulary_id`, `content`, `updated_at` | Ghi chú riêng của người học cho một từ. |
| Phiên ôn flashcard · `flashcard_sessions` | `id`, `user_id`, `source_type`, `set_id`, `total_cards`, `minimum_cards`, `reviewed_count`, `status`, `is_qualified`, `started_at`, `completed_at` | Nguồn thẻ, tiến độ ôn và điều kiện tính phiên hợp lệ. |
| Chi tiết phiên ôn · `flashcard_session_items` | `id`, `session_id`, `vocabulary_id`, `order_no`, `is_reviewed`, `self_rating`, `reviewed_at` | Thẻ đã ôn, lần ôn và mức Chưa nhớ/Đã nhớ. |

## 7. Bài mẫu và hoạt động học tập

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Bài mẫu · `sample_answers` | `id`, `title`, `skill`, `sample_type`, `topic`, `prompt`, `content`, `exam_id`, `section_id`, `status`, `created_by`, `created_at`, `updated_at` | Đề bài và bài mẫu Writing/Speaking theo Task/Part. |
| Hoạt động học tập · `learning_activities` | `id`, `user_id`, `activity_type`, `attempt_id`, `flashcard_session_id`, `completed_at`, `activity_date` | Lượt làm hoặc phiên flashcard được tính vào ngày học. |

## 8. Thông báo và quản trị

| Bảng | Các trường dữ liệu chính | Thông tin cần lưu |
|---|---|---|
| Thông báo · `notifications` | `id`, `recipient_id`, `event_key`, `type`, `title`, `content`, `reference_type`, `reference_id`, `created_at`, `read_at` | Người nhận, sự kiện, nội dung và thời điểm đã đọc. |
| Lô nhập dữ liệu · `import_batches` | `id`, `request_key`, `import_type`, `exam_id`, `skill`, `form`, `file_name`, `temporary_path`, `status`, `total_records`, `valid_records`, `error_records`, `created_by`, `created_at`, `completed_at` | Loại dữ liệu, đích nhập, khóa chống trùng và kết quả kiểm tra. |
| Tệp đính kèm lô nhập · `import_assets` | `id`, `batch_id`, `file_name`, `storage_path`, `file_type`, `file_size`, `status` | Tên tệp đính kèm, đường dẫn lưu và trạng thái xử lý. |
| Lỗi nhập dữ liệu · `import_errors` | `id`, `batch_id`, `sheet_name`, `row_number`, `field_name`, `severity`, `message` | Vị trí và lý do lỗi theo sheet, dòng và trường. |
| Nhật ký hệ thống · `audit_logs` | `id`, `actor_id`, `actor_type`, `action`, `entity_type`, `entity_id`, `change_data`, `reason`, `created_at` | Chủ thể, thao tác, đối tượng và lý do thay đổi. |
| Cấu hình hệ thống · `system_settings` | `key`, `value`, `description`, `updated_at`, `updated_by` | Tham số dùng chung, giá trị JSON và người cập nhật. |

## Quan hệ và ràng buộc chính

Bộ đề → Test → kỹ năng (theo phiên bản) → phần → nhóm → câu. Mỗi kỹ năng + form của một Test có tối đa một bản nháp và một bản đang hiển thị (PUBLISHED hoặc HIDDEN); bản cũ chuyển ARCHIVED và vẫn giữ cho bài đã làm. Reading/Writing bắt buộc ACADEMIC hoặc GENERAL, Listening/Speaking để trống. Reading phải dùng thang band đúng form (khóa ngoại ghép). Bộ đề chỉ có published_at khi đã rời trạng thái DRAFT.

Người học → lượt làm → bài theo kỹ năng → câu trả lời hoặc nội dung nộp. Lượt hỗ trợ → yêu cầu chấm → phiếu → điểm tiêu chí. Một bài có tối đa một yêu cầu đang hoạt động. Một lượt chỉ dùng một lần. Mỗi yêu cầu hủy đủ điều kiện chỉ hoàn một bonus.

Từ vựng dùng bộ từ, yêu thích và ghi chú cá nhân. Mỗi thẻ chỉ tính một lần trong một phiên. Hoạt động học và thông báo có khóa chống trùng. Xem [mô hình và chính sách lưu](../DATABASE.md) cùng [hướng dẫn chạy SQL](README.md).
