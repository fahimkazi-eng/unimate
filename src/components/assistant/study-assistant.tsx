"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, TriangleAlert } from "lucide-react";
import { coachReply } from "@/app/actions/assistant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * V2 Phase 5 — Study Coach chat.
 * Client UI only: messages go to the server action (spec 46 — the AI key and
 * the user's real-data context never touch the client). Suggestion chips ask
 * the same questions a coach would, and the empty state is honest about
 * whether the AI is actually configured.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: Date;
}

const SUGGESTIONS = [
  "What should I work on first?",
  "Plan my next 3 study sessions",
  "Which course needs the most attention?",
  "How do I protect my streak this week?",
];

interface StudyAssistantProps {
  aiConfigured: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function StudyAssistant({ aiConfigured }: StudyAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  async function send(raw: string) {
    const message = raw.trim();
    if (!message || pending) return;

    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message, at: new Date() },
    ]);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const result = await coachReply({
        message,
        history: JSON.stringify(history),
      });
      if ("error" in result) {
        setError(result.error);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.reply, at: new Date() },
        ]);
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setPending(false);
    }
  }

  const started = messages.length > 0;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Study Coach</p>
          <p className="text-xs text-muted-foreground">
            {aiConfigured
              ? "Grounded in your real UniMate data."
              : "Waiting for a server-side AI key."}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex max-h-[420px] min-h-[280px] flex-col gap-3 overflow-y-auto p-4"
      >
        {!started ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">
                Ask your Study Coach anything
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                {aiConfigured
                  ? "It answers from your real tasks, courses and focus time — no made-up numbers."
                  : "Right now it gives honest, helpful guidance without AI. Replies get personalized the moment a key is added."}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={pending}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "self-end rounded-br-sm bg-primary text-primary-foreground"
                  : "self-start rounded-bl-sm border border-border bg-secondary text-foreground"
              )}
            >
              {m.content}
              <div
                className={cn(
                  "mt-1 text-[10px] uppercase tracking-wide opacity-60",
                  m.role === "user" ? "text-right" : "text-left"
                )}
              >
                {formatTime(m.at)}
              </div>
            </div>
          ))
        )}

        {pending ? (
          <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-start gap-2 border-t border-border px-4 py-2.5 text-sm text-warning">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            started ? "Follow up…" : "Ask about your study plan…"
          }
          aria-label="Message the Study Coach"
          className="h-10 flex-1"
          disabled={pending}
        />
        <Button
          type="submit"
          size="md"
          aria-label="Send message"
          disabled={pending || !input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}