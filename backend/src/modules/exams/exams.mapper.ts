import type { exam_set_categories, exam_sets, exams, exam_skills } from '@prisma/client';
import {
  type SlotKey,
  type Slot,
  buildSlots,
  canDeleteSet,
  canDeleteExam,
} from './exam-rules.js';

export type CategoryDto = {
  id: string;
  code: string | null;
  name: string;
  orderNo: number;
};

export type ExamAdminDto = {
  id: string;
  title: string;
  orderNo: number;
  updatedAt: string;
  everPublished: boolean;
  attemptCount: number;
  slots: Record<SlotKey, Slot>;
};

export type ExamSetAdminDto = {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  category: CategoryDto;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  canDelete: boolean;
  tests: ExamAdminDto[];
};

export type ExamSetPublicDto = {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  category: { id: string; name: string };
  publishedAt: string;
  updatedAt: string;
  attemptCount: number;
  tests: Array<{
    id: string;
    title: string;
    orderNo: number;
    slots: Partial<Record<SlotKey, { examSkillId: string; durationMinutes: number }>>;
  }>;
  related: Array<{
    id: string;
    name: string;
    coverUrl: string | null;
    testCount: number;
    attemptCount: number;
  }>;
};

export type ExamWithSkills = exams & {
  skills: exam_skills[];
  _count?: {
    attempts?: number;
  };
};

export type ExamSetWithRelations = exam_sets & {
  category: exam_set_categories;
  exams: ExamWithSkills[];
};

export function toCategoryDto(cat: exam_set_categories): CategoryDto {
  return {
    id: cat.id,
    code: cat.code,
    name: cat.name,
    orderNo: cat.order_no,
  };
}

export function toExamAdminDto(
  exam: ExamWithSkills,
  attemptCountMap?: Map<string, number>
): ExamAdminDto {
  const slots = buildSlots(exam.skills);

  // QB-08: Đã từng đăng nghĩa là có ít nhất một dòng exam_skills của Test có published_at IS NOT NULL
  const everPublished = exam.skills.some((s) => s.published_at !== null);

  const attemptCount = attemptCountMap?.get(exam.id) ?? exam._count?.attempts ?? 0;

  // Max(updated_at) của Test và các exam_skills
  let maxUpdated = new Date(exam.updated_at).getTime();
  for (const s of exam.skills) {
    const sTime = new Date(s.updated_at).getTime();
    if (sTime > maxUpdated) {
      maxUpdated = sTime;
    }
  }

  return {
    id: exam.id,
    title: exam.title,
    orderNo: exam.order_no,
    updatedAt: new Date(maxUpdated).toISOString(),
    everPublished,
    attemptCount,
    slots,
  };
}

export function toExamSetAdminDto(
  set: ExamSetWithRelations,
  attemptCountMap?: Map<string, number>
): ExamSetAdminDto {
  const tests = (set.exams || [])
    .slice()
    .sort((a, b) => a.order_no - b.order_no)
    .map((e) => toExamAdminDto(e, attemptCountMap));

  // attemptCount: COMPLETED attempts thuộc mọi Test của bộ
  let totalAttempts = 0;
  for (const t of tests) {
    totalAttempts += t.attemptCount;
  }

  // Max(updated_at) của bộ, các Test, các exam_skills
  let maxUpdated = new Date(set.updated_at).getTime();
  for (const t of tests) {
    const tTime = new Date(t.updatedAt).getTime();
    if (tTime > maxUpdated) {
      maxUpdated = tTime;
    }
  }

  const canDelete = canDeleteSet({
    publishedAt: set.published_at,
    testCount: tests.length,
    attemptCount: totalAttempts,
  });

  return {
    id: set.id,
    name: set.name,
    description: set.description,
    coverUrl: set.cover_url,
    category: toCategoryDto(set.category),
    status: set.status as 'DRAFT' | 'PUBLISHED' | 'HIDDEN',
    publishedAt: set.published_at ? set.published_at.toISOString() : null,
    createdAt: set.created_at.toISOString(),
    updatedAt: new Date(maxUpdated).toISOString(),
    attemptCount: totalAttempts,
    canDelete,
    tests,
  };
}

export function toExamSetPublicDto(
  set: ExamSetWithRelations,
  relatedSets: Array<{
    id: string;
    name: string;
    cover_url: string | null;
    exams: Array<{ id: string; _count?: { attempts?: number } }>;
  }>,
  attemptCountMap?: Map<string, number>
): ExamSetPublicDto {
  const adminDto = toExamSetAdminDto(set, attemptCountMap);

  // Chỉ lấy các Test có ít nhất một ô PUBLISHED
  const publicTests: ExamSetPublicDto['tests'] = [];

  for (const exam of set.exams.sort((a, b) => a.order_no - b.order_no)) {
    const publishedSlots: Partial<Record<SlotKey, { examSkillId: string; durationMinutes: number }>> = {};

    for (const skill of exam.skills) {
      if (skill.status === 'PUBLISHED') {
        let key: SlotKey | null = null;
        if (skill.skill === 'LISTENING') key = 'LISTENING';
        else if (skill.skill === 'SPEAKING') key = 'SPEAKING';
        else if (skill.skill === 'READING') {
          key = skill.form === 'GENERAL' ? 'READING_GENERAL' : 'READING_ACADEMIC';
        } else if (skill.skill === 'WRITING') {
          key = skill.form === 'GENERAL' ? 'WRITING_GENERAL' : 'WRITING_ACADEMIC';
        }

        if (key) {
          publishedSlots[key] = {
            examSkillId: skill.id,
            durationMinutes: skill.duration_minutes,
          };
        }
      }
    }

    if (Object.keys(publishedSlots).length > 0) {
      publicTests.push({
        id: exam.id,
        title: exam.title,
        orderNo: exam.order_no,
        slots: publishedSlots,
      });
    }
  }

  const related = relatedSets.map((r) => {
    let relAttempts = 0;
    for (const e of r.exams) {
      relAttempts += attemptCountMap?.get(e.id) ?? e._count?.attempts ?? 0;
    }
    return {
      id: r.id,
      name: r.name,
      coverUrl: r.cover_url,
      testCount: r.exams.length,
      attemptCount: relAttempts,
    };
  });

  return {
    id: set.id,
    name: set.name,
    description: set.description,
    coverUrl: set.cover_url,
    category: {
      id: set.category.id,
      name: set.category.name,
    },
    publishedAt: set.published_at ? set.published_at.toISOString() : new Date().toISOString(),
    updatedAt: adminDto.updatedAt,
    attemptCount: adminDto.attemptCount,
    tests: publicTests,
    related,
  };
}
