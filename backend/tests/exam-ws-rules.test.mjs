import test from 'node:test';
import assert from 'node:assert/strict';

const {
  defaultDuration,
  canDeleteSkill,
  speakingDuration,
  validateWritingReady,
  validateSpeakingReady,
  validateSkillReady,
} = await import('../dist/modules/exams/exam-rules.js');

const {
  sectionsToWriting,
  writingToRows,
  sectionsToSpeaking,
  speakingToRows,
  DEFAULT_WRITING_EMPTY,
  DEFAULT_SPEAKING_EMPTY,
} = await import('../dist/modules/exams/exam-content.mapper.js');

test('1. defaultDuration and speakingDuration', () => {
  assert.equal(defaultDuration('SPEAKING'), 15);
  assert.equal(defaultDuration('WRITING'), 60);

  assert.equal(speakingDuration({ p13Minutes: 12, part2: { prepMinutes: 1, speakMinutes: 2 } }), 15);
  assert.equal(speakingDuration({ p13Minutes: 10, part2: { prepMinutes: 2, speakMinutes: 3 } }), 15);
  assert.equal(speakingDuration({ p13Minutes: null, part2: { prepMinutes: 1, speakMinutes: 2 } }), null);
  assert.equal(speakingDuration({ p13Minutes: 12, part2: { prepMinutes: 0, speakMinutes: 2 } }), null);
});

test('2. canDeleteSkill', () => {
  assert.equal(canDeleteSkill({ status: 'DRAFT', attemptCount: 0 }), true);
  assert.equal(canDeleteSkill({ status: 'DRAFT', attemptCount: 1 }), false);
  assert.equal(canDeleteSkill({ status: 'PUBLISHED', attemptCount: 0 }), false);
  assert.equal(canDeleteSkill({ status: 'HIDDEN', attemptCount: 0 }), false);
  assert.equal(canDeleteSkill({ status: 'ARCHIVED', attemptCount: 0 }), false);
});

test('3. validateWritingReady', () => {
  // Empty
  const rEmpty = validateWritingReady(null, 'ACADEMIC');
  assert.ok(rEmpty.includes('Kỹ năng Writing phải có đủ 2 Task.'));

  // Missing prompts
  const rMissingPrompts = validateWritingReady({
    tasks: [{ prompt: '', imagePath: null }, { prompt: '   ', imagePath: null }],
  }, 'GENERAL');
  assert.ok(rMissingPrompts.includes('Task 1 chưa có yêu cầu (đề bài).'));
  assert.ok(rMissingPrompts.includes('Task 2 chưa có yêu cầu (đề bài).'));

  // Academic Task 1 requires image
  const rAcadNoImg = validateWritingReady({
    tasks: [{ prompt: 'Task 1 description', imagePath: null }, { prompt: 'Task 2 essay', imagePath: null }],
  }, 'ACADEMIC');
  assert.ok(rAcadNoImg.includes('Task 1 chưa có ảnh đề.'));

  // General Training Task 1 does not require image
  const rGenNoImg = validateWritingReady({
    tasks: [{ prompt: 'Write a letter', imagePath: null }, { prompt: 'Task 2 essay', imagePath: null }],
  }, 'GENERAL');
  assert.deepEqual(rGenNoImg, []);

  // Academic with image is valid
  const rAcadValid = validateWritingReady({
    tasks: [
      { prompt: 'Task 1 description', imagePath: 'exam-skills/abc/img.png' },
      { prompt: 'Task 2 essay', imagePath: null },
    ],
  }, 'ACADEMIC');
  assert.deepEqual(rAcadValid, []);
});

test('4. validateSpeakingReady', () => {
  // Empty
  const rEmpty = validateSpeakingReady(null);
  assert.ok(rEmpty.includes('Kỹ năng Speaking chưa có nội dung.'));

  // Incomplete
  const rIncomplete = validateSpeakingReady({
    p13Minutes: 70, // > 60
    part1: { instruction: '', questions: ['   '] },
    part2: { prepMinutes: 0, speakMinutes: 2, cueCard: '' },
    part3: { instruction: '', questions: [] },
  });
  assert.ok(rIncomplete.includes('Part 1 chưa có câu hỏi nào.'));
  assert.ok(rIncomplete.includes('Thời gian tổng Part 1 và Part 3 cần là số phút từ 1 đến 60.'));
  assert.ok(rIncomplete.includes('Part 2 chưa có nội dung thẻ đề.'));
  assert.ok(rIncomplete.includes('Part 2 cần số phút chờ chuẩn bị và số phút nói (số nguyên từ 1).'));
  assert.ok(rIncomplete.includes('Part 3 chưa có câu hỏi nào.'));

  // Empty question inside list
  const rEmptyQ = validateSpeakingReady({
    p13Minutes: 12,
    part1: { instruction: '', questions: ['Valid Q1', ''] },
    part2: { prepMinutes: 1, speakMinutes: 2, cueCard: 'Describe a trip' },
    part3: { instruction: '', questions: ['Valid Q2', '   '] },
  });
  assert.ok(rEmptyQ.includes('Part 1 có câu hỏi để trống, hãy nhập hoặc xóa.'));
  assert.ok(rEmptyQ.includes('Part 3 có câu hỏi để trống, hãy nhập hoặc xóa.'));

  // Valid speaking
  const rValid = validateSpeakingReady({
    p13Minutes: 12,
    part1: { instruction: '', questions: ['What is your name?'] },
    part2: { prepMinutes: 1, speakMinutes: 2, cueCard: 'Describe a book you love.' },
    part3: { instruction: '', questions: ['Why do people read books?'] },
  });
  assert.deepEqual(rValid, []);
});

test('5. Mapper: sectionsToWriting and writingToRows round-trip', () => {
  // Default empty
  const emptyW = sectionsToWriting([]);
  assert.deepEqual(emptyW, DEFAULT_WRITING_EMPTY);

  const initialContent = {
    tasks: [
      { prompt: 'Task 1 chart prompt', imagePath: 'exam-skills/123/chart.jpg', imageUrl: 'http://cdn/chart.jpg' },
      { prompt: 'Task 2 discussion essay', imagePath: null, imageUrl: null },
    ],
  };

  const rows = writingToRows(initialContent);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].order_no, 1);
  assert.equal(rows[0].section_type, 'TASK');
  assert.equal(rows[0].content.prompt, 'Task 1 chart prompt');
  assert.equal(rows[0].image_path, 'exam-skills/123/chart.jpg');
  assert.equal(rows[1].order_no, 2);
  assert.equal(rows[1].content.prompt, 'Task 2 discussion essay');

  const mappedBack = sectionsToWriting(rows, (p) => `http://cdn/${p.split('/').pop()}`);
  assert.equal(mappedBack.tasks[0].prompt, 'Task 1 chart prompt');
  assert.equal(mappedBack.tasks[0].imagePath, 'exam-skills/123/chart.jpg');
  assert.equal(mappedBack.tasks[0].imageUrl, 'http://cdn/chart.jpg');
  assert.equal(mappedBack.tasks[1].prompt, 'Task 2 discussion essay');
});

test('6. Mapper: sectionsToSpeaking and speakingToRows round-trip', () => {
  // Default empty
  const emptyS = sectionsToSpeaking([]);
  assert.equal(emptyS.p13Minutes, 12);
  assert.equal(emptyS.part2.prepMinutes, 1);
  assert.equal(emptyS.part2.speakMinutes, 2);

  const speakingContent = {
    p13Minutes: 14,
    part1: {
      instruction: 'Answer in 2-3 sentences.',
      questions: ['Where do you live?', 'Do you work or study?', ''], // testing empty question preserved
    },
    part2: {
      prepMinutes: 1,
      speakMinutes: 2,
      cueCard: 'Describe an enjoyable experience.',
    },
    part3: {
      instruction: 'Answer in 4-5 sentences.',
      questions: ['How do celebrations vary across cultures?'],
    },
  };

  const rows = speakingToRows(speakingContent);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].order_no, 1);
  assert.equal(rows[0].groups[0].questions.length, 3);
  assert.equal(rows[0].groups[0].questions[0].content.text, 'Where do you live?');
  assert.equal(rows[0].groups[0].questions[2].content.text, '');
  assert.equal(rows[1].order_no, 2);
  assert.equal(rows[1].content.cueCard, 'Describe an enjoyable experience.');
  assert.equal(rows[2].order_no, 3);
  assert.equal(rows[2].groups[0].questions.length, 1);

  const mappedBack = sectionsToSpeaking(rows);
  assert.equal(mappedBack.p13Minutes, 14);
  assert.equal(mappedBack.part1.instruction, 'Answer in 2-3 sentences.');
  assert.deepEqual(mappedBack.part1.questions, ['Where do you live?', 'Do you work or study?', '']);
  assert.equal(mappedBack.part2.cueCard, 'Describe an enjoyable experience.');
  assert.deepEqual(mappedBack.part3.questions, ['How do celebrations vary across cultures?']);
});

test('7. validateSkillReady delegates for WRITING and SPEAKING', () => {
  const writingSkill = {
    skill: 'WRITING',
    form: 'GENERAL',
    sections: [],
    writingContent: {
      tasks: [{ prompt: 'Task 1 letter', imagePath: null }, { prompt: 'Task 2 essay', imagePath: null }],
    },
  };
  const wResult = validateSkillReady(writingSkill);
  assert.equal(wResult.ready, true);
  assert.equal(wResult.reasons.length, 0);

  const speakingSkill = {
    skill: 'SPEAKING',
    sections: [],
    speakingContent: {
      p13Minutes: 12,
      part1: { instruction: '', questions: ['Q1'] },
      part2: { prepMinutes: 1, speakMinutes: 2, cueCard: 'Card' },
      part3: { instruction: '', questions: ['Q2'] },
    },
  };
  const sResult = validateSkillReady(speakingSkill);
  assert.equal(sResult.ready, true);
  assert.equal(sResult.reasons.length, 0);
});
