import type { Prisma, exam_set_categories } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { writeAudit } from '../../shared/audit.js';

export async function listCategories(): Promise<exam_set_categories[]> {
  return prisma.exam_set_categories.findMany({
    orderBy: [
      { order_no: 'asc' },
      { name: 'asc' },
    ],
  });
}

export async function findOrCreateCategory(
  tx: Prisma.TransactionClient,
  name: string,
  actorId?: string | null
): Promise<exam_set_categories> {
  const trimmed = name.trim();

  // Tìm danh mục trùng tên không phân biệt hoa thường
  const existing: exam_set_categories[] = await tx.$queryRaw`
    SELECT * FROM public.exam_set_categories
    WHERE lower(btrim(name)) = lower(btrim(${trimmed}))
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0];
  }

  // Lấy order_no lớn nhất hiện tại + 1 (mặc định tối thiểu 10)
  const maxOrderResult: Array<{ max_order: number | null }> = await tx.$queryRaw`
    SELECT max(order_no)::int as max_order FROM public.exam_set_categories
  `;
  const nextOrder = (maxOrderResult[0]?.max_order ?? 10) + 1;

  const created = await tx.exam_set_categories.create({
    data: {
      name: trimmed,
      order_no: nextOrder,
      created_by: actorId ?? null,
    },
  });

  await writeAudit(tx, {
    actorId,
    action: 'EXAM_SET_CATEGORY_CREATE',
    entityType: 'EXAM_SET_CATEGORY',
    entityId: created.id,
    changeData: created,
  });

  return created;
}
