import test from 'node:test';
import assert from 'node:assert/strict';
import { readLearnerResults, shapeResultItem } from '../dist/modules/learner/study-overview.js';

const now = new Date('2026-11-25T00:00:00Z');
const future = new Date('2026-12-01T00:00:00Z');
const past = new Date('2026-11-20T00:00:00Z');
const base = { id: 'a', title: 'T', completedAt: past, skill: 'WRITING', form: null, scope: 'FULL_SKILL',
  band: null, accuracy: null, correct: null, total: null, contentStatus: 'AVAILABLE', contentExpiresAt: future,
  gradingStatus: null, gradingCancelReason: null, gradingDeadlineAt: null, published: false, recordingCount: 0, attemptMode: null };

test('bài chưa gửi chấm', () => {
  const item = shapeResultItem(base, now);
  assert.deepEqual(item.grading, { status: null, cancelReason: null, assignmentDeadlineAt: null });
  assert.equal(item.contentStatus, 'AVAILABLE');
  assert.equal(item.contentExpiresAt, future.toISOString());
  assert.equal(item.published, false);
});

test('WAITING_ASSIGNMENT và ASSIGNED', () => {
  for (const status of ['WAITING_ASSIGNMENT', 'ASSIGNED']) {
    const item = shapeResultItem({ ...base, gradingStatus: status, gradingDeadlineAt: future, contentStatus: 'HELD' }, now);
    assert.deepEqual(item.grading, { status, cancelReason: null, assignmentDeadlineAt: future.toISOString() });
    assert.equal(item.contentStatus, 'HELD');
  }
});

test('COMPLETED và đã công bố', () => {
  const item = shapeResultItem({ ...base, gradingStatus: 'COMPLETED', gradingDeadlineAt: past, published: true, band: 6.5 }, now);
  assert.equal(item.grading.status, 'COMPLETED');
  assert.equal(item.published, true);
  assert.equal(item.band, 6.5);
});

test('CANCELLED có lý do', () => {
  const item = shapeResultItem({ ...base, gradingStatus: 'CANCELLED', gradingCancelReason: 'ASSIGNMENT_TIMEOUT', gradingDeadlineAt: past }, now);
  assert.equal(item.grading.status, 'CANCELLED');
  assert.equal(item.grading.cancelReason, 'ASSIGNMENT_TIMEOUT');
});

test('hết hạn theo thời gian dù job chưa chạy', () => {
  const item = shapeResultItem({ ...base, contentExpiresAt: past }, now);
  assert.equal(item.contentStatus, 'EXPIRED');
  assert.equal(shapeResultItem({ ...base, contentStatus: 'DELETED', contentExpiresAt: past }, now).contentStatus, 'DELETED');
});

test('Speaking đếm bản ghi và chế độ', () => {
  const item = shapeResultItem({ ...base, skill: 'SPEAKING', recordingCount: 3, attemptMode: 'REAL' }, now);
  assert.equal(item.recordingCount, 3);
  assert.equal(item.attemptMode, 'REAL');
});

test('LR không đổi', async () => {
  const row = { id: 'l', title: 'T', completedAt: past, skill: 'READING', form: null, scope: 'FULL_SKILL',
    band: 7, accuracy: null, correct: 30, total: 40, contentStatus: 'AVAILABLE', contentExpiresAt: null,
    gradingStatus: null, gradingCancelReason: null, gradingDeadlineAt: null, published: false, recordingCount: null, attemptMode: null };
  const db = { $queryRaw: async () => [row] };
  const result = await readLearnerResults(db, '00000000-0000-0000-0000-000000000001', { kind: 'all', group: 'LR' });
  assert.deepEqual(result.items[0], { id: 'l', title: 'T', completedAt: past, skill: 'READING', form: null,
    scope: 'FULL_SKILL', band: 7, accuracy: null, correct: 30, total: 40 });
  assert.equal(result.nextCursor, null);
});
