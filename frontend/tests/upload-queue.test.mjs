import test from "node:test";
import assert from "node:assert/strict";
import { UploadQueue, isRetryableUploadError } from "../src/lib/attempts/upload-queue.ts";
import { finishAttempt } from "../src/lib/attempts/finish-flow.ts";
import { createMemoryRecordingStore } from "../src/lib/attempts/recordings.ts";
import { parseAttemptDraft } from "../src/lib/attempts/attempt-draft.ts";
import {
  flushDeletes,
  pendingDeletes,
  queueDelete,
} from "../src/lib/attempts/pending-deletes.ts";

const err = (status, code = "X") => Object.assign(new Error(code), { status, code });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Máy chủ giả: đếm số lần gọi, cho phép gài lỗi theo bước. */
function makeEnv({ attemptId = "srv1", failures = {} } = {}) {
  const store = createMemoryRecordingStore();
  const calls = { request: [], put: [], confirm: [] };
  const fail = { ...failures };
  let id = attemptId;
  const transport = {
    async requestUpload(a, input) {
      calls.request.push(input.questionId);
      const f = fail.request?.shift();
      if (f) throw f;
      return { uploadUrl: "https://upload.invalid/" + input.questionId, path: "p" };
    },
    async putBlob(url, blob) {
      calls.put.push(url);
      const f = fail.put?.shift();
      if (f) throw f;
    },
    async confirm(a, q) {
      calls.confirm.push(q);
      const f = fail.confirm?.shift();
      if (f) throw f;
    },
  };
  const queue = new UploadQueue({
    transport,
    readAnswer: (q) => store.get(q),
    getAttemptId: () => id,
    backoffMs: () => 5,
  });
  const record = (q, size = 3) =>
    store.put(q, { blob: new Blob([new Uint8Array(size)]), mimeType: "audio/webm", durationMs: 1000, recordedAt: 1 });
  return { store, calls, queue, record, setId: (v) => (id = v) };
}

test("uploads a recorded answer: request, PUT, confirm", async () => {
  const env = makeEnv();
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  const summary = await env.queue.drain();
  assert.equal(summary.complete, true);
  assert.deepEqual(env.calls.confirm, ["p1q0"]);
  env.queue.dispose();
});

test("retries with backoff after a network error, then succeeds", async () => {
  const env = makeEnv({ failures: { put: [err(0, "NETWORK_ERROR")] } });
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  await sleep(120);
  assert.equal(env.queue.summary().complete, true);
  assert.equal(env.calls.put.length, 2);
  env.queue.dispose();
});

test("drain reports not complete while the network keeps failing", async () => {
  const env = makeEnv({ failures: { request: [err(0), err(0), err(0), err(0)] } });
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  const summary = await env.queue.drain();
  assert.equal(summary.complete, false);
  assert.equal(summary.pending, 1);
  env.queue.dispose();
});

test("is idempotent: the same version is not uploaded twice, a new version is", async () => {
  const env = makeEnv();
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  await env.queue.drain();
  env.queue.enqueue("p1q0", 0, 1);
  await env.queue.drain();
  assert.equal(env.calls.put.length, 1);
  env.queue.enqueue("p1q0", 0, 2);
  await env.queue.drain();
  assert.equal(env.calls.put.length, 2);
  env.queue.dispose();
});

test("409 RECORDING_ALREADY_EXISTS counts as done without uploading the blob", async () => {
  const env = makeEnv({ failures: { request: [err(409, "RECORDING_ALREADY_EXISTS")] } });
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  const summary = await env.queue.drain();
  assert.equal(summary.complete, true);
  assert.equal(env.calls.put.length, 0);
  env.queue.dispose();
});

test("waits without a server attempt, uploads once it exists (offline then online)", async () => {
  const env = makeEnv({ attemptId: null });
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  await sleep(20);
  assert.equal(env.calls.request.length, 0);
  assert.equal(env.queue.summary().complete, false);
  env.setId("srv1");
  env.queue.kick();
  await env.queue.drain();
  assert.equal(env.queue.summary().complete, true);
  env.queue.dispose();
});

test("permanent errors fail the item; drain retries it; missing blob does not block", async () => {
  const env = makeEnv({ failures: { request: [err(403, "FORBIDDEN")] } });
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  env.queue.enqueue("p1q1", 0, 1); // chưa có bản ghi trên máy
  let summary = await env.queue.drain();
  assert.equal(summary.failed, 0); // drain đã thử lại và lần hai thành công
  assert.equal(summary.complete, true);
  assert.equal(isRetryableUploadError(err(403)), false);
  assert.equal(isRetryableUploadError(err(0)), true);
  assert.equal(isRetryableUploadError(err(503)), true);
  env.queue.dispose();
});

test("finish: does not complete or allow purge while uploads are unfinished", async () => {
  const env = makeEnv({ failures: { request: [err(0), err(0), err(0)] } });
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  let completeCalls = 0;
  const outcome = await finishAttempt({
    ensureCreated: async () => "srv1",
    drain: () => env.queue.drain(),
    summary: () => env.queue.summary(),
    complete: async () => {
      completeCalls++;
      return { completedAt: "x", contentExpiresAt: null, durationSeconds: 5 };
    },
    elapsedSeconds: 5,
    reason: "SUBMITTED",
  });
  assert.equal(outcome.status, "incomplete");
  assert.equal(outcome.why, "upload");
  assert.equal(completeCalls, 0);
  assert.notEqual(await env.store.get("p1q0"), undefined);
  env.queue.dispose();
});

test("finish: no server attempt (offline) is incomplete, never completed", async () => {
  const outcome = await finishAttempt({
    ensureCreated: async () => undefined,
    drain: async () => ({ total: 0, done: 0, pending: 0, failed: 0, complete: true }),
    summary: () => ({ total: 0, done: 0, pending: 0, failed: 0, complete: true }),
    complete: async () => {
      throw new Error("không được gọi");
    },
    elapsedSeconds: 1,
    reason: "TIME_UP",
  });
  assert.deepEqual(outcome, { status: "incomplete", why: "no-attempt" });
});

test("finish: completes only after uploads are done, and a failing complete stays incomplete", async () => {
  const env = makeEnv();
  await env.record("p1q0");
  env.queue.enqueue("p1q0", 0, 1);
  const base = {
    ensureCreated: async () => "srv1",
    drain: () => env.queue.drain(),
    summary: () => env.queue.summary(),
    elapsedSeconds: 61,
    reason: "SUBMITTED",
  };
  const bad = await finishAttempt({
    ...base,
    complete: async () => {
      throw err(0, "NETWORK_ERROR");
    },
  });
  assert.equal(bad.status, "incomplete");
  assert.equal(bad.why, "complete");
  const ok = await finishAttempt({
    ...base,
    complete: async (id, input) => {
      assert.deepEqual(input, { elapsedSeconds: 61, reason: "SUBMITTED" });
      return { completedAt: "t", contentExpiresAt: "e", durationSeconds: 61 };
    },
  });
  assert.equal(ok.status, "completed");
  assert.equal(ok.serverId, "srv1");
  env.queue.dispose();
});

test("draft keeps serverAttemptId and finished info, drops malformed ones", () => {
  const base = {
    options: { mode: "real", parts: [0, 1, 2], limitMinutes: 15 },
    seconds: 10,
    savedAt: 1,
    state: {
      speaking: { attemptId: "a", stepId: "p1q0", index: 0, phase: "viewing", answered: [], serverAttemptId: "srv" },
    },
    finished: { elapsedSeconds: 70, reason: "TIME_UP", answered: 3, finishedAt: 5, serverAttemptId: "srv" },
  };
  const parsed = parseAttemptDraft(JSON.stringify(base));
  assert.equal(parsed.state.speaking.serverAttemptId, "srv");
  assert.equal(parsed.finished.reason, "TIME_UP");
  const bad = parseAttemptDraft(JSON.stringify({ ...base, finished: { reason: "NOPE" } }));
  assert.equal(bad.finished, undefined);
  assert.ok(bad);
});

test("pending deletes: kept on network error, removed when done or gone", async () => {
  const mem = new Map();
  const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v) };
  queueDelete(store, { userId: "u", serverId: "a" });
  queueDelete(store, { userId: "u", serverId: "a" });
  queueDelete(store, { userId: "u", serverId: "b" });
  assert.equal(pendingDeletes(store).length, 2);
  const isGone = (e) => e.status === 404;
  const isTemp = (e) => e.status === 0;
  await flushDeletes(store, "u", async () => { throw err(0); }, isGone, isTemp);
  assert.equal(pendingDeletes(store).length, 2);
  const removed = await flushDeletes(store, "u", async (id) => { if (id === "b") throw err(404); }, isGone, isTemp);
  assert.equal(removed, 2);
  assert.equal(pendingDeletes(store).length, 0);
});

test("alreadyUploaded from the server skips PUT and confirms directly", async () => {
  const env = makeEnv();
  const orig = env.queue; // transport is shared through closure; wrap request via a fresh queue
  orig.dispose();
  const calls = { put: 0, confirm: 0 };
  const queue = new UploadQueue({
    transport: {
      async requestUpload() {
        return { uploadUrl: "u", path: "p", alreadyUploaded: true };
      },
      async putBlob() {
        calls.put++;
      },
      async confirm() {
        calls.confirm++;
      },
    },
    readAnswer: (q) => env.store.get(q),
    getAttemptId: () => "srv1",
    backoffMs: () => 5,
  });
  await env.record("p1q0");
  queue.enqueue("p1q0", 0, 1);
  const summary = await queue.drain();
  assert.equal(summary.complete, true);
  assert.deepEqual(calls, { put: 0, confirm: 1 });
  queue.dispose();
});

test("PUT rejected as duplicate (400 / 409 / statusCode 409) still confirms instead of failing", async () => {
  for (const e of [
    err(400, "UPLOAD_FAILED"),
    err(409, "RECORDING_ALREADY_EXISTS"),
    Object.assign(new Error("dup"), { status: 400, statusCode: "409" }),
  ]) {
    const env = makeEnv({ failures: { put: [e] } });
    await env.record("p1q0");
    env.queue.enqueue("p1q0", 0, 1);
    const summary = await env.queue.drain();
    assert.equal(summary.failed, 0);
    assert.equal(summary.complete, true);
    assert.deepEqual(env.calls.confirm, ["p1q0"]);
    env.queue.dispose();
  }
});

test("ATTEMPT_TIME_EXPIRED / ATTEMPT_NOT_ACTIVE mark the item expired, not failed, and finish still completes", async () => {
  for (const [stage, code] of [
    ["request", "ATTEMPT_TIME_EXPIRED"],
    ["confirm", "ATTEMPT_NOT_ACTIVE"],
  ]) {
    const env = makeEnv({ failures: { [stage]: [err(409, code)] } });
    await env.record("p1q0");
    await env.record("p1q1");
    env.queue.enqueue("p1q0", 0, 1);
    env.queue.enqueue("p1q1", 0, 1);
    let completeCalls = 0;
    const outcome = await finishAttempt({
      ensureCreated: async () => "srv1",
      drain: () => env.queue.drain(),
      summary: () => env.queue.summary(),
      complete: async () => {
        completeCalls++;
        return { completedAt: "t", contentExpiresAt: null, durationSeconds: 5 };
      },
      elapsedSeconds: 5,
      reason: "TIME_UP",
    });
    assert.equal(outcome.status, "completed");
    assert.equal(completeCalls, 1);
    assert.deepEqual(outcome.expiredIds, ["p1q0"]);
    assert.equal(env.queue.summary().total, 1);
    env.queue.dispose();
  }
});

test("finishAttempt clamps elapsedSeconds and flags 4xx complete errors as permanent", async () => {
  const sent = [];
  const base = {
    ensureCreated: async () => "srv1",
    drain: async () => ({ total: 0, done: 0, pending: 0, failed: 0, expiredIds: [], complete: true }),
    summary: () => ({ total: 0, done: 0, pending: 0, failed: 0, expiredIds: [], complete: true }),
    reason: "SUBMITTED",
  };
  await finishAttempt({
    ...base,
    elapsedSeconds: 10 ** 9,
    complete: async (id, input) => {
      sent.push(input.elapsedSeconds);
      return { completedAt: "t", contentExpiresAt: null, durationSeconds: 1 };
    },
  });
  assert.equal(sent[0], 86400);
  const bad = await finishAttempt({
    ...base,
    elapsedSeconds: 5,
    complete: async () => {
      throw err(400, "VALIDATION_ERROR");
    },
  });
  assert.equal(bad.permanent, true);
  const temp = await finishAttempt({
    ...base,
    elapsedSeconds: 5,
    complete: async () => {
      throw err(503);
    },
  });
  assert.equal(temp.permanent, undefined);
});

test("DELETE 409 ATTEMPT_ALREADY_COMPLETED is dropped from pending deletes", async () => {
  const mem = new Map();
  const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  queueDelete(store, { userId: "u", serverId: "a" });
  const isGone = (e) => e.status === 404 || (e.status === 409 && e.code === "ATTEMPT_ALREADY_COMPLETED");
  await flushDeletes(store, "u", async () => { throw err(409, "ATTEMPT_ALREADY_COMPLETED"); }, isGone, () => false);
  assert.equal(pendingDeletes(store).length, 0);
});
