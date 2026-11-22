import { z } from 'zod';
import { TASK1_ESSAY_TYPES, TASK2_ESSAY_TYPES, TOPIC_MAX_LENGTH, WRITING_ESSAY_TYPE_CODES } from './exam-labels.js';

export function formatZodError(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}

export const idParamSchema = z.object({
  id: z.string().uuid('Mã định danh không hợp lệ.'),
});

export const examIdParamSchema = z.object({
  examId: z.string().uuid('Mã đề thi không hợp lệ.'),
});

export const skillIdParamSchema = z.object({
  skillId: z.string().uuid('Mã kỹ năng không hợp lệ.'),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên danh mục không được để trống.')
    .max(60, 'Tên danh mục tối đa 60 ký tự.'),
});

export const createSetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Tên bộ đề không được để trống.')
      .max(120, 'Tên bộ đề tối đa 120 ký tự.'),
    description: z
      .string()
      .trim()
      .max(1000, 'Mô tả tối đa 1000 ký tự.')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    categoryId: z.string().uuid('Mã danh mục không hợp lệ.').optional(),
    newCategoryName: z
      .string()
      .trim()
      .min(1, 'Tên danh mục mới không được để trống.')
      .max(60, 'Tên danh mục mới tối đa 60 ký tự.')
      .optional(),
    coverUrl: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .refine(
    (data) => {
      const hasCat = Boolean(data.categoryId);
      const hasNewCat = Boolean(data.newCategoryName);
      return (hasCat || hasNewCat) && !(hasCat && hasNewCat);
    },
    {
      message: 'Phải chọn danh mục có sẵn hoặc nhập tên danh mục mới, không gửi cả hai.',
      path: ['categoryId'],
    }
  );

export const patchSetSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Tên bộ đề không được để trống.')
      .max(120, 'Tên bộ đề tối đa 120 ký tự.')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Mô tả tối đa 1000 ký tự.')
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
    categoryId: z.string().uuid('Mã danh mục không hợp lệ.').optional(),
    newCategoryName: z
      .string()
      .trim()
      .min(1, 'Tên danh mục mới không được để trống.')
      .max(60, 'Tên danh mục mới tối đa 60 ký tự.')
      .optional(),
    coverUrl: z
      .string()
      .trim()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .refine(
    (data) => {
      if (data.categoryId && data.newCategoryName) return false;
      return true;
    },
    {
      message: 'Không gửi đồng thời categoryId và newCategoryName.',
      path: ['categoryId'],
    }
  );

export const addTestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề đề thi không được để trống.')
    .max(60, 'Tiêu đề đề thi tối đa 60 ký tự.')
    .optional(),
});

export const createSkillSchema = z
  .object({
    skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING'], {
      errorMap: () => ({ message: 'Kỹ năng phải là LISTENING, READING, WRITING hoặc SPEAKING.' }),
    }),
    form: z
      .enum(['ACADEMIC', 'GENERAL'], {
        errorMap: () => ({ message: 'Hình thức thi phải là ACADEMIC hoặc GENERAL.' }),
      })
      .optional()
      .nullable()
      .transform((v) => v || null),
  })
  .refine(
    (data) => {
      if (data.skill === 'READING' || data.skill === 'WRITING') {
        return Boolean(data.form);
      }
      return !data.form;
    },
    {
      message: 'Reading và Writing bắt buộc chọn hình thức (form). Listening và Speaking không có hình thức.',
      path: ['form'],
    }
  );

export const lrAssetSchema = z.object({
  path: z.string(),
  name: z.string(),
  url: z.string().nullable().optional(),
});

export const lrSectionPatchSchema = z.object({
  orderNo: z.number().int().min(1).max(4),
  title: z.string().max(300).optional(),
  paragraphs: z
    .array(
      z.object({
        label: z.string().max(20),
        text: z.string().max(5000),
        startSec: z.number().nullable().optional().default(null),
      })
    )
    .max(30)
    .optional(),
  images: z
    .array(
      lrAssetSchema.extend({
        caption: z.string().max(300).default(''),
      })
    )
    .max(5)
    .optional(),
  audio: lrAssetSchema
    .extend({
      sizeBytes: z.number(),
      durationSec: z.number(),
    })
    .nullable()
    .optional(),
});

export const lrQuestionSchema = z.object({
  numberFrom: z.number().int(),
  numberTo: z.number().int(),
  content: z.record(z.any()).default({}),
  options: z.array(z.object({ label: z.string(), text: z.string() })).max(26).default([]),
  accepted: z.array(z.string().max(200)).max(10).default([]),
  matching: z.object({ kind: z.enum(['TEXT', 'CHOICE', 'MULTI']), limit: z.number().nullable().optional() }).default({ kind: 'TEXT' }),
  evidence: z.array(z.object({ para: z.number().nullable().optional(), label: z.string().nullable().optional(), keys: z.array(z.string()) })).default([]),
  notes: z.array(z.string()).default([]),
});

export const lrGroupSchema = z.object({
  id: z.string().nullable().optional(),
  type: z.string(),
  instruction: z.string().max(500).default(''),
  title: z.string().nullable().optional(),
  questionFrom: z.number().nullable().optional(),
  questionTo: z.number().nullable().optional(),
  image: lrAssetSchema.nullable().optional(),
  config: z.record(z.any()).default({}),
  content: z.record(z.any()).default({}),
  questions: z.array(lrQuestionSchema).max(60).default([]),
});

export const lrPatchSchema = z.object({
  sections: z.array(lrSectionPatchSchema).optional(),
  moveGroups: z
    .array(
      z.object({
        id: z.string(),
        sectionOrderNo: z.number().int().min(1).max(4),
        orderNo: z.number().int().min(1),
        questionFrom: z.number().int().nullable().optional(),
        questionTo: z.number().int().nullable().optional(),
      })
    )
    .optional(),
  upsertGroups: z
    .array(
      lrGroupSchema.extend({
        sectionOrderNo: z.number().int().min(1).max(4),
        orderNo: z.number().int().min(1),
      })
    )
    .optional(),
  deleteGroupIds: z.array(z.string()).optional(),
});

export type LrPatch = z.infer<typeof lrPatchSchema>;

const topicSchema = z
  .string()
  .trim()
  .max(TOPIC_MAX_LENGTH, `Chủ đề tối đa ${TOPIC_MAX_LENGTH} ký tự.`)
  .nullable()
  .optional()
  .default(null);

export const saveSkillContentSchema = z
  .object({
    baseUpdatedAt: z.string().min(1, 'baseUpdatedAt không được để trống.'),
    writing: z
      .object({
        tasks: z
          .array(
            z.object({
              prompt: z.string().max(5000, 'Đề bài tối đa 5000 ký tự.').default(''),
              imagePath: z.string().nullable().optional().default(null),
              essayType: z.enum(WRITING_ESSAY_TYPE_CODES).nullable().optional().default(null),
              topic: topicSchema,
            })
          )
          .length(2, 'Writing phải có đúng 2 Task.'),
      })
      .superRefine((w, ctx) => {
        // Dạng đề phải thuộc đúng Task (Task 1 hoặc Task 2).
        w.tasks.forEach((t, i) => {
          const ok = i === 0 ? TASK1_ESSAY_TYPES : TASK2_ESSAY_TYPES;
          if (t.essayType && !ok.includes(t.essayType)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['tasks', i, 'essayType'], message: `Dạng đề không thuộc Task ${i + 1}.` });
          }
        });
      })
      .optional(),
    speaking: z
      .object({
        p13Minutes: z.number().int().min(1).max(120).nullable().optional().default(null),
        part1: z.object({
          instruction: z.string().max(300, 'Hướng dẫn Part 1 tối đa 300 ký tự.').optional().default(''),
          questions: z
            .array(z.string().trim().max(300, 'Mỗi câu hỏi Part 1 tối đa 300 ký tự.'))
            .max(30, 'Part 1 tối đa 30 câu hỏi.')
            .default([]),
          topic: topicSchema,
        }),
        part2: z.object({
          prepMinutes: z.number().int().min(1).max(120).nullable().optional().default(null),
          speakMinutes: z.number().int().min(1).max(120).nullable().optional().default(null),
          cueCard: z.string().max(3000, 'Thẻ đề Part 2 tối đa 3000 ký tự.').default(''),
          topic: topicSchema,
        }),
        part3: z.object({
          instruction: z.string().max(300, 'Hướng dẫn Part 3 tối đa 300 ký tự.').optional().default(''),
          questions: z
            .array(z.string().trim().max(300, 'Mỗi câu hỏi Part 3 tối đa 300 ký tự.'))
            .max(30, 'Part 3 tối đa 30 câu hỏi.')
            .default([]),
          topic: topicSchema,
        }),
      })
      .optional(),
    reading: lrPatchSchema.optional(),
    listening: lrPatchSchema.optional(),
  })
  .refine(
    (data) => {
      const keys = [data.writing, data.speaking, data.reading, data.listening].filter(Boolean);
      return keys.length === 1;
    },
    {
      message: 'Phải cung cấp đúng một trong các nội dung: writing, speaking, reading hoặc listening.',
      path: ['writing'],
    }
  );

export const discardUploadsSchema = z.object({
  paths: z.array(z.string().min(1)).max(50, 'Tối đa 50 tệp mỗi lần dọn.'),
});

export const transcribeParamSchema = z.object({
  skillId: z.string().uuid('Mã kỹ năng không hợp lệ.'),
  orderNo: z.coerce.number().int().min(1).max(4, 'Section phải từ 1 đến 4.'),
});

export const transcribeBodySchema = z.object({
  audioPath: z.string().min(1, 'audioPath không được để trống.'),
});

export const transcriptionJobParamSchema = z.object({
  jobId: z.string().uuid('Mã tác vụ không hợp lệ.'),
});



