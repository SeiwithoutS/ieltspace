import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/http.js';

export type SkillHistoryVersion = {
  id: string;
  versionNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  publishedAt: string | null;
  updatedAt: string;
  basedOnVersion: number | null;
  isCurrent: boolean;
};

export type SkillHistoryEvent = {
  at: string;
  action: string;
  version: number | null;
  actor: { name: string } | null;
  summary: string;
};

export type SkillHistoryDto = {
  slot: {
    examId: string;
    skill: string;
    form: string | null;
  };
  versions: SkillHistoryVersion[];
  events: SkillHistoryEvent[];
};

export function formatEventSummary(
  action: string,
  changeData: any,
  versionNum: number | null
): string {
  const v = versionNum ?? changeData?.version ?? '';
  switch (action) {
    case 'EXAM_SKILL_CREATE':
      return `Tạo phiên bản ${v}`;
    case 'EXAM_SKILL_DRAFT_CREATE': {
      const from = changeData?.fromVersion;
      return from
        ? `Tạo phiên bản ${v} từ phiên bản ${from} để chỉnh sửa`
        : `Tạo phiên bản ${v} để chỉnh sửa`;
    }
    case 'EXAM_SKILL_SAVE':
      return `Lưu nội dung phiên bản ${v}`;
    case 'EXAM_SKILL_PUBLISH': {
      const old = changeData?.oldVersion;
      return old
        ? `Đăng phiên bản ${v}, thay phiên bản ${old}`
        : `Đăng phiên bản ${v}`;
    }
    case 'EXAM_SKILL_HIDE':
      return `Ẩn phiên bản ${v}`;
    case 'EXAM_SKILL_SHOW':
      return `Hiện lại phiên bản ${v}`;
    case 'EXAM_SKILL_DELETE':
      return `Xóa phiên bản nháp ${v}`;
    default:
      return action;
  }
}

export async function getSkillHistory(skillId: string): Promise<SkillHistoryDto> {
  const currentSkill = await prisma.exam_skills.findUnique({
    where: { id: skillId },
    select: {
      id: true,
      exam_id: true,
      skill: true,
      form: true,
      version_number: true,
    },
  });

  if (!currentSkill) {
    throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
  }

  // Lấy mọi phiên bản của ô này (kể cả ARCHIVED), sắp theo versionNumber giảm dần
  const slotSkills = await prisma.exam_skills.findMany({
    where: {
      exam_id: currentSkill.exam_id,
      skill: currentSkill.skill,
      form: currentSkill.form,
    },
    orderBy: {
      version_number: 'desc',
    },
  });

  const skillIds = slotSkills.map((s) => s.id);

  // Lấy audit_logs liên quan đến các kỹ năng của ô này, tối đa 100 dòng mới nhất
  const auditLogs = await prisma.audit_logs.findMany({
    where: {
      entity_type: 'EXAM_SKILL',
      OR: [
        { entity_id: { in: skillIds } },
        { action: 'EXAM_SKILL_DELETE' },
      ],
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 100,
  });

  // Lọc chỉ giữ logs thuộc ô kỹ năng này
  const relevantLogs = auditLogs.filter((log) => {
    if (log.entity_id && skillIds.includes(log.entity_id)) return true;
    if (log.action === 'EXAM_SKILL_DELETE') {
      const cd = log.change_data as any;
      if (
        cd?.examId === currentSkill.exam_id &&
        cd?.skill === currentSkill.skill &&
        (cd?.form ?? null) === (currentSkill.form ?? null)
      ) {
        return true;
      }
    }
    return false;
  });

  // Thu thập user IDs để tra cứu tên
  const userIds = new Set<string>();
  for (const s of slotSkills) {
    if (s.created_by) userIds.add(s.created_by);
  }
  for (const log of relevantLogs) {
    if (log.actor_id) userIds.add(log.actor_id);
  }

  const users = await prisma.users.findMany({
    where: {
      id: { in: Array.from(userIds) },
    },
    select: {
      id: true,
      full_name: true,
      display_name: true,
    },
  });

  const userNameMap = new Map<string, string>();
  for (const u of users) {
    userNameMap.set(u.id, u.display_name || u.full_name);
  }

  // Tra cứu basedOnVersion từ audit log EXAM_SKILL_DRAFT_CREATE
  const basedOnMap = new Map<string, number>();
  for (const log of relevantLogs) {
    if (log.action === 'EXAM_SKILL_DRAFT_CREATE' && log.entity_id) {
      const cd = log.change_data as any;
      if (typeof cd?.fromVersion === 'number') {
        basedOnMap.set(log.entity_id, cd.fromVersion);
      }
    }
  }

  const versions: SkillHistoryVersion[] = slotSkills.map((s) => ({
    id: s.id,
    versionNumber: s.version_number,
    status: s.status as 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED',
    createdAt: s.created_at.toISOString(),
    createdBy: s.created_by
      ? {
          id: s.created_by,
          name: userNameMap.get(s.created_by) || 'Quản trị viên',
        }
      : null,
    publishedAt: s.published_at ? s.published_at.toISOString() : null,
    updatedAt: s.updated_at.toISOString(),
    basedOnVersion: basedOnMap.get(s.id) ?? (s.version_number > 1 ? s.version_number - 1 : null),
    isCurrent: s.id === skillId,
  }));

  const skillVersionMap = new Map<string, number>();
  for (const s of slotSkills) {
    skillVersionMap.set(s.id, s.version_number);
  }

  const events: SkillHistoryEvent[] = relevantLogs.map((log) => {
    const cd = log.change_data as any;
    const versionNum =
      (log.entity_id ? skillVersionMap.get(log.entity_id) : null) ??
      (typeof cd?.version === 'number' ? cd.version : null);

    return {
      at: log.created_at.toISOString(),
      action: log.action,
      version: versionNum,
      actor: log.actor_id
        ? { name: userNameMap.get(log.actor_id) || 'Quản trị viên' }
        : null,
      summary: formatEventSummary(log.action, cd, versionNum),
    };
  });

  return {
    slot: {
      examId: currentSkill.exam_id,
      skill: currentSkill.skill,
      form: currentSkill.form,
    },
    versions,
    events,
  };
}
