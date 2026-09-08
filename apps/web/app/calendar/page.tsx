"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { getUserTasks, type Task } from "@/lib/api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from(
    { length: firstWeekday + daysInMonth },
    (_, index) => {
      if (index < firstWeekday) {
        return null;
      }

      return new Date(
        year,
        month,
        index - firstWeekday + 1,
      );
    },
  );
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function CalendarPage() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

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

  const calendarDays = useMemo(
    () =>
      getCalendarDays(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
      ),
    [currentMonth],
  );

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();

    for (const task of tasks) {
      if (!task.due_at) {
        continue;
      }

      const dueDate = new Date(task.due_at);

      const key = [
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate(),
      ].join("-");

      const existing = grouped.get(key) ?? [];
      existing.push(task);
      grouped.set(key, existing);
    }

    return grouped;
  }, [tasks]);

  function getDateKey(date: Date) {
    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ].join("-");
  }

  function goToPreviousMonth() {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1,
        ),
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1,
        ),
    );
  }

  function goToToday() {
    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Calendar"
        description="Manage your schedule and plan your time."
      />

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString([], {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? "Loading tasks..."
                : `${tasks.filter((task) => task.due_at).length} scheduled tasks`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Today
            </button>

            <button
              type="button"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
              className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Next month"
              className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-r px-2 py-3 text-center text-xs font-semibold text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-32 border-b border-r bg-muted/20"
                />
              );
            }

            const dateTasks =
              tasksByDate.get(getDateKey(date)) ?? [];

            const isToday = isSameDay(date, today);

            return (
              <div
                key={date.toISOString()}
                className="min-h-32 border-b border-r p-2 last:border-r-0"
              >
                <div className="mb-2 flex items-center">
                  <span
                    className={[
                      "flex size-7 items-center justify-center rounded-full text-sm",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  {dateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md bg-muted px-2 py-1.5"
                      title={task.title}
                    >
                      <p className="truncate text-xs font-medium">
                        {task.title}
                      </p>

                      <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                        {task.priority}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
