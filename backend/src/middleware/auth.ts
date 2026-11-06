import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { createAuthClient } from "../lib/supabase.js";
import { asyncHandler, HttpError } from "../utils/http.js";

export type AppUser = {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
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

export async function findActiveUser(authUserId: string) {
  const user = await prisma.users.findUnique({
    where: {
      auth_user_id: authUserId,
    },
    select: userSelect,
  });

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

  return user;
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
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

  req.appUser = await findActiveUser(data.user.id);
  req.accessToken = accessToken;

  next();
});

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
