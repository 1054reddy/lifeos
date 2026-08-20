import { PageHeader } from "@/components/shared/page-header";

export default function NotesPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Notes"
        description="Capture ideas, knowledge, and important information."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Your notes workspace is coming next.
        </p>
      </div>
    </div>
  );
}