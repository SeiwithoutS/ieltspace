import type { Prisma } from '@prisma/client';

type NotificationEvent = {
  recipientId: string;
  recipientRole?: 'LEARNER' | 'TEACHER';
  key: string;
  type: string;
  title: string;
  content: string;
  referenceType: string;
  referenceId: string;
};

export async function recordNotification(tx: Prisma.TransactionClient, event: NotificationEvent) {
  await tx.$executeRaw`
    INSERT INTO public.notifications (recipient_id, event_key, type, title, content, reference_type, reference_id)
    SELECT id, ${event.key}, ${event.type}, ${event.title}, ${event.content}, ${event.referenceType}, ${event.referenceId}::uuid
    FROM public.users
    WHERE id = ${event.recipientId}::uuid AND status = 'ACTIVE'
      AND (${event.recipientRole ?? null}::text IS NULL OR role = ${event.recipientRole ?? null})
    FOR SHARE
    ON CONFLICT (recipient_id, event_key) DO NOTHING
  `;
}
