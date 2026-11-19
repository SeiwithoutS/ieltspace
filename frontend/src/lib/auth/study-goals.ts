import { apiFetch } from '../shared/api';

export type GoalValues = {
  overall: number | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  dailySessions: number;
};

export type StudyGoal = GoalValues & { id: string; effectiveFrom: string };
type GoalHistory = { current: StudyGoal | null; history: StudyGoal[] };

export function getStudyGoals() {
  return apiFetch<GoalHistory>('/learner/goals');
}

export function saveStudyGoal(values: GoalValues) {
  return apiFetch<GoalHistory>('/learner/goals', { method: 'POST', json: values });
}
