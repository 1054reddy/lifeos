import { PageHeader } from "@/components/shared/page-header";

export default function JournalPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Journal"
        description="Reflect, write, and understand your personal patterns."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Journal is coming next.
        </p>
      </div>
    </div>
  );
}