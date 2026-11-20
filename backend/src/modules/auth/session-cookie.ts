import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import { env } from '../../config.js';

export const REFRESH_COOKIE = 'ielts_refresh_token';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/auth',
};

export const RECOVERY_COOKIE = 'ielts_recovery_session';
export const recoveryCookieOptions = { ...cookieOptions, path: '/api/auth/reset-password' };
const recoveryLifetimeMs = 5 * 60_000;
const recoverySigningKey = createHmac('sha256', env.SUPABASE_SERVICE_ROLE_KEY || randomBytes(32))
  .update('ieltspace:password-recovery-cookie:v1').digest();

function recoverySignature(tokenHash: string, payload: string) {
  const binding = createHash('sha256').update(tokenHash).digest('hex');
  return createHmac('sha256', recoverySigningKey).update(`${binding}:${payload}`).digest();
}

export function setRecoveryCookie(res: Response, tokenHash: string, accessToken: string) {
  const payload = `${Date.now() + recoveryLifetimeMs}:${accessToken}`;
  const cookie = `${payload}:${recoverySignature(tokenHash, payload).toString('hex')}`;
  res.cookie(RECOVERY_COOKIE, cookie, { ...recoveryCookieOptions, maxAge: recoveryLifetimeMs });
}

export function readRecoveryCookie(cookie: unknown, tokenHash: string) {
  if (typeof cookie !== 'string') return '';
  const parts = cookie.split(':');
  if (parts.length !== 3) return '';
  const [expires, token, signature] = parts;
  if (!/^\d{13}$/.test(expires) || Number(expires) <= Date.now() || !/^[a-f0-9]{64}$/.test(signature)) return '';
  return timingSafeEqual(Buffer.from(signature, 'hex'), recoverySignature(tokenHash, `${expires}:${token}`)) ? token : '';
}

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}
