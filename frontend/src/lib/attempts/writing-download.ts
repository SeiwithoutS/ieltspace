import { downloadBlob } from '../shared/download';
import { createWritingDocx } from './writing-docx';
import { sanitizeName } from './recording-files';
import { errorStatus, getSavedWriting, isNetworkError } from './skill-attempts-api';

const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export async function downloadWritingDocx(attemptId: string, title: string) {
  const { tasks } = await getSavedWriting(attemptId);
  if (!tasks.length) throw new Error('Bài này chưa có văn bản đã lưu để tải.');
  const name = sanitizeName(title) || 'bai-lam';
  downloadBlob(new Blob([createWritingDocx(title, tasks)], { type: mime }),
    `ieltspace-writing-${name}-${attemptId.slice(0, 8)}.docx`);
}

export function writingContentError(error: unknown) {
  if (errorStatus(error) === 410) return 'Bài viết đã hết hạn lưu.';
  if (isNetworkError(error)) return 'Không kết nối được máy chủ. Hãy thử lại khi có mạng.';
  return error instanceof Error ? error.message : 'Chưa đọc được bài viết. Hãy thử lại.';
}
