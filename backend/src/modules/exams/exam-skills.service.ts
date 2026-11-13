import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import { writeAudit } from '../../shared/audit.js';
import { lockExamSet, loadExamSetAdmin } from './exam-sets.service.js';
import { defaultDuration, validateSkillReady } from './exam-rules.js';
import type { ExamSetAdminDto } from './exams.mapper.js';

export async function createSkill(
  examId: string,
  skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING',
  form?: 'ACADEMIC' | 'GENERAL' | null,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  // Validate skill/form relationship
  if (skill === 'READING' || skill === 'WRITING') {
    if (!form || (form !== 'ACADEMIC' && form !== 'GENERAL')) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Hình thức thi (form) bắt buộc là ACADEMIC hoặc GENERAL cho Reading và Writing.'
      );
    }
  } else {
    if (form) {
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        'Listening và Speaking không có hình thức thi (form).'
      );
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const exam = await tx.exams.findUnique({
        where: { id: examId },
        select: { id: true, exam_set_id: true },
      });

      if (!exam) {
        throw new HttpError(404, 'EXAM_NOT_FOUND', 'Không tìm thấy đề thi.');
      }

      await lockExamSet(tx, exam.exam_set_id);

      // QB-09: chỉ khi ô chưa có dòng nào khác ARCHIVED (tức là chưa có DRAFT, PUBLISHED, HIDDEN)
      const existingRows = await tx.exam_skills.findMany({
        where: {
          exam_id: examId,
          skill,
          form: form ?? null,
        },
      });

      const hasActive = existingRows.some((r) => r.status !== 'ARCHIVED');
      if (hasActive) {
        throw new HttpError(
          409,
          'SLOT_EXISTS',
          'Kỹ năng này đã tồn tại trong đề thi.'
        );
      }

      // version_number = max + 1 tính cả ARCHIVED
      let maxVersion = 0;
      for (const r of existingRows) {
        if (r.version_number > maxVersion) {
          maxVersion = r.version_number;
        }
      }
      const nextVersion = maxVersion + 1;

      const duration = defaultDuration(skill);

      const created = await tx.exam_skills.create({
        data: {
          exam_id: examId,
          skill,
          form: form ?? null,
          version_number: nextVersion,
          status: 'DRAFT',
          duration_minutes: duration,
          created_by: actorId ?? null,
        },
      });

      await writeAudit(tx, {
        actorId,
        action: 'EXAM_SKILL_CREATE',
        entityType: 'EXAM_SKILL',
        entityId: created.id,
        changeData: created,
      });

      return loadExamSetAdmin(tx, exam.exam_set_id);
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'SLOT_EXISTS', 'Kỹ năng này đã tồn tại trong đề thi.');
    }
    throw error;
  }
}

export async function hideSkill(
  skillId: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
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

    await lockExamSet(tx, skill.exam.exam_set_id);

    // QB-10: Cập nhật có điều kiện trạng thái cũ PUBLISHED -> HIDDEN
    const updated = await tx.exam_skills.updateMany({
      where: {
        id: skillId,
        status: 'PUBLISHED',
      },
      data: {
        status: 'HIDDEN',
      },
    });

    if (updated.count !== 1) {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        'Chỉ có thể ẩn kỹ năng đang ở trạng thái Đã đăng.'
      );
    }

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SKILL_HIDE',
      entityType: 'EXAM_SKILL',
      entityId: skillId,
      changeData: { before: 'PUBLISHED', after: 'HIDDEN' },
    });

    return loadExamSetAdmin(tx, skill.exam.exam_set_id);
  });
}

export async function showSkill(
  skillId: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
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

    await lockExamSet(tx, skill.exam.exam_set_id);

    // QB-10: Cập nhật có điều kiện trạng thái cũ HIDDEN -> PUBLISHED
    const updated = await tx.exam_skills.updateMany({
      where: {
        id: skillId,
        status: 'HIDDEN',
      },
      data: {
        status: 'PUBLISHED',
      },
    });

    if (updated.count !== 1) {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        'Chỉ có thể hiện kỹ năng đang ở trạng thái Đã ẩn.'
      );
    }

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SKILL_SHOW',
      entityType: 'EXAM_SKILL',
      entityId: skillId,
      changeData: { before: 'HIDDEN', after: 'PUBLISHED' },
    });

    return loadExamSetAdmin(tx, skill.exam.exam_set_id);
  });
}

export async function publishSkill(
  skillId: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
    const skill = await tx.exam_skills.findUnique({
      where: { id: skillId },
      include: {
        exam: {
          select: { id: true, exam_set_id: true },
        },
        sections: {
          include: {
            groups: {
              include: {
                questions: {
                  include: {
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

    if (skill.status !== 'DRAFT') {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        'Chỉ có thể đăng kỹ năng đang ở trạng thái Bản nháp (Đang soạn).'
      );
    }

    await lockExamSet(tx, skill.exam.exam_set_id);

    // QB-12: Kiểm tra band_scale_id / grading_rule_id
    let assignedBandScaleId = skill.band_scale_id;
    let assignedGradingRuleId = skill.grading_rule_id;
    const reasons: string[] = [];

    if (skill.skill === 'READING' || skill.skill === 'LISTENING') {
      if (!assignedBandScaleId) {
        const latestScale = await tx.band_scales.findFirst({
          where: {
            skill: skill.skill,
            form: skill.form ?? null,
          },
          orderBy: { version: 'desc' },
        });
        if (!latestScale) {
          reasons.push('Chưa cấu hình thang điểm (band scale) phù hợp cho kỹ năng này.');
        } else {
          assignedBandScaleId = latestScale.id;
        }
      }
    } else if (skill.skill === 'WRITING' || skill.skill === 'SPEAKING') {
      if (!assignedGradingRuleId) {
        const latestRule = await tx.grading_rules.findFirst({
          where: {
            skill: skill.skill,
          },
          orderBy: { version: 'desc' },
        });
        if (!latestRule) {
          reasons.push('Chưa cấu hình quy tắc chấm (grading rule) phù hợp cho kỹ năng này.');
        } else {
          assignedGradingRuleId = latestRule.id;
        }
      }
    }

    // QB-12: validateSkillReady
    const validation = validateSkillReady(skill);
    if (!validation.ready) {
      reasons.push(...validation.reasons);
    }

    if (reasons.length > 0) {
      throw new HttpError(
        422,
        'SKILL_NOT_READY',
        'Kỹ năng chưa đủ điều kiện để đăng.',
        reasons
      );
    }

    // QB-11:
    // 1. Chuyển live hiện tại (PUBLISHED hoặc HIDDEN) sang ARCHIVED
    await tx.exam_skills.updateMany({
      where: {
        exam_id: skill.exam_id,
        skill: skill.skill,
        form: skill.form ?? null,
        status: { in: ['PUBLISHED', 'HIDDEN'] },
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    // 2. Chuyển DRAFT sang PUBLISHED với published_at = now()
    const updated = await tx.exam_skills.update({
      where: { id: skillId },
      data: {
        status: 'PUBLISHED',
        published_at: new Date(),
        band_scale_id: assignedBandScaleId ?? null,
        grading_rule_id: assignedGradingRuleId ?? null,
      },
    });

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SKILL_PUBLISH',
      entityType: 'EXAM_SKILL',
      entityId: skillId,
      changeData: { before: 'DRAFT', after: 'PUBLISHED' },
    });

    return loadExamSetAdmin(tx, skill.exam.exam_set_id);
  });
}
