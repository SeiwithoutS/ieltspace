/**
 * Ghi theo đoạn (SPK-17): MediaRecorder.start(timeslice) trả từng đoạn, mỗi đoạn được lưu
 * vào IndexedDB ngay để F5, đóng tab hay trình duyệt sập giữa lúc nói không làm mất phần đã ghi.
 * Module thuần (không đụng IndexedDB hay MediaRecorder) để test bằng node.
 *
 * Ghép đoạn: các đoạn của CÙNG MỘT MediaRecorder nối theo thứ tự `seq` thành một Blob cùng mime
 * là đủ (WebM/Ogg là luồng liên tục; đoạn sau không tự phát được nhưng nối vào đoạn đầu thì phát được).
 * Giới hạn: Safari ghi audio/mp4 phân mảnh (fMP4) nên đoạn đầu mang tiêu đề, các đoạn sau là moof/mdat;
 * nối lại thường phát được nhưng chưa kiểm trên mọi phiên bản Safari. Bản dở ghép từ đoạn chỉ chính xác
 * đến ranh giới đoạn cuối (tối đa khoảng một timeslice cuối bị mất).
 */
export interface RecordingChunk {
  seq: number;
  blob: Blob;
  mimeType: string;
  /** Mốc bắt đầu lần ghi (cùng giá trị mọi đoạn của một lần ghi). */
  startedAt: number;
  /** Thời điểm đoạn này được trả về. */
  at: number;
}

/** Timeslice (ms) truyền cho MediaRecorder.start. */
export const CHUNK_TIMESLICE_MS = 1000;
/** Trần số đoạn của một câu (1 giây/đoạn: 15 phút là dư); vượt thì bỏ đoạn mới, không phá bản ghi chính. */
export const MAX_CHUNKS_PER_RECORDING = 1200;
/** Trần dung lượng đoạn của một câu (byte). */
export const MAX_CHUNK_BYTES = 40 * 1024 * 1024;

/** Có nên lưu thêm đoạn này không (theo số đoạn và dung lượng đã lưu của câu). */
export function canAppendChunk(
  stored: { count: number; bytes: number },
  next: { size: number },
): boolean {
  return (
    next.size > 0 &&
    stored.count < MAX_CHUNKS_PER_RECORDING &&
    stored.bytes + next.size <= MAX_CHUNK_BYTES
  );
}

/**
 * Ghép các đoạn thành một bản ghi. Sắp theo `seq`, bỏ đoạn trùng seq, rỗng; dừng ở chỗ hụt seq đầu tiên
 * (đoạn sau chỗ hụt không nối liền được). Trả undefined nếu không có gì dùng được.
 */
export function assembleChunks(chunks: RecordingChunk[]): {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  recordedAt: number;
} | undefined {
  const bySeq = new Map<number, RecordingChunk>();
  for (const c of chunks)
    if (c && Number.isInteger(c.seq) && c.seq >= 0 && c.blob && c.blob.size > 0 && !bySeq.has(c.seq))
      bySeq.set(c.seq, c);
  const used: RecordingChunk[] = [];
  for (let seq = 0; bySeq.has(seq); seq++) used.push(bySeq.get(seq) as RecordingChunk);
  if (used.length === 0) return undefined;
  const first = used[0];
  const last = used[used.length - 1];
  const mimeType = first.mimeType || "audio/webm";
  return {
    blob: new Blob(
      used.map((c) => c.blob),
      { type: mimeType },
    ),
    mimeType,
    durationMs: Math.max(0, last.at - first.startedAt),
    recordedAt: first.startedAt,
  };
}

export interface OrphanPlan {
  /** Câu có đoạn mồ côi cần ghép thành bản dở (chỉ Thi thật). */
  recover: string[];
  /** Câu có đoạn cần xóa (đã có bản ghi hoàn chỉnh, câu không còn trong bài, hoặc Practice). */
  drop: string[];
}

/**
 * Quyết định xử lý đoạn mồ côi khi vào lại bài.
 * - Câu đã có bản ghi hoàn chỉnh: bản hoàn chỉnh thắng, xóa đoạn.
 * - Câu không còn trong bài: xóa.
 * - Thi thật: ghép thành bản dở, giữ làm đáp án của câu (luật vào lại: câu đang ghi dở được đóng, không ghi lại).
 * - Practice: bỏ bản dở (câu dở về đầu câu, người học ghi lại).
 */
export function planOrphanChunks(input: {
  chunkQuestionIds: string[];
  completeIds: Iterable<string>;
  stepIds: Iterable<string>;
  mode: "real" | "practice";
}): OrphanPlan {
  const complete = new Set(input.completeIds);
  const steps = new Set(input.stepIds);
  const plan: OrphanPlan = { recover: [], drop: [] };
  for (const id of new Set(input.chunkQuestionIds)) {
    if (complete.has(id) || !steps.has(id) || input.mode !== "real") plan.drop.push(id);
    else plan.recover.push(id);
  }
  return plan;
}
