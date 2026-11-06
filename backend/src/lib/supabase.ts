import { createClient, type RealtimeClientOptions } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "../config.js";

export function createAuthClient() {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    {
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
