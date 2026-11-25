import { Router } from 'express';
import type { ZodType } from 'zod';
import { env } from '../../config.js';
import { supabaseRecordingStorage } from '../../integrations/storage/recording-storage.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { createAttemptsRepository } from './attempts.repository.js';
import {
  completeAttemptSchema, createAttemptSchema, createRecordingSchema, examSkillParamSchema, idParamSchema, recordingParamSchema,
} from './attempts.schemas.js';
import { createAttemptsService, type AttemptsDeps } from './attempts.service.js';

function parse<T>(schema: ZodType<T>, value: unknown, code = 'VALIDATION_ERROR'): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, code, 'Dữ liệu gửi lên không hợp lệ.');
  return result.data;
}

// Gắn dưới /api/learner. Người học chỉ thao tác trên lượt của chính mình (kiểm ở service).
export function createAttemptsRouter(deps?: Partial<AttemptsDeps>, db: typeof prisma = prisma) {
  const service = createAttemptsService({
    repo: deps?.repo ?? createAttemptsRepository(db),
    storage: deps?.storage ?? supabaseRecordingStorage,
    clock: deps?.clock,
  });
  const router = Router();
  router.use('/skill-attempts', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(['/skill-attempts', '/exam-skills'], requireAuth, requireRole('LEARNER'));
  router.use('/skill-attempts', (req, _res, next) => {
    if (req.method !== 'GET' && req.headers.origin !== env.FRONTEND_ORIGIN) {
      return next(new HttpError(403, 'INVALID_ORIGIN', 'Nguồn gửi yêu cầu không được phép.'));
    }
    next();
  });
  const uid = (req: { appUser?: { id: string } }) => req.appUser!.id;

  router.get('/exam-skills/:examSkillId/speaking', asyncHandler(async (req, res) => {
    const { examSkillId } = parse(examSkillParamSchema, req.params, 'EXAM_SKILL_NOT_FOUND');
    res.setHeader('Cache-Control', 'no-store');
    res.json(await service.getSpeakingContent(examSkillId));
  }));

  router.post('/skill-attempts', asyncHandler(async (req, res) => {
    const result = await service.createAttempt(uid(req), parse(createAttemptSchema, req.body));
    res.status(result.created ? 201 : 200).json(result.body);
  }));

  router.get('/skill-attempts/:id', asyncHandler(async (req, res) => {
    res.json(await service.getAttempt(uid(req), parse(idParamSchema, req.params, 'ATTEMPT_NOT_FOUND').id));
  }));

  router.post('/skill-attempts/:id/recordings', asyncHandler(async (req, res) => {
    const { id } = parse(idParamSchema, req.params, 'ATTEMPT_NOT_FOUND');
    res.json(await service.createRecording(uid(req), id, parse(createRecordingSchema, req.body)));
  }));

  router.post('/skill-attempts/:id/recordings/:questionId/confirm', asyncHandler(async (req, res) => {
    const { id, questionId } = parse(recordingParamSchema, req.params, 'RECORDING_NOT_FOUND');
    res.json(await service.confirmRecording(uid(req), id, questionId));
  }));

  router.get('/skill-attempts/:id/recordings/:questionId/url', asyncHandler(async (req, res) => {
    const { id, questionId } = parse(recordingParamSchema, req.params, 'RECORDING_NOT_FOUND');
    res.json(await service.getRecordingUrl(uid(req), id, questionId));
  }));

  router.post('/skill-attempts/:id/complete', asyncHandler(async (req, res) => {
    const { id } = parse(idParamSchema, req.params, 'ATTEMPT_NOT_FOUND');
    res.json(await service.completeAttempt(uid(req), id, parse(completeAttemptSchema, req.body)));
  }));

  router.delete('/skill-attempts/:id', asyncHandler(async (req, res) => {
    const parsed = idParamSchema.safeParse(req.params);
    if (parsed.success) await service.deleteAttempt(uid(req), parsed.data.id);
    res.status(204).end();
  }));

  // Ranh giới: lượt chấm W/S, phân công và điểm do thành viên khác làm. Hoàn thành bài KHÔNG tự gửi chấm (BR-CONTENT-001).
  router.post('/skill-attempts/:id/grading-request', asyncHandler(async (req, res) => {
    const { id } = parse(idParamSchema, req.params, 'ATTEMPT_NOT_FOUND');
    await service.requestGrading(uid(req), id);
    res.status(501).end();
  }));

  return router;
}
