"use client";

import { Gift, Maximize, Minimize, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { LuckyWheelCanvas } from "@/components/wheel/LuckyWheelCanvas";
import { Skeleton } from "@/components/ui/Skeleton";
import { WinnerModal } from "@/components/wheel/WinnerModal";
import { useRegistrants } from "@/hooks/useRegistrants";
import { useWheelChannel } from "@/hooks/useWheelChannel";
import type { Registrant } from "@/types/registration";

export function WheelDisplayClient() {
  const { isLoading, refresh, registrants } = useRegistrants();
  const [targetUuid, setTargetUuid] = useState<string | null>(null);
  const [spinParticipants, setSpinParticipants] = useState<Registrant[] | null>(null);
  const [sessionWinners, setSessionWinners] = useState<Registrant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [celebrateWinner, setCelebrateWinner] = useState<Registrant | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // พยายามเข้าโหมดเต็มจออัตโนมัติเมื่อเปิดจากปุ่มใน Dashboard (?fullscreen=1)
  // เบราว์เซอร์บางตัวต้องการ user gesture จริง ๆ ถึงจะยอมให้เต็มจอได้
  // ถ้าเบราว์เซอร์บล็อกไว้ ปุ่มเต็มจอมุมขวาบนจะยังกดเองได้เสมอ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fullscreen") !== "1") {
      return;
    }

    document.documentElement.requestFullscreen?.().catch(() => {
      // ปล่อยผ่าน แล้วให้ผู้ใช้กดปุ่มเต็มจอเองแทน
    });
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen?.();
    }
  }

    useWheelChannel(
        useCallback((message) => {
            if (message.type === "spin") {
            setSpinParticipants(message.participants);
            setTargetUuid(message.targetUuid);
            setSpinKey(message.spinKey);
            setIsSpinning(true);
            }

            if (message.type === "close-celebration") {
            setCelebrateWinner(null);
            }
        }, []),
    );

  const fallbackParticipants = registrants.filter(
    (registrant) => registrant.status === "AVAILABLE" && !registrant.winner,
  );

  const wheelParticipants =
    isSpinning && spinParticipants ? spinParticipants : fallbackParticipants;

  const handleSpinComplete = useCallback(
    (winner: Registrant) => {
      setSessionWinners((current) => [winner, ...current]);
      setTargetUuid(null);
      setSpinParticipants(null);
      setIsSpinning(false);
      setCelebrateWinner(winner);
      void refresh();
    },
    [refresh],
  );

  return (
    <div className="relative grid min-h-screen place-items-center gap-5 p-4 sm:p-6">
      <button
        aria-label={isFullscreen ? "ออกจากโหมดเต็มจอ" : "เข้าสู่โหมดเต็มจอ"}
        className="focus-ring absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] opacity-40 transition hover:opacity-100"
        onClick={toggleFullscreen}
        type="button"
      >
        {isFullscreen ? (
          <Minimize aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Maximize aria-hidden="true" className="h-4 w-4" />
        )}
      </button>

      <section className="grid w-full max-w-6xl gap-5 xl:grid-cols-[1fr_21rem]">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          {isLoading ? (
            <Skeleton className="h-[28rem] w-full" />
          ) : (
            <LuckyWheelCanvas
              onSpinComplete={handleSpinComplete}
              participants={wheelParticipants}
              spinKey={spinKey}
              targetUuid={targetUuid}
            />
          )}
        </div>

        <aside className="glass-panel rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Winners</h2>
            <Trophy aria-hidden="true" className="h-6 w-6 text-[var(--accent)]" />
          </div>

          <div className="grid gap-3">
            {sessionWinners.map((winner, index) => (
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3"
                key={winner.uuid}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {winner.firstName} {winner.lastName}
                    </p>
                  </div>
                  <span className="text-sm font-black text-[var(--accent)]">#{index + 1}</span>
                </div>
              </div>
            ))}
            {sessionWinners.length === 0 ? (
              <div className="grid place-items-center gap-2 py-8 text-center text-[var(--muted)]">
                <Gift aria-hidden="true" className="h-9 w-9 text-[var(--primary)]" />
                <p className="text-sm font-semibold">ยังไม่มีการสุ่มในรอบนี้</p>
              </div>
            ) : null}
          </div>
        </aside>
      </section>

      <WinnerModal onClose={() => setCelebrateWinner(null)} winner={celebrateWinner} />
    </div>
  );
}