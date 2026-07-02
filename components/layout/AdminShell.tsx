"use client";

import { Gift, LayoutDashboard, ListChecks, Trophy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/wheel", label: "Lucky Wheel", icon: Gift },
  { href: "/admin/winners", label: "Winners", icon: Trophy },
  { href: "/", label: "Registration", icon: ListChecks },
];

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-strong)_70%,transparent)] px-4 py-4 backdrop-blur lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 lg:grid lg:gap-6">
          <Link className="focus-ring rounded-lg text-base font-black" href="/admin/dashboard">
            Event Wheel
          </Link>
          <ThemeToggle />
        </div>
        <nav aria-label="Admin" className="mt-4 flex gap-2 overflow-x-auto lg:grid lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                className={cn(
                  "focus-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-[var(--foreground)]",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
