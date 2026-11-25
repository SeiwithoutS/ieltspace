import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { invalidateUserCache } from '../../middleware/auth.js';
import { writeAudit } from '../../shared/audit.js';
import { lockAccountWrites } from '../../shared/account-write-lock.js';
import { HttpError } from '../../utils/http.js';
import { accountAuditActions } from './account-history.js';
import { finishAccountDeletion } from './account-deletion.js';

const role = z.enum(['LEARNER', 'TEACHER', 'ADMIN']);
const status = z.enum(['ACTIVE', 'LOCKED']);
const reason = z.string().trim().min(1).max(500);
const roleAction = z.object({ kind: z.literal('role'), previousRole: role, previousStatus: status, role, reason }).strict();
const statusAction = z.object({ kind: z.literal('status'), previousRole: role, previousStatus: status, status, reason }).strict();
const deleteAction = z.object({ kind: z.literal('delete'), previousRole: role,
  previousStatus: z.enum(['ACTIVE', 'LOCKED', 'INVITED']), reason }).strict();
export const accountAction = z.discriminatedUnion('kind', [roleAction, statusAction, deleteAction]);

type AccountAction = z.infer<typeof accountAction>;
type Profile = { id: string; auth_user_id: string | null; role: string; status: string };

function requiresCode(target: Pick<Profile, 'role'>, action: AccountAction) {
  return target.role === 'ADMIN' || (action.kind === 'role' && action.role === 'ADMIN');
}

function verifyProfiles(rows: Profile[], actorId: string, targetId: string, action: AccountAction) {
  const actor = rows.find(row => row.id === actorId);
  if (!actor || actor.role !== 'ADMIN' || actor.status !== 'ACTIVE') {
    throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền thay đổi tài khoản.');
  }
  const target = rows.find(row => row.id === targetId);
  if (!target) throw new HttpError(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.');
  if (target.status === 'DELETED' && action.kind !== 'delete') throw new HttpError(409, 'USER_DELETED', 'Tài khoản đã bị xóa.');
  const unchanged = action.kind === 'role'
    ? target.role === action.role && target.status === action.previousStatus
    : action.kind === 'status' ? target.status === action.status && target.role === action.previousRole : target.status === 'DELETED';
  if (!unchanged && (target.role !== action.previousRole || target.status !== action.previousStatus)) {
    throw new HttpError(409, 'USER_CHANGED', 'Tài khoản vừa thay đổi. Hãy tải lại chi tiết.');
  }
  if (!unchanged && actorId === targetId) {
    throw new HttpError(409, 'SELF_ADMIN_ACTION', 'Bạn không thể tự khóa, tự hạ quyền hoặc xóa tài khoản của mình.');
  }
  return { actor, target, unchanged };
}

export async function updateAccount(actorId: string, targetId: string, action: AccountAction, verify: () => Promise<void>) {
  let verified = false;
  if (requiresCode({ role: action.previousRole }, action)) {
    const rows = await prisma.$queryRaw<Profile[]>`
      SELECT id, auth_user_id, role, status FROM public.users WHERE id IN (${actorId}::uuid, ${targetId}::uuid)
    `;
    const { unchanged } = verifyProfiles(rows, actorId, targetId, action);
    if (!unchanged) {
      await verify();
      verified = true;
    }
  }

  const result = await prisma.$transaction(async tx => {
    // Every administration write takes this lock before checking the actor or counting active admins.
    await lockAccountWrites(tx);
    const profiles = await tx.$queryRaw<Profile[]>`
      SELECT id, auth_user_id, role, status FROM public.users WHERE id IN (${actorId}::uuid, ${targetId}::uuid)
      ORDER BY id FOR UPDATE
    `;
    const { target, unchanged } = verifyProfiles(profiles, actorId, targetId, action);
    if (unchanged) return { target, changed: false };

    const nextRole = action.kind === 'role' ? action.role : target.role;
    const nextStatus = action.kind === 'delete' ? 'DELETED' : action.kind === 'status' ? action.status : target.status;
    if (target.role === 'ADMIN' && target.status === 'ACTIVE' && (nextRole !== 'ADMIN' || nextStatus !== 'ACTIVE')) {
      const count = await tx.users.count({ where: { role: 'ADMIN', status: 'ACTIVE' } });
      if (count <= 1) throw new HttpError(409, 'LAST_ACTIVE_ADMIN', 'Cần giữ ít nhất một Quản lý đang hoạt động.');
    }
    if (target.role === 'TEACHER' && (nextRole !== 'TEACHER' || action.kind === 'delete')) {
      const [assigned] = await tx.$queryRaw<{ present: boolean }[]>`
        SELECT EXISTS (SELECT 1 FROM public.grading_requests WHERE teacher_id = ${targetId}::uuid AND status = 'ASSIGNED') AS present
      `;
      if (assigned.present) throw new HttpError(409, 'TEACHER_HAS_ASSIGNED_WORK', 'Giáo viên còn bài đang được giao.');
    }
    if (requiresCode(target, action) && !verified) {
      throw new HttpError(409, 'USER_CHANGED', 'Tài khoản vừa thay đổi. Hãy tải lại chi tiết.');
    }

    if (action.kind === 'delete') {
      await tx.$queryRaw`SELECT 1 FROM public.ieltspace_stage_account_deletion(${targetId}::uuid, ${actorId}::uuid)`;
      await writeAudit(tx, { actorId, entityType: 'USER', entityId: targetId, reason: action.reason,
        action: 'USER_DELETED', changeData: { before: target.status, after: 'DELETED' } });
      // Retain the pre-deletion Auth ID to invalidate its cached privileges after commit.
      return { target: { ...target, status: 'DELETED' }, changed: true };
    }

    const [updated] = await tx.$queryRaw<Profile[]>`
      UPDATE public.users SET role = ${nextRole}, status = ${nextStatus}, updated_at = now()
      WHERE id = ${targetId}::uuid RETURNING id, auth_user_id, role, status
    `;
    await writeAudit(tx, {
      actorId, entityType: 'USER', entityId: targetId, reason: action.reason,
      action: action.kind === 'role' ? accountAuditActions.role : nextStatus === 'LOCKED' ? accountAuditActions.lock : accountAuditActions.unlock,
      changeData: action.kind === 'role' ? { before: target.role, after: nextRole } : { before: target.status, after: nextStatus },
    });
    return { target: updated, changed: true };
  });
  if (result.target.auth_user_id) invalidateUserCache(result.target.auth_user_id);
  const cleanup = action.kind === 'delete' ? await finishAccountDeletion(targetId) : undefined;
  return { id: result.target.id, role: result.target.role, status: result.target.status, changed: result.changed, cleanup };
}

export async function retryAccountDeletion(actorId: string, targetId: string) {
  const actor = await prisma.users.findUnique({ where: { id: actorId }, select: { status: true, role: true } });
  if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền quản lý tài khoản.');
  const target = await prisma.users.findUnique({ where: { id: targetId }, select: { status: true } });
  if (target?.status !== 'DELETED') throw new HttpError(409, 'USER_NOT_DELETED', 'Tài khoản chưa được xóa.');
  return { cleanup: await finishAccountDeletion(targetId) };
}
