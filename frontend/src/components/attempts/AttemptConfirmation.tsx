import { useState } from "react";
export interface QuestionSummary {
  n: number;
  flagged?: boolean;
  value?: string;
  options?: { checked: boolean }[];
}
export interface AttemptSummary {
  formRows?: QuestionSummary[];
  questions?: QuestionSummary[];
}
export type ConfirmationKind =
  | "submit"
  | "expired"
  | "exit"
  | "offline"
  | "saveError"
  | "discardConfirm";
interface ConfirmationProps {
  kind: ConfirmationKind;
  skill: string;
  real: boolean;
  /** Speaking: trình duyệt không lưu được bản ghi lên đĩa, bản ghi sẽ mất nếu thoát. */
  memoryOnly?: boolean;
  /** Đang tải bản ghi lên và chốt bài: khóa nút, hiện trạng thái. */
  busy?: boolean;
  model: AttemptSummary | null;
  back: () => void;
  save: () => void;
  finish: () => void;
  /** Hết giờ, chọn "Không lưu": hủy bài làm. */
  discard: () => void;
  jump: (n: number) => void;
}
const LOSE_RECORDINGS =
  "Trình duyệt không lưu được bản ghi âm trên máy này, nên các bản ghi sẽ mất nếu bạn thoát hoặc tải lại trang. Đồng hồ vẫn chạy khi bạn rời đi. Hãy ở lại làm hết bài nếu có thể.";
const paths: Partial<Record<ConfirmationKind, string>> = {
  submit: "M5 12.5l4.5 4.5L19 7",
  expired: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0",
  discardConfirm: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5 M14 11v5",
  exit: "M4 3h13l4 4v14H4z M8 3v6h8V3 M8 21v-8h9v8",
  offline:
    "M3 3l18 18 M2 8a16 16 0 0 1 3-2 M10 4a16 16 0 0 1 12 4 M7 13a8 8 0 0 1 5-2 M10 17a3 3 0 0 1 4 0",
};
function QuestionList({
  label,
  numbers,
  jump,
  flagged = false,
}: {
  label: string;
  numbers: number[];
  jump: (n: number) => void;
  flagged?: boolean;
}) {
  if (!numbers.length) return null;
  return (
    <div>
      <strong>
        {label} ({numbers.length} câu)
      </strong>
      <div className="question-list">
        {numbers.map((n) => (
          <button
            key={n}
            className={"question-chip" + (flagged ? " flagged" : "")}
            aria-label={label + ", đến câu " + n}
            onClick={() => jump(n)}
          >
            {flagged && (
              <svg
                aria-hidden="true"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
              </svg>
            )}
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
export default function AttemptConfirmation({
  kind: baseKind,
  skill,
  real,
  memoryOnly = false,
  busy = false,
  model,
  back,
  save,
  finish,
  discard,
  jump,
}: ConfirmationProps) {
  const [askDiscard, setAskDiscard] = useState(false);
  const written = ["Writing", "Speaking"].includes(skill);
  // Hết giờ và Hoàn thành bài W/S cùng hỏi "lưu bài làm không?" (Lưu / Không lưu).
  const askSave = baseKind === "expired" || (baseKind === "submit" && written);
  const kind: ConfirmationKind =
    askSave && askDiscard ? "discardConfirm" : baseKind;
  const saveExit = kind === "exit" || kind === "offline";
  const loseRecordings = kind === "exit" && skill === "Speaking" && memoryOnly;
  const objective = kind === "submit" && !written;
  const scope = skill === "Reading" ? "Passage 1" : "Section 1";
  const rows = [...(model?.formRows || []), ...(model?.questions || [])];
  const missing = rows
    .filter(
      (row) => !(row.value?.trim() || row.options?.some((o) => o.checked)),
    )
    .map((row) => row.n);
  const titles = {
    expired: "Đã hết giờ",
    discardConfirm: "Hủy bài làm?",
    exit: loseRecordings ? "Thoát sẽ mất bản ghi âm" : "Lưu và thoát?",
    offline: "Đang mất kết nối",
    saveError: "Chưa lưu được bản nháp",
    submit: written
      ? "Lưu bài làm?"
      : real
        ? "Nộp bài " + skill + "?"
        : "Nộp phần đã chọn: " + scope,
  };
  const descriptions = {
    expired: "Đã hết giờ, bạn có muốn lưu bài làm không?",
    discardConfirm:
      skill === "Speaking"
        ? "Bài làm và bản ghi âm sẽ bị xóa, không thể khôi phục."
        : "Bài làm sẽ bị xóa, không thể khôi phục.",
    exit: loseRecordings
      ? LOSE_RECORDINGS
      : skill === "Speaking"
        ? "Các câu đã ghi âm được lưu trên máy này. Đồng hồ vẫn chạy khi bạn rời đi. Mở lại đề trên máy này để làm tiếp. " +
          (real
            ? "Câu Part 1 hoặc Part 3 đang nói dở được giữ làm đáp án rồi chuyển sang câu kế, không ghi lại được; Part 2 đang làm dở quay về phần chuẩn bị."
            : "Câu đang nói dở sẽ được làm lại từ đầu.")
        : skill === "Writing"
          ? "Bài viết được giữ trên máy này và tự lưu lên máy chủ khi có mạng. Đồng hồ vẫn chạy khi bạn rời đi. Mở lại đề trên máy này để làm tiếp."
          : "Đồng hồ sẽ tạm dừng. Bài được lưu trên máy này trong 24 giờ; mở lại đề trên máy này để làm tiếp từ thời gian còn lại.",
    // Speaking không dùng hộp này (ConnectionNotice báo mất mạng, bài vẫn chạy).
    offline: "Bạn có thể lưu bài trên máy này và tiếp tục sau trên máy này trong 24 giờ.",
    saveError: "Trình duyệt chưa lưu được bản nháp. Hãy quay lại bài làm.",
    submit: written
      ? "Bạn có muốn lưu bài làm không? Lưu bài không tự gửi chấm và không dùng lượt hỗ trợ."
      : `Bạn đã trả lời ${rows.length - missing.length} trên ${rows.length} câu. Bấm số câu để quay lại làm tiếp.`,
  };
  return (
    <section className="attempt-card flex flex-col">
      <span
        className="dialog-icon"
        data-tone={
          kind === "discardConfirm"
            ? "danger"
            : kind === "expired" ||
                kind === "offline" ||
                (written && kind === "submit")
              ? "butter"
              : kind === "exit" || (skill === "Listening" && real)
              ? "sky"
              : objective && !real
                ? "mint"
                : "blue"
        }
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={paths[kind] || paths.exit} />
        </svg>
      </span>
      {(objective || kind === "expired") && (
        <span className={"mode-badge " + (real ? "" : "practice")}>
          {real ? "Real Test" : "Practice"}
        </span>
      )}
      <h2 id="attempt-confirm-title">{titles[kind]}</h2>
      <p>{descriptions[kind]}</p>
      {busy && (
        <p role="status">
          {skill === "Writing"
            ? "Đang lưu bài viết và chốt bài, vui lòng giữ nguyên trang…"
            : "Đang tải bản ghi lên và chốt bài, vui lòng giữ nguyên trang…"}
        </p>
      )}
      {objective && (
        <>
          <QuestionList label="Chưa làm" numbers={missing} jump={jump} />
          <QuestionList
            flagged
            label="Còn gắn cờ Xem lại"
            numbers={rows.filter((q) => q.flagged).map((q) => q.n)}
            jump={jump}
          />
          <p>
            {real
              ? "Câu bỏ trống được tính là không đúng."
              : "Kết quả luyện tập chỉ hiện số câu đúng và lời giải, không tính band."}
          </p>
        </>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        {(kind === "expired" || (kind === "submit" && written)) && (
          <button
            className="danger"
            disabled={busy}
            onClick={() => setAskDiscard(true)}
          >
            Không lưu
          </button>
        )}
        {kind === "discardConfirm" && (
          <>
            <button onClick={() => setAskDiscard(false)}>Quay lại</button>
            <button className="danger-solid" onClick={discard}>
              Xóa bài làm
            </button>
          </>
        )}
        {kind !== "expired" && kind !== "discardConfirm" && (
          <button onClick={back} disabled={busy}>
            {saveExit
              ? "Ở lại"
              : written && kind !== "submit"
                ? "Quay lại bài làm"
                : "Quay lại làm tiếp"}
          </button>
        )}
        {kind !== "saveError" && kind !== "discardConfirm" && (
          <button
            className="primary"
            disabled={busy}
            onClick={saveExit ? save : finish}
          >
            {saveExit
              ? loseRecordings
                ? "Vẫn thoát"
                : "Lưu và thoát"
              : kind === "expired"
                ? written
                  ? "Lưu"
                  : "Nộp bài"
                : written
                  ? "Lưu bài làm"
                  : real
                    ? "Nộp bài"
                    : "Nộp phần đã chọn"}
          </button>
        )}
      </div>
    </section>
  );
}
