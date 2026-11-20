import { useEffect, useSyncExternalStore } from 'react';
import { getAuthUser, useAuth } from '../auth/auth';
import { apiFetch } from '../shared/api';

export type Notification = {
  id: string;
  type: string;
  title: string;
  content: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
  readAt: string | null;
};

export type NotificationPage = { items: Notification[]; nextCursor: string | null };

export function listNotifications(unreadOnly: boolean, after?: string) {
  const query = new URLSearchParams();
  if (unreadOnly) query.set('unread', '1');
  if (after) query.set('after', after);
  const search = query.toString();
  return apiFetch<NotificationPage>('/notifications' + (search ? '?' + search : ''));
}

export async function markNotificationRead(id: string) {
  await apiFetch(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
  await refreshNotificationCount(true);
}

export async function markAllNotificationsRead() {
  await apiFetch('/notifications/read-all', { method: 'POST' });
  await refreshNotificationCount(true);
}

const subscribers = new Set<() => void>();
let count: { userId: string; unread: number } | undefined;
let activeRequest: { userId: string; pending: Promise<void> } | undefined;
let timer: number | undefined;

function refreshNotificationCount(force = false): Promise<void> {
  const userId = getAuthUser()?.id;
  if (!userId) {
    count = undefined;
    activeRequest = undefined;
    return Promise.resolve();
  }
  if (!force && activeRequest?.userId === userId) return activeRequest.pending;
  const pending = apiFetch<{ unread: number }>('/notifications/unread-count')
    .then(result => {
      if (activeRequest?.pending !== pending || getAuthUser()?.id !== userId) return;
      if (count?.userId === userId && count.unread === result.unread) return;
      count = { userId, unread: result.unread };
      subscribers.forEach(listener => listener());
    })
    .catch(() => { /* Keep the last counter while offline. */ })
    .finally(() => { if (activeRequest?.pending === pending) activeRequest = undefined; });
  activeRequest = { userId, pending };
  return pending;
}

function refreshWhileVisible() {
  if (document.visibilityState === 'visible') void refreshNotificationCount();
}

function subscribe(listener: () => void) {
  subscribers.add(listener);
  if (subscribers.size === 1) {
    timer = window.setInterval(refreshWhileVisible, 30_000);
    document.addEventListener('visibilitychange', refreshWhileVisible);
  }
  return () => {
    subscribers.delete(listener);
    if (subscribers.size === 0) {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshWhileVisible);
    }
  };
}

export function useNotificationCount() {
  const userId = useAuth().user?.id;
  useEffect(() => { void refreshNotificationCount(); }, [userId]);
  return useSyncExternalStore(subscribe, () => userId && count?.userId === userId ? count.unread : undefined);
}
