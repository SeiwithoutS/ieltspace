import "./attempt.css";
import RecordingList, { attemptButton, type DoneRecording, type LoadAudio } from "./RecordingList";

export type { DoneRecording };

/**
 * Nội dung trang xác nhận hoàn thành bài viết/nói (Speaking và Writing):
 * thời gian hoàn thành, số câu/Task, trạng thái tải lên/lưu, hạn lưu, nghe lại (Speaking) hoặc xem lại bài viết (Writing) và gửi chấm.
 * Chỉ vẽ giao diện; dữ liệu và thao tác do trang cha truyền vào.
 */
export type UploadView = {
  state: "uploading" | "done" | "incomplete" | "unknown" | "local";
  done: number;
  total: number;
};
export type GradingView = {
  state: "idle" | "sending" | "unavailable" | "sent" | "error";
  message?: string;
};
/** Một Task Writing đã viết: số từ và mức tối thiểu của đề (nếu biết). */
export interface DoneTask {
  key: string;
  label: string;
  words: number;
  minWords?: number | null;
}
export interface AttemptDoneSummaryProps {
  skill: "Speaking" | "Writing";
  /** Thời gian hoàn thành (giây). */
  elapsedSeconds: number | null;
  answered: number | null;
  upload: UploadView;
  onRetryUpload: () => void;
  /** Hạn lưu bản ghi (ISO) từ máy chủ; chưa chốt trên máy chủ thì chưa có. */
  expiresAt: string | null;
  recordings: DoneRecording[];
  /** Writing: số từ từng Task đã viết. */
  tasks?: DoneTask[];
  /** Writing: mở popup đọc lại bài viết (thay cho nghe lại). */
  onViewText?: () => void;
  /** Trả đường phát (blob local hoặc URL tạm); null nếu chưa nghe được. */
  loadAudio: LoadAudio;
  grading: GradingView;
  onSendGrading: () => void;
  /** Chưa chốt xong trên máy chủ thì chưa cho gửi chấm. */
  canGrade: boolean;
  /** Dòng báo thêm cho người học (câu không tải lên được, bài làm thử...). */
  notices?: string[];
  onHome: () => void;
  onHistory: () => void;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return mm + ":" + ss;
}
const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export function formatExpiry(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

const secondary = attemptButton;
const primary = secondary + " primary";

export default function AttemptDoneSummary(props: AttemptDoneSummaryProps) {
  const { skill, elapsedSeconds, answered, upload, expiresAt, grading } = props;
  const writing = skill === "Writing";
  const uploadText =
    upload.state === "local"
      ? "Chỉ lưu trên máy này"
      : upload.state === "done"
      ? writing
        ? "Đã lưu đủ"
        : "Đã tải lên đủ"
      : upload.state === "uploading"
        ? (writing ? "Đang lưu (" : "Đang tải lên (") + upload.done + "/" + upload.total + ")"
        : upload.state === "incomplete"
          ? (writing ? "Chưa lưu đủ (" : "Chưa tải lên đủ (") + upload.done + "/" + upload.total + "), đang tiếp tục thử"
          : "Đang kiểm tra";
  const uploadTone =
    upload.state === "done"
      ? "[background:var(--attempt-bg-e6f3ec)] [color:var(--attempt-text-24543d)]"
      : upload.state === "incomplete"
        ? "[background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-9d301e)]"
        : "[background:var(--attempt-bg-e3ecfd)] [color:var(--attempt-text-2257b8)]";
  const expiry = formatExpiry(expiresAt);
  return (
    <section
      className="attempt-card flex flex-col [box-shadow:0_1px_2px_rgba(53,_38,_55,_0.04),_0_6px_16px_rgba(53,_38,_55,_0.07)]"
      style={{ width: "min(640px, calc(100vw - 24px))" }}
      aria-labelledby="attempt-done-title"
    >
      <span className="dialog-icon" data-tone="mint" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      </span>
      <h2 id="attempt-done-title">{"Bạn đã hoàn thành bài " + skill}</h2>
      <dl className="m-0 grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] [gap:12px]">
        <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-d6d4d0)]">
          <dt className="[font-size:12px] [color:var(--attempt-text-706473)]">{"Thời gian hoàn thành"}</dt>
          <dd className="m-0 font-bold [font-size:20px]">
            {elapsedSeconds === null ? "--:--" : formatDuration(elapsedSeconds)}
          </dd>
        </div>
        <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-d6d4d0)]">
          <dt className="[font-size:12px] [color:var(--attempt-text-706473)]">{writing ? "Số Task đã viết" : "Số câu đã trả lời"}</dt>
          <dd className="m-0 font-bold [font-size:20px]">{answered === null ? "--" : answered}</dd>
        </div>
      </dl>
      {writing && props.tasks && props.tasks.length > 0 && (
        <ul className="m-0 [padding:0] [list-style:none] flex flex-col [gap:6px]">
          {props.tasks.map((task) => {
            const short = !!task.minWords && task.words > 0 && task.words < task.minWords;
            return (
              <li
                key={task.key}
                className="flex flex-wrap items-center justify-between [gap:8px] [padding:10px_14px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-d6d4d0)]"
              >
                <span className="font-semibold">{task.label}</span>
                <span className={short ? "[color:var(--attempt-text-7a5a0e)]" : ""}>
                  {task.words + " từ"}
                  {task.minWords ? " (tối thiểu " + task.minWords + ")" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-center [gap:10px]">
        <span
          role="status"
          className={"inline-flex items-center [height:26px] [padding:0_10px] rounded-full [font-size:13px] font-semibold " + uploadTone}
        >
          {uploadText}
        </span>
        {(upload.state === "incomplete" || upload.state === "uploading" || upload.state === "unknown") && (
          <button type="button" className={primary} onClick={props.onRetryUpload}>
            {"Lưu bài làm"}
          </button>
        )}
      </div>
      {upload.state === "done" && (
        <div
          role="status"
          className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-e6f3ec)] [color:var(--attempt-text-24543d)] [font-size:14px] font-semibold"
        >
          {expiry ? "Bài làm đã được lưu đến " + expiry + "." : "Bài làm đã được lưu."}
        </div>
      )}
      {upload.state !== "done" && upload.state !== "local" && (
        <p>{"Bài làm chưa được lưu xong. Bấm “Lưu bài làm” để tải lên và lưu ngay."}</p>
      )}
      {upload.state === "incomplete" && (
        <p>
          {(writing ? "Bài viết" : "Bản ghi") + " của bạn vẫn được giữ trên máy này. Hãy giữ nguyên trang hoặc quay lại sau khi có mạng, hệ thống sẽ tải lên và chốt bài tiếp."}
        </p>
      )}
      {props.notices?.map((text) => (
        <div
          key={text}
          role="status"
          className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:14px]"
        >
          {text}
        </div>
      ))}
      {upload.state !== "local" && (
      <p>
        {(writing ? "Bài viết" : "Bản ghi") +
          (expiry
            ? " được giữ đến " + expiry + " (14 ngày kể từ lúc hoàn thành)."
            : " được giữ 14 ngày kể từ lúc hoàn thành. Hạn lưu sẽ hiện ở đây khi bài được chốt.")}
      </p>
      )}
      {writing && props.onViewText && (
        <div>
          <button type="button" className={secondary} onClick={props.onViewText}>
            {"Xem lại bài viết"}
          </button>
        </div>
      )}
      {!writing && props.recordings.length > 0 && (
        <div>
          <strong>{"Nghe lại bài nói"}</strong>
          <RecordingList items={props.recordings} loadAudio={props.loadAudio} />
        </div>
      )}
      <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-e3ecfd)] [color:var(--attempt-text-2257b8)] [font-size:14px]">
        {"Hoàn thành chưa tự gửi bài đi chấm và chưa dùng lượt chấm. Khi sẵn sàng, bấm “Gửi cho Giáo viên chấm”; lượt chấm được tính theo quy định lượt miễn phí hằng tuần."}
      </div>
      {grading.state === "unavailable" && (
        <div role="status" className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:14px]">
          {"Tính năng gửi chấm sẽ sớm khả dụng. Bài của bạn đã được lưu, bạn có thể gửi sau."}
        </div>
      )}
      {grading.state === "sent" && (
        <div role="status" className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-e6f3ec)] [color:var(--attempt-text-24543d)] [font-size:14px]">
          {grading.message || "Đã gửi bài cho Giáo viên chấm."}
        </div>
      )}
      {grading.state === "error" && (
        <div role="alert" className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-9d301e)] [font-size:14px]">
          {grading.message || "Chưa gửi được bài. Hãy thử lại."}
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className={secondary} onClick={props.onHome}>
          {"Về trang chủ"}
        </button>
        <button type="button" className={secondary} onClick={props.onHistory}>
          {"Lịch sử làm bài"}
        </button>
        <button
          type="button"
          className={primary}
          onClick={props.onSendGrading}
          disabled={!props.canGrade || grading.state === "sending" || grading.state === "sent"}
        >
          {grading.state === "sending" ? "Đang gửi…" : "Gửi cho Giáo viên chấm"}
        </button>
      </div>
    </section>
  );
}
