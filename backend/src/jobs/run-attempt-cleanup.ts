import { prisma } from '../lib/prisma.js';
import { createAttemptsRepository } from '../modules/attempts/attempts.repository.js';
import { runAttemptCleanup } from './attempt-cleanup.js';

// Dọn bài Writing/Speaking hết hạn và lượt bỏ dở. Thêm --apply để xóa thật.
const args = process.argv.slice(2);
try {
  if (args.length > 1 || (args.length === 1 && args[0] !== '--apply')) throw new Error('Invalid options');
  if (args[0] === '--apply') {
    const result = await runAttemptCleanup();
    console.log(JSON.stringify({ mode: 'apply', ...result }));
    if (result.failed) process.exitCode = 1;
  } else {
    const now = new Date();
    const expired = await createAttemptsRepository(prisma).listExpiredContent(now, 100);
    console.log(JSON.stringify({ mode: 'preview', expired: expired.length }));
  }
} catch {
  console.error('Attempt cleanup could not finish. Check configuration and retry.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
