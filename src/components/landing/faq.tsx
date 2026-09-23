const faqs = [
  {
    question: "Who is Campus Hub for?",
    answer:
      "University and college students juggling multiple courses, deadlines, exams, and career decisions — anywhere in the world.",
  },
  {
    question: "Does Campus Hub use AI?",
    answer:
      "Not in V1. Tasks, deadlines, focus sessions and progress run on plain, predictable software. AI study tools are planned for a later version.",
  },
  {
    question: "Is it free?",
    answer:
      "Campus Hub is free while we build and validate V1. A Pro tier may appear later, but the core student tools stay free.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your account data belongs to you, protected with row-level security so no one else can read your courses or tasks.",
  },
  {
    question: "Which devices does it work on?",
    answer:
      "The dashboard is responsive from day one — usable on desktop, laptop, tablet and mobile. Offline support and reminders are on the long-term roadmap.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-border bg-surface shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}