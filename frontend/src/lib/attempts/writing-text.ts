/**
 * Logic thuần của bài Writing (kiểm thử bằng node): khóa Task, đếm từ và cảnh báo số từ tối thiểu.
 * Cách đếm từ PHẢI giống backend (`countWords` ở backend/src/modules/attempts/attempts.service.ts):
 * cắt khoảng trắng hai đầu rồi tách theo khoảng trắng.
 */
export type WritingTaskKey = "task1" | "task2";

/** Giới hạn ký tự của một Task do máy chủ quy định. */
export const WRITING_MAX_CHARS = 20_000;
/** Số từ tối thiểu mặc định khi đề không cấu hình. */
export const WRITING_DEFAULT_MIN_WORDS: Record<1 | 2, number> = { 1: 150, 2: 250 };

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function taskKeyOf(task: 1 | 2): WritingTaskKey {
  return task === 1 ? "task1" : "task2";
}
export function taskNumberOf(key: WritingTaskKey): 1 | 2 {
  return key === "task1" ? 1 : 2;
}

/** Số từ còn thiếu so với mức tối thiểu; 0 khi đã đủ hoặc đề không đặt mức. */
export function wordsShort(words: number, minWords: number | null | undefined): number {
  if (!minWords || minWords <= 0) return 0;
  return Math.max(0, minWords - words);
}

/** Dòng cảnh báo dưới số từ tối thiểu; chuỗi rỗng khi đã đủ. Chưa viết gì thì không cảnh báo. */
export function minWordsWarning(words: number, minWords: number | null | undefined): string {
  if (words <= 0) return "";
  const short = wordsShort(words, minWords);
  if (short <= 0) return "";
  return (
    "Bài viết còn thiếu " + short + " từ so với mức tối thiểu " + minWords +
    " từ. Bạn vẫn có thể hoàn thành bài, nhưng bài quá ngắn thường bị trừ điểm."
  );
}
