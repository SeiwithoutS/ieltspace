import type { Prisma } from '@prisma/client';

export type AuditAction =
  | 'EXAM_SET_CATEGORY_CREATE'
  | 'EXAM_SET_CREATE'
  | 'EXAM_SET_UPDATE'
  | 'EXAM_SET_COVER_UPLOAD'
  | 'EXAM_SET_PUBLISH'
  | 'EXAM_SET_HIDE'
  | 'EXAM_SET_DELETE'
  | 'EXAM_CREATE'
  | 'EXAM_DELETE'
  | 'EXAM_SKILL_CREATE'
  | 'EXAM_SKILL_HIDE'
  | 'EXAM_SKILL_SHOW'
  | 'EXAM_SKILL_PUBLISH'
  | 'EXAM_SKILL_SAVE'
  | 'EXAM_SKILL_DRAFT_CREATE'
  | 'EXAM_SKILL_DELETE';

export type AuditEntityType =
  | 'EXAM_SET'
  | 'EXAM'
  | 'EXAM_SKILL'
  | 'EXAM_SET_CATEGORY';

export async function writeAudit(
  tx: Prisma.TransactionClient,
  params: {
    actorId?: string | null;
    action: AuditAction | string;
    entityType: AuditEntityType | string;
    entityId?: string | null;
    changeData?: unknown;
    reason?: string | null;
  }
) {
  await tx.audit_logs.create({
    data: {
      actor_id: params.actorId ?? null,
      actor_type: 'USER',
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      change_data: (params.changeData as Prisma.InputJsonValue) ?? undefined,
      reason: params.reason ?? null,
    },
  });
}

