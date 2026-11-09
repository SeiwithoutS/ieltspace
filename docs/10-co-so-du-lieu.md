# 10. Cơ sở dữ liệu

Cập nhật 09/11/2026. Nguồn: bộ nhớ dự án, thư mục `thiet-ke-csdl/` của thư viện dự án.

## 1. Hai bản thiết kế

| Bản | Trạng thái | Tệp trong docs |
|---|---|---|
| **CSDL draft của nhóm** (29/10, 39-40 bảng) | **Base hiện hành**, chưa chuyển thành `schema.prisma` | [csdl/nhom-csdl-draft.md](csdl/nhom-csdl-draft.md) |
| Bản rút gọn 22 bảng (24-27/10) | Chỉ để đối chiếu; có `schema.prisma`, SQL, ERD, đã chạy thử trên PostgreSQL 16 | [csdl/ban-22-bang-README.md](csdl/ban-22-bang-README.md), [csdl/ban-22-bang-tu-dien-du-lieu.md](csdl/ban-22-bang-tu-dien-du-lieu.md) |

Các tệp SQL, Prisma, ERD của bản 22 bảng nằm ở thư viện dự án `thiet-ke-csdl/` (không chép vào repo). Schema trong repo (`backend/prisma/schema.prisma`) hiện mới ánh xạ hồ sơ người dùng.

## 2. Nhóm bảng của bản nhóm

- **Người dùng**: users, teacher_permissions, study_goals.
- **Đề**: exam_sets, exams, exam_versions, exam_skills, exam_sections, question_groups, questions, question_options, question_answers.
- **Chấm điểm** (seed, không có UI MVP): band_scales, grading_rules, rubric_criteria.
- **Bài làm**: attempts, skill_attempts, attempt_answers, submission_contents, attempt_section_states.
- **Hỗ trợ chấm**: support_credits, grading_requests, grading_reviews, grading_scores, credit_refunds.
- **Từ vựng**: vocabulary_sets, vocabularies, vocabulary_set_items, favorite_vocabularies, vocabulary_notes, flashcard_sessions, flashcard_session_items.
- **Khác**: sample_answers, daily_motivations, learning_activities, notifications, import_batches, import_assets, import_errors, audit_logs.

Khác bản 22 bảng: `exam_versions` (đề đã đăng bất biến); đáp án tách `question_answers`; band và rubric thành bảng (bản 22 để JSON); tách `attempts` và `skill_attempts`; credit, refund, review, score tách riêng; từ vựng dùng chung + sets + favorite + notes; thêm `learning_activities`, `import_assets`, `import_errors`.

## 3. Quyết định đã chốt (dùng cho bản nào cũng vậy)

- `exam_sets` có `description` và `cover_url` (ảnh bìa 3:2, Supabase Storage).
- Academic / General Training nằm ở `parts.form` (enum ACADEMIC / GENERAL): bắt buộc cho Reading và Writing, NULL cho Listening và Speaking. **Bỏ** `exams.exam_type`. (Chốt 27/10, giữ lại 29/10 khi chuyển sang bản nhóm.)
- `learning_activities` tính theo lượt làm (attempts), giữ UC13.
- Bảng quy đổi band, tiêu chí chấm W/S (4 tiêu chí Writing, 4 tiêu chí Speaking), thông điệp động lực, tham số hệ thống (14 ngày, 72 giờ, ngưỡng flashcard 10 thẻ) là dữ liệu seed, không có màn quản lý.
- Id người dùng trùng `auth.users.id` của Supabase.
- Đoạn văn Reading lưu `[{label, text}]` trong nội dung phần; danh sách lựa chọn dùng chung của nhóm câu hỏi nằm trong config của question group.
- Trước mắt tập trung các bảng phần Quản lý (admin) (quyết định 29/10).

## 4. Quy tắc nghiệp vụ CSDL cần bảo đảm (từ bản 22 bảng)

- Mỗi bài W/S tối đa 1 yêu cầu chấm đang hoạt động (partial unique index).
- Lượt chấm unique theo tuần; bonus unique theo yêu cầu nguồn.
- Kết quả chấm có trạng thái nháp / đã công bố.
- `notifications.event_key` chống trùng thông báo.
- Prisma không viết được partial unique index và CHECK: áp bằng migration SQL tay (`constraints-bo-sung.sql`).

## 5. Điểm còn mở

1. `flashcard_sessions` có `tag_id` nhưng không có bảng tag; "chủ đề" hay `vocabulary_set_items`.
2. Giữ hay bỏ `daily_motivations`.
3. Chưa có bảng cấu hình hệ thống (giới hạn bài của giáo viên, ngưỡng flashcard).
4. Chưa có bảng nhật ký đăng nhập cho trang Người dùng (bảng "Hoạt động người học"); bản nhóm có `audit_logs`, cần xem có dùng được không.
5. Flashcard 3 mức (Chưa nhớ / Còn phân vân / Đã nhớ trên giao diện) hay 2 mức (Chương 3).
6. Dịch vụ tra từ (Merriam-Webster Thesaurus đang xem xét).
