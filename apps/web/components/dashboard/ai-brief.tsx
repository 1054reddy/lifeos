import { ArrowRight, Sparkles } from "lucide-react";

export function AIBrief() {
  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Sparkles className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold">AI Daily Brief</h2>

            <p className="text-xs text-muted-foreground">
              Personalized for you
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          You have 3 important tasks today. Your most productive
          period is usually between 2 PM and 5 PM, so consider using
          that time for your React project.
        </p>

        <div className="mt-5 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">
            Suggested next action
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Finish the dashboard UI before starting your next task.
          </p>
        </div>

        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          Open AI Assistant
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  );
}