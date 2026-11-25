import type { AttemptMode, Skill } from "../../components/attempts/types";

/** Mức thời gian tính bằng phút; 0 là không giới hạn (đồng hồ đếm lên). */
export const UNLIMITED = 0;

export const SPEAKING_REAL_MINUTES = 15;
export const SPEAKING_PRACTICE_LEVELS = [UNLIMITED, 15, 20, 25, 30];
export const READING_SECTION_LEVELS = [UNLIMITED, 10, 15, 20];
export const READING_SECTION_CAP = 20;
export const READING_FULL_MINUTES = 60;
/** Cảnh báo sắp hết giờ khi còn dưới số giây này. */
export const TIME_WARN_SECONDS = 5 * 60;

/** Giờ cố định của các kỹ năng chưa có bộ chọn (giữ như trước đây). */
const FIXED_REAL_MINUTES: Partial<Record<Skill, number>> = {
  listening: 30,
  writing: 60,
};

export interface TimeLimitConfig {
  /** Các mức có thể chọn; rỗng nghĩa là không có bộ chọn. */
  options: number[];
  /** Mức mặc định (phút, 0 là không giới hạn). */
  defaultValue: number;
  /** Cố định, hiện nhưng không cho đổi. */
  locked: boolean;
}

export interface TimeLimitInput {
  skill: Skill;
  mode: AttemptMode;
  /** Số section/passage đã chọn (Reading). */
  sectionCount?: number;
}

export function getTimeLimitConfig({
  skill,
  mode,
  sectionCount = 1,
}: TimeLimitInput): TimeLimitConfig {
  const none = { options: [], defaultValue: UNLIMITED, locked: false };
  if (skill === "speaking") {
    if (mode === "real")
      return {
        options: [SPEAKING_REAL_MINUTES],
        defaultValue: SPEAKING_REAL_MINUTES,
        locked: true,
      };
    return {
      options: SPEAKING_PRACTICE_LEVELS,
      defaultValue: UNLIMITED,
      locked: false,
    };
  }
  if (skill === "reading") {
    if (mode === "real")
      return {
        options: [READING_FULL_MINUTES],
        defaultValue: READING_FULL_MINUTES,
        locked: true,
      };
    const n = Math.max(1, sectionCount);
    return {
      options: READING_SECTION_LEVELS.map((m) => m * n),
      defaultValue: UNLIMITED,
      locked: false,
    };
  }
  if (mode === "real") {
    const fixed = FIXED_REAL_MINUTES[skill] ?? UNLIMITED;
    return { ...none, defaultValue: fixed, locked: true };
  }
  return none;
}

/**
 * Mức thời gian theo chỉ số trong `config.options` (không theo số phút, để đổi
 * số section thì mức đã chọn vẫn là cùng một bậc). Chỉ số sai thì rơi về mặc định.
 */
export function resolveTimeLimit(
  config: TimeLimitConfig,
  index: number | undefined,
): number {
  if (config.locked) return config.defaultValue;
  if (index !== undefined && index >= 0 && index < config.options.length)
    return config.options[index];
  return config.defaultValue;
}

export function limitLabel(minutes: number): string {
  return minutes === UNLIMITED ? "Không giới hạn" : minutes + " phút";
}

/**
 * Giới hạn gửi lên máy chủ khi tạo lượt: số nguyên 1..max (Practice có chọn mức) hoặc null
 * (Không giới hạn, và Thi thật vì giờ do máy chủ tính). 0 hay số ngoài khoảng đều thành null.
 */
export function apiLimitMinutes(
  mode: "real" | "practice",
  minutes: number | undefined,
  /** Trần theo kỹ năng: Speaking 30 (mặc định), Writing 60. */
  max = 30,
): number | null {
  if (mode === "real") return null;
  return Number.isInteger(minutes) && (minutes as number) >= 1 && (minutes as number) <= max
    ? (minutes as number)
    : null;
}
