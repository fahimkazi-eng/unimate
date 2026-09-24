import { requireUser } from "@/lib/auth";
import { getGoals } from "@/lib/goals";
import { GOAL_LABELS, GOAL_UNITS } from "@/lib/goal-meta";
import { deleteGoal } from "@/app/actions/goals";
import { Target, Trash2, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoalForm } from "@/components/goals/goal-form";

export const metadata = {
  title: "Goals — UniMate",
};

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await requireUser();
  const { goals, error } = await getGoals(user.id);

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Goals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Targets you set — progress is measured from your real activity, never
          faked.
        </p>
      </header>

      {error ? (
        <div className="mt-6 rounded-xl border border-dashed border-warning/50 bg-warning/10 px-4 py-4 text-sm text-warning">
          Goals aren&apos;t set up on this project yet — run{" "}
          <code className="font-medium">supabase/v3_goals.sql</code> in the
          Supabase SQL Editor (one-time, same as the v2 migration).
        </div>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Add a goal
          </CardTitle>
          <CardDescription>
            Pick a measure and a target — we&apos;ll track it against your
            completed tasks, focus minutes, courses and streak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm />
        </CardContent>
      </Card>

      {!error && goals.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground">
          No goals yet — set your first one above. 🎯
        </div>
      ) : null}

      {goals.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {goals.map((goal) => {
            const pct = Math.round(goal.progress * 100);
            const unit = GOAL_UNITS[goal.measure];
            return (
              <Card
                key={goal.id}
                className={goal.complete ? "border-primary/25" : undefined}
              >
                <CardContent className="group flex items-center gap-4 pt-6">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      goal.complete
                        ? "bg-primary text-primary-foreground shadow-glow-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                    aria-hidden
                  >
                    {goal.complete ? (
                      <Trophy className="h-5 w-5" />
                    ) : (
                      <Target className="h-5 w-5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-foreground">
                        {goal.title}
                      </p>
                      <Badge variant={goal.complete ? "default" : "outline"}>
                        {GOAL_LABELS[goal.measure]}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {Math.min(goal.current, goal.target).toLocaleString()}/
                        {goal.target.toLocaleString()} {unit}
                      </span>
                    </div>
                  </div>

                  <form action={deleteGoal.bind(null, goal.id)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="submit"
                      className="text-danger hover:text-danger"
                      aria-label={`Delete goal: ${goal.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}