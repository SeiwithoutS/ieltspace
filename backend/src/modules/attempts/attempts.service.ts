import type { RecordingStorage } from '../../integrations/storage/recording-storage.js';
import { HttpError } from '../../utils/http.js';
import { DEFAULT_SPEAKING_EMPTY, sectionsToSpeaking, sectionsToWriting } from '../exams/exam-content.mapper.js';
import type { AttemptRecord, AttemptSkill, AttemptsRepository } from './attempts.repository.js';
import {
  CONTENT_RETENTION_DAYS,
  DEADLINE_GRACE_SECONDS,
  DOWNLOAD_URL_TTL_SECONDS,
  POST_COMPLETE_UPLOAD_WINDOW_MS,
  SPEAKING_REAL_LIMIT_MINUTES,
  WRITING_DEFAULT_MIN_WORDS,
  WRITING_REAL_LIMIT_MINUTES,
  STALE_IN_PROGRESS_HOURS,
  type CompleteAttemptInput,
  type CreateAttemptInput,
  type CreateRecordingInput,
  type PutWritingInput,
  PRACTICE_MAX_LIMIT_MINUTES,
  effectiveContentStatus,
} from './attempts.schemas.js';

export type AttemptsDeps = {
  repo: AttemptsRepository;
  storage: RecordingStorage;
  clock?: () => Date;
  // Đổi đường dẫn ảnh đề Writing thành URL công khai (bucket đề thi); mặc định không trả ảnh.
  imageUrl?: (path: string) => string | null;
};

const TASK_ORDER: Record<string, number> = { task1: 0, task2: 1 };

export function countWords(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

const notFound = () => new HttpError(404, 'ATTEMPT_NOT_FOUND', 'Không tìm thấy lượt làm bài.');
const contentExpired = () => new HttpError(410, 'CONTENT_EXPIRED', 'Nội dung đã hết hạn lưu.');
const DAY_MS = 24 * 3600 * 1000;

const EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/wave': 'wav',
};

export function recordingPath(userId: string, attemptId: string, questionKey: string, mimeType: string) {
  const base = mimeType.split(';')[0].trim().toLowerCase();
  return `speaking/${userId}/${attemptId}/${questionKey}.${EXTENSIONS[base] ?? 'audio'}`;
}

export function createAttemptsService({ repo, storage, clock = () => new Date(), imageUrl }: AttemptsDeps) {
  // Chủ lượt làm: người khác nhận 404 như lượt không tồn tại (không lộ sự tồn tại).
  async function ownedAttempt(userId: string, id: string): Promise<AttemptRecord> {
    const attempt = await repo.getAttempt(id);
    if (!attempt || attempt.userId !== userId) throw notFound();
    return attempt;
  }

  function attemptView(a: AttemptRecord) {
    return { id: a.id, status: a.status, startedAt: a.startedAt.toISOString(), deadlineAt: a.deadlineAt?.toISOString() ?? null };
  }

  const assertSkill = (a: AttemptRecord, skill: AttemptSkill) => {
    if (a.skill !== skill) throw notFound();
  };
  const contentStatus = (a: AttemptRecord, now: Date) => effectiveContentStatus(a.contentStatus, a.contentExpiresAt, now);
  const contentGone = (status: ReturnType<typeof contentStatus>) => status === 'EXPIRED' || status === 'DELETED';

  // Cho phép TẠO/cấp lại URL bản ghi khi: đang làm (và chưa quá deadline + ân hạn), hoặc vừa hoàn thành trong cửa sổ ngắn.
  // Sau khi hoàn thành (mọi chế độ) chỉ được tải nốt hàng đã đăng ký lúc đang làm (hasPendingRow), không tạo câu mới.
  // confirmRecording KHÔNG dùng hàm này (file đã nằm trên storage).
  function assertWritable(a: AttemptRecord, now: Date, hasPendingRow: boolean) {
    if (contentGone(contentStatus(a, now))) throw contentExpired();
    if (a.status === 'IN_PROGRESS') {
      if (a.deadlineAt && now.getTime() > a.deadlineAt.getTime() + DEADLINE_GRACE_SECONDS * 1000) {
        throw new HttpError(409, 'ATTEMPT_TIME_EXPIRED', 'Đã quá thời gian làm bài.');
      }
      return;
    }
    if (a.status === 'COMPLETED' && a.completedAt && now.getTime() - a.completedAt.getTime() <= POST_COMPLETE_UPLOAD_WINDOW_MS) {
      if (!hasPendingRow) {
        throw new HttpError(409, 'ATTEMPT_NOT_ACTIVE', 'Bài thi đã hoàn thành, không thể thêm bản ghi.');
      }
      return;
    }
    throw new HttpError(409, 'ATTEMPT_NOT_ACTIVE', 'Lượt làm bài không còn nhận bản ghi.');
  }

  // File đã có trên storage và đúng dung lượng khai báo (lỗi storage khi kiểm thì coi như chưa có, để client PUT lại).
  async function uploadedAlready(path: string, size: number) {
    const info = await storage.statObject(path).catch(() => null);
    return info !== null && info.size === size;
  }

  return {
    async getSpeakingContent(examSkillId: string) {
      const skill = await repo.findPublishedSkill(examSkillId, 'SPEAKING');
      if (!skill) throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Đề Speaking không tồn tại hoặc chưa được đăng.');
      const c = sectionsToSpeaking(skill.sections);
      const qs = (p: { instruction: string; questions: string[] }) => ({
        kind: 'qs' as const,
        questions: p.questions,
        ...(p.instruction ? { instr: p.instruction } : {}),
      });
      return {
        examSkillId: skill.id,
        title: skill.examTitle,
        durationMinutes: skill.durationMinutes,
        parts: [
          qs(c.part1),
          {
            kind: 'cue' as const,
            // Đơn vị phút, theo cấu hình đề; thiếu thì dùng mặc định của editor.
            cue: {
              prep: c.part2.prepMinutes ?? DEFAULT_SPEAKING_EMPTY.part2.prepMinutes,
              speak: c.part2.speakMinutes ?? DEFAULT_SPEAKING_EMPTY.part2.speakMinutes,
              text: c.part2.cueCard,
              ...(c.part2.topic ? { topic: c.part2.topic } : {}),
            },
          },
          qs(c.part3),
        ],
      };
    },

    async getWritingContent(examSkillId: string) {
      const skill = await repo.findPublishedSkill(examSkillId, 'WRITING');
      if (!skill) throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Đề Writing không tồn tại hoặc chưa được đăng.');
      const content = sectionsToWriting(skill.sections, imageUrl ? (p) => imageUrl(p) || null : undefined);
      const minWordsOf = (orderNo: number, key: 'task1' | 'task2') => {
        const cfg = skill.sections.find((x) => x.order_no === orderNo)?.config as { minWords?: unknown } | null | undefined;
        const n = Number(cfg?.minWords);
        return Number.isFinite(n) && n > 0 ? Math.floor(n) : WRITING_DEFAULT_MIN_WORDS[key];
      };
      const keys = ['task1', 'task2'] as const;
      return {
        examSkillId: skill.id,
        title: skill.examTitle,
        form: skill.form,
        durationMinutes: skill.durationMinutes,
        tasks: content.tasks.map((t, i) => ({
          taskKey: keys[i],
          prompt: t.prompt,
          imageUrl: t.imageUrl || null,
          minWords: minWordsOf(i + 1, keys[i]),
          ...(t.essayType ? { essayType: t.essayType } : {}),
          ...(t.topic ? { topic: t.topic } : {}),
        })),
      };
    },

    async createAttempt(userId: string, input: CreateAttemptInput) {
      const existing = await repo.findByClientAttemptId(userId, input.clientAttemptId);
      if (existing) {
        if (existing.examSkillId !== input.examSkillId) {
          throw new HttpError(409, 'CLIENT_ATTEMPT_ID_CONFLICT', 'Mã lượt làm đã được dùng cho đề khác.');
        }
        return { created: false, body: attemptView(existing) };
      }
      // Kỹ năng do đề quyết định (không tin client): thử Speaking trước, không có thì Writing.
      const skill =
        (await repo.findPublishedSkill(input.examSkillId, 'SPEAKING')) ?? (await repo.findPublishedSkill(input.examSkillId, 'WRITING'));
      if (!skill) throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Đề không tồn tại hoặc chưa được đăng.');
      const available = skill.skill === 'WRITING' ? [1, 2] : [1, 2, 3];
      const sections = input.mode === 'PRACTICE' && input.sections
        ? [...new Set(input.sections)].sort((a, b) => a - b)
        : available;
      if (input.mode === 'PRACTICE' && input.sections && sections.some((section) =>
        !available.includes(section) || !skill.sections.some((part) => part.order_no === section))) {
        throw new HttpError(400, 'INVALID_SECTION', 'Phần đã chọn không thuộc kỹ năng này.');
      }
      // Thi thật cố định (Speaking 15, Writing 60 phút; bỏ qua limitMinutes của client). Practice: theo limitMinutes, null = không giới hạn.
      if (skill.skill === 'SPEAKING' && input.limitMinutes !== null && input.limitMinutes > PRACTICE_MAX_LIMIT_MINUTES) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.');
      }
      const realLimit = skill.skill === 'WRITING' ? WRITING_REAL_LIMIT_MINUTES : SPEAKING_REAL_LIMIT_MINUTES;
      const limitMinutes = input.mode === 'REAL' ? realLimit : input.limitMinutes;
      const startedAt = clock();
      const deadlineAt = limitMinutes === null ? null : new Date(startedAt.getTime() + limitMinutes * 60_000);
      const { attempt, created } = await repo.createAttempt({
        userId, clientAttemptId: input.clientAttemptId, examId: skill.examId, examSkillId: skill.id,
        mode: input.mode, limitMinutes, startedAt, deadlineAt, sections,
      });
      if (attempt.examSkillId !== input.examSkillId) {
        throw new HttpError(409, 'CLIENT_ATTEMPT_ID_CONFLICT', 'Mã lượt làm đã được dùng cho đề khác.');
      }
      return { created, body: attemptView(attempt) };
    },

    async getAttempt(userId: string, id: string) {
      const a = await ownedAttempt(userId, id);
      const isWriting = a.skill === 'WRITING';
      const status = contentStatus(a, clock());
      const recordings = isWriting || contentGone(status) ? [] : await repo.listRecordings(a.id);
      const texts = isWriting && !contentGone(status) ? await repo.listWritingTexts(a.id) : [];
      return {
        skill: a.skill,
        id: a.id,
        status: a.status,
        mode: a.mode,
        sections: a.sections,
        startedAt: a.startedAt.toISOString(),
        deadlineAt: a.deadlineAt?.toISOString() ?? null,
        completedAt: a.completedAt?.toISOString() ?? null,
        contentStatus: status,
        contentExpiresAt: status === 'HELD' ? null : a.contentExpiresAt?.toISOString() ?? null,
        elapsedSeconds: a.status === 'COMPLETED' ? a.durationSeconds : null,
        recordings: recordings.map((r) => ({
          questionId: r.questionKey, partIndex: r.partIndex, status: r.status, durationMs: r.durationMs, size: r.size,
        })),
        // Chỉ Writing: số từ và mốc lưu, không kèm nội dung (đọc nội dung bằng GET .../writing/:taskKey).
        ...(isWriting
          ? { tasks: texts.map((t) => ({ taskKey: t.taskKey, wordCount: countWords(t.text), updatedAt: t.updatedAt.toISOString() })) }
          : {}),
      };
    },

    async createRecording(userId: string, id: string, input: CreateRecordingInput) {
      const now = clock();
      const a = await ownedAttempt(userId, id);
      assertSkill(a, 'SPEAKING');
      const current = await repo.getRecording(a.id, input.questionId);
      assertWritable(a, now, current?.status === 'PENDING');
      if (a.sections && !a.sections.includes(input.partIndex + 1)) {
        throw new HttpError(400, 'INVALID_PART', 'Part không thuộc phạm vi lượt luyện tập này.');
      }
      const sectionId = await repo.resolveSectionId(a, input.partIndex);
      if (!sectionId) throw new HttpError(400, 'INVALID_PART', 'Part không tồn tại trong đề.');
      if (current && current.sectionId !== sectionId) {
        throw new HttpError(400, 'QUESTION_PART_MISMATCH', 'Câu hỏi không thuộc Part này.');
      }
      // Chỉ Practice còn đang làm mới ghi đè được; Thi thật và mọi chế độ sau khi hoàn thành thì mỗi câu chỉ một bản ghi.
      const strict = a.mode !== 'PRACTICE' || a.status !== 'IN_PROGRESS';
      if (strict && current?.status === 'UPLOADED') {
        throw new HttpError(409, 'RECORDING_ALREADY_EXISTS', 'Câu hỏi này đã có bản ghi, không thể ghi lại.');
      }
      const baseType = (m: string) => m.split(';')[0].trim().toLowerCase();

      if (strict && current?.status === 'PENDING') {
        // Giữ nguyên đường dẫn, loại, dung lượng đã khai; chỉ cấp lại URL (không xóa file cũ).
        if (current.mimeType && baseType(current.mimeType) !== baseType(input.mimeType)) {
          throw new HttpError(409, 'RECORDING_MIME_MISMATCH', 'Định dạng bản ghi khác với lần đăng ký trước.');
        }
        if (await uploadedAlready(current.audioPath, current.size)) {
          return { uploadUrl: null, path: current.audioPath, alreadyUploaded: true };
        }
        return { uploadUrl: await storage.createUploadUrl(current.audioPath, false), path: current.audioPath, alreadyUploaded: false };
      }

      const path = recordingPath(userId, a.id, input.questionId, input.mimeType);
      // Practice: hàng PENDING cùng đường dẫn mà file đã nằm trên storage đúng dung lượng thì khỏi tải lại.
      const already = current?.status === 'PENDING' && current.audioPath === path && (await uploadedAlready(path, input.size));
      const row = await repo.upsertRecording({
        skillAttemptId: a.id, sectionId, questionKey: input.questionId, audioPath: path, mimeType: input.mimeType.trim(),
        size: input.size, durationMs: input.durationMs, overwrite: !strict, now,
      });
      if (!row) throw new HttpError(409, 'RECORDING_ALREADY_EXISTS', 'Câu hỏi này đã có bản ghi, không thể ghi lại.');
      if (already) return { uploadUrl: null, path, alreadyUploaded: true };
      const uploadUrl = await storage.createUploadUrl(path, !strict);
      if (current && current.audioPath !== path) await storage.removeObjects([current.audioPath]).catch(() => undefined);
      return { uploadUrl, path, alreadyUploaded: false };
    },

    async confirmRecording(userId: string, id: string, questionKey: string) {
      const now = clock();
      const a = await ownedAttempt(userId, id);
      assertSkill(a, 'SPEAKING');
      if (contentGone(contentStatus(a, now))) throw contentExpired();
      const rec = await repo.getRecording(a.id, questionKey);
      if (!rec) throw new HttpError(404, 'RECORDING_NOT_FOUND', 'Không tìm thấy bản ghi.');
      if (rec.status === 'UPLOADED') return { status: 'UPLOADED' as const };
      // File đã nằm trên storage nên không xét deadline/ân hạn/cửa sổ sau hoàn thành; chỉ chặn khi nội dung đã hết hạn lưu.
      const info = await storage.statObject(rec.audioPath);
      if (!info) throw new HttpError(409, 'RECORDING_NOT_UPLOADED', 'Bản ghi chưa được tải lên.');
      if (info.size !== null && info.size !== rec.size) {
        throw new HttpError(422, 'RECORDING_SIZE_MISMATCH', 'Dung lượng bản ghi không khớp với khai báo.');
      }
      await repo.confirmRecording(a.id, questionKey, info.size ?? rec.size, now);
      return { status: 'UPLOADED' as const };
    },

    async completeAttempt(userId: string, id: string, input: CompleteAttemptInput) {
      const a = await ownedAttempt(userId, id);
      const summary = (x: AttemptRecord) => ({
        status: 'COMPLETED' as const,
        completedAt: x.completedAt!.toISOString(),
        contentExpiresAt: x.contentExpiresAt!.toISOString(),
        durationSeconds: x.durationSeconds ?? 0,
      });
      if (a.status === 'COMPLETED') return summary(a);
      if (a.status !== 'IN_PROGRESS') throw new HttpError(409, 'ATTEMPT_NOT_ACTIVE', 'Lượt làm bài đã bị hủy.');
      const completedAt = clock();
      // Thời gian làm do máy chủ tính từ started_at; elapsedSeconds của client chỉ để tham chiếu, không được tin
      // (khai nhiều hơn thực tế hay ít hơn đều không đổi kết quả). Không vượt quá hạn của lượt có giới hạn.
      void input.elapsedSeconds;
      let durationSeconds = Math.max(0, Math.floor((completedAt.getTime() - a.startedAt.getTime()) / 1000));
      if (a.deadlineAt) {
        durationSeconds = Math.min(durationSeconds, Math.floor((a.deadlineAt.getTime() - a.startedAt.getTime()) / 1000));
      }
      const contentExpiresAt = new Date(completedAt.getTime() + CONTENT_RETENTION_DAYS * DAY_MS);
      const done = await repo.completeAttempt({ attempt: a, completedAt, durationSeconds, contentExpiresAt });
      if (!done || done.status !== 'COMPLETED') throw new HttpError(409, 'ATTEMPT_NOT_ACTIVE', 'Lượt làm bài không còn hoạt động.');
      // Nếu lần gọi khác hoàn thành trước, done mang giá trị của lần đó (idempotent).
      return summary(done);
    },

    async getRecordingUrl(userId: string, id: string, questionKey: string) {
      const now = clock();
      const a = await ownedAttempt(userId, id);
      assertSkill(a, 'SPEAKING');
      // BR-CONTENT-002: hết hạn thì chặn đọc ngay cả khi job chưa xóa tệp. Mở/tải không đổi hạn.
      const status = contentStatus(a, now);
      if (contentGone(status)) throw contentExpired();
      const rec = await repo.getRecording(a.id, questionKey);
      if (!rec || rec.status !== 'UPLOADED') throw new HttpError(404, 'RECORDING_NOT_FOUND', 'Không tìm thấy bản ghi.');
      const signedAt = clock().getTime();
      const ttl = status !== 'HELD' && a.contentExpiresAt
        ? Math.min(DOWNLOAD_URL_TTL_SECONDS, Math.floor((a.contentExpiresAt.getTime() - signedAt) / 1000))
        : DOWNLOAD_URL_TTL_SECONDS;
      if (ttl < 1) throw contentExpired();
      const url = await storage.createDownloadUrl(rec.audioPath, ttl);
      return { url, expiresAt: new Date(signedAt + ttl * 1000).toISOString() };
    },

    // Writing: lưu văn bản Task (ghi đè, idempotent). Không log nội dung bài viết.
    async putWritingText(userId: string, id: string, taskKey: string, input: PutWritingInput) {
      const now = clock();
      const a = await ownedAttempt(userId, id);
      assertSkill(a, 'WRITING');
      if (contentGone(contentStatus(a, now))) throw contentExpired();
      if (a.status !== 'IN_PROGRESS') throw new HttpError(409, 'ATTEMPT_NOT_ACTIVE', 'Lượt làm bài không còn nhận nội dung.');
      if (a.sections && !a.sections.includes(TASK_ORDER[taskKey] + 1)) {
        throw new HttpError(404, 'TASK_NOT_FOUND', 'Không tìm thấy Task trong phạm vi lượt làm bài.');
      }
      if (a.deadlineAt && now.getTime() > a.deadlineAt.getTime() + DEADLINE_GRACE_SECONDS * 1000) {
        throw new HttpError(409, 'ATTEMPT_TIME_EXPIRED', 'Đã quá thời gian làm bài.');
      }
      const partIndex = TASK_ORDER[taskKey];
      const sectionId = partIndex === undefined ? null : await repo.resolveSectionId(a, partIndex);
      if (!sectionId) throw new HttpError(404, 'TASK_NOT_FOUND', 'Task không tồn tại trong đề.');
      const row = await repo.upsertWritingText({ skillAttemptId: a.id, sectionId, taskKey, text: input.text, now });
      if (!row) throw new HttpError(410, 'CONTENT_EXPIRED', 'Nội dung đã hết hạn lưu.');
      return { taskKey, wordCount: countWords(row.text), updatedAt: row.updatedAt.toISOString() };
    },

    async getWritingText(userId: string, id: string, taskKey: string) {
      const now = clock();
      const a = await ownedAttempt(userId, id);
      assertSkill(a, 'WRITING');
      // BR-CONTENT-002: hết hạn thì chặn đọc ngay cả khi job chưa xóa. Mở không đổi hạn.
      if (contentGone(contentStatus(a, now))) throw contentExpired();
      const row = await repo.getWritingText(a.id, taskKey);
      // Chưa có hàng nghĩa là Người học chưa gõ gì cho Task này: trả văn bản rỗng để client khôi phục bài dở.
      if (!row) return { taskKey, text: '', wordCount: 0, updatedAt: null };
      return { taskKey, text: row.text, wordCount: countWords(row.text), updatedAt: row.updatedAt.toISOString() };
    },

    async getSavedWriting(userId: string, id: string) {
      const a = await ownedAttempt(userId, id);
      assertSkill(a, 'WRITING');
      if (contentGone(contentStatus(a, clock()))) throw contentExpired();
      if (a.status !== 'COMPLETED') {
        throw new HttpError(409, 'ATTEMPT_NOT_COMPLETED', 'Hãy hoàn thành và lưu bài trước khi tải.');
      }
      const texts = await repo.listWritingTexts(a.id);
      if (contentGone(contentStatus(a, clock()))) throw contentExpired();
      return {
        sections: a.sections,
        tasks: texts.flatMap(({ taskKey, text }) =>
          (taskKey === 'task1' || taskKey === 'task2') && text.trim() &&
          (!a.sections || a.sections.includes(TASK_ORDER[taskKey] + 1)) ? [{ taskKey, text }] : []),
      };
    },

    // "Không lưu": idempotent. Lượt không tồn tại hoặc của người khác: không làm gì (vẫn 204, không lộ thông tin).
    async deleteAttempt(userId: string, id: string) {
      const a = await repo.getAttempt(id);
      if (!a || a.userId !== userId) return;
      // Chỉ bài đang làm (hoặc đã bỏ) mới hủy được; bài đã hoàn thành chỉ mất khi hết hạn lưu.
      if (a.status === 'COMPLETED') throw new HttpError(409, 'ATTEMPT_ALREADY_COMPLETED', 'Bài đã hoàn thành, không thể hủy.');
      const result = await repo.deleteAttempt(a);
      if (!result.deleted) {
        if (result.reason === 'COMPLETED') {
          throw new HttpError(409, 'ATTEMPT_ALREADY_COMPLETED', 'Bài đã hoàn thành, không thể hủy.');
        }
        throw new HttpError(409, 'ATTEMPT_ALREADY_SUBMITTED', 'Bài đã gửi chấm, không thể hủy.');
      }
      // Xóa file sau khi commit. Giữ đường dẫn trên hàng DELETED để job thử lại khi Storage lỗi.
      if (result.paths.length) {
        try {
          await storage.removeObjects(result.paths);
          await repo.clearDeletedPaths(a.id, result.paths);
        } catch {
          // Bài đã hủy. Job sẽ thử xóa file ở lần chạy sau.
        }
      }
    },

  };
}

// Dọn lượt W/S đã hết hạn (không có yêu cầu chấm đang chờ/đã phân công) và lượt IN_PROGRESS
// bị bỏ quá STALE_IN_PROGRESS_HOURS giờ. Thứ tự: đổi trạng thái DB trước (có điều kiện), rồi mới xóa file; xóa file lỗi thì
// đường dẫn vẫn còn ở DB (hàng DELETED) và được thử lại ở lần chạy sau. Gọi: node dist/jobs/run-attempt-cleanup.js [--apply]
export async function cleanupAttemptContent(
  { repo, storage, clock = () => new Date() }: AttemptsDeps,
  { limit = 100 }: { limit?: number } = {}
) {
  const now = clock();
  const result = { expired: 0, abandoned: 0, retried: 0, failed: 0 };
  const removeFiles = async (item: { id: string; paths: string[] }) => {
    try {
      await storage.removeObjects(item.paths);
      await repo.clearDeletedPaths(item.id, item.paths);
      return true;
    } catch {
      result.failed += 1; // audio_path còn nguyên, lần chạy sau thử lại
      return false;
    }
  };
  const claimedExpired = await repo.claimExpiredContent(now, limit);
  const claimedStale = await repo.claimStaleInProgress(new Date(now.getTime() - STALE_IN_PROGRESS_HOURS * 3600_000), now, limit);
  result.expired = claimedExpired.length;
  result.abandoned = claimedStale.length;
  for (const item of [...claimedExpired, ...claimedStale]) await removeFiles(item);
  const claimed = new Set([...claimedExpired, ...claimedStale].map((x) => x.id));
  for (const item of await repo.listPendingFileDeletes(limit)) {
    if (claimed.has(item.id)) continue;
    if (await removeFiles(item)) result.retried += 1;
  }
  return result;
}
