import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Data Access Layer — centralizes session/auth checks.
 * `cache()` memoizes within a single render pass so we don't
 * hit Supabase repeatedly for the same request.
 */

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user as User | null;
});

/** Auth guard for pages; redirects to /login when signed out. */
export const requireUser = cache(async () => {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
});