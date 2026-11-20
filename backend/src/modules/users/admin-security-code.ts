import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { env } from '../../config.js';
import { prisma } from '../../lib/prisma.js';
import { createPrivilegedSupabaseClient } from '../../lib/supabase.js';
import { HttpError } from '../../utils/http.js';

import { emailDeliveryConfigured, sendApplicationEmail } from '../../integrations/email/application-email.js';

export const securityCode = z.object({ id: z.string().uuid(), code: z.string().regex(/^\d{6}$/) }).strict();
export type SecurityCode = z.infer<typeof securityCode>;

function digest(id: string, actorId: string, purpose: readonly unknown[], code: string) {
  const secret = env.ADMIN_SECURITY_CODE_SECRET;
  if (!secret) throw new HttpError(503, 'ADMIN_CODE_UNAVAILABLE', 'Chưa cấu hình dịch vụ mã bảo mật.');
  // Construct a fixed-order canonical payload independent of JSON property order.
  return createHmac('sha256', secret).update(JSON.stringify([
    id, actorId, ...purpose, code,
  ])).digest('hex');
}

export async function sendAdminCode(actorId: string, authUserId: string | null, purpose: readonly unknown[]) {
  const client = createPrivilegedSupabaseClient();
  if (!client || !emailDeliveryConfigured() || !env.ADMIN_SECURITY_CODE_SECRET) {
    throw new HttpError(503, 'ADMIN_CODE_UNAVAILABLE', 'Chưa cấu hình dịch vụ gửi mã bảo mật.');
  }
  if (!authUserId) throw new HttpError(409, 'ADMIN_EMAIL_UNVERIFIED', 'Bạn cần email đã xác minh.');
  const { data, error } = await client.auth.admin.getUserById(authUserId);
  if (error) throw new HttpError(503, 'ADMIN_CODE_UNAVAILABLE', 'Tạm thời không xác minh được email nhận mã.');
  const email = data.user?.email;
  if (!email || !data.user?.email_confirmed_at) throw new HttpError(409, 'ADMIN_EMAIL_UNVERIFIED', 'Bạn cần email đã xác minh.');

  const id = randomUUID();
  const code = String(randomInt(1_000_000)).padStart(6, '0');
  const hash = digest(id, actorId, purpose, code);
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${'admin-code:' + actorId}, 0))`;
    const [recent] = await tx.$queryRaw<{ total: number; coolingDown: boolean }[]>`
      SELECT count(*)::int AS total, coalesce(bool_or(created_at > now() - interval '1 minute'), false) AS "coolingDown"
      FROM public.admin_action_codes WHERE actor_id = ${actorId}::uuid AND created_at > now() - interval '15 minutes'
    `;
    if (recent.total >= 5 || recent.coolingDown) throw new HttpError(429, 'ADMIN_CODE_RATE_LIMIT', 'Vui lòng đợi trước khi yêu cầu mã mới.');
    await tx.$executeRaw`DELETE FROM public.admin_action_codes WHERE actor_id = ${actorId}::uuid AND created_at <= now() - interval '1 day'`;
    await tx.$executeRaw`
      UPDATE public.admin_action_codes SET consumed_at = now()
      WHERE actor_id = ${actorId}::uuid AND consumed_at IS NULL AND expires_at > now()
    `;
    await tx.$executeRaw`
      INSERT INTO public.admin_action_codes (id, actor_id, code_digest) VALUES (${id}::uuid, ${actorId}::uuid, ${hash})
    `;
  });

  try {
    await sendApplicationEmail(id, email, 'Mã xác nhận quản trị IELTSpace',
      `Mã bảo mật của bạn: ${code}. Mã dùng một lần và hết hạn sau 10 phút. Nếu bạn không yêu cầu mã, hãy bỏ qua email này.`);
  } catch {
    await prisma.$executeRaw`UPDATE public.admin_action_codes SET consumed_at = now() WHERE id = ${id}::uuid`;
    throw new HttpError(503, 'ADMIN_CODE_DELIVERY_FAILED', 'Chưa gửi được mã bảo mật. Vui lòng thử lại sau.');
  }

  return { id, expiresInSeconds: 600 };
}

export async function consumeAdminCode(tx: Prisma.TransactionClient, actorId: string, purpose: readonly unknown[], input?: SecurityCode) {
  if (!input) throw new HttpError(403, 'ADMIN_CODE_REQUIRED', 'Thao tác liên quan đến Quản lý yêu cầu mã bảo mật.');
  const [record] = await tx.$queryRaw<{ code_digest: string }[]>`
    SELECT code_digest FROM public.admin_action_codes
    WHERE id = ${input.id}::uuid AND actor_id = ${actorId}::uuid
      AND expires_at > now() AND consumed_at IS NULL AND failed_attempts < 5
    FOR UPDATE
  `;
  if (!record) return false;
  const expected = digest(input.id, actorId, purpose, input.code);
  const valid = timingSafeEqual(Buffer.from(record.code_digest, 'hex'), Buffer.from(expected, 'hex'));
  if (valid) {
    await tx.$executeRaw`UPDATE public.admin_action_codes SET consumed_at = now() WHERE id = ${input.id}::uuid`;
  } else {
    await tx.$executeRaw`UPDATE public.admin_action_codes SET failed_attempts = failed_attempts + 1 WHERE id = ${input.id}::uuid`;
  }
  return valid;
}

