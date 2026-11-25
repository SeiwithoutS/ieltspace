import test from "node:test";
import assert from "node:assert/strict";
import {
  estimateOffsetMs,
  resolveClock,
} from "../src/lib/attempts/server-clock.ts";

const NOW = Date.parse("2026-11-25T10:00:00Z");
const iso = (ms) => new Date(ms).toISOString();
const inProgress = (startedMs, deadlineMs = null) => ({
  ok: true,
  status: "IN_PROGRESS",
  startedAt: iso(startedMs),
  deadlineAt: deadlineMs === null ? null : iso(deadlineMs),
});

test("gốc máy chủ thắng: nháp bị sửa muộn hơn máy chủ thì bị bỏ", () => {
  const started = NOW - 10 * 60_000;
  const tampered = NOW - 60_000; // người dùng sửa để còn nhiều giờ hơn
  const r = resolveClock({
    server: inProgress(started, started + 15 * 60_000),
    draftEpoch: tampered,
    now: NOW,
    offsetMs: 0,
  });
  assert.equal(r.kind, "server");
  assert.equal(r.epoch, started);
  assert.equal(r.limitSeconds, 900);
  assert.equal(r.deadlineEpoch, started + 15 * 60_000);
});

test("nháp sớm hơn máy chủ cũng không làm giờ khác: máy chủ là gốc", () => {
  const started = NOW - 60_000;
  const r = resolveClock({
    server: inProgress(started, started + 900_000),
    draftEpoch: NOW - 5 * 60_000,
    now: NOW,
    offsetMs: 0,
  });
  assert.equal(r.epoch, started);
});

test("máy chủ COMPLETED: chuyển sang trang xác nhận", () => {
  const r = resolveClock({
    server: { ok: true, status: "COMPLETED", startedAt: iso(NOW - 1000), deadlineAt: null },
    draftEpoch: NOW - 1000,
    now: NOW,
    offsetMs: 0,
  });
  assert.equal(r.kind, "completed");
});

test("404 và ABANDONED: lượt không còn", () => {
  assert.equal(
    resolveClock({ server: { ok: false, httpStatus: 404 }, draftEpoch: 1, now: NOW, offsetMs: 0 }).kind,
    "gone",
  );
  assert.equal(
    resolveClock({
      server: { ok: true, status: "ABANDONED", startedAt: iso(NOW), deadlineAt: null },
      draftEpoch: 1,
      now: NOW,
      offsetMs: 0,
    }).kind,
    "gone",
  );
});

test("offline hoặc lỗi máy chủ: dùng mốc trong nháp", () => {
  for (const httpStatus of [undefined, 0, 500, 401]) {
    const r = resolveClock({
      server: { ok: false, httpStatus },
      draftEpoch: NOW - 5000,
      now: NOW,
      offsetMs: 0,
    });
    assert.deepEqual(r, { kind: "draft", epoch: NOW - 5000 });
  }
});

test("ngày giờ máy chủ hỏng thì dùng nháp", () => {
  const r = resolveClock({
    server: { ok: true, status: "IN_PROGRESS", startedAt: "không phải ngày", deadlineAt: null },
    draftEpoch: 42,
    now: NOW,
    offsetMs: 0,
  });
  assert.deepEqual(r, { kind: "draft", epoch: 42 });
});

test("Practice không giới hạn: deadline null", () => {
  const started = NOW - 120_000;
  const r = resolveClock({
    server: inProgress(started, null),
    draftEpoch: started,
    now: NOW,
    offsetMs: 0,
  });
  assert.equal(r.kind, "server");
  assert.equal(r.limitSeconds, null);
  assert.equal(r.deadlineEpoch, null);
});

test("lệch đồng hồ: máy khách chậm hơn máy chủ 5 phút thì quy mốc về đồng hồ máy khách", () => {
  const skew = 5 * 60_000; // giờ máy chủ = giờ máy khách + skew
  const serverStarted = NOW + skew - 10 * 60_000; // bắt đầu cách đây 10 phút theo máy chủ
  const r = resolveClock({
    server: inProgress(serverStarted, serverStarted + 900_000),
    draftEpoch: undefined,
    now: NOW,
    offsetMs: skew,
  });
  assert.equal(r.epoch, NOW - 10 * 60_000);
  // Đã dùng 10 phút theo đồng hồ máy khách, đúng với thực tế.
  assert.equal(Math.floor((NOW - r.epoch) / 1000), 600);
});

test("mốc không bao giờ nằm ở tương lai (máy khách chậm, không có offset)", () => {
  const r = resolveClock({
    server: inProgress(NOW + 30_000, NOW + 930_000),
    draftEpoch: undefined,
    now: NOW,
    offsetMs: 0,
  });
  assert.equal(r.epoch, NOW);
});

test("deadline không hợp lệ (trước startedAt) thì không có giới hạn từ máy chủ", () => {
  const r = resolveClock({
    server: inProgress(NOW - 1000, NOW - 5000),
    draftEpoch: undefined,
    now: NOW,
    offsetMs: 0,
  });
  assert.equal(r.limitSeconds, null);
});

test("estimateOffsetMs: không có header Date thì 0", () => {
  assert.equal(estimateOffsetMs({ sentAt: NOW, receivedAt: NOW + 100, dateHeader: null }), 0);
  assert.equal(estimateOffsetMs({ sentAt: NOW, receivedAt: NOW + 100, dateHeader: "rác" }), 0);
});

test("estimateOffsetMs: lệch nhỏ (trong sai số) thì 0", () => {
  const date = new Date(NOW + 50 + 700).toUTCString(); // lệch dưới 1 giây
  assert.equal(estimateOffsetMs({ sentAt: NOW, receivedAt: NOW + 100, dateHeader: date }), 0);
});

test("estimateOffsetMs: lệch lớn được trừ sai số, co về phía 0", () => {
  const skew = 60_000;
  const sentAt = NOW;
  const receivedAt = NOW + 200;
  // Máy chủ ở thời điểm giữa = NOW + 100 + skew; Date làm tròn xuống giây.
  const date = new Date(Math.floor((NOW + 100 + skew) / 1000) * 1000).toUTCString();
  const offset = estimateOffsetMs({ sentAt, receivedAt, dateHeader: date });
  assert.ok(offset > 0 && offset < skew, "co về 0: " + offset);
  assert.ok(skew - offset <= 1500 + 100 + 1000, "sai lệch trong ngưỡng: " + offset);
  // Máy khách đi trước máy chủ: offset âm, cũng co về 0.
  const behind = new Date(Math.floor((NOW + 100 - skew) / 1000) * 1000).toUTCString();
  const negative = estimateOffsetMs({ sentAt, receivedAt, dateHeader: behind });
  assert.ok(negative < 0 && negative > -skew);
});

test("estimateOffsetMs: phản hồi quá chậm hoặc offset vô lý thì bỏ", () => {
  const date = new Date(NOW + 60_000).toUTCString();
  assert.equal(estimateOffsetMs({ sentAt: NOW, receivedAt: NOW + 20_000, dateHeader: date }), 0);
  const far = new Date(NOW + 3 * 24 * 3600_000).toUTCString();
  assert.equal(estimateOffsetMs({ sentAt: NOW, receivedAt: NOW + 100, dateHeader: far }), 0);
});
