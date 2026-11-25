/**
 * Điều hướng bàn phím trong menu (role="menu"): trả vị trí mục cần focus kế tiếp,
 * hoặc -1 nếu phím không thuộc điều hướng. Quay vòng ở hai đầu; Home/End nhảy tới đầu/cuối.
 * Mục bị khóa vẫn focus được (để đọc được lý do), nên không bị bỏ qua.
 */
export function nextMenuIndex(count: number, current: number, key: string): number {
  if (count <= 0) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowDown') return current < 0 ? 0 : (current + 1) % count;
  if (key === 'ArrowUp') return current < 0 ? count - 1 : (current - 1 + count) % count;
  return -1;
}
