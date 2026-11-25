import { useState } from "react";
import "./attempt.css";

/** Danh sách câu đã ghi âm kèm nút "Nghe lại"; dùng chung cho trang hoàn thành bài và lịch sử Speaking. */
export interface DoneRecording {
  id: string;
  label: string;
  /** Độ dài hiển thị (ví dụ 01:25), nếu biết. */
  length?: string;
}
/** Trả đường phát (blob local hoặc URL tạm); null nếu chưa nghe được. Có thể ném Error có câu báo riêng. */
export type LoadAudio = (id: string) => Promise<string | null>;

// Màu và viền nút lấy từ .attempt-card button (kể cả chế độ tối); ở đây chỉ chỉnh kích thước.
export const attemptButton =
  "[height:38px] font-semibold [font-size:14px] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";

const DEFAULT_FAILURE = "Chưa nghe lại được lúc này, hãy thử lại sau.";

function Play({ item, loadAudio }: { item: DoneRecording; loadAudio: LoadAudio }) {
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "failed">("idle");
  const [message, setMessage] = useState(DEFAULT_FAILURE);
  async function open() {
    setState("loading");
    try {
      const url = await loadAudio(item.id);
      if (url) {
        setSrc(url);
        setState("idle");
      } else {
        setMessage(DEFAULT_FAILURE);
        setState("failed");
      }
    } catch (error) {
      setMessage(error instanceof Error && error.message ? error.message : DEFAULT_FAILURE);
      setState("failed");
    }
  }
  return (
    <li className="flex flex-wrap items-center [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
      <span className="[flex:1_1_120px] font-semibold">
        {item.label}
        {item.length && <span className="font-normal [color:var(--attempt-text-706473)]">{" · " + item.length}</span>}
      </span>
      {src ? (
        <audio controls autoPlay src={src} aria-label={"Nghe lại " + item.label} className="[height:36px]" />
      ) : (
        <button type="button" className={attemptButton} onClick={open} disabled={state === "loading"}>
          {state === "loading" ? "Đang tải…" : "Nghe lại"}
        </button>
      )}
      {state === "failed" && (
        <span role="status" className="[font-size:13px] [color:var(--attempt-text-c0412a)] [flex-basis:100%]">
          {message}
        </span>
      )}
    </li>
  );
}

export default function RecordingList({ items, loadAudio }: { items: DoneRecording[]; loadAudio: LoadAudio }) {
  return (
    <ul className="m-0 [padding:0] [list-style:none] [margin-top:6px]">
      {items.map((item) => (
        <Play key={item.id} item={item} loadAudio={loadAudio} />
      ))}
    </ul>
  );
}
