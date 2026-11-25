import test from "node:test";
import assert from "node:assert/strict";
import { nextMenuIndex } from "../src/lib/shared/menu-nav.ts";
import { crc32, createZip } from "../src/lib/shared/zip.ts";
import { extensionForMime, recordingFileName, recordingZipName, sanitizeName, formatRecordingLength } from "../src/lib/attempts/recording-files.ts";
import { describeWsRow } from "../src/lib/learner/ws-history.ts";
import { strFromU8, unzipSync } from "fflate";
import { createWritingDocx } from "../src/lib/attempts/writing-docx.ts";

test("điều hướng menu bằng bàn phím", () => {
  assert.equal(nextMenuIndex(3, -1, "ArrowDown"), 0);
  assert.equal(nextMenuIndex(3, 2, "ArrowDown"), 0);
  assert.equal(nextMenuIndex(3, 0, "ArrowUp"), 2);
  assert.equal(nextMenuIndex(3, 1, "Home"), 0);
  assert.equal(nextMenuIndex(3, 0, "End"), 2);
  assert.equal(nextMenuIndex(3, 0, "a"), -1);
  assert.equal(nextMenuIndex(0, 0, "ArrowDown"), -1);
});

test("CRC32 chuẩn", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  assert.equal(crc32(new Uint8Array()), 0);
});

test("zip STORE đọc lại được qua thư mục trung tâm", () => {
  const files = [
    { name: "p1-c1.webm", data: new Uint8Array([1, 2, 3, 4]) },
    { name: "p2-c1.webm", data: new TextEncoder().encode("xin chào") },
  ];
  const zip = createZip(files, new Date(2026, 10, 25, 10, 20, 30));
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const end = zip.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50);
  assert.equal(view.getUint16(end + 10, true), 2);
  let at = view.getUint32(end + 16, true);
  for (const file of files) {
    assert.equal(view.getUint32(at, true), 0x02014b50);
    assert.equal(view.getUint32(at + 16, true), crc32(file.data));
    assert.equal(view.getUint32(at + 24, true), file.data.length);
    const nameLen = view.getUint16(at + 28, true);
    const localAt = view.getUint32(at + 42, true);
    assert.equal(new TextDecoder().decode(zip.subarray(at + 46, at + 46 + nameLen)), file.name);
    assert.equal(view.getUint32(localAt, true), 0x04034b50);
    const dataAt = localAt + 30 + view.getUint16(localAt + 26, true);
    assert.deepEqual([...zip.subarray(dataAt, dataAt + file.data.length)], [...file.data]);
    at += 46 + nameLen;
  }
});

test("tên tệp ghi âm và zip", () => {
  assert.equal(recordingFileName("p1q0", "audio/webm;codecs=opus"), "p1-c1.webm");
  assert.equal(recordingFileName("p2q0", "audio/mp4"), "p2-c1.m4a");
  assert.equal(recordingFileName("p3q4", null), "p3-c5.webm");
  assert.equal(extensionForMime("audio/ogg"), "ogg");
  assert.equal(sanitizeName("Speaking Part 2 · Đường/phố?"), "Speaking-Part-2-Duong-pho");
  assert.equal(recordingZipName("Part 2 · A skill", new Date("2026-11-25T18:00:00Z")), "ieltspace-speaking-Part-2-A-skill-2026-11-26.zip");
  assert.equal(formatRecordingLength(85000), "01:25");
  assert.equal(formatRecordingLength(0), "");
});

const base = { skill: "SPEAKING", band: null, recordingCount: 2 };
test("ánh xạ trạng thái Speaking", () => {
  const saved = describeWsRow({ ...base, contentStatus: "AVAILABLE", grading: null, published: false });
  assert.equal(saved.status, "Đã lưu · chưa gửi chấm");
  assert.equal(saved.primary.kind, "grade");
  assert.deepEqual(saved.menu.map(m => m.kind), ["listen", "download-audio"]);
  assert.equal(describeWsRow({ ...base, contentStatus: "HELD", grading: { status: "WAITING_ASSIGNMENT" } }).status, "Chờ phân công");
  assert.equal(describeWsRow({ ...base, contentStatus: "HELD", grading: { status: "ASSIGNED" } }).status, "Đang chấm");
  const done = describeWsRow({ ...base, band: 6.5, contentStatus: "AVAILABLE", grading: { status: "COMPLETED" }, published: true });
  assert.equal(done.status, "Đã có kết quả · 6.5");
  assert.equal(done.primary.kind, "view");
  const cancelled = describeWsRow({ ...base, contentStatus: "AVAILABLE", grading: { status: "CANCELLED" } });
  assert.equal(cancelled.primary.kind, "regrade");
  const expired = describeWsRow({ ...base, contentStatus: "EXPIRED", grading: null });
  assert.equal(expired.status, "Nội dung đã hết hạn");
  assert.equal(expired.primary, undefined);
  assert.ok(expired.menu.every(m => m.disabledReason));
  const expiredPublished = describeWsRow({ ...base, band: 7, contentStatus: "DELETED", grading: { status: "COMPLETED" }, published: true });
  assert.equal(expiredPublished.primary.kind, "view");
  assert.ok(expiredPublished.menu.every(m => m.disabledReason));
});

test("API cũ chưa trả trường mới thì suy giảm êm", () => {
  assert.equal(describeWsRow({ skill: "WRITING", band: null }).outcome, "saved");
  assert.equal(describeWsRow({ skill: "WRITING", band: 6 }).outcome, "published");
});

test("Writing: mở xem và tải .docx khi còn hạn", async () => {
  const { describeWsRow, EXPIRED_REASON, wsSectionsLabel } = await import("../src/lib/learner/ws-history.ts");
  const saved = describeWsRow({ skill: "WRITING", band: null, contentStatus: "AVAILABLE", contentExpiresAt: "2026-12-09T00:00:00Z", grading: null, published: false });
  assert.deepEqual(saved.menu.map((m) => m.kind), ["view-text", "download-docx"]);
  assert.equal(saved.menu[0].disabledReason, undefined);
  assert.equal(saved.menu[1].disabledReason, undefined);
  assert.equal(saved.menu[0].label, "Xem bài viết");
  assert.equal(saved.primary.kind, "grade");
  const expired = describeWsRow({ skill: "WRITING", band: null, contentStatus: "EXPIRED", grading: null, published: false });
  assert.ok(expired.menu.every((m) => m.disabledReason === EXPIRED_REASON));
  assert.equal(wsSectionsLabel('Writing', [2]), 'Task 2');
  assert.equal(wsSectionsLabel('Speaking', [1, 3]), 'Part 1, 3');
  assert.equal(wsSectionsLabel('Speaking', [1, 2, 3]), 'Cả kỹ năng');
  assert.equal(wsSectionsLabel('Writing', null), null);
  // Speaking không đổi.
  const speaking = describeWsRow({ skill: "SPEAKING", band: null, contentStatus: "AVAILABLE", grading: null, published: false, recordingCount: 3 });
  assert.deepEqual(speaking.menu.map((m) => m.kind), ["listen", "download-audio"]);
});

test('DOCX giữ Unicode, xuống đoạn, tab và chỉ xuất Task đã lưu', () => {
  const bytes = createWritingDocx('Bài viết & đề', [{ taskKey: 'task2', text: 'Dòng 1 <x>\r\n\r\n  Tiếng Việt\t📝\u0001' }]);
  const parts = unzipSync(bytes);
  const body = strFromU8(parts['word/document.xml']);
  assert.deepEqual(Object.keys(parts).sort(), ['[Content_Types].xml', '_rels/.rels', 'word/document.xml']);
  assert.match(strFromU8(parts['_rels/.rels']), /Target="word\/document.xml"/);
  assert.match(body, /Bài viết &amp; đề/);
  assert.doesNotMatch(body, /Task 1|\u0001/);
  assert.match(body, /Task 2/);
  assert.match(body, /Dòng 1 &lt;x&gt;<\/w:t><\/w:r><\/w:p><w:p><w:r><w:t xml:space="preserve"><\/w:t>/);
  assert.match(body, /  Tiếng Việt<\/w:t><w:tab\/><w:t xml:space="preserve">📝/);
});
