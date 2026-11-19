/**
 * Điều kiện màn hình được làm bài thi/luyện (RS-01..RS-03).
 * Phải giống hệt điều kiện trong components/attempts/DesktopOnly.tsx,
 * là nơi thực thi chặn làm bài.
 */
export const DESKTOP_TEST_QUERY =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export function canTakeTest(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return true;
  return window.matchMedia(DESKTOP_TEST_QUERY).matches;
}
