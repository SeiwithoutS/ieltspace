export type SlotKey =
  | 'LISTENING'
  | 'READING_ACADEMIC'
  | 'READING_GENERAL'
  | 'WRITING_ACADEMIC'
  | 'WRITING_GENERAL'
  | 'SPEAKING';

export const ALL_SLOT_KEYS: SlotKey[] = [
  'LISTENING',
  'READING_ACADEMIC',
  'READING_GENERAL',
  'WRITING_ACADEMIC',
  'WRITING_GENERAL',
  'SPEAKING',
];

export type Slot = {
  liveId: string | null;
  liveStatus: 'PUBLISHED' | 'HIDDEN' | null;
  liveVersion: number | null;
  draftId: string | null;
  draftVersion: number | null;
} | null;

export function slotKey(skill: string, form?: string | null): SlotKey {
  if (skill === 'LISTENING') return 'LISTENING';
  if (skill === 'SPEAKING') return 'SPEAKING';
  if (skill === 'READING') {
    if (form === 'GENERAL') return 'READING_GENERAL';
    return 'READING_ACADEMIC';
  }
  if (skill === 'WRITING') {
    if (form === 'GENERAL') return 'WRITING_GENERAL';
    return 'WRITING_ACADEMIC';
  }
  throw new Error(`Kỹ năng không hợp lệ: ${skill} (${form || 'none'})`);
}

export type SkillRow = {
  id: string;
  skill: string;
  form?: string | null;
  status: string;
  version_number: number;
};

export function buildSlots(skills: SkillRow[]): Record<SlotKey, Slot> {
  const result: Record<SlotKey, Slot> = {
    LISTENING: null,
    READING_ACADEMIC: null,
    READING_GENERAL: null,
    WRITING_ACADEMIC: null,
    WRITING_GENERAL: null,
    SPEAKING: null,
  };

  const grouped = new Map<SlotKey, SkillRow[]>();
  for (const k of ALL_SLOT_KEYS) {
    grouped.set(k, []);
  }

  for (const s of skills) {
    try {
      const key = slotKey(s.skill, s.form);
      grouped.get(key)!.push(s);
    } catch {
      // Bỏ qua dòng không thuộc 6 ô chuẩn
    }
  }

  for (const key of ALL_SLOT_KEYS) {
    const list = grouped.get(key)!;
    const live = list.find((s) => s.status === 'PUBLISHED' || s.status === 'HIDDEN');
    const draft = list.find((s) => s.status === 'DRAFT');

    if (!live && !draft) {
      result[key] = null;
    } else {
      result[key] = {
        liveId: live ? live.id : null,
        liveStatus: live ? (live.status as 'PUBLISHED' | 'HIDDEN') : null,
        liveVersion: live ? live.version_number : null,
        draftId: draft ? draft.id : null,
        draftVersion: draft ? draft.version_number : null,
      };
    }
  }

  return result;
}

export function slotUi(slot: Slot): 'pub' | 'hidden' | 'draft' | null {
  if (!slot) return null;
  if (slot.liveStatus === 'PUBLISHED') return 'pub';
  if (slot.liveStatus === 'HIDDEN') return 'hidden';
  if (slot.draftId) return 'draft';
  return null;
}

export function canDeleteSet(input: {
  publishedAt?: Date | string | null;
  testCount: number;
  attemptCount: number;
}): boolean {
  if (input.attemptCount > 0) return false;
  if (input.publishedAt === null || input.testCount === 0) return true;
  return false;
}

export function canDeleteExam(input: {
  everPublished: boolean;
  attemptCount: number;
}): boolean {
  return !input.everPublished && input.attemptCount === 0;
}

export function canPublishSet(tests: Array<{ slots: Record<SlotKey, Slot> }>): {
  ok: boolean;
  code?: 'EXAM_SET_EMPTY' | 'EXAM_SET_NO_PUBLISHED_SKILL';
  message?: string;
} {
  if (tests.length === 0) {
    return {
      ok: false,
      code: 'EXAM_SET_EMPTY',
      message: 'Bộ đề chưa có đề nào. Thêm ít nhất một đề rồi mới đăng được.',
    };
  }

  const hasPublishedSkill = tests.some((t) =>
    Object.values(t.slots).some((s) => s?.liveStatus === 'PUBLISHED')
  );

  if (!hasPublishedSkill) {
    return {
      ok: false,
      code: 'EXAM_SET_NO_PUBLISHED_SKILL',
      message:
        'Bộ đề chưa có kỹ năng nào ở trạng thái Đã đăng. Soạn xong và đăng ít nhất một kỹ năng của một đề trong editor.',
    };
  }

  return { ok: true };
}

export function defaultDuration(skill: string): number {
  switch (skill) {
    case 'LISTENING':
      return 30;
    case 'READING':
      return 60;
    case 'WRITING':
      return 60;
    case 'SPEAKING':
      return 14;
    default:
      return 60;
  }
}

export type SkillValidationTarget = {
  id?: string;
  skill: string;
  form?: string | null;
  sections: Array<{
    id?: string;
    title: string | null;
    section_type: string;
    audio_path?: string | null;
    groups?: Array<{
      id?: string;
      questions?: Array<{
        id?: string;
        answer?: {
          accepted_answers?: unknown;
        } | null;
      }>;
    }>;
  }>;
};

export function validateSkillReady(skill: SkillValidationTarget): {
  ready: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (!skill.sections || skill.sections.length === 0) {
    reasons.push('Kỹ năng phải có ít nhất một phần (Passage/Section/Task/Part).');
    return { ready: false, reasons };
  }

  let emptyTitleCount = 0;
  let missingAudioCount = 0;
  let missingGroupCount = 0;
  let missingAnswerCount = 0;

  for (let i = 0; i < skill.sections.length; i++) {
    const sec = skill.sections[i];
    if (!sec.title || sec.title.trim().length === 0) {
      emptyTitleCount++;
    }

    if (skill.skill === 'LISTENING') {
      if (!sec.audio_path || sec.audio_path.trim().length === 0) {
        missingAudioCount++;
      }
    }

    if (skill.skill === 'LISTENING' || skill.skill === 'READING') {
      const groups = sec.groups || [];
      if (groups.length === 0) {
        missingGroupCount++;
      } else {
        for (const g of groups) {
          const questions = g.questions || [];
          for (const q of questions) {
            if (!q.answer || !q.answer.accepted_answers) {
              missingAnswerCount++;
            }
          }
        }
      }
    }
  }

  if (emptyTitleCount > 0) {
    reasons.push(`Có ${emptyTitleCount} phần chưa có tiêu đề.`);
  }
  if (missingAudioCount > 0) {
    reasons.push(`Có ${missingAudioCount} phần Listening thiếu tệp âm thanh (audio).`);
  }
  if (missingGroupCount > 0) {
    reasons.push(`Có ${missingGroupCount} phần chưa có nhóm câu hỏi.`);
  }
  if (missingAnswerCount > 0) {
    reasons.push(`Có ${missingAnswerCount} câu hỏi chưa có đáp án.`);
  }

  return {
    ready: reasons.length === 0,
    reasons,
  };
}
