import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { ownedAvatarReference, signAvatar } from '../../integrations/storage/avatar-storage.js';
import { prisma } from '../../lib/prisma.js';
import { createPrivilegedSupabaseClient } from '../../lib/supabase.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { listAccountAudit, listLoginHistory } from './account-history.js';
import { accountAction, retryAccountDeletion, updateAccount } from './account-actions.js';
import { authenticatorCode, verifyAdminAction } from '../auth/authenticator.js';
import { createStaffAccount, staffAccount } from './staff-accounts.js';
import { env } from '../../config.js';

const roles = ['LEARNER', 'TEACHER', 'ADMIN'] as const;
const statuses = ['ACTIVE', 'LOCKED', 'DELETED', 'INVITED'] as const;
const pageNumber = z.string().regex(/^[1-9]\d{0,8}$/).transform(Number).optional();
const listQuery = z.object({
  q: z.string().trim().max(150).optional(),
  role: z.enum(roles).optional(),
  status: z.enum(statuses).optional(),
  page: pageNumber,
  pageSize: z.string().regex(/^[1-9]\d?$/).transform(Number).pipe(z.number().max(50)).optional(),
}).strict();
const profileId = z.string().uuid();
const directoryColumns = Prisma.sql`id, full_name, display_name, email, role, status, created_at`;
type DirectoryUser = {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string | null;
  role: string;
  status: string;
  created_at: Date | string;
  last_login_at?: Date | string | null;
};
type DirectoryProfile = DirectoryUser & { auth_user_id: string | null; avatar_url: string | null; cleanup_pending: boolean };
type DirectoryPage = {
  total: number;
  page: number;
  items: DirectoryUser[];
  groups: { role: string; status: string; count: number }[];
};

function toDirectoryUser(user: DirectoryUser) {
  return {
    id: user.id,
    name: user.display_name?.trim() || user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: new Date(user.created_at).toISOString(),
    lastLoginAt: user.last_login_at ? new Date(user.last_login_at).toISOString() : null,
  };
}

async function readAuthDetails(id: string | null) {
  const client = id ? createPrivilegedSupabaseClient() : null;
  if (!id || !client) return { state: id ? 'unavailable' : 'missing' } as const;

  try {
    const { data, error } = await client.auth.admin.getUserById(id);
    if (error) {
      return { state: error.status === 404 || error.code === 'user_not_found' ? 'missing' : 'unavailable' } as const;
    }

    const user = data.user;
    if (!user) return { state: 'missing' } as const;
    const provider = user.app_metadata.provider;
    const source = user.app_metadata.ieltspace_staff_created === true ? 'STAFF'
      : user.invited_at || user.app_metadata.ieltspace_staff_invite === true ? 'INVITE'
      : provider === 'google' ? 'GOOGLE' : provider === 'email' ? 'EMAIL' : null;
    return {
      state: 'available',
      email: user.email || null,
      emailVerified: user.email ? Boolean(user.email_confirmed_at) : null,
      source,
      lastSignInAt: user.last_sign_in_at || null,
    } as const;
  } catch {
    return { state: 'unavailable' } as const;
  }
}

async function readAvatar(id: string, reference: string | null) {
  const path = ownedAvatarReference(reference, id);
  if (!path) return { url: null, unavailable: Boolean(reference) };
  try {
    return { url: await signAvatar(path), unavailable: false };
  } catch {
    return { url: null, unavailable: true };
  }
}

export const adminUsersRouter = Router();
adminUsersRouter.use((_req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
}, requireAuth, requireRole('ADMIN'));

adminUsersRouter.get('/', asyncHandler(async (req, res) => {
  const query = listQuery.safeParse(req.query);
  if (!query.success) throw new HttpError(400, 'INVALID_USER_FILTER', 'Bộ lọc người dùng không hợp lệ.');
  const { q, role, status, page: requestedPage = 1, pageSize = 20 } = query.data;
  const filters: Prisma.Sql[] = [];
  if (role) filters.push(Prisma.sql`role = ${role}`);
  if (status) filters.push(Prisma.sql`status = ${status}`);
  if (q) {
    // Treat PostgreSQL LIKE operators in a search term as literal characters.
    const match = '%' + q.replace(/[\\%_]/g, '\\$&') + '%';
    filters.push(Prisma.sql`(display_name ILIKE ${match} OR full_name ILIKE ${match} OR email ILIKE ${match})`);
  }
  const where = filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}` : Prisma.empty;

  const [{ total, page, items, groups }] = await prisma.$queryRaw<DirectoryPage[]>`
    WITH totals AS (
      SELECT count(*)::int AS total FROM public.users ${where}
    ), result_page AS (
      SELECT total, LEAST(${requestedPage}::int, GREATEST(1, (total - 1) / ${pageSize}::int + 1)) AS page
      FROM totals
    ), page_rows AS (
      SELECT ${directoryColumns} FROM public.users ${where}
      ORDER BY created_at DESC, id DESC LIMIT ${pageSize}
      OFFSET (SELECT (page - 1) * ${pageSize} FROM result_page)
    ), groups AS (
      SELECT role, status, count(*)::int AS count FROM public.users GROUP BY role, status
    )
    SELECT total, page,
      (SELECT COALESCE(jsonb_agg(to_jsonb(p) || jsonb_build_object('last_login_at', latest.created_at)
        ORDER BY p.created_at DESC, p.id DESC), '[]')
        FROM page_rows p
        LEFT JOIN LATERAL (
          SELECT created_at FROM public.user_login_events WHERE user_id = p.id ORDER BY created_at DESC, id DESC LIMIT 1
        ) latest ON true) AS items,
      (SELECT COALESCE(jsonb_agg(g), '[]') FROM groups g) AS groups
    FROM result_page
  `;
  const byRole = { LEARNER: 0, TEACHER: 0, ADMIN: 0 };
  const byStatus = { ACTIVE: 0, LOCKED: 0, DELETED: 0, INVITED: 0 };
  let all = 0;
  for (const { role, status, count } of groups) {
    all += count;
    if (Object.hasOwn(byRole, role)) byRole[role as keyof typeof byRole] += count;
    if (Object.hasOwn(byStatus, status)) byStatus[status as keyof typeof byStatus] += count;
  }
  res.json({ items: items.map(toDirectoryUser), page, pageSize, total, counts: { all, byRole, byStatus } });
}));

adminUsersRouter.post('/staff', asyncHandler(async (req, res) => {
  if (req.get('Origin') !== env.FRONTEND_ORIGIN) throw new HttpError(403, 'INVALID_ORIGIN', 'Nguồn yêu cầu không được phép.');
  const input = z.object({ account: staffAccount, code: authenticatorCode.optional() }).strict().safeParse(req.body);
  if (!input.success) throw new HttpError(400, 'STAFF_INVALID_INPUT', 'Thông tin tài khoản hoặc mã xác thực không hợp lệ.');
  const { account, code } = input.data;
  res.status(201).json(await createStaffAccount(req.appUser!.id, account, () => verifyAdminAction(req, res, code)));
}));

adminUsersRouter.get('/activity', asyncHandler(async (req, res) => {
  const query = z.object({ role: z.enum(roles).optional(), page: pageNumber }).strict().safeParse(req.query);
  if (!query.success) throw new HttpError(400, 'INVALID_USER_FILTER', 'Bộ lọc hoạt động không hợp lệ.');
  res.json(await listLoginHistory({ role: query.data.role, page: query.data.page ?? 1, pageSize: 20 }));
}));

adminUsersRouter.get('/:id/history', asyncHandler(async (req, res) => {
  const id = profileId.safeParse(req.params.id);
  const query = z.object({ kind: z.enum(['login', 'admin']), page: pageNumber }).strict().safeParse(req.query);
  if (!id.success || !query.success) throw new HttpError(400, 'INVALID_USER_FILTER', 'Thông tin lịch sử không hợp lệ.');
  const user = await prisma.users.findUnique({ where: { id: id.data }, select: { id: true } });
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.');
  const page = query.data.page ?? 1;
  res.json(query.data.kind === 'login'
    ? await listLoginHistory({ userId: id.data, page, pageSize: 5 })
    : await listAccountAudit(id.data, page, 5));
}));

adminUsersRouter.patch('/:id/:kind(role|status)', asyncHandler(async (req, res) => {
  if (req.get('Origin') !== env.FRONTEND_ORIGIN) throw new HttpError(403, 'INVALID_ORIGIN', 'Nguồn yêu cầu không được phép.');
  const id = profileId.safeParse(req.params.id);
  const input = z.object({ action: accountAction, code: authenticatorCode.optional() }).strict().safeParse(req.body);
  if (!id.success || !input.success || req.params.kind !== input.data.action.kind) {
    throw new HttpError(400, 'INVALID_USER_ACTION', 'Thông tin thao tác không hợp lệ.');
  }
  const { action, code } = input.data;
  res.json(await updateAccount(req.appUser!.id, id.data, action, () => verifyAdminAction(req, res, code)));
}));

adminUsersRouter.delete('/:id', asyncHandler(async (req, res) => {
  if (req.get('Origin') !== env.FRONTEND_ORIGIN) throw new HttpError(403, 'INVALID_ORIGIN', 'Nguồn yêu cầu không được phép.');
  const id = profileId.safeParse(req.params.id);
  const input = z.object({ action: accountAction, code: authenticatorCode.optional() }).strict().safeParse(req.body);
  if (!id.success || !input.success || input.data.action.kind !== 'delete') {
    throw new HttpError(400, 'INVALID_USER_ACTION', 'Thông tin xóa tài khoản không hợp lệ.');
  }
  const { action, code } = input.data;
  const result = await updateAccount(req.appUser!.id, id.data, action, () => verifyAdminAction(req, res, code));
  res.status(result.cleanup === 'PENDING' ? 202 : 200).json(result);
}));

adminUsersRouter.post('/:id/deletion-retry', asyncHandler(async (req, res) => {
  if (req.get('Origin') !== env.FRONTEND_ORIGIN) throw new HttpError(403, 'INVALID_ORIGIN', 'Nguồn yêu cầu không được phép.');
  const id = profileId.safeParse(req.params.id);
  if (!id.success) throw new HttpError(400, 'INVALID_USER_ID', 'Mã người dùng không hợp lệ.');
  res.json(await retryAccountDeletion(req.appUser!.id, id.data));
}));

adminUsersRouter.get('/:id', asyncHandler(async (req, res) => {
  const id = profileId.safeParse(req.params.id);
  if (!id.success) throw new HttpError(400, 'INVALID_USER_ID', 'Mã người dùng không hợp lệ.');

  const [user] = await prisma.$queryRaw<DirectoryProfile[]>`
    SELECT ${directoryColumns}, auth_user_id, avatar_url,
      (SELECT created_at FROM public.user_login_events WHERE user_id = account.id ORDER BY created_at DESC, id DESC LIMIT 1) AS last_login_at,
      exists(SELECT 1 FROM public.account_deletion_jobs WHERE user_id = account.id AND completed_at IS NULL) AS cleanup_pending
    FROM public.users account WHERE id = ${id.data}::uuid
  `;
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.');

  const [auth, avatar] = await Promise.all([
    readAuthDetails(user.auth_user_id),
    readAvatar(user.id, user.avatar_url),
  ]);
  res.json({ ...toDirectoryUser(user), auth, avatar, cleanupPending: user.cleanup_pending });
}));
