import WebSocket from "ws";
import { createClient, type RealtimeClientOptions } from "@supabase/supabase-js";
import type {
  CookieOptions,
  Request,
  Response,
} from "express";

import { env } from "../config.js";

const STORAGE_KEY = "ielts-google-auth";

const VERIFIER_STORAGE_KEY =
  `${STORAGE_KEY}-code-verifier`;

const VERIFIER_COOKIE = "ielts_google_pkce";

const verifierCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",

  // Callback là điều hướng từ Supabase về backend.
  // Lax cho phép cookie đi cùng điều hướng GET cấp cao nhất.
  sameSite: "lax",

  path: "/api/auth/google",
};

export function hasGoogleVerifier(req: Request) {
  const value = req.cookies?.[VERIFIER_COOKIE];

  return typeof value === "string" && value.length > 0;
}

export function clearGoogleVerifier(res: Response) {
  res.clearCookie(
    VERIFIER_COOKIE,
    verifierCookieOptions
  );
}

export function createGoogleOAuthClient(
  req: Request,
  res: Response
) {
  // Session chỉ được lưu tạm trong bộ nhớ của request này.
  const memory = new Map<string, string>();

  const storedVerifier = req.cookies?.[VERIFIER_COOKIE];

  if (typeof storedVerifier === "string") {
    memory.set(
      VERIFIER_STORAGE_KEY,
      storedVerifier
    );
  }

  const storage = {
    getItem(key: string): string | null {
      return memory.get(key) ?? null;
    },

    setItem(key: string, value: string): void {
      memory.set(key, value);

      if (key === VERIFIER_STORAGE_KEY) {
        res.cookie(VERIFIER_COOKIE, value, {
          ...verifierCookieOptions,
          maxAge: 10 * 60 * 1000,
        });
      }
    },

    removeItem(key: string): void {
      memory.delete(key);

      if (key === VERIFIER_STORAGE_KEY) {
        clearGoogleVerifier(res);
      }
    },
  };

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
      realtime: { transport: WebSocket as unknown as RealtimeClientOptions['transport'] },
      auth: {
        flowType: "pkce",
        storageKey: STORAGE_KEY,
        storage,
        persistSession: true,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
