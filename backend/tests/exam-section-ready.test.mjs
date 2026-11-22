import test from 'node:test';
import assert from 'node:assert/strict';

const { validateSectionReady } = await import('../dist/modules/exams/exam-rules.js');

const group = (over = {}) => ({
  id: null,
  type: 'SHORT_ANSWER',
  config: {},
  content: {},
  image: null,
  questionFrom: 1,
  questionTo: 1,
  questions: [{ numberFrom: 1, numberTo: 1, accepted: ['abc'], options: [] }],
  ...over,
});

const section = (over = {}) => ({
  orderNo: 1,
  title: 'Topic',
  paragraphs: [{ label: 'A', text: 'Nội dung', startSec: null }],
  images: [],
  audio: null,
  groups: [group()],
  ...over,
});

test('Reading: một Passage đủ nội dung và đáp án thì sẵn sàng, không cần đủ 40 câu', () => {
  assert.deepEqual(validateSectionReady({ skill: 'READING', section: section(), index: 0 }), []);
});

test('Reading: thiếu bài đọc và nhóm câu hỏi', () => {
  const issues = validateSectionReady({
    skill: 'READING',
    section: section({ paragraphs: [{ label: 'A', text: ' ', startSec: null }], groups: [] }),
    index: 1,
  });
  assert.deepEqual(issues, ['Passage 2 chưa có bài đọc.', 'Passage 2 chưa có nhóm câu hỏi.']);
});

test('Listening: cần audio và đáp án từng câu', () => {
  const issues = validateSectionReady({
    skill: 'LISTENING',
    section: section({ groups: [group({ questions: [{ numberFrom: 1, numberTo: 1, accepted: [], options: [] }] })] }),
    index: 0,
  });
  assert.ok(issues.includes('Section 1 chưa có ghi âm.'));
  assert.ok(issues.some((m) => m.includes('còn câu chưa có đáp án')));
});

test('Writing: Task 1 Academic cần ảnh, Task 2 chỉ cần đề bài', () => {
  const content = { tasks: [{ prompt: 'Đề 1', imagePath: null }, { prompt: '', imagePath: null }] };
  assert.deepEqual(validateSectionReady({ skill: 'WRITING', content, index: 0, form: 'ACADEMIC' }), ['Task 1 chưa có ảnh đề.']);
  assert.deepEqual(validateSectionReady({ skill: 'WRITING', content, index: 0, form: 'GENERAL' }), []);
  assert.deepEqual(validateSectionReady({ skill: 'WRITING', content, index: 1 }), ['Task 2 chưa có yêu cầu (đề bài).']);
});

test('Speaking: kiểm từng Part', () => {
  const content = {
    p13Minutes: 12,
    part1: { instruction: '', questions: ['Q1'] },
    part2: { prepMinutes: 1, speakMinutes: 2, cueCard: '' },
    part3: { instruction: '', questions: [] },
  };
  assert.deepEqual(validateSectionReady({ skill: 'SPEAKING', content, index: 0 }), []);
  assert.deepEqual(validateSectionReady({ skill: 'SPEAKING', content, index: 1 }), ['Part 2 chưa có nội dung thẻ đề.']);
  assert.deepEqual(validateSectionReady({ skill: 'SPEAKING', content, index: 2 }), ['Part 3 chưa có câu hỏi nào.']);
});
