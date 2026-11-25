import { z } from 'zod';

// Hằng số nghiệp vụ lượt làm Speaking (máy chủ quyết định, không tin client).
export const SPEAKING_REAL_LIMIT_MINUTES = 15;
export const PRACTICE_MAX_LIMIT_MINUTES = 30;
export const RECORDING_MAX_BYTES = 25 * 1024 * 1024;
export const RECORDING_MAX_DURATION_MS = 31 * 60 * 1000;
// Sau deadline_at vẫn nhận bản ghi trong ngần này giây (client tải nốt phần vừa ghi lúc hết giờ).
export const DEADLINE_GRACE_SECONDS = 120;
// Sau khi hoàn thành vẫn cho tải/xác nhận bản ghi đã đăng ký trong cửa sổ này (đồng bộ lại sau khi mất mạng).
export const POST_COMPLETE_UPLOAD_WINDOW_MS = 15 * 60 * 1000;
// BR-CONTENT-001: hạn nội dung = thời điểm hoàn thành + 14 ngày. Mở/tải không đổi hạn.
export const CONTENT_RETENTION_DAYS = 14;
export const DOWNLOAD_URL_TTL_SECONDS = 300;
// Lượt IN_PROGRESS bị bỏ quá lâu thì job dọn dẹp chuyển ABANDONED và xóa file.
export const STALE_IN_PROGRESS_HOURS = 48;

const uuid = z.string().uuid();
export const questionKeySchema = z.string().regex(/^[A-Za-z0-9_.:-]{1,64}$/);

export const idParamSchema = z.object({ id: uuid });
export const recordingParamSchema = z.object({ id: uuid, questionId: questionKeySchema });
export const examSkillParamSchema = z.object({ examSkillId: uuid });

export const createAttemptSchema = z
  .object({
    clientAttemptId: uuid,
    examSkillId: uuid,
    mode: z.enum(['REAL', 'PRACTICE']),
    limitMinutes: z.number().int().min(1).max(PRACTICE_MAX_LIMIT_MINUTES).nullable(),
  })
  .strict();

// partIndex tính từ 0 (Part 1 = 0, Part 2 = 1, Part 3 = 2) theo thứ tự mảng parts của API đề.
export const createRecordingSchema = z
  .object({
    questionId: questionKeySchema,
    partIndex: z.number().int().min(0).max(2),
    durationMs: z.number().int().min(0).max(RECORDING_MAX_DURATION_MS),
    mimeType: z.string().trim().max(100).regex(/^audio\/[A-Za-z0-9.+-]+(\s*;.*)?$/i),
    size: z.number().int().min(1).max(RECORDING_MAX_BYTES),
  })
  .strict();

export const completeAttemptSchema = z
  .object({
    // Chỉ tham chiếu, server không dùng (tự tính từ started_at): nhận mọi số >= 0, làm tròn xuống, không từ chối vì quá lớn.
    elapsedSeconds: z.number().finite().min(0).transform((v) => Math.floor(v)),
    reason: z.enum(['SUBMITTED', 'TIME_UP']).optional(),
  })
  .strict();

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;
export type CreateRecordingInput = z.infer<typeof createRecordingSchema>;
export type CompleteAttemptInput = z.infer<typeof completeAttemptSchema>;
