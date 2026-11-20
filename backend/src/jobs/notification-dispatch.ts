import { dispatchAnnouncement } from '../modules/notifications/announcements.js';
import { dispatchExpiryReminders } from '../modules/notifications/grading-notifications.js';

export async function runNotificationDispatch() {
  async function sendDueAnnouncements() {
    for (let batch = 0; batch < 20; batch++) {
      if (!await dispatchAnnouncement()) break;
    }
  }
  const results = await Promise.allSettled([sendDueAnnouncements(), dispatchExpiryReminders()]);
  const failures = results.flatMap(result => result.status === 'rejected' ? [result.reason] : []);
  if (failures.length) throw new AggregateError(failures, 'Notification dispatch failed');
}
