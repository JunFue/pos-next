import { createBrowserClient } from "@supabase/ssr";

let supabase: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabase) return supabase;

  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        heartbeatIntervalMs: 5000, // Forces a ping every 5s to keep the TCP socket open
      },
    }
  );

  return supabase!;
}
