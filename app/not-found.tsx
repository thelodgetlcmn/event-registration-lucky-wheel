import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="glass-panel w-full max-w-lg rounded-lg p-6">
        <p className="text-sm font-bold text-[var(--primary)]">404</p>
        <h1 className="mt-2 text-2xl font-black">ไม่พบหน้านี้</h1>
        <Link
          className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
          href="/"
        >
          <Home aria-hidden="true" className="h-4 w-4" />
          กลับหน้าลงทะเบียน
        </Link>
      </section>
    </main>
  );
}
