import { PageHeader } from "@/components/shared/page-header";

export default function DocumentsPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Documents"
        description="Upload, organize, and interact with your documents."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Document management is coming next.
        </p>
      </div>
    </div>
  );
}