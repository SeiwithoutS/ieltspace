import { apiFetch } from '../shared/api';

export type AdminStatistics = {
  from: string;
  to: string;
  measuredAt: string;
  accountsTotal: number;
  accountsActive: number;
  accountsLocked: number;
  accountsNew: number;
  usersSignedIn: number;
  loginHistoryFrom: string | null;
  accountLocks: number;
  flashcardSessions: number;
  flashcardLearners: number;
  dailyFlashcards: { day: string; sessions: number }[];
  supportReports: number | null;
};

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function vietnamToday() {
  const parts = dayFormatter.formatToParts(new Date());
  const part = (name: 'year' | 'month' | 'day') => Number(parts.find(({ type }) => type === name)?.value);
  return Date.UTC(part('year'), part('month') - 1, part('day'));
}

export function dashboardDate(day: number) {
  return new Date(day).toISOString().slice(0, 10);
}

export function getAdminStatistics(from: number, to: number) {
  const query = new URLSearchParams({ from: dashboardDate(from), to: dashboardDate(to) });
  return apiFetch<AdminStatistics>(`/admin/statistics?${query}`);
}
