import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Settings"
        description="Manage your LifeOS preferences and account."
      />

      <div className="rounded-xl border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          Settings are coming next.
        </p>
      </div>
    </div>
  );
}