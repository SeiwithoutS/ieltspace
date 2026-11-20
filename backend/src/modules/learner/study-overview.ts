import { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { prisma } from '../../lib/prisma.js';

const oneDay = 86_400_000;

type ProgressRow = {
  today: string;
  nextDayAt: Date;
  goal: { overall: number | null; listening: number | null; reading: number | null; writing: number | null; speaking: number | null; dailySessions: number } | null;
  todaySessions: number;
  checkinDates: string[];
  flashcards: { sessions: number; reviewedWords: number; forgottenWords: number };
};

export function summarizeCheckInDays(today: string, dates: string[]) {
  const checkins = new Set(dates.filter(date => date <= today));
  const end = Date.parse(`${today}T00:00:00Z`);
  const monday = end - ((new Date(end).getUTCDay() + 6) % 7) * oneDay;
  const checkInDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday + index * oneDay).toISOString().slice(0, 10);
    return { date, checkedIn: checkins.has(date) };
  });
  let longest = 0;
  let run = 0;
  let previous = -Infinity;
  for (const date of [...checkins].sort()) {
    const time = Date.parse(`${date}T00:00:00Z`);
    run = time - previous === oneDay ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = time;
  }
  return {
    checkedInToday: checkins.has(today),
    currentStreak: end - previous <= oneDay ? run : 0,
    longestStreak: longest,
    checkInDays,
  };
}

export async function readLearningProgress(db: typeof prisma, userId: string) {
  const [row] = await db.$queryRaw<ProgressRow[]>`WITH calendar AS (
      SELECT statement_timestamp() AS measured_at, (statement_timestamp() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS today
    ), today_activities AS (
      SELECT 1 FROM public.learning_activities, calendar
      WHERE user_id=${userId}::uuid AND activity_type='FLASHCARD' AND activity_date=today AND completed_at <= measured_at
      UNION ALL
      SELECT 1 FROM public.attempts, calendar
      WHERE user_id=${userId}::uuid AND status='COMPLETED' AND completed_at <= measured_at
        AND completed_at >= (today::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')
    ), flashcards AS (
      SELECT id, completed_at FROM public.flashcard_sessions, calendar
      WHERE user_id=${userId}::uuid AND completed_at <= measured_at
    ), latest_reviews AS (
      SELECT DISTINCT ON (i.vocabulary_id) i.vocabulary_id,i.self_rating
      FROM flashcards f JOIN public.flashcard_session_items i ON i.session_id=f.id
      WHERE i.is_reviewed AND i.self_rating IS NOT NULL
      ORDER BY i.vocabulary_id,coalesce(i.reviewed_at, f.completed_at) DESC,f.completed_at DESC,f.id DESC
    ) SELECT today::text AS today, ((today + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') AS "nextDayAt",
      (SELECT jsonb_build_object('overall',overall_target,'listening',listening_target,'reading',reading_target,
        'writing',writing_target,'speaking',speaking_target,'dailySessions',daily_session_target)
        FROM public.study_goals WHERE user_id=${userId}::uuid AND effective_from <= measured_at
        ORDER BY effective_from DESC,id DESC LIMIT 1) AS goal,
      (SELECT count(*)::int FROM today_activities) AS "todaySessions",
      coalesce((SELECT jsonb_agg(checkin_date::text) FROM public.learner_checkins
        WHERE user_id=${userId}::uuid AND checkin_date <= today),'[]') AS "checkinDates",
      (SELECT jsonb_build_object('sessions',(SELECT count(*) FROM flashcards),'reviewedWords',count(*),
        'forgottenWords',count(*) FILTER (WHERE self_rating='NOT_REMEMBERED')) FROM latest_reviews) AS flashcards
      FROM calendar`;
  return { today: row.today, nextDayAt: row.nextDayAt, goal: row.goal, flashcards: row.flashcards,
    todaySessions: row.todaySessions, ...summarizeCheckInDays(row.today, row.checkinDates) };
}

export const historyQuery = z.object({
  kind: z.enum(['all', 'band', 'practice']).default('all'),
  group: z.enum(['LR', 'WS']).optional(),
  skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING']).optional(),
  before: z.string().uuid().optional(),
  limit: z.string().regex(/^[0-9]{1,2}$/).transform(Number).pipe(z.number().int().min(1).max(25)).optional(),
}).strict();

export const dashboardQuery = z.object({ days: z.enum(['7', '30']).default('7').transform(Number) }).strict();
export const activityCalendarQuery = z.object({
  year: z.string().regex(/^(19|20|21)\d{2}$/).transform(Number).optional(),
}).strict();

type ActivityCalendarRow = {
  startDate: string;
  endDate: string;
  years: number[];
  days: { date: string; practice: number; flashcards: number }[];
};

export async function readLearnerActivityCalendar(db: typeof prisma, userId: string, year?: number) {
  const selectedYear = year ?? null;
  const [row] = await db.$queryRaw<ActivityCalendarRow[]>`WITH calendar AS (
      SELECT statement_timestamp() AS measured_at,
        (statement_timestamp() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS today
    ), bounds AS (
      SELECT *, coalesce(make_date(${selectedYear}::int, 1, 1), today - 364) AS first_day,
        least(make_date(${selectedYear}::int, 12, 31), today) AS last_day FROM calendar
    ), activity_dates AS (
      SELECT (a.completed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day, 'practice' AS kind
      FROM public.attempts a CROSS JOIN calendar
      WHERE a.user_id=${userId}::uuid AND a.status='COMPLETED' AND a.completed_at <= measured_at
      UNION ALL
      SELECT la.activity_date AS day, 'flashcards' AS kind FROM public.learning_activities la CROSS JOIN calendar
      WHERE la.user_id=${userId}::uuid AND la.activity_type='FLASHCARD' AND la.completed_at <= measured_at
    ), available_years AS (
      SELECT extract(year FROM today)::int AS year FROM calendar
      UNION
      SELECT extract(year FROM day)::int FROM activity_dates
    ), daily AS (
      SELECT day AS date, count(*) FILTER (WHERE kind='practice')::int AS practice,
        count(*) FILTER (WHERE kind='flashcards')::int AS flashcards
      FROM activity_dates CROSS JOIN bounds WHERE day BETWEEN first_day AND last_day GROUP BY day
    ) SELECT first_day::text AS "startDate", last_day::text AS "endDate",
      (SELECT jsonb_agg(year ORDER BY year DESC) FROM available_years WHERE year BETWEEN 1900 AND 2199) AS years,
      coalesce((SELECT jsonb_agg(to_jsonb(d) ORDER BY d.date) FROM daily d), '[]') AS days
      FROM bounds WHERE first_day <= last_day`;
  return row;
}

type DashboardRow = {
  practice: number;
  flashcards: number;
  reviewedWords: number;
  days: { date: string; practice: number; flashcards: number }[];
  skills: Record<string, number>;
};

export async function readLearnerDashboard(db: typeof prisma, userId: string, days: number) {
  const [row] = await db.$queryRaw<DashboardRow[]>`WITH calendar AS (
      SELECT statement_timestamp() AS measured_at,
        (statement_timestamp() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS today
    ), bounds AS (
      SELECT *, today - (${days}::int - 1) AS first_day FROM calendar
    ), practice AS (
      SELECT a.id, a.exam_id, (a.completed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day
      FROM public.attempts a CROSS JOIN bounds
      WHERE a.user_id=${userId}::uuid AND a.status='COMPLETED'
        AND a.completed_at BETWEEN (first_day::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') AND measured_at
    ), flashcards AS (
      SELECT f.id, (f.completed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day
      FROM public.flashcard_sessions f CROSS JOIN bounds
      WHERE f.user_id=${userId}::uuid
        AND f.completed_at BETWEEN (first_day::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') AND measured_at
    ), practice_days AS (
      SELECT day, count(*)::int AS total FROM practice GROUP BY day
    ), flashcard_days AS (
      SELECT day, count(*)::int AS total FROM flashcards GROUP BY day
    ), daily AS (
      SELECT (first_day + g.day_offset)::text AS date, coalesce(p.total,0) AS practice, coalesce(f.total,0) AS flashcards
      FROM bounds CROSS JOIN generate_series(0, today - first_day) AS g(day_offset)
      LEFT JOIN practice_days p ON p.day = first_day + g.day_offset
      LEFT JOIN flashcard_days f ON f.day = first_day + g.day_offset
    ), skills AS (
      SELECT sk.skill, count(*)::int AS total
      FROM practice p JOIN public.skill_attempts sa ON sa.attempt_id=p.id
      JOIN public.exam_skills sk ON sk.id=sa.exam_skill_id AND sk.exam_id=p.exam_id
      WHERE sa.status='COMPLETED' AND sa.completed_at <= statement_timestamp()
      GROUP BY sk.skill
    ) SELECT (SELECT count(*)::int FROM practice) AS practice,
      (SELECT count(*)::int FROM flashcards) AS flashcards,
      (SELECT count(DISTINCT i.vocabulary_id)::int FROM flashcards f JOIN public.flashcard_session_items i
        ON i.session_id=f.id WHERE i.is_reviewed) AS "reviewedWords",
      (SELECT jsonb_agg(to_jsonb(d) ORDER BY d.date) FROM daily d) AS days,
      coalesce((SELECT jsonb_object_agg(skill, total) FROM skills), '{}') AS skills`;
  return row;
}

type HistoryRow = { id: string; title: string; completedAt: Date; skill: string; form: string | null;
  scope: string; band: number | null; accuracy: number | null; correct: number | null; total: number | null };

export async function readLearnerResults(db: typeof prisma, userId: string, query: z.infer<typeof historyQuery>) {
  const limit = query.limit ?? 15;
  const groupFilter = query.group === 'LR' ? Prisma.sql`AND sk.skill IN ('LISTENING','READING')`
    : query.group === 'WS' ? Prisma.sql`AND sk.skill IN ('WRITING','SPEAKING')` : Prisma.empty;
  const scoreFilter = query.kind === 'band' ? Prisma.sql`band IS NOT NULL`
    : query.kind === 'practice' ? Prisma.sql`accuracy IS NOT NULL`
    : query.group ? Prisma.sql`true` : Prisma.sql`(band IS NOT NULL OR accuracy IS NOT NULL)`;
  const rows = await db.$queryRaw<HistoryRow[]>`WITH results AS (
      SELECT sa.id, concat_ws(' · ',es.name,e.title) AS title,sa.completed_at,sk.skill,sk.form,a.attempt_type AS scope,
        CASE WHEN a.attempt_type IN ('FULL_EXAM','FULL_SKILL') AND sa.section_id IS NULL AND sa.question_group_id IS NULL
          AND sa.band_score BETWEEN 0 AND 9 AND (sk.skill IN ('LISTENING','READING') OR EXISTS (
            SELECT 1 FROM public.grading_requests gr JOIN public.grading_reviews rv ON rv.grading_request_id=gr.id
            WHERE gr.skill_attempt_id=sa.id AND gr.status='COMPLETED' AND rv.status='PUBLISHED' AND rv.published_at <= statement_timestamp()
          )) THEN sa.band_score::float8 END AS band,
        CASE WHEN a.attempt_type IN ('SECTION','QUESTION_GROUP') AND sk.skill IN ('LISTENING','READING')
          AND sa.accuracy BETWEEN 0 AND 100 THEN sa.accuracy::float8 END AS accuracy,
        CASE WHEN sk.skill IN ('LISTENING','READING') THEN sa.correct_count END AS correct,
        CASE WHEN sk.skill IN ('LISTENING','READING') THEN sa.total_questions END AS total
      FROM public.attempts a JOIN public.skill_attempts sa ON sa.attempt_id=a.id
      JOIN public.exam_skills sk ON sk.id=sa.exam_skill_id AND sk.exam_id=a.exam_id
      JOIN public.exams e ON e.id=a.exam_id JOIN public.exam_sets es ON es.id=e.exam_set_id
      WHERE a.user_id=${userId}::uuid AND a.status='COMPLETED' AND sa.status='COMPLETED'
        AND sa.completed_at <= statement_timestamp()
        ${groupFilter}
        ${query.skill ? Prisma.sql`AND sk.skill=${query.skill}` : Prisma.empty}
    ) SELECT id,title,completed_at AS "completedAt",skill,form,scope,band,accuracy,correct,total
      FROM results r WHERE ${scoreFilter}
      ${query.before ? Prisma.sql`AND (r.completed_at,r.id) < (SELECT completed_at,id FROM results WHERE id=${query.before}::uuid AND ${scoreFilter})` : Prisma.empty}
      ORDER BY completed_at DESC,id DESC LIMIT ${limit + 1}::int`;
  return { items: rows.slice(0, limit), nextCursor: rows.length > limit ? rows[limit - 1].id : null };
}
