"use client";

import { ExternalLink, Gift, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { LuckyWheelCanvas } from "@/components/wheel/LuckyWheelCanvas";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRegistrants } from "@/hooks/useRegistrants";
import { useWheelChannel } from "@/hooks/useWheelChannel";
import { toastFromError, useToast } from "@/hooks/useToast";
import { drawWinner } from "@/services/wheel";
import type { Registrant } from "@/types/registration";
import { WinnerModal } from "@/components/wheel/WinnerModal";

export function WheelClient() {
  const { counts, error, isLoading, refresh, registrants } = useRegistrants();
  const [targetWinner, setTargetWinner] = useState<Registrant | null>(null);
  const [spinParticipants, setSpinParticipants] = useState<Registrant[] | null>(null);
  const [sessionWinners, setSessionWinners] = useState<Registrant[]>([]);
  const [claimedUuids, setClaimedUuids] = useState<Set<string>>(() => new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const showToast = useToast((state) => state.showToast);
  const { postMessage } = useWheelChannel();
  const [celebrateWinner, setCelebrateWinner] = useState<Registrant | null>(null);

  const availableParticipants = useMemo(() => {
    return registrants.filter(
      (registrant) =>
        registrant.status === "AVAILABLE" &&
        !registrant.winner &&
        !claimedUuids.has(registrant.uuid),
    );
  }, [claimedUuids, registrants]);

  const wheelParticipants =
    isSpinning && spinParticipants ? spinParticipants : availableParticipants;

  function handleOpenDisplay() {
    window.open("/wheel-display", "_blank", "noopener,noreferrer");
  }

  function handleCloseCelebration() {
    setCelebrateWinner(null);
    postMessage({ type: "close-celebration" });
  }

  async function handleDrawWinner() {
    if (isSpinning || isClaiming || availableParticipants.length === 0) {
      return;
    }

    setIsClaiming(true);
    try {
      const winner = await drawWinner();
      const participantsForSpin = availableParticipants.some(
        (participant) => participant.uuid === winner.uuid,
      )
        ? availableParticipants
        : [winner, ...availableParticipants];

      const nextSpinKey = spinKey + 1;

      setSpinParticipants(participantsForSpin);
      setTargetWinner(winner);
      setIsSpinning(true);
      setSpinKey(nextSpinKey);

      // แจ้งให้ tab อื่น (หน้าจอแสดงผล) หมุนพร้อมกัน
      postMessage({
        type: "spin",
        spinKey: nextSpinKey,
        targetUuid: winner.uuid,
        participants: participantsForSpin,
      });
    } catch (caught) {
      showToast(toastFromError(caught, "สุ่มผู้ชนะไม่สำเร็จ"));
      await refresh();
    } finally {
      setIsClaiming(false);
    }
  }

  const handleSpinComplete = useCallback(
    (winner: Registrant) => {
      setClaimedUuids((current) => new Set(current).add(winner.uuid));
      setSessionWinners((current) => [winner, ...current]);
      setTargetWinner(null);
      setSpinParticipants(null);
      setIsSpinning(false);
      setCelebrateWinner(winner);
      showToast({
        title: "ผู้ชนะ",
        description: `${winner.firstName} ${winner.lastName}`,
        tone: "success",
      });
      void refresh();
    },
    [refresh, showToast],
  );

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Admin</p>
          <h1 className="text-3xl font-black">Lucky Wheel</h1>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<ExternalLink aria-hidden="true" className="h-4 w-4" />}
            onClick={handleOpenDisplay}
            variant="secondary"
          >
            เปิดหน้าจอแสดงผล
          </Button>
          <Button
            icon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
            isLoading={isLoading}
            onClick={() => void refresh()}
            variant="secondary"
          >
            Refresh
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--danger)_42%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-sm font-semibold text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_21rem]">
        <div className="glass-panel rounded-lg p-4 sm:p-5">
          {isLoading ? (
            <Skeleton className="h-[28rem] w-full" />
          ) : (
            <LuckyWheelCanvas
              onSpinComplete={handleSpinComplete}
              participants={wheelParticipants}
              spinKey={spinKey}
              targetUuid={targetWinner?.uuid ?? null}
            />
          )}

          <div className="mt-5 flex flex-col items-center gap-3">
            <Button
              className="w-full max-w-xs"
              disabled={availableParticipants.length === 0}
              icon={<Sparkles aria-hidden="true" className="h-4 w-4" />}
              isLoading={isClaiming || isSpinning}
              onClick={() => void handleDrawWinner()}
            >
              Spin
            </Button>
            <p className="text-sm font-semibold text-[var(--muted)]">
              Remaining: {counts.remaining.toLocaleString("th-TH")} / Total:{" "}
              {counts.totalRegistered.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <aside className="glass-panel rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--primary)]">Sidebar</p>
              <h2 className="text-xl font-black">Session Winners</h2>
            </div>
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
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">{winner.uuid}</p>
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

      <WinnerModal onClose={handleCloseCelebration} winner={celebrateWinner} />
    </div>
  );
}