import { useEffect, useState } from "react";

/**
 * Nhắc người học không tắt màn hình, không chuyển trang khi làm bài, kèm trạng
 * thái mạng. Nếu trình duyệt hỗ trợ Screen Wake Lock thì giữ màn hình sáng
 * (không hỗ trợ hoặc bị từ chối thì bỏ qua, lời nhắc vẫn hiện).
 */
export default function ConnectionNotice({
  keepAwake = true,
  persistent = true,
}: {
  keepAwake?: boolean;
  /** false: bản ghi âm chỉ giữ tạm trong bộ nhớ (trình duyệt không lưu được lên máy). */
  persistent?: boolean;
}) {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!keepAwake) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    async function acquire() {
      try {
        if (!("wakeLock" in navigator) || document.visibilityState !== "visible")
          return;
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void next.release().catch(() => undefined);
          return;
        }
        lock = next;
        setAwake(true);
        next.addEventListener("release", () => setAwake(false));
      } catch {
        setAwake(false);
      }
    }
    // Trình duyệt tự thả khóa khi tab bị ẩn, nên xin lại khi quay về.
    const onVisible = () => {
      if (document.visibilityState === "visible" && (!lock || lock.released))
        void acquire();
    };
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, [keepAwake]);

  return (
    <div
      role={online ? "note" : "alert"}
      className="flex [gap:10px] items-start [padding:12px_16px] rounded-xl [border:1.5px_solid_var(--attempt-line-d6d4d0)] [font-size:14px] [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-9d301e)]"
    >
      <span className="[flex:0_0_18px] [margin-top:2px]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {online ? (
            <>
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 11v5M12 8h.01"></path>
            </>
          ) : (
            <path d="M3 3l18 18 M2 8a16 16 0 0 1 3-2 M10 4a16 16 0 0 1 12 4 M7 13a8 8 0 0 1 5-2 M10 17a3 3 0 0 1 4 0"></path>
          )}
        </svg>
      </span>
      {online ? (
        <span>
          <strong>{"Không tắt màn hình, không chuyển trang hoặc đóng tab"}</strong>
          {" khi đang làm bài. Mạng đang ổn định."}
          {awake ? " Màn hình được giữ sáng." : ""}
        </span>
      ) : (
        <span>
          <strong>{"Mất kết nối."}</strong>
          {persistent
            ? " Hãy giữ nguyên trang, bài làm của bạn vẫn đang được ghi và lưu trên máy."
            : " Hãy giữ nguyên trang. Trình duyệt không lưu được bản ghi âm lên máy này nên bản ghi chỉ tạm trong bộ nhớ, sẽ mất nếu bạn tải lại hoặc đóng tab."}
        </span>
      )}
    </div>
  );
}
