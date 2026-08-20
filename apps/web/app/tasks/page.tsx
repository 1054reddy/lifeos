import { PageHeader } from "@/components/shared/page-header";

export default function TasksPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Tasks"
        description="Plan, organize, and complete your work."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Task management is coming next.
        </p>
      </div>
    </div>
  );
}