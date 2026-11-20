import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

const pgModule = process.env.SAMPLE_TEST_PGLITE_MODULE;

test('Admin account history, invitations, deletion and protection against isolated PostgreSQL', { skip: !pgModule }, async t => {
  const origin = 'http://localhost:3000';
  const supabase = 'https://admin-test.example';
  Object.assign(process.env, {
    NODE_ENV: 'test', FRONTEND_ORIGIN: origin, AUTH_EMAIL_REDIRECT_URL: origin + '/login',
    SUPABASE_URL: supabase, SUPABASE_PUBLISHABLE_KEY: 'test-public', SUPABASE_SERVICE_ROLE_KEY: 'test-admin',
    DATABASE_URL: 'postgresql://unused:unused@localhost:1/unused',
    ADMIN_SECURITY_CODE_SECRET: 'test-otp-secret-used-only-for-isolated-tests',
    RESEND_API_KEY: 'test-sending-key', ADMIN_SECURITY_EMAIL_FROM: 'test@example.test',
    STORAGE_BUCKET_AVATARS: 'avatars',
  });
  const { PGlite } = await import(pathToFileURL(resolve(pgModule)).href);
  const { Prisma } = await import('@prisma/client');
  const { app } = await import('../dist/app.js');
  const { prisma } = await import('../dist/lib/prisma.js');
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_app_meta_data jsonb, raw_user_meta_data jsonb, deleted_at timestamptz);
    create schema storage;
    create table storage.objects (bucket_id text, name text, owner_id text);
  `);
  for (const name of ['01_tao_cau_truc_moi', '08_ho_so_auth', '16_learner_checkins', '17_nhat_ky_dang_nhap',
    '18_ma_bao_mat_quan_tri', '19a_staff_invitation_auth_compat', '19_staff_invitations', '20_account_deletion']) {
    if (name.startsWith('19a')) {
      await db.exec(`
        alter function public.ieltspace_create_learner_profile() rename to handle_new_auth_user;
        alter trigger ieltspace_create_learner_profile on auth.users rename to on_auth_user_created;
      `);
    }
    const migration = await readFile(new URL(`../../docs/csdl/${name}.sql`, import.meta.url), 'utf8');
    await db.exec(migration);
    if (name === '19_staff_invitations' || name === '20_account_deletion') await db.exec(migration);
  }
  const permissions = await db.query(`
    select bool_and(relrowsecurity) as protected, bool_or(has_table_privilege('authenticated', oid, 'SELECT')) as exposed
    from pg_class where relname in ('user_login_events','admin_action_codes','staff_invitations','account_deletion_jobs')
  `);
  assert.deepEqual(permissions.rows, [{ protected: true, exposed: false }]);

  let failAudit = false;
  function sqlClient(engine) {
    async function run(input, ...values) {
      const query = Array.isArray(input) ? Prisma.sql(input, ...values) : input;
      return engine.query(query.text, query.values);
    }
    return {
      $queryRaw: async (...args) => (await run(...args)).rows,
      $executeRaw: async (...args) => (await run(...args)).affectedRows,
      users: {
        findUnique: async ({ where }) => (await engine.query(where.id
          ? 'SELECT * FROM public.users WHERE id = $1'
          : 'SELECT * FROM public.users WHERE auth_user_id = $1', [where.id ?? where.auth_user_id])).rows[0] ?? null,
        count: async () => (await engine.query("SELECT count(*)::int AS n FROM public.users WHERE role = 'ADMIN' AND status = 'ACTIVE'")).rows[0].n,
      },
      audit_logs: {
        create: async ({ data }) => {
          if (failAudit) throw new Error('Injected audit failure');
          await engine.query(`INSERT INTO public.audit_logs (actor_id, actor_type, action, entity_type, entity_id, change_data, reason)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`, [data.actor_id, data.actor_type, data.action, data.entity_type, data.entity_id, data.change_data, data.reason]);
        },
      },
    };
  }
  const client = sqlClient(db);
  const internal = { ...client, $transaction: callback => db.transaction(tx => callback(sqlClient(tx))) };
  for (const name of ['$queryRaw', '$executeRaw', '$transaction']) {
    Object.defineProperty(prisma, name, { value: internal[name], configurable: true });
    t.after(() => { delete prisma[name]; });
  }
  Object.defineProperty(prisma.users, 'findUnique', { value: client.users.findUnique, configurable: true });

  const actor = { id: randomUUID(), auth: randomUUID(), role: 'ADMIN' };
  const second = { id: randomUUID(), auth: randomUUID(), role: 'ADMIN' };
  const learner = { id: randomUUID(), auth: randomUUID(), role: 'LEARNER' };
  for (const user of [actor, second, learner]) {
    await db.query('INSERT INTO auth.users (id, email) VALUES ($1,$2)', [user.auth, user.auth + '@example.test']);
    await db.query("UPDATE public.users SET id=$1, full_name=$2, role=$2 WHERE auth_user_id=$3", [user.id, user.role, user.auth]);
  }
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const jwk = { ...await exportJWK(publicKey), kid: 'admin-test', alg: 'ES256' };
  const getToken = (user, session = randomUUID()) => new SignJWT({ session_id: session })
    .setProtectedHeader({ alg: 'ES256', kid: jwk.kid }).setSubject(user.auth)
    .setIssuer(supabase + '/auth/v1').setAudience('authenticated').setExpirationTime('15m').sign(privateKey);
  const tokens = { actor: await getToken(actor), second: await getToken(second), learner: await getToken(learner), google: await getToken(learner) };
  const fetchHttp = globalThis.fetch;
  const delivered = [];
  const invitationEmails = [];
  let rejectAuthDeletion = true;
  let rejectAvatarDeletion = true;
  const removedAvatars = [];
  let rejectMail = false;
  const createdAuth = new Map();
  function providerUser(user) {
    return { id: user.auth, email: user.auth + '@example.test', email_confirmed_at: '2026-11-20T00:00:00Z', app_metadata: { provider: 'email' } };
  }
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.hostname === 'api.resend.com') {
      const mail = JSON.parse(options.body);
      const code = mail.text.match(/\b\d{6}\b/)?.[0];
      if (code) delivered.push({ recipient: mail.to[0], code });
      else invitationEmails.push({ email: mail.to[0], token: mail.text.match(/token_hash=([0-9a-f]{64})/)[1] });
      if (rejectMail && !code) return Response.json({}, { status: 503 });
      return Response.json({ id: 'mock-delivery' });
    }
    if (url.origin !== supabase) return fetchHttp(input, options);
    if (url.pathname.endsWith('/jwks.json')) return Response.json({ keys: [jwk] });
    if (url.pathname.endsWith('/storage/v1/object/avatars') && options?.method === 'DELETE') {
      if (rejectAvatarDeletion) return Response.json({ message: 'Temporary storage error' }, { status: 503 });
      removedAvatars.push(...JSON.parse(options.body).prefixes);
      return Response.json([]);
    }
    if (url.pathname.endsWith('/admin/users') && options?.method === 'POST') {
      const payload = JSON.parse(options.body);
      assert.equal(payload.email_confirm, true);
      const auth = randomUUID();
      try {
        await db.query('INSERT INTO auth.users (id, email, raw_app_meta_data) VALUES ($1,$2,$3)', [auth, payload.email, payload.app_metadata]);
      } catch {
        return Response.json({ code: 'unexpected_failure', msg: 'Invalid invitation' }, { status: 500 });
      }
      const user = { auth, email: payload.email };
      createdAuth.set(user.email, user);
      return Response.json({ ...providerUser(user), email: user.email, app_metadata: payload.app_metadata });
    }
    if (url.pathname.includes('/admin/users/') && options?.method === 'DELETE') {
      if (rejectAuthDeletion) return Response.json({ code: 'unexpected_failure', msg: 'Temporary error' }, { status: 503 });
      const id = url.pathname.split('/').pop();
      await db.query('DELETE FROM auth.users WHERE id=$1', [id]);
      return Response.json({});
    }
    if (url.pathname.includes('/admin/users/')) return Response.json(providerUser(url.pathname.endsWith(actor.auth) ? actor : second));
    if (url.pathname.endsWith('/token')) {
      const grant = url.searchParams.get('grant_type');
      const invited = createdAuth.get(JSON.parse(options.body).email);
      if (invited) return Response.json({ access_token: await getToken(invited), refresh_token: 'staff-refresh',
        expires_in: 900, token_type: 'bearer', user: { ...providerUser(invited), email: invited.email } });
      return Response.json({
        access_token: grant === 'pkce' ? tokens.google : tokens.learner, refresh_token: 'test-refresh',
        expires_in: 900, token_type: 'bearer', user: providerUser(learner),
      });
    }
    if (url.pathname.endsWith('/logout')) return new Response(null, { status: 204 });
    throw new Error('Unexpected provider request: ' + url.pathname);
  });

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  async function request(path, { token, method = 'GET', json, cookie } = {}) {
    const headers = { Origin: origin, ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(cookie ? { Cookie: cookie } : {}) };
    if (json) headers['Content-Type'] = 'application/json';
    const response = await fetchHttp(base + path, { method, headers, body: json && JSON.stringify(json), redirect: 'manual' });
    const body = response.headers.get('content-type')?.includes('json') ? await response.json() : null;
    return { status: response.status, body, location: response.headers.get('location') };
  }
  const password = { method: 'POST', json: { email: 'learner@example.test', password: 'test-pass' } };
  const refresh = { method: 'POST', cookie: 'ielts_refresh_token=test-refresh' };
  const google = { cookie: 'ielts_google_pkce=' + encodeURIComponent(JSON.stringify('test-verifier')) };
  const activity = '/admin/users/activity';
  const adminGet = path => request('/admin/users' + path, { token: tokens.actor });
  assert.equal((await request(activity)).status, 401);
  assert.equal((await request(activity, { token: tokens.learner })).status, 403);
  const statsPath = '/admin/statistics?from=2025-01-01&to=2025-01-01';
  assert.equal((await request(statsPath)).status, 401);
  assert.equal((await request(statsPath, { token: tokens.learner })).status, 403);
  assert.equal((await request('/admin/statistics?from=2025-02-29&to=2025-03-01', { token: tokens.actor })).status, 400);
  assert.equal((await request('/admin/statistics?from=2025-01-02&to=2025-01-01', { token: tokens.actor })).status, 400);
  const emptyStats = (await request(statsPath, { token: tokens.actor })).body;
  assert.equal(emptyStats.accountsTotal, 3);
  assert.equal(emptyStats.accountsLocked, 0);
  assert.equal(emptyStats.accountsNew, 0);
  assert.equal(emptyStats.loginHistoryFrom, null);
  assert.equal(emptyStats.supportReports, null);
  assert.deepEqual(emptyStats.dailyFlashcards, [{ day: '2025-01-01', sessions: 0 }]);
  const borderTimes = ['2024-12-31T16:59:59Z', '2024-12-31T17:00:00Z', '2025-01-01T16:59:59Z', '2025-01-01T17:00:00Z'];
  await db.query('UPDATE public.users SET created_at=$2 WHERE id=$1', [learner.id, borderTimes[1]]);
  for (const [index, time] of borderTimes.entries()) {
    const digest = String(index).repeat(64);
    await db.query("INSERT INTO public.user_login_events(user_id,method,session_digest,created_at) VALUES ($1,'PASSWORD',$2,$3)", [actor.id, digest, time]);
    await db.query("INSERT INTO public.audit_logs(actor_type,action,entity_type,created_at) VALUES ('USER','USER_LOCKED','USER',$1)", [time]);
    await db.query(`
      WITH session AS (INSERT INTO public.flashcard_sessions(user_id,source_type,total_cards,minimum_cards)
        VALUES ($1,'FAVORITES',1,1) RETURNING id)
      INSERT INTO public.learning_activities(user_id,activity_type,flashcard_session_id,completed_at)
        SELECT $1,'FLASHCARD',id,$2 FROM session
    `, [learner.id, time]);
  }
  const measured = (await request(statsPath, { token: tokens.actor })).body;
  assert.equal(measured.accountsNew, 1);
  assert.equal(measured.usersSignedIn, 1);
  assert.equal(measured.loginHistoryFrom, '2024-12-31');
  assert.equal(measured.accountLocks, 2);
  assert.equal(measured.flashcardSessions, 2);
  assert.equal(measured.flashcardLearners, 1);
  assert.deepEqual(measured.dailyFlashcards, [{ day: '2025-01-01', sessions: 2 }]);
  assert.equal((await request('/admin/statistics?from=2024-01-01&to=2025-01-02', { token: tokens.actor })).body.dailyFlashcards.length, 7);
  await db.query("DELETE FROM public.user_login_events WHERE created_at < '2025-02-01'");
  await db.query("DELETE FROM public.audit_logs WHERE created_at < '2025-02-01'");
  assert.equal((await request('/auth/login', password)).status, 200);
  assert.equal((await request('/auth/login', password)).status, 200);
  assert.equal((await request('/auth/refresh', refresh)).status, 200);
  assert.equal((await request('/auth/google/callback?code=test-code', google)).location, origin + '/auth/callback');
  assert.equal((await request('/auth/refresh', refresh)).status, 200);
  const loginHistory = (await adminGet('/' + learner.id + '/history?kind=login')).body;
  assert.deepEqual(loginHistory.items.map(event => event.method).sort(), ['GOOGLE', 'PASSWORD']);
  assert.equal((await adminGet('/activity?role=TEACHER')).body.items.length, 0);
  assert.equal((await adminGet('/activity?role=LEARNER')).body.items.length, 2);
  assert.ok(loginHistory.items.every(event => !('session_digest' in event)));

  const lock = { kind: 'status', previousRole: 'LEARNER', previousStatus: 'ACTIVE', status: 'LOCKED', reason: 'Kiểm tra khóa' };
  const change = (user, action, securityCode, token = tokens.actor) =>
    request('/admin/users/' + user.id + '/' + action.kind, { token, method: 'PATCH', json: { action, securityCode } });
  assert.equal((await change(actor, { ...lock, previousRole: 'ADMIN' })).body.code, 'SELF_ADMIN_ACTION');
  failAudit = true;
  assert.equal((await change(learner, lock)).status, 500);
  assert.equal((await request('/auth/me', { token: tokens.learner })).body.user.status, 'ACTIVE');
  failAudit = false;
  assert.equal((await change(learner, lock)).status, 200);
  assert.equal((await change(learner, lock)).body.changed, false);
  assert.equal((await request('/auth/me/avatar-options', { token: tokens.learner })).status, 403);
  assert.equal((await request('/auth/login', password)).status, 403);
  assert.equal((await request('/auth/refresh', refresh)).status, 403);
  assert.ok((await request('/auth/google/callback?code=locked-code', google)).location.includes('account_unavailable'));

  assert.equal((await change(learner, { ...lock, previousStatus: 'LOCKED', status: 'ACTIVE' })).body.role, 'LEARNER');
  const teacher = { kind: 'role', previousRole: 'LEARNER', previousStatus: 'ACTIVE', role: 'TEACHER', reason: 'Kiểm tra đổi vai trò' };
  assert.equal((await change(learner, teacher)).body.role, 'TEACHER');
  assert.equal((await request('/auth/me', { token: tokens.learner })).body.user.role, 'TEACHER');
  assert.equal((await adminGet('/activity?role=TEACHER')).body.items.length, 2);
  const audit = (await adminGet('/' + learner.id + '/history?kind=admin')).body.items;
  assert.deepEqual(new Set(audit.map(row => row.action)), new Set(['USER_LOCKED', 'USER_UNLOCKED', 'USER_ROLE_CHANGED']));
  assert.ok(audit.every(row => row.actorName === 'ADMIN' && row.reason));

  const demote = { kind: 'role', previousRole: 'ADMIN', previousStatus: 'ACTIVE', role: 'TEACHER', reason: 'Kiểm tra Quản lý' };
  const issue = (user, action, token = tokens.actor) => request('/admin/users/' + user.id + '/security-code', { token, method: 'POST', json: action });
  assert.equal((await change(second, demote)).body.code, 'ADMIN_CODE_REQUIRED');
  const firstCode = await issue(second, demote);
  assert.equal(firstCode.status, 202);
  assert.deepEqual(Object.keys(firstCode.body).sort(), ['expiresInSeconds', 'id']);
  assert.equal(delivered[0].recipient, actor.auth + '@example.test');
  assert.equal((await issue(second, demote)).status, 429);
  const wrong = delivered[0].code === '000000' ? '111111' : '000000';
  const proof = { id: firstCode.body.id, code: delivered[0].code };
  assert.equal((await change(second, demote, { ...proof, code: wrong })).body.code, 'ADMIN_CODE_INVALID');
  assert.equal((await change(second, { ...demote, role: 'LEARNER' }, proof)).body.code, 'ADMIN_CODE_INVALID');
  const competingCode = await issue(actor, demote, tokens.second);
  assert.equal(competingCode.status, 202);
  const race = await Promise.all([change(second, demote, proof),
    change(actor, demote, { id: competingCode.body.id, code: delivered[1].code }, tokens.second)]);
  assert.deepEqual(race.map(value => value.status).sort(), [200, 403]);
  assert.equal(await client.users.count(), 1);
  const consumed = await db.query('SELECT count(*)::int AS n FROM public.admin_action_codes WHERE consumed_at IS NOT NULL');
  assert.equal(consumed.rows[0].n, 1);

  const activeToken = race[0].status === 200 ? tokens.actor : tokens.second;
  const activeAdmin = race[0].status === 200 ? actor : second;
  const invite = (invitation, securityCode) => request('/admin/users/invitations', {
    token: activeToken, method: 'POST', json: { invitation, securityCode },
  });
  const staff = { fullName: 'Giáo viên mới', email: 'staff@example.test', role: 'TEACHER', writing: true, speaking: false, maxPending: 4 };
  const invitedAdmin = { fullName: 'Quản lý mới', email: 'staff-admin@example.test', role: 'ADMIN' };
  assert.equal((await invite(invitedAdmin)).body.code, 'ADMIN_CODE_REQUIRED');
  assert.equal((await invite({ ...staff, email: learner.auth + '@example.test' })).body.code, 'INVITE_EMAIL_EXISTS');
  rejectMail = true;
  assert.equal((await invite(staff)).body.code, 'INVITE_EMAIL_FAILED');
  const oldToken = invitationEmails.at(-1).token;
  rejectMail = false;
  const invitation = await invite(staff);
  assert.equal(invitation.status, 202);
  assert.equal(invitation.body.status, 'INVITED');
  assert.equal((await invite(staff)).status, 429);
  const latest = invitationEmails.at(-1).token;
  const accept = token => request('/auth/accept-staff-invite', { method: 'POST', json: { token, password: 'staff-pass-123' } });
  assert.equal((await accept(oldToken)).status, 400);
  assert.equal((await accept(latest)).status, 200);
  assert.equal((await accept(latest)).status, 400);
  assert.equal((await invite(staff)).body.code, 'INVITE_EMAIL_EXISTS');
  const profile = await client.users.findUnique({ where: { id: invitation.body.id } });
  assert.equal(profile.status, 'ACTIVE');
  assert.equal(profile.role, 'TEACHER');
  assert.deepEqual((await db.query('SELECT skill, max_pending FROM public.teacher_permissions WHERE teacher_id = $1', [profile.id])).rows,
    [{ skill: 'WRITING', max_pending: 4 }]);
  const staffPassword = { method: 'POST', json: { email: staff.email, password: 'staff-pass-123' } };
  assert.equal((await request('/auth/login', staffPassword)).body.user.role, 'TEACHER');
  assert.equal((await change(profile, { ...lock, previousRole: 'TEACHER' }, undefined, activeToken)).body.status, 'LOCKED');
  assert.equal((await request('/auth/me', { token: await getToken(createdAuth.get(staff.email)) })).status, 403);
  assert.equal((await change(profile, { ...lock, previousRole: 'TEACHER', previousStatus: 'LOCKED', status: 'ACTIVE' },
    undefined, activeToken)).body.role, 'TEACHER');

  const demotionCode = await db.query('UPDATE public.admin_action_codes SET created_at=now()-interval \'2 minutes\'');
  assert.ok(demotionCode.affectedRows > 0);
  const codeRequest = await request('/admin/users/invitations/security-code', { token: activeToken, method: 'POST', json: invitedAdmin });
  assert.equal(codeRequest.status, 202);
  assert.equal((await invite(invitedAdmin, { id: codeRequest.body.id, code: delivered.at(-1).code })).status, 202);
  assert.equal((await accept(invitationEmails.at(-1).token)).status, 200);
  assert.equal((await request('/auth/login', { method: 'POST', json: { email: invitedAdmin.email, password: 'staff-pass-123' } })).body.user.role, 'ADMIN');

  const deleteAction = { kind: 'delete', previousRole: 'TEACHER', previousStatus: 'ACTIVE', reason: 'Kiểm tra xóa' };
  const remove = (target, action) => request('/admin/users/' + target, { token: activeToken, method: 'DELETE', json: { action } });
  assert.equal((await remove(activeAdmin.id, { ...deleteAction, previousRole: 'ADMIN' })).body.code, 'SELF_ADMIN_ACTION');
  const fixture = await db.query(`
    WITH collection AS (INSERT INTO public.exam_sets(name) VALUES ('Fixture') RETURNING id),
    exam AS (INSERT INTO public.exams(exam_set_id, title, order_no) SELECT id, 'Fixture', 1 FROM collection RETURNING id),
    skill AS (INSERT INTO public.exam_skills(exam_id, skill, version_number, duration_minutes)
      SELECT id, 'SPEAKING', 1, 12 FROM exam RETURNING id),
    section AS (INSERT INTO public.exam_sections(exam_skill_id, title, section_type, order_no)
      SELECT id, 'Part', 'PART', 1 FROM skill RETURNING id),
    attempt AS (INSERT INTO public.attempts(user_id, exam_id, attempt_type, status)
      SELECT $1, id, 'FULL_SKILL', 'COMPLETED' FROM exam RETURNING id),
    done AS (INSERT INTO public.skill_attempts(attempt_id, exam_skill_id, status, deadline_at, band_score)
      SELECT attempt.id, skill.id, 'COMPLETED', now() + interval '1 hour', 7.5 FROM attempt, skill RETURNING id),
    submission AS (INSERT INTO public.submission_contents(skill_attempt_id, section_id, text_content)
      SELECT done.id, section.id, 'Personal response' FROM done, section),
    credit AS (INSERT INTO public.support_credits(user_id, credit_type, valid_from, expires_at)
      VALUES ($1, 'BONUS', now(), now() + interval '2 days') RETURNING id)
    INSERT INTO public.grading_requests(skill_attempt_id, used_credit_id, assignment_deadline)
      SELECT done.id, credit.id, now() + interval '72 hours' FROM done, credit RETURNING id, skill_attempt_id
  `, [profile.id]);
  const submissionId = fixture.rows[0].skill_attempt_id;
  const avatar = profile.id + '/' + randomUUID() + '.jpg';
  await db.query('UPDATE public.users SET avatar_url=$2 WHERE id=$1', [profile.id, avatar]);
  assert.equal((await remove(profile.id, deleteAction)).status, 202);
  assert.equal((await request('/auth/me', { token: await getToken(createdAuth.get(staff.email)) })).status, 403);
  const anonymized = await client.users.findUnique({ where: { id: profile.id } });
  assert.equal(anonymized.email, null);
  assert.equal(anonymized.auth_user_id, null);
  assert.equal(anonymized.status, 'DELETED');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.submission_contents WHERE skill_attempt_id=$1', [submissionId])).rows[0].n, 0);
  assert.deepEqual((await db.query('SELECT status, cancel_reason FROM public.grading_requests WHERE id=$1', [fixture.rows[0].id])).rows,
    [{ status: 'CANCELLED', cancel_reason: 'LEARNER_DELETED' }]);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM public.credit_refunds WHERE grading_request_id=$1', [fixture.rows[0].id])).rows[0].n, 0);
  assert.equal(Number((await db.query('SELECT band_score FROM public.skill_attempts WHERE id=$1', [submissionId])).rows[0].band_score), 7.5);
  const cleanup = () => request('/admin/users/' + profile.id + '/deletion-retry', { token: activeToken, method: 'POST' });
  rejectAvatarDeletion = false;
  assert.equal((await cleanup()).body.cleanup, 'PENDING');
  assert.deepEqual(removedAvatars, [avatar]);
  rejectAuthDeletion = false;
  const finished = await cleanup();
  assert.equal(finished.body.cleanup, 'COMPLETE');
  assert.deepEqual(removedAvatars, [avatar]);
  assert.equal((await remove(profile.id, deleteAction)).body.changed, false);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM public.audit_logs WHERE entity_id=$1 AND action='USER_DELETED'", [profile.id])).rows[0].n, 1);
});
