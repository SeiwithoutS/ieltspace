import { useEffect, useState } from 'react';
import { apiFetch } from '../shared/api';

export type Skill = 'WRITING' | 'SPEAKING';
export type RequestStatus = 'WAITING_ASSIGNMENT' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
export type GradingRequest = { id: string; status: RequestStatus; assignmentDeadline: string; cancelReason: string | null };
export type Credits = Record<'free' | 'bonus', { count: number; expiresAt: string | null }>;
export type QueueItem = GradingRequest & {
  skill: Skill; title: string; sections: number[] | null; requestedAt: string; assignedAt: string | null;
  teacherName: string | null; cancelledAt: string | null; bonusExpiresAt: string | null;
};
export type TeacherLoad = {
  teacherId: string; name: string; skill: Skill; accountStatus: string; status: 'ACTIVE' | 'PENDING_REVOKE' | 'REVOKED';
  accepting: boolean; maxPending: number | null; assigned: number;
};
type Page<T> = { items: T[]; nextPage: number | null };
export type PermissionInput = { canGrade: boolean; isAccepting: boolean; maxPending: number };

export const gradingSkillName = { WRITING: 'Writing', SPEAKING: 'Speaking' } as const;
export const gradingStatusName = { WAITING_ASSIGNMENT: 'Chờ phân công', ASSIGNED: 'Đang chấm',
  COMPLETED: 'Đã có kết quả', CANCELLED: 'Đã hủy' } as const;
const reasons: Record<string, string> = { ASSIGNMENT_TIMEOUT: 'Quá 72 giờ chưa có giáo viên',
  TEACHER_UNAVAILABLE: 'Giáo viên không thể hoàn thành', LEARNER_DELETED: 'Tài khoản người học đã bị xóa' };
export const cancellationText = (reason?: string | null) => reason ? reasons[reason] ?? 'Yêu cầu đã hủy' : 'Yêu cầu đã hủy';
const dateTime = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' });
export const formatGradingDate = (date: string) => dateTime.format(new Date(date));

export function useGradingBalance(enabled: boolean) {
  const [credits, setCredits] = useState<Credits>();
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    apiFetch<Credits>('/learner/grading/credits').then(value => {
      if (!active) return;
      setCredits(value);
      setError('');
    }).catch(() => {
      if (active) setError('Chưa cập nhật được số lượt chấm.');
    });
    return () => { active = false; };
  }, [enabled, version]);
  return { credits, error, reload: () => setVersion(value => value + 1) };
}

const teacherRoot = (id: string) => `/admin/grading/teachers/${encodeURIComponent(id)}`;
export const getTeacherWork = (id: string, page: number) => apiFetch<Page<QueueItem> & { skills: TeacherLoad[] }>(`${teacherRoot(id)}?page=${page}`);
export const saveTeacherPermission = (id: string, skill: Skill, input: PermissionInput) =>
  apiFetch<TeacherLoad>(`${teacherRoot(id)}/permissions/${skill}`, { method: 'PUT', json: input });
export const cancelTeacherWork = (id: string, requestId: string, reason: string) =>
  apiFetch<{ cancelled: boolean }>(`${teacherRoot(id)}/requests/${encodeURIComponent(requestId)}/cancel`, { method: 'POST', json: { reason } });
export const getAdminQueue = (status: Exclude<RequestStatus, 'COMPLETED'>, page: number) =>
  apiFetch<Page<QueueItem>>(`/admin/grading/requests?status=${status}&page=${page}`);
export const getAdminTeacherLoads = (page: number) => apiFetch<Page<TeacherLoad>>(`/admin/grading/teachers?page=${page}`);
