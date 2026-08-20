import { PageHeader } from "@/components/shared/page-header";

export default function CalendarPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Calendar"
        description="Manage your schedule and plan your time."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Calendar is coming next.
        </p>
      </div>
    </div>
  );
}