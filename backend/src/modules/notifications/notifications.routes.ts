import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireFreshAuth } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { readGradingNotificationTarget } from './grading-notifications.js';

const id = z.string().uuid();
const filters = z.object({ unread: z.literal('1').optional(), after: id.optional() }).strict();
const pageSize = 20;

type Notification = {
  id: string;
  type: string;
  title: string;
  content: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
  readAt: Date | null;
};

export const notificationsRouter = Router();
notificationsRouter.use(requireFreshAuth, (_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});

notificationsRouter.get('/', asyncHandler(async (req, res) => {
  const parsed = filters.safeParse(req.query);
  if (!parsed.success) throw new HttpError(400, 'INVALID_NOTIFICATION_FILTER', 'Bộ lọc thông báo không hợp lệ.');
  const recipient = req.appUser!.id;
  const { after, unread } = parsed.data;
  const items = await prisma.$queryRaw<Notification[]>`
    SELECT n.id, n.type, n.title, n.content, n.reference_type AS "referenceType", n.reference_id AS "referenceId",
      n.created_at AS "createdAt", n.read_at AS "readAt"
    FROM public.notifications n WHERE n.recipient_id = ${recipient}::uuid
    ${unread ? Prisma.sql`AND n.read_at IS NULL` : Prisma.empty}
    ${after ? Prisma.sql`AND (n.created_at, n.id) < (
      SELECT c.created_at, c.id FROM public.notifications c
      WHERE c.recipient_id = ${recipient}::uuid AND c.id = ${after}::uuid
    )` : Prisma.empty}
    ORDER BY n.created_at DESC, n.id DESC LIMIT ${pageSize + 1}
  `;
  res.json({ items: items.slice(0, pageSize), nextCursor: items.length > pageSize ? items[pageSize - 1].id : null });
}));

notificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  const [result] = await prisma.$queryRaw<{ unread: number }[]>`
    SELECT count(*)::int AS unread FROM public.notifications
    WHERE recipient_id = ${req.appUser!.id}::uuid AND read_at IS NULL
  `;
  res.json(result);
}));

notificationsRouter.get('/:id/target', asyncHandler(async (req, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success) throw new HttpError(400, 'INVALID_NOTIFICATION', 'Mã thông báo không hợp lệ.');
  const user = req.appUser!;
  res.json(await readGradingNotificationTarget(parsed.data, user.id, user.role));
}));

notificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success) throw new HttpError(400, 'INVALID_NOTIFICATION', 'Mã thông báo không hợp lệ.');
  const [item] = await prisma.$queryRaw<{ readAt: Date }[]>`
    UPDATE public.notifications SET read_at = coalesce(read_at, now())
    WHERE id = ${parsed.data}::uuid AND recipient_id = ${req.appUser!.id}::uuid
    RETURNING read_at AS "readAt"
  `;
  if (!item) throw new HttpError(404, 'NOTIFICATION_NOT_FOUND', 'Không tìm thấy thông báo.');
  res.json(item);
}));

notificationsRouter.post('/read-all', asyncHandler(async (req, res) => {
  await prisma.$executeRaw`
    UPDATE public.notifications SET read_at = now()
    WHERE recipient_id = ${req.appUser!.id}::uuid AND read_at IS NULL
  `;
  res.sendStatus(204);
}));
