import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireFreshAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../utils/http.js';

const date = z.string().date().refine(value => value >= '0001-01-01');
const range = z.object({ from: date, to: date }).strict().refine(({ from, to }) => from <= to);

type Statistics = {
  measuredAt: Date;
  accountsTotal: number;
  accountsActive: number;
  accountsLocked: number;
  accountsNew: number;
  usersSignedIn: number;
  loginHistoryFrom: string | null;
  accountLocks: number;
  flashcardSessions: number;
  flashcardLearners: number;
  dailyFlashcards: { day: string; sessions: number }[];
};

export const adminStatisticsRouter = Router();
adminStatisticsRouter.get('/', requireFreshAuth, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const input = range.safeParse(req.query);
  if (!input.success) throw new HttpError(400, 'INVALID_STATISTICS_RANGE', 'Khoảng ngày thống kê không hợp lệ.');
  const { from, to } = input.data;
  const [stats] = await prisma.$queryRaw<Statistics[]>`
    WITH bounds AS (
      SELECT ${from}::date AS start_day, ${to}::date AS end_day,
        ${from}::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS from_at,
        (${to}::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS until_at
    ), accounts AS (
      SELECT count(*)::int AS total,
        count(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
        count(*) FILTER (WHERE status = 'LOCKED')::int AS locked,
        count(*) FILTER (WHERE created_at >= from_at AND created_at < until_at)::int AS new
      FROM public.users CROSS JOIN bounds
    ), flashcards AS (
      SELECT activity_date, user_id
      FROM public.learning_activities CROSS JOIN bounds
      WHERE activity_type = 'FLASHCARD' AND activity_date BETWEEN start_day AND end_day
    ), chart AS (
      SELECT (end_day - offset_day)::text AS day, count(f.activity_date)::int AS sessions
      FROM bounds
      CROSS JOIN generate_series(0, least(6, end_day - start_day)) AS offsets(offset_day)
      LEFT JOIN flashcards f ON f.activity_date = end_day - offset_day
      GROUP BY end_day - offset_day
    )
    SELECT statement_timestamp() AS "measuredAt", accounts.total AS "accountsTotal",
      accounts.active AS "accountsActive", accounts.locked AS "accountsLocked", accounts.new AS "accountsNew",
      (SELECT count(DISTINCT user_id)::int FROM public.user_login_events WHERE created_at >= from_at AND created_at < until_at) AS "usersSignedIn",
      ((SELECT min(created_at) FROM public.user_login_events) AT TIME ZONE 'Asia/Ho_Chi_Minh')::date::text AS "loginHistoryFrom",
      (SELECT count(*)::int FROM public.audit_logs
        WHERE entity_type = 'USER' AND action = 'USER_LOCKED' AND created_at >= from_at AND created_at < until_at) AS "accountLocks",
      (SELECT count(*)::int FROM flashcards) AS "flashcardSessions",
      (SELECT count(DISTINCT user_id)::int FROM flashcards) AS "flashcardLearners",
      (SELECT jsonb_agg(chart ORDER BY chart.day) FROM chart) AS "dailyFlashcards"
    FROM bounds CROSS JOIN accounts
  `;
  res.set('Cache-Control', 'private, no-store').json({ from, to, ...stats, supportReports: null });
}));
