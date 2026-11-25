/** Nhãn và tên tệp cho bản ghi âm Speaking; mã câu có dạng p<Part>q<chỉ số từ 0>, ví dụ p1q0. */

export function recordingLabel(id: string): string {
  const m = /^p(\d+)q(\d+)$/.exec(id);
  if (!m) return id;
  return Number(m[1]) === 2 ? 'Part 2' : 'Part ' + m[1] + ' · Câu ' + (Number(m[2]) + 1);
}

export const compareRecordingIds = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true });

export function formatRecordingLength(durationMs: number | null | undefined): string {
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs) || durationMs <= 0) return '';
  const s = Math.round(durationMs / 1000);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

/** Đuôi tệp theo mime (bỏ phần ;codecs=...); không nhận ra thì dùng webm như trình ghi âm của app. */
export function extensionForMime(mime: string | null | undefined): string {
  const type = (mime ?? '').split(';')[0].trim().toLowerCase();
  if (type === 'audio/mp4' || type === 'audio/x-m4a' || type === 'audio/aac') return 'm4a';
  if (type === 'audio/ogg' || type === 'application/ogg') return 'ogg';
  if (type === 'audio/mpeg' || type === 'audio/mp3') return 'mp3';
  if (type === 'audio/wav' || type === 'audio/x-wav' || type === 'audio/wave') return 'wav';
  return 'webm';
}

/** p1q0 -> p1-c1.webm (Câu đánh số từ 1); mã lạ thì làm sạch rồi giữ nguyên. */
export function recordingFileName(id: string, mime: string | null | undefined): string {
  const m = /^p(\d+)q(\d+)$/.exec(id);
  const base = m ? 'p' + m[1] + '-c' + (Number(m[2]) + 1) : sanitizeName(id) || 'ghi-am';
  return base + '.' + extensionForMime(mime);
}

/** Làm sạch tên để dùng làm tên tệp: bỏ dấu tiếng Việt, ký tự cấm, gom thành gạch ngang. */
export function sanitizeName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/** ieltspace-speaking-<tên bài>-<yyyy-mm-dd>.zip; ngày theo múi giờ Việt Nam. */
export function recordingZipName(title: string, now: Date = new Date()): string {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
  const name = sanitizeName(title);
  return 'ieltspace-speaking-' + (name ? name + '-' : '') + date + '.zip';
}
