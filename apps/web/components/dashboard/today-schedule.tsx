const schedule = [
  {
    time: "10:00",
    title: "Team meeting",
    type: "Work",
  },
  {
    time: "12:30",
    title: "Lunch",
    type: "Personal",
  },
  {
    time: "15:00",
    title: "React project",
    type: "Focus",
  },
  {
    time: "18:00",
    title: "Workout",
    type: "Health",
  },
];

export function TodaySchedule() {
  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Today&apos;s Schedule</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Your upcoming events
        </p>
      </div>

      <div className="divide-y">
        {schedule.map((item) => (
          <div
            key={`${item.time}-${item.title}`}
            className="flex items-center gap-4 px-5 py-4"
          >
            <span className="w-12 text-sm font-medium text-muted-foreground">
              {item.time}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.title}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.type}
              </p>
            </div>

            <div className="size-2 rounded-full bg-foreground" />
          </div>
        ))}
      </div>
    </section>
  );
}