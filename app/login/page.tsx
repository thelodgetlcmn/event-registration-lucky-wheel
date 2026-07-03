"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.message);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-xl"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Admin Login
        </h1>

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="mb-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </main>
  );
}