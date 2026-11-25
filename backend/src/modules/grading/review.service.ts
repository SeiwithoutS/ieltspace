import { Prisma } from '@prisma/client';
import { supabaseRecordingStorage, type RecordingStorage } from '../../integrations/storage/recording-storage.js';
import { prisma } from '../../lib/prisma.js';
import { lockAccountWrites } from '../../shared/account-write-lock.js';
import { HttpError } from '../../utils/http.js';
import { CONTENT_RETENTION_DAYS, DOWNLOAD_URL_TTL_SECONDS, effectiveContentStatus, readWsSections } from '../attempts/attempts.schemas.js';
import { countWords } from '../attempts/attempts.service.js';
import { revokeIfIdle, type GradingSkill } from './grading.service.js';
import { aggregationSchema, calculateReview, roundingSchema, type Criterion, type ReviewInput, type Score, type ScoreGroup } from './review-rubric.js';

type Tx = Prisma.TransactionClient;
type Review = { id: string; ruleId: string; status: 'DRAFT' | 'PUBLISHED'; overall: number | null; generalComment: string | null;
  updatedAt: Date; publishedAt: Date | null; scores: Score[] };
type Rule = { id: string; scope: 'FULL_SKILL' | 'SECTION'; aggregation: unknown; rounding: unknown };
type Attempt = {
  requestId: string | null; attemptId: string; title: string; skill: GradingSkill; mode: string | null;
  selectedScope: unknown; sectionId: string | null; examSkillId: string; versionRuleId: string | null; attemptRuleId: string | null;
  status: 'WAITING_ASSIGNMENT' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | null; contentStatus: string; expiresAt: Date | null;
  learner: string; teacher: string | null; completedAt: Date; requestedAt: Date | null; assignedAt: Date | null;
  cancelledAt: Date | null; cancelReason: string | null;
  creditType: 'FREE_WEEKLY' | 'BONUS' | null; canEdit: boolean; ratingPublished: boolean;
};
type Section = { id: string; number: number; prompt: string | null; instruction: string | null; questions: string[]; minWords: number | null };
type Text = { sectionId: string; number: number; text: string };
type Audio = { sectionId: string; number: number; id: string; durationMs: number };

const columns = Prisma.sql`g.id AS "requestId",k.id AS "attemptId",concat_ws(' · ',es.name,ex.title) AS title,e.skill,
  k.mode,a.selected_scope AS "selectedScope",k.section_id AS "sectionId",
  e.id AS "examSkillId",e.grading_rule_id AS "versionRuleId",k.grading_rule_id AS "attemptRuleId",
  g.status,k.content_status AS "contentStatus",k.content_expires_at AS "expiresAt",owner.full_name AS learner,
  t.full_name AS teacher,k.completed_at AS "completedAt",g.requested_at AS "requestedAt",g.assigned_at AS "assignedAt",
  g.cancelled_at AS "cancelledAt",g.cancel_reason AS "cancelReason",
  c.credit_type AS "creditType",(p.status IN ('ACTIVE','PENDING_REVOKE')) IS TRUE AS "canEdit",
  EXISTS(SELECT 1 FROM public.grading_reviews r WHERE r.grading_request_id=g.id AND r.status='PUBLISHED') AS "ratingPublished"`;
const source = Prisma.sql`public.skill_attempts k JOIN public.attempts a ON a.id=k.attempt_id
  JOIN public.exam_skills e ON e.id=k.exam_skill_id JOIN public.exams ex ON ex.id=e.exam_id JOIN public.exam_sets es ON es.id=ex.exam_set_id
  JOIN public.users owner ON owner.id=a.user_id`;
const staffJoins = Prisma.sql`LEFT JOIN public.users t ON t.id=g.teacher_id
  LEFT JOIN public.teacher_permissions p ON p.teacher_id=g.teacher_id AND p.skill=e.skill
  LEFT JOIN public.support_credits c ON c.id=g.used_credit_id`;
const missing = () => new HttpError(404, 'GRADING_REQUEST_NOT_FOUND', 'Không tìm thấy phiếu chấm.');
const noRubric = () => new HttpError(409, 'GRADING_RUBRIC_UNAVAILABLE', 'Bài chưa có quy tắc chấm phù hợp với phạm vi đã làm.');
const expired = () => new HttpError(410, 'CONTENT_EXPIRED', 'Nội dung bài đã hết hạn lưu.');

async function teacherAttempt(db: Tx, teacherId: string, requestId: string, lock = false) {
  const [row] = await db.$queryRaw<Attempt[]>`SELECT ${columns} FROM ${source}
    JOIN public.grading_requests g ON g.skill_attempt_id=k.id ${staffJoins}
    WHERE g.id=${requestId}::uuid AND g.teacher_id=${teacherId}::uuid AND t.role='TEACHER' AND t.status='ACTIVE'
      AND e.skill IN ('WRITING','SPEAKING') ${lock ? Prisma.sql`FOR UPDATE OF g,k` : Prisma.empty}`;
  if (!row) throw missing();
  return row;
}

async function savedReview(db: Tx, requestId: string, publishedOnly = false): Promise<Review | null> {
  const [review] = await db.$queryRaw<Review[]>`SELECT r.id,r.grading_rule_id AS "ruleId",r.status,
    r.overall_score::float8 AS overall,r.general_comment AS "generalComment",r.updated_at AS "updatedAt",r.published_at AS "publishedAt",
    COALESCE((SELECT jsonb_agg(jsonb_build_object('criterionId',s.criterion_id,'sectionId',s.section_id,'score',s.score,'comment',s.comment)
      ORDER BY e.order_no NULLS FIRST,c.order_no)
      FROM public.grading_scores s JOIN public.rubric_criteria c ON c.id=s.criterion_id
      LEFT JOIN public.exam_sections e ON e.id=s.section_id WHERE s.grading_review_id=r.id),'[]'::jsonb) AS scores
    FROM public.grading_reviews r WHERE r.grading_request_id=${requestId}::uuid
      ${publishedOnly ? Prisma.sql`AND r.status='PUBLISHED'` : Prisma.empty}`;
  return review ?? null;
}

function loadSections(db: Tx, attempt: Attempt) {
  return db.$queryRaw<Section[]>`SELECT e.id,e.order_no AS number,e.instruction,
    COALESCE(e.content->>'prompt',e.content->>'cueCard') AS prompt,
    CASE WHEN jsonb_typeof(e.config->'minWords')='number' THEN (e.config->>'minWords')::int END AS "minWords",
    ARRAY(SELECT q.content->>'text' FROM public.question_groups g JOIN public.questions q ON q.question_group_id=g.id
      WHERE g.section_id=e.id AND NULLIF(q.content->>'text','') IS NOT NULL ORDER BY g.order_no,q.order_no) AS questions
    FROM public.exam_sections e WHERE e.exam_skill_id=${attempt.examSkillId}::uuid ORDER BY e.order_no`;
}

async function loadContent(db: Tx, attempt: Attempt, now: Date) {
  const status = effectiveContentStatus(attempt.contentStatus, attempt.expiresAt, now);
  if (status === 'EXPIRED' || status === 'DELETED') return { status, texts: [] as Text[], recordings: [] as Audio[] };
  const texts: Text[] = attempt.skill === 'WRITING' ? await db.$queryRaw<Text[]>`
    SELECT DISTINCT ON (e.order_no) e.id AS "sectionId",e.order_no AS number,s.text_content AS text
    FROM public.submission_contents s JOIN public.exam_sections e ON e.id=s.section_id
    WHERE s.skill_attempt_id=${attempt.attemptId}::uuid AND s.text_content IS NOT NULL AND s.recording_status IS DISTINCT FROM 'DELETED'
      AND s.question_key IN ('','task' || e.order_no)
    ORDER BY e.order_no,(s.question_key<>'') DESC,s.updated_at DESC` : [];
  const recordings: Audio[] = attempt.skill === 'SPEAKING' ? await db.$queryRaw<Audio[]>`
    SELECT e.id AS "sectionId",e.order_no AS number,s.question_key AS id,round(s.audio_duration*1000)::int AS "durationMs"
    FROM public.submission_contents s JOIN public.exam_sections e ON e.id=s.section_id
    WHERE s.skill_attempt_id=${attempt.attemptId}::uuid AND s.recording_status='UPLOADED' AND NULLIF(s.audio_path,'') IS NOT NULL
    ORDER BY e.order_no,s.question_key` : [];
  return { status, texts, recordings };
}

function gradeSections(attempt: Attempt, sections: Section[], content: { texts: Text[]; recordings: Audio[] }, review: Review | null) {
  const saved = readWsSections(attempt.selectedScope);
  const reviewedIds = review?.scores.map(score => score.sectionId).filter(Boolean) ?? [];
  const submittedIds = [...content.texts.filter(item => item.text.trim()).map(item => item.sectionId), ...content.recordings.map(item => item.sectionId)];
  if (saved) return sections.filter(section => saved.includes(section.number));
  if (attempt.sectionId) return sections.filter(section => section.id === attempt.sectionId);
  if (reviewedIds.length > 0) return sections.filter(section => reviewedIds.includes(section.id));
  if (attempt.mode === 'REAL' || review?.scores.some(score => score.sectionId === null)) return sections;
  return sections.filter(section => submittedIds.includes(section.id));
}

async function loadRubric(db: Tx, attempt: Attempt, sections: Section[], selected: Section[], review: Review | null) {
  const expected = attempt.skill === 'WRITING' ? 2 : 3;
  if (!selected.length && !review?.publishedAt) throw noRubric();
  const scope = sections.length === expected && selected.length === expected ? 'FULL_SKILL' : 'SECTION';
  const ruleId = review?.ruleId ?? attempt.attemptRuleId;
  const [rule] = await db.$queryRaw<Rule[]>`SELECT id,assessment_scope AS scope,aggregation_rules AS aggregation,rounding_rules AS rounding
    FROM public.grading_rules WHERE skill=${attempt.skill} AND (
      (${ruleId}::uuid IS NOT NULL AND id=${ruleId}::uuid) OR (${ruleId}::uuid IS NULL AND assessment_scope=${scope} AND (
        ${attempt.versionRuleId}::uuid IS NULL OR id=${attempt.versionRuleId}::uuid OR
        (assessment_scope='SECTION' AND version=(SELECT version FROM public.grading_rules WHERE id=${attempt.versionRuleId}::uuid)))))
    ORDER BY version DESC,id LIMIT 1`;
  if (!rule || (rule.scope !== scope && !review?.publishedAt)) throw noRubric();
  const criteria = await db.$queryRaw<Criterion[]>`SELECT id,name,description,weight::float8,min_score::float8 AS minimum,
    max_score::float8 AS maximum,score_step::float8 AS step FROM public.rubric_criteria
    WHERE grading_rule_id=${rule.id}::uuid ORDER BY order_no`;
  if (review?.publishedAt) {
    const ids = [...new Set(review.scores.map(score => score.sectionId))];
    const groups = ids.map(sectionId => ({ sectionId, number: sections.find(section => section.id === sectionId)?.number ?? null, weight: 1 }));
    return { id: rule.id, scope: rule.scope, criteria, groups };
  }
  const aggregation = aggregationSchema.safeParse(rule.aggregation);
  if (!aggregation.success || !roundingSchema.safeParse(rule.rounding).success) throw noRubric();
  if (!criteria.length) throw noRubric();
  let groups: ScoreGroup[];
  if (rule.scope === 'FULL_SKILL' && attempt.skill === 'SPEAKING') {
    if (aggregation.data.parts !== 'WHOLE_SKILL') throw noRubric();
    groups = [{ sectionId: null, number: null, weight: 1 }];
  } else {
    const weights = aggregation.data.tasks;
    groups = selected.map(section => ({ sectionId: section.id, number: section.number,
      weight: rule.scope === 'FULL_SKILL' ? weights?.find(task => task.order === section.number)?.weight ?? 0 : 1 }));
    if (groups.some(group => !group.weight)) throw noRubric();
  }
  return { id: rule.id, scope: rule.scope, criteria, groups };
}

export function createReviewService(db: typeof prisma = prisma, storage: RecordingStorage = supabaseRecordingStorage, clock?: () => Date) {
  async function view(tx: Tx, attempt: Attempt, review: Review | null, editable: boolean) {
    const sections = await loadSections(tx, attempt);
    const content = await loadContent(tx, attempt, clock?.() ?? new Date());
    const selected = gradeSections(attempt, sections, content, review);
    const rubric = (review || editable) ? await loadRubric(tx, attempt, sections, selected, review) : null;
    const { versionRuleId, attemptRuleId, selectedScope, sectionId, examSkillId, canEdit, ratingPublished, mode, ...summary } = attempt;
    return { ...summary, editable, rubric, review, contentStatus: content.status,
      sections: selected, texts: content.texts.filter(text => selected.some(section => section.id === text.sectionId))
        .map(text => ({ ...text, wordCount: countWords(text.text) })),
      recordings: content.recordings.filter(recording => selected.some(section => section.id === recording.sectionId)) };
  }

  return {
    async teacherView(teacherId: string, requestId: string) {
      const attempt = await teacherAttempt(db, teacherId, requestId);
      if (attempt.status === 'ASSIGNED' && attempt.canEdit) return view(db, attempt, await savedReview(db, requestId), true);
      if (attempt.status === 'COMPLETED' && attempt.ratingPublished) return view(db, attempt, await savedReview(db, requestId, true), false);
      throw missing();
    },

    async learnerView(learnerId: string, attemptId: string) {
      const [attempt] = await db.$queryRaw<Attempt[]>`SELECT ${columns} FROM ${source}
        LEFT JOIN LATERAL (SELECT * FROM public.grading_requests r WHERE r.skill_attempt_id=k.id
          ORDER BY (r.status='COMPLETED') DESC,(r.status<>'CANCELLED') DESC,r.requested_at DESC,r.id DESC LIMIT 1) g ON true
        ${staffJoins}
        WHERE k.id=${attemptId}::uuid AND owner.id=${learnerId}::uuid AND owner.role='LEARNER' AND owner.status='ACTIVE'
          AND k.status='COMPLETED' AND e.skill IN ('WRITING','SPEAKING')`;
      if (!attempt) throw missing();
      const review = attempt.status === 'COMPLETED' && attempt.requestId ? await savedReview(db, attempt.requestId, true) : null;
      return view(db, { ...attempt, teacher: review ? attempt.teacher : null }, review, false);
    },

    async teacherAudio(teacherId: string, requestId: string, questionId: string) {
      const attempt = await teacherAttempt(db, teacherId, requestId);
      if (attempt.skill !== 'SPEAKING' || !(attempt.status === 'ASSIGNED' && attempt.canEdit || attempt.status === 'COMPLETED' && attempt.ratingPublished)) throw missing();
      const now = clock?.() ?? new Date();
      const status = effectiveContentStatus(attempt.contentStatus, attempt.expiresAt, now);
      if (status === 'EXPIRED' || status === 'DELETED') throw expired();
      const [row] = await db.$queryRaw<{ path: string; number: number; sectionId: string }[]>`SELECT s.audio_path AS path,e.order_no AS number,e.id AS "sectionId"
        FROM public.submission_contents s JOIN public.exam_sections e ON e.id=s.section_id
        WHERE s.skill_attempt_id=${attempt.attemptId}::uuid AND s.question_key=${questionId}
          AND e.exam_skill_id=${attempt.examSkillId}::uuid AND s.recording_status='UPLOADED' AND NULLIF(s.audio_path,'') IS NOT NULL`;
      const scoped = readWsSections(attempt.selectedScope);
      if (!row || (scoped && !scoped.includes(row.number)) || (!scoped && attempt.sectionId && row.sectionId !== attempt.sectionId)) throw missing();
      const ttl = status !== 'HELD' && attempt.expiresAt
        ? Math.min(DOWNLOAD_URL_TTL_SECONDS, Math.floor((+attempt.expiresAt - +now) / 1000)) : DOWNLOAD_URL_TTL_SECONDS;
      if (ttl <= 0) throw expired();
      return { url: await storage.createDownloadUrl(row.path, ttl) };
    },

    save(teacherId: string, requestId: string, input: ReviewInput, publish: boolean) {
      return db.$transaction(async tx => {
        await lockAccountWrites(tx);
        const attempt = await teacherAttempt(tx, teacherId, requestId, true);
        if (attempt.status === 'COMPLETED' && attempt.ratingPublished && publish) return savedReview(tx, requestId, true);
        if (attempt.status !== 'ASSIGNED' || attempt.contentStatus !== 'HELD') {
          throw new HttpError(409, 'GRADING_REQUEST_CHANGED', 'Bài này không còn ở trạng thái đang giao.');
        }
        if (!attempt.canEdit) throw new HttpError(403, 'FORBIDDEN', 'Bạn không còn quyền chấm kỹ năng này.');
        const old = await savedReview(tx, requestId);
        if (old?.status === 'PUBLISHED') throw new HttpError(409, 'GRADING_ALREADY_GRADED', 'Phiếu đã công bố.');
        const now = clock?.() ?? (await tx.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`)[0].now;
        const sections = await loadSections(tx, attempt);
        const content = await loadContent(tx, attempt, now);
        const rubric = await loadRubric(tx, attempt, sections, gradeSections(attempt, sections, content, old), old);
        const overall = calculateReview(rubric.criteria, rubric.groups, input.scores, publish);
        const [review] = await tx.$queryRaw<{ id: string }[]>`INSERT INTO public.grading_reviews
          (grading_request_id,teacher_id,grading_rule_id,status,overall_score,general_comment,updated_at,published_at)
          VALUES (${requestId}::uuid,${teacherId}::uuid,${rubric.id}::uuid,${publish ? 'PUBLISHED' : 'DRAFT'},
            ${overall}::numeric,${input.generalComment},${now}::timestamptz,${publish ? now : null}::timestamptz)
          ON CONFLICT (grading_request_id) DO UPDATE SET status=EXCLUDED.status,overall_score=EXCLUDED.overall_score,
            general_comment=EXCLUDED.general_comment,updated_at=EXCLUDED.updated_at,published_at=EXCLUDED.published_at
          RETURNING id`;
        await tx.$executeRaw`DELETE FROM public.grading_scores WHERE grading_review_id=${review.id}::uuid`;
        if (input.scores.length) {
          const rows = input.scores.map(score => Prisma.sql`(${review.id}::uuid,${score.criterionId}::uuid,
            ${score.sectionId ? 'SECTION' : 'FULL_SKILL'},${score.sectionId}::uuid,${score.score}::numeric,${score.comment ?? null})`);
          await tx.$executeRaw`INSERT INTO public.grading_scores(grading_review_id,criterion_id,assessment_scope,section_id,score,comment)
            VALUES ${Prisma.join(rows)}`;
        }
        if (publish) {
          await tx.$executeRaw`UPDATE public.grading_requests SET status='COMPLETED' WHERE id=${requestId}::uuid AND status='ASSIGNED'`;
          await tx.$executeRaw`UPDATE public.skill_attempts SET content_status='AVAILABLE',grading_rule_id=${rubric.id}::uuid,
            content_expires_at=${now}::timestamptz + (${CONTENT_RETENTION_DAYS} * interval '24 hours'),
            band_score=${rubric.scope === 'FULL_SKILL' ? overall : null}::numeric WHERE id=${attempt.attemptId}::uuid`;
          await revokeIfIdle(tx, teacherId, attempt.skill);
        }
        return savedReview(tx, requestId);
      }, { timeout: 10_000 });
    },
  };
}
