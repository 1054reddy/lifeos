import { AIBrief } from "@/components/dashboard/ai-brief";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-8 p-6 sm:p-8">
        <WelcomeHeader />

        <StatsGrid />

        <div className="grid gap-6 lg:grid-cols-2">
          <TodaySchedule />
          <AIBrief />
        </div>
      </div>
    </AppShell>
  );
}