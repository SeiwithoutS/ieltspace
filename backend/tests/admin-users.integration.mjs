import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { decodeJwt, exportJWK, generateKeyPair, SignJWT } from 'jose';

const pgModule = process.env.SAMPLE_TEST_PGLITE_MODULE;

test('Managed account trigger also works with the development signup trigger', { skip: !pgModule }, async t => {
  const { PGlite } = await import(pathToFileURL(resolve(pgModule)).href);
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_app_meta_data jsonb, raw_user_meta_data jsonb,
      encrypted_password text, last_sign_in_at timestamptz);
  `);
  for (const name of ['01_tao_cau_truc_moi', '08_ho_so_auth', '17_nhat_ky_dang_nhap', '19_staff_invitations',
    '24_staff_accounts_and_authenticator', '25_staff_auth_metadata']) {
    await db.exec(await readFile(new URL(`../../docs/csdl/${name}.sql`, import.meta.url), 'utf8'));
  }
  const actorAuth = randomUUID();
  await db.query('INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1,$2,$3)', [
    actorAuth, 'manager@example.test', { role: 'ADMIN', ieltspace_invitation_proof: 'managed-account-v1' },
  ]);
  const [learner] = (await db.query('SELECT id, role, must_change_password FROM public.users WHERE auth_user_id = $1', [actorAuth])).rows;
  assert.equal(learner.role, 'LEARNER');
  assert.equal(learner.must_change_password, false);
  const employee = [randomUUID(), 'teacher@example.test', {
    ieltspace_invitation_proof: 'managed-account-v1',
    ieltspace_staff_created: true,
    ieltspace_staff_creation: { actorId: learner.id, role: 'TEACHER', writing: true, maxPending: 4 },
  }, { full_name: 'Giáo viên fixture' }];
  const create = () => db.query('INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data) VALUES ($1,$2,$3,$4)', employee);
  await assert.rejects(create, /not an active administrator/);
  assert.equal((await db.query('SELECT id FROM auth.users WHERE id = $1', [employee[0]])).rows.length, 0);
  await db.query("UPDATE public.users SET role = 'ADMIN' WHERE id = $1", [learner.id]);
  await create();
  const [teacher] = (await db.query('SELECT role, status, must_change_password FROM public.users WHERE auth_user_id = $1', [employee[0]])).rows;
  assert.deepEqual(teacher, { role: 'TEACHER', status: 'ACTIVE', must_change_password: true });
});

test('Admin account history, staff creation, MFA, deletion and protection against isolated PostgreSQL', { skip: !pgModule }, async t => {
  const origin = 'http://localhost:3000';
  const supabase = 'https://admin-test.example';
  Object.assign(process.env, {
    NODE_ENV: 'test', FRONTEND_ORIGIN: origin, AUTH_EMAIL_REDIRECT_URL: origin + '/login',
    SUPABASE_URL: supabase, SUPABASE_PUBLISHABLE_KEY: 'test-public', SUPABASE_SERVICE_ROLE_KEY: 'test-admin',
    DATABASE_URL: 'postgresql://unused:unused@localhost:1/unused',
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
    create table auth.users (id uuid primary key, email text, raw_app_meta_data jsonb, raw_user_meta_data jsonb,
      deleted_at timestamptz, encrypted_password text, last_sign_in_at timestamptz);
    create schema storage;
    create table storage.objects (bucket_id text, name text, owner_id text);
  `);
  for (const name of ['01_tao_cau_truc_moi', '08_ho_so_auth', '16_learner_checkins', '17_nhat_ky_dang_nhap',
    '18_ma_bao_mat_quan_tri', '19a_staff_invitation_auth_compat', '19_staff_invitations', '20_account_deletion',
    '21_notifications_support_reports', '23_announcements_and_notification_settings', '27_remove_deleted_learner_support_reports']) {
    if (name.startsWith('19a')) {
      await db.exec(`
        alter function public.ieltspace_create_learner_profile() rename to handle_new_auth_user;
        alter trigger ieltspace_create_learner_profile on auth.users rename to on_auth_user_created;
      `);
    }
    const migration = await readFile(new URL(`../../docs/csdl/${name}.sql`, import.meta.url), 'utf8');
    await db.exec(migration);
    if (/^(19_|20_|27_)/.test(name)) await db.exec(migration);
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
  const factors = new Map([[second.auth, { id: randomUUID(), factor_type: 'totp', status: 'verified', friendly_name: 'IELTSpace' }]]);
  const challenges = new Map();
  const refreshedAuth = new Map();
  const recoveryTokens = new Map();
  let rejectAuthDeletion = true;
  let rejectAvatarDeletion = true;
  const removedAvatars = [];
  const unexpectedProviderRequests = [];
  const createdAuth = new Map();
  function providerUser(user) {
    return { id: user.auth, email: user.email ?? user.auth + '@example.test', email_confirmed_at: '2026-11-20T00:00:00Z',
      app_metadata: { provider: 'email', ...user.metadata }, factors: factors.has(user.auth) ? [factors.get(user.auth)] : [] };
  }
  async function providerSession(user, session) {
    const refresh_token = randomUUID();
    refreshedAuth.set(refresh_token, { user, session });
    return { access_token: await getToken(user, session), refresh_token, expires_in: 900, token_type: 'bearer', user: providerUser(user) };
  }
  function authenticatedUser(options) {
    const token = new Headers(options?.headers).get('Authorization')?.split(' ')[1];
    if (!token?.includes('.')) return null;
    const { sub } = decodeJwt(token);
    return [actor, second, learner, ...createdAuth.values()].find(user => user.auth === sub);
  }
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.origin !== supabase) {
      unexpectedProviderRequests.push(url.hostname);
      throw new Error('Unexpected external request');
    }
    if (url.pathname.endsWith('/jwks.json')) return Response.json({ keys: [jwk] });
    if (url.pathname.endsWith('/storage/v1/object/avatars') && options?.method === 'DELETE') {
      if (rejectAvatarDeletion) return Response.json({ message: 'Temporary storage error' }, { status: 503 });
      removedAvatars.push(...JSON.parse(options.body).prefixes);
      return Response.json([]);
    }
    if (url.pathname.endsWith('/admin/users') && options?.method === 'POST') {
      const payload = JSON.parse(options.body);
      assert.equal(new Headers(options.headers).get('apikey'), 'test-admin');
      assert.equal(payload.email_confirm, true);
      const auth = randomUUID();
      try {
        await db.transaction(async tx => {
          await tx.query('INSERT INTO auth.users (id, email, raw_user_meta_data, encrypted_password) VALUES ($1,$2,$3,$4)',
            [auth, payload.email, payload.user_metadata, 'initial-test-hash']);
          await tx.query('UPDATE auth.users SET raw_app_meta_data=$2 WHERE id=$1', [auth, payload.app_metadata]);
        });
      } catch {
        return Response.json({ code: 'unexpected_failure', msg: 'Staff creation trigger rejected' }, { status: 500 });
      }
      const user = { auth, email: payload.email, password: payload.password, metadata: payload.app_metadata };
      createdAuth.set(user.email, user);
      return Response.json(providerUser(user));
    }
    if (url.pathname.includes('/admin/users/') && options?.method === 'DELETE') {
      if (rejectAuthDeletion) return Response.json({ code: 'unexpected_failure', msg: 'Temporary error' }, { status: 503 });
      const id = url.pathname.split('/').pop();
      await db.query('DELETE FROM auth.users WHERE id=$1', [id]);
      return Response.json({});
    }
    if (url.pathname.includes('/admin/users/')) {
      const user = [actor, second, learner, ...createdAuth.values()].find(item => url.pathname.endsWith(item.auth));
      if (user && options.method === 'PUT') {
        const payload = JSON.parse(options.body);
        try {
          await db.transaction(async tx => {
            await tx.query('UPDATE auth.users SET encrypted_password=$2 WHERE id=$1', [user.auth, randomUUID()]);
            await tx.query('UPDATE auth.users SET raw_app_meta_data=raw_app_meta_data || $2::jsonb WHERE id=$1', [user.auth, payload.app_metadata]);
          });
        } catch {
          return Response.json({ code: 'unexpected_failure' }, { status: 500 });
        }
        user.password = payload.password;
        user.metadata = { ...user.metadata, ...payload.app_metadata };
      }
      return user ? Response.json(providerUser(user)) : Response.json({ code: 'user_not_found' }, { status: 404 });
    }
    if (url.pathname.endsWith('/verify') && !url.pathname.includes('/factors/')) {
      const { token_hash } = JSON.parse(options.body);
      const user = recoveryTokens.get(token_hash);
      if (!user) return Response.json({ code: 'otp_expired' }, { status: 403 });
      recoveryTokens.delete(token_hash);
      return Response.json(await providerSession(user));
    }
    if (/\/auth\/v1\/(?:user|factors)(?:\/|$)/.test(url.pathname)) {
      const user = authenticatedUser(options);
      if (!user) return Response.json({ code: 'invalid_token' }, { status: 401 });
      if (url.pathname.endsWith('/user')) {
        if (options.method === 'PUT') {
          const { password } = JSON.parse(options.body);
          await db.query('UPDATE auth.users SET encrypted_password = $2 WHERE id = $1', [user.auth, randomUUID()]);
          user.password = password;
        }
        return Response.json(providerUser(user));
      }
      if (url.pathname.endsWith('/factors')) {
        const factor = { id: randomUUID(), factor_type: 'totp', status: 'unverified', friendly_name: 'IELTSpace' };
        factors.set(user.auth, factor);
        return Response.json({ id: factor.id, type: 'totp', totp: { qr_code: '<svg/>', secret: 'fake-secret' } });
      }
      const factor = factors.get(user.auth);
      if (!factor || !url.pathname.includes('/' + factor.id)) return Response.json({ code: 'mfa_factor_not_found' }, { status: 404 });
      if (options.method === 'DELETE') {
        factors.delete(user.auth);
        return Response.json({ id: factor.id });
      }
      if (url.pathname.endsWith('/challenge')) {
        const challenge = randomUUID();
        challenges.set(challenge, factor.id);
        return Response.json({ id: challenge, type: 'totp', expires_at: 99999999 });
      }
      const { challenge_id, code } = JSON.parse(options.body);
      if (code !== '123456' || challenges.get(challenge_id) !== factor.id) {
        return Response.json({ code: 'mfa_verification_failed' }, { status: 422 });
      }
      challenges.delete(challenge_id);
      factor.status = 'verified';
      const authorization = new Headers(options.headers).get('Authorization');
      return Response.json(await providerSession(user, decodeJwt(authorization.split(' ')[1]).session_id));
    }
    if (url.pathname.endsWith('/token')) {
      const grant = url.searchParams.get('grant_type');
      const credentials = JSON.parse(options.body);
      if (credentials.email === 'legacy-admin@example.test' && credentials.password === 'admin-fixture-password') {
        return Response.json(await providerSession(actor));
      }
      const staff = createdAuth.get(credentials.email);
      if (staff) return staff.password === credentials.password ? Response.json(await providerSession(staff))
        : Response.json({ code: 'invalid_credentials' }, { status: 400 });
      const refreshed = refreshedAuth.get(credentials.refresh_token);
      if (refreshed) return Response.json(await providerSession(refreshed.user, refreshed.session));
      return Response.json({
        access_token: grant === 'pkce' ? tokens.google : tokens.learner, refresh_token: 'test-refresh',
        expires_in: 900, token_type: 'bearer', user: providerUser(learner),
      });
    }
    if (url.pathname.endsWith('/logout')) return new Response(null, { status: 204 });
    unexpectedProviderRequests.push(url.pathname);
    throw new Error('Unexpected provider request: ' + url.pathname);
  });

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  async function request(path, { token, method = 'GET', json, cookie } = {}) {
    const headers = { Origin: origin, ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(cookie ? { Cookie: cookie } : {}) };
    const payload = json && JSON.stringify(json);
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = String(Buffer.byteLength(payload));
    }
    const response = await fetchHttp(base + path, { method, headers, body: payload, redirect: 'manual' });
    const body = response.headers.get('content-type')?.includes('json') ? await response.json() : null;
    return { status: response.status, body, location: response.headers.get('location'),
      cookies: response.headers.getSetCookie(), cache: response.headers.get('cache-control') };
  }
  const password = { method: 'POST', json: { email: 'learner@example.test', password: 'test-pass' } };
  const refresh = { method: 'POST', cookie: 'ielts_refresh_token=test-refresh' };
  const google = { cookie: 'ielts_google_pkce=' + encodeURIComponent(JSON.stringify('test-verifier')) };
  const activity = '/admin/users/activity';
  const adminGet = path => request('/admin/users' + path, { token: tokens.actor });
  assert.equal((await request('/auth/me', { token: tokens.actor })).body.user.must_change_password, false);
  const beforeMigration = await request('/admin/users/staff', {
    token: tokens.actor, method: 'POST', json: {
      account: { fullName: 'Giáo viên fixture', email: 'before@example.test', role: 'TEACHER', writing: true, speaking: false, maxPending: 4 },
    },
  });
  assert.equal(beforeMigration.status, 503);
  assert.equal(beforeMigration.body.code, 'STAFF_MIGRATION_REQUIRED');
  assert.equal(createdAuth.size, 0);
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
  assert.equal(emptyStats.supportReports, 0);
  assert.deepEqual(emptyStats.dailyFlashcards, [{ day: '2025-01-01', sessions: 0 }]);
  const borderTimes = ['2024-12-31T16:59:59Z', '2024-12-31T17:00:00Z', '2025-01-01T16:59:59Z', '2025-01-01T17:00:00Z'];
  await db.query('UPDATE public.users SET created_at=$2 WHERE id=$1', [learner.id, borderTimes[1]]);
  for (const [index, time] of borderTimes.entries()) {
    const digest = String(index).repeat(64);
    await db.query("INSERT INTO public.user_login_events(user_id,method,session_digest,created_at) VALUES ($1,'PASSWORD',$2,$3)", [actor.id, digest, time]);
    await db.query("INSERT INTO public.audit_logs(actor_type,action,entity_type,created_at) VALUES ('USER','USER_LOCKED','USER',$1)", [time]);
    await db.query('INSERT INTO public.support_reports(owner_id, request_id, content, created_at) VALUES ($1,$2,$3,$4)',
      [learner.id, randomUUID(), 'Phiếu kiểm tra ranh giới giờ', time]);
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
  assert.equal(measured.supportReports, 2);
  assert.deepEqual(measured.dailyFlashcards, [{ day: '2025-01-01', sessions: 2 }]);
  assert.equal((await request('/admin/statistics?from=2024-01-01&to=2025-01-02', { token: tokens.actor })).body.dailyFlashcards.length, 7);
  await db.query("DELETE FROM public.user_login_events WHERE created_at < '2025-02-01'");
  await db.query("DELETE FROM public.audit_logs WHERE created_at < '2025-02-01'");

  await t.test('Support and notifications enforce ownership, retry once and persist read state', async () => {
    const teacher = { id: randomUUID(), auth: randomUUID() };
    await db.query('INSERT INTO auth.users (id, email) VALUES ($1,$2)', [teacher.auth, teacher.auth + '@example.test']);
    await db.query("UPDATE public.users SET id=$1, role='TEACHER' WHERE auth_user_id=$2", [teacher.id, teacher.auth]);
    const teacherToken = await getToken(teacher);
    const mine = '/support/reports';
    const queue = '/admin/support/reports';
    const inbox = '/notifications';
    const payload = { requestId: randomUUID(), text: 'Không mở được bản luyện.' };
    const send = (json = payload) => request(mine, { token: tokens.learner, method: 'POST', json });
    const owner = { token: tokens.learner };
    const staff = { token: tokens.actor };
    assert.equal((await request(inbox)).status, 401);
    assert.equal((await request(queue, owner)).status, 403);
    assert.equal((await send({ ...payload, ownerId: teacher.id })).status, 400);
    const first = await send();
    assert.equal(first.status, 201);
    const id = first.body.id;
    const pending = await send();
    assert.equal(pending.status, 200);
    assert.equal(pending.body.id, id);
    assert.equal((await send({ ...payload, text: 'Nội dung khác.' })).status, 409);
    assert.equal((await request(mine, { token: teacherToken })).body.items.length, 0);
    assert.equal((await request(`${mine}/${id}`, { token: teacherToken })).status, 404);
    const createdByTeacher = await request(mine, { token: teacherToken, method: 'POST', json: { ...payload, requestId: randomUUID() } });
    assert.equal(createdByTeacher.status, 201);
    assert.equal((await request(queue, staff)).body.counts.PENDING, 6);

    const change = json => request(`${queue}/${id}`, { ...staff, method: 'PATCH', json });
    const answer = { status: 'IN_PROGRESS', reply: 'Đang kiểm tra.', revision: 0 };
    failAudit = true;
    assert.equal((await change(answer)).status, 500);
    failAudit = false;
    assert.equal((await request(`${mine}/${id}`, owner)).body.revision, 0);
    assert.equal((await request(inbox + '/unread-count', owner)).body.unread, 0);
    assert.equal((await change(answer)).body.revision, 1);
    assert.equal((await change(answer)).body.revision, 1);
    assert.equal((await change({ ...answer, status: 'RESOLVED' })).body.code, 'SUPPORT_REPORT_CHANGED');
    const reopened = (await request(`${mine}/${id}`, owner)).body;
    assert.equal(reopened.reply, answer.reply);
    assert.equal(reopened.status, answer.status);
    assert.equal((await request(queue + '?status=IN_PROGRESS', staff)).body.items.length, 1);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.support_report_updates WHERE report_id=$1', [id])).rows[0].n, 1);
    const notice = (await request(inbox, owner)).body.items[0];
    assert.equal(notice.referenceId, id);
    assert.equal(notice.referenceType, 'SUPPORT_REPORT');
    assert.ok(!notice.content.includes(answer.reply));
    const noticePath = `${inbox}/${notice.id}/read`;
    const mark = { ...owner, method: 'PATCH' };
    assert.equal((await request(noticePath, { token: teacherToken, method: 'PATCH' })).status, 404);
    const onceRead = (await request(noticePath, mark)).body.readAt;
    assert.equal((await request(noticePath, mark)).body.readAt, onceRead);
    assert.equal((await request(inbox + '/unread-count', owner)).body.unread, 0);
    await db.query(`INSERT INTO public.notifications(recipient_id,event_key,type,title)
      SELECT $1, 'pagination:' || i, 'TEST', 'Thông báo thử' FROM generate_series(1,21) AS i`, [learner.id]);
    assert.equal((await request(inbox + '/unread-count', owner)).body.unread, 21);
    const firstPage = (await request(inbox + '?unread=1', owner)).body;
    assert.equal(firstPage.items.length, 20);
    const nextPage = (await request(inbox + '?unread=1&after=' + firstPage.nextCursor, owner)).body;
    assert.equal(nextPage.items.length, 1);
    assert.ok(firstPage.items.every(item => item.id !== nextPage.items[0].id));
    assert.equal((await request(inbox + '/read-all', { ...owner, method: 'POST' })).status, 204);
    assert.equal((await request(inbox + '/unread-count', owner)).body.unread, 0);
    await db.query("UPDATE public.users SET status='LOCKED' WHERE id=$1", [learner.id]);
    assert.equal((await request(inbox, owner)).status, 403);
    assert.equal((await request(mine, owner)).status, 403);
    await db.query("UPDATE public.users SET status='ACTIVE' WHERE id=$1", [learner.id]);
  });

  await t.test('Announcement scheduling snapshots active recipients at delivery and retries safely', async () => {
    const { dispatchAnnouncement } = await import('../dist/modules/notifications/announcements.js');
    const path = '/admin/notifications/announcements';
    const manager = { token: tokens.actor };
    const create = json => request(path, { ...manager, method: 'POST', json });
    const submitted = { requestId: randomUUID(), title: 'Tin thử', content: 'Nội dung thử', audience: 'TEACHER' };
    assert.equal((await request(path, { token: tokens.learner })).status, 403);
    const created = await create(submitted);
    assert.equal(created.status, 201);
    const recovered = await create(submitted);
    assert.equal(recovered.status, 200);
    assert.equal(recovered.body.id, created.body.id);
    assert.equal((await create({ ...submitted, title: 'Thay đổi' })).status, 409);
    const id = created.body.id;
    const revise = json => request(`${path}/${id}`, { ...manager, method: 'PATCH', json });
    const edit = { title: 'Tin đã sửa', content: submitted.content, audience: 'TEACHER', revision: recovered.body.revision };
    const updated = await revise(edit);
    assert.equal(updated.body.revision, 1);
    assert.deepEqual((await revise(edit)).body, updated.body);
    assert.equal((await revise({ ...edit, title: 'Sửa từ tab khác' })).status, 409);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.audit_logs WHERE entity_id=$1 AND action='ANNOUNCEMENT_DRAFT_UPDATED'", [id])).rows[0].n, 1);
    const send = json => request(`${path}/${id}/send`, { ...manager, method: 'POST', json });
    assert.equal((await send({ mode: 'scheduled', revision: 1, scheduledAt: '2000-01-01T00:00:00Z' })).status, 400);
    assert.equal((await send({ mode: 'scheduled', revision: 1, scheduledAt: new Date(Date.now() + 3_600_000).toISOString() })).status, 202);
    assert.equal(await dispatchAnnouncement(id), false);
    assert.equal((await revise({ title: 'Tin đã sửa', content: 'Khác', audience: 'ALL', revision: 2 })).status, 409);
    await db.query("UPDATE public.users SET role='TEACHER' WHERE id=$1", [second.id]);
    await db.query("UPDATE public.announcements SET scheduled_at=now()-interval '1 second' WHERE id=$1", [id]);
    await db.exec(`
      CREATE FUNCTION public.reject_test_announcement() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN RAISE EXCEPTION 'Simulated delivery failure'; END
      $$;
      CREATE TRIGGER reject_test_announcement BEFORE INSERT ON public.notifications
      FOR EACH ROW WHEN (NEW.reference_type='ANNOUNCEMENT') EXECUTE FUNCTION public.reject_test_announcement();
    `);
    await assert.rejects(dispatchAnnouncement(id), /Simulated delivery failure/);
    assert.equal((await db.query('SELECT status FROM public.announcements WHERE id=$1', [id])).rows[0].status, 'SCHEDULED');
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.notifications WHERE reference_id=$1', [id])).rows[0].n, 0);
    await db.exec('DROP TRIGGER reject_test_announcement ON public.notifications; DROP FUNCTION public.reject_test_announcement()');
    assert.equal((await Promise.all([dispatchAnnouncement(id), dispatchAnnouncement(id)])).filter(Boolean).length, 1);
    assert.equal((await send({ mode: 'now', revision: 1 })).body.status, 'SENT');
    const recipients = (await db.query('SELECT recipient_id FROM public.notifications WHERE reference_id=$1 ORDER BY recipient_id', [id])).rows;
    assert.ok(recipients.some(entry => entry.recipient_id === second.id));
    assert.ok(recipients.every(entry => ![actor.id, learner.id].includes(entry.recipient_id)));
    assert.equal((await request(path, manager)).body.items[0].recipientCount, recipients.length);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.audit_logs WHERE entity_id=$1 AND action='ANNOUNCEMENT_SENT'", [id])).rows[0].n, 1);
    await db.query("UPDATE public.users SET role='ADMIN' WHERE id=$1", [second.id]);
    await db.query("UPDATE public.users SET status='LOCKED' WHERE id=$1", [learner.id]);
    const immediate = (await create({ ...submitted, requestId: randomUUID(), audience: 'ALL' })).body;
    const sent = await request(`${path}/${immediate.id}/send`, { ...manager, method: 'POST', json: { mode: 'now', revision: 0 } });
    assert.equal(sent.body.status, 'SENT');
    const all = (await db.query('SELECT recipient_id FROM public.notifications WHERE reference_id=$1', [immediate.id])).rows;
    assert.ok(all.some(entry => entry.recipient_id === actor.id));
    assert.ok(all.every(entry => entry.recipient_id !== learner.id));
    const empty = (await create({ ...submitted, requestId: randomUUID(), audience: 'LEARNER' })).body;
    assert.equal((await request(`${path}/${empty.id}/send`, {
      ...manager, method: 'POST', json: { mode: 'now', revision: 0 },
    })).body.recipientCount, 0);
    await db.query("UPDATE public.users SET status='ACTIVE' WHERE id=$1", [learner.id]);
  });

  await t.test('Grading templates, expiry and details use confirmed state and enforce access', async () => {
    const { dispatchExpiryReminders, recordGradingTransition } = await import('../dist/modules/notifications/grading-notifications.js');
    const config = '/admin/notifications/settings';
    const manager = { token: tokens.actor };
    const learnerPath = '/admin/users/' + learner.id;
    const learningSummary = async () => {
      const response = await request(learnerPath, manager);
      assert.equal(response.status, 200);
      assert.equal(response.cache, 'private, no-store');
      return response.body.learning;
    };
    assert.deepEqual(await learningSummary(), { completedAttempts: 0, availableBonusCredits: 0, pendingGradingRequests: 0 });
    assert.equal((await request(learnerPath)).status, 401);
    assert.equal((await request(learnerPath, { token: tokens.learner })).status, 403);
    assert.equal((await request('/admin/users/' + actor.id, manager)).body.learning, null);

    const patch = (event, json) => request(`${config}/${event}`, { ...manager, method: 'PATCH', json });
    const result = (await request(config, manager)).body.items;
    assert.equal(result.length, 6);
    const template = { title: 'Nhắc {{skill}}', content: 'Hạn {{expiresAt}}', enabled: true, leadHours: 24, revision: 0 };
    assert.equal((await patch('CONTENT_EXPIRING', { ...template, title: '{{email}}' })).status, 400);
    assert.equal((await patch('GRADING_ASSIGNED', { ...template, content: 'Bài mới', enabled: false, leadHours: null })).status, 400);
    assert.equal((await patch('CONTENT_EXPIRING', template)).body.revision, 1);
    assert.equal((await patch('CONTENT_EXPIRING', template)).status, 409);
    const [{ skill_id: skillId }] = (await db.query(`
      WITH collection AS (INSERT INTO public.exam_sets(name) VALUES ('Reminder fixture') RETURNING id),
      exam AS (INSERT INTO public.exams(exam_set_id,title,order_no) SELECT id,'Fixture',1 FROM collection RETURNING id),
      skill AS (INSERT INTO public.exam_skills(exam_id,skill,version_number,duration_minutes)
        SELECT id,'SPEAKING',1,12 FROM exam RETURNING id),
      section AS (INSERT INTO public.exam_sections(exam_skill_id,title,section_type,order_no)
        SELECT id,'Part','PART',1 FROM skill RETURNING id),
      writing AS (INSERT INTO public.exam_skills(exam_id,skill,form,version_number,duration_minutes)
        SELECT id,'WRITING','ACADEMIC',1,60 FROM exam RETURNING id),
      attempt AS (INSERT INTO public.attempts(user_id,exam_id,attempt_type,status,completed_at)
        SELECT $1,id,'FULL_EXAM','COMPLETED',now() FROM exam RETURNING id,exam_id),
      extra_attempts AS (INSERT INTO public.attempts(user_id,exam_id,attempt_type,status,completed_at)
        SELECT $1::uuid,id,'FULL_SKILL','ABANDONED',NULL FROM exam
        UNION ALL SELECT $1::uuid,id,'FULL_SKILL','COMPLETED',now()+interval '1 day' FROM exam
        UNION ALL SELECT $2::uuid,id,'FULL_SKILL','COMPLETED',now() FROM exam),
      second_skill AS (INSERT INTO public.skill_attempts(attempt_id,exam_skill_id,status,deadline_at,completed_at)
        SELECT attempt.id,writing.id,'COMPLETED',now()+interval '1 minute',now() FROM attempt,writing),
      done AS (INSERT INTO public.skill_attempts(attempt_id,exam_skill_id,status,deadline_at,content_expires_at)
        SELECT attempt.id,skill.id,'COMPLETED',now()+interval '1 minute',now()+interval '1 hour' FROM attempt,skill RETURNING id)
      INSERT INTO public.submission_contents(skill_attempt_id,section_id,text_content)
      SELECT done.id,section.id,'Private fixture' FROM done,section RETURNING skill_attempt_id AS skill_id
    `, [learner.id, actor.id])).rows;
    await db.query(`
      INSERT INTO public.support_credits(user_id,credit_type,week_start,valid_from,expires_at)
      VALUES ($1,'BONUS',NULL,now()-interval '2 days',now()-interval '1 day'),
             ($1,'BONUS',NULL,now()+interval '1 day',now()+interval '2 days'),
             ($1,'FREE_WEEKLY',date_trunc('week',now())::date,now(),now()+interval '1 day'),
             ($2,'BONUS',NULL,now(),now()+interval '1 day')`, [learner.id, actor.id]);
    assert.equal(await dispatchExpiryReminders(), 1);
    assert.equal(await dispatchExpiryReminders(), 0);
    const [notice] = (await db.query("SELECT id,title,content FROM public.notifications WHERE reference_id=$1 AND type='CONTENT_EXPIRING'", [skillId])).rows;
    assert.equal(notice.title, 'Nhắc Speaking');
    assert.ok(!notice.content.includes('{{') && !notice.content.includes('Private fixture'));
    const target = '/notifications/' + notice.id + '/target';
    assert.equal((await request(target, { token: tokens.learner })).body.skill, 'SPEAKING');
    assert.equal((await request(target, manager)).status, 404);
    await db.query("UPDATE public.skill_attempts SET content_expires_at=now()-interval '1 second' WHERE id=$1", [skillId]);
    assert.equal((await request(target, { token: tokens.learner })).status, 410);
    const [grading] = (await db.query(`
      WITH credit AS (INSERT INTO public.support_credits(user_id,credit_type,valid_from,expires_at,used_at)
        VALUES($1,'BONUS',now(),now()+interval '2 days',now()) RETURNING id)
      INSERT INTO public.grading_requests(skill_attempt_id,used_credit_id,assignment_deadline)
      SELECT $2,id,now()+interval '72 hours' FROM credit RETURNING id
    `, [learner.id, skillId])).rows;
    assert.deepEqual(await learningSummary(), { completedAttempts: 1, availableBonusCredits: 0, pendingGradingRequests: 1 });
    const event = type => db.transaction(tx => recordGradingTransition(sqlClient(tx), type, grading.id));
    await event('GRADING_REQUEST_ACCEPTED');
    await event('GRADING_REQUEST_ACCEPTED');
    await event('GRADING_RESULT_PUBLISHED'); // Draft/waiting state must not announce a result.
    await db.query("UPDATE public.skill_attempts SET content_expires_at=now()+interval '2 hours' WHERE id=$1", [skillId]);
    assert.equal(await dispatchExpiryReminders(), 0, 'Active grading disables the reminder');
    const { invalidateUserCache } = await import('../dist/middleware/auth.js');
    await db.query("UPDATE public.users SET role='TEACHER' WHERE id=$1", [second.id]);
    invalidateUserCache(second.auth);
    await db.query("UPDATE public.grading_requests SET status='ASSIGNED',teacher_id=$2,assigned_at=now() WHERE id=$1", [grading.id, second.id]);
    assert.equal((await request(learnerPath, { token: tokens.second })).status, 403);
    assert.equal((await request('/admin/users/' + second.id, manager)).body.learning, null);
    assert.equal((await learningSummary()).pendingGradingRequests, 1);
    await event('GRADING_ASSIGNED');
    const [assigned] = (await db.query("SELECT id,recipient_id FROM public.notifications WHERE reference_id=$1 AND type='GRADING_ASSIGNED'", [grading.id])).rows;
    assert.equal(assigned.recipient_id, second.id);
    assert.equal((await request('/notifications/' + assigned.id + '/target', { token: tokens.second })).status, 200);
    await db.query("UPDATE public.grading_requests SET status='CANCELLED',cancelled_at=now(),cancel_reason='TEACHER_UNAVAILABLE' WHERE id=$1", [grading.id]);
    assert.equal((await learningSummary()).pendingGradingRequests, 0);
    await event('GRADING_CANCELLED_REFUNDED');
    await event('GRADING_CANCELLED');
    assert.equal((await request('/notifications/' + assigned.id + '/target', { token: tokens.second })).status, 404);
    await db.query(`
      WITH bonus AS (INSERT INTO public.support_credits(user_id,credit_type,valid_from,expires_at)
        VALUES($1,'BONUS',now(),now()+interval '2 days') RETURNING id)
      INSERT INTO public.credit_refunds(grading_request_id,bonus_credit_id,status,refunded_at)
      SELECT $2,id,'COMPLETED',now() FROM bonus
    `, [learner.id, grading.id]);
    await event('GRADING_CANCELLED_REFUNDED');
    assert.deepEqual((await db.query("SELECT type FROM public.notifications WHERE recipient_id=$1 AND reference_id=$2 ORDER BY type",
      [learner.id, grading.id])).rows, [{ type: 'GRADING_CANCELLED_REFUNDED' }, { type: 'GRADING_REQUEST_ACCEPTED' }]);
    const [published] = (await db.query(`
      WITH credit AS (INSERT INTO public.support_credits(user_id,credit_type,valid_from,expires_at,used_at)
        VALUES($1,'BONUS',now(),now()+interval '2 days',now()) RETURNING id),
      rule AS (INSERT INTO public.grading_rules(name,skill,assessment_scope,version,aggregation_rules,rounding_rules)
        VALUES('Fixture','SPEAKING','FULL_SKILL',1,'{}','{}') RETURNING id),
      submitted AS (INSERT INTO public.grading_requests(skill_attempt_id,used_credit_id,assignment_deadline,status,teacher_id,assigned_at)
        SELECT $2,id,now()+interval '72 hours','COMPLETED',$3,now() FROM credit RETURNING id)
      INSERT INTO public.grading_reviews(grading_request_id,teacher_id,grading_rule_id,status,overall_score,published_at)
      SELECT submitted.id,$3,rule.id,'PUBLISHED',7.5,now() FROM submitted,rule RETURNING grading_request_id AS id
    `, [learner.id, skillId, second.id])).rows;
    const balance = await request('/learner/grading/credits', { token: tokens.learner });
    assert.equal(balance.status, 200);
    assert.equal(balance.body.bonus.count, 1);
    assert.deepEqual(await learningSummary(), { completedAttempts: 1, availableBonusCredits: balance.body.bonus.count, pendingGradingRequests: 0 });
    await db.transaction(tx => recordGradingTransition(sqlClient(tx), 'GRADING_RESULT_PUBLISHED', published.id));
    assert.equal((await db.query("SELECT recipient_id FROM public.notifications WHERE reference_id=$1 AND type='GRADING_RESULT_PUBLISHED'", [published.id])).rows[0].recipient_id, learner.id);
    assert.equal(await dispatchExpiryReminders(), 1, 'A changed effective deadline has its own reminder');
    await db.query("UPDATE public.users SET role='ADMIN' WHERE id=$1", [second.id]);
    invalidateUserCache(second.auth);
  });

  const legacyLogin = await request('/auth/login', { method: 'POST',
    json: { email: 'legacy-admin@example.test', password: 'admin-fixture-password' } });
  assert.equal(legacyLogin.status, 200);
  assert.equal(legacyLogin.body.user.role, 'ADMIN');
  assert.equal(legacyLogin.body.user.must_change_password, false);
  const legacyRefresh = await request('/auth/refresh', { method: 'POST', cookie: legacyLogin.cookies[0].split(';')[0] });
  assert.equal(legacyRefresh.status, 200);
  assert.equal(legacyRefresh.body.user.role, 'ADMIN');
  assert.equal(legacyRefresh.body.user.must_change_password, false);
  const staffMigration = await readFile(new URL('../../docs/csdl/24_staff_accounts_and_authenticator.sql', import.meta.url), 'utf8');
  await db.exec(staffMigration);
  await db.exec(staffMigration);
  const previousStaff = { fullName: 'Giáo viên thử lại', email: 'retry@example.test', role: 'TEACHER', writing: true, speaking: false, maxPending: 10 };
  const previousAuth = { auth: randomUUID(), email: previousStaff.email, password: 'inaccessible-old-fixture', metadata: {
    ieltspace_invitation_proof: 'managed-account-v1', ieltspace_staff_created: true,
    ieltspace_staff_creation: { actorId: actor.id, role: 'TEACHER', writing: true, speaking: false, maxPending: 10 },
  } };
  await db.query('INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,$2,$3)',
    [previousAuth.auth, previousStaff.email, { full_name: previousStaff.fullName }]);
  await db.query('UPDATE auth.users SET raw_app_meta_data=$2 WHERE id=$1', [previousAuth.auth, previousAuth.metadata]);
  createdAuth.set(previousAuth.email, previousAuth);
  const fixStaffMigration = await readFile(new URL('../../docs/csdl/25_staff_auth_metadata.sql', import.meta.url), 'utf8');
  await db.exec(fixStaffMigration);
  await db.exec(fixStaffMigration);
  const retryStaff = (account, token = tokens.actor) => request('/admin/users/staff', {
    token, method: 'POST', json: { account },
  });
  assert.equal((await retryStaff({ ...previousStaff, maxPending: 11 })).status, 409);
  assert.equal((await retryStaff(previousStaff, tokens.second)).status, 409);
  await db.query('UPDATE auth.users SET last_sign_in_at=now() WHERE id=$1', [previousAuth.auth]);
  assert.equal((await retryStaff(previousStaff)).status, 409);
  await db.query('UPDATE auth.users SET last_sign_in_at=null WHERE id=$1', [previousAuth.auth]);
  const recover = await retryStaff(previousStaff);
  assert.equal(recover.status, 201);
  assert.equal(recover.body.temporaryPassword, previousAuth.password);
  assert.notEqual(previousAuth.password, 'inaccessible-old-fixture');
  const recovered = await client.users.findUnique({ where: { id: recover.body.id } });
  assert.equal(recovered.role, 'TEACHER');
  assert.equal(recovered.auth_user_id, previousAuth.auth);
  assert.equal(recovered.must_change_password, true);
  assert.deepEqual((await db.query('SELECT skill,max_pending FROM public.teacher_permissions WHERE teacher_id=$1', [recovered.id])).rows,
    [{ skill: 'WRITING', max_pending: 10 }]);
  assert.equal((await retryStaff(previousStaff)).status, 409);
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
  const change = (user, action, code, token = tokens.actor) =>
    request('/admin/users/' + user.id + '/' + action.kind, { token, method: 'PATCH', json: { action, code } });
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
  const mfa = '/auth/me/authenticator';
  const enroll = (token = tokens.actor) => request(mfa + '/enroll', { token, method: 'POST' });
  const setupCode = (factorId, code, token = tokens.actor) => request(mfa + '/verify', { token, method: 'POST', json: { factorId, code } });
  assert.equal((await change(second, demote)).body.code, 'AUTHENTICATOR_REQUIRED');
  assert.equal((await change(second, demote, '123456')).body.code, 'AUTHENTICATOR_NOT_CONFIGURED');
  assert.equal((await enroll(tokens.learner)).status, 403);
  assert.deepEqual((await adminGet('/' + second.id)).body.auth.source, 'EMAIL');
  assert.deepEqual((await request(mfa, { token: tokens.actor })).body, { enabled: false });
  const enrollment = await enroll();
  assert.equal(enrollment.status, 201);
  assert.equal(enrollment.body.qrCode, 'data:image/svg+xml;base64,' + Buffer.from('<svg/>').toString('base64'));
  assert.equal(enrollment.body.secret, undefined);
  assert.equal((await setupCode(factors.get(second.auth).id, '123456')).status, 409);
  assert.equal((await setupCode(enrollment.body.factorId, '000000')).body.code, 'AUTHENTICATOR_FAILED');
  const verified = await setupCode(enrollment.body.factorId, '123456');
  assert.equal(verified.status, 200);
  assert.match(verified.cookies[0], /ielts_refresh_token=.*HttpOnly/i);
  assert.ok(verified.body.session.accessToken);
  assert.deepEqual((await request(mfa, { token: verified.body.session.accessToken })).body, { enabled: true });
  assert.equal((await enroll()).body.code, 'AUTHENTICATOR_EXISTS');
  assert.equal((await change(second, demote, '000000')).body.code, 'AUTHENTICATOR_FAILED');
  assert.equal((await change(second, demote, '12345')).status, 400);
  assert.equal((await change(second, demote)).body.code, 'AUTHENTICATOR_REQUIRED', 'A new action always requires a code');
  const race = await Promise.all([change(second, demote, '123456'), change(actor, demote, '123456', tokens.second)]);
  assert.deepEqual(race.map(value => value.status).sort(), [200, 403]);
  assert.equal(await client.users.count(), 1);
  assert.equal(race.filter(result => result.status === 200 && result.cookies.some(cookie => cookie.includes('HttpOnly'))).length, 1);

  const activeToken = race[0].status === 200 ? tokens.actor : tokens.second;
  const activeAdmin = race[0].status === 200 ? actor : second;
  const createStaff = (account, code, token = activeToken) => request('/admin/users/staff', {
    token, method: 'POST', json: { account, code },
  });
  const staff = { fullName: 'Giáo viên mới', email: 'staff@example.test', role: 'TEACHER', writing: true, speaking: false, maxPending: 4 };
  const admin = { fullName: 'Quản lý mới', email: 'staff-admin@example.test', role: 'ADMIN' };
  assert.equal((await createStaff(admin)).body.code, 'AUTHENTICATOR_REQUIRED');
  assert.equal((await createStaff(staff, undefined, tokens.learner)).status, 403);
  assert.equal((await createStaff({ ...staff, email: learner.auth + '@example.test' })).body.code, 'STAFF_EMAIL_EXISTS');
  const results = await Promise.all([createStaff(staff), createStaff(staff)]);
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  const created = results.find(result => result.status === 201);
  assert.equal(created.body.status, 'ACTIVE');
  assert.equal(created.body.email, staff.email);
  assert.match(created.cache, /no-store/i);
  assert.ok(created.body.temporaryPassword.length >= 24);
  const profile = await client.users.findUnique({ where: { id: created.body.id } });
  assert.equal(profile.status, 'ACTIVE');
  assert.equal(profile.role, 'TEACHER');
  assert.equal(profile.full_name, staff.fullName);
  assert.deepEqual((await db.query('SELECT skill, max_pending FROM public.teacher_permissions WHERE teacher_id = $1', [profile.id])).rows,
    [{ skill: 'WRITING', max_pending: 4 }]);
  const staffDetails = await request('/admin/users/' + profile.id, { token: activeToken });
  assert.equal(staffDetails.body.auth.source, 'STAFF');
  assert.equal(staffDetails.body.temporaryPassword, undefined);
  const staffAudit = await request('/admin/users/' + profile.id + '/history?kind=admin', { token: activeToken });
  assert.equal(staffAudit.body.items[0].action, 'USER_CREATED');
  const staffPassword = { method: 'POST', json: { email: staff.email, password: created.body.temporaryPassword } };
  const staffLogin = await request('/auth/login', staffPassword);
  assert.equal(staffLogin.body.user.role, 'TEACHER');
  assert.equal(staffLogin.body.user.must_change_password, true);
  const staffToken = staffLogin.body.session.accessToken;
  const refreshCookie = cookie => cookie.split(';')[0];
  assert.equal((await request('/auth/refresh', { method: 'POST', cookie: refreshCookie(staffLogin.cookies[0]) })).body.user.must_change_password, true);
  const changePassword = (token, currentPassword, newPassword, code) =>
    request('/auth/me/password', { token, method: 'POST', json: { currentPassword, newPassword, code } });
  const personalPassword = 'own-password-123';
  assert.equal((await changePassword(staffToken, 'incorrect', personalPassword)).status, 400);
  assert.equal((await request('/auth/me', { token: staffToken })).body.user.must_change_password, true);
  assert.equal((await changePassword(staffToken, created.body.temporaryPassword, personalPassword)).status, 200);
  assert.equal((await request('/auth/login', staffPassword)).status, 401);
  const personalLogin = await request('/auth/login', { method: 'POST', json: { email: staff.email, password: personalPassword } });
  assert.equal(personalLogin.body.user.must_change_password, false);
  assert.equal((await change(profile, { ...lock, previousRole: 'TEACHER' }, undefined, activeToken)).body.status, 'LOCKED');
  assert.equal((await request('/auth/me', { token: await getToken(createdAuth.get(staff.email)) })).status, 403);
  assert.equal((await change(profile, { ...lock, previousRole: 'TEACHER', previousStatus: 'LOCKED', status: 'ACTIVE' },
    undefined, activeToken)).body.role, 'TEACHER');

  const adminCreation = await createStaff(admin, '123456');
  assert.equal(adminCreation.status, 201);
  assert.equal((await request('/auth/login', { method: 'POST',
    json: { email: admin.email, password: adminCreation.body.temporaryPassword } })).body.user.role, 'ADMIN');
  const newAdminToken = await getToken(createdAuth.get(admin.email));
  assert.equal((await enroll(newAdminToken)).body.code, 'TEMPORARY_PASSWORD');
  assert.deepEqual(unexpectedProviderRequests, []);
  recoveryTokens.set('mfa-recovery-fixture', activeAdmin);
  const reset = (code, cookie) => request('/auth/reset-password', { method: 'POST', cookie, json: {
    tokenHash: 'mfa-recovery-fixture', password: 'new-admin-password', code,
  } });
  const step = await reset();
  assert.equal(step.body.code, 'AUTHENTICATOR_REQUIRED');
  assert.match(step.cookies[0], /ielts_recovery_session=.*HttpOnly/i);
  const recovery = refreshCookie(step.cookies[0]);
  const tampered = recovery.slice(0, -1) + (recovery.endsWith('f') ? '0' : 'f');
  assert.equal((await reset('123456', tampered)).body.code, 'INVALID_RECOVERY');
  assert.equal((await reset('000000', recovery)).body.code, 'AUTHENTICATOR_FAILED');
  assert.equal((await reset('123456', recovery)).status, 200);
  assert.equal((await reset('123456')).body.code, 'INVALID_RECOVERY');

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

  await t.test('Deleting a learner removes their support tickets and replies in the same transaction', async () => {
    await db.query("UPDATE public.users SET role='LEARNER' WHERE id=$1", [learner.id]);
    const options = { token: activeToken };
    const queue = '/admin/support/reports';
    const before = (await request(queue, options)).body;
    const [answered] = before.items.filter(item => item.status === 'IN_PROGRESS');
    assert.ok(answered.reply);

    const action = { ...deleteAction, previousRole: 'LEARNER' };
    failAudit = true;
    try {
      assert.equal((await remove(learner.id, action)).status, 500);
    } finally {
      failAudit = false;
    }
    assert.deepEqual((await request(queue, options)).body, before);
    assert.equal((await request(statsPath, options)).body.supportReports, 2);

    assert.equal((await remove(learner.id, action)).status, 200);
    const after = (await request(queue, options)).body;
    assert.deepEqual(after.counts, { PENDING: 1 });
    assert.equal(after.items.length, 1);
    assert.ok(before.items.some(item => item.id === after.items[0].id));
    assert.equal((await request(statsPath, options)).body.supportReports, 0);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.support_reports WHERE owner_id=$1', [learner.id])).rows[0].n, 0);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.support_report_updates WHERE report_id=$1', [answered.id])).rows[0].n, 0);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.notifications WHERE reference_id=$1', [answered.id])).rows[0].n, 0);
    const update = await request(`${queue}/${answered.id}`, { ...options, method: 'PATCH',
      json: { status: 'RESOLVED', reply: 'Fixture', revision: answered.revision } });
    assert.equal(update.status, 404);
    assert.equal((await remove(learner.id, action)).body.changed, false);
  });
});
