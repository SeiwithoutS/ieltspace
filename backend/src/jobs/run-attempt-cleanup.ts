import { prisma } from '../lib/prisma.js';
import { supabaseRecordingStorage } from '../integrations/storage/recording-storage.js';
import { createAttemptsRepository } from '../modules/attempts/attempts.repository.js';
import { cleanupAttemptContent } from '../modules/attempts/attempts.service.js';

// Dọn bản ghi Speaking hết hạn 14 ngày và lượt bỏ dở. Mặc định chỉ xem trước; thêm --apply để xóa thật.
// Chưa gắn lịch chạy: gọi bằng `npm run attempts:cleanup -- --apply` (cron/Scheduled job do người triển khai đặt).
const args = process.argv.slice(2);
try {
  if (args.length > 1 || (args.length === 1 && args[0] !== '--apply')) throw new Error('Invalid options');
  const repo = createAttemptsRepository(prisma);
  if (args[0] === '--apply') {
    const result = await cleanupAttemptContent({ repo, storage: supabaseRecordingStorage });
    console.log(JSON.stringify({ mode: 'apply', ...result }));
    if (result.failed) process.exitCode = 1;
  } else {
    const now = new Date();
    const expired = await repo.listExpiredContent(now, 100);
    console.log(JSON.stringify({ mode: 'preview', expired: expired.length }));
  }
} catch {
  console.error('Attempt cleanup could not finish. Check configuration and retry.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
