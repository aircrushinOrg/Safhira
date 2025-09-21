/**
 * Theme toggle component that allows users to switch between light and dark modes.
 * This component provides a simple button interface with appropriate icons and accessibility features.
 * Integrates with next-themes for persistent theme state management across the application.
 */
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => {
        console.log("Toggle button clicked");
        setTheme(theme === "dark" ? "light" : "dark");
      }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
