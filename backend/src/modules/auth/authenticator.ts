import type { User } from '@supabase/supabase-js';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { createAuthClient } from '../../lib/supabase.js';
import { HttpError } from '../../utils/http.js';
import { setRefreshCookie } from './session-cookie.js';

export const authenticatorCode = z.string().regex(/^\d{6}$/);

export function verifiedTotp(user: User | null) {
  return user?.factors?.find(factor => factor.factor_type === 'totp' && factor.status === 'verified');
}

export function authenticatorFailure(error: { status?: number }, fallback: string): never {
  if (error.status === 429) throw new HttpError(429, 'AUTHENTICATOR_RATE_LIMIT', 'Hãy đợi một lúc trước khi thử mã mới.');
  if (!error.status || error.status >= 500) {
    throw new HttpError(503, 'AUTHENTICATOR_UNAVAILABLE', 'Chưa thể kết nối dịch vụ xác thực. Vui lòng thử lại.');
  }
  throw new HttpError(403, 'AUTHENTICATOR_FAILED', fallback);
}

export async function readAuthenticator(req: Request) {
  const client = createAuthClient(req.accessToken!);
  const { data, error } = await client.auth.getUser(req.accessToken!);
  if (error) authenticatorFailure(error, 'Phiên xác thực không còn hợp lệ. Vui lòng đăng nhập lại.');
  if (!data.user || data.user.id !== req.appUser?.auth_user_id) {
    throw new HttpError(401, 'INVALID_TOKEN', 'Vui lòng đăng nhập lại.');
  }
  return { client, user: data.user };
}

export async function verifyAuthenticator(client: ReturnType<typeof createAuthClient>, factorId: string, code: string) {
  const { data, error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) authenticatorFailure(error, 'Mã Google Authenticator không đúng hoặc đã hết hạn. Hãy thử mã mới.');
  return data;
}

export async function verifyAdminAction(req: Request, res: Response, code?: string) {
  if (req.appUser?.must_change_password) {
    throw new HttpError(409, 'TEMPORARY_PASSWORD', 'Hãy đổi mật khẩu tạm trước khi xác nhận thao tác liên quan đến Quản lý.');
  }
  if (!code) throw new HttpError(403, 'AUTHENTICATOR_REQUIRED', 'Hãy nhập mã 6 số từ Google Authenticator.');
  const { client, user } = await readAuthenticator(req);
  const factor = verifiedTotp(user);
  if (!factor) {
    throw new HttpError(403, 'AUTHENTICATOR_NOT_CONFIGURED', 'Hãy thiết lập Google Authenticator trong Hồ sơ cá nhân trước.');
  }
  const session = await verifyAuthenticator(client, factor.id, code);
  setRefreshCookie(res, session.refresh_token);
}
