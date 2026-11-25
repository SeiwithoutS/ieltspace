import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_MAX_AGE_MS,
  clearAttemptLocalData,
  draftKey,
  findInProgressDraft,
  inProgressId,
  listInProgress,
  loadDraft,
  sweepAttemptStorage,
} from "../src/lib/attempts/attempt-storage.ts";

function fakeStorage() {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    map,
  };
}
const NOW = 1_800_000_000_000;
const draft = (savedAt) =>
  JSON.stringify({
    options: { mode: "real", parts: [0] },
    seconds: 5,
    ...(savedAt === undefined ? {} : { savedAt }),
  });
const setup = () => ({ local: fakeStorage(), session: fakeStorage() });
const PAGES = ["ReadingTest", "ListeningTest", "WritingTest", "SpeakingTest"];

test("findInProgressDraft reads the exact key, any skill, within 24 hours", () => {
  const stores = setup();
  for (const page of PAGES)
    stores.local.setItem(draftKey("u1", page, "e1"), draft(NOW - 1000));
  for (const page of PAGES)
    assert.equal(findInProgressDraft("u1", page, "e1", NOW, stores)?.seconds, 5);
  assert.equal(findInProgressDraft("u2", "ReadingTest", "e1", NOW, stores), null);
  assert.equal(findInProgressDraft("u1", "ReadingTest", "e2", NOW, stores), null);
  assert.equal(findInProgressDraft(undefined, "ReadingTest", "e1", NOW, stores), null);
  assert.equal(findInProgressDraft("u1", "ReadingTest", null, NOW, stores), null);
  assert.equal(findInProgressDraft("u1", "Other", "e1", NOW, stores), null);
});

test("expired, malformed and savedAt-less drafts are not in progress and get removed on load", () => {
  const stores = setup();
  const key = draftKey("u1", "ReadingTest", "e1");
  stores.local.setItem(key, draft(NOW - DRAFT_MAX_AGE_MS - 1));
  assert.deepEqual(loadDraft(key, NOW, stores), { draft: null, expired: true });
  assert.equal(stores.local.getItem(key), null);
  stores.local.setItem(key, "{");
  assert.equal(findInProgressDraft("u1", "ReadingTest", "e1", NOW, stores), null);
  stores.local.setItem(key, draft(undefined));
  assert.equal(findInProgressDraft("u1", "ReadingTest", "e1", NOW, stores), null);
  stores.local.setItem(key, draft(NOW - DRAFT_MAX_AGE_MS));
  assert.ok(findInProgressDraft("u1", "ReadingTest", "e1", NOW, stores));
});

test("a future savedAt is clamped to now", () => {
  const stores = setup();
  const key = draftKey("u1", "ReadingTest", "e1");
  stores.local.setItem(key, draft(NOW + 99_999));
  assert.equal(loadDraft(key, NOW, stores).draft.savedAt, NOW);
});

test("old sessionStorage drafts are moved to localStorage once, with a savedAt", () => {
  const stores = setup();
  const key = draftKey("u1", "WritingTest", "e1");
  stores.session.setItem(key, draft(undefined));
  const found = findInProgressDraft("u1", "WritingTest", "e1", NOW, stores);
  assert.equal(found.savedAt, NOW);
  assert.equal(stores.session.getItem(key), null);
  assert.ok(stores.local.getItem(key));
  // Đã có bản ở localStorage thì giữ bản đó và bỏ bản session.
  stores.session.setItem(key, draft(NOW - 5));
  stores.local.setItem(key, draft(NOW - 10));
  assert.equal(loadDraft(key, NOW, stores).draft.savedAt, NOW - 10);
  assert.equal(stores.session.getItem(key), null);
  // Draft session hỏng: bỏ qua an toàn.
  const bad = draftKey("u1", "ReadingTest", "e9");
  stores.session.setItem(bad, "{");
  assert.equal(findInProgressDraft("u1", "ReadingTest", "e9", NOW, stores), null);
  assert.equal(stores.session.getItem(bad), null);
});

test("listInProgress scans once and only returns this user's fresh drafts", () => {
  const stores = setup();
  stores.local.setItem(draftKey("u1", "ReadingTest", "e1"), draft(NOW));
  stores.local.setItem(draftKey("u1", "SpeakingTest", "e1"), draft(NOW));
  stores.local.setItem(
    draftKey("u1", "ListeningTest", "old"),
    draft(NOW - DRAFT_MAX_AGE_MS - 1),
  );
  stores.local.setItem(draftKey("u2", "WritingTest", "e1"), draft(NOW));
  stores.local.setItem("unrelated", "x");
  stores.session.setItem(draftKey("u1", "WritingTest", "e2"), draft(NOW));
  const ids = listInProgress("u1", NOW, stores);
  assert.deepEqual(
    [...ids].sort(),
    [
      inProgressId("ReadingTest", "e1"),
      inProgressId("SpeakingTest", "e1"),
      inProgressId("WritingTest", "e2"),
    ].sort(),
  );
  assert.equal(listInProgress(undefined, NOW, stores).size, 0);
});

test("logout clears every skill's drafts for that user only; sweep drops expired ones", async () => {
  const stores = setup();
  for (const page of PAGES)
    stores.local.setItem(draftKey("u1", page, "e1"), draft(NOW));
  stores.local.setItem(draftKey("u2", "ReadingTest", "e1"), draft(NOW));
  stores.session.setItem(draftKey("u1", "ReadingTest", "e3"), draft(NOW));
  await clearAttemptLocalData("u1", stores);
  assert.equal(stores.local.length, 1);
  assert.equal(stores.session.length, 0);
  stores.local.setItem(
    draftKey("u2", "WritingTest", "e5"),
    draft(NOW - DRAFT_MAX_AGE_MS - 5),
  );
  await sweepAttemptStorage(NOW, stores);
  assert.deepEqual([...stores.local.map.keys()], [draftKey("u2", "ReadingTest", "e1")]);
});

// Cơ sở IndexedDB giả: chỉ đủ con trỏ để quét/xóa hàng (tôn trọng khoảng khóa nếu có).
function fakeRecordingDb(rows) {
  return () =>
    Promise.resolve({
      close() {},
      transaction() {
        const tx = {};
        tx.objectStore = () => ({
          openCursor(range) {
            const list = rows.filter((r) => !range || r.key.startsWith(range.a));
            const request = {};
            let i = 0;
            const step = () => {
              if (i >= list.length) {
                request.result = null;
                request.onsuccess();
                setTimeout(() => tx.oncomplete(), 0);
                return;
              }
              const row = list[i];
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
    });
}

test("sweep keeps old recordings that a fresh Speaking draft still points to", async () => {
  const stores = setup();
  const speaking = (attemptId) => ({
    attemptId,
    stepId: "p1q0",
    index: 0,
    phase: "answered",
    answered: ["p1q0"],
  });
  const withSpeaking = (attemptId, savedAt) =>
    JSON.stringify({
      options: { mode: "real", parts: [0] },
      seconds: 5,
      state: attemptId ? { speaking: speaking(attemptId) } : {},
      savedAt,
    });
  stores.local.setItem(draftKey("u1", "SpeakingTest", "e1"), withSpeaking("a1", NOW - 1000));
  stores.local.setItem(draftKey("u1", "SpeakingTest", "e2"), withSpeaking(undefined, NOW - 1000));
  const old = NOW - DRAFT_MAX_AGE_MS - 1000;
  const rows = [
    { key: "kept-by-attempt", scope: "u1|e1|a1", recordedAt: old },
    { key: "other-attempt", scope: "u1|e1|a2", recordedAt: old },
    { key: "kept-by-exam", scope: "u1|e2|zzz", recordedAt: old },
    { key: "no-draft", scope: "u1|e3|a1", recordedAt: old },
    { key: "fresh", scope: "u1|e3|a2", recordedAt: NOW - 10 },
  ];
  await sweepAttemptStorage(NOW, stores, fakeRecordingDb(rows));
  assert.deepEqual(
    rows.map((r) => !!r.deleted),
    [false, true, false, true, false],
  );
});

test("purgeRecordingsExcept removes other attempts of the exam but keeps the listed scopes", async () => {
  globalThis.IDBKeyRange = { bound: (a, b) => ({ a, b }) };
  const { purgeRecordingsExcept, recordingPrefix, recordingScope } = await import(
    "../src/lib/attempts/recordings.ts"
  );
  const rows = [
    { key: "u|e|a\u0001p1q0", scope: recordingScope("u", "e", "a") },
    { key: "u|e|b\u0001p1q0", scope: recordingScope("u", "e", "b") },
    { key: "u|e|c\u0001p1q0", scope: recordingScope("u", "e", "c") },
    { key: "u|other|c\u0001p1q0", scope: recordingScope("u", "other", "c") },
  ];
  const removed = await purgeRecordingsExcept(
    recordingPrefix("u", "e"),
    (scope) => scope === recordingScope("u", "e", "a") || scope === recordingScope("u", "e", "b"),
    fakeRecordingDb(rows),
  );
  assert.equal(removed, 1);
  assert.deepEqual(rows.map((r) => !!r.deleted), [false, false, true, false]);
});

test("listInProgressInfo flags a Speaking draft whose time ran out while away", async () => {
  const { listInProgressInfo, speakingTimedOut } = await import(
    "../src/lib/attempts/attempt-storage.ts"
  );
  const stores = setup();
  const make = (extra) =>
    JSON.stringify({
      options: { mode: "real", parts: [0], limitMinutes: 15 },
      seconds: 60,
      savedAt: NOW - 1000,
      ...extra,
    });
  stores.local.setItem(draftKey("u1", "SpeakingTest", "late"), make({ startedAtEpoch: NOW - 16 * 60_000 }));
  stores.local.setItem(draftKey("u1", "SpeakingTest", "ok"), make({ startedAtEpoch: NOW - 5 * 60_000 }));
  // Chưa bắt đầu tính giờ (không mốc, không tiến độ): không coi là hết giờ.
  stores.local.setItem(draftKey("u1", "SpeakingTest", "idle"), make({}));
  stores.local.setItem(draftKey("u1", "WritingTest", "late"), make({ startedAtEpoch: NOW - 16 * 60_000 }));
  stores.local.setItem(draftKey("u1", "WritingTest", "old"), make({}));
  const info = listInProgressInfo("u1", NOW, stores);
  assert.equal(info.get(inProgressId("SpeakingTest", "late")).timedOut, true);
  assert.equal(info.get(inProgressId("SpeakingTest", "ok")).timedOut, false);
  assert.equal(info.get(inProgressId("SpeakingTest", "idle")).timedOut, false);
  // Writing nay cũng tính giờ theo mốc tuyệt đối như Speaking; draft Writing cũ (không mốc, không tiến độ) thì không.
  assert.equal(info.get(inProgressId("WritingTest", "late")).timedOut, true);
  assert.equal(info.get(inProgressId("WritingTest", "old")).timedOut, false);
  assert.equal(speakingTimedOut({ options: { mode: "real", parts: [0] }, seconds: 0, startedAtEpoch: 1 }, NOW), false);
});

test("clearAttemptDraft removes every draft of the attempt, including finished ones, and is idempotent", async () => {
  const { clearAttemptDraft, listInProgressInfo } = await import(
    "../src/lib/attempts/attempt-storage.ts"
  );
  const stores = setup();
  const key = draftKey("u1", "SpeakingTest", "e1");
  stores.local.setItem(key, draft(NOW - 1000));
  stores.session.setItem(key, draft(NOW - 1000));
  assert.equal(listInProgressInfo("u1", NOW, stores).size, 1);
  clearAttemptDraft("u1", "SpeakingTest", "e1", stores);
  clearAttemptDraft("u1", "SpeakingTest", "e1", stores);
  assert.equal(stores.local.getItem(key), null);
  assert.equal(stores.session.getItem(key), null);
  assert.equal(listInProgressInfo("u1", NOW, stores).size, 0);
});

test("listInProgressInfo skips drafts already finished (waiting for confirmation)", async () => {
  const { listInProgressInfo } = await import("../src/lib/attempts/attempt-storage.ts");
  const stores = setup();
  stores.local.setItem(
    draftKey("u1", "SpeakingTest", "e1"),
    JSON.stringify({
      options: { mode: "real", parts: [0] },
      seconds: 5,
      savedAt: NOW - 1000,
      finished: { elapsedSeconds: 60, reason: "SUBMITTED", answered: 3, finishedAt: NOW - 500 },
    }),
  );
  assert.equal(listInProgressInfo("u1", NOW, stores).size, 0);
});
