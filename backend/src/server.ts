import { app } from './app.js';
import { env } from './config/env.js';
import { env as settings } from './config.js';
import { runNotificationDispatch } from './jobs/notification-dispatch.js';
let dispatching = false;
async function dispatch() {
  if (dispatching || closing) return;
  dispatching = true;
  try { await runNotificationDispatch(); }
  catch { console.error('Notification dispatch failed. Pending items remain queued.'); }
  finally { dispatching = false; }
}
let closing = false;
const server = app.listen(env.port, () => {
  console.log(`Backend: http://localhost:${env.port}/api`);
  if (settings.NOTIFICATION_WORKER_ENABLED) void dispatch();
});
const dispatchTimer = settings.NOTIFICATION_WORKER_ENABLED ? setInterval(() => void dispatch(), 30_000).unref() : undefined;
const shutdown = () => {
  if (closing) return;
  closing = true;
  clearInterval(dispatchTimer);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
