import type { SpeakingEditorState } from "../exams/exam-editor";
import { getPracticeItems } from "../exams/exam-catalog";
import type { RecordingStore } from "./recordings";
import { finishAttempt, type FinishOutcome, type FinishReason } from "./finish-flow";
import { flushDeletes, queueDelete } from "./pending-deletes";
import {
  completeSkillAttempt,
  createSkillAttempt,
  deleteSkillAttempt,
  errorCode,
  errorStatus,
  getSkillAttempt,
  getSpeakingExam,
  getWritingExam,
  isNetworkError,
  recordingTransport,
  writingTransport,
  type SpeakingExamDto,
  type SkillAttemptDetail,
  type WritingExamDto,
} from "./skill-attempts-api";
import { TextQueue, pendingKey, toUploadSummary } from "./writing-queue";
import { apiLimitMinutes } from "./time-limits";
import { UploadQueue, defaultBackoff, type UploadSummary } from "./upload-queue";

/**
 * Nối trang làm bài với máy chủ: tạo lượt làm (idempotent theo clientAttemptId),
 * hàng đợi tải bản ghi, hoàn thành và hủy. Mọi lỗi mạng đều êm: bài vẫn làm
 * offline, việc đồng bộ thử lại ở nền và khi có mạng.
 */
export interface AttemptSyncInit {
  userId: string | undefined;
  examId: string | null;
  clientAttemptId: string;
  mode: "real" | "practice";
  limitMinutes: number;
  /** Kho bản ghi âm (Speaking); Writing không dùng. */
  store?: RecordingStore;
  /** Kỹ năng của lượt; mặc định Speaking. */
  skill?: "SPEAKING" | "WRITING";
  /** Mã lượt trên máy chủ đã lưu trong draft (nếu có). */
  serverId?: string;
  /** Làm thử với đề mẫu: chỉ làm cục bộ, không tạo lượt, không tải lên. */
  offlineSample?: boolean;
}

const skillIdCache = new Map<string, string>();
/** Tra mã kỹ năng Speaking/Writing của một bộ đề (examId trong URL) qua danh mục công khai. */
export async function resolveSkillId(
  examId: string | null,
  skill: "SPEAKING" | "WRITING" = "SPEAKING",
): Promise<string | undefined> {
  if (!examId) return undefined;
  const fromQuery = new URLSearchParams(location.hash.split("?")[1]).get("skillId");
  if (fromQuery) return fromQuery;
  const cacheKey = skill + ":" + examId;
  const cached = skillIdCache.get(cacheKey);
  if (cached) return cached;
  const items = await getPracticeItems(skill);
  // Một đề Writing có thể có cả bản Academic và General (nhiều ô kỹ năng): lấy ô đầu tiên của danh mục.
  for (const item of items)
    if (!skillIdCache.has(skill + ":" + item.examId))
      skillIdCache.set(skill + ":" + item.examId, item.examSkillId);
  return skillIdCache.get(cacheKey);
}
export const resolveSpeakingSkillId = (examId: string | null) =>
  resolveSkillId(examId, "SPEAKING");

function minutes(value: number | string | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  // Đề tính bằng phút; số lớn hơn 10 coi là giây.
  return String(n > 10 ? n / 60 : n);
}
/** Đổi dữ liệu đề từ API Người học sang cấu trúc của bộ dựng câu hỏi (SpeakingEditorState). */
export function speakingDtoToState(dto: SpeakingExamDto): SpeakingEditorState {
  const items = dto.parts.map((part) =>
    part.kind === "cue"
      ? {
          kind: "cue" as const,
          prep: minutes(part.cue?.prep),
          speak: minutes(part.cue?.speak),
          text: part.cue?.text ?? "",
          topic: part.cue?.topic ?? part.topic,
        }
      : {
          kind: "qs" as const,
          instr: part.instr ?? "",
          qs: part.questions ?? [],
          topic: part.topic,
        },
  );
  return {
    title: dto.title,
    tot: String(dto.durationMinutes ?? ""),
    items: items as unknown as SpeakingEditorState["items"],
  };
}
/** Lấy đề Speaking từ máy chủ; lỗi hoặc quá `timeoutMs` thì trả null để dùng dữ liệu mẫu. */
export async function loadSpeakingTest(
  examId: string | null,
  timeoutMs = 5000,
): Promise<SpeakingEditorState | null> {
  const job = (async () => {
    const skillId = await resolveSpeakingSkillId(examId);
    if (!skillId) return null;
    const dto = await getSpeakingExam(skillId);
    return dto.parts?.length ? speakingDtoToState(dto) : null;
  })().catch(() => null);
  return Promise.race([
    job,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

/** Lấy đề Writing từ máy chủ; lỗi hoặc quá `timeoutMs` thì trả null để dùng dữ liệu mẫu. */
export async function loadWritingTest(
  examId: string | null,
  timeoutMs = 5000,
): Promise<WritingExamDto | null> {
  const job = (async () => {
    const skillId = await resolveSkillId(examId, "WRITING");
    if (!skillId) return null;
    const dto = await getWritingExam(skillId);
    return dto.tasks?.length ? dto : null;
  })().catch(() => null);
  return Promise.race([
    job,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

export class AttemptSync {
  readonly clientAttemptId: string;
  readonly queue: UploadQueue;
  /** Hàng đợi lưu văn bản (chỉ lượt Writing). */
  readonly texts: TextQueue | null;
  serverId: string | undefined;
  private init: AttemptSyncInit;
  private creating: Promise<string | undefined> | null = null;
  private retryTimer: number | undefined;
  private failures = 0;
  private cancelled = false;
  /** Mã gửi khi tạo lượt; đổi một lần nếu máy chủ báo CLIENT_ATTEMPT_ID_CONFLICT. */
  private createId: string;
  private conflictRetried = false;
  private listeners = new Set<() => void>();
  private onlineHandler = () => {
    this.queue.kick();
    this.texts?.kick();
    if (!this.serverId) void this.ensureCreated();
    void flushPendingDeletes(this.init.userId);
  };

  constructor(init: AttemptSyncInit) {
    this.init = init;
    this.clientAttemptId = init.clientAttemptId;
    this.createId = init.clientAttemptId;
    // Đề mẫu: không dùng mã lượt thật (tránh trộn mã bước đề mẫu vào lượt thật).
    this.serverId = init.offlineSample ? undefined : init.serverId;
    this.queue = new UploadQueue({
      transport: recordingTransport,
      readAnswer: async (id) => this.init.store?.get(id),
      getAttemptId: () => this.serverId,
      onChange: () => this.listeners.forEach((fn) => fn()),
    });
    this.texts =
      init.skill === "WRITING"
        ? new TextQueue({
            transport: writingTransport,
            getAttemptId: () => this.serverId,
            // Đề mẫu: chỉ làm cục bộ, không giữ bản chờ trong localStorage.
            storage: init.offlineSample ? null : localStorage,
            storageKey: pendingKey(init.userId, init.clientAttemptId),
            // Máy chủ không còn lượt này: tạo lại (cùng clientAttemptId) rồi PUT lại.
            onAttemptGone: () => {
              this.serverId = undefined;
              void this.ensureCreated();
            },
            onChange: () => this.listeners.forEach((fn) => fn()),
          })
        : null;
    window.addEventListener("online", this.onlineHandler);
    if (init.offlineSample) this.texts?.dispose();
    // Hàng đợi tắt hẳn: enqueue không làm gì, không có upload nào cho bài mẫu.
    if (init.offlineSample) this.queue.dispose();
  }
  get offlineSample(): boolean {
    return !!this.init.offlineSample;
  }
  /** Gắn lại kho bản ghi khi trang mới (trang xác nhận) nhận lại bộ đồng bộ. */
  rebind(patch: Partial<AttemptSyncInit>) {
    this.init = { ...this.init, ...patch };
  }
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  summary(): UploadSummary {
    return this.queue.summary();
  }

  /** Tạo lượt trên máy chủ (một lần, an toàn gọi nhiều lần). Lỗi mạng thì thử lại ở nền. */
  ensureCreated(): Promise<string | undefined> {
    if (this.serverId) return Promise.resolve(this.serverId);
    if (this.init.offlineSample) return Promise.resolve(undefined);
    if (this.cancelled) return Promise.resolve(undefined);
    if (this.creating) return this.creating;
    this.creating = (async () => {
      try {
        const writing = this.init.skill === "WRITING";
        const skillId = await resolveSkillId(
          this.init.examId,
          writing ? "WRITING" : "SPEAKING",
        );
        if (!skillId)
          throw new Error(
            writing ? "Chưa xác định được bài Writing" : "Chưa xác định được bài Speaking",
          );
        const created = await createSkillAttempt({
          clientAttemptId: this.createId,
          examSkillId: skillId,
          mode: this.init.mode === "real" ? "REAL" : "PRACTICE",
          limitMinutes: apiLimitMinutes(
            this.init.mode,
            this.init.limitMinutes,
            writing ? 60 : 30,
          ),
        });
        this.serverId = created.id;
        this.failures = 0;
        this.listeners.forEach((fn) => fn());
        if (this.cancelled) {
          void this.removeRemote();
          return undefined;
        }
        this.queue.kick();
        this.texts?.kick();
        return created.id;
      } catch (e) {
        this.failures += 1;
        // Lỗi cố định (4xx) ngoài 401/408/429 thì thôi, không thử mãi.
        const status = errorStatus(e);
        if (
          status === 409 &&
          errorCode(e) === "CLIENT_ATTEMPT_ID_CONFLICT" &&
          !this.conflictRetried &&
          !this.cancelled
        ) {
          // Mã đã dùng cho lượt khác: sinh mã mới đúng một lần rồi thử lại.
          this.conflictRetried = true;
          this.createId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
          this.retryTimer = window.setTimeout(() => void this.ensureCreated(), 0);
          return undefined;
        }
        const temporary =
          status === undefined ||
          status === 0 ||
          status === 401 ||
          status === 408 ||
          status === 429 ||
          status >= 500;
        if (temporary && !this.cancelled)
          this.retryTimer = window.setTimeout(
            () => void this.ensureCreated(),
            defaultBackoff(this.failures),
          );
        return undefined;
      } finally {
        this.creating = null;
      }
    })();
    return this.creating;
  }

  /** Vào lại bài đã có mã lượt: đối chiếu bản ghi máy chủ đã có, tránh tải lại. */
  async reconcile(versions: Record<string, number> = {}): Promise<SkillAttemptDetail | null> {
    if (!this.serverId) return null;
    try {
      const detail = await getSkillAttempt(this.serverId);
      for (const rec of detail.recordings ?? [])
        if (rec.status === "UPLOADED")
          this.queue.markDone(rec.questionId, rec.partIndex, versions[rec.questionId]);
      return detail;
    } catch (e) {
      // Máy chủ không còn lượt này: tạo lại (cùng clientAttemptId).
      if (errorStatus(e) === 404) {
        this.serverId = undefined;
        void this.ensureCreated();
      }
      return null;
    }
  }

  /**
   * Hoàn thành: Speaking tải nốt bản ghi; Writing lưu lần cuối cả hai Task (sau complete không sửa được)
   * rồi mới gọi complete. Chỉ khi chốt xong mới dọn bản chờ lưu trên máy.
   */
  async finish(elapsedSeconds: number, reason: FinishReason, timeoutMs?: number): Promise<FinishOutcome> {
    const texts = this.texts;
    const outcome = await finishAttempt({
      ensureCreated: () => this.ensureCreated(),
      drain: texts ? async () => toUploadSummary(await texts.drain()) : () => this.queue.drain(),
      summary: texts ? () => toUploadSummary(texts.summary()) : () => this.queue.summary(),
      complete: (id, input) => completeSkillAttempt(id, input),
      elapsedSeconds,
      reason,
      timeoutMs,
    });
    if (outcome.status === "completed") texts?.clearStorage();
    return outcome;
  }

  private async removeRemote() {
    const id = this.serverId;
    if (!id) return;
    try {
      await deleteSkillAttempt(id);
    } catch (e) {
      if (errorStatus(e) === 404) return;
      if (this.init.userId && (isNetworkError(e) || (errorStatus(e) ?? 0) >= 500))
        try {
          queueDelete(localStorage, { userId: this.init.userId, serverId: id });
        } catch {
          // Không ghi được: bỏ.
        }
    }
  }
  /** "Không lưu": xóa lượt trên máy chủ (lỗi mạng thì xếp hàng xóa sau) và dừng đồng bộ. */
  async cancel(): Promise<void> {
    this.cancelled = true;
    this.texts?.clearStorage();
    this.dispose();
    if (this.creating) {
      // Lượt đang được tạo: chờ tối đa vài giây; tạo xong muộn thì tự xóa (xem ensureCreated).
      await Promise.race([
        this.creating,
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    }
    await this.removeRemote();
  }
  /** Hoàn tất hoặc rời bài: bỏ timer và lắng nghe mạng, gỡ khỏi bảng quản lý. */
  dispose() {
    window.clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    window.removeEventListener("online", this.onlineHandler);
    this.queue.dispose();
    this.texts?.dispose();
    syncs.delete(this.clientAttemptId);
  }
}

const syncs = new Map<string, AttemptSync>();
/** Bộ đồng bộ của lượt làm; còn sống qua việc chuyển sang trang xác nhận để tải tiếp ở nền. */
export function getAttemptSync(init: AttemptSyncInit): AttemptSync {
  const old = syncs.get(init.clientAttemptId);
  if (old) {
    old.rebind(init);
    return old;
  }
  const next = new AttemptSync(init);
  syncs.set(init.clientAttemptId, next);
  return next;
}

let flushing = false;
/** Xóa các lượt "Không lưu" còn xếp hàng (gọi khi mở app và khi có mạng lại). */
export async function flushPendingDeletes(userId: string | undefined): Promise<void> {
  if (!userId || flushing) return;
  flushing = true;
  try {
    await flushDeletes(
      localStorage,
      userId,
      deleteSkillAttempt,
      // 404 hoặc 409 ATTEMPT_ALREADY_COMPLETED: không xóa được nữa, bỏ khỏi hàng đợi.
      (e) =>
        errorStatus(e) === 404 ||
        (errorStatus(e) === 409 && errorCode(e) === "ATTEMPT_ALREADY_COMPLETED"),
      (e) => isNetworkError(e) || (errorStatus(e) ?? 0) >= 500 || errorStatus(e) === 401,
    );
  } catch {
    // Lần sau thử lại.
  } finally {
    flushing = false;
  }
}
