// Opt-in: tests only vocabulary routes inside one transaction that always rolls back.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../dist/config.js';
import { prisma } from '../dist/lib/prisma.js';
import { createVocabularyAdminRouter, createVocabularyLibraryRouter } from '../dist/modules/vocabulary/vocabulary.routes.js';

test('dev draft API persists, detects revision conflict and rolls back fixture', {skip:process.env.TEST_VOCABULARY_DB !== '1'}, async () => {
  const rollback = new Error('ROLLBACK_VOCABULARY_TEST');
  let fixtureId;
  try {
    await assert.rejects(prisma.$transaction(async tx => {
      const users = await tx.$queryRaw`select id from public.users where role = 'ADMIN' and status = 'ACTIVE' limit 1`;
      assert.ok(users[0], 'A dev admin profile is required');
      // Reuse real SQL and handlers, but keep every write in the outer rollback transaction.
      const db = { $queryRaw: tx.$queryRaw.bind(tx), $transaction: fn => fn(tx) };
      const router = createVocabularyAdminRouter(db);
      const request = (method, path, body = {}, id = fixtureId) => new Promise((resolve,reject) => {
        const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]).route;
        const response = { status(){return this;}, json:resolve, end:resolve };
        route.stack.at(-1).handle({params:{id},body,appUser:users[0]},response,reject);
      });
      const created = await request('post','/',{title:'Vocabulary rollback fixture',description:'Test only',cover:''});
      fixtureId = created.set.id;
      const word = {id:crypto.randomUUID(),word:'curriculum',meaning:'Chương trình học'};
      const saved = await request('put','/:id/draft',{revision:0,words:[word]});
      assert.equal(saved.revision,1);
      const read = await request('get','/:id');
      assert.equal(read.words[0].word,'curriculum');
      assert.equal(read.revision,1);
      await assert.rejects(request('put','/:id/draft',{revision:0,words:[]}), error => error.statusCode === 409);
      const afterConflict = await request('get','/:id');
      assert.equal(afterConflict.words.length,1);
      await request('patch','/:id',{title:'Renamed fixture',cover:'',revision:1});
      const renamed = await request('get','/:id');
      assert.equal(renamed.set.title,'Renamed fixture');
      assert.equal(renamed.revision,2);
      assert.equal(renamed.words.length,1);
      const live = await tx.$queryRaw`select count(*) from public.vocabulary_set_items where set_id = ${fixtureId}::uuid`;
      assert.equal(Number(live[0].count),0, 'Saving a draft must not publish vocabulary');
      await request('post','/:id/publication',{action:'publish',revision:2});
      const published = await tx.$queryRaw`select s.status, v.definitions->0->>'word' as word from public.vocabulary_sets s join public.vocabulary_set_items i on i.set_id=s.id join public.vocabularies v on v.id=i.vocabulary_id where s.id=${fixtureId}::uuid`;
      assert.deepEqual(published,[{status:'PUBLISHED',word:'curriculum'}]);
      await request('put','/:id/draft',{revision:3,words:[]});
      await request('post','/:id/publication',{action:'hide',revision:4});
      await request('post','/:id/publication',{action:'show',revision:5});
      const libraryRouter = createVocabularyLibraryRouter(db);
      const library = await new Promise((resolve,reject) => libraryRouter.stack.find(layer=>layer.route.path==='/').route.stack[0].handle({}, {set(){return this;},json:resolve},reject));
      assert.equal(library.sets.find(set=>set.id===fixtureId).words[0].word,'curriculum');
      const personal = (method, path, body, user = users[0]) => new Promise((resolve,reject) => {
        const route = libraryRouter.stack.find(layer => layer.route.path===path && layer.route.methods[method]).route;
        route.stack.at(-1).handle({appUser:user,params:{id:word.id},body},{json:resolve,set(){return this;}},reject);
      });
      const change = patch => personal('patch','/me/personal/:id',patch);
      const readPersonal = async user => (await personal('get','/me/personal',{},user)).records.find(row=>row.id===word.id);
      await change({fav:true}); await change({note:'Ghi chú thử'});
      assert.deepEqual(await readPersonal(),{id:word.id,fav:true,note:'Ghi chú thử'});
      assert.equal(await readPersonal({id:crypto.randomUUID()}),undefined);
      await change({fav:false});
      assert.equal((await readPersonal()).note,'Ghi chú thử');
      await change({note:''}); assert.equal(await readPersonal(),undefined);
      throw rollback;
    },{timeout:20000}), error => error === rollback);
    const leftovers = await prisma.$queryRaw`select id from public.vocabulary_sets where id = ${fixtureId}::uuid`;
    assert.equal(leftovers.length,0);
  } finally { await prisma.$disconnect(); }
});
