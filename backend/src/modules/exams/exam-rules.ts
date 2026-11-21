import { HttpError } from '../../utils/http.js';
import {
  sectionsToWriting,
  sectionsToSpeaking,
  sectionsToLr,
  type WritingContent,
  type SpeakingContent,
  type LrContent,
  type LrSection,
  type LrGroup,
  type RawSection,
  LR_QUESTION_TYPE_NAMES,
} from './exam-content.mapper.js';

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
      return 40;
    case 'READING':
      return 60;
    case 'WRITING':
      return 60;
    case 'SPEAKING':
      return 15;
    default:
      return 60;
  }
}

export function canDeleteSkill(input: {
  status: string;
  attemptCount: number;
}): boolean {
  return input.status === 'DRAFT' && input.attemptCount === 0;
}

export function speakingDuration(c: {
  p13Minutes?: number | null;
  part2?: { prepMinutes?: number | null; speakMinutes?: number | null } | null;
}): number | null {
  const p13 = c.p13Minutes;
  const prep = c.part2?.prepMinutes;
  const speak = c.part2?.speakMinutes;
  if (
    typeof p13 === 'number' &&
    Number.isInteger(p13) &&
    p13 > 0 &&
    typeof prep === 'number' &&
    Number.isInteger(prep) &&
    prep > 0 &&
    typeof speak === 'number' &&
    Number.isInteger(speak) &&
    speak > 0
  ) {
    return p13 + prep + speak;
  }
  return null;
}

// Kiểm tra một Task Writing (idx 0 = Task 1, 1 = Task 2).
function writingTaskIssues(content: WritingContent, form: string | null | undefined, idx: 0 | 1): string[] {
  const issues: string[] = [];
  const t = content.tasks[idx];
  if (!t?.prompt || t.prompt.trim().length === 0) {
    issues.push(`Task ${idx + 1} chưa có yêu cầu (đề bài).`);
  }
  if (idx === 0 && form === 'ACADEMIC' && (!t?.imagePath || t.imagePath.trim().length === 0)) {
    issues.push('Task 1 chưa có ảnh đề.');
  }
  return issues;
}

export function validateWritingReady(
  content: WritingContent | null,
  form?: string | null
): string[] {
  const tasks = content?.tasks || [];
  if (!content || tasks.length < 2) {
    return ['Kỹ năng Writing phải có đủ 2 Task.'];
  }
  return [...writingTaskIssues(content, form, 0), ...writingTaskIssues(content, form, 1)];
}

function speakingQuestionIssues(label: 'Part 1' | 'Part 3', qs: string[]): string[] {
  if (qs.length === 0 || !qs.some((q) => q && q.trim().length > 0)) {
    return [`${label} chưa có câu hỏi nào.`];
  }
  if (qs.some((q) => !q || q.trim().length === 0)) {
    return [`${label} có câu hỏi để trống, hãy nhập hoặc xóa.`];
  }
  return [];
}

function speakingP13Issues(content: SpeakingContent): string[] {
  const p13 = content.p13Minutes;
  if (typeof p13 !== 'number' || !Number.isInteger(p13) || p13 < 1 || p13 > 60) {
    return ['Thời gian tổng Part 1 và Part 3 cần là số phút từ 1 đến 60.'];
  }
  return [];
}

function speakingCueIssues(content: SpeakingContent): string[] {
  const issues: string[] = [];
  const cueCard = content.part2?.cueCard;
  if (!cueCard || cueCard.trim().length === 0) {
    issues.push('Part 2 chưa có nội dung thẻ đề.');
  }
  const prep = content.part2?.prepMinutes;
  const speak = content.part2?.speakMinutes;
  if (
    typeof prep !== 'number' ||
    !Number.isInteger(prep) ||
    prep < 1 ||
    typeof speak !== 'number' ||
    !Number.isInteger(speak) ||
    speak < 1
  ) {
    issues.push('Part 2 cần số phút chờ chuẩn bị và số phút nói (số nguyên từ 1).');
  }
  return issues;
}

export function validateSpeakingReady(
  content: SpeakingContent | null
): string[] {
  if (!content) {
    return ['Kỹ năng Speaking chưa có nội dung.'];
  }
  return [
    ...speakingQuestionIssues('Part 1', content.part1?.questions || []),
    ...speakingP13Issues(content),
    ...speakingCueIssues(content),
    ...speakingQuestionIssues('Part 3', content.part3?.questions || []),
  ];
}

// Kiểm tra riêng một Passage/Section/Task/Part (idx tính từ 0). Không kiểm tổng 40 câu hay đánh số cả kỹ năng.
export type SectionReadyTarget =
  | { skill: 'READING' | 'LISTENING'; section: LrSection; index: number }
  | { skill: 'WRITING'; content: WritingContent; index: 0 | 1; form?: string | null }
  | { skill: 'SPEAKING'; content: SpeakingContent; index: 0 | 1 | 2 };

export function validateSectionReady(target: SectionReadyTarget): string[] {
  if (target.skill === 'WRITING') {
    return writingTaskIssues(target.content, target.form, target.index);
  }
  if (target.skill === 'SPEAKING') {
    const c = target.content;
    if (target.index === 0) return [...speakingQuestionIssues('Part 1', c.part1?.questions || []), ...speakingP13Issues(c)];
    if (target.index === 1) return speakingCueIssues(c);
    return [...speakingQuestionIssues('Part 3', c.part3?.questions || []), ...speakingP13Issues(c)];
  }
  return lrSectionIssues(target.section, target.skill, target.index);
}

export function checkLrNumbering(content: LrContent, skill?: 'READING' | 'LISTENING'): void {
  const sections = (content.sections || []).slice().sort((a, b) => a.orderNo - b.orderNo);
  const secName = skill === 'READING' || sections.length === 3 ? 'Passage' : 'Section';

  let currentExpectedNumber = 1;

  for (const sec of sections) {
    const groups = (sec.groups || []).slice().sort((a, b) => (a.questionFrom ?? 0) - (b.questionFrom ?? 0));
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const g = groups[gIdx];
      const qs = g.questions || [];
      if (qs.length === 0) {
        if (g.questionFrom !== null || g.questionTo !== null) {
          throw new HttpError(
            400,
            'VALIDATION_ERROR',
            `Dải số câu không hợp lệ ở ${secName} ${sec.orderNo}, nhóm ${gIdx + 1}.`
          );
        }
        continue;
      }

      const firstQ = qs[0];
      const lastQ = qs[qs.length - 1];
      if (g.questionFrom !== firstQ.numberFrom || g.questionTo !== lastQ.numberTo) {
        throw new HttpError(
          400,
          'VALIDATION_ERROR',
          `Dải số câu không hợp lệ ở ${secName} ${sec.orderNo}, nhóm ${gIdx + 1}.`
        );
      }

      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        if (q.numberFrom !== currentExpectedNumber) {
          throw new HttpError(
            400,
            'VALIDATION_ERROR',
            `Số câu không liên tục ở ${secName} ${sec.orderNo}, nhóm ${gIdx + 1}.`
          );
        }

        const pick = g.type === 'MCQ_MULTI' ? Number(g.config?.pick) || 1 : 1;
        if (q.numberTo - q.numberFrom + 1 !== pick) {
          throw new HttpError(
            400,
            'VALIDATION_ERROR',
            `Số câu không liên tục ở ${secName} ${sec.orderNo}, nhóm ${gIdx + 1}.`
          );
        }

        currentExpectedNumber = q.numberTo + 1;
      }
    }
  }
}

function checkLrGroupReady(
  g: LrGroup,
  p: LrSection,
  secPrefix: string,
  secIdx: number,
  groupIdx: number
): string[] {
  const issues: string[] = [];
  const typeLabel = LR_QUESTION_TYPE_NAMES[g.type] || g.type;
  const c = g.questions.reduce((sum, q) => sum + (q.numberTo - q.numberFrom + 1), 0);
  const st = g.questionFrom;
  const en = g.questionTo;

  let rangeText = `nhóm ${groupIdx + 1}`;
  if (c > 0 && st !== null) {
    const endNum = en !== null ? en : st + c - 1;
    rangeText = c > 1 ? `Câu ${st}-${endNum}` : `Câu ${st}`;
  }

  const prefix = `${secPrefix} ${secIdx + 1} · ${rangeText} · ${typeLabel}: `;

  if (g.type === 'DIAGRAM_COMP') {
    if (!g.image || !g.image.path || g.image.path.trim().length === 0) {
      issues.push(`${prefix}chưa tải hình sơ đồ.`);
    }
  }

  if (!g.questions || g.questions.length === 0) {
    issues.push(`${prefix}chưa có câu hỏi.`);
    return issues;
  }

  // Cả hai: mỗi câu có accepted không rỗng
  const hasMissingAccepted = g.questions.some(
    (q) => !q.accepted || q.accepted.length === 0 || q.accepted.every((a) => !a || a.trim().length === 0)
  );
  if (hasMissingAccepted) {
    issues.push(`${prefix}còn câu chưa có đáp án.`);
  }

  // Check choices / options
  if (g.type === 'MCQ_SINGLE') {
    for (const q of g.questions) {
      if (q.accepted.length > 0) {
        // Editor lưu đáp án bằng nội dung lựa chọn; dữ liệu khác có thể lưu nhãn (A, B, C...).
        const ans = q.accepted[0]?.trim();
        const matches = q.options.some((o) => o.label === ans || o.text?.trim() === ans);
        if (ans && !matches) {
          issues.push(`${prefix}đáp án không nằm trong danh sách lựa chọn.`);
          break;
        }
      }
    }
  } else if (g.type === 'MCQ_MULTI') {
    for (const q of g.questions) {
      const pick = Number(g.config?.pick) || q.numberTo - q.numberFrom + 1;
      const validAccepted = q.accepted.filter((a) => a && a.trim().length > 0);
      if (validAccepted.length !== pick) {
        issues.push(`${prefix}cần đánh dấu đúng ${pick} đáp án.`);
      }
      if (q.options.length <= pick) {
        issues.push(`${prefix}số lựa chọn phải nhiều hơn số đáp án đúng.`);
      }
    }
  } else if (
    g.type === 'MATCH_HEADING' ||
    g.type === 'MATCH_INFO' ||
    g.type === 'MATCH_ENDING' ||
    g.type === 'MATCH_FEATURE' ||
    g.type === 'SUMMARY_BOX'
  ) {
    const rawOpts = (g.content as any)?.options;
    if (Array.isArray(rawOpts) && rawOpts.length > 0) {
      // Lựa chọn có thể là { label, text } hoặc chuỗi; đáp án có thể là nhãn hoặc nội dung.
      const optionValues = new Set<string>();
      for (const o of rawOpts) {
        if (typeof o === 'string') optionValues.add(o.trim());
        else if (o && typeof o === 'object') {
          if (o.label != null) optionValues.add(String(o.label));
          if (o.text != null) optionValues.add(String(o.text).trim());
        }
      }
      let invalidFound = false;
      for (const q of g.questions) {
        for (const ans of q.accepted) {
          if (ans && !optionValues.has(ans.trim())) {
            invalidFound = true;
            break;
          }
        }
        if (invalidFound) break;
      }
      if (invalidFound) {
        issues.push(`${prefix}đáp án không nằm trong danh sách lựa chọn.`);
      }
    }
  }

  return issues;
}

// Kiểm tra một Passage (Reading) hoặc Section (Listening): nội dung, audio, nhóm câu hỏi và đáp án từng nhóm.
function lrSectionIssues(p: LrSection, skill: 'READING' | 'LISTENING', a: number): string[] {
  const issues: string[] = [];
  const hasText = (p.paragraphs || []).some((x) => Boolean(x.text && x.text.trim().length > 0));
  const prefix = skill === 'READING' ? 'Passage' : 'Section';
  if (skill === 'READING') {
    if (!hasText) issues.push(`Passage ${a + 1} chưa có bài đọc.`);
  } else {
    if (!hasText) issues.push(`Section ${a + 1} chưa có transcript.`);
    if (!p.audio || !p.audio.path || p.audio.path.trim().length === 0) {
      issues.push(`Section ${a + 1} chưa có ghi âm.`);
    }
  }
  if (!p.groups || p.groups.length === 0) {
    issues.push(`${prefix} ${a + 1} chưa có nhóm câu hỏi.`);
  } else {
    for (let k = 0; k < p.groups.length; k++) {
      issues.push(...checkLrGroupReady(p.groups[k], p, prefix, a, k));
    }
  }
  return issues;
}

export function validateReadingReady(
  content: LrContent | null,
  form?: string | null
): string[] {
  const issues: string[] = [];
  if (!content) {
    issues.push('Kỹ năng Reading chưa có nội dung.');
    return issues;
  }

  const sections = content.sections || [];
  let total = 0;
  for (const s of sections) {
    for (const g of s.groups || []) {
      for (const q of g.questions || []) {
        total += Math.max(1, q.numberTo - q.numberFrom + 1);
      }
    }
  }

  if (total !== 40) {
    issues.push(`Đề đang có ${total} câu, cần đúng 40 câu.`);
  }

  for (let z = sections.length; z < 3; z++) {
    issues.push(`Passage ${z + 1} chưa được tạo.`);
  }

  for (let a = 0; a < Math.min(3, sections.length); a++) {
    issues.push(...lrSectionIssues(sections[a], 'READING', a));
  }

  return issues;
}

export function validateListeningReady(
  content: LrContent | null
): string[] {
  const issues: string[] = [];
  if (!content) {
    issues.push('Kỹ năng Listening chưa có nội dung.');
    return issues;
  }

  const sections = content.sections || [];
  let total = 0;
  for (const s of sections) {
    for (const g of s.groups || []) {
      for (const q of g.questions || []) {
        total += Math.max(1, q.numberTo - q.numberFrom + 1);
      }
    }
  }

  if (total !== 40) {
    issues.push(`Đề đang có ${total} câu, cần đúng 40 câu.`);
  }

  for (let z = sections.length; z < 4; z++) {
    issues.push(`Section ${z + 1} chưa được tạo.`);
  }

  for (let a = 0; a < Math.min(4, sections.length); a++) {
    issues.push(...lrSectionIssues(sections[a], 'LISTENING', a));
  }

  return issues;
}

export type SkillValidationTarget = {
  id?: string;
  skill: string;
  form?: string | null;
  sections: RawSection[];
  writingContent?: WritingContent | null;
  speakingContent?: SpeakingContent | null;
  readingContent?: LrContent | null;
  listeningContent?: LrContent | null;
};

export function validateSkillReady(skill: SkillValidationTarget): {
  ready: boolean;
  reasons: string[];
} {
  if (skill.skill === 'WRITING') {
    const content = skill.writingContent || sectionsToWriting(skill.sections);
    const reasons = validateWritingReady(content, skill.form);
    return {
      ready: reasons.length === 0,
      reasons,
    };
  }

  if (skill.skill === 'SPEAKING') {
    const content = skill.speakingContent || sectionsToSpeaking(skill.sections);
    const reasons = validateSpeakingReady(content);
    return {
      ready: reasons.length === 0,
      reasons,
    };
  }

  if (skill.skill === 'READING') {
    const content = skill.readingContent || sectionsToLr(skill.sections, 'READING');
    const reasons = validateReadingReady(content, skill.form);
    return {
      ready: reasons.length === 0,
      reasons,
    };
  }

  if (skill.skill === 'LISTENING') {
    const content = skill.listeningContent || sectionsToLr(skill.sections, 'LISTENING');
    const reasons = validateListeningReady(content);
    return {
      ready: reasons.length === 0,
      reasons,
    };
  }

  return {
    ready: false,
    reasons: [`Kỹ năng không được hỗ trợ: ${skill.skill}`],
  };
}

