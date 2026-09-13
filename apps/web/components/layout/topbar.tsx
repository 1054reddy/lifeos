"use client";

import {
  Bell,
  Menu,
  PanelLeft,
  Search,
  Sparkles,
} from "lucide-react";

import { ThemeToggle } from "./theme-toggle";

interface TopbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export function Topbar({
  onMenuClick,
  sidebarCollapsed,
  onSidebarToggle,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      {/* Search */}
      <div className="flex min-w-0 flex-1 items-center">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="mr-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        {/* Tablet / desktop sidebar toggle */}
        <button
          type="button"
          onClick={onSidebarToggle}
          className="mr-2 hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
          aria-label={
            sidebarCollapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
          title={
            sidebarCollapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
        >
          <PanelLeft className="size-5" />
        </button>

        <button
          type="button"
          className="hidden w-full max-w-md items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
        >
          <Search className="size-4" />

          <span className="flex-1 text-left">
            Search everything...
          </span>

          <kbd className="hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:block">
            ⌘ K
          </kbd>
        </button>

        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="AI Assistant"
        >
          <Sparkles className="size-5" />
        </button>

        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />

          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-foreground ring-2 ring-background" />
        </button>

        <div className="ml-2 hidden h-6 w-px bg-border sm:block" />

        <button
          type="button"
          className="ml-1 flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
            RR
          </div>

          <span className="hidden text-sm font-medium md:block">
            Raja
          </span>
        </button>
      </div>
    </header>
  );
}