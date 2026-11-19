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
  skill: z.enum(['LISTENING', 'READING', 'WRITING', 'SPEAKING']).optional(),
  before: z.string().uuid().optional(),
  limit: z.string().regex(/^[0-9]{1,2}$/).transform(Number).pipe(z.number().int().min(1).max(25)).optional(),
}).strict();

type HistoryRow = { id: string; title: string; completedAt: Date; skill: string; form: string | null;
  scope: string; band: number | null; accuracy: number | null; correct: number | null; total: number | null };

export async function readLearnerResults(db: typeof prisma, userId: string, query: z.infer<typeof historyQuery>) {
  const limit = query.limit ?? 15;
  const rows = await db.$queryRaw<HistoryRow[]>`WITH results AS (
      SELECT sa.id, concat_ws(' · ',es.name,e.title) AS title,sa.completed_at,sk.skill,sk.form,a.attempt_type AS scope,
        CASE WHEN a.attempt_type IN ('FULL_EXAM','FULL_SKILL') AND sa.section_id IS NULL AND sa.question_group_id IS NULL
          AND sa.band_score BETWEEN 0 AND 9 AND (sk.skill IN ('LISTENING','READING') OR EXISTS (
            SELECT 1 FROM public.grading_requests gr JOIN public.grading_reviews rv ON rv.grading_request_id=gr.id
            WHERE gr.skill_attempt_id=sa.id AND gr.status='COMPLETED' AND rv.status='PUBLISHED' AND rv.published_at <= statement_timestamp()
          )) THEN sa.band_score::float8 END AS band,
        CASE WHEN a.attempt_type IN ('SECTION','QUESTION_GROUP') AND sk.skill IN ('LISTENING','READING')
          AND sa.accuracy BETWEEN 0 AND 100 THEN sa.accuracy::float8 END AS accuracy,
        sa.correct_count AS correct,sa.total_questions AS total
      FROM public.attempts a JOIN public.skill_attempts sa ON sa.attempt_id=a.id
      JOIN public.exam_skills sk ON sk.id=sa.exam_skill_id AND sk.exam_id=a.exam_id
      JOIN public.exams e ON e.id=a.exam_id JOIN public.exam_sets es ON es.id=e.exam_set_id
      WHERE a.user_id=${userId}::uuid AND a.status='COMPLETED' AND sa.status='COMPLETED'
        AND sa.completed_at <= statement_timestamp()
        ${query.skill ? Prisma.sql`AND sk.skill=${query.skill}` : Prisma.empty}
    ) SELECT id,title,completed_at AS "completedAt",skill,form,scope,band,accuracy,correct,total
      FROM results r WHERE ${query.kind === 'band' ? Prisma.sql`band IS NOT NULL` : query.kind === 'practice'
        ? Prisma.sql`accuracy IS NOT NULL` : Prisma.sql`(band IS NOT NULL OR accuracy IS NOT NULL)`}
      ${query.before ? Prisma.sql`AND (r.completed_at,r.id) < (SELECT completed_at,id FROM results WHERE id=${query.before}::uuid)` : Prisma.empty}
      ORDER BY completed_at DESC,id DESC LIMIT ${limit + 1}::int`;
  return { items: rows.slice(0, limit), nextCursor: rows.length > limit ? rows[limit - 1].id : null };
}
