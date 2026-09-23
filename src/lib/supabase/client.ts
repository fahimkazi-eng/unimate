import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — safe to use in Client Components.
 * Uses the public anon key (meant to be exposed) + supabase-js.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}