import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '../../config.js';
import { prisma } from '../../lib/prisma.js';
import { createPrivilegedSupabaseClient } from '../../lib/supabase.js';
import { HttpError } from '../../utils/http.js';
import { writeAudit } from '../../shared/audit.js';
import { emailDeliveryConfigured, sendApplicationEmail } from '../../integrations/email/application-email.js';
import { consumeAdminCode, sendAdminCode, type SecurityCode } from './admin-security-code.js';

const fields = { fullName: z.string().trim().min(2).max(100), email: z.string().trim().toLowerCase().email().max(254) };
export const staffInvitation = z.discriminatedUnion('role', [
  z.object({ ...fields, role: z.literal('ADMIN') }).strict(),
  z.object({ ...fields, role: z.literal('TEACHER'), writing: z.boolean(), speaking: z.boolean(), maxPending: z.number().int().min(1).max(50) }).strict(),
]).refine(input => input.role === 'ADMIN' || input.writing || input.speaking, 'Giáo viên cần ít nhất một quyền chấm.');
export const invitationToken = z.string().regex(/^[0-9a-f]{64}$/);
type Invitation = z.infer<typeof staffInvitation>;
type Pending = { id: string; full_name: string; role: string; status: string; writing: boolean | null; speaking: boolean | null; max_pending: number | null; cooling_down: boolean | null };
const purpose = (input: Invitation) => ['invite', input.role, input.email, input.fullName];
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function issueInvitationCode(actorId: string, input: Invitation) {
  if (input.role !== 'ADMIN') throw new HttpError(409, 'ADMIN_CODE_NOT_NEEDED', 'Lời mời này không cần mã bảo mật.');
  const actor = await prisma.users.findUnique({ where: { id: actorId }, select: { auth_user_id: true, role: true, status: true } });
  if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền mời nhân sự.');
  return sendAdminCode(actorId, actor.auth_user_id, purpose(input));
}

export async function sendStaffInvitation(actorId: string, input: Invitation, code?: SecurityCode) {
  if (!emailDeliveryConfigured() || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(503, 'INVITE_UNAVAILABLE', 'Chưa cấu hình dịch vụ gửi email mời.');
  }
  const token = randomBytes(32).toString('hex');
  const proof = hashToken(token);
  const writing = input.role === 'TEACHER' && input.writing;
  const speaking = input.role === 'TEACHER' && input.speaking;
  const maxPending = input.role === 'TEACHER' ? input.maxPending : 5;
  const reserved = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended('ieltspace:admin-accounts', 0))`;
    const actor = await tx.users.findUnique({ where: { id: actorId }, select: { role: true, status: true } });
    if (actor?.role !== 'ADMIN' || actor.status !== 'ACTIVE') throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền mời nhân sự.');
    const [pending] = await tx.$queryRaw<Pending[]>`
      SELECT u.id, u.full_name, u.role, u.status, i.writing, i.speaking, i.max_pending,
        i.sent_at > now() - interval '1 minute' AS cooling_down
      FROM public.users u LEFT JOIN public.staff_invitations i ON i.user_id = u.id
      WHERE lower(u.email) = ${input.email} FOR UPDATE OF u
    `;
    if (pending && (pending.status !== 'INVITED' || pending.role !== input.role || pending.full_name !== input.fullName
      || pending.writing !== writing || pending.speaking !== speaking || pending.max_pending !== maxPending)) {
      throw new HttpError(409, 'INVITE_EMAIL_EXISTS', 'Email đã có tài khoản hoặc lời mời khác.');
    }
    if (pending?.cooling_down) throw new HttpError(429, 'INVITE_COOLDOWN', 'Vui lòng đợi một phút trước khi gửi lại.');
    const [authTaken] = await tx.$queryRaw<{ present: boolean }[]>`
      SELECT exists(SELECT 1 FROM auth.users WHERE lower(email) = ${input.email} AND deleted_at IS NULL) AS present
    `;
    if (authTaken.present) throw new HttpError(409, 'INVITE_EMAIL_EXISTS', 'Email đã có tài khoản.');
    if (input.role === 'ADMIN' && !await consumeAdminCode(tx, actorId, purpose(input), code)) return null;

    const id = pending?.id ?? randomUUID();
    if (!pending) {
      const inserted = await tx.$executeRaw`
        INSERT INTO public.users (id, full_name, email, role, status)
        VALUES (${id}::uuid, ${input.fullName}, ${input.email}, ${input.role}, 'INVITED')
        ON CONFLICT DO NOTHING
      `;
      if (!inserted) throw new HttpError(409, 'INVITE_EMAIL_EXISTS', 'Email đã có tài khoản hoặc lời mời khác.');
    }
    await tx.$executeRaw`
      INSERT INTO public.staff_invitations (user_id, invited_by, token_digest, expires_at, sent_at, writing, speaking, max_pending)
      VALUES (${id}::uuid, ${actorId}::uuid, ${proof}, now() + interval '24 hours', now(), ${writing}, ${speaking}, ${maxPending})
      ON CONFLICT (user_id) DO UPDATE SET invited_by = excluded.invited_by, token_digest = excluded.token_digest,
        expires_at = excluded.expires_at, sent_at = excluded.sent_at
    `;
    await writeAudit(tx, { actorId, entityType: 'USER', entityId: id,
      action: pending ? 'USER_INVITE_REISSUED' : 'USER_INVITED', changeData: { after: 'INVITED' } });
    return { id };
  });
  if (!reserved) throw new HttpError(403, 'ADMIN_CODE_INVALID', 'Mã không đúng, hết hạn hoặc đã được dùng.');

  const url = new URL('/?invite=1', env.FRONTEND_ORIGIN);
  url.hash = new URLSearchParams({ type: 'staff-invite', token_hash: token }).toString();
  try {
    await sendApplicationEmail(randomUUID(), input.email, 'Lời mời tham gia IELTSpace',
      `Bạn được mời làm ${input.role === 'ADMIN' ? 'Quản lý' : 'Giáo viên'} IELTSpace. Mở liên kết để đặt mật khẩu và nhận lời mời trong vòng 24 giờ:\n${url.toString()}`);
  } catch {
    await prisma.$executeRaw`UPDATE public.staff_invitations SET sent_at = NULL WHERE user_id = ${reserved.id}::uuid AND token_digest = ${proof}`;
    throw new HttpError(503, 'INVITE_EMAIL_FAILED', 'Đã lưu lời mời nhưng chưa gửi được email. Có thể gửi lại với cùng thông tin.');
  }
  return { id: reserved.id, status: 'INVITED' as const };
}

export async function acceptStaffInvitation(token: string, password: string) {
  const proof = hashToken(token);
  const [pending] = await prisma.$queryRaw<{ email: string }[]>`
    SELECT u.email FROM public.staff_invitations i JOIN public.users u ON u.id = i.user_id
    WHERE i.token_digest = ${proof} AND i.expires_at > now() AND u.status = 'INVITED'
  `;
  if (!pending) throw new HttpError(400, 'INVITE_INVALID', 'Lời mời không hợp lệ, đã hết hạn hoặc đã được nhận.');
  const client = createPrivilegedSupabaseClient();
  if (!client) throw new HttpError(503, 'INVITE_UNAVAILABLE', 'Chưa thể nhận lời mời. Vui lòng thử lại.');
  const { error } = await client.auth.admin.createUser({
    email: pending.email, password, email_confirm: true,
    app_metadata: { ieltspace_invitation_proof: proof, ieltspace_staff_invite: true },
  });
  if (error) {
    if (error.code === 'weak_password') throw new HttpError(400, 'INVITE_WEAK_PASSWORD', 'Mật khẩu chưa đạt yêu cầu. Hãy chọn mật khẩu khác.');
    throw new HttpError(409, 'INVITE_ACCEPT_FAILED', 'Chưa nhận được lời mời. Hãy dùng liên kết mới nhất hoặc liên hệ Quản lý.');
  }
}
