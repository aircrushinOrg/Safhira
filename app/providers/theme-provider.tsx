/**
 * Theme provider wrapper component that enables dark/light mode functionality throughout the application.
 * This component wraps the next-themes provider to manage theme state and persistence across page loads.
 * Provides a clean interface for theme switching and integrates with the application's design system.
 */
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
