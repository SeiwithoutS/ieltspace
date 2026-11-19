import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';

const localPostgresModule = process.env.SAMPLE_TEST_PGLITE_MODULE;
const skip = !localPostgresModule && 'Set SAMPLE_TEST_PGLITE_MODULE to the isolated PGlite module';

test('SAMPLE-01 handlers and authorization guards against isolated PostgreSQL', { skip }, async () => {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    FRONTEND_ORIGIN: 'http://localhost:3000',
    AUTH_EMAIL_REDIRECT_URL: 'http://localhost:3000/login',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'test-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    STORAGE_BUCKET_SAMPLE_ASSETS: 'sample-assets',
    DATABASE_URL: 'postgresql://disabled:disabled@localhost:1/disabled',
  });
  const { PGlite } = await import(pathToFileURL(resolve(localPostgresModule)).href);
  const { Prisma } = await import('@prisma/client');
  const { createSamplesAdminRouter, createSamplesPublicRouter } = await import(
    '../dist/modules/samples/samples.routes.js'
  );
  const { createSampleImportRouter } = await import('../dist/modules/samples/sample-import.routes.js');
  const { requireAuth, requireRole } = await import('../dist/middleware/auth.js');
  const engine = new PGlite();
  try {
    const ddl = await readFile(new URL('../../docs/csdl/01_tao_cau_truc_moi.sql', import.meta.url), 'utf8');
    const baseline = ddl.match(/create table public\.sample_answers \([\s\S]*?\r?\n\);/i)?.[0];
    assert.ok(baseline);
    await engine.exec(`
      create role anon;
      create role authenticated;
      create table public.users (id uuid primary key);
      create table public.exams (id uuid primary key);
      create table public.exam_sections (id uuid primary key);
      ${baseline}
    `);
    await engine.exec(await readFile(new URL('../../docs/csdl/11_sample_answers_drafts.sql', import.meta.url), 'utf8'));
    await engine.exec(await readFile(new URL('../../docs/csdl/12_sample_media_assets.sql', import.meta.url), 'utf8'));
    await engine.exec(await readFile(new URL('../../docs/csdl/13_sample_import_receipts.sql', import.meta.url), 'utf8'));
    const appUser = { id: '6d5b655d-f38a-49ae-a78b-eb74d4ec857e', role: 'ADMIN' };
    await engine.query('insert into public.users values ($1)', [appUser.id]);

    let failDraftInsert = false;
    function sqlClient(target) {
      async function execute(input, ...values) {
        const sql = Array.isArray(input) ? Prisma.sql(input, ...values) : input;
        if (failDraftInsert && /insert\s+into\s+public\.sample_answer_drafts/i.test(sql.text)) {
          throw new Error('Injected draft write failure');
        }
        return target.query(sql.text, sql.values);
      }
      return {
        $queryRaw: async (...args) => (await execute(...args)).rows,
        $executeRaw: async (...args) => (await execute(...args)).affectedRows,
      };
    }
    const client = {
      ...sqlClient(engine),
      $transaction: (fn, options) => engine.transaction(async tx => {
        if (options?.isolationLevel === 'RepeatableRead') {
          await tx.exec('set transaction isolation level repeatable read');
        }
        return fn(sqlClient(tx));
      }),
    };
    const admin = createSamplesAdminRouter(client);
    const publicRouter = createSamplesPublicRouter(client);
    const imports = createSampleImportRouter(client);
    assert.ok(admin.stack.some(layer => layer.handle === requireAuth));
    assert.ok(!publicRouter.stack.some(layer => layer.handle === requireAuth));
    const invoke = (handler, req) => new Promise((resolve, reject) => {
      const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { resolve({ code: this.code, body }); } };
      handler(req, response, error => error ? reject(error) : resolve());
    });
    const call = (router, method, path, options = {}) => {
      const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]);
      assert.ok(route, path);
      return invoke(route.route.stack.at(-1).handle, { body: {}, query: {}, params: {}, appUser, ...options });
    };
    const errorIs = (code, status) => error => error.code === code && error.statusCode === status;
    await assert.rejects(invoke(requireAuth, { headers: {} }), errorIs('UNAUTHENTICATED', 401));
    for (const role of ['LEARNER', 'TEACHER']) {
      await assert.rejects(invoke(requireRole('ADMIN'), { appUser: { role } }), errorIs('FORBIDDEN', 403));
    }
    for (const { route } of imports.stack) {
      const [auth, role, parser] = route.stack;
      assert.equal(auth.handle, requireAuth);
      await assert.rejects(invoke(auth.handle, { headers: {} }), errorIs('UNAUTHENTICATED', 401));
      await assert.rejects(invoke(role.handle, { appUser: { role: 'LEARNER' } }), errorIs('FORBIDDEN', 403));
      const res = { set() {} };
      const parse = req => new Promise((resolve, reject) => parser.handle(req, res, cause => cause ? reject(cause) : resolve(req.body)));
      await assert.rejects(parse({ is: () => false }), errorIs('SAMPLE_IMPORT_TYPE', 415));
      const jsonRequest = (length, parts = [], headers = {}) => Object.assign(Readable.from(parts), {
        headers: { 'content-type': 'application/json', 'content-length': String(length), ...headers }, is: () => true,
      });
      await assert.rejects(parse(jsonRequest(1024 ** 2 + 1)), errorIs('SAMPLE_IMPORT_TOO_LARGE', 413));
      await assert.rejects(parse(jsonRequest(10, [], { 'content-encoding': 'gzip' })), errorIs('SAMPLE_IMPORT_TYPE', 415));
      assert.deepEqual(await parse(jsonRequest(9, [Buffer.from('{"x":"a"}')])), { x: 'a' });
    }

    const base = {
      schemaVersion: 1, title: '100% English', topic: 'Education', source: '',
      outlineIntro: '', outline: 'Dàn ý', band: 8, cover: null,
    };
    const writing = {
      ...base, skill: 'WRITING', sampleType: 'WRITING_TASK_2', task: 2, form: 'ACADEMIC',
      writingType: 'agree', prompt: 'Question?', promptImage: null, essay: 'First snapshot.', translation: '',
    };
    const item = { id: '154001da-65a2-4dcc-9911-5a707e52423a', question: 'Question?', answer: 'An answer.', audio: null };
    const speaking = { ...base, skill: 'SPEAKING', sampleType: 'SPEAKING_PART_2', part: 2, items: [item] };
    const speech = {
      ...speaking,
      sampleType: 'SPEAKING_PART_1',
      part: 1,
      items: Array.from({ length: 35 }, () => ({ ...item, id: randomUUID(), answer: 'ệ'.repeat(15000) })),
    };
    const largeJson = Buffer.from(JSON.stringify({ document: speech }));
    assert.ok(largeJson.length > 1024 ** 2);
    const draftParser = admin.stack.find(layer => layer.route?.methods.post && layer.route.path === '/').route.stack[0].handle;
    const parseDraft = (length, parts) => new Promise((resolve, reject) => {
      const req = Object.assign(Readable.from(parts), { headers: { 'content-type': 'application/json', 'content-length': String(length) } });
      draftParser(req, {}, cause => cause ? reject(cause) : resolve(req.body));
    });
    assert.deepEqual(await parseDraft(largeJson.length, [largeJson]), { document: speech });
    await assert.rejects(parseDraft(24 * 1024 ** 2 + 1, []), errorIs('SAMPLE_DOCUMENT_TOO_LARGE', 413));
    const academic = { ...writing, sampleType: 'WRITING_TASK_1_ACADEMIC', task: 1, writingType: 'bar' };
    const general = { ...writing, sampleType: 'WRITING_TASK_1_GENERAL', task: 1, form: 'GENERAL_TRAINING', writingType: 'request' };
    const create = document => call(admin, 'post', '/', { body: { document } });

    failDraftInsert = true;
    await assert.rejects(create(writing), /Injected draft write failure/);
    failDraftInsert = false;
    assert.equal((await engine.query('select count(*)::int as n from public.sample_answers')).rows[0].n, 0);
    await assert.rejects(create({ ...speaking, items: [item, item] }), errorIs('SAMPLE_VALIDATION_ERROR', 400));
    await assert.rejects(create({ ...speaking, part: 1, sampleType: 'SPEAKING_PART_1', items: [item, { ...item, id: item.id.toUpperCase() }] }),
      error => errorIs('SAMPLE_VALIDATION_ERROR', 400)(error) && error.details.issues[0].path.join('.') === 'document.items.1.id');
    await assert.rejects(create({ ...writing, essay: 'Bad\u0000text' }), errorIs('SAMPLE_VALIDATION_ERROR', 400));
    await assert.rejects(create({ ...writing, cover: { bucket: 'forged', path: 'x', originalName: 'a.png', mimeType: 'image/png', sizeBytes: 1 } }),
      error => errorIs('SAMPLE_VALIDATION_ERROR', 400)(error) && error.details.issues[0].path.join('.') === 'document.cover.path');

    const created = await create(writing);
    assert.equal(created.code, 201);
    const { id, revision } = created.body.sample;
    assert.equal(revision, 1);
    const params = { id };
    const view = () => call(publicRouter, 'get', '/:id', { params });
    const transition = (action, rev, targetId = id) => call(admin, 'post', '/:id/publication', { params: { id: targetId }, body: { action, revision: rev } });
    const save = (document, rev) => call(admin, 'put', '/:id/draft', { params, body: { document, revision: rev } });
    await assert.rejects(view(), errorIs('SAMPLE_NOT_FOUND', 404));
    const published = (await transition('PUBLISH', 1)).body.sample;
    assert.equal(published.publishedRevision, 2);
    assert.equal(published.hasUnpublishedChanges, false);

    const latest = { ...writing, title: 'Draft only', essay: 'Second snapshot.' };
    const simultaneous = await Promise.allSettled([save(latest, 2), save({ ...latest, title: 'Other draft' }, 2)]);
    const winner = simultaneous.find(result => result.status === 'fulfilled').value.body.sample;
    const loser = simultaneous.find(result => result.status === 'rejected').reason;
    assert.equal(loser.code, 'SAMPLE_REVISION_CONFLICT');
    assert.deepEqual(loser.details, { expectedRevision: 2, currentRevision: 3 });
    assert.equal(winner.hasUnpublishedChanges, true);
    assert.equal((await call(admin, 'get', '/:id', { params })).body.sample.document.title, winner.document.title);
    assert.equal((await view()).body.sample.document.title, writing.title);

    const list = (router, query = {}) => call(router, 'get', '/', { query });
    assert.equal((await list(admin, { q: winner.document.title })).body.pagination.total, 1);
    assert.equal((await list(publicRouter, { q: '100%' })).body.pagination.total, 1);
    assert.equal((await list(publicRouter, { q: '_' })).body.pagination.total, 0);
    assert.equal((await list(publicRouter, { page: '2', pageSize: '1' })).body.samples.length, 0);
    await transition('HIDE', 3);
    await assert.rejects(view(), errorIs('SAMPLE_NOT_FOUND', 404));
    assert.equal((await list(publicRouter)).body.pagination.total, 0);
    const restored = (await transition('RESTORE', 4)).body.sample;
    assert.deepEqual(restored.publishedAt, published.publishedAt);
    assert.equal(restored.publishedRevision, 2);
    assert.equal((await view()).body.sample.document.essay, writing.essay);
    await assert.rejects(transition('RESTORE', 5), errorIs('SAMPLE_INVALID_TRANSITION', 409));
    await transition('PUBLISH', 5);
    assert.equal((await view()).body.sample.document.essay, latest.essay);

    for (const document of [
      general,
      { ...speaking, part: 1, sampleType: 'SPEAKING_PART_1' },
      speaking,
      { ...speaking, part: 3, sampleType: 'SPEAKING_PART_3' },
    ]) {
      const sample = (await create(document)).body.sample;
      const result = (await transition('PUBLISH', 1, sample.id)).body.sample;
      assert.equal(result.status, 'PUBLISHED');
      assert.equal(result.document.sampleType, document.sampleType);
    }
    const noImage = (await create(academic)).body.sample;
    await assert.rejects(transition('PUBLISH', 1, noImage.id),
      error => errorIs('SAMPLE_PUBLICATION_INVALID', 400)(error) && error.details.issues[0].path.join('.') === 'document.promptImage');

    const realFetch = globalThis.fetch;
    const storageObjects = new Set();
    let bucketIsPublic = false;
    globalThis.fetch = async (input, options) => {
      const { origin, pathname } = new URL(input);
      assert.equal(origin, 'https://example.supabase.co');
      if (pathname === '/storage/v1/bucket/sample-assets') return Response.json({ public: bucketIsPublic });
      const route = pathname.match(/^\/storage\/v1\/object\/(sign\/)?sample-assets\/(samples\/.+)$/);
      assert.ok(route, pathname);
      assert.equal(options.method, 'POST');
      const [, sign, path] = route;
      if (sign) {
        assert.ok(storageObjects.has(path));
        assert.equal(JSON.parse(options.body).expiresIn, 300);
        return Response.json({ signedURL: `/object/sign/sample-assets/${path}?token=fixture` });
      }
      assert.ok(Buffer.isBuffer(options.body));
      storageObjects.add(path);
      return Response.json({ Id: path, Key: `sample-assets/${path}` });
    };
    try {
      const upload = (sampleId, kind, body, contentType = 'image/png') => call(admin, 'post', '/:id/assets', {
        params: { id: sampleId }, body, query: { kind, originalName: 'file' }, get: () => contentType,
      });
      const sign = (router, sampleId, path) => call(router, 'get', '/:id/assets/url', {
        params: { id: sampleId }, query: { path },
      });
      const saveAcademic = (document, rev) => call(admin, 'put', '/:id/draft', {
        params: { id: noImage.id }, body: { document, revision: rev },
      });
      const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      const wav = Buffer.alloc(46);
      wav.write('RIFF', 0);
      wav.writeUInt32LE(wav.length - 8, 4);
      wav.write('WAVEfmt ', 8);
      wav.writeUInt32LE(16, 16);
      wav.writeUInt16LE(1, 20);
      wav.writeUInt16LE(1, 22);
      wav.writeUInt32LE(8000, 24);
      wav.writeUInt32LE(16000, 28);
      wav.writeUInt16LE(2, 32);
      wav.writeUInt16LE(16, 34);
      wav.write('data', 36);
      wav.writeUInt32LE(2, 40);
      const assertUnavailable = (sampleId, path) => assert.rejects(sign(publicRouter, sampleId, path), errorIs('SAMPLE_ASSET_NOT_FOUND', 404));

      await assert.rejects(upload(id, 'cover', Buffer.alloc(0)), errorIs('SAMPLE_ASSET_EMPTY', 400));
      await assert.rejects(upload('d52e86e6-933c-410e-b19c-83c0871d46ce', 'cover', image), errorIs('SAMPLE_NOT_FOUND', 404));
      await assert.rejects(upload(id, 'cover', Buffer.from('invalid PNG')), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'cover', Buffer.from('ffd8ff', 'hex')), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'cover', image.subarray(0, 8)), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'cover', image.subarray(0, image.length - 3)), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'audio', wav.subarray(0, 12), 'audio/wav'), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'audio', wav.subarray(0, 44), 'audio/wav'), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'audio', Buffer.from('\x00\x00\x00\x10ftypmp42\x00\x00\x00\x00'), 'audio/mp4'), errorIs('SAMPLE_ASSET_TYPE', 415));
      await assert.rejects(upload(id, 'cover', Buffer.alloc(5 * 1024 ** 2 + 1)), errorIs('SAMPLE_ASSET_TOO_LARGE', 413));
      await assert.rejects(upload(id, 'audio', Buffer.alloc(50 * 1024 ** 2 + 1), 'audio/wav'), errorIs('SAMPLE_ASSET_TOO_LARGE', 413));
      bucketIsPublic = true;
      await assert.rejects(upload(id, 'cover', image), errorIs('SAMPLE_STORAGE_UNAVAILABLE', 503));
      bucketIsPublic = false;

      const firstImage = await upload(noImage.id, 'prompt-image', image);
      const { asset: promptImage } = firstImage.body;
      assert.equal(firstImage.code, 201);
      await assert.rejects(create({ ...academic, promptImage }), errorIs('SAMPLE_ASSET_REQUIRES_SAVED_SAMPLE', 400));
      assert.equal((await call(admin, 'get', '/:id', { params: { id: noImage.id } })).body.sample.revision, 1);
      await assertUnavailable(noImage.id, promptImage.path);
      assert.match((await sign(admin, noImage.id, promptImage.path)).body.url, /token=fixture$/);
      await assert.rejects(save({ ...writing, promptImage }, 6), errorIs('SAMPLE_ASSET_INVALID', 400));
      await assert.rejects(saveAcademic({ ...academic, cover: promptImage }, 1), errorIs('SAMPLE_ASSET_INVALID', 400));
      for (const forged of [
        { ...promptImage, sizeBytes: 99 },
        { ...promptImage, mimeType: 'image/webp' },
        { ...promptImage, originalName: 'edited.png' },
        { ...promptImage, path: promptImage.path.replace(/[^/]+\.png$/, 'd52e86e6-933c-410e-b19c-83c0871d46ce.png') },
      ]) {
        await assert.rejects(saveAcademic({ ...academic, promptImage: forged }, 1), errorIs('SAMPLE_ASSET_INVALID', 400));
      }
      const withFirstImage = { ...academic, promptImage };
      assert.equal((await saveAcademic(withFirstImage, 1)).body.sample.revision, 2);
      await engine.query("update sample_media_assets set state = 'DELETING' where path = $1", [promptImage.path]);
      await assert.rejects(saveAcademic(withFirstImage, 2), errorIs('SAMPLE_ASSET_INVALID', 400));
      await assert.rejects(transition('PUBLISH', 2, noImage.id), errorIs('SAMPLE_ASSET_INVALID', 400));
      await engine.query("update sample_media_assets set state = 'READY' where path = $1", [promptImage.path]);
      await transition('PUBLISH', 2, noImage.id);
      assert.match((await sign(publicRouter, noImage.id, promptImage.path)).body.url, /token=fixture$/);

      const { body: { asset: replacement } } = await upload(noImage.id, 'prompt-image', image);
      await saveAcademic({ ...academic, promptImage: replacement }, 3);
      await assertUnavailable(noImage.id, replacement.path);
      assert.match((await sign(publicRouter, noImage.id, promptImage.path)).body.url, /token=fixture$/);
      await transition('PUBLISH', 4, noImage.id);
      await assertUnavailable(noImage.id, promptImage.path);
      assert.match((await sign(publicRouter, noImage.id, replacement.path)).body.url, /token=fixture$/);
      await transition('HIDE', 5, noImage.id);
      await assertUnavailable(noImage.id, replacement.path);
      await transition('RESTORE', 6, noImage.id);
      assert.match((await sign(publicRouter, noImage.id, replacement.path)).body.url, /token=fixture$/);

      const spoken = (await create(speaking)).body.sample;
      const recorded = await upload(spoken.id, 'audio', wav, 'audio/wav');
      assert.equal(recorded.code, 201);
      const audio = recorded.body.asset;
      const savedSpeaking = await call(admin, 'put', '/:id/draft', {
        params: { id: spoken.id }, body: { document: { ...speaking, items: [{ ...item, audio }] }, revision: 1 },
      });
      assert.deepEqual(savedSpeaking.body.sample.document.items, [{ ...item, audio }]);
      await transition('PUBLISH', 2, spoken.id);
      assert.match((await sign(publicRouter, spoken.id, audio.path)).body.url, /token=fixture$/);
    } finally {
      globalThis.fetch = realFetch;
    }

    const fixture = JSON.parse(await readFile(new URL('./fixtures/sample-import-v1.json', import.meta.url), 'utf8'));
    const previewImport = body => call(imports, 'post', '/preview', { body });
    const confirmImport = (body, requestKey = randomUUID(), user = appUser) => call(imports, 'post', '/confirm', {
      body: { workbook: body, requestKey }, appUser: user,
    });
    const counts = async () => (await engine.query(`select
      (select count(*)::int from public.sample_answers) as parents,
      (select count(*)::int from public.sample_answer_drafts) as drafts,
      (select count(*)::int from public.sample_import_receipts) as receipts`)).rows[0];
    const initialCounts = await counts();
    const { body: preview } = await previewImport(fixture);
    assert.equal(preview.canConfirm, true);
    assert.equal(preview.dataRows, 3);
    assert.deepEqual(preview.samples.map(sample => sample.itemCount), [1, 2]);
    assert.ok(preview.issues.some(issue => issue.sheet === 'Writing' && issue.severity === 'WARNING'));
    assert.deepEqual(await counts(), initialCounts);

    const bad = structuredClone(fixture);
    bad.sheets.Writing.splice(1, 0, []);
    bad.sheets.Writing[2][5] = '7.2';
    bad.sheets.Writing[2][3] = 'GENERAL_TRAINING';
    bad.sheets.Speaking[2][1] = 'Khác tiêu đề';
    const invalidPreview = (await previewImport(bad)).body;
    assert.equal(invalidPreview.canConfirm, false);
    assert.deepEqual(invalidPreview.issues.map(({ sheet, row, column }) => [sheet, row, column]), [
      ['Writing', 3, 'F'], ['Writing', 3, 'D'], ['Speaking', 3, 'B'],
    ]);
    await assert.rejects(confirmImport(bad), error => errorIs('SAMPLE_IMPORT_INVALID', 400)(error) && error.details.issues.length === 3);
    for (const [patch, wanted] of [
      [workbook => { workbook.sheets.Writing[0][0] = 'id'; }, ['Writing', 1, 'A']],
      [workbook => { workbook.sheets.Speaking[2][8] = '1'; }, ['Speaking', 3, 'I']],
      [workbook => { workbook.sheets.Speaking[2][8] = '3'; }, ['Speaking', 3, 'I']],
      [workbook => { workbook.sheets.Speaking.slice(1).forEach(row => { row[2] = 'SPEAKING_PART_2'; }); }, ['Speaking', 3, 'I']],
      [workbook => { workbook.sheets.Speaking.slice(1).forEach(row => { row[0] = 'W001'; }); }, ['Speaking', 2, 'A']],
    ]) {
      const invalid = structuredClone(fixture);
      patch(invalid);
      const response = (await previewImport(invalid)).body;
      assert.equal(response.canConfirm, false);
      assert.ok(response.issues.some(issue => issue.severity === 'ERROR' && [issue.sheet, issue.row, issue.column].join() === wanted.join()));
    }
    failDraftInsert = true;
    await assert.rejects(confirmImport(fixture), /Injected draft write failure/);
    failDraftInsert = false;
    assert.deepEqual(await counts(), initialCounts);

    const key = randomUUID();
    const reverse = structuredClone(fixture);
    reverse.sheets.Speaking = [reverse.sheets.Speaking[0], ...reverse.sheets.Speaking.slice(1).reverse()];
    const requests = await Promise.all([confirmImport(reverse, key), confirmImport(reverse, key.toUpperCase())]);
    assert.deepEqual(requests.map(result => result.code).sort(), [200, 201]);
    assert.deepEqual(requests[0].body.samples, requests[1].body.samples);
    assert.deepEqual(await counts(), { parents: initialCounts.parents + 2, drafts: initialCounts.drafts + 2, receipts: initialCounts.receipts + 1 });
    const rename = { ...reverse, fileName: 'renamed.xlsx' };
    assert.equal((await confirmImport(rename, key)).body.replayed, true);
    await assert.rejects(confirmImport(fixture, key), errorIs('SAMPLE_IMPORT_REQUEST_CONFLICT', 409));
    await assert.rejects(confirmImport(reverse, key, { ...appUser, id: randomUUID() }), errorIs('SAMPLE_IMPORT_REQUEST_CONFLICT', 409));
    const [draftWriting, draftSpeaking] = requests[0].body.samples;
    await assert.rejects(call(publicRouter, 'get', '/:id', { params: { id: draftWriting.id } }), errorIs('SAMPLE_NOT_FOUND', 404));
    await assert.rejects(transition('PUBLISH', 1, draftWriting.id), errorIs('SAMPLE_PUBLICATION_INVALID', 400));
    const readDraft = async id => (await call(admin, 'get', '/:id', { params: { id } })).body.sample;
    const writingDraft = await readDraft(draftWriting.id);
    assert.equal(writingDraft.revision, 1);
    assert.equal(writingDraft.document.translation, fixture.sheets.Writing[1][12]);
    const speakingDraft = await readDraft(draftSpeaking.id);
    assert.equal(speakingDraft.document.items[0].question, fixture.sheets.Speaking[1][9]);
    assert.equal(speakingDraft.document.items[1].answer, fixture.sheets.Speaking[2][10]);
    assert.notEqual(speakingDraft.document.items[0].id, speakingDraft.document.items[1].id);
    await transition('PUBLISH', 1, draftSpeaking.id);
    assert.deepEqual((await call(publicRouter, 'get', '/:id', { params: { id: draftSpeaking.id } })).body.sample.document.items, speakingDraft.document.items);
  } finally {
    await engine.close();
  }
});
