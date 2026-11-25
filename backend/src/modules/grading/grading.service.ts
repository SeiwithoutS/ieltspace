import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { lockAccountWrites } from '../../shared/account-write-lock.js';
import { writeAudit } from '../../shared/audit.js';
import { HttpError } from '../../utils/http.js';

export type GradingSkill = 'WRITING' | 'SPEAKING';
type Status = 'WAITING_ASSIGNMENT' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
type CancelReason = 'ASSIGNMENT_TIMEOUT' | 'TEACHER_UNAVAILABLE' | 'LEARNER_DELETED';
type Request = {
  id: string; attemptId: string; status: Status; assignmentDeadline: Date; requestedAt: Date;
  cancelReason: CancelReason | null;
};
type PermissionInput = { canGrade: boolean; isAccepting: boolean; maxPending: number };
type Tx = Prisma.TransactionClient;

const requestColumns = Prisma.sql`g.id, g.skill_attempt_id AS "attemptId", g.status, g.assignment_deadline AS "assignmentDeadline",
  g.requested_at AS "requestedAt", g.cancel_reason AS "cancelReason"`;
const requestSource = Prisma.sql`public.grading_requests g JOIN public.skill_attempts k ON k.id=g.skill_attempt_id
  JOIN public.attempts a ON a.id=k.attempt_id JOIN public.exam_skills e ON e.id=k.exam_skill_id`;
const ws = Prisma.sql`e.skill IN ('WRITING','SPEAKING')`;
const notFound = () => new HttpError(404, 'ATTEMPT_NOT_FOUND', 'Không tìm thấy bài làm.');

async function latestRequest(db: Tx, attemptId: string) {
  const [row] = await db.$queryRaw<Request[]>`SELECT ${requestColumns} FROM public.grading_requests g
    WHERE g.skill_attempt_id=${attemptId}::uuid ORDER BY (g.status<>'CANCELLED') DESC,g.requested_at DESC,g.id DESC LIMIT 1`;
  return row ?? null;
}

async function weekWindow(db: Tx, at: Date) {
  const [week] = await db.$queryRaw<{ monday: string; start: Date; end: Date; bonusEnd: Date }[]>`
    WITH w AS (SELECT date_trunc('week', ${at}::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS monday)
    SELECT monday::text AS monday, monday::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS start,
      (monday+7)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "end",
      (monday+14)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS "bonusEnd" FROM w`;
  return week;
}

async function assertRole(db: Tx, id: string, role: 'ADMIN' | 'LEARNER') {
  const [user] = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM public.users WHERE id=${id}::uuid AND role=${role} AND status='ACTIVE'`;
  if (!user) throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền thực hiện thao tác này.');
}

export async function revokeIfIdle(tx: Tx, teacherId: string, skill: GradingSkill) {
  await tx.$executeRaw`UPDATE public.teacher_permissions p SET status='REVOKED', updated_at=clock_timestamp()
    WHERE p.teacher_id=${teacherId}::uuid AND p.skill=${skill} AND p.status='PENDING_REVOKE'
      AND NOT EXISTS (SELECT 1 FROM ${requestSource} WHERE g.teacher_id=p.teacher_id AND e.skill=p.skill AND g.status='ASSIGNED')`;
}

type Cancellable = { id: string; attemptId: string; ownerId: string; teacherId: string | null; skill: GradingSkill };
const cancelColumns = Prisma.sql`g.id,k.id AS "attemptId",a.user_id AS "ownerId",g.teacher_id AS "teacherId",e.skill`;

async function cancelAndRefund(tx: Tx, row: Cancellable, at: Date, reason: 'ASSIGNMENT_TIMEOUT' | 'TEACHER_UNAVAILABLE',
  actorId: string | null = null, note: string | null = null) {
  const previous = reason === 'ASSIGNMENT_TIMEOUT' ? 'WAITING_ASSIGNMENT' : 'ASSIGNED';
  const changed = await tx.$executeRaw`UPDATE public.grading_requests SET status='CANCELLED',
    cancel_reason=${reason}, cancelled_at=${at}::timestamptz, cancelled_by=${actorId}::uuid, cancel_note=${note}
    WHERE id=${row.id}::uuid AND status=${previous}`;
  if (!changed) return false;
  const week = await weekWindow(tx, at);
  const [bonus] = await tx.$queryRaw<{ id: string }[]>`
    INSERT INTO public.support_credits(user_id,credit_type,valid_from,expires_at)
    VALUES (${row.ownerId}::uuid,'BONUS',${at}::timestamptz,${week.bonusEnd}::timestamptz) RETURNING id`;
  await tx.$executeRaw`INSERT INTO public.credit_refunds(grading_request_id,bonus_credit_id,status,refunded_at)
    VALUES (${row.id}::uuid,${bonus.id}::uuid,'COMPLETED',${at}::timestamptz)`;
  await tx.$executeRaw`UPDATE public.skill_attempts SET content_status='AVAILABLE',
    content_expires_at=COALESCE(initial_expires_at,content_expires_at,completed_at + interval '14 days')
    WHERE id=${row.attemptId}::uuid AND content_status='HELD'`;
  if (row.teacherId) await revokeIfIdle(tx, row.teacherId, row.skill);
  if (actorId) await writeAudit(tx, { actorId, action: 'GRADING_TEACHER_UNAVAILABLE', entityType: 'USER',
    entityId: row.teacherId, reason: note, changeData: { requestId: row.id, skill: row.skill, bonusId: bonus.id } });
  return true;
}

export function createGradingService(db: typeof prisma = prisma, clock?: () => Date) {
  async function currentTime(client: Tx) {
    return clock?.() ?? (await client.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`)[0].now;
  }

  // Cùng thứ tự khóa với sửa/xóa tài khoản. Khóa lượt riêng vẫn cần để đồng bộ với job dọn và ghi audio.
  function write<T>(run: (tx: Tx, now: Date) => Promise<T>) {
    return db.$transaction(async tx => {
      await lockAccountWrites(tx);
      return run(tx, await currentTime(tx));
    }, { timeout: 10_000 });
  }

  return {
    async balance(userId: string) {
      await assertRole(db, userId, 'LEARNER');
      const now = await currentTime(db);
      const week = await weekWindow(db, now);
      const [row] = await db.$queryRaw<{ freeUsed: boolean; bonusCount: number; bonusExpires: Date | null }[]>`
        SELECT COALESCE(bool_or(used_at IS NOT NULL) FILTER (WHERE credit_type='FREE_WEEKLY' AND week_start=${week.monday}::date),false) AS "freeUsed",
          count(*) FILTER (WHERE credit_type='BONUS' AND used_at IS NULL AND valid_from<=${now}::timestamptz AND expires_at>${now}::timestamptz)::int AS "bonusCount",
          min(expires_at) FILTER (WHERE credit_type='BONUS' AND used_at IS NULL AND valid_from<=${now}::timestamptz AND expires_at>${now}::timestamptz) AS "bonusExpires"
        FROM public.support_credits WHERE user_id=${userId}::uuid AND (week_start=${week.monday}::date OR expires_at>${now}::timestamptz)`;
      return { free: { count: row.freeUsed ? 0 : 1, expiresAt: week.end },
        bonus: { count: row.bonusCount, expiresAt: row.bonusExpires } };
    },

    async requestStatus(userId: string, attemptId: string) {
      const [owned] = await db.$queryRaw<{ id: string }[]>`SELECT k.id FROM public.skill_attempts k
        JOIN public.attempts a ON a.id=k.attempt_id JOIN public.exam_skills e ON e.id=k.exam_skill_id
        JOIN public.users u ON u.id=a.user_id
        WHERE k.id=${attemptId}::uuid AND u.id=${userId}::uuid AND u.status='ACTIVE' AND u.role='LEARNER' AND ${ws}`;
      if (!owned) throw notFound();
      return latestRequest(db, attemptId);
    },

    submit(userId: string, attemptId: string, retryOf?: string) {
      return write(async tx => {
        await assertRole(tx, userId, 'LEARNER');
        const [attempt] = await tx.$queryRaw<{ status: string; contentStatus: string; expiresAt: Date | null; skill: GradingSkill }[]>`
          SELECT k.status,k.content_status AS "contentStatus",k.content_expires_at AS "expiresAt",e.skill
          FROM public.skill_attempts k JOIN public.attempts a ON a.id=k.attempt_id JOIN public.exam_skills e ON e.id=k.exam_skill_id
          WHERE k.id=${attemptId}::uuid AND a.user_id=${userId}::uuid AND ${ws} FOR UPDATE OF k`;
        if (!attempt) throw notFound();
        const now = await currentTime(tx);
        const last = await latestRequest(tx, attemptId);
        if (last?.status === 'COMPLETED') throw new HttpError(409, 'GRADING_ALREADY_GRADED', 'Bài này đã có kết quả chấm.');
        if (last && (last.status !== 'CANCELLED' || last.id !== retryOf)) return { created: false, request: last };
        if (!last && retryOf) throw new HttpError(409, 'GRADING_REQUEST_CHANGED', 'Yêu cầu đã thay đổi. Hãy tải lại bài làm.');
        if (attempt.status !== 'COMPLETED') throw new HttpError(409, 'ATTEMPT_NOT_COMPLETED', 'Hãy hoàn thành và lưu bài trước khi gửi chấm.');
        if (attempt.contentStatus !== 'AVAILABLE' || !attempt.expiresAt || attempt.expiresAt <= now) {
          throw new HttpError(410, 'CONTENT_EXPIRED', 'Bài đã hết hạn lưu và không thể gửi chấm.');
        }
        const [content] = await tx.$queryRaw<{ pending: boolean; usable: boolean }[]>`
          SELECT COALESCE(bool_or(recording_status='PENDING'),false) AS pending,
            COALESCE(bool_or(CASE WHEN ${attempt.skill}='WRITING' THEN text_content ~ '[^[:space:]]' AND recording_status IS DISTINCT FROM 'DELETED'
              ELSE recording_status='UPLOADED' AND NULLIF(audio_path,'') IS NOT NULL END),false) AS usable
          FROM public.submission_contents WHERE skill_attempt_id=${attemptId}::uuid`;
        if (content.pending) throw new HttpError(409, 'RECORDINGS_PENDING', 'Bản ghi chưa tải lên xong. Hãy thử lại sau khi tải xong.');
        if (!content.usable) throw new HttpError(409, 'GRADING_CONTENT_MISSING', 'Bài chưa có bài viết hoặc bản ghi đã lưu để chấm.');

        const week = await weekWindow(tx, now);
        await tx.$executeRaw`INSERT INTO public.support_credits(user_id,credit_type,week_start,valid_from,expires_at)
          VALUES (${userId}::uuid,'FREE_WEEKLY',${week.monday}::date,${week.start}::timestamptz,${week.end}::timestamptz)
          ON CONFLICT (user_id,week_start) WHERE credit_type='FREE_WEEKLY' DO NOTHING`;
        const [used] = await tx.$queryRaw<{ id: string }[]>`
          UPDATE public.support_credits SET used_at=${now}::timestamptz WHERE id=(SELECT id FROM public.support_credits
            WHERE user_id=${userId}::uuid AND used_at IS NULL AND valid_from<=${now}::timestamptz AND expires_at>${now}::timestamptz
              AND (credit_type='BONUS' OR week_start=${week.monday}::date)
            ORDER BY expires_at,credit_type='FREE_WEEKLY' DESC,id LIMIT 1 FOR UPDATE) RETURNING id`;
        if (!used) throw new HttpError(409, 'NO_GRADING_CREDIT', 'Bạn đã hết lượt hỗ trợ chấm còn hiệu lực.');
        const [request] = await tx.$queryRaw<Request[]>`
          INSERT INTO public.grading_requests AS g(skill_attempt_id,used_credit_id,requested_at,assignment_deadline)
          VALUES (${attemptId}::uuid,${used.id}::uuid,${now}::timestamptz,${now}::timestamptz + interval '72 hours')
          RETURNING ${requestColumns}`;
        await tx.$executeRaw`UPDATE public.skill_attempts SET content_status='HELD' WHERE id=${attemptId}::uuid`;
        return { created: true, request };
      });
    },

    assignNext() {
      return write(async (tx, now) => {
        const [pair] = await tx.$queryRaw<{ id: string; permissionId: string; teacherId: string }[]>`
          SELECT g.id,choice.id AS "permissionId",choice.teacher_id AS "teacherId" FROM ${requestSource}
          JOIN public.users owner ON owner.id=a.user_id AND owner.status='ACTIVE' AND owner.role='LEARNER'
          CROSS JOIN LATERAL (
            SELECT p.id,p.teacher_id FROM public.teacher_permissions p JOIN public.users u ON u.id=p.teacher_id
              CROSS JOIN LATERAL (SELECT count(*) AS pending FROM ${requestSource}
                WHERE g.teacher_id=p.teacher_id AND g.status='ASSIGNED' AND e.skill=p.skill) load
            WHERE p.skill=e.skill AND p.status='ACTIVE' AND p.is_accepting AND u.role='TEACHER' AND u.status='ACTIVE'
              AND load.pending<p.max_pending
            ORDER BY load.pending,p.last_assigned_at NULLS FIRST,p.teacher_id LIMIT 1
          ) choice
          WHERE ${ws} AND g.status='WAITING_ASSIGNMENT' AND g.assignment_deadline>${now}::timestamptz
            AND k.status='COMPLETED' AND k.content_status='HELD'
          ORDER BY g.requested_at,g.id LIMIT 1`;
        if (!pair) return false;
        const assignedAt = await currentTime(tx);
        const updated = await tx.$executeRaw`UPDATE public.grading_requests
          SET status='ASSIGNED',teacher_id=${pair.teacherId}::uuid,assigned_at=${assignedAt}::timestamptz
          WHERE id=${pair.id}::uuid AND status='WAITING_ASSIGNMENT' AND assignment_deadline>${assignedAt}::timestamptz`;
        if (!updated) return false;
        await tx.$executeRaw`UPDATE public.teacher_permissions SET last_assigned_at=${assignedAt}::timestamptz
          WHERE id=${pair.permissionId}::uuid`;
        return true;
      });
    },

    expireNext() {
      return write(async (tx, now) => {
        const [row] = await tx.$queryRaw<Cancellable[]>`
          SELECT ${cancelColumns} FROM ${requestSource} JOIN public.users owner ON owner.id=a.user_id
          WHERE ${ws} AND g.status='WAITING_ASSIGNMENT' AND g.assignment_deadline<=${now}::timestamptz AND owner.status<>'DELETED'
          ORDER BY g.assignment_deadline,g.id LIMIT 1`;
        return row ? cancelAndRefund(tx, row, now, 'ASSIGNMENT_TIMEOUT') : false;
      });
    },

    cancelAssigned(actorId: string, teacherId: string, requestId: string, note: string) {
      return write(async (tx, now) => {
        await assertRole(tx, actorId, 'ADMIN');
        const [row] = await tx.$queryRaw<(Cancellable & { status: Status; reason: CancelReason | null; ownerStatus: string })[]>`
          SELECT ${cancelColumns},g.status,g.cancel_reason AS reason,owner.status AS "ownerStatus"
          FROM ${requestSource} JOIN public.users owner ON owner.id=a.user_id
          WHERE g.id=${requestId}::uuid AND g.teacher_id=${teacherId}::uuid AND ${ws}`;
        if (!row) throw new HttpError(404, 'GRADING_REQUEST_NOT_FOUND', 'Không tìm thấy bài được giao cho giáo viên này.');
        if (row.status === 'CANCELLED' && row.reason === 'TEACHER_UNAVAILABLE') return { cancelled: true };
        if (row.status !== 'ASSIGNED' || row.ownerStatus === 'DELETED' ||
            !await cancelAndRefund(tx, row, now, 'TEACHER_UNAVAILABLE', actorId, note)) {
          throw new HttpError(409, 'GRADING_REQUEST_CHANGED', 'Bài này không còn ở trạng thái đang giao.');
        }
        return { cancelled: true };
      });
    },

    savePermission(actorId: string, teacherId: string, skill: GradingSkill, input: PermissionInput) {
      return write(async (tx, now) => {
        await assertRole(tx, actorId, 'ADMIN');
        const [teacher] = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM public.users WHERE id=${teacherId}::uuid AND role='TEACHER' AND status IN ('ACTIVE','LOCKED')`;
        if (!teacher) throw new HttpError(404, 'TEACHER_NOT_FOUND', 'Không tìm thấy giáo viên.');
        const [load] = await tx.$queryRaw<{ assigned: number }[]>`
          SELECT count(*)::int AS assigned FROM ${requestSource} WHERE g.teacher_id=${teacherId}::uuid AND e.skill=${skill} AND g.status='ASSIGNED'`;
        const status = input.canGrade ? 'ACTIVE' : load.assigned > 0 ? 'PENDING_REVOKE' : 'REVOKED';
        const accepting = input.canGrade && input.isAccepting;
        const changed = await tx.$executeRaw`INSERT INTO public.teacher_permissions AS p(teacher_id,skill,max_pending,is_accepting,status,updated_at)
          VALUES (${teacherId}::uuid,${skill},${input.maxPending},${accepting},${status},${now}::timestamptz)
          ON CONFLICT (teacher_id,skill) DO UPDATE SET max_pending=EXCLUDED.max_pending,is_accepting=EXCLUDED.is_accepting,
            status=EXCLUDED.status,updated_at=EXCLUDED.updated_at
          WHERE (p.max_pending,p.is_accepting,p.status) IS DISTINCT FROM (EXCLUDED.max_pending,EXCLUDED.is_accepting,EXCLUDED.status)`;
        if (changed) await writeAudit(tx, { actorId, action: 'GRADING_PERMISSION_CHANGED', entityType: 'USER', entityId: teacherId,
          changeData: { skill, status, accepting, maxPending: input.maxPending } });
        return { skill, status, accepting, maxPending: input.maxPending, assigned: load.assigned };
      });
    },
  };
}
