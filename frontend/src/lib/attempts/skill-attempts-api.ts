import { ApiError, apiFetch } from "../shared/api";
import type { GradingRequest } from '../grading/grading';
import type { UploadTransport } from "./upload-queue";
import type { TextTransport } from "./writing-queue";
import type { WritingTaskKey } from "./writing-text";

/**
 * Client có kiểu cho API lượt làm kỹ năng của Người học (Speaking và Writing).
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
export interface WritingExamTask {
  taskKey: WritingTaskKey;
  prompt: string;
  imageUrl: string | null;
  minWords: number;
  essayType?: string | null;
  topic?: string | null;
}
export interface WritingExamDto {
  examSkillId: string;
  title: string;
  form: "ACADEMIC" | "GENERAL" | null;
  durationMinutes: number;
  tasks: WritingExamTask[];
}
export interface WritingTaskText {
  taskKey: WritingTaskKey;
  text: string;
  wordCount: number;
  updatedAt: string | null;
}
export interface SavedWriting {
  sections: number[] | null;
  tasks: Pick<WritingTaskText, 'taskKey' | 'text'>[];
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
  /** Kỹ năng của lượt (máy chủ cũ có thể chưa trả). */
  skill?: "SPEAKING" | "WRITING";
  status: SkillAttemptStatus;
  mode: AttemptMode;
  startedAt: string;
  deadlineAt: string | null;
  completedAt: string | null;
  contentExpiresAt: string | null;
  contentStatus?: 'AVAILABLE' | 'HELD' | 'EXPIRED' | 'DELETED';
  sections?: number[] | null;
  elapsedSeconds: number | null;
  recordings: ServerRecording[];
  /** Chỉ lượt Writing: số từ từng Task đã lưu (không kèm nội dung). */
  tasks?: { taskKey: WritingTaskKey; wordCount: number; updatedAt: string | null }[];
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
export function getWritingExam(examSkillId: string) {
  return apiFetch<WritingExamDto>(
    "/learner/exam-skills/" + encodeURIComponent(examSkillId) + "/writing",
  );
}
export function putWritingText(id: string, taskKey: WritingTaskKey, text: string) {
  return apiFetch<{ taskKey: string; wordCount: number; updatedAt: string }>(
    root(id) + "/writing/" + taskKey,
    { method: "PUT", json: { text } },
  );
}
export function getWritingText(id: string, taskKey: WritingTaskKey) {
  return apiFetch<WritingTaskText>(root(id) + "/writing/" + taskKey);
}
export function getSavedWriting(id: string) {
  return apiFetch<SavedWriting>(root(id) + '/writing');
}
export function createSkillAttempt(input: {
  clientAttemptId: string;
  examSkillId: string;
  mode: AttemptMode;
  /** Số nguyên 1..30 (Speaking) hoặc 1..60 (Writing), hoặc null (không giới hạn / Thi thật); không bao giờ gửi 0. */
  limitMinutes: number | null;
  sections?: number[];
}) {
  return apiFetch<SkillAttemptCreated>("/learner/skill-attempts", {
    method: "POST",
    json: input,
  });
}
export function getSkillAttempt(id: string) {
  return apiFetch<SkillAttemptDetail>(root(id));
}
/** Như getSkillAttempt, kèm mốc gửi/nhận và header Date để ước lượng lệch đồng hồ (xem server-clock.ts). */
export async function getSkillAttemptTimed(id: string) {
  let timing: { date: string | null; sentAt: number; receivedAt: number } = {
    date: null,
    sentAt: 0,
    receivedAt: 0,
  };
  const detail = await apiFetch<SkillAttemptDetail>(root(id), {
    onResponse: (info) => {
      timing = info;
    },
  });
  return { detail, timing };
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
export function getGradingRequest(id: string) {
  return apiFetch<{ request: GradingRequest | null }>(root(id) + '/grading-request');
}
export function requestGrading(id: string, retryOf?: string) {
  return apiFetch<GradingRequest>(root(id) + '/grading-request', { method: 'POST', json: { retryOf } });
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

/** Cổng lưu văn bản Writing cho hàng đợi văn bản. `putOnHide` dùng fetch keepalive (best-effort lúc đóng trang). */
export const writingTransport: TextTransport = {
  put: (attemptId, taskKey, text) => putWritingText(attemptId, taskKey, text),
  putOnHide(attemptId, taskKey, text) {
    void apiFetch(root(attemptId) + "/writing/" + taskKey, {
      method: "PUT",
      json: { text },
      keepalive: true,
    }).catch(() => undefined);
  },
};
