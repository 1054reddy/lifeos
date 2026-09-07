"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

import { getUserTasks, type Task } from "@/lib/api";

export function TodaySchedule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getUserTasks();
        setTasks(data);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const todayTasks = tasks
    .filter((task) => {
      if (!task.due_at) {
        return false;
      }

      const dueDate = new Date(task.due_at);

      return dueDate >= startOfToday && dueDate < startOfTomorrow;
    })
    .sort(
      (a, b) =>
        new Date(a.due_at!).getTime() -
        new Date(b.due_at!).getTime(),
    );

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Today&apos;s Schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tasks due today
        </p>
      </div>

      {loading && (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Loading schedule...
        </div>
      )}

      {!loading && todayTasks.length === 0 && (
        <div className="px-5 py-8 text-center">
          <Clock3 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            Nothing scheduled for today
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tasks with today&apos;s due date will appear here.
          </p>
        </div>
      )}

      {!loading && todayTasks.length > 0 && (
        <div className="divide-y">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 px-5 py-4"
            >
              <span className="w-16 text-sm font-medium text-muted-foreground">
                {new Date(task.due_at!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {task.title}
                </p>

                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {task.priority} priority
                </p>
              </div>

              <div className="size-2 rounded-full bg-foreground" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
