interface SuccessPageProps {
  searchParams: Promise<{
    name?: string;
  }>;
}

export default async function SuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { name = "" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-10 text-center shadow-xl">
        <div className="mb-6 text-6xl">🎉</div>

        <h1 className="text-4xl font-bold text-white">
          ลงทะเบียนสำเร็จ
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          ขอบคุณ
        </p>

        <p className="mt-2 text-3xl font-bold text-emerald-400">
          {decodeURIComponent(name)}
        </p>

        <p className="mt-8 text-slate-400">
          กรุณารอการจับรางวัล
        </p>
      </div>
    </main>
  );
}