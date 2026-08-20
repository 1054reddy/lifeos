import { PageHeader } from "@/components/shared/page-header";

export default function HabitsPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Habits"
        description="Build consistency and track your daily habits."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Habit tracking is coming next.
        </p>
      </div>
    </div>
  );
}