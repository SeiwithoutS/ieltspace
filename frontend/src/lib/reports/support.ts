import { apiFetch } from '../shared/api';

export const supportStatuses = {
  PENDING: 'Chờ tiếp nhận',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
} as const;

export type SupportStatus = keyof typeof supportStatuses;
export type SupportReport = {
  id: string;
  text: string;
  status: SupportStatus;
  reply: string | null;
  revision: number;
  createdAt?: string;
  owner?: string;
  ownerEmail?: string | null;
};
export type SupportPage = {
  items: SupportReport[];
  nextCursor: string | null;
  counts?: Partial<Record<SupportStatus, number>>;
};

const personal = '/support/reports';
const staff = '/admin/support/reports';

export function listSupportReports(admin: boolean, status: SupportStatus | '', after?: string) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (after) query.set('after', after);
  const search = query.toString();
  return apiFetch<SupportPage>((admin ? staff : personal) + (search ? '?' + search : ''));
}

export function getSupportReport(id: string) {
  return apiFetch<SupportReport>(`${personal}/${encodeURIComponent(id)}`);
}

export function createSupportReport(text: string, requestId: string) {
  return apiFetch<SupportReport>(personal, { method: 'POST', json: { text, requestId } });
}

export function updateSupportReport(id: string, status: SupportStatus, reply: string, revision: number) {
  return apiFetch<SupportReport>(`${staff}/${encodeURIComponent(id)}`, { method: 'PATCH', json: { status, reply, revision } });
}
