"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createGoal, type GoalState } from "@/app/actions/goals";
import {
  GOAL_LABELS,
  GOAL_MEASURES,
  type GoalMeasure,
} from "@/lib/goal-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

/** Create form for a goal — mirrors the course form pattern. */
export function GoalForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<GoalState, FormData>(
    createGoal,
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
        <div className="sm:col-span-1">
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Goal <span className="text-danger">*</span>
          </label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Complete 50 tasks"
            aria-invalid={Boolean(error("title"))}
          />
          {error("title") ? (
            <p className="mt-1 text-xs text-danger">{error("title")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="measure"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Measure <span className="text-danger">*</span>
          </label>
          <Select
            id="measure"
            name="measure"
            defaultValue="tasks-completed"
            aria-invalid={Boolean(error("measure"))}
          >
            {GOAL_MEASURES.map((measure: GoalMeasure) => (
              <option key={measure} value={measure}>
                {GOAL_LABELS[measure]}
              </option>
            ))}
          </Select>
          {error("measure") ? (
            <p className="mt-1 text-xs text-danger">{error("measure")}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="target"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Target <span className="text-danger">*</span>
          </label>
          <Input
            id="target"
            name="target"
            type="number"
            min={1}
            placeholder="e.g. 50"
            aria-invalid={Boolean(error("target"))}
          />
          {error("target") ? (
            <p className="mt-1 text-xs text-danger">{error("target")}</p>
          ) : null}
        </div>
      </div>

      {state?.message ? (
        <p className="text-sm text-danger">{state.message}</p>
      ) : null}

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add goal"}
        </Button>
      </div>
    </form>
  );
}