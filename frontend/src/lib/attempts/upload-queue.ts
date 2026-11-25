/**
 * Hàng đợi tải bản ghi âm lên máy chủ. Không phụ thuộc DOM hay API cụ thể (nhận
 * `transport` và `readAnswer` từ ngoài) để kiểm thử bằng node. Bản ghi đọc từ
 * RecordingStore (IndexedDB) lúc tải, nên hàng đợi dựng lại được sau khi tải
 * lại trang chỉ từ danh sách câu đã ghi.
 *
 * Tải idempotent: một câu đã có trên máy chủ (409) coi như xong; câu đã xong chỉ
 * tải lại khi có bản ghi mới (Practice ghi lại, `version` đổi).
 */
export type UploadStatus =
  | "pending"
  | "uploading"
  | "done"
  /** Lỗi không thể tự khỏi (đề/bài không còn, từ chối): chờ người học thử lại. */
  | "failed"
  /** Quá giờ / lượt không còn hoạt động: không tải được nhưng vẫn cho chốt bài. */
  | "expired"
  /** Không còn bản ghi trên máy: không chặn việc hoàn thành. */
  | "missing";

export interface UploadItem {
  questionId: string;
  partIndex: number;
  version: number;
  status: UploadStatus;
  attempts: number;
  nextAt: number;
}
export interface UploadTransport {
  requestUpload(
    attemptId: string,
    input: {
      questionId: string;
      partIndex: number;
      durationMs: number;
      mimeType: string;
      size: number;
    },
  ): Promise<{ uploadUrl: string; path: string; alreadyUploaded?: boolean }>;
  putBlob(uploadUrl: string, blob: Blob, mimeType: string): Promise<void>;
  confirm(attemptId: string, questionId: string): Promise<void>;
}
export interface UploadSummary {
  total: number;
  done: number;
  pending: number;
  failed: number;
  /** Mã các câu không tải lên được vì quá giờ hoặc lượt đã đóng. */
  expiredIds: string[];
  /** Mọi câu đã xong hoặc không còn bản ghi để tải. */
  complete: boolean;
}
export interface UploadQueueOptions {
  transport: UploadTransport;
  readAnswer(
    questionId: string,
  ): Promise<{ blob: Blob; mimeType: string; durationMs: number } | undefined>;
  /** Mã lượt làm trên máy chủ; chưa có thì các câu chờ (không tính là lỗi). */
  getAttemptId(): string | undefined;
  onChange?(summary: UploadSummary): void;
  backoffMs?(attempts: number): number;
  now?(): number;
  setTimer?(fn: () => void, ms: number): unknown;
  clearTimer?(handle: unknown): void;
}

export function defaultBackoff(attempts: number): number {
  return Math.min(30_000, 1000 * 2 ** Math.max(0, attempts - 1));
}

function status(error: unknown): number | undefined {
  const value = (error as { status?: unknown })?.status;
  return typeof value === "number" ? value : undefined;
}
/** Lỗi tạm (mạng, quá tải, hết phiên): thử lại sau. Lỗi còn lại là lỗi cố định. */
export function isRetryableUploadError(error: unknown): boolean {
  const code = status(error);
  if (code === undefined) return true;
  return code === 0 || code === 401 || code === 408 || code === 425 || code === 429 || code >= 500;
}
/** Máy chủ/storage báo file đã có: 409, hoặc 400 kèm statusCode "409" (kiểu Supabase Storage). */
function isAlreadyExists(error: unknown): boolean {
  const e = error as { code?: unknown; statusCode?: unknown };
  if (String(e?.statusCode) === "409") return true;
  return (
    status(error) === 409 &&
    (e?.code === undefined ||
      e.code === "RECORDING_ALREADY_EXISTS" ||
      e.code === "UPLOAD_FAILED")
  );
}
/** PUT bị storage từ chối vì trùng: 409 hoặc 400 (Supabase trả 400 cho trùng file). */
function isDuplicatePut(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code;
  return (
    isAlreadyExists(error) ||
    (status(error) === 400 && (code === "UPLOAD_FAILED" || code === undefined))
  );
}
/** Quá giờ làm bài hoặc lượt không còn hoạt động: không tải được nữa, cũng không nên thử lại. */
function isAttemptClosed(error: unknown): boolean {
  const code = (error as { code?: unknown })?.code;
  return code === "ATTEMPT_TIME_EXPIRED" || code === "ATTEMPT_NOT_ACTIVE";
}

export class UploadQueue {
  private map = new Map<string, UploadItem>();
  private running: Promise<void> | null = null;
  private again = false;
  private forceAgain = false;
  private timer: unknown = null;
  private disposed = false;
  private opts: UploadQueueOptions;
  constructor(opts: UploadQueueOptions) {
    this.opts = opts;
  }

  private now() {
    return (this.opts.now ?? Date.now)();
  }
  items(): UploadItem[] {
    return [...this.map.values()];
  }
  summary(): UploadSummary {
    const list = this.items();
    const count = (s: UploadStatus) => list.filter((i) => i.status === s).length;
    const done = count("done");
    const missing = count("missing");
    const expired = count("expired");
    return {
      total: list.length - missing - expired,
      done,
      pending: count("pending") + count("uploading"),
      failed: count("failed"),
      expiredIds: list.filter((i) => i.status === "expired").map((i) => i.questionId),
      complete: list.length === done + missing + expired,
    };
  }
  private changed() {
    this.opts.onChange?.(this.summary());
  }

  /** Xếp một bản ghi vào hàng đợi. Cùng `version` đã xong thì không tải lại. */
  enqueue(questionId: string, partIndex: number, version = 0) {
    if (this.disposed) return;
    const old = this.map.get(questionId);
    if (old && old.version === version && old.status !== "failed" && old.status !== "missing") {
      this.kick();
      return;
    }
    this.map.set(questionId, {
      questionId,
      partIndex,
      version,
      status: "pending",
      attempts: 0,
      nextAt: 0,
    });
    this.changed();
    this.kick();
  }
  /** Máy chủ đã có bản ghi này (đối chiếu sau khi vào lại bài). */
  markDone(questionId: string, partIndex = 0, version?: number) {
    const old = this.map.get(questionId);
    this.map.set(questionId, {
      questionId,
      partIndex: old?.partIndex ?? partIndex,
      version: version ?? old?.version ?? 0,
      status: "done",
      attempts: old?.attempts ?? 0,
      nextAt: 0,
    });
    this.changed();
  }

  /** Chạy ngay (bỏ qua thời gian chờ thử lại), ví dụ khi có mạng lại. */
  kick() {
    if (this.disposed) return;
    for (const item of this.map.values()) if (item.status === "pending") item.nextAt = 0;
    void this.run(false);
  }
  /** Thử lại cả các câu lỗi cố định (người học bấm "Thử lại"). */
  retryAll(): Promise<UploadSummary> {
    return this.drain();
  }
  /** Chạy một lượt bắt buộc trên mọi câu chưa xong, chờ xong rồi trả tình trạng. */
  async drain(): Promise<UploadSummary> {
    await this.run(true);
    return this.summary();
  }
  dispose() {
    this.disposed = true;
    if (this.timer !== null) (this.opts.clearTimer ?? clearTimeout)(this.timer as never);
    this.timer = null;
  }

  private run(force: boolean): Promise<void> {
    if (this.running) {
      this.again = true;
      this.forceAgain ||= force;
      return this.running;
    }
    this.running = (async () => {
      do {
        this.again = false;
        const forced = force || this.forceAgain;
        force = false;
        this.forceAgain = false;
        await this.pass(forced);
      } while (this.again && !this.disposed);
    })().finally(() => {
      this.running = null;
      this.schedule();
    });
    return this.running;
  }
  private async pass(force: boolean) {
    for (const item of [...this.map.values()]) {
      if (this.disposed) return;
      // Lượt bắt buộc (Hoàn thành, "Thử lại") thử lại cả câu lỗi cố định.
      if (force && item.status === "failed") item.status = "pending";
      if (item.status !== "pending") continue;
      if (!force && item.nextAt > this.now()) continue;
      await this.upload(item);
    }
  }
  private schedule() {
    if (this.timer !== null) {
      (this.opts.clearTimer ?? clearTimeout)(this.timer as never);
      this.timer = null;
    }
    if (this.disposed) return;
    const waiting = this.items().filter((i) => i.status === "pending" && i.nextAt > 0);
    if (!waiting.length) return;
    const at = Math.min(...waiting.map((i) => i.nextAt));
    this.timer = (this.opts.setTimer ?? setTimeout)(() => {
      this.timer = null;
      void this.run(false);
    }, Math.max(0, at - this.now()));
  }

  private async upload(item: UploadItem) {
    const attemptId = this.opts.getAttemptId();
    // Chưa có lượt làm trên máy chủ (đang offline từ đầu): chờ, không tính là lần thử.
    if (!attemptId) return;
    const version = item.version;
    item.status = "uploading";
    this.changed();
    let answer;
    try {
      answer = await this.opts.readAnswer(item.questionId);
    } catch {
      answer = undefined;
    }
    if (!answer || answer.blob.size === 0) {
      item.status = "missing";
      this.changed();
      return;
    }
    const finish = (next: UploadStatus) => {
      // Bản ghi đã bị ghi lại trong lúc tải: giữ chờ để tải bản mới.
      const current = this.map.get(item.questionId);
      if (current && current.version !== version) return;
      item.status = next;
      this.changed();
    };
    try {
      let target: { uploadUrl: string } | null = null;
      // Đã có file trên storage (alreadyUploaded) hoặc máy chủ báo trùng: bỏ PUT, xác nhận luôn.
      let confirmOnly = false;
      try {
        target = await this.opts.transport.requestUpload(attemptId, {
          questionId: item.questionId,
          partIndex: item.partIndex,
          durationMs: Math.round(answer.durationMs),
          mimeType: answer.mimeType || answer.blob.type,
          size: answer.blob.size,
        });
      } catch (e) {
        if (!isAlreadyExists(e)) throw e;
        confirmOnly = true;
      }
      if (target && (target as { alreadyUploaded?: boolean }).alreadyUploaded)
        confirmOnly = true;
      if (target && !confirmOnly) {
        try {
          await this.opts.transport.putBlob(
            target.uploadUrl,
            answer.blob,
            answer.mimeType || answer.blob.type,
          );
        } catch (e) {
          // PUT lần hai bị từ chối vì file đã có: không đánh failed, đi tiếp sang xác nhận.
          if (!isDuplicatePut(e)) throw e;
        }
      }
      try {
        await this.opts.transport.confirm(attemptId, item.questionId);
      } catch (e) {
        // Câu đã có sẵn (Thi thật ghi hai lần): xác nhận thừa cũng không sao.
        if (isAttemptClosed(e)) throw e;
        if ((target || confirmOnly) && !isAlreadyExists(e)) throw e;
      }
      item.attempts = 0;
      item.nextAt = 0;
      finish("done");
    } catch (e) {
      if (isAttemptClosed(e)) {
        finish("expired");
      } else if (isRetryableUploadError(e)) {
        item.attempts += 1;
        item.nextAt = this.now() + (this.opts.backoffMs ?? defaultBackoff)(item.attempts);
        finish("pending");
      } else {
        finish("failed");
      }
    }
  }
}
