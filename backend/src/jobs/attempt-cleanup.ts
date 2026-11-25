import { prisma } from '../lib/prisma.js';
import { supabaseRecordingStorage } from '../integrations/storage/recording-storage.js';
import { createAttemptsRepository } from '../modules/attempts/attempts.repository.js';
import { cleanupAttemptContent } from '../modules/attempts/attempts.service.js';
import { startCleanupWorker } from './cleanup-worker.js';

export function runAttemptCleanup() {
  return cleanupAttemptContent({ repo: createAttemptsRepository(prisma), storage: supabaseRecordingStorage });
}

/** Chạy lúc khởi động và mỗi giờ. Mỗi tiến trình chỉ xử lý một lượt dọn tại một thời điểm. */
export function startAttemptCleanupWorker(run = runAttemptCleanup, intervalMs = 3_600_000) {
  return startCleanupWorker(run, intervalMs, 'Attempt cleanup');
}
