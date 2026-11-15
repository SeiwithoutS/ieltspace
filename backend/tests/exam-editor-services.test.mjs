import test from 'node:test';
import assert from 'node:assert/strict';

const { prisma } = await import('../dist/lib/prisma.js');
const {
  createExamSet,
  deleteExamSet,
} = await import('../dist/modules/exams/exam-sets.service.js');
const { addTest } = await import('../dist/modules/exams/exam-tests.service.js');
const {
  createSkill,
  publishSkill,
} = await import('../dist/modules/exams/exam-skills.service.js');
const {
  getEditorSkill,
  saveSkillContent,
  createRevisionDraft,
  deleteSkill,
} = await import('../dist/modules/exams/exam-editor.service.js');

const ADMIN_ID = 'f8c7ad11-e1f5-411b-b962-13717ef31913';

test('Exam Editor Services: E1-E6 and WS-01 through WS-12 with PostgreSQL', async () => {
  // 1. Create a test set and test
  const setName = `Editor Test Set ${Date.now()}`;
  const examSet = await createExamSet(
    {
      name: setName,
      newCategoryName: 'Editor Tests',
    },
    ADMIN_ID
  );
  assert.ok(examSet.id);

  const updatedSet = await addTest(examSet.id, 'Test 1', ADMIN_ID);
  const testId = updatedSet.tests[0].id;
  assert.ok(testId);

  let writingSkillId = null;
  let speakingSkillId = null;

  try {
    // 2. Create Writing Academic skill
    const setWithWriting = await createSkill(
      testId,
      'WRITING',
      'ACADEMIC',
      ADMIN_ID
    );
    const writingSlot = setWithWriting.tests[0].slots.WRITING_ACADEMIC;
    assert.ok(writingSlot.draftId);
    writingSkillId = writingSlot.draftId;

    // E1: Get Editor Skill for new Writing draft
    const editorWriting = await getEditorSkill(writingSkillId);
    assert.equal(editorWriting.id, writingSkillId);
    assert.equal(editorWriting.skill, 'WRITING');
    assert.equal(editorWriting.form, 'ACADEMIC');
    assert.equal(editorWriting.status, 'DRAFT');
    assert.equal(editorWriting.durationMinutes, 60);
    assert.equal(editorWriting.slot.draftId, writingSkillId);
    assert.equal(editorWriting.slot.liveId, null);
    assert.ok(editorWriting.writing);
    assert.equal(editorWriting.writing.tasks.length, 2);
    assert.equal(editorWriting.writing.tasks[0].prompt, '');
    assert.equal(editorWriting.writing.tasks[0].imagePath, null);
    assert.equal(editorWriting.speaking, null);

    // E2: Save Writing Content
    const savedWriting = await saveSkillContent(
      writingSkillId,
      {
        baseUpdatedAt: editorWriting.updatedAt,
        writing: {
          tasks: [
            {
              prompt: 'The chart below shows the number of...',
              imagePath: `exam-skills/${writingSkillId}/test-chart.png`,
            },
            {
              prompt: 'Some people believe that university education should be free...',
              imagePath: null,
            },
          ],
        },
      },
      ADMIN_ID
    );
    assert.equal(savedWriting.writing.tasks[0].prompt, 'The chart below shows the number of...');
    assert.equal(savedWriting.writing.tasks[0].imagePath, `exam-skills/${writingSkillId}/test-chart.png`);
    assert.notEqual(savedWriting.updatedAt, editorWriting.updatedAt);

    // Concurrency check: Saving again with stale baseUpdatedAt should throw 409 SKILL_CHANGED
    await assert.rejects(
      async () => {
        await saveSkillContent(
          writingSkillId,
          {
            baseUpdatedAt: editorWriting.updatedAt, // Stale!
            writing: {
              tasks: [
                { prompt: 'New prompt', imagePath: null },
                { prompt: 'New prompt 2', imagePath: null },
              ],
            },
          },
          ADMIN_ID
        );
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'SKILL_CHANGED');
        return true;
      }
    );

    // Publish Writing: Since it now has 2 tasks with prompts and task 1 has image, publish should succeed!
    const setAfterPublish = await publishSkill(writingSkillId, ADMIN_ID);
    const pubSlot = setAfterPublish.tests[0].slots.WRITING_ACADEMIC;
    assert.equal(pubSlot.liveId, writingSkillId);
    assert.equal(pubSlot.draftId, null);

    // Verify grading rule was assigned with assessment_scope: FULL_SKILL
    const publishedDbSkill = await prisma.exam_skills.findUnique({
      where: { id: writingSkillId },
    });
    assert.equal(publishedDbSkill.status, 'PUBLISHED');
    assert.ok(publishedDbSkill.grading_rule_id);

    const assignedRule = await prisma.grading_rules.findUnique({
      where: { id: publishedDbSkill.grading_rule_id },
    });
    assert.ok(assignedRule);
    assert.equal(assignedRule.assessment_scope, 'FULL_SKILL');

    // Saving content on a PUBLISHED skill should throw 409 SKILL_NOT_DRAFT
    await assert.rejects(
      async () => {
        await saveSkillContent(
          writingSkillId,
          {
            baseUpdatedAt: savedWriting.updatedAt,
            writing: {
              tasks: [
                { prompt: 'Edit published prompt', imagePath: null },
                { prompt: 'Edit published prompt 2', imagePath: null },
              ],
            },
          },
          ADMIN_ID
        );
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'SKILL_NOT_DRAFT');
        return true;
      }
    );

    // E3: Create Revision Draft from PUBLISHED skill
    const rev1 = await createRevisionDraft(writingSkillId, ADMIN_ID);
    assert.equal(rev1.isExisting, false);
    assert.equal(rev1.skill.status, 'DRAFT');
    assert.equal(rev1.skill.versionNumber, 2);
    assert.equal(rev1.skill.slot.liveId, writingSkillId);
    assert.equal(rev1.skill.slot.draftId, rev1.skill.id);
    assert.equal(rev1.skill.writing.tasks[0].prompt, 'The chart below shows the number of...');

    // Calling E3 again returns existing draft (isExisting = true)
    const rev2 = await createRevisionDraft(writingSkillId, ADMIN_ID);
    assert.equal(rev2.isExisting, true);
    assert.equal(rev2.skill.id, rev1.skill.id);

    // Delete revision draft (E6): Should delete draft, live remains
    const setAfterDelRev = await deleteSkill(rev1.skill.id, ADMIN_ID);
    const slotAfterDelRev = setAfterDelRev.tests[0].slots.WRITING_ACADEMIC;
    assert.equal(slotAfterDelRev.liveId, writingSkillId);
    assert.equal(slotAfterDelRev.draftId, null);

    // 3. Create Speaking skill
    const setWithSpeaking = await createSkill(testId, 'SPEAKING', null, ADMIN_ID);
    speakingSkillId = setWithSpeaking.tests[0].slots.SPEAKING.draftId;
    assert.ok(speakingSkillId);

    const editorSpeaking = await getEditorSkill(speakingSkillId);
    assert.equal(editorSpeaking.skill, 'SPEAKING');
    assert.equal(editorSpeaking.durationMinutes, 15);
    assert.ok(editorSpeaking.speaking);
    assert.equal(editorSpeaking.speaking.p13Minutes, 12);
    assert.equal(editorSpeaking.speaking.part2.prepMinutes, 1);
    assert.equal(editorSpeaking.speaking.part2.speakMinutes, 2);

    // Save Speaking Content with 3 parts and questions
    const savedSpeaking = await saveSkillContent(
      speakingSkillId,
      {
        baseUpdatedAt: editorSpeaking.updatedAt,
        speaking: {
          p13Minutes: 12,
          part1: {
            instruction: 'Answer in full sentences.',
            questions: ['Where are you from?', 'Do you work or study?'],
          },
          part2: {
            prepMinutes: 1,
            speakMinutes: 2,
            cueCard: 'Describe a memorable journey you took.',
          },
          part3: {
            instruction: 'Give detailed answers.',
            questions: ['How has travel changed in your country?'],
          },
        },
      },
      ADMIN_ID
    );
    assert.equal(savedSpeaking.speaking.part1.questions.length, 2);
    assert.equal(savedSpeaking.speaking.part2.cueCard, 'Describe a memorable journey you took.');
    assert.equal(savedSpeaking.speaking.part3.questions.length, 1);
    assert.equal(savedSpeaking.durationMinutes, 15);

    // Verify DB rows for speaking
    const dbSpeakingQuestions = await prisma.questions.findMany({
      where: {
        group: {
          section: { exam_skill_id: speakingSkillId },
        },
      },
      orderBy: { order_no: 'asc' },
    });
    assert.equal(dbSpeakingQuestions.length, 3); // 2 from part 1, 1 from part 3

    // Delete Speaking DRAFT skill (E6): Slot should revert to empty
    const setAfterDelSpeaking = await deleteSkill(speakingSkillId, ADMIN_ID);
    const slotAfterDelSpeaking = setAfterDelSpeaking.tests[0].slots.SPEAKING;
    assert.equal(slotAfterDelSpeaking, null);
  } finally {
    // Cleanup test set
    if (examSet?.id) {
      await deleteExamSet(examSet.id, ADMIN_ID).catch(() => {});
    }
  }
});
