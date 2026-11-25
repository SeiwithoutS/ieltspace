import type { Prisma } from '@prisma/client';

export async function lockAccountWrites(tx: Prisma.TransactionClient) {
  await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended('ieltspace:admin-accounts', 0))`;
}
