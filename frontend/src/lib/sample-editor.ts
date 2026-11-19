import { ApiError } from "./api";
import type {
  AcademicTask1Type,
  GeneralTask1Type,
  SampleBand,
  SampleDocumentV1,
  SampleSkill,
  SampleStatus,
  SampleType,
  SpeakingItem,
  SpeakingSampleDocument,
  Task2Type,
  WritingForm,
  WritingSampleDocument,
} from "./sample-types";

export const SAMPLE_BANDS: readonly SampleBand[] = [
  7, 7.5, 8, 8.5, 9,
];

export const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  WRITING_TASK_1_ACADEMIC: "Task 1 · Academic",
  WRITING_TASK_1_GENERAL: "Task 1 · General Training",
  WRITING_TASK_2: "Task 2",
  SPEAKING_PART_1: "Speaking · Part 1",
  SPEAKING_PART_2: "Speaking · Part 2",
  SPEAKING_PART_3: "Speaking · Part 3",
};

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã công bố",
  HIDDEN: "Đã ẩn",
};

export const ACADEMIC_TYPES: ReadonlyArray<{
  value: AcademicTask1Type;
  label: string;
}> = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Graph" },
  { value: "table", label: "Table" },
  { value: "map", label: "Map" },
  { value: "process", label: "Process" },
  { value: "pie", label: "Pie Chart" },
  { value: "mixed", label: "Mixed" },
];

export const GENERAL_TYPES: ReadonlyArray<{
  value: GeneralTask1Type;
  label: string;
}> = [
  { value: "request", label: "Request Letter" },
  { value: "advice", label: "Advice Seeking Letter" },
  { value: "apply", label: "Application Letter" },
  { value: "complaint", label: "Complaint Letter" },
  { value: "apology", label: "Apology Letter" },
  { value: "thank", label: "Thank-you Letter" },
];

export const TASK_2_TYPES: ReadonlyArray<{
  value: Task2Type;
  label: string;
}> = [
  { value: "agree", label: "Agree / Disagree" },
  { value: "both", label: "Discuss Both Views" },
  { value: "advdis", label: "Advantages / Disadvantages" },
  { value: "two", label: "Two-Part Questions" },
  { value: "psol", label: "Problem / Causes / Solutions" },
];

export function newSpeakingItem(): SpeakingItem {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
    audio: null,
  };
}

export function changeWritingType(
  document: WritingSampleDocument,
  form: WritingForm,
  task: 1 | 2,
  writingType = "",
): WritingSampleDocument {
  if (task === 2) {
    return {
      ...document,
      sampleType: "WRITING_TASK_2",
      form,
      task: 2,
      writingType:
        TASK_2_TYPES.find((item) => item.value === writingType)?.value ?? "",
    };
  }

  if (form === "GENERAL_TRAINING") {
    return {
      ...document,
      sampleType: "WRITING_TASK_1_GENERAL",
      form: "GENERAL_TRAINING",
      task: 1,
      writingType:
        GENERAL_TYPES.find((item) => item.value === writingType)?.value ?? "",
    };
  }

  return {
    ...document,
    sampleType: "WRITING_TASK_1_ACADEMIC",
    form: "ACADEMIC",
    task: 1,
    writingType:
      ACADEMIC_TYPES.find((item) => item.value === writingType)?.value ?? "",
  };
}

export function changeSpeakingPart(
  document: SpeakingSampleDocument,
  part: 1 | 2 | 3,
): SpeakingSampleDocument {
  const items =
    document.items.length > 0 ? document.items : [newSpeakingItem()];

  switch (part) {
    case 1:
      return {
        ...document,
        sampleType: "SPEAKING_PART_1",
        part: 1,
        items,
      };

    case 2:
      return {
        ...document,
        sampleType: "SPEAKING_PART_2",
        part: 2,
        items: [items[0]],
      };

    case 3:
      return {
        ...document,
        sampleType: "SPEAKING_PART_3",
        part: 3,
        items,
      };
  }
}

export function newSampleDocument(
  skill: SampleSkill,
  sampleType?: string,
): SampleDocumentV1 {
  const base = {
    schemaVersion: 1 as const,
    title: "",
    topic: "",
    source: "",
    band: 8 as const,
    cover: null,
    outlineIntro: "",
    outline: "",
  };

  if (skill === "SPEAKING") {
    const document: SpeakingSampleDocument = {
      ...base,
      skill: "SPEAKING",
      sampleType: "SPEAKING_PART_1",
      part: 1,
      items: [newSpeakingItem()],
    };

    return changeSpeakingPart(
      document,
      sampleType === "SPEAKING_PART_2"
        ? 2
        : sampleType === "SPEAKING_PART_3"
          ? 3
          : 1,
    );
  }

  const document: WritingSampleDocument = {
    ...base,
    skill: "WRITING",
    sampleType: "WRITING_TASK_2",
    form: "ACADEMIC",
    task: 2,
    writingType: "",
    prompt: "",
    promptImage: null,
    essay: "",
    translation: "",
  };

  if (sampleType === "WRITING_TASK_1_ACADEMIC") {
    return changeWritingType(document, "ACADEMIC", 1);
  }

  if (sampleType === "WRITING_TASK_1_GENERAL") {
    return changeWritingType(document, "GENERAL_TRAINING", 1);
  }

  return document;
}

export function writingTypeOptions(document: WritingSampleDocument) {
  if (document.task === 2) return TASK_2_TYPES;

  return document.form === "ACADEMIC"
    ? ACADEMIC_TYPES
    : GENERAL_TYPES;
}

export function wordCount(text: string): number {
  const value = text
    .replace(/[*#]/g, " ")
    .replace(/^\s*[-•]\s+/gm, "")
    .trim();

  return value ? value.split(/\s+/).length : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sampleErrorMessages(error: unknown): string[] {
  if (!(error instanceof ApiError)) {
    return ["Có lỗi xảy ra. Nội dung đang nhập vẫn được giữ lại."];
  }

  const messages: string[] = [];

  if (error.code === "SAMPLE_REVISION_CONFLICT") {
    const revision =
      isRecord(error.details) &&
      typeof error.details.currentRevision === "number"
        ? ` Revision trên máy chủ: ${error.details.currentRevision}.`
        : "";

    messages.push(
      `Bài đã được cập nhật ở nơi khác.${revision} ` +
        "Nội dung của bạn vẫn được giữ. Hãy tải bản đang soạn xuống trước " +
        "khi tải lại bản máy chủ; hệ thống không tự ghi đè.",
    );
  } else {
    messages.push(error.message);
  }

  if (
    isRecord(error.details) &&
    Array.isArray(error.details.issues)
  ) {
    for (const issue of error.details.issues) {
      if (!isRecord(issue) || typeof issue.message !== "string") continue;

      const path = Array.isArray(issue.path)
        ? issue.path
            .filter(
              (part): part is string | number =>
                typeof part === "string" || typeof part === "number",
            )
            .join(".")
        : "";

      messages.push(path ? `${path}: ${issue.message}` : issue.message);
    }
  }

  return messages;
}

export function sampleEditorHref(
  skill: SampleSkill,
  id?: string,
  sampleType?: SampleType,
): string {
  const page =
    skill === "WRITING" ? "AdminSampleWriting" : "AdminSampleSpeaking";

  const params = new URLSearchParams();

  if (id) params.set("id", id);
  if (sampleType) params.set("sampleType", sampleType);

  return `#${page}${params.size ? `?${params.toString()}` : ""}`;
}
