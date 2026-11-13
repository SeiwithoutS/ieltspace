import test from 'node:test';
import assert from 'node:assert/strict';

const { prisma } = await import('../dist/lib/prisma.js');
const {
  findOrCreateCategory,
  listCategories,
} = await import('../dist/modules/exams/categories.service.js');
const {
  createExamSet,
  getExamSet,
  patchExamSet,
  publishExamSet,
  hideExamSet,
  deleteExamSet,
} = await import('../dist/modules/exams/exam-sets.service.js');
const {
  addTest,
  deleteTest,
} = await import('../dist/modules/exams/exam-tests.service.js');
const {
  createSkill,
  hideSkill,
  showSkill,
  publishSkill,
} = await import('../dist/modules/exams/exam-skills.service.js');

const ADMIN_ID = 'f8c7ad11-e1f5-411b-b962-13717ef31913';

test('1. Categories: list and findOrCreate with trim & duplicate handling (QB-03)', async () => {
  const cat1 = await findOrCreateCategory('  IELTS Trend Test  ', ADMIN_ID);
  assert.ok(cat1.id);
  assert.equal(cat1.name, 'IELTS Trend Test');

  // Calling again with different casing and whitespace should return the same category
  const cat2 = await findOrCreateCategory('ielts trend test', ADMIN_ID);
  assert.equal(cat2.id, cat1.id);

  const allCats = await listCategories();
  assert.ok(allCats.length >= 5);
  const found = allCats.find((c) => c.name === 'IELTS Trend Test');
  assert.ok(found);
});

test('2. Exam Sets: create, duplicate name, lock, audit (QB-01, QB-02)', async () => {
  const testSetName = `Test Set Automated ${Date.now()}`;

  const set = await createExamSet(
    {
      name: `  ${testSetName}  `,
      description: 'Mô tả bộ đề kiểm thử',
      newCategoryName: 'IELTS Trend Test',
    },
    ADMIN_ID
  );

  assert.ok(set.id);
  assert.equal(set.name, testSetName);
  assert.equal(set.status, 'DRAFT');
  assert.equal(set.publishedAt, null);
  assert.equal(set.tests.length, 0);

  // Duplicate name (case-insensitive) should throw 409 EXAM_SET_NAME_EXISTS
  await assert.rejects(
    async () => {
      await createExamSet(
        {
          name: testSetName.toLowerCase(),
          categoryId: set.category.id,
        },
        ADMIN_ID
      );
    },
    (err) => {
      assert.equal(err.status, 409);
      assert.equal(err.code, 'EXAM_SET_NAME_EXISTS');
      return true;
    }
  );

  // Clean up
  await deleteExamSet(set.id, ADMIN_ID);
});

test('3. Test lifecycle: addTest, slots, createSkill, publish conditions (QB-04, QB-07, QB-08, QB-09)', async () => {
  const setName = `Set Full Flow ${Date.now()}`;
  const set = await createExamSet(
    {
      name: setName,
      description: 'Flow test',
      newCategoryName: 'Flow Category',
    },
    ADMIN_ID
  );

  try {
    // Cannot publish empty set (QB-04)
    await assert.rejects(
      async () => {
        await publishExamSet(set.id, ADMIN_ID);
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EXAM_SET_EMPTY');
        return true;
      }
    );

    // Add Test 1
    const setAfterTest1 = await addTest(set.id, 'Test 1', ADMIN_ID);
    assert.equal(setAfterTest1.tests.length, 1);
    const test1 = setAfterTest1.tests[0];
    assert.equal(test1.title, 'Test 1');
    assert.equal(test1.orderNo, 1);

    // Set has tests but no PUBLISHED skills -> cannot publish (QB-04)
    await assert.rejects(
      async () => {
        await publishExamSet(set.id, ADMIN_ID);
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EXAM_SET_NO_PUBLISHED_SKILL');
        return true;
      }
    );

    // Create Skill Reading Academic (QB-09)
    const setAfterSkill = await createSkill(test1.id, 'READING', 'ACADEMIC', ADMIN_ID);
    const t1Updated = setAfterSkill.tests.find((t) => t.id === test1.id);
    const raSlot = t1Updated?.slots.READING_ACADEMIC;
    assert.ok(raSlot?.draftId);
    assert.equal(raSlot.draftVersion, 1);
    assert.equal(raSlot.liveStatus, null);

    // Trying to create Reading Academic again -> 409 SLOT_EXISTS
    await assert.rejects(
      async () => {
        await createSkill(test1.id, 'READING', 'ACADEMIC', ADMIN_ID);
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'SLOT_EXISTS');
        return true;
      }
    );

    // Trying to publish incomplete skill -> 422 SKILL_NOT_READY (QB-12)
    await assert.rejects(
      async () => {
        await publishSkill(raSlot.draftId, ADMIN_ID);
      },
      (err) => {
        assert.equal(err.status, 422);
        assert.equal(err.code, 'SKILL_NOT_READY');
        assert.ok(Array.isArray(err.details));
        return true;
      }
    );

    // Populate minimal section & question for the draft skill to make it publishable
    const section = await prisma.exam_sections.create({
      data: {
        exam_skill_id: raSlot.draftId,
        title: 'Passage 1 Climate Change',
        section_type: 'PASSAGE',
        order_no: 1,
      },
    });

    const group = await prisma.question_groups.create({
      data: {
        section_id: section.id,
        question_type: 'MULTIPLE_CHOICE',
        order_no: 1,
      },
    });

    const question = await prisma.questions.create({
      data: {
        question_group_id: group.id,
        content: { text: 'What is the main cause?' },
        question_type: 'MULTIPLE_CHOICE',
        order_no: 1,
      },
    });

    await prisma.question_answers.create({
      data: {
        question_id: question.id,
        accepted_answers: ['A'],
        matching_rule: { mode: 'EXACT' },
      },
    });

    // Publish skill (QB-11)
    const setAfterPublishSkill = await publishSkill(raSlot.draftId, ADMIN_ID);
    const t1Pub = setAfterPublishSkill.tests.find((t) => t.id === test1.id);
    const raSlotPub = t1Pub?.slots.READING_ACADEMIC;
    assert.equal(raSlotPub?.liveStatus, 'PUBLISHED');
    assert.equal(raSlotPub?.draftId, null);

    // Now publish the exam set (QB-04)
    const pubSet = await publishExamSet(set.id, ADMIN_ID);
    assert.equal(pubSet.status, 'PUBLISHED');
    assert.ok(pubSet.publishedAt);

    // Hide skill (QB-10)
    const setAfterHideSkill = await hideSkill(raSlotPub.liveId, ADMIN_ID);
    const t1HiddenSkill = setAfterHideSkill.tests.find((t) => t.id === test1.id);
    assert.equal(t1HiddenSkill?.slots.READING_ACADEMIC?.liveStatus, 'HIDDEN');

    // Show skill again (QB-10)
    const setAfterShowSkill = await showSkill(raSlotPub.liveId, ADMIN_ID);
    const t1ShownSkill = setAfterShowSkill.tests.find((t) => t.id === test1.id);
    assert.equal(t1ShownSkill?.slots.READING_ACADEMIC?.liveStatus, 'PUBLISHED');

    // Test has a published skill -> cannot delete test (QB-08)
    await assert.rejects(
      async () => {
        await deleteTest(test1.id, ADMIN_ID);
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EXAM_NOT_DELETABLE');
        return true;
      }
    );

    // Set has been published and has tests -> cannot delete set (QB-06)
    await assert.rejects(
      async () => {
        await deleteExamSet(set.id, ADMIN_ID);
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'EXAM_SET_NOT_DELETABLE');
        return true;
      }
    );

    // Hide set (QB-05)
    const setHidden = await hideExamSet(set.id, ADMIN_ID);
    assert.equal(setHidden.status, 'HIDDEN');
  } finally {
    // Teardown: delete the test tree manually to leave the DB clean
    await prisma.$transaction(async (tx) => {
      const exams = await tx.exams.findMany({ where: { exam_set_id: set.id } });
      const examIds = exams.map((e) => e.id);
      if (examIds.length > 0) {
        await tx.question_answers.deleteMany({
          where: { question: { group: { section: { exam_skill: { exam_id: { in: examIds } } } } } },
        });
        await tx.questions.deleteMany({
          where: { group: { section: { exam_skill: { exam_id: { in: examIds } } } } },
        });
        await tx.question_groups.deleteMany({
          where: { section: { exam_skill: { exam_id: { in: examIds } } } },
        });
        await tx.exam_sections.deleteMany({
          where: { exam_skill: { exam_id: { in: examIds } } },
        });
        await tx.exam_skills.deleteMany({
          where: { exam_id: { in: examIds } },
        });
        await tx.exams.deleteMany({
          where: { id: { in: examIds } },
        });
      }
      await tx.exam_sets.delete({ where: { id: set.id } });
    });
  }
});

