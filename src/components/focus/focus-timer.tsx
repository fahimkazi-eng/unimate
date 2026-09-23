"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Flag, Pause, Play, RotateCcw } from "lucide-react";
import { recordFocusSession } from "@/app/actions/sessions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/database.types";

const PRESETS = [
  { minutes: 15, label: "15m" },
  { minutes: 25, label: "25m" },
  { minutes: 45, label: "45m" },
];

const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface FocusTimerProps {
  courses: Course[];
}

/**
 * Pomodoro-style focus timer. Runs purely client-side; when a session
 * finishes it calls the recordFocusSession server action so the dashboard
 * stats and recent-session list update.
 */
export function FocusTimer({ courses }: FocusTimerProps) {
  const router = useRouter();
  const [preset, setPreset] = useState(25);
  const [courseId, setCourseId] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string | null>(null);
  const recordingRef = useRef(false);

  const totalSeconds = preset * 60;
  const focusedSeconds = totalSeconds - secondsLeft;

  const stopTicking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  /** Commit the session and reset to idle. */
  const finish = async (minutes: number) => {
    stopTicking();
    if (recordingRef.current) return; // guard against double submission
    recordingRef.current = true;

    const result = await recordFocusSession({
      durationMinutes: minutes,
      courseId: courseId || null,
      startedAt: startedAtRef.current ?? new Date().toISOString(),
    });

    recordingRef.current = false;
    if (result.ok) {
      setMessage(`🎉 Recorded ${minutes} min of focused study.`);
      router.refresh();
    } else {
      setMessage(`Couldn't record the session: ${result.error}`);
    }

    startedAtRef.current = null;
    setSecondsLeft(totalSeconds);
  };

  const start = () => {
    if (recordingRef.current) return;
    setMessage(null);
    startedAtRef.current ??= new Date().toISOString();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Countdown finished — record the full preset.
          void finish(preset);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const pause = () => {
    stopTicking();
  };

  const reset = () => {
    stopTicking();
    startedAtRef.current = null;
    recordingRef.current = false;
    setSecondsLeft(totalSeconds);
    setMessage(null);
  };

  const finishEarly = () => {
    stopTicking();
    if (focusedSeconds < 60) {
      startedAtRef.current = null;
      setSecondsLeft(totalSeconds);
      setMessage("Session was under a minute — nothing recorded.");
      return;
    }
    const minutes = Math.max(1, Math.round(focusedSeconds / 60));
    void finish(minutes);
  };

  const selectPreset = (minutes: number) => {
    stopTicking();
    setPreset(minutes);
    setSecondsLeft(minutes * 60);
    startedAtRef.current = null;
    recordingRef.current = false;
    setMessage(null);
  };

  // Clean up the interval on unmount (e.g. navigating away mid-session).
  useEffect(() => () => stopTicking(), []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = secondsLeft / totalSeconds;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const idle = !running && secondsLeft === totalSeconds;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="-rotate-90"
          role="img"
          aria-label={`${preset} minute timer`}
        >
          <circle
            cx="110"
            cy="110"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="10"
          />
          <circle
            cx="110"
            cy="110"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums text-foreground">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {running ? "Focusing…" : idle ? "Ready" : "Paused"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.minutes}
            type="button"
            onClick={() => selectPreset(p.minutes)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              preset === p.minutes
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 w-full max-w-xs">
        <Select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          aria-label="Attach session to a course"
        >
          <option value="">General focus (no course)</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {running ? (
          <Button variant="secondary" onClick={pause}>
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        ) : (
          <Button onClick={start} disabled={recordingRef.current}>
            <Play className="h-4 w-4" />
            {idle ? "Start" : "Resume"}
          </Button>
        )}
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          variant="outline"
          onClick={finishEarly}
          disabled={idle || secondsLeft === 0}
        >
          <Flag className="h-4 w-4" />
          Finish
        </Button>
      </div>

      {message ? (
        <p className="mt-5 flex items-center gap-2 text-center text-sm text-muted-foreground">
          {message.startsWith("🎉") ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}