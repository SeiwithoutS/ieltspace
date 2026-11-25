import { z } from 'zod';
import { HttpError } from '../../utils/http.js';

const id = z.string().uuid();
export const reviewInput = z.object({
  generalComment: z.string().max(8000),
  scores: z.array(z.object({ criterionId: id, sectionId: id.nullable(), score: z.number().min(0).max(9),
    comment: z.string().max(3000).nullish() }).strict()).max(60),
}).strict();

export type ReviewInput = z.infer<typeof reviewInput>;
export type Score = ReviewInput['scores'][number];
export type Criterion = { id: string; name: string; description: string | null; weight: number; minimum: number; maximum: number; step: number };
export type ScoreGroup = { sectionId: string | null; number: number | null; weight: number };

export const aggregationSchema = z.object({ criteria: z.literal('MEAN'),
  tasks: z.array(z.object({ order: z.number().int().positive(), weight: z.number().positive() })).optional(),
  parts: z.literal('WHOLE_SKILL').optional(),
});
export const roundingSchema = z.object({ overall: z.literal('IELTS_HALF_BAND'), criteria_step: z.number().positive().optional() });

export function calculateReview(criteria: Criterion[], groups: ScoreGroup[], scores: Score[], publish: boolean) {
  const key = (sectionId: string | null, criterionId: string) => (sectionId ?? '') + ':' + criterionId;
  const allowed = new Map(groups.flatMap(group => criteria.map(item => [key(group.sectionId, item.id), item] as const)));
  const values = new Map<string, number>();
  for (const score of scores) {
    const field = key(score.sectionId, score.criterionId);
    const item = allowed.get(field);
    if (!item || values.has(field)) throw new HttpError(400, 'RUBRIC_SCORE_INVALID', 'Điểm bị trùng hoặc không thuộc phiếu chấm.');
    const steps = (score.score - item.minimum) / item.step;
    if (score.score < item.minimum || score.score > item.maximum || Math.abs(steps - Math.round(steps)) > 1e-8) {
      throw new HttpError(400, 'RUBRIC_SCORE_INVALID', `Điểm ${item.name} phải từ ${item.minimum} đến ${item.maximum}, theo bước ${item.step}.`);
    }
    values.set(field, score.score);
  }
  if (values.size !== allowed.size) {
    if (publish) throw new HttpError(400, 'RUBRIC_SCORE_REQUIRED', 'Hãy nhập đủ điểm tiêu chí trước khi công bố.');
    return null;
  }
  const criterionWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
  const groupWeight = groups.reduce((sum, group) => sum + group.weight, 0);
  const weighted = groups.reduce((sum, group) => sum + group.weight * criteria.reduce((total, item) =>
    total + values.get(key(group.sectionId, item.id))! * item.weight, 0) / criterionWeight, 0);
  return Math.round((weighted / groupWeight + Number.EPSILON) * 2) / 2;
}
