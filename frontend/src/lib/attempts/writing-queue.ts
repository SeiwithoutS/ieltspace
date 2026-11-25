import type { UploadSummary } from "./upload-queue.ts";
import type { WritingTaskKey } from "./writing-text.ts";

/**
 * Hàng đợi lưu văn bản Writing lên máy chủ. Không phụ thuộc DOM hay API cụ thể
 * (nhận `transport`, `storage` và bộ hẹn giờ từ ngoài) để kiểm thử bằng node.
 *
 * - Mỗi Task chỉ giữ MỘT bản mới nhất: PUT ghi đè, nên gửi lại bao nhiêu lần cũng như nhau (idempotent).
 * - Gõ liên tục thì gộp (debounce); chuyển Task, blur, hết giờ và hoàn thành thì lưu ngay.
 * - Bản chưa lưu được ghi vào storage (localStorage) ngay lúc gõ, nên F5, đóng tab hay sập trình duyệt
 *   không mất chữ; lưu xong thì bỏ khỏi storage.
 * - Không log nội dung bài viết.
 */
export type TextStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export interface TextTransport {
  put(attemptId: string, taskKey: WritingTaskKey, text: string): Promise<unknown>;
  /** Gửi best-effort lúc đóng/ẩn trang (fetch keepalive); không chờ kết quả. */
  putOnHide?(attemptId: string, taskKey: WritingTaskKey, text: string): void;
}
export interface TextQueueOptions {
  transport: TextTransport;
  /** Mã lượt trên máy chủ; chưa có thì văn bản chờ (không tính là lỗi). */
  getAttemptId(): string | undefined;
  /** Nơi giữ bản chưa lưu; null thì chỉ giữ trong bộ nhớ (bài làm thử với đề mẫu). */
  storage?: TextStorage | null;
  storageKey?: string;
  debounceMs?: number;
  backoffMs?(failures: number): number;
  /** Máy chủ báo không còn lượt (404 ATTEMPT_NOT_FOUND): để bộ đồng bộ tạo lại lượt. */
  onAttemptGone?(): void;
  onChange?(summary: TextSummary): void;
  now?(): number;
  setTimer?(fn: () => void, ms: number): unknown;
  clearTimer?(handle: unknown): void;
}

type EntryState = "ok" | "closed" | "failed";
interface Entry {
  text: string;
  /** Tăng mỗi lần văn bản đổi; `savedVersion` là bản đã lên máy chủ. */
  version: number;
  savedVersion: number;
  state: EntryState;
  failures: number;
  nextAt: number;
}
export interface TextSummary {
  /** Số Task đã có văn bản (hoặc từng được nạp). */
  total: number;
  saved: number;
  dirty: number;
  /** Lỗi cố định, thử lại cũng không được. */
  failed: number;
  /** Task không lưu được vì quá giờ / lượt đã đóng / nội dung hết hạn. */
  closedKeys: WritingTaskKey[];
  /** Mọi Task đã lưu hoặc không còn lưu được (đóng): đủ điều kiện gọi complete. */
  complete: boolean;
}

export const PENDING_PREFIX = "ieltspace-writing-pending:";
export function pendingKey(userId: string | null | undefined, clientAttemptId: string): string {
  return PENDING_PREFIX + (userId ?? "") + ":" + clientAttemptId;
}
const TASK_KEYS: WritingTaskKey[] = ["task1", "task2"];

function backoff(failures: number): number {
  return Math.min(30_000, 1000 * 2 ** Math.max(0, failures - 1));
}
function statusOf(error: unknown): number | undefined {
  const value = (error as { status?: unknown })?.status;
  return typeof value === "number" ? value : undefined;
}
function codeOf(error: unknown): string {
  const code = (error as { code?: unknown })?.code;
  return typeof code === "string" ? code : "";
}
/** Lỗi tạm (mạng, quá tải, hết phiên): thử lại sau. */
export function isRetryableTextError(error: unknown): boolean {
  const s = statusOf(error);
  return s === undefined || s === 0 || s === 401 || s === 408 || s === 425 || s === 429 || s >= 500;
}
/** Quá giờ, lượt đã đóng hoặc nội dung đã hết hạn: máy chủ không nhận nữa. */
export function isTextClosedError(error: unknown): boolean {
  const code = codeOf(error);
  return (
    code === "ATTEMPT_TIME_EXPIRED" ||
    code === "ATTEMPT_NOT_ACTIVE" ||
    code === "CONTENT_EXPIRED" ||
    statusOf(error) === 410
  );
}

/** Đọc các bản chưa lưu còn nằm trong storage (sau F5/sập). Hỏng thì coi như không có. */
export function readPendingTexts(
  storage: TextStorage | null | undefined,
  key: string,
): Partial<Record<WritingTaskKey, string>> {
  try {
    const value: unknown = JSON.parse(storage?.getItem(key) ?? "null");
    const texts = (value as { texts?: unknown } | null)?.texts;
    if (typeof texts !== "object" || texts === null) return {};
    const out: Partial<Record<WritingTaskKey, string>> = {};
    for (const k of TASK_KEYS) {
      const t = (texts as Record<string, unknown>)[k];
      if (typeof t === "string") out[k] = t;
    }
    return out;
  } catch {
    return {};
  }
}
/** Dọn các bản chờ quá hạn (mặc định 24 giờ, như nháp). */
export function sweepPendingTexts(
  storage: (TextStorage & Pick<Storage, "key" | "length">) | null | undefined,
  now: number,
  maxAgeMs = 24 * 60 * 60 * 1000,
): void {
  if (!storage) return;
  try {
    const stale: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key || !key.startsWith(PENDING_PREFIX)) continue;
      let savedAt = 0;
      try {
        savedAt = Number((JSON.parse(storage.getItem(key) ?? "null") as { savedAt?: unknown })?.savedAt);
      } catch {
        savedAt = 0;
      }
      if (!Number.isFinite(savedAt) || now - savedAt > maxAgeMs) stale.push(key);
    }
    for (const key of stale) storage.removeItem(key);
  } catch {
    // Dọn là việc phụ.
  }
}
/** Đăng xuất: bỏ mọi bản chưa lưu của người dùng. */
export function clearPendingTextsOf(
  storage: (TextStorage & Pick<Storage, "key" | "length">) | null | undefined,
  userId: string,
): void {
  if (!storage) return;
  try {
    const mine: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(PENDING_PREFIX + userId + ":")) mine.push(key);
    }
    for (const key of mine) storage.removeItem(key);
  } catch {
    // Không dọn được thì để hết hạn.
  }
}

export class TextQueue {
  private map = new Map<WritingTaskKey, Entry>();
  private running: Promise<void> | null = null;
  private again = false;
  private forceAgain = false;
  private timer: unknown = null;
  private debounceTimer: unknown = null;
  private disposed = false;
  private opts: TextQueueOptions;
  constructor(opts: TextQueueOptions) {
    this.opts = opts;
  }

  private now() {
    return (this.opts.now ?? Date.now)();
  }
  private setTimer(fn: () => void, ms: number): unknown {
    return (this.opts.setTimer ?? ((f, m) => setTimeout(f, m)))(fn, ms);
  }
  private clearTimer(handle: unknown) {
    (this.opts.clearTimer ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>)))(handle);
  }
  private get(key: WritingTaskKey): Entry {
    let e = this.map.get(key);
    if (!e) {
      e = { text: "", version: 0, savedVersion: 0, state: "ok", failures: 0, nextAt: 0 };
      this.map.set(key, e);
    }
    return e;
  }
  private isDirty(e: Entry) {
    return e.state === "ok" && e.version > e.savedVersion;
  }

  /** Ghi văn bản mới nhất của một Task. Trả true nếu có thay đổi. Lưu lên máy chủ sau `debounceMs`. */
  set(key: WritingTaskKey, text: string): boolean {
    if (this.disposed) return false;
    const e = this.get(key);
    if (e.text === text) return false;
    e.text = text;
    e.version += 1;
    e.state = e.state === "closed" ? "closed" : "ok";
    e.failures = 0;
    e.nextAt = 0;
    this.persist();
    this.scheduleDebounced();
    this.notify();
    return true;
  }
  /**
   * Nạp văn bản đã biết (khôi phục bài). `saved`: bản này đã nằm trên máy chủ nên không cần PUT lại;
   * không thì coi là chưa lưu và sẽ được PUT.
   */
  adopt(key: WritingTaskKey, text: string, saved: boolean): void {
    if (this.disposed) return;
    const e = this.get(key);
    e.text = text;
    e.version += 1;
    if (saved) e.savedVersion = e.version;
    e.failures = 0;
    e.nextAt = 0;
    this.persist();
    if (!saved) this.scheduleDebounced();
    this.notify();
  }
  text(key: WritingTaskKey): string | undefined {
    return this.map.get(key)?.text;
  }
  hasUnsaved(): boolean {
    return [...this.map.values()].some((e) => this.isDirty(e));
  }

  private scheduleDebounced() {
    this.clearTimer(this.debounceTimer);
    this.debounceTimer = this.setTimer(() => {
      this.debounceTimer = null;
      void this.flush();
    }, this.opts.debounceMs ?? 3000);
  }
  private persist() {
    const { storage, storageKey } = this.opts;
    if (!storage || !storageKey) return;
    try {
      const texts: Record<string, string> = {};
      for (const [key, e] of this.map) if (this.isDirty(e)) texts[key] = e.text;
      if (Object.keys(texts).length === 0) storage.removeItem(storageKey);
      else storage.setItem(storageKey, JSON.stringify({ savedAt: this.now(), texts }));
    } catch {
      // Đầy hoặc bị chặn: vẫn còn bản trong bộ nhớ và trong nháp.
    }
  }
  /** Bỏ bản chưa lưu khỏi storage (hoàn thành hoặc hủy xong). */
  clearStorage() {
    const { storage, storageKey } = this.opts;
    try {
      if (storage && storageKey) storage.removeItem(storageKey);
    } catch {
      // Bỏ qua.
    }
  }
  private notify() {
    this.opts.onChange?.(this.summary());
  }

  summary(): TextSummary {
    let saved = 0;
    let dirty = 0;
    let failed = 0;
    const closedKeys: WritingTaskKey[] = [];
    for (const [key, e] of this.map) {
      if (e.state === "closed" && e.version > e.savedVersion) closedKeys.push(key);
      else if (e.state === "failed") failed++;
      else if (e.version > e.savedVersion) dirty++;
      else saved++;
    }
    return {
      total: this.map.size,
      saved,
      dirty,
      failed,
      closedKeys,
      complete: dirty === 0 && failed === 0,
    };
  }

  /** Lưu các Task đang chờ (chờ đến lượt thử lại nếu đang lùi nhịp, trừ khi `force`). */
  flush(force = true): Promise<void> {
    if (this.disposed) return Promise.resolve();
    this.clearTimer(this.debounceTimer);
    this.debounceTimer = null;
    if (this.running) {
      this.again = true;
      if (force) this.forceAgain = true;
      return this.running;
    }
    this.running = this.run(force).finally(() => {
      this.running = null;
    });
    return this.running;
  }
  /** Gọi khi có mạng lại hoặc vừa có mã lượt. */
  kick() {
    void this.flush(true);
  }

  private async run(force: boolean) {
    let useForce = force;
    do {
      this.again = false;
      const forceNow = useForce || this.forceAgain;
      this.forceAgain = false;
      for (const [key, e] of this.map) {
        if (this.disposed) return;
        if (!this.isDirty(e)) continue;
        if (!forceNow && e.nextAt > this.now()) continue;
        const attemptId = this.opts.getAttemptId();
        if (!attemptId) continue;
        const version = e.version;
        try {
          await this.opts.transport.put(attemptId, key, e.text);
          e.savedVersion = Math.max(e.savedVersion, version);
          e.failures = 0;
          // Chữ gõ thêm trong lúc PUT: vẫn dirty, vòng sau lưu tiếp.
          if (e.version > e.savedVersion) this.again = true;
        } catch (err) {
          if (isTextClosedError(err)) e.state = "closed";
          else if (statusOf(err) === 404 && codeOf(err) === "ATTEMPT_NOT_FOUND") {
            e.failures += 1;
            e.nextAt = this.now() + (this.opts.backoffMs ?? backoff)(e.failures);
            this.opts.onAttemptGone?.();
          } else if (isRetryableTextError(err)) {
            e.failures += 1;
            e.nextAt = this.now() + (this.opts.backoffMs ?? backoff)(e.failures);
          } else e.state = "failed";
        }
        this.persist();
        this.notify();
      }
      useForce = false;
    } while (this.again && !this.disposed);
    this.scheduleRetry();
  }
  private scheduleRetry() {
    this.clearTimer(this.timer);
    this.timer = null;
    if (this.disposed) return;
    let soonest = Infinity;
    for (const e of this.map.values())
      if (this.isDirty(e)) soonest = Math.min(soonest, e.nextAt);
    if (soonest === Infinity) return;
    this.timer = this.setTimer(() => {
      this.timer = null;
      void this.flush(false);
    }, Math.max(500, soonest - this.now()));
  }

  /**
   * Lưu cho xong trước khi hoàn thành: thử tối đa `attempts` vòng, nghỉ `delayMs` giữa các vòng
   * (lỗi tạm thì thử lại ngắn rồi mới chốt). Trả tóm tắt; chưa xong thì nơi gọi KHÔNG được complete.
   */
  async drain(attempts = 3, delayMs = 1000): Promise<TextSummary> {
    for (let i = 0; i < attempts; i++) {
      await this.flush(true);
      if (!this.hasUnsaved() || !this.opts.getAttemptId()) break;
      if (i < attempts - 1) await new Promise<void>((resolve) => this.setTimer(resolve, delayMs));
    }
    return this.summary();
  }

  /** Đóng/ẩn trang: gửi best-effort các bản chưa lưu (bản trong storage vẫn là chỗ dựa chính). */
  flushOnHide() {
    const attemptId = this.opts.getAttemptId();
    if (this.disposed || !attemptId || !this.opts.transport.putOnHide) return;
    for (const [key, e] of this.map)
      if (this.isDirty(e)) this.opts.transport.putOnHide(attemptId, key, e.text);
  }

  dispose() {
    this.disposed = true;
    this.clearTimer(this.timer);
    this.clearTimer(this.debounceTimer);
    this.timer = null;
    this.debounceTimer = null;
  }
}

/** Đổi tóm tắt văn bản sang dạng UploadSummary để dùng chung `finishAttempt`. */
export function toUploadSummary(summary: TextSummary): UploadSummary {
  return {
    total: summary.total,
    done: summary.saved,
    pending: summary.dirty,
    failed: summary.failed,
    expiredIds: summary.closedKeys,
    complete: summary.complete,
  };
}
