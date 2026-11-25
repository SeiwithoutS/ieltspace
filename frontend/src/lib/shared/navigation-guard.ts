/**
 * Guard nhận đích đến (route không có dấu #, ví dụ "AdminExams"; có thể undefined khi không biết).
 * Trả boolean (đồng bộ, như trước) hoặc Promise<boolean> khi cần hỏi người dùng bằng hộp thoại trong app:
 * resolve true = cho đi tiếp, false = ở lại. App tự điều hướng tới đích sau khi Promise resolve true.
 */
export type NavigationGuard = (target?: string) => boolean | Promise<boolean>;

let activeGuard: NavigationGuard | null = null;

export function registerNavigationGuard(guard: NavigationGuard): () => void {
  activeGuard = guard;
  return () => {
    if (activeGuard === guard) activeGuard = null;
  };
}

/** Kết quả thô của guard hiện tại (có thể là Promise). */
export function checkNavigation(target?: string): boolean | Promise<boolean> {
  return activeGuard?.(target) ?? true;
}

/** Bản đồng bộ cho nơi gọi cũ: guard bất đồng bộ được coi là chưa cho đi (hộp thoại vẫn hiện). */
export function canNavigate(target?: string): boolean {
  return checkNavigation(target) === true;
}

/** Chạy `run` ngay nếu được phép, hoặc sau khi người dùng xác nhận trong hộp thoại. Trả true nếu chạy ngay. */
export function whenNavigationAllowed(target: string | undefined, run: () => void): boolean {
  const result = checkNavigation(target);
  if (result === true) {
    run();
    return true;
  }
  if (result !== false) {
    void result.then(ok => {
      if (ok) run();
    });
  }
  return false;
}
