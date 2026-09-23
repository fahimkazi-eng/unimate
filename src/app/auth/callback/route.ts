import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation / OAuth callback.
 * Supabase redirects the user here after confirming their email;
 * we exchange the code for a real session, then send them on.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}