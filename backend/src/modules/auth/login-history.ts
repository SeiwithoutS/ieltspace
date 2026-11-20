import { createHash } from 'node:crypto';
import { decodeJwt } from 'jose';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';

const uuid = z.string().uuid();

export async function recordLogin(userId: string, accessToken: string, method: 'PASSWORD' | 'GOOGLE') {
  try {
    // The token comes from the successful Supabase exchange, never from request input.
    const session = uuid.parse(decodeJwt(accessToken).session_id);
    const digest = createHash('sha256').update(session).digest('hex');
    await prisma.$executeRaw`
      INSERT INTO public.user_login_events (user_id, method, session_digest)
      VALUES (${userId}::uuid, ${method}, ${digest})
      ON CONFLICT (session_digest) DO NOTHING
    `;
  } catch {
    // Preserve authentication availability during a logging outage. Never log a token or identity.
    console.error('Application login event could not be recorded.');
  }
}
