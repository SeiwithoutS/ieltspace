import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import { readWsSections } from '../attempts/attempts.schemas.js';
import type { GradingSkill } from './grading.service.js';

type QueueRow = {
  id: string; skill: GradingSkill; title: string; status: string; scope: unknown; requestedAt: Date; assignmentDeadline: Date;
  assignedAt: Date | null; teacherName: string | null; cancelReason: string | null; cancelledAt: Date | null; bonusExpiresAt: Date | null;
};

export async function listGradingRequests(db: typeof prisma, filters: { teacherId?: string; status: string; page: number }) {
  const { teacherId, status, page } = filters;
  const size = 20;
  const rows = await db.$queryRaw<QueueRow[]>`
    SELECT g.id,e.skill,concat_ws(' · ',es.name,ex.title) AS title,g.status,a.selected_scope AS scope,
      g.requested_at AS "requestedAt",g.assignment_deadline AS "assignmentDeadline",g.assigned_at AS "assignedAt",
      t.full_name AS "teacherName",g.cancel_reason AS "cancelReason",g.cancelled_at AS "cancelledAt",bonus.expires_at AS "bonusExpiresAt"
    FROM public.grading_requests g JOIN public.skill_attempts k ON k.id=g.skill_attempt_id JOIN public.attempts a ON a.id=k.attempt_id
      JOIN public.exam_skills e ON e.id=k.exam_skill_id JOIN public.exams ex ON ex.id=a.exam_id JOIN public.exam_sets es ON es.id=ex.exam_set_id
      LEFT JOIN public.users t ON t.id=g.teacher_id LEFT JOIN public.credit_refunds r ON r.grading_request_id=g.id AND r.status='COMPLETED'
      LEFT JOIN public.support_credits bonus ON bonus.id=r.bonus_credit_id
    WHERE g.status=${status} AND e.skill IN ('WRITING','SPEAKING')
      ${teacherId ? Prisma.sql`AND g.teacher_id=${teacherId}::uuid` : Prisma.empty}
    ORDER BY CASE WHEN g.status='CANCELLED' THEN g.cancelled_at END DESC NULLS LAST,g.requested_at,g.id
    LIMIT ${size + 1} OFFSET ${(page - 1) * size}`;
  return { items: rows.slice(0, size).map(({ scope, ...row }) => ({ ...row, sections: readWsSections(scope) })),
    nextPage: rows.length > size ? page + 1 : null };
}

type TeacherLoadRow = {
  teacherId: string; name: string; accountStatus: string; skill: GradingSkill; status: 'ACTIVE' | 'PENDING_REVOKE' | 'REVOKED';
  accepting: boolean; maxPending: number | null; assigned: number; lastAssignedAt: Date | null;
};

export async function listTeacherLoads(db: typeof prisma, teacherId?: string, page = 1) {
  const size = 20;
  const rows = await db.$queryRaw<TeacherLoadRow[]>`
    WITH teachers AS (
      SELECT id,full_name,status FROM public.users WHERE role='TEACHER' AND status IN ('ACTIVE','LOCKED')
        ${teacherId ? Prisma.sql`AND id=${teacherId}::uuid` : Prisma.empty}
      ORDER BY lower(full_name),id LIMIT ${size + 1} OFFSET ${(page - 1) * size}
    ), loads AS (
      SELECT g.teacher_id,e.skill,count(*)::int AS assigned FROM public.grading_requests g JOIN teachers t ON t.id=g.teacher_id
        JOIN public.skill_attempts k ON k.id=g.skill_attempt_id JOIN public.exam_skills e ON e.id=k.exam_skill_id
      WHERE g.status='ASSIGNED' GROUP BY g.teacher_id,e.skill
    )
    SELECT t.id AS "teacherId",t.full_name AS name,t.status AS "accountStatus",s.skill,COALESCE(p.status,'REVOKED') AS status,
      COALESCE(p.is_accepting AND p.status='ACTIVE',false) AS accepting,p.max_pending AS "maxPending",COALESCE(l.assigned,0) AS assigned,
      p.last_assigned_at AS "lastAssignedAt"
    FROM teachers t CROSS JOIN (VALUES ('WRITING'),('SPEAKING')) s(skill)
      LEFT JOIN public.teacher_permissions p ON p.teacher_id=t.id AND p.skill=s.skill
      LEFT JOIN loads l ON l.teacher_id=t.id AND l.skill=s.skill
    ORDER BY lower(t.full_name),t.id,s.skill DESC`;
  if (teacherId && rows.length === 0) throw new HttpError(404, 'TEACHER_NOT_FOUND', 'Không tìm thấy giáo viên.');
  return { items: rows.slice(0, size * 2), nextPage: rows.length > size * 2 ? page + 1 : null };
}

type TeacherQueueRow = { id: string; title: string; learner: string; skill: GradingSkill; requestedAt: Date; assignedAt: Date;
  selectedScope: unknown; section: number | null; hasDraft: boolean; assignmentDeadline: Date; teacherName: string };

export async function listTeacherQueue(db: typeof prisma, teacherId: string, filters: {
  page: number; skill?: GradingSkill; q?: string; sort?: 'oldest' | 'newest';
}, size = 20) {
  const order = filters.sort === 'newest' ? Prisma.sql`DESC` : Prisma.sql`ASC`;
  const rows = await db.$queryRaw<(TeacherQueueRow & { total: number; drafts: number })[]>`
    WITH work AS (
    SELECT g.id,concat_ws(' · ',es.name,ex.title) AS title,u.full_name AS learner,e.skill,
      g.requested_at AS "requestedAt",g.assigned_at AS "assignedAt",a.selected_scope AS "selectedScope",s.order_no AS section,
      g.assignment_deadline AS "assignmentDeadline",t.full_name AS "teacherName",
      EXISTS (SELECT 1 FROM public.grading_reviews r WHERE r.grading_request_id=g.id AND r.teacher_id=g.teacher_id AND r.status='DRAFT') AS "hasDraft"
    FROM public.grading_requests g JOIN public.skill_attempts k ON k.id=g.skill_attempt_id JOIN public.attempts a ON a.id=k.attempt_id
      JOIN public.users u ON u.id=a.user_id JOIN public.users t ON t.id=g.teacher_id JOIN public.exam_skills e ON e.id=k.exam_skill_id
      JOIN public.exams ex ON ex.id=e.exam_id JOIN public.exam_sets es ON es.id=ex.exam_set_id
      LEFT JOIN public.exam_sections s ON s.id=k.section_id
    WHERE g.teacher_id=${teacherId}::uuid AND g.status='ASSIGNED' AND e.skill IN ('WRITING','SPEAKING')
      ${filters.skill ? Prisma.sql`AND e.skill=${filters.skill}` : Prisma.empty}
      ${filters.q ? Prisma.sql`AND strpos(lower(u.full_name),lower(${filters.q}))>0` : Prisma.empty}
    )
    SELECT *, count(*) OVER ()::int AS total, count(*) FILTER (WHERE "hasDraft") OVER ()::int AS drafts FROM work
    ORDER BY COALESCE("assignedAt","requestedAt") ${order},id ${order}
    LIMIT ${size + 1} OFFSET ${(filters.page - 1) * size}`;
  return { items: rows.slice(0, size).map(({ selectedScope, section, total, drafts, ...row }) => ({
    ...row, status: 'ASSIGNED', cancelReason: null, cancelledAt: null, bonusExpiresAt: null,
    sections: readWsSections(selectedScope) ?? (section === null ? null : [section]),
  })), total: rows[0]?.total ?? 0, drafts: rows[0]?.drafts ?? 0, nextPage: rows.length > size ? filters.page + 1 : null };
}

const historySource = Prisma.sql`public.grading_reviews r JOIN public.grading_requests g ON g.id=r.grading_request_id AND g.status='COMPLETED'
  JOIN public.skill_attempts k ON k.id=g.skill_attempt_id JOIN public.attempts a ON a.id=k.attempt_id
  JOIN public.users u ON u.id=a.user_id JOIN public.exam_skills e ON e.id=k.exam_skill_id`;
const historyOwner = (teacherId: string) => Prisma.sql`r.status='PUBLISHED' AND r.teacher_id=${teacherId}::uuid AND g.teacher_id=${teacherId}::uuid`;

async function teacherHistoryTotals(db: typeof prisma, teacherId: string) {
  const [totals] = await db.$queryRaw<{ week: number; month: number; writing: number; speaking: number }[]>`
    WITH bounds AS (SELECT date_trunc('week',now() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh' AS week_start,
      date_trunc('month',now() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh' AS month_start)
    SELECT count(*) FILTER (WHERE r.published_at>=week_start)::int AS week,
      count(*) FILTER (WHERE r.published_at>=month_start)::int AS month,
      count(*) FILTER (WHERE r.published_at>=month_start AND e.skill='WRITING')::int AS writing,
      count(*) FILTER (WHERE r.published_at>=month_start AND e.skill='SPEAKING')::int AS speaking
    FROM ${historySource} CROSS JOIN bounds WHERE ${historyOwner(teacherId)}`;
  return totals;
}

export async function getTeacherOverview(db: typeof prisma, teacherId: string) {
  const [queue, { items: loads }, history, rubric] = await Promise.all([
    listTeacherQueue(db, teacherId, { page: 1 }, 3), listTeacherLoads(db, teacherId), teacherHistoryTotals(db, teacherId),
    db.$queryRaw<{ skill: GradingSkill; name: string; minimum: number; maximum: number; step: number }[]>`
      SELECT r.skill,c.name,c.min_score::float8 AS minimum,c.max_score::float8 AS maximum,c.score_step::float8 AS step
      FROM (SELECT DISTINCT ON(skill) id,skill FROM public.grading_rules
        WHERE skill IN ('WRITING','SPEAKING') AND assessment_scope='FULL_SKILL' ORDER BY skill,version DESC) r
      JOIN public.rubric_criteria c ON c.grading_rule_id=r.id ORDER BY r.skill,c.order_no`,
  ]);
  return { items: queue.items, assigned: queue.total, drafts: queue.drafts, publishedThisWeek: history.week, loads, rubric };
}

type HistoryRow = { id: string; learner: string; title: string; skill: GradingSkill; selectedScope: unknown; overall: number;
  publishedAt: Date; expiresAt: Date | null; expired: boolean; scope: 'FULL_SKILL' | 'SECTION'; numbers: number[] };

type HistoryPeriod = { days: number; from?: never; to?: never } | { days?: never; from: string; to: string };
export async function listTeacherHistory(db: typeof prisma, teacherId: string, filters: { skill?: GradingSkill; q?: string } & HistoryPeriod) {
  const period = filters.from && filters.to
    ? Prisma.sql`r.published_at>=(${filters.from}::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
      AND r.published_at<((${filters.to}::date+1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')`
    : Prisma.sql`r.published_at>=now()-(${filters.days} * interval '1 day')`;
  const [rows, totals] = await Promise.all([
    db.$queryRaw<HistoryRow[]>`SELECT g.id,u.full_name AS learner,concat_ws(' · ',es.name,ex.title) AS title,e.skill,
      a.selected_scope AS "selectedScope",r.overall_score::float8 AS overall,r.published_at AS "publishedAt",
      k.content_expires_at AS "expiresAt",(k.content_status IN ('DELETED','EXPIRED') OR k.content_expires_at<=now()) AS expired,
      rule.assessment_scope AS scope,ARRAY(SELECT DISTINCT s.order_no FROM public.grading_scores sc
        JOIN public.exam_sections s ON s.id=sc.section_id WHERE sc.grading_review_id=r.id ORDER BY s.order_no) AS numbers
      FROM ${historySource} JOIN public.exams ex ON ex.id=a.exam_id JOIN public.exam_sets es ON es.id=ex.exam_set_id
        JOIN public.grading_rules rule ON rule.id=r.grading_rule_id
      WHERE ${historyOwner(teacherId)} AND ${period}
        ${filters.skill ? Prisma.sql`AND e.skill=${filters.skill}` : Prisma.empty}
        ${filters.q ? Prisma.sql`AND strpos(lower(u.full_name),lower(${filters.q}))>0` : Prisma.empty}
      ORDER BY r.published_at DESC,g.id DESC`,
    teacherHistoryTotals(db, teacherId),
  ]);
  return { items: rows.map(({ selectedScope, numbers, ...row }) => ({ ...row, sections: readWsSections(selectedScope) ?? (numbers.length ? numbers : null) })),
    totals };
}
