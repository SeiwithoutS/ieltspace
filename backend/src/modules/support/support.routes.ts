import { Prisma } from '@prisma/client';
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireFreshAuth, requireRole } from '../../middleware/auth.js';
import { writeAudit } from '../../shared/audit.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { recordNotification } from '../notifications/notification-events.js';

const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const;
type Status = typeof statuses[number];
const statusLabels: Record<Status, string> = {
  PENDING: 'Chờ tiếp nhận',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
};
const uuid = z.string().uuid();
const content = z.string().trim().max(3000).refine(value => !value.includes('\0'));
const createReport = z.object({ requestId: uuid, text: content.refine(Boolean) }).strict();
const changeReport = z.object({ status: z.enum(statuses), reply: content, revision: z.number().int().min(0).max(2_147_483_647) }).strict();
const listFilters = z.object({ status: z.enum(statuses).optional(), after: uuid.optional() }).strict();
const pageSize = 20;

type Report = {
  id: string;
  text: string;
  status: Status;
  reply: string | null;
  revision: number;
  createdAt: Date;
};

const reportFields = Prisma.sql`r.id, r.content AS text, r.status, r.reply, r.revision, r.created_at AS "createdAt"`;
const staffFields = Prisma.sql`, coalesce(nullif(u.display_name, ''), u.full_name) AS owner, u.email AS "ownerEmail"`;

async function listReports(req: Request, res: Response, admin: boolean) {
  const parsed = listFilters.safeParse(req.query);
  if (!parsed.success) throw new HttpError(400, 'INVALID_SUPPORT_FILTER', 'Bộ lọc báo cáo không hợp lệ.');
  const { status, after } = parsed.data;
  const owner = req.appUser!.id;
  const rows = await prisma.$queryRaw<Report[]>`
    SELECT ${reportFields} ${admin ? staffFields : Prisma.empty}
    FROM public.support_reports r ${admin ? Prisma.sql`JOIN public.users u ON u.id = r.owner_id` : Prisma.empty}
    WHERE true
    ${admin ? Prisma.empty : Prisma.sql`AND r.owner_id = ${owner}::uuid`}
    ${status ? Prisma.sql`AND r.status = ${status}` : Prisma.empty}
    ${after ? Prisma.sql`AND (r.created_at, r.id) < (
      SELECT c.created_at, c.id FROM public.support_reports c WHERE c.id = ${after}::uuid
      ${admin ? Prisma.empty : Prisma.sql`AND c.owner_id = ${owner}::uuid`}
    )` : Prisma.empty}
    ORDER BY r.created_at DESC, r.id DESC LIMIT ${pageSize + 1}
  `;

  const counts = admin ? await prisma.$queryRaw<{ status: Status; total: number }[]>`
    SELECT status, count(*)::int AS total FROM public.support_reports GROUP BY status
  ` : undefined;
  res.json({
    items: rows.slice(0, pageSize),
    nextCursor: rows.length > pageSize ? rows[pageSize - 1].id : null,
    counts: counts && Object.fromEntries(counts.map(row => [row.status, row.total])),
  });
}

export const supportRouter = Router();
export const adminSupportRouter = Router();
for (const router of [supportRouter, adminSupportRouter]) {
  router.use(requireFreshAuth, (_req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    next();
  });
}
supportRouter.use(requireRole('LEARNER', 'TEACHER'));
adminSupportRouter.use(requireRole('ADMIN'));

supportRouter.get('/', asyncHandler((req, res) => listReports(req, res, false)));
adminSupportRouter.get('/', asyncHandler((req, res) => listReports(req, res, true)));

supportRouter.get('/:id', asyncHandler(async (req, res) => {
  const id = uuid.safeParse(req.params.id);
  if (!id.success) throw new HttpError(400, 'INVALID_SUPPORT_REPORT', 'Mã báo cáo không hợp lệ.');
  const [report] = await prisma.$queryRaw<Report[]>`
    SELECT ${reportFields} FROM public.support_reports r
    WHERE r.id = ${id.data}::uuid AND r.owner_id = ${req.appUser!.id}::uuid
  `;
  if (!report) throw new HttpError(404, 'SUPPORT_REPORT_NOT_FOUND', 'Không tìm thấy báo cáo.');
  res.json(report);
}));

supportRouter.post('/', asyncHandler(async (req, res) => {
  const parsed = createReport.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, 'INVALID_SUPPORT_REPORT', 'Nhập nội dung báo cáo, tối đa 3.000 ký tự.');
  const owner = req.appUser!.id;
  const { requestId, text } = parsed.data;
  const result = await prisma.$transaction(async tx => {
    const [sender] = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM public.users WHERE id = ${owner}::uuid AND status = 'ACTIVE'
        AND role IN ('LEARNER', 'TEACHER') FOR SHARE
    `;
    if (!sender) throw new HttpError(403, 'ACCOUNT_UNAVAILABLE', 'Tài khoản không được phép gửi báo cáo.');
    const [created] = await tx.$queryRaw<Report[]>`
      INSERT INTO public.support_reports AS r (owner_id, request_id, content)
      VALUES (${owner}::uuid, ${requestId}::uuid, ${text})
      ON CONFLICT (owner_id, request_id) DO NOTHING RETURNING ${reportFields}
    `;
    if (created) return { report: created, created: true };
    const [existing] = await tx.$queryRaw<Report[]>`
      SELECT ${reportFields} FROM public.support_reports r
      WHERE r.owner_id = ${owner}::uuid AND r.request_id = ${requestId}::uuid
    `;
    if (!existing || existing.text !== text) throw new HttpError(409, 'SUPPORT_REQUEST_CONFLICT', 'Lượt gửi đã được dùng cho nội dung khác.');
    return { report: existing, created: false };
  });
  res.status(result.created ? 201 : 200).json(result.report);
}));

adminSupportRouter.patch('/:id', asyncHandler(async (req, res) => {
  const id = uuid.safeParse(req.params.id);
  const parsed = changeReport.safeParse(req.body);
  if (!id.success || !parsed.success) throw new HttpError(400, 'INVALID_SUPPORT_UPDATE', 'Phản hồi hoặc trạng thái báo cáo không hợp lệ.');
  const actorId = req.appUser!.id;
  const { status, revision } = parsed.data;
  const reply = parsed.data.reply || null;
  const report = await prisma.$transaction(async tx => {
    const [actor] = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM public.users WHERE id = ${actorId}::uuid AND role = 'ADMIN' AND status = 'ACTIVE' FOR SHARE
    `;
    if (!actor) throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền xử lý báo cáo.');
    const [row] = await tx.$queryRaw<(Report & { ownerId: string })[]>`
      SELECT ${reportFields}, r.owner_id AS "ownerId" FROM public.support_reports r
      WHERE r.id = ${id.data}::uuid FOR UPDATE
    `;
    if (!row) throw new HttpError(404, 'SUPPORT_REPORT_NOT_FOUND', 'Không tìm thấy báo cáo.');
    const { ownerId, ...previous } = row;
    if (previous.status === status && previous.reply === reply) return previous;
    if (previous.revision !== revision) throw new HttpError(409, 'SUPPORT_REPORT_CHANGED', 'Báo cáo vừa thay đổi. Hãy tải lại trước khi lưu.');
    const [updated] = await tx.$queryRaw<Report[]>`
      UPDATE public.support_reports r SET status = ${status}, reply = ${reply}, revision = revision + 1, updated_at = now()
      WHERE r.id = ${previous.id}::uuid RETURNING ${reportFields}
    `;
    await tx.$executeRaw`
      INSERT INTO public.support_report_updates (report_id, revision, actor_id, previous_status, status, reply)
      VALUES (${updated.id}::uuid, ${updated.revision}, ${actorId}::uuid, ${previous.status}, ${status}, ${reply})
    `;
    await writeAudit(tx, {
      action: 'SUPPORT_REPORT_UPDATED', entityType: 'SUPPORT_REPORT', entityId: updated.id, actorId,
      changeData: { before: previous.status, after: status, replyChanged: previous.reply !== reply, revision: updated.revision },
    });
    const hasNewReply = reply !== null && previous.reply !== reply;
    if (hasNewReply || previous.status !== status) {
      await recordNotification(tx, {
        recipientId: ownerId, key: `support:${updated.id}:${updated.revision}`, type: 'SUPPORT_REPORT_UPDATED',
        title: hasNewReply ? 'Báo cáo hỗ trợ có phản hồi mới' : 'Báo cáo hỗ trợ đã cập nhật',
        content: `Trạng thái: ${statusLabels[status]}. Mở báo cáo để xem chi tiết.`,
        referenceType: 'SUPPORT_REPORT', referenceId: updated.id,
      });
    }
    return updated;
  });
  res.json(report);
}));
