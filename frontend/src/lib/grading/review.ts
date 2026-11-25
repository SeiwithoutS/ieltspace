import { apiFetch } from '../shared/api';
import { gradingSkillName, type RequestStatus, type Skill } from './grading';
import { wsSectionsLabel } from '../learner/ws-history';
import type { DoneRecording } from '../../components/attempts/RecordingList';
import { compareRecordingIds, formatRecordingLength, recordingLabel } from '../attempts/recording-files';

export type GradingScore = { sectionId: string | null; criterionId: string; score: number; comment?: string | null };
export type GradingReview = {
  status: 'DRAFT' | 'PUBLISHED'; overall: number | null; generalComment: string | null;
  updatedAt: string; publishedAt: string | null; scores: GradingScore[];
};
type GradingSection = { id: string; number: number; prompt: string | null; instruction: string | null; questions: string[]; minWords: number | null };
type GradingRecording = { id: string; sectionId: string; number: number; durationMs: number | null };
export type ReviewDetails = {
  attemptId: string; requestId: string | null; title: string; skill: Skill; status: RequestStatus | null;
  editable: boolean; learner: string; teacher: string | null; contentStatus: string; expiresAt: string | null;
  completedAt: string | null; requestedAt: string | null; assignedAt: string | null; cancelledAt: string | null;
  cancelReason: string | null; creditType: 'FREE_WEEKLY' | 'BONUS' | null; review: GradingReview | null;
  sections: GradingSection[]; texts: { sectionId: string; number: number; text: string; wordCount: number }[];
  recordings: GradingRecording[];
  rubric: {
    scope: 'FULL_SKILL' | 'SECTION';
    criteria: { id: string; name: string; description: string | null; weight: number; minimum: number; maximum: number; step: number }[];
    groups: { sectionId: string | null; number: number | null; weight: number }[];
  } | null;
};

export const learnerResultPath = (id: string) => `ResultWS?attempt=${encodeURIComponent(id)}`;
const teacherRequest = (id: string) => `/teacher/grading/requests/${encodeURIComponent(id)}`;

export const getTeacherReview = (id: string) => apiFetch<ReviewDetails>(teacherRequest(id));
export const getLearnerReview = (id: string) => apiFetch<ReviewDetails>(`/learner/grading/results/${encodeURIComponent(id)}`);
export const getTeacherAudio = (id: string, question: string) => apiFetch<{ url: string }>(`${teacherRequest(id)}/recordings/${encodeURIComponent(question)}/url`);
export const saveTeacherReview = (id: string, publish: boolean, scores: GradingScore[], generalComment: string) =>
  apiFetch<GradingReview>(`${teacherRequest(id)}/${publish ? 'publish' : 'draft'}`, {
    method: publish ? 'POST' : 'PUT', json: { scores, generalComment },
  });

export function reviewScope(data: ReviewDetails) {
  const skill = gradingSkillName[data.skill];
  const scope = wsSectionsLabel(skill, data.sections.map(section => section.number));
  return scope ? `${skill} · ${scope}` : skill;
}
export const sectionLabel = (skill: Skill, number: number) => `${skill === 'WRITING' ? 'Task' : 'Part'} ${number}`;
export const initials = (name: string) => name.trim().split(/\s+/).slice(-2).map(word => word[0]).join('').toLocaleUpperCase('vi');
export const formatReviewDay = (date: string) => new Date(date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
export const hasReviewContent = (status: string) => status === 'HELD' || status === 'AVAILABLE';

export function reviewRecordings(items: GradingRecording[]): DoneRecording[] {
  return [...items].sort((a, b) => compareRecordingIds(a.id, b.id)).map(item => ({
    id: item.id, label: recordingLabel(item.id), length: formatRecordingLength(item.durationMs),
  }));
}
