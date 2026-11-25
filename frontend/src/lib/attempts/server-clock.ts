/**
 * Gốc thời gian của bài Speaking khi vào lại (F5, Lưu và thoát): máy chủ giữ
 * `startedAt`/`deadlineAt` nên đó là gốc; mốc trong nháp localStorage chỉ là phương
 * án dự phòng khi chưa hỏi được máy chủ (người dùng sửa được nháp nên không tin hơn máy chủ).
 * Module thuần, không gọi mạng.
 */

/** Sai số của Date (làm tròn giây) và độ trễ mạng; offset nhỏ hơn mức này coi là 0. */
export const OFFSET_NOISE_MS = 1500;
/** Offset lớn hơn mức này là dữ liệu hỏng, bỏ. */
export const OFFSET_MAX_MS = 24 * 60 * 60 * 1000;
/** Phản hồi chậm hơn mức này thì không đủ tin để ước lượng offset. */
export const OFFSET_MAX_RTT_MS = 10_000;

/**
 * Ước lượng (giờ máy chủ - giờ máy khách) từ header Date của một phản hồi.
 * Trả 0 khi không có header (trình duyệt chỉ đọc được Date nếu máy chủ cho phép
 * qua Access-Control-Expose-Headers), phản hồi quá chậm hoặc lệch nhỏ.
 * Kết quả luôn co về phía 0 một khoảng bằng sai số, để ước lượng không bao giờ
 * điều chỉnh nhiều hơn mức chắc chắn.
 */
export function estimateOffsetMs(input: {
  sentAt: number;
  receivedAt: number;
  dateHeader?: string | null;
}): number {
  if (!input.dateHeader) return 0;
  const rtt = input.receivedAt - input.sentAt;
  if (!Number.isFinite(rtt) || rtt < 0 || rtt > OFFSET_MAX_RTT_MS) return 0;
  const server = Date.parse(input.dateHeader);
  if (!Number.isFinite(server)) return 0;
  // Date bị cắt về giây nên giờ thật nằm trong [server, server + 1 giây).
  const offset = server + 500 - (input.sentAt + input.receivedAt) / 2;
  const margin = OFFSET_NOISE_MS + rtt / 2;
  if (Math.abs(offset) <= margin || Math.abs(offset) > OFFSET_MAX_MS) return 0;
  return Math.round(offset - Math.sign(offset) * margin);
}

/** Kết quả hỏi máy chủ: có chi tiết lượt, hoặc lỗi (status 0/undefined là không kết nối được). */
export type ServerAttemptTime =
  | {
      ok: true;
      status: string;
      startedAt: string;
      deadlineAt: string | null;
    }
  | { ok: false; httpStatus?: number };

export type ClockResolution =
  /** Máy chủ đã chốt lượt (ở thiết bị/tab khác): sang trang xác nhận, dọn nháp. */
  | { kind: "completed" }
  /** Lượt không còn (404 hoặc ABANDONED): bài này không còn hợp lệ. */
  | { kind: "gone" }
  /** Gốc từ máy chủ, đã quy về đồng hồ máy khách. `limitSeconds` null: không giới hạn. */
  | {
      kind: "server";
      epoch: number;
      deadlineEpoch: number | null;
      limitSeconds: number | null;
    }
  /** Chưa hỏi được máy chủ: dùng mốc trong nháp (có thể undefined nếu nháp không có). */
  | { kind: "draft"; epoch: number | undefined };

/**
 * Quyết định gốc thời gian. Gốc máy chủ luôn thắng mốc nháp (nháp muộn hơn thì bị
 * bỏ, nên sửa nháp không làm ít giờ hơn hay nhiều giờ hơn thực tế). Mốc quy về
 * đồng hồ máy khách bằng offset và không bao giờ nằm ở tương lai.
 */
export function resolveClock(input: {
  server: ServerAttemptTime;
  draftEpoch: number | undefined;
  /** Giờ máy khách (Date.now()). */
  now: number;
  /** Giờ máy chủ - giờ máy khách, xem estimateOffsetMs. */
  offsetMs: number;
}): ClockResolution {
  const { server, draftEpoch, now } = input;
  if (!server.ok) {
    if (server.httpStatus === 404) return { kind: "gone" };
    return { kind: "draft", epoch: draftEpoch };
  }
  if (server.status === "COMPLETED") return { kind: "completed" };
  if (server.status === "ABANDONED") return { kind: "gone" };
  const started = Date.parse(server.startedAt);
  if (!Number.isFinite(started)) return { kind: "draft", epoch: draftEpoch };
  const offset = Number.isFinite(input.offsetMs) ? input.offsetMs : 0;
  const epoch = Math.min(started - offset, now);
  let deadlineEpoch: number | null = null;
  let limitSeconds: number | null = null;
  if (server.deadlineAt) {
    const deadline = Date.parse(server.deadlineAt);
    if (Number.isFinite(deadline) && deadline > started) {
      limitSeconds = Math.round((deadline - started) / 1000);
      deadlineEpoch = epoch + limitSeconds * 1000;
    }
  }
  return { kind: "server", epoch, deadlineEpoch, limitSeconds };
}
