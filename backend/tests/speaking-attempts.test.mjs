import test from 'node:test';
import assert from 'node:assert/strict';

Object.assign(process.env, {
  NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000', AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
  SUPABASE_URL: 'https://attempts-test.example', SUPABASE_PUBLISHABLE_KEY: 'test-key',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
});
const { createAttemptsService, cleanupAttemptContent, recordingPath } = await import('../dist/modules/attempts/attempts.service.js');
const schemas = await import('../dist/modules/attempts/attempts.schemas.js');

const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';
const SKILL = '33333333-3333-4333-8333-333333333333';
const NOSKILL = '55555555-5555-4555-8555-555555555555';
const CLIENT = '44444444-4444-4444-8444-444444444444';
const CLIENT2 = '99999999-9999-4999-8999-999999999999';
const MIN = 60_000;
const DAY = 86_400_000;

// Repo giả trong bộ nhớ, mô phỏng hành vi nguyên tử của các câu SQL thật.
function fakeRepo() {
  const s = { attempts: new Map(), recs: [], gradingFor: new Set(), seq: 0, foreignClientIds: new Set() };
  const sections = ['sec-1', 'sec-2', 'sec-3'];
  const view = (r) => ({ ...r, partIndex: sections.indexOf(r.sectionId) });
  return {
    s,
    async findPublishedSpeakingSkill(id) {
      if (id !== SKILL) return null;
      return { id: SKILL, examId: 'exam-1', examTitle: 'Đề thử', durationMinutes: 15, sections: [
        { order_no: 1, title: 'Part 1', section_type: 'PART', instruction: 'Hướng dẫn', config: {}, groups: [{ order_no: 1, question_type: 'SPEAKING_QUESTION', questions: [{ order_no: 1, question_type: 'SPEAKING_QUESTION', content: { text: 'Q1?' } }] }] },
        { order_no: 2, title: 'Part 2', section_type: 'PART', content: { cueCard: 'Describe...' }, config: { prepMinutes: 1, speakMinutes: 2 }, groups: [] },
        { order_no: 3, title: 'Part 3', section_type: 'PART', instruction: '', config: {}, groups: [{ order_no: 1, question_type: 'SPEAKING_QUESTION', questions: [{ order_no: 1, question_type: 'SPEAKING_QUESTION', content: { text: 'Q3?' } }] }] },
      ] };
    },
    async findByClientAttemptId(userId, cid) {
      return [...s.attempts.values()].find((a) => a.userId === userId && a.clientId === cid) ?? null;
    },
    async createAttempt(i) {
      if (s.foreignClientIds?.has(i.clientAttemptId)) throw Object.assign(new Error('x'), { statusCode: 409, code: 'CLIENT_ATTEMPT_ID_CONFLICT' });
      const dup = await this.findByClientAttemptId(i.userId, i.clientAttemptId);
      if (dup) return dup;
      const a = { id: `att-${++s.seq}`, parentAttemptId: `p-${s.seq}`, userId: i.userId, clientId: i.clientAttemptId, examSkillId: i.examSkillId,
        mode: i.mode, status: 'IN_PROGRESS', startedAt: i.startedAt, deadlineAt: i.deadlineAt, completedAt: null,
        contentExpiresAt: null, contentStatus: 'AVAILABLE', durationSeconds: null };
      s.attempts.set(a.id, a);
      return a;
    },
    async getAttempt(id) { return s.attempts.get(id) ?? null; },
    async resolveSectionId(_a, idx) { return sections[idx] ?? null; },
    async listRecordings(id) { return s.recs.filter((r) => r.skillAttemptId === id && ['PENDING', 'UPLOADED'].includes(r.status)).map(view); },
    async getRecording(id, key) { const r = s.recs.find((x) => x.skillAttemptId === id && x.questionKey === key && ['PENDING', 'UPLOADED'].includes(x.status)); return r ? view(r) : null; },
    async upsertRecording(i) {
      let r = s.recs.find((x) => x.skillAttemptId === i.skillAttemptId && x.questionKey === i.questionKey);
      if (r && !i.overwrite && r.status === 'UPLOADED') return null;
      if (!r) { r = { id: `rec-${++s.seq}`, skillAttemptId: i.skillAttemptId, sectionId: i.sectionId, questionKey: i.questionKey }; s.recs.push(r); }
      Object.assign(r, { status: 'PENDING', audioPath: i.audioPath, mimeType: i.mimeType, size: i.size, durationMs: i.durationMs });
      return view(r);
    },
    async confirmRecording(id, key, size) { const r = s.recs.find((x) => x.skillAttemptId === id && x.questionKey === key); if (!r) return false; r.status = 'UPLOADED'; r.size = size; return true; },
    async completeAttempt({ attempt, completedAt, durationSeconds, contentExpiresAt }) {
      const a = s.attempts.get(attempt.id);
      if (a.status === 'IN_PROGRESS') Object.assign(a, { status: 'COMPLETED', completedAt, durationSeconds, contentExpiresAt });
      return a;
    },
    async hasGradingRequest(id) { return s.gradingFor.has(id); },
    async deleteAttempt(a) {
      if (s.attempts.get(a.id)?.status === 'COMPLETED') return { deleted: false, paths: [], reason: 'COMPLETED' };
      if (s.gradingFor.has(a.id)) return { deleted: false, paths: [], reason: 'SUBMITTED' };
      const paths = s.recs.filter((r) => r.skillAttemptId === a.id).map((r) => r.audioPath);
      s.recs = s.recs.filter((r) => r.skillAttemptId !== a.id); s.attempts.delete(a.id);
      return { deleted: true, paths };
    },
    async listExpiredContent(now) {
      return [...s.attempts.values()].filter((a) => a.status === 'COMPLETED' && a.contentStatus === 'AVAILABLE' && a.contentExpiresAt <= now && !s.gradingFor.has(a.id))
        .map((a) => ({ id: a.id, paths: s.recs.filter((r) => r.skillAttemptId === a.id).map((r) => r.audioPath) }));
    },
    // Mô phỏng claim: đổi trạng thái trước, hàng DELETED giữ audioPath cho tới khi xóa file xong.
    async claimExpiredContent(now) {
      const list = await this.listExpiredContent(now);
      for (const x of list) { s.attempts.get(x.id).contentStatus = 'DELETED'; s.recs.forEach((r) => { if (r.skillAttemptId === x.id) r.status = 'DELETED'; }); }
      return list;
    },
    async claimStaleInProgress(before) {
      const list = [...s.attempts.values()].filter((a) => a.status === 'IN_PROGRESS' && a.startedAt <= before);
      for (const a of list) { a.status = 'ABANDONED'; a.contentStatus = 'DELETED'; s.recs.forEach((r) => { if (r.skillAttemptId === a.id) r.status = 'DELETED'; }); }
      return list.map((a) => ({ id: a.id, paths: s.recs.filter((r) => r.skillAttemptId === a.id).map((r) => r.audioPath) }));
    },
    async listPendingFileDeletes() {
      const ids = new Set(s.recs.filter((r) => r.status === 'DELETED' && r.audioPath).map((r) => r.skillAttemptId));
      return [...ids].map((id) => ({ id, paths: s.recs.filter((r) => r.skillAttemptId === id && r.status === 'DELETED' && r.audioPath).map((r) => r.audioPath) }));
    },
    async clearDeletedPaths(id, paths) { s.recs.forEach((r) => { if (r.skillAttemptId === id && r.status === 'DELETED' && paths.includes(r.audioPath)) r.audioPath = null; }); },
  };
}

function fakeStorage() {
  const st = { files: new Map(), removed: [], uploadCalls: [], failRemove: false };
  return {
    st,
    async createUploadUrl(path, upsert) { st.uploadCalls.push({ path, upsert }); return `https://signed.example/${path}?token=t`; },
    async statObject(path) { return st.files.has(path) ? { size: st.files.get(path), contentType: 'audio/webm' } : null; },
    async createDownloadUrl(path, ttl) { return `https://signed.example/dl/${path}?ttl=${ttl}`; },
    async removeObjects(paths) { if (st.failRemove) throw new Error('boom'); st.removed.push(...paths); paths.forEach((p) => st.files.delete(p)); },
  };
}

function setup(start = new Date('2026-11-25T03:00:00Z')) {
  const repo = fakeRepo(); const storage = fakeStorage(); const clock = { now: start };
  const service = createAttemptsService({ repo, storage, clock: () => clock.now });
  return { repo, storage, clock, service };
}
const advance = (ctx, ms) => { ctx.clock.now = new Date(ctx.clock.now.getTime() + ms); };
const create = (service, over = {}) => service.createAttempt(U1, { clientAttemptId: CLIENT, examSkillId: SKILL, mode: 'REAL', limitMinutes: null, ...over });
const rec = (over = {}) => ({ questionId: 'p1q1', partIndex: 0, durationMs: 4000, mimeType: 'audio/webm;codecs=opus', size: 1000, ...over });
const upload = async (ctx, id, over = {}) => {
  const body = rec(over);
  const { path } = await ctx.service.createRecording(U1, id, body);
  ctx.storage.st.files.set(path, body.size);
  return ctx.service.confirmRecording(U1, id, body.questionId);
};
const code = (promise) => promise.then(() => null, (e) => `${e.statusCode}:${e.code}`);

test('zod: kiểm tra thân yêu cầu', () => {
  const ok = { clientAttemptId: CLIENT, examSkillId: SKILL, mode: 'PRACTICE', limitMinutes: 20 };
  assert.ok(schemas.createAttemptSchema.safeParse(ok).success);
  assert.ok(schemas.createAttemptSchema.safeParse({ ...ok, limitMinutes: null }).success);
  for (const bad of [{ ...ok, clientAttemptId: 'x' }, { ...ok, mode: 'EXAM' }, { ...ok, limitMinutes: 0 }, { ...ok, limitMinutes: 99 }, { ...ok, extra: 1 }, { ...ok, limitMinutes: undefined }]) {
    assert.equal(schemas.createAttemptSchema.safeParse(bad).success, false);
  }
  assert.ok(schemas.createRecordingSchema.safeParse(rec()).success);
  for (const bad of [rec({ mimeType: 'video/webm' }), rec({ size: schemas.RECORDING_MAX_BYTES + 1 }), rec({ size: 0 }), rec({ partIndex: 3 }), rec({ questionId: '../x' }), rec({ durationMs: -1 })]) {
    assert.equal(schemas.createRecordingSchema.safeParse(bad).success, false);
  }
  assert.ok(schemas.completeAttemptSchema.safeParse({ elapsedSeconds: 10, reason: 'TIME_UP' }).success);
  assert.equal(schemas.completeAttemptSchema.safeParse({ elapsedSeconds: -1 }).success, false);
  assert.ok(schemas.completeAttemptSchema.safeParse({ elapsedSeconds: 10 * 24 * 3600 }).success);
  assert.equal(schemas.completeAttemptSchema.safeParse({ elapsedSeconds: 1, reason: 'X' }).success, false);
});

test('đề Speaking trả đúng hình dạng hợp đồng, 404 khi không có hoặc chưa đăng', async () => {
  const { service } = setup();
  const c = await service.getSpeakingContent(SKILL);
  assert.deepEqual(c.parts.map((p) => p.kind), ['qs', 'cue', 'qs']);
  assert.deepEqual(c.parts[0].questions, ['Q1?']);
  assert.deepEqual(c.parts[1].cue, { prep: 1, speak: 2, text: 'Describe...' });
  assert.equal(c.title, 'Đề thử');
  assert.equal(await code(service.getSpeakingContent(NOSKILL)), '404:EXAM_SKILL_NOT_FOUND');
});

test('tạo lượt: máy chủ giữ started_at, REAL cố định 15 phút, Practice theo limit hoặc null', async () => {
  const { service, clock } = setup();
  const r = await create(service, { limitMinutes: 20 }); // REAL bỏ qua limitMinutes của client
  assert.equal(r.created, true);
  assert.equal(r.body.status, 'IN_PROGRESS');
  assert.equal(r.body.startedAt, clock.now.toISOString());
  assert.equal(r.body.deadlineAt, new Date(clock.now.getTime() + 15 * MIN).toISOString());
  const p = await service.createAttempt(U1, { clientAttemptId: CLIENT2, examSkillId: SKILL, mode: 'PRACTICE', limitMinutes: 20 });
  assert.equal(p.body.deadlineAt, new Date(clock.now.getTime() + 20 * MIN).toISOString());
  const u = await service.createAttempt(U1, { clientAttemptId: '77777777-7777-4777-8777-777777777777', examSkillId: SKILL, mode: 'PRACTICE', limitMinutes: null });
  assert.equal(u.body.deadlineAt, null);
  assert.equal(await code(service.createAttempt(U1, { clientAttemptId: '88888888-8888-4888-8888-888888888888', examSkillId: NOSKILL, mode: 'REAL', limitMinutes: null })), '404:EXAM_SKILL_NOT_FOUND');
});

test('tạo lượt idempotent theo (người dùng, clientAttemptId)', async () => {
  const ctx = setup();
  const first = await create(ctx.service);
  advance(ctx, 5 * MIN);
  const again = await create(ctx.service);
  assert.equal(again.created, false);
  assert.deepEqual(again.body, first.body);
  assert.equal(ctx.repo.s.attempts.size, 1);
  const other = await ctx.service.createAttempt(U2, { clientAttemptId: CLIENT, examSkillId: SKILL, mode: 'REAL', limitMinutes: null });
  assert.notEqual(other.body.id, first.body.id);
  assert.equal(await code(create(ctx.service, { examSkillId: NOSKILL })), '409:CLIENT_ATTEMPT_ID_CONFLICT');
});

test('clientAttemptId đã dùng cho lượt không phải Speaking: 409 CLIENT_ATTEMPT_ID_CONFLICT', async () => {
  const { service, repo } = setup();
  repo.s.foreignClientIds.add(CLIENT2);
  assert.equal(await code(create(service, { clientAttemptId: CLIENT2 })), '409:CLIENT_ATTEMPT_ID_CONFLICT');
});

test('quyền sở hữu: người khác không đọc, ghi, hoàn thành, nghe lại; xóa người khác không có tác dụng', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await upload(ctx, body.id);
  assert.equal(await code(ctx.service.getAttempt(U2, body.id)), '404:ATTEMPT_NOT_FOUND');
  assert.equal(await code(ctx.service.createRecording(U2, body.id, rec({ questionId: 'p1q2' }))), '404:ATTEMPT_NOT_FOUND');
  assert.equal(await code(ctx.service.confirmRecording(U2, body.id, 'p1q1')), '404:ATTEMPT_NOT_FOUND');
  assert.equal(await code(ctx.service.completeAttempt(U2, body.id, { elapsedSeconds: 5 })), '404:ATTEMPT_NOT_FOUND');
  assert.equal(await code(ctx.service.getRecordingUrl(U2, body.id, 'p1q1')), '404:ATTEMPT_NOT_FOUND');
  await ctx.service.deleteAttempt(U2, body.id);
  assert.ok(ctx.repo.s.attempts.has(body.id));
  assert.equal(await code(ctx.service.requestGrading(U2, body.id)), '404:ATTEMPT_NOT_FOUND');
});

test('ghi âm: pending rồi confirm, hiện trong GET lượt, kiểm dung lượng', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  const out = await ctx.service.createRecording(U1, body.id, rec());
  assert.equal(out.path, `speaking/${U1}/${body.id}/p1q1.webm`);
  assert.match(out.uploadUrl, /^https:\/\/signed\.example\//);
  assert.deepEqual(ctx.storage.st.uploadCalls[0], { path: out.path, upsert: false });
  let view = await ctx.service.getAttempt(U1, body.id);
  assert.deepEqual(view.recordings, [{ questionId: 'p1q1', partIndex: 0, status: 'PENDING', durationMs: 4000, size: 1000 }]);
  assert.equal(await code(ctx.service.confirmRecording(U1, body.id, 'p1q1')), '409:RECORDING_NOT_UPLOADED');
  ctx.storage.st.files.set(out.path, 999);
  assert.equal(await code(ctx.service.confirmRecording(U1, body.id, 'p1q1')), '422:RECORDING_SIZE_MISMATCH');
  ctx.storage.st.files.set(out.path, 1000);
  assert.deepEqual(await ctx.service.confirmRecording(U1, body.id, 'p1q1'), { status: 'UPLOADED' });
  assert.deepEqual(await ctx.service.confirmRecording(U1, body.id, 'p1q1'), { status: 'UPLOADED' });
  view = await ctx.service.getAttempt(U1, body.id);
  assert.equal(view.recordings[0].status, 'UPLOADED');
  assert.equal(await code(ctx.service.confirmRecording(U1, body.id, 'khong-co')), '404:RECORDING_NOT_FOUND');
  assert.equal(recordingPath(U1, 'a', 'q', 'audio/unknown'), `speaking/${U1}/a/q.audio`);
});

test('Thi thật: mỗi câu chỉ một bản ghi, ghi lần hai trả 409, không đổi Part để lách', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await upload(ctx, body.id);
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec())), '409:RECORDING_ALREADY_EXISTS');
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ partIndex: 2 }))), '400:QUESTION_PART_MISMATCH');
  // Hàng còn PENDING được cấp lại URL nhưng vẫn upsert=false (storage cấm ghi đè file đã có).
  await ctx.service.createRecording(U1, body.id, rec({ questionId: 'p1q2' }));
  await ctx.service.createRecording(U1, body.id, rec({ questionId: 'p1q2' }));
  assert.equal(ctx.storage.st.uploadCalls.at(-1).upsert, false);
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ questionId: 'p1q2', partIndex: 1 }))), '400:QUESTION_PART_MISMATCH');
});

test('Thi thật: hàng PENDING giữ nguyên path/mime/size cũ, mime khác 409, không xóa file cũ', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  const first = await ctx.service.createRecording(U1, body.id, rec({ size: 1000 }));
  const again = await ctx.service.createRecording(U1, body.id, rec({ size: 7777, durationMs: 9, mimeType: 'audio/webm' }));
  assert.equal(again.path, first.path);
  assert.equal(again.alreadyUploaded, false);
  const row = ctx.repo.s.recs.find((r) => r.questionKey === 'p1q1');
  assert.equal(row.size, 1000);
  assert.equal(row.mimeType, 'audio/webm;codecs=opus');
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ mimeType: 'audio/mp4' }))), '409:RECORDING_MIME_MISMATCH');
  assert.deepEqual(ctx.storage.st.removed, []);
  assert.equal(ctx.repo.s.recs.find((r) => r.questionKey === 'p1q1').audioPath, first.path);
});

test('POST recordings: file PENDING đã có trên storage đúng dung lượng thì alreadyUploaded, không cấp URL', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  const first = await ctx.service.createRecording(U1, body.id, rec());
  assert.equal(first.alreadyUploaded, false);
  ctx.storage.st.files.set(first.path, 1000);
  const calls = ctx.storage.st.uploadCalls.length;
  const again = await ctx.service.createRecording(U1, body.id, rec());
  assert.deepEqual(again, { uploadUrl: null, path: first.path, alreadyUploaded: true });
  assert.equal(ctx.storage.st.uploadCalls.length, calls);
  ctx.storage.st.files.set(first.path, 500); // sai dung lượng: vẫn cấp URL
  assert.equal((await ctx.service.createRecording(U1, body.id, rec())).alreadyUploaded, false);
  assert.deepEqual(await ctx.service.confirmRecording(U1, body.id, 'p1q1').catch((e) => e.code), 'RECORDING_SIZE_MISMATCH');
});

test('Practice: ghi đè được (upsert); quá hạn cộng ân hạn thì từ chối', async () => {
  const ctx = setup();
  const { body } = await ctx.service.createAttempt(U1, { clientAttemptId: CLIENT, examSkillId: SKILL, mode: 'PRACTICE', limitMinutes: 15 });
  await upload(ctx, body.id);
  await upload(ctx, body.id, { size: 2000 });
  assert.equal(ctx.storage.st.uploadCalls.at(-1).upsert, true);
  assert.equal((await ctx.service.getAttempt(U1, body.id)).recordings.length, 1);
  advance(ctx, 15 * MIN + 121_000);
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ questionId: 'late' }))), '409:ATTEMPT_TIME_EXPIRED');
});

test('hoàn thành: hạn 14 ngày, thời gian do máy chủ tính, idempotent', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  advance(ctx, 7 * MIN);
  const done = await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 1, reason: 'SUBMITTED' }); // client khai 1s, thực tế 420s
  assert.equal(done.status, 'COMPLETED');
  assert.equal(done.durationSeconds, 420);
  assert.equal(done.completedAt, ctx.clock.now.toISOString());
  assert.equal(done.contentExpiresAt, new Date(ctx.clock.now.getTime() + 14 * DAY).toISOString());
  advance(ctx, 3 * DAY);
  assert.deepEqual(await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 9999 }), done);
  const view = await ctx.service.getAttempt(U1, body.id);
  assert.equal(view.elapsedSeconds, 420);
  assert.equal(view.contentExpiresAt, done.contentExpiresAt);
});

test('hoàn thành sau hạn: thời gian bị chặn ở mức giới hạn của lượt', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  advance(ctx, 40 * MIN);
  assert.equal((await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 1, reason: 'TIME_UP' })).durationSeconds, 900);
});

test('sau hoàn thành: Thi thật chỉ xác nhận hàng đã đăng ký, trong cửa sổ ngắn', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  const { path } = await ctx.service.createRecording(U1, body.id, rec());
  await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 10 });
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ questionId: 'new' }))), '409:ATTEMPT_NOT_ACTIVE');
  ctx.storage.st.files.set(path, 1000);
  assert.deepEqual(await ctx.service.confirmRecording(U1, body.id, 'p1q1'), { status: 'UPLOADED' });
  const b2 = (await ctx.service.createAttempt(U1, { clientAttemptId: CLIENT2, examSkillId: SKILL, mode: 'REAL', limitMinutes: null })).body;
  const r2 = await ctx.service.createRecording(U1, b2.id, rec());
  await ctx.service.completeAttempt(U1, b2.id, { elapsedSeconds: 1 });
  ctx.storage.st.files.set(r2.path, 1000);
  advance(ctx, 16 * MIN);
  // Quá cửa sổ 15 phút: không tạo/cấp URL mới nhưng vẫn xác nhận được file đã nằm trên storage.
  assert.equal(await code(ctx.service.createRecording(U1, b2.id, rec())), '409:ATTEMPT_NOT_ACTIVE');
  assert.deepEqual(await ctx.service.confirmRecording(U1, b2.id, 'p1q1'), { status: 'UPLOADED' });
});

test('confirm không phụ thuộc deadline/ân hạn; create vẫn theo deadline + 120 giây', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  const { path } = await ctx.service.createRecording(U1, body.id, rec());
  ctx.storage.st.files.set(path, 1000);
  advance(ctx, 15 * MIN + 600_000);
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ questionId: 'late' }))), '409:ATTEMPT_TIME_EXPIRED');
  assert.deepEqual(await ctx.service.confirmRecording(U1, body.id, 'p1q1'), { status: 'UPLOADED' });
});

test('sau hoàn thành: Practice cũng chỉ tải nốt hàng PENDING, không ghi đè', async () => {
  const ctx = setup();
  const { body } = await ctx.service.createAttempt(U1, { clientAttemptId: CLIENT, examSkillId: SKILL, mode: 'PRACTICE', limitMinutes: null });
  await upload(ctx, body.id);
  const pend = await ctx.service.createRecording(U1, body.id, rec({ questionId: 'p1q2' }));
  await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 3 });
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec({ questionId: 'new' }))), '409:ATTEMPT_NOT_ACTIVE');
  assert.equal(await code(ctx.service.createRecording(U1, body.id, rec())), '409:ATTEMPT_NOT_ACTIVE');
  const again = await ctx.service.createRecording(U1, body.id, rec({ questionId: 'p1q2', size: 123 }));
  assert.equal(again.path, pend.path);
  assert.equal(ctx.storage.st.uploadCalls.at(-1).upsert, false);
});

test('tải về: URL ký ngắn hạn trong hạn; đủ 14 ngày trả 410; mở không đổi hạn', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await upload(ctx, body.id);
  const done = await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 10 });
  const t0 = ctx.clock.now;
  ctx.clock.now = new Date(t0.getTime() + 13 * DAY);
  const out = await ctx.service.getRecordingUrl(U1, body.id, 'p1q1');
  assert.match(out.url, /ttl=300$/);
  assert.equal(out.expiresAt, new Date(ctx.clock.now.getTime() + 300_000).toISOString());
  assert.equal((await ctx.service.getAttempt(U1, body.id)).contentExpiresAt, done.contentExpiresAt);
  ctx.clock.now = new Date(t0.getTime() + 14 * DAY);
  assert.equal(await code(ctx.service.getRecordingUrl(U1, body.id, 'p1q1')), '410:CONTENT_EXPIRED');
});

test('tải về: bản ghi chưa tải xong thì 404', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await ctx.service.createRecording(U1, body.id, rec());
  assert.equal(await code(ctx.service.getRecordingUrl(U1, body.id, 'p1q1')), '404:RECORDING_NOT_FOUND');
});

test('hủy bài: xóa file và hàng, idempotent; đã gửi chấm thì 409', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await upload(ctx, body.id);
  await ctx.service.deleteAttempt(U1, body.id);
  assert.equal(ctx.repo.s.attempts.size, 0);
  assert.deepEqual(ctx.storage.st.removed, [`speaking/${U1}/${body.id}/p1q1.webm`]);
  await ctx.service.deleteAttempt(U1, body.id);
  const b2 = (await ctx.service.createAttempt(U1, { clientAttemptId: CLIENT2, examSkillId: SKILL, mode: 'REAL', limitMinutes: null })).body;
  ctx.repo.s.gradingFor.add(b2.id);
  assert.equal(await code(ctx.service.deleteAttempt(U1, b2.id)), '409:ATTEMPT_ALREADY_SUBMITTED');
});

test('hủy bài: lượt đã COMPLETED trả 409 ATTEMPT_ALREADY_COMPLETED, không xóa gì', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await upload(ctx, body.id);
  await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 1 });
  assert.equal(await code(ctx.service.deleteAttempt(U1, body.id)), '409:ATTEMPT_ALREADY_COMPLETED');
  assert.equal(ctx.repo.s.attempts.size, 1);
  assert.deepEqual(ctx.storage.st.removed, []);
  await ctx.service.deleteAttempt(U2, body.id); // người khác vẫn không có tác dụng, không lỗi
});

test('gửi chấm là ranh giới: 501 GRADING_NOT_AVAILABLE, không đổi trạng thái', async () => {
  const ctx = setup();
  const { body } = await create(ctx.service);
  await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 1 });
  assert.equal(await code(ctx.service.requestGrading(U1, body.id)), '501:GRADING_NOT_AVAILABLE');
  assert.equal(ctx.repo.s.attempts.get(body.id).status, 'COMPLETED');
});

test('dọn dẹp: xóa lượt hết hạn, bỏ qua lượt còn hạn hoặc có yêu cầu chấm, lỗi storage thì thử lại', async () => {
  const ctx = setup();
  const mk = async (cid, grading) => {
    const { body } = await ctx.service.createAttempt(U1, { clientAttemptId: cid, examSkillId: SKILL, mode: 'REAL', limitMinutes: null });
    await upload(ctx, body.id);
    await ctx.service.completeAttempt(U1, body.id, { elapsedSeconds: 1 });
    if (grading) ctx.repo.s.gradingFor.add(body.id);
    return body.id;
  };
  const old = await mk('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
  const held = await mk('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', true);
  advance(ctx, 13 * DAY);
  const fresh = await mk('cccccccc-cccc-4ccc-8ccc-cccccccccccc', false);
  advance(ctx, 2 * DAY);
  const run = () => cleanupAttemptContent({ repo: ctx.repo, storage: ctx.storage, clock: () => ctx.clock.now });
  ctx.storage.st.failRemove = true;
  // DB đổi trước; xóa file lỗi thì đường dẫn còn nguyên để thử lại.
  assert.deepEqual(await run(), { expired: 1, abandoned: 0, retried: 0, failed: 1 });
  assert.equal(ctx.repo.s.attempts.get(old).contentStatus, 'DELETED');
  assert.ok(ctx.repo.s.recs.some((r) => r.skillAttemptId === old && r.audioPath));
  ctx.storage.st.failRemove = false;
  assert.deepEqual(await run(), { expired: 0, abandoned: 0, retried: 1, failed: 0 });
  assert.ok(ctx.repo.s.recs.filter((r) => r.skillAttemptId === old).every((r) => r.audioPath === null));
  assert.deepEqual(await run(), { expired: 0, abandoned: 0, retried: 0, failed: 0 });
  assert.equal(ctx.repo.s.attempts.get(held).contentStatus, 'AVAILABLE');
  assert.equal(ctx.repo.s.attempts.get(fresh).contentStatus, 'AVAILABLE');
  assert.equal(await code(ctx.service.getRecordingUrl(U1, old, 'p1q1')), '410:CONTENT_EXPIRED');
});

test('API từ chối yêu cầu chưa đăng nhập trước khi chạm DB', async () => {
  const { app } = await import('../dist/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/learner`;
    for (const [method, path] of [['GET', `/exam-skills/${SKILL}/speaking`], ['POST', '/skill-attempts'], ['GET', `/skill-attempts/${SKILL}`],
      ['POST', `/skill-attempts/${SKILL}/complete`], ['DELETE', `/skill-attempts/${SKILL}`], ['POST', `/skill-attempts/${SKILL}/grading-request`]]) {
      assert.equal((await fetch(base + path, { method })).status, 401, `${method} ${path}`);
    }
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
