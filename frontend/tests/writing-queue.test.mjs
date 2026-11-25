import test from "node:test";
import assert from "node:assert/strict";
import {
  TextQueue,
  clearPendingTextsOf,
  isRetryableTextError,
  isTextClosedError,
  pendingKey,
  readPendingTexts,
  sweepPendingTexts,
  toUploadSummary,
} from "../src/lib/attempts/writing-queue.ts";
import { finishAttempt } from "../src/lib/attempts/finish-flow.ts";

function memoryStorage() {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
}
const err = (status, code = "") => Object.assign(new Error("x"), { status, code });

/** Hàng đợi với bộ hẹn giờ thủ công: không có gì tự chạy, test bắn timer khi cần. */
function setup({ attemptId = "att-1", failures = [], storage = memoryStorage() } = {}) {
  const timers = [];
  const calls = [];
  const queueOfFailures = [...failures];
  const transport = {
    async put(id, key, text) {
      calls.push({ id, key, text });
      const next = queueOfFailures.shift();
      if (next) throw next;
      return { taskKey: key };
    },
    putOnHide(id, key, text) {
      calls.push({ id, key, text, hide: true });
    },
  };
  const ctx = { attemptId };
  const queue = new TextQueue({
    transport,
    getAttemptId: () => ctx.attemptId,
    storage,
    storageKey: pendingKey("u1", "client-1"),
    debounceMs: 3000,
    backoffMs: () => 0,
    setTimer: (fn, ms) => {
      const t = { fn, ms };
      timers.push(t);
      return t;
    },
    clearTimer: (t) => {
      const i = timers.indexOf(t);
      if (i >= 0) timers.splice(i, 1);
    },
  });
  /** Chờ promise xong, bắn mọi timer đang chờ giữa các lượt. */
  async function settle(promise) {
    let done = false;
    promise.then(
      () => (done = true),
      () => (done = true),
    );
    while (!done) {
      await new Promise((r) => setImmediate(r));
      const list = timers.splice(0);
      list.forEach((t) => t.fn());
    }
    return promise;
  }
  return { queue, timers, calls, storage, ctx, settle };
}

test("gõ nhiều lần chỉ lưu bản mới nhất (ghi đè), sau debounce", async () => {
  const { queue, timers, calls } = setup();
  queue.set("task2", "a");
  queue.set("task2", "a b");
  queue.set("task2", "a b c");
  assert.equal(calls.length, 0, "chưa lưu trước khi hết debounce");
  assert.equal(timers.length, 1, "chỉ một hẹn giờ debounce, các lần gõ gộp lại");
  assert.equal(timers[0].ms, 3000);
  timers[0].fn();
  await queue.flush();
  assert.deepEqual(calls.map((c) => [c.id, c.key, c.text]), [["att-1", "task2", "a b c"]]);
});

test("idempotent: không đổi thì không PUT lại; cùng nội dung set lại là không có gì", async () => {
  const { queue, calls } = setup();
  queue.set("task1", "xin chào");
  await queue.flush();
  await queue.flush();
  assert.equal(queue.set("task1", "xin chào"), false);
  await queue.flush();
  assert.equal(calls.length, 1);
  assert.equal(queue.hasUnsaved(), false);
  queue.set("task1", "xin chào bạn");
  await queue.flush();
  assert.equal(calls.length, 2, "đổi nội dung thì ghi đè một lần nữa");
  assert.equal(calls[1].text, "xin chào bạn");
});

test("hai Task lưu độc lập; chữ gõ thêm trong lúc PUT vẫn được lưu ở vòng sau", async () => {
  const storage = memoryStorage();
  const calls = [];
  let queue;
  const transport = {
    async put(id, key, text) {
      calls.push([key, text]);
      // Người học gõ thêm đúng lúc lượt PUT đầu đang chạy.
      if (calls.length === 1) queue.set("task1", "một hai");
    },
  };
  queue = new TextQueue({
    transport,
    getAttemptId: () => "att-1",
    storage,
    storageKey: "k",
    backoffMs: () => 0,
    setTimer: () => ({}),
    clearTimer: () => undefined,
  });
  queue.set("task1", "một");
  queue.set("task2", "hai");
  await queue.flush();
  assert.deepEqual(calls, [
    ["task1", "một"],
    ["task2", "hai"],
    ["task1", "một hai"],
  ]);
  assert.equal(queue.hasUnsaved(), false);
  assert.equal(storage.getItem("k"), null, "đã lưu hết thì bỏ bản chờ khỏi storage");
});

test("lỗi tạm: giữ bản chưa lưu (cả trong storage), thử lại thì lưu được và dọn storage", async () => {
  const { queue, calls, storage, settle } = setup({ failures: [err(0, "NETWORK_ERROR"), err(503)] });
  const key = pendingKey("u1", "client-1");
  queue.set("task2", "bài dở");
  await queue.flush();
  assert.equal(queue.hasUnsaved(), true);
  assert.deepEqual(readPendingTexts(storage, key), { task2: "bài dở" }, "bản chờ nằm trong storage");
  assert.equal(queue.summary().dirty, 1);
  await settle(queue.flush());
  await settle(queue.flush());
  assert.equal(queue.hasUnsaved(), false);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map((c) => c.text), ["bài dở", "bài dở", "bài dở"]);
  assert.equal(storage.getItem(key), null);
});

test("đang chờ lượt thử lại thì flush thường bỏ qua, flush(true) bỏ qua nhịp chờ", async () => {
  let now = 1000;
  const calls = [];
  const fails = [err(0)];
  const queue = new TextQueue({
    transport: {
      async put(id, key, text) {
        calls.push(text);
        if (fails.length) throw fails.shift();
      },
    },
    getAttemptId: () => "att-1",
    backoffMs: () => 5000,
    now: () => now,
    setTimer: () => ({}),
    clearTimer: () => undefined,
  });
  queue.set("task1", "x");
  await queue.flush(true);
  assert.equal(calls.length, 1);
  await queue.flush(false);
  assert.equal(calls.length, 1, "chưa đến nhịp thử lại");
  await queue.flush(true);
  assert.equal(calls.length, 2, "ép lưu (chuyển Task, Hoàn thành) thì thử ngay");
  assert.equal(queue.hasUnsaved(), false);
});

test("chưa có mã lượt: văn bản chờ, không gọi máy chủ, có mã thì kick lưu", async () => {
  const { queue, calls, ctx } = setup({ attemptId: null });
  queue.set("task1", "chờ lượt");
  await queue.flush();
  assert.equal(calls.length, 0);
  assert.equal(queue.summary().dirty, 1);
  ctx.attemptId = "att-9";
  await queue.flush();
  assert.deepEqual(calls.map((c) => [c.id, c.text]), [["att-9", "chờ lượt"]]);
});

test("quá giờ hoặc nội dung hết hạn: đóng Task, không thử lại, vẫn cho chốt", async () => {
  for (const e of [err(409, "ATTEMPT_TIME_EXPIRED"), err(409, "ATTEMPT_NOT_ACTIVE"), err(410, "CONTENT_EXPIRED")]) {
    const { queue, calls } = setup({ failures: [e] });
    queue.set("task1", "muộn");
    await queue.flush();
    await queue.flush();
    assert.equal(calls.length, 1, "không thử lại khi máy chủ đã đóng");
    const s = queue.summary();
    assert.deepEqual(s.closedKeys, ["task1"]);
    assert.equal(s.complete, true);
    assert.equal(toUploadSummary(s).complete, true);
    assert.deepEqual(toUploadSummary(s).expiredIds, ["task1"]);
  }
  assert.equal(isTextClosedError(err(409, "ATTEMPT_TIME_EXPIRED")), true);
  assert.equal(isRetryableTextError(err(409, "ATTEMPT_TIME_EXPIRED")), false);
});

test("lỗi cố định (400/404 TASK_NOT_FOUND) đánh dấu failed, chặn chốt", async () => {
  const { queue } = setup({ failures: [err(400, "VALIDATION_ERROR")] });
  queue.set("task2", "x");
  await queue.flush();
  const s = queue.summary();
  assert.equal(s.failed, 1);
  assert.equal(s.complete, false);
});

test("404 ATTEMPT_NOT_FOUND: báo bộ đồng bộ tạo lại lượt và giữ bản để lưu lại", async () => {
  let gone = 0;
  const calls = [];
  const fails = [err(404, "ATTEMPT_NOT_FOUND")];
  const queue = new TextQueue({
    transport: {
      async put(id, key, text) {
        calls.push(id);
        if (fails.length) throw fails.shift();
      },
    },
    getAttemptId: () => "att-1",
    onAttemptGone: () => gone++,
    backoffMs: () => 0,
    setTimer: () => ({}),
    clearTimer: () => undefined,
  });
  queue.set("task1", "giữ lại");
  await queue.flush();
  assert.equal(gone, 1);
  assert.equal(queue.hasUnsaved(), true);
  await queue.flush();
  assert.equal(queue.hasUnsaved(), false);
});

test("khôi phục: adopt bản đã lưu không PUT lại, bản chưa lưu thì PUT", async () => {
  const { queue, calls } = setup();
  queue.adopt("task1", "đã có trên máy chủ", true);
  queue.adopt("task2", "chỉ có trên máy này", false);
  await queue.flush();
  assert.deepEqual(calls.map((c) => [c.key, c.text]), [["task2", "chỉ có trên máy này"]]);
  assert.equal(queue.text("task1"), "đã có trên máy chủ");
});

test("drain: lỗi tạm thì thử lại ngắn trong vài vòng rồi mới trả kết quả", async () => {
  const { queue, calls, settle } = setup({ failures: [err(0), err(502)] });
  queue.set("task1", "một");
  queue.set("task2", "hai");
  const s = await settle(queue.drain(3, 10));
  assert.equal(s.complete, true);
  assert.equal(queue.hasUnsaved(), false);
  assert.ok(calls.length >= 4);
});

test("drain: hết lượt thử mà vẫn lỗi thì báo chưa xong (không được chốt)", async () => {
  const fails = Array.from({ length: 20 }, () => err(0));
  const { queue, settle } = setup({ failures: fails });
  queue.set("task1", "không lưu được");
  const s = await settle(queue.drain(3, 10));
  assert.equal(s.complete, false);
  assert.equal(s.dirty, 1);
});

test("luật hoàn thành: lưu cả hai Task trước khi chốt, chuẩn hóa trạng thái COMPLETED từ API", async () => {
  const { queue, calls, settle } = setup();
  const order = [];
  queue.set("task1", "bài một");
  queue.set("task2", "bài hai bản cuối");
  const run = finishAttempt({
    ensureCreated: async () => "att-1",
    drain: async () => toUploadSummary(await queue.drain(3, 10)),
    summary: () => toUploadSummary(queue.summary()),
    complete: async (id, input) => {
      order.push(["complete", calls.length, input.reason]);
      return { status: "COMPLETED", completedAt: "2026-11-25T10:00:00Z", contentExpiresAt: "2026-12-09T10:00:00Z", durationSeconds: 100 };
    },
    elapsedSeconds: 100,
    reason: "TIME_UP",
  });
  const outcome = await settle(run);
  assert.deepEqual(outcome, {
    status: "completed", serverId: "att-1", expiredIds: [], completedAt: "2026-11-25T10:00:00Z",
    contentExpiresAt: "2026-12-09T10:00:00Z", durationSeconds: 100,
  });
  assert.deepEqual(order, [["complete", 2, "TIME_UP"]], "complete chỉ gọi sau khi cả hai PUT xong");
  assert.deepEqual(calls.map((c) => c.text), ["bài một", "bài hai bản cuối"]);
});

test("luật hoàn thành: lưu chưa được thì KHÔNG gọi complete, giữ trạng thái chưa lưu đủ", async () => {
  const fails = Array.from({ length: 30 }, () => err(0));
  const { queue, settle } = setup({ failures: fails });
  let completes = 0;
  queue.set("task2", "chưa lên được");
  const outcome = await settle(
    finishAttempt({
      ensureCreated: async () => "att-1",
      drain: async () => toUploadSummary(await queue.drain(3, 10)),
      summary: () => toUploadSummary(queue.summary()),
      complete: async () => {
        completes++;
        return { completedAt: "", contentExpiresAt: null, durationSeconds: 0 };
      },
      elapsedSeconds: 5,
      reason: "SUBMITTED",
    }),
  );
  assert.equal(completes, 0);
  assert.equal(outcome.status, "incomplete");
  assert.equal(outcome.why, "upload");
  assert.equal(queue.hasUnsaved(), true, "bài vẫn còn trong hàng đợi/storage để thử lại");
});

test("luật hoàn thành: Task quá giờ không lưu được vẫn chốt, báo qua expiredIds", async () => {
  const { queue, settle } = setup({ failures: [err(409, "ATTEMPT_TIME_EXPIRED")] });
  queue.set("task1", "nộp muộn");
  const outcome = await settle(
    finishAttempt({
      ensureCreated: async () => "att-1",
      drain: async () => toUploadSummary(await queue.drain(3, 10)),
      summary: () => toUploadSummary(queue.summary()),
      complete: async () => ({ completedAt: "t", contentExpiresAt: null, durationSeconds: 1 }),
      elapsedSeconds: 1,
      reason: "TIME_UP",
    }),
  );
  assert.equal(outcome.status, "completed");
  assert.deepEqual(outcome.expiredIds, ["task1"]);
});

test("đóng trang: gửi best-effort các bản chưa lưu, bản đã lưu hoặc đã hủy thì không", async () => {
  const { queue, calls } = setup();
  queue.set("task1", "dở dang");
  queue.flushOnHide();
  assert.deepEqual(calls.filter((c) => c.hide).map((c) => c.text), ["dở dang"]);
  await queue.flush();
  calls.length = 0;
  queue.flushOnHide();
  assert.equal(calls.length, 0);
  queue.set("task2", "sau khi hủy");
  queue.dispose();
  queue.flushOnHide();
  assert.equal(calls.length, 0);
});

test("storage: dọn bản chờ quá hạn và bản của người dùng đăng xuất; đọc hỏng thì rỗng", () => {
  const storage = memoryStorage();
  storage.setItem(pendingKey("u1", "old"), JSON.stringify({ savedAt: 0, texts: { task1: "cũ" } }));
  storage.setItem(pendingKey("u1", "new"), JSON.stringify({ savedAt: 90_000_000, texts: { task2: "mới" } }));
  storage.setItem(pendingKey("u2", "x"), JSON.stringify({ savedAt: 90_000_000, texts: { task1: "khác" } }));
  storage.setItem("khong-lien-quan", "giữ");
  sweepPendingTexts(storage, 100_000_000, 24 * 3600 * 1000);
  assert.equal(storage.getItem(pendingKey("u1", "old")), null);
  assert.notEqual(storage.getItem(pendingKey("u1", "new")), null);
  clearPendingTextsOf(storage, "u1");
  assert.equal(storage.getItem(pendingKey("u1", "new")), null);
  assert.notEqual(storage.getItem(pendingKey("u2", "x")), null, "không đụng bản của người khác");
  assert.equal(storage.getItem("khong-lien-quan"), "giữ");
  storage.setItem("hong", "{không phải json");
  assert.deepEqual(readPendingTexts(storage, "hong"), {});
  assert.deepEqual(readPendingTexts(storage, "khong-co"), {});
  assert.deepEqual(readPendingTexts(null, "k"), {});
});

test("không storage (đề mẫu) vẫn chạy được; clearStorage dọn bản chờ", async () => {
  const q = new TextQueue({
    transport: { put: async () => ({}) },
    getAttemptId: () => undefined,
    storage: null,
    setTimer: () => ({}),
    clearTimer: () => undefined,
  });
  q.set("task1", "x");
  assert.equal(q.summary().dirty, 1);
  const { queue, storage } = setup({ attemptId: null });
  queue.set("task1", "giữ trong storage");
  assert.notEqual(storage.getItem(pendingKey("u1", "client-1")), null);
  queue.clearStorage();
  assert.equal(storage.getItem(pendingKey("u1", "client-1")), null);
});
