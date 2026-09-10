const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "lifeos_access_token";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_at?: string | null;
};

export type HabitFrequency = "daily" | "weekly";

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  target_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitCompletion = {
  id: string;
  habit_id: string;
  completed_date: string;
  created_at: string;
};

export type HabitProgress = {
  habit_id: string;
  today_completed: boolean;
  completions_this_week: number;
  target_per_week: number;
  weekly_progress_percent: number;
  current_streak: number;
  longest_streak: number;
};

export type CreateHabitInput = {
  name: string;
  description?: string | null;
  frequency?: HabitFrequency;
  target_per_week?: number;
};

export type UpdateHabitInput = {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
  target_per_week?: number;
  is_active?: boolean;
};

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export type LoginInput = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/users/me");
}

export async function login(input: LoginInput): Promise<void> {
  const response = await apiRequest<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  setAccessToken(response.access_token);
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    if (
      response.status === 401 &&
      typeof window !== "undefined"
    ) {
      clearAccessToken();

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    const message =
      errorBody?.detail ?? `API request failed with status ${response.status}`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getUserTasks(): Promise<Task[]> {
  return apiRequest<Task[]>("/api/tasks/user");
}

export async function getTask(taskId: string): Promise<Task> {
  return apiRequest<Task>(`/api/tasks/${taskId}`);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return apiRequest<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  return apiRequest<Task>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return apiRequest<void>(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function getUserHabits(): Promise<Habit[]> {
  return apiRequest<Habit[]>("/api/habits/user");
}

export async function getHabit(habitId: string): Promise<Habit> {
  return apiRequest<Habit>(`/api/habits/${habitId}`);
}

export async function createHabit(
  input: CreateHabitInput,
): Promise<Habit> {
  return apiRequest<Habit>("/api/habits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateHabit(
  habitId: string,
  input: UpdateHabitInput,
): Promise<Habit> {
  return apiRequest<Habit>(`/api/habits/${habitId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteHabit(habitId: string): Promise<void> {
  return apiRequest<void>(`/api/habits/${habitId}`, {
    method: "DELETE",
  });
}

export async function completeHabit(
  habitId: string,
): Promise<HabitCompletion> {
  return apiRequest<HabitCompletion>(
    `/api/habits/${habitId}/complete`,
    {
      method: "POST",
    },
  );
}

export async function getHabitProgress(
  habitId: string,
): Promise<HabitProgress> {
  return apiRequest<HabitProgress>(
    `/api/habits/${habitId}/progress`,
  );
}

export async function getHabitCompletions(
  habitId: string,
): Promise<HabitCompletion[]> {
  return apiRequest<HabitCompletion[]>(
    `/api/habits/${habitId}/completions`,
  );
}