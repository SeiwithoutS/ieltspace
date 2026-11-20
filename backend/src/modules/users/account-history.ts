import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export const accountAuditActions = {
  role: 'USER_ROLE_CHANGED',
  lock: 'USER_LOCKED',
  unlock: 'USER_UNLOCKED',
  delete: 'USER_DELETED',
  create: 'USER_CREATED',
  invite: 'USER_INVITED',
  inviteReissued: 'USER_INVITE_REISSUED',
  inviteAccepted: 'USER_INVITE_ACCEPTED',
};

type LoginEvent = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  role: string;
  method: 'PASSWORD' | 'GOOGLE';
  at: Date;
};

type AccountAudit = {
  id: string;
  actorName: string | null;
  action: string;
  before: string | null;
  after: string | null;
  reason: string | null;
  at: Date;
};

export async function listLoginHistory({ page, pageSize, userId, role }: {
  page: number;
  pageSize: number;
  userId?: string;
  role?: string;
}) {
  const filter = userId ? Prisma.sql`WHERE event.user_id = ${userId}::uuid`
    : role ? Prisma.sql`WHERE account.role = ${role}` : Prisma.empty;
  const rows = await prisma.$queryRaw<LoginEvent[]>`
    SELECT event.id, event.user_id AS "userId",
      coalesce(nullif(btrim(account.display_name), ''), account.full_name) AS name,
      account.email, account.role, event.method, event.created_at AS at
    FROM public.user_login_events event
    JOIN public.users account ON account.id = event.user_id
    ${filter}
    ORDER BY event.created_at DESC, event.id DESC
    LIMIT ${pageSize + 1} OFFSET ${(page - 1) * pageSize}
  `;
  return { items: rows.slice(0, pageSize), nextPage: rows.length > pageSize ? page + 1 : null };
}

export async function listAccountAudit(userId: string, page: number, pageSize: number) {
  const rows = await prisma.$queryRaw<AccountAudit[]>`
    SELECT log.id, coalesce(nullif(btrim(actor.display_name), ''), actor.full_name) AS "actorName",
      log.action, log.change_data ->> 'before' AS before, log.change_data ->> 'after' AS after,
      log.reason, log.created_at AS at
    FROM public.audit_logs log
    LEFT JOIN public.users actor ON actor.id = log.actor_id
    WHERE log.entity_type = 'USER' AND log.entity_id = ${userId}::uuid
      AND log.action IN (${Prisma.join(Object.values(accountAuditActions))})
    ORDER BY log.created_at DESC, log.id DESC
    LIMIT ${pageSize + 1} OFFSET ${(page - 1) * pageSize}
  `;
  return { items: rows.slice(0, pageSize), nextPage: rows.length > pageSize ? page + 1 : null };
}
