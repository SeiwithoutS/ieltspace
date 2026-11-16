import test from 'node:test';
import assert from 'node:assert/strict';
const { saveDraftSchema, createSetSchema } = await import('../dist/modules/vocabulary/vocabulary.routes.js');
const word = { id: 'ca37546e-c913-463e-a9b3-f075234d1361', word: 'curriculum', meaning: 'Chương trình học' };
test('draft accepts empty set and valid words, strips temporary media UI state', () => {
  assert.equal(saveDraftSchema.parse({ revision:0, words:[] }).words.length, 0);
  const data = saveDraftSchema.parse({ revision:2, words:[{...word, imageCandidates:[{url:'temporary'}], mediaMessage:'old error'}] });
  assert.equal(data.words[0].imageCandidates, undefined);
  assert.equal(data.words[0].audio, '');
});
test('draft preserves independent US and UK recordings and AU candidates', () => {
  const audioUs = 'https://example.org/word-us.mp3';
  const audioUk = 'https://example.org/word-uk.mp3';
  const audioCandidates = [{ url: 'https://example.org/word-au.mp3', source: 'Free Dictionary', accent: 'AU' }];
  const saved = saveDraftSchema.parse({ revision: 1, words: [{ ...word, audioUs, audioUk, audioCandidates }] }).words[0];
  assert.equal(saved.audioUs, audioUs);
  assert.equal(saved.audioUk, audioUk);
  assert.deepEqual(saved.audioCandidates, audioCandidates);
});
test('draft rejects duplicates, stale-shaped revisions, invalid IDs and inline images', () => {
  for (const body of [
    {revision:0, words:[word,word]}, {revision:-1, words:[word]},
    {revision:0, words:[{...word,id:'education'}]},
    {revision:0, words:[{...word,image:'data:image/png;base64,AAA'}]},
    {revision:0, words:[{...word,audio:'javascript:alert(1)'}]},
    {revision:0, words:[{...word,meaning:'  '}]},
    {revision:0, words:Array.from({length:501},()=>word)},
  ]) assert.equal(saveDraftSchema.safeParse(body).success, false);
});
test('set creation validates name and unsupported uploaded cover instead of silently dropping it', () => {
  assert.equal(createSetSchema.safeParse({title:'  '}).success,false);
  assert.equal(createSetSchema.safeParse({title:'Education',cover:'data:image/png;base64,AAAA'}).success,false);
  assert.equal(createSetSchema.parse({title:' Education '}).title,'Education');
});
test('vocabulary endpoints reject anonymous requests before database access', async () => {
  const {app} = await import('../dist/app.js');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/admin/vocabulary`;
    for (const [method,path] of [['GET','/sets'],['POST','/sets'],['PUT',`/sets/${word.id}/draft`],['GET','/media?word=curriculum&type=audio']]) {
      const response = await fetch(base + path, {method});
      assert.equal(response.status,401);
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
});
