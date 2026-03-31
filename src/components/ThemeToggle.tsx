"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 border border-border rounded-md animate-pulse bg-muted" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center p-2 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
