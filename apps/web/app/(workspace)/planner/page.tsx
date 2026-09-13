"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  completePlannerBlock,
  createPlannerBlock,
  deletePlannerBlock,
  getUserPlannerBlocks,
  getUserTasks,
  updatePlannerBlock,
  type CreatePlannerBlockInput,
  type PlannerBlock,
  type PlannerBlockType,
  type Task,
} from "@/lib/api";

const blockTypeConfig: Record<
  PlannerBlockType,
  {
    label: string;
    className: string;
  }
> = {
  task: {
    label: "Task",
    className: "bg-primary/10 text-primary",
  },
  focus: {
    label: "Focus",
    className: "bg-secondary text-secondary-foreground",
  },
  break: {
    label: "Break",
    className: "bg-muted text-muted-foreground",
  },
  personal: {
    label: "Personal",
    className: "bg-accent text-accent-foreground",
  },
};

const emptyForm = {
  title: "",
  description: "",
  planned_date: "",
  start_time: "09:00",
  end_time: "10:00",
  block_type: "task" as PlannerBlockType,
  task_id: "",
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [blocks, setBlocks] = useState<PlannerBlock[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isToday = selectedDate === formatDate(new Date());

  const selectedTaskMap = useMemo(() => {
    return new Map(tasks.map((task) => [task.id, task]));
  }, [tasks]);

  async function loadPlanner(date: string) {
    try {
      setLoading(true);
      setError(null);

      const [plannerData, taskData] = await Promise.all([
        getUserPlannerBlocks(date),
        getUserTasks(),
      ]);

      setBlocks(plannerData);
      setTasks(taskData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load planner.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlanner(selectedDate);
  }, [selectedDate]);

  function openCreateForm() {
    setEditingBlockId(null);

    setForm({
      ...emptyForm,
      planned_date: selectedDate,
    });

    setShowForm(true);
  }

  function openEditForm(block: PlannerBlock) {
    setEditingBlockId(block.id);

    setForm({
      title: block.title,
      description: block.description ?? "",
      planned_date: block.planned_date,
      start_time: block.start_time.slice(0, 5),
      end_time: block.end_time.slice(0, 5),
      block_type: block.block_type,
      task_id: block.task_id ?? "",
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingBlockId(null);
  }

  function updateForm(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    if (form.start_time >= form.end_time) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const input: CreatePlannerBlockInput = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        planned_date: form.planned_date,
        start_time: form.start_time,
        end_time: form.end_time,
        block_type: form.block_type,
        task_id: form.task_id || null,
      };

      if (editingBlockId) {
        await updatePlannerBlock(editingBlockId, input);
      } else {
        await createPlannerBlock(input);
      }

      setShowForm(false);
      setEditingBlockId(null);
      setForm(emptyForm);

      if (form.planned_date !== selectedDate) {
        setSelectedDate(form.planned_date);
      } else {
        await loadPlanner(selectedDate);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save planner block.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(blockId: string) {
    try {
      setError(null);

      const updatedBlock = await completePlannerBlock(blockId);

      setBlocks((current) =>
        current.map((block) =>
          block.id === updatedBlock.id ? updatedBlock : block,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete planner block.",
      );
    }
  }

  async function handleDelete(blockId: string) {
    try {
      setError(null);

      await deletePlannerBlock(blockId);

      setBlocks((current) =>
        current.filter((block) => block.id !== blockId),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete planner block.",
      );
    }
  }

  function changeDate(days: number) {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatDate(date));
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Planner"
        description="Turn your tasks into focused blocks of time."
      />

      <div className="mt-6">
        {/* Date controls */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {formatDisplayDate(selectedDate)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {blocks.length}{" "}
              {blocks.length === 1 ? "time block" : "time blocks"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeDate(-1)}
              className="rounded-lg border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Previous day"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedDate(formatDate(new Date()))}
              disabled={isToday}
              className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-50"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => changeDate(1)}
              className="rounded-lg border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Next day"
            >
              <ChevronRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Add Block
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Create / edit form */}
        {showForm && (
          <div className="mb-6 rounded-xl border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  {editingBlockId
                    ? "Edit planner block"
                    : "New planner block"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Decide how you want to use this time.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close form"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="planner-title"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Title
                </label>

                <input
                  id="planner-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  placeholder="e.g. Deep work on LifeOS"
                  required
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="planner-description"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="planner-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="planner-date"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Date
                  </label>

                  <input
                    id="planner-date"
                    type="date"
                    value={form.planned_date}
                    onChange={(event) =>
                      updateForm(
                        "planned_date",
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="planner-start"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Start
                  </label>

                  <input
                    id="planner-start"
                    type="time"
                    value={form.start_time}
                    onChange={(event) =>
                      updateForm(
                        "start_time",
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="planner-end"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    End
                  </label>

                  <input
                    id="planner-end"
                    type="time"
                    value={form.end_time}
                    onChange={(event) =>
                      updateForm(
                        "end_time",
                        event.target.value,
                      )
                    }
                    required
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="planner-type"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Block type
                  </label>

                  <select
                    id="planner-type"
                    value={form.block_type}
                    onChange={(event) =>
                      updateForm(
                        "block_type",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="task">Task</option>
                    <option value="focus">Focus</option>
                    <option value="break">Break</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="planner-task"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Attach task
                  </label>

                  <select
                    id="planner-task"
                    value={form.task_id}
                    onChange={(event) =>
                      updateForm(
                        "task_id",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">No task attached</option>

                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBlockId
                      ? "Save Changes"
                      : "Create Block"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Planner timeline */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">
                Daily Schedule
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading planner...
            </div>
          ) : blocks.length === 0 ? (
            <div className="p-10 text-center">
              <Clock3 className="mx-auto size-8 text-muted-foreground/60" />

              <h3 className="mt-3 text-sm font-semibold">
                Nothing planned yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a time block to start planning your day.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="size-4" />
                Add your first block
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {blocks.map((block) => {
                const blockType =
                  blockTypeConfig[block.block_type];

                const attachedTask = block.task_id
                  ? selectedTaskMap.get(block.task_id)
                  : null;

                return (
                  <div
                    key={block.id}
                    className={`flex gap-4 p-5 transition-colors ${
                      block.is_completed
                        ? "bg-muted/30"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    {/* Time */}
                    <div className="w-20 shrink-0 pt-1 text-right">
                      <p className="text-sm font-medium">
                        {formatTime(block.start_time)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTime(block.end_time)}
                      </p>
                    </div>

                    {/* Timeline marker */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-1 size-3 rounded-full ${
                          block.is_completed
                            ? "bg-muted-foreground"
                            : "bg-primary"
                        }`}
                      />

                      <div className="mt-2 w-px flex-1 bg-border" />
                    </div>

                    {/* Block */}
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-medium ${
                                block.is_completed
                                  ? "text-muted-foreground line-through"
                                  : ""
                              }`}
                            >
                              {block.title}
                            </h3>

                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${blockType.className}`}
                            >
                              {blockType.label}
                            </span>
                          </div>

                          {block.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {block.description}
                            </p>
                          )}

                          {attachedTask && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Task:{" "}
                              <span className="font-medium text-foreground">
                                {attachedTask.title}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {!block.is_completed && (
                            <button
                              type="button"
                              onClick={() =>
                                handleComplete(block.id)
                              }
                              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Complete ${block.title}`}
                            >
                              <Check className="size-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(block)
                            }
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Edit ${block.title}`}
                          >
                            <Pencil className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(block.id)
                            }
                            className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${block.title}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}