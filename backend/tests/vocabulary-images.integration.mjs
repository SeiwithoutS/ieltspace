import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

const pgModule = process.env.SAMPLE_TEST_PGLITE_MODULE;
test('Vocabulary assets persist independently of published revisions', { skip: !pgModule }, async t => {
  const authOrigin = 'https://vocabulary-test.example';
  const r2Origin = 'https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com';
  Object.assign(process.env, {
    NODE_ENV: 'test', FRONTEND_ORIGIN: 'http://localhost:3000', AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
    SUPABASE_URL: authOrigin, SUPABASE_PUBLISHABLE_KEY: 'test-key',
    DATABASE_URL: 'postgresql://isolated:isolated@localhost:1/offline', DIRECT_URL: 'postgresql://isolated:isolated@localhost:1/offline',
    R2_ENDPOINT: r2Origin, R2_ACCESS_KEY_ID: 'test-key', R2_SECRET_ACCESS_KEY: 'test-secret',
    R2_VOCABULARY_BUCKET: 'ieltspace-vocabpic-dev', PIXABAY_API_KEY: 'pixabay-test', UNSPLASH_ACCESS_KEY: 'unsplash-test',
  });
  const { PGlite } = await import(pathToFileURL(resolve(pgModule)).href);
  const { Prisma } = await import('@prisma/client');
  const { app } = await import('../dist/app.js');
  const { prisma } = await import('../dist/lib/prisma.js');
  const { startVocabularyImageCleanupWorker } = await import('../dist/jobs/vocabulary-image-cleanup.js');
  const db = new PGlite();
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);');
  for (const name of ['01_tao_cau_truc_moi', '09_bo_sung_tu_vung_tren_01_cu', '22_vocabulary_image_assets']) {
    await db.exec(await readFile(new URL(`../../docs/csdl/${name}.sql`, import.meta.url), 'utf8'));
  }
  function sqlClient(engine) {
    function run(strings, ...values) {
      const query = Prisma.sql(strings, ...values);
      return engine.query(query.text, query.values);
    }
    return {
      $queryRaw: async (...args) => (await run(...args)).rows,
      $executeRaw: async (...args) => (await run(...args)).affectedRows,
    };
  }
  for (const [name, value] of Object.entries({ ...sqlClient(db), $transaction: callback => db.transaction(tx => callback(sqlClient(tx))) })) {
    Object.defineProperty(prisma, name, { value, configurable: true });
  }
  const accounts = await Promise.all(['ADMIN', 'LEARNER'].map(async role => {
    const id = randomUUID(), auth = randomUUID();
    await db.query('INSERT INTO auth.users VALUES ($1)', [auth]);
    await db.query('INSERT INTO public.users(id,auth_user_id,full_name,role) VALUES ($1,$2,$3,$3)', [id, auth, role]);
    return { auth };
  }));
  Object.defineProperty(prisma.users, 'findUnique', {
    configurable: true,
    value: async ({ where }) => (await db.query('SELECT * FROM public.users WHERE auth_user_id=$1', [where.auth_user_id])).rows[0] ?? null,
  });
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const jwk = { ...await exportJWK(publicKey), kid: 'fixture-key', alg: 'ES256' };
  const [admin, learner] = await Promise.all(accounts.map(account => new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: jwk.kid }).setSubject(account.auth)
    .setIssuer(authOrigin + '/auth/v1').setAudience('authenticated').setExpirationTime('10m').sign(privateKey)));

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jf2kAAAAASUVORK5CYII=', 'base64');
  const objects = new Map();
  const removalAttempts = [];
  let rejectR2 = false;
  const http = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.origin === r2Origin) {
      assert.ok(input.headers.get('authorization')?.startsWith('AWS4-HMAC-SHA256 '));
      if (input.method === 'DELETE') removalAttempts.push(url.pathname);
      if (rejectR2) return new Response(null, { status: 503 });
      if (input.method === 'PUT') {
        objects.set(url.pathname, Buffer.from(await input.arrayBuffer()));
        return new Response(null, { status: 200 });
      }
      assert.equal(input.method, 'DELETE');
      return new Response(null, { status: objects.delete(url.pathname) ? 204 : 404 });
    }
    if (url.origin === authOrigin) return Response.json({ keys: [jwk] });
    if (url.hostname === 'en.wikipedia.org') return Response.json({ title: 'fixture' });
    if (url.hostname === 'api.unsplash.com') return Response.json({ results: [] });
    if (url.hostname === 'pixabay.com') return Response.json({ hits: [{
      id: 9, pageURL: 'https://pixabay.com/example/', webformatURL: 'https://cdn.pixabay.com/fixture.png', user: 'Fixture',
    }] });
    if (url.hostname === 'cdn.pixabay.com') return new Response(png, { headers: { 'Content-Type': 'image/png' } });
    throw new Error('Unexpected external request');
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise(resolveClose => server.close(resolveClose));
    await db.close();
  });
  const base = 'http://127.0.0.1:' + server.address().port + '/api';
  const media = '/admin/vocabulary/media', sets = '/admin/vocabulary/sets', library = '/vocabulary/sets';
  async function request(path, token, method = 'GET', payload, type = 'application/json') {
    const response = await http(base + path, {
      method, redirect: 'manual',
      headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(payload ? { 'Content-Type': type } : {}) },
      body: payload && (type === 'application/json' ? JSON.stringify(payload) : payload),
    });
    const result = response.headers.get('content-type')?.includes('application/json') ? await response.json() : undefined;
    return { status: response.status, result, location: response.headers.get('location') };
  }
  const upload = (bytes = png, token = admin) => request(media + '/upload', token, 'POST', bytes, 'image/png');
  assert.equal((await upload(png, learner)).status, 403);
  assert.equal((await upload(Buffer.from('not an image'))).status, 415);
  assert.equal((await upload(Buffer.alloc(1048577, 1))).status, 413);
  rejectR2 = true;
  assert.equal((await upload()).status, 503);
  rejectR2 = false;
  const cover = (await upload()).result.image;
  const first = (await upload()).result.image;
  const lookup = await request(media + '?type=image&word=fixture', admin);
  assert.equal(lookup.result.candidates[0].source, 'Pixabay');
  assert.equal(objects.size, 2);
  const pix = (await request(media + '/image', admin, 'POST', { id: lookup.result.candidates[0].id })).result;
  assert.equal(pix.imageCredit.source, 'Pixabay');
  assert.match(pix.image, /^vocab-image:/);
  assert.match(pix.imagePreview, /X-Amz-Signature=/);
  assert.equal(objects.size, 3);
  const readImage = reference => request(library + '/images/' + reference.split(':')[1]);
  assert.equal((await readImage(first)).status, 404);
  const preview = media + '/preview?image=' + encodeURIComponent(first);
  assert.equal((await request(preview, learner)).status, 403);
  assert.match((await request(preview, admin)).result.url, /X-Amz-Signature=/);
  const set = (await request(sets, admin, 'POST', { title: 'Fixture', cover })).result.set;
  const word = { id: randomUUID(), word: 'forest', meaning: 'rừng', image: first };
  const draft = (words, revision) => request(`${sets}/${set.id}/draft`, admin, 'PUT', { words, revision });
  const publication = (action, revision) => request(`${sets}/${set.id}/publication`, admin, 'POST', { action, revision });
  assert.equal((await draft([word], 0)).status, 200);
  const opened = (await request(`${sets}/${set.id}`, admin)).result;
  assert.match(opened.set.coverPreview, /X-Amz-Signature=/);
  assert.match(opened.words[0].imagePreview, /X-Amz-Signature=/);
  assert.equal((await publication('publish', 1)).status, 200);
  assert.equal((await readImage(first)).status, 302);
  assert.equal((await readImage(cover)).status, 302);
  assert.equal((await draft([{ ...word, image: pix.image, imageCredit: pix.imageCredit }], 2)).status, 200);
  const nextCover = (await upload()).result.image;
  assert.equal((await request(`${sets}/${set.id}`, admin, 'PATCH', { title: 'Fixture', cover: nextCover, revision: 3 })).status, 200);
  const stillPublished = (await request(library)).result.sets[0];
  assert.equal(stillPublished.words[0].image, first);
  assert.equal(stillPublished.cover, cover);
  assert.equal((await readImage(pix.image)).status, 404);
  assert.equal((await readImage(nextCover)).status, 404);
  await db.exec("UPDATE public.vocabulary_image_assets SET created_at=now()-interval '2 days'");
  assert.deepEqual((await request(media + '/cleanup', admin, 'POST')).result, { removed: 1, pending: 0 });
  assert.equal(objects.size, 4, 'Cleanup protects both the published and draft images and covers');
  assert.equal((await publication('publish', 4)).status, 200);
  assert.equal((await readImage(first)).status, 404);
  assert.equal((await readImage(pix.image)).status, 302);
  assert.equal((await readImage(cover)).status, 404);
  assert.equal((await readImage(nextCover)).status, 302);
  assert.deepEqual((await request(media + '/cleanup', admin, 'POST')).result, { removed: 2, pending: 0 });
  assert.equal(objects.size, 2);
  assert.equal((await publication('hide', 5)).status, 200);
  assert.equal((await readImage(pix.image)).status, 404);
  assert.deepEqual((await request(media + '/cleanup', admin, 'POST')).result, { removed: 0, pending: 0 });

  await t.test('Scheduled cleanup retries old orphans and preserves recent uploads and all saved revisions', async () => {
    const liveCover = (await upload()).result.image;
    const draftCover = (await upload()).result.image;
    const title = 'Visible fixture';
    const visible = (await request(sets, admin, 'POST', { title, cover: liveCover })).result.set;
    const visiblePath = `${sets}/${visible.id}`;
    const visibleWord = { ...word, id: randomUUID(), image: liveCover };
    assert.equal((await request(`${visiblePath}/draft`, admin, 'PUT', { words: [visibleWord], revision: 0 })).status, 200);
    assert.equal((await request(`${visiblePath}/publication`, admin, 'POST', { action: 'publish', revision: 1 })).status, 200);
    assert.equal((await request(visiblePath, admin, 'PATCH', { title, cover: draftCover, revision: 2 })).status, 200);

    const oldId = (await upload()).result.image.split(':')[1];
    const recentId = (await upload()).result.image.split(':')[1];
    const oldKey = [...objects.keys()].find(key => key.includes(oldId));
    const recentKey = [...objects.keys()].find(key => key.includes(recentId));
    assert.ok(oldKey && recentKey);
    const state = async () => (await db.query('SELECT state FROM public.vocabulary_image_assets WHERE id=$1', [oldId])).rows[0]?.state;
    await db.query("UPDATE public.vocabulary_image_assets SET created_at=now()-interval '2 days' WHERE id<>$1", [recentId]);

    async function waitFor(check) {
      const deadline = Date.now() + 4000;
      while (!(await check())) {
        assert.ok(Date.now() < deadline, 'Scheduled cleanup did not reach the expected state');
        await delay(10);
      }
    }

    const previouslyAttempted = removalAttempts.length;
    rejectR2 = true;
    const stop = startVocabularyImageCleanupWorker(40);
    try {
      await waitFor(() => removalAttempts.includes(oldKey));
      assert.equal(await state(), 'DELETING');
      assert.equal(objects.has(oldKey), true);
      rejectR2 = false;
      await waitFor(async () => (await state()) === undefined);
      assert.equal(objects.has(oldKey), false);
      assert.equal(objects.has(recentKey), true);
      assert.equal(objects.size, 5);
      assert.equal((await readImage(liveCover)).status, 302);
      const draftPreview = media + '/preview?image=' + encodeURIComponent(draftCover);
      assert.equal((await request(draftPreview, admin)).status, 200);
      const attempts = removalAttempts.slice(previouslyAttempted);
      assert.ok(attempts.length >= 2 && attempts.every(key => key === oldKey));
    } finally {
      rejectR2 = false;
      await stop();
    }
  });
  assert.equal((await publication('show', 6)).status, 200);
  assert.equal((await readImage(pix.image)).status, 302);
});
