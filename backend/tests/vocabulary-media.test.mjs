import test from 'node:test';
import assert from 'node:assert/strict';
process.env.MW_LEARNERS_KEY = 'fixture';
process.env.MW_DICTIONARY_KEY = 'fixture';
process.env.MW_DICTIONARY_PRODUCT = 'collegiate';
process.env.PIXABAY_API_KEY = 'fixture';
process.env.UNSPLASH_ACCESS_KEY = 'fixture';
const { lookupAudio, lookupImages, merriamAudioUrl } = await import('../dist/modules/vocabulary/media.routes.js');

test('Merriam audio directory rules', () => {
  for (const [name, dir] of [['bixby01','bix'],['ggtest01','gg'],['3d01','number'],['_test','number'],['forest01','f']]) {
    assert.equal(merriamAudioUrl(name), `https://media.merriam-webster.com/audio/prons/en/us/mp3/${dir}/${name}.mp3`);
  }
});
test('audio fetches both products, prefers Free Dictionary, ignores spelling suggestions and unrelated entries', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    if (url.includes('dictionaryapi.dev')) return Response.json([{phonetics:[{audio:'https://example.com/forest-us.mp3'}]}]);
    if (url.includes('/learners/')) return Response.json([{meta:{id:'forest:1'},hwi:{prs:[{sound:{audio:'forest01'}}]}}]);
    return Response.json(['forests', {meta:{id:'other'}, hwi:{prs:[{sound:{audio:'other01'}}]}}]);
  });
  const result = await lookupAudio('forest');
  assert.equal(calls.length, 3);
  assert.deepEqual(result.candidates.map(c => c.source), ['Free Dictionary', 'Merriam Learner’s']);
  assert.equal(result.candidates[1].accent, 'US');
  await lookupAudio('forest');
  assert.equal(calls.length, 3, 'repeat searches use cached responses');
});
test('provider failure preserves other audio results and reports warning', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (url.includes('dictionaryapi.dev')) return new Response('', {status:429});
    if (url.includes('/learners/')) return Response.json([{meta:{id:'book'}, hwi:{prs:[{sound:{audio:'book01'}}]}}]);
    return Response.json(['books']);
  });
  const result = await lookupAudio('book');
  assert.equal(result.candidates.length, 1);
  assert.match(result.warnings[0], /Free Dictionary/);
});
for (const winner of ['Wikipedia', 'Unsplash', 'Pixabay']) {
  test(`image search stops at ${winner}`, async t => {
    const order = ['Wikipedia', 'Unsplash', 'Pixabay'];
    const calls = [];
    t.mock.method(globalThis, 'fetch', async url => {
      if (url.includes('wikipedia.org')) {
        calls.push('Wikipedia');
        return Response.json({ title:'Forest', thumbnail:winner === 'Wikipedia' ? {source:'https://upload.wikimedia.org/forest.jpg'} : undefined });
      }
      if (url.includes('unsplash.com')) {
        calls.push('Unsplash');
        return Response.json({results:winner === 'Unsplash' ? [{id:'a', urls:{small:'https://images.unsplash.com/photo-a'}, user:{name:'A',links:{html:'https://unsplash.com/@a'}},links:{download_location:'https://api.unsplash.com/photos/a/download'}}] : []});
      }
      calls.push('Pixabay');
      return Response.json({hits:[{id:1,webformatURL:'https://pixabay.com/test.jpg',pageURL:'https://pixabay.com/photos/test',user:'B'}]});
    });
    const result = await lookupImages(`test-${winner}`);
    assert.deepEqual(result.candidates.map(item => item.source), [winner]);
    await lookupImages(`test-${winner}`);
    assert.deepEqual(calls, order.slice(0,order.indexOf(winner)+1));
  });
}
