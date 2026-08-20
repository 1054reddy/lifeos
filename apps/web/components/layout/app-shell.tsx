"use client";

import { useState, type ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}