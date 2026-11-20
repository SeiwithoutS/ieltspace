import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { createPrivilegedSupabaseClient } from '../../lib/supabase.js';
import { HttpError } from '../../utils/http.js';

const fields = { fullName: z.string().trim().min(2).max(100), email: z.string().trim().toLowerCase().email().max(254) };
export const staffAccount = z.discriminatedUnion('role', [
  z.object({ ...fields, role: z.literal('ADMIN') }).strict(),
  z.object({ ...fields, role: z.literal('TEACHER'), writing: z.boolean(), speaking: z.boolean(), maxPending: z.number().int().min(1).max(50) }).strict(),
]).refine(input => input.role === 'ADMIN' || input.writing || input.speaking, 'Giáo viên cần ít nhất một quyền chấm.');

async function emailExists(email: string) {
  const [result] = await prisma.$queryRaw<{ present: boolean }[]>`
    SELECT EXISTS (SELECT 1 FROM public.users WHERE lower(email) = ${email})
      OR EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = ${email} AND deleted_at IS NULL) AS present
  `;
  return result.present;
}

export async function createStaffAccount(actorId: string, input: z.infer<typeof staffAccount>, verify: () => Promise<void>) {
  const client = createPrivilegedSupabaseClient();
  if (!client) throw new HttpError(503, 'STAFF_CREATION_UNAVAILABLE', 'Chưa cấu hình dịch vụ tạo tài khoản.');
  const [schema] = await prisma.$queryRaw<{ ready: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM pg_catalog.pg_attribute
      WHERE attrelid = 'public.users'::regclass AND attname = 'must_change_password' AND NOT attisdropped
    ) AND EXISTS (
      SELECT 1 FROM pg_catalog.pg_trigger
      WHERE tgrelid = 'auth.users'::regclass
        AND tgname = 'ieltspace_staff_profile_from_metadata'
        AND tgenabled IN ('O', 'A')
    ) AS ready
  `;
  if (!schema.ready) {
    throw new HttpError(503, 'STAFF_MIGRATION_REQUIRED', 'Cần chạy SQL 24 và 25 trên Supabase trước khi tạo tài khoản nhân sự.');
  }
  const request = {
    actorId,
    role: input.role,
    ...(input.role === 'TEACHER' && { writing: input.writing, speaking: input.speaking, maxPending: input.maxPending }),
  };
  const duplicate = () => new HttpError(409, 'STAFF_EMAIL_EXISTS', 'Email này đã có trong hệ thống.');
  let retryId: string | undefined;
  if (await emailExists(input.email)) {
    const [prior] = await prisma.$queryRaw<{ id: string }[]>`
      SELECT a.id FROM auth.users a
      JOIN public.users u ON u.auth_user_id = a.id
      WHERE lower(a.email) = ${input.email} AND lower(u.email) = ${input.email}
        AND a.deleted_at IS NULL AND a.last_sign_in_at IS NULL
        AND u.status = 'ACTIVE' AND u.role = 'LEARNER'
        AND a.raw_app_meta_data ->> 'ieltspace_invitation_proof' = 'managed-account-v1'
        AND a.raw_app_meta_data ->> 'ieltspace_staff_created' = 'true'
        AND a.raw_app_meta_data -> 'ieltspace_staff_creation' = ${JSON.stringify(request)}::jsonb
        AND a.raw_user_meta_data ->> 'full_name' = ${input.fullName}
        AND NOT EXISTS (SELECT 1 FROM public.user_login_events e WHERE e.user_id = u.id)
        AND NOT EXISTS (SELECT 1 FROM public.audit_logs l WHERE l.entity_type = 'USER'
          AND l.entity_id = u.id AND l.action = 'USER_CREATED')
    `;
    if (!prior) throw duplicate();
    retryId = prior.id;
  }
  if (input.role === 'ADMIN') await verify();

  const temporaryPassword = 'Aa1!' + randomBytes(24).toString('base64url');
  // Auth and the profile changes run in the same transaction via the database trigger.
  const { data, error } = retryId ? await client.auth.admin.updateUserById(retryId, {
    password: temporaryPassword,
    app_metadata: { ieltspace_staff_recovery: randomBytes(16).toString('hex') },
  }) : await client.auth.admin.createUser({
    email: input.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
    app_metadata: {
      ieltspace_invitation_proof: 'managed-account-v1',
      ieltspace_staff_created: true,
      ieltspace_staff_creation: request,
    },
  });
  const authId = data.user?.id;
  if (error || !authId) {
    if (!retryId && (error?.code === 'email_exists' || error?.code === 'user_already_exists' || await emailExists(input.email))) throw duplicate();
    throw new HttpError(503, 'STAFF_CREATION_FAILED', 'Chưa tạo được tài khoản. Vui lòng thử lại.');
  }
  const profile = await prisma.users.findUnique({
    where: { auth_user_id: authId },
    select: { id: true, role: true, status: true, must_change_password: true },
  });
  if (profile?.role !== input.role || profile.status !== 'ACTIVE' || !profile.must_change_password) {
    throw new HttpError(503, 'STAFF_PROFILE_UNAVAILABLE', 'Chưa xác nhận được hồ sơ nhân sự. Hãy kiểm tra cấu hình dữ liệu.');
  }
  return { id: profile.id, role: input.role, status: 'ACTIVE' as const, email: input.email, temporaryPassword };
}
