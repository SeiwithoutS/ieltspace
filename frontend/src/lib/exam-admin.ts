import { apiFetch, ApiError } from './api';

export type Category = {
  id: string;
  code: string | null;
  name: string;
  orderNo: number;
};

export type SlotKey =
  | 'LISTENING'
  | 'READING_ACADEMIC'
  | 'READING_GENERAL'
  | 'WRITING_ACADEMIC'
  | 'WRITING_GENERAL'
  | 'SPEAKING';

export type Slot = {
  liveId: string | null;
  liveStatus: 'PUBLISHED' | 'HIDDEN' | null;
  liveVersion: number | null;
  draftId: string | null;
  draftVersion: number | null;
} | null;

export type ExamAdmin = {
  id: string;
  title: string;
  orderNo: number;
  updatedAt: string;
  everPublished: boolean;
  attemptCount: number;
  slots: Record<SlotKey, Slot>;
};

export type ExamSetAdmin = {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  category: Category;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  canDelete: boolean;
  tests: ExamAdmin[];
};

export type ExamSetPublic = {
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

// Dạng dữ liệu mà các trang Quản lý và ExamDetail dùng để vẽ giao diện.
export type Cell = 'pub' | 'hidden' | 'draft' | null;
export type FormCells = { A: Cell; G: Cell };

export type UiTest = {
  id: string;
  name: string;
  updated: string;
  everPublished: boolean;
  L: Cell;
  R: FormCells;
  W: FormCells;
  S: Cell;
  _slots: Record<SlotKey, Slot>;
};

export type UiSet = {
  id: string;
  name: string;
  desc: string;
  cat: string;
  catName: string;
  status: 'draft' | 'pub' | 'hidden';
  updated: string;
  plays: string;
  canDelete: boolean;
  img: string | null;
  art: number | null;
  short: string;
  tests: UiTest[];
};

export type UiLearnerTest = {
  id: string;
  name: string;
  orderNo: number;
  L: Cell;
  R: FormCells;
  W: FormCells;
  S: Cell;
};

export type UiLearnerSet = {
  id: string;
  name: string;
  short: string;
  desc: string;
  plays: string;
  updated: string;
  art: number | null;
  img: string | null;
  status: 'pub';
  tests: UiLearnerTest[];
};

// Lấy thông điệp và mã lỗi từ giá trị bắt được trong catch.
export function errorInfo(err: unknown): { message: string; code: string; status: number } {
  if (err instanceof ApiError) return { message: err.message, code: err.code, status: err.status };
  if (err instanceof Error) return { message: err.message, code: '', status: 0 };
  return { message: '', code: '', status: 0 };
}

// API Functions
export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch<{ items: Category[] }>('/admin/exam-set-categories');
  return res.items || [];
}

export async function listSets(): Promise<ExamSetAdmin[]> {
  const res = await apiFetch<{ items: ExamSetAdmin[] }>('/admin/exam-sets');
  return res.items || [];
}

export async function getSet(id: string): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>(`/admin/exam-sets/${id}`);
}

export async function createSet(body: {
  name: string;
  description?: string | null;
  categoryId?: string;
  newCategoryName?: string;
  coverUrl?: string | null;
}): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>('/admin/exam-sets', {
    method: 'POST',
    json: body,
  });
}

export async function patchSet(
  id: string,
  body: {
    name?: string;
    description?: string | null;
    categoryId?: string;
    newCategoryName?: string;
    coverUrl?: string | null;
  }
): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>(`/admin/exam-sets/${id}`, {
    method: 'PATCH',
    json: body,
  });
}

export async function uploadCover(id: string, file: File): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>(`/admin/exam-sets/${id}/cover`, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
}

export async function publishSet(id: string): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>(`/admin/exam-sets/${id}/publish`, {
    method: 'POST',
  });
}

export async function hideSet(id: string): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>(`/admin/exam-sets/${id}/hide`, {
    method: 'POST',
  });
}

export async function deleteSet(id: string): Promise<void> {
  return apiFetch<void>(`/admin/exam-sets/${id}`, {
    method: 'DELETE',
  });
}

export async function addTest(id: string, title?: string): Promise<ExamSetAdmin> {
  return apiFetch<ExamSetAdmin>(`/admin/exam-sets/${id}/exams`, {
    method: 'POST',
    json: { title },
  });
}
export const createTest = addTest;

export async function deleteTest(
  examIdOrSetId: string,
  maybeExamId?: string
): Promise<ExamSetAdmin> {
  const examId = maybeExamId || examIdOrSetId;
  return apiFetch<ExamSetAdmin>(`/admin/exams/${examId}`, {
    method: 'DELETE',
  });
}

export async function createSkill(
  examIdOrSetId: string,
  skillOrExamId: string,
  formOrObj?: string | null | { skill: string; form?: string | null }
): Promise<ExamSetAdmin> {
  let examId = examIdOrSetId;
  let skill = skillOrExamId;
  let form: string | null | undefined = undefined;

  if (typeof formOrObj === 'object' && formOrObj !== null) {
    examId = skillOrExamId;
    skill = formOrObj.skill;
    form = formOrObj.form;
  } else if (typeof formOrObj === 'string' || formOrObj === null) {
    form = formOrObj;
  }

  return apiFetch<ExamSetAdmin>(`/admin/exams/${examId}/skills`, {
    method: 'POST',
    json: { skill, form },
  });
}

export async function hideSkill(
  skillIdOrSetId: string,
  maybeSkillId?: string
): Promise<ExamSetAdmin> {
  const skillId = maybeSkillId || skillIdOrSetId;
  return apiFetch<ExamSetAdmin>(`/admin/exam-skills/${skillId}/hide`, {
    method: 'POST',
  });
}

export async function showSkill(
  skillIdOrSetId: string,
  maybeSkillId?: string
): Promise<ExamSetAdmin> {
  const skillId = maybeSkillId || skillIdOrSetId;
  return apiFetch<ExamSetAdmin>(`/admin/exam-skills/${skillId}/show`, {
    method: 'POST',
  });
}

export async function getPublicSet(id: string): Promise<ExamSetPublic> {
  return apiFetch<ExamSetPublic>(`/exam-sets/${id}`);
}

// Converters
const viDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return viDateFormatter.format(d);
  } catch {
    return '';
  }
}

export function slotUi(slot: Slot): 'pub' | 'hidden' | 'draft' | null {
  if (!slot) return null;
  if (slot.liveStatus === 'PUBLISHED') return 'pub';
  if (slot.liveStatus === 'HIDDEN') return 'hidden';
  if (slot.draftId) return 'draft';
  return null;
}

export function toUiTest(t: ExamAdmin): UiTest {
  return {
    id: t.id,
    name: t.title,
    updated: fmtDate(t.updatedAt),
    everPublished: t.everPublished,
    L: slotUi(t.slots?.LISTENING),
    R: {
      A: slotUi(t.slots?.READING_ACADEMIC),
      G: slotUi(t.slots?.READING_GENERAL),
    },
    W: {
      A: slotUi(t.slots?.WRITING_ACADEMIC),
      G: slotUi(t.slots?.WRITING_GENERAL),
    },
    S: slotUi(t.slots?.SPEAKING),
    _slots: t.slots,
  };
}

export function toUiSet(s: ExamSetAdmin): UiSet {
  let art: number | null = null;
  let img: string | null = null;

  if (s.coverUrl) {
    if (s.coverUrl.startsWith('preset:')) {
      const parsed = parseInt(s.coverUrl.slice(7), 10);
      art = isNaN(parsed) ? null : parsed;
    } else {
      img = s.coverUrl;
    }
  }

  const short = (s.name.match(/(Vol|Test|Pack)\s*\S+$/i) || [s.name.split(' ').slice(-1)[0]])[0];
  const tests = (s.tests || []).map(toUiTest);

  return {
    id: s.id,
    name: s.name,
    desc: s.description || '',
    cat: s.category?.id || '',
    catName: s.category?.name || '',
    status: (s.status?.toLowerCase() || 'draft') as 'draft' | 'pub' | 'hidden',
    updated: fmtDate(s.updatedAt),
    plays: (s.attemptCount || 0).toLocaleString('vi-VN'),
    canDelete: s.canDelete ?? true,
    img,
    art,
    short,
    tests,
  };
}

export function toLearnerSet(p: ExamSetPublic): UiLearnerSet {
  let art: number | null = null;
  let img: string | null = null;

  if (p.coverUrl) {
    if (p.coverUrl.startsWith('preset:')) {
      const parsed = parseInt(p.coverUrl.slice(7), 10);
      art = isNaN(parsed) ? null : parsed;
    } else {
      img = p.coverUrl;
    }
  }

  const short = (p.name.match(/(Vol|Test|Pack)\s*\S+$/i) || [p.name.split(' ').slice(-1)[0]])[0];

  const tests = (p.tests || []).map((t): UiLearnerTest => ({
    id: t.id,
    name: t.title,
    orderNo: t.orderNo,
    L: t.slots?.LISTENING ? 'pub' : null,
    R: {
      A: t.slots?.READING_ACADEMIC ? 'pub' : null,
      G: t.slots?.READING_GENERAL ? 'pub' : null,
    },
    W: {
      A: t.slots?.WRITING_ACADEMIC ? 'pub' : null,
      G: t.slots?.WRITING_GENERAL ? 'pub' : null,
    },
    S: t.slots?.SPEAKING ? 'pub' : null,
  }));

  return {
    id: p.id,
    name: p.name,
    short,
    desc: p.description || '',
    plays: (p.attemptCount || 0).toLocaleString('vi-VN'),
    updated: fmtDate(p.updatedAt),
    art,
    img,
    status: 'pub' as const,
    tests,
  };
}
