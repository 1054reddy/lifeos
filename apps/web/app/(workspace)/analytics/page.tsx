import { PageHeader } from "@/components/shared/page-header";

export default function AnalyticsPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Analytics"
        description="Understand your productivity, habits, finances, and progress."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Analytics is coming next.
        </p>
      </div>
    </div>
  );
}