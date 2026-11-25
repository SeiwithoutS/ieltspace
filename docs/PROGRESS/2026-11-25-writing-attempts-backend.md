# Tiến độ backend lượt làm Writing (SPK-15, phần backend) ngày 25/11/2026

Mở rộng module `backend/src/modules/attempts` để Writing dùng chung luồng lượt làm của Speaking. Không thêm cột/bảng, không migration mới (dùng `submission_contents.text_content`, `question_key` = `task1`/`task2`, `section_id` = Task tương ứng; `recording_status` để NULL). Chưa chạy với database thật; kiểm thử bằng repo giả.

## Đã làm

- `GET /learner/exam-skills/:examSkillId/writing`: đề Writing đã đăng, không có thông tin chấm.
- `POST /learner/skill-attempts` nhận kỹ năng Speaking hoặc Writing (máy chủ suy ra từ đề). Thi thật Writing 60 phút; Practice tới 60 phút (Speaking vẫn tối đa 30, kiểm ở service).
- `PUT` và `GET /learner/skill-attempts/:id/writing/:taskKey`: lưu và đọc văn bản Task (tối đa 20.000 ký tự).
- `GET /learner/skill-attempts/:id` thêm `skill`, và `tasks[{taskKey, wordCount, updatedAt}]` cho Writing.
- Truy vấn lượt (`attemptFrom`) đổi từ `skill = 'SPEAKING'` sang `IN ('SPEAKING','WRITING')` và trả thêm `skill`; các endpoint bản ghi âm chặn lượt Writing (404), endpoint văn bản chặn lượt Speaking (404).
- Job dọn dẹp dùng chung: `markContentRows` đã đặt `text_content = NULL` và `DELETED` cho mọi hàng của lượt hết hạn, nay áp cho cả lượt Writing; bài có yêu cầu chấm `WAITING_ASSIGNMENT`/`ASSIGNED` được giữ.
- Test: thêm vào `backend/tests/speaking-attempts.test.mjs` (zod, idempotent, quyền sở hữu, độ dài, hết hạn, không lẫn kỹ năng, ghi đè trước khi hoàn thành, hủy, dọn dẹp).

## Điểm chưa chắc

- Sau `COMPLETED` không sửa được văn bản (409 `ATTEMPT_NOT_ACTIVE`), khác Speaking cho tải nốt trong 15 phút; client phải PUT lần cuối trước khi `complete`.
- Job dọn dẹp và "lượt IN_PROGRESS bỏ quá 48 giờ" giờ cũng quét lượt Writing; hiện chưa có luồng Writing khác dùng `skill_attempts`, nhưng khi nhóm khác làm luồng nộp/chấm Writing cần kiểm lại điều kiện này.
- `imageUrl` dùng `publicUrl()` của bucket đề thi; nếu storage chưa cấu hình thì trả `null`.
