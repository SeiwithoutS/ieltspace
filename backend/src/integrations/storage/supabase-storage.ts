import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config.js';
import { HttpError } from '../../utils/http.js';

export function getStorageClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(
      503,
      'STORAGE_UNAVAILABLE',
      'Chưa tải được ảnh. Dịch vụ lưu trữ chưa được cấu hình (thiếu service role key).'
    );
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function detectImageExtension(
  buffer: Buffer,
  declaredContentType: string,
  errorType: string = 'COVER_TYPE'
): string {
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPng =
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  if (declaredContentType === 'image/jpeg' && isJpeg) return 'jpg';
  if (declaredContentType === 'image/png' && isPng) return 'png';
  if (declaredContentType === 'image/webp' && isWebp) return 'webp';

  throw new HttpError(
    415,
    errorType,
    'Định dạng ảnh không hợp lệ. Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.'
  );
}

export async function uploadCover(
  setId: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (buffer.length > 5 * 1024 * 1024) {
    throw new HttpError(413, 'COVER_TOO_LARGE', 'Kích thước ảnh tối đa là 5 MB.');
  }

  const ext = detectImageExtension(buffer, contentType, 'COVER_TYPE');
  const fileId = crypto.randomUUID();
  const filePath = `exam-sets/${setId}/${fileId}.${ext}`;

  const client = getStorageClient();
  const { error } = await client.storage
    .from(env.STORAGE_BUCKET_COVERS)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error.message);
    throw new HttpError(
      503,
      'STORAGE_UNAVAILABLE',
      'Chưa tải được ảnh. Hãy chọn ảnh mẫu hoặc thử lại sau.'
    );
  }

  const { data: publicUrlData } = client.storage
    .from(env.STORAGE_BUCKET_COVERS)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function uploadSkillImage(
  skillId: string,
  buffer: Buffer,
  contentType: string
): Promise<{ path: string; url: string }> {
  if (buffer.length > 5 * 1024 * 1024) {
    throw new HttpError(413, 'IMAGE_TOO_LARGE', 'Kích thước ảnh tối đa là 5 MB.');
  }

  const ext = detectImageExtension(buffer, contentType, 'IMAGE_TYPE');
  const fileId = crypto.randomUUID();
  const filePath = `exam-skills/${skillId}/${fileId}.${ext}`;

  const client = getStorageClient();
  const bucket = env.STORAGE_BUCKET_EXAM_ASSETS;
  const { error } = await client.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Storage uploadSkillImage error:', error.message);
    throw new HttpError(
      503,
      'STORAGE_UNAVAILABLE',
      'Chưa tải được ảnh đề. Vui lòng thử lại sau.'
    );
  }

  const { data: publicUrlData } = client.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrlData.publicUrl,
  };
}

export function publicUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  try {
    const client = getStorageClient();
    const { data } = client.storage
      .from(env.STORAGE_BUCKET_EXAM_ASSETS)
      .getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return '';
  }
}

export async function removeObject(urlOrPath: string): Promise<void> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !urlOrPath) return;

  try {
    const bucket = env.STORAGE_BUCKET_COVERS;
    let path = urlOrPath;

    // Nếu là URL công khai, trích xuất path tương đối trong bucket
    const marker = `/${bucket}/`;
    const idx = urlOrPath.indexOf(marker);
    if (idx !== -1) {
      path = urlOrPath.slice(idx + marker.length);
    }

    const client = getStorageClient();
    const { error } = await client.storage.from(bucket).remove([path]);
    if (error) {
      console.warn('Storage removeObject warning:', error.message);
    }
  } catch (err) {
    console.warn('Storage removeObject warning:', err instanceof Error ? err.message : err);
  }
}

export async function removeObjects(
  paths: string[],
  bucketName: string = env.STORAGE_BUCKET_EXAM_ASSETS
): Promise<void> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !paths || paths.length === 0) return;

  try {
    const cleanPaths = paths.map((p) => {
      const marker = `/${bucketName}/`;
      const idx = p.indexOf(marker);
      return idx !== -1 ? p.slice(idx + marker.length) : p;
    });

    const client = getStorageClient();
    const { error } = await client.storage.from(bucketName).remove(cleanPaths);
    if (error) {
      console.warn('Storage removeObjects warning:', error.message);
    }
  } catch (err) {
    console.warn('Storage removeObjects warning:', err instanceof Error ? err.message : err);
  }
}
