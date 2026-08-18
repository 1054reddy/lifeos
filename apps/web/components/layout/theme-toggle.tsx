"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center rounded-lg border bg-background p-1">
        <div className="size-8" />
        <div className="size-8" />
        <div className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center rounded-lg border bg-background p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "light"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light mode"
      >
        <Sun className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "dark"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark mode"
      >
        <Moon className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "system"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
      >
        <Monitor className="size-4" />
      </button>
    </div>
  );
}