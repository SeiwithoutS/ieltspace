import { randomUUID } from 'node:crypto';
import express, { Router, type Request } from 'express';
import { z } from 'zod';
import { detectImageExtension } from '../../integrations/storage/supabase-storage.js';
import { avatarMaxMiB, ownedAvatarReference, putAvatar, removeAvatar, signAvatar } from '../../integrations/storage/avatar-storage.js';
import { prisma } from '../../lib/prisma.js';
import { invalidateUserCache, requireFreshAuth, userSelect } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';

const maxAvatarBytes = avatarMaxMiB * 1024 * 1024;
const avatarTypes = ['image/jpeg', 'image/png'];
const parseImage = express.raw({ type: avatarTypes, limit: maxAvatarBytes, inflate: false });
const displayNameSchema = z.object({ displayName: z.string().trim().min(2).max(100) }).strict();

export const profileRouter = Router();
profileRouter.use(requireFreshAuth);

profileRouter.get('/avatar-options', (_req, res) => {
  res.json({ maxBytes: maxAvatarBytes });
});

function ownProfile(req: Request) {
  const { id, auth_user_id } = req.appUser!;
  if (!auth_user_id) throw new HttpError(403, 'ACCOUNT_UNAVAILABLE', 'Tài khoản không được phép cập nhật hồ sơ.');
  return { id, auth_user_id, status: 'ACTIVE' };
}

async function replaceAvatar(req: Request, path: string | null) {
  const where = ownProfile(req);
  const { user, previous } = await prisma.$transaction(async tx => {
    const [previous] = await tx.$queryRaw<{ avatar_url: string | null }[]>`
      SELECT avatar_url FROM public.users WHERE id = ${where.id}::uuid
      AND auth_user_id = ${where.auth_user_id}::uuid AND status = 'ACTIVE'
      FOR UPDATE`;
    if (!previous) throw new HttpError(403, 'ACCOUNT_UNAVAILABLE', 'Tài khoản không được phép cập nhật hồ sơ.');
    const user = await tx.users.update({ where, data: { avatar_url: path }, select: userSelect });
    return { user, previous };
  });
  if (user.auth_user_id) invalidateUserCache(user.auth_user_id);
  const oldPath = ownedAvatarReference(previous.avatar_url, user.id);
  if (oldPath && oldPath !== path) await removeAvatar(oldPath);
  return { ...user, must_change_password: req.appUser!.must_change_password };
}

profileRouter.patch('/', asyncHandler(async (req, res) => {
  const input = displayNameSchema.safeParse(req.body);
  if (!input.success) throw new HttpError(400, 'INVALID_DISPLAY_NAME', 'Tên hiển thị phải có từ 2 đến 100 ký tự.');
  const where = ownProfile(req);
  const [user] = await prisma.users.updateManyAndReturn({ where, data: { display_name: input.data.displayName }, select: userSelect });
  if (!user) throw new HttpError(403, 'ACCOUNT_UNAVAILABLE', 'Tài khoản không được phép cập nhật hồ sơ.');
  if (user.auth_user_id) invalidateUserCache(user.auth_user_id);
  res.json({ user: { ...user, must_change_password: req.appUser!.must_change_password } });
}));

profileRouter.get('/avatar', asyncHandler(async (req, res) => {
  const user = await prisma.users.findUnique({ where: ownProfile(req), select: { id: true, avatar_url: true } });
  const path = user && ownedAvatarReference(user.avatar_url, user.id);
  if (!path) {
    res.json({ url: null });
    return;
  }
  res.json({ url: await signAvatar(path) });
}));

profileRouter.put('/avatar', (req, res, next) => {
  parseImage(req, res, error => {
    if (error?.type === 'entity.too.large') return next(new HttpError(413, 'AVATAR_TOO_LARGE', `Ảnh đại diện tối đa ${avatarMaxMiB} MB.`));
    if (error?.type === 'encoding.unsupported') return next(new HttpError(415, 'AVATAR_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.'));
    next(error);
  });
}, asyncHandler(async (req, res) => {
  const contentType = req.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
  if (!avatarTypes.includes(contentType) || !Buffer.isBuffer(req.body) || !req.body.length) {
    throw new HttpError(415, 'AVATAR_TYPE', 'Chỉ chấp nhận ảnh JPG hoặc PNG.');
  }
  const extension = detectImageExtension(req.body, contentType, 'AVATAR_TYPE');
  const key = `${req.appUser!.id}/${randomUUID()}.${extension}`;
  const path = await putAvatar(key, req.body, contentType);

  try {
    const user = await replaceAvatar(req, path);
    res.json({ user });
  } catch (error) {
    // A connection can drop during commit. Delete only after confirming the path is unused.
    const stored = await prisma.users.findUnique({ where: { id: req.appUser!.id }, select: { avatar_url: true } })
      .catch(() => undefined);
    if (stored !== undefined && stored?.avatar_url !== path) await removeAvatar(path);
    throw error;
  }
}));

profileRouter.delete('/avatar', asyncHandler(async (req, res) => {
  res.json({ user: await replaceAvatar(req, null) });
}));
