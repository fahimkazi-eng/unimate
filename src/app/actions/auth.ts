"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/* ---------- Schemas ---------- */

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .trim(),
  email: z.string().email("Enter a valid email.").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email.").trim(),
  password: z.string().min(1, "Password is required."),
});

const emailSchema = z.object({
  email: z.string().email("Enter a valid email.").trim(),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirm: z.string().min(1, "Please repeat your password."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

/* ---------- Types ---------- */

export type AuthState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

/* ---------- Actions ---------- */

async function getBaseUrl() {
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(origin);
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validated = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, password } = validated.data;
  const supabase = await createClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${baseUrl.origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { message: error.message };
  }

  // If email confirmation is enabled, no session exists yet — ask to check email.
  if (!data.session) {
    redirect("/check-email");
  }

  redirect("/dashboard");
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: "Invalid email or password." };
  }

  redirect("/dashboard");
}

/**
 * Checkpoint 9 — Google OAuth. Starts the provider flow server-side and
 * redirects to Google's consent page. The callback route
 * (/auth/callback?next=/dashboard) exchanges the code for a session and the
 * handle_new_user trigger copies Google's name/photo into the profile.
 */
export async function googleSignIn(
  _prevState: AuthState,
  _formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl.origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { message: `Couldn't start Google sign-in: ${error.message}` };
  }

  if (data.url) {
    redirect(data.url);
  }

  return {
    message:
      "Google sign-in isn't configured on this project yet — try email instead.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Experiment #2 rule 14: signing out returns to the public homepage,
  // which shows the demo experience (never private data after logout).
  redirect("/");
}

/* ---------- Password reset (V2 Phase 3) ---------- */

export type ResetState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

/**
 * V2 Phase 3 (spec 24) — sends a password-reset email. Uses the anon-key
 * resetPasswordForEmail (safe client-side), pointing the recovery link back
 * at /auth/callback?next=/reset-password, which exchanges the code for a
 * recovery session before showing the reset form. Always answers generically
 * so we never reveal whether an email has an account.
 */
export async function sendPasswordReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${baseUrl.origin}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return { message: "Something went wrong — please try again." };
  }

  // Generic success — the user may or may not exist; never leak that.
  return { message: "reset-email-sent" };
}

/**
 * Sets a new password for the recovery session (the user arrived from the
 * reset email). On success the session is good — go straight to the app.
 */
export async function updatePassword(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { message: `Couldn't update your password: ${error.message}` };
  }

  redirect("/dashboard");
}