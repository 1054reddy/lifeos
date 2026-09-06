"use client";

import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  FolderOpen,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  NotebookPen,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAccessToken, getCurrentUser } from "@/lib/api";

const navigation = [
  {
    label: "Overview",
    icon: Home,
    href: "/",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    label: "Notes",
    icon: FileText,
    href: "/notes",
  },
  {
    label: "Calendar",
    icon: CalendarDays,
    href: "/calendar",
  },
  {
    label: "Habits",
    icon: Target,
    href: "/habits",
  },
  {
    label: "Journal",
    icon: NotebookPen,
    href: "/journal",
  },
  {
    label: "Finance",
    icon: Wallet,
    href: "/finance",
  },
  {
    label: "Documents",
    icon: FolderOpen,
    href: "/documents",
  },
  {
    label: "AI Assistant",
    icon: MessageSquare,
    href: "/ai",
  },
];

const secondaryNavigation = [
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppSidebar({
  open,
  onOpenChange,
}: AppSidebarProps) {
  const router = useRouter();

  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();

        setUserName(user.name);
        setUserEmail(user.email);
      } catch {
        // apiRequest handles 401 → login redirect.
      }
    }

    loadCurrentUser();
  }, []);

  function handleLogout() {
    clearAccessToken();
    onOpenChange(false);
    router.replace("/login");
  }

  return (
    <>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onOpenChange(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r bg-background
          transition-transform duration-200
          lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-sm font-bold">L</span>
            </div>

            <span className="text-lg font-semibold tracking-tight">
              LifeOS
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-sm font-medium
                    text-muted-foreground
                    transition-colors
                    hover:bg-muted hover:text-foreground
                    ${item.href === "/" ? "bg-muted text-foreground" : ""}
                  `}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <p className="mb-2 mt-8 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Insights
          </p>

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {userName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
