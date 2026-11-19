import type { LrQuestionType } from '../../../lib/exams/lr-editor/types.ts';

export {
  LR_TYPE_GROUPS,
  type LrTypeGroupId,
  type LrTypeGroupDef,
} from '../../../lib/exams/lr-editor/constants.ts';

export type LrSkillConfig = {
  sectionName: string;
  sectionCount: number;
  defaultDuration: number;
  allowedTypes: LrQuestionType[];
  hasAudio: boolean;
  hasTranscript: boolean;
  colorTone: {
    primary: string;
    bg: string;
    border: string;
    badgeText: string;
  };
};

export const ALL_LR_TYPES: LrQuestionType[] = [
  'SENTENCE_COMP',
  'SHORT_ANSWER',
  'SUMMARY_COMP',
  'NOTE_COMP',
  'SUMMARY_BOX',
  'TABLE_COMP',
  'DIAGRAM_COMP',
  'MATCH_HEADING',
  'MATCH_INFO',
  'MATCH_ENDING',
  'MATCH_FEATURE',
  'MCQ_SINGLE',
  'MCQ_MULTI',
  'YNNG',
  'TFNG',
];

/** Listening chỉ dùng các dạng cho phép: bỏ Headings, Matching Information, Sentence Endings, TFNG, YNNG. */
export const LISTENING_TYPES: LrQuestionType[] = [
  'NOTE_COMP',
  'SUMMARY_COMP',
  'SUMMARY_BOX',
  'SENTENCE_COMP',
  'SHORT_ANSWER',
  'TABLE_COMP',
  'DIAGRAM_COMP',
  'MATCH_FEATURE',
  'MCQ_SINGLE',
  'MCQ_MULTI',
];

export const LR_CONFIG: Record<'READING' | 'LISTENING', LrSkillConfig> = {
  READING: {
    sectionName: 'Passage',
    sectionCount: 3,
    defaultDuration: 60,
    allowedTypes: ALL_LR_TYPES,
    hasAudio: false,
    hasTranscript: false,
    colorTone: {
      primary: '#1F6A78',
      bg: '#DFF1F4',
      border: '#A8DCE2',
      badgeText: '#104B56',
    },
  },
  LISTENING: {
    sectionName: 'Section',
    sectionCount: 4,
    defaultDuration: 40,
    allowedTypes: LISTENING_TYPES,
    hasAudio: true,
    hasTranscript: true,
    colorTone: {
      primary: '#5E35B1',
      bg: '#EDE7F6',
      border: '#D1C4E9',
      badgeText: '#4527A0',
    },
  },
};
