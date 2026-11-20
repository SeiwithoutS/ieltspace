import { env } from '../../config.js';
import { HttpError } from '../../utils/http.js';
import { getStorageClient, removeObjects } from './supabase-storage.js';
import { r2Bucket, r2Configured, R2StorageError } from './r2-storage.js';

const avatars = r2Bucket(env.R2_AVATAR_BUCKET);
const writeToR2 = env.AVATAR_STORAGE_PROVIDER === 'r2' || (env.AVATAR_STORAGE_PROVIDER === 'auto' && r2Configured);
export const avatarMaxMiB = writeToR2 ? 5 : 2;
const r2Prefix = 'r2:';

function supabaseBucket() {
  return getStorageClient().storage.from(env.STORAGE_BUCKET_AVATARS);
}

export function ownedAvatarReference(reference: string | null, userId: string) {
  const key = reference?.startsWith(r2Prefix) ? reference.slice(r2Prefix.length) : reference;
  const ownerPrefix = `${userId}/`;
  return key?.startsWith(ownerPrefix) && /^[a-f0-9-]{36}\.(jpg|png)$/.test(key.slice(ownerPrefix.length)) ? reference : null;
}

export async function putAvatar(key: string, bytes: Buffer, contentType: string) {
  if (writeToR2) {
    try {
      await avatars.put(key, bytes, contentType);
      return `${r2Prefix}${key}`;
    } catch (error) {
      await removeAvatar(`${r2Prefix}${key}`);
      if (error instanceof R2StorageError) throw new HttpError(503, 'AVATAR_UPLOAD_FAILED', 'Chưa thể lưu ảnh đại diện. Vui lòng thử lại.');
      throw error;
    }
  }
  const { error } = await supabaseBucket().upload(key, bytes, { contentType, upsert: false });
  if (error) throw new HttpError(503, 'AVATAR_UPLOAD_FAILED', 'Chưa thể lưu ảnh đại diện. Vui lòng thử lại.');
  return key;
}

export async function signAvatar(reference: string) {
  if (reference.startsWith(r2Prefix)) {
    try {
      return await avatars.signedReadUrl(reference.slice(r2Prefix.length), 300);
    } catch (error) {
      if (error instanceof R2StorageError) throw new HttpError(503, 'AVATAR_UNAVAILABLE', 'Chưa thể tải ảnh đại diện.');
      throw error;
    }
  }
  const { data, error } = await supabaseBucket().createSignedUrl(reference, 300);
  if (error || !data?.signedUrl) throw new HttpError(503, 'AVATAR_UNAVAILABLE', 'Chưa thể tải ảnh đại diện.');
  return data.signedUrl;
}

export async function removeAvatar(reference: string) {
  if (!reference.startsWith(r2Prefix)) {
    await removeObjects([reference], env.STORAGE_BUCKET_AVATARS);
    return;
  }
  try {
    await avatars.remove(reference.slice(r2Prefix.length));
  } catch (error) {
    console.warn('R2 avatar cleanup failed', { status: error instanceof R2StorageError ? error.status : undefined });
  }
}

export async function deleteStoredAvatar(reference: string) {
  if (reference.startsWith(r2Prefix)) {
    await avatars.remove(reference.slice(r2Prefix.length));
  } else {
    const { error } = await supabaseBucket().remove([reference]);
    if (error) throw new HttpError(503, 'AVATAR_DELETE_FAILED', 'Chưa dọn được ảnh đại diện.');
  }
}
