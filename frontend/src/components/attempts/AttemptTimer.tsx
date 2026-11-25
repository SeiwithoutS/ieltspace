import { useEffect, useRef, useState } from "react";
import { TIME_WARN_SECONDS } from "../../lib/attempts/time-limits";

export function formatClock(seconds: number): string {
  return (
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0")
  );
}

interface TimerOptions {
  /** Đồng hồ chạy khi true. */
  active: boolean;
  /** Giới hạn tính bằng giây; 0 là không giới hạn (đếm lên). */
  limitSeconds: number;
  /** Số giây đã dùng khi bắt đầu hoặc làm tiếp. */
  initialElapsed: number;
  onExpire: () => void;
  /**
   * Mốc tuyệt đối (ms, Date.now) bắt đầu tính giờ. Có thì giây đã dùng luôn là
   * (bây giờ - mốc) và đổi mốc làm đồng hồ nhảy theo (đồng bộ với máy chủ); không có thì đếm từ initialElapsed.
   */
  epoch?: number;
}

/** Đồng hồ làm bài: đếm ngược khi có giới hạn, đếm lên khi không; luôn trả số giây đã dùng. */
export function useAttemptTimer({
  active,
  limitSeconds,
  initialElapsed,
  onExpire,
  epoch,
}: TimerOptions) {
  const [elapsed, setElapsed] = useState(initialElapsed);
  const expire = useRef(onExpire);
  expire.current = onExpire;
  const base = useRef(initialElapsed);
  base.current = initialElapsed;
  useEffect(() => {
    if (!active) return;
    const from = base.current;
    const startedAt = Date.now();
    const used = () =>
      epoch !== undefined
        ? Math.max(0, Math.floor((Date.now() - epoch) / 1000))
        : from + Math.floor((Date.now() - startedAt) / 1000);
    setElapsed(used());
    const timer = setInterval(() => {
      const value = used();
      if (limitSeconds > 0 && value >= limitSeconds) {
        clearInterval(timer);
        setElapsed(limitSeconds);
        expire.current();
        return;
      }
      setElapsed(value);
    }, 500);
    return () => clearInterval(timer);
  }, [active, limitSeconds, epoch]);
  const countdown = limitSeconds > 0;
  const remaining = countdown ? Math.max(0, limitSeconds - elapsed) : 0;
  return {
    elapsedSeconds: elapsed,
    remainingSeconds: remaining,
    countdown,
    timeText: formatClock(countdown ? remaining : elapsed),
    timeWarn:
      countdown &&
      remaining <= Math.min(TIME_WARN_SECONDS, Math.floor(limitSeconds / 4)),
  };
}
