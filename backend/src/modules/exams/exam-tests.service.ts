import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import { writeAudit } from '../../shared/audit.js';
import { lockExamSet, loadExamSetAdmin } from './exam-sets.service.js';
import type { ExamSetAdminDto } from './exams.mapper.js';

export async function deleteExamTree(
  tx: Prisma.TransactionClient,
  examIds: string[]
): Promise<void> {
  if (examIds.length === 0) return;

  // 1. question_answers
  await tx.question_answers.deleteMany({
    where: {
      question: {
        group: {
          section: {
            exam_skill: {
              exam_id: { in: examIds },
            },
          },
        },
      },
    },
  });

  // 2. question_options
  await tx.question_options.deleteMany({
    where: {
      question: {
        group: {
          section: {
            exam_skill: {
              exam_id: { in: examIds },
            },
          },
        },
      },
    },
  });

  // 3. questions
  await tx.questions.deleteMany({
    where: {
      group: {
        section: {
          exam_skill: {
            exam_id: { in: examIds },
          },
        },
      },
    },
  });

  // 4. question_groups
  await tx.question_groups.deleteMany({
    where: {
      section: {
        exam_skill: {
          exam_id: { in: examIds },
        },
      },
    },
  });

  // 5. exam_sections
  await tx.exam_sections.deleteMany({
    where: {
      exam_skill: {
        exam_id: { in: examIds },
      },
    },
  });

  // 6. exam_skills
  await tx.exam_skills.deleteMany({
    where: {
      exam_id: { in: examIds },
    },
  });

  // 7. import_errors
  await tx.import_errors.deleteMany({
    where: {
      batch: {
        exam_id: { in: examIds },
      },
    },
  });

  // 8. import_assets
  await tx.import_assets.deleteMany({
    where: {
      batch: {
        exam_id: { in: examIds },
      },
    },
  });

  // 9. import_batches
  await tx.import_batches.deleteMany({
    where: {
      exam_id: { in: examIds },
    },
  });

  // 10. exams
  await tx.exams.deleteMany({
    where: {
      id: { in: examIds },
    },
  });
}

export async function addTest(
  examSetId: string,
  title?: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  const tryCreate = async () => {
    return prisma.$transaction(async (tx) => {
      await lockExamSet(tx, examSetId);

      const maxOrderRes: Array<{ max_order: number | null }> = await tx.$queryRaw`
        SELECT max(order_no)::int as max_order FROM public.exams WHERE exam_set_id = ${examSetId}::uuid
      `;
      const nextOrder = (maxOrderRes[0]?.max_order ?? 0) + 1;
      const testTitle = title?.trim() || `Test ${nextOrder}`;

      const created = await tx.exams.create({
        data: {
          exam_set_id: examSetId,
          order_no: nextOrder,
          title: testTitle,
          created_by: actorId ?? null,
        },
      });

      await writeAudit(tx, {
        actorId,
        action: 'EXAM_CREATE',
        entityType: 'EXAM',
        entityId: created.id,
        changeData: created,
      });

      return loadExamSetAdmin(tx, examSetId);
    });
  };

  try {
    return await tryCreate();
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Retry once if concurrent addTest clashed on (exam_set_id, order_no)
      return await tryCreate();
    }
    throw error;
  }
}

export async function deleteTest(
  examId: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
    const exam = await tx.exams.findUnique({
      where: { id: examId },
      include: {
        skills: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    if (!exam) {
      throw new HttpError(404, 'EXAM_NOT_FOUND', 'Không tìm thấy đề thi.');
    }

    const examSetId = exam.exam_set_id;
    await lockExamSet(tx, examSetId);

    // QB-08: Test chưa từng đăng và không có attempts
    const everPublished = exam.skills.some((s) => s.published_at !== null);
    const attemptCount = exam._count.attempts;

    if (everPublished || attemptCount > 0) {
      throw new HttpError(
        409,
        'EXAM_NOT_DELETABLE',
        `${exam.title} đã đăng nên không xóa được, để giữ bài làm của người học. Hãy ẩn từng kỹ năng nếu không muốn người học thấy.`
      );
    }

    await deleteExamTree(tx, [examId]);

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_DELETE',
      entityType: 'EXAM',
      entityId: examId,
      changeData: { id: examId, title: exam.title, exam_set_id: examSetId },
    });

    return loadExamSetAdmin(tx, examSetId);
  });
}
