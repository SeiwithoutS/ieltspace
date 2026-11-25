import { useState } from "react";
import "./attempt.css";

/**
 * Nội dung trang xác nhận hoàn thành bài viết/nói (Speaking trước, Writing dùng lại sau):
 * thời gian hoàn thành, số câu, trạng thái tải lên, hạn lưu, nghe lại và gửi chấm.
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
export interface DoneRecording {
  id: string;
  label: string;
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
  /** Trả đường phát (blob local hoặc URL tạm); null nếu chưa nghe được. */
  loadAudio: (id: string) => Promise<string | null>;
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

// Màu và viền nút lấy từ .attempt-card button (kể cả chế độ tối); ở đây chỉ chỉnh kích thước.
const secondary =
  "[height:40px] font-semibold [font-size:14px] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";
const primary = secondary + " primary";

function Play({ item, loadAudio }: { item: DoneRecording; loadAudio: AttemptDoneSummaryProps["loadAudio"] }) {
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "failed">("idle");
  async function open() {
    setState("loading");
    const url = await loadAudio(item.id).catch(() => null);
    if (url) {
      setSrc(url);
      setState("idle");
    } else setState("failed");
  }
  return (
    <li className="flex flex-wrap items-center [gap:10px] [padding:10px_0] [border-top:1px_solid_var(--attempt-line-e6e4e0)]">
      <span className="[flex:1_1_120px] font-semibold">{item.label}</span>
      {src ? (
        <audio controls autoPlay src={src} aria-label={"Nghe lại " + item.label} className="[height:36px]" />
      ) : (
        <button type="button" className={secondary} onClick={open} disabled={state === "loading"}>
          {state === "loading" ? "Đang tải…" : "Nghe lại"}
        </button>
      )}
      {state === "failed" && (
        <span role="status" className="[font-size:13px] [color:var(--attempt-text-c0412a)]">
          {"Chưa nghe lại được lúc này, hãy thử lại sau."}
        </span>
      )}
    </li>
  );
}

export default function AttemptDoneSummary(props: AttemptDoneSummaryProps) {
  const { skill, elapsedSeconds, answered, upload, expiresAt, grading } = props;
  const uploadText =
    upload.state === "local"
      ? "Chỉ lưu trên máy này"
      : upload.state === "done"
      ? "Đã tải lên đủ"
      : upload.state === "uploading"
        ? "Đang tải lên (" + upload.done + "/" + upload.total + ")"
        : upload.state === "incomplete"
          ? "Chưa tải lên đủ (" + upload.done + "/" + upload.total + "), đang tiếp tục thử"
          : "Đang kiểm tra";
  const uploadTone =
    upload.state === "done"
      ? "[background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)]"
      : upload.state === "incomplete"
        ? "[background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)]"
        : "[background:var(--attempt-bg-e3ecfd)] [color:var(--attempt-text-2963cc)]";
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
        <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-e6e4e0)]">
          <dt className="[font-size:12px] [color:var(--attempt-text-706473)]">{"Thời gian hoàn thành"}</dt>
          <dd className="m-0 font-bold [font-size:20px]">
            {elapsedSeconds === null ? "--:--" : formatDuration(elapsedSeconds)}
          </dd>
        </div>
        <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-faf9f5)] [border:1.5px_solid_var(--attempt-line-e6e4e0)]">
          <dt className="[font-size:12px] [color:var(--attempt-text-706473)]">{"Số câu đã trả lời"}</dt>
          <dd className="m-0 font-bold [font-size:20px]">{answered === null ? "--" : answered}</dd>
        </div>
      </dl>
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
          className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)] [font-size:14px] font-semibold"
        >
          {expiry ? "Bài làm đã được lưu đến " + expiry + "." : "Bài làm đã được lưu."}
        </div>
      )}
      {upload.state !== "done" && upload.state !== "local" && (
        <p>{"Bài làm chưa được lưu xong. Bấm “Lưu bài làm” để tải lên và lưu ngay."}</p>
      )}
      {upload.state === "incomplete" && (
        <p>
          {"Bản ghi của bạn vẫn được giữ trên máy này. Hãy giữ nguyên trang hoặc quay lại sau khi có mạng, hệ thống sẽ tải lên và chốt bài tiếp."}
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
        {expiry
          ? "Bản ghi được giữ đến " + expiry + " (14 ngày kể từ lúc hoàn thành)."
          : "Bản ghi được giữ 14 ngày kể từ lúc hoàn thành. Hạn lưu sẽ hiện ở đây khi bài được chốt."}
      </p>
      )}
      {props.recordings.length > 0 && (
        <div>
          <strong>{"Nghe lại bài nói"}</strong>
          <ul className="m-0 [padding:0] [list-style:none] [margin-top:6px]">
            {props.recordings.map((item) => (
              <Play key={item.id} item={item} loadAudio={props.loadAudio} />
            ))}
          </ul>
        </div>
      )}
      <div className="[padding:12px_14px] rounded-xl [background:var(--attempt-bg-e3ecfd)] [color:var(--attempt-text-2963cc)] [font-size:14px]">
        {"Hoàn thành chưa tự gửi bài đi chấm và chưa dùng lượt chấm. Khi sẵn sàng, bấm “Gửi cho Giáo viên chấm”; lượt chấm được tính theo quy định lượt miễn phí hằng tuần."}
      </div>
      {grading.state === "unavailable" && (
        <div role="status" className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbedbf)] [color:var(--attempt-text-7a5a0e)] [font-size:14px]">
          {"Tính năng gửi chấm sẽ sớm khả dụng. Bài của bạn đã được lưu, bạn có thể gửi sau."}
        </div>
      )}
      {grading.state === "sent" && (
        <div role="status" className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-dcede2)] [color:var(--attempt-text-2e6a48)] [font-size:14px]">
          {grading.message || "Đã gửi bài cho Giáo viên chấm."}
        </div>
      )}
      {grading.state === "error" && (
        <div role="alert" className="[padding:10px_14px] rounded-xl [background:var(--attempt-bg-fbdcd3)] [color:var(--attempt-text-c0412a)] [font-size:14px]">
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
