"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  createTask,
  getUserTasks,
  updateTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/api";

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

function isTaskOverdue(task: Task) {
  if (!task.due_at || task.status === "done") {
    return false;
  }

  return new Date(task.due_at).getTime() < Date.now();
}

export default function CalendarPage() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [editingTask, setEditingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [creatingTask, setCreatingTask] = useState(false);
  const [savingNewTask, setSavingNewTask] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] =
    useState<TaskPriority>("medium");
  const [newTaskDueAt, setNewTaskDueAt] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editPriority, setEditPriority] =
    useState<TaskPriority>("medium");
  const [editDueAt, setEditDueAt] = useState("");

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

  const selectedDateTasks = useMemo(() => {
    return tasksByDate.get(getDateKey(selectedDate)) ?? [];
  }, [tasksByDate, selectedDate]);

  function getDateKey(date: Date) {
    return [
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ].join("-");
  }

function getDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function startCreatingTask() {
  setCreatingTask(true);
  setSelectedTask(null);
  setEditingTask(false);
  setNewTaskTitle("");
  setNewTaskDescription("");
  setNewTaskPriority("medium");

  const defaultDueDate = new Date(selectedDate);
  defaultDueDate.setHours(
    new Date().getHours(),
    new Date().getMinutes(),
    0,
    0,
  );

  setNewTaskDueAt(getDateTimeLocalValue(defaultDueDate));
}

function cancelCreatingTask() {
  setCreatingTask(false);
}

async function handleCreateTask() {
  if (!newTaskTitle.trim()) {
    return;
  }

  setSavingNewTask(true);

  try {
    const createdTask = await createTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || null,
      priority: newTaskPriority,
      due_at: newTaskDueAt
        ? new Date(newTaskDueAt).toISOString()
        : null,
    });

    setTasks((currentTasks) => [
      createdTask,
      ...currentTasks,
    ]);

    setSelectedDate(
      createdTask.due_at
        ? new Date(createdTask.due_at)
        : selectedDate,
    );

    setSelectedTask(createdTask);
    setCreatingTask(false);
  } finally {
    setSavingNewTask(false);
  }
}

function startEditingTask(task: Task) {
    setEditingTask(true);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status as TaskStatus);
    setEditPriority(task.priority as TaskPriority);

    setEditDueAt(
      task.due_at
        ? (() => {
            const date = new Date(task.due_at);
            const offset = date.getTimezoneOffset() * 60000;

            return new Date(date.getTime() - offset)
              .toISOString()
              .slice(0, 16);
          })()
        : "",
    );
  }

  function cancelEditingTask() {
    setEditingTask(false);
  }

  async function handleSaveTask() {
    if (!selectedTask || !editTitle.trim()) {
      return;
    }

    setSavingTask(true);

    try {
      const updatedTask = await updateTask(selectedTask.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        status: editStatus,
        priority: editPriority,
        due_at: editDueAt
          ? new Date(editDueAt).toISOString()
          : null,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );

      setSelectedTask(updatedTask);
      setEditingTask(false);
    } finally {
      setSavingTask(false);
    }
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
    const todayDate = new Date();

    setCurrentMonth(
      new Date(todayDate.getFullYear(), todayDate.getMonth(), 1),
    );

    setSelectedDate(todayDate);
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
            const isSelected = isSameDay(date, selectedDate);

            return (
              <div
                key={date.toISOString()}
                className="min-h-32 border-b border-r p-2 last:border-r-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className="mb-2 flex items-center rounded-md"
                  aria-label={`Select ${date.toLocaleDateString()}`}
                >
                  <span
                    className={[
                      "flex size-7 items-center justify-center rounded-full text-sm",
                      isSelected
                        ? "bg-primary font-semibold text-primary-foreground"
                        : isToday
                          ? "bg-muted font-semibold"
                          : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </span>
                </button>

                <div className="space-y-1">
                  {dateTasks.map((task) => (
                    <button
                      type="button"
                      key={task.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedTask(task);
                        setSelectedDate(date);
                      }}
                      className={[
                        "w-full rounded-md px-2 py-1.5 text-left transition-colors",
                        task.status === "done"
                          ? "bg-muted/50 opacity-60 hover:bg-muted"
                          : task.status === "in_progress"
                            ? "bg-primary/10 ring-1 ring-primary/30 hover:bg-primary/15"
                            : isTaskOverdue(task)
                              ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40 hover:bg-destructive/20"
                              : "bg-muted hover:bg-muted/70",
                      ].join(" ")}
                      title={`Open ${task.title}`}
                    >
                      <p
                        className={[
                          "truncate text-xs font-medium",
                          task.status === "done" && "line-through",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {task.title}
                      </p>

                      <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                        {task.status === "done"
                          ? "Completed"
                          : isTaskOverdue(task)
                            ? "Overdue"
                            : task.status === "in_progress"
                              ? "In progress"
                              : `${task.priority} priority`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedTask && (
        <section className="mt-6 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold">
                {editingTask ? "Edit Task" : "Task Details"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {editingTask
                  ? "Update the task details below."
                  : "Selected task from the calendar"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!editingTask && (
                <button
                  type="button"
                  onClick={() => startEditingTask(selectedTask)}
                  className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setEditingTask(false);
                }}
                className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
                aria-label="Close task details"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {editingTask ? (
            <div className="space-y-5 px-5 py-5">
              <div>
                <label
                  htmlFor="calendar-edit-title"
                  className="mb-2 block text-sm font-medium"
                >
                  Title
                </label>

                <input
                  id="calendar-edit-title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="calendar-edit-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="calendar-edit-description"
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="calendar-edit-status"
                    className="mb-2 block text-sm font-medium"
                  >
                    Status
                  </label>

                  <select
                    id="calendar-edit-status"
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(
                        event.target.value as TaskStatus,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calendar-edit-priority"
                    className="mb-2 block text-sm font-medium"
                  >
                    Priority
                  </label>

                  <select
                    id="calendar-edit-priority"
                    value={editPriority}
                    onChange={(event) =>
                      setEditPriority(
                        event.target.value as TaskPriority,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calendar-edit-due-at"
                    className="mb-2 block text-sm font-medium"
                  >
                    Due Date
                  </label>

                  <input
                    id="calendar-edit-due-at"
                    type="datetime-local"
                    value={editDueAt}
                    onChange={(event) =>
                      setEditDueAt(event.target.value)
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={cancelEditingTask}
                  disabled={savingTask}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveTask}
                  disabled={savingTask || !editTitle.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingTask ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="size-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Title
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedTask.title}
                </p>
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Description
                  </p>

                  <p className="mt-1 text-sm">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Status
                  </p>

                  <p className="mt-1 text-sm capitalize">
                    {selectedTask.status.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Priority
                  </p>

                  <p className="mt-1 text-sm capitalize">
                    {selectedTask.priority}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Due
                  </p>

                  <p className="mt-1 text-sm">
                    {selectedTask.due_at
                      ? new Date(
                          selectedTask.due_at,
                        ).toLocaleString()
                      : "No due date"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-semibold">
              {selectedDate.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {selectedDateTasks.length === 0
                ? "No tasks scheduled for this day."
                : `${selectedDateTasks.length} ${
                    selectedDateTasks.length === 1
                      ? "task"
                      : "tasks"
                  } scheduled`}
            </p>
          </div>

          {!creatingTask && (
            <button
              type="button"
              onClick={startCreatingTask}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              + Add Task
            </button>
          )}
        </div>

        {creatingTask && (
          <div className="space-y-5 border-b px-5 py-5">
            <div>
              <label
                htmlFor="calendar-new-title"
                className="mb-2 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="calendar-new-title"
                value={newTaskTitle}
                onChange={(event) =>
                  setNewTaskTitle(event.target.value)
                }
                placeholder="What needs to be done?"
                autoFocus
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="calendar-new-description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="calendar-new-description"
                value={newTaskDescription}
                onChange={(event) =>
                  setNewTaskDescription(event.target.value)
                }
                rows={3}
                placeholder="Optional description"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="calendar-new-priority"
                  className="mb-2 block text-sm font-medium"
                >
                  Priority
                </label>

                <select
                  id="calendar-new-priority"
                  value={newTaskPriority}
                  onChange={(event) =>
                    setNewTaskPriority(
                      event.target.value as TaskPriority,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="calendar-new-due-at"
                  className="mb-2 block text-sm font-medium"
                >
                  Due Date & Time
                </label>

                <input
                  id="calendar-new-due-at"
                  type="datetime-local"
                  value={newTaskDueAt}
                  onChange={(event) =>
                    setNewTaskDueAt(event.target.value)
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={cancelCreatingTask}
                disabled={savingNewTask}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateTask}
                disabled={savingNewTask || !newTaskTitle.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingNewTask ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        )}

        {selectedDateTasks.length > 0 && (
          <div className="divide-y">
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="w-16 text-sm font-medium text-muted-foreground">
                  {new Date(task.due_at!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {task.title}
                  </p>

                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {task.priority} priority •{" "}
                    {task.status.replace("_", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
