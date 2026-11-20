import { prisma } from '../lib/prisma.js';
import { runNotificationDispatch } from './notification-dispatch.js';

try {
  await runNotificationDispatch();
} catch {
  console.error('Notification dispatch failed. Pending items remain queued.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
