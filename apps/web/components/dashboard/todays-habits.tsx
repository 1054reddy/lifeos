"use client";

import { Check, Flame, Target } from "lucide-react";
import { useEffect, useState } from "react";

import {
  completeHabit,
  getHabitProgress,
  getUserHabits,
  type Habit,
  type HabitProgress,
} from "@/lib/api";

type HabitWithProgress = Habit & {
  progress: HabitProgress | null;
};

export function TodaysHabits() {
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadHabits() {
      try {
        const data = await getUserHabits();

        const activeHabits = data.filter((habit) => habit.is_active);

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

        setHabits(habitsWithProgress);
      } catch {
        setHabits([]);
      } finally {
        setLoading(false);
      }
    }

    loadHabits();
  }, []);

  async function handleComplete(habitId: string) {
    try {
      setCompletingHabitId(habitId);

      await completeHabit(habitId);

      const progress = await getHabitProgress(habitId);

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                progress,
              }
            : habit,
        ),
      );
    } catch {
      // Keep the current Dashboard state if completion fails.
    } finally {
      setCompletingHabitId(null);
    }
  }

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Target className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold">Today&apos;s Habits</h2>
            <p className="text-xs text-muted-foreground">
              Keep your daily momentum going
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Loading habits...
        </div>
      )}

      {!loading && habits.length === 0 && (
        <div className="px-5 py-8 text-center">
          <Target className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            No active habits yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a habit to start tracking your progress.
          </p>
        </div>
      )}

      {!loading && habits.length > 0 && (
        <div className="divide-y">
          {habits.map((habit) => {
            const completed = habit.progress?.today_completed ?? false;
            const streak = habit.progress?.current_streak ?? 0;

            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 px-5 py-4"
              >
                <button
                  type="button"
                  onClick={() => handleComplete(habit.id)}
                  disabled={completed || completingHabitId === habit.id}
                  aria-label={
                    completed
                      ? `${habit.name} completed`
                      : `Complete ${habit.name}`
                  }
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition ${
                    completed
                      ? "border-foreground bg-foreground text-background"
                      : "hover:bg-muted"
                  }`}
                >
                  <Check className="size-4" />
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      completed
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {habit.name}
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {habit.progress?.completions_this_week ?? 0}/
                      {habit.target_per_week} this week
                    </span>

                    {streak > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Flame className="size-3" />
                        {streak} day streak
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs font-medium ${
                    completed
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {completed ? "Done" : "Today"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}