import { useEffect, useState } from 'react';
import { apiFetch } from '../shared/api';
import type { QueueItem, Skill, TeacherLoad } from './grading';

export type TeacherQueueItem = QueueItem & { learner: string; hasDraft: boolean };
export type AssignmentSort = 'oldest' | 'newest';
export type TeacherAssignmentLoad = TeacherLoad & { lastAssignedAt: string | null };

export type HistoryPeriod = { days: number } | { from: string; to: string };
type HistoryRow = {
  id: string; learner: string; title: string; skill: Skill; sections: number[] | null;
  overall: number | null; publishedAt: string; expired: boolean; expiresAt: string | null;
};

const root = '/teacher/grading';
export function getTeacherQueue(page: number, skill: Skill | '', sort: AssignmentSort, search: string) {
  const query = new URLSearchParams({ page: String(page), sort });
  if (skill) query.set('skill', skill);
  if (search.trim()) query.set('q', search.trim());
  return apiFetch<{ items: TeacherQueueItem[]; total: number; nextPage: number | null; loads: TeacherAssignmentLoad[] }>(`${root}/requests?${query}`);
}

export function getTeacherOverview() {
  return apiFetch<{ items: TeacherQueueItem[]; assigned: number; drafts: number; publishedThisWeek: number;
    loads: TeacherAssignmentLoad[]; rubric: { skill: Skill; name: string; minimum: number; maximum: number; step: number }[] }>(`${root}/overview`);
}

export function getTeacherHistory(skill: Skill | '', period: HistoryPeriod, search: string) {
  const query = new URLSearchParams('days' in period ? { days: String(period.days) } : period);
  if (skill) query.set('skill', skill);
  if (search.trim()) query.set('q', search.trim());
  return apiFetch<{ items: HistoryRow[]; totals: { week: number; month: number; writing: number; speaking: number } }>(`${root}/history?${query}`);
}

export function useTeacherData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setState({});
    load().then(data => { if (active) setState({ data }); })
      .catch(error => { if (active) setState({ error: error instanceof Error ? error.message : 'Chưa tải được dữ liệu.' }); });
    return () => { active = false; };
  }, [load, revision]);
  return { ...state, retry: () => setRevision(value => value + 1) };
}

export function gradingCapacity(loads: TeacherAssignmentLoad[]) {
  const limits = loads.filter(load => load.status !== 'REVOKED' && load.maxPending !== null);
  return limits.length ? limits.reduce((sum, load) => sum + (load.maxPending ?? 0), 0) : null;
}

export function waitingTime(assignedAt: string | null, now: number) {
  if (!assignedAt) return '—';
  const minutes = Math.max(0, Math.floor((now - Date.parse(assignedAt)) / 60_000));
  if (minutes >= 1440) return `${Math.floor(minutes / 1440)} ngày`;
  if (minutes >= 60) return `${Math.floor(minutes / 60)} giờ`;
  return minutes > 0 ? `${minutes} phút` : 'Dưới 1 phút';
}
