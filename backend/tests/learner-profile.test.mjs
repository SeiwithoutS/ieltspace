import assert from 'node:assert/strict';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';
import test from 'node:test';

const useR2 = process.env.PROFILE_TEST_STORAGE === 'r2';
const r2Host = '0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com';
Object.assign(process.env, {
  NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000',
  AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
  SUPABASE_URL: 'https://profile-test.example', SUPABASE_PUBLISHABLE_KEY: 'test-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service', STORAGE_BUCKET_AVATARS: 'avatars', AVATAR_STORAGE_PROVIDER: useR2 ? 'r2' : 'supabase',
  R2_ENDPOINT: `https://${r2Host}`, R2_ACCESS_KEY_ID: 'test-access', R2_SECRET_ACCESS_KEY: 'test-secret',
  R2_AVATAR_BUCKET: 'avatars-test', R2_RECORDINGS_BUCKET: 'recordings-test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
});

const { app } = await import('../dist/app.js');
const { prisma } = await import('../dist/lib/prisma.js');
const { recordingsBucket } = await import('../dist/integrations/storage/r2-storage.js');

function requestApp(path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`No response for ${method} ${path}`)), 4000);
    const chunks = [];
    const socket = new Duplex({
      read() {},
      write(chunk, _encoding, done) { chunks.push(Buffer.from(chunk)); done(); },
    });
    socket.remoteAddress = '127.0.0.1';
    const req = new IncomingMessage(socket);
    Object.assign(req, { method, url: `/api/auth/me${path}`, headers, complete: true, httpVersion: '1.1', httpVersionMajor: 1, httpVersionMinor: 1 });
    if (body !== undefined) {
      req.headers['content-length'] = String(Buffer.byteLength(body));
      req.push(body);
    }
    req.push(null);
    const res = new ServerResponse(req);
    res.assignSocket(socket);
    res.on('error', error => { clearTimeout(timeout); reject(error); });
    res.on('finish', () => {
      clearTimeout(timeout);
      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(res.getHeaders())) {
        for (const item of [value].flat()) responseHeaders.append(key, String(item));
      }
      const wire = Buffer.concat(chunks);
      resolve(new Response(res.statusCode === 204 ? null : wire.subarray(wire.indexOf('\r\n\r\n') + 4), {
        status: res.statusCode, headers: responseHeaders,
      }));
    });
    app(req, res);
  });
}

test('Learner profile protects ownership, private avatars, and password changes', async t => {
  const learner = { id: '11111111-1111-4111-8111-111111111111', auth_user_id: '22222222-2222-4222-8222-222222222222', role: 'LEARNER', status: 'ACTIVE', full_name: 'Mai An', email: 'learner@example.test', display_name: null, avatar_url: null };
  const admin = { ...learner, id: '33333333-3333-4333-8333-333333333333', auth_user_id: '44444444-4444-4444-8444-444444444444', role: 'ADMIN' };
  const objects = new Set();
  const profile = ({ where }) => {
    return [learner, admin].find(user => Object.entries(where).every(([key, value]) => user[key] === value)) ?? null;
  };
  const replace = (object, method, value) => {
    Object.defineProperty(object, method, { value, configurable: true });
    t.after(() => { delete object[method]; });
  };
  replace(prisma.users, 'findUnique', async args => profile(args));
  replace(prisma.users, 'updateManyAndReturn', async args => {
    const user = profile(args);
    return user ? [{ ...Object.assign(user, args.data) }] : [];
  });
  replace(prisma, '$transaction', async operation => operation({
    $queryRaw: async () => [{ avatar_url: learner.avatar_url }],
    users: { update: async args => ({ ...Object.assign(profile(args), args.data) }) },
  }));

  let google = false;
  let providerPassword = 'original-password';
  let recoveryEmail;
  let signOutScope;
  const httpFetch = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (target, options) => {
    const url = new URL(target instanceof Request ? target.url : target);
    if (url.hostname === r2Host) {
      assert.ok(target instanceof Request);
      assert.match(target.headers.get('authorization'), /AWS4-HMAC-SHA256/);
      assert.match(url.pathname, /^\/(avatars|recordings)-test\//);
      const recording = url.pathname.startsWith('/recordings-test/');
      const key = recording ? url.pathname : url.pathname.slice('/avatars-test/'.length);
      if (target.method === 'PUT') {
        assert.equal(target.headers.get('content-type'), recording ? 'audio/wav' : 'image/png');
        assert.ok((await target.arrayBuffer()).byteLength > 4);
        objects.add(key);
        return new Response(null, { status: 200 });
      }
      assert.equal(target.method, 'DELETE');
      objects.delete(key);
      return new Response(null, { status: 204 });
    }
    if (url.hostname !== 'profile-test.example') return httpFetch(target, options);
    const method = options?.method || 'GET';
    const path = url.pathname;
    const headers = new Headers(options?.headers);
    const body = () => JSON.parse(options.body);
    const authUser = owner => ({ id: owner.auth_user_id, email: owner.email, email_confirmed_at: '2026-11-20T00:00:00Z', identities: [{ provider: google ? 'google' : 'email' }] });
    if (path === '/auth/v1/user' && method === 'GET') return Response.json(authUser(headers.get('authorization')?.endsWith('admin-token') ? admin : learner));
    if (path === '/auth/v1/token') {
      assert.equal(body().email, learner.email);
      return body().password === providerPassword
        ? Response.json({ access_token: 'fresh-token', refresh_token: 'fresh-refresh', expires_in: 3600, token_type: 'bearer', user: authUser(learner) })
        : Response.json({ code: 'invalid_credentials', msg: 'Invalid credentials' }, { status: 400 });
    }
    if (path === '/auth/v1/user' && method === 'PUT') {
      assert.equal(headers.get('authorization'), 'Bearer fresh-token');
      assert.equal(body().current_password, providerPassword);
      providerPassword = body().password;
      return Response.json(authUser(learner));
    }
    if (path === '/auth/v1/logout') {
      signOutScope = url.searchParams.get('scope');
      return new Response(null, { status: 204 });
    }
    if (path === '/auth/v1/recover') {
      recoveryEmail = body().email;
      return Response.json({});
    }
    const objectPrefix = '/storage/v1/object/avatars/';
    if (path.startsWith(objectPrefix) && method === 'POST') {
      objects.add(path.slice(objectPrefix.length));
      return Response.json({ Key: path });
    }
    if (path === '/storage/v1/object/avatars' && method === 'DELETE') {
      body().prefixes.forEach(key => objects.delete(key));
      return Response.json([]);
    }
    const signPrefix = '/storage/v1/object/sign/avatars/';
    if (path.startsWith(signPrefix)) {
      assert.equal(body().expiresIn, 300);
      assert.ok(objects.has(path.slice(signPrefix.length)));
      return Response.json({ signedURL: `/object/sign/avatars/${path.slice(signPrefix.length)}?token=test` });
    }
    return Response.json({ msg: `Unexpected mock route: ${method} ${path}` }, { status: 500 });
  });

  const request = (path, method = 'GET', { token = 'learner-token', json, image, type = 'application/json', origin = process.env.FRONTEND_ORIGIN } = {}) => requestApp(path, method,
    { origin, 'content-type': type, ...(token ? { authorization: `Bearer ${token}` } : {}) },
    image ?? (json === undefined ? undefined : JSON.stringify(json)));

  const name = { displayName: '  An IELTS  ' };
  assert.equal((await request('', 'PATCH', { json: name, token: '' })).status, 401);
  assert.equal((await request('', 'PATCH', { json: name, token: 'admin-token' })).status, 403);
  assert.equal((await request('', 'PATCH', { json: name, origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await request('', 'PATCH', { json: { ...name, id: admin.id } })).status, 400);
  assert.equal((await (await request('', 'PATCH', { json: name })).json()).user.display_name, 'An IELTS');
  assert.equal((await (await request('')).json()).user.display_name, 'An IELTS');

  const avatar = (image, type = 'image/png') => request('/avatar', 'PUT', { image, type });
  assert.equal((await avatar(Buffer.from('<svg/>'))).status, 415);
  const maxBytes = (useR2 ? 5 : 2) * 1024 * 1024;
  assert.deepEqual(await (await request('/avatar-options')).json(), { maxBytes });
  assert.equal((await avatar(Buffer.alloc(maxBytes + 1))).status, 413);
  const originalKey = `${learner.id}/55555555-5555-4555-8555-555555555555.png`;
  learner.avatar_url = originalKey;
  objects.add(originalKey);
  assert.match((await (await request('/avatar')).json()).url, /token=test$/);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf2kAAAAASUVORK5CYII=', 'base64');
  assert.equal((await avatar(useR2 ? Buffer.concat([png, Buffer.alloc(3 * 1024 * 1024)]) : png)).status, 200);
  assert.equal(objects.has(originalKey), false);
  assert.equal(learner.avatar_url.startsWith('r2:'), useR2);
  const oldPath = learner.avatar_url.replace(/^r2:/, '');
  assert.match(oldPath, new RegExp(`^${learner.id}/`));
  const signed = new URL((await (await request('/avatar')).json()).url);
  if (useR2) {
    assert.equal(signed.host, r2Host);
    assert.equal(signed.searchParams.get('X-Amz-Expires'), '300');
    assert.ok(signed.searchParams.get('X-Amz-Signature'));
  } else {
    assert.equal(signed.searchParams.get('token'), 'test');
  }
  assert.equal((await avatar(png)).status, 200);
  assert.equal(objects.has(oldPath), false);
  assert.equal(objects.size, 1);
  assert.equal((await request('/avatar', 'DELETE')).status, 200);
  assert.deepEqual(await (await request('/avatar')).json(), { url: null });
  assert.equal(objects.size, 0);

  const newPassword = 'changed-password';
  const checkPassword = currentPassword => request('/password', 'POST', { json: { currentPassword, newPassword } });
  assert.equal((await checkPassword('wrong-password')).status, 400);
  assert.equal(providerPassword, 'original-password');
  const result = await checkPassword(providerPassword);
  assert.equal(result.status, 200, await result.text());
  assert.equal(providerPassword, newPassword);
  assert.equal(signOutScope, 'global');
  assert.match(result.headers.get('set-cookie'), /ielts_refresh_token=;/);
  assert.equal((await request('/password/setup', 'POST')).status, 403);
  google = true;
  assert.deepEqual(await (await request('/password-options')).json(), { google: true, canSendSetupEmail: true });
  assert.equal((await request('/password/setup', 'POST')).status, 202);
  assert.equal(recoveryEmail, learner.email);
  if (useR2) {
    const key = 'practice/mock.wav';
    await recordingsBucket.put(key, Buffer.from('synthetic recording'), 'audio/wav');
    const signedRecording = new URL(await recordingsBucket.signedReadUrl(key, 25));
    assert.equal(signedRecording.pathname, `/recordings-test/${key}`);
    assert.equal(signedRecording.searchParams.get('X-Amz-Expires'), '25');
    await assert.rejects(recordingsBucket.signedReadUrl(key, 0), RangeError);
    await recordingsBucket.remove(key);
    assert.equal(objects.size, 0);
  }
});
