"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabitProgress,
  getUserHabits,
  updateHabit,
  type CreateHabitInput,
  type Habit,
  type HabitFrequency,
  type HabitProgress,
  type UpdateHabitInput,
} from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";

type HabitWithProgress = Habit & {
  progress: HabitProgress | null;
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(
    null,
  );
  const [editingHabitId, setEditingHabitId] = useState<string | null>(
    null,
  );
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(
    null,
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFrequency, setEditFrequency] =
    useState<HabitFrequency>("daily");
  const [editTargetPerWeek, setEditTargetPerWeek] = useState(7);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] =
    useState<HabitFrequency>("daily");
  const [targetPerWeek, setTargetPerWeek] = useState(7);

  useEffect(() => {
    async function loadHabits() {
      try {
        setError(null);

        const data = await getUserHabits();

        const habitsWithProgress = await Promise.all(
          data.map(async (habit) => {
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
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load habits.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadHabits();
  }, []);

  async function handleCreateHabit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    const input: CreateHabitInput = {
      name: name.trim(),
      description: description.trim() || null,
      frequency,
      target_per_week: targetPerWeek,
    };

    try {
      setIsCreating(true);
      setError(null);

      const habit = await createHabit(input);
      const progress = await getHabitProgress(habit.id);

      setHabits((currentHabits) => [
        {
          ...habit,
          progress,
        },
        ...currentHabits,
      ]);

      setName("");
      setDescription("");
      setFrequency("daily");
      setTargetPerWeek(7);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create habit.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCompleteHabit(habitId: string) {
    try {
      setCompletingHabitId(habitId);
      setError(null);

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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete habit.",
      );
    } finally {
      setCompletingHabitId(null);
    }
  }

  function startEditingHabit(habit: HabitWithProgress) {
    setEditingHabitId(habit.id);
    setEditName(habit.name);
    setEditDescription(habit.description ?? "");
    setEditFrequency(habit.frequency);
    setEditTargetPerWeek(habit.target_per_week);
    setError(null);
  }

  function cancelEditingHabit() {
    setEditingHabitId(null);
    setEditName("");
    setEditDescription("");
    setEditFrequency("daily");
    setEditTargetPerWeek(7);
  }

  async function handleUpdateHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingHabitId || !editName.trim()) {
      return;
    }

    const input: UpdateHabitInput = {
      name: editName.trim(),
      description: editDescription.trim() || null,
      frequency: editFrequency,
      target_per_week: editTargetPerWeek,
    };

    try {
      setIsSavingEdit(true);
      setError(null);

      const updatedHabit = await updateHabit(
        editingHabitId,
        input,
      );

      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === editingHabitId
            ? {
                ...updatedHabit,
                progress: habit.progress,
              }
            : habit,
        ),
      );

      cancelEditingHabit();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update habit.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteHabit(habitId: string) {
    const habit = habits.find((item) => item.id === habitId);

    if (!habit) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${habit.name}"?\n\nThis will permanently delete the habit and its completion history.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingHabitId(habitId);
      setError(null);

      await deleteHabit(habitId);

      setHabits((currentHabits) =>
        currentHabits.filter((item) => item.id !== habitId),
      );

      if (editingHabitId === habitId) {
        cancelEditingHabit();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete habit.",
      );
    } finally {
      setDeletingHabitId(null);
    }
  }

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <PageHeader
        title="Habits"
        description="Build consistency and track your daily habits."
      />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <section className="rounded-xl border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Create a habit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add something you want to practice consistently.
          </p>
        </div>

        <form
          onSubmit={handleCreateHabit}
          className="grid gap-5 md:grid-cols-2"
        >
          <div className="space-y-2">
            <label
              htmlFor="habit-name"
              className="text-sm font-medium"
            >
              Name
            </label>

            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Read for 30 minutes"
              maxLength={120}
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="habit-frequency"
              className="text-sm font-medium"
            >
              Frequency
            </label>

            <select
              id="habit-frequency"
              value={frequency}
              onChange={(event) =>
                setFrequency(
                  event.target.value as HabitFrequency,
                )
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="habit-description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="habit-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Optional description"
              rows={3}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="habit-target"
              className="text-sm font-medium"
            >
              Target per week
            </label>

            <input
              id="habit-target"
              type="number"
              min={1}
              max={7}
              value={targetPerWeek}
              onChange={(event) =>
                setTargetPerWeek(Number(event.target.value))
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <p className="text-xs text-muted-foreground">
              How many times should you complete this habit each
              week?
            </p>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Habit"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Your habits</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep building your consistency.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border bg-card p-8">
            <p className="text-sm text-muted-foreground">
              Loading habits...
            </p>
          </div>
        ) : habits.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <p className="font-medium">No habits yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first habit above to start tracking
              consistency.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => {
              const progress = habit.progress;
              const isCompleting = completingHabitId === habit.id;
              const isCompletedToday =
                progress?.today_completed ?? false;
              const isEditing = editingHabitId === habit.id;
              const isDeleting = deletingHabitId === habit.id;

              if (isEditing) {
                return (
                  <article
                    key={habit.id}
                    className="rounded-xl border bg-card p-5"
                  >
                    <div className="mb-5">
                      <h3 className="font-semibold">Edit habit</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Update your habit details.
                      </p>
                    </div>

                    <form
                      onSubmit={handleUpdateHabit}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <label
                          htmlFor={`edit-habit-name-${habit.id}`}
                          className="text-sm font-medium"
                        >
                          Name
                        </label>

                        <input
                          id={`edit-habit-name-${habit.id}`}
                          type="text"
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                          maxLength={120}
                          required
                          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`edit-habit-description-${habit.id}`}
                          className="text-sm font-medium"
                        >
                          Description
                        </label>

                        <textarea
                          id={`edit-habit-description-${habit.id}`}
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          rows={3}
                          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor={`edit-habit-frequency-${habit.id}`}
                            className="text-sm font-medium"
                          >
                            Frequency
                          </label>

                          <select
                            id={`edit-habit-frequency-${habit.id}`}
                            value={editFrequency}
                            onChange={(event) =>
                              setEditFrequency(
                                event.target.value as HabitFrequency,
                              )
                            }
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`edit-habit-target-${habit.id}`}
                            className="text-sm font-medium"
                          >
                            Target per week
                          </label>

                          <input
                            id={`edit-habit-target-${habit.id}`}
                            type="number"
                            min={1}
                            max={7}
                            value={editTargetPerWeek}
                            onChange={(event) =>
                              setEditTargetPerWeek(
                                Number(event.target.value),
                              )
                            }
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={
                            isSavingEdit || !editName.trim()
                          }
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSavingEdit ? "Saving..." : "Save changes"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditingHabit}
                          disabled={isSavingEdit}
                          className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </article>
                );
              }

              return (
                <article
                  key={habit.id}
                  className="rounded-xl border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {habit.name}
                      </h3>

                      {habit.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {habit.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                      {habit.frequency}
                    </span>
                  </div>

                  {progress && (
                    <div className="mt-5 space-y-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            This week
                          </span>

                          <span className="font-medium">
                            {progress.completions_this_week} /{" "}
                            {progress.target_per_week}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${progress.weekly_progress_percent}%`,
                            }}
                          />
                        </div>

                        <p className="mt-1 text-right text-xs text-muted-foreground">
                          {progress.weekly_progress_percent}%
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">
                            Current streak
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {progress.current_streak}{" "}
                            {progress.current_streak === 1
                              ? "day"
                              : "days"}
                          </p>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">
                            Best streak
                          </p>
                          <p className="mt-1 text-lg font-semibold">
                            {progress.longest_streak}{" "}
                            {progress.longest_streak === 1
                              ? "day"
                              : "days"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleCompleteHabit(habit.id)
                      }
                      disabled={
                        isCompletedToday ||
                        isCompleting ||
                        !habit.is_active
                      }
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                        isCompletedToday
                          ? "cursor-default bg-emerald-500/10 text-emerald-600"
                          : "bg-primary text-primary-foreground hover:opacity-90"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      {isCompleting
                        ? "Completing..."
                        : isCompletedToday
                          ? "✓ Completed today"
                          : "Complete today"}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Weekly target
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {habit.target_per_week}x per week
                      </p>
                    </div>

                    <span
                      className={`text-xs font-medium ${
                        habit.is_active
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {habit.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2 border-t pt-4">
                    <button
                      type="button"
                      onClick={() => startEditingHabit(habit)}
                      disabled={isDeleting}
                      className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteHabit(habit.id)
                      }
                      disabled={isDeleting}
                      className="rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}