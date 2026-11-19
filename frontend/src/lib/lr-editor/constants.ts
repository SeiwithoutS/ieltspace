import type { LrQuestionType } from './types';

export type LrTypeTuple = [
  type: LrQuestionType,
  label: string,
  form: string,
  tpl: string,
  lim: number,
];

export const TYPES: LrTypeTuple[] = [
  [
    'SENTENCE_COMP',
    'Sentence Completion',
    'gap',
    'Complete the sentences below. Choose {L} from the passage for each answer.',
    2,
  ],
  [
    'SHORT_ANSWER',
    'Short Answer',
    'gap',
    'Answer the questions below. Choose {L} from the passage for each answer.',
    4,
  ],
  [
    'SUMMARY_COMP',
    'Summary Completion (without wordlist)',
    'text',
    'Complete the summary below. Choose {L} from the passage for each answer.',
    0,
  ],
  [
    'NOTE_COMP',
    'Note Completion',
    'text',
    'Complete the notes below. Choose {L} from the passage for each answer.',
    0,
  ],
  [
    'SUMMARY_BOX',
    'Summary Completion (with wordlist)',
    'bank',
    'Complete the summary using the list of words, {R}, below.',
    -1,
  ],
  [
    'TABLE_COMP',
    'Table Completion',
    'table',
    'Complete the table below. Choose {L} from the passage for each answer.',
    2,
  ],
  [
    'FLOW_COMP',
    'Flow-chart Completion',
    'flow',
    'Complete the flow-chart below. Choose {L} from the passage for each answer.',
    0,
  ],
  [
    'DIAGRAM_COMP',
    'Diagram Labelling',
    'diagram',
    'Label the diagram below. Choose {L} from the passage for each answer.',
    2,
  ],
  [
    'MATCH_HEADING',
    'Matching Headings',
    'match',
    'Reading Passage {P} has {K} paragraphs, {R}. Choose the correct heading for each paragraph from the list of headings below.',
    -1,
  ],
  [
    'MATCH_INFO',
    'Matching Information',
    'match',
    'Reading Passage {P} has {K} paragraphs, {R}. Which paragraph contains the following information?{NB}',
    -1,
  ],
  [
    'MATCH_ENDING',
    'Matching Sentence Endings',
    'match',
    'Complete each sentence with the correct ending, {R}, below.',
    -1,
  ],
  [
    'MATCH_FEATURE',
    'Matching Features',
    'match',
    'Match each statement with the correct person, {R}.{NB}',
    -1,
  ],
  [
    'MCQ_SINGLE',
    'MCQ - Single Answer',
    'mcq1',
    'Choose the correct letter, A, B, C or D.',
    -1,
  ],
  [
    'MCQ_MULTI',
    'MCQ - Multiple Answers',
    'mcqN',
    'Choose {W} letters, {R}.',
    -1,
  ],
  [
    'YNNG',
    'Yes/No/Not Given',
    'judge',
    'Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.',
    -1,
  ],
  [
    'TFNG',
    'True/False/Not Given',
    'judge',
    'Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.',
    -1,
  ],
];

export const LR_QUESTION_TYPE_NAMES: Record<LrQuestionType, string> = {
  SENTENCE_COMP: 'Sentence Completion',
  SHORT_ANSWER: 'Short Answer',
  SUMMARY_COMP: 'Summary Completion',
  NOTE_COMP: 'Note Completion',
  SUMMARY_BOX: 'Summary Completion (Box)',
  TABLE_COMP: 'Table Completion',
  FLOW_COMP: 'Flow-chart Completion',
  DIAGRAM_COMP: 'Diagram Labelling',
  MATCH_HEADING: 'Matching Headings',
  MATCH_INFO: 'Matching Information',
  MATCH_ENDING: 'Matching Sentence Endings',
  MATCH_FEATURE: 'Matching Features',
  MCQ_SINGLE: 'MCQ - Single Answer',
  MCQ_MULTI: 'MCQ - Multiple Answers',
  YNNG: 'Yes/No/Not Given',
  TFNG: 'True/False/Not Given',
};

export const TYPE_MAP: Record<
  LrQuestionType,
  { label: string; form: string; tpl: string; lim: number }
> = TYPES.reduce((acc, t) => {
  acc[t[0]] = { label: t[1], form: t[2], tpl: t[3], lim: t[4] };
  return acc;
}, {} as Record<LrQuestionType, { label: string; form: string; tpl: string; lim: number }>);

export const FORMLABEL: Record<string, string> = {
  gap: '1. Câu có chỗ trống',
  text: '2. Đoạn văn có chỗ trống',
  bank: '3. Đoạn văn và khung từ',
  table: '4. Bảng',
  flow: '4. Sơ đồ',
  diagram: '5. Hình có nhãn',
  match: '6. Ghép với danh sách',
  mcq1: '7. Trắc nghiệm',
  mcqN: '7. Trắc nghiệm',
  judge: '7. Trắc nghiệm',
};

export const LIM: string[] = [
  'ONE WORD ONLY',
  'ONE WORD AND/OR A NUMBER',
  'NO MORE THAN TWO WORDS',
  'NO MORE THAN TWO WORDS AND/OR A NUMBER',
  'NO MORE THAN THREE WORDS',
  'NO MORE THAN THREE WORDS AND/OR A NUMBER',
  'A NUMBER',
];

export const LIMMAX: number[] = [1, 1, 2, 2, 3, 3, 0];

export const LIMNUM: boolean[] = [false, true, false, true, false, true, true];

export const NUMW: string[] = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
];

export const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ROM: string[] = [
  'i',
  'ii',
  'iii',
  'iv',
  'v',
  'vi',
  'vii',
  'viii',
  'ix',
  'x',
  'xi',
  'xii',
  'xiii',
  'xiv',
  'xv',
];

/** Tên hiển thị riêng của Listening (khớp canvas). */
const LISTENING_TYPE_NAMES: Partial<Record<LrQuestionType, string>> = {
  NOTE_COMP: 'Form/Note Completion',
  DIAGRAM_COMP: 'Plan/Map/Diagram Labelling',
  MATCH_FEATURE: 'Matching',
};

export function typeName(type: LrQuestionType, isReading: boolean): string {
  return (!isReading && LISTENING_TYPE_NAMES[type]) || LR_QUESTION_TYPE_NAMES[type];
}

export type LrTypeGroupId =
  | 'blank-sentence'
  | 'blank-passage'
  | 'table-diagram'
  | 'matching'
  | 'choice';

export interface LrTypeGroupDef {
  id: LrTypeGroupId;
  label: string;
  types: LrQuestionType[];
}

export const LR_TYPE_GROUPS: LrTypeGroupDef[] = [
  { id: 'blank-sentence', label: 'Câu có chỗ trống', types: ['SENTENCE_COMP', 'SHORT_ANSWER'] },
  { id: 'blank-passage', label: 'Đoạn văn có chỗ trống', types: ['SUMMARY_COMP', 'NOTE_COMP'] },
  { id: 'table-diagram', label: 'Bảng và sơ đồ', types: ['TABLE_COMP', 'FLOW_COMP', 'DIAGRAM_COMP'] },
  { id: 'matching', label: 'Ghép với danh sách', types: ['MATCH_HEADING', 'MATCH_INFO', 'MATCH_FEATURE'] },
  { id: 'choice', label: 'Trắc nghiệm', types: ['MCQ_SINGLE', 'MCQ_MULTI', 'TFNG', 'YNNG'] },
];

export const COMBO_TYPE_LABELS: Record<LrQuestionType, string> = {
  SENTENCE_COMP: 'Sentence Completion',
  SHORT_ANSWER: 'Short Answer',
  SUMMARY_COMP: 'Summary Completion',
  NOTE_COMP: 'Note Completion',
  SUMMARY_BOX: 'Summary Completion',
  TABLE_COMP: 'Table Completion',
  FLOW_COMP: 'Flow-chart Completion',
  DIAGRAM_COMP: 'Diagram / Map Labelling',
  MATCH_HEADING: 'Matching Headings',
  MATCH_INFO: 'Matching Information',
  MATCH_ENDING: 'Matching Features / Sentence Endings',
  MATCH_FEATURE: 'Matching Features / Sentence Endings',
  MCQ_SINGLE: 'Multiple Choice (1 đáp án)',
  MCQ_MULTI: 'Multiple Choice (nhiều đáp án)',
  TFNG: 'True / False / Not Given',
  YNNG: 'Yes / No / Not Given',
};

export function groupOfType(type: LrQuestionType): LrTypeGroupId {
  if (type === 'SUMMARY_BOX') return 'blank-passage';
  if (type === 'MATCH_ENDING') return 'matching';
  for (const g of LR_TYPE_GROUPS) {
    if (g.types.includes(type)) return g.id;
  }
  return 'choice';
}

export function comboOptions(
  type: LrQuestionType,
  allowedTypes?: LrQuestionType[]
): Array<{ type: LrQuestionType; label: string }> {
  const grpId = groupOfType(type);
  const grp = LR_TYPE_GROUPS.find((g) => g.id === grpId);
  if (!grp) return [{ type, label: COMBO_TYPE_LABELS[type] || type }];

  const typesInGroup = grp.types;
  const filtered = typesInGroup.filter((t) => !allowedTypes || allowedTypes.includes(t));

  return filtered.map((t) => ({
    type: t,
    label: COMBO_TYPE_LABELS[t] || t,
  }));
}

