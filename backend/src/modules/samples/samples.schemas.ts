import { z } from "zod";
import { HttpError } from "../../utils/http.js";

const uuidSchema = z.string().uuid();
const revisionSchema = z.number().int().min(1).max(2_147_483_646);
export type SamplePublicationAction = "PUBLISH" | "HIDE" | "RESTORE";

const sampleTypeSchema = z.enum([
  "WRITING_TASK_1_ACADEMIC",
  "WRITING_TASK_1_GENERAL",
  "WRITING_TASK_2",
  "SPEAKING_PART_1",
  "SPEAKING_PART_2",
  "SPEAKING_PART_3",
]);

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]);

export type SampleStatus = z.infer<typeof statusSchema>;

const bandSchema = z.union([
  z.literal(7),
  z.literal(7.5),
  z.literal(8),
  z.literal(8.5),
  z.literal(9),
]);

const shortText = z.string().max(500);
const richText = z.string().max(100_000);

const invalidPostgresText = /[\u0000\uD800-\uDFFF]/u;
const uuidPathSegment = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
export const sampleAssetPath = z.string().max(1024).regex(
  new RegExp(`^samples/${uuidPathSegment}/(?:cover|prompt-image|audio)/${uuidPathSegment}\\.(?:jpg|png|webp|mp3|wav|m4a)$`),
);
const mediaRefSchema = z.object({
  bucket: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,99}$/),
  path: sampleAssetPath,
  originalName: z.string().min(1).max(255).refine(value => !invalidPostgresText.test(value)),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "audio/mp4"]),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
}).strict();

const nullableMediaSchema = mediaRefSchema.nullable();

const baseShape = {
  schemaVersion: z.literal(1),
  title: z.string().trim().min(1).max(200),
  topic: z.string().trim().max(200),
  source: shortText,
  band: bandSchema,
  cover: nullableMediaSchema,
  outlineIntro: z.string().max(10_000),
  outline: richText,
};

const writingShape = {
  ...baseShape,
  skill: z.literal("WRITING"),
  prompt: z.string().max(30_000),
  promptImage: nullableMediaSchema,
  essay: richText,
  translation: richText,
};

const speakingItemSchema = z.object({
  id: uuidSchema,
  question: z.string().max(10_000),
  answer: z.string().max(30_000),
  audio: nullableMediaSchema,
}).strict();

const speakingShape = {
  ...baseShape,
  skill: z.literal("SPEAKING"),
  items: z.array(speakingItemSchema).min(1).max(100),
};

const documentUnionSchema = z.discriminatedUnion("sampleType", [
  z.object({
    ...writingShape,
    sampleType: z.literal("WRITING_TASK_1_ACADEMIC"),
    form: z.literal("ACADEMIC"),
    task: z.literal(1),
    writingType: z.enum([
      "",
      "bar",
      "line",
      "table",
      "map",
      "process",
      "pie",
      "mixed",
    ]),
  }).strict(),

  z.object({
    ...writingShape,
    sampleType: z.literal("WRITING_TASK_1_GENERAL"),
    form: z.literal("GENERAL_TRAINING"),
    task: z.literal(1),
    writingType: z.enum([
      "",
      "request",
      "advice",
      "apply",
      "complaint",
      "apology",
      "thank",
    ]),
  }).strict(),

  z.object({
    ...writingShape,
    sampleType: z.literal("WRITING_TASK_2"),
    form: z.enum(["ACADEMIC", "GENERAL_TRAINING"]),
    task: z.literal(2),
    writingType: z.enum([
      "",
      "agree",
      "both",
      "advdis",
      "two",
      "psol",
    ]),
  }).strict(),

  z.object({
    ...speakingShape,
    sampleType: z.literal("SPEAKING_PART_1"),
    part: z.literal(1),
  }).strict(),

  z.object({
    ...speakingShape,
    sampleType: z.literal("SPEAKING_PART_2"),
    part: z.literal(2),
    items: z.array(speakingItemSchema).length(1),
  }).strict(),

  z.object({
    ...speakingShape,
    sampleType: z.literal("SPEAKING_PART_3"),
    part: z.literal(3),
  }).strict(),
]);

export const sampleDocumentSchema = documentUnionSchema.superRefine(
  (document, context) => {
    const { title, topic, source, outlineIntro, outline } = document;
    const validateText = (fields: Record<string, string>, path: (string | number)[] = []) => {
      for (const [key, value] of Object.entries(fields)) {
        if (invalidPostgresText.test(value)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...path, key],
            message: "Văn bản có ký tự không hợp lệ.",
          });
        }
      }
    };
    validateText({ title, topic, source, outlineIntro, outline });

    if (document.skill === "WRITING") {
      const { prompt, essay, translation } = document;
      validateText({ prompt, essay, translation });

      return;
    }

    const ids = new Set<string>();

    document.items.forEach((item, index) => {
      validateText({ question: item.question, answer: item.answer }, ["items", index]);
      // PostgreSQL UUID không phân biệt chữ hoa/chữ thường.
      const normalizedId = item.id.toLowerCase();

      if (ids.has(normalizedId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index, "id"],
          message: "ID câu hỏi bị trùng.",
        });
      }

      ids.add(normalizedId);

    });
  },
);

export type SampleDocument = z.infer<typeof sampleDocumentSchema>;

export const createSampleSchema = z.object({
  document: sampleDocumentSchema,
}).strict();

export const saveSampleDraftSchema = z.object({
  revision: revisionSchema,
  document: sampleDocumentSchema,
}).strict();

export const samplePublicationSchema = z.object({
  revision: revisionSchema,
  action: z.enum(["PUBLISH", "HIDE", "RESTORE"]),
}).strict();

const commonListShape = {
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).refine(s => !invalidPostgresText.test(s)).optional(),
  skill: z.enum(["WRITING", "SPEAKING"]).optional(),
  sampleType: sampleTypeSchema.optional(),
  topic: z.string().trim().max(200).refine(s => !invalidPostgresText.test(s)).optional(),
};

export const publicListSchema = z.object(commonListShape).strict();

export const adminListSchema = z.object({
  ...commonListShape,
  status: statusSchema.optional(),
}).strict();

export type ListInput = z.infer<typeof publicListSchema> & {
  status?: SampleStatus;
};

export type FieldIssue = {
  path: Array<string | number>;
  message: string;
};

export function parseInput<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new HttpError(
      400,
      "SAMPLE_VALIDATION_ERROR",
      "Dữ liệu bài mẫu không hợp lệ.",
      {
        issues: result.error.issues.map(issue => ({
          path: issue.path,
          message: issue.message,
        })),
      },
    );
  }

  return result.data;
}

export function parseId(value: unknown): string {
  const result = uuidSchema.safeParse(value);

  if (!result.success) {
    throw new HttpError(
      400,
      "SAMPLE_INVALID_ID",
      "ID bài mẫu không hợp lệ.",
    );
  }

  return result.data;
}
