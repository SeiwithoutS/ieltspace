import { ApiError, apiFetch } from "../shared/api";
import type { UploadTransport } from "./upload-queue";

/**
 * Client có kiểu cho API lượt làm kỹ năng của Người học (Speaking trước, Writing dùng lại sau).
 * Không log URL tải lên/tải xuống: đó là đường dẫn có chữ ký, chỉ dùng một lần.
 */
export type AttemptMode = "REAL" | "PRACTICE";
export type SkillAttemptStatus = "IN_PROGRESS" | "COMPLETED" | string;

export interface SpeakingExamPart {
  kind: "qs" | "cue";
  questions?: string[];
  cue?: { prep: number | string; speak: number | string; text: string; topic?: string };
  instr?: string;
  topic?: string;
}
export interface SpeakingExamDto {
  examSkillId: string;
  title: string;
  durationMinutes: number;
  parts: SpeakingExamPart[];
}
export interface SkillAttemptCreated {
  id: string;
  status: SkillAttemptStatus;
  startedAt: string;
  deadlineAt: string | null;
}
export interface ServerRecording {
  questionId: string;
  partIndex: number;
  status: string;
  durationMs: number;
  size: number;
}
export interface SkillAttemptDetail {
  id: string;
  status: SkillAttemptStatus;
  mode: AttemptMode;
  startedAt: string;
  deadlineAt: string | null;
  completedAt: string | null;
  contentExpiresAt: string | null;
  elapsedSeconds: number | null;
  recordings: ServerRecording[];
}
export interface SkillAttemptCompleted {
  status: SkillAttemptStatus;
  completedAt: string;
  contentExpiresAt: string | null;
  durationSeconds: number;
}
export type CompleteReason = "SUBMITTED" | "TIME_UP";

const root = (id: string) => "/learner/skill-attempts/" + encodeURIComponent(id);

export function errorStatus(error: unknown): number | undefined {
  return error instanceof ApiError
    ? error.status
    : typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : undefined;
}
export function errorCode(error: unknown): string {
  const code = (error as { code?: unknown })?.code;
  return typeof code === "string" ? code : "";
}
/** Không kết nối được máy chủ (mất mạng, backend chưa chạy). */
export function isNetworkError(error: unknown): boolean {
  return errorStatus(error) === 0 || errorCode(error) === "NETWORK_ERROR";
}

export function getSpeakingExam(examSkillId: string) {
  return apiFetch<SpeakingExamDto>(
    "/learner/exam-skills/" + encodeURIComponent(examSkillId) + "/speaking",
  );
}
export function createSkillAttempt(input: {
  clientAttemptId: string;
  examSkillId: string;
  mode: AttemptMode;
  /** Số nguyên 1..30 hoặc null (không giới hạn / Thi thật); không bao giờ gửi 0. */
  limitMinutes: number | null;
}) {
  return apiFetch<SkillAttemptCreated>("/learner/skill-attempts", {
    method: "POST",
    json: input,
  });
}
export function getSkillAttempt(id: string) {
  return apiFetch<SkillAttemptDetail>(root(id));
}
export function completeSkillAttempt(
  id: string,
  input: { elapsedSeconds: number; reason: CompleteReason },
) {
  return apiFetch<SkillAttemptCompleted>(root(id) + "/complete", {
    method: "POST",
    json: input,
  });
}
export async function deleteSkillAttempt(id: string): Promise<void> {
  await apiFetch<null>(root(id), { method: "DELETE" });
}
export function getRecordingUrl(id: string, questionId: string) {
  return apiFetch<{ url: string; expiresAt: string }>(
    root(id) + "/recordings/" + encodeURIComponent(questionId) + "/url",
  );
}
export function requestGrading(id: string) {
  return apiFetch<unknown>(root(id) + "/grading-request", { method: "POST" });
}

/** Cổng tải bản ghi lên cho hàng đợi: xin đường tải, PUT blob, xác nhận. */
export const recordingTransport: UploadTransport = {
  requestUpload(attemptId, input) {
    return apiFetch<{ uploadUrl: string; path: string; alreadyUploaded?: boolean }>(
      root(attemptId) + "/recordings",
      { method: "POST", json: input },
    );
  },
  async putBlob(uploadUrl, blob, mimeType) {
    let res: Response;
    try {
      res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType || blob.type || "audio/webm" },
        body: blob,
      });
    } catch {
      throw new ApiError(0, "NETWORK_ERROR", "Không thể kết nối. Vui lòng thử lại.");
    }
    if (!res.ok) {
      // Storage báo trùng file bằng HTTP 400 kèm {"statusCode":"409"}: coi là đã có sẵn.
      let duplicate = res.status === 409;
      if (!duplicate)
        try {
          const body = (await res.json()) as { statusCode?: unknown };
          duplicate = String(body?.statusCode) === "409";
        } catch {
          // Không đọc được nội dung lỗi.
        }
      if (duplicate)
        throw new ApiError(409, "RECORDING_ALREADY_EXISTS", "Bản ghi đã có trên máy chủ.");
      throw new ApiError(res.status, "UPLOAD_FAILED", "Tải bản ghi lên chưa được.");
    }
  },
  async confirm(attemptId, questionId) {
    await apiFetch(
      root(attemptId) + "/recordings/" + encodeURIComponent(questionId) + "/confirm",
      { method: "POST" },
    );
  },
};
