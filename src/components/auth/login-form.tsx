"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/auth/label";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    undefined
  );

  return (
    <div className="space-y-4">
      <GoogleButton />

      <div className="relative py-0.5" aria-hidden>
        <div className="absolute inset-0 flex items-center">
          <div className="h-px w-full bg-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
          {state?.errors?.password && (
            <p className="text-xs text-danger">{state.errors.password[0]}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create a free account
          </Link>
        </p>
      </form>
    </div>
  );
}