"use client";

import Moon from "lucide-react/icons/moon";
import Sun from "lucide-react/icons/sun";
import { Button } from "#components/ui/button.tsx";
import { toggleTheme, useTheme } from "#hooks/use-theme.ts";

export function ThemeToggle() {
  const theme = useTheme();
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Sun className="theme-sun size-5" aria-hidden="true" />
      <Moon className="theme-moon size-5" aria-hidden="true" />
    </Button>
  );
}
