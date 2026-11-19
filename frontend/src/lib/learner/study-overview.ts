import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../shared/api';
import type { GoalValues } from '../auth/study-goals';

export const skillNames = { LISTENING: 'Listening', READING: 'Reading', WRITING: 'Writing', SPEAKING: 'Speaking' } as const;
export type LearnerSkill = keyof typeof skillNames;
export type ResultKind = 'all' | 'band' | 'practice';

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

export function getStudyResults(filters: { kind: ResultKind; skill?: LearnerSkill; limit: number; before?: string }) {
  const params = new URLSearchParams({ kind: filters.kind, limit: String(filters.limit) });
  if (filters.skill) params.set('skill', filters.skill);
  if (filters.before) params.set('before', filters.before);
  return apiFetch<{ items: StudyResult[]; nextCursor: string | null }>(`/learner/results?${params}`);
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
