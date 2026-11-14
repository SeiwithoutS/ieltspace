import { z } from 'zod';

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
            })
          )
          .length(2, 'Writing phải có đúng 2 Task.'),
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
        }),
        part2: z.object({
          prepMinutes: z.number().int().min(1).max(120).nullable().optional().default(null),
          speakMinutes: z.number().int().min(1).max(120).nullable().optional().default(null),
          cueCard: z.string().max(3000, 'Thẻ đề Part 2 tối đa 3000 ký tự.').default(''),
        }),
        part3: z.object({
          instruction: z.string().max(300, 'Hướng dẫn Part 3 tối đa 300 ký tự.').optional().default(''),
          questions: z
            .array(z.string().trim().max(300, 'Mỗi câu hỏi Part 3 tối đa 300 ký tự.'))
            .max(30, 'Part 3 tối đa 30 câu hỏi.')
            .default([]),
        }),
      })
      .optional(),
  })
  .refine(
    (data) => Boolean(data.writing) || Boolean(data.speaking),
    {
      message: 'Phải cung cấp nội dung writing hoặc speaking.',
      path: ['writing'],
    }
  );


