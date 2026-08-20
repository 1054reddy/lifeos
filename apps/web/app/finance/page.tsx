import { PageHeader } from "@/components/shared/page-header";

export default function FinancePage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Finance"
        description="Track income, expenses, savings, and financial goals."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Finance tracking is coming next.
        </p>
      </div>
    </div>
  );
}