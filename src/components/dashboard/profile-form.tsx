"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/auth/label";
import { Check, Info } from "lucide-react";

export interface ProfileFormProps {
  nickname: string;
  university: string;
  department: string;
  semester: string;
  academicYear: string;
}

const SEMESTERS = Array.from({ length: 16 }, (_, i) => String(i + 1));

/**
 * V2 Phase 3 (spec 28) — editable profile fields. Server-action form with
 * inline validation, immediate "Saved ✓" feedback, and an honest note when a
 * pending migration would be needed for the academic fields.
 */
export function ProfileForm({
  nickname,
  university,
  department,
  semester,
  academicYear,
}: ProfileFormProps) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    undefined
  );

  const saved = state?.message === "saved";

  return (
    <form action={action} className="space-y-5" noValidate>
      {state?.message && !saved && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      {saved && (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success animate-fade-in-fast">
          <Check className="h-4 w-4" />
          Profile saved.
        </p>
      )}

      {state?.note && !saved && (
        <p className="flex items-start gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {state.note}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="nickname">What should we call you?</Label>
        <Input
          id="nickname"
          name="nickname"
          defaultValue={nickname}
          placeholder="Your nickname"
          autoComplete="nickname"
          maxLength={40}
        />
        {state?.errors?.nickname && (
          <p className="text-xs text-danger">{state.errors.nickname[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Shows on your dashboard instead of your full name.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Input
            id="university"
            name="university"
            defaultValue={university}
            placeholder="e.g. University of Dhaka"
            maxLength={80}
          />
          {state?.errors?.university && (
            <p className="text-xs text-danger">{state.errors.university[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            defaultValue={department}
            placeholder="e.g. Computer Science"
            maxLength={80}
          />
          {state?.errors?.department && (
            <p className="text-xs text-danger">{state.errors.department[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select
            id="semester"
            name="semester"
            defaultValue={semester}
            aria-label="Semester"
          >
            <option value="">Not set</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Select>
          {state?.errors?.semester && (
            <p className="text-xs text-danger">{state.errors.semester[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="academic_year">Academic year</Label>
          <Input
            id="academic_year"
            name="academic_year"
            type="number"
            inputMode="numeric"
            min={2000}
            max={2100}
            defaultValue={academicYear}
            placeholder="2026"
          />
          {state?.errors?.academic_year && (
            <p className="text-xs text-danger">{state.errors.academic_year[0]}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}