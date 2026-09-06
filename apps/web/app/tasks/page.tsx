"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  createTask,
  deleteTask,
  getUserTasks,
  updateTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/api";


const statusConfig = {
  todo: {
    label: "To do",
    icon: Circle,
  },
  in_progress: {
    label: "In progress",
    icon: Clock3,
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
  },
} as const;

const priorityClasses = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-destructive/10 text-destructive",
} as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueAt, setDueAt] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] =
    useState<TaskPriority>("medium");
  const [editDueAt, setEditDueAt] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      const data = await getUserTasks();
      setTasks(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load tasks.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError(null);

      await createTask({
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setDueAt("");
      setShowCreateForm(false);

      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create task.",
      );
    } finally {
      setCreating(false);
    }
  }
  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
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
  async function handleStatusChange(
    task: Task,
    nextStatus: TaskStatus,
  ) {
    try {
      setError(null);

      const updatedTask = await updateTask(task.id, {
        status: nextStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task.",
      );
    }
  }
  async function handleDeleteTask(taskId: string) {
    try {
      setError(null);

      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete task.",
      );
    }
  }
  async function handleSaveEdit(taskId: string) {
    if (!editTitle.trim()) {
      return;
    }

    try {
      setSavingEdit(true);
      setError(null);

      const updatedTask = await updateTask(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
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

      setEditingTaskId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update task.",
      );
    } finally {
      setSavingEdit(false);
    }
  }
  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Tasks"
        description="Plan, organize, and complete your work."
      />

      <div className="mt-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {showCreateForm ? (
              <>
                <X className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="size-4" />
                New Task
              </>
            )}
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateTask}
            className="mb-6 rounded-xl border bg-card p-6"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-2 block text-sm font-medium"
                >
                  Title
                </label>
                <input
                  id="task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What needs to be done?"
                  maxLength={200}
                  autoFocus
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="task-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add some context..."
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="task-priority"
                    className="mb-2 block text-sm font-medium"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as TaskPriority)
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
                    htmlFor="task-status"
                    className="mb-2 block text-sm font-medium"
                  >
                    Status
                  </label>
                  <select
                    id="task-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as TaskStatus)
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
                    htmlFor="task-due-at"
                    className="mb-2 block text-sm font-medium"
                  >
                    Due Date
                  </label>
                  <input
                    id="task-due-at"
                    type="datetime-local"
                    value={dueAt}
                    onChange={(event) => setDueAt(event.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </div>
          </form>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border bg-card p-8">
            <p className="text-sm text-muted-foreground">
              Loading your tasks...
            </p>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first task to get started.
            </p>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map((task) => {
              const config =
                statusConfig[task.status as keyof typeof statusConfig] ??
                statusConfig.todo;

              const StatusIcon = config.icon;

              return (
                <div
                  key={task.id}
                  className="rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus: TaskStatus =
                          task.status === "todo"
                            ? "in_progress"
                            : task.status === "in_progress"
                              ? "done"
                              : "todo";

                        handleStatusChange(task, nextStatus);
                      }}
                      className="shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                      title={`Change status from ${config.label}`}
                    >
                      <StatusIcon className="mt-0.5 size-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      {editingTaskId === task.id ? (
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor={`edit-title-${task.id}`}
                              className="mb-2 block text-sm font-medium"
                            >
                              Title
                            </label>
                            <input
                              id={`edit-title-${task.id}`}
                              value={editTitle}
                              onChange={(event) => setEditTitle(event.target.value)}
                              maxLength={200}
                              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-description-${task.id}`}
                              className="mb-2 block text-sm font-medium"
                            >
                              Description
                            </label>
                            <textarea
                              id={`edit-description-${task.id}`}
                              value={editDescription}
                              onChange={(event) => setEditDescription(event.target.value)}
                              rows={3}
                              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`edit-priority-${task.id}`}
                                className="mb-2 block text-sm font-medium"
                              >
                                Priority
                              </label>
                              <select
                                id={`edit-priority-${task.id}`}
                                value={editPriority}
                                onChange={(event) =>
                                  setEditPriority(event.target.value as TaskPriority)
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
                                htmlFor={`edit-due-at-${task.id}`}
                                className="mb-2 block text-sm font-medium"
                              >
                                Due Date
                              </label>
                              <input
                                id={`edit-due-at-${task.id}`}
                                type="datetime-local"
                                value={editDueAt}
                                onChange={(event) =>
                                  setEditDueAt(event.target.value)
                                }
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingTaskId(null)}
                              disabled={savingEdit}
                              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSaveEdit(task.id)}
                              disabled={savingEdit || !editTitle.trim()}
                              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingEdit ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h2 className="font-medium">{task.title}</h2>

                              {task.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                priorityClasses[
                                  task.priority as keyof typeof priorityClasses
                                ] ?? priorityClasses.medium
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>{config.label}</span>

                              {task.due_at && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    Due{" "}
                                    {new Date(task.due_at).toLocaleString()}
                                  </span>
                                </>
                              )}

                              <span>•</span>
                              <span>
                                Updated{" "}
                                {new Date(task.updated_at).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => startEditingTask(task)}
                                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-xs font-medium text-destructive transition-opacity hover:opacity-80"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
