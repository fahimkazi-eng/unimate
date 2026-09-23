"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTask,
  type TaskState,
} from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Course, TaskWithCourse } from "@/lib/database.types";

interface TaskFormProps {
  courses: Course[];
  task?: TaskWithCourse;
}

/**
 * Add/edit form shared by both pages. When `task` is set it binds the
 * update action; otherwise it creates a new task.
 */
export function TaskForm({ courses, task }: TaskFormProps) {
  const router = useRouter();
  const action = task ? updateTask.bind(null, task.id) : createTask;
  const [state, formAction, pending] = useActionState<TaskState, FormData>(
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Title <span className="text-danger">*</span>
          </label>
          <Input
            id="title"
            name="title"
            defaultValue={task?.title}
            placeholder="e.g. Finish essay draft"
            aria-invalid={Boolean(error("title"))}
          />
          {error("title") ? (
            <p className="mt-1 text-xs text-danger">{error("title")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="course_id"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Course
          </label>
          <Select
            id="course_id"
            name="course_id"
            defaultValue={task?.course_id ?? ""}
          >
            <option value="">No course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor="due_date"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Due date
          </label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={task?.due_date?.slice(0, 10) ?? ""}
            aria-invalid={Boolean(error("due_date"))}
          />
          {error("due_date") ? (
            <p className="mt-1 text-xs text-danger">{error("due_date")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="priority"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Priority
          </label>
          <Select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? "medium"}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        <div>
          <label
            htmlFor="estimated_minutes"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Estimated minutes
          </label>
          <Input
            id="estimated_minutes"
            name="estimated_minutes"
            type="number"
            min={5}
            step={5}
            defaultValue={task?.estimated_minutes ?? ""}
            placeholder="e.g. 45"
            aria-invalid={Boolean(error("estimated_minutes"))}
          />
          {error("estimated_minutes") ? (
            <p className="mt-1 text-xs text-danger">
              {error("estimated_minutes")}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            defaultValue={task?.description ?? ""}
            placeholder="Optional notes…"
            rows={3}
            aria-invalid={Boolean(error("description"))}
          />
          {error("description") ? (
            <p className="mt-1 text-xs text-danger">{error("description")}</p>
          ) : null}
        </div>
      </div>

      {state?.message ? (
        <p className="text-sm text-danger">{state.message}</p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {task ? (
          <Button variant="outline" href="/dashboard/tasks">
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : task ? "Save changes" : "Add task"}
        </Button>
      </div>
    </form>
  );
}