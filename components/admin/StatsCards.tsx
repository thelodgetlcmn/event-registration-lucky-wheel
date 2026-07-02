import { ListChecks, TicketCheck, Trophy } from "lucide-react";

import type { DashboardCounts } from "@/types/sheet";

interface StatsCardsProps {
  counts: DashboardCounts;
}

const stats = [
  {
    key: "totalRegistered",
    label: "Total Registered",
    icon: ListChecks,
  },
  {
    key: "remaining",
    label: "Remaining",
    icon: TicketCheck,
  },
  {
    key: "winnerCount",
    label: "Winner Count",
    icon: Trophy,
  },
] as const;

export function StatsCards({ counts }: StatsCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Summary">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className="glass-panel rounded-lg p-4" key={stat.key}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--muted)]">{stat.label}</p>
              <Icon aria-hidden="true" className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <p className="mt-3 text-3xl font-black">{counts[stat.key].toLocaleString("th-TH")}</p>
          </div>
        );
      })}
    </section>
  );
}
