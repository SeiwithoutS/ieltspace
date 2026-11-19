import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const pgModule = process.env.SAMPLE_TEST_PGLITE_MODULE;

test('Study goals, Flashcard sessions and check-ins persist with independent progress and streaks', { skip: !pgModule }, async () => {
  Object.assign(process.env, {
    NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000', AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
    SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'test-key',
    DATABASE_URL: 'postgresql://unused:unused@localhost:1/unused',
  });
  const { PGlite } = await import(pathToFileURL(resolve(pgModule)).href);
  const { Prisma } = await import('@prisma/client');
  const { requireAuth, requireRole } = await import('../dist/middleware/auth.js');
  const { createLearnerStudyRouter } = await import('../dist/modules/learner/study.routes.js');
  const { summarizeCheckInDays } = await import('../dist/modules/learner/study-overview.js');
  const db = new PGlite();
  try {
    const baseline = await readFile(new URL('../../docs/csdl/01_tao_cau_truc_moi.sql', import.meta.url), 'utf8');
    const tables = ['study_goals', 'flashcard_sessions', 'flashcard_session_items', 'system_settings', 'learning_activities'];
    const definitions = tables.map(name => baseline.match(new RegExp(`create table public\\.${name} \\([\\s\\S]*?\\r?\\n\\);`, 'i'))?.[0]);
    assert.ok(definitions.every(Boolean));
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
      CREATE TABLE public.users (id uuid primary key, role text default 'LEARNER', status text default 'ACTIVE');
      CREATE TABLE public.vocabularies (id uuid primary key);
      CREATE TABLE public.vocabulary_sets (id uuid primary key, name text);
      CREATE TABLE public.exam_sets (id uuid primary key, name text);
      CREATE TABLE public.exams (id uuid primary key, exam_set_id uuid, title text);
      CREATE TABLE public.exam_skills (id uuid primary key, exam_id uuid, skill text, form text);
      CREATE TABLE public.attempts (id uuid primary key, user_id uuid, exam_id uuid, attempt_type text, status text, completed_at timestamptz);
      CREATE TABLE public.skill_attempts (id uuid primary key, attempt_id uuid, exam_skill_id uuid, status text, completed_at timestamptz,
        section_id uuid, question_group_id uuid, band_score numeric, accuracy numeric, correct_count int, total_questions int);
      CREATE TABLE public.grading_requests (id uuid primary key, skill_attempt_id uuid, status text);
      CREATE TABLE public.grading_reviews (grading_request_id uuid, status text, published_at timestamptz);
      ${definitions.join('\n')}`);
    await db.exec(await readFile(new URL('../../docs/csdl/14_learner_study_history.sql', import.meta.url), 'utf8'));
    const activityMigration = await readFile(new URL('../../docs/csdl/15_learner_activity.sql', import.meta.url), 'utf8');
    await db.exec(activityMigration);
    await db.exec(await readFile(new URL('../../docs/csdl/16_learner_checkins.sql', import.meta.url), 'utf8'));
    function client(engine) {
      const execute = (template, ...values) => {
        const query = Array.isArray(template) ? Prisma.sql(template, ...values) : template;
        return engine.query(query.text, query.values);
      };
      return {
        $queryRaw: async (...args) => (await execute(...args)).rows,
        $executeRaw: async (...args) => (await execute(...args)).affectedRows,
      };
    }
    const router = createLearnerStudyRouter({ ...client(db), $transaction: fn => db.transaction(tx => fn(client(tx))) });
    assert.ok(router.stack.some(layer => layer.handle === requireAuth));
    const invoke = (handler, options) => new Promise((resolve, reject) => {
      const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { resolve({ code: this.code, body }); } };
      handler(options, res, reject);
    });
    await assert.rejects(invoke(requireAuth, { headers: {} }), { code: 'UNAUTHENTICATED' });
    await assert.rejects(invoke(requireRole('LEARNER'), { appUser: { role: 'TEACHER' } }), { code: 'FORBIDDEN' });
    const learner = randomUUID();
    const other = randomUUID();
    const word1 = randomUUID();
    const word2 = randomUUID();
    await db.query('INSERT INTO public.users(id) VALUES ($1),($2)', [learner, other]);
    await db.query('INSERT INTO public.vocabularies(id) VALUES ($1),($2)', [word1, word2]);

    const call = (path, method = 'get', body = {}, owner = learner, query = {}) => {
      const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]).route;
      return invoke(route.stack.at(-1).handle, { body, query, appUser: { id: owner } });
    };
    const goal = { overall: 7.5, listening: 8, reading: 0, writing: null, speaking: 6.5, dailySessions: 2 };
    assert.equal((await call('/goals')).body.current, null);
    await assert.rejects(call('/goals', 'post', { ...goal, overall: 7.2 }), { code: 'INVALID_GOAL' });
    const first = (await call('/goals', 'post', goal)).body.current;
    assert.equal(first.reading, 0);
    assert.equal(first.id, (await call('/goals', 'post', goal)).body.current.id);
    const second = (await call('/goals', 'post', { ...goal, dailySessions: 3 })).body.current;
    assert.ok(second.effectiveFrom >= first.effectiveFrom);
    assert.deepEqual((await call('/goals')).body.history.map(row => row.id), [second.id, first.id]);
    assert.equal((await call('/goals', 'get', {}, other)).body.current, null);

    const result = { id: randomUUID(), ownerId: learner, title: 'Ôn từ', finishedAt: Date.now() - 60_000, elapsedSeconds: 26, reason: 'stopped',
      source: { type: 'REVIEW' }, cardIds: [word1, word2], reviews: [{ wordId: word1, remembered: false }] };
    await assert.rejects(call('/flashcards', 'post', result, other), { code: 'SESSION_OWNER_MISMATCH' });
    await assert.rejects(call('/flashcards', 'post', { ...result, cardIds: [word1, word1] }), { code: 'INVALID_FLASHCARD_SESSION' });
    await assert.rejects(call('/flashcards', 'post', { ...result, cardIds: [word1, randomUUID()] }), { code: 'UNKNOWN_FLASHCARD' });
    const [created, duplicate] = await Promise.all([call('/flashcards', 'post', result), call('/flashcards', 'post', result)]);
    assert.deepEqual([created.code, duplicate.code].sort(), [200, 201]);
    assert.equal((await call('/flashcards', 'get', {}, other)).body.stats.sessions, 0);
    await assert.rejects(call('/flashcards', 'post', { ...result, ownerId: other }, other), { code: 'SESSION_CONFLICT' });
    assert.deepEqual((await call('/flashcards')).body.stats, { sessions: 1, reviewedWords: 1, forgottenIds: [word1] });
    assert.deepEqual((await db.query('SELECT is_qualified FROM public.flashcard_sessions')).rows, [{ is_qualified: false }]);
    const newer = { ...result, id: randomUUID(), finishedAt: result.finishedAt + 30_000, reason: 'completed',
      reviews: [{ wordId: word1, remembered: true }, { wordId: word2, remembered: false }] };
    assert.equal((await call('/flashcards', 'post', newer)).code, 201);
    const history = (await call('/flashcards')).body;
    assert.deepEqual(history.stats, { sessions: 2, reviewedWords: 2, forgottenIds: [word2] });
    assert.deepEqual(history.items.map(row => row.id), [newer.id, result.id]);
    assert.equal(history.items[0].elapsedSeconds, 26);
    assert.deepEqual((await call('/flashcards', 'get', {}, learner, { before: newer.id })).body.items.map(row => row.id), [result.id]);
    assert.deepEqual((await db.query('SELECT is_qualified FROM public.flashcard_sessions WHERE id=$1', [newer.id])).rows, [{ is_qualified: true }]);
    assert.deepEqual((await db.query('SELECT flashcard_session_id FROM public.learning_activities')).rows, [{ flashcard_session_id: newer.id }]);

    const thresholdWords = Array.from({ length: 11 }, () => randomUUID());
    await db.query('INSERT INTO public.vocabularies(id) SELECT unnest($1::uuid[])', [thresholdWords]);
    const tenReviews = { ...result, id: randomUUID(), cardIds: thresholdWords, finishedAt: Date.now() - 5000,
      reviews: thresholdWords.slice(0, 10).map(wordId => ({ wordId, remembered: true })) };
    assert.equal((await call('/flashcards', 'post', tenReviews)).code, 201);
    assert.equal((await call('/flashcards', 'post', tenReviews)).code, 200);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.learning_activities')).rows[0].n, 2);

    const atMidnight = ['2025-12-31T16:59:59.999Z', '2025-12-31T17:00:00Z'];
    const historicalIds = [randomUUID(), randomUUID()];
    for (const [index, completedAt] of atMidnight.entries()) {
      await db.query(`INSERT INTO public.flashcard_sessions
        (id,user_id,source_type,total_cards,minimum_cards,reviewed_count,status,is_qualified,started_at,completed_at)
        VALUES ($1,$2,'REVIEW',1,1,1,'COMPLETED',true,$3,$3)`, [historicalIds[index], learner, completedAt]);
    }
    await db.exec(activityMigration);
    await db.exec(activityMigration);
    assert.deepEqual((await db.query(`SELECT activity_date::text AS day FROM public.learning_activities
      WHERE flashcard_session_id=ANY($1::uuid[]) ORDER BY day`, [historicalIds])).rows, [{ day: '2025-12-31' }, { day: '2026-01-01' }]);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.learning_activities')).rows[0].n, 4);
    await db.query(`INSERT INTO public.learner_checkins (user_id,checked_in_at) VALUES ($1,$2),($1,$3)`, [learner, ...atMidnight]);
    assert.deepEqual((await db.query('SELECT checkin_date::text AS day FROM public.learner_checkins ORDER BY day')).rows,
      [{ day: '2025-12-31' }, { day: '2026-01-01' }]);
    const priorWeek = ['2026-01-01', '2026-01-02', '2026-01-02', '2026-01-03'];
    const sunday = summarizeCheckInDays('2026-01-04', [...priorWeek, '2026-01-07']);
    assert.equal(sunday.currentStreak, 3);
    assert.equal(sunday.checkedInToday, false);
    assert.deepEqual(sunday.checkInDays.map(day => day.checkedIn), [false, false, false, true, true, true, false]);
    const missed = summarizeCheckInDays('2026-01-05', priorWeek);
    assert.equal(missed.longestStreak, 3);
    assert.equal(missed.currentStreak, 0);
    assert.equal(missed.checkInDays[0].date, '2026-01-05');

    const examSet = randomUUID();
    const exam = randomUUID();
    const listening = randomUUID();
    const writing = randomUUID();
    await db.query(`INSERT INTO public.exam_sets VALUES ($1,'Bộ đề thử')`, [examSet]);
    await db.query(`INSERT INTO public.exams VALUES ($1,$2,'Test 1')`, [exam, examSet]);
    await db.query(`INSERT INTO public.exam_skills VALUES ($1,$2,'LISTENING',null),($3,$2,'WRITING','ACADEMIC')`, [listening, exam, writing]);
    const saveScore = async (owner, skillId, scope, status, band, accuracy) => {
      const attempt = randomUUID();
      const score = randomUUID();
      await db.query(`INSERT INTO public.attempts VALUES ($1,$2,$3,$4,$5,now())`, [attempt, owner, exam, scope, status]);
      await db.query(`INSERT INTO public.skill_attempts (id,attempt_id,exam_skill_id,status,completed_at,band_score,accuracy)
        VALUES ($1,$2,$3,'COMPLETED',now(),$4,$5)`, [score, attempt, skillId, band, accuracy]);
      return score;
    };
    const bandId = await saveScore(learner, listening, 'FULL_SKILL', 'COMPLETED', 0, 20);
    const practiceId = await saveScore(learner, listening, 'SECTION', 'COMPLETED', 8, 75);
    const writingId = await saveScore(learner, writing, 'FULL_SKILL', 'COMPLETED', 7.5, null);
    await saveScore(learner, listening, 'FULL_SKILL', 'IN_PROGRESS', 9, null);
    await saveScore(other, listening, 'FULL_SKILL', 'COMPLETED', 8, null);
    const results = (await call('/results', 'get', {}, learner)).body.items;
    assert.deepEqual(new Set(results.map(item => item.id)), new Set([bandId, practiceId]));
    assert.deepEqual(results.find(item => item.id === bandId), {
      id: bandId, title: 'Bộ đề thử · Test 1', completedAt: results.find(item => item.id === bandId).completedAt,
      skill: 'LISTENING', form: null, scope: 'FULL_SKILL', band: 0, accuracy: null, correct: null, total: null,
    });
    assert.equal(results.find(item => item.id === practiceId).band, null);
    const request = randomUUID();
    await db.query(`INSERT INTO public.grading_requests VALUES ($1,$2,'COMPLETED')`, [request, writingId]);
    await db.query(`INSERT INTO public.grading_reviews VALUES ($1,'PUBLISHED',now())`, [request]);
    const writingResults = (await call('/results', 'get', {}, learner, { kind: 'band', skill: 'WRITING' })).body.items;
    assert.deepEqual(writingResults.map(row => row.band), [7.5]);
    assert.equal((await call('/results', 'get', {}, learner, { kind: 'practice' })).body.items[0].accuracy, 75);
    const paged = (await call('/results', 'get', {}, learner, { limit: '1' })).body;
    assert.equal(paged.nextCursor, paged.items[0].id);
    assert.notEqual((await call('/results', 'get', {}, learner, { before: paged.nextCursor, limit: '1' })).body.items[0].id, paged.nextCursor);
    const progress = (await call('/progress')).body;
    assert.equal(progress.goal.overall, 7.5);
    assert.equal(progress.goal.dailySessions, 3);
    assert.equal(progress.flashcards.sessions, 5);
    assert.equal(progress.flashcards.reviewedWords, 12);
    assert.equal(progress.flashcards.forgottenWords, 1);
    assert.ok(progress.todaySessions >= 3 && progress.todaySessions <= 5);
    assert.equal(progress.currentStreak, 0);
    assert.equal(progress.longestStreak, 2);
    assert.equal(progress.checkedInToday, false);
    await assert.rejects(call('/check-in', 'post', { ownerId: learner }, other), { code: 'CHECK_IN_OWNER_MISMATCH' });
    const checkins = await Promise.all([call('/check-in', 'post', { ownerId: learner }), call('/check-in', 'post', { ownerId: learner })]);
    for (const { body } of checkins) {
      assert.equal(body.checkedInToday, true);
      assert.equal(body.currentStreak, 1);
      assert.equal(body.todaySessions, progress.todaySessions);
      assert.deepEqual(body.checkInDays.find(day => day.date === body.today), { date: body.today, checkedIn: true });
    }
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.learner_checkins WHERE user_id=$1 AND checkin_date=$2',
      [learner, checkins[0].body.today])).rows[0].n, 1);
    const otherProgress = (await call('/progress', 'get', {}, other)).body;
    assert.equal(otherProgress.todaySessions, 1);
    assert.equal(otherProgress.checkedInToday, false);
  } finally {
    await db.close();
  }
});
