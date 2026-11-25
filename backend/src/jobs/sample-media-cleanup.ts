import { prisma } from '../lib/prisma.js';
import { cleanupSampleMedia } from '../modules/samples/sample-assets.service.js';
import { startCleanupWorker } from './cleanup-worker.js';

export function startSampleMediaCleanupWorker(run = () => cleanupSampleMedia(prisma, true), intervalMs = 86_400_000) {
  return startCleanupWorker(run, intervalMs, 'Sample media cleanup');
}
