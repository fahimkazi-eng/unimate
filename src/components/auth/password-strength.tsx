"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  value: string;
}

/**
 * V2 Phase 3 (spec 26) — compact password strength meter (Weak/Fair/Strong).
 * Rendered only while the user is typing. Honors the same rule as the
 * server: 8+ characters; casing mix, digit and symbol each add strength.
 */
function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const LEVELS = [
  { min: 1, label: "Weak", bar: "bg-danger", text: "text-danger" },
  { min: 2, label: "Fair", bar: "bg-warning", text: "text-warning" },
  { min: 3, label: "Strong", bar: "bg-success", text: "text-success" },
];

export function PasswordStrength({ value }: PasswordStrengthProps) {
  if (!value) return null;
  const score = scorePassword(value);
  const level = LEVELS.find((l) => score >= l.min) ?? LEVELS[0];

  return (
    <div className="space-y-1.5">
      <div
        className="flex gap-1"
        role="presentation"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              i < Math.min(score, 3) ? level.bar : "bg-border"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", level.text)}>
        Password strength: {level.label}
      </p>
    </div>
  );
}