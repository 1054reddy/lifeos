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