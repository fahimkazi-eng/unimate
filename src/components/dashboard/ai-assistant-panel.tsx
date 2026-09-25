import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { StudyAssistant } from "@/components/assistant/study-assistant";

/**
 * V3 Phase C §13 — UniMate AI, front and center on the Overview.
 * The panel frames the REAL Study Coach chat (server-side coachReply, key
 * never leaves the server; honest "not wired up" state when no key is set).
 * The glow is a static blur, no continuous animation — cheap on mobile,
 * and reduced-motion collapses everything anyway.
 */

interface AiAssistantPanelProps {
  aiConfigured: boolean;
}

export function AiAssistantPanel({ aiConfigured }: AiAssistantPanelProps) {
  return (
    <section
      aria-labelledby="ai-panel-heading"
      className="gradient-ring relative overflow-hidden rounded-2xl border border-accent/30 bg-surface shadow-glow-accent"
    >
      {/* AI atmosphere — desktop only; phones skip the large blur surfaces. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 right-0 hidden h-72 w-72 rounded-full bg-accent/10 blur-3xl sm:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-20 hidden h-64 w-64 rounded-full bg-primary/10 blur-3xl lg:block"
      />

      <div className="relative p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow-primary">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2
                id="ai-panel-heading"
                className="text-lg font-bold tracking-tight text-foreground"
              >
                <span className="text-gradient">✦ UniMate AI</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Your personal study assistant — answers from your real tasks,
                courses and focus time.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/assistant"
            className="inline-flex items-center gap-0.5 text-sm font-medium text-accent transition-colors hover:text-foreground"
          >
            Full assistant
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="mt-5">
          <StudyAssistant aiConfigured={aiConfigured} />
        </div>
      </div>
    </section>
  );
}