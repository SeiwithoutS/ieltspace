/**
 * Logic thuần cho lựa chọn Part/Section/Passage ở hộp "Bắt đầu làm bài" (kiểm thử bằng node).
 */

/**
 * Số passage Reading mà trang làm bài hiện chạy được. Trang ReadingTest còn dùng dữ liệu
 * mẫu có đúng một passage nên chỉ cho chọn một; khi trang đọc được nhiều passage thì tăng
 * số này (hộp chọn tự mở chọn nhiều, mức trần thời gian tự tính theo số passage thật).
 */
export const READING_PLAYABLE_PASSAGES = 1;

/** Chỉ số Part/Section hợp lệ (số nguyên, trong khoảng 0..count-1), không trùng, tăng dần. */
export function normalizeParts(parts: unknown, count: number): number[] {
  if (!Array.isArray(parts)) return [];
  const ok = parts.filter(
    (n): n is number => Number.isInteger(n) && n >= 0 && n < count,
  );
  return [...new Set(ok)].sort((a, b) => a - b);
}

/**
 * Số passage/section thật sự được làm: không vượt quá số trang làm bài chạy được.
 * `available` rỗng (không giới hạn) thì lấy đúng số đã chọn.
 */
export function runnableCount(selected: number, available?: number): number {
  const n = Math.max(1, selected);
  return available === undefined ? n : Math.min(n, Math.max(1, available));
}

/**
 * Giá trị `section` trên URL (1-based, từ trang chi tiết) thành lựa chọn mặc định (0-based).
 * Sai dạng hoặc ngoài khoảng thì trả về undefined (dùng lựa chọn mặc định của hộp).
 */
export function initialPartsFromSection(
  section: string | null | undefined,
  count: number,
): number[] | undefined {
  if (!section || !/^\d{1,2}$/.test(section)) return undefined;
  const n = Number(section);
  return n >= 1 && n <= count ? [n - 1] : undefined;
}
