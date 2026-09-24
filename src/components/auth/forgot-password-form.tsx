"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendPasswordReset, type ResetState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/auth/label";
import { MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    sendPasswordReset,
    undefined
  );

  if (state?.message === "reset-email-sent") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MailCheck className="h-6 w-6" />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          If an account exists for that email, a reset link is on its way.
          Follow the link to choose a new password.
        </p>
        <Button variant="outline" className="w-full" href="/login">
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.message && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@university.edu"
          autoComplete="email"
          required
        />
        {state?.errors?.email && (
          <p className="text-xs text-danger">{state.errors.email[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}