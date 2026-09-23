import { Clock3 } from "lucide-react";
import { formatTime } from "@/lib/dates";
import type { StudySessionWithCourse } from "@/lib/database.types";

interface RecentSessionsProps {
  sessions: StudySessionWithCourse[];
}

/** Compact list of the user's latest completed focus sessions. */
export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No sessions yet — your focus time will show up here. ⏱️
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {sessions.map((session) => (
        <li key={session.id} className="flex items-center gap-3 py-3">
          <span
            className="h-8 w-8 shrink-0 rounded-lg bg-primary-soft text-primary flex items-center justify-center"
            aria-hidden
          >
            <Clock3 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {session.course?.name ?? "General focus"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(session.started_at)}
            </p>
          </div>
          {session.duration >= 60 ? (
            <span className="text-sm font-semibold text-foreground">
              {Math.floor(session.duration / 60)}h{" "}
              {session.duration % 60 > 0 ? `${session.duration % 60}m` : ""}
            </span>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {session.duration}m
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}