import test from "node:test";
import assert from "node:assert/strict";
import {
  READING_PLAYABLE_PASSAGES,
  initialPartsFromSection,
  normalizeParts,
  runnableCount,
} from "../src/lib/attempts/part-choice.ts";
import { getTimeLimitConfig } from "../src/lib/attempts/time-limits.ts";
import { parseAttemptDraft } from "../src/lib/attempts/attempt-draft.ts";
import { buildSpeakingSteps, partProgress, initFlow } from "../src/lib/attempts/speaking-flow.ts";

const exam = {
  items: [
    { kind: "qs", topic: "A", instr: "", qs: ["a1", "a2"] },
    { kind: "cue", topic: "B", text: "Describe\n- x", prep: "1", speak: "2" },
    { kind: "qs", topic: "C", instr: "", qs: ["c1"] },
  ],
};

test("Speaking chỉ dựng các Part đã chọn và thanh Part phản ánh đúng", () => {
  const steps = buildSpeakingSteps(exam, [0, 2]);
  assert.deepEqual(steps.map((s) => s.id), ["p1q0", "p1q1", "p3q0"]);
  assert.deepEqual(partProgress(steps, initFlow(steps, 0)).map((p) => p.part), [0, 2]);
});

test("mức trần Reading tính theo số passage thật được làm", () => {
  assert.equal(READING_PLAYABLE_PASSAGES, 1);
  assert.equal(runnableCount(3, READING_PLAYABLE_PASSAGES), 1);
  assert.equal(runnableCount(3), 3);
  assert.equal(runnableCount(0), 1);
  const cfg = (n) => getTimeLimitConfig({ skill: "reading", mode: "practice", sectionCount: n });
  assert.deepEqual(cfg(1).options, [0, 10, 15, 20]);
  assert.deepEqual(cfg(2).options, [0, 20, 30, 40]);
  assert.deepEqual(cfg(runnableCount(3, 1)).options, [0, 10, 15, 20]);
});

test("section trên URL thành lựa chọn mặc định hợp lệ", () => {
  assert.deepEqual(initialPartsFromSection("2", 3), [1]);
  assert.equal(initialPartsFromSection("4", 3), undefined);
  assert.equal(initialPartsFromSection("0", 3), undefined);
  assert.equal(initialPartsFromSection("x", 3), undefined);
  assert.equal(initialPartsFromSection(null, 3), undefined);
  assert.deepEqual(normalizeParts([2, 0, 2, 9, -1, 1.5], 3), [0, 2]);
});

test("draft chuẩn hóa parts trùng/lộn thứ tự, draft cũ vẫn parse", () => {
  const d = parseAttemptDraft(JSON.stringify({ options: { mode: "practice", parts: [2, 0, 2] }, seconds: 5 }));
  assert.deepEqual(d.options.parts, [0, 2]);
  const old = parseAttemptDraft(JSON.stringify({ options: { mode: "real", parts: [0, 1, 2] }, seconds: 5 }));
  assert.deepEqual(old.options.parts, [0, 1, 2]);
});
