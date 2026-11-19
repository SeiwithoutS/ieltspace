import crypto from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import { writeAudit } from '../../shared/audit.js';
import { lockExamSet, loadExamSetAdmin } from './exam-sets.service.js';
import type { ExamSetAdminDto } from './exams.mapper.js';
import {
  type EditorSkill,
  type WritingContent,
  type SpeakingContent,
  type LrContent,
  type LrGroup,
  type LrSection,
  type LrAsset,
  type RawSection,
  sectionsToWriting,
  sectionsToSpeaking,
  sectionsToLr,
  writingToRows,
  speakingToRows,
} from './exam-content.mapper.js';
import { speakingDuration, checkLrNumbering } from './exam-rules.js';
import {
  uploadSkillImage as supabaseUploadSkillImage,
  uploadSkillAudio as supabaseUploadSkillAudio,
  publicUrl,
  removeObjects,
  listObjectPaths,
} from '../../integrations/storage/supabase-storage.js';
import type { LrPatch } from './exams.schemas.js';
export type { LrPatch };

/**
 * Helper to build EditorSkill inside or outside a transaction.
 */
export async function getEditorSkillInTx(
  tx: Prisma.TransactionClient | typeof prisma,
  skillId: string
): Promise<EditorSkill> {
  const skill = await tx.exam_skills.findUnique({
    where: { id: skillId },
    relationLoadStrategy: 'join',
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          order_no: true,
          exam_set_id: true,
          exam_set: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      sections: {
        orderBy: { order_no: 'asc' },
        include: {
          groups: {
            orderBy: { order_no: 'asc' },
            include: {
              questions: {
                orderBy: { order_no: 'asc' },
                include: {
                  options: {
                    orderBy: { order_no: 'asc' },
                  },
                  answer: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!skill) {
    throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
  }

  if (
    skill.skill !== 'WRITING' &&
    skill.skill !== 'SPEAKING' &&
    skill.skill !== 'READING' &&
    skill.skill !== 'LISTENING'
  ) {
    throw new HttpError(
      400,
      'SKILL_NOT_SUPPORTED',
      'Kỹ năng không được hỗ trợ.'
    );
  }

  // Find slot siblings in the same exam
  const siblingSkills = await tx.exam_skills.findMany({
    where: {
      exam_id: skill.exam_id,
      skill: skill.skill,
      form: skill.form ?? null,
    },
    select: {
      id: true,
      status: true,
      version_number: true,
    },
  });

  const draft = siblingSkills.find((s: any) => s.status === 'DRAFT');
  const live = siblingSkills.find(
    (s: any) => s.status === 'PUBLISHED' || s.status === 'HIDDEN'
  );

  const slot = {
    liveId: live?.id ?? null,
    liveStatus: (live ? (live.status as 'PUBLISHED' | 'HIDDEN') : null),
    liveVersion: live?.version_number ?? null,
    draftId: draft?.id ?? null,
    draftVersion: draft?.version_number ?? null,
  };

  let writing: WritingContent | null = null;
  let speaking: SpeakingContent | null = null;
  let reading: LrContent | null = null;
  let listening: LrContent | null = null;

  if (skill.skill === 'WRITING') {
    writing = sectionsToWriting(skill.sections as RawSection[], (path) =>
      publicUrl(path)
    );
  } else if (skill.skill === 'SPEAKING') {
    speaking = sectionsToSpeaking(skill.sections as RawSection[]);
  } else if (skill.skill === 'READING') {
    reading = sectionsToLr(skill.sections as RawSection[], 'READING', (path) =>
      publicUrl(path)
    );
  } else if (skill.skill === 'LISTENING') {
    listening = sectionsToLr(skill.sections as RawSection[], 'LISTENING', (path) =>
      publicUrl(path)
    );
  }

  return {
    id: skill.id,
    skill: skill.skill as 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING',
    form: skill.form as 'ACADEMIC' | 'GENERAL' | null,
    status: skill.status as 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED',
    versionNumber: skill.version_number,
    durationMinutes: skill.duration_minutes,
    updatedAt: skill.updated_at.toISOString(),
    publishedAt: skill.published_at ? skill.published_at.toISOString() : null,
    exam: {
      id: skill.exam.id,
      title: skill.exam.title,
      orderNo: skill.exam.order_no,
    },
    set: {
      id: skill.exam.exam_set.id,
      name: skill.exam.exam_set.name,
    },
    slot,
    writing,
    speaking,
    reading,
    listening,
  };
}

/**
 * E1: Lấy thông tin kỹ năng để mở trong editor (chỉ WRITING / SPEAKING).
 */
export async function getEditorSkill(skillId: string): Promise<EditorSkill> {
  return getEditorSkillInTx(prisma, skillId);
}

/**
 * Xóa toàn bộ nội dung (sections, groups, questions, options, answers) của một kỹ năng
 * trong MỘT câu SQL và trả về các đường dẫn ảnh/audio cũ để dọn storage sau transaction.
 * Thay cho 3 truy vấn đọc + 5 truy vấn xóa trước đây (mỗi truy vấn là một vòng mạng tới DB).
 * Khóa ngoại các bảng con là NO ACTION nên được kiểm ở cuối câu lệnh, xóa cha và con cùng lúc hợp lệ.
 */
async function deleteSkillContent(
  tx: Prisma.TransactionClient,
  skillId: string
): Promise<string[]> {
  const rows = await tx.$queryRaw<Array<{ p: string | null }>>`
    with g as (
      select qg.id from public.question_groups qg
      join public.exam_sections s on s.id = qg.section_id
      where s.exam_skill_id = ${skillId}::uuid
    ), q as (
      select id from public.questions where question_group_id in (select id from g)
    ), da as (
      delete from public.question_answers where question_id in (select id from q)
    ), dop as (
      delete from public.question_options where question_id in (select id from q)
    ), dq as (
      delete from public.questions where id in (select id from q)
    ), dg as (
      delete from public.question_groups where id in (select id from g)
      returning image_path, audio_path
    ), ds as (
      delete from public.exam_sections where exam_skill_id = ${skillId}::uuid
      returning image_path, audio_path, content
    )
    select image_path as p from dg where image_path is not null
    union all
    select audio_path as p from dg where audio_path is not null
    union all
    select image_path as p from ds where image_path is not null
    union all
    select audio_path as p from ds where audio_path is not null
    union all
    select jsonb_array_elements(content->'images')->>'path' as p from ds where jsonb_typeof(content->'images') = 'array'
  `;
  return rows.map((r) => r.p).filter((p): p is string => Boolean(p));
}

export async function assertSkillAssetPath(
  tx: Prisma.TransactionClient | typeof prisma,
  assetPath: string,
  targetSkill: { exam_id: string; skill: string; form?: string | null }
): Promise<void> {
  const p = assetPath.trim();
  if (!p.startsWith('exam-skills/')) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Đường dẫn tệp không hợp lệ.');
  }
  const parts = p.split('/');
  const sourceSkillId = parts[1];
  if (!sourceSkillId) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Đường dẫn tệp không hợp lệ.');
  }

  const sourceSkill = await tx.exam_skills.findUnique({
    where: { id: sourceSkillId },
    select: { exam_id: true, skill: true, form: true },
  });

  if (
    !sourceSkill ||
    sourceSkill.exam_id !== targetSkill.exam_id ||
    sourceSkill.skill !== targetSkill.skill ||
    sourceSkill.form !== (targetSkill.form ?? null)
  ) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Đường dẫn tệp không thuộc về đề thi này.'
    );
  }
}

export async function collectUsedPaths(
  tx: Prisma.TransactionClient | typeof prisma,
  paths: string[]
): Promise<Set<string>> {
  if (paths.length === 0) return new Set();
  const rows = await tx.$queryRaw<Array<{ p: string | null }>>`
    select distinct p from (
      select image_path as p from public.exam_sections where image_path = any(${paths})
      union
      select audio_path as p from public.exam_sections where audio_path = any(${paths})
      union
      select image_path as p from public.question_groups where image_path = any(${paths})
      union
      select jsonb_array_elements(content->'images')->>'path' as p
      from public.exam_sections
      where jsonb_typeof(content->'images') = 'array'
    ) t where p = any(${paths})
  `;
  return new Set(rows.map((r) => r.p).filter((p): p is string => Boolean(p)));
}

export async function cleanupOrphans(
  tx: Prisma.TransactionClient | typeof prisma,
  paths: string[]
): Promise<number> {
  if (paths.length === 0) return 0;
  const used = await collectUsedPaths(tx, paths);
  const orphans = paths.filter((p) => !used.has(p));
  if (orphans.length > 0) {
    await removeObjects(orphans);
  }
  return orphans.length;
}

async function saveLrPatch(
  tx: Prisma.TransactionClient,
  skill: { id: string; skill: string; form?: string | null; version_number: number; duration_minutes: number; exam: { id: string } },
  patch: LrPatch,
  skillType: 'READING' | 'LISTENING',
  actorId?: string | null
): Promise<{ updatedSkill: EditorSkill; oldPaths: string[] }> {
  const expectedSections = skillType === 'READING' ? 3 : 4;
  // Mỗi truy vấn tới Supabase tốn ~200ms: chỉ kiểm tra 1 lần cho mỗi kỹ năng nguồn của đường dẫn tệp.
  const checkedSources = new Set<string>();
  const checkAsset = async (p: string) => {
    const src = p.trim().split('/')[1] ?? p;
    if (checkedSources.has(src) && p.trim().startsWith('exam-skills/')) return;
    await assertSkillAssetPath(tx, p, { exam_id: skill.exam.id, skill: skill.skill, form: skill.form });
    checkedSources.add(src);
  };
  for (const s of patch.sections || []) {
    if (s.orderNo < 1 || s.orderNo > expectedSections) {
      throw new HttpError(400, 'VALIDATION_ERROR', `${skillType === 'READING' ? 'Passage' : 'Section'} ${s.orderNo} không hợp lệ.`);
    }
    if (s.paragraphs && s.paragraphs.length > 30) {
      throw new HttpError(400, 'VALIDATION_ERROR', `Mỗi phần tối đa 30 đoạn.`);
    }
    for (const p of s.paragraphs || []) {
      if (p.text && p.text.length > 5000) {
        throw new HttpError(400, 'VALIDATION_ERROR', `Đoạn văn vượt quá 5.000 ký tự.`);
      }
    }
    if (s.images && s.images.length > 5) {
      throw new HttpError(400, 'VALIDATION_ERROR', `Mỗi phần tối đa 5 ảnh.`);
    }
    for (const img of s.images || []) {
      if (img.caption && img.caption.length > 300) {
        throw new HttpError(400, 'VALIDATION_ERROR', `Chú thích ảnh vượt quá 300 ký tự.`);
      }
      if (img.path) {
        await checkAsset(img.path);
      }
    }
    if (s.audio) {
      if (skillType !== 'LISTENING') {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Chỉ kỹ năng Listening mới hỗ trợ ghi âm.');
      }
      if (s.audio.path) {
        await checkAsset(s.audio.path);
      }
    }
  }

  for (const ug of patch.upsertGroups || []) {
    if (ug.questions && ug.questions.length > 60) {
      throw new HttpError(400, 'VALIDATION_ERROR', `Mỗi nhóm tối đa 60 câu hỏi.`);
    }
    if (ug.image?.path) {
      await checkAsset(ug.image.path);
    }
    if (ug.config && JSON.stringify(ug.config).length > 50 * 1024) {
      throw new HttpError(400, 'VALIDATION_ERROR', `Cấu hình nhóm vượt quá 50 KB.`);
    }
    if (ug.content && JSON.stringify(ug.content).length > 50 * 1024) {
      throw new HttpError(400, 'VALIDATION_ERROR', `Nội dung nhóm vượt quá 50 KB.`);
    }
    for (const q of ug.questions || []) {
      if (q.accepted && q.accepted.length > 10) {
        throw new HttpError(400, 'VALIDATION_ERROR', `Mỗi câu tối đa 10 đáp án chấp nhận.`);
      }
      for (const a of q.accepted || []) {
        if (a && a.length > 200) {
          throw new HttpError(400, 'VALIDATION_ERROR', `Đáp án vượt quá 200 ký tự.`);
        }
      }
      if (q.options && q.options.length > 26) {
        throw new HttpError(400, 'VALIDATION_ERROR', `Tối đa 26 lựa chọn.`);
      }
    }
  }

  const existingSecs = await tx.exam_sections.findMany({
    where: { exam_skill_id: skill.id },
    orderBy: { order_no: 'asc' },
  });
  const sectionIdMap = new Map<number, string>();
  const newSecRows: Prisma.exam_sectionsCreateManyInput[] = [];
  for (let i = 1; i <= expectedSections; i++) {
    const s = existingSecs.find((sec) => sec.order_no === i);
    if (s) {
      sectionIdMap.set(i, s.id);
      continue;
    }
    const secId = crypto.randomUUID();
    newSecRows.push({
      id: secId,
      exam_skill_id: skill.id,
      order_no: i,
      title: '',
      section_type: skillType === 'READING' ? 'PASSAGE' : 'SECTION',
      instruction: null,
      content: skillType === 'READING'
        ? { paragraphs: [{ label: 'A', text: '' }, { label: 'B', text: '' }, { label: 'C', text: '' }], images: [] }
        : { images: [] },
      transcript: [],
      config: {},
      audio_path: null,
      image_path: null,
    });
    sectionIdMap.set(i, secId);
  }
  if (newSecRows.length > 0) await tx.exam_sections.createMany({ data: newSecRows });

  const collectedOldPaths: string[] = [];
  for (const sPatch of patch.sections || []) {
    const secId = sectionIdMap.get(sPatch.orderNo);
    if (!secId) continue;
    const existing = existingSecs.find((s) => s.id === secId);
    const updateData: Prisma.exam_sectionsUpdateInput = {};

    if (sPatch.title !== undefined) {
      updateData.title = sPatch.title;
    }

    if (skillType === 'READING') {
      const curContent = (existing?.content as Record<string, any>) || {};
      const newParagraphs = sPatch.paragraphs !== undefined
        ? sPatch.paragraphs.map((p) => ({ label: p.label, text: p.text }))
        : (curContent.paragraphs || []);
      const newImages = sPatch.images !== undefined
        ? sPatch.images.map((img) => ({ path: img.path, caption: img.caption, name: img.name }))
        : (curContent.images || []);
      updateData.content = { paragraphs: newParagraphs, images: newImages };
    } else {
      if (sPatch.paragraphs !== undefined) {
        updateData.transcript = sPatch.paragraphs.map((p) => ({
          label: p.label,
          text: p.text,
          startSec: p.startSec,
        }));
      }
      if (sPatch.images !== undefined) {
        updateData.content = {
          images: sPatch.images.map((img) => ({ path: img.path, caption: img.caption, name: img.name })),
        };
      }
      if (sPatch.audio !== undefined) {
        if (sPatch.audio) {
          updateData.audio_path = sPatch.audio.path;
          updateData.config = {
            audio: {
              name: sPatch.audio.name,
              sizeBytes: sPatch.audio.sizeBytes,
              durationSec: sPatch.audio.durationSec,
            },
          };
        } else {
          if (existing?.audio_path) {
            collectedOldPaths.push(existing.audio_path);
          }
          updateData.audio_path = null;
          updateData.config = {};
        }
      }
    }

    await tx.exam_sections.update({
      where: { id: secId },
      data: updateData,
    });
  }

  if (patch.deleteGroupIds && patch.deleteGroupIds.length > 0) {
    const grpsToDelete = await tx.question_groups.findMany({
      where: {
        id: { in: patch.deleteGroupIds },
        section: { exam_skill_id: skill.id },
      },
      select: { id: true, image_path: true, audio_path: true },
    });
    if (grpsToDelete.length !== patch.deleteGroupIds.length) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Nhóm câu hỏi cần xóa không thuộc về kỹ năng này.');
    }
    for (const g of grpsToDelete) {
      if (g.image_path) collectedOldPaths.push(g.image_path);
      if (g.audio_path) collectedOldPaths.push(g.audio_path);
    }

    const qIds = await tx.questions.findMany({
      where: { question_group_id: { in: patch.deleteGroupIds } },
      select: { id: true },
    });
    const qIdList = qIds.map((q) => q.id);
    if (qIdList.length > 0) {
      await tx.question_answers.deleteMany({ where: { question_id: { in: qIdList } } });
      await tx.question_options.deleteMany({ where: { question_id: { in: qIdList } } });
      await tx.questions.deleteMany({ where: { id: { in: qIdList } } });
    }
    await tx.question_groups.deleteMany({ where: { id: { in: patch.deleteGroupIds } } });
  }

  const groupsChange = (patch.upsertGroups?.length ?? 0) > 0 || (patch.moveGroups?.length ?? 0) > 0;
  if (groupsChange) {
    await tx.$executeRaw`
      update public.question_groups
      set order_no = order_no + 1000
      where section_id in (select id from public.exam_sections where exam_skill_id = ${skill.id}::uuid)
    `;
    await tx.$executeRaw`
      update public.questions
      set order_no = order_no + 1000
      where question_group_id in (
        select qg.id from public.question_groups qg
        join public.exam_sections s on s.id = qg.section_id
        where s.exam_skill_id = ${skill.id}::uuid
      )
    `;
  }

  const movedOld = (patch.moveGroups?.length ?? 0) > 0
    ? await tx.question_groups.findMany({
        where: { id: { in: patch.moveGroups!.map((m) => m.id) }, section: { exam_skill_id: skill.id } },
        select: { id: true, question_from: true, question_to: true },
      })
    : [];
  for (const mg of patch.moveGroups || []) {
    const targetSecId = sectionIdMap.get(mg.sectionOrderNo);
    if (!targetSecId) continue;
    const oldGrp = movedOld.find((g) => g.id === mg.id);
    if (!oldGrp) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Không tìm thấy nhóm câu hỏi cần di chuyển.');
    }
    const delta = (mg.questionFrom ?? 0) - (oldGrp.question_from ?? 0);
    const newQuestionTo = mg.questionTo !== undefined ? mg.questionTo : (oldGrp.question_to !== null ? oldGrp.question_to + delta : null);

    await tx.question_groups.update({
      where: { id: mg.id },
      data: {
        section_id: targetSecId,
        order_no: mg.orderNo,
        question_from: mg.questionFrom,
        question_to: newQuestionTo,
      },
    });

    if (delta !== 0) {
      await tx.$executeRaw`
        update public.questions
        set number_from = number_from + ${delta},
            number_to = number_to + ${delta}
        where question_group_id = ${mg.id}::uuid
      `;
    }
  }

  // Ghi theo lô: Supabase ở xa nên mỗi truy vấn tốn ~200ms. Gom toàn bộ nhóm đổi vào vài truy vấn.
  const upserts = patch.upsertGroups || [];
  const existingIds = upserts.map((u) => u.id).filter((x): x is string => Boolean(x));
  const existingImgs = existingIds.length > 0
    ? await tx.question_groups.findMany({ where: { id: { in: existingIds } }, select: { id: true, image_path: true } })
    : [];
  const newGroupRows: Prisma.question_groupsCreateManyInput[] = [];
  const qRows: Prisma.questionsCreateManyInput[] = [];
  const optRows: Prisma.question_optionsCreateManyInput[] = [];
  const ansRows: Prisma.question_answersCreateManyInput[] = [];

  if (existingIds.length > 0) {
    await tx.question_answers.deleteMany({ where: { question: { question_group_id: { in: existingIds } } } });
    await tx.question_options.deleteMany({ where: { question: { question_group_id: { in: existingIds } } } });
    await tx.questions.deleteMany({ where: { question_group_id: { in: existingIds } } });
  }

  for (const ug of upserts) {
    const targetSecId = sectionIdMap.get(ug.sectionOrderNo);
    if (!targetSecId) continue;
    const grpConfig = {
      ...ug.config,
      ...(ug.image?.name ? { imageName: ug.image.name } : {}),
    };
    const groupData = {
      section_id: targetSecId,
      order_no: ug.orderNo,
      question_type: ug.type,
      question_from: ug.questionFrom,
      question_to: ug.questionTo,
      instruction: ug.instruction || null,
      title: ug.title ?? null,
      image_path: ug.image?.path || null,
      config: grpConfig,
      content: ug.content || {},
    };

    let groupId = ug.id;
    if (!groupId) {
      groupId = crypto.randomUUID();
      newGroupRows.push({ id: groupId, ...groupData });
    } else {
      const oldImg = existingImgs.find((g) => g.id === groupId)?.image_path;
      if (oldImg && oldImg !== ug.image?.path) collectedOldPaths.push(oldImg);
      await tx.question_groups.update({ where: { id: groupId }, data: groupData });
    }

    const sortedQs = (ug.questions || []).slice().sort((a, b) => a.numberFrom - b.numberFrom);
    sortedQs.forEach((q, qIdx) => {
      const qId = crypto.randomUUID();
      const count = Math.max(1, q.numberTo - q.numberFrom + 1);
      qRows.push({
        id: qId,
        question_group_id: groupId!,
        order_no: qIdx + 1,
        question_type: ug.type,
        number_from: q.numberFrom,
        number_to: q.numberTo,
        answer_count: count,
        max_score: count,
        content: q.content || {},
        explanation: { items: (q.notes || []).map((note) => ({ note })) },
      });
      (q.options || []).forEach((opt, optIdx) => {
        optRows.push({
          id: crypto.randomUUID(),
          question_id: qId,
          order_no: optIdx + 1,
          label: opt.label,
          content: opt.text,
        });
      });
      ansRows.push({
        id: crypto.randomUUID(),
        question_id: qId,
        accepted_answers: q.accepted || [],
        matching_rule: q.matching || { kind: 'TEXT' },
        evidence: {
          items: (q.evidence || []).map((ev) => ({
            para: ev.para,
            label: ev.label,
            keys: ev.keys || [],
          })),
        },
      });
    });
  }
  if (newGroupRows.length > 0) await tx.question_groups.createMany({ data: newGroupRows });
  if (qRows.length > 0) await tx.questions.createMany({ data: qRows });
  if (optRows.length > 0) await tx.question_options.createMany({ data: optRows });
  if (ansRows.length > 0) await tx.question_answers.createMany({ data: ansRows });

  if (groupsChange) {
    await tx.$executeRaw`
      update public.question_groups
      set order_no = order_no - 1000
      where section_id in (select id from public.exam_sections where exam_skill_id = ${skill.id}::uuid)
        and order_no >= 1000
    `;
    await tx.$executeRaw`
      update public.questions
      set order_no = order_no - 1000
      where question_group_id in (
        select qg.id from public.question_groups qg
        join public.exam_sections s on s.id = qg.section_id
        where s.exam_skill_id = ${skill.id}::uuid
      )
      and order_no >= 1000
    `;
  }

  await tx.exam_skills.update({
    where: { id: skill.id },
    data: {
      duration_minutes: skillType === 'LISTENING' ? 40 : skill.duration_minutes,
      updated_at: new Date(),
    },
  });

  const finalSkill = await getEditorSkillInTx(tx, skill.id);
  const currentContent = skillType === 'READING' ? finalSkill.reading : finalSkill.listening;
  if (currentContent) {
    checkLrNumbering(currentContent, skillType);
  }

  const changeData = {
    version: skill.version_number,
    sectionsModified: patch.sections?.length ?? 0,
    groupsUpserted: patch.upsertGroups?.length ?? 0,
    groupsMoved: patch.moveGroups?.length ?? 0,
    groupsDeleted: patch.deleteGroupIds?.length ?? 0,
  };
  await writeAudit(tx, {
    actorId: actorId ?? null,
    action: 'EXAM_SKILL_SAVE',
    entityType: 'EXAM_SKILL',
    entityId: skill.id,
    changeData,
    reason: `Lưu nội dung kỹ năng ${skillType}`,
  });

  return { updatedSkill: finalSkill, oldPaths: collectedOldPaths };
}

/**
 * E2: Lưu nội dung kỹ năng (chỉ cho bản DRAFT).
 */
export async function saveSkillContent(
  skillId: string,
  input: {
    baseUpdatedAt: string;
    writing?: WritingContent;
    speaking?: SpeakingContent;
    reading?: LrPatch;
    listening?: LrPatch;
  },
  actorId?: string | null
): Promise<EditorSkill> {
  const { updatedSkill, oldPaths } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const skill = await tx.exam_skills.findUnique({
      where: { id: skillId },
      include: {
        exam: {
          select: { id: true, exam_set_id: true },
        },
      },
    });

    if (!skill) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    if (
      skill.skill !== 'WRITING' &&
      skill.skill !== 'SPEAKING' &&
      skill.skill !== 'READING' &&
      skill.skill !== 'LISTENING'
    ) {
      throw new HttpError(
        400,
        'SKILL_NOT_SUPPORTED',
        'Kỹ năng không được hỗ trợ.'
      );
    }

    // WS-01: Khóa bộ đề
    await lockExamSet(tx, skill.exam.exam_set_id);

    // WS-02: Chỉ cho bản DRAFT
    if (skill.status !== 'DRAFT') {
      throw new HttpError(
        409,
        'SKILL_NOT_DRAFT',
        'Kỹ năng này đã đăng. Bấm Chỉnh sửa để tạo bản sửa.'
      );
    }

    // WS-02: Kiểm tra baseUpdatedAt tránh ghi đè chéo
    const currentUpdated = skill.updated_at.toISOString();
    const baseUpdated = new Date(input.baseUpdatedAt).toISOString();
    if (currentUpdated !== baseUpdated) {
      throw new HttpError(
        409,
        'SKILL_CHANGED',
        'Đề vừa được lưu ở nơi khác. Tải lại trang để xem bản mới nhất.'
      );
    }

    if (skill.skill === 'READING') {
      if (!input.reading) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Thiếu nội dung Reading.');
      }
      return saveLrPatch(tx, skill, input.reading, 'READING', actorId);
    }

    if (skill.skill === 'LISTENING') {
      if (!input.listening) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Thiếu nội dung Listening.');
      }
      return saveLrPatch(tx, skill, input.listening, 'LISTENING', actorId);
    }

    // WS-04 & validate input theo kỹ năng (Writing / Speaking)
    if (skill.skill === 'WRITING') {
      if (!input.writing) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Thiếu nội dung Writing.');
      }

      // Kiểm tra ảnh Task 1
      const t1 = input.writing.tasks[0];
      if (t1?.imagePath && t1.imagePath.trim().length > 0) {
        const imgPath = t1.imagePath.trim();
        if (!imgPath.startsWith('exam-skills/')) {
          throw new HttpError(400, 'VALIDATION_ERROR', 'Đường dẫn ảnh không hợp lệ.');
        }
        const parts = imgPath.split('/');
        const sourceSkillId = parts[1];
        if (!sourceSkillId) {
          throw new HttpError(400, 'VALIDATION_ERROR', 'Đường dẫn ảnh không hợp lệ.');
        }

        const sourceSkill = await tx.exam_skills.findUnique({
          where: { id: sourceSkillId },
          select: { exam_id: true, skill: true, form: true },
        });

        if (
          !sourceSkill ||
          sourceSkill.exam_id !== skill.exam.id ||
          sourceSkill.skill !== 'WRITING' ||
          sourceSkill.form !== skill.form
        ) {
          throw new HttpError(
            400,
            'VALIDATION_ERROR',
            'Đường dẫn ảnh không thuộc về đề thi này.'
          );
        }
      }

      // Task 2 không có ảnh
      const t2 = input.writing.tasks[1];
      if (t2?.imagePath && t2.imagePath.trim().length > 0) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Task 2 không hỗ trợ ảnh đề.');
      }
    } else if (skill.skill === 'SPEAKING') {
      if (!input.speaking) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Thiếu nội dung Speaking.');
      }
    }

    // Xóa nội dung cũ và lấy đường dẫn ảnh cũ để dọn dẹp sau transaction (WS-09)
    const collectedPaths = await deleteSkillContent(tx, skillId);

    let savedSectionsCount = 0;
    let savedQuestionsCount = 0;

    // Ghi nội dung mới (E2: Batch write)
    if (skill.skill === 'WRITING' && input.writing) {
      const rows = writingToRows(input.writing);
      const sectionInserts: Prisma.exam_sectionsCreateManyInput[] = rows.map((r) => ({
        id: crypto.randomUUID(),
        exam_skill_id: skillId,
        order_no: r.order_no,
        title: r.title,
        section_type: r.section_type,
        content: r.content as Prisma.InputJsonValue,
        config: r.config as Prisma.InputJsonValue,
        image_path: r.image_path,
        instruction: r.instruction,
      }));
      if (sectionInserts.length > 0) {
        await tx.exam_sections.createMany({ data: sectionInserts });
      }
      savedSectionsCount = sectionInserts.length;
    } else if (skill.skill === 'SPEAKING' && input.speaking) {
      const rows = speakingToRows(input.speaking);
      const sectionInserts: Prisma.exam_sectionsCreateManyInput[] = [];
      const groupInserts: Prisma.question_groupsCreateManyInput[] = [];
      const questionInserts: Prisma.questionsCreateManyInput[] = [];

      for (const r of rows) {
        const secId = crypto.randomUUID();
        sectionInserts.push({
          id: secId,
          exam_skill_id: skillId,
          order_no: r.order_no,
          title: r.title,
          section_type: r.section_type,
          instruction: r.instruction,
          content: r.content as Prisma.InputJsonValue,
          config: r.config as Prisma.InputJsonValue,
        });

        for (const g of r.groups) {
          const grpId = crypto.randomUUID();
          groupInserts.push({
            id: grpId,
            section_id: secId,
            order_no: g.order_no,
            question_type: g.question_type,
            instruction: null,
          });

          for (const q of g.questions) {
            questionInserts.push({
              id: crypto.randomUUID(),
              question_group_id: grpId,
              order_no: q.order_no,
              question_type: q.question_type,
              content: q.content as Prisma.InputJsonValue,
            });
          }
        }
      }

      if (sectionInserts.length > 0) {
        await tx.exam_sections.createMany({ data: sectionInserts });
      }
      if (groupInserts.length > 0) {
        await tx.question_groups.createMany({ data: groupInserts });
      }
      if (questionInserts.length > 0) {
        await tx.questions.createMany({ data: questionInserts });
      }
      savedSectionsCount = sectionInserts.length;
      savedQuestionsCount = questionInserts.length;
    }

    // Cập nhật duration_minutes và trigger updated_at (WS-02)
    let newDuration = skill.duration_minutes;
    if (skill.skill === 'WRITING') {
      newDuration = 60;
    } else if (skill.skill === 'SPEAKING' && input.speaking) {
      const calc = speakingDuration(input.speaking);
      if (calc !== null) {
        newDuration = calc;
      }
    }

    await tx.exam_skills.update({
      where: { id: skillId },
      data: {
        duration_minutes: newDuration,
        updated_at: new Date(),
      },
    });

    // WS-12: Audit log
    const changeData = {
      ...(skill.skill === 'WRITING'
        ? { taskCount: input.writing?.tasks.length ?? 0 }
        : { partCount: 3 }),
      version: skill.version_number,
      sections: savedSectionsCount,
      questions: savedQuestionsCount,
    };

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SKILL_SAVE',
      entityType: 'EXAM_SKILL',
      entityId: skillId,
      changeData,
    });

    const refreshed = await getEditorSkillInTx(tx, skillId);
    return { updatedSkill: refreshed, oldPaths: collectedPaths };
  }, { timeout: 60000, maxWait: 10000 });

  // WS-09 & LR-09: Dọn dẹp tệp mồ côi ngoài transaction
  if (oldPaths.length > 0) {
    try {
      await cleanupOrphans(prisma, oldPaths);
    } catch (cleanupErr) {
      console.warn('Storage cleanup warning after save:', cleanupErr);
    }
  }

  return updatedSkill;
}

/**
 * E3: Tạo bản sửa (DRAFT) từ kỹ năng đã đăng hoặc đang ẩn.
 * Trả { skill, isExisting } để route quyết định trả 200 hay 201.
 */
export async function createRevisionDraft(
  skillId: string,
  actorId?: string | null
): Promise<{ skill: EditorSkill; isExisting: boolean }> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const sourceSkill = await tx.exam_skills.findUnique({
      where: { id: skillId },
      include: {
        exam: {
          select: { id: true, exam_set_id: true },
        },
      },
    });

    if (!sourceSkill) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    // WS-05: Nguồn phải là PUBLISHED hoặc HIDDEN
    if (sourceSkill.status !== 'PUBLISHED' && sourceSkill.status !== 'HIDDEN') {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        'Chỉ có thể tạo bản sửa từ kỹ năng đã đăng hoặc đang ẩn.'
      );
    }

    await lockExamSet(tx, sourceSkill.exam.exam_set_id);

    // Một truy vấn cho cả ô: tìm DRAFT có sẵn (WS-05) và version_number lớn nhất
    const slotRows = await tx.exam_skills.findMany({
      where: {
        exam_id: sourceSkill.exam_id,
        skill: sourceSkill.skill,
        form: sourceSkill.form ?? null,
      },
      select: { id: true, status: true, version_number: true },
    });

    // WS-05: Nếu ô đã có DRAFT thì trả bản DRAFT đó (200), không tạo thêm
    const existingDraft = slotRows.find((r) => r.status === 'DRAFT');
    if (existingDraft) {
      const skill = await getEditorSkillInTx(tx, existingDraft.id);
      return { skill, isExisting: true };
    }

    // version_number = max + 1 trên các dòng còn trong ô, tính cả ARCHIVED (như aggregate cũ)
    const nextVersion = slotRows.reduce((m, r) => Math.max(m, r.version_number), 0) + 1;

    // Tạo bản DRAFT mới
    const newSkill = await tx.exam_skills.create({
      data: {
        exam_id: sourceSkill.exam_id,
        skill: sourceSkill.skill,
        form: sourceSkill.form ?? null,
        version_number: nextVersion,
        status: 'DRAFT',
        duration_minutes: sourceSkill.duration_minutes,
        band_scale_id: null,
        grading_rule_id: null,
        published_at: null,
      },
    });

    // Chép toàn bộ sections, question_groups, questions, question_options, question_answers
    const sourceSections = await tx.exam_sections.findMany({
      relationLoadStrategy: 'join',
      where: { exam_skill_id: sourceSkill.id },
      orderBy: { order_no: 'asc' },
      include: {
        groups: {
          orderBy: { order_no: 'asc' },
          include: {
            questions: {
              orderBy: { order_no: 'asc' },
              include: {
                options: { orderBy: { order_no: 'asc' } },
                answer: true,
              },
            },
          },
        },
      },
    });

    // Chép toàn bộ sections, question_groups, questions, question_options, question_answers (E2: Batch write)
    const sectionInserts: Prisma.exam_sectionsCreateManyInput[] = [];
    const groupInserts: Prisma.question_groupsCreateManyInput[] = [];
    const questionInserts: Prisma.questionsCreateManyInput[] = [];
    const optionInserts: Prisma.question_optionsCreateManyInput[] = [];
    const answerInserts: Prisma.question_answersCreateManyInput[] = [];

    for (const sec of sourceSections) {
      const secId = crypto.randomUUID();
      sectionInserts.push({
        id: secId,
        exam_skill_id: newSkill.id,
        order_no: sec.order_no,
        title: sec.title,
        section_type: sec.section_type,
        instruction: sec.instruction,
        content: sec.content as Prisma.InputJsonValue,
        config: sec.config as Prisma.InputJsonValue,
        transcript: sec.transcript as Prisma.InputJsonValue,
        audio_path: sec.audio_path,
        image_path: sec.image_path,
      });

      for (const grp of sec.groups) {
        const grpId = crypto.randomUUID();
        groupInserts.push({
          id: grpId,
          section_id: secId,
          order_no: grp.order_no,
          title: grp.title,
          question_from: grp.question_from,
          question_to: grp.question_to,
          config: grp.config as Prisma.InputJsonValue,
          question_type: grp.question_type,
          instruction: grp.instruction,
          content: grp.content as Prisma.InputJsonValue,
          audio_path: grp.audio_path,
          image_path: grp.image_path,
        });

        for (const q of grp.questions) {
          const qId = crypto.randomUUID();
          questionInserts.push({
            id: qId,
            question_group_id: grpId,
            order_no: q.order_no,
            question_type: q.question_type,
            number_from: q.number_from,
            number_to: q.number_to,
            answer_count: q.answer_count,
            max_score: q.max_score,
            explanation: q.explanation as Prisma.InputJsonValue,
            content: q.content as Prisma.InputJsonValue,
          });

          for (const opt of q.options) {
            optionInserts.push({
              id: crypto.randomUUID(),
              question_id: qId,
              order_no: opt.order_no,
              label: opt.label,
              content: opt.content,
            });
          }

          if (q.answer) {
            answerInserts.push({
              id: crypto.randomUUID(),
              question_id: qId,
              accepted_answers: q.answer.accepted_answers as Prisma.InputJsonValue,
              matching_rule: q.answer.matching_rule as Prisma.InputJsonValue,
              evidence: q.answer.evidence as Prisma.InputJsonValue,
            });
          }
        }
      }
    }

    if (sectionInserts.length > 0) {
      await tx.exam_sections.createMany({ data: sectionInserts });
    }
    if (groupInserts.length > 0) {
      await tx.question_groups.createMany({ data: groupInserts });
    }
    if (questionInserts.length > 0) {
      await tx.questions.createMany({ data: questionInserts });
    }
    if (optionInserts.length > 0) {
      await tx.question_options.createMany({ data: optionInserts });
    }
    if (answerInserts.length > 0) {
      await tx.question_answers.createMany({ data: answerInserts });
    }

    // WS-12: Audit log
    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SKILL_DRAFT_CREATE',
      entityType: 'EXAM_SKILL',
      entityId: newSkill.id,
      changeData: {
        fromId: sourceSkill.id,
        fromSkillId: sourceSkill.id,
        fromVersion: sourceSkill.version_number,
        version: nextVersion,
      },
    });

    const skill = await getEditorSkillInTx(tx, newSkill.id);
    return { skill, isExisting: false };
  });
}

/**
 * E5: Tải ảnh đề cho Writing (Task 1), Reading hoặc Listening (ảnh bài đọc, sơ đồ/bản đồ).
 */
export async function uploadSkillImage(
  skillId: string,
  buffer: Buffer,
  contentType: string
): Promise<{ path: string; url: string }> {
  const skill = await prisma.exam_skills.findUnique({
    where: { id: skillId },
    select: { id: true, skill: true, status: true },
  });

  if (!skill) {
    throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
  }

  if (
    skill.skill !== 'WRITING' &&
    skill.skill !== 'READING' &&
    skill.skill !== 'LISTENING'
  ) {
    throw new HttpError(
      400,
      'SKILL_NOT_SUPPORTED',
      'Kỹ năng không được hỗ trợ tải ảnh.'
    );
  }

  if (skill.status !== 'DRAFT') {
    throw new HttpError(
      409,
      'SKILL_NOT_DRAFT',
      'Chỉ tải ảnh cho bản đang soạn.'
    );
  }

  const uploaded = await supabaseUploadSkillImage(skillId, buffer, contentType);

  // Chỉ dọn dẹp tức thì cho kỹ năng WRITING (LR-09c).
  // Với READING/LISTENING, người dùng tải nhiều ảnh/hình sơ đồ; nếu thoát mà Không lưu thì E9 sẽ dọn.
  if (skill.skill === 'WRITING') {
    try {
      const existing = await listObjectPaths(`exam-skills/${skillId}`);
      const candidates = existing.filter((p) => p !== uploaded.path && !p.includes('/audio/'));
      if (candidates.length > 0) {
        await cleanupOrphans(prisma, candidates);
      }
    } catch (cleanupErr) {
      console.warn('Storage cleanup warning after upload:', cleanupErr);
    }
  }

  return uploaded;
}

/**
 * E8: Tải ghi âm cho Listening.
 */
export async function uploadSkillAudio(
  skillId: string,
  buffer: Buffer,
  contentType: string
): Promise<{ path: string; url: string; sizeBytes: number }> {
  const skill = await prisma.exam_skills.findUnique({
    where: { id: skillId },
    select: { id: true, skill: true, status: true },
  });

  if (!skill) {
    throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
  }

  if (skill.skill !== 'LISTENING') {
    throw new HttpError(
      400,
      'SKILL_NOT_SUPPORTED',
      'Chỉ tải ghi âm cho kỹ năng Listening.'
    );
  }

  if (skill.status !== 'DRAFT') {
    throw new HttpError(
      409,
      'SKILL_NOT_DRAFT',
      'Chỉ tải ghi âm cho bản đang soạn.'
    );
  }

  return supabaseUploadSkillAudio(skillId, buffer, contentType);
}

/**
 * E9: Dọn các tệp đã tải trong phiên sửa mà không bấm Lưu.
 */
export async function discardUploads(
  skillId: string,
  paths: string[]
): Promise<{ removed: number }> {
  const skill = await prisma.exam_skills.findUnique({
    where: { id: skillId },
    select: { id: true, status: true },
  });

  if (!skill) {
    throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
  }

  if (skill.status !== 'DRAFT') {
    throw new HttpError(409, 'SKILL_NOT_DRAFT', 'Chỉ dọn tệp cho bản đang soạn.');
  }

  if (!Array.isArray(paths) || paths.length === 0) {
    return { removed: 0 };
  }

  const prefix = `exam-skills/${skillId}/`;
  const validPaths = paths
    .map((p) => String(p).trim())
    .filter((p) => p.startsWith(prefix));

  if (validPaths.length === 0) {
    return { removed: 0 };
  }

  const removed = await cleanupOrphans(prisma, validPaths);
  return { removed };
}

/**
 * E6: Xóa kỹ năng (áp dụng cho cả L/R/W/S).
 * Chỉ xóa bản DRAFT và chưa có lượt làm bài nào.
 */
export async function deleteSkill(
  skillId: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  const { examSet, oldPaths } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const skill = await tx.exam_skills.findUnique({
      where: { id: skillId },
      include: {
        exam: {
          select: { id: true, exam_set_id: true },
        },
      },
    });

    if (!skill) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    // WS-10: Chỉ xóa bản DRAFT
    if (skill.status !== 'DRAFT') {
      throw new HttpError(
        409,
        'SKILL_NOT_DELETABLE',
        'Chỉ xóa được bản đang soạn chưa đăng.'
      );
    }

    // WS-10: Kiểm tra lượt làm bài
    const attemptCountRows = await tx.$queryRaw<Array<{ count: bigint }>>`
      select count(*)::bigint as count
      from public.skill_attempts
      where exam_skill_id = ${skillId}::uuid
    `;
    const attemptCount = Number(attemptCountRows[0]?.count ?? 0n);
    if (attemptCount > 0) {
      throw new HttpError(
        409,
        'SKILL_NOT_DELETABLE',
        'Không thể xóa kỹ năng đã có lượt làm bài.'
      );
    }

    await lockExamSet(tx, skill.exam.exam_set_id);

    // Kiểm tra xem ô có bản đang hiển thị hay không (cho audit log)
    const liveSkill = await tx.exam_skills.findFirst({
      where: {
        exam_id: skill.exam_id,
        skill: skill.skill,
        form: skill.form ?? null,
        status: { in: ['PUBLISHED', 'HIDDEN'] },
        id: { not: skillId },
      },
    });
    const hadLive = Boolean(liveSkill);

    // Xóa từ dưới lên trong một câu SQL, lấy đường dẫn ảnh/audio để dọn dẹp sau transaction (WS-09)
    const collectedPaths = await deleteSkillContent(tx, skillId);

    // Xóa exam_skills có điều kiện status = 'DRAFT'
    const delRes = await tx.exam_skills.deleteMany({
      where: { id: skillId, status: 'DRAFT' },
    });

    if (delRes.count !== 1) {
      throw new HttpError(
        409,
        'SKILL_NOT_DELETABLE',
        'Chỉ xóa được bản đang soạn chưa đăng.'
      );
    }

    // WS-12: Audit log
    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SKILL_DELETE',
      entityType: 'EXAM_SKILL',
      entityId: skillId,
      changeData: {
        examId: skill.exam_id,
        skill: skill.skill,
        form: skill.form,
        version: skill.version_number,
        hadLive,
      },
    });

    const setAdmin = await loadExamSetAdmin(tx, skill.exam.exam_set_id);
    return { examSet: setAdmin, oldPaths: collectedPaths };
  });

  // WS-09 & LR-09: Dọn dẹp storage mồ côi
  if (oldPaths.length > 0) {
    try {
      await cleanupOrphans(prisma, oldPaths);
    } catch (cleanupErr) {
      console.warn('Storage cleanup warning after skill deletion:', cleanupErr);
    }
  }

  return examSet;
}
