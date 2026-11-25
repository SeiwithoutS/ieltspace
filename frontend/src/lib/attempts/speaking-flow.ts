import type { SpeakingEditorState } from "../exams/exam-editor";

/**
 * Máy trạng thái thuần của bài Speaking (không đụng DOM, không đụng micro) để
 * kiểm thử bằng node. Giao diện chỉ gọi các hàm này rồi vẽ kết quả.
 *
 * Một câu đi qua: preparing (chỉ Part 2) -> viewing -> ready (chỉ Practice,
 * chờ bấm ghi âm) -> recording -> answered. Hết câu cuối thì phase là "done".
 */
export type SpeakingPhase =
  | "preparing"
  | "viewing"
  | "ready"
  | "recording"
  | "answered"
  /** Micro bị ngắt hoặc lỗi lúc ghi: giữ nguyên câu, chờ bật lại micro. */
  | "micLost"
  | "done";

export type SpeakingMode = "practice" | "real";

/** Xem câu hỏi 5 giây trước khi ghi âm. */
export const VIEW_SECONDS = 5;
/** Mặc định khi đề không ghi số phút chuẩn bị / nói của Part 2. */
export const DEFAULT_PREP_SECONDS = 60;
export const DEFAULT_SPEAK_SECONDS = 120;

export interface SpeakingStep {
  /** Khóa ổn định của câu, dùng làm khóa bản ghi âm (vd "p1q0"). */
  id: string;
  /** Part gốc trong đề: 0, 1, 2 tương ứng Part 1, 2, 3. */
  part: number;
  /** Vị trí câu trong Part (từ 0). */
  index: number;
  /** Số câu của Part này trong bài đang làm. */
  count: number;
  kind: "qs" | "cue";
  /** Câu hỏi, hoặc toàn bộ nội dung thẻ gợi ý (Part 2). */
  text: string;
  topic?: string;
  instr?: string;
  /** Giây chuẩn bị (0 nếu không có). */
  prepSeconds: number;
  /** Giây nói tối đa (0 là không giới hạn). */
  maxSeconds: number;
}

export interface FlowState {
  index: number;
  phase: SpeakingPhase;
  /** preparing/viewing: giây còn lại. recording: giây đã nói. */
  seconds: number;
  /** Mốc (ms, Date.now) bắt đầu phase; `seconds` luôn tính theo giờ thật từ mốc này. */
  startedAt: number;
}

function minutesToSeconds(value: string | undefined, fallback: number): number {
  const trimmed = String(value ?? "").trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return fallback;
  return Math.round(Number(trimmed) * 60);
}

/** Dựng danh sách câu theo thứ tự thi từ cấu trúc đề; chỉ lấy các Part đã chọn. */
export function buildSpeakingSteps(
  state: SpeakingEditorState,
  parts: number[],
): SpeakingStep[] {
  const steps: SpeakingStep[] = [];
  state.items.forEach((item, part) => {
    if (!parts.includes(part)) return;
    const part1based = part + 1;
    if (item.kind === "qs") {
      const questions = item.qs.map((q) => q.trim()).filter(Boolean);
      questions.forEach((text, index) =>
        steps.push({
          id: `p${part1based}q${index}`,
          part,
          index,
          count: questions.length,
          kind: "qs",
          text,
          topic: item.topic || undefined,
          instr: item.instr || undefined,
          prepSeconds: 0,
          maxSeconds: 0,
        }),
      );
    } else {
      const text = (item.text || item.cue || "").trim();
      if (!text) return;
      steps.push({
        id: `p${part1based}q0`,
        part,
        index: 0,
        count: 1,
        kind: "cue",
        text,
        topic: item.topic || undefined,
        prepSeconds: minutesToSeconds(item.prep, DEFAULT_PREP_SECONDS),
        maxSeconds: minutesToSeconds(item.speak, DEFAULT_SPEAK_SECONDS),
      });
    }
  });
  return steps;
}

/** Tách thẻ gợi ý Part 2: dòng đầu là đề, dòng bắt đầu bằng "-" là ý cần nói. */
export function parseCueCard(text: string): {
  title: string;
  lines: { bullet: boolean; text: string }[];
} {
  const rows = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
  const [title = "", ...rest] = rows;
  return {
    title,
    lines: rest.map((row) =>
      /^[-•*]\s*/.test(row)
        ? { bullet: true, text: row.replace(/^[-•*]\s*/, "") }
        : { bullet: false, text: row },
    ),
  };
}

function enter(step: SpeakingStep | undefined, index: number, now: number): FlowState {
  if (!step) return { index, phase: "done", seconds: 0, startedAt: now };
  if (step.kind === "cue" && step.prepSeconds > 0)
    return { index, phase: "preparing", seconds: step.prepSeconds, startedAt: now };
  return { index, phase: "viewing", seconds: VIEW_SECONDS, startedAt: now };
}

export function initFlow(steps: SpeakingStep[], now: number = Date.now()): FlowState {
  return enter(steps[0], 0, now);
}

/** Hết đếm ngược: Thi thật tự ghi âm, Practice chờ người học bấm. */
function afterCountdown(index: number, mode: SpeakingMode, now: number): FlowState {
  return mode === "real"
    ? { index, phase: "recording", seconds: 0, startedAt: now }
    : { index, phase: "ready", seconds: 0, startedAt: now };
}

/**
 * Cập nhật theo giờ thật (gọi thường xuyên, vài lần mỗi giây). Giây còn lại/đã
 * nói tính từ `startedAt`, nên trình duyệt làm chậm timer ở tab nền cũng không
 * làm lệch. Trả cùng object nếu không có gì đổi.
 */
export function tickFlow(
  flow: FlowState,
  steps: SpeakingStep[],
  mode: SpeakingMode,
  now: number = Date.now(),
): FlowState {
  const step = steps[flow.index];
  if (!step) return flow;
  const elapsed = Math.max(0, Math.floor((now - flow.startedAt) / 1000));
  if (flow.phase === "preparing" || flow.phase === "viewing") {
    const total = flow.phase === "preparing" ? step.prepSeconds : VIEW_SECONDS;
    const remaining = total - elapsed;
    if (remaining > 0)
      return remaining === flow.seconds ? flow : { ...flow, seconds: remaining };
    return afterCountdown(flow.index, mode, now);
  }
  if (flow.phase === "recording") {
    if (step.maxSeconds > 0 && elapsed >= step.maxSeconds)
      return { ...flow, phase: "answered", seconds: step.maxSeconds };
    return elapsed === flow.seconds ? flow : { ...flow, seconds: elapsed };
  }
  return flow;
}

/** Practice: bấm ghi âm khi sẵn sàng. Thi thật không có thao tác này. */
export function startRecording(
  flow: FlowState,
  mode: SpeakingMode,
  now: number = Date.now(),
): FlowState {
  if (mode !== "practice" || flow.phase !== "ready") return flow;
  return { ...flow, phase: "recording", seconds: 0, startedAt: now };
}

export function stopRecording(flow: FlowState): FlowState {
  return flow.phase === "recording" ? { ...flow, phase: "answered" } : flow;
}

/** Practice: ghi lại câu đã trả lời; quay về trạng thái chờ bấm ghi âm. */
export function rerecord(flow: FlowState, mode: SpeakingMode): FlowState {
  if (mode !== "practice" || flow.phase !== "answered") return flow;
  return { ...flow, phase: "ready", seconds: 0 };
}

/** Practice: đang ở "ghi lại" nhưng muốn giữ bản cũ thì quay về đã trả lời. */
export function keepOld(flow: FlowState, mode: SpeakingMode): FlowState {
  if (mode !== "practice" || flow.phase !== "ready") return flow;
  return { ...flow, phase: "answered" };
}

/** Micro bị ngắt/lỗi lúc đang ghi: dừng ghi, chờ bật lại micro. */
export function micLostFlow(flow: FlowState): FlowState {
  return flow.phase === "recording" ? { ...flow, phase: "micLost" } : flow;
}

/**
 * Có micro lại. Practice: về "ready" để ghi lại. Thi thật: nếu đã có bản ghi dở
 * hợp lệ thì giữ làm bản trả lời (không cho ghi lại câu đã nói); chưa có thì ghi
 * lại câu đó từ đầu.
 */
export function resumeFlow(
  flow: FlowState,
  mode: SpeakingMode,
  hasAnswer: boolean,
  now: number = Date.now(),
): FlowState {
  if (flow.phase !== "micLost") return flow;
  if (mode === "practice") return { ...flow, phase: "ready", seconds: 0, startedAt: now };
  if (hasAnswer) return { ...flow, phase: "answered" };
  return { ...flow, phase: "recording", seconds: 0, startedAt: now };
}

/** Practice: bỏ qua phần chuẩn bị của Part 2. */
export function skipPrep(flow: FlowState, mode: SpeakingMode): FlowState {
  if (mode !== "practice" || flow.phase !== "preparing") return flow;
  return { ...flow, phase: "ready", seconds: 0 };
}

/**
 * Được bấm "Câu tiếp" khi nào: đã trả lời xong; riêng Thi thật cho bấm cả khi
 * đang ghi (bấm là dừng và sang câu kế, vì không có nút dừng riêng).
 */
export function canNext(flow: FlowState, mode: SpeakingMode): boolean {
  return (
    flow.phase === "answered" ||
    (mode === "real" && flow.phase === "recording")
  );
}

/** Chỉ số câu đầu tiên từ `from` trở đi chưa có trong `answered` (không có `answered` thì chính `from`). */
function firstOpen(
  steps: SpeakingStep[],
  from: number,
  answered?: ReadonlySet<string>,
): number {
  let i = from;
  if (answered) while (i < steps.length && answered.has(steps[i].id)) i++;
  return i;
}

/**
 * Sang câu kế. Thi thật (strict) bỏ qua các câu đã có trong `answered`: câu đã
 * trả lời không bị mở lại để ghi đè (vd Part 2 bị kéo về chuẩn bị do mất bản
 * ghi, các câu Part 3 đã nói vẫn giữ). Practice cho đi qua mọi câu.
 */
export function nextStep(
  flow: FlowState,
  steps: SpeakingStep[],
  mode: SpeakingMode,
  now: number = Date.now(),
  answered?: ReadonlySet<string>,
): FlowState {
  if (!canNext(flow, mode)) return flow;
  const next = firstOpen(
    steps,
    flow.index + 1,
    mode === "real" ? answered : undefined,
  );
  return enter(steps[next], next, now);
}

/** Hết giờ tổng: giữ phần ghi dở (coi như đã trả lời), các trạng thái khác đứng yên. */
export function expireFlow(flow: FlowState): FlowState {
  return flow.phase === "recording" || flow.phase === "micLost"
    ? { ...flow, phase: "answered" }
    : flow;
}

/** Khởi động lại đồng hồ của câu đang đếm (sau khi kiểm tra micro, hoặc vào lại bài). */
export function rearmFlow(
  flow: FlowState,
  steps: SpeakingStep[],
  now: number = Date.now(),
): FlowState {
  if (flow.phase !== "preparing" && flow.phase !== "viewing") return flow;
  return enter(steps[flow.index], flow.index, now);
}

/** Vị trí lưu trong draft để vào lại bài (xem AttemptState.speaking). */
export interface SavedFlow {
  stepId: string;
  index: number;
  phase: SpeakingPhase;
}

/**
 * Khôi phục vị trí khi quay lại bài sau khi thoát/gián đoạn.
 * - Câu đã có bản ghi (`answeredIds`): về "answered", giữ nguyên bản ghi.
 * - Câu chưa có bản ghi: về đầu câu (Part 2 về "preparing", Part 1/3 về
 *   "viewing"), bỏ phần ghi dở.
 * - Câu nào từ đầu bài đến vị trí đã lưu mà thiếu bản ghi (kho bị xóa/mất) thì
 *   quay về câu thiếu đầu tiên, không để người học nhảy cóc qua câu chưa có tiếng.
 * - Đã hết câu và không thiếu câu nào: "done".
 * Thi thật chặt hơn với câu Part 1/3 (không có "ghi lại"): câu đang làm dở ở
 * vị trí đã lưu (mọi phase, kể cả mới xem) được đóng lại ngay: có bản ghi dở thì
 * giữ làm đáp án, chưa có thì để trống; rồi sang câu kế. Các câu Part 1/3 đứng
 * trước không bị kéo lùi dù thiếu bản ghi. Part 2 đã qua chuẩn bị và đang ghi
 * (recording/micLost) cũng bị đóng như vậy; Part 2 còn ở preparing/viewing (chưa
 * ghi gì) vẫn về "preparing" theo luật trên.
 * Vị trí lấy theo `stepId` (đề đổi thứ tự vẫn đúng), không thấy thì theo
 * `index` (chỉ để mở câu, không đóng câu nào), vẫn không hợp lệ thì câu đầu
 * chưa trả lời. Thi thật không bao giờ mở lại câu đã có bản ghi.
 */
export function restoreFlowDetailed(
  steps: SpeakingStep[],
  saved: SavedFlow,
  answeredIds: Iterable<string>,
  now: number = Date.now(),
  mode: SpeakingMode = "practice",
): { flow: FlowState; closedId: string | null } {
  const answered = new Set(answeredIds);
  const strict = mode === "real";
  const fresh = (flow: FlowState) => ({ flow, closedId: null });
  if (steps.length === 0)
    return fresh({ index: 0, phase: "done", seconds: 0, startedAt: now });
  let index: number;
  // Vị trí lưu có khớp một câu thật trong bài hay không (không khớp thì không "đóng" câu nào).
  let matched = true;
  if (saved.phase === "done" && saved.stepId === "") index = steps.length;
  else {
    index = steps.findIndex((s) => s.id === saved.stepId);
    if (
      index < 0 &&
      Number.isInteger(saved.index) &&
      saved.index >= 0 &&
      saved.index < steps.length
    ) {
      // Đề đã đổi, stepId không còn: vị trí theo index chỉ là đoán, không dùng để "đóng" câu nào.
      index = saved.index;
      matched = false;
    }
    if (index < 0) {
      matched = false;
      index = steps.findIndex((s) => !answered.has(s.id));
      if (index < 0) index = steps.length;
    }
  }
  // Thi thật: Part 2 đã qua chuẩn bị và đang ghi (hoặc micro ngắt giữa lúc ghi) thì chặt như Part 1/3.
  const speakingCue =
    strict &&
    matched &&
    index < steps.length &&
    steps[index].kind === "cue" &&
    (saved.phase === "recording" || saved.phase === "micLost");
  const missing = steps.findIndex(
    (s, i) =>
      i <= index &&
      !answered.has(s.id) &&
      !(strict && s.kind === "qs") &&
      !(speakingCue && i === index),
  );
  if (missing >= 0) return fresh(enter(steps[missing], missing, now));
  if (index >= steps.length)
    return fresh({ index: steps.length, phase: "done", seconds: 0, startedAt: now });
  const current = steps[index];
  if (strict && (current.kind === "qs" || speakingCue)) {
    if (!matched) {
      // Không chắc vị trí: mở câu ở vị trí đó, nhưng không mở lại câu đã trả lời.
      const open = firstOpen(steps, index, answered);
      return fresh(enter(steps[open], open, now));
    }
    const next = firstOpen(steps, index + 1, answered);
    return {
      flow: enter(steps[next], next, now),
      closedId: answered.has(current.id) ? null : current.id,
    };
  }
  return fresh({ index, phase: "answered", seconds: 0, startedAt: now });
}

export function restoreFlow(
  steps: SpeakingStep[],
  saved: SavedFlow,
  answeredIds: Iterable<string>,
  now: number = Date.now(),
  mode: SpeakingMode = "practice",
): FlowState {
  return restoreFlowDetailed(steps, saved, answeredIds, now, mode).flow;
}

export interface PartProgress {
  part: number;
  status: "done" | "current" | "todo";
  /** Số câu đã qua hoặc đang ở (để hiện "2/5"). */
  position: number;
  count: number;
}

/** Thanh Part: phản ánh vị trí thật trong bài (chỉ các Part có câu hỏi). */
export function partProgress(
  steps: SpeakingStep[],
  flow: FlowState,
): PartProgress[] {
  const current = steps[Math.min(flow.index, steps.length - 1)];
  const done = flow.phase === "done";
  const parts = [...new Set(steps.map((s) => s.part))];
  return parts.map((part) => {
    const inPart = steps.filter((s) => s.part === part);
    const first = steps.indexOf(inPart[0]);
    const last = first + inPart.length - 1;
    if (done || flow.index > last)
      return { part, status: "done", position: inPart.length, count: inPart.length };
    if (flow.index < first)
      return { part, status: "todo", position: 0, count: inPart.length };
    return {
      part,
      status: current?.part === part ? "current" : "todo",
      position: flow.index - first + 1,
      count: inPart.length,
    };
  });
}
