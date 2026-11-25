import { env } from '../../config.js';
import { HttpError } from '../../utils/http.js';
import { getStorageClient } from './supabase-storage.js';

// Kho bản ghi âm Speaking của Người học: bucket RIÊNG TƯ (STORAGE_BUCKET_RECORDINGS), chỉ truy cập qua URL ký ngắn hạn.
// Giao diện tách riêng để service/test thay bằng bản giả.
export type RecordingStorage = {
  // URL ký để trình duyệt PUT thẳng file lên storage. upsert=false: storage từ chối ghi đè file đã có.
  createUploadUrl(path: string, upsert: boolean): Promise<string>;
  // null = file chưa có trong storage.
  statObject(path: string): Promise<{ size: number | null; contentType: string | null } | null>;
  createDownloadUrl(path: string, expiresInSec: number): Promise<string>;
  // Ném lỗi nếu xóa thất bại để job dọn dẹp thử lại lần sau (khác removeObjects cũ vốn nuốt lỗi).
  removeObjects(paths: string[]): Promise<void>;
};

const unavailable = () =>
  new HttpError(503, 'STORAGE_UNAVAILABLE', 'Dịch vụ lưu trữ ghi âm tạm thời không khả dụng. Vui lòng thử lại.');

export const supabaseRecordingStorage: RecordingStorage = {
  async createUploadUrl(path, upsert) {
    const { data, error } = await getStorageClient().storage
      .from(env.STORAGE_BUCKET_RECORDINGS)
      .createSignedUploadUrl(path, { upsert });
    if (error || !data?.signedUrl) throw unavailable();
    return data.signedUrl;
  },

  async statObject(path) {
    const { data, error } = await getStorageClient().storage.from(env.STORAGE_BUCKET_RECORDINGS).info(path);
    if (error) {
      const status = (error as { status?: number; statusCode?: number | string }).status
        ?? Number((error as { statusCode?: number | string }).statusCode);
      if (status === 400 || status === 404 || /not.?found/i.test(error.message)) return null;
      throw unavailable();
    }
    return { size: typeof data?.size === 'number' ? data.size : null, contentType: data?.contentType ?? null };
  },

  async createDownloadUrl(path, expiresInSec) {
    const { data, error } = await getStorageClient().storage
      .from(env.STORAGE_BUCKET_RECORDINGS)
      .createSignedUrl(path, expiresInSec);
    if (error || !data?.signedUrl) throw unavailable();
    return data.signedUrl;
  },

  async removeObjects(paths) {
    if (paths.length === 0) return;
    const { error } = await getStorageClient().storage.from(env.STORAGE_BUCKET_RECORDINGS).remove(paths);
    if (error) throw unavailable();
  },
};
