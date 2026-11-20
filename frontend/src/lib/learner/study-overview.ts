import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../shared/api';
import type { GoalValues } from '../auth/study-goals';

export const skillNames = { LISTENING: 'Listening', READING: 'Reading', WRITING: 'Writing', SPEAKING: 'Speaking' } as const;
export type LearnerSkill = keyof typeof skillNames;
export type ResultKind = 'all' | 'band' | 'practice';
export const resultGroups = { LR: ['LISTENING', 'READING'], WS: ['WRITING', 'SPEAKING'] } as const;
export type ResultGroup = keyof typeof resultGroups;
export type DashboardRange = 7 | 30;
export type LearnerDashboard = {
  practice: number;
  flashcards: number;
  reviewedWords: number;
  days: { date: string; practice: number; flashcards: number }[];
  skills: Partial<Record<LearnerSkill, number>>;
};

export type LearnerActivityCalendar = {
  startDate: string;
  endDate: string;
  years: number[];
  days: LearnerDashboard['days'];
};

export type LearningProgress = {
  today: string;
  nextDayAt: string;
  goal: GoalValues | null;
  todaySessions: number;
  currentStreak: number;
  longestStreak: number;
  checkedInToday: boolean;
  checkInDays: { date: string; checkedIn: boolean }[];
  flashcards: { sessions: number; reviewedWords: number; forgottenWords: number };
};

export type StudyResult = {
  id: string;
  title: string;
  completedAt: string;
  skill: LearnerSkill;
  form: 'ACADEMIC' | 'GENERAL' | null;
  scope: 'FULL_EXAM' | 'FULL_SKILL' | 'SECTION' | 'QUESTION_GROUP';
  band: number | null;
  accuracy: number | null;
  correct: number | null;
  total: number | null;
};

export function getStudyDashboard(days: DashboardRange) {
  return apiFetch<LearnerDashboard>(`/learner/dashboard?days=${days}`);
}

export function getStudyActivityCalendar(year?: number) {
  return apiFetch<LearnerActivityCalendar>(year === undefined ? '/learner/activity-calendar' : `/learner/activity-calendar?year=${year}`);
}

type ResultFilters = { kind: ResultKind; skill?: LearnerSkill; group?: ResultGroup; limit: number };

export function getStudyResults(filters: ResultFilters & { before?: string }) {
  const params = new URLSearchParams({ kind: filters.kind, limit: String(filters.limit) });
  if (filters.skill) params.set('skill', filters.skill);
  if (filters.group) params.set('group', filters.group);
  if (filters.before) params.set('before', filters.before);
  return apiFetch<{ items: StudyResult[]; nextCursor: string | null }>(`/learner/results?${params}`);
}

export function useStudyResults({ kind, skill, group, limit }: ResultFilters, preview: boolean) {
  const [items, setItems] = useState<StudyResult[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [request, setRequest] = useState<{ before?: string }>({});
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preview) return;
    let active = true;
    setLoading(true);
    setError('');
    void getStudyResults({ kind, skill, group, limit, before: request.before }).then(result => {
      if (!active) return;
      setItems(current => request.before ? [...current, ...result.items] : result.items);
      setNext(result.nextCursor);
    }).catch(() => { if (active) setError('Chưa tải được lịch sử kết quả.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [request, kind, skill, group, limit, preview]);

  return { items, loading, error, next,
    retry: () => setRequest(current => ({ ...current })),
    loadMore: () => { if (next && !loading) setRequest({ before: next }); },
  };
}

export function useLearningProgress(userId: string) {
  const [state, setState] = useState<{ data: LearningProgress | null; error: string }>({ data: null, error: '' });
  const [revision, setRevision] = useState(0);
  const readVersion = useRef(0);
  const scheduleNext = useRef<(data: LearningProgress) => void>();

  useEffect(() => {
    if (!userId) return;
    let active = true;
    let pending = false;
    let timer: number | undefined;
    async function load() {
      if (pending) return;
      pending = true;
      const version = ++readVersion.current;
      try {
        const data = await apiFetch<LearningProgress>('/learner/progress');
        if (!active || version !== readVersion.current) return;
        setState({ data, error: '' });
        schedule(data);
      } catch {
        if (active && version === readVersion.current) setState({ data: null, error: 'Chưa tải được tiến độ học.' });
      } finally { pending = false; }
    }
    function schedule(data: LearningProgress) {
      window.clearTimeout(timer);
      // Use the server's remaining Vietnam calendar day rather than the device's time zone.
      const delay = Date.parse(data.nextDayAt) - Date.now();
      timer = window.setTimeout(load, Math.min(86_400_000, Math.max(30_000, delay + 1000)));
    }
    scheduleNext.current = schedule;
    function onVisible() { if (document.visibilityState === 'visible') void load(); }
    void load();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      scheduleNext.current = undefined;
      window.clearTimeout(timer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, revision]);

  async function checkIn() {
    const data = await apiFetch<LearningProgress>('/learner/check-in', { method: 'POST', json: { ownerId: userId } });
    readVersion.current++;
    setState({ data, error: '' });
    scheduleNext.current?.(data);
  }

  return { ...state, checkIn, retry: () => { setState({ data: null, error: '' }); setRevision(value => value + 1); } };
}
