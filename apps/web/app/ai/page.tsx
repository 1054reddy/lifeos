import { PageHeader } from "@/components/shared/page-header";

export default function AIPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="AI Assistant"
        description="Your intelligent assistant connected to your LifeOS data."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          AI Assistant is coming next.
        </p>
      </div>
    </div>
  );
}