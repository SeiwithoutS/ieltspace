import test from 'node:test';
import assert from 'node:assert/strict';
const {
  formatTimeTag,
  indexToLabel,
  segmentsToParagraphs,
} = await import('../dist/integrations/ai/transcription.js');

test('formatTimeTag formats seconds to [mm:ss]', () => {
  assert.equal(formatTimeTag(0), '[00:00]');
  assert.equal(formatTimeTag(5), '[00:05]');
  assert.equal(formatTimeTag(65), '[01:05]');
  assert.equal(formatTimeTag(3600), '[60:00]');
});

test('indexToLabel generates alphabet labels correctly', () => {
  assert.equal(indexToLabel(0), 'A');
  assert.equal(indexToLabel(1), 'B');
  assert.equal(indexToLabel(25), 'Z');
  assert.equal(indexToLabel(26), 'AA');
  assert.equal(indexToLabel(27), 'AB');
});

test('segmentsToParagraphs groups sentences and splits on silence or 30s duration', () => {
  const segments = [
    { start: 0.5, end: 3.0, text: 'Good morning everyone.' },
    { start: 3.5, end: 6.0, text: 'Welcome to the university tour.' }, // silence = 0.5 < 1.5 -> same paragraph
    { start: 8.0, end: 12.0, text: 'Now we will visit the library.' }, // silence = 2.0 >= 1.5 -> new paragraph
    { start: 12.5, end: 15.0, text: 'Please keep your voices down.' },
  ];

  const paragraphs = segmentsToParagraphs(segments);
  assert.equal(paragraphs.length, 2);

  assert.equal(paragraphs[0].label, 'A');
  assert.equal(paragraphs[0].startSec, 0);
  assert.equal(paragraphs[0].text, '[00:00] Good morning everyone. Welcome to the university tour.');

  assert.equal(paragraphs[1].label, 'B');
  assert.equal(paragraphs[1].startSec, 8);
  assert.equal(paragraphs[1].text, '[00:08] Now we will visit the library. Please keep your voices down.');
});

test('segmentsToParagraphs handles empty or whitespace segments', () => {
  assert.deepEqual(segmentsToParagraphs([]), []);
  assert.deepEqual(segmentsToParagraphs([{ start: 0, end: 1, text: '   ' }]), []);
});
