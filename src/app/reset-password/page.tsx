import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Choose a new password — UniMate",
};

/**
 * V2 Phase 3 (spec 24) — the destination of the password-reset email.
 * The callback route exchanged the recovery code for a session before
 * redirecting here; if there's no session (e.g. the link expired or was
 * visited cold), bounce back to the forgot-password flow.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/forgot-password");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex animate-scale-in items-center gap-2 font-semibold text-foreground"
      >
        <BrandMark />
        UniMate
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Choose a new password
          </h1>
          <CardDescription>
            Make it something you&apos;ll remember — at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}