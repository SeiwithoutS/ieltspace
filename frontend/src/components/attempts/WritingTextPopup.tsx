import { useEffect, useState } from "react";
import Popup from "./Popup";
import { attemptButton } from "./RecordingList";
import { errorCode, errorStatus, getWritingText } from "../../lib/attempts/skill-attempts-api";
import { countWords, type WritingTaskKey } from "../../lib/attempts/writing-text";

/**
 * Popup "Xem bài viết" (trang xác nhận hoàn thành và lịch sử Writing): đọc lại văn bản từng Task.
 * Có `texts` (bài còn trên máy, chưa chốt) thì hiện luôn, không gọi máy chủ; không thì lấy qua
 * GET writing/:taskKey. Chỉ đọc, không đổi hạn lưu. Nội dung bài viết không được ghi log.
 */
const TASKS: { key: WritingTaskKey; label: string }[] = [
  { key: "task1", label: "Task 1" },
  { key: "task2", label: "Task 2" },
];
type Loaded = Partial<Record<WritingTaskKey, string>>;

export default function WritingTextPopup({
  attemptId,
  title,
  texts,
  onClose,
}: {
  attemptId?: string;
  title: string;
  texts?: Loaded;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(texts ?? null);
  const [error, setError] = useState("");
  const [active, setActive] = useState<WritingTaskKey>("task2");

  useEffect(() => {
    if (texts || !attemptId) return;
    let live = true;
    Promise.all(TASKS.map((t) => getWritingText(attemptId, t.key)))
      .then((rows) => {
        if (!live) return;
        const next: Loaded = {};
        rows.forEach((row, i) => (next[TASKS[i].key] = row.text));
        setLoaded(next);
        // Mở sẵn Task có chữ (ưu tiên Task 2 như bài chính).
        if (!next.task2 && next.task1) setActive("task1");
      })
      .catch((e) => {
        if (!live) return;
        setError(
          errorStatus(e) === 410 || errorCode(e) === "CONTENT_EXPIRED"
            ? "Nội dung bài đã hết hạn nên bài viết đã bị xóa."
            : "Chưa mở được bài viết lúc này, hãy thử lại sau.",
        );
      });
    return () => {
      live = false;
    };
  }, [attemptId, texts]);

  const text = loaded?.[active] ?? "";
  return (
    <Popup title="Xem bài viết" onCancel={onClose}>
      <section className="attempt-card flex flex-col gap-4" style={{ width: "min(640px, calc(100vw - 24px))" }}>
        <h2>{"Xem bài viết"}</h2>
        <p className="m-0 [color:var(--attempt-text-706473)]">{title}</p>
        {error ? (
          <p role="alert" className="m-0 [color:var(--attempt-text-c0412a)]">{error}</p>
        ) : loaded === null ? (
          <p role="status" className="m-0">{"Đang tải bài viết…"}</p>
        ) : (
          <>
            <div role="group" aria-label="Chọn Task" className="flex gap-2">
              {TASKS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={t.key === active}
                  className={attemptButton + (t.key === active ? " primary" : "")}
                  onClick={() => setActive(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="[font-size:13px] [color:var(--attempt-text-706473)]">
              {countWords(text) + " từ"}
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label={"Bài viết " + (active === "task1" ? "Task 1" : "Task 2")}
              className="[white-space:pre-wrap] [overflow-wrap:anywhere] [max-height:50vh] [overflow-y:auto] [padding:12px_14px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-d6d4d0)] [line-height:1.7]"
            >
              {text || "Task này chưa có bài viết."}
            </div>
          </>
        )}
        <div className="flex justify-end">
          <button type="button" className={attemptButton + " primary"} onClick={onClose}>{"Đóng"}</button>
        </div>
      </section>
    </Popup>
  );
}
