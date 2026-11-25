import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const pgModule = process.env.SAMPLE_TEST_PGLITE_MODULE;
const day = 86_400_000;

test('W/S đã lưu: quyền, phạm vi, đếm phiên và chạy lại job dọn trên PostgreSQL', { skip: !pgModule, timeout: 30_000 }, async () => {
  Object.assign(process.env, {
    NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000', AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
    SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'test-key',
    DATABASE_URL: 'postgresql://unused:unused@localhost:1/unused',
  });
  const { PGlite } = await import(pathToFileURL(resolve(pgModule)).href);
  const { Prisma } = await import('@prisma/client');
  const { requireAuth } = await import('../dist/middleware/auth.js');
  const { createAttemptsRouter } = await import('../dist/modules/attempts/attempts.routes.js');
  const { createAttemptsRepository } = await import('../dist/modules/attempts/attempts.repository.js');
  const { cleanupAttemptContent } = await import('../dist/modules/attempts/attempts.service.js');
  const { startAttemptCleanupWorker } = await import('../dist/jobs/attempt-cleanup.js');
  const { readLearnerResults, readLearnerDashboard, readLearningProgress } = await import('../dist/modules/learner/study-overview.js');
  const db = new PGlite();
  let stop;
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key);');
    for (const file of ['01_tao_cau_truc_moi.sql', '14_learner_study_history.sql', '15_learner_activity.sql',
      '16_learner_checkins.sql', '26_speaking_attempts.sql']) {
      await db.exec(await readFile(new URL('../../docs/csdl/' + file, import.meta.url), 'utf8'));
    }
    function client(engine) {
      const exec = (template, ...values) => {
        const query = Array.isArray(template) ? Prisma.sql(template, ...values) : template;
        return engine.query(query.text, query.values);
      };
      return {
        $queryRaw: async (...args) => (await exec(...args)).rows,
        $executeRaw: async (...args) => (await exec(...args)).affectedRows,
      };
    }
    const owner = randomUUID(), other = randomUUID(), setId = randomUUID(), examId = randomUUID();
    const writing = randomUUID(), speaking = randomUUID(), reading = randomUUID();
    await db.query(`INSERT INTO public.users(id,full_name) VALUES ($1,'Chủ bài'),($2,'Người học khác')`, [owner, other]);
    await db.query(`INSERT INTO public.exam_sets(id,name,status,published_at) VALUES ($1,'WS test','PUBLISHED',now())`, [setId]);
    await db.query(`INSERT INTO public.exams(id,exam_set_id,title,order_no) VALUES ($1,$2,'Test 1',1)`, [examId, setId]);
    const skills = [[writing, 'WRITING', 'ACADEMIC', 2, 'TASK'],
      [speaking, 'SPEAKING', null, 3, 'PART'], [reading, 'READING', 'ACADEMIC', 1, 'PASSAGE']];
    for (const [id, skill, form, count, sectionType] of skills) {
      await db.query(`INSERT INTO public.exam_skills(id,exam_id,skill,form,version_number,status,duration_minutes,published_at)
        VALUES ($1,$2,$3,$4,1,'PUBLISHED',60,now())`, [id, examId, skill, form]);
      await db.query(`INSERT INTO public.exam_sections(exam_skill_id,title,section_type,order_no)
        SELECT $1,'Phần ' || n,$3,n FROM generate_series(1,$2::int) n`, [id, count, sectionType]);
    }
    const sql = { ...client(db), $transaction: fn => db.transaction(tx => fn(client(tx))), exam_skills: {
      // Chỉ mô phỏng Prisma relation adapter. CRUD lượt làm, lịch sử và job dùng SQL sản phẩm với schema thật.
      async findFirst({ where }) {
        const skill = skills.find(([id, name]) => id === where.id && name === where.skill);
        if (!skill) return null;
        const sections = (await db.query('SELECT * FROM public.exam_sections WHERE exam_skill_id=$1 ORDER BY order_no', [where.id])).rows;
        return { id: where.id, exam_id: examId, form: skill[2], exam: { title: 'Test 1' }, duration_minutes: 60, sections };
      },
    } };
    const repo = createAttemptsRepository(sql);
    let now = new Date();
    const files = new Set();
    let failDelete = false;
    const storage = {
      createUploadUrl: async path => `https://example.com/${path}`,
      statObject: async path => files.has(path) ? { size: 4 } : null,
      createDownloadUrl: async (path, ttl) => `https://example.com/${path}?ttl=${ttl}`,
      removeObjects: async paths => {
        if (failDelete && paths.length) throw new Error('Storage tạm thời không phản hồi');
        for (const path of paths) files.delete(path);
      },
    };
    const deps = { repo, storage, clock: () => now };
    const router = createAttemptsRouter(deps, sql);
    const invoke = (handler, req) => new Promise((done, reject) => {
      const res = { code: 200, status(n) { this.code = n; return this; }, json(body) { done({ status: this.code, body }); },
        end() { done({ status: this.code }); } };
      handler(req, res, reject);
    });
    await assert.rejects(invoke(requireAuth, { headers: {} }), { statusCode: 401 });
    const call = (suffix, method, { id, taskKey, questionId, body = {}, user = owner } = {}) => {
      const path = '/skill-attempts' + suffix;
      const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]).route;
      return invoke(route.stack.at(-1).handle, { params: { id, taskKey, questionId }, body, appUser: { id: user } });
    };
    const request = (examSkillId, sections) => ({ mode: 'PRACTICE', limitMinutes: null, clientAttemptId: randomUUID(), examSkillId, sections });
    const draft = request(writing, [2]);
    const requests = await Promise.all([call('', 'post', { body: draft }), call('', 'post', { body: draft })]);
    assert.deepEqual(requests.map(row => row.status).sort(), [200, 201]);
    const w = requests[0].body.id;
    assert.equal(requests[1].body.id, w);
    const text = 'Dòng 1 & <text>\n\nDòng 2';
    await call('/:id/writing/:taskKey', 'put', { id: w, taskKey: 'task2', body: { text } });
    assert.equal((await call('/:id/writing/:taskKey', 'get', { id: w, taskKey: 'task2' })).body.text, text);
    await assert.rejects(call('/:id/writing/:taskKey', 'put', { id: w, taskKey: 'task1', body: { text } }), { statusCode: 404 });
    const complete = id => call('/:id/complete', 'post', { id, body: { elapsedSeconds: 1 } });
    await Promise.all([complete(w), complete(w)]);
    const saved = user => call('/:id/writing', 'get', { id: w, user });
    assert.deepEqual((await saved(owner)).body, { sections: [2], tasks: [{ taskKey: 'task2', text }] });
    await db.query(`UPDATE public.submission_contents SET question_key='' WHERE skill_attempt_id=$1`, [w]);
    assert.deepEqual((await saved(owner)).body.tasks, [{ taskKey: 'task2', text }]);
    await assert.rejects(saved(other), { statusCode: 404 });
    const s = (await call('', 'post', { body: request(speaking, [3, 1]) })).body.id;
    const audio = { partIndex: 2, questionId: 'p3q0', mimeType: 'audio/webm', durationMs: 10, size: 4 };
    await assert.rejects(call('/:id/recordings', 'post', { id: s, body: { ...audio, partIndex: 1 } }), { code: 'INVALID_PART' });
    const upload = await call('/:id/recordings', 'post', { id: s, body: audio });
    files.add(upload.body.path);
    await call('/:id/recordings/:questionId/confirm', 'post', { id: s, questionId: audio.questionId });
    await complete(s);
    const url = user => call('/:id/recordings/:questionId/url', 'get', { id: s, questionId: audio.questionId, user });
    await assert.rejects(url(other), { statusCode: 404 });
    assert.equal((await url(owner)).status, 200);
    const history = () => readLearnerResults(sql, owner, { kind: 'all', group: 'WS' });
    assert.deepEqual((await history()).items.map(row => [row.skill, row.scope, row.sections]).sort(),
      [['SPEAKING', 'FULL_SKILL', [1, 3]], ['WRITING', 'FULL_SKILL', [2]]]);
    assert.equal((await readLearningProgress(sql, owner)).todaySessions, 2);
    assert.equal((await readLearningProgress(sql, owner)).currentStreak, 0);
    assert.deepEqual((await readLearnerDashboard(sql, owner, 7)).skills, { SPEAKING: 1, WRITING: 1 });

    const stale = (await call('', 'post', { body: request(speaking, [2]) })).body.id;
    const cancelled = (await call('', 'post', { body: request(speaking, [3]) })).body.id;
    const cancelledUpload = await call('/:id/recordings', 'post', { id: cancelled, body: audio });
    files.add(cancelledUpload.body.path);
    failDelete = true;
    assert.equal((await call('/:id', 'delete', { id: cancelled })).status, 204);
    assert.equal((await repo.getAttempt(cancelled)).status, 'ABANDONED');
    assert.ok(files.has(cancelledUpload.body.path));
    failDelete = false;
    const abandoned = (await call('', 'post', { body: request(writing, [1]) })).body.id;
    assert.equal((await call('/:id', 'delete', { id: abandoned })).status, 204);
    const lr = (await db.query(`INSERT INTO public.attempts(user_id,exam_id,attempt_type) VALUES ($1,$2,'FULL_SKILL') RETURNING id`, [owner, examId])).rows[0].id;
    await db.query('INSERT INTO public.skill_attempts(attempt_id,exam_skill_id,started_at) VALUES ($1,$2,$3)', [lr, reading, now]);
    await db.query(`UPDATE public.skill_attempts SET content_status='HELD' WHERE id=$1`, [w]);
    now = new Date(now.getTime() + 14 * day - 5_000);
    assert.match((await url(owner)).body.url, /\?ttl=5$/);
    now = new Date(now.getTime() + 5_000);
    await assert.rejects(url(owner), { statusCode: 410 });
    assert.equal((await saved(owner)).body.tasks[0].text, text);
    assert.equal((await call('/:id','get',{ id: w })).body.contentExpiresAt, null);
    const sweep = () => cleanupAttemptContent(deps);
    const runs = [];
    let keepAlive;
    try {
      await new Promise((done, reject) => {
        stop = startAttemptCleanupWorker(async () => {
          try {
            const result = await sweep();
            runs.push(result);
            if (runs.length === 2) done();
            return result;
          } catch (error) { reject(error); throw error; }
        }, 25);
        keepAlive = setTimeout(() => reject(new Error('Cleanup schedule did not run')), 3_000);
      });
    } finally { clearTimeout(keepAlive); }
    await stop();
    stop = undefined;
    assert.deepEqual(runs, [{ expired: 1, abandoned: 1, retried: 1, failed: 0 }, { expired: 0, abandoned: 0, retried: 0, failed: 0 }]);
    assert.equal(files.size, 0);
    assert.equal((await repo.getAttempt(stale)).status, 'ABANDONED');
    assert.equal((await db.query('SELECT status FROM public.attempts WHERE id=$1', [lr])).rows[0].status, 'IN_PROGRESS');
    await db.query(`UPDATE public.skill_attempts SET content_status='AVAILABLE',content_expires_at=initial_expires_at WHERE id=$1`, [w]);
    await assert.rejects(saved(owner), { statusCode: 410 });
    assert.equal((await sweep()).expired, 1);
    assert.equal((await history()).items.length, 2);
    assert.equal((await db.query('SELECT text_content FROM public.submission_contents WHERE skill_attempt_id=$1', [w])).rows[0].text_content, null);

    now = new Date();
    const real = (await call('', 'post', { body: { ...request(writing, [2]), mode: 'REAL' } })).body.id;
    assert.deepEqual((await repo.getAttempt(real)).sections, [1, 2]);
    await complete(real);
    assert.equal((await readLearningProgress(sql, owner)).todaySessions, 3);
    assert.deepEqual((await readLearnerDashboard(sql, owner, 7)).skills, { SPEAKING: 1, WRITING: 2 });
  } finally {
    await stop?.();
    await db.close();
  }
});
