import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { listTopicLabels } from './exams.catalog.service.js';
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
  saveSkillContentSchema,
  discardUploadsSchema,
  transcribeParamSchema,
  transcribeBodySchema,
  transcriptionJobParamSchema,
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
import {
  getEditorSkill,
  saveSkillContent,
  createRevisionDraft,
  uploadSkillImage,
  uploadSkillAudio,
  discardUploads,
  deleteSkill,
} from './exam-editor.service.js';
import { getSkillHistory } from './exam-history.service.js';
import {
  startTranscriptionJob,
  getTranscriptionJob,
} from './transcription-jobs.service.js';
import { toCategoryDto } from './exams.mapper.js';
import { prisma } from '../../lib/prisma.js';

export const adminExamsRouter = Router();

adminExamsRouter.use(requireAuth, requireRole('ADMIN'));

// A0: GET /admin/exam-topics (chủ đề Writing/Speaking đã có, cho combobox trong editor)
adminExamsRouter.get(
  '/exam-topics',
  asyncHandler(async (_req, res) => {
    res.json({ items: await listTopicLabels() });
  })
);

// A1: GET /admin/exam-set-categories
adminExamsRouter.get(
  '/exam-set-categories',
  asyncHandler(async (_req, res) => {
    res.setHeader('Cache-Control', 'private, max-age=60');
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

// E1: GET /admin/exam-skills/:skillId
adminExamsRouter.get(
  '/exam-skills/:skillId',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const skill = await getEditorSkill(pParam.data.skillId);
    res.json(skill);
  })
);

// E2: PUT /admin/exam-skills/:skillId/content
adminExamsRouter.put(
  '/exam-skills/:skillId/content',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const parsed = saveSkillContentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(
        400,
        'VALIDATION_ERROR',
        errs[0]?.message || 'Nội dung kỹ năng không hợp lệ.',
        errs
      );
    }

    const skill = await saveSkillContent(
      pParam.data.skillId,
      parsed.data,
      req.appUser?.id
    );
    res.json(skill);
  })
);

// E3: POST /admin/exam-skills/:skillId/draft
adminExamsRouter.post(
  '/exam-skills/:skillId/draft',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const result = await createRevisionDraft(
      pParam.data.skillId,
      req.appUser?.id
    );
    res.status(result.isExisting ? 200 : 201).json(result.skill);
  })
);

// E5: PUT /admin/exam-skills/:skillId/images
adminExamsRouter.put(
  '/exam-skills/:skillId/images',
  (req, res, next) => {
    express.raw({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      limit: '5mb',
    })(req, res, (err) => {
      if (err) {
        if (
          (err as { type?: string; status?: number }).type === 'entity.too.large' ||
          (err as { type?: string; status?: number }).status === 413
        ) {
          return next(
            new HttpError(413, 'IMAGE_TOO_LARGE', 'Kích thước ảnh tối đa là 5 MB.')
          );
        }
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Tệp ảnh không hợp lệ.');
    }

    const contentType = req.headers['content-type'] || 'image/jpeg';
    const uploaded = await uploadSkillImage(
      pParam.data.skillId,
      req.body,
      contentType
    );
    res.status(201).json(uploaded);
  })
);

// E6: DELETE /admin/exam-skills/:skillId
adminExamsRouter.delete(
  '/exam-skills/:skillId',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const set = await deleteSkill(pParam.data.skillId, req.appUser?.id);
    res.json(set);
  })
);

// E7: GET /admin/exam-skills/:skillId/history
adminExamsRouter.get(
  '/exam-skills/:skillId/history',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const history = await getSkillHistory(pParam.data.skillId);
    res.json(history);
  })
);

// E8: PUT /admin/exam-skills/:skillId/audio
adminExamsRouter.put(
  '/exam-skills/:skillId/audio',
  (req, res, next) => {
    express.raw({
      type: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a'],
      limit: '50mb',
    })(req, res, (err) => {
      if (err) {
        if (
          (err as { type?: string; status?: number }).type === 'entity.too.large' ||
          (err as { type?: string; status?: number }).status === 413
        ) {
          return next(
            new HttpError(
              413,
              'AUDIO_TOO_LARGE',
              'Ghi âm tối đa 50 MB. Nén lại (MP3 128 kbps) rồi tải lên.'
            )
          );
        }
        return next(err);
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Tệp ghi âm không hợp lệ.');
    }

    const contentType = req.headers['content-type'] || 'audio/mpeg';
    const uploaded = await uploadSkillAudio(
      pParam.data.skillId,
      req.body,
      contentType
    );
    res.status(201).json(uploaded);
  })
);

// E9: POST /admin/exam-skills/:skillId/uploads/discard
adminExamsRouter.post(
  '/exam-skills/:skillId/uploads/discard',
  asyncHandler(async (req, res) => {
    const pParam = skillIdParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(404, 'EXAM_SKILL_NOT_FOUND', 'Không tìm thấy kỹ năng.');
    }

    const parsed = discardUploadsSchema.safeParse(req.body);
    if (!parsed.success) {
      const errs = formatZodError(parsed.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Danh sách tệp không hợp lệ.', errs);
    }

    const result = await discardUploads(pParam.data.skillId, parsed.data.paths);
    res.json(result);
  })
);

const transcribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.appUser?.id || req.ip || 'admin',
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Bạn đã đạt giới hạn 20 lần tạo transcript mỗi giờ. Vui lòng thử lại sau.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// E10: POST /admin/exam-skills/:skillId/sections/:orderNo/transcribe
adminExamsRouter.post(
  '/exam-skills/:skillId/sections/:orderNo/transcribe',
  transcribeLimiter,
  asyncHandler(async (req, res) => {
    const pParam = transcribeParamSchema.safeParse(req.params);
    if (!pParam.success) {
      const errs = formatZodError(pParam.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Tham số không hợp lệ.', errs);
    }

    const pBody = transcribeBodySchema.safeParse(req.body);
    if (!pBody.success) {
      const errs = formatZodError(pBody.error);
      throw new HttpError(400, 'VALIDATION_ERROR', errs[0]?.message || 'Dữ liệu không hợp lệ.', errs);
    }

    const actorId = req.appUser!.id;
    const result = await startTranscriptionJob({
      actorId,
      skillId: pParam.data.skillId,
      orderNo: pParam.data.orderNo,
      audioPath: pBody.data.audioPath,
    });

    res.status(202).json(result);
  })
);

// E11: GET /admin/transcriptions/:jobId
adminExamsRouter.get(
  '/transcriptions/:jobId',
  asyncHandler(async (req, res) => {
    const pParam = transcriptionJobParamSchema.safeParse(req.params);
    if (!pParam.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Mã tác vụ không hợp lệ.');
    }

    const actorId = req.appUser!.id;
    const result = getTranscriptionJob(pParam.data.jobId, actorId);
    res.json(result);
  })
);



