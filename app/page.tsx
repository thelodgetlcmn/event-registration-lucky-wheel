import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-[var(--foreground)]"
            href="/admin/dashboard"
          >
            <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
            Admin
          </Link>
          <ThemeToggle />
        </div>
        <RegistrationForm />
      </div>
    </main>
  );
}
