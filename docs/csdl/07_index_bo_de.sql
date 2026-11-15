-- 07_index_bo_de.sql
-- Thêm index tối ưu hóa truy vấn cho quản lý bộ đề, soạn thảo kỹ năng, lượt làm bài và nhật ký kiểm toán.
-- Chạy an toàn với IF NOT EXISTS.
-- Ngày tạo: 2026-11-15 (Theo kế hoạch cải tiến CT-06 / E5)

create index if not exists exam_skills_slot on public.exam_skills(exam_id, skill, form, status);
create index if not exists exam_sections_skill on public.exam_sections(exam_skill_id, order_no);
create index if not exists question_groups_section on public.question_groups(section_id, order_no);
create index if not exists questions_group on public.questions(question_group_id, order_no);
create index if not exists question_options_question on public.question_options(question_id);
create index if not exists skill_attempts_skill on public.skill_attempts(exam_skill_id);
create index if not exists attempts_exam_status on public.attempts(exam_id, status);
create index if not exists audit_logs_entity on public.audit_logs(entity_type, entity_id, created_at desc);
