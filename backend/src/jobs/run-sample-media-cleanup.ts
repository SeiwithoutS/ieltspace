import { prisma } from '../lib/prisma.js';
import { cleanupSampleMedia } from '../modules/samples/sample-assets.service.js';

const args = process.argv.slice(2);
try {
  if (args.length > 1 || (args.length === 1 && args[0] !== '--apply')) {
    throw new Error('Invalid options');
  }
  const apply = args[0] === '--apply';
  const result = await cleanupSampleMedia(prisma, apply);
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', ...result }));
  if (result.failed) process.exitCode = 1;
} catch {
  console.error('Sample media cleanup could not finish. Check configuration and retry.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
