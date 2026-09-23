"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createCourse,
  updateCourse,
  type CourseState,
} from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Course } from "@/lib/database.types";

interface CourseFormProps {
  course?: Course;
}

/** Add/edit form shared by the courses page and the edit page. */
export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const action = course ? updateCourse.bind(null, course.id) : createCourse;
  const [state, formAction, pending] = useActionState<CourseState, FormData>(
    action,
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

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Name <span className="text-danger">*</span>
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={course?.name}
            placeholder="e.g. Data Structures"
            aria-invalid={Boolean(error("name"))}
          />
          {error("name") ? (
            <p className="mt-1 text-xs text-danger">{error("name")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="code"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Code
          </label>
          <Input
            id="code"
            name="code"
            defaultValue={course?.code ?? ""}
            placeholder="e.g. CSE-204"
            aria-invalid={Boolean(error("code"))}
          />
          {error("code") ? (
            <p className="mt-1 text-xs text-danger">{error("code")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="color"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Color
          </label>
          <input
            id="color"
            name="color"
            type="color"
            defaultValue={course?.color ?? "#4f46e5"}
            className="h-10 w-full cursor-pointer rounded-lg border border-input bg-surface p-1"
            aria-invalid={Boolean(error("color"))}
          />
          {error("color") ? (
            <p className="mt-1 text-xs text-danger">{error("color")}</p>
          ) : null}
        </div>
      </div>

      {state?.message ? (
        <p className="text-sm text-danger">{state.message}</p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {course ? (
          <Button variant="outline" href="/dashboard/courses">
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : course ? "Save changes" : "Add course"}
        </Button>
      </div>
    </form>
  );
}