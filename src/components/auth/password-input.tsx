"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends React.ComponentProps<"input"> {}

/**
 * V2 Phase 3 (spec 25) — password field with a show/hide toggle.
 * Icon button inside the field, accessible label ("Show/Hide password"),
 * never submits the form. The icon crossfades subtly (180ms) on toggle —
 * no slow or distracting motion.
 */
export function PasswordInput({
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground"
      >
        <span
          key={visible ? "visible" : "hidden"}
          className="animate-fade-in-fast"
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </button>
    </div>
  );
}