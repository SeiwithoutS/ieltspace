import { apiFetch } from '../shared/api';

export const userRoles = {
  LEARNER: 'Người học',
  TEACHER: 'Giáo viên',
  ADMIN: 'Quản lý',
};

export const userStatuses = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Bị khóa',
  DELETED: 'Đã xóa',
  INVITED: 'Chờ kích hoạt',
};

export type UserRole = keyof typeof userRoles;
export type UserStatus = keyof typeof userStatuses;
type RegistrationSource = 'EMAIL' | 'GOOGLE' | 'INVITE';

export type DirectoryFilters = {
  q: string;
  role: UserRole | '';
  status: UserStatus | '';
  page: number;
};

type DirectoryUser = {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

export type UserDirectory = {
  items: DirectoryUser[];
  page: number;
  pageSize: number;
  total: number;
  counts: {
    all: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
  };
};

export type UserDetails = DirectoryUser & {
  auth: {
    state: 'available';
    email: string | null;
    emailVerified: boolean | null;
    source: RegistrationSource | null;
    lastSignInAt: string | null;
  } | { state: 'missing' | 'unavailable' };
  avatar: { url: string | null; unavailable: boolean };
  cleanupPending: boolean;
};

export function listUsers({ q, role, status, page }: DirectoryFilters) {
  const params = new URLSearchParams({ page: String(page) });
  if (q.trim()) params.set('q', q.trim());
  if (role) params.set('role', role);
  if (status) params.set('status', status);
  return apiFetch<UserDirectory>(`/admin/users?${params}`);
}

export function getUserDetails(id: string) {
  return apiFetch<UserDetails>(`/admin/users/${encodeURIComponent(id)}`);
}

export type LoginEvent = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  role: UserRole;
  method: 'PASSWORD' | 'GOOGLE';
  at: string;
};

export type AccountAudit = {
  id: string;
  actorName: string | null;
  action: 'USER_ROLE_CHANGED' | 'USER_LOCKED' | 'USER_UNLOCKED' | 'USER_DELETED' | 'USER_INVITED' | 'USER_INVITE_REISSUED' | 'USER_INVITE_ACCEPTED';
  before: string | null;
  after: string | null;
  reason: string | null;
  at: string;
};

export type HistoryPage<T> = { items: T[]; nextPage: number | null };

export function getUserActivity(role: UserRole | '', page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (role) params.set('role', role);
  return apiFetch<HistoryPage<LoginEvent>>(`/admin/users/activity?${params}`);
}

export function getAccountHistory(id: string, kind: 'login' | 'admin', page: number) {
  return apiFetch<HistoryPage<LoginEvent | AccountAudit>>(`/admin/users/${encodeURIComponent(id)}/history?kind=${kind}&page=${page}`);
}

type MutableStatus = 'ACTIVE' | 'LOCKED';
export type AccountAction = { previousRole: UserRole; previousStatus: Exclude<UserStatus, 'DELETED'>; reason: string } &
  ({ kind: 'role'; role: UserRole } | { kind: 'status'; status: MutableStatus } | { kind: 'delete' });
export type StaffInvitation = { fullName: string; email: string } &
  ({ role: 'ADMIN' } | { role: 'TEACHER'; maxPending: number; writing: boolean; speaking: boolean });
type SecurityCode = { id: string; code: string };

export function requestAccountCode(userId: string, action: AccountAction) {
  return apiFetch<{ id: string; expiresInSeconds: number }>(`/admin/users/${encodeURIComponent(userId)}/security-code`, {
    method: 'POST', json: action,
  });
}

export function applyAccountAction(userId: string, action: AccountAction, securityCode?: SecurityCode) {
  const path = `/admin/users/${encodeURIComponent(userId)}`;
  return apiFetch<{ id: string; role: UserRole; status: UserStatus; changed: boolean; cleanup?: 'PENDING' | 'COMPLETE' }>(
    action.kind === 'delete' ? path : `${path}/${action.kind}`,
    { method: action.kind === 'delete' ? 'DELETE' : 'PATCH', json: { action, securityCode } },
  );
}

export function retryAccountDeletion(userId: string) {
  return apiFetch<{ cleanup: 'PENDING' | 'COMPLETE' }>(`/admin/users/${encodeURIComponent(userId)}/deletion-retry`, { method: 'POST' });
}

export function sendStaffInvitation(invitation: StaffInvitation, securityCode?: SecurityCode) {
  return apiFetch<{ id: string; status: 'INVITED' }>('/admin/users/invitations', { method: 'POST', json: { invitation, securityCode } });
}

export function requestInvitationCode(invitation: StaffInvitation) {
  return apiFetch<{ id: string; expiresInSeconds: number }>('/admin/users/invitations/security-code', { method: 'POST', json: invitation });
}
