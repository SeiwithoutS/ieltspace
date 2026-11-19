import type { SampleDocumentV1 } from "./sample-types";

export type PublicSampleType = SampleDocumentV1["sampleType"];
export type PublicSampleSkill = SampleDocumentV1["skill"];

export const sampleTypeLabels: Record<PublicSampleType, string> = {
  WRITING_TASK_1_ACADEMIC: "Writing Task 1 Academic",
  WRITING_TASK_1_GENERAL: "Writing Task 1 General",
  WRITING_TASK_2: "Writing Task 2",
  SPEAKING_PART_1: "Speaking Part 1",
  SPEAKING_PART_2: "Speaking Part 2",
  SPEAKING_PART_3: "Speaking Part 3",
};

export const publicSampleTypes = Object.keys(
  sampleTypeLabels,
) as PublicSampleType[];

export interface PublicSampleCard {
  id: string;
  title: string;
  skill: PublicSampleSkill;
  sampleType: PublicSampleType;
  topic: string;
  band: SampleDocumentV1["band"];
  cover: SampleDocumentV1["cover"];
  publishedAt: string | null;
}

export interface PublicSampleQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  skill?: PublicSampleSkill;
  sampleType?: PublicSampleType;
  topic?: string;
}

export interface PublicSampleListResponse {
  samples: PublicSampleCard[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PublicSampleDetail {
  id: string;
  publishedRevision: number;
  publishedAt: string;
  document: SampleDocumentV1;
}

export interface PublicSampleResponse {
  sample: PublicSampleDetail;
}

export interface PublicSamplePageProps {
  sampleId?: string;
  sampleQuery?: string;
}

export function encodeSampleQuery(query: PublicSampleQuery): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export function readSampleQuery(raw = ""): PublicSampleQuery {
  const params = new URLSearchParams(raw);
  const rawPage = params.get("page") || "1";
  const parsedPage = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, 100_000)
      : 1;

  const rawType = params.get("sampleType");
  const sampleType = publicSampleTypes.find((type) => type === rawType);

  const rawSkill = params.get("skill");
  const selectedSkill =
    rawSkill === "WRITING" || rawSkill === "SPEAKING"
      ? rawSkill
      : undefined;

  // Loại bài cụ thể quyết định kỹ năng tương ứng.
  const skill = sampleType
    ? sampleType.startsWith("WRITING_")
      ? "WRITING"
      : "SPEAKING"
    : selectedSkill;

  return {
    page,
    pageSize: 12,
    q: params.get("q")?.trim().slice(0, 200) || undefined,
    topic: params.get("topic")?.trim().slice(0, 200) || undefined,
    skill,
    sampleType,
  };
}

export function sampleLibraryHref(
  query: PublicSampleQuery = {},
): string {
  const encoded = encodeSampleQuery(query);
  return `#SampleLibrary${encoded ? `?${encoded}` : ""}`;
}

export function sampleDetailHref(
  sample: Pick<PublicSampleCard, "id" | "skill">,
  query: PublicSampleQuery,
): string {
  const params = new URLSearchParams(encodeSampleQuery(query));
  params.set("id", sample.id);

  const page =
    sample.skill === "WRITING" ? "SampleWriting" : "SampleSpeaking";

  return `#${page}?${params.toString()}`;
}

export function countSampleWords(text: string): number {
  const plain = text
    .replace(/[*#]/g, " ")
    .replace(/^\s*[-•]\s+/gm, " ")
    .trim();

  return plain ? plain.split(/\s+/).length : 0;
}
