import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import type { RawSection } from '../exams/exam-content.mapper.js';

// Truy cập dữ liệu lượt làm Speaking bằng SQL thô (schema.prisma không map skill_attempts/submission_contents).
// Mỗi hàm là một câu lệnh nguyên tử hoặc một transaction; quy tắc nghiệp vụ nằm ở attempts.service.ts.

export type AttemptMode = 'REAL' | 'PRACTICE';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export type AttemptRecord = {
  id: string;
  parentAttemptId: string;
  userId: string;
  examSkillId: string;
  mode: AttemptMode | null;
  status: AttemptStatus;
  startedAt: Date;
  deadlineAt: Date | null;
  completedAt: Date | null;
  contentExpiresAt: Date | null;
  contentStatus: string;
  durationSeconds: number | null;
};

export type RecordingRecord = {
  id: string;
  skillAttemptId: string;
  sectionId: string;
  partIndex: number;
  questionKey: string;
  status: 'PENDING' | 'UPLOADED';
  audioPath: string;
  mimeType: string | null;
  durationMs: number;
  size: number;
};

export type PublishedSpeakingSkill = {
  id: string;
  examId: string;
  examTitle: string;
  durationMinutes: number;
  sections: RawSection[];
};

export type UpsertRecordingInput = {
  skillAttemptId: string;
  sectionId: string;
  questionKey: string;
  audioPath: string;
  mimeType: string;
  size: number;
  durationMs: number;
  // true (Practice): ghi đè được; false (Thi thật): chỉ cập nhật khi hàng còn PENDING.
  overwrite: boolean;
  now: Date;
};

export type ExpiredAttempt = { id: string; paths: string[] };

export type AttemptsRepository = {
  findPublishedSpeakingSkill(examSkillId: string): Promise<PublishedSpeakingSkill | null>;
  findByClientAttemptId(userId: string, clientAttemptId: string): Promise<AttemptRecord | null>;
  createAttempt(input: {
    userId: string;
    clientAttemptId: string;
    examId: string;
    examSkillId: string;
    mode: AttemptMode;
    limitMinutes: number | null;
    startedAt: Date;
    deadlineAt: Date | null;
  }): Promise<AttemptRecord>;
  getAttempt(id: string): Promise<AttemptRecord | null>;
  resolveSectionId(attempt: AttemptRecord, partIndex: number): Promise<string | null>;
  listRecordings(skillAttemptId: string): Promise<RecordingRecord[]>;
  getRecording(skillAttemptId: string, questionKey: string): Promise<RecordingRecord | null>;
  upsertRecording(input: UpsertRecordingInput): Promise<RecordingRecord | null>;
  confirmRecording(skillAttemptId: string, questionKey: string, size: number, now: Date): Promise<boolean>;
  completeAttempt(input: {
    attempt: AttemptRecord;
    completedAt: Date;
    durationSeconds: number;
    contentExpiresAt: Date;
  }): Promise<AttemptRecord | null>;
  hasGradingRequest(skillAttemptId: string): Promise<boolean>;
  // Xóa lượt và mọi hàng liên quan trong một transaction; trả danh sách file cần xóa khỏi storage.
  // Chỉ xóa lượt chưa COMPLETED và chưa có yêu cầu chấm; lượt COMPLETED trả reason 'COMPLETED'.
  deleteAttempt(
    attempt: AttemptRecord
  ): Promise<{ deleted: boolean; paths: string[]; reason?: 'SUBMITTED' | 'COMPLETED' }>;
  // Chỉ để xem trước (job không --apply).
  listExpiredContent(now: Date, limit: number): Promise<ExpiredAttempt[]>;
  // Dọn dẹp hai bước: (1) đổi trạng thái DB có điều kiện, hàng bản ghi chuyển DELETED nhưng GIỮ audio_path và trả
  // đường dẫn; (2) service xóa file rồi gọi clearDeletedPaths. Xóa file lỗi thì audio_path còn nguyên để lần sau thử lại.
  claimExpiredContent(now: Date, limit: number): Promise<ExpiredAttempt[]>;
  claimStaleInProgress(olderThan: Date, now: Date, limit: number): Promise<ExpiredAttempt[]>;
  // Hàng DELETED còn audio_path (lần xóa file trước bị lỗi).
  listPendingFileDeletes(limit: number): Promise<ExpiredAttempt[]>;
  clearDeletedPaths(skillAttemptId: string, paths: string[]): Promise<void>;
};

type AttemptRow = {
  id: string;
  parentAttemptId: string;
  userId: string;
  examSkillId: string;
  mode: string | null;
  status: string;
  startedAt: Date;
  deadlineAt: Date | null;
  completedAt: Date | null;
  contentExpiresAt: Date | null;
  contentStatus: string;
  durationSeconds: number | null;
};

const attemptColumns = Prisma.sql`sa.id, sa.attempt_id AS "parentAttemptId", a.user_id AS "userId",
  sa.exam_skill_id AS "examSkillId", sa.mode, sa.status, sa.started_at AS "startedAt", sa.deadline_at AS "deadlineAt",
  sa.completed_at AS "completedAt", sa.content_expires_at AS "contentExpiresAt", sa.content_status AS "contentStatus",
  sa.duration_seconds AS "durationSeconds"`;
// Chỉ lượt của kỹ năng Speaking mới đi qua module này.
const attemptFrom = Prisma.sql`public.skill_attempts sa
  JOIN public.attempts a ON a.id = sa.attempt_id
  JOIN public.exam_skills k ON k.id = sa.exam_skill_id AND k.skill = 'SPEAKING'`;

function toAttempt(row: AttemptRow): AttemptRecord {
  return {
    ...row,
    mode: row.mode === 'REAL' || row.mode === 'PRACTICE' ? row.mode : null,
    status: row.status as AttemptStatus,
  };
}

type RecordingRow = {
  id: string;
  skillAttemptId: string;
  sectionId: string;
  orderNo: number;
  questionKey: string;
  status: string;
  audioPath: string;
  mimeType: string | null;
  durationSeconds: string | number | null;
  size: string | number | null;
};

const recordingColumns = Prisma.sql`sc.id, sc.skill_attempt_id AS "skillAttemptId", sc.section_id AS "sectionId",
  s.order_no AS "orderNo", sc.question_key AS "questionKey", sc.recording_status AS status, sc.audio_path AS "audioPath",
  sc.file_type AS "mimeType", sc.audio_duration::float8 AS "durationSeconds", sc.file_size::float8 AS size`;
const recordingFrom = Prisma.sql`public.submission_contents sc JOIN public.exam_sections s ON s.id = sc.section_id`;

function toRecording(row: RecordingRow): RecordingRecord {
  return {
    id: row.id,
    skillAttemptId: row.skillAttemptId,
    sectionId: row.sectionId,
    partIndex: row.orderNo - 1,
    questionKey: row.questionKey,
    status: row.status === 'UPLOADED' ? 'UPLOADED' : 'PENDING',
    audioPath: row.audioPath,
    mimeType: row.mimeType,
    durationMs: Math.round(Number(row.durationSeconds ?? 0) * 1000),
    size: Number(row.size ?? 0),
  };
}

export function createAttemptsRepository(db: typeof prisma = prisma): AttemptsRepository {
  const getById = async (client: Pick<typeof prisma, '$queryRaw'>, id: string) => {
    const [row] = await client.$queryRaw<AttemptRow[]>`
      SELECT ${attemptColumns} FROM ${attemptFrom} WHERE sa.id = ${id}::uuid`;
    return row ? toAttempt(row) : null;
  };

  return {
    async findPublishedSpeakingSkill(examSkillId) {
      // Không select đáp án/bằng chứng; Speaking chỉ cần văn bản câu hỏi và cấu hình Part.
      const skill = await db.exam_skills.findFirst({
        where: { id: examSkillId, skill: 'SPEAKING', status: 'PUBLISHED', exam: { exam_set: { status: 'PUBLISHED' } } },
        select: {
          id: true,
          exam_id: true,
          duration_minutes: true,
          exam: { select: { title: true } },
          sections: {
            orderBy: { order_no: 'asc' },
            select: {
              order_no: true,
              title: true,
              section_type: true,
              instruction: true,
              content: true,
              config: true,
              groups: {
                orderBy: { order_no: 'asc' },
                select: {
                  order_no: true,
                  question_type: true,
                  questions: { orderBy: { order_no: 'asc' }, select: { order_no: true, question_type: true, content: true } },
                },
              },
            },
          },
        },
      });
      if (!skill) return null;
      return {
        id: skill.id,
        examId: skill.exam_id,
        examTitle: skill.exam.title,
        durationMinutes: skill.duration_minutes,
        sections: skill.sections as unknown as RawSection[],
      };
    },

    async findByClientAttemptId(userId, clientAttemptId) {
      const [row] = await db.$queryRaw<AttemptRow[]>`
        SELECT ${attemptColumns} FROM ${attemptFrom}
        WHERE a.user_id = ${userId}::uuid AND a.client_attempt_id = ${clientAttemptId}::uuid`;
      return row ? toAttempt(row) : null;
    },

    async createAttempt(input) {
      return db.$transaction(async (tx) => {
        const inserted = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO public.attempts (user_id, exam_id, attempt_type, selected_scope, status, started_at, client_attempt_id)
          VALUES (${input.userId}::uuid, ${input.examId}::uuid, 'FULL_SKILL', '{}'::jsonb, 'IN_PROGRESS',
            ${input.startedAt}::timestamptz, ${input.clientAttemptId}::uuid)
          ON CONFLICT (user_id, client_attempt_id) DO NOTHING
          RETURNING id`;
        if (inserted[0]) {
          await tx.$executeRaw`
            INSERT INTO public.skill_attempts (attempt_id, exam_skill_id, status, started_at, deadline_at, mode, time_limit_minutes)
            VALUES (${inserted[0].id}::uuid, ${input.examSkillId}::uuid, 'IN_PROGRESS', ${input.startedAt}::timestamptz,
              ${input.deadlineAt}::timestamptz, ${input.mode}, ${input.limitMinutes}::integer)`;
        }
        // Gọi đồng thời cùng clientAttemptId: bên thua đợi bên thắng commit rồi đọc lại hàng cũ.
        const [row] = await tx.$queryRaw<AttemptRow[]>`
          SELECT ${attemptColumns} FROM ${attemptFrom}
          WHERE a.user_id = ${input.userId}::uuid AND a.client_attempt_id = ${input.clientAttemptId}::uuid`;
        // Không đọc lại được: mã đã dùng cho lượt không phải Speaking (attemptFrom chỉ lấy Speaking).
        if (!row) throw new HttpError(409, 'CLIENT_ATTEMPT_ID_CONFLICT', 'Mã lượt làm đã được dùng cho lượt khác.');
        return toAttempt(row);
      });
    },

    getAttempt: (id) => getById(db, id),

    async resolveSectionId(attempt, partIndex) {
      const [row] = await db.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM public.exam_sections WHERE exam_skill_id = ${attempt.examSkillId}::uuid AND order_no = ${partIndex + 1}`;
      return row?.id ?? null;
    },

    async listRecordings(skillAttemptId) {
      const rows = await db.$queryRaw<RecordingRow[]>`
        SELECT ${recordingColumns} FROM ${recordingFrom}
        WHERE sc.skill_attempt_id = ${skillAttemptId}::uuid AND sc.audio_path IS NOT NULL
          AND sc.recording_status IN ('PENDING', 'UPLOADED') AND sc.question_key <> ''
        ORDER BY s.order_no, sc.updated_at`;
      return rows.map(toRecording);
    },

    async getRecording(skillAttemptId, questionKey) {
      const [row] = await db.$queryRaw<RecordingRow[]>`
        SELECT ${recordingColumns} FROM ${recordingFrom}
        WHERE sc.skill_attempt_id = ${skillAttemptId}::uuid AND sc.question_key = ${questionKey}
          AND sc.audio_path IS NOT NULL AND sc.recording_status IN ('PENDING', 'UPLOADED')`;
      return row ? toRecording(row) : null;
    },

    async upsertRecording(input) {
      const rows = await db.$queryRaw<Array<{ id: string }>>`
        INSERT INTO public.submission_contents AS sc
          (skill_attempt_id, section_id, question_key, audio_path, file_type, file_size, audio_duration, recording_status, updated_at)
        VALUES (${input.skillAttemptId}::uuid, ${input.sectionId}::uuid, ${input.questionKey}, ${input.audioPath},
          ${input.mimeType}, ${input.size}::bigint, ${input.durationMs / 1000}::numeric, 'PENDING', ${input.now}::timestamptz)
        ON CONFLICT (skill_attempt_id, question_key) WHERE question_key <> '' DO UPDATE SET
          audio_path = EXCLUDED.audio_path, file_type = EXCLUDED.file_type, file_size = EXCLUDED.file_size,
          audio_duration = EXCLUDED.audio_duration, recording_status = 'PENDING', updated_at = EXCLUDED.updated_at
        WHERE ${input.overwrite}::boolean OR sc.recording_status IS DISTINCT FROM 'UPLOADED'
        RETURNING sc.id`;
      if (!rows[0]) return null;
      const [row] = await db.$queryRaw<RecordingRow[]>`
        SELECT ${recordingColumns} FROM ${recordingFrom} WHERE sc.id = ${rows[0].id}::uuid`;
      return row ? toRecording(row) : null;
    },

    async confirmRecording(skillAttemptId, questionKey, size, now) {
      const count = await db.$executeRaw`
        UPDATE public.submission_contents SET recording_status = 'UPLOADED', file_size = ${size}::bigint,
          updated_at = ${now}::timestamptz
        WHERE skill_attempt_id = ${skillAttemptId}::uuid AND question_key = ${questionKey} AND audio_path IS NOT NULL
          AND recording_status IN ('PENDING', 'UPLOADED')`;
      return count > 0;
    },

    async completeAttempt({ attempt, completedAt, durationSeconds, contentExpiresAt }) {
      return db.$transaction(async (tx) => {
        const count = await tx.$executeRaw`
          UPDATE public.skill_attempts SET status = 'COMPLETED', completed_at = ${completedAt}::timestamptz,
            duration_seconds = ${durationSeconds}::integer, initial_expires_at = ${contentExpiresAt}::timestamptz,
            content_expires_at = ${contentExpiresAt}::timestamptz, content_status = 'AVAILABLE'
          WHERE id = ${attempt.id}::uuid AND status = 'IN_PROGRESS'`;
        if (count > 0) {
          await tx.$executeRaw`
            UPDATE public.attempts SET status = 'COMPLETED', completed_at = ${completedAt}::timestamptz
            WHERE id = ${attempt.parentAttemptId}::uuid AND status = 'IN_PROGRESS'`;
        }
        return getById(tx, attempt.id);
      });
    },

    async hasGradingRequest(skillAttemptId) {
      const [row] = await db.$queryRaw<Array<{ found: boolean }>>`
        SELECT EXISTS (SELECT 1 FROM public.grading_requests WHERE skill_attempt_id = ${skillAttemptId}::uuid) AS found`;
      return row?.found === true;
    },

    async deleteAttempt(attempt) {
      return db.$transaction(async (tx) => {
        // Khóa hàng để không chạy đua với complete: chỉ lượt chưa COMPLETED mới hủy được.
        const [cur] = await tx.$queryRaw<Array<{ status: string }>>`
          SELECT status FROM public.skill_attempts WHERE id = ${attempt.id}::uuid FOR UPDATE`;
        if (!cur) return { deleted: true, paths: [] };
        if (cur.status === 'COMPLETED') return { deleted: false, paths: [], reason: 'COMPLETED' as const };
        const [req] = await tx.$queryRaw<Array<{ found: boolean }>>`
          SELECT EXISTS (SELECT 1 FROM public.grading_requests WHERE skill_attempt_id = ${attempt.id}::uuid) AS found`;
        if (req?.found) return { deleted: false, paths: [], reason: 'SUBMITTED' as const };
        const files = await tx.$queryRaw<Array<{ path: string }>>`
          DELETE FROM public.submission_contents WHERE skill_attempt_id = ${attempt.id}::uuid RETURNING audio_path AS path`;
        await tx.$executeRaw`DELETE FROM public.attempt_answers WHERE skill_attempt_id = ${attempt.id}::uuid`;
        await tx.$executeRaw`DELETE FROM public.attempt_section_states WHERE skill_attempt_id = ${attempt.id}::uuid`;
        await tx.$executeRaw`DELETE FROM public.skill_attempts WHERE id = ${attempt.id}::uuid`;
        await tx.$executeRaw`
          DELETE FROM public.attempts a WHERE a.id = ${attempt.parentAttemptId}::uuid
            AND NOT EXISTS (SELECT 1 FROM public.skill_attempts x WHERE x.attempt_id = a.id)`;
        return { deleted: true, paths: files.map((f) => f.path).filter(Boolean) };
      });
    },

    async listExpiredContent(now, limit) {
      // BR-CONTENT-002: không xóa khi còn yêu cầu chấm đang chờ/đã phân công.
      return withPaths(db, await db.$queryRaw<Array<{ id: string }>>`
        SELECT sa.id FROM ${attemptFrom}
        WHERE sa.status = 'COMPLETED' AND sa.content_status = 'AVAILABLE' AND sa.content_expires_at <= ${now}::timestamptz
          AND NOT EXISTS (SELECT 1 FROM public.grading_requests g WHERE g.skill_attempt_id = sa.id
            AND g.status IN ('WAITING_ASSIGNMENT', 'ASSIGNED'))
        ORDER BY sa.content_expires_at LIMIT ${limit}`);
    },

    async claimExpiredContent(now, limit) {
      // BR-CONTENT-002: không xóa khi còn yêu cầu chấm đang chờ/đã phân công. Điều kiện nằm ngay trong UPDATE.
      return db.$transaction(async (tx) => {
        const claimed = await tx.$queryRaw<Array<{ id: string }>>`
          UPDATE public.skill_attempts sa SET content_status = 'DELETED', content_deleted_at = ${now}::timestamptz
          WHERE sa.id IN (
              SELECT x.id FROM public.skill_attempts x WHERE x.status = 'COMPLETED' AND x.content_status = 'AVAILABLE'
                AND x.content_expires_at <= ${now}::timestamptz
                AND NOT EXISTS (SELECT 1 FROM public.grading_requests g WHERE g.skill_attempt_id = x.id
                  AND g.status IN ('WAITING_ASSIGNMENT', 'ASSIGNED'))
              ORDER BY x.content_expires_at LIMIT ${limit} FOR UPDATE SKIP LOCKED)
            AND sa.status = 'COMPLETED' AND sa.content_status = 'AVAILABLE'
            AND NOT EXISTS (SELECT 1 FROM public.grading_requests g WHERE g.skill_attempt_id = sa.id
              AND g.status IN ('WAITING_ASSIGNMENT', 'ASSIGNED'))
          RETURNING sa.id`;
        return markContentRows(tx, claimed.map((r) => r.id), now);
      });
    },

    async claimStaleInProgress(olderThan, now, limit) {
      return db.$transaction(async (tx) => {
        const claimed = await tx.$queryRaw<Array<{ id: string; attemptId: string }>>`
          UPDATE public.skill_attempts sa SET status = 'ABANDONED', content_status = 'DELETED',
            content_deleted_at = ${now}::timestamptz
          WHERE sa.id IN (
              SELECT x.id FROM public.skill_attempts x WHERE x.status = 'IN_PROGRESS'
                AND x.started_at <= ${olderThan}::timestamptz
                AND NOT EXISTS (SELECT 1 FROM public.grading_requests g WHERE g.skill_attempt_id = x.id
                  AND g.status IN ('WAITING_ASSIGNMENT', 'ASSIGNED'))
              ORDER BY x.started_at LIMIT ${limit} FOR UPDATE SKIP LOCKED)
            AND sa.status = 'IN_PROGRESS'
          RETURNING sa.id, sa.attempt_id AS "attemptId"`;
        if (claimed.length > 0) {
          await tx.$executeRaw`
            UPDATE public.attempts SET status = 'ABANDONED'
            WHERE id = ANY(${claimed.map((r) => r.attemptId)}::uuid[]) AND status = 'IN_PROGRESS'`;
        }
        return markContentRows(tx, claimed.map((r) => r.id), now);
      });
    },

    async listPendingFileDeletes(limit) {
      const rows = await db.$queryRaw<Array<{ id: string; paths: string[] }>>`
        SELECT skill_attempt_id AS id, array_agg(audio_path) AS paths FROM public.submission_contents
        WHERE recording_status = 'DELETED' AND audio_path IS NOT NULL
        GROUP BY skill_attempt_id ORDER BY min(updated_at) LIMIT ${limit}`;
      return rows.map((r) => ({ id: r.id, paths: r.paths }));
    },

    async clearDeletedPaths(skillAttemptId, paths) {
      if (paths.length === 0) return;
      await db.$executeRaw`
        UPDATE public.submission_contents SET audio_path = NULL
        WHERE skill_attempt_id = ${skillAttemptId}::uuid AND recording_status = 'DELETED'
          AND audio_path = ANY(${paths}::text[])`;
    },
  };
}

// Bản ghi của các lượt vừa claim: xóa nội dung chữ, chuyển DELETED, giữ audio_path (đến khi xóa file xong).
async function markContentRows(tx: Pick<typeof prisma, '$queryRaw'>, ids: string[], now: Date): Promise<ExpiredAttempt[]> {
  if (ids.length === 0) return [];
  const rows = await tx.$queryRaw<Array<{ id: string; path: string | null }>>`
    UPDATE public.submission_contents SET text_content = NULL, recording_status = 'DELETED', updated_at = ${now}::timestamptz
    WHERE skill_attempt_id = ANY(${ids}::uuid[]) RETURNING skill_attempt_id AS id, audio_path AS path`;
  return ids.map((id) => ({ id, paths: rows.filter((r) => r.id === id && r.path).map((r) => r.path as string) }));
}

async function withPaths(db: typeof prisma, rows: Array<{ id: string }>): Promise<ExpiredAttempt[]> {
  const result: ExpiredAttempt[] = [];
  for (const row of rows) {
    const files = await db.$queryRaw<Array<{ path: string }>>`
      SELECT audio_path AS path FROM public.submission_contents
      WHERE skill_attempt_id = ${row.id}::uuid AND audio_path IS NOT NULL`;
    result.push({ id: row.id, paths: files.map((f) => f.path) });
  }
  return result;
}
