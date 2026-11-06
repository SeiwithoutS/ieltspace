// Read-only diagnostic; outputs counts, never credentials or user emails.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const client = new PrismaClient();
try {
 const url = new URL(process.env.SUPABASE_URL);
 const db = new URL(process.env.DATABASE_URL);
 const ref = url.hostname.split('.')[0];
 console.log('auth_database_project_match:', db.hostname.includes(ref) || decodeURIComponent(db.username).endsWith('.'+ref));
 const counts = await client.$queryRaw`select count(*)::int as profiles, count(a.id)::int as linked_auth_users from public.users u left join auth.users a on a.id=u.auth_user_id`;
 console.log(JSON.stringify(counts));
} catch (error) {
 console.log('diagnostic_failed:', error.code || error.name);
 process.exitCode = 1;
} finally { await client.$disconnect(); }
