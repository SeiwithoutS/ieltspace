import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const pgModule = process.env.SAMPLE_TEST_PGLITE_MODULE;
const day = 86_400_000;

test('CREDIT-01, GRADE-01/02/03, SPK-11, USER-01, NOTIF-01 trên PostgreSQL cô lập', { skip: !pgModule, timeout: 45_000 }, async () => {
  Object.assign(process.env, {
    NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000', AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
    SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'test-key',
    DATABASE_URL: 'postgresql://unused:unused@localhost:1/unused',
  });
  const { PGlite } = await import(pathToFileURL(resolve(pgModule)).href);
  const { Prisma } = await import('@prisma/client');
  const { createGradingService } = await import('../dist/modules/grading/grading.service.js');
  const { createReviewService } = await import('../dist/modules/grading/review.service.js');
  const { reviewInput } = await import('../dist/modules/grading/review-rubric.js');
  const { createGradingRouter } = await import('../dist/modules/grading/grading.routes.js');
  const { runGradingDispatch } = await import('../dist/jobs/grading-dispatch.js');
  const { createAttemptsRouter } = await import('../dist/modules/attempts/attempts.routes.js');
  const { getTeacherOverview, listGradingRequests, listTeacherHistory, listTeacherLoads, listTeacherQueue } = await import('../dist/modules/grading/grading.queries.js');
  const { dispatchPendingGradingNotifications, dispatchExpiryReminders, readGradingNotificationTarget } = await import('../dist/modules/notifications/grading-notifications.js');
  const { createAttemptsRepository } = await import('../dist/modules/attempts/attempts.repository.js');
  const { cleanupAttemptContent } = await import('../dist/modules/attempts/attempts.service.js');
  const db = new PGlite();
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid primary key);');
    for (const file of ['01_tao_cau_truc_moi.sql', '05_danh_muc_bo_de.sql', '06_quy_tac_cham_ws.sql',
      '14_learner_study_history.sql', '15_learner_activity.sql', '16_learner_checkins.sql',
      '18_ma_bao_mat_quan_tri.sql', '20_account_deletion.sql', '21_notifications_support_reports.sql',
      '23_announcements_and_notification_settings.sql', '26_speaking_attempts.sql']) {
      await db.exec(await readFile(new URL('../../docs/csdl/' + file, import.meta.url), 'utf8'));
    }
    // Hàm xóa chỉ dùng user_id của bảng mời nhân sự cũ.
    await db.exec('CREATE TABLE public.staff_invitations(user_id uuid);');
    function client(engine) {
      const exec = (template, ...values) => {
        const query = Array.isArray(template) ? Prisma.sql(template, ...values) : template;
        return engine.query(query.text, query.values);
      };
      return {
        $queryRaw: async (...args) => (await exec(...args)).rows,
        $executeRaw: async (...args) => (await exec(...args)).affectedRows,
        audit_logs: { create: ({ data }) => engine.query(`INSERT INTO public.audit_logs
          (actor_id,actor_type,action,entity_type,entity_id,change_data,reason) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [data.actor_id, data.actor_type, data.action, data.entity_type, data.entity_id, JSON.stringify(data.change_data), data.reason]) },
      };
    }
    const sql = { ...client(db), $transaction: fn => db.transaction(tx => fn(client(tx))) };
    let now = new Date('2026-11-29T16:59:59Z');
    const grading = createGradingService(sql, () => now);
    const workerTwo = createGradingService(sql, () => now);
    const user = async (name, role = 'LEARNER') => (await db.query('INSERT INTO public.users(full_name,role) VALUES ($1,$2) RETURNING id', [name, role])).rows[0].id;
    const [alice, bob, chi, dan, teacher1, teacher2, admin] = await Promise.all([
      user('Alice'), user('Bob'), user('Chi'), user('Dan'), user('GV 1', 'TEACHER'), user('GV 2', 'TEACHER'), user('QL', 'ADMIN'),
    ]);
    const set = (await db.query(`INSERT INTO public.exam_sets(name,status,published_at,category_id)
      SELECT 'Book','PUBLISHED',now(),id FROM public.exam_set_categories WHERE code='PRACTICE_TEST' RETURNING id`)).rows[0].id;
    const exam = (await db.query(`INSERT INTO public.exams(exam_set_id,title,order_no) VALUES ($1,'Test 1',1) RETURNING id`, [set])).rows[0].id;
    const slots = {};
    for (const [skill, form, sectionType] of [['WRITING', 'ACADEMIC', 'TASK'], ['SPEAKING', null, 'PART']]) {
      const id = (await db.query(`INSERT INTO public.exam_skills(exam_id,skill,form,version_number,status,duration_minutes,published_at)
        VALUES ($1,$2,$3,1,'PUBLISHED',60,now()) RETURNING id`, [exam, skill, form])).rows[0].id;
      const sections = (await db.query(`INSERT INTO public.exam_sections(exam_skill_id,title,section_type,order_no,content)
        SELECT $1,'Phần ' || number,$2,number,jsonb_build_object('prompt','Đề thử ' || number)
        FROM generate_series(1,$3::int) number RETURNING id,order_no`, [id, sectionType, skill === 'WRITING' ? 2 : 3])).rows;
      slots[skill] = { id, sections };
    }
    async function attempt(owner, { skill = 'WRITING', status = 'COMPLETED', content = 'ready', expiry = new Date(+now + 14 * day), scope = [1] } = {}) {
      const parent = (await db.query(`INSERT INTO public.attempts(user_id,exam_id,attempt_type,status,completed_at,selected_scope)
        VALUES ($1,$2,'FULL_SKILL',$3,$4,$5::jsonb) RETURNING id`, [owner, exam, status, now, JSON.stringify({ wsSections: scope })])).rows[0].id;
      const id = (await db.query(`INSERT INTO public.skill_attempts(attempt_id,exam_skill_id,status,completed_at,initial_expires_at,content_expires_at)
        VALUES ($1,$2,$3,$4,$5,$5) RETURNING id`, [parent, slots[skill].id, status, now, expiry])).rows[0].id;
      if (content !== 'none') for (const number of scope) await db.query(`INSERT INTO public.submission_contents
        (skill_attempt_id,section_id,question_key,text_content,recording_status,audio_path) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, slots[skill].sections.find(row => row.order_no === number).id, skill === 'WRITING' ? `task${number}` : `p${number}q0`,
        skill === 'WRITING' ? 'Bài viết thử' : null, skill === 'WRITING' ? null : content === 'pending' ? 'PENDING' : 'UPLOADED',
        skill === 'WRITING' ? null : `speaking/${id}/p${number}q0.webm`]);
      return id;
    }
    const bonus = async (owner, expires) => (await db.query(`INSERT INTO public.support_credits(user_id,credit_type,valid_from,expires_at)
      VALUES ($1,'BONUS',$2,$3) RETURNING id`, [owner, new Date(+now - day), expires])).rows[0].id;
    const used = async id => (await db.query('SELECT used_credit_id FROM public.grading_requests WHERE id=$1', [id])).rows[0].used_credit_id;
    const monday = new Date('2026-11-29T17:00:00Z');
    const early = await bonus(alice, new Date(+monday - 100));
    const equal = await bonus(alice, monday);
    const body = await attempt(alice);
    const r = await Promise.all([grading.submit(alice, body), workerTwo.submit(alice, body)]);
    assert.deepEqual(r.map(item => item.created).sort(), [false, true]);
    assert.equal(r[0].request.id, r[1].request.id);
    assert.equal(await used(r[0].request.id), early);
    now = new Date(+now + 100);
    const second = await grading.submit(alice, await attempt(alice, { skill: 'SPEAKING' }));
    const credit = (await db.query('SELECT credit_type FROM public.support_credits WHERE id=$1', [await used(second.request.id)])).rows[0];
    assert.equal(credit.credit_type, 'FREE_WEEKLY');
    now = new Date(+now + 100);
    assert.equal(await used((await grading.submit(alice, await attempt(alice))).request.id), equal);
    await assert.rejects(grading.submit(alice, await attempt(alice)), { code: 'NO_GRADING_CREDIT' });
    assert.equal((await grading.balance(alice)).free.count, 0);
    now = monday;
    assert.deepEqual((await grading.balance(alice)).free, { count: 1, expiresAt: new Date(+monday + 7 * day) });

    const pending = await attempt(bob, { skill: 'SPEAKING', content: 'pending' });
    await assert.rejects(grading.submit(bob, pending), { code: 'RECORDINGS_PENDING' });
    await assert.rejects(grading.submit(bob, await attempt(bob, { content: 'none' })), { code: 'GRADING_CONTENT_MISSING' });
    await assert.rejects(grading.submit(bob, await attempt(bob, { status: 'IN_PROGRESS' })), { code: 'ATTEMPT_NOT_COMPLETED' });
    await assert.rejects(grading.submit(bob, await attempt(bob, { expiry: now })), { statusCode: 410 });
    await assert.rejects(grading.submit(bob, body), { statusCode: 404 });
    assert.equal((await grading.balance(bob)).free.count, 1);
    await db.query(`UPDATE public.submission_contents SET recording_status='UPLOADED' WHERE skill_attempt_id=$1`, [pending]);
    await db.exec(`CREATE FUNCTION fail_grading_insert() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'test rollback after debit'; END $$;
      CREATE TRIGGER fail_grading_insert BEFORE INSERT ON public.grading_requests FOR EACH ROW EXECUTE FUNCTION fail_grading_insert();`);
    await assert.rejects(grading.submit(bob, pending), /test rollback after debit/);
    assert.equal((await grading.balance(bob)).free.count, 1);
    const beforeSubmit = (await db.query('SELECT content_status FROM public.skill_attempts WHERE id=$1', [pending])).rows[0];
    assert.equal(beforeSubmit.content_status, 'AVAILABLE');
    await db.exec('DROP TRIGGER fail_grading_insert ON public.grading_requests; DROP FUNCTION fail_grading_insert();');
    const router = createAttemptsRouter({ clock: () => now }, sql);
    const send = () => new Promise((resolve, reject) => {
      router.stack.find(layer => layer.route?.path === '/skill-attempts/:id/grading-request' && layer.route.methods.post)
        .route.stack.at(-1).handle({ params: { id: pending }, body: {}, appUser: { id: bob } },
          { code: 200, status(code) { this.code = code; return this; }, json(request) { resolve({ code: this.code, request }); } }, reject);
    });
    const sent = await send();
    assert.equal(sent.code, 201);
    assert.equal((await send()).code, 200);

    // Đầu hàng đợi là Speaking, nhưng hiện chỉ Writing có giáo viên phù hợp.
    await db.query(`UPDATE public.grading_requests SET requested_at=requested_at - interval '1 second',
      assignment_deadline=assignment_deadline - interval '1 second' WHERE id=$1`, [second.request.id]);
    // Với hai yêu cầu cùng kỹ năng, chỉ một worker được dùng chỗ trống duy nhất.
    await grading.savePermission(admin, teacher1, 'WRITING', { canGrade: true, isAccepting: false, maxPending: 1 });
    await grading.savePermission(admin, teacher2, 'WRITING', { canGrade: true, isAccepting: true, maxPending: 5 });
    await db.query(`UPDATE public.users SET status='LOCKED' WHERE id=$1`, [teacher2]);
    assert.equal(await grading.assignNext(), false, 'Có quyền nhưng tắt nhận bài mới thì bài vẫn chờ');
    assert.equal((await grading.requestStatus(alice, body)).status, 'WAITING_ASSIGNMENT');
    await grading.savePermission(admin, teacher1, 'WRITING', { canGrade: true, isAccepting: true, maxPending: 1 });
    assert.deepEqual((await Promise.all([grading.assignNext(), workerTwo.assignNext()])).sort(), [false, true]);
    const [assigned] = (await listGradingRequests(sql, { teacherId: teacher1, status: 'ASSIGNED', page: 1 })).items;
    assert.equal(assigned.skill, 'WRITING');
    assert.equal(assigned.id, r[0].request.id);
    assert.equal((await listGradingRequests(sql, { teacherId: teacher2, status: 'ASSIGNED', page: 1 })).items.length, 0);
    await grading.savePermission(admin, teacher1, 'SPEAKING', { canGrade: true, isAccepting: true, maxPending: 1 });
    assert.equal(await grading.assignNext(), true);
    assert.equal((await listGradingRequests(sql, { teacherId: teacher1, status: 'ASSIGNED', page: 1 })).items.length, 2);
    const revoked = await grading.savePermission(admin, teacher1, 'WRITING', { canGrade: false, isAccepting: false, maxPending: 0 });
    assert.equal(revoked.status, 'PENDING_REVOKE');
    assert.equal(revoked.assigned, 1);
    assert.equal(await grading.assignNext(), false);
    await assert.rejects(grading.cancelAssigned(alice, teacher1, assigned.id, 'Không tiếp tục được'), { statusCode: 403 });
    await assert.rejects(grading.cancelAssigned(admin, teacher2, assigned.id, 'Không tiếp tục được'), { statusCode: 404 });
    const cancel = () => grading.cancelAssigned(admin, teacher1, assigned.id, 'Không thể tiếp tục ca chấm');
    await Promise.all([cancel(), cancel()]);
    const [refunded] = (await db.query(`SELECT count(*)::int AS total FROM public.credit_refunds WHERE grading_request_id=$1`, [assigned.id])).rows;
    assert.equal(refunded.total, 1);
    const teacherData = (await listTeacherLoads(sql, teacher1)).items;
    assert.equal(teacherData.find(item => item.skill === 'WRITING').status, 'REVOKED');
    assert.equal(teacherData.find(item => item.skill === 'SPEAKING').assigned, 1);
    const cancelledAdminRow = (await listGradingRequests(sql, { status: 'CANCELLED', page: 1 })).items.find(item => item.id === assigned.id);
    assert.equal(cancelledAdminRow.cancelReason, 'TEACHER_UNAVAILABLE');
    assert.ok(cancelledAdminRow.bonusExpiresAt);
    const audit = (await db.query(`SELECT action,reason,change_data FROM public.audit_logs WHERE entity_id=$1 AND actor_id=$2`, [teacher1, admin])).rows;
    assert.ok(audit.some(item => item.action === 'GRADING_PERMISSION_CHANGED'));
    assert.deepEqual(audit.filter(item => item.action === 'GRADING_TEACHER_UNAVAILABLE').map(item => [item.reason,item.change_data.requestId]),
      [['Không thể tiếp tục ca chấm', assigned.id]]);
    const saved = (await db.query(`SELECT content_status,content_expires_at=initial_expires_at AS original FROM public.skill_attempts
      WHERE id=(SELECT skill_attempt_id FROM public.grading_requests WHERE id=$1)`, [assigned.id])).rows[0];
    assert.deepEqual(saved, { content_status: 'AVAILABLE', original: true });
    const oldAttempt = (await db.query('SELECT skill_attempt_id AS id FROM public.grading_requests WHERE id=$1', [assigned.id])).rows[0].id;
    assert.equal((await grading.submit(alice, oldAttempt)).request.id, assigned.id);
    const resend = await grading.submit(alice, oldAttempt, assigned.id);
    assert.equal(resend.created, true);
    assert.notEqual(resend.request.id, assigned.id);
    assert.equal((await grading.submit(alice, oldAttempt, assigned.id)).request.id, resend.request.id);

    const chiAttempt = await attempt(chi, { skill: 'SPEAKING' });
    const waiting = await grading.submit(chi, chiAttempt);
    const deletedRequest = await grading.submit(dan, await attempt(dan));
    await db.query('SELECT public.ieltspace_stage_account_deletion($1,$2)', [dan, admin]);
    now = new Date(+waiting.request.assignmentDeadline - 1);
    while (await grading.expireNext()) { /* Dọn các yêu cầu cũ hơn. */ }
    assert.equal((await grading.requestStatus(chi, chiAttempt)).status, 'WAITING_ASSIGNMENT');
    now = waiting.request.assignmentDeadline;
    assert.equal(await grading.assignNext(), false);
    await Promise.all([runGradingDispatch(grading), runGradingDispatch(workerTwo)]);
    assert.equal((await grading.requestStatus(chi, chiAttempt)).cancelReason, 'ASSIGNMENT_TIMEOUT');
    const query = `SELECT g.status,g.cancel_reason AS reason,c.expires_at AS "expiresAt" FROM public.grading_requests g
      LEFT JOIN public.credit_refunds r ON r.grading_request_id=g.id LEFT JOIN public.support_credits c ON c.id=r.bonus_credit_id WHERE g.id=$1`;
    const chiRefund = (await db.query(query, [waiting.request.id])).rows[0];
    assert.deepEqual(chiRefund, { status: 'CANCELLED', reason: 'ASSIGNMENT_TIMEOUT', expiresAt: new Date(+monday + 14 * day) });
    assert.deepEqual((await db.query(query, [deletedRequest.request.id])).rows[0], { status: 'CANCELLED', reason: 'LEARNER_DELETED', expiresAt: null });
    assert.equal((await listGradingRequests(sql, { teacherId: teacher1, status: 'ASSIGNED', page: 1 })).items.length, 1);
    await dispatchPendingGradingNotifications(sql);
    const notificationCount = async () => (await db.query(`SELECT count(*)::int AS total FROM public.notifications WHERE event_key LIKE 'grading:%'`)).rows[0].total;
    const total = await notificationCount();
    assert.ok(total > 0);
    await dispatchPendingGradingNotifications(sql);
    assert.equal(await notificationCount(), total);

    await db.query(`UPDATE public.users SET status='ACTIVE' WHERE id=$1`, [teacher2]);
    await grading.savePermission(admin, teacher1, 'SPEAKING', { canGrade: true, isAccepting: true, maxPending: 3 });
    await grading.savePermission(admin, teacher2, 'SPEAKING', { canGrade: true, isAccepting: true, maxPending: 3 });
    const smallerLoad = await grading.submit(chi, await attempt(chi, { skill: 'SPEAKING' }));
    assert.equal(await grading.assignNext(), true);
    const their = (await listGradingRequests(sql, { teacherId: teacher2, status: 'ASSIGNED', page: 1 })).items;
    assert.equal(their[0].id, smallerLoad.request.id);
    const longestWaitingTeacher = await grading.submit(bob, await attempt(bob, { skill: 'SPEAKING' }));
    assert.equal(await grading.assignNext(), true);
    const firstTeacher = (await listGradingRequests(sql, { teacherId: teacher1, status: 'ASSIGNED', page: 1 })).items;
    assert.ok(firstTeacher.some(item => item.id === longestWaitingTeacher.request.id));

    await db.query(`UPDATE public.grading_requests SET status='COMPLETED' WHERE id=$1`, [second.request.id]);
    await assert.rejects(grading.submit(alice, second.request.attemptId), { code: 'GRADING_ALREADY_GRADED' });

    const storage = {
      createDownloadUrl: async (path, seconds) => `${path}?ttl=${seconds}`, removeObjects: async () => {},
    };
    const reviews = createReviewService(sql, storage, () => now);
    const [writer, speaker, racer] = await Promise.all([user('Writer'), user('Speaker'), user('Racer')]);
    await grading.savePermission(admin, teacher1, 'WRITING', { canGrade: true, isAccepting: true, maxPending: 1 });
    await grading.savePermission(admin, teacher2, 'WRITING', { canGrade: false, isAccepting: false, maxPending: 0 });
    await grading.savePermission(admin, teacher2, 'SPEAKING', { canGrade: false, isAccepting: false, maxPending: 0 });
    await grading.savePermission(admin, teacher1, 'SPEAKING', { canGrade: true, isAccepting: true, maxPending: 8 });
    const writingId = await attempt(writer, { scope: [1, 2] });
    const writingRequest = (await grading.submit(writer, writingId)).request.id;
    const partialId = await attempt(speaker, { skill: 'SPEAKING', scope: [1, 3] });
    const partialRequest = (await grading.submit(speaker, partialId)).request.id;
    while (await grading.assignNext()) { /* Nhận các yêu cầu có giáo viên phù hợp. */ }
    const writing = await reviews.teacherView(teacher1, writingRequest);
    assert.equal(writing.texts.length, 2);
    assert.equal(writing.sections[0].prompt, 'Đề thử 1');
    assert.equal(writing.rubric.scope, 'FULL_SKILL');
    assert.deepEqual(writing.rubric.groups.map(group => group.weight), [1, 2]);
    const scoresFor = (rubric, band) => rubric.groups.flatMap(group => rubric.criteria.map(criterion => ({
      criterionId: criterion.id, sectionId: group.sectionId, score: band(group),
    })));
    const scores = scoresFor(writing.rubric, group => group.number === 1 ? 6 : 8);
    await assert.rejects(reviews.teacherView(teacher2, writingRequest), { statusCode: 404 });
    await assert.rejects(reviews.learnerView(speaker, writingId), { statusCode: 404 });
    await assert.rejects(reviews.save(teacher1, writingRequest, { scores: [scores[0]], generalComment: '' }, true), { code: 'RUBRIC_SCORE_REQUIRED' });
    await assert.rejects(reviews.save(teacher1, writingRequest, { scores: [{ ...scores[0], score: 6.5 }], generalComment: '' }, false), { code: 'RUBRIC_SCORE_INVALID' });
    const draft = await reviews.save(teacher1, writingRequest, { scores: [scores[0]], generalComment: 'Chỉ giáo viên thấy' }, false);
    assert.equal(draft.status, 'DRAFT');
    assert.deepEqual((await reviews.teacherView(teacher1, writingRequest)).review, draft);
    assert.equal((await reviews.learnerView(writer, writingId)).review, null);
    assert.equal((await reviews.learnerView(writer, writingId)).teacher, null);
    assert.ok(reviewInput.safeParse({ scores: draft.scores, generalComment: draft.generalComment }).success);
    const overview = await getTeacherOverview(sql, teacher1);
    assert.equal(overview.drafts, 1);
    assert.equal(overview.items.length, Math.min(3, overview.assigned));
    assert.equal(overview.loads.find(load => load.skill === 'WRITING').assigned, 1);
    assert.equal(overview.rubric.filter(item => item.skill === 'WRITING').length, 4);
    const filteredQueue = await listTeacherQueue(sql, teacher1, { page: 1, skill: 'WRITING', q: 'writer' });
    assert.equal(filteredQueue.total, 1);
    assert.deepEqual(filteredQueue.items.map(item => [item.id, item.learner, item.hasDraft]), [[writingRequest, 'Writer', true]]);
    const older = await listTeacherQueue(sql, teacher1, { page: 1, sort: 'oldest' }, 1);
    const newer = await listTeacherQueue(sql, teacher1, { page: 1, sort: 'newest' }, 1);
    assert.equal(older.nextPage, 2);
    assert.notEqual(older.items[0].id, newer.items[0].id);
    assert.equal((await listTeacherQueue(sql, teacher2, { page: 1, q: 'Writer' })).total, 0);
    assert.equal((await listTeacherHistory(sql, teacher1, { days: 365, q: 'Writer' })).items.length, 0);
    assert.equal((await grading.savePermission(admin, teacher1, 'WRITING', { canGrade: false, isAccepting: false, maxPending: 0 })).status, 'PENDING_REVOKE');
    const publishInput = { scores: scores.map((score, index) => index === 0 ? { ...score, comment: 'Mở rộng ví dụ' } : score), generalComment: 'Nhận xét đã công bố' };
    const published = await Promise.all([reviews.save(teacher1, writingRequest, publishInput, true), reviews.save(teacher1, writingRequest, publishInput, true)]);
    assert.equal(published[0].overall, 7.5);
    assert.deepEqual(published[0], published[1]);
    assert.equal((await listTeacherLoads(sql, teacher1)).items.find(load => load.skill === 'WRITING').status, 'REVOKED');
    assert.equal((await listTeacherLoads(sql, teacher1)).items.find(load => load.skill === 'WRITING').assigned, 0);
    const result = await reviews.learnerView(writer, writingId);
    assert.equal(+result.expiresAt, +now + 14 * day);
    assert.equal(result.review.generalComment, publishInput.generalComment);
    assert.equal(result.review.scores[0].comment, 'Mở rộng ví dụ');
    assert.equal((await db.query('SELECT band_score::float8 AS band FROM public.skill_attempts WHERE id=$1', [writingId])).rows[0].band, 7.5);

    const partial = await reviews.teacherView(teacher1, partialRequest);
    assert.equal(partial.rubric.scope, 'SECTION');
    assert.deepEqual(partial.rubric.groups.map(group => group.number), [1, 3]);
    assert.match((await reviews.teacherAudio(teacher1, partialRequest, 'p3q0')).url, /p3q0.webm\?ttl=/);
    await assert.rejects(reviews.teacherAudio(teacher1, partialRequest, 'p2q0'), { statusCode: 404 });
    await assert.rejects(reviews.teacherAudio(teacher2, partialRequest, 'p3q0'), { statusCode: 404 });
    const partialScores = scoresFor(partial.rubric, group => group.number === 1 ? 6 : 7);
    assert.equal((await reviews.save(teacher1, partialRequest, { scores: partialScores, generalComment: 'Speaking Part 1 và 3' }, true)).overall, 6.5);
    assert.equal((await db.query('SELECT band_score FROM public.skill_attempts WHERE id=$1', [partialId])).rows[0].band_score, null);
    const realDate = (await db.query('SELECT now() AS current')).rows[0].current;
    await db.query(`UPDATE public.grading_reviews SET published_at=$1 WHERE grading_request_id=$2`, [realDate, writingRequest]);
    assert.equal((await listTeacherHistory(sql, teacher1, { days: 7, skill: 'WRITING', q: 'Writer' })).items[0].id, writingRequest);
    assert.equal((await listTeacherHistory(sql, teacher2, { days: 30 })).items.length, 0);
    const [{ today, tomorrow }] = (await db.query(`SELECT to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD') AS today,
      to_char((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date + 1,'YYYY-MM-DD') AS tomorrow`)).rows;
    assert.equal((await listTeacherHistory(sql, teacher1, { from: today, to: today, q: 'Writer' })).items[0].id, writingRequest);
    assert.equal((await listTeacherHistory(sql, teacher1, { from: tomorrow, to: tomorrow, q: 'Writer' })).items.length, 0);

    const raceId = await attempt(racer, { skill: 'SPEAKING', scope: [1, 2, 3] });
    const raceRequest = (await grading.submit(racer, raceId)).request.id;
    while (await grading.assignNext()) { /* Nhận các yêu cầu có giáo viên phù hợp. */ }
    const wholeSpeaking = await reviews.teacherView(teacher1, raceRequest);
    assert.deepEqual(wholeSpeaking.rubric.groups.map(group => group.sectionId), [null]);
    const raceInput = { scores: scoresFor(wholeSpeaking.rubric, () => 7), generalComment: 'Kết quả cạnh tranh' };
    await Promise.allSettled([grading.cancelAssigned(admin, teacher1, raceRequest, 'Không thể hoàn thành'), reviews.save(teacher1, raceRequest, raceInput, true)]);
    const [raceState] = (await db.query(`SELECT g.status,EXISTS(SELECT 1 FROM public.grading_reviews x WHERE x.grading_request_id=g.id AND x.status='PUBLISHED') AS published,
      EXISTS(SELECT 1 FROM public.credit_refunds x WHERE x.grading_request_id=g.id) AS refunded FROM public.grading_requests g WHERE id=$1`, [raceRequest])).rows;
    assert.ok(['CANCELLED', 'COMPLETED'].includes(raceState.status));
    assert.equal(Number(raceState.published) + Number(raceState.refunded), 1);
    assert.equal(raceState.published, raceState.status === 'COMPLETED');

    await Promise.all([dispatchPendingGradingNotifications(sql), dispatchPendingGradingNotifications(sql)]);
    const publishedNotifications = (await db.query(`SELECT id,recipient_id,type FROM public.notifications WHERE reference_id=$1`, [writingRequest])).rows;
    const learners = publishedNotifications.filter(row => row.type === 'GRADING_RESULT_PUBLISHED');
    assert.equal(learners.length, 1);
    assert.equal(learners[0].recipient_id, writer);
    assert.equal(publishedNotifications.filter(row => row.type === 'GRADING_REQUEST_ACCEPTED' && row.recipient_id === writer).length, 1);
    const cancelNotices = (await db.query(`SELECT recipient_id,type FROM public.notifications WHERE reference_id=$1 AND type='GRADING_CANCELLED_REFUNDED'`, [assigned.id])).rows;
    assert.deepEqual(cancelNotices, [{ recipient_id: alice, type: 'GRADING_CANCELLED_REFUNDED' }]);
    const assignedNotice = publishedNotifications.find(row => row.type === 'GRADING_ASSIGNED');
    assert.equal(assignedNotice.recipient_id, teacher1);
    assert.equal((await readGradingNotificationTarget(assignedNotice.id, teacher1, 'TEACHER', sql)).destination, `TeacherGrade?request=${writingRequest}`);
    await assert.rejects(readGradingNotificationTarget(learners[0].id, speaker, 'LEARNER', sql), { statusCode: 404 });
    const reminders = () => dispatchExpiryReminders(sql, new Date(+result.expiresAt - day));
    await Promise.all([reminders(), reminders()]);
    const reminderRows = (await db.query(`SELECT id,recipient_id FROM public.notifications WHERE reference_id=$1 AND type='CONTENT_EXPIRING'`, [writingId])).rows;
    assert.equal(reminderRows.length, 1);
    assert.equal(reminderRows[0].recipient_id, writer);
    now = new Date(+result.expiresAt + 1);
    const repo = createAttemptsRepository(sql);
    await cleanupAttemptContent({ repo, storage, clock: () => now });
    const afterExpiry = await reviews.learnerView(writer, writingId);
    assert.equal(afterExpiry.contentStatus, 'DELETED');
    assert.equal(afterExpiry.texts.length, 0);
    assert.equal(afterExpiry.review.overall, 7.5);
    assert.equal(afterExpiry.review.generalComment, publishInput.generalComment);
    assert.equal(afterExpiry.review.scores.length, 8);
    assert.equal((await reviews.teacherView(teacher1, writingRequest)).editable, false);
    assert.equal((await listTeacherHistory(sql, teacher1, { days: 7, q: 'Writer' })).items[0].expired, true);
    for (const notice of [learners[0], reminderRows[0]]) {
      assert.equal((await readGradingNotificationTarget(notice.id, writer, 'LEARNER', sql)).destination, `ResultWS?attempt=${writingId}`);
    }
    const learnerRouter = createGradingRouter('LEARNER', sql);
    const handler = learnerRouter.stack.find(layer => layer.route?.path === '/results/:id').route.stack.at(-1).handle;
    const opened = await new Promise((resolve, reject) => handler({ params: { id: writingId }, appUser: { id: writer } }, { json: resolve }, reject));
    assert.equal(opened.review.overall, 7.5);

    const legacyLearner = await user('Writing trước migration 26');
    const legacyId = await attempt(legacyLearner, { scope: [2] });
    await db.query(`UPDATE public.attempts SET selected_scope='{}' WHERE id=(SELECT attempt_id FROM public.skill_attempts WHERE id=$1)`, [legacyId]);
    await db.query(`UPDATE public.submission_contents SET question_key='' WHERE skill_attempt_id=$1`, [legacyId]);
    await grading.savePermission(admin, teacher2, 'WRITING', { canGrade: true, isAccepting: true, maxPending: 1 });
    const legacyRequest = (await grading.submit(legacyLearner, legacyId)).request.id;
    assert.equal(await grading.assignNext(), true);
    const legacy = await reviews.teacherView(teacher2, legacyRequest);
    assert.equal(legacy.rubric.scope, 'SECTION');
    assert.deepEqual(legacy.texts.map(item => [item.number, item.text]), [[2, 'Bài viết thử']]);
    await reviews.save(teacher2, legacyRequest, { scores: scoresFor(legacy.rubric, () => 7), generalComment: 'Bài Writing cũ' }, true);
    assert.equal((await reviews.learnerView(legacyLearner, legacyId)).review.overall, 7);
    assert.equal((await db.query('SELECT band_score FROM public.skill_attempts WHERE id=$1', [legacyId])).rows[0].band_score, null);
  } finally { await db.close(); }
});
