import { createClient, type RealtimeClientOptions } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "../config.js";

function createServerClient(key: string, accessToken?: string) {
  return createClient(
    env.SUPABASE_URL,
    key,
    {
      global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
      // Node 20 does not provide the native WebSocket required by Realtime.
      // ws has Node-specific overloads; its runtime API is compatible with Realtime.
      realtime: { transport: WebSocket as unknown as RealtimeClientOptions['transport'] },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export function createAuthClient(accessToken?: string) {
  return createServerClient(env.SUPABASE_PUBLISHABLE_KEY, accessToken);
}

export function createPrivilegedSupabaseClient() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  return key ? createServerClient(key) : null;
}
