import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import { recordNotification } from './notification-events.js';

export const gradingTemplates = {
  GRADING_REQUEST_ACCEPTED: ['Yêu cầu chấm {{skill}} đã được tiếp nhận', 'Bạn có thể theo dõi yêu cầu trong ứng dụng.', ['skill']],
  GRADING_ASSIGNED: ['Bạn có bài {{skill}} cần chấm', 'Một yêu cầu chấm đã được giao cho bạn.', ['skill']],
  GRADING_RESULT_PUBLISHED: ['Đã công bố kết quả {{skill}}', 'Kết quả chấm của bạn đã được công bố.', ['skill']],
  GRADING_CANCELLED_REFUNDED: ['Yêu cầu chấm {{skill}} đã hủy', 'Lượt chấm đã được hoàn vào tài khoản của bạn.', ['skill']],
  GRADING_CANCELLED: ['Yêu cầu chấm {{skill}} đã hủy', 'Bạn có thể xem trạng thái trong ứng dụng.', ['skill']],
  CONTENT_EXPIRING: ['Bài {{skill}} sắp hết hạn lưu', 'Nội dung được lưu đến {{expiresAt}} (giờ Việt Nam).', ['skill', 'expiresAt']],
} as const;
export type GradingEvent = keyof typeof gradingTemplates;
type RequestEvent = Exclude<GradingEvent, 'CONTENT_EXPIRING'>;
type TemplateValue = { title: string; content: string; enabled: boolean; leadHours: number | null; revision: number };
type TemplateRow = TemplateValue & { event: GradingEvent };
const placeholders = /\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g;

export function validGradingTemplate(event: GradingEvent, value: string) {
  const names: readonly string[] = gradingTemplates[event][2];
  return [...value.matchAll(placeholders)].every(match => names.includes(match[1])) &&
    !/[{}]/.test(value.replace(placeholders, ''));
}

function defaults(event: GradingEvent): TemplateValue {
  const [title, content] = gradingTemplates[event];
  return { title, content, enabled: true, leadHours: event === 'CONTENT_EXPIRING' ? 24 : null, revision: 0 };
}

export async function listGradingSettings() {
  const rows = await prisma.$queryRaw<TemplateRow[]>`
    SELECT event_type AS event,title_template AS title,body_template AS content,enabled,lead_hours AS "leadHours",revision
    FROM public.notification_settings
  `;
  return (Object.keys(gradingTemplates) as GradingEvent[]).map(event => ({
    ...(rows.find(row => row.event === event) ?? defaults(event)), event,
    variables: gradingTemplates[event][2], required: event !== 'CONTENT_EXPIRING',
  }));
}

async function getTemplate(tx: Prisma.TransactionClient, event: GradingEvent) {
  const [template] = await tx.$queryRaw<TemplateValue[]>`
    SELECT title_template AS title,body_template AS content,enabled,lead_hours AS "leadHours",revision
    FROM public.notification_settings WHERE event_type=${event}
  `;
  return template ?? defaults(event);
}

function render(template: string, variables: Record<string, string>, max: number) {
  return template.replace(placeholders, (_match, name: string) => variables[name] ?? '').slice(0, max);
}

function message(template: TemplateValue, variables: Record<string, string>) {
  return { title: render(template.title, variables, 200), content: render(template.content, variables, 3000) };
}

// Call inside the transaction that commits the grading transition.
export async function recordGradingTransition(tx: Prisma.TransactionClient, event: RequestEvent, requestId: string) {
  const [request] = await tx.$queryRaw<{
    owner: string; teacher: string | null; skill: string; status: string; reason: string | null; published: boolean; refunded: boolean;
  }[]>`
    SELECT a.user_id AS owner,g.teacher_id AS teacher,e.skill,g.status,g.cancel_reason AS reason,
      EXISTS(SELECT 1 FROM public.grading_reviews v WHERE v.grading_request_id=g.id AND v.status='PUBLISHED') AS published,
      EXISTS(SELECT 1 FROM public.credit_refunds c WHERE c.grading_request_id=g.id AND c.status='COMPLETED') AS refunded
    FROM public.grading_requests g JOIN public.skill_attempts k ON k.id=g.skill_attempt_id
    JOIN public.attempts a ON a.id=k.attempt_id JOIN public.exam_skills e ON e.id=k.exam_skill_id
    WHERE g.id=${requestId}::uuid AND e.skill IN ('WRITING','SPEAKING')
  `;
  if (!request || request.reason === 'LEARNER_DELETED') return;
  const ready = {
    GRADING_REQUEST_ACCEPTED: request.status === 'WAITING_ASSIGNMENT',
    GRADING_ASSIGNED: request.status === 'ASSIGNED' && !!request.teacher,
    GRADING_RESULT_PUBLISHED: request.status === 'COMPLETED' && request.published,
    GRADING_CANCELLED_REFUNDED: request.status === 'CANCELLED' && request.refunded,
    GRADING_CANCELLED: request.status === 'CANCELLED' && !request.refunded &&
      request.reason !== 'ASSIGNMENT_TIMEOUT' && request.reason !== 'TEACHER_UNAVAILABLE',
  };
  if (!ready[event]) return;
  const recipientId = event === 'GRADING_ASSIGNED' ? request.teacher! : request.owner;
  const template = await getTemplate(tx, event);
  await recordNotification(tx, { recipientId, recipientRole: event === 'GRADING_ASSIGNED' ? 'TEACHER' : 'LEARNER',
    key: `grading:${requestId}:${event}`, type: event,
    referenceType: 'GRADING_REQUEST', referenceId: requestId,
    ...message(template, { skill: request.skill === 'WRITING' ? 'Writing' : 'Speaking' }),
  });
}

export async function dispatchExpiryReminders() {
  return prisma.$transaction(async tx => {
    const event = 'CONTENT_EXPIRING';
    const template = await getTemplate(tx, event);
    if (!template.enabled) return 0;
    type Due = { id: string; owner: string; skill: string; expiresAt: string; key: string };
    const eligible = Prisma.sql`
      SELECT k.id,a.user_id AS owner,e.skill,
        to_char(k.content_expires_at AT TIME ZONE 'Asia/Ho_Chi_Minh','DD/MM/YYYY HH24:MI') AS "expiresAt",
        'content-expiring:' || k.id || ':' || extract(epoch from k.content_expires_at)::text AS key
      FROM public.skill_attempts k JOIN public.attempts a ON a.id=k.attempt_id
      JOIN public.exam_skills e ON e.id=k.exam_skill_id JOIN public.users u ON u.id=a.user_id
      WHERE e.skill IN ('WRITING','SPEAKING') AND k.status='COMPLETED' AND k.content_status='AVAILABLE'
        AND u.status='ACTIVE' AND u.role='LEARNER'
        AND k.content_expires_at>now() AND k.content_expires_at<=now()+${template.leadHours ?? 24}::int*interval '1 hour'
        AND EXISTS (SELECT 1 FROM public.submission_contents c WHERE c.skill_attempt_id=k.id
          AND (c.text_content IS NOT NULL OR c.audio_path IS NOT NULL))
        AND NOT EXISTS(SELECT 1 FROM public.grading_requests g WHERE g.skill_attempt_id=k.id
          AND g.status IN ('WAITING_ASSIGNMENT','ASSIGNED'))
        AND NOT EXISTS(SELECT 1 FROM public.notifications n WHERE n.recipient_id=a.user_id
          AND n.event_key='content-expiring:' || k.id || ':' || extract(epoch from k.content_expires_at)::text)
    `;
    const due = await tx.$queryRaw<Due[]>`
      ${eligible} ORDER BY k.content_expires_at,k.id LIMIT 50
    `;
    let processed = 0;
    for (const candidate of due) {
      // Account deletion locks the user before modifying submissions.
      const [owner] = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM public.users WHERE id=${candidate.owner}::uuid AND status='ACTIVE' AND role='LEARNER' FOR SHARE
      `;
      if (!owner) continue;
      const [row] = await tx.$queryRaw<Due[]>`
        ${eligible} AND k.id=${candidate.id}::uuid AND a.user_id=${owner.id}::uuid FOR UPDATE OF k SKIP LOCKED
      `;
      if (!row) continue;
      await recordNotification(tx, { recipientId: row.owner, recipientRole: 'LEARNER', key: row.key, type: event,
        referenceType: 'SKILL_ATTEMPT', referenceId: row.id,
        ...message(template, { skill: row.skill === 'WRITING' ? 'Writing' : 'Speaking', expiresAt: row.expiresAt }),
      });
      processed++;
    }
    return processed;
  });
}

export async function readGradingNotificationTarget(notificationId: string, recipientId: string, role: string) {
  const [target] = await prisma.$queryRaw<{ skill: string; status: string; expiresAt: Date | null; expired: boolean }[]>`
    SELECT e.skill,coalesce(g.status,k.content_status) AS status,
      CASE WHEN k.content_status='AVAILABLE' THEN k.content_expires_at END AS "expiresAt",
      (k.content_status IN ('EXPIRED','DELETED') OR
        (k.content_status='AVAILABLE' AND k.content_expires_at<=now())) AS expired
    FROM public.notifications n
    LEFT JOIN public.grading_requests g ON n.reference_type='GRADING_REQUEST' AND g.id=n.reference_id
    JOIN public.skill_attempts k ON k.id=CASE WHEN n.reference_type='SKILL_ATTEMPT' THEN n.reference_id ELSE g.skill_attempt_id END
    JOIN public.attempts a ON a.id=k.attempt_id JOIN public.exam_skills e ON e.id=k.exam_skill_id
    WHERE n.id=${notificationId}::uuid AND n.recipient_id=${recipientId}::uuid
      AND e.skill IN ('WRITING','SPEAKING')
      AND ((${role}='LEARNER' AND a.user_id=n.recipient_id)
        OR (${role}='TEACHER' AND g.teacher_id=n.recipient_id AND g.status IN ('ASSIGNED','COMPLETED')))
  `;
  if (!target) throw new HttpError(404, 'NOTIFICATION_TARGET_NOT_FOUND', 'Không tìm thấy chi tiết thông báo.');
  if (target.expired) throw new HttpError(410, 'NOTIFICATION_TARGET_EXPIRED', 'Nội dung bài đã hết hạn lưu.');
  return { skill: target.skill, status: target.status, expiresAt: target.expiresAt };
}
