import { Sparkles } from "lucide-react";

export function WelcomeHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Tuesday, August 18, 2026
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Good evening, Raja.
        </h1>

        <p className="mt-2 text-muted-foreground">
          Here&apos;s your overview for today.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        <Sparkles className="size-4" />
        Ask LifeOS
      </button>
    </div>
  );
}