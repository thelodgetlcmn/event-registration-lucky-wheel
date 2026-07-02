"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextIsDark = stored ? stored === "dark" : preferredDark;
    document.documentElement.classList.toggle("dark", nextIsDark);

    const timeout = window.setTimeout(() => {
      setIsDark(nextIsDark);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function toggleTheme() {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  }

  const Icon = isDark ? Sun : Moon;

  return (
    <button
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] transition hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
      onClick={toggleTheme}
      type="button"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
