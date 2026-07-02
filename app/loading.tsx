import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="glass-panel grid w-full max-w-3xl gap-4 rounded-lg p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-11 w-40" />
      </div>
    </main>
  );
}
