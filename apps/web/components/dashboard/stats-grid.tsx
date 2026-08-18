import {
  CheckCircle2,
  Clock3,
  TrendingDown,
  Wallet,
} from "lucide-react";

const stats = [
  {
    title: "Tasks",
    value: "5",
    description: "2 due today",
    icon: CheckCircle2,
  },
  {
    title: "Habits",
    value: "4 / 5",
    description: "80% completed",
    icon: Clock3,
  },
  {
    title: "Focus Time",
    value: "3h 42m",
    description: "+18% this week",
    icon: Clock3,
  },
  {
    title: "Spending",
    value: "₹420",
    description: "12% below average",
    icon: Wallet,
  },
];

export function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>

              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4" />
              </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>

            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {stat.title === "Spending" && (
                <TrendingDown className="size-3" />
              )}
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}