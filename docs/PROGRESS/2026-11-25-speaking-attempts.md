# Tiến độ backend lượt làm và bản ghi âm Speaking ngày 25/11/2026

## Phạm vi và trạng thái

Backend cho trang làm bài Speaking theo [intent](../intent/speaking-test.md) và [spec mục 5](../intent/speaking-test-spec.md). Đã viết mã, build và kiểm thử bằng DB/storage giả. **Migration 26 đã áp lên database dùng chung ngày 2026-11-25 (các bảng liên quan rỗng, kiểm lại cột, index, ràng buộc đều đúng). Chưa kiểm thử đầu cuối với Supabase Storage thật; bucket `speaking-recordings` đã được tạo.** Frontend làm song song theo hợp đồng ở [API.md](../API.md).

## Công việc đã thực hiện

- Module `backend/src/modules/attempts` (routes, schemas, service, repository SQL thô), gắn dưới `/api/learner` trong `routes.ts`.
- `integrations/storage/recording-storage.ts` (URL ký tải lên/tải về, kiểm file, xóa); biến `STORAGE_BUCKET_RECORDINGS`.
- [Migration 26](../csdl/26_speaking_attempts.sql) (idempotent, chưa chạy): `attempts.client_attempt_id` + unique `(user_id, client_attempt_id)`; `skill_attempts.mode`, `time_limit_minutes`, `deadline_at` cho phép NULL; `submission_contents.question_key`, thay unique `(skill_attempt_id, section_id)` bằng `(skill_attempt_id, section_id, question_key)` và thêm unique theo từng câu.
- Hàm dọn `cleanupAttemptContent` và job `jobs/run-attempt-cleanup.ts` (`npm run attempts:cleanup`).
- Ranh giới: `POST .../grading-request` trả 501 `GRADING_NOT_AVAILABLE`; hoàn thành bài không tự gửi chấm.

## Áp migration 26 và rollback

Tiền đề: bảng `attempts`, `skill_attempts`, `submission_contents` đã có (01 hoặc 04/05). Kiểm trước khi áp: `select to_regclass(...)` ba bảng không NULL; `select distinct recording_status from public.submission_contents` chỉ gồm NULL, PENDING, UPLOADED, DELETED (tệp 26 tự dừng nếu vi phạm). Ràng buộc `recording_status` thêm đã kiểm hợp lệ, không NOT VALID. Rollback thủ công ở cuối tệp 26 và tóm tắt trong [README csdl](../csdl/README.md); cần tắt API trước và không còn hàng `question_key <> ''`, `deadline_at` NULL.

## Kiểm tra và bằng chứng

| Kiểm tra | Môi trường | Kết quả ghi nhận |
|---|---|---|
| `node --test tests/speaking-attempts.test.mjs` (17 ca: zod, idempotent, quyền sở hữu, REAL không ghi hai lần, hạn 14 ngày, 410, hủy, dọn dẹp, 401) | Local, repo/storage giả | Đạt |
| `npm run typecheck` | Local | Lỗi có sẵn ở `modules/users/staff-accounts.ts` (`must_change_password`, Prisma client cũ). Không có lỗi ở mã mới |
| `node --test tests/*.test.mjs` | Local | 72/74 đạt; ca "Test lifecycle" của bộ đề cần DB thật và lỗi, không liên quan thay đổi này |

SQL trong `attempts.repository.ts` chưa chạy trên Postgres thật.

## Phần còn mở

- Migration 26 đã áp (xem trên). Còn lại: Việc đổi unique của `submission_contents` và `deadline_at` NULL cần được xem xét.
- Tạo bucket riêng tư `speaking-recordings` (hoặc tên khác qua env); thử luồng đầy đủ PUT file, confirm, tải về với dịch vụ thật. URL tải lên do Supabase ký sống 2 giờ, không rút ngắn được.
- Lịch chạy job dọn dẹp chưa gắn: chưa có cron nào gọi `npm run attempts:cleanup -- --apply`, nên file chỉ bị xóa khi người triển khai đặt lịch. Lượt IN_PROGRESS không bao giờ hoàn thành (mồ côi) cũng chỉ được dọn bởi job này sau 48 giờ; tới lúc đó file còn nằm trên storage.
- Dọn dẹp hai bước: đổi trạng thái DB có điều kiện trước (hàng `submission_contents` thành `DELETED`, giữ `audio_path`), xóa file sau, rồi mới đặt `audio_path` NULL; lỗi xóa file được thử lại ở lần chạy sau (`retried`).
- Xóa tài khoản: `account-deletion.ts` xóa file `speaking/...` bằng Supabase Storage, đường dẫn khác (hoặc `r2:`) bằng R2.
- **Việc phối hợp với người làm lượt chấm (mục 14, chưa làm):** khi có luồng gửi chấm, cần chốt chỗ giữ nội dung (`content_status = HELD`) và trạng thái `grading_requests` để job dọn dẹp và `DELETE /skill-attempts/:id` không xóa bài đã gửi; hiện cả hai chỉ kiểm `WAITING_ASSIGNMENT`/`ASSIGNED` hoặc có hàng `grading_requests`.
- `questionId` là khóa do client đặt, backend chưa đối chiếu với nội dung đề; `partIndex` tính từ 0 (cần thống nhất với frontend).
- Lượt chấm, phân công, điểm, thông báo hạn lưu: phần việc của thành viên khác.
