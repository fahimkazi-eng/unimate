"use client";

import { useActionState, useState } from "react";
import { updatePassword, type ResetState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/auth/label";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    updatePassword,
    undefined
  );
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.message && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {state?.errors?.password && (
          <p className="text-xs text-danger">{state.errors.password[0]}</p>
        )}
        <PasswordStrength value={password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <PasswordInput
          id="confirm"
          name="confirm"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.confirm && (
          <p className="text-xs text-danger">{state.errors.confirm[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}