import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';

export async function lockNotificationAdmin(tx: Prisma.TransactionClient, actorId: string) {
  const [actor] = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM public.users WHERE id=${actorId}::uuid AND role='ADMIN' AND status='ACTIVE' FOR SHARE
  `;
  if (!actor) throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền quản lý thông báo.');
}

export async function dispatchAnnouncement(id?: string) {
  return prisma.$transaction(async tx => {
    const [job] = await tx.$queryRaw<{ id: string; title: string; content: string; audience: string }[]>`
      SELECT id,title,content,audience FROM public.announcements
      WHERE status='SCHEDULED' AND scheduled_at<=now() AND (${id ?? null}::uuid IS NULL OR id=${id ?? null}::uuid)
      ORDER BY scheduled_at,id LIMIT 1 FOR UPDATE SKIP LOCKED
    `;
    if (!job) return false;
    const count = await tx.$executeRaw`
      INSERT INTO public.notifications (recipient_id,event_key,type,title,content,reference_type,reference_id)
      SELECT id,${'announcement:' + job.id},'ANNOUNCEMENT',${job.title},${job.content},'ANNOUNCEMENT',${job.id}::uuid
      FROM public.users
      WHERE status='ACTIVE' AND (${job.audience}='ALL' OR role=${job.audience})
      ORDER BY id FOR SHARE
      ON CONFLICT (recipient_id,event_key) DO NOTHING
    `;
    await tx.$executeRaw`
      UPDATE public.announcements SET status='SENT',sent_at=now(),recipient_count=${count}::int,revision=revision+1
      WHERE id=${job.id}::uuid
    `;
    await tx.$executeRaw`
      INSERT INTO public.audit_logs(actor_type,action,entity_type,entity_id,change_data)
      VALUES('SYSTEM','ANNOUNCEMENT_SENT','ANNOUNCEMENT',${job.id}::uuid,
        ${JSON.stringify({ audience: job.audience, recipientCount: count })}::jsonb)
    `;
    return true;
  }, { timeout: 30_000 });
}
