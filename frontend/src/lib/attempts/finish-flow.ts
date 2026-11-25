import type { UploadSummary } from "./upload-queue.ts";

/**
 * Chốt bài làm: tải hết bản ghi còn lại rồi mới gọi complete. Chỉ kết quả
 * `completed` mới cho dọn bản ghi và draft trên máy; mọi trường hợp khác phải
 * giữ dữ liệu local để thử lại (Hoàn thành không bao giờ làm mất bản ghi chưa tải lên).
 */
export type FinishReason = "SUBMITTED" | "TIME_UP";
export interface CompleteResult {
  completedAt: string;
  contentExpiresAt: string | null;
  durationSeconds: number;
}
export type FinishOutcome =
  | ({
      status: "completed";
      serverId: string;
      /** Các câu không tải lên được vì quá giờ / lượt đã đóng (vẫn chốt bài). */
      expiredIds: string[];
    } & CompleteResult)
  | {
      status: "incomplete";
      /** no-attempt: chưa tạo được lượt làm trên máy chủ; upload: còn bản ghi chưa tải; complete: gọi complete lỗi. */
      why: "no-attempt" | "upload" | "complete";
      serverId?: string;
      summary?: UploadSummary;
      /** Lỗi cố định (400/403/404/409...): thử lại cũng không được, đừng lặp mãi. */
      permanent?: boolean;
    };

export interface FinishDeps {
  ensureCreated(): Promise<string | undefined>;
  drain(): Promise<UploadSummary>;
  summary(): UploadSummary;
  complete(
    serverId: string,
    input: { elapsedSeconds: number; reason: FinishReason },
  ): Promise<CompleteResult>;
  elapsedSeconds: number;
  reason: FinishReason;
  /** Chờ tải lên tối đa chừng này rồi sang trang xác nhận (tải tiếp ở nền). */
  timeoutMs?: number;
}

/** Trần số giây gửi lên máy chủ (một ngày), chống số vô lý làm backend trả 400. */
export const MAX_ELAPSED_SECONDS = 24 * 3600;
export function clampElapsed(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0;
  return Math.min(MAX_ELAPSED_SECONDS, Math.max(0, Math.floor(seconds)));
}
function isPermanentError(error: unknown): boolean {
  const code = (error as { status?: unknown })?.status;
  return typeof code === "number" && code >= 400 && code < 500 && ![401, 408, 425, 429].includes(code);
}

function withTimeout<T>(job: Promise<T>, ms: number, onTimeout: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(onTimeout()), ms);
    job.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function finishAttempt(deps: FinishDeps): Promise<FinishOutcome> {
  let serverId: string | undefined;
  try {
    serverId = await deps.ensureCreated();
  } catch {
    serverId = undefined;
  }
  if (!serverId) return { status: "incomplete", why: "no-attempt" };
  const timeoutMs = deps.timeoutMs ?? 60_000;
  let summary: UploadSummary;
  try {
    summary = await withTimeout(deps.drain(), timeoutMs, () => deps.summary());
  } catch {
    summary = deps.summary();
  }
  if (!summary.complete)
    return { status: "incomplete", why: "upload", serverId, summary };
  try {
    const result = await deps.complete(serverId, {
      elapsedSeconds: clampElapsed(deps.elapsedSeconds),
      reason: deps.reason,
    });
    return {
      status: "completed",
      serverId,
      expiredIds: summary.expiredIds ?? [],
      completedAt: result.completedAt,
      contentExpiresAt: result.contentExpiresAt,
      durationSeconds: result.durationSeconds,
    };
  } catch (e) {
    return {
      status: "incomplete",
      why: "complete",
      serverId,
      summary,
      ...(isPermanentError(e) ? { permanent: true } : {}),
    };
  }
}
