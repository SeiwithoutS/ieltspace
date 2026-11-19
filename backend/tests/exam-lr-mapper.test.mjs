import test from 'node:test';
import assert from 'node:assert/strict';

const {
  sectionsToLr,
  lrToRows,
  emptyLrContent,
  LR_QUESTION_TYPE_NAMES,
} = await import('../dist/modules/exams/exam-content.mapper.js');

const {
  checkLrNumbering,
  validateReadingReady,
  validateListeningReady,
  validateSkillReady,
} = await import('../dist/modules/exams/exam-rules.js');

test('emptyLrContent generates correct default structure', () => {
  const r = emptyLrContent('READING');
  assert.equal(r.sections.length, 3);
  assert.equal(r.sections[0].paragraphs.length, 3);
  assert.equal(r.sections[0].paragraphs[0].label, 'A');

  const l = emptyLrContent('LISTENING');
  assert.equal(l.sections.length, 4);
  assert.equal(l.sections[0].paragraphs.length, 0);
  assert.equal(l.sections[0].audio, null);
});

test('LR DB ↔ DTO round-trip lossless for 16 question types', () => {
  const all16Types = Object.keys(LR_QUESTION_TYPE_NAMES);
  assert.equal(all16Types.length, 16);

  // Construct a comprehensive LrContent covering all 16 types
  let currentQNum = 1;
  const groups = all16Types.map((type, idx) => {
    const isMcqMulti = type === 'MCQ_MULTI';
    const pick = isMcqMulti ? 2 : 1;
    const numFrom = currentQNum;
    const numTo = currentQNum + pick - 1;
    currentQNum = numTo + 1;

    return {
      id: `group-uuid-${idx + 1}`,
      type,
      instruction: `Instruction for ${type}`,
      title: type === 'TABLE_COMP' ? 'Table 1: Population' : null,
      questionFrom: numFrom,
      questionTo: numTo,
      image: type === 'DIAGRAM_COMP' ? { path: 'exam-skills/s1/diagram.png', url: null, name: 'diagram.png' } : null,
      config: isMcqMulti ? { pick: 2 } : type === 'TABLE_COMP' ? { rows: 3, hd: true, sp: [0, 1] } : {},
      content: type === 'SUMMARY_BOX' ? { body: 'Summary ___ text', options: [{ label: 'A', text: 'Word A' }, { label: 'B', text: 'Word B' }] } : {},
      questions: [
        {
          numberFrom: numFrom,
          numberTo: numTo,
          content: { text: `Question text for ${type}` },
          options: isMcqMulti
            ? [{ label: 'A', text: 'Choice A' }, { label: 'B', text: 'Choice B' }, { label: 'C', text: 'Choice C' }]
            : type === 'MCQ_SINGLE'
            ? [{ label: 'A', text: 'Choice A' }, { label: 'B', text: 'Choice B' }]
            : [],
          accepted: isMcqMulti ? ['A', 'C'] : type === 'MCQ_SINGLE' ? ['B'] : type === 'TFNG' ? ['TRUE'] : ['answer 1', 'alt 1'],
          matching: isMcqMulti ? { kind: 'MULTI' } : type === 'MCQ_SINGLE' ? { kind: 'CHOICE' } : { kind: 'TEXT' },
          evidence: [{ para: 1, label: 'A', keys: ['keyword1', 'keyword2'] }],
          notes: [`Explanation note for ${type}`],
        },
      ],
    };
  });

  const originalContent = {
    sections: [
      {
        orderNo: 1,
        title: 'Passage 1: The History of Glass',
        paragraphs: [
          { label: 'A', text: 'Paragraph A text', startSec: null },
          { label: 'B', text: 'Paragraph B text', startSec: null },
        ],
        images: [{ path: 'exam-skills/s1/img1.png', url: null, name: 'img1.png', caption: 'Figure 1' }],
        audio: null,
        groups: groups.slice(0, 6),
      },
      {
        orderNo: 2,
        title: 'Passage 2',
        paragraphs: [{ label: 'A', text: 'Passage 2 text', startSec: null }],
        images: [],
        audio: null,
        groups: groups.slice(6, 11),
      },
      {
        orderNo: 3,
        title: 'Passage 3',
        paragraphs: [{ label: 'A', text: 'Passage 3 text', startSec: null }],
        images: [],
        audio: null,
        groups: groups.slice(11, 16),
      },
    ],
  };

  // 1. Convert DTO -> Rows
  const rows = lrToRows(originalContent, 'READING', 'test-skill-id');
  assert.equal(rows.sections.length, 3);
  assert.equal(rows.groups.length, 16);
  assert.equal(rows.questions.length, 16);
  assert.equal(rows.answers.length, 16);

  // 2. Mock nesting of DB rows as Prisma would return
  const mockDbSections = rows.sections.map((sec) => {
    const secGroups = rows.groups.filter((g) => g.section_id === sec.id).map((g) => {
      const grpQuestions = rows.questions.filter((q) => q.question_group_id === g.id).map((q) => {
        const qOptions = rows.options.filter((o) => o.question_id === q.id);
        const qAnswer = rows.answers.find((a) => a.question_id === q.id);
        return {
          ...q,
          options: qOptions,
          answer: qAnswer,
        };
      });
      return {
        ...g,
        questions: grpQuestions,
      };
    });
    return {
      ...sec,
      groups: secGroups,
    };
  });

  // 3. Convert Rows -> DTO
  const restoredContent = sectionsToLr(mockDbSections, 'READING', (p) => `https://cdn.example.com/${p}`);

  // Verify structure matches
  assert.equal(restoredContent.sections.length, originalContent.sections.length);
  for (let sIdx = 0; sIdx < 3; sIdx++) {
    const origSec = originalContent.sections[sIdx];
    const restSec = restoredContent.sections[sIdx];
    assert.equal(restSec.title, origSec.title);
    assert.equal(restSec.paragraphs.length, origSec.paragraphs.length);
    assert.equal(restSec.groups.length, origSec.groups.length);

    for (let gIdx = 0; gIdx < origSec.groups.length; gIdx++) {
      const origG = origSec.groups[gIdx];
      const restG = restSec.groups[gIdx];
      assert.equal(restG.type, origG.type);
      assert.equal(restG.instruction, origG.instruction);
      assert.equal(restG.title, origG.title);
      assert.equal(restG.questionFrom, origG.questionFrom);
      assert.equal(restG.questionTo, origG.questionTo);
      assert.deepEqual(restG.config, origG.config);
      assert.deepEqual(restG.content, origG.content);

      if (origG.image) {
        assert.equal(restG.image?.path, origG.image.path);
        assert.equal(restG.image?.name, origG.image.name);
        assert.equal(restG.image?.url, `https://cdn.example.com/${origG.image.path}`);
      }

      assert.equal(restG.questions.length, origG.questions.length);
      for (let qIdx = 0; qIdx < origG.questions.length; qIdx++) {
        const origQ = origG.questions[qIdx];
        const restQ = restG.questions[qIdx];
        assert.equal(restQ.numberFrom, origQ.numberFrom);
        assert.equal(restQ.numberTo, origQ.numberTo);
        assert.deepEqual(restQ.content, origQ.content);
        assert.deepEqual(restQ.options, origQ.options);
        assert.deepEqual(restQ.accepted, origQ.accepted);
        assert.deepEqual(restQ.matching, origQ.matching);
        assert.deepEqual(restQ.evidence, origQ.evidence);
        assert.deepEqual(restQ.notes, origQ.notes);
      }
    }
  }
});

test('checkLrNumbering: verifies contiguous numbering and throws on gaps', () => {
  // Valid content: questions 1 to 5
  const validContent = {
    sections: [
      {
        orderNo: 1,
        title: 'Passage 1',
        paragraphs: [],
        images: [],
        audio: null,
        groups: [
          {
            id: 'g1',
            type: 'SENTENCE_COMP',
            instruction: 'test',
            title: null,
            questionFrom: 1,
            questionTo: 3,
            image: null,
            config: {},
            content: {},
            questions: [
              { numberFrom: 1, numberTo: 1, content: {}, options: [], accepted: ['a'], matching: { kind: 'TEXT' }, evidence: [], notes: [] },
              { numberFrom: 2, numberTo: 2, content: {}, options: [], accepted: ['b'], matching: { kind: 'TEXT' }, evidence: [], notes: [] },
              { numberFrom: 3, numberTo: 3, content: {}, options: [], accepted: ['c'], matching: { kind: 'TEXT' }, evidence: [], notes: [] },
            ],
          },
          {
            id: 'g2',
            type: 'MCQ_MULTI',
            instruction: 'test',
            title: null,
            questionFrom: 4,
            questionTo: 5,
            image: null,
            config: { pick: 2 },
            content: {},
            questions: [
              { numberFrom: 4, numberTo: 5, content: {}, options: [{ label: 'A', text: '1' }, { label: 'B', text: '2' }, { label: 'C', text: '3' }], accepted: ['A', 'B'], matching: { kind: 'MULTI' }, evidence: [], notes: [] },
            ],
          },
        ],
      },
    ],
  };

  assert.doesNotThrow(() => checkLrNumbering(validContent, 'READING'));

  // Gap in numbering: 1-3 then 5-6 (missing 4)
  const gapContent = {
    sections: [
      {
        orderNo: 1,
        title: 'Passage 1',
        paragraphs: [],
        images: [],
        audio: null,
        groups: [
          validContent.sections[0].groups[0],
          {
            ...validContent.sections[0].groups[1],
            questionFrom: 5,
            questionTo: 6,
            questions: [
              { ...validContent.sections[0].groups[1].questions[0], numberFrom: 5, numberTo: 6 },
            ],
          },
        ],
      },
    ],
  };

  assert.throws(
    () => checkLrNumbering(gapContent, 'READING'),
    (err) => {
      assert.equal(err.status, 400);
      assert.ok(err.message.includes('Số câu không liên tục ở Passage 1, nhóm 2.'));
      return true;
    }
  );
});

test('validateReadingReady: validates 40 questions and publish conditions with correct messages', () => {
  // Test with 38 questions -> should report "Đề đang có 38 câu, cần đúng 40 câu."
  const makeQuestions = (count, startNum) =>
    Array.from({ length: count }, (_, i) => ({
      numberFrom: startNum + i,
      numberTo: startNum + i,
      content: {},
      options: [],
      accepted: ['ans'],
      matching: { kind: 'TEXT' },
      evidence: [],
      notes: [],
    }));

  const content38 = {
    sections: [
      {
        orderNo: 1,
        title: 'Passage 1',
        paragraphs: [{ label: 'A', text: 'Reading text here', startSec: null }],
        images: [],
        audio: null,
        groups: [
          {
            id: 'g1',
            type: 'SENTENCE_COMP',
            instruction: 'test',
            title: null,
            questionFrom: 1,
            questionTo: 13,
            image: null,
            config: {},
            content: {},
            questions: makeQuestions(13, 1),
          },
        ],
      },
      {
        orderNo: 2,
        title: 'Passage 2',
        paragraphs: [{ label: 'A', text: 'Reading text 2', startSec: null }],
        images: [],
        audio: null,
        groups: [
          {
            id: 'g2',
            type: 'SENTENCE_COMP',
            instruction: 'test',
            title: null,
            questionFrom: 14,
            questionTo: 26,
            image: null,
            config: {},
            content: {},
            questions: makeQuestions(13, 14),
          },
        ],
      },
      {
        orderNo: 3,
        title: 'Passage 3',
        paragraphs: [{ label: 'A', text: 'Reading text 3', startSec: null }],
        images: [],
        audio: null,
        groups: [
          {
            id: 'g3',
            type: 'SENTENCE_COMP',
            instruction: 'test',
            title: null,
            questionFrom: 27,
            questionTo: 38,
            image: null,
            config: {},
            content: {},
            questions: makeQuestions(12, 27),
          },
        ],
      },
    ],
  };

  const issues38 = validateReadingReady(content38);
  assert.ok(issues38.includes('Đề đang có 38 câu, cần đúng 40 câu.'));

  // Test missing reading passage
  content38.sections[1].paragraphs = [];
  const issuesNoReading = validateReadingReady(content38);
  assert.ok(issuesNoReading.includes('Passage 2 chưa có bài đọc.'));

  // Test missing answers
  content38.sections[0].groups[0].questions[0].accepted = [];
  const issuesNoAns = validateReadingReady(content38);
  assert.ok(issuesNoAns.some((msg) => msg.includes('Passage 1 · Câu 1-13 · Sentence Completion: còn câu chưa có đáp án.')));
});

test('validateListeningReady: validates 40 questions, transcript and audio presence', () => {
  const content = {
    sections: [
      {
        orderNo: 1,
        title: 'Section 1',
        paragraphs: [{ label: 'A', text: '[00:00] Hi', startSec: 0 }],
        images: [],
        audio: { path: 'exam-skills/s1/audio/1.mp3', url: null, name: '1.mp3', sizeBytes: 1000, durationSec: 300 },
        groups: [],
      },
      {
        orderNo: 2,
        title: 'Section 2',
        paragraphs: [],
        images: [],
        audio: { path: 'exam-skills/s1/audio/2.mp3', url: null, name: '2.mp3', sizeBytes: 1000, durationSec: 300 },
        groups: [],
      },
      {
        orderNo: 3,
        title: 'Section 3',
        paragraphs: [{ label: 'A', text: '[00:00] Hello', startSec: 0 }],
        images: [],
        audio: null, // missing audio
        groups: [],
      },
      {
        orderNo: 4,
        title: 'Section 4',
        paragraphs: [{ label: 'A', text: '[00:00] Welcome', startSec: 0 }],
        images: [],
        audio: { path: 'exam-skills/s1/audio/4.mp3', url: null, name: '4.mp3', sizeBytes: 1000, durationSec: 300 },
        groups: [],
      },
    ],
  };

  const issues = validateListeningReady(content);
  assert.ok(issues.includes('Đề đang có 0 câu, cần đúng 40 câu.'));
  assert.ok(issues.includes('Section 2 chưa có transcript.'));
  assert.ok(issues.includes('Section 3 chưa có ghi âm.'));
  assert.ok(issues.includes('Section 1 chưa có nhóm câu hỏi.'));
});
