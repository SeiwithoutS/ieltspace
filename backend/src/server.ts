import { app } from './app.js';
import { env } from './config/env.js';
import { env as settings } from './config.js';
import { runNotificationDispatch } from './jobs/notification-dispatch.js';
import { startAttemptCleanupWorker } from './jobs/attempt-cleanup.js';
import { startSampleMediaCleanupWorker } from './jobs/sample-media-cleanup.js';
import { startVocabularyImageCleanupWorker } from './jobs/vocabulary-image-cleanup.js';
import { runGradingDispatch } from './jobs/grading-dispatch.js';
let dispatching = false;
let gradingDispatch: Promise<void> | undefined;
function grade() {
  if (closing || gradingDispatch) return;
  gradingDispatch = runGradingDispatch().catch(() => console.error('Grading dispatch could not finish. The worker will retry.'))
    .finally(() => { gradingDispatch = undefined; });
}
async function dispatch() {
  if (dispatching || closing) return;
  dispatching = true;
  try { await runNotificationDispatch(); }
  catch { console.error('Notification dispatch failed. Pending items remain queued.'); }
  finally { dispatching = false; }
}
let closing = false;
let stopAttemptCleanup: ReturnType<typeof startAttemptCleanupWorker> | undefined;
let stopSampleMediaCleanup: ReturnType<typeof startSampleMediaCleanupWorker> | undefined;
let stopVocabularyImageCleanup: ReturnType<typeof startVocabularyImageCleanupWorker> | undefined;
const server = app.listen(env.port, () => {
  console.log(`Backend: http://localhost:${env.port}/api`);
  if (settings.NOTIFICATION_WORKER_ENABLED) void dispatch();
  if (settings.GRADING_WORKER_ENABLED) grade();
  if (settings.ATTEMPT_CLEANUP_WORKER_ENABLED && !closing) stopAttemptCleanup = startAttemptCleanupWorker();
  if (settings.SAMPLE_MEDIA_CLEANUP_WORKER_ENABLED && !closing) stopSampleMediaCleanup = startSampleMediaCleanupWorker();
  if (settings.VOCABULARY_IMAGE_CLEANUP_WORKER_ENABLED && !closing) stopVocabularyImageCleanup = startVocabularyImageCleanupWorker();
});
const dispatchTimer = settings.NOTIFICATION_WORKER_ENABLED ? setInterval(() => void dispatch(), 30_000).unref() : undefined;
const gradingTimer = settings.GRADING_WORKER_ENABLED ? setInterval(grade, 30_000).unref() : undefined;
const shutdown = () => {
  if (closing) return;
  closing = true;
  clearInterval(dispatchTimer);
  clearInterval(gradingTimer);
  server.close(() => {
    void Promise.allSettled([
      stopAttemptCleanup?.(), stopSampleMediaCleanup?.(), stopVocabularyImageCleanup?.(), gradingDispatch,
    ]).then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
