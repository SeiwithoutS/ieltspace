import { createGoogleOAuthClient, hasGoogleVerifier, clearGoogleVerifier } from "../../lib/supabase-oauth.js";
import { Router, type Response, type CookieOptions } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import type { Session } from "@supabase/supabase-js";

import { env } from "../../config.js";
import { createAuthClient } from "../../lib/supabase.js";
import {
  findActiveUser,
  requireAuth,
} from "../../middleware/auth.js";
import { asyncHandler, HttpError } from "../../utils/http.js";

export const authRouter = Router();

const REFRESH_COOKIE = "ielts_refresh_token";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.COOKIE_SAME_SITE,
  path: "/api/auth",
};

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,

    // Đây là thời gian lưu cookie của ứng dụng,
    // không phải cấu hình tuổi thọ session trong Supabase.
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}

function sessionResponse(session: Session) {
  return {
    accessToken: session.access_token,
    expiresAt: session.expires_at,
    expiresIn: session.expires_in,
    tokenType: session.token_type,
  };
}

function throwAuthUnavailable(error: { status?: number }) {
  if (!error.status || error.status >= 500) {
    throw new HttpError(
      503,
      "AUTH_UNAVAILABLE",
      "Dịch vụ xác thực tạm thời không khả dụng."
    );
  }

  if (error.status === 429) {
    throw new HttpError(
      429,
      "AUTH_RATE_LIMITED",
      "Có quá nhiều yêu cầu. Vui lòng thử lại sau."
    );
  }
}

// Các endpoint xác thực không được cache.
authRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Origin check cho các thao tác thay đổi phiên.
// CORS một mình không phải cơ chế chống CSRF.
authRouter.use((req, _res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    if (req.headers.origin !== env.FRONTEND_ORIGIN) {
      return next(
        new HttpError(
          403,
          "INVALID_ORIGIN",
          "Nguồn gửi yêu cầu không được phép."
        )
      );
    }
  }

  next();
});

const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Có quá nhiều yêu cầu. Vui lòng thử lại sau.",
    },
  },
});

const registerSchema = z.object({
  email: z.string().trim().email().max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(2).max(100),
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email().max(254)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
}).strict();
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { message: 'Có quá nhiều yêu cầu khôi phục. Vui lòng thử lại sau.' },
});
authRouter.post('/forgot-password', recoveryLimiter, asyncHandler(async (req, res) => {
  const { email } = z.object({ email: z.string().trim().email().max(254).transform(value => value.toLowerCase()) }).strict().parse(req.body);
  const { error } = await createAuthClient().auth.resetPasswordForEmail(email, {
    redirectTo: new URL('/reset-password', env.FRONTEND_ORIGIN).toString(),
  });
  if (error) {
    console.warn('Password recovery request failed', { code: error.code, status: error.status });
    throwAuthUnavailable(error);
  }
  res.status(202).json({ message: 'Nếu email có trong hệ thống, bạn sẽ nhận được liên kết đặt lại trong vài phút.' });
}));

authRouter.post('/reset-password', recoveryLimiter, asyncHandler(async (req, res) => {
  const input = z.object({ tokenHash: z.string().min(1).max(2048), password: z.string().min(8).max(128) }).strict().parse(req.body);
  const client = createAuthClient();
  const verified = await client.auth.verifyOtp({ token_hash: input.tokenHash, type: 'recovery' });
  if (verified.error) {
    throwAuthUnavailable(verified.error);
    throw new HttpError(400, 'INVALID_RECOVERY', 'Liên kết hết hạn hoặc đã được sử dụng. Hãy yêu cầu liên kết mới.');
  }
  if (!verified.data.session) throw new HttpError(400, 'INVALID_RECOVERY', 'Liên kết không hợp lệ.');
  let updated = false;
  let revoked = false;
  try {
    const { error } = await client.auth.updateUser({ password: input.password });
    if (error) {
      throwAuthUnavailable(error);
      throw new HttpError(400, 'RESET_FAILED', 'Không thể đổi mật khẩu. Kiểm tra yêu cầu độ mạnh mật khẩu và yêu cầu liên kết mới.');
    }
    updated = true;
  } finally {
    // Cleanup errors must not hide the result of the password update.
    try {
      const { error } = await client.auth.signOut({ scope: updated ? 'global' : 'local' });
      revoked = !error;
      if (error) console.warn('Recovery session cleanup failed', { code: error.code, status: error.status });
    } catch {
      console.warn('Recovery session cleanup unavailable');
    }
  }
  clearRefreshCookie(res);
  res.json({ message: revoked
    ? 'Mật khẩu đã được cập nhật. Hãy đăng nhập bằng mật khẩu mới.'
    : 'Mật khẩu đã được cập nhật, nhưng chưa xác nhận được việc thu hồi các phiên cũ. Hãy đăng nhập lại và kiểm tra các thiết bị đang sử dụng tài khoản.' });
}));
authRouter.post(
  "/register",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
        },
        emailRedirectTo: env.AUTH_EMAIL_REDIRECT_URL,
      },
    });

    if (error) {
      throwAuthUnavailable(error);

      throw new HttpError(
        400,
        "REGISTRATION_FAILED",
        "Không thể hoàn tất đăng ký. Kiểm tra thông tin hoặc thử lại sau."
      );
    }

    // Ví dụ này chủ động yêu cầu đăng nhập riêng sau đăng ký.
    // Nếu project vô tình tắt xác minh email và trả session,
    // không giữ session đó trên server.
    if (data.session) {
      const { error: logoutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (logoutError) {
        throw new HttpError(
          503,
          "AUTH_UNAVAILABLE",
          "Chưa thể hoàn tất xử lý phiên đăng ký."
        );
      }
    }

    // Không trả thông báo khẳng định email đã tồn tại hay chưa.
    res.status(202).json({
      message:
        "Nếu thông tin đủ điều kiện đăng ký, hãy kiểm tra email để xác minh tài khoản rồi đăng nhập.",
    });
  })
);
authRouter.post(
  "/login",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throwAuthUnavailable(error);

      throw new HttpError(
        401,
        "LOGIN_FAILED",
        "Không thể đăng nhập. Kiểm tra email, mật khẩu và trạng thái xác minh email."
      );
    }

    if (!data.user || !data.session) {
      throw new HttpError(
        401,
        "LOGIN_FAILED",
        "Không thể tạo phiên đăng nhập."
      );
    }

    try {
      const user = await findActiveUser(data.user.id);

      setRefreshCookie(res, data.session.refresh_token);

      res.json({
        user,
        session: sessionResponse(data.session),
      });
    } catch (error) {
      // Auth có thể chấp nhận mật khẩu nhưng tài khoản nghiệp vụ
      // đang LOCKED hoặc DELETED. Không trao session cho frontend.
      await supabase.auth.signOut({ scope: "local" });
      clearRefreshCookie(res);

      throw error;
    }
  })
);
authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE];

    if (typeof refreshToken !== "string" || !refreshToken) {
      throw new HttpError(
        401,
        "NO_SESSION",
        "Không có phiên đăng nhập."
      );
    }

    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      // Lỗi dịch vụ không đồng nghĩa token đã hết hiệu lực.
      throwAuthUnavailable(error);

      clearRefreshCookie(res);

      throw new HttpError(
        401,
        "SESSION_EXPIRED",
        "Phiên đăng nhập đã hết hiệu lực."
      );
    }

    if (!data.user || !data.session) {
      clearRefreshCookie(res);

      throw new HttpError(
        401,
        "SESSION_EXPIRED",
        "Không thể làm mới phiên đăng nhập."
      );
    }

    try {
      const user = await findActiveUser(data.user.id);

      // Refresh token có thể được xoay vòng.
      // Luôn cập nhật cookie bằng token mới.
      setRefreshCookie(res, data.session.refresh_token);

      res.json({
        user,
        session: sessionResponse(data.session),
      });
    } catch (error) {
      await supabase.auth.signOut({ scope: "local" });
      clearRefreshCookie(res);

      throw error;
    }
  })
);
authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies[REFRESH_COOKIE];

    if (typeof refreshToken !== "string" || !refreshToken) {
      clearRefreshCookie(res);
      res.status(204).send();
      return;
    }

    const supabase = createAuthClient();

    // Nạp phiên từ refresh token để đăng xuất đúng phiên này.
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      // Nếu Auth đang lỗi hoặc bị giới hạn, không tuyên bố
      // đã thu hồi phiên thành công.
      throwAuthUnavailable(error);

      clearRefreshCookie(res);

      if (error.status === 400 || error.status === 401) {
        // Phiên không còn làm mới được.
        res.status(204).send();
        return;
      }

      throw new HttpError(
        502,
        "LOGOUT_FAILED",
        "Chưa thể xác nhận việc thu hồi phiên."
      );
    }

    if (!data.session) {
      clearRefreshCookie(res);
      res.status(204).send();
      return;
    }

    // Giữ token mới để có thể thử lại nếu signOut lỗi.
    setRefreshCookie(res, data.session.refresh_token);

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "local",
    });

    if (signOutError) {
      throw new HttpError(
        503,
        "LOGOUT_FAILED",
        "Chưa thể thu hồi phiên. Vui lòng thử lại."
      );
    }

    clearRefreshCookie(res);
    res.status(204).send();
  })
);
authRouter.get(
  "/me",
  requireAuth,
  (req, res) => {
    res.json({
      user: req.appUser,
    });
  }
);

authRouter.post(
  "/google",
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const supabase = createGoogleOAuthClient(req, res);

    const { data, error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: env.AUTH_GOOGLE_CALLBACK_URL,

          // Backend chỉ lấy URL, frontend thực hiện điều hướng.
          skipBrowserRedirect: true,

          queryParams: {
            prompt: "select_account",
          },
        },
      });

    if (error || !data.url) {
      clearGoogleVerifier(res);

      throw new HttpError(
        502,
        "GOOGLE_LOGIN_START_FAILED",
        "Không thể bắt đầu đăng nhập Google."
      );
    }

    res.json({
      url: data.url,
    });
  })
);

authRouter.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    res.setHeader("Referrer-Policy", "no-referrer");

    const frontendLoginURL = new URL(
      "/login",
      env.FRONTEND_ORIGIN
    );

    function redirectFailure(
      reason: string
    ) {
      clearGoogleVerifier(res);

      frontendLoginURL.searchParams.set(
        "auth_error",
        reason
      );

      res.redirect(
        303,
        frontendLoginURL.toString()
      );
    }

    // Người dùng từ chối hoặc nhà cung cấp trả lỗi.
    if (typeof req.query.error === "string") {
      redirectFailure("google_login_failed");
      return;
    }

    const code = req.query.code;

    if (
      typeof code !== "string" ||
      !code ||
      !hasGoogleVerifier(req)
    ) {
      redirectFailure("invalid_oauth_callback");
      return;
    }

    const supabase = createGoogleOAuthClient(req, res);

    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);

    clearGoogleVerifier(res);

    if (
      error ||
      !data.user ||
      !data.session
    ) {
      redirectFailure("google_login_failed");
      return;
    }

    try {
      // Kiểm tra hồ sơ, ACTIVE/LOCKED/DELETED.
      await findActiveUser(data.user.id);
    } catch (error) {
      const { error: signOutError } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (signOutError) {
        console.warn(
          "OAuth session cleanup failed",
          {
            code: signOutError.code,
          }
        );
      }

      // Không log token, code hoặc toàn bộ callback URL.
      redirectFailure(
        error instanceof HttpError &&
        error.statusCode === 403
          ? "account_unavailable"
          : "google_login_failed"
      );

      return;
    }

    // Dùng lại hàm setRefreshCookie trong auth.routes.ts.
    setRefreshCookie(
      res,
      data.session.refresh_token
    );

    const frontendCallbackURL = new URL(
      "/auth/callback",
      env.FRONTEND_ORIGIN
    );

    // Không đưa access token/refresh token lên URL.
    res.redirect(
      303,
      frontendCallbackURL.toString()
    );
  })
);
