export type LrQuestionType =
  | 'SENTENCE_COMP'
  | 'SHORT_ANSWER'
  | 'SUMMARY_COMP'
  | 'NOTE_COMP'
  | 'SUMMARY_BOX'
  | 'TABLE_COMP'
  | 'FLOW_COMP'
  | 'DIAGRAM_COMP'
  | 'MATCH_HEADING'
  | 'MATCH_INFO'
  | 'MATCH_ENDING'
  | 'MATCH_FEATURE'
  | 'MCQ_SINGLE'
  | 'MCQ_MULTI'
  | 'YNNG'
  | 'TFNG';

export type LrAsset = {
  path: string;
  url: string | null;
  name: string;
};

export type LrQuestion = {
  numberFrom: number;
  numberTo: number;
  content: Record<string, unknown>;
  options: { label: string; text: string }[];
  accepted: string[];
  matching: { kind: 'TEXT' | 'CHOICE' | 'MULTI'; limit?: number | null };
  evidence: { para: number | null; label: string | null; keys: string[] }[];
  notes: string[];
};

export type LrGroup = {
  id: string | null;
  type: LrQuestionType;
  instruction: string;
  title: string | null;
  questionFrom: number | null;
  questionTo: number | null;
  image: LrAsset | null;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  questions: LrQuestion[];
};

export type LrSection = {
  orderNo: number;
  title: string;
  paragraphs: { label: string; text: string; startSec: number | null }[];
  images: (LrAsset & { caption: string })[];
  audio: (LrAsset & { sizeBytes: number; durationSec: number }) | null;
  groups: LrGroup[];
};

export type LrContent = {
  sections: LrSection[];
};

export type LrSectionPatch = {
  orderNo: number;
  title: string;
  paragraphs: { label: string; text: string; startSec: number | null }[];
  images: (LrAsset & { caption: string })[];
  audio?: (LrAsset & { sizeBytes: number; durationSec: number }) | null;
};

export type LrGroupMove = {
  id: string;
  sectionOrderNo: number;
  orderNo: number;
  questionFrom?: number | null;
  questionTo?: number | null;
};

export type LrGroupUpsert = LrGroup & {
  sectionOrderNo: number;
  orderNo: number;
};

export type LrPatch = {
  sections?: LrSectionPatch[];
  moveGroups?: LrGroupMove[];
  upsertGroups?: LrGroupUpsert[];
  deleteGroupIds?: string[];
};

export type LrFlowNode = {
  id: string;
  row: number;
  text: string;
  side?: boolean;
};

export type LrFlowFrame = {
  row: number;
  caption: string;
};

export type LrDiagramMark = [number, number] | [number, number, number, number] | { x: number; y: number };

export type LrGroupExplanation = {
  text?: string;
  note?: string;
  para?: number | null;
  keys?: string[];
};

export type LrGroupItem = {
  q?: string;
  text?: string;
  opts?: string[];
  ans?: string | number | null;
  alt?: string | null;
  exp?: string;
  para?: number | null;
  keys?: string[];
};

export type LrGroupState = {
  id?: string | null;
  type: LrQuestionType;
  orderNo?: number;
  instr: string | null;
  instruction?: string | null;
  title?: string | null;
  limit?: number | null;
  body?: string;
  mode?: 'table' | 'image' | 'letters';
  img?: LrAsset | string | null;
  marks?: LrDiagramMark[];
  texts?: string[];
  rows?: string[][];
  hd?: boolean[][];
  sp?: Array<Array<[number, number] | 0>>;
  nodes?: LrFlowNode[];
  edges?: Array<[string, string]>;
  frames?: LrFlowFrame[];
  steps?: string[];
  opts?: string[];
  pick?: number;
  oneUse?: boolean;
  q?: string;
  items?: LrGroupItem[];
  ans?: Array<string | number>;
  alt?: Array<string | null>;
  exp?: LrGroupExplanation[];
  hans?: number[];
  sel?: number[];
};

export type LrPassageImage = {
  name: string;
  after: number;
  cap?: string;
  caption?: string;
  path?: string | null;
  url?: string | null;
};

export type LrPassageAudio = {
  name: string;
  size?: string;
  dur?: string;
  sizeBytes?: number;
  durationSec?: number;
  path?: string | null;
  url?: string | null;
};

export type LrPassageState = {
  id?: string;
  orderNo: number;
  title: string;
  paras: string[];
  audio: (LrAsset & { sizeBytes: number; durationSec: number }) | LrPassageAudio | null;
  imgs: LrPassageImage[];
  groups: LrGroupState[];
};

export type LrEditorState = {
  title: string;
  skill: 'READING' | 'LISTENING';
  form: 'ACADEMIC' | 'GENERAL' | null;
  passages: LrPassageState[];
  open?: number;
  edit?: boolean;
};
