"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { addGrade, type GradeState } from "@/app/actions/grades";
import { LETTER_GRADES } from "@/lib/grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Course } from "@/lib/database.types";

interface GradeFormProps {
  courses: Course[];
}

/** Add / update a grade for one of the user's real courses. */
export function GradeForm({ courses }: GradeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<GradeState, FormData>(
    addGrade,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  const error = (name: string) => state?.errors?.[name]?.[0];

  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a course first, then record your grade for it.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label
            htmlFor="course_id"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Course <span className="text-danger">*</span>
          </label>
          <Select
            id="course_id"
            name="course_id"
            defaultValue={courses[0].id}
            aria-invalid={Boolean(error("course_id"))}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
                {course.code ? ` (${course.code})` : ""}
              </option>
            ))}
          </Select>
          {error("course_id") ? (
            <p className="mt-1 text-xs text-danger">{error("course_id")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="letter"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Letter grade <span className="text-danger">*</span>
          </label>
          <Select
            id="letter"
            name="letter"
            defaultValue="A"
            aria-invalid={Boolean(error("letter"))}
          >
            {LETTER_GRADES.map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </Select>
          {error("letter") ? (
            <p className="mt-1 text-xs text-danger">{error("letter")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="credits"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Credits <span className="text-danger">*</span>
          </label>
          <Input
            id="credits"
            name="credits"
            type="number"
            min={1}
            max={20}
            defaultValue={3}
            aria-invalid={Boolean(error("credits"))}
          />
          {error("credits") ? (
            <p className="mt-1 text-xs text-danger">{error("credits")}</p>
          ) : null}
        </div>
      </div>

      {state?.message ? (
        <p className="text-sm text-danger">{state.message}</p>
      ) : null}

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save grade"}
        </Button>
      </div>
    </form>
  );
}