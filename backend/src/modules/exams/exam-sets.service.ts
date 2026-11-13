import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';
import { writeAudit } from '../../shared/audit.js';
import { findOrCreateCategory } from './categories.service.js';
import {
  type ExamSetAdminDto,
  type ExamSetWithRelations,
  toExamSetAdminDto,
} from './exams.mapper.js';
import { canPublishSet, canDeleteSet } from './exam-rules.js';
import { deleteExamTree } from './exam-tests.service.js';
import {
  uploadCover as uploadCoverStorage,
  removeObject,
} from '../../integrations/storage/supabase-storage.js';

export async function lockExamSet(tx: Prisma.TransactionClient, id: string): Promise<void> {
  const rows = await tx.$queryRaw`select id from public.exam_sets where id = ${id}::uuid for update`;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
  }
}

export async function loadExamSetAdmin(
  tx: Prisma.TransactionClient,
  id: string
): Promise<ExamSetAdminDto> {
  const set = await tx.exam_sets.findUnique({
    where: { id },
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
    throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
  }

  const attemptCounts = await tx.$queryRaw<Array<{ exam_id: string; count: bigint }>>`
    select exam_id, count(*)::bigint as count
    from public.attempts
    where exam_id in (select id from public.exams where exam_set_id = ${id}::uuid)
      and status = 'COMPLETED'
    group by exam_id
  `;

  const countMap = new Map<string, number>();
  for (const row of attemptCounts) {
    countMap.set(row.exam_id, Number(row.count));
  }

  return toExamSetAdminDto(set as unknown as ExamSetWithRelations, countMap);
}

export async function listExamSets(): Promise<ExamSetAdminDto[]> {
  const sets = await prisma.exam_sets.findMany({
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

  const attemptCounts = await prisma.$queryRaw<Array<{ exam_id: string; count: bigint }>>`
    select exam_id, count(*)::bigint as count
    from public.attempts
    where status = 'COMPLETED'
    group by exam_id
  `;

  const countMap = new Map<string, number>();
  for (const row of attemptCounts) {
    countMap.set(row.exam_id, Number(row.count));
  }

  const items = sets.map((s) =>
    toExamSetAdminDto(s as unknown as ExamSetWithRelations, countMap)
  );

  // Mới cập nhật trước theo max(updatedAt)
  items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return items;
}

export async function getExamSet(id: string): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
    return loadExamSetAdmin(tx, id);
  });
}

export type CreateSetInput = {
  name: string;
  description?: string | null;
  categoryId?: string;
  newCategoryName?: string;
  coverUrl?: string | null;
};

export async function createExamSet(
  input: CreateSetInput,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  try {
    return await prisma.$transaction(async (tx) => {
      let finalCategoryId = input.categoryId;

      if (input.newCategoryName) {
        const cat = await findOrCreateCategory(tx, input.newCategoryName, actorId);
        finalCategoryId = cat.id;
      }

      if (!finalCategoryId) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Danh mục bộ đề là bắt buộc.');
      }

      const created = await tx.exam_sets.create({
        data: {
          name: input.name.trim(),
          description: input.description ?? null,
          category_id: finalCategoryId,
          cover_url: input.coverUrl ?? null,
          status: 'DRAFT',
          created_by: actorId ?? null,
        },
      });

      await writeAudit(tx, {
        actorId,
        action: 'EXAM_SET_CREATE',
        entityType: 'EXAM_SET',
        entityId: created.id,
        changeData: created,
      });

      return loadExamSetAdmin(tx, created.id);
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'EXAM_SET_NAME_EXISTS', 'Đã có bộ đề cùng tên.');
    }
    throw error;
  }
}

export type PatchSetInput = {
  name?: string;
  description?: string | null;
  categoryId?: string;
  newCategoryName?: string;
  coverUrl?: string | null;
};

export async function patchExamSet(
  id: string,
  input: PatchSetInput,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  try {
    return await prisma.$transaction(async (tx) => {
      await lockExamSet(tx, id);

      const existing = await tx.exam_sets.findUnique({ where: { id } });
      if (!existing) {
        throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
      }

      let finalCategoryId = existing.category_id;
      if (input.newCategoryName) {
        const cat = await findOrCreateCategory(tx, input.newCategoryName, actorId);
        finalCategoryId = cat.id;
      } else if (input.categoryId) {
        finalCategoryId = input.categoryId;
      }

      const updateData: Prisma.exam_setsUpdateInput = {};
      if (input.name !== undefined) updateData.name = input.name.trim();
      if (input.description !== undefined) updateData.description = input.description;
      if (input.coverUrl !== undefined) updateData.cover_url = input.coverUrl;
      if (finalCategoryId !== existing.category_id) {
        updateData.category = { connect: { id: finalCategoryId } };
      }

      const updated = await tx.exam_sets.update({
        where: { id },
        data: updateData,
      });

      await writeAudit(tx, {
        actorId,
        action: 'EXAM_SET_UPDATE',
        entityType: 'EXAM_SET',
        entityId: id,
        changeData: { before: existing, after: updated },
      });

      return loadExamSetAdmin(tx, id);
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'EXAM_SET_NAME_EXISTS', 'Đã có bộ đề cùng tên.');
    }
    throw error;
  }
}

export async function publishExamSet(
  id: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
    await lockExamSet(tx, id);

    const currentDto = await loadExamSetAdmin(tx, id);

    // QB-04: kiểm tra điều kiện đăng
    const check = canPublishSet(currentDto.tests);
    if (!check.ok) {
      throw new HttpError(409, check.code!, check.message!);
    }

    if (currentDto.status !== 'DRAFT' && currentDto.status !== 'HIDDEN') {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        'Bộ đề chỉ có thể công khai từ trạng thái Bản nháp hoặc Đã ẩn.'
      );
    }

    const updated = await tx.exam_sets.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        published_at: currentDto.publishedAt ? new Date(currentDto.publishedAt) : new Date(),
      },
    });

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SET_PUBLISH',
      entityType: 'EXAM_SET',
      entityId: id,
      changeData: { before: currentDto.status, after: 'PUBLISHED' },
    });

    return loadExamSetAdmin(tx, id);
  });
}

export async function hideExamSet(
  id: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  return prisma.$transaction(async (tx) => {
    await lockExamSet(tx, id);

    // QB-05: Ẩn bộ đề chỉ từ PUBLISHED
    const updated = await tx.exam_sets.updateMany({
      where: {
        id,
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
        'Chỉ có thể ẩn bộ đề đang ở trạng thái Công khai.'
      );
    }

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SET_HIDE',
      entityType: 'EXAM_SET',
      entityId: id,
      changeData: { before: 'PUBLISHED', after: 'HIDDEN' },
    });

    return loadExamSetAdmin(tx, id);
  });
}

export async function deleteExamSet(
  id: string,
  actorId?: string | null
): Promise<void> {
  let coverUrlToDelete: string | null = null;

  await prisma.$transaction(async (tx) => {
    await lockExamSet(tx, id);

    const currentDto = await loadExamSetAdmin(tx, id);

    // QB-06: Xóa bộ đề
    if (!currentDto.canDelete) {
      throw new HttpError(
        409,
        'EXAM_SET_NOT_DELETABLE',
        'Bộ đề đã công khai và đã có đề: chỉ ẩn được, không xóa.'
      );
    }

    coverUrlToDelete = currentDto.coverUrl;

    const testIds = currentDto.tests.map((t) => t.id);
    if (testIds.length > 0) {
      await deleteExamTree(tx, testIds);
    }

    await tx.exam_sets.delete({
      where: { id },
    });

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SET_DELETE',
      entityType: 'EXAM_SET',
      entityId: id,
      changeData: currentDto,
    });
  });

  if (coverUrlToDelete && (coverUrlToDelete as string).startsWith('http')) {
    void removeObject(coverUrlToDelete);
  }
}

export async function uploadCover(
  id: string,
  buffer: Buffer,
  contentType: string,
  actorId?: string | null
): Promise<ExamSetAdminDto> {
  const publicUrl = await uploadCoverStorage(id, buffer, contentType);

  let oldCoverUrl: string | null = null;

  const result = await prisma.$transaction(async (tx) => {
    await lockExamSet(tx, id);

    const existing = await tx.exam_sets.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    oldCoverUrl = existing.cover_url;

    await tx.exam_sets.update({
      where: { id },
      data: { cover_url: publicUrl },
    });

    await writeAudit(tx, {
      actorId,
      action: 'EXAM_SET_COVER_UPLOAD',
      entityType: 'EXAM_SET',
      entityId: id,
      changeData: { oldCoverUrl, newCoverUrl: publicUrl },
    });

    return loadExamSetAdmin(tx, id);
  });

  if (oldCoverUrl && (oldCoverUrl as string).startsWith('http')) {
    void removeObject(oldCoverUrl);
  }

  return result;
}

