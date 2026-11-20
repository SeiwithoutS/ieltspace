import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';
import { activityCalendarQuery, dashboardQuery, historyQuery, readLearnerActivityCalendar, readLearnerDashboard, readLearnerResults, readLearningProgress } from './study-overview.js';

function studyRouter() {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use(requireAuth, requireRole('LEARNER'));
  router.use((req, _res, next) => {
    if (req.method === 'POST' && req.headers.origin !== env.FRONTEND_ORIGIN) {
      return next(new HttpError(403, 'INVALID_ORIGIN', 'Nguồn gửi yêu cầu không được phép.'));
    }
    next();
  });
  return router;
}

const band = z.number().min(0).max(9).multipleOf(0.5).nullable();
const goalSchema = z.object({
  overall: band, listening: band, reading: band, writing: band, speaking: band,
  dailySessions: z.number().int().min(1).max(2147483647),
}).strict();
type Goal = z.infer<typeof goalSchema> & { id: string; effectiveFrom: Date };
const goalColumns = Prisma.sql`id, effective_from AS "effectiveFrom", overall_target::float8 AS overall,
  listening_target::float8 AS listening, reading_target::float8 AS reading,
  writing_target::float8 AS writing, speaking_target::float8 AS speaking, daily_session_target AS "dailySessions"`;

export function createLearnerStudyRouter(db: typeof prisma = prisma) {
  const learnerStudyRouter = studyRouter();

  learnerStudyRouter.get('/progress', asyncHandler(async (req, res) => {
    res.json(await readLearningProgress(db, req.appUser!.id));
  }));

  learnerStudyRouter.get('/dashboard', asyncHandler(async (req, res) => {
    const query = dashboardQuery.safeParse(req.query);
    if (!query.success) throw new HttpError(400, 'INVALID_DASHBOARD_RANGE', 'Khoảng thời gian không hợp lệ.');
    res.json(await readLearnerDashboard(db, req.appUser!.id, query.data.days));
  }));

  learnerStudyRouter.get('/activity-calendar', asyncHandler(async (req, res) => {
    const query = activityCalendarQuery.safeParse(req.query);
    if (!query.success) throw new HttpError(400, 'INVALID_ACTIVITY_YEAR', 'Năm không hợp lệ.');
    const calendar = await readLearnerActivityCalendar(db, req.appUser!.id, query.data.year);
    if (!calendar) throw new HttpError(400, 'INVALID_ACTIVITY_YEAR', 'Chọn năm hiện tại hoặc một năm trước đó.');
    res.json(calendar);
  }));

  learnerStudyRouter.post('/check-in', asyncHandler(async (req, res) => {
    const input = z.object({ ownerId: z.string().uuid() }).strict().safeParse(req.body);
    if (!input.success) throw new HttpError(400, 'INVALID_CHECK_IN', 'Yêu cầu điểm danh không hợp lệ.');
    const userId = req.appUser!.id;
    if (input.data.ownerId !== userId) throw new HttpError(403, 'CHECK_IN_OWNER_MISMATCH', 'Phiên đăng nhập đã thay đổi.');
    await db.$executeRaw`INSERT INTO public.learner_checkins (user_id,checked_in_at)
      VALUES (${userId}::uuid,statement_timestamp()) ON CONFLICT (user_id,checkin_date) DO NOTHING`;
    res.json(await readLearningProgress(db, userId));
  }));

  learnerStudyRouter.get('/results', asyncHandler(async (req, res) => {
    const query = historyQuery.safeParse(req.query);
    if (!query.success) throw new HttpError(400, 'INVALID_RESULT_FILTER', 'Bộ lọc kết quả không hợp lệ.');
    res.json(await readLearnerResults(db, req.appUser!.id, query.data));
  }));

  learnerStudyRouter.get('/goals', asyncHandler(async (req, res) => {
    const userId = req.appUser!.id;
    const history = await db.$queryRaw<Goal[]>`SELECT ${goalColumns} FROM public.study_goals
      WHERE user_id = ${userId}::uuid AND effective_from <= statement_timestamp()
      ORDER BY effective_from DESC, id DESC LIMIT 20`;
    res.json({ current: history[0] ?? null, history });
  }));

  learnerStudyRouter.post('/goals', asyncHandler(async (req, res) => {
    const input = goalSchema.safeParse(req.body);
    if (!input.success) throw new HttpError(400, 'INVALID_GOAL', 'Band phải từ 0 đến 9 theo bước 0,5. Số phiên mỗi ngày phải là số nguyên dương.');
    const userId = req.appUser!.id;
    const { overall, listening, reading, writing, speaking, dailySessions } = input.data;
    const result = await db.$transaction(async tx => {
      const [owner] = await tx.$queryRaw`SELECT id FROM public.users WHERE id = ${userId}::uuid
        AND role = 'LEARNER' AND status = 'ACTIVE' FOR UPDATE` as { id: string }[];
      if (!owner) throw new HttpError(403, 'ACCOUNT_UNAVAILABLE', 'Tài khoản không được phép cập nhật mục tiêu.');
      const history = await tx.$queryRaw<Goal[]>`SELECT ${goalColumns} FROM public.study_goals
        WHERE user_id = ${userId}::uuid AND effective_from <= statement_timestamp()
        ORDER BY effective_from DESC, id DESC LIMIT 20`;
      const current = history[0];
      if (current && Object.entries(input.data).every(([key, value]) => current[key as keyof Goal] === value)) {
        return { current, history };
      }
      const [next] = await tx.$queryRaw<Goal[]>`INSERT INTO public.study_goals
        (user_id, overall_target, listening_target, reading_target, writing_target, speaking_target, daily_session_target, effective_from)
        VALUES (${userId}::uuid, ${overall}, ${listening}, ${reading}, ${writing}, ${speaking}, ${dailySessions}::integer, clock_timestamp())
        RETURNING ${goalColumns}`;
      return { current: next, history: [next, ...history].slice(0, 20) };
    });
    res.json(result);
  }));

  const id = z.string().uuid().transform(value => value.toLowerCase());
  const flashcardSchema = z.object({
    id, ownerId: id, title: z.string().trim().min(1).max(300).refine(value => !value.includes('\0')), finishedAt: z.number().int().min(1).max(8_640_000_000_000_000),
    elapsedSeconds: z.number().int().min(0).max(604800),
    reason: z.enum(['completed', 'timeout', 'stopped']),
    source: z.discriminatedUnion('type', [
      z.object({ type: z.literal('SET'), setId: id }).strict(),
      z.object({ type: z.literal('FAVORITES') }).strict(),
      z.object({ type: z.literal('REVIEW') }).strict(),
    ]),
    cardIds: z.array(id).min(1).max(2000),
    reviews: z.array(z.object({ wordId: id, remembered: z.boolean() }).strict()).min(1).max(2000),
  }).strict().refine(input => {
    const cards = new Set(input.cardIds);
    const reviewed = new Set(input.reviews.map(review => review.wordId));
    return cards.size === input.cardIds.length && reviewed.size === input.reviews.length &&
      [...reviewed].every(wordId => cards.has(wordId)) &&
      (input.reason !== 'completed' || reviewed.size === cards.size);
  });

  learnerStudyRouter.post('/flashcards', asyncHandler(async (req, res) => {
    const parsed = flashcardSchema.safeParse(req.body);
    if (!parsed.success || parsed.data.finishedAt > Date.now() + 300_000) {
      throw new HttpError(400, 'INVALID_FLASHCARD_SESSION', 'Dữ liệu phiên ôn không hợp lệ.');
    }
    const input = parsed.data;
    const userId = req.appUser!.id;
    if (input.ownerId !== userId) throw new HttpError(403, 'SESSION_OWNER_MISMATCH', 'Phiên ôn thuộc tài khoản khác.');
    const finished = new Date(Math.min(input.finishedAt, Date.now()));
    const started = new Date(finished.getTime() - input.elapsedSeconds * 1000);
    const setId = input.source.type === 'SET' ? input.source.setId : null;
    const reviews = new Map(input.reviews.map(review => [review.wordId, review.remembered]));

    const saved = await db.$transaction(async tx => {
      const [existing] = await tx.$queryRaw<{ owned: boolean }[]>`SELECT user_id = ${userId}::uuid AS owned
        FROM public.flashcard_sessions WHERE id = ${input.id}::uuid`;
      if (existing) {
        if (!existing.owned) throw new HttpError(409, 'SESSION_CONFLICT', 'Không thể dùng mã phiên ôn này.');
        return false;
      }
      if (setId) {
        const [set] = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM public.vocabulary_sets WHERE id = ${setId}::uuid FOR KEY SHARE`;
        if (!set) throw new HttpError(400, 'UNKNOWN_FLASHCARD_SET', 'Bộ từ của phiên ôn không còn tồn tại.');
      }
      const [settings] = await tx.$queryRaw<{ minimum: number }[]>`SELECT CASE
        WHEN value #>> '{}' ~ '^[1-9][0-9]{0,3}$' THEN (value #>> '{}')::int ELSE 10 END AS minimum
        FROM public.system_settings WHERE key = 'flashcard_minimum_cards'`;
      const minimum = Math.min(settings?.minimum ?? 10, input.cardIds.length);
      const [created] = await tx.$queryRaw<{ id: string }[]>`INSERT INTO public.flashcard_sessions
        (id,user_id,source_type,set_id,title,total_cards,minimum_cards,reviewed_count,status,is_qualified,started_at,completed_at,finish_reason,elapsed_seconds)
        VALUES (${input.id}::uuid,${userId}::uuid,${input.source.type},${setId}::uuid,${input.title},${input.cardIds.length}::int,
        ${minimum}::int,${reviews.size}::int,${input.reason === 'completed' ? 'COMPLETED' : 'ABANDONED'},
        ${reviews.size >= minimum},${started},${finished},${input.reason},${input.elapsedSeconds}::int)
        ON CONFLICT (id) DO NOTHING RETURNING id`;
      if (!created) {
        const [winner] = await tx.$queryRaw<{ owned: boolean }[]>`SELECT user_id = ${userId}::uuid AS owned
          FROM public.flashcard_sessions WHERE id = ${input.id}::uuid`;
        if (!winner?.owned) throw new HttpError(409, 'SESSION_CONFLICT', 'Không thể dùng mã phiên ôn này.');
        return false;
      }
      const items = JSON.stringify(input.cardIds.map((wordId, index) => ({
        word_id: wordId, card_no: index + 1,
        rating: !reviews.has(wordId) ? null : reviews.get(wordId) ? 'REMEMBERED' : 'NOT_REMEMBERED',
      })));
      const inserted = await tx.$executeRaw`INSERT INTO public.flashcard_session_items
        (session_id,vocabulary_id,order_no,is_reviewed,self_rating,reviewed_at)
        SELECT ${input.id}::uuid, c.word_id, c.card_no, c.rating IS NOT NULL, c.rating,
          CASE WHEN c.rating IS NOT NULL THEN ${finished}::timestamptz END
        FROM jsonb_to_recordset(${items}::jsonb) AS c(word_id uuid, card_no int, rating text)
        JOIN public.vocabularies v ON v.id = c.word_id`;
      if (inserted !== input.cardIds.length) throw new HttpError(400, 'UNKNOWN_FLASHCARD', 'Một số thẻ trong phiên không còn tồn tại.');
      if (reviews.size >= minimum) {
        await tx.$executeRaw`INSERT INTO public.learning_activities (user_id,activity_type,flashcard_session_id,completed_at)
          VALUES (${userId}::uuid,'FLASHCARD',${input.id}::uuid,${finished})
          ON CONFLICT (flashcard_session_id) DO NOTHING`;
      }
      return true;
    });
    res.status(saved ? 201 : 200).json({ id: input.id });
  }));

  type HistoryRow = { id: string; title: string; finishedAt: number; elapsedSeconds: number; cardCount: number;
    reason: string; reviews: { wordId: string; remembered: boolean }[] };
  type FlashcardStats = { sessions: number; reviewedWords: number; forgottenIds: string[] };

  learnerStudyRouter.get('/flashcards', asyncHandler(async (req, res) => {
    const cursor = z.object({ before: id.optional() }).strict().safeParse(req.query);
    if (!cursor.success) throw new HttpError(400, 'INVALID_CURSOR', 'Mốc lịch sử không hợp lệ.');
    const userId = req.appUser!.id;
    const before = cursor.data.before;
    const rows = await db.$queryRaw<HistoryRow[]>`WITH page AS (
        SELECT * FROM public.flashcard_sessions s WHERE s.user_id = ${userId}::uuid AND s.completed_at IS NOT NULL
        ${before ? Prisma.sql`AND (s.completed_at, s.id) < (SELECT completed_at, id FROM public.flashcard_sessions
          WHERE user_id = ${userId}::uuid AND id = ${before}::uuid)` : Prisma.empty}
        ORDER BY s.completed_at DESC,s.id DESC LIMIT 26
      ) SELECT p.id, coalesce(p.title,v.name,'Phiên Flashcard') AS title,
      (extract(epoch FROM p.completed_at) * 1000)::float8 AS "finishedAt",
      coalesce(p.elapsed_seconds,greatest(0,extract(epoch FROM p.completed_at-p.started_at)::int)) AS "elapsedSeconds",
      p.total_cards AS "cardCount", coalesce(p.finish_reason, CASE WHEN p.status = 'COMPLETED' THEN 'completed' ELSE 'stopped' END) AS reason,
      coalesce((SELECT jsonb_agg(jsonb_build_object('wordId',i.vocabulary_id,'remembered',i.self_rating='REMEMBERED') ORDER BY i.order_no)
        FROM public.flashcard_session_items i WHERE i.session_id=p.id AND i.is_reviewed AND i.self_rating IS NOT NULL),'[]') AS reviews
      FROM page p LEFT JOIN public.vocabulary_sets v ON v.id=p.set_id ORDER BY p.completed_at DESC,p.id DESC`;
    const [stats] = before ? [] : await db.$queryRaw<FlashcardStats[]>`WITH sessions AS (
        SELECT id, completed_at FROM public.flashcard_sessions WHERE user_id=${userId}::uuid AND completed_at IS NOT NULL
      ), latest AS (
        SELECT DISTINCT ON (i.vocabulary_id) i.vocabulary_id, i.self_rating
        FROM sessions s JOIN public.flashcard_session_items i ON i.session_id=s.id
        WHERE i.is_reviewed AND i.self_rating IS NOT NULL
        ORDER BY i.vocabulary_id,coalesce(i.reviewed_at,s.completed_at) DESC,s.completed_at DESC,s.id DESC
      ) SELECT (SELECT count(*)::int FROM sessions) AS sessions, count(*)::int AS "reviewedWords",
      coalesce(array_agg(vocabulary_id ORDER BY vocabulary_id) FILTER (WHERE self_rating='NOT_REMEMBERED'),'{}') AS "forgottenIds"
      FROM latest`;
    res.json({ items: rows.slice(0, 25), nextCursor: rows.length > 25 ? rows[24].id : null, ...(stats && { stats }) });
  }));

  return learnerStudyRouter;
}
