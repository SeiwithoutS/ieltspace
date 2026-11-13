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
