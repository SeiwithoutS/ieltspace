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
  type RawSection,
  sectionsToWriting,
  sectionsToSpeaking,
  writingToRows,
  speakingToRows,
} from './exam-content.mapper.js';
import { speakingDuration } from './exam-rules.js';
import {
  uploadSkillImage as supabaseUploadSkillImage,
  publicUrl,
  removeObjects,
} from '../../integrations/storage/supabase-storage.js';

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

  if (skill.skill !== 'WRITING' && skill.skill !== 'SPEAKING') {
    throw new HttpError(
      400,
      'SKILL_NOT_SUPPORTED',
      'Chỉ hỗ trợ kỹ năng Writing hoặc Speaking.'
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

  if (skill.skill === 'WRITING') {
    writing = sectionsToWriting(skill.sections as RawSection[], (path) =>
      publicUrl(path)
    );
  } else if (skill.skill === 'SPEAKING') {
    speaking = sectionsToSpeaking(skill.sections as RawSection[]);
  }

  return {
    id: skill.id,
    skill: skill.skill as 'WRITING' | 'SPEAKING',
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
  const rows = await tx.$queryRaw<Array<{ image_path: string | null; audio_path: string | null }>>`
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
      returning image_path, audio_path
    )
    select image_path, audio_path from dg
    union all
    select image_path, audio_path from ds
  `;
  return rows
    .flatMap((r) => [r.image_path, r.audio_path])
    .filter((p): p is string => Boolean(p));
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

    if (skill.skill !== 'WRITING' && skill.skill !== 'SPEAKING') {
      throw new HttpError(
        400,
        'SKILL_NOT_SUPPORTED',
        'Chỉ hỗ trợ kỹ năng Writing hoặc Speaking.'
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

    // WS-04 & validate input theo kỹ năng
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
  });

  // WS-09: Dọn dẹp ảnh mồ côi ngoài transaction
  if (oldPaths.length > 0) {
    try {
      const remainingSecs = await prisma.exam_sections.findMany({
        where: {
          OR: [
            { image_path: { in: oldPaths } },
            { audio_path: { in: oldPaths } },
          ],
        },
        select: { image_path: true, audio_path: true },
      });
      const remainingGrps = await prisma.question_groups.findMany({
        where: {
          OR: [
            { image_path: { in: oldPaths } },
            { audio_path: { in: oldPaths } },
          ],
        },
        select: { image_path: true, audio_path: true },
      });
      const stillUsed = new Set([
        ...remainingSecs.flatMap((s: { image_path: string | null; audio_path: string | null }) => [s.image_path, s.audio_path]),
        ...remainingGrps.flatMap((g: { image_path: string | null; audio_path: string | null }) => [g.image_path, g.audio_path]),
      ].filter((p): p is string => Boolean(p)));

      const orphaned = oldPaths.filter((p: string) => !stillUsed.has(p));
      if (orphaned.length > 0) {
        await removeObjects(orphaned);
      }
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

    if (sourceSkill.skill !== 'WRITING' && sourceSkill.skill !== 'SPEAKING') {
      throw new HttpError(
        400,
        'SKILL_NOT_SUPPORTED',
        'Chỉ hỗ trợ kỹ năng Writing hoặc Speaking.'
      );
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
 * E5: Tải ảnh đề cho Writing (Task 1).
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

  if (skill.skill !== 'WRITING') {
    throw new HttpError(
      400,
      'SKILL_NOT_SUPPORTED',
      'Chỉ tải ảnh cho kỹ năng Writing.'
    );
  }

  if (skill.status !== 'DRAFT') {
    throw new HttpError(
      409,
      'SKILL_NOT_DRAFT',
      'Chỉ tải ảnh cho bản đang soạn.'
    );
  }

  return supabaseUploadSkillImage(skillId, buffer, contentType);
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

  // WS-09: Dọn dẹp storage mồ côi
  if (oldPaths.length > 0) {
    try {
      const remainingSecs = await prisma.exam_sections.findMany({
        where: {
          OR: [
            { image_path: { in: oldPaths } },
            { audio_path: { in: oldPaths } },
          ],
        },
        select: { image_path: true, audio_path: true },
      });
      const remainingGrps = await prisma.question_groups.findMany({
        where: {
          OR: [
            { image_path: { in: oldPaths } },
            { audio_path: { in: oldPaths } },
          ],
        },
        select: { image_path: true, audio_path: true },
      });
      const stillUsed = new Set([
        ...remainingSecs.flatMap((s: { image_path: string | null; audio_path: string | null }) => [s.image_path, s.audio_path]),
        ...remainingGrps.flatMap((g: { image_path: string | null; audio_path: string | null }) => [g.image_path, g.audio_path]),
      ].filter((p): p is string => Boolean(p)));

      const orphaned = oldPaths.filter((p: string) => !stillUsed.has(p));
      if (orphaned.length > 0) {
        await removeObjects(orphaned);
      }
    } catch (cleanupErr) {
      console.warn('Storage cleanup warning after skill deletion:', cleanupErr);
    }
  }

  return examSet;
}
