import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_CHUNKS_PER_RECORDING,
  MAX_CHUNK_BYTES,
  assembleChunks,
  canAppendChunk,
  planOrphanChunks,
} from "../src/lib/attempts/recording-chunks.ts";
import { createMemoryChunkStore } from "../src/lib/attempts/recordings.ts";
import {
  REAL_LIMIT_SECONDS,
  applyServerRules,
  resolveClock,
  serverAttemptRules,
} from "../src/lib/attempts/server-clock.ts";

const chunk = (seq, text, extra = {}) => ({
  seq,
  blob: new Blob([text], { type: "audio/webm" }),
  mimeType: "audio/webm;codecs=opus",
  startedAt: 1000,
  at: 1000 + (seq + 1) * 1000,
  ...extra,
});

test("ghép đoạn theo thứ tự seq dù đến lộn xộn, tính thời lượng đến đoạn cuối", async () => {
  const out = assembleChunks([chunk(2, "C"), chunk(0, "A"), chunk(1, "B")]);
  assert.ok(out);
  assert.equal(await out.blob.text(), "ABC");
  assert.equal(out.mimeType, "audio/webm;codecs=opus");
  assert.equal(out.durationMs, 3000);
  assert.equal(out.recordedAt, 1000);
});

test("ghép dừng ở chỗ hụt seq, bỏ đoạn trùng và đoạn rỗng", async () => {
  const out = assembleChunks([
    chunk(0, "A"),
    chunk(0, "X"),
    chunk(1, "B"),
    chunk(3, "D"),
    chunk(2, ""),
  ]);
  assert.equal(await out.blob.text(), "AB");
  assert.equal(assembleChunks([chunk(1, "B")]), undefined);
  assert.equal(assembleChunks([]), undefined);
});

test("trần số đoạn và dung lượng", () => {
  assert.equal(canAppendChunk({ count: 0, bytes: 0 }, { size: 10 }), true);
  assert.equal(canAppendChunk({ count: 0, bytes: 0 }, { size: 0 }), false);
  assert.equal(
    canAppendChunk({ count: MAX_CHUNKS_PER_RECORDING, bytes: 0 }, { size: 1 }),
    false,
  );
  assert.equal(
    canAppendChunk({ count: 1, bytes: MAX_CHUNK_BYTES }, { size: 1 }),
    false,
  );
});

test("khôi phục đoạn mồ côi: Thi thật ghép câu chưa có bản hoàn chỉnh, còn lại xóa", () => {
  const input = {
    chunkQuestionIds: ["p1q0", "p1q1", "gone", "p1q0"],
    completeIds: ["p1q1"],
    stepIds: ["p1q0", "p1q1", "p1q2"],
  };
  assert.deepEqual(planOrphanChunks({ ...input, mode: "real" }), {
    recover: ["p1q0"],
    drop: ["p1q1", "gone"],
  });
  // Practice bỏ hết bản dở.
  assert.deepEqual(planOrphanChunks({ ...input, mode: "practice" }), {
    recover: [],
    drop: ["p1q0", "p1q1", "gone"],
  });
});

test("kho đoạn trong bộ nhớ: lưu, đọc theo seq, xóa, trần", async () => {
  const store = createMemoryChunkStore();
  assert.equal(await store.appendChunk("q", chunk(1, "B")), true);
  assert.equal(await store.appendChunk("q", chunk(0, "A")), true);
  assert.deepEqual(await store.chunkQuestionIds(), ["q"]);
  assert.deepEqual((await store.readChunks("q")).map((c) => c.seq), [0, 1]);
  await store.dropChunks("q");
  assert.deepEqual(await store.chunkQuestionIds(), []);
  assert.deepEqual(await store.readChunks("q"), []);
  // Sau khi xóa, ngân sách của câu được đặt lại.
  const big = chunk(0, "x".repeat(10), {
    blob: { size: MAX_CHUNK_BYTES + 1 },
  });
  assert.equal(await store.appendChunk("q", big), false);
  assert.equal(await store.appendChunk("q", chunk(0, "A")), true);
});

test("mode và giới hạn lấy từ máy chủ, không theo nháp", () => {
  // Thi thật: máy chủ không đặt deadline nhưng giới hạn cố định 15 phút.
  const real = serverAttemptRules("real", null);
  assert.deepEqual(real, { mode: "real", limitSeconds: REAL_LIMIT_SECONDS });
  // Nháp bị sửa từ Thi thật sang Practice không giới hạn: máy chủ ghi đè.
  const tampered = { mode: "practice", parts: [0], limitMinutes: 0 };
  assert.deepEqual(applyServerRules(tampered, real), {
    mode: "real",
    parts: [0],
    limitMinutes: 15,
  });
  // Practice: giới hạn theo deadline máy chủ; không deadline là không giới hạn.
  assert.equal(serverAttemptRules("practice", 1200).limitSeconds, 1200);
  assert.equal(serverAttemptRules("practice", null).limitSeconds, 0);
  assert.equal(applyServerRules({ mode: "real" }, serverAttemptRules("practice", 1200)).limitMinutes, 20);
});

test("resolveClock mang theo mode của máy chủ", () => {
  const started = Date.parse("2026-11-25T09:50:00Z");
  const server = (mode) => ({
    ok: true,
    status: "IN_PROGRESS",
    startedAt: new Date(started).toISOString(),
    deadlineAt: null,
    ...(mode ? { mode } : {}),
  });
  const now = started + 60_000;
  const run = (s) => resolveClock({ server: s, draftEpoch: now, now, offsetMs: 0 });
  assert.equal(run(server("REAL")).mode, "real");
  assert.equal(run(server("PRACTICE")).mode, "practice");
  assert.equal(run(server()).mode, undefined);
});
