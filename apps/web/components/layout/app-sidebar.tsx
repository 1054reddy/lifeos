"use client";

import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  Clock3,
  FileText,
  FolderOpen,
  Home,
  LogOut,
  MessageSquare,
  NotebookPen,
  PanelLeft,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
    label: "Planner",
    icon: Clock3,
    href: "/planner",
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
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function AppSidebar({
  open,
  collapsed,
  onOpenChange,
  onCollapsedChange,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

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

    void loadCurrentUser();
  }, []);

  function handleLogout() {
    clearAccessToken();
    onOpenChange(false);
    router.replace("/login");
  }

  function handleNavigation() {
    onOpenChange(false);
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => onOpenChange(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r bg-background
          transition-[width,transform] duration-200
          md:static md:translate-x-0
          ${collapsed ? "md:w-16" : "md:w-64"}
          w-64
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div
          className={`
            flex h-16 shrink-0 items-center border-b
            ${collapsed ? "justify-center px-2" : "justify-between px-5"}
          `}
        >
          <button
            type="button"
            onClick={() => {
              router.push("/");
              handleNavigation();
            }}
            className="flex items-center gap-2 rounded-lg"
            aria-label="Go to dashboard"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-sm font-bold">L</span>
            </div>

            {!collapsed && (
              <span className="text-lg font-semibold tracking-tight">
                LifeOS
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 hover:bg-muted md:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-5">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
          )}

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`
                    flex items-center rounded-lg
                    py-2.5 text-sm font-medium
                    transition-colors
                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3"
                    }
                    ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              );
            })}
          </div>

          {!collapsed && (
            <p className="mb-2 mt-8 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Insights
            </p>
          )}

          <div className="mt-1 space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`
                    flex items-center rounded-lg
                    py-2.5 text-sm font-medium
                    transition-colors
                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3"
                    }
                    ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </a>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="shrink-0 border-t p-2">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-medium hover:bg-muted/80"
                title={`${userName} · Settings`}
                aria-label={`${userName} · Settings`}
              >
                {userName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => onCollapsedChange(false)}
                className="mt-1 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Expand navigation"
                title="Expand navigation"
              >
                <PanelLeft className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg p-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {userName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {userName}
                </p>
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

              <button
                type="button"
                onClick={() => onCollapsedChange(true)}
                className="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:block"
                aria-label="Collapse navigation"
                title="Collapse navigation"
              >
                <PanelLeft className="size-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}