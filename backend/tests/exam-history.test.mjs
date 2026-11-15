import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../dist/lib/prisma.js';
import { createExamSet } from '../dist/modules/exams/exam-sets.service.js';
import { addTest } from '../dist/modules/exams/exam-tests.service.js';
import {
  createSkill,
  publishSkill,
  hideSkill,
} from '../dist/modules/exams/exam-skills.service.js';
import {
  saveSkillContent,
  createRevisionDraft,
} from '../dist/modules/exams/exam-editor.service.js';
import { getSkillHistory } from '../dist/modules/exams/exam-history.service.js';

test('Exam History (CT-08 / D1): slot with v1 ARCHIVED, v2 HIDDEN, v3 DRAFT', async () => {
  // Ensure grading rule exists for WRITING FULL_SKILL
  await prisma.$executeRaw`
    insert into public.grading_rules(name, skill, assessment_scope, version)
    select 'Writing Rule', 'WRITING', 'FULL_SKILL', 1
    where not exists (
      select 1 from public.grading_rules where skill = 'WRITING' and assessment_scope = 'FULL_SKILL'
    )
  `;

  // Get admin user for actorId
  const adminUser = await prisma.users.findFirst();
  const actorId = adminUser ? adminUser.id : null;

  // 1. Create set and test
  const set = await createExamSet(
    {
      name: `History Test Set ${Date.now()}`,
      newCategoryName: 'History Test Cat',
    },
    actorId
  );
  const withTest = await addTest(set.id, actorId);
  const examId = withTest.tests[0].id;

  // 2. Create v1 (DRAFT)
  const afterV1Create = await createSkill(examId, 'WRITING', 'ACADEMIC', actorId);
  const v1Id = afterV1Create.tests[0].slots.WRITING_ACADEMIC.draftId;
  assert.ok(v1Id, 'v1Id must exist');

  // Add dummy writing content to v1 so it can be published
  const dummyWriting = {
    tasks: [
      {
        orderNo: 1,
        title: 'Task 1',
        instruction: 'Task 1 instructions',
        prompt: 'Write a report about the chart below.',
        imagePath: `exam-skills/${v1Id}/test-chart.png`,
      },
      {
        orderNo: 2,
        title: 'Task 2',
        instruction: 'Task 2 instructions',
        prompt: 'Discuss both views and give your opinion.',
      },
    ],
  };

  const v1Skill = await prisma.exam_skills.findUnique({ where: { id: v1Id } });
  await saveSkillContent(
    v1Id,
    { writing: dummyWriting, baseUpdatedAt: v1Skill.updated_at.toISOString() },
    actorId
  );

  // Publish v1 -> v1 becomes PUBLISHED
  await publishSkill(v1Id, actorId);

  // 3. Create v2 draft from v1
  const draftV2Res = await createRevisionDraft(v1Id, actorId);
  const v2Id = draftV2Res.skill.id;
  assert.strictEqual(draftV2Res.skill.versionNumber, 2);

  // Add content to v2 and publish -> v1 becomes ARCHIVED, v2 becomes PUBLISHED
  const v2Skill = await prisma.exam_skills.findUnique({ where: { id: v2Id } });
  await saveSkillContent(
    v2Id,
    {
      writing: {
        tasks: [
          { ...dummyWriting.tasks[0], imagePath: `exam-skills/${v2Id}/test-chart.png` },
          dummyWriting.tasks[1],
        ],
      },
      baseUpdatedAt: v2Skill.updated_at.toISOString(),
    },
    actorId
  );
  await publishSkill(v2Id, actorId);

  // 4. Hide v2 -> v2 becomes HIDDEN
  await hideSkill(v2Id, actorId);

  // 5. Create v3 draft from v2
  const draftV3Res = await createRevisionDraft(v2Id, actorId);
  const v3Id = draftV3Res.skill.id;
  assert.strictEqual(draftV3Res.skill.versionNumber, 3);

  // 6. Test getSkillHistory(v3Id)
  const history = await getSkillHistory(v3Id);

  // Verify slot info
  assert.strictEqual(history.slot.examId, examId);
  assert.strictEqual(history.slot.skill, 'WRITING');
  assert.strictEqual(history.slot.form, 'ACADEMIC');

  // Verify versions count and order (descending version_number)
  assert.strictEqual(history.versions.length, 3, 'Must have exactly 3 versions');

  const [ver3, ver2, ver1] = history.versions;

  assert.strictEqual(ver3.versionNumber, 3);
  assert.strictEqual(ver3.status, 'DRAFT');
  assert.strictEqual(ver3.isCurrent, true);
  assert.strictEqual(ver3.basedOnVersion, 2, 'v3 was created from v2');

  assert.strictEqual(ver2.versionNumber, 2);
  assert.strictEqual(ver2.status, 'HIDDEN');
  assert.strictEqual(ver2.isCurrent, false);
  assert.strictEqual(ver2.basedOnVersion, 1, 'v2 was created from v1');

  assert.strictEqual(ver1.versionNumber, 1);
  assert.strictEqual(ver1.status, 'ARCHIVED');
  assert.strictEqual(ver1.isCurrent, false);

  // Verify events list
  assert.ok(history.events.length >= 5, 'Events should contain at least 5 audit actions');

  // Check event summaries
  const summaries = history.events.map((e) => e.summary);
  assert.ok(
    summaries.some((s) => s.includes('Tạo phiên bản 1')),
    'Should contain creation of v1'
  );
  assert.ok(
    summaries.some((s) => s.includes('Đăng phiên bản 1')),
    'Should contain publish of v1'
  );
  assert.ok(
    summaries.some((s) => s.includes('Tạo phiên bản 2 từ phiên bản 1 để chỉnh sửa')),
    'Should contain draft creation of v2 from v1'
  );
  assert.ok(
    summaries.some((s) => s.includes('Đăng phiên bản 2, thay phiên bản 1')),
    'Should contain publish of v2 replacing v1'
  );
  assert.ok(
    summaries.some((s) => s.includes('Ẩn phiên bản 2')),
    'Should contain hiding of v2'
  );
  assert.ok(
    summaries.some((s) => s.includes('Tạo phiên bản 3 từ phiên bản 2 để chỉnh sửa')),
    'Should contain draft creation of v3 from v2'
  );

  console.log('✔ All history assertions passed!');

  // Cleanup: delete test exam set and skills
  await prisma.exam_sections.deleteMany({
    where: { exam_skill_id: { in: [v1Id, v2Id, v3Id] } },
  });
  await prisma.exam_skills.deleteMany({
    where: { id: { in: [v1Id, v2Id, v3Id] } },
  });
  await prisma.exams.deleteMany({ where: { id: examId } });
  await prisma.exam_sets.deleteMany({ where: { id: set.id } });
  await prisma.audit_logs.deleteMany({
    where: { entity_id: { in: [v1Id, v2Id, v3Id, examId, set.id] } },
  });
});
