import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireFreshAuth, requireRole } from '../../middleware/auth.js';
import { writeAudit } from '../../shared/audit.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { dispatchAnnouncement, lockNotificationAdmin } from './announcements.js';
import { gradingTemplates, listGradingSettings, validGradingTemplate, type GradingEvent } from './grading-notifications.js';

const uuid = z.string().uuid();
const revision = z.number().int().min(0).max(2_147_483_646);
const plain = (limit: number) => z.string().trim().min(1).max(limit).refine(value => !value.includes('\0'));
const draft = z.object({ title: plain(200), content: plain(3000), audience: z.enum(['ALL','LEARNER','TEACHER']) });
const delivery = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('now'), revision }).strict(),
  z.object({ mode: z.literal('scheduled'), revision, scheduledAt: z.string().datetime({ offset: true }) }).strict(),
]);
const settings = z.object({ title: plain(200), content: plain(3000), enabled: z.boolean(),
  leadHours: z.number().int().min(1).max(168).nullable(), revision }).strict();
type Announcement = {
  id: string; title: string; content: string; audience: string; status: string; revision: number;
  scheduledAt: Date | null; sentAt: Date | null; recipientCount: number | null; createdAt: Date;
};
const fields = Prisma.sql`id,title,content,audience,status,revision,scheduled_at AS "scheduledAt",sent_at AS "sentAt",
  recipient_count AS "recipientCount",created_at AS "createdAt"`;
const pageSize = 20;
function invalid(message: string): never {
  throw new HttpError(400, 'INVALID_NOTIFICATION_INPUT', message);
}
function conflict(): never {
  throw new HttpError(409, 'NOTIFICATION_CHANGED', 'Dữ liệu vừa thay đổi. Hãy tải lại trước khi lưu.');
}

export const announcementAdminRouter = Router();
announcementAdminRouter.use(requireFreshAuth, requireRole('ADMIN'), (_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});

announcementAdminRouter.get('/announcements', asyncHandler(async (req, res) => {
  const query = z.object({ after: uuid.optional() }).strict().safeParse(req.query);
  if (!query.success) invalid('Trang thông báo không hợp lệ.');
  const { after } = query.data;
  const rows = await prisma.$queryRaw<Announcement[]>`
    SELECT ${fields} FROM public.announcements
    ${after ? Prisma.sql`WHERE (created_at,id)<(SELECT created_at,id FROM public.announcements WHERE id=${after}::uuid)` : Prisma.empty}
    ORDER BY created_at DESC,id DESC LIMIT ${pageSize+1}
  `;
  res.json({ items: rows.slice(0, pageSize), nextCursor: rows.length>pageSize ? rows[pageSize-1].id : null });
}));

announcementAdminRouter.post('/announcements', asyncHandler(async (req, res) => {
  const input = draft.extend({ requestId: uuid }).strict().safeParse(req.body);
  if (!input.success) invalid('Nhập tiêu đề, nội dung và nhóm nhận hợp lệ.');
  const { title, content, audience, requestId } = input.data;
  const actorId = req.appUser!.id;
  const result = await prisma.$transaction(async tx => {
    await lockNotificationAdmin(tx, actorId);
    const [created] = await tx.$queryRaw<Announcement[]>`
      INSERT INTO public.announcements(created_by,request_id,title,content,audience)
      VALUES(${actorId}::uuid,${requestId}::uuid,${title},${content},${audience})
      ON CONFLICT(created_by,request_id) DO NOTHING RETURNING ${fields}
    `;
    if (created) {
      await writeAudit(tx, { actorId, action: 'ANNOUNCEMENT_CREATED', entityType: 'ANNOUNCEMENT', entityId: created.id });
      return { item: created, created: true };
    }
    const [existing] = await tx.$queryRaw<Announcement[]>`
      SELECT ${fields} FROM public.announcements WHERE created_by=${actorId}::uuid AND request_id=${requestId}::uuid
    `;
    if (!existing || existing.title !== title || existing.content !== content || existing.audience !== audience) conflict();
    return { item: existing, created: false };
  });
  res.status(result.created ? 201 : 200).json(result.item);
}));

announcementAdminRouter.patch('/announcements/:id', asyncHandler(async (req, res) => {
  const id = uuid.safeParse(req.params.id);
  const input = draft.extend({ revision }).strict().safeParse(req.body);
  if (!id.success || !input.success) invalid('Thông tin bản nháp không hợp lệ.');
  const actorId = req.appUser!.id;
  const { title, content, audience, revision: expected } = input.data;
  const item = await prisma.$transaction(async tx => {
    await lockNotificationAdmin(tx, actorId);
    const [saved] = await tx.$queryRaw<Announcement[]>`
      UPDATE public.announcements SET title=${title},content=${content},audience=${audience},revision=revision+1
      WHERE id=${id.data}::uuid AND status='DRAFT' AND revision=${expected} RETURNING ${fields}
    `;
    if (!saved) conflict();
    await writeAudit(tx, { actorId, action: 'ANNOUNCEMENT_DRAFT_UPDATED', entityType: 'ANNOUNCEMENT', entityId: saved.id,
      changeData: { audience, revision: saved.revision } });
    return saved;
  });
  res.json(item);
}));

announcementAdminRouter.post('/announcements/:id/send', asyncHandler(async (req, res) => {
  const id = uuid.safeParse(req.params.id);
  const input = delivery.safeParse(req.body);
  if (!id.success || !input.success) invalid('Lịch gửi thông báo không hợp lệ.');
  const actorId = req.appUser!.id;
  const when = input.data.mode === 'scheduled' ? input.data.scheduledAt : null;
  const item = await prisma.$transaction(async tx => {
    await lockNotificationAdmin(tx, actorId);
    const [current] = await tx.$queryRaw<Announcement[]>`
      SELECT ${fields} FROM public.announcements WHERE id=${id.data}::uuid FOR UPDATE
    `;
    if (!current) throw new HttpError(404, 'ANNOUNCEMENT_NOT_FOUND', 'Không tìm thấy thông báo chung.');
    if (current.status !== 'DRAFT') return current;
    if (current.revision !== input.data.revision) conflict();
    const [queued] = await tx.$queryRaw<Announcement[]>`
      UPDATE public.announcements SET status='SCHEDULED',scheduled_at=coalesce(${when}::timestamptz,now()),revision=revision+1
      WHERE id=${current.id}::uuid AND (${when}::timestamptz IS NULL OR ${when}::timestamptz>now()) RETURNING ${fields}
    `;
    if (!queued) invalid('Chọn thời điểm gửi trong tương lai.');
    await writeAudit(tx, { actorId, action: 'ANNOUNCEMENT_QUEUED', entityType: 'ANNOUNCEMENT', entityId: queued.id,
      changeData: { audience: queued.audience, scheduledAt: queued.scheduledAt } });
    return queued;
  });
  if (input.data.mode === 'now' && item.status === 'SCHEDULED') {
    try {
      await dispatchAnnouncement(item.id);
    } catch {
      console.error('Immediate announcement delivery failed. The item remains queued.');
    }
    const [latest] = await prisma.$queryRaw<Announcement[]>`SELECT ${fields} FROM public.announcements WHERE id=${item.id}::uuid`;
    res.status(latest.status === 'SENT' ? 200 : 202).json(latest);
    return;
  }
  res.status(item.status === 'SENT' ? 200 : 202).json(item);
}));

announcementAdminRouter.get('/settings', asyncHandler(async (_req, res) => {
  res.json({ items: await listGradingSettings() });
}));

announcementAdminRouter.patch('/settings/:event', asyncHandler(async (req, res) => {
  const event = req.params.event as GradingEvent;
  const parsed = settings.safeParse(req.body);
  if (!Object.hasOwn(gradingTemplates, event) || !parsed.success) invalid('Cài đặt thông báo không hợp lệ.');
  const { title, content, enabled, leadHours, revision: expected } = parsed.data;
  if (!validGradingTemplate(event, title) || !validGradingTemplate(event, content)) invalid('Mẫu có biến không được hỗ trợ.');
  if (event === 'CONTENT_EXPIRING' ? leadHours === null : (!enabled || leadHours !== null)) {
    invalid('Giữ bật sự kiện bắt buộc và chỉ đặt thời gian cho nhắc hết hạn.');
  }
  const actorId = req.appUser!.id;
  await prisma.$transaction(async tx => {
    await lockNotificationAdmin(tx, actorId);
    const changed = expected === 0 ? await tx.$executeRaw`
      INSERT INTO public.notification_settings(event_type,title_template,body_template,enabled,lead_hours,revision,updated_by)
      VALUES(${event},${title},${content},${enabled},${leadHours},1,${actorId}::uuid)
      ON CONFLICT(event_type) DO NOTHING
    ` : await tx.$executeRaw`
      UPDATE public.notification_settings SET title_template=${title},body_template=${content},enabled=${enabled},
        lead_hours=${leadHours},revision=revision+1,updated_by=${actorId}::uuid,updated_at=now()
      WHERE event_type=${event} AND revision=${expected}
    `;
    if (!changed) conflict();
    await writeAudit(tx, { actorId, action: 'NOTIFICATION_SETTINGS_UPDATED', entityType: 'NOTIFICATION_SETTINGS',
      changeData: { event, enabled, leadHours, revision: expected + 1 } });
  });
  res.json({ event, title, content, enabled, leadHours, revision: expected+1,
    required: event !== 'CONTENT_EXPIRING', variables: gradingTemplates[event][2] });
}));
