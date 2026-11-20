import type { RequestHandler } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config.js";
import { prisma } from "../lib/prisma.js";
import { createAuthClient } from "../lib/supabase.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { recordAuthTiming } from "./server-timing.js";

export type AppUser = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  must_change_password: boolean;
};

declare global {
  namespace Express {
    interface Request {
      appUser?: AppUser;
      accessToken?: string;
    }
  }
}

export const userSelect = {
  id: true,
  auth_user_id: true,
  full_name: true,
  display_name: true,
  email: true,
  avatar_url: true,
  role: true,
  status: true,
} as const;

// In-memory user profile cache (TTL 60 seconds, max 1000 items)
type CachedProfile = {
  user: AppUser;
  expires: number;
};

const userProfileCache = new Map<string, CachedProfile>();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL_MS = 60_000;
let cacheRevision = 0;

export function invalidateUserCache(authUserId: string): void {
  cacheRevision++;
  userProfileCache.delete(authUserId);
}

export function clearUserCache(): void {
  cacheRevision++;
  userProfileCache.clear();
}

export function getUserCacheSize(): number {
  return userProfileCache.size;
}

export async function findActiveUser(authUserId: string, fresh = false): Promise<AppUser> {
  const now = Date.now();
  const revision = cacheRevision;
  const cached = fresh ? undefined : userProfileCache.get(authUserId);
  if (cached && cached.expires > now) {
    return cached.user;
  }

  // Read the reminder from the row so existing accounts can sign in before migration 24.
  const [user] = await prisma.$queryRaw<AppUser[]>`
    SELECT account.id, account.auth_user_id, account.full_name, account.display_name,
      account.email, account.avatar_url, account.role, account.status,
      COALESCE((to_jsonb(account) ->> 'must_change_password')::boolean, false) AS must_change_password
    FROM public.users AS account
    WHERE account.auth_user_id = ${authUserId}::uuid
  `;

  if (!user) {
    throw new HttpError(
      403,
      "PROFILE_NOT_FOUND",
      "Tài khoản chưa có hồ sơ ứng dụng."
    );
  }

  if (user.status !== "ACTIVE") {
    throw new HttpError(
      403,
      "ACCOUNT_UNAVAILABLE",
      "Tài khoản không được phép truy cập."
    );
  }

  if (revision !== cacheRevision) return user;

  // FIFO eviction if cache size exceeds limit
  if (userProfileCache.size >= MAX_CACHE_SIZE) {
    const firstKey = userProfileCache.keys().next().value;
    if (firstKey) userProfileCache.delete(firstKey);
  }

  userProfileCache.set(authUserId, {
    user,
    expires: now + CACHE_TTL_MS,
  });

  return user;
}

// Local JWKS verification instance with key caching
let jwksInstance: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwksInstance) {
    const jwksUrl = new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
    jwksInstance = createRemoteJWKSet(jwksUrl, {
      cacheMaxAge: 10 * 60 * 1000, // Cache public keys for 10 minutes
      cooldownDuration: 30 * 1000, // 30 seconds cooldown between refreshes
    });
  }
  return jwksInstance;
}

/**
 * Verify JWT token locally using Supabase JWKS (ES256/RS256) or JWT secret.
 * Falls back to Supabase Auth API if JWKS verification cannot complete.
 */
export async function verifyAccessToken(accessToken: string): Promise<string> {
  try {
    const JWKS = getJWKS();
    const { payload } = await jwtVerify(accessToken, JWKS, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
    });

    if (!payload.sub) {
      throw new HttpError(401, "INVALID_TOKEN", "Phiên truy cập không hợp lệ.");
    }

    return payload.sub;
  } catch (err: unknown) {
    // If token expired, throw immediately without remote fallback
    if ((err as { code?: string } | null)?.code === "ERR_JWT_EXPIRED") {
      throw new HttpError(
        401,
        "INVALID_TOKEN",
        "Phiên truy cập không hợp lệ hoặc đã hết hạn."
      );
    }

    // Try symmetric secret verification if configured (e.g. HS256 tokens)
    if (process.env.SUPABASE_JWT_SECRET) {
      try {
        const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
        const { payload } = await jwtVerify(accessToken, secret, {
          issuer: `${env.SUPABASE_URL}/auth/v1`,
          audience: "authenticated",
          algorithms: ["HS256"],
        });
        if (payload.sub) {
          return payload.sub;
        }
      } catch {
        // Fall through to remote fallback
      }
    }

    // Fallback to Supabase Auth API
    try {
      const supabase = createAuthClient();
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (error) {
        if (!error.status || error.status >= 500) {
          throw new HttpError(
            503,
            "AUTH_UNAVAILABLE",
            "Dịch vụ xác thực tạm thời không khả dụng."
          );
        }

        throw new HttpError(
          401,
          "INVALID_TOKEN",
          "Phiên truy cập không hợp lệ hoặc đã hết hạn."
        );
      }

      if (!data.user) {
        throw new HttpError(
          401,
          "INVALID_TOKEN",
          "Phiên truy cập không hợp lệ."
        );
      }

      return data.user.id;
    } catch (fallbackErr) {
      if (fallbackErr instanceof HttpError) throw fallbackErr;
      throw new HttpError(
        401,
        "INVALID_TOKEN",
        "Phiên truy cập không hợp lệ hoặc đã hết hạn."
      );
    }
  }
}

const authenticate = (fresh = false) => asyncHandler(async (req, _res, next) => {
  const authStart = process.hrtime.bigint();
  try {
    const authorization = req.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      throw new HttpError(
        401,
        "UNAUTHENTICATED",
        "Bạn cần đăng nhập."
      );
    }

    const accessToken = match[1];
    const authUserId = await verifyAccessToken(accessToken);

    req.appUser = await findActiveUser(authUserId, fresh);
    req.accessToken = accessToken;

    next();
  } finally {
    recordAuthTiming(Number(process.hrtime.bigint() - authStart) / 1_000_000);
  }
});

export const requireAuth = authenticate();
export const requireFreshAuth = authenticate(true);

export function requireRole(
  ...roles: Array<"LEARNER" | "TEACHER" | "ADMIN">
): RequestHandler {
  return (req, _res, next) => {
    if (!req.appUser) {
      return next(
        new HttpError(401, "UNAUTHENTICATED", "Bạn cần đăng nhập.")
      );
    }

    if (!roles.some((role) => role === req.appUser!.role)) {
      return next(
        new HttpError(
          403,
          "FORBIDDEN",
          "Bạn không có quyền thực hiện thao tác này."
        )
      );
    }

    next();
  };
}
