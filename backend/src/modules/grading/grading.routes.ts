import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config.js';
import { prisma } from '../../lib/prisma.js';
import { requireFreshAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { getTeacherOverview, listGradingRequests, listTeacherHistory, listTeacherLoads, listTeacherQueue } from './grading.queries.js';
import { createGradingService } from './grading.service.js';
import { createReviewService } from './review.service.js';
import { reviewInput } from './review-rubric.js';
import { questionKeySchema } from '../attempts/attempts.schemas.js';

const uuid = z.string().uuid();
const skill = z.enum(['WRITING', 'SPEAKING']);
const rolePage = z.coerce.number().int().min(1).max(10_000).default(1);
const queueFilters = z.object({ status: z.enum(['WAITING_ASSIGNMENT', 'ASSIGNED', 'CANCELLED']).default('WAITING_ASSIGNMENT'), page: rolePage });
const permissions = z.object({ canGrade: z.boolean(), isAccepting: z.boolean(), maxPending: z.number().int().min(0).max(50) }).strict();
const cancellation = z.object({ reason: z.string().trim().min(1).max(500) }).strict();
const teacherFilters = z.object({ skill: skill.optional(), q: z.string().trim().max(120).optional() });
const teacherQueueFilters = teacherFilters.extend({ page: rolePage, sort: z.enum(['oldest','newest']).optional() }).strict();
const historyFilters = z.union([
  teacherFilters.extend({ days: z.coerce.number().int().min(1).max(365).default(30) }).strict(),
  teacherFilters.extend({ from: z.string().date(), to: z.string().date() }).strict().refine(value => value.from <= value.to),
]);

function parse<T, I>(schema: z.ZodType<T, z.ZodTypeDef, I>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, 'VALIDATION_ERROR', 'Dữ liệu hỗ trợ chấm không hợp lệ.');
  return result.data;
}

export function createGradingRouter(role: 'ADMIN' | 'LEARNER' | 'TEACHER', db: typeof prisma = prisma) {
  const router = Router();
  const service = createGradingService(db);
  const reviews = createReviewService(db);
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.use(requireFreshAuth, requireRole(role));
  router.use((req, _res, next) => {
    if (req.method !== 'GET' && req.headers.origin !== env.FRONTEND_ORIGIN) {
      return next(new HttpError(403, 'INVALID_ORIGIN', 'Nguồn gửi yêu cầu không được phép.'));
    }
    next();
  });

  if (role === 'LEARNER') {
    router.get('/credits', asyncHandler(async (req, res) => { res.json(await service.balance(req.appUser!.id)); }));
    router.get('/results/:id', asyncHandler(async (req, res) => {
      res.json(await reviews.learnerView(req.appUser!.id, parse(uuid, req.params.id)));
    }));
  } else if (role === 'TEACHER') {
    router.get('/overview', asyncHandler(async (req, res) => {
      res.json(await getTeacherOverview(db, req.appUser!.id));
    }));
    router.get('/requests', asyncHandler(async (req, res) => {
      const teacherId = req.appUser!.id;
      const [queue, { items: loads }] = await Promise.all([
        listTeacherQueue(db, teacherId, parse(teacherQueueFilters, req.query)), listTeacherLoads(db, teacherId),
      ]);
      res.json({ ...queue, loads });
    }));
    router.get('/history', asyncHandler(async (req, res) => {
      res.json(await listTeacherHistory(db, req.appUser!.id, parse(historyFilters, req.query)));
    }));
    router.get('/requests/:id', asyncHandler(async (req, res) => {
      res.json(await reviews.teacherView(req.appUser!.id, parse(uuid, req.params.id)));
    }));
    router.get('/requests/:id/recordings/:questionId/url', asyncHandler(async (req, res) => {
      res.json(await reviews.teacherAudio(req.appUser!.id, parse(uuid, req.params.id), parse(questionKeySchema, req.params.questionId)));
    }));
    router.put('/requests/:id/draft', asyncHandler(async (req, res) => {
      res.json(await reviews.save(req.appUser!.id, parse(uuid, req.params.id), parse(reviewInput, req.body), false));
    }));
    router.post('/requests/:id/publish', asyncHandler(async (req, res) => {
      res.json(await reviews.save(req.appUser!.id, parse(uuid, req.params.id), parse(reviewInput, req.body), true));
    }));
  } else {
    router.get('/requests', asyncHandler(async (req, res) => { res.json(await listGradingRequests(db, parse(queueFilters, req.query))); }));
    router.get('/teachers', asyncHandler(async (req, res) => { res.json(await listTeacherLoads(db, undefined, parse(rolePage, req.query.page))); }));
    router.get('/teachers/:id', asyncHandler(async (req, res) => {
      const teacherId = parse(uuid, req.params.id);
      const [loads, requests] = await Promise.all([
        listTeacherLoads(db, teacherId), listGradingRequests(db, { teacherId, status: 'ASSIGNED', page: parse(rolePage, req.query.page) }),
      ]);
      res.json({ skills: loads.items, ...requests });
    }));
    router.put('/teachers/:id/permissions/:skill', asyncHandler(async (req, res) => {
      res.json(await service.savePermission(req.appUser!.id, parse(uuid, req.params.id), parse(skill, req.params.skill), parse(permissions, req.body)));
    }));
    router.post('/teachers/:id/requests/:requestId/cancel', asyncHandler(async (req, res) => {
      const { reason } = parse(cancellation, req.body);
      res.json(await service.cancelAssigned(req.appUser!.id, parse(uuid, req.params.id), parse(uuid, req.params.requestId), reason));
    }));
  }
  return router;
}
