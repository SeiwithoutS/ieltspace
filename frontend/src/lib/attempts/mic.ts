import type { RecordedAnswer } from "./recordings";
import { CHUNK_TIMESLICE_MS, type RecordingChunk } from "./recording-chunks.ts";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

/** Chọn định dạng ghi âm trình duyệt hỗ trợ; trả chuỗi rỗng để trình duyệt tự chọn. */
export function pickMimeType(
  isSupported: (type: string) => boolean = (type) =>
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type),
): string {
  return MIME_CANDIDATES.find((type) => isSupported(type)) ?? "";
}

/** Đổi lỗi getUserMedia/MediaRecorder thành thông báo tiếng Việt. */
export function micErrorMessage(error: unknown): string {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name: unknown }).name)
      : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Trình duyệt chưa cho phép dùng micro. Bấm biểu tượng ổ khóa trên thanh địa chỉ, cho phép micro rồi thử lại.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "Không tìm thấy micro. Hãy cắm micro hoặc tai nghe có micro rồi thử lại.";
  if (name === "NotReadableError" || name === "AbortError")
    return "Micro đang được ứng dụng khác sử dụng hoặc bị lỗi. Hãy đóng ứng dụng đó rồi thử lại.";
  if (name === "NoRecorder")
    return "Trình duyệt này chưa hỗ trợ ghi âm. Hãy dùng Chrome, Edge hoặc Firefox bản mới.";
  return "Không bật được micro. Hãy kiểm tra micro rồi thử lại.";
}

export async function requestMicStream(): Promise<MediaStream> {
  if (
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === "undefined"
  ) {
    const error = new Error("Trình duyệt không hỗ trợ ghi âm");
    error.name = "NoRecorder";
    throw error;
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Micro còn dùng được (chưa bị rút, chưa bị tắt quyền). */
export function streamIsLive(stream: MediaStream | null | undefined): boolean {
  return !!stream?.getAudioTracks().some((t) => t.readyState === "live");
}

/** Ghi âm một đoạn từ stream; `stop()` trả về bản ghi hoàn chỉnh. */
export class AnswerRecorder {
  private recorder: MediaRecorder;
  private chunks: Blob[] = [];
  private startedAt = 0;
  private result: Promise<RecordedAnswer>;
  private finish!: (answer: RecordedAnswer) => void;
  private fail!: (error: unknown) => void;

  private seq = 0;
  private onChunk?: (chunk: RecordingChunk) => void;

  /** `onChunk` nhận từng đoạn ngay khi trình duyệt trả (để lưu bền, xem recording-chunks.ts). */
  constructor(stream: MediaStream, onChunk?: (chunk: RecordingChunk) => void) {
    this.onChunk = onChunk;
    const mimeType = pickMimeType();
    this.recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined,
    );
    this.result = new Promise((resolve, reject) => {
      this.finish = resolve;
      this.fail = reject;
    });
    this.recorder.ondataavailable = (event) => {
      if (event.data.size === 0) return;
      this.chunks.push(event.data);
      try {
        this.onChunk?.({
          seq: this.seq++,
          blob: event.data,
          mimeType: this.recorder.mimeType || mimeType || "audio/webm",
          startedAt: this.startedAt,
          at: Date.now(),
        });
      } catch {
        // Lưu đoạn lỗi không được làm hỏng bản ghi đang chạy.
      }
    };
    this.recorder.onerror = (event) => this.fail(event);
    this.recorder.onstop = () => {
      const type = this.recorder.mimeType || mimeType || "audio/webm";
      this.finish({
        blob: new Blob(this.chunks, { type }),
        mimeType: type,
        durationMs: Date.now() - this.startedAt,
        recordedAt: this.startedAt,
      });
    };
  }

  start() {
    this.startedAt = Date.now();
    // timeslice: nếu trang bị đóng đột ngột, các đoạn đã lưu (onChunk) vẫn ghép lại được.
    this.recorder.start(CHUNK_TIMESLICE_MS);
  }

  stop(): Promise<RecordedAnswer> {
    if (this.recorder.state !== "inactive") this.recorder.stop();
    return this.result;
  }
}
