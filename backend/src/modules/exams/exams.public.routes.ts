import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { idParamSchema } from './exams.schemas.js';
import {
  type ExamSetWithRelations,
  toExamSetPublicDto,
} from './exams.mapper.js';

export const publicExamsRouter = Router();

// P1: GET /exam-sets/:id
publicExamsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Bộ đề không tồn tại hoặc chưa công khai.');
    }

    const set = await prisma.exam_sets.findFirst({
      where: {
        id: pParam.data.id,
        status: 'PUBLISHED',
      },
      include: {
        category: true,
        exams: {
          include: {
            skills: true,
            _count: {
              select: { attempts: true },
            },
          },
        },
      },
    });

    if (!set) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Bộ đề không tồn tại hoặc chưa công khai.');
    }

    // Lấy danh sách liên quan: tối đa 5 bộ PUBLISHED cùng category_id, khác id, mới đăng trước
    const relatedSets = await prisma.exam_sets.findMany({
      where: {
        category_id: set.category_id,
        status: 'PUBLISHED',
        id: { not: set.id },
      },
      orderBy: { published_at: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        cover_url: true,
        exams: {
          select: {
            id: true,
            _count: {
              select: { attempts: true },
            },
          },
        },
      },
    });

    // Lấy attempts count cho set hiện tại
    const attemptCounts = await prisma.$queryRaw<Array<{ exam_id: string; count: bigint }>>`
      select exam_id, count(*)::bigint as count
      from public.attempts
      where status = 'COMPLETED'
        and exam_id in (
          select id from public.exams where exam_set_id = ${set.id}::uuid
          union
          select id from public.exams where exam_set_id in (${
            relatedSets.length > 0
              ? prisma.$queryRaw`select id from public.exam_sets where category_id = ${set.category_id}::uuid and status = 'PUBLISHED'`
              : set.id
          })
        )
      group by exam_id
    `.catch(() => [] as Array<{ exam_id: string; count: bigint }>);

    const countMap = new Map<string, number>();
    for (const row of attemptCounts) {
      countMap.set(row.exam_id, Number(row.count));
    }

    const publicDto = toExamSetPublicDto(
      set as unknown as ExamSetWithRelations,
      relatedSets,
      countMap
    );

    res.json(publicDto);
  })
);
