import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSpeakingSteps,
  canNext,
  expireFlow,
  initFlow,
  keepOld,
  micLostFlow,
  nextStep,
  parseCueCard,
  partProgress,
  rerecord,
  resumeFlow,
  skipPrep,
  startRecording,
  stopRecording,
  tickFlow,
  VIEW_SECONDS,
} from "../src/lib/attempts/speaking-flow.ts";
import { createMemoryRecordingStore } from "../src/lib/attempts/recordings.ts";
import { micErrorMessage, pickMimeType } from "../src/lib/attempts/mic.ts";

const exam = {
  title: "T",
  tot: "15",
  items: [
    { kind: "qs", instr: "i", topic: "Home", qs: ["Q1", " ", "Q2"] },
    {
      kind: "cue",
      prep: "1",
      speak: "2",
      text: "Describe a skill.\nYou should say:\n- what it is\nand why.",
    },
    { kind: "qs", instr: "i", qs: ["Q3"] },
  ],
};

const T0 = 1_000_000;

/** Cho `n` giây trôi qua (theo giờ thật) rồi tick một lần; mốc mới bám theo phase hiện tại. */
function ticks(flow, steps, mode, n) {
  return tickFlow(flow, steps, mode, flow.startedAt + n * 1000);
}

test("builds steps in exam order, skipping blank questions", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  assert.deepEqual(
    steps.map((s) => s.id),
    ["p1q0", "p1q1", "p2q0", "p3q0"],
  );
  assert.equal(steps[2].prepSeconds, 60);
  assert.equal(steps[2].maxSeconds, 120);
  assert.equal(steps[0].count, 2);
});

test("only selected parts are used and bad prep/speak fall back to defaults", () => {
  const bad = structuredClone(exam);
  bad.items[1].prep = "";
  bad.items[1].speak = "x";
  const steps = buildSpeakingSteps(bad, [1]);
  assert.equal(steps.length, 1);
  assert.equal(steps[0].prepSeconds, 60);
  assert.equal(steps[0].maxSeconds, 120);
});

test("real mode: view 5s, auto record, no re-record, next while recording", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  let flow = initFlow(steps, T0);
  assert.deepEqual(flow, { index: 0, phase: "viewing", seconds: VIEW_SECONDS, startedAt: T0 });
  flow = ticks(flow, steps, "real", VIEW_SECONDS);
  assert.equal(flow.phase, "recording");
  assert.equal(startRecording(flow, "real"), flow);
  flow = ticks(flow, steps, "real", 3);
  assert.equal(flow.seconds, 3);
  assert.equal(canNext(flow, "real"), true);
  const stopped = stopRecording(flow);
  assert.equal(stopped.phase, "answered");
  assert.equal(rerecord(stopped, "real"), stopped);
  const next = nextStep(flow, steps, "real", T0 + 50_000);
  assert.deepEqual(next, {
    index: 1,
    phase: "viewing",
    seconds: VIEW_SECONDS,
    startedAt: T0 + 50_000,
  });
});

test("practice: waits for tap, can stop, re-record, then next", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  let flow = ticks(initFlow(steps, T0), steps, "practice", VIEW_SECONDS);
  assert.equal(flow.phase, "ready");
  assert.equal(canNext(flow, "practice"), false);
  assert.equal(ticks(flow, steps, "practice", 30).phase, "ready");
  flow = startRecording(flow, "practice");
  assert.equal(flow.phase, "recording");
  assert.equal(canNext(flow, "practice"), false);
  flow = stopRecording(flow);
  assert.equal(canNext(flow, "practice"), true);
  flow = rerecord(flow, "practice");
  assert.equal(flow.phase, "ready");
  flow = stopRecording(startRecording(flow, "practice"));
  assert.equal(nextStep(flow, steps, "practice").index, 1);
});

test("part 2 prepares for a minute first; practice can skip; max speak time stops recording", () => {
  const steps = buildSpeakingSteps(exam, [1]);
  let flow = initFlow(steps, T0);
  assert.deepEqual(flow, { index: 0, phase: "preparing", seconds: 60, startedAt: T0 });
  const skipped = skipPrep(flow, "practice");
  assert.equal(skipped.phase, "ready");
  assert.equal(skipPrep(flow, "real"), flow);
  flow = ticks(flow, steps, "real", 60);
  assert.equal(flow.phase, "recording");
  flow = ticks(flow, steps, "real", 119);
  assert.equal(flow.phase, "recording");
  flow = ticks(flow, steps, "real", 120);
  assert.equal(flow.phase, "answered");
  assert.equal(flow.seconds, 120);
});

test("finishing the last question reaches done; empty steps are done", () => {
  const steps = buildSpeakingSteps(exam, [2]);
  let flow = ticks(initFlow(steps, T0), steps, "real", VIEW_SECONDS);
  flow = nextStep(flow, steps, "real");
  assert.equal(flow.phase, "done");
  assert.equal(initFlow([]).phase, "done");
  assert.equal(tickFlow(flow, steps, "real"), flow);
});

test("expire keeps a partial recording as answered and leaves other phases", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  let flow = ticks(initFlow(steps, T0), steps, "real", VIEW_SECONDS);
  flow = ticks(flow, steps, "real", 2);
  assert.equal(expireFlow(flow).phase, "answered");
  assert.equal(expireFlow(flow).seconds, 2);
  const viewing = initFlow(steps, T0);
  assert.equal(expireFlow(viewing), viewing);
});

test("part progress follows the real position", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  let flow = initFlow(steps);
  assert.deepEqual(
    partProgress(steps, flow).map((p) => [p.part, p.status, p.position]),
    [[0, "current", 1], [1, "todo", 0], [2, "todo", 0]],
  );
  flow = { index: 2, phase: "preparing", seconds: 30 };
  assert.deepEqual(
    partProgress(steps, flow).map((p) => p.status),
    ["done", "current", "todo"],
  );
  flow = { index: 4, phase: "done", seconds: 0 };
  assert.deepEqual(
    partProgress(steps, flow).map((p) => p.status),
    ["done", "done", "done"],
  );
});

test("parses the cue card into title, bullets and trailing lines", () => {
  const card = parseCueCard(exam.items[1].text);
  assert.equal(card.title, "Describe a skill.");
  assert.deepEqual(card.lines, [
    { bullet: false, text: "You should say:" },
    { bullet: true, text: "what it is" },
    { bullet: false, text: "and why." },
  ]);
});

test("memory recording store keeps, overwrites and clears answers", async () => {
  const store = createMemoryRecordingStore();
  const a = { blob: new Blob(["a"]), mimeType: "audio/webm", durationMs: 1, recordedAt: 1 };
  const b = { ...a, durationMs: 2 };
  await store.put("p1q0", a);
  await store.put("p1q0", b);
  assert.equal((await store.get("p1q0")).durationMs, 2);
  assert.deepEqual(await store.ids(), ["p1q0"]);
  await store.remove("p1q0");
  assert.equal(await store.get("p1q0"), undefined);
  await store.put("p2q0", a);
  await store.clear();
  assert.deepEqual(await store.ids(), []);
});

test("mic helpers map errors to Vietnamese and pick a supported mime type", () => {
  assert.match(micErrorMessage({ name: "NotAllowedError" }), /cho phép/);
  assert.match(micErrorMessage({ name: "NotFoundError" }), /Không tìm thấy micro/);
  assert.match(micErrorMessage(new Error("x")), /Không bật được micro/);
  assert.equal(pickMimeType((t) => t === "audio/mp4"), "audio/mp4");
  assert.equal(pickMimeType(() => false), "");
});

test("seconds follow the wall clock, not the number of ticks", () => {
  const steps = buildSpeakingSteps(exam, [1]);
  let flow = initFlow(steps, T0);
  // Không tick cũng không đổi; tick dày trong cùng một giây trả cùng object.
  assert.equal(tickFlow(flow, steps, "real", T0 + 400), flow);
  // Tab nền bị làm chậm: một tick duy nhất sau 25 giây vẫn ra đúng 35 giây còn lại.
  flow = tickFlow(flow, steps, "real", T0 + 25_000);
  assert.equal(flow.seconds, 35);
  // Trễ quá cả phần chuẩn bị: sang ghi âm, mốc mới là lúc tick.
  const late = tickFlow(flow, steps, "real", T0 + 70_000);
  assert.deepEqual(late, { index: 0, phase: "recording", seconds: 0, startedAt: T0 + 70_000 });
  // Đang ghi: giây đã nói tính theo giờ thật, chạm tối đa thì tự dừng dù tick thưa.
  assert.equal(tickFlow(late, steps, "real", T0 + 70_000 + 90_500).seconds, 90);
  const done = tickFlow(late, steps, "real", T0 + 70_000 + 500_000);
  assert.equal(done.phase, "answered");
  assert.equal(done.seconds, 120);
});

test("practice goes through part 2 end to end", () => {
  const steps = buildSpeakingSteps(exam, [1]);
  let flow = initFlow(steps, T0);
  assert.equal(flow.phase, "preparing");
  flow = ticks(flow, steps, "practice", 60);
  assert.equal(flow.phase, "ready");
  flow = startRecording(flow, "practice", T0 + 100_000);
  assert.deepEqual(flow, { index: 0, phase: "recording", seconds: 0, startedAt: T0 + 100_000 });
  flow = ticks(flow, steps, "practice", 45);
  assert.equal(flow.seconds, 45);
  flow = stopRecording(flow);
  assert.equal(canNext(flow, "practice"), true);
  assert.equal(nextStep(flow, steps, "practice", T0 + 200_000).phase, "done");
});

test("nextStep is blocked while viewing, ready or preparing", () => {
  const cue = buildSpeakingSteps(exam, [1]);
  const prep = initFlow(cue, T0);
  assert.equal(nextStep(prep, cue, "practice"), prep);
  assert.equal(nextStep(prep, cue, "real"), prep);
  const qs = buildSpeakingSteps(exam, [0]);
  const viewing = initFlow(qs, T0);
  assert.equal(nextStep(viewing, qs, "practice"), viewing);
  assert.equal(nextStep(viewing, qs, "real"), viewing);
  const ready = ticks(viewing, qs, "practice", VIEW_SECONDS);
  assert.equal(ready.phase, "ready");
  assert.equal(nextStep(ready, qs, "practice"), ready);
});

test("part 2 with prep 0 skips preparing", () => {
  const zero = structuredClone(exam);
  zero.items[1].prep = "0";
  const steps = buildSpeakingSteps(zero, [1]);
  assert.equal(steps[0].prepSeconds, 0);
  assert.equal(initFlow(steps, T0).phase, "viewing");
});

test("practice: expire during recording lets the learner move on", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  let flow = ticks(initFlow(steps, T0), steps, "practice", VIEW_SECONDS);
  flow = startRecording(flow, "practice", T0 + 10_000);
  assert.equal(canNext(flow, "practice"), false);
  flow = expireFlow(flow);
  assert.equal(flow.phase, "answered");
  assert.equal(canNext(flow, "practice"), true);
});

test("keepOld goes back to answered, only in practice ready", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  let flow = ticks(initFlow(steps, T0), steps, "practice", VIEW_SECONDS);
  flow = rerecord(stopRecording(startRecording(flow, "practice")), "practice");
  assert.equal(flow.phase, "ready");
  assert.equal(keepOld(flow, "real"), flow);
  assert.equal(keepOld(flow, "practice").phase, "answered");
  const answered = keepOld(flow, "practice");
  assert.equal(keepOld(answered, "practice"), answered);
});

test("mic lost: recording pauses; real keeps a partial answer, else re-records; practice goes ready", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  let flow = ticks(initFlow(steps, T0), steps, "real", VIEW_SECONDS);
  assert.equal(micLostFlow(initFlow(steps, T0)).phase, "viewing");
  flow = micLostFlow(ticks(flow, steps, "real", 3));
  assert.equal(flow.phase, "micLost");
  assert.equal(canNext(flow, "real"), false);
  assert.equal(ticks(flow, steps, "real", 30), flow);
  assert.equal(resumeFlow(flow, "real", true, T0 + 99).phase, "answered");
  assert.deepEqual(resumeFlow(flow, "real", false, T0 + 99), {
    index: 0,
    phase: "recording",
    seconds: 0,
    startedAt: T0 + 99,
  });
  assert.equal(resumeFlow(flow, "practice", false, T0 + 99).phase, "ready");
  const other = initFlow(steps, T0);
  assert.equal(resumeFlow(other, "real", false), other);
  assert.equal(expireFlow(flow).phase, "answered");
});

import {
  createDurableRecordingStore,
  purgeExpiredRecordings,
  recordingPrefix,
  recordingScope,
  recordingUserPrefix,
} from "../src/lib/attempts/recordings.ts";
import { rearmFlow, restoreFlow } from "../src/lib/attempts/speaking-flow.ts";

const answer = (n = 1) => ({
  blob: { size: n },
  mimeType: "audio/webm",
  durationMs: 1000,
  recordedAt: 1,
});

test("restore: unanswered Part 1/3 question goes back to its start", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const flow = restoreFlow(steps, { stepId: "p1q1", index: 1, phase: "recording" }, ["p1q0"], T0);
  assert.deepEqual(flow, { index: 1, phase: "viewing", seconds: VIEW_SECONDS, startedAt: T0 });
});

test("restore (practice): Part 2 goes back to preparing even if it was recording", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const flow = restoreFlow(steps, { stepId: "p2q0", index: 2, phase: "recording" }, ["p1q0", "p1q1"], T0);
  assert.equal(flow.index, 2);
  assert.equal(flow.phase, "preparing");
  assert.equal(flow.seconds, 60);
});

test("restore: answered question stays answered, real mode cannot re-record it", () => {
  const steps = buildSpeakingSteps(exam, [0]);
  const flow = restoreFlow(steps, { stepId: "p1q0", index: 0, phase: "answered" }, ["p1q0"], T0);
  assert.equal(flow.phase, "answered");
  assert.equal(rerecord(flow, "real"), flow);
  assert.equal(startRecording(flow, "real"), flow);
  assert.equal(canNext(flow, "real"), true);
});

test("restore: missing recording is re-asked, unknown step falls back, finished stays done", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  assert.equal(restoreFlow(steps, { stepId: "p1q0", index: 0, phase: "answered" }, [], T0).phase, "viewing");
  const lost = restoreFlow(steps, { stepId: "gone", index: 99, phase: "viewing" }, ["p1q0"], T0);
  assert.equal(lost.index, 1);
  const all = restoreFlow(steps, { stepId: "gone", index: 99, phase: "viewing" }, steps.map((s) => s.id), T0);
  assert.equal(all.phase, "done");
  assert.equal(restoreFlow(steps, { stepId: "", index: steps.length, phase: "done" }, steps.map((s) => s.id), T0).phase, "done");
  assert.equal(restoreFlow([], { stepId: "x", index: 0, phase: "viewing" }, [], T0).phase, "done");
});

test("rearmFlow restarts countdown phases only", () => {
  const steps = buildSpeakingSteps(exam, [0, 1]);
  const old = { index: 2, phase: "preparing", seconds: 0, startedAt: T0 };
  assert.deepEqual(rearmFlow(old, steps, T0 + 9000), { index: 2, phase: "preparing", seconds: 60, startedAt: T0 + 9000 });
  const answered = { index: 0, phase: "answered", seconds: 0, startedAt: T0 };
  assert.equal(rearmFlow(answered, steps, T0 + 9000), answered);
});

test("recording scope and prefix are keyed by user, exam and attempt", () => {
  assert.equal(recordingScope("u", "e", "a"), "u|e|a");
  assert.ok(recordingScope("u", "e", "a").startsWith(recordingPrefix("u", "e")));
  assert.equal(recordingScope(null, undefined, "a"), "||a");
});

test("durable store falls back to memory when IndexedDB is unavailable", async () => {
  const store = createDurableRecordingStore("u|e|a", () => Promise.reject(new Error("blocked")));
  await store.put("p1q0", answer());
  await store.put("p1q1", answer(2));
  assert.equal(store.persistent(), false);
  assert.deepEqual((await store.ids()).sort(), ["p1q0", "p1q1"]);
  assert.equal((await store.get("p1q1")).blob.size, 2);
  await store.remove("p1q0");
  assert.equal(await store.get("p1q0"), undefined);
  await store.clear();
  assert.deepEqual(await store.ids(), []);
});

test("restore: goes back to the first earlier question whose recording is missing", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  // Đang ở p2q0 (index 2) nhưng p1q1 mất bản ghi: về p1q1, không nhảy cóc.
  const flow = restoreFlow(steps, { stepId: "p2q0", index: 2, phase: "recording" }, ["p1q0"], T0);
  assert.deepEqual(flow, { index: 1, phase: "viewing", seconds: VIEW_SECONDS, startedAt: T0 });
  // Đã trả lời p2q0 nhưng thiếu p1q0: vẫn về p1q0.
  const early = restoreFlow(steps, { stepId: "p2q0", index: 2, phase: "answered" }, ["p1q1", "p2q0"], T0);
  assert.equal(early.index, 0);
  // Câu sau vị trí đã lưu thiếu bản ghi không kéo lùi.
  const later = restoreFlow(steps, { stepId: "p1q1", index: 1, phase: "answered" }, ["p1q0", "p1q1"], T0);
  assert.equal(later.phase, "answered");
  assert.equal(later.index, 1);
  // Đã làm hết nhưng mất một bản ghi: quay về câu thiếu, không báo xong.
  const lost = restoreFlow(steps, { stepId: "", index: steps.length, phase: "done" }, ["p1q0", "p2q0", "p3q0"], T0);
  assert.equal(lost.index, 1);
  assert.equal(lost.phase, "viewing");
  // Thiếu bản ghi Part 2 thì về preparing.
  const cue = restoreFlow(steps, { stepId: "p3q0", index: 3, phase: "viewing" }, ["p1q0", "p1q1"], T0);
  assert.equal(cue.index, 2);
  assert.equal(cue.phase, "preparing");
});

test("recording keys encode separators so an exam id containing | cannot collide", () => {
  const scope = recordingScope("u", "a|b", "x");
  assert.equal(scope, "u|a%7Cb|x");
  assert.equal(scope.startsWith(recordingPrefix("u", "a")), false);
  assert.equal(scope.startsWith(recordingPrefix("u", "a|b")), true);
  assert.equal(recordingScope("u|v", "e", "a").startsWith(recordingPrefix("u", "v|e")), false);
  assert.equal(recordingScope("u", "e", "a").startsWith(recordingUserPrefix("u")), true);
  assert.equal(recordingScope("uu", "e", "a").startsWith(recordingUserPrefix("u")), false);
});

test("purgeExpiredRecordings deletes only rows older than the limit and closes the connection", async () => {
  const rows = [
    { key: "old", recordedAt: 1000 },
    { key: "new", recordedAt: 90_000 },
    { key: "broken" },
  ];
  let closed = false;
  const db = {
    close() {
      closed = true;
    },
    transaction() {
      const tx = {};
      tx.objectStore = () => ({
        openCursor() {
          const request = {};
          let i = 0;
          const step = () => {
            if (i >= rows.length) {
              request.result = null;
              request.onsuccess();
              setTimeout(() => tx.oncomplete(), 0);
              return;
            }
            const row = rows[i];
            request.result = {
              value: row,
              delete() {
                row.deleted = true;
              },
              continue() {
                i++;
                setTimeout(step, 0);
              },
            };
            request.onsuccess();
          };
          setTimeout(step, 0);
          return request;
        },
      });
      return tx;
    },
  };
  const removed = await purgeExpiredRecordings(50_000, () => Promise.resolve(db), 100_000);
  assert.equal(removed, 2);
  assert.deepEqual(rows.map((r) => !!r.deleted), [true, false, true]);
  assert.equal(closed, true);
  assert.equal(await purgeExpiredRecordings(1, () => Promise.reject(new Error("x"))), 0);
});

import { restoreFlowDetailed } from "../src/lib/attempts/speaking-flow.ts";

test("real restore: a half-spoken Part 1/3 question is closed with its partial recording and moves on", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const { flow, closedId } = restoreFlowDetailed(
    steps,
    { stepId: "p1q0", index: 0, phase: "recording" },
    ["p1q0"],
    T0,
    "real",
  );
  assert.equal(closedId, null);
  assert.deepEqual(flow, { index: 1, phase: "viewing", seconds: VIEW_SECONDS, startedAt: T0 });
  assert.equal(startRecording(flow, "real"), flow);
});

test("real restore: no recording yet counts the question as seen and blank, then moves on", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  for (const phase of ["viewing", "recording", "micLost", "answered"]) {
    const { flow, closedId } = restoreFlowDetailed(
      steps,
      { stepId: "p1q1", index: 1, phase },
      ["p1q0"],
      T0,
      "real",
    );
    assert.equal(closedId, "p1q1");
    assert.equal(flow.index, 2);
    assert.equal(flow.phase, "preparing");
  }
  const last = restoreFlowDetailed(
    steps,
    { stepId: "p3q0", index: 3, phase: "viewing" },
    ["p1q0", "p1q1", "p2q0"],
    T0,
    "real",
  );
  assert.equal(last.flow.phase, "done");
  assert.equal(last.closedId, "p3q0");
});

test("real restore: Part 2 mid-recording is closed like Part 1/3, only Part 2 still preparing goes back to preparing", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  // Đang ghi, chưa có bản ghi: để trống, sang câu kế.
  const a = restoreFlowDetailed(steps, { stepId: "p2q0", index: 2, phase: "recording" }, ["p1q0", "p1q1"], T0, "real");
  assert.equal(a.flow.index, 3);
  assert.equal(a.flow.phase, "viewing");
  assert.equal(a.closedId, "p2q0");
  // Có bản ghi dở: giữ làm đáp án, sang câu kế (closedId null vì đã có đáp án).
  const a2 = restoreFlowDetailed(steps, { stepId: "p2q0", index: 2, phase: "recording" }, ["p1q0", "p2q0"], T0, "real");
  assert.equal(a2.flow.index, 3);
  assert.equal(a2.closedId, null);
  // Micro ngắt giữa lúc ghi cũng tính là đang ghi.
  const a3 = restoreFlowDetailed(steps, { stepId: "p2q0", index: 2, phase: "micLost" }, ["p1q0", "p1q1"], T0, "real");
  assert.equal(a3.flow.index, 3);
  assert.equal(a3.closedId, "p2q0");
  // Còn ở bước chuẩn bị: về preparing, không đóng câu.
  const a4 = restoreFlowDetailed(steps, { stepId: "p2q0", index: 2, phase: "preparing" }, ["p1q0", "p1q1"], T0, "real");
  assert.equal(a4.flow.index, 2);
  assert.equal(a4.flow.phase, "preparing");
  assert.equal(a4.closedId, null);
  // Practice giữ nguyên: về preparing.
  assert.equal(restoreFlow(steps, { stepId: "p2q0", index: 2, phase: "recording" }, ["p1q0", "p1q1"], T0, "practice").phase, "preparing");
  const b = restoreFlowDetailed(steps, { stepId: "p3q0", index: 3, phase: "viewing" }, ["p1q0"], T0, "real");
  assert.equal(b.flow.index, 2);
  assert.equal(b.flow.phase, "preparing");
  const c = restoreFlowDetailed(steps, { stepId: "p2q0", index: 2, phase: "answered" }, ["p2q0"], T0, "real");
  assert.equal(c.flow.phase, "answered");
});

test("practice restore keeps the old rule: back to the question start, can record again", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const saved = { stepId: "p1q1", index: 1, phase: "recording" };
  const flow = restoreFlow(steps, saved, ["p1q0"], T0, "practice");
  assert.deepEqual(flow, { index: 1, phase: "viewing", seconds: VIEW_SECONDS, startedAt: T0 });
  assert.equal(restoreFlowDetailed(steps, saved, ["p1q0"], T0, "practice").closedId, null);
});

test("real restore with an unknown saved position does not close any question", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const { flow, closedId } = restoreFlowDetailed(
    steps,
    { stepId: "gone", index: 99, phase: "viewing" },
    ["p1q0"],
    T0,
    "real",
  );
  assert.equal(closedId, null);
  assert.equal(flow.index, 1);
  assert.equal(flow.phase, "viewing");
});

test("real nextStep skips questions that already have a recording", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const answeredFlow = { index: 2, phase: "answered", seconds: 0, startedAt: T0 };
  // Part 2 vừa ghi lại (do mất bản ghi) mà Part 3 đã có bản ghi: không mở lại Part 3 để ghi đè.
  const done = nextStep(answeredFlow, steps, "real", T0, new Set(["p3q0"]));
  assert.equal(done.phase, "done");
  assert.equal(done.index, steps.length);
  // Practice vẫn đi qua mọi câu.
  assert.equal(nextStep(answeredFlow, steps, "practice", T0, new Set(["p3q0"])).index, 3);
  // Không truyền answered: như cũ.
  assert.equal(nextStep(answeredFlow, steps, "real", T0).index, 3);
  const first = { index: 0, phase: "answered", seconds: 0, startedAt: T0 };
  assert.equal(nextStep(first, steps, "real", T0, new Set(["p1q1"])).index, 2);
});

test("real restore: closing a question skips the following answered ones", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const { flow, closedId } = restoreFlowDetailed(
    steps,
    { stepId: "p1q0", index: 0, phase: "viewing" },
    ["p1q1", "p2q0"],
    T0,
    "real",
  );
  assert.equal(closedId, "p1q0");
  assert.equal(flow.index, 3);
  assert.equal(flow.phase, "viewing");
});

test("real restore: index fallback never closes or reopens an answered question", () => {
  const steps = buildSpeakingSteps(exam, [0, 1, 2]);
  const a = restoreFlowDetailed(steps, { stepId: "gone", index: 1, phase: "viewing" }, ["p1q0"], T0, "real");
  assert.equal(a.closedId, null);
  assert.equal(a.flow.index, 1);
  assert.equal(a.flow.phase, "viewing");
  const b = restoreFlowDetailed(steps, { stepId: "gone", index: 1, phase: "viewing" }, ["p1q1", "p2q0"], T0, "real");
  assert.equal(b.closedId, null);
  assert.equal(b.flow.index, 3);
});
