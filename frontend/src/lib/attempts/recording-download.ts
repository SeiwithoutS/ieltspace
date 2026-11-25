import { createZip, type ZipEntry } from '../shared/zip';
import { errorCode, errorStatus, getRecordingUrl, getSkillAttempt, isNetworkError } from './skill-attempts-api';
import { compareRecordingIds, recordingFileName, recordingZipName } from './recording-files';

/** Lỗi đã có câu báo tiếng Việt để hiển thị thẳng cho người học. */
export class RecordingDownloadError extends Error {}

export const EXPIRED_MESSAGE = 'Nội dung bài đã hết hạn nên không còn bản ghi để nghe hoặc tải.';

/** Đổi lỗi lấy URL ký (410 CONTENT_EXPIRED, mạng...) thành câu báo cho người học. */
export function recordingErrorMessage(error: unknown): string {
  if (error instanceof RecordingDownloadError) return error.message;
  if (errorStatus(error) === 410 || errorCode(error) === 'CONTENT_EXPIRED') return EXPIRED_MESSAGE;
  if (isNetworkError(error)) return 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.';
  return 'Chưa lấy được bản ghi lúc này, hãy thử lại sau.';
}

/**
 * Tải tất cả bản ghi của một lượt Speaking về một tệp .zip (kiểu STORE, tạo ngay trên trình duyệt).
 * URL ký có hiệu lực ngắn nên mỗi câu xin URL ngay trước khi tải; không log URL.
 * Nếu kho lưu trữ chưa cấu hình CORS cho nguồn của web, fetch bị chặn và hàm ném lỗi có câu báo riêng.
 */
export async function downloadRecordingsZip(
  attemptId: string,
  title: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  let detail;
  try {
    detail = await getSkillAttempt(attemptId);
  } catch (error) {
    throw new RecordingDownloadError(recordingErrorMessage(error));
  }
  const ids = detail.recordings
    .filter(item => item.status === 'UPLOADED')
    .map(item => item.questionId)
    .sort(compareRecordingIds);
  if (!ids.length) throw new RecordingDownloadError('Bài này chưa có bản ghi nào để tải.');

  const entries: ZipEntry[] = [];
  onProgress?.(0, ids.length);
  for (const id of ids) {
    let url: string;
    try {
      url = (await getRecordingUrl(attemptId, id)).url;
    } catch (error) {
      throw new RecordingDownloadError(recordingErrorMessage(error));
    }
    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new RecordingDownloadError(
        'Không tải được tệp ghi âm: mất mạng hoặc trình duyệt chặn truy cập từ web này (CORS của kho lưu trữ). Nếu lỗi lặp lại, hãy báo quản trị viên kiểm tra cấu hình.',
      );
    }
    if (response.status === 410 || response.status === 404)
      throw new RecordingDownloadError(EXPIRED_MESSAGE);
    if (!response.ok) throw new RecordingDownloadError('Tải một tệp ghi âm chưa được (mã ' + response.status + '), hãy thử lại.');
    const buffer = new Uint8Array(await response.arrayBuffer());
    entries.push({ name: recordingFileName(id, response.headers.get('content-type')), data: buffer });
    onProgress?.(entries.length, ids.length);
  }

  const blob = new Blob([createZip(entries)], { type: 'application/zip' });
  const href = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = href;
    link.download = recordingZipName(title);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Để trình duyệt kịp bắt đầu tải rồi mới thu hồi.
    window.setTimeout(() => URL.revokeObjectURL(href), 10_000);
  }
}
