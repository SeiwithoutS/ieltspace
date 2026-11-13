import express, { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import {
  idParamSchema,
  examIdParamSchema,
  skillIdParamSchema,
  createCategorySchema,
  createSetSchema,
  patchSetSchema,
  addTestSchema,
  createSkillSchema,
  formatZodError,
} from './exams.schemas.js';
import { listCategories, findOrCreateCategory } from './categories.service.js';
import {
  listExamSets,
  getExamSet,
  createExamSet,
  patchExamSet,
  publishExamSet,
  hideExamSet,
  deleteExamSet,
  uploadCover,
} from './exam-sets.service.js';
import { addTest, deleteTest } from './exam-tests.service.js';
import {
  createSkill,
  hideSkill,
  showSkill,
  publishSkill,
} from './exam-skills.service.js';
import { toCategoryDto } from './exams.mapper.js';
import { prisma } from '../../lib/prisma.js';

export const adminExamsRouter = Router();

adminExamsRouter.use(requireAuth, requireRole('ADMIN'));

// A1: GET /admin/exam-set-categories
adminExamsRouter.get(
  '/exam-set-categories',
  asyncHandler(async (_req, res) => {
    const cats = await listCategories();
    res.json({ items: cats.map(toCategoryDto) });
  })
);

// A2: POST /admin/exam-set-categories
adminExamsRouter.post(
  '/exam-set-categories',
  asyncHandler(async (req, res) => {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Thông tin không hợp lệ.', errs);
    }

    const cat = await findOrCreateCategory(prisma, parsed.data.name, req.appUser?.id);
    res.status(201).json(toCategoryDto(cat));
  })
);

// A3: GET /admin/exam-sets
adminExamsRouter.get(
  '/exam-sets',
  asyncHandler(async (_req, res) => {
    const items = await listExamSets();
    res.json({ items });
  })
);

// A4: POST /admin/exam-sets
adminExamsRouter.post(
  '/exam-sets',
  asyncHandler(async (req, res) => {
    const parsed = createSetSchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Thông tin không hợp lệ.', errs);
    }

    const created = await createExamSet(parsed.data, req.appUser?.id);
    res.status(201).json(created);
  })
);

// A5: GET /admin/exam-sets/:id
adminExamsRouter.get(
  '/exam-sets/:id',
  asyncHandler(async (req, res) => {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    const set = await getExamSet(parsed.data.id);
    res.json(set);
  })
);

// A6: PATCH /admin/exam-sets/:id
adminExamsRouter.patch(
  '/exam-sets/:id',
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    const parsed = patchSetSchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Thông tin không hợp lệ.', errs);
    }

    const patched = await patchExamSet(pParam.data.id, parsed.data, req.appUser?.id);
    res.json(patched);
  })
);

// A7: PUT /admin/exam-sets/:id/cover
adminExamsRouter.put(
  '/exam-sets/:id/cover',
  (req, res, next) => {
    express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' })(req, res, (err) => {
      if (err) {
        if ((err as any).type === 'entity.too.large' || (err as any).status === 413) {
          return next(new HttpError(413, 'COVER_TOO_LARGE', 'Kích thước ảnh tối đa là 5 MB.'));
        }
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Tệp ảnh không hợp lệ.');
    }

    const contentType = req.headers['content-type'] || 'image/jpeg';
    const updated = await uploadCover(pParam.data.id, req.body, contentType, req.appUser?.id);
    res.json(updated);
  })
);

// A8: POST /admin/exam-sets/:id/publish
adminExamsRouter.post(
  '/exam-sets/:id/publish',
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    const published = await publishExamSet(pParam.data.id, req.appUser?.id);
    res.json(published);
  })
);

// A9: POST /admin/exam-sets/:id/hide
adminExamsRouter.post(
  '/exam-sets/:id/hide',
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    const hidden = await hideExamSet(pParam.data.id, req.appUser?.id);
    res.json(hidden);
  })
);

// A10: DELETE /admin/exam-sets/:id
adminExamsRouter.delete(
  '/exam-sets/:id',
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    await deleteExamSet(pParam.data.id, req.appUser?.id);
    res.status(204).send();
  })
);

// A11: POST /admin/exam-sets/:id/exams
adminExamsRouter.post(
  '/exam-sets/:id/exams',
  asyncHandler(async (req, res) => {
    const pParam = idParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SET_NOT_FOUND', 'Không tìm thấy bộ đề.');
    }

    const parsed = addTestSchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Thông tin không hợp lệ.', errs);
    }

    const set = await addTest(pParam.data.id, parsed.data.title, req.appUser?.id);
    res.status(201).json(set);
  })
);

// A12: DELETE /admin/exams/:examId
adminExamsRouter.delete(
  '/exams/:examId',
  asyncHandler(async (req, res) => {
    const pParam = examIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_NOT_FOUND', 'Không tìm thấy đề thi.');
    }

    const set = await deleteTest(pParam.data.examId, req.appUser?.id);
    res.json(set);
  })
);

// A13: POST /admin/exams/:examId/skills
adminExamsRouter.post(
  '/exams/:examId/skills',
  asyncHandler(async (req, res) => {
    const pParam = examIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_NOT_FOUND', 'Không tìm thấy đề thi.');
    }

    const parsed = createSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Thông tin không hợp lệ.', errs);
    }

    const set = await createSkill(
      pParam.data.examId,
      parsed.data.skill,
      parsed.data.form,
      req.appUser?.id
    );
    res.status(201).json(set);
  })
);

// A14: POST /admin/exam-skills/:skillId/hide
adminExamsRouter.post(
  '/exam-skills/:skillId/hide',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const set = await hideSkill(pParam.data.skillId, req.appUser?.id);
    res.json(set);
  })
);

// A15: POST /admin/exam-skills/:skillId/show
adminExamsRouter.post(
  '/exam-skills/:skillId/show',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const set = await showSkill(pParam.data.skillId, req.appUser?.id);
    res.json(set);
  })
);

// A16: POST /admin/exam-skills/:skillId/publish
adminExamsRouter.post(
  '/exam-skills/:skillId/publish',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const set = await publishSkill(pParam.data.skillId, req.appUser?.id);
    res.json(set);
  })
);
