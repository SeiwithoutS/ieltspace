import type {
  AttemptMode,
  AttemptState,
  SpeakingProgress,
  WritingProgress,
} from "../../components/attempts/types";

export interface AttemptOptions {
  mode: AttemptMode;
  parts: number[];
  /** Mức thời gian đã chọn (phút, 0 là không giới hạn). Draft cũ không có trường này. */
  limitMinutes?: number;
}
export interface AttemptDraft {
  options: AttemptOptions;
  /**
   * Draft có limitMinutes: số giây đã dùng. Draft cũ (không có limitMinutes):
   * Thi thật là số giây còn lại, Luyện tập là số giây đã dùng.
   */
  seconds: number;
  state?: AttemptState;
  /** Thời điểm lưu (ms, Date.now); dùng tính thời gian gián đoạn của bài Speaking. */
  savedAt?: number;
  /**
   * Speaking và Writing: mốc tuyệt đối (ms, Date.now) bắt đầu tính giờ. Đồng hồ không dừng
   * khi rời đi nên giây đã dùng luôn là (bây giờ - mốc), không cộng dồn từng lần lưu.
   */
  startedAtEpoch?: number;
  /**
   * Speaking và Writing: bài đã bấm Hoàn thành/Lưu nhưng chưa tải lên đủ hoặc chưa chốt được
   * trên máy chủ. Còn draft + bản ghi trên máy để thử lại; mở lại đề thì sang trang xác nhận.
   */
  finished?: FinishedInfo;
}
export interface FinishedInfo {
  elapsedSeconds: number;
  reason: "SUBMITTED" | "TIME_UP";
  serverAttemptId?: string;
  /** Số câu đã trả lời lúc kết thúc. */
  answered: number;
  finishedAt: number;
}

const SPEAKING_PHASES = [
  "preparing",
  "viewing",
  "ready",
  "recording",
  "answered",
  "micLost",
  "done",
];

/** Tiến độ Speaking hợp lệ, hoặc undefined nếu sai dạng (bỏ riêng phần này, không bỏ cả draft). */
function cleanSpeaking(value: unknown): SpeakingProgress | undefined {
  if (!isObject(value)) return undefined;
  const { attemptId, stepId, index, phase, answered } = value;
  if (typeof attemptId !== "string" || !attemptId || attemptId.length > 100)
    return undefined;
  if (typeof stepId !== "string" || stepId.length > 100) return undefined;
  if (!Number.isInteger(index) || (index as number) < 0) return undefined;
  if (typeof phase !== "string" || !SPEAKING_PHASES.includes(phase))
    return undefined;
  if (
    !Array.isArray(answered) ||
    answered.length > 200 ||
    !answered.every((id) => typeof id === "string" && id.length <= 100)
  )
    return undefined;
  const serverAttemptId = (value as Record<string, unknown>).serverAttemptId;
  return {
    attemptId,
    stepId,
    index: index as number,
    phase: phase as SpeakingProgress["phase"],
    answered: answered as string[],
    ...(typeof serverAttemptId === "string" &&
    serverAttemptId &&
    serverAttemptId.length <= 100
      ? { serverAttemptId }
      : {}),
  };
}

/** Tiến độ Writing hợp lệ, hoặc undefined nếu sai dạng. */
function cleanWriting(value: unknown): WritingProgress | undefined {
  if (!isObject(value)) return undefined;
  const { attemptId, serverAttemptId } = value;
  if (typeof attemptId !== "string" || !attemptId || attemptId.length > 100)
    return undefined;
  return {
    attemptId,
    ...(typeof serverAttemptId === "string" &&
    serverAttemptId &&
    serverAttemptId.length <= 100
      ? { serverAttemptId }
      : {}),
  };
}

function cleanFinished(value: unknown): FinishedInfo | undefined {
  if (!isObject(value)) return undefined;
  const { elapsedSeconds, reason, serverAttemptId, answered, finishedAt } = value;
  if (
    typeof elapsedSeconds !== "number" ||
    !Number.isFinite(elapsedSeconds) ||
    elapsedSeconds < 0
  )
    return undefined;
  if (reason !== "SUBMITTED" && reason !== "TIME_UP") return undefined;
  if (!Number.isInteger(answered) || (answered as number) < 0) return undefined;
  if (typeof finishedAt !== "number" || !Number.isFinite(finishedAt))
    return undefined;
  return {
    elapsedSeconds,
    reason,
    answered: answered as number,
    finishedAt,
    ...(typeof serverAttemptId === "string" &&
    serverAttemptId &&
    serverAttemptId.length <= 100
      ? { serverAttemptId }
      : {}),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isTextMap(value: unknown): boolean {
  return (
    isObject(value) &&
    Object.entries(value).every(
      ([key, text]) => /^\d+$/.test(key) && typeof text === "string",
    )
  );
}
function isAttemptState(value: unknown): value is AttemptState {
  if (!isObject(value)) return false;
  const numbers = ["current", "fontPct", "split", "task", "pos", "vol"];
  if (
    numbers.some(
      (key) =>
        value[key] !== undefined &&
        (typeof value[key] !== "number" || !Number.isFinite(value[key])),
    )
  )
    return false;
  if (
    ["dark", "panelOpen", "playing"].some(
      (key) => value[key] !== undefined && typeof value[key] !== "boolean",
    )
  )
    return false;
  if (
    ["sel", "speed"].some(
      (key) => value[key] !== undefined && typeof value[key] !== "string",
    )
  )
    return false;
  if (
    ["ans", "texts", "notes"].some(
      (key) => value[key] !== undefined && !isTextMap(value[key]),
    )
  )
    return false;
  if (
    value.flag !== undefined &&
    (!Array.isArray(value.flag) ||
      !value.flag.every((n) => Number.isInteger(n) && n > 0))
  )
    return false;
  if (
    value.congCu !== undefined &&
    value.congCu !== "cursor" &&
    value.congCu !== "highlight"
  )
    return false;
  if (
    ["pop", "active"].some(
      (key) =>
        value[key] !== undefined &&
        value[key] !== null &&
        !["h1", "h2", "h3"].includes(String(value[key])),
    )
  )
    return false;
  if (value.hl !== undefined) {
    const highlights = value.hl;
    if (
      !isObject(highlights) ||
      !["h1", "h2", "h3"].every((key) => {
        const note = highlights[key];
        return (
          isObject(note) &&
          typeof note.color === "string" &&
          typeof note.note === "string" &&
          typeof note.on === "boolean"
        );
      })
    )
      return false;
  }
  return true;
}

/** Accept valid drafts from the previous JSX pages; malformed storage starts a fresh attempt. */
export function parseAttemptDraft(raw: string | null): AttemptDraft | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || !isObject(value.options)) return null;
    const { mode, parts, limitMinutes } = value.options;
    if (mode !== "real" && mode !== "practice") return null;
    if (
      !Array.isArray(parts) ||
      !parts.every((n) => Number.isInteger(n) && n >= 0)
    )
      return null;
    if (mode === "practice" && parts.length === 0) return null;
    if (
      typeof value.seconds !== "number" ||
      !Number.isFinite(value.seconds) ||
      value.seconds < 0
    )
      return null;
    if (value.state !== undefined && !isAttemptState(value.state)) return null;
    const limit =
      typeof limitMinutes === "number" &&
      Number.isInteger(limitMinutes) &&
      limitMinutes >= 0 &&
      limitMinutes <= 600
        ? { limitMinutes }
        : {};
    let state: AttemptState | undefined = value.state;
    if (state && "speaking" in state) {
      const { speaking: raw, ...rest } = state as AttemptState & {
        speaking: unknown;
      };
      const speaking = cleanSpeaking(raw);
      state = speaking ? { ...rest, speaking } : rest;
    }
    if (state && "writing" in state) {
      const { writing: raw, ...rest } = state as AttemptState & {
        writing: unknown;
      };
      const writing = cleanWriting(raw);
      state = writing ? { ...rest, writing } : rest;
    }
    const savedAt =
      typeof value.savedAt === "number" &&
      Number.isFinite(value.savedAt) &&
      value.savedAt >= 0
        ? { savedAt: value.savedAt }
        : {};
    const startedAtEpoch =
      typeof value.startedAtEpoch === "number" &&
      Number.isFinite(value.startedAtEpoch) &&
      value.startedAtEpoch >= 0
        ? { startedAtEpoch: value.startedAtEpoch }
        : {};
    const finished = cleanFinished(value.finished);
    // Draft cũ có thể lưu parts trùng/không theo thứ tự: chuẩn hóa (tối đa 10 mục).
    const cleanParts = [...new Set(parts as number[])]
      .sort((a, b) => a - b)
      .slice(0, 10);
    return {
      options: { mode, parts: cleanParts, ...limit },
      seconds: value.seconds,
      state,
      ...savedAt,
      ...startedAtEpoch,
      ...(finished ? { finished } : {}),
    };
  } catch {
    return null;
  }
}
