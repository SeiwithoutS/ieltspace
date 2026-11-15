/**
 * Kiểm tra và theo dõi kích thước thiết bị hỗ trợ làm bài thi/luyện.
 * Quy tắc RS-01..RS-03:
 * - 'ok': Màn hình máy tính (width >= 1024px)
 * - 'small': Màn hình máy tính bảng (768px <= width < 1024px)
 * - 'phone': Màn hình điện thoại (width < 768px hoặc pointer: coarse và height < 500px)
 */

export type ScreenSupport = 'ok' | 'small' | 'phone';

export function getTestScreenSupport(): ScreenSupport {
  if (typeof window === 'undefined') return 'ok';
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;

  if (w < 768 || (isCoarse && h < 500)) {
    return 'phone';
  }
  if (w < 1024) {
    return 'small';
  }
  return 'ok';
}

export function subscribeScreenSupport(onChange: (support: ScreenSupport) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let current = getTestScreenSupport();
  const handler = () => {
    const next = getTestScreenSupport();
    if (next !== current) {
      current = next;
      onChange(next);
    }
  };
  window.addEventListener('resize', handler, { passive: true });
  window.addEventListener('orientationchange', handler, { passive: true });
  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('orientationchange', handler);
  };
}
