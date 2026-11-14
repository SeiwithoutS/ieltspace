
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
  | "saveError";
interface ConfirmationProps {
  kind: ConfirmationKind;
  skill: string;
  real: boolean;
  model: AttemptSummary | null;
  back: () => void;
  save: () => void;
  finish: () => void;
  jump: (n: number) => void;
}
const paths: Partial<Record<ConfirmationKind, string>> = {
  submit: "M5 12.5l4.5 4.5L19 7",
  expired: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0",
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
  kind,
  skill,
  real,
  model,
  back,
  save,
  finish,
  jump,
}: ConfirmationProps) {
  const saveExit = kind === "exit" || kind === "offline";
  const written = ["Writing", "Speaking"].includes(skill);
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
    exit: "Lưu và thoát?",
    offline: "Đang mất kết nối",
    saveError: "Chưa lưu được bản nháp",
    submit: written
      ? "Hoàn thành bài " + skill + "?"
      : real
        ? "Nộp bài " + skill + "?"
        : "Nộp phần đã chọn: " + scope,
  };
  const descriptions = {
    expired: "Thời gian làm bài đã kết thúc. Bạn có thể xem kết quả ngay.",
    exit: "Đồng hồ sẽ tạm dừng. Mở lại đề trong cùng tab để làm tiếp từ thời gian còn lại.",
    offline: "Bạn có thể lưu bài trên máy này và tiếp tục trong cùng tab.",
    saveError: "Trình duyệt chưa lưu được bản nháp. Hãy quay lại bài làm.",
    submit: written
      ? "Hoàn thành không tự gửi chấm và không dùng lượt hỗ trợ."
      : `Bạn đã trả lời ${rows.length - missing.length} trên ${rows.length} câu. Bấm số câu để quay lại làm tiếp.`,
  };
  return (
    <section className="attempt-card flex flex-col">
      <span
        className="dialog-icon"
        data-tone={
          kind === "expired" ||
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
        {kind !== "expired" && (
          <button onClick={back}>
            {saveExit
              ? "Ở lại"
              : written
                ? "Quay lại bài làm"
                : "Quay lại làm tiếp"}
          </button>
        )}
        {kind !== "saveError" && (
          <button className="primary" onClick={saveExit ? save : finish}>
            {saveExit
              ? "Lưu và thoát"
              : kind === "expired"
                ? "Xem kết quả"
                : written
                  ? "Hoàn thành"
                  : real
                    ? "Nộp bài"
                    : "Nộp phần đã chọn"}
          </button>
        )}
      </div>
    </section>
  );
}
