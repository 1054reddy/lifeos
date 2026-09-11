"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  TrendingDown,
  Target,
  Wallet,
} from "lucide-react";

import {
  getHabitProgress,
  getUserHabits,
  getUserTasks,
  type Habit,
  type HabitProgress,
  type Task,
} from "@/lib/api";

type HabitWithProgress = Habit & {
  progress: HabitProgress | null;
};

export function StatsGrid() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [taskData, habitData] = await Promise.all([
          getUserTasks(),
          getUserHabits(),
        ]);

        const activeHabits = habitData.filter(
          (habit) => habit.is_active,
        );

        const habitsWithProgress = await Promise.all(
          activeHabits.map(async (habit) => {
            try {
              const progress = await getHabitProgress(habit.id);

              return {
                ...habit,
                progress,
              };
            } catch {
              return {
                ...habit,
                progress: null,
              };
            }
          }),
        );

        setTasks(taskData);
        setHabits(habitsWithProgress);
      } catch {
        setTasks([]);
        setHabits([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  const completedTasks = tasks.filter(
    (task) => task.status === "done",
  ).length;

  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const dueToday = tasks.filter((task) => {
    if (!task.due_at) {
      return false;
    }

    const dueDate = new Date(task.due_at);

    return dueDate >= startOfToday && dueDate < startOfTomorrow;
  }).length;

  const completedHabits = habits.filter(
    (habit) => habit.progress?.today_completed,
  ).length;

  const habitCount = habits.length;

  const habitStats = {
    title: "Habits",
    value: loading
      ? "—"
      : `${completedHabits} / ${habitCount}`,
    description: loading
      ? "Loading..."
      : habitCount === 0
        ? "No active habits"
        : `${Math.round(
            (completedHabits / habitCount) * 100,
          )}% completed today`,
    icon: Target,
  };

  const taskStats = {
    title: "Tasks",
    value: loading ? "—" : String(tasks.length),
    description: loading
      ? "Loading..."
      : `${completedTasks} completed • ${dueToday} due today`,
    icon: CheckCircle2,
  };

  const staticStats = [
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

  const stats = [taskStats, habitStats, ...staticStats];

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