// Types for the sample answer API v1.
export type SampleStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export type SampleBand = 7 | 7.5 | 8 | 8.5 | 9;

export type SampleType =
  | "WRITING_TASK_1_ACADEMIC"
  | "WRITING_TASK_1_GENERAL"
  | "WRITING_TASK_2"
  | "SPEAKING_PART_1"
  | "SPEAKING_PART_2"
  | "SPEAKING_PART_3";

export type WritingForm = "ACADEMIC" | "GENERAL_TRAINING";

export type AcademicTask1Type =
  | "bar"
  | "line"
  | "table"
  | "map"
  | "process"
  | "pie"
  | "mixed";

export type GeneralTask1Type =
  | "request"
  | "advice"
  | "apply"
  | "complaint"
  | "apology"
  | "thank";

export type Task2Type =
  | "agree"
  | "both"
  | "advdis"
  | "two"
  | "psol";

/**
 * Metadata do backend xác nhận.
 * Không lưu signed URL, data URL, blob URL hoặc bytes/base64 vào DTO này.
 */
export interface SampleMediaRef {
  bucket: string;
  path: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

interface SampleDocumentBase {
  schemaVersion: 1;
  title: string;
  topic: string;
  source: string;
  band: SampleBand;
  cover: SampleMediaRef | null;
  outlineIntro: string;
  outline: string;
}

interface WritingContent {
  prompt: string;
  promptImage: SampleMediaRef | null;
  essay: string;
  translation: string;
}

type WritingTask1Academic = SampleDocumentBase &
  WritingContent & {
    skill: "WRITING";
    sampleType: "WRITING_TASK_1_ACADEMIC";
    form: "ACADEMIC";
    task: 1;
    writingType: AcademicTask1Type | "";
  };

type WritingTask1General = SampleDocumentBase &
  WritingContent & {
    skill: "WRITING";
    sampleType: "WRITING_TASK_1_GENERAL";
    form: "GENERAL_TRAINING";
    task: 1;
    writingType: GeneralTask1Type | "";
  };

type WritingTask2 = SampleDocumentBase &
  WritingContent & {
    skill: "WRITING";
    sampleType: "WRITING_TASK_2";
    form: WritingForm;
    task: 2;
    writingType: Task2Type | "";
  };

export interface SpeakingItem {
  id: string;
  question: string;
  answer: string;
  audio: SampleMediaRef | null;
}

type SpeakingDocument = SampleDocumentBase & {
  skill: "SPEAKING";
  items: SpeakingItem[];
} & (
    | { sampleType: "SPEAKING_PART_1"; part: 1 }
    | { sampleType: "SPEAKING_PART_2"; part: 2 }
    | { sampleType: "SPEAKING_PART_3"; part: 3 }
  );

export type SampleDocumentV1 =
  | WritingTask1Academic
  | WritingTask1General
  | WritingTask2
  | SpeakingDocument;

export interface CreateSampleRequest {
  document: SampleDocumentV1;
}

export interface SaveSampleDraftRequest {
  revision: number;
  document: SampleDocumentV1;
}

export interface SamplePublicationRequest {
  revision: number;
  action: "PUBLISH" | "HIDE" | "RESTORE";
}

export interface AdminSampleDetail {
  id: string;
  status: SampleStatus;
  revision: number;
  publishedRevision: number | null;
  publishedAt: string | null;
  draftUpdatedAt: string;
  hasUnpublishedChanges: boolean;
  document: SampleDocumentV1;
}

export type WritingSampleDocument = Extract<
  SampleDocumentV1,
  { skill: "WRITING" }
>;

export type SpeakingSampleDocument = Extract<
  SampleDocumentV1,
  { skill: "SPEAKING" }
>;

export type SampleSkill = SampleDocumentV1["skill"];

export interface SamplePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SampleCard {
  id: string;
  title: string;
  skill: SampleSkill;
  sampleType: SampleType;
  topic: string;
  band: SampleBand;
  cover: SampleMediaRef | null;
  publishedAt: string | null;
}

export interface AdminSampleCard extends SampleCard {
  status: SampleStatus;
  revision: number;
  draftUpdatedAt: string;
  hasUnpublishedChanges: boolean;
}

export interface AdminSampleListResponse {
  samples: AdminSampleCard[];
  pagination: SamplePagination;
}

export interface AdminSampleResponse {
  sample: AdminSampleDetail;
}

export interface AdminSampleQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  skill?: SampleSkill;
  sampleType?: SampleType;
  topic?: string;
  status?: SampleStatus;
}

export interface SampleEditorPageProps {
  sampleId?: string;
  sampleType?: string;
}
