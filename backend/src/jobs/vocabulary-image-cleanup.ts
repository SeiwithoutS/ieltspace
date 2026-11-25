import { prisma } from '../lib/prisma.js';
import { pruneVocabularyImages } from '../modules/vocabulary/image-assets.js';
import { startCleanupWorker } from './cleanup-worker.js';

export function startVocabularyImageCleanupWorker(intervalMs = 3_600_000) {
  return startCleanupWorker(async () => {
    const { pending } = await pruneVocabularyImages(prisma);
    return { failed: pending };
  }, intervalMs, 'Vocabulary image cleanup');
}
