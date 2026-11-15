import test from 'node:test';
import assert from 'node:assert/strict';

const {
  slotKey,
  buildSlots,
  slotUi,
  canDeleteSet,
  canDeleteExam,
  canPublishSet,
  defaultDuration,
  validateSkillReady,
} = await import('../dist/modules/exams/exam-rules.js');

test('slotKey generates correct keys for skills and forms', () => {
  assert.equal(slotKey('LISTENING'), 'LISTENING');
  assert.equal(slotKey('SPEAKING'), 'SPEAKING');
  assert.equal(slotKey('READING', 'ACADEMIC'), 'READING_ACADEMIC');
  assert.equal(slotKey('READING', 'GENERAL'), 'READING_GENERAL');
  assert.equal(slotKey('WRITING', 'ACADEMIC'), 'WRITING_ACADEMIC');
  assert.equal(slotKey('WRITING', 'GENERAL'), 'WRITING_GENERAL');
});

test('buildSlots: R-A with v1 ARCHIVED, v2 PUBLISHED, v3 DRAFT', () => {
  const rows = [
    { id: 'v1', skill: 'READING', form: 'ACADEMIC', status: 'ARCHIVED', version_number: 1 },
    { id: 'v2', skill: 'READING', form: 'ACADEMIC', status: 'PUBLISHED', version_number: 2 },
    { id: 'v3', skill: 'READING', form: 'ACADEMIC', status: 'DRAFT', version_number: 3 },
  ];

  const slots = buildSlots(rows);

  assert.deepEqual(slots.READING_ACADEMIC, {
    liveId: 'v2',
    liveStatus: 'PUBLISHED',
    liveVersion: 2,
    draftId: 'v3',
    draftVersion: 3,
  });

  assert.equal(slots.LISTENING, null);
  assert.equal(slots.READING_GENERAL, null);
  assert.equal(slots.WRITING_ACADEMIC, null);
  assert.equal(slots.WRITING_GENERAL, null);
  assert.equal(slots.SPEAKING, null);
});

test('slotUi: all 4 rows of Section 3 table', () => {
  // 1. live = PUBLISHED (draft null hoặc có) -> 'pub'
  assert.equal(
    slotUi({ liveId: '1', liveStatus: 'PUBLISHED', liveVersion: 1, draftId: null, draftVersion: null }),
    'pub'
  );
  assert.equal(
    slotUi({ liveId: '1', liveStatus: 'PUBLISHED', liveVersion: 1, draftId: '2', draftVersion: 2 }),
    'pub'
  );

  // 2. live = HIDDEN (draft null hoặc có) -> 'hidden'
  assert.equal(
    slotUi({ liveId: '1', liveStatus: 'HIDDEN', liveVersion: 1, draftId: null, draftVersion: null }),
    'hidden'
  );
  assert.equal(
    slotUi({ liveId: '1', liveStatus: 'HIDDEN', liveVersion: 1, draftId: '2', draftVersion: 2 }),
    'hidden'
  );

  // 3. live = null, draft != null -> 'draft'
  assert.equal(
    slotUi({ liveId: null, liveStatus: null, liveVersion: null, draftId: '2', draftVersion: 1 }),
    'draft'
  );

  // 4. live = null, draft = null -> null; slot = null -> null
  assert.equal(
    slotUi({ liveId: null, liveStatus: null, liveVersion: null, draftId: null, draftVersion: null }),
    null
  );
  assert.equal(slotUi(null), null);
});

test('canDeleteSet: check conditions', () => {
  // DRAFT 0 Test -> true
  assert.equal(canDeleteSet({ publishedAt: null, testCount: 0, attemptCount: 0 }), true);
  // DRAFT 2 Test -> true
  assert.equal(canDeleteSet({ publishedAt: null, testCount: 2, attemptCount: 0 }), true);
  // HIDDEN 0 Test -> true
  assert.equal(canDeleteSet({ publishedAt: new Date().toISOString(), testCount: 0, attemptCount: 0 }), true);
  // PUBLISHED có Test -> false
  assert.equal(canDeleteSet({ publishedAt: new Date().toISOString(), testCount: 2, attemptCount: 0 }), false);
  // có attempts -> false
  assert.equal(canDeleteSet({ publishedAt: null, testCount: 0, attemptCount: 1 }), false);
});

test('canDeleteExam: check conditions', () => {
  // chỉ DRAFT chưa từng đăng -> true
  assert.equal(canDeleteExam({ everPublished: false, attemptCount: 0 }), true);
  // có dòng ARCHIVED (từng đăng) -> false
  assert.equal(canDeleteExam({ everPublished: true, attemptCount: 0 }), false);
  // có attempts -> false
  assert.equal(canDeleteExam({ everPublished: false, attemptCount: 3 }), false);
});

test('canPublishSet: checks tests count and published skills', () => {
  // Bộ 0 Test -> EXAM_SET_EMPTY
  assert.equal(canPublishSet([]).code, 'EXAM_SET_EMPTY');

  // Bộ có Test nhưng không ô PUBLISHED -> EXAM_SET_NO_PUBLISHED_SKILL
  const emptySlotRecord = {
    LISTENING: null,
    READING_ACADEMIC: null,
    READING_GENERAL: null,
    WRITING_ACADEMIC: null,
    WRITING_GENERAL: null,
    SPEAKING: null,
  };
  assert.equal(canPublishSet([{ slots: emptySlotRecord }]).code, 'EXAM_SET_NO_PUBLISHED_SKILL');

  const draftOnlySlotRecord = {
    ...emptySlotRecord,
    READING_ACADEMIC: { liveId: null, liveStatus: null, liveVersion: null, draftId: 'd1', draftVersion: 1 },
  };
  assert.equal(canPublishSet([{ slots: draftOnlySlotRecord }]).code, 'EXAM_SET_NO_PUBLISHED_SKILL');

  const pubSlotRecord = {
    ...emptySlotRecord,
    READING_ACADEMIC: { liveId: 'p1', liveStatus: 'PUBLISHED', liveVersion: 1, draftId: null, draftVersion: null },
  };
  assert.equal(canPublishSet([{ slots: pubSlotRecord }]).ok, true);
});

test('defaultDuration returns correct IELTS duration minutes', () => {
  assert.equal(defaultDuration('LISTENING'), 30);
  assert.equal(defaultDuration('READING'), 60);
  assert.equal(defaultDuration('WRITING'), 60);
  assert.equal(defaultDuration('SPEAKING'), 15);
});

test('validateSkillReady: reports correct reasons in Vietnamese', () => {
  // Không có phần nào
  const emptySkill = { skill: 'READING', sections: [] };
  const rEmpty = validateSkillReady(emptySkill);
  assert.equal(rEmpty.ready, false);
  assert.ok(rEmpty.reasons.some((m) => m.includes('ít nhất một phần')));

  // Thiếu tiêu đề phần
  const noTitleSkill = {
    skill: 'READING',
    sections: [{ title: '   ', section_type: 'PASSAGE', groups: [] }],
  };
  const rNoTitle = validateSkillReady(noTitleSkill);
  assert.equal(rNoTitle.ready, false);
  assert.ok(rNoTitle.reasons.some((m) => m.includes('chưa có tiêu đề')));

  // Listening thiếu audio
  const listeningNoAudio = {
    skill: 'LISTENING',
    sections: [{ title: 'Section 1', section_type: 'SECTION', audio_path: null, groups: [] }],
  };
  const rNoAudio = validateSkillReady(listeningNoAudio);
  assert.equal(rNoAudio.ready, false);
  assert.ok(rNoAudio.reasons.some((m) => m.includes('thiếu tệp âm thanh')));

  // Câu thiếu đáp án
  const readingNoAnswer = {
    skill: 'READING',
    sections: [
      {
        title: 'Passage 1',
        section_type: 'PASSAGE',
        groups: [
          {
            questions: [
              { id: 'q1', answer: null },
            ],
          },
        ],
      },
    ],
  };
  const rNoAnswer = validateSkillReady(readingNoAnswer);
  assert.equal(rNoAnswer.ready, false);
  assert.ok(rNoAnswer.reasons.some((m) => m.includes('chưa có đáp án')));

  // Đủ điều kiện
  const readySkill = {
    skill: 'READING',
    sections: [
      {
        title: 'Passage 1',
        section_type: 'PASSAGE',
        groups: [
          {
            questions: [
              { id: 'q1', answer: { accepted_answers: ['A'] } },
            ],
          },
        ],
      },
    ],
  };
  const rReady = validateSkillReady(readySkill);
  assert.equal(rReady.ready, true);
  assert.equal(rReady.reasons.length, 0);
});

