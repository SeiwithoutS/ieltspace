import { prisma } from '../../lib/prisma.js';

export type InProgressAttempt = {
  skillAttemptId: string;
  examId: string;
  examSkillId: string;
  skill: 'LISTENING' | 'READING';
  form: 'ACADEMIC' | 'GENERAL' | null;
  examTitle: string;
  setName: string;
  // null: lượt làm cả kỹ năng; có giá trị: lượt làm riêng một section/passage.
  sectionOrderNo: number | null;
  answered: number;
  total: number;
  startedAt: string;
};

// Bài Listening/Reading người học đang làm dở (attempt IN_PROGRESS). Chỉ đọc, chỉ của chính người học,
// không có đáp án: "answered" chỉ là số câu đã có nội dung trả lời.
// Chưa có code backend nào ghi attempt_answers nên dạng answer_data chưa xác nhận; điều kiện "đã trả lời"
// (khác null, "", [], {}) cần chỉnh lại khi làm luồng làm bài. Bài quá deadline_at không còn là đang làm.
export async function readInProgressAttempts(db: typeof prisma, userId: string): Promise<InProgressAttempt[]> {
  const rows = await db.$queryRaw<
    Array<{
      skillAttemptId: string;
      examId: string;
      examSkillId: string;
      skill: 'LISTENING' | 'READING';
      form: string | null;
      examTitle: string;
      setName: string;
      sectionOrderNo: number | null;
      answered: number;
      total: number | null;
      startedAt: Date;
    }>
  >`
    SELECT sa.id AS "skillAttemptId", e.id AS "examId", k.id AS "examSkillId", k.skill AS skill, k.form AS form,
      e.title AS "examTitle", es.name AS "setName", sec.order_no AS "sectionOrderNo", sa.started_at AS "startedAt",
      (SELECT count(*)::int FROM public.attempt_answers aa
         WHERE aa.skill_attempt_id = sa.id AND aa.answer_data IS NOT NULL
           AND aa.answer_data::text NOT IN ('""', '[]', '{}', 'null')) AS answered,
      COALESCE(sa.total_questions, (
        SELECT count(*)::int FROM public.questions q
          JOIN public.question_groups g ON g.id = q.question_group_id
          JOIN public.exam_sections s ON s.id = g.section_id
         WHERE s.exam_skill_id = sa.exam_skill_id
           AND (sa.section_id IS NULL OR s.id = sa.section_id)
           AND (sa.question_group_id IS NULL OR g.id = sa.question_group_id)
      )) AS total
    FROM public.skill_attempts sa
    JOIN public.attempts a ON a.id = sa.attempt_id
    JOIN public.exam_skills k ON k.id = sa.exam_skill_id
    JOIN public.exams e ON e.id = k.exam_id
    JOIN public.exam_sets es ON es.id = e.exam_set_id
    LEFT JOIN public.exam_sections sec ON sec.id = sa.section_id
    WHERE a.user_id = ${userId}::uuid AND a.status = 'IN_PROGRESS' AND sa.status = 'IN_PROGRESS'
      AND sa.deadline_at > statement_timestamp()
      AND k.skill IN ('LISTENING', 'READING')
    ORDER BY sa.started_at DESC
  `;
  return rows.map((r) => ({
    skillAttemptId: r.skillAttemptId,
    examId: r.examId,
    examSkillId: r.examSkillId,
    skill: r.skill,
    form: r.form === 'ACADEMIC' || r.form === 'GENERAL' ? r.form : null,
    examTitle: r.examTitle,
    setName: r.setName,
    sectionOrderNo: r.sectionOrderNo,
    answered: r.answered,
    total: r.total ?? 0,
    startedAt: r.startedAt.toISOString(),
  }));
}
