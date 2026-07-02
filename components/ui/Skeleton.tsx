import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--muted)_18%,transparent)]",
        className,
      )}
    />
  );
}
