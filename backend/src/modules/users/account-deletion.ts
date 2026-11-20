import { randomUUID } from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { createPrivilegedSupabaseClient } from '../../lib/supabase.js';
import { deleteStoredAvatar, ownedAvatarReference } from '../../integrations/storage/avatar-storage.js';
import { recordingsBucket } from '../../integrations/storage/r2-storage.js';

type DeletionJob = { auth_user_id: string | null; avatar_reference: string | null; recordings: string[] };

export async function finishAccountDeletion(userId: string): Promise<'PENDING' | 'COMPLETE'> {
  const lease = randomUUID();
  const [job] = await prisma.$queryRaw<DeletionJob[]>`
    UPDATE public.account_deletion_jobs SET lease_id = ${lease}::uuid, lease_until = now() + interval '1 minute'
    WHERE user_id = ${userId}::uuid AND completed_at IS NULL AND (lease_until IS NULL OR lease_until <= now())
    RETURNING auth_user_id, avatar_reference, recordings
  `;
  if (!job) {
    const [pending] = await prisma.$queryRaw<{ pending: boolean }[]>`
      SELECT exists(SELECT 1 FROM public.account_deletion_jobs WHERE user_id = ${userId}::uuid AND completed_at IS NULL) AS pending
    `;
    return pending.pending ? 'PENDING' : 'COMPLETE';
  }

  try {
    const avatar = ownedAvatarReference(job.avatar_reference, userId);
    if (avatar) {
      await deleteStoredAvatar(avatar);
      await prisma.$executeRaw`UPDATE public.account_deletion_jobs SET avatar_reference = NULL WHERE user_id = ${userId}::uuid AND lease_id = ${lease}::uuid`;
    }
    for (const reference of job.recordings) {
      const key = reference.replace(/^r2:/, '');
      if (!key || /^[a-z][a-z0-9+.-]*:/i.test(key) || key.split('/').some(part => !part || part === '.' || part === '..')) {
        throw new Error('Unrecognized recording reference');
      }
      await recordingsBucket.remove(key);
      const updated = await prisma.$executeRaw`
        UPDATE public.account_deletion_jobs SET recordings = array_remove(recordings, ${reference}), lease_until = now() + interval '1 minute'
        WHERE user_id = ${userId}::uuid AND lease_id = ${lease}::uuid
      `;
      if (!updated) return 'PENDING';
    }
    if (job.auth_user_id) {
      const client = createPrivilegedSupabaseClient();
      if (!client) throw new Error('Auth Admin not configured');
      const ownedObjects = await prisma.$queryRaw<{ bucket_id: string; name: string }[]>`
        SELECT bucket_id, name FROM storage.objects WHERE owner_id::text = ${job.auth_user_id}
        ORDER BY bucket_id, name LIMIT 1001
      `;
      const ownedByBucket = new Map<string, string[]>();
      for (const { bucket_id, name } of ownedObjects.slice(0, 1000)) {
        const names = ownedByBucket.get(bucket_id);
        if (names) names.push(name);
        else ownedByBucket.set(bucket_id, [name]);
      }
      for (const [bucket, names] of ownedByBucket) {
        const { error } = await client.storage.from(bucket).remove(names);
        if (error) throw new Error('Owned Storage objects could not be removed');
      }
      if (ownedObjects.length > 1000) throw new Error('More owned files remain');
      const { error } = await client.auth.admin.deleteUser(job.auth_user_id);
      if (error && error.status !== 404 && error.code !== 'user_not_found') throw new Error('Auth deletion failed');
    }
    const done = await prisma.$executeRaw`
      UPDATE public.account_deletion_jobs SET completed_at = now(), auth_user_id = NULL, avatar_reference = NULL,
        lease_id = NULL, lease_until = NULL
      WHERE user_id = ${userId}::uuid AND lease_id = ${lease}::uuid
    `;
    return done ? 'COMPLETE' : 'PENDING';
  } catch {
    await prisma.$executeRaw`
      UPDATE public.account_deletion_jobs SET lease_id = NULL, lease_until = NULL
      WHERE user_id = ${userId}::uuid AND lease_id = ${lease}::uuid
    `;
    return 'PENDING';
  }
}
